import { Mesh, type Object3D, Vector3 } from 'three';
import type { Character } from '../character/character';
import type { ModelAsset } from '../core/assets';
import { CG, GROUP, groups } from '../core/config';
import { clamp, lerp, moveToward } from '../core/math';
import { Rng } from '../core/rng';
import type { GameSystem } from '../core/system';
import type { Game } from '../game';
import { RAPIER, type RayHit, type Surface } from '../physics/physics';
import type { Vehicle } from '../vehicles/vehicle';
import type { ConsumableId, WeaponId } from './items';
import { CONSUMABLES, type HeldWeapon, TIERS, WEAPONS, type WeaponDef, WeaponView } from './weapons';

type UseId = Exclude<ConsumableId, 'grenade'>;

/** A thrown Coco frag in flight. */
interface Grenade {
  body: RAPIER.RigidBody;
  mesh: Object3D;
  fuse: number;
  by: Character;
}

const BLAST_RADIUS = 8;
const BLAST_DAMAGE = 120;
const THROW_TIME = 0.42;
const GRENADE_FUSE = 2;
const BULLET_REACH = 420;
const HEAD_RADIUS = 0.21;

const _eye = new Vector3();
const _dir = new Vector3();
const _shot = new Vector3();
const _right = new Vector3();
const _up = new Vector3();
const _end = new Vector3();
const _from = new Vector3();
const _v = new Vector3();
const _head = new Vector3();
const UP = new Vector3(0, 1, 0);

/** What a bullet does to the thing it lands on: the dust colour and the sound. */
const SURFACES: Record<Surface, { color: number; sound: string }> = {
  asphalt: { color: 0x77777a, sound: 'impact_concrete' },
  concrete: { color: 0xb9b2a6, sound: 'impact_concrete' },
  sand: { color: 0xe2cfa0, sound: 'impact_sand' },
  grass: { color: 0x7d8b58, sound: 'impact_sand' },
  wood: { color: 0xa98761, sound: 'impact_wood' },
  metal: { color: 0xb8bcc2, sound: 'impact_metal' },
  tile: { color: 0xd9d2c6, sound: 'impact_concrete' },
  water: { color: 0xeef8fb, sound: 'impact_water' },
  flesh: { color: 0xb8324a, sound: 'impact_body' },
  glass: { color: 0xdff6ff, sound: 'impact_glass' },
};

/** The healing item worth using now, if any is carried. */
export function bestHeal(c: Character): UseId | null {
  const inv = c.inventory;
  if (c.health >= c.maxHealth) return null;
  if (c.health <= 50 && inv.has('medkit')) return 'medkit';
  if (c.health < CONSUMABLES.bandage.healthCap && inv.has('bandage')) return 'bandage';
  return inv.has('medkit') ? 'medkit' : null;
}

/** The armor item worth using now, if any is carried. */
export function bestArmor(c: Character): UseId | null {
  const inv = c.inventory;
  if (c.armor >= c.maxArmor) return null;
  if (c.armor <= 40 && inv.has('vest')) return 'vest';
  if (inv.has('cola')) return 'cola';
  return inv.has('vest') ? 'vest' : null;
}

/** True when a character is on their feet with their hands free for a weapon. */
function canFight(c: Character): boolean {
  return c.alive && c.state === 'normal' && !c.motor.swimming;
}

/**
 * Shooting, reloading, switching weapons, healing and grenades, the same for the player and the bots:
 * each fills in `character.act` and this system carries it out.
 */
export class Combat implements GameSystem {
  /** Shots and blasts use their own stream so they never disturb the world's. */
  readonly rng: Rng;
  private readonly views = new Map<Character, WeaponView>();
  private readonly flash = new Map<Character, number>();
  private readonly grenades: Grenade[] = [];
  private readonly grenadeModel: Object3D;
  /** Where the last shot of each kind landed, for tests: 'world', 'character', 'vehicle', 'water', 'none'. */
  lastHit = 'none';
  lastDamage = 0;
  lastHeadshot = false;

