import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Group,
  LatheGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  Vector2,
  Vector3,
} from 'three';
import type { Character } from '../character/character';
import type { Glide } from '../character/motor';
import { type CanopyState, canopyPose, type SkydiveState, skydivePose } from '../character/poses';
import { MATCH } from '../core/config';
import { clamp, clamp01, damp, lerp, yawFromDir } from '../core/math';
import { Rng } from '../core/rng';
import type { GameSystem } from '../core/system';
import type { Game } from '../game';
import type { CameraSubject } from './camera';

/** How far from the map centre the seaplane starts and ends its run, in metres. */
const RUN_HALF = 900;
/** The doors are open while the plane is this close to the map centre on both axes. */
const DOOR_BOX = 600;
/** Hips height above the feet: the point a flying body turns about. */
const HIPS = 0.95;
/** A fall faster than this hurts on landing, m/s. */
const SAFE_IMPACT = 15;

const FALL: Glide = { sink: 52, pull: 15, speed: 21, accel: 15 };
const FALL_DIVE: Glide = { sink: 68, pull: 18, speed: 30, accel: 15 };
const FALL_FLARE: Glide = { sink: 44, pull: 15, speed: 12, accel: 15 };
const CHUTE: Glide = { sink: 6.2, pull: 40, speed: 11.5, accel: 7 };
const CHUTE_FAST: Glide = { sink: 8.6, pull: 40, speed: 15, accel: 7 };
const CHUTE_BRAKE: Glide = { sink: 4.3, pull: 40, speed: 5.5, accel: 7 };

const X_AXIS = new Vector3(1, 0, 0);
const Y_AXIS = new Vector3(0, 1, 0);
const Z_AXIS = new Vector3(0, 0, 1);
const _q = new Quaternion();
const _q2 = new Quaternion();
const _v = new Vector3();

/** One body in the air, from the jump to the landing. */
interface Jumper {
  c: Character;
  canopy: Canopy | null;
  /** Seconds since the jump, and since the canopy opened. */
  air: number;
  open: number;
  glide: Glide;
  /** Smoothed pose inputs. */
  sky: SkydiveState;
  hang: CanopyState;
  /** Body pitch (0 upright, a quarter turn is belly to earth) and bank, radians. */
  pitch: number;
  bank: number;
  /** Where a bot is heading. The player steers by hand. */
  target: Vector3 | null;
  lastSpeed: number;
}

interface Rider {
  c: Character;
  /** Distance along the run at which a bot jumps. The player jumps by key, or at the end of the door window. */
  jumpAt: number;
  target: Vector3 | null;
}

