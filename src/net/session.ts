import { Vector3 } from 'three';
import type { Character } from '../character/character';
import { randomOutfit } from '../character/rig';
import { Rng } from '../core/rng';
import type { GameSystem } from '../core/system';
import type { DamageCause, DamageInfo, Game } from '../game';
import { isItemId, type ItemId, type WeaponId } from '../gameplay/items';
import { CONSUMABLES, WEAPONS } from '../gameplay/weapons';
import { type EventMsg, MODES, type NetMsg, type PlayerInfo, q, type RoundInfo, type StateMsg } from './protocol';
import { now, RemoteBody } from './remote';
import { type SignalMsg, SignalClient } from './signal';
import { Link, type LinkMode } from './transport';

export type Role = 'host' | 'guest';

/** Players in a room, the host included. */
export const MAX_PLAYERS = 4;
/** Seconds a player who lost the connection keeps their place in the round. */
export const AWAY_GRACE = 30;
/** State messages per second from each browser. */
const STATE_HZ = 20;

/** Where a friends round can start, on foot. Spawns are spread around the point. */
export const FRIEND_STARTS: readonly { name: string; x: number; z: number }[] = [
  { name: 'Deco Row', x: -60, z: 13 },
  { name: 'Ocean Parade', x: 385, z: 150 },
  { name: 'Gran Via', x: -5, z: -118 },
  { name: 'El Mercado', x: -60, z: 245 },
];

/** What everyone carries at the start of a friends round: item, count, tier. */
const KIT: [ItemId, number, number][] = [
  ['rifle', 1, 1],
  ['ammo_medium', 120, 0],
  ['pistol', 1, 0],
  ['ammo_light', 48, 0],
  ['bandage', 3, 0],
  ['cola', 2, 0],
];

/** The most one claim may do, by cause: the host turns down anything above. */
const CLAIM_CAP: Record<DamageCause, number> = { bullet: 260, explosion: 120, vehicle: 160, fall: 400, storm: 40, drown: 40 };

interface Member {
  slot: number;
  name: string;
  token: string;
  /** Signaling id while connected, -1 while away. */
  peer: number;
  away: boolean;
  awaySince: number;
  /** Takes part in the current round. */
  inRound: boolean;
}

function tokenFor(room: string): string {
  const key = `eyewall-friends:${room}`;
  let t = localStorage.getItem(key);
  if (!t) {
    t = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    localStorage.setItem(key, t);
  }
  return t;
}

/** The name this browser plays under, kept between visits. */
export function savedName(): string {
  return localStorage.getItem('eyewall-friends:name') ?? '';
}

export function saveName(name: string): void {
  localStorage.setItem('eyewall-friends:name', name);
}

/**
 * One friends room, from this browser's side. The host's browser is the authority: it admits
 * players, starts rounds, applies all damage and calls the end. Every browser simulates its own
 * character and the vehicle it drives, and shows the others from their state messages.
 */
export class FriendsSession implements GameSystem {
  role: Role;
  room = '';
  /** This browser's slot; 0 is the host. -1 until the host says. */
  slot = -1;
  readonly members = new Map<number, Member>();
  /** What the room panel should say: an error, a closed room. */
  message = '';
  /** Set once the room is over for this browser (left, closed, refused). */
  ended = false;
  round = 0;
  running = false;
  info: RoundInfo | null = null;
  /** Called whenever something the room panel shows changes. */
  onChange: () => void = () => {};
  /** Called when the room is over for this browser, with the reason. */
  onEnd: (reason: string) => void = () => {};
  private readonly signal = new SignalClient();
  /** Host: one per guest, by signaling id. Guest: one, to the host (id 0). */
  private readonly links = new Map<number, Link>();
  private readonly bodies = new Map<number, RemoteBody>();
  private readonly chars = new Map<number, Character>();
  private stateClock = 0;
  private applying = false;
  private savedHurtScale: Game['hurtScale'] = null;
  private readonly offs: (() => void)[] = [];
  /** Round time of the last `over`, and the winner's slot, for tests. */
  lastOver: { winner: number; time: number } | null = null;
  /** Claims the host turned down, for tests. */
  refusedClaims = 0;

  private constructor(
    private readonly game: Game,
    role: Role,
    readonly name: string,
  ) {
    this.role = role;
  }

