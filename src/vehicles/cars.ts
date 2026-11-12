import { BoxGeometry, BufferGeometry, Color, Float32BufferAttribute, Mesh, type Object3D, SphereGeometry, Vector3 } from 'three';
import type { Character } from '../character/character';
import { CG, WORLD } from '../core/config';
import { Rng } from '../core/rng';
import type { GameSystem } from '../core/system';
import type { Game } from '../game';
import { RAPIER } from '../physics/physics';
import type { District, Layout } from '../world/layout';
import { Car } from './car';
import { buildCarKits, CarMaterials, type CarKit, type CarModel } from './carModels';
import { Traffic } from './traffic';

/** Somewhere a car can stand: a kerb bay, a bay in a parking lot, a corner of the port yard. */
interface Spot {
  x: number;
  z: number;
  yaw: number;
  district: District;
  /** Longest car that fits, metres. */
  room: number;
}

/** A car that is always there: the level's own placements, so some things can be counted on. */
interface FixedCar extends Spot {
  model: CarModel;
  paint: number;
}

const NORTH = 0;
const SOUTH = Math.PI;
const EAST = -Math.PI / 2;
const WEST = Math.PI / 2;

/** What each district drives, with weights. */
const TASTE: Record<District, readonly (readonly [CarModel, number])[]> = {
  heights: [['suv-luxury', 3], ['sedan-sports', 2], ['sedan', 2], ['suv', 2], ['hatchback-sports', 1]],
  deco: [['sedan', 3], ['hatchback-sports', 2], ['taxi', 2], ['sedan-sports', 2], ['suv', 1], ['police', 1]],
  mercado: [['sedan', 3], ['van', 2], ['truck', 2], ['taxi', 1], ['hatchback-sports', 1], ['delivery', 1]],
  franja: [['suv', 3], ['hatchback-sports', 2], ['sedan-sports', 2], ['van', 1], ['sedan', 1]],
  port: [['truck', 3], ['delivery', 3], ['van', 2]],
  garza: [['suv-luxury', 3], ['sedan-sports', 2], ['suv', 1]],
};

/** How many parked cars each district gets, on top of the fixed ones. */
const QUOTA: Record<District, number> = { heights: 8, deco: 10, mercado: 7, franja: 8, port: 4, garza: 3 };

/** Seconds after being hit by a car before the same person can be hit again. */
const THROWN = 0.9;

const NO_SPIN = { x: 0, y: 0, z: 0 };
const _hit = { x: 0, y: 0, z: 0 };

/**
 * Every car in the city: the parked ones, the traffic, and the rules between cars and people on foot
 * (cars and people do not collide in the physics, see D-15, so being run over is worked out here).
 */
export class Cars implements GameSystem {
  readonly all: Car[] = [];
  readonly kits: Record<CarModel, CarKit>;
  readonly materials = new CarMaterials();
  traffic!: Traffic;
  private readonly rng: Rng;
  /** People who have just been hit: seconds until they can be hit again, and the way they were thrown. */
  private readonly struck = new Map<Character, { left: number; vx: number; vz: number }>();
  private dummyGeometry: BufferGeometry[] = [];

  constructor(
    readonly game: Game,
    kits: Record<CarModel, CarKit>,
  ) {
    this.kits = kits;
    this.rng = new Rng(game.world.layout.seed + 707);
  }

  spawn(model: CarModel, x: number, z: number, yaw: number, paint?: number, traffic = false): Car {
    const kit = this.kits[model];
    const game = this.game;
    const y = game.physics.groundHeight(x, 40, z, 80, game.world.field.heightAt(x, z));
    const colour = paint ?? (kit.spec.paints.length > 0 ? this.rng.pick(kit.spec.paints) : 0xffffff);
    const car = new Car(game, kit, this.materials, { x, y, z, yaw, paint: colour, mode: traffic ? 'traffic' : 'dynamic' });
    this.all.push(car);
    return car;
  }

  byId(id: number): Car | undefined {
    return this.all.find((c) => c.id === id);
  }

