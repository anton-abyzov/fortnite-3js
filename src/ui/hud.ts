import './hud.css';
import type { Character } from '../character/character';
import { angleDiff } from '../core/math';
import type { GameSystem } from '../core/system';
import type { Game } from '../game';
import { ITEMS, type ItemId, WEAPON_IDS } from '../gameplay/items';
import { CONSUMABLES, TIERS, WEAPONS } from '../gameplay/weapons';
import { describe } from '../world/loot';
import { Aftermath } from './aftermath';
import { el } from './dom';
import { Minimap } from './minimap';
import { RoundHud } from './roundHud';

const hex = (color: number): string => `#${color.toString(16).padStart(6, '0')}`;

/** Things carried besides weapons, with the key that uses each. */
const POUCH: { id: ItemId; key: string; short: string }[] = [
  { id: 'bandage', key: 'Q', short: 'Bandage' },
  { id: 'medkit', key: 'Q', short: 'Medkit' },
  { id: 'cola', key: 'X', short: 'Cola' },
  { id: 'vest', key: 'X', short: 'Vest' },
  { id: 'grenade', key: 'G', short: 'Frag' },
];

/**
 * What the player sees over the world while playing: crosshair, hit marker, health and armor, the
 * weapon in hand and the ones carried, supplies, cash, and short notes about what was picked up.
 * The round's own parts live beside it: the map (minimap.ts), the compass, the count of who is
 * left, the kill feed and the storm's clock (roundHud.ts), and what follows the player's last
 * moment in a round (aftermath.ts).
 */
export class Hud implements GameSystem {
  readonly root = el('div', 'hud');
  private readonly cross = el('div', 'cross');
  private readonly ticks: HTMLElement[] = [];
  private readonly marker = el('div', 'hitmark');
  private readonly scope = el('div', 'scope');
  private readonly hurtRing = el('div', 'hurt-ring');
  private readonly vignette = el('div', 'hurt-vignette');
  private readonly health = el('div', 'bar-fill health');
  private readonly armor = el('div', 'bar-fill armor');
  private readonly healthText = el('span', 'bar-num');
  private readonly armorText = el('span', 'bar-num');
  private readonly cash = el('div', 'cash');
  private readonly ammo = el('div', 'ammo');
  private readonly ammoMag = el('span', 'ammo-mag', '0');
  private readonly ammoReserve = el('span', 'ammo-reserve', '0');
  private readonly weaponName = el('div', 'weapon-name');
  private readonly reload = el('div', 'reload');
  private readonly reloadFill = el('div', 'reload-fill');
  private readonly reloadText = el('span', 'reload-text');
  private readonly slots: HTMLElement[] = [];
  private readonly pouch: { node: HTMLElement; count: HTMLElement; id: ItemId }[] = [];
  private readonly toasts = el('div', 'toasts');
  private readonly map: Minimap;
  private readonly round: RoundHud;
  private readonly after: Aftermath;
  private shown = '';
  /** The player is out of the round: their own gauges are put away. */
  private down = false;
  private markTimer = 0;
  private hurtTimer = 0;
  private hurtFrom = 0;
  private last: Record<string, string | number> = {};