function part(geometry: BufferGeometry, material: MeshStandardMaterial | MeshBasicMaterial, x: number, y: number, z: number): Mesh {
  const mesh = new Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

/** A solid of revolution lying along the Z axis, nose toward -Z. `profile` is [distance along, radius]. */
function hull(profile: [number, number][], segments = 18): BufferGeometry {
  const g = new LatheGeometry(
    profile.map(([y, r]) => new Vector2(r, y)),
    segments,
  );
  g.rotateX(-Math.PI / 2);
  return g;
}

/**
 * The seaplane that carries everyone over the bay: a high-wing single-engine floatplane.
 * Its nose points along -Z, like everything else that has a front.
 */
function buildSeaplane(): { group: Group; prop: Group } {
  const group = new Group();
  group.name = 'seaplane';
  // Matt paint: a glossy white hull under this sun blows out into the bloom.
  const white = new MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.78, metalness: 0 });
  const teal = new MeshStandardMaterial({ color: 0x15a7a0, roughness: 0.6, metalness: 0 });
  const coral = new MeshStandardMaterial({ color: 0xff6f52, roughness: 0.5 });
  const glass = new MeshStandardMaterial({ color: 0x10202c, roughness: 0.08, metalness: 0.6 });
  const dark = new MeshStandardMaterial({ color: 0x232a30, roughness: 0.6 });

  const body = part(
    hull([
      [-4.7, 0.05],
      [-4.2, 0.2],
      [-3.0, 0.36],
      [-1.5, 0.58],
      [0, 0.74],
      [1.3, 0.76],
      [2.15, 0.66],
    ]),
    white,
    0,
    0,
    0,
  );
  body.scale.set(0.9, 1.08, 1);
  group.add(body);
  const cowl = part(
    hull([
      [2.15, 0.66],
      [2.9, 0.58],
      [3.3, 0.46],
      [3.42, 0.3],
    ]),
    teal,
    0,
    0,
    0,
  );
  cowl.scale.set(0.9, 1.08, 1);
  group.add(cowl);
  group.add(
    part(
      hull(
        [
          [3.42, 0.2],
          [3.62, 0.14],
          [3.78, 0.02],
        ],
        12,
      ),
      dark,
      0,
      0,
      0,
    ),
  );
  // A coral cheat line down each side, and the cabin glass.
  for (const side of [-1, 1]) {
    group.add(part(new BoxGeometry(0.02, 0.12, 5.6), coral, side * 0.655, -0.02, -0.2));
    group.add(part(new BoxGeometry(0.03, 0.36, 1.9), glass, side * 0.66, 0.42, -0.75));
  }
  group.add(part(new BoxGeometry(1.12, 0.34, 0.06), glass, 0, 0.52, -1.95));

  // High wing with coloured tips.
  group.add(part(new BoxGeometry(10.4, 0.15, 1.72), white, 0, 0.98, -0.62));
  for (const side of [-1, 1]) {
    group.add(part(new BoxGeometry(0.75, 0.155, 1.72), teal, side * 5.55, 0.98, -0.62));
    const strut = part(new BoxGeometry(0.07, 0.07, 2.72), dark, side * 1.72, 0.1, -0.5);
    strut.rotation.set(Math.PI / 2, 0, side * 1.02);
    group.add(strut);
  }

  // Tail.
  group.add(part(new BoxGeometry(3.7, 0.08, 0.92), white, 0, 0.22, 4.1));
  const fin = part(new BoxGeometry(0.09, 1.4, 1.15), teal, 0, 0.82, 4.15);
  fin.rotation.x = -0.32;
  group.add(fin);

  // Twin floats under the cabin.
  const floatHull = hull(
    [
      [-3.1, 0.04],
      [-2.4, 0.26],
      [-0.6, 0.36],
      [1.6, 0.37],
      [2.7, 0.27],
      [3.3, 0.05],
    ],
    12,
  );
  for (const side of [-1, 1]) {
    const float = part(floatHull, white, side * 1.42, -1.82, -0.3);
    float.scale.set(1, 0.92, 1);
    group.add(float);
    group.add(part(new BoxGeometry(0.42, 0.06, 5.2), coral, side * 1.42, -2.13, -0.3));
    for (const z of [-1.3, 0.9]) {
      const leg = part(new BoxGeometry(0.07, 1.62, 0.12), dark, side * 1.02, -1.0, z);
      leg.rotation.z = side * -0.46;
      group.add(leg);
    }
  }
  group.add(part(new BoxGeometry(2.84, 0.06, 0.1), dark, 0, -1.56, -1.3));
  group.add(part(new BoxGeometry(2.84, 0.06, 0.1), dark, 0, -1.56, 0.9));

  // Propeller: two blades and the blur they make.
  const prop = new Group();
  prop.position.set(0, 0, -3.56);
  const blade = new BoxGeometry(0.17, 2.2, 0.04);
  prop.add(new Mesh(blade, dark));
  const disc = new Mesh(new CircleGeometry(1.1, 24), new MeshBasicMaterial({ color: 0x9aa7ad, transparent: true, opacity: 0.16, depthWrite: false, side: DoubleSide }));
  prop.add(disc);
  group.add(prop);
  return { group, prop };
}

/**
 * A ram-air parachute: a wing of fabric cells on a shallow arc, with its lines running down to two
 * risers at the origin of the group, which sits between the jumper's shoulders.
 */
class Canopy {
  readonly group = new Group();
  private readonly wing: Mesh;
  private readonly lines: LineSegments;
  private readonly fabric: MeshStandardMaterial;
  private readonly cord: LineBasicMaterial;