  private constructor(
    private readonly game: Game,
    private readonly asset: ModelAsset,
  ) {
    this.rng = new Rng(game.options.seed ^ 0xc0c0f4a9);
    const g = asset.scene.getObjectByName('grenade-a');
    if (!g) throw new Error('grenade model is missing');
    this.grenadeModel = g;
    game.events.on('hurt', ({ target, info }) => {
      this.flash.set(target, 1);
      const player = game.player;
      if (info.by && info.by === player && target !== player) game.sound(info.headshot ? 'headshot' : 'hit_marker');
      if (target === player) {
        game.sound('damage');
        game.camera.shake(0.18);
      }
    });
    game.events.on('kill', ({ victim, info }) => {
      // The body stays where it fell, but shots and people pass it.
      victim.motor.collider.setCollisionGroups(groups(GROUP.ragdoll, GROUP.world));
      victim.loadout.reloading = 0;
      victim.loadout.using = null;
      victim.aiming = 0;
      if (info.by === game.player && victim !== game.player) game.sound('kill_confirm');
    });
  }

  static async create(game: Game): Promise<Combat> {
    return new Combat(game, await game.assets.loadModel('models/weapons.glb'));
  }

  /** Bring a character back to a fighting state for a new round: nothing carried, standing, solid. */
  reset(c: Character): void {
    c.loadout.clear();
    c.inventory.clear();
    c.aiming = 0;
    c.kills = 0;
    c.lastHurtBy = null;
    c.motor.collider.setCollisionGroups(CG.character);
    this.views.get(c)?.show(null, null);
  }

  /** Remove everything in flight (a new round). */
  clear(): void {
    for (const g of this.grenades) {
      this.game.physics.removeBody(g.body);
      g.mesh.removeFromParent();
    }
    this.grenades.length = 0;
  }

  /** Switch to a weapon the character carries. */
  equip(c: Character, id: WeaponId): void {
    const lo = c.loadout;
    if (!lo.has(id) || lo.current === id) return;
    lo.current = id;
    lo.drawing = WEAPONS[id].draw;
    lo.reloading = 0;
    lo.bloom = 0;
    lo.burst = 0;
    lo.using = null;
    this.game.sound('equip', c.position, 0.7);
  }

  /** The spread cone of the next shot, radians. */
  spreadOf(c: Character): number {
    const def = c.loadout.weapon;
    if (!def) return 0;
    let spread = lerp(def.spread, def.aimSpread, c.aiming);
    const m = c.motor;
    if (!m.grounded) spread = spread * 1.8 + 0.02;
    else {
      spread *= 1 + Math.min(1, m.speed / 6) * 0.9;
      if (m.crouched) spread *= 0.75;
    }
    return spread + c.loadout.bloom;
  }