  constructor(
    private readonly game: Game,
    parent: HTMLElement,
  ) {
    for (const side of ['n', 'e', 's', 'w']) {
      const t = el('i', `tick tick-${side}`);
      this.ticks.push(t);
      this.cross.append(t);
    }
    this.cross.append(el('i', 'dot'));

    const vitals = el('div', 'vitals');
    const hp = el('div', 'bar');
    hp.append(this.health, el('span', 'bar-label', 'Health'), this.healthText);
    const ar = el('div', 'bar bar-armor');
    ar.append(this.armor, el('span', 'bar-label', 'Armor'), this.armorText);
    const pouch = el('div', 'pouch');
    for (const p of POUCH) {
      const node = el('div', 'pouch-item');
      const count = el('span', 'pouch-count', '0');
      node.append(el('kbd', 'key key-small', p.key), el('span', 'pouch-name', p.short), count);
      node.dataset.item = p.id;
      pouch.append(node);
      this.pouch.push({ node, count, id: p.id });
    }
    vitals.append(ar, hp, pouch, this.cash);

    const arms = el('div', 'arms');
    this.ammo.append(this.ammoMag, el('span', 'ammo-sep', '/'), this.ammoReserve);
    const rack = el('div', 'rack');
    WEAPON_IDS.forEach((id, i) => {
      const slot = el('div', 'slot');
      slot.dataset.weapon = id;
      slot.append(el('kbd', 'key key-small', String(i + 1)), el('span', 'slot-name', ITEMS[id].name), el('i', 'slot-tier'));
      rack.append(slot);
      this.slots.push(slot);
    });
    arms.append(this.weaponName, this.ammo, rack);

    this.reload.append(this.reloadFill, this.reloadText);
    this.map = new Minimap(game, parent);
    this.round = new RoundHud(game);
    this.after = new Aftermath(game, parent);
    const top = el('div', 'hud-top');
    top.append(this.round.compass, this.round.storm, this.round.warn);
    const corner = el('div', 'hud-corner');
    corner.append(this.map.root, this.round.tally);
    this.root.append(this.round.tint, this.vignette, this.scope, this.hurtRing, this.cross, this.marker, this.reload, top, corner, this.round.feed, vitals, arms, this.toasts, this.after.label, this.map.full);
    // Under the title and pause cards, which come later in the page.
    parent.prepend(this.root);

    const g = game;
    g.events.on('phase', () => this.sync());
    g.events.on('hurt', ({ target, info }) => {
      const player = g.player;
      if (!player) return;
      if (info.by === player && target !== player) this.mark(info.headshot === true, !target.alive);
      if (target === player) {
        this.hurtTimer = 1;
        // Which way the blow came from, relative to the view.
        const from = info.by && info.by !== player ? info.by.position : null;
        this.hurtFrom = from ? Math.atan2(-(from.x - player.position.x), -(from.z - player.position.z)) : Number.NaN;
      }
    });
    g.events.on('kill', ({ victim, info }) => {
      if (info.by === g.player && victim !== g.player) this.toast(`Eliminated ${victim.name}`, 'kill');
    });
    g.events.on('grant', ({ to, item, count }) => {
      if (to !== g.player) return;
      const tier = ITEMS[item].kind === 'weapon' ? (to.loadout.held[item as keyof typeof WEAPONS]?.tier ?? 0) : 0;
      this.toast(`+ ${describe(item, count, tier)}`, ITEMS[item].kind);
    });
    g.events.on('cash', ({ to, amount }) => {
      if (to === g.player) this.toast(`+ $${amount}`, 'cash');
    });
    this.sync();
  }

  private sync(): void {
    this.root.classList.toggle('show', this.game.phase === 'match');
  }

  /** Flash the hit marker. */
  private mark(head: boolean, kill: boolean): void {
    this.marker.className = `hitmark show${head ? ' head' : ''}${kill ? ' kill' : ''}`;
    this.markTimer = kill ? 0.32 : 0.16;
  }

  /** A short note at the side: something picked up, someone eliminated. */
  toast(text: string, kind = ''): void {
    const node = el('div', `toast ${kind}`, text);
    this.toasts.prepend(node);
    while (this.toasts.children.length > 6) this.toasts.lastElementChild?.remove();
    window.setTimeout(() => node.classList.add('out'), 2600);
    window.setTimeout(() => node.remove(), 3100);
  }

  /** Write a value into the page only when it changed. */
  private set(key: string, value: string | number, apply: (v: string | number) => void): void {
    if (this.last[key] === value) return;
    this.last[key] = value;
    apply(value);
  }

  /** Fixed step: the keys that change who is watched after the player is out. */
  fixedUpdate(): void {
    this.after.fixedUpdate();
  }