  constructor(a: Color, b: Color) {
    const cells = 9;
    const chordSteps = 5;
    const span = 0.6;
    const radius = 5.0;
    const chord = 2.5;
    const top = 5.1;
    const pos: number[] = [];
    const col: number[] = [];
    const white = new Color(0xf6f1e6);
    const surface = (u: number, v: number, upper: boolean, out: Vector3): Vector3 => {
      const phi = u * span;
      // Thick near the nose, tapering to the tail, like an aerofoil.
      const thick = 0.34 * Math.sqrt(Math.max(0, v)) * (1 - v) * 2.2;
      const r = radius + (upper ? thick : -thick * 0.25);
      return out.set(Math.sin(phi) * r, Math.cos(phi) * r - radius + top, (v - 0.36) * chord);
    };
    const p = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
    for (let i = 0; i < cells; i++) {
      const u0 = (i / cells) * 2 - 1;
      const u1 = ((i + 1) / cells) * 2 - 1;
      const colour = i === 0 || i === cells - 1 ? b : i % 2 === 0 ? a : white;
      for (const upper of [true, false]) {
        for (let k = 0; k < chordSteps; k++) {
          const v0 = k / chordSteps;
          const v1 = (k + 1) / chordSteps;
          surface(u0, v0, upper, p[0]!);
          surface(u1, v0, upper, p[1]!);
          surface(u1, v1, upper, p[2]!);
          surface(u0, v1, upper, p[3]!);
          for (const j of [0, 1, 2, 0, 2, 3]) {
            pos.push(p[j]!.x, p[j]!.y, p[j]!.z);
            const shade = upper ? 1 : 0.72;
            col.push(colour.r * shade, colour.g * shade, colour.b * shade);
          }
        }
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(col), 3));
    geometry.computeVertexNormals();
    this.fabric = new MeshStandardMaterial({ vertexColors: true, roughness: 0.82, side: DoubleSide, transparent: true });
    this.wing = new Mesh(geometry, this.fabric);
    this.wing.castShadow = true;
    this.wing.frustumCulled = false;
    this.group.add(this.wing);

    // Lines from the underside to the riser on their side.
    const line: number[] = [];
    for (let i = 0; i <= cells; i += 1) {
      const u = (i / cells) * 2 - 1;
      for (const v of [0.08, 0.62]) {
        surface(u, v, false, p[0]!);
        const side = u < -0.01 ? -1 : u > 0.01 ? 1 : 0;
        for (const s of side === 0 ? [-1, 1] : [side]) {
          line.push(p[0]!.x, p[0]!.y, p[0]!.z, s * 0.24, 0.12, v < 0.3 ? -0.05 : 0.06);
        }
      }
    }
    const lg = new BufferGeometry();
    lg.setAttribute('position', new BufferAttribute(new Float32Array(line), 3));
    this.cord = new LineBasicMaterial({ color: 0x1c2228, transparent: true, opacity: 0.75 });
    this.lines = new LineSegments(lg, this.cord);
    this.lines.frustumCulled = false;
    this.group.add(this.lines);
  }

  /** `open` runs 0 to 1 as the canopy inflates: a streamer first, then it spreads and snaps taut. */
  setOpen(open: number): void {
    const t = clamp01(open);
    const back = 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
    const spread = clamp(back, 0.06, 1.08);
    this.group.scale.set(lerp(0.1, 1, spread), lerp(0.55, 1, t), lerp(0.25, 1, spread));
  }

  setFade(alpha: number): void {
    this.fabric.opacity = alpha;
    this.cord.opacity = 0.75 * alpha;
  }

  dispose(): void {
    this.group.removeFromParent();
    this.wing.geometry.dispose();
    this.lines.geometry.dispose();
    this.fabric.dispose();
    this.cord.dispose();
  }
}

/** A canopy that has done its job: it sinks behind the jumper and fades. */
interface Spent {
  canopy: Canopy;
  age: number;
  fall: number;
}

/**
 * The opening of a match: a seaplane crosses the bay with everyone aboard, they jump, steer through
 * freefall, open a parachute (by hand, or by itself near the ground) and land on streets, roofs or water.
 */
export class Drop implements GameSystem {
  readonly plane: Group;
  private readonly prop: Group;
  /** True from take-off until the seaplane has left the map. */
  flying = false;
  /** Whether the doors are open: riders may jump. */
  doorOpen = false;
  /** Metres flown along the run. */
  travelled = 0;
  readonly start = new Vector3();
  readonly dir = new Vector3(0, 0, -1);
  readonly planePos = new Vector3();
  private readonly planePrev = new Vector3();
  private yaw = 0;
  private readonly riders: Rider[] = [];
  private readonly jumpers = new Map<Character, Jumper>();
  private readonly spent: Spent[] = [];
  private readonly subject: CameraSubject;
  private readonly subjectPos = new Vector3();
  private time = 0;

