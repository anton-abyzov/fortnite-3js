import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import type { SurfaceMaterial } from '../types/game';

let rapierInitialized = false;

export async function ensureRapierLoaded(): Promise<typeof RAPIER> {
  if (!rapierInitialized) {
    await RAPIER.init();
    rapierInitialized = true;
  }
  return RAPIER;
}

export interface GroundHit {
  distance: number;
  point: THREE.Vector3;
  normal: THREE.Vector3;
  material: SurfaceMaterial;
  colliderHandle: number;
}

export interface DynamicPropSync {
  body: RAPIER.RigidBody;
  mesh: THREE.Object3D;
}

export class PhysicsWorld {
  public readonly world: RAPIER.World;
  public readonly rapier = RAPIER;

  private readonly colliderMaterials = new Map<number, SurfaceMaterial>();
  private readonly dynamicProps: DynamicPropSync[] = [];

  private constructor(world: RAPIER.World) {
    this.world = world;
  }

  static async create(): Promise<PhysicsWorld> {
    await ensureRapierLoaded();
    const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    return new PhysicsWorld(world);
  }

  addFixedBox(
    center: { x: number; y: number; z: number },
    halfExtents: { x: number; y: number; z: number },
    material: SurfaceMaterial = 'concrete',
    rotationEuler?: { x?: number; y?: number; z?: number },
    friction = 0.85,
  ): RAPIER.Collider {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
    if (rotationEuler) {
      const q = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rotationEuler.x ?? 0, rotationEuler.y ?? 0, rotationEuler.z ?? 0),
      );
      bodyDesc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    }
    const body = this.world.createRigidBody(bodyDesc);
    const colDesc = RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z)
      .setFriction(friction)
      .setRestitution(0.05);
    const collider = this.world.createCollider(colDesc, body);
    this.colliderMaterials.set(collider.handle, material);
    return collider;
  }

  addDynamicCrate(
    center: { x: number; y: number; z: number },
    halfExtents: { x: number; y: number; z: number },
    mesh: THREE.Object3D,
    mass = 18,
    material: SurfaceMaterial = 'wood',
  ): RAPIER.RigidBody {
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(center.x, center.y, center.z)
      .setLinearDamping(0.45)
      .setAngularDamping(0.65);
    const body = this.world.createRigidBody(bodyDesc);
    const colDesc = RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z)
      .setMass(mass)
      .setFriction(0.7)
      .setRestitution(0.18);
    const collider = this.world.createCollider(colDesc, body);
    this.colliderMaterials.set(collider.handle, material);
    this.dynamicProps.push({ body, mesh });
    return body;
  }

  registerMaterial(collider: RAPIER.Collider, material: SurfaceMaterial): void {
    this.colliderMaterials.set(collider.handle, material);
  }

  raycast(
    origin: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number },
    maxDistance: number,
    excludeBody?: RAPIER.RigidBody,
  ): GroundHit | null {
    const len = Math.hypot(direction.x, direction.y, direction.z);
    if (len < 1e-6) return null;
    const dir = { x: direction.x / len, y: direction.y / len, z: direction.z / len };
    const ray = new RAPIER.Ray(origin, dir);

    const hit = this.world.castRayAndGetNormal(
      ray,
      maxDistance,
      true,
      undefined,
      undefined,
      undefined,
      excludeBody,
    );
    if (!hit) return null;

    const dist = hit.timeOfImpact;
    const point = new THREE.Vector3(
      origin.x + dir.x * dist,
      origin.y + dir.y * dist,
      origin.z + dir.z * dist,
    );
    const normal = new THREE.Vector3(hit.normal.x, hit.normal.y, hit.normal.z).normalize();
    const material = this.colliderMaterials.get(hit.collider.handle) ?? 'concrete';

    return {
      distance: dist,
      point,
      normal,
      material,
      colliderHandle: hit.collider.handle,
    };
  }

  step(dt: number): void {
    this.world.timestep = Math.min(Math.max(dt, 1 / 240), 1 / 30);
    this.world.step();

    for (const prop of this.dynamicProps) {
      const t = prop.body.translation();
      const r = prop.body.rotation();
      prop.mesh.position.set(t.x, t.y, t.z);
      prop.mesh.quaternion.set(r.x, r.y, r.z, r.w);
    }
  }
}