  frameUpdate(dt: number): void {
    const g = this.game;
    const c = g.player;
    if (!c) return;
    // Once the player is out, the view, the map and the compass follow whoever they are watching.
    this.after.update(dt);
    const watched = this.after.target;
    this.round.update(c, g.camera.yaw);
    this.map.update(dt, watched ?? c, watched ? c : null, g.camera.yaw);
    if (c.alive === this.down) {
      this.down = !c.alive;
      this.root.classList.toggle('dead', this.down);
    }
    const lo = c.loadout;
    const def = lo.weapon;
    const held = lo.heldNow;
    const onFoot = c.alive && c.state === 'normal';

    // Crosshair: the gap is the cone the next shot can land in, drawn at its true size on screen.
    const cam = g.engine.camera;
    const px = def ? (g.combat.spreadOf(c) * window.innerHeight) / (2 * Math.tan((cam.fov * Math.PI) / 360)) : 0;
    const gap = Math.round(Math.min(90, 4 + px));
    const scoped = def?.id === 'sniper' && c.aiming > 0.82;
    this.set('cross', onFoot && def && !scoped ? gap : -1, (v) => {
      this.cross.classList.toggle('show', v !== -1);
      this.cross.style.setProperty('--gap', `${v}px`);
    });
    this.set('scope', scoped ? 1 : 0, (v) => this.scope.classList.toggle('show', v === 1));

    if (this.markTimer > 0) {
      this.markTimer -= dt;
      if (this.markTimer <= 0) this.marker.classList.remove('show');
    }
    if (this.hurtTimer > 0) {
      this.hurtTimer = Math.max(0, this.hurtTimer - dt * 1.4);
      this.hurtRing.style.opacity = Number.isNaN(this.hurtFrom) ? '0' : String(this.hurtTimer);
      if (!Number.isNaN(this.hurtFrom)) this.hurtRing.style.transform = `translate(-50%, -50%) rotate(${-angleDiff(g.camera.yaw, this.hurtFrom)}rad)`;
    }
    const low = c.alive && c.health < 30 ? 0.35 + 0.25 * Math.sin(g.engine.time * 5) : 0;
    this.set('vignette', Math.round(Math.max(low, this.hurtTimer * 0.55) * 20), (v) => {
      this.vignette.style.opacity = String(Number(v) / 20);
    });

    this.set('hp', Math.ceil(c.health), (v) => {
      this.health.style.width = `${(Number(v) / c.maxHealth) * 100}%`;
      this.healthText.textContent = String(v);
      this.health.classList.toggle('low', Number(v) < 30);
    });
    this.set('armor', Math.ceil(c.armor), (v) => {
      this.armor.style.width = `${(Number(v) / c.maxArmor) * 100}%`;
      this.armorText.textContent = String(v);
    });
    this.set('cash', c.cash, (v) => {
      this.cash.textContent = `$${v}`;
    });
    for (const p of this.pouch) {
      this.set(`pouch-${p.id}`, c.inventory.count(p.id), (v) => {
        p.count.textContent = String(v);
        p.node.classList.toggle('have', Number(v) > 0);
      });
    }

    // Weapon in hand.
    const name = def && held ? `${ITEMS[def.id].name}|${held.tier}` : '';
    this.set('weapon', name, () => {
      this.weaponName.textContent = def && held ? ITEMS[def.id].name : 'Unarmed';
      this.weaponName.style.setProperty('--tier', def && held ? hex(TIERS[held.tier]!.color) : 'transparent');
      this.weaponName.dataset.tier = def && held ? TIERS[held.tier]!.name : '';
      this.ammo.classList.toggle('show', !!def);
    });
    if (def && held) {
      this.set('mag', held.mag, (v) => {
        this.ammoMag.textContent = String(v);
        this.ammoMag.classList.toggle('low', Number(v) <= Math.ceil(def.mag * 0.25));
      });
      this.set('reserve', c.inventory.count(def.ammo), (v) => {
        this.ammoReserve.textContent = String(v);
      });
    }
    const carried = WEAPON_IDS.map((id) => (lo.held[id] ? `${lo.held[id]!.tier}${id === lo.current ? '*' : ''}` : '-')).join('');
    this.set('rack', carried, () => {
      WEAPON_IDS.forEach((id, i) => {
        const slot = this.slots[i]!;
        const h = lo.held[id];
        slot.classList.toggle('have', !!h);
        slot.classList.toggle('on', id === lo.current);
        slot.style.setProperty('--tier', h ? hex(TIERS[h.tier]!.color) : 'transparent');
      });
    });

    // The bar for whatever takes time: a reload, a bandage.
    let label = '';
    let fill = 0;
    if (lo.using) {
      label = `Using ${ITEMS[lo.using].name}`;
      fill = 1 - lo.useLeft / CONSUMABLES[lo.using].time;
    } else if (lo.reloading > 0 && lo.reloadTotal > 0) {
      label = 'Reloading';
      fill = 1 - lo.reloading / lo.reloadTotal;
    }
    if (label !== this.shown) {
      this.shown = label;
      this.reload.classList.toggle('show', label !== '');
      this.reloadText.textContent = label;
    }
    if (label) this.reloadFill.style.width = `${Math.round(Math.min(1, Math.max(0, fill)) * 100)}%`;
  }

  /** For tests: what the page shows right now. */
  snapshot(): Record<string, unknown> {
    const c: Character | null = this.game.player;
    return {
      visible: this.root.classList.contains('show'),
      crosshair: this.cross.classList.contains('show'),
      weapon: this.weaponName.textContent,
      mag: Number(this.ammoMag.textContent),
      reserve: Number(this.ammoReserve.textContent),
      health: Number(this.healthText.textContent),
      armor: Number(this.armorText.textContent),
      slots: this.slots.filter((s) => s.classList.contains('have')).map((s) => s.dataset.weapon),
      active: this.slots.find((s) => s.classList.contains('on'))?.dataset.weapon ?? null,
      bar: this.shown,
      toasts: [...this.toasts.children].map((t) => t.textContent),
      player: c?.name ?? null,
      ...this.round.snapshot(),
      ...this.after.snapshot(),
      map: { ...this.map.shown },
      fullMap: this.map.open ? { ...this.map.fullShown } : null,
    };
  }
}