  constructor(private readonly game: Game) {
    const built = buildSeaplane();
    this.plane = built.group;
    this.prop = built.prop;
    this.plane.visible = false;
    game.engine.scene.add(this.plane);
    this.subject = { position: this.subjectPos, height: 2.2, distance: 17, shoulder: 0, aim: 0, fovKick: 0, followRate: 40 };
  }

  /** Put everyone aboard and start the run. The route is drawn from the seed. */
  begin(riders: Character[], seed: number): void {
    this.clear();
    const rng = new Rng(seed ^ 0x5eed);
    const heading = rng.range(0, Math.PI * 2);
    const cx = rng.range(-150, 110);
    const cz = rng.range(-150, 150);
    this.dir.set(Math.cos(heading), 0, Math.sin(heading));
    this.start.set(cx - this.dir.x * RUN_HALF, MATCH.planeAltitude, cz - this.dir.z * RUN_HALF);
    this.yaw = yawFromDir(this.dir.x, this.dir.z);
    this.travelled = 0;
    this.flying = true;
    this.doorOpen = false;
    this.planePos.copy(this.start);
    this.planePrev.copy(this.start);
    this.plane.visible = true;
    const pois = this.game.world.layout.pois;
    for (const c of riders) {
      c.vehicle?.exit(c);
      c.state = 'plane';
      c.rig.root.visible = false;
      c.motor.setEnabled(false);
      c.motor.velocity.set(0, 0, 0);
      c.motor.teleport(this.start.x, this.start.y, this.start.z);
      c.visual.copy(this.start);
      c.facing = this.yaw;
      c.input.jump = false;
      // Bots pick a place to land and a moment to jump that gets them there.
      let target: Vector3 | null = null;
      let jumpAt = Infinity;
      if (!c.isPlayer && pois.length > 0) {
        const poi = pois[rng.int(0, pois.length - 1)]!;
        const r = poi.r * 0.6 * Math.sqrt(rng.next());
        const a = rng.range(0, Math.PI * 2);
        target = new Vector3(poi.x + Math.cos(a) * r, 0, poi.z + Math.sin(a) * r);
        // The closest point of the run to the target, a little early, with some spread.
        const along = (target.x - this.start.x) * this.dir.x + (target.z - this.start.z) * this.dir.z;
        jumpAt = along - rng.range(20, 160);
      }
      this.riders.push({ c, jumpAt, target });
    }
    this.frame(0, 1);
  }

  /** Is this character still in the drop (aboard, falling or under canopy)? */
  has(c: Character): boolean {
    return c.state === 'plane' || this.jumpers.has(c);
  }

  /** Height above whatever is below: ground, roof or water. */
  altitude(c: Character): number {
    const p = c.motor.position;
    const ground = this.game.physics.groundHeight(p.x, p.y + 0.6, p.z, 600, -100);
    return p.y - Math.max(ground, this.game.env.waterHeight(p.x, p.z));
  }

  /** Jump out of the seaplane. Returns false when this character is not aboard or the doors are shut. */
  jump(c: Character): boolean {
    const i = this.riders.findIndex((r) => r.c === c);
    if (i < 0 || !this.doorOpen) return false;
    const rider = this.riders[i]!;
    this.riders.splice(i, 1);
    const p = this.planePos;
    // Out of the door on the right side, below the float.
    const side = this.riders.length % 2 === 0 ? 1 : -1;
    const x = p.x + this.dir.z * -side * 1.6;
    const z = p.z + this.dir.x * side * 1.6;
    this.launch(c, x, p.y - 2.6, z, rider.target);
    c.motor.velocity.set(this.dir.x * MATCH.planeSpeed * 0.5, -3, this.dir.z * MATCH.planeSpeed * 0.5);
    return true;
  }

  /** Put a character into freefall at a point, with no seaplane involved. */
  skydive(c: Character, x: number, y: number, z: number): void {
    this.release(c);
    c.vehicle?.exit(c);
    this.launch(c, x, y, z, null);
  }