  /** Open a new room as its host. */
  static async host(game: Game, name: string): Promise<FriendsSession> {
    const s = new FriendsSession(game, 'host', name);
    await s.open();
    await s.request('created', { t: 'create' });
    return s;
  }

  /** Join a room by its code. Rejects with a message to show when the room is full or missing. */
  static async join(game: Game, code: string, name: string): Promise<FriendsSession> {
    const s = new FriendsSession(game, 'guest', name);
    const room = code.trim().toUpperCase();
    await s.open();
    await s.request('joined', { t: 'join', room, name, token: tokenFor(room) });
    return s;
  }

  get inviteLink(): string {
    const url = new URL(location.href);
    url.search = '';
    const keep = new URLSearchParams(location.search);
    for (const k of ['signal', 'net']) {
      const v = keep.get(k);
      if (v) url.searchParams.set(k, v);
    }
    url.searchParams.set('room', this.room);
    return url.toString();
  }

  /** How each link travels: 'webrtc', 'relay' or 'connecting'. */
  get transports(): LinkMode[] {
    return [...this.links.values()].map((l) => l.mode);
  }

  private open(): Promise<void> {
    this.signal.onMessage = (m) => this.onSignal(m);
    this.signal.onClose = () => this.end(this.role === 'host' ? 'Lost the connection to the room server.' : 'Lost the connection to the room.');
    return this.signal.connect();
  }

  private pending: { want: string; resolve: () => void; reject: (e: Error) => void } | null = null;