  /** True when a car of this size would stand clear of buildings, lamps, palms and other cars. */
  private clear(kit: CarKit, x: number, y: number, z: number, yaw: number): boolean {
    const shape = new RAPIER.Cuboid(kit.width / 2 + 0.15, 0.5, kit.length / 2 + 0.2);
    const rot = { x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) };
    _hit.x = x;
    _hit.y = y + 0.95;
    _hit.z = z;
    return this.game.physics.world.intersectionWithShape(_hit, rot, shape, RAPIER.QueryFilterFlags.EXCLUDE_SENSORS, CG.querySolid) === null;
  }

  /** Park cars across the city: the fixed ones first, then a share of the free bays in each district. */
  parkAll(): void {
    const game = this.game;
    const layout = game.world.layout;
    const rng = this.rng;
    const taken: { x: number; z: number }[] = [];
    const free = (x: number, z: number): boolean => taken.every((t) => Math.hypot(t.x - x, t.z - z) > 5.6);
    const place = (model: CarModel, s: Spot, paint?: number): boolean => {
      const kit = this.kits[model];
      if (kit.length > s.room || !free(s.x, s.z)) return false;
      const y = game.physics.groundHeight(s.x, 40, s.z, 80, WORLD.streetY);
      if (!this.clear(kit, s.x, y, s.z, s.yaw)) return false;
      this.spawn(model, s.x, s.z, s.yaw, paint);
      taken.push({ x: s.x, z: s.z });
      return true;
    };
    for (const f of fixedCars(layout)) place(f.model, f, f.paint);
    const spots = parkingSpots(layout);
    for (const district of Object.keys(QUOTA) as District[]) {
      const here = rng.shuffle(spots.filter((s) => s.district === district));
      let left = QUOTA[district];
      for (const s of here) {
        if (left <= 0) break;
        // Try the district's taste a few times: a long truck does not fit every bay.
        for (let tries = 0; tries < 4; tries++) {
          if (place(rng.weighted(TASTE[district]), s)) {
            left--;
            break;
          }
        }
      }
    }
  }

  /** A head and shoulders for the driver's seat of a traffic car: enough to read through tinted glass. */
  makeDummy = (): Object3D => {
    if (this.dummyGeometry.length === 0) {
      const skins = [0xf1c9a5, 0xd9a47c, 0xa9714b, 0x6f4a33];
      const shirts = [0xe5443a, 0x2f7fd0, 0xf2efe6, 0x25b8a8, 0xf29a2e, 0x2b2f36];
      for (let i = 0; i < 6; i++) {
        const skin = new Color(skins[i % skins.length]!);
        const shirt = new Color(shirts[i % shirts.length]!);
        const parts: [BufferGeometry, Color][] = [];
        // Heights are above the seat's floor point, in the seated pose's proportions.
        const head = new SphereGeometry(0.115, 8, 6);
        head.translate(0, 1.27, 0.34);
        parts.push([head, skin]);
        const chest = new BoxGeometry(0.4, 0.52, 0.22);
        chest.translate(0, 0.86, 0.36);
        parts.push([chest, shirt]);
        for (const side of [-1, 1]) {
          const arm = new BoxGeometry(0.09, 0.09, 0.4);
          arm.rotateX(0.35);
          arm.translate(side * 0.2, 0.96, 0.17);
          parts.push([arm, shirt]);
        }
        const pos: number[] = [];
        const nor: number[] = [];
        const col: number[] = [];
        for (const [g, c] of parts) {
          const flat = g.toNonIndexed();
          const p = flat.getAttribute('position');
          const n = flat.getAttribute('normal');
          for (let k = 0; k < p.count; k++) {
            pos.push(p.getX(k), p.getY(k), p.getZ(k));
            nor.push(n.getX(k), n.getY(k), n.getZ(k));
            col.push(c.r, c.g, c.b);
          }
          g.dispose();
          flat.dispose();
        }
        const geo = new BufferGeometry();
        geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
        geo.setAttribute('normal', new Float32BufferAttribute(nor, 3));
        geo.setAttribute('color', new Float32BufferAttribute(col, 3));
        this.dummyGeometry.push(geo);
      }
    }
    return new Mesh(this.rng.pick(this.dummyGeometry), this.materials.wheel);
  };

  fixedUpdate(dt: number): void {
    for (const [c, hit] of this.struck) {
      hit.left -= dt;
      if (hit.left <= 0) {
        this.struck.delete(c);
        continue;
      }
      // Carry them clear of the car for the first part of the flight. Left to itself a body in the
      // air slows at once, the car catches it up, and it comes down on the bonnet.
      if (hit.left > THROWN - 0.45) {
        c.motor.velocity.x = hit.vx;
        c.motor.velocity.z = hit.vz;
        hit.vx *= 0.985;
        hit.vz *= 0.985;
      }
    }
    const people = this.game.characters;
    for (const car of this.all) {
      if (car.sleeping) continue;
      this.meetPeople(car, people);
    }
  }

  /**
   * A moving car against people on foot. Fast, it runs them down: they are hurt by the speed and
   * thrown. Slow, it cannot go through them: the car is stopped and the person is eased out of the way.
   */
  private meetPeople(car: Car, people: Character[]): void {
    const body = car.body;
    const t = body.translation();
    const kit = car.kit;
    const range = kit.length / 2 + 1.2;
    let lv: { x: number; y: number; z: number } | null = null;
    let av: { x: number; y: number; z: number } | null = null;
    let sin = 0;
    let cos = 0;
    for (const c of people) {
      if (!c.alive || c.vehicle || c.state !== 'normal') continue;
      const p = c.position;
      const dx = p.x - t.x;
      const dz = p.z - t.z;
      if (Math.abs(dx) > range || Math.abs(dz) > range) continue;
      // Feet above the bonnet line means standing on the car, not in front of it.
      if (p.y > t.y + kit.belt - 0.15 || p.y + 1.7 < t.y) continue;
      if (!lv) {
        sin = Math.sin(car.yaw);
        cos = Math.cos(car.yaw);
        if (car.mode === 'traffic') {
          // Carried along its lane, not simulated: its speed is what the traffic system gave it.
          lv = { x: -sin * car.trafficSpeed, y: 0, z: -cos * car.trafficSpeed };
          av = NO_SPIN;
        } else {
          lv = body.linvel();
          av = body.angvel();
        }
      }
      // The person in the car's frame: `side` to its right, `along` toward its tail.
      const side = dx * cos - dz * sin;
      const along = dx * sin + dz * cos;
      const hx = kit.width / 2 + 0.24;
      const z0 = kit.front - 0.24;
      const z1 = kit.rear + 0.24;
      if (Math.abs(side) > hx || along < z0 || along > z1) continue;
      // The nearest way out of the car's footprint, and which face that is.
      const outs = [hx - side, hx + side, along - z0, z1 - along];
      let face = 0;
      for (let i = 1; i < 4; i++) if (outs[i]! < outs[face]!) face = i;
      const ls = face === 0 ? 1 : face === 1 ? -1 : 0;
      const la = face === 2 ? -1 : face === 3 ? 1 : 0;
      const ox = ls * cos + la * sin;
      const oz = -ls * sin + la * cos;
      // How fast that face of the car is coming at them.
      const vx = lv.x + av!.y * dz - c.motor.velocity.x;
      const vz = lv.z - av!.y * dx - c.motor.velocity.z;
      const closing = vx * ox + vz * oz;
      if (closing > 4 && !this.struck.has(c)) {
        const speed = Math.hypot(lv.x, lv.z);
        this.game.hurt(c, Math.min(160, (closing - 2.5) * 5), { by: car.driver, cause: 'vehicle', dir: new Vector3(ox, 0, oz) });
        // Thrown ahead of the car and off to the side they were nearer, so the car does not meet them again.
        const away = side >= 0 ? 1 : -1;
        const vx = lv.x * 1.05 + ox * 3 + cos * away * 5;
        const vz = lv.z * 1.05 + oz * 3 - sin * away * 5;
        c.motor.velocity.set(vx, Math.min(7, 4.2 + speed * 0.1), vz);
        this.struck.set(c, { left: THROWN, vx, vz });
        if (car.mode === 'dynamic') body.applyImpulse({ x: -ox * 75 * closing * 0.5, y: 0, z: -oz * 75 * closing * 0.5 }, true);
        this.game.fx.burst('dust', p.x, p.y + 0.9, p.z, { dx: ox, dz: oz, amount: 0.6 });
      } else if (closing > 0.05 && closing <= 4) {
        // Too slow to hurt: the car stops against them, and they shuffle clear.
        if (car.mode === 'dynamic') body.applyImpulse({ x: -ox * kit.spec.mass * closing, y: 0, z: -oz * kit.spec.mass * closing }, true);
        else car.blocked = 0.4;
        // Off the bumper and toward the nearer side, so a car that keeps creeping does not herd them down the road.
        const away = side >= 0 ? 1 : -1;
        const bend = la !== 0 ? 0.8 : 0;
        let px = ox + cos * away * bend;
        let pz = oz - sin * away * bend;
        const pl = Math.hypot(px, pz);
        px /= pl;
        pz /= pl;
        const push = 1.8 + closing;
        const cur = c.motor.velocity.x * px + c.motor.velocity.z * pz;
        if (cur < push) {
          c.motor.velocity.x += px * (push - cur);
          c.motor.velocity.z += pz * (push - cur);
        }
      }
    }
  }

  frameUpdate(): void {
    this.materials.setNight(this.game.world.sky.night);
  }
}

