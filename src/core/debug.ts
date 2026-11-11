import { Vector3 } from 'three';
import type { Character } from '../character/character';
import type { Game } from '../game';
import { randomOutfit } from '../character/rig';
import { isItemId } from '../gameplay/items';
import { TIERS } from '../gameplay/weapons';
import { angleDiff } from './math';
import { Rng } from './rng';

const _dir = new Vector3();

/** Yaw a body part faces, in the game's convention (0 is north, positive turns left). */
function partYaw(c: Character, part: 'head' | 'chest' | 'hips'): number {
  const d = c.anim.partFacing(part, _dir);
  return Math.atan2(-d.x, -d.z);
}

/**
 * Test and tooling surface on `window.__eyewall`.
 * Automated checks read game state here; they still drive the game with real keyboard and mouse events.
 */
export interface DebugApi {
  game: Game;
  ready: boolean;
  errors: string[];
  state(): Record<string, unknown>;
  /** Park the camera at a point looking at another, for screenshots. */
  view(x: number, y: number, z: number, tx: number, ty: number, tz: number): void;
  releaseView(): void;
  setHour(hour: number): void;
  /** What is at a map position: surface type, heights and the physics ground under the sky. */
  probe(x: number, z: number): WorldProbe;
  /** Counts that describe the generated city. */
  census(): Record<string, number>;
  /** Put the player on the ground at a point, skipping the menu and the drop. */
  startAt(x: number, z: number, yaw?: number): void;
  /** Start a round aboard the seaplane, as the Play button does. */
  startMatch(): void;
  /** Put the player in freefall at a point (for checking landings on a chosen roof, street or water). */
  skydive(x: number, y: number, z: number): void;
  /** The seaplane and the round. */
  drop(): Record<string, any>;
  /** Press the interact key for the player: use what the prompt offers, or get out of a vehicle. */
  interact(): boolean;
  /** Entry points published by systems (vehicles, shops, bots...) for tests. */
  ext: Record<string, any>;
  /** Start the animation totals (foot slide, travel, maxima) again. */
  resetMetrics(): void;
  /** The player's movement and animation state. */
  player(): Record<string, any> | null;
  /** The player's weapon and what their hands are doing. */
  weapon(): Record<string, any> | null;
  /** Hand the player an item by id. Returns how many they took. */
  give(item: string, count?: number, tier?: number): number;
  /** Stand a combatant on the ground at a point, as a target. Returns its id. */
  spawnTarget(x: number, z: number, yaw?: number): number;
  /** Every combatant: where they are and how they are. */
  characters(): Record<string, any>[];
  /** How far the crosshair is from a world point: the angles, and the mouse movement that closes them. */
  aimAt(x: number, y: number, z: number): { yaw: number; pitch: number; dx: number; dy: number };
  /** Containers and items on the ground. */
  loot(): { containers: Record<string, any>[]; pickups: Record<string, any>[] };
  /** Effects made so far, by kind. */
  fx(): Record<string, number>;
  /** Let mouse movement turn the view without pointer lock (headless browsers cannot lock the pointer). */
  setFreeLook(on: boolean): void;
  /** Hold the camera at an offset from the player (for filming animation). Pass no arguments to release. */
  chase(dx?: number, dy?: number, dz?: number): void;
}

export interface WorldProbe {
  /** Cell type name from the world field. */
  type: string;
  water: boolean;
  /** Field height: ground, deck or roof top. */
  height: number;
  /** First solid surface below y = 400, from a physics ray. -1000 when nothing is hit. */
  ground: number;
  /** Water surface height right now. */
  wave: number;
  shore: number;
}

const CELL_NAMES = ['water', 'road', 'sidewalk', 'building', 'sand', 'grass', 'plaza', 'pier', 'bridge', 'yard', 'pool', 'lot'];

declare global {
  interface Window {
    __eyewall?: DebugApi;
  }
}

