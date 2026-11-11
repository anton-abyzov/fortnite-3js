import RAPIER from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';
import { CG, FIXED_DT, GRAVITY } from '../core/config';

export { RAPIER };

export type Surface = 'asphalt' | 'concrete' | 'sand' | 'grass' | 'wood' | 'metal' | 'tile' | 'water' | 'flesh' | 'glass';

/** What a collider belongs to. Looked up after raycasts and contacts. */
export interface ColliderOwner {
  kind: 'world' | 'character' | 'vehicle' | 'prop' | 'door' | 'loot' | 'glass' | 'sensor';
  surface?: Surface;
  /** The game object (Character, Car, Boat, ...). */
  ref?: unknown;
}

export interface RayHit {
  point: Vector3;
  normal: Vector3;
  distance: number;
  collider: RAPIER.Collider;
  owner: ColliderOwner | undefined;
}

const WORLD_OWNER: ColliderOwner = { kind: 'world', surface: 'concrete' };

export class Physics {
  readonly world: RAPIER.World;
  readonly events: RAPIER.EventQueue;
  private owners = new Map<number, ColliderOwner>();
  private ray = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
  private hit: RayHit = {
    point: new Vector3(),
    normal: new Vector3(),
    distance: 0,
    collider: null as unknown as RAPIER.Collider,
    owner: undefined,
  };

  private constructor() {
    this.world = new RAPIER.World({ x: 0, y: -GRAVITY, z: 0 });
    this.world.timestep = FIXED_DT;
    this.events = new RAPIER.EventQueue(true);
  }

  static async create(): Promise<Physics> {
    await RAPIER.init();
    return new Physics();
  }

  step(): void {
    this.world.step(this.events);
  }

  setOwner(collider: RAPIER.Collider, owner: ColliderOwner): void {
    this.owners.set(collider.handle, owner);
  }

  ownerOf(collider: RAPIER.Collider | null | undefined): ColliderOwner | undefined {
    return collider ? this.owners.get(collider.handle) : undefined;
  }

  removeCollider(collider: RAPIER.Collider): void {
    this.owners.delete(collider.handle);
    this.world.removeCollider(collider, false);
  }

  removeBody(body: RAPIER.RigidBody): void {
    for (let i = 0; i < body.numColliders(); i++) this.owners.delete(body.collider(i).handle);
    this.world.removeRigidBody(body);
  }

  /** Static axis-aligned or yaw-rotated box. Centre and half extents in metres. */
  addStaticBox(
    cx: number,
    cy: number,
    cz: number,
    hx: number,
    hy: number,
    hz: number,
    owner: ColliderOwner = WORLD_OWNER,
    yaw = 0,
    collisionGroups: number = CG.world,
  ): RAPIER.Collider {
    const desc = RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(cx, cy, cz).setCollisionGroups(collisionGroups);
    if (yaw !== 0) desc.setRotation({ x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) });
    const collider = this.world.createCollider(desc);
    this.owners.set(collider.handle, owner);
    return collider;
  }

  /** Static box with a full rotation, for ramps and bridge decks. */
  addStaticBoxQuat(
    cx: number,
    cy: number,
    cz: number,
    hx: number,
    hy: number,
    hz: number,
    q: { x: number; y: number; z: number; w: number },
    owner: ColliderOwner = WORLD_OWNER,
    collisionGroups: number = CG.world,
  ): RAPIER.Collider {
    const desc = RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(cx, cy, cz).setRotation(q).setCollisionGroups(collisionGroups);
    const collider = this.world.createCollider(desc);
    this.owners.set(collider.handle, owner);
    return collider;
  }

  addStaticCylinder(
    cx: number,
    cy: number,
    cz: number,
    halfHeight: number,
    radius: number,
    owner: ColliderOwner = WORLD_OWNER,
  ): RAPIER.Collider {
    const desc = RAPIER.ColliderDesc.cylinder(halfHeight, radius).setTranslation(cx, cy, cz).setCollisionGroups(CG.world);
    const collider = this.world.createCollider(desc);
    this.owners.set(collider.handle, owner);
    return collider;
  }

  addStaticTrimesh(vertices: Float32Array, indices: Uint32Array, owner: ColliderOwner = WORLD_OWNER): RAPIER.Collider {
    const desc = RAPIER.ColliderDesc.trimesh(vertices, indices).setCollisionGroups(CG.world);
    const collider = this.world.createCollider(desc);
    this.owners.set(collider.handle, owner);
    return collider;
  }

  /**
   * Closest hit along a ray. The returned object is reused by the next call, so copy what you keep.
   * `dir` must be normalised.
   */
  raycast(
    ox: number,
    oy: number,
    oz: number,
    dx: number,
    dy: number,
    dz: number,
    maxDist: number,
    queryGroups: number = CG.queryWorld,
    excludeBody?: RAPIER.RigidBody,
    excludeSensors = true,
  ): RayHit | null {
    const ray = this.ray;
    ray.origin.x = ox;
    ray.origin.y = oy;
    ray.origin.z = oz;
    ray.dir.x = dx;
    ray.dir.y = dy;
    ray.dir.z = dz;
    const flags = excludeSensors ? RAPIER.QueryFilterFlags.EXCLUDE_SENSORS : undefined;
    const res = this.world.castRayAndGetNormal(ray, maxDist, true, flags, queryGroups, undefined, excludeBody);
    if (!res) return null;
    const hit = this.hit;
    const t = res.timeOfImpact;
    hit.distance = t;
    hit.point.set(ox + dx * t, oy + dy * t, oz + dz * t);
    hit.normal.set(res.normal.x, res.normal.y, res.normal.z);
    hit.collider = res.collider;
    hit.owner = this.owners.get(res.collider.handle);
    return hit;
  }

  /** Height of the first solid surface below a point, or `fallback` when nothing is there. */
  groundHeight(x: number, y: number, z: number, maxDrop = 50, fallback = -Infinity): number {
    const hit = this.raycast(x, y, z, 0, -1, 0, maxDrop, CG.queryWorld);
    return hit ? hit.point.y : fallback;
  }

  /** True when nothing solid blocks the segment between two points. */
  lineOfSight(a: Vector3, b: Vector3, queryGroups: number = CG.queryWorld): boolean {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-4) return true;
    return this.raycast(a.x, a.y, a.z, dx / len, dy / len, dz / len, len - 0.05, queryGroups) === null;
  }
}