  private launch(c: Character, x: number, y: number, z: number, target: Vector3 | null): void {
    const sky: SkydiveState = { dive: 0, steer: 0, time: this.time + c.id * 1.7 };
    const hang: CanopyState = { steer: 0, brake: 0, swing: 0, time: this.time + c.id * 2.3 };
    const j: Jumper = { c, canopy: null, air: 0, open: 0, glide: { ...FALL }, sky, hang, pitch: 1.2, bank: 0, target, lastSpeed: 0 };
    this.jumpers.set(c, j);
    c.state = 'freefall';
    c.rig.root.visible = true;
    c.motor.setEnabled(true);
    c.motor.teleport(x, y, z);
    c.motor.glide = j.glide;
    c.visual.set(x, y, z);
    c.input.jump = false;
    c.anim.poseClip = 'Jump_Loop';
    c.anim.rootQuat = c.seatQuat;
    c.anim.poseFn = (rig) => {
      if (c.state === 'chute') canopyPose(rig, j.hang);
      else skydivePose(rig, j.sky);
    };
    this.orient(j);
    c.anim.reset();
  }

  /** Open the parachute. Returns false when it is already open or the character is not falling. */
  deploy(c: Character): boolean {
    const j = this.jumpers.get(c);
    if (!j || c.state !== 'freefall') return false;
    c.state = 'chute';
    j.open = 0;
    const outfit = c.rig.outfit;
    j.canopy = new Canopy(outfit.shirt, outfit.accent);
    j.canopy.setOpen(0);
    this.game.engine.scene.add(j.canopy.group);
    this.game.sound('chute_open', c.motor.position);
    return true;
  }

  /** Take a character out of the drop and hand them back to normal movement where they are. */
  release(c: Character): void {
    const i = this.riders.findIndex((r) => r.c === c);
    if (i >= 0) this.riders.splice(i, 1);
    const j = this.jumpers.get(c);
    if (j) {
      this.jumpers.delete(c);
      if (j.canopy) this.spent.push({ canopy: j.canopy, age: 0, fall: 0 });
    }
    if (c.state === 'plane' || c.state === 'freefall' || c.state === 'chute') c.state = 'normal';
    c.rig.root.visible = true;
    c.motor.glide = null;
    c.motor.setEnabled(true);
    c.anim.poseFn = null;
    c.anim.poseClip = null;
    c.anim.rootQuat = null;
    c.anim.rootOffset.set(0, 0, 0);
    if (c.isPlayer && this.game.controller) {
      this.game.controller.subjectOverride = null;
      this.game.controller.promptOverride = '';
    }
  }

  /** End the drop for everyone and put the seaplane away. */
  clear(): void {
    while (this.riders.length > 0) this.release(this.riders[0]!.c);
    // Deleting from a Map while iterating it is safe.
    for (const j of this.jumpers.values()) this.release(j.c);
    for (const s of this.spent) s.canopy.dispose();
    this.spent.length = 0;
    this.flying = false;
    this.doorOpen = false;
    this.plane.visible = false;
  }

  fixedUpdate(dt: number): void {
    this.time += dt;
    if (this.flying) {
      this.planePrev.copy(this.planePos);
      this.travelled += MATCH.planeSpeed * dt;
      this.planePos.copy(this.start).addScaledVector(this.dir, this.travelled);
      const p = this.planePos;
      const inside = Math.abs(p.x) < DOOR_BOX && Math.abs(p.z) < DOOR_BOX;
      const past = this.travelled > RUN_HALF;
      this.doorOpen = inside;
      for (let i = this.riders.length - 1; i >= 0; i--) {
        const r = this.riders[i]!;
        const c = r.c;
        c.motor.place(p.x, p.y, p.z);
        c.visual.copy(p);
        c.facing = this.yaw;
        const wants = c.input.jump || this.travelled >= r.jumpAt;
        c.input.jump = false;
        // Nobody rides the seaplane home: the last of the door window puts everyone out.
        if (inside ? wants : past) {
          this.doorOpen = true;
          this.jump(c);
        }
      }
      this.doorOpen = inside;
      if (this.travelled > RUN_HALF * 2) {
        this.flying = false;
        this.plane.visible = false;
      }
    }

    for (const j of this.jumpers.values()) {
      const c = j.c;
      const m = c.motor;
      j.air += dt;
      const input = c.input;
      if (j.target) this.autopilot(j);
      // How much of the stick points the way the body faces: forward dives or speeds up, back flares.
      const fx = -Math.sin(c.facing);
      const fz = -Math.cos(c.facing);
      const ahead = input.moveX * fx + input.moveZ * fz;
      const alt = this.altitude(c);
      if (c.state === 'freefall') {
        const g = ahead > 0.5 ? FALL_DIVE : ahead < -0.5 ? FALL_FLARE : FALL;
        Object.assign(j.glide, g);
        const wantsOpen = input.jump && j.air > 0.5;
        // The parachute opens by itself with room to stop: higher up the faster the fall.
        if (wantsOpen || alt < Math.max(MATCH.autoDeployHeight, -m.velocity.y * 1.7)) this.deploy(c);
      } else {
        j.open = Math.min(1, j.open + dt / 0.9);
        const g = ahead > 0.5 ? CHUTE_FAST : ahead < -0.5 ? CHUTE_BRAKE : CHUTE;
        Object.assign(j.glide, g);
        // The canopy takes a moment to bite: the fall slows as it fills.
        j.glide.pull = lerp(6, g.pull, j.open * j.open);
        j.glide.speed = lerp(m.speed, g.speed, j.open);
      }
      input.jump = false;
    }
  }