export function installDebug(game: Game): DebugApi {
  const api: DebugApi = {
    game,
    ready: false,
    errors: game.errors,
    state: () => ({
      phase: game.phase,
      time: game.engine?.time ?? 0,
      fps: game.engine?.fps ?? 0,
      frames: game.engine?.frameCount ?? 0,
      renderer: rendererName(game),
      drawCalls: game.engine?.renderer.info.render.calls ?? 0,
      triangles: game.engine?.renderer.info.render.triangles ?? 0,
      quality: game.settings.data.quality,
      renderScale: game.engine?.renderScale ?? 1,
      hour: game.world?.sky.hour ?? 0,
      night: game.world?.sky.night ?? 0,
    }),
    view: (x, y, z, tx, ty, tz) => {
      game.cameraOverride = true;
      game.engine.camera.position.set(x, y, z);
      game.viewTarget.set(tx, ty, tz);
      game.engine.camera.lookAt(game.viewTarget);
    },
    releaseView: () => {
      game.cameraOverride = false;
    },
    setHour: (hour) => game.world.setHour(hour),
    probe: (x, z) => {
      const w = game.world;
      return {
        type: CELL_NAMES[w.field.typeAt(x, z)] ?? 'unknown',
        water: w.field.isWater(x, z),
        height: w.field.heightAt(x, z),
        ground: game.physics.groundHeight(x, 400, z, 500, -1000),
        wave: w.water.height(x, z),
        shore: w.field.shoreDistance(x, z),
      };
    },
    startAt: (x, z, yaw = 0) => {
      game.startAt(x, z, yaw);
    },
    startMatch: () => game.startMatch(),
    skydive: (x, y, z) => {
      const c = game.ensurePlayer(x, z, 0);
      if (game.phase !== 'match') game.startAt(x, z, 0);
      game.drop.skydive(c, x, y, z);
    },
    drop: () => {
      const d = game.drop;
      return { flying: d.flying, doorOpen: d.doorOpen, travelled: d.travelled, x: d.planePos.x, y: d.planePos.y, z: d.planePos.z, stage: game.match.stage, round: game.match.round };
    },
    interact: () => game.controller?.interact() ?? false,
    ext: game.debugExt,
    resetMetrics: () => {
      game.player?.anim.resetMetrics();
    },
    chase: (dx, dy, dz) => {
      game.debugChase = dx === undefined ? null : new Vector3(dx, dy ?? 1, dz ?? 0);
    },
    setFreeLook: (on) => {
      game.input.freeLook = on;
    },
    weapon: () => {
      const c = game.player;
      if (!c) return null;
      const lo = c.loadout;
      const def = lo.weapon;
      const held = lo.heldNow;
      return {
        id: lo.current,
        name: def ? def.id : null,
        tier: held ? TIERS[held.tier]!.name : null,
        mag: held?.mag ?? 0,
        magSize: def?.mag ?? 0,
        reserve: def ? c.inventory.count(def.ammo) : 0,
        reloading: lo.reloading > 0,
        drawing: lo.drawing > 0,
        using: lo.using,
        aiming: c.aiming,
        bloom: lo.bloom,
        spread: game.combat.spreadOf(c),
        recoil: game.camera.recoilOffset.pitch,
        shots: lo.shots,
        hits: lo.hits,
        headshots: lo.headshots,
        carried: lo.carried(),
        lastHit: game.combat.lastHit,
        lastDamage: game.combat.lastDamage,
        lastHeadshot: game.combat.lastHeadshot,
        grenades: game.combat.live,
        fov: game.engine.camera.fov,
      };
    },
    give: (item, count, tier = 0) => {
      const c = game.player;
      if (!c || !isItemId(item)) return 0;
      return game.grant(c, item, count, tier);
    },
    spawnTarget: (x, z, yaw = 0) => {
      const id = game.characters.length;
      const c = game.spawnCharacter(`Rival ${id}`, false, x, z, yaw, randomOutfit(new Rng(game.options.seed + id * 7717)));
      return c.id;
    },
    characters: () =>
      game.characters.map((c) => ({
        id: c.id,
        name: c.name,
        player: c.isPlayer,
        x: c.position.x,
        y: c.position.y,
        z: c.position.z,
        eye: c.position.y + c.eyeHeight,
        health: c.health,
        armor: c.armor,
        alive: c.alive,
        state: c.state,
        kills: c.kills,
        weapon: c.loadout.current,
        cash: c.cash,
        items: { ...c.inventory.counts },
      })),
    aimAt: (x, y, z) => {
      const cam = game.engine.camera;
      const dx = x - cam.position.x;
      const dy = y - cam.position.y;
      const dz = z - cam.position.z;
      const len = Math.hypot(dx, dy, dz) || 1;
      const yaw = angleDiff(game.camera.yaw, Math.atan2(-dx, -dz));
      const pitch = Math.asin(dy / len) - game.camera.pitch;
      // The same factor the camera uses to turn mouse pixels into radians.
      const k = 0.0022 * game.settings.data.sensitivity * (cam.fov / game.camera.baseFov);
      return { yaw, pitch, dx: -yaw / k, dy: (-pitch / k) * (game.settings.data.invertY ? -1 : 1) };
    },
    loot: () => ({
      containers: game.loot.containers.map((c) => ({ id: c.id, kind: c.kind, x: c.x, y: c.y, z: c.z, roof: c.roof, opened: c.opened })),
      pickups: game.loot.pickups.map((p) => ({ id: p.id, item: p.item, count: p.count, tier: p.tier, x: p.x, y: p.y, z: p.z })),
    }),
    fx: () => ({ ...game.fx.counts, tracers: game.fx.tracers, decals: game.fx.decals, alive: game.fx.alive }),
    player: () => {
      const c = game.player;
      if (!c) return null;
      const m = c.motor;
      return {
        x: m.position.x,
        y: m.position.y,
        z: m.position.z,
        vx: m.velocity.x,
        vy: m.velocity.y,
        vz: m.velocity.z,
        speed: m.speed,
        mode: m.mode,
        grounded: m.grounded,
        crouched: m.crouched,
        swimming: m.swimming,
        waterDepth: m.waterDepth,
        surface: m.surface,
        facing: c.facing,
        aimYaw: c.aimYaw,
        aimPitch: c.aimPitch,
        health: c.health,
        alive: c.alive,
        state: c.state,
        anim: { mode: c.anim.mode, phase: c.anim.phase, ...c.anim.metrics },
        headYaw: partYaw(c, 'head'),
        headPitch: Math.asin(Math.max(-1, Math.min(1, c.anim.partFacing('head', _dir).y))),
        chestYaw: partYaw(c, 'chest'),
        hipsYaw: partYaw(c, 'hips'),
        altitude: game.drop.altitude(c),
        cash: c.cash,
        items: { ...c.inventory.counts },
        armor: c.armor,
        prompt: game.controller?.prompt ?? '',
        vehicle: c.vehicle ? { kind: c.vehicle.kind, name: c.vehicle.name, seat: c.seat, driver: c.vehicle.driver === c, speed: c.vehicle.speed, x: c.vehicle.position.x, y: c.vehicle.position.y, z: c.vehicle.position.z, yaw: c.vehicle.yaw, health: c.vehicle.health } : null,
        camYaw: game.camera.yaw,
        camPitch: game.camera.pitch,
      };
    },
    census: () => {
      const w = game.world;
      const l = w.layout;
      return {
        buildings: w.city.buildings.length,
        palms: w.props.palms.length,
        lamps: w.props.lamps.length,
        bridges: l.segments.filter((r) => r.bridge).length,
        roads: l.segments.length,
        piers: l.piers.length,
        shops: l.lots.filter((x) => x.use === 'shop').length,
        pois: l.pois.length,
        colliders: game.physics.world.colliders.len(),
      };
    },
  };
  window.__eyewall = api;
  return api;
}

function rendererName(game: Game): string {
  const gl = game.engine?.renderer.getContext();
  if (!gl) return 'none';
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
}