function districtAt(layout: Layout, x: number, z: number): District | null {
  for (const isl of layout.islands) {
    const r = isl.rect;
    if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return isl.district;
  }
  const yard = layout.blocks.find((b) => b.kind === 'yard');
  if (yard && x >= yard.rect.x0 && x <= yard.rect.x1 && z >= yard.rect.z0 && z <= yard.rect.z1) return 'port';
  return null;
}

/** Cars the level always has: a fast one near where a round usually starts, and one on each quiet stretch. */
function fixedCars(layout: Layout): FixedCar[] {
  const out: FixedCar[] = [];
  const yard = layout.blocks.find((b) => b.kind === 'yard')?.rect;
  // On the open apron of the port yard, between the trucks and the sheds, pointing down its length.
  if (yard) out.push({ model: 'sedan-sports', paint: 0xe5443a, x: yard.x0 + 26, z: yard.z0 + 15, yaw: EAST, district: 'port', room: 9 });
  // On Isla Garza, by the kerb at the quiet end of the causeway street, with a clear run of pavement beside it.
  const garza = layout.islands.find((i) => i.id === 'garza');
  const causeway = garza?.streets.find((s) => s.w >= 18);
  if (garza && causeway) out.push({ model: 'hatchback-sports', paint: 0x25b8a8, x: garza.rect.x0 + 6, z: causeway.c + causeway.w / 2 - 1.25, yaw: EAST, district: 'garza', room: 9 });
  // In the first kerb bay of Calle Mango south of the avenue, a short walk from the plaza.
  const mango = layout.segments.find((s) => s.axis === 'z' && !s.bridge && !s.median && s.w >= 12 && Math.abs(s.c + 105) < 1 && s.a > 0 && s.a < 20);
  if (mango) out.push({ model: 'sedan-sports', paint: 0xf29a2e, x: mango.c + mango.w / 2 - 1.2, z: mango.a + 7, yaw: NORTH, district: 'deco', room: 6 });
  return out;
}