  fixedUpdate(dt: number): void {
    const chars = this.game.characters;
    for (let i = 0; i < chars.length; i++) this.step(chars[i]!, dt);
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i]!;
      g.fuse -= dt;
      if (g.fuse > 0) continue;
      const p = g.body.translation();
      this.grenades.splice(i, 1);
      this.game.physics.removeBody(g.body);
      g.mesh.removeFromParent();
      this.explode(p.x, p.y, p.z, g.by);
    }
  }

  private step(c: Character, dt: number): void {
    const lo = c.loadout;
    const act = c.act;
    lo.sinceShot += dt;
    lo.cooldown = Math.max(0, lo.cooldown - dt);
    lo.drawing = Math.max(0, lo.drawing - dt);
    // The cone closes again only once the firing stops, so a burst keeps opening it.
    const cur = lo.weapon;
    if (lo.bloom > 0 && lo.sinceShot > (cur ? Math.max(0.1, 90 / cur.rpm) : 0)) lo.bloom = Math.max(0, lo.bloom - (cur?.settle ?? 0.1) * dt);
    if (lo.sinceShot > 0.35) lo.burst = 0;

    if (!canFight(c)) {
      // Hands are busy with something else: swimming, driving, falling.
      lo.reloading = 0;
      lo.using = null;
      lo.throwing = 0;
      c.aiming = 0;
      lo.triggerHeld = act.fire;
      act.slot = null;
      act.cycle = 0;
      act.use = null;
      act.throw = false;
      act.reload = false;
      return;
    }

    if (act.slot && lo.has(act.slot)) this.equip(c, act.slot);
    else if (act.cycle !== 0) {
      const list = lo.carried();
      if (list.length > 0) {
        const at = lo.current ? list.indexOf(lo.current) : -1;
        this.equip(c, list[(at + Math.sign(act.cycle) + list.length) % list.length]!);
      }
    }
    act.slot = null;
    act.cycle = 0;

    // Bandages, medkits, drinks and vests take time, and pulling the trigger gives up on them.
    if (lo.using) {
      lo.useLeft -= dt;
      if (act.fire && !lo.triggerHeld) {
        lo.using = null;
        c.anim.stop('upper');
      } else if (lo.useLeft <= 0) this.finishUse(c, lo.using);
    } else if (act.use && lo.throwing <= 0) this.startUse(c, act.use);
    act.use = null;

    if (lo.throwing > 0) {
      lo.throwing -= dt;
      if (lo.throwing <= 0) this.release(c);
    } else if (act.throw && !lo.using && c.inventory.has('grenade')) {
      lo.throwing = THROW_TIME;
      lo.reloading = 0;
      c.anim.play('OverhandThrow', { layer: 'upper', speed: 1.5, fadeIn: 0.08, fadeOut: 0.25 });
    }
    act.throw = false;

    const def = lo.weapon;
    const held = lo.heldNow;
    const busy = lo.using !== null || lo.throwing > 0;
    const sprinting = c.input.sprint && c.motor.grounded && c.motor.speed > 5.6;
    const canAim = def !== null && !busy && lo.reloading <= 0 && lo.drawing <= 0 && !sprinting;
    c.aiming = moveToward(c.aiming, act.aim && canAim ? 1 : 0, dt * 7);
    if (!def || !held || busy) {
      lo.triggerHeld = act.fire;
      act.reload = false;
      return;
    }

    if (lo.reloading > 0) {
      lo.reloading -= dt;
      if (def.shellReload && act.fire && !lo.triggerHeld && held.mag > 0) {
        // A shotgun can stop loading to fire what is in the tube.
        lo.reloading = 0;
        c.anim.stop('upper');
      } else if (lo.reloading <= 0) {
        lo.reloading = 0;
        if (def.shellReload) {
          held.mag += c.inventory.remove(def.ammo, 1);
          if (held.mag < def.mag && c.inventory.has(def.ammo)) this.startReload(c, def, held);
        } else held.mag += c.inventory.remove(def.ammo, def.mag - held.mag);
      }
    } else if ((act.reload || (held.mag === 0 && lo.cooldown <= 0)) && held.mag < def.mag && c.inventory.has(def.ammo) && lo.drawing <= 0) {
      this.startReload(c, def, held);
    }
    act.reload = false;

    const pulled = act.fire && (def.auto || !lo.triggerHeld);
    if (pulled && lo.cooldown <= 0 && lo.drawing <= 0 && lo.reloading <= 0) {
      if (held.mag > 0) this.shoot(c, def, held);
      else if (!lo.triggerHeld) {
        this.game.sound('dry_fire', c.position, 0.8);
        lo.cooldown = 0.25;
      }
    }
    lo.triggerHeld = act.fire;
  }

  private startReload(c: Character, def: WeaponDef, held: HeldWeapon): void {
    const lo = c.loadout;
    const time = def.reload * TIERS[held.tier]!.reload;
    lo.reloading = time;
    lo.reloadTotal = time;
    c.anim.play('Pistol_Reload', { layer: 'upper', speed: Math.max(0.6, 1.67 / time), fadeIn: 0.1, fadeOut: 0.2 });
    this.game.sound(def.shellReload ? 'shell' : 'reload', c.position, 0.8);
  }

  private startUse(c: Character, id: UseId): void {
    const spec = CONSUMABLES[id];
    if (!c.inventory.has(id)) return;
    // Nothing to gain: keep the item.
    if (spec.health > 0 && c.health >= spec.healthCap) return;
    if (spec.armor > 0 && c.armor >= c.maxArmor) return;
    const lo = c.loadout;
    lo.using = id;
    lo.useLeft = spec.time;
    lo.reloading = 0;
    c.anim.play('Consume', { layer: 'upper', speed: Math.max(0.5, 1.33 / spec.time), fadeIn: 0.15, fadeOut: 0.25, hold: true });
  }

  private finishUse(c: Character, id: UseId): void {
    const spec = CONSUMABLES[id];
    const lo = c.loadout;
    lo.using = null;
    lo.drawing = 0.25;
    c.anim.stop('upper');
    if (c.inventory.remove(id, 1) === 0) return;
    if (spec.health > 0) c.health = Math.max(c.health, Math.min(spec.healthCap, c.health + spec.health));
    if (spec.armor > 0) c.addArmor(spec.armor);
    this.game.sound('heal', c.position, 0.8);
    this.game.events.emit('used', { who: c, item: id });
  }

  /** Where the character's eyes are: bullets and sight lines start here. */
  eyeOf(c: Character, out: Vector3): Vector3 {
    return out.set(c.position.x, c.position.y + c.eyeHeight, c.position.z);
  }

  /** Unit vector from the eyes toward what the character aims at. */
  aimDir(c: Character, out: Vector3): Vector3 {
    this.eyeOf(c, _eye);
    out.subVectors(c.aimPoint, _eye);
    // An aim point on top of the shooter says nothing about direction: use the view angles.
    if (out.lengthSq() < 2.25) {
      const cp = Math.cos(c.aimPitch);
      return out.set(-Math.sin(c.aimYaw) * cp, Math.sin(c.aimPitch), -Math.cos(c.aimYaw) * cp);
    }
    return out.normalize();
  }

  private shoot(c: Character, def: WeaponDef, held: HeldWeapon): void {
    const game = this.game;
    const lo = c.loadout;
    held.mag--;
    lo.cooldown = 60 / def.rpm;
    lo.sinceShot = 0;
    lo.shots++;
    const spread = this.spreadOf(c);
    lo.bloom = Math.min(def.bloomMax, lo.bloom + def.bloom);

    this.eyeOf(c, _eye);
    this.aimDir(c, _dir);
    _right.crossVectors(_dir, UP);
    if (_right.lengthSq() < 1e-6) _right.set(1, 0, 0);
    _right.normalize();
    _up.crossVectors(_right, _dir);

    const view = this.views.get(c);
    if (view?.hasMuzzle) _from.copy(view.muzzle);
    else _from.copy(_eye).addScaledVector(_dir, 0.7).addScaledVector(_right, 0.18).addScaledVector(_up, -0.16);

    const tier = TIERS[held.tier]!;
    for (let i = 0; i < def.pellets; i++) {
      const r = Math.sqrt(this.rng.next()) * spread;
      const a = this.rng.next() * Math.PI * 2;
      _shot
        .copy(_dir)
        .addScaledVector(_right, Math.cos(a) * r)
        .addScaledVector(_up, Math.sin(a) * r)
        .normalize();
      this.trace(c, def, tier.damage, _eye, _shot, _from);
    }

    game.fx.burst('muzzle', _from.x, _from.y, _from.z, { dx: _dir.x, dy: _dir.y, dz: _dir.z });
    game.fx.flash(_from.x, _from.y, _from.z, c.isPlayer ? 12 : 8);
    if (view?.hasMuzzle) game.fx.burst('shell', view.port.x, view.port.y, view.port.z, { dx: _right.x * 0.8 + _up.x * 0.6, dy: _right.y * 0.8 + _up.y * 0.6, dz: _right.z * 0.8 + _up.z * 0.6 });
    game.sound(def.sound, c.position);

    // Recoil: the body rocks, and for the player the view climbs. It climbs more the longer the burst.
    const grow = 1 + Math.min(lo.burst, 8) * 0.07;
    lo.burst++;
    c.anim.kick(def.kick);
    view?.kick(def.kick);
    if (c.isPlayer) {
      const ease = (1 - c.aiming * 0.3) * (c.motor.crouched ? 0.85 : 1) * grow;
      const up = def.recoil[0] * ease;
      const side = (this.rng.next() * 2 - 1) * def.recoil[1] * ease;
      game.camera.recoil(up, side);
      // Part of the climb stays, so a long burst has to be pulled down.
      game.camera.pitch = clamp(game.camera.pitch + up * 0.3, -1.35, 1.25);
      game.camera.yaw += side * 0.3;
    }
    game.events.emit('shot', { by: c, weapon: def.id, x: _from.x, y: _from.y, z: _from.z });
  }

  /** One projectile: find what it hits, hurt it, and draw the streak and the impact. */
  private trace(c: Character, def: WeaponDef, tierDamage: number, eye: Vector3, dir: Vector3, from: Vector3): void {
    const game = this.game;
    const hit = game.physics.raycast(eye.x, eye.y, eye.z, dir.x, dir.y, dir.z, BULLET_REACH, CG.queryBullet, c.motor.body);
    let reach = hit ? hit.distance : BULLET_REACH;
    // Open water stops a bullet at the surface.
    let wet = false;
    if (dir.y < -0.01 && eye.y > 0) {
      let t = eye.y / -dir.y;
      const w = game.env.waterHeight(eye.x + dir.x * t, eye.z + dir.z * t);
      if (w > -40) {
        t = (eye.y - w) / -dir.y;
        if (t < reach) {
          reach = t;
          wet = true;
        }
      }
    }
    _end.copy(eye).addScaledVector(dir, reach);
    game.fx.tracer(from.x, from.y, from.z, _end.x, _end.y, _end.z, def.tracer);
    if (wet) {
      game.fx.burst('splash', _end.x, _end.y + 0.05, _end.z, { amount: 0.35 });
      game.sound('impact_water', _end, 0.6);
      this.note('water', 0, false);
      return;
    }
    if (!hit) {
      this.note('none', 0, false);
      return;
    }
    const falloff = reach <= def.range[0] ? 1 : reach >= def.range[1] ? def.falloff : lerp(1, def.falloff, (reach - def.range[0]) / (def.range[1] - def.range[0]));
    const owner = hit.owner;
    if (owner?.kind === 'character' && owner.ref) {
      const target = owner.ref as Character;
      const head = this.isHeadshot(target, eye, dir, _end);
      const damage = def.damage * tierDamage * falloff * (head ? def.headshot : 1);
      c.loadout.hits++;
      if (head) c.loadout.headshots++;
      game.fx.burst('blood', _end.x, _end.y, _end.z, { dx: -dir.x, dy: 0.3, dz: -dir.z });
      game.sound('impact_body', _end, 0.8);
      this.note('character', damage, head);
      game.hurt(target, damage, { by: c, cause: 'bullet', weapon: def.id, headshot: head, dir: _v.copy(dir), point: _end.clone() });
      return;
    }
    if (owner?.kind === 'vehicle' && owner.ref) {
      (owner.ref as Vehicle).damage(def.damage * tierDamage * falloff * 0.45, c);
      this.impact(hit, 'metal');
      this.note('vehicle', 0, false);
      return;
    }
    this.impact(hit, owner?.surface ?? 'concrete');
    this.note('world', 0, false);
  }

  private note(kind: string, damage: number, head: boolean): void {
    this.lastHit = kind;
    this.lastDamage = damage;
    this.lastHeadshot = head;
  }

  /** Dust, sparks, a mark and a sound where a bullet lands. */
  private impact(hit: RayHit, surface: Surface): void {
    const fx = this.game.fx;
    const s = SURFACES[surface];
    const { point: p, normal: n } = hit;
    fx.burst(surface === 'glass' ? 'glass' : 'impact', p.x, p.y, p.z, { dx: n.x, dy: n.y, dz: n.z, color: s.color });
    if (surface !== 'glass') fx.decal(p.x, p.y, p.z, n.x, n.y, n.z, surface === 'sand' || surface === 'grass' ? 0.22 : 0.15);
    this.game.sound(s.sound, p, 0.7);
  }

  /**
   * A shot counts as a headshot when its line passes through the head and it struck at head height.
   * The head is placed from the stance, not from the animated bone, so the answer does not depend on
   * whether the target was drawn this frame.
   */
  private isHeadshot(target: Character, eye: Vector3, dir: Vector3, point: Vector3): boolean {
    if (target.state !== 'normal') return false;
    const top = target.position.y + target.eyeHeight;
    if (point.y < top - 0.3) return false;
    _head.set(target.position.x, top + 0.05, target.position.z);
    // Distance from the head's centre to the line of the shot.
    _v.subVectors(_head, eye);
    const along = _v.dot(dir);
    return _v.lengthSq() - along * along <= HEAD_RADIUS * HEAD_RADIUS;
  }

  /** The grenade leaves the hand. */
  private release(c: Character): void {
    const lo = c.loadout;
    lo.throwing = 0;
    lo.drawing = 0.3;
    if (c.inventory.remove('grenade', 1) === 0) return;
    const game = this.game;
    this.eyeOf(c, _eye);
    this.aimDir(c, _dir);
    _right.crossVectors(_dir, UP).normalize();
    _from.copy(_eye).addScaledVector(_dir, 0.55).addScaledVector(_right, 0.22).addScaledVector(UP, 0.12);
    const v = c.motor.velocity;
    const body = game.physics.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(_from.x, _from.y, _from.z)
        .setLinvel(_dir.x * 17 + v.x * 0.5, _dir.y * 17 + 4.2, _dir.z * 17 + v.z * 0.5)
        .setAngvel({ x: 7, y: 3, z: -5 })
        .setLinearDamping(0.1)
        .setAngularDamping(2.6)
        .setCcdEnabled(true),
    );
    const collider = game.physics.world.createCollider(
      RAPIER.ColliderDesc.ball(0.09)
        .setRestitution(0.24)
        .setFriction(1.3)
        .setDensity(2.2)
        .setCollisionGroups(groups(GROUP.prop, GROUP.world | GROUP.vehicle | GROUP.door | GROUP.glass | GROUP.prop)),
      body,
    );
    game.physics.setOwner(collider, { kind: 'prop', surface: 'wood' });
    const mesh = this.grenadeModel.clone(true);
    mesh.scale.setScalar(0.62);
    mesh.traverse((o) => {
      if ((o as Mesh).isMesh) o.castShadow = true;
    });
    mesh.position.copy(_from);
    game.engine.scene.add(mesh);
    this.grenades.push({ body, mesh, fuse: GRENADE_FUSE, by: c });
    game.sound('cloth_flap', c.position, 0.5);
  }

  /** An explosion at a point: hurts everyone near and in sight of it, and vehicles. */
  explode(x: number, y: number, z: number, by: Character | null): void {
    const game = this.game;
    const physics = game.physics;
    game.fx.burst('explosion', x, y + 0.3, z);
    const ground = physics.raycast(x, y + 0.3, z, 0, -1, 0, 2.5, CG.queryWorld);
    if (ground) game.fx.decal(ground.point.x, ground.point.y, ground.point.z, ground.normal.x, ground.normal.y, ground.normal.z, 3.2);
    game.sound('crash', { x, y, z }, 1);
    game.sound('thunder', { x, y, z }, 0.7);
    for (const t of game.characters) {
      if (!t.alive || t.state === 'plane') continue;
      _v.set(t.position.x, t.position.y + 0.95, t.position.z);
      const dx = _v.x - x;
      const dy = _v.y - (y + 0.3);
      const dz = _v.z - z;
      const d = Math.hypot(dx, dy, dz);
      if (d > BLAST_RADIUS) continue;
      // Cover helps: a wall between the blast and the body takes most of it.
      const blocked = d > 0.4 && physics.raycast(x, y + 0.3, z, dx / d, dy / d, dz / d, d - 0.3, CG.queryWorld) !== null;
      const damage = BLAST_DAMAGE * (1 - d / BLAST_RADIUS) ** 1.2 * (blocked ? 0.25 : 1);
      if (damage < 1) continue;
      const k = d > 1e-3 ? 1 / d : 0;
      game.hurt(t, damage, { by, cause: 'explosion', weapon: 'grenade', dir: new Vector3(dx * k, 0, dz * k), point: new Vector3(x, y, z) });
    }
    for (const v of game.vehicles) {
      const d = Math.hypot(v.position.x - x, v.position.y - y, v.position.z - z);
      if (d < BLAST_RADIUS) v.damage(110 * (1 - d / BLAST_RADIUS), by);
    }
    const cam = game.engine.camera.position;
    game.camera.shake(clamp(1 - Math.hypot(cam.x - x, cam.y - y, cam.z - z) / 40, 0, 1) * 0.9);
    game.events.emit('blast', { x, y, z, by });
  }

  frameUpdate(dt: number): void {
    const game = this.game;
    for (const c of game.characters) {
      const lo = c.loadout;
      const armed = lo.current !== null && canFight(c);
      let view = this.views.get(c);
      if (!view) {
        if (!lo.current) continue;
        view = new WeaponView(c.rig, c.anim, this.asset);
        this.views.set(c, view);
      }
      const hide = lo.using !== null || lo.throwing > 0;
      const inHand = armed && !hide ? lo.current : null;
      // The other long gun rides on the back; so does the current one while the hands are busy.
      let stow: WeaponId | null = null;
      if (c.alive) {
        for (const id of ['sniper', 'rifle', 'shotgun', 'smg'] as const) {
          if (lo.has(id) && id !== inHand) {
            stow = id;
            break;
          }
        }
      }
      view.show(c.alive ? inHand : null, stow);
      const m = c.motor;
      view.lower = lo.reloading > 0 || lo.drawing > 0.1 || m.mode === 'slide' || (c.input.sprint && m.grounded && m.speed > 5.6);
      view.leftFree = lo.reloading > 0;
      c.anim.upperAim = inHand ? 1 : 0;

      const f = this.flash.get(c);
      if (f !== undefined) {
        const next = f - dt * 5;
        c.rig.setFlash(1, 0.35, 0.3, Math.max(0, next) * 0.55);
        if (next <= 0) this.flash.delete(c);
        else this.flash.set(c, next);
      }
    }
    for (const g of this.grenades) {
      const p = g.body.translation();
      const r = g.body.rotation();
      g.mesh.position.set(p.x, p.y - 0.07, p.z);
      g.mesh.quaternion.set(r.x, r.y, r.z, r.w);
    }
  }

  /** The weapon view of a character, when it has one (for tests and the bots' muzzle positions). */
  viewOf(c: Character): WeaponView | undefined {
    return this.views.get(c);
  }

  /** Grenades in the air, for tests. */
  get live(): number {
    return this.grenades.length;
  }
}