  /** A bot steers for its landing spot and opens early enough to glide the rest of the way. */
  private autopilot(j: Jumper): void {
    const c = j.c;
    const p = c.motor.position;
    const t = j.target!;
    const dx = t.x - p.x;
    const dz = t.z - p.z;
    const d = Math.hypot(dx, dz);
    const input = c.input;
    if (d > 4) {
      input.moveX = dx / d;
      input.moveZ = dz / d;
      c.aimYaw = yawFromDir(dx, dz);
    } else {
      input.moveX = 0;
      input.moveZ = 0;
    }
    if (c.state === 'freefall' && j.air > 0.8) {
      // Freefall covers little ground; a canopy covers about two metres for each one it sinks.
      const need = (d - 25) / 1.7;
      if (this.altitude(c) < Math.min(260, need)) input.jump = true;
    }
  }

  postPhysics(_dt: number): void {
    for (const j of this.jumpers.values()) {
      const c = j.c;
      const m = c.motor;
      if (!m.grounded && !m.swimming) continue;
      const impact = Math.max(m.landed, m.swimming ? 0 : -m.velocity.y);
      this.release(c);
      c.anim.land(Math.max(3, impact));
      if (impact > SAFE_IMPACT && !m.swimming) this.game.hurt(c, (impact - SAFE_IMPACT) * 4, { by: null, cause: 'fall' });
      this.game.sound(m.swimming ? 'splash' : 'land', m.position);
      this.game.events.emit('landed', { who: c, water: m.swimming });
    }
  }

  /** Full orientation of a flying body, and the offset that makes it turn about the hips. */
  private orient(j: Jumper): void {
    const c = j.c;
    _q.setFromAxisAngle(Y_AXIS, c.facing);
    _q.multiply(_q2.setFromAxisAngle(Z_AXIS, j.bank));
    _q.multiply(_q2.setFromAxisAngle(X_AXIS, -j.pitch));
    c.seatQuat.copy(_q);
    _v.set(0, HIPS, 0).applyQuaternion(_q);
    c.anim.rootOffset.set(-_v.x, HIPS - _v.y, -_v.z);
  }

  frameUpdate(dt: number, alpha: number): void {
    this.frame(dt, alpha);
  }