/** Every place a car may be left: marked kerb bays, parking lots, the port apron, Isla Garza's lanes. */
function parkingSpots(layout: Layout): Spot[] {
  const out: Spot[] = [];
  // Kerb bays are painted on plain roads 12 m wide or more, 6 m apart, starting 4 m from each end.
  for (const seg of layout.segments) {
    if (seg.bridge || seg.median || seg.w < 12) continue;
    const off = seg.w / 2 - 1.2;
    for (let a = seg.a + 4; a + 11.5 < seg.b - 4; a += 6) {
      const along = a + 3;
      for (const side of [-1, 1]) {
        const across = seg.c + side * off;
        const x = seg.axis === 'z' ? across : along;
        const z = seg.axis === 'z' ? along : across;
        // Right-hand traffic: the east side of a north-south road runs north, the south side of an east-west road runs east.
        const yaw = seg.axis === 'z' ? (side > 0 ? NORTH : SOUTH) : side > 0 ? EAST : WEST;
        const district = districtAt(layout, x, z);
        if (district) out.push({ x, z, yaw, district, room: 5.4 });
      }
    }
  }
  // Parking lots: two rows of bays 2.8 m wide and 4.8 m deep, nose to the edge of the lot.
  for (const lot of layout.lots) {
    if (lot.use !== 'parking') continue;
    const r = lot.rect;
    const alongX = r.x1 - r.x0 > r.z1 - r.z0;
    const lo = alongX ? r.x0 : r.z0;
    const n = Math.floor(((alongX ? r.x1 : r.z1) - lo) / 2.8);
    for (let i = 0; i < n; i++) {
      const along = lo + (i + 0.5) * 2.8;
      for (const row of [0, 1]) {
        const across = row === 0 ? (alongX ? r.z0 : r.x0) + 3 : (alongX ? r.z1 : r.x1) - 3;
        const x = alongX ? along : across;
        const z = alongX ? across : along;
        const yaw = alongX ? (row === 0 ? NORTH : SOUTH) : row === 0 ? WEST : EAST;
        out.push({ x, z, yaw, district: lot.district, room: 4.45 });
      }
    }
  }
  // The port: trucks along the top of the apron, nose to the road.
  const yard = layout.blocks.find((b) => b.kind === 'yard')?.rect;
  if (yard) for (let x = yard.x0 + 60; x < yard.x1 - 40; x += 23) out.push({ x, z: yard.z0 + 6.5, yaw: NORTH, district: 'port', room: 9 });
  // Islands with one avenue have side streets that lead nowhere: quiet kerbs to park at.
  for (const isl of layout.islands) {
    if (isl.avenues.length !== 1) continue;
    const av = isl.avenues[0]!;
    for (const st of isl.streets) {
      if (st.w >= 18) continue;
      const off = st.w / 2 - 1.2;
      for (const span of [
        [isl.rect.x0 + 8, av.c - av.w / 2 - 6],
        [av.c + av.w / 2 + 6, isl.rect.x1 - 8],
      ] as const) {
        for (let x = span[0] + 3; x + 3 < span[1]; x += 7) {
          out.push({ x, z: st.c + off, yaw: EAST, district: isl.district, room: 6 });
          out.push({ x, z: st.c - off, yaw: WEST, district: isl.district, room: 6 });
        }
      }
    }
  }
  return out;
}