  private request(want: string, msg: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pending = { want, resolve, reject };
      this.signal.send(msg);
      setTimeout(() => {
        if (this.pending?.want !== want) return;
        this.pending = null;
        this.signal.close();
        reject(new Error('The room server did not answer.'));
      }, 8000);
    });
  }

  // ---------------------------------------------------------------- signaling

  private onSignal(m: SignalMsg): void {
    switch (m.t) {
      case 'created':
        this.room = m.room;
        this.slot = 0;
        this.members.set(0, { slot: 0, name: this.name, token: 'host', peer: 0, away: false, awaySince: 0, inRound: false });
        this.install();
        this.pending?.resolve();
        this.pending = null;
        break;
      case 'joined':
        this.room = m.room;
        localStorage.setItem('eyewall-friends:last', m.room);
        this.addLink(0, false);
        this.install();
        this.pending?.resolve();
        this.pending = null;
        break;
      case 'error': {
        const text = m.code === 'full' ? `Room ${m.room} is full: ${MAX_PLAYERS} players already.` : `There is no room ${m.room}. Check the code with your host.`;
        this.signal.close();
        this.pending?.reject(new Error(text));
        this.pending = null;
        break;
      }
      case 'peer-join':
        if (this.role === 'host') this.admit(m.id, m.name, m.token);
        break;
      case 'peer-leave':
        if (this.role === 'host') this.lost(m.id);
        break;
      case 'signal':
        void this.links.get(m.from)?.handshake(m.data);
        break;
      case 'relay':
        this.links.get(m.from)?.relayIn(m.data);
        break;
      case 'kicked':
        this.end(this.leaving ? '' : m.reason || 'The host turned you away.');
        break;
      case 'room-closed':
        this.end('The host closed the room.');
        break;
    }
  }

  private addLink(peer: number, offerer: boolean): Link {
    const link = new Link(this.signal, peer, offerer);
    link.onMessage = (msg) => this.onNet(link, msg);
    this.links.set(peer, link);
    return link;
  }

  /** Hooks into the game while the room is open. */
  private install(): void {
    const g = this.game;
    g.addSystem(this);
    g.hurtGate = (target, amount, info) => this.gate(target, amount, info);
    g.roundHooks = {
      again: () => {
        // The others are still fighting: the next round starts when this one is over.
        if (this.running) return;
        if (this.role === 'host') this.startRound();
        else {
          // The host starts the next one; until then, the room panel.
          g.input.setWantLock(false);
          this.leaveRound();
          this.onChange();
        }
      },
      title: () => this.leave(),
    };
    this.offs.push(
      g.events.on('shot', (e) => {
        if (e.by !== g.player || !this.running || !e.end) return;
        this.send({ k: 'shot', slot: this.slot, w: e.weapon, f: [q(e.x), q(e.y), q(e.z)], e: [q(e.end.x), q(e.end.y), q(e.end.z)], hit: e.hit ?? 'none' });
      }),
      g.events.on('hurt', ({ target, amount, info }) => {
        if (this.role !== 'host' || !this.running) return;
        const slot = this.slotOf(target);
        if (slot < 0) return;
        const dir: [number, number] = info.dir ? [q(info.dir.x), q(info.dir.z)] : [0, 0];
        this.send({ k: 'hurt', target: slot, by: info.by ? this.slotOf(info.by) : -1, amount: q(amount), cause: info.cause, w: info.weapon ?? '', head: info.headshot === true, dir, hp: target.health, ar: target.armor });
      }),
      g.events.on('used', ({ who, item }) => {
        if (who !== g.player || !this.running) return;
        if (this.role === 'guest') this.send({ k: 'used', item });
        else this.send({ k: 'vitals', slot: 0, hp: who.health, ar: who.armor });
      }),
      g.events.on('seat', ({ who, vehicle, seat }) => {
        if (who !== g.player || !this.running) return;
        const v = g.vehicles.indexOf(vehicle);
        if (this.role === 'guest') this.send({ k: 'seat', slot: this.slot, v, seat });
        else this.send({ k: 'seat', slot: 0, v, seat });
      }),
      g.events.on('over', (result) => {
        if (this.role !== 'host' || !g.match.friends) return;
        this.running = false;
        const winner = result.winner ? this.slotOf(result.winner) : -1;
        this.lastOver = { winner, time: result.time };
        this.send({ k: 'over', winner, time: result.time });
        this.sendRoster();
      }),
    );
    this.onChange();
  }

  // ---------------------------------------------------------------- the host's door

  private admit(peer: number, name: string, token: string): void {
    // Back from a lost connection: the same place in the round.
    for (const m of this.members.values()) {
      if (m.token === token && m.slot !== 0 && m.away) {
        if (m.peer >= 0) this.links.get(m.peer)?.close();
        this.links.delete(m.peer);
        m.peer = peer;
        m.away = false;
        m.name = name || m.name;
        const link = this.addLink(peer, true);
        // Their page started again, and with it their clock.
        this.body(m.slot).reset();
        this.sendRoster();
        if (this.running && m.inRound && this.info) {
          const c = this.chars.get(m.slot);
          // Only those still in the room: whoever left is not brought back.
          const spawns: RoundInfo['spawns'] = {};
          for (const [slot, at] of Object.entries(this.info.spawns)) if (this.members.has(Number(slot))) spawns[Number(slot)] = at;
          const info = { ...this.info, spawns };
          const dead = [...this.chars.entries()].filter(([s, ch]) => !ch.alive && s !== m.slot && this.members.has(s)).map(([s]) => s);
          if (c) link.sendEvent({ k: 'resume', info, at: [q(c.position.x), q(c.position.y), q(c.position.z), q(c.facing)], hp: c.health, ar: c.armor, alive: c.alive, dead });
        }
        this.onChange();
        return;
      }
    }
    if (this.members.size >= MAX_PLAYERS) {
      this.signal.send({ t: 'kick', id: peer, reason: `Room ${this.room} is full: ${MAX_PLAYERS} players already.` });
      return;
    }
    let slot = 1;
    while (this.members.has(slot)) slot++;
    this.members.set(slot, { slot, name: name || `Friend ${slot}`, token, peer, away: false, awaySince: 0, inRound: false });
    this.addLink(peer, true);
    this.sendRoster();
    this.onChange();
  }

  /** A guest's connection dropped. Mid-round they keep their place for a while. */
  private lost(peer: number): void {
    const m = this.memberByPeer(peer);
    this.links.get(peer)?.close();
    this.links.delete(peer);
    if (!m) return;
    m.peer = -1;
    const c = this.chars.get(m.slot);
    if (this.running && m.inRound && c?.alive) {
      m.away = true;
      m.awaySince = now();
    } else this.remove(m.slot);
    this.sendRoster();
    this.onChange();
  }

  /** Out of the room for good. */
  private remove(slot: number): void {
    const m = this.members.get(slot);
    if (!m) return;
    if (m.peer >= 0) {
      this.links.get(m.peer)?.close();
      this.links.delete(m.peer);
      // The room server frees the seat now, not when that socket finally closes.
      this.signal.send({ t: 'kick', id: m.peer, reason: '' });
    }
    this.members.delete(slot);
    this.retire(slot);
  }

  /** Take a player's body off the map, and out of the round. */
  private retire(slot: number): void {
    const c = this.chars.get(slot);
    if (!c || c === this.game.player) return;
    this.game.match.withdraw(c);
    this.park(c);
    this.bodies.get(slot)?.reset();
  }

  /**
   * Out of play and out of sight, like a bot between rounds: nothing aims at it, picks things up
   * with it, brakes for it or runs it over. `beginRound` brings it back.
   */
  private park(c: Character): void {
    this.seatOut(c);
    c.alive = false;
    c.state = 'plane';
    c.rig.root.visible = false;
    c.motor.setEnabled(false);
    c.motor.velocity.set(0, 0, 0);
  }

  private memberByPeer(peer: number): Member | undefined {
    for (const m of this.members.values()) if (m.peer === peer) return m;
    return undefined;
  }

  private roster(): PlayerInfo[] {
    return [...this.members.values()]
      .sort((a, b) => a.slot - b.slot)
      .map((m) => ({ slot: m.slot, name: m.name, away: m.away, alive: m.inRound && (this.chars.get(m.slot)?.alive ?? false) }));
  }

  private sendRoster(): void {
    if (this.role !== 'host') return;
    const players = this.roster();
    for (const m of this.members.values()) {
      if (m.slot === 0 || m.peer < 0) continue;
      this.links.get(m.peer)?.sendEvent({ k: 'roster', players, you: m.slot, round: this.round, running: this.running });
    }
  }

  /** Everyone in the room, for the panel. */
  get players(): PlayerInfo[] {
    return this.roster();
  }

  // ---------------------------------------------------------------- sending

  /** Host: to every guest (but `except`). Guest: to the host. */
  private send(msg: NetMsg, except = -1): void {
    const state = msg.k === 'st';
    if (this.role === 'guest') {
      const link = this.links.get(0);
      if (state) link?.sendState(msg);
      else link?.sendEvent(msg);
      return;
    }
    for (const m of this.members.values()) {
      if (m.slot === 0 || m.slot === except || m.peer < 0) continue;
      const link = this.links.get(m.peer);
      if (state) link?.sendState(msg);
      else link?.sendEvent(msg);
    }
  }

  private sendTo(slot: number, msg: EventMsg): void {
    const m = this.members.get(slot);
    if (m && m.peer >= 0) this.links.get(m.peer)?.sendEvent(msg);
  }

  // ---------------------------------------------------------------- receiving

  private onNet(link: Link, msg: NetMsg): void {
    if (this.ended) return;
    if (this.role === 'host') {
      const m = this.memberByPeer(link.peer);
      if (!m) return;
      this.fromGuest(m, msg);
    } else this.fromHost(msg);
  }

  private fromGuest(m: Member, msg: NetMsg): void {
    const g = this.game;
    switch (msg.k) {
      case 'st':
        msg.slot = m.slot;
        this.body(m.slot).push(msg);
        this.send(msg, m.slot);
        break;
      case 'shot':
        msg.slot = m.slot;
        this.drawShot(msg);
        this.send(msg, m.slot);
        break;
      case 'claim':
        this.judge(m, msg);
        break;
      case 'used': {
        const c = this.chars.get(m.slot);
        if (!c || !c.alive || !isItemId(msg.item) || !(msg.item in CONSUMABLES)) return;
        const spec = CONSUMABLES[msg.item as keyof typeof CONSUMABLES];
        if (spec.health > 0) c.health = Math.max(c.health, Math.min(spec.healthCap, c.health + spec.health));
        if (spec.armor > 0) c.addArmor(spec.armor);
        this.send({ k: 'vitals', slot: m.slot, hp: c.health, ar: c.armor });
        break;
      }
      case 'seat': {
        const c = this.chars.get(m.slot);
        const v = g.vehicles[msg.v];
        if (!c || !v) return;
        if (msg.seat < 0) {
          this.seatOut(c);
          this.send({ k: 'seat', slot: m.slot, v: msg.v, seat: -1 }, m.slot);
          return;
        }
        const s = v.seats[msg.seat];
        if (!c.alive || v.destroyed || !s || (s.occupant && s.occupant !== c) || (c.vehicle && c.vehicle !== v)) {
          this.sendTo(m.slot, { k: 'seat-deny', v: msg.v });
          return;
        }
        if (!s.occupant) v.enter(c, msg.seat);
        this.send({ k: 'seat', slot: m.slot, v: msg.v, seat: msg.seat }, m.slot);
        break;
      }
      case 'leave':
        this.remove(m.slot);
        this.sendRoster();
        this.onChange();
        break;
      default:
        break;
    }
  }

  private fromHost(msg: NetMsg): void {
    const g = this.game;
    switch (msg.k) {
      case 'roster': {
        this.slot = msg.you;
        this.round = msg.round;
        const before = new Set(this.members.keys());
        this.members.clear();
        for (const p of msg.players) {
          this.members.set(p.slot, { slot: p.slot, name: p.name, token: '', peer: -1, away: p.away, awaySince: 0, inRound: p.alive });
          before.delete(p.slot);
        }
        // Whoever is gone from the list has left the room.
        for (const slot of before) if (slot !== this.slot) this.retire(slot);
        if (!msg.running && this.running && !g.match.result) this.running = false;
        this.onChange();
        break;
      }
      case 'start':
        this.beginRound(msg.info);
        break;
      case 'resume':
        this.beginRound(msg.info, msg);
        break;
      case 'st':
        if (msg.slot !== this.slot) this.body(msg.slot).push(msg);
        break;
      case 'shot':
        if (msg.slot !== this.slot) this.drawShot(msg);
        break;
      case 'hurt': {
        const target = this.chars.get(msg.target);
        if (!target) return;
        const by = msg.by >= 0 ? (this.chars.get(msg.by) ?? null) : null;
        const info: DamageInfo = { by, cause: msg.cause as DamageCause, weapon: msg.w || undefined, headshot: msg.head, dir: new Vector3(msg.dir[0], 0, msg.dir[1]) };
        this.applying = true;
        g.applyHurt(target, msg.amount, msg.hp, msg.ar, info);
        this.applying = false;
        this.onChange();
        break;
      }
      case 'vitals': {
        const c = this.chars.get(msg.slot);
        if (c && c.alive) {
          c.health = msg.hp;
          c.armor = msg.ar;
        }
        break;
      }
      case 'seat': {
        const c = this.chars.get(msg.slot);
        const v = g.vehicles[msg.v];
        if (!c || c === g.player || !v) return;
        if (msg.seat < 0) this.seatOut(c);
        else {
          const s = v.seats[msg.seat];
          if (!s) return;
          // The host has the last word: whoever sits there here makes room.
          if (s.occupant && s.occupant !== c) s.occupant.vehicle?.exit(s.occupant);
          if (c.vehicle && c.vehicle !== v) this.seatOut(c);
          if (!c.vehicle) v.enter(c, msg.seat);
        }
        break;
      }
      case 'seat-deny': {
        const p = g.player;
        if (p?.vehicle && g.vehicles.indexOf(p.vehicle) === msg.v) p.vehicle.exit(p);
        break;
      }
      case 'over': {
        this.running = false;
        this.lastOver = { winner: msg.winner, time: msg.time };
        g.match.finishWith(msg.winner >= 0 ? (this.chars.get(msg.winner) ?? null) : null, msg.time);
        this.onChange();
        break;
      }
      case 'refused':
        this.end(msg.reason);
        break;
      default:
        break;
    }
  }

  /** Someone got out of a vehicle in another browser; a body they drove comes back to this one. */
  private seatOut(c: Character): void {
    const v = c.vehicle;
    if (!v) {
      this.releaseVehicles();
      return;
    }
    const drove = v.driver === c;
    const vel = drove ? this.body(this.slotOf(c)).vehicleVelocity() : null;
    v.exit(c);
    if (drove) v.setRemoteDriven(false, vel?.lin, vel?.ang);
  }

  /**
   * A body the network drives goes back to this browser's physics once nobody from another
   * browser drives it: the driver got out, died, left, or the car was wrecked under them.
   */
  private releaseVehicles(): void {
    const g = this.game;
    for (const v of g.vehicles) {
      if (!v.remoteDriven) continue;
      const d = v.driver;
      if (d && d !== g.player && d.remote && d.alive) continue;
      const vel = d ? this.body(this.slotOf(d)).vehicleVelocity() : null;
      v.setRemoteDriven(false, vel?.lin, vel?.ang);
    }
  }

  private drawShot(msg: Extract<EventMsg, { k: 'shot' }>): void {
    const c = this.chars.get(msg.slot);
    if (!c || !isItemId(msg.w) || !(msg.w in WEAPONS)) return;
    this.game.combat.remoteShot(c, msg.w as WeaponId, new Vector3(...msg.f), new Vector3(...msg.e), msg.hit);
  }

  // ---------------------------------------------------------------- damage

  /**
   * Who works out a hit: the browser of whoever caused it, or of the victim when nobody did (a
   * fall). The host applies its own at once; a guest sends a claim and changes nothing until the
   * host answers.
   */
  private gate(target: Character, amount: number, info: DamageInfo): boolean {
    if (this.applying) return true;
    if (!this.running) return false;
    const me = this.game.player;
    const mine = info.by ? info.by === me : target === me;
    if (!mine) return false;
    const slot = this.slotOf(target);
    if (slot < 0) return false;
    if (this.role === 'host') return true;
    const dir: [number, number] = info.dir ? [q(info.dir.x), q(info.dir.z)] : [0, 0];
    this.send({ k: 'claim', target: slot, by: info.by ? this.slot : -1, amount: q(amount), cause: info.cause, w: info.weapon ?? '', head: info.headshot === true, dir });
    return false;
  }

  /** The host's check of a guest's claim. Friends are trusted, within reason. */
  private judge(m: Member, msg: Extract<EventMsg, { k: 'claim' }>): void {
    const target = this.chars.get(msg.target);
    const shooter = this.chars.get(m.slot);
    const cause = msg.cause as DamageCause;
    const cap = CLAIM_CAP[cause];
    const ok =
      this.running &&
      target !== undefined &&
      shooter !== undefined &&
      target.alive &&
      cap !== undefined &&
      msg.amount > 0 &&
      msg.amount <= cap &&
      // Someone else's damage needs the claimant to have done it, alive and in range.
      (msg.by < 0 ? target === shooter : msg.by === m.slot && shooter.alive && shooter.position.distanceTo(target.position) < 460);
    if (!ok) {
      this.refusedClaims++;
      return;
    }
    this.applying = true;
    this.game.hurt(target!, msg.amount, { by: msg.by >= 0 ? shooter! : null, cause, weapon: msg.w || undefined, headshot: msg.head, dir: new Vector3(msg.dir[0], 0, msg.dir[1]) });
    this.applying = false;
    this.onChange();
  }

  // ---------------------------------------------------------------- rounds

  /** Host: start a round for everyone connected, around a start point. */
  startRound(start = 0): void {
    if (this.role !== 'host') return;
    const g = this.game;
    const where = FRIEND_STARTS[start] ?? FRIEND_STARTS[0]!;
    const playing = [...this.members.values()].filter((m) => !m.away).sort((a, b) => a.slot - b.slot);
    for (const m of this.members.values()) m.inRound = !m.away;
    for (const m of this.members.values()) if (m.away) this.remove(m.slot);
    this.round++;
    const spawns: Record<number, [number, number, number]> = {};
    // A ring about 7 m across, everyone facing the middle, so friends see each other at once. Only
    // spots level with the middle count: not a roof, an awning or the canal.
    const ground = (x: number, z: number): number => g.physics.groundHeight(x, 200, z, 400, g.world.field.heightAt(x, z));
    const mid = ground(where.x, where.z);
    const open: [number, number][] = [];
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      const x = where.x + Math.sin(a) * 3.5;
      const z = where.z + Math.cos(a) * 3.5;
      if (Math.abs(ground(x, z) - mid) < 0.5 && !g.world.field.isWater(x, z)) open.push([x, z]);
    }
    if (open.length === 0) open.push([where.x, where.z]);
    playing.forEach((m, i) => {
      const [x, z] = open[Math.floor((i * open.length) / playing.length)]!;
      // Facing the middle: yaw 0 looks toward -Z.
      spawns[m.slot] = [q(x), q(z), q(Math.atan2(x - where.x, z - where.z))];
    });
    this.info = { round: this.round, seed: g.options.seed + this.round * 7919, place: where.name, spawns, kit: KIT };
    this.send({ k: 'start', info: this.info });
    this.beginRound(this.info);
    this.sendRoster();
  }

  /** Everyone in `info` onto the map, armed, and the round under way. */
  private beginRound(info: RoundInfo, resume?: Extract<EventMsg, { k: 'resume' }>): void {
    const g = this.game;
    this.info = info;
    this.round = info.round;
    this.running = true;
    this.lastOver = null;
    const combatants: Character[] = [];
    const slots = Object.keys(info.spawns)
      .map(Number)
      .sort((a, b) => a - b);
    for (const slot of slots) {
      const [x, z, yaw] = info.spawns[slot]!;
      const mine = slot === this.slot;
      let c: Character;
      if (mine) {
        const at = resume?.at;
        c = g.startAt(at ? at[0] : x, at ? at[2] : z, at ? at[3] : yaw);
        if (at) c.teleport(at[0], at[1], at[2], at[3]);
        this.chars.set(slot, c);
      } else {
        c = this.charFor(slot, x, z, yaw);
        this.seatOut(c);
        const y = g.physics.groundHeight(x, 200, z, 400, g.world.field.heightAt(x, z)) + 0.05;
        c.teleport(x, y, z, yaw);
        c.state = 'normal';
        c.rig.root.visible = true;
        c.motor.setEnabled(true);
        this.body(slot).reset();
      }
      c.alive = true;
      c.health = c.maxHealth;
      c.armor = 0;
      c.sinceHurt = 99;
      c.sinceHurtBy = 99;
      g.combat.reset(c);
      for (const [item, count, tier] of info.kit) if (isItemId(item)) g.grant(c, item, count, tier);
      c.act.slot = 'rifle';
      c.cash = mine ? 300 : 0;
      combatants.push(c);
    }
    if (resume) {
      const me = g.player!;
      me.health = resume.hp;
      me.armor = resume.ar;
      if (!resume.alive) {
        me.alive = false;
        me.health = 0;
      }
      for (const slot of resume.dead) {
        const c = this.chars.get(slot);
        if (c) {
          c.alive = false;
          c.health = 0;
        }
      }
    }
    if (this.savedHurtScale === null && g.hurtScale) this.savedHurtScale = g.hurtScale;
    // Rivals go easier on each other than on the player; between friends every hit counts the same.
    g.hurtScale = null;
    g.match.authority = this.role === 'host';
    if (g.traffic) g.traffic.paused = true;
    g.match.startFriends(combatants, info.seed, info.round);
    // A body that was already down when we came back is not standing.
    for (const c of combatants) if (!c.alive) g.match.withdraw(c);
    g.camera.yaw = g.player!.facing;
    g.camera.pitch = -0.08;
    g.camera.snap();
    this.onChange();
  }

  /** The body that stands for another player here, made on first use. */
  private charFor(slot: number, x: number, z: number, yaw: number): Character {
    let c = this.chars.get(slot);
    if (!c) {
      const name = this.members.get(slot)?.name ?? `Friend ${slot}`;
      c = this.game.spawnCharacter(name, false, x, z, yaw, randomOutfit(new Rng(9973 + slot * 7717)));
      c.remote = true;
      this.chars.set(slot, c);
    }
    return c;
  }

  private body(slot: number): RemoteBody {
    let b = this.bodies.get(slot);
    if (!b) {
      b = new RemoteBody(slot);
      this.bodies.set(slot, b);
    }
    return b;
  }

  slotOf(c: Character): number {
    if (c === this.game.player) return this.slot;
    for (const [slot, ch] of this.chars) if (ch === c) return slot;
    return -1;
  }

  /** Stop playing this round here (back to the room panel) without leaving the room. */
  private leaveRound(): void {
    const g = this.game;
    g.match.stop();
    g.setPhase('menu');
  }

  // ---------------------------------------------------------------- the loop

  fixedUpdate(dt: number): void {
    const g = this.game;
    // Others' bodies, about 100 ms behind.
    for (const [slot, body] of this.bodies) {
      const c = this.chars.get(slot);
      if (c && c !== g.player && c.rig.root.visible) body.apply(c, g.vehicles);
    }
    this.releaseVehicles();
    // Ours, 20 times a second.
    this.stateClock += dt;
    if (this.running && this.stateClock >= 1 / STATE_HZ) {
      this.stateClock = 0;
      const msg = this.ownState();
      if (msg) this.send(msg);
    }
    if (this.role === 'host') {
      const t = now();
      for (const m of this.members.values()) {
        if (m.away && t - m.awaySince > AWAY_GRACE) {
          this.remove(m.slot);
          this.sendRoster();
          this.onChange();
        }
      }
    }
  }

  private ownState(): StateMsg | null {
    const g = this.game;
    const c = g.player;
    if (!c || this.slot < 0) return null;
    const m = c.motor;
    const v = c.vehicle;
    const msg: StateMsg = {
      k: 'st',
      slot: this.slot,
      t: q(now(), 1000),
      p: [q(m.position.x), q(m.position.y), q(m.position.z)],
      v: [q(m.velocity.x), q(m.velocity.y), q(m.velocity.z)],
      f: q(c.facing, 1000),
      ay: q(c.aimYaw, 1000),
      ap: q(c.aimPitch, 1000),
      m: Math.max(0, MODES.indexOf(m.mode)),
      c: m.crouched ? 1 : 0,
      w: c.loadout.current ?? '',
      a: q(c.aiming),
      veh: v ? g.vehicles.indexOf(v) : -1,
      seat: c.seat,
    };
    if (v && v.driver === c) {
      const b = v.body;
      const t = b.translation();
      const r = b.rotation();
      const lv = b.linvel();
      const av = b.angvel();
      msg.vb = [q(t.x), q(t.y), q(t.z), q(r.x, 1e4), q(r.y, 1e4), q(r.z, 1e4), q(r.w, 1e4), q(lv.x), q(lv.y), q(lv.z), q(av.x), q(av.y), q(av.z)];
    }
    return msg;
  }

  // ---------------------------------------------------------------- leaving

  /** Leave the room on purpose (the Leave button, or Title). */
  private leaving = false;

  leave(): void {
    this.leaving = true;
    if (this.role === 'guest') this.links.get(0)?.sendEvent({ k: 'leave' });
    // Give the goodbye a moment to go out before the socket closes.
    setTimeout(() => this.end(''), 150);
  }

  /** The room is over for this browser. */
  end(reason: string): void {
    if (this.ended) return;
    this.ended = true;
    this.message = reason;
    const g = this.game;
    for (const off of this.offs) off();
    this.offs.length = 0;
    for (const l of this.links.values()) l.close();
    this.links.clear();
    this.signal.close();
    g.removeSystem(this);
    g.hurtGate = null;
    g.roundHooks = null;
    g.match.authority = true;
    if (g.traffic) g.traffic.paused = false;
    if (this.savedHurtScale) g.hurtScale = this.savedHurtScale;
    for (const v of g.vehicles) if (v.remoteDriven) v.setRemoteDriven(false);
    for (const c of this.chars.values()) if (c !== g.player) this.park(c);
    this.running = false;
    if (g.phase === 'match' || g.phase === 'ended') {
      g.input.setWantLock(false);
      g.match.stop();
      g.setPhase('menu');
    }
    this.onEnd(reason);
    this.onChange();
  }

  /** What tests and the room panel read. */
  snapshot(): Record<string, unknown> {
    const g = this.game;
    return {
      role: this.role,
      room: this.room,
      slot: this.slot,
      link: this.room ? this.inviteLink : '',
      ended: this.ended,
      message: this.message,
      running: this.running,
      round: this.round,
      transports: this.transports,
      players: this.players,
      lastOver: this.lastOver,
      refusedClaims: this.refusedClaims,
      shotsSeen: g.combat.shotsSeen,
      bodies: [...this.chars.entries()]
        .filter(([, c]) => c !== g.player)
        .map(([slot, c]) => ({
          slot,
          name: c.name,
          x: c.position.x,
          y: c.position.y,
          z: c.position.z,
          visible: c.rig.root.visible,
          alive: c.alive,
          health: c.health,
          armor: c.armor,
          weapon: c.loadout.current,
          vehicle: c.vehicle ? g.vehicles.indexOf(c.vehicle) : -1,
          seat: c.seat,
          heard: this.bodies.get(slot)?.count ?? 0,
        })),
    };
  }
}