  private frame(dt: number, alpha: number): void {
    const game = this.game;
    if (this.flying) {
      const plane = this.plane;
      plane.position.lerpVectors(this.planePrev, this.planePos, alpha);
      // A gentle float on the air, so it does not look like it is on rails.
      const t = this.time;
      plane.position.y += Math.sin(t * 0.7) * 0.5;
      plane.rotation.set(Math.sin(t * 0.5) * 0.02, this.yaw, Math.sin(t * 0.43) * 0.05, 'YXZ');
      this.prop.rotation.z += dt * 46;
    }

    for (const j of this.jumpers.values()) {
      const c = j.c;
      const m = c.motor;
      const input = c.input;
      // Stick relative to the body: ahead and to its left.
      const fx = -Math.sin(c.facing);
      const fz = -Math.cos(c.facing);
      const ahead = input.moveX * fx + input.moveZ * fz;
      const left = -(input.moveX * -fz + input.moveZ * fx);
      const falling = c.state === 'freefall';
      if (falling) {
        j.sky.time += dt;
        j.sky.dive = damp(j.sky.dive, clamp01(ahead), 3.5, dt);
        j.sky.steer = damp(j.sky.steer, left, 5, dt);
        // Belly to earth, tipping head-down in a dive and head-up in a flare.
        const want = 1.36 + 0.5 * j.sky.dive - 0.22 * clamp01(-ahead);
        j.pitch = damp(j.pitch, want, 4, dt);
        j.bank = damp(j.bank, left * 0.42, 4, dt);
      } else {
        j.hang.time += dt;
        j.hang.steer = damp(j.hang.steer, left, 5, dt);
        j.hang.brake = damp(j.hang.brake, clamp01(-ahead), 5, dt);
        const speed = m.speed;
        const accel = dt > 0 ? (speed - j.lastSpeed) / dt : 0;
        j.lastSpeed = speed;
        j.hang.swing = damp(j.hang.swing, clamp(accel / 9, -1, 1), 3, dt);
        // The body swings upright under the canopy as it opens, then hangs with a little pendulum.
        // Slowing down swings the feet ahead of the canopy, speeding up leaves them behind.
        const want = 0.05 + Math.sin(j.hang.time * 1.15) * 0.035 + j.hang.swing * 0.12;
        j.pitch = damp(j.pitch, want, lerp(2.4, 6, j.open), dt);
        j.bank = damp(j.bank, left * 0.3 + Math.sin(j.hang.time * 0.9) * 0.03, 3, dt);
      }
      this.orient(j);
      if (j.canopy) {
        const g = j.canopy.group;
        // The risers meet the harness at the shoulders.
        _v.set(0, 1.45 - HIPS, 0).applyQuaternion(c.seatQuat);
        g.position.set(c.visual.x + _v.x, c.visual.y + HIPS + _v.y, c.visual.z + _v.z);
        // The wing stays overhead: it follows a fraction of the body's swing.
        _q.setFromAxisAngle(Y_AXIS, c.facing);
        _q.multiply(_q2.setFromAxisAngle(Z_AXIS, j.bank * 0.55));
        _q.multiply(_q2.setFromAxisAngle(X_AXIS, -0.12 - j.hang.brake * 0.14));
        g.quaternion.copy(_q);
        j.canopy.setOpen(j.open);
      }
    }

    for (let i = this.spent.length - 1; i >= 0; i--) {
      const s = this.spent[i]!;
      s.age += dt;
      s.fall += dt * 3.2;
      const g = s.canopy.group;
      g.position.y -= s.fall * dt;
      g.rotation.x -= dt * 0.9;
      g.scale.y = Math.max(0.2, g.scale.y - dt * 0.5);
      s.canopy.setFade(clamp01(1 - s.age / 1.6));
      if (s.age > 1.6) {
        s.canopy.dispose();
        this.spent.splice(i, 1);
      }
    }

    // What the player's camera frames, and the word beside the action key.
    const player = game.player;
    const controller = game.controller;
    if (!player || !controller) return;
    if (player.state === 'plane') {
      this.subjectPos.copy(this.plane.position);
      this.subject.height = 2.2;
      this.subject.distance = 17;
      this.subject.fovKick = 0;
      controller.subjectOverride = this.subject;
      controller.promptOverride = this.doorOpen ? 'Jump' : '';
    } else if (this.jumpers.has(player)) {
      const j = this.jumpers.get(player)!;
      const falling = player.state === 'freefall';
      this.subjectPos.copy(player.visual);
      this.subject.height = damp(this.subject.height, falling ? 1.0 : 2.3, 3, dt);
      this.subject.distance = damp(this.subject.distance, falling ? 7 : 10.5, falling ? 5 : 2.5, dt);
      this.subject.fovKick = damp(this.subject.fovKick, falling ? 6 + 8 * j.sky.dive : 0, 3, dt);
      controller.subjectOverride = this.subject;
      controller.promptOverride = falling ? 'Open parachute' : '';
    }
  }

  dispose(): void {
    this.clear();
    this.plane.removeFromParent();
  }
}