/** Parked cars and traffic (T-07). Called once while the game loads, after the world exists. */
export async function installCars(game: Game): Promise<void> {
  const asset = await game.assets.loadModel('models/vehicles.glb');
  // Shape queries only see colliders after a step, and parking needs to know what is in the way.
  game.physics.step();
  const cars = new Cars(game, buildCarKits(asset));
  cars.parkAll();
  cars.traffic = new Traffic(game, cars);
  game.addSystem(cars);
  game.addSystem(cars.traffic);

  const plain = (c: Car): Record<string, unknown> => c.describe();
  game.debugExt.cars = {
    /** Every car that is not in the traffic stream right now. */
    parked: () => cars.all.filter((c) => c.mode !== 'traffic').map(plain),
    traffic: () => cars.traffic.describe(),
    state: (id: number) => {
      const c = cars.byId(id);
      if (!c) return null;
      return {
        ...c.describe(),
        rpm: c.rpm,
        gear: c.gear,
        slip: c.slip,
        suspension: [...c.suspension],
        contacts: c.wheelContacts,
        pitch: c.pitch,
        roll: c.roll,
        steer: c.steerAngle,
        braking: c.braking,
        flooded: c.flooded,
        lastImpact: c.lastImpact,
        maxHealth: c.maxHealth,
        length: c.kit.length,
        width: c.kit.width,
        peaks: { slip: c.peaks.slip, spread: c.peaks.spread, wheels: [...c.peaks.wheels] },
        seats: c.seats.map((s) => (s.occupant ? s.occupant.name : null)),
      };
    },
    nearestParked: (x: number, z: number, model?: string) => {
      let best: Car | null = null;
      let bestD = Infinity;
      for (const c of cars.all) {
        if (c.mode === 'traffic' || c.destroyed || c.occupied) continue;
        if (model && c.model !== model) continue;
        const t = c.body.translation();
        const d = Math.hypot(t.x - x, t.z - z);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      return best ? { ...plain(best), distance: bestD } : null;
    },
    /** Start the peak readings in `state(id).peaks` again from zero. */
    resetPeaks: (id: number) => cars.byId(id)?.resetPeaks(),
    /** The objects themselves, for probes. */
    all: cars.all,
    system: cars,
  };
}
