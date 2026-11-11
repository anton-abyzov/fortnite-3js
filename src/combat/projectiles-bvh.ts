import * as THREE from 'three';
import type { WeaponSpec } from '../types/game';
import type { PhysicsWorld } from '../world/physics-world';

export interface DamageableTarget {
  id: string;
  position: THREE.Vector3;
  radius: number;
  height: number;
  alive: boolean;
  applyDamage(amount: number, hitPoint: THREE.Vector3, attackerId: string): boolean;
}

interface TracerBeam {
  mesh: THREE.Mesh;
  ttl: number;
  maxTtl: number;
}

interface ImpactSpark {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  ttl: number;
}

/**
 * Ray-capsule intersection test for fast, exact torso vs headshot ballistic checks.
 */
function intersectRayVerticalCylinder(
  origin: THREE.Vector3,
  dir: THREE.Vector3,
  basePos: THREE.Vector3,
  radius: number,
  height: number,
  maxDist: number,
): { distance: number; point: THREE.Vector3; headshot: boolean } | null {
  const ox = origin.x - basePos.x;
  const oz = origin.z - basePos.z;
  const a = dir.x * dir.x + dir.z * dir.z;

  if (a < 1e-6) {
    if (ox * ox + oz * oz > radius * radius || Math.abs(dir.y) < 1e-6) return null;
    const tTop = (basePos.y + height - origin.y) / dir.y;
    const tBot = (basePos.y - origin.y) / dir.y;
    const t = Math.min(tTop, tBot);
    if (t < 0 || t > maxDist) return null;
    const point = origin.clone().addScaledVector(dir, t);
    return { distance: t, point, headshot: dir.y < 0 };
  }
  const b = 2 * (ox * dir.x + oz * dir.z);
  const c = ox * ox + oz * oz - radius * radius;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;

  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);
  const t = t1 >= 0 ? t1 : t2;

  if (t < 0 || t > maxDist) return null;
  const hitY = origin.y + dir.y * t;
  if (hitY < basePos.y || hitY > basePos.y + height) return null;

  const point = origin.clone().addScaledVector(dir, t);
  const headshot = hitY >= basePos.y + height * 0.76;
  return { distance: t, point, headshot };
}

export class BallisticsSystem {
  private readonly tracers: TracerBeam[] = [];
  private readonly sparks: ImpactSpark[] = [];
  private readonly sparkGeo = new THREE.SphereGeometry(0.055, 6, 6);

  constructor(private readonly scene: THREE.Scene) {}

  fireWeaponShot(
    attackerId: string,
    muzzleOrigin: THREE.Vector3,
    aimOrigin: THREE.Vector3,
    aimDir: THREE.Vector3,
    spec: WeaponSpec,
    physics: PhysicsWorld,
    targets: readonly DamageableTarget[],
  ): { hitTarget: boolean; eliminatedTarget: boolean; headshot: boolean } {
    let hitTarget = false;
    let eliminatedTarget = false;
    let headshot = false;

    const upRef = Math.abs(aimDir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(aimDir, upRef).normalize();
    const up = new THREE.Vector3().crossVectors(right, aimDir).normalize();

    for (let p = 0; p < spec.pellets; p++) {
      const spreadAngle = Math.random() * Math.PI * 2;
      const spreadMag = (Math.random() * 0.75 + 0.25) * spec.spreadRad;
      const shotDir = aimDir
        .clone()
        .addScaledVector(right, Math.cos(spreadAngle) * spreadMag)
        .addScaledVector(up, Math.sin(spreadAngle) * spreadMag)
        .normalize();

      // 1. World geometry / physics collider raycast
      const worldHit = physics.raycast(aimOrigin, shotDir, spec.range);
      let closestDist = worldHit ? worldHit.distance : spec.range;
      let endPoint = worldHit
        ? worldHit.point.clone()
        : aimOrigin.clone().addScaledVector(shotDir, spec.range);

      // 2. Character target capsule check
      let bestTarget: {
        target: DamageableTarget;
        dist: number;
        point: THREE.Vector3;
        headshot: boolean;
      } | null = null;

      for (const tgt of targets) {
        if (!tgt.alive || tgt.id === attackerId) continue;
        const hit = intersectRayVerticalCylinder(
          aimOrigin,
          shotDir,
          tgt.position,
          tgt.radius,
          tgt.height,
          closestDist,
        );
        if (hit && (!bestTarget || hit.distance < bestTarget.dist)) {
          bestTarget = {
            target: tgt,
            dist: hit.distance,
            point: hit.point,
            headshot: hit.headshot,
          };
        }
      }

      if (bestTarget) {
        hitTarget = true;
        endPoint = bestTarget.point;
        const dmg = Math.round(spec.damage * (bestTarget.headshot ? 1.6 : 1.0));
        if (bestTarget.headshot) headshot = true;
        const killed = bestTarget.target.applyDamage(dmg, bestTarget.point, attackerId);
        if (killed) eliminatedTarget = true;
        this.spawnImpactSparks(endPoint, 0xff5e4d, 5);
      } else if (worldHit) {
        this.spawnImpactSparks(endPoint, 0xffe4a0, 3);
      }

      this.spawnTracerBeam(muzzleOrigin, endPoint, spec.colorHex);
    }

    return { hitTarget, eliminatedTarget, headshot };
  }

  private spawnTracerBeam(start: THREE.Vector3, end: THREE.Vector3, colorHex: number): void {
    const delta = end.clone().sub(start);
    const len = delta.length();
    if (len < 0.35) return;

    const beamLen = Math.min(len, 28);
    const mid = start.clone().addScaledVector(delta.normalize(), Math.min(len * 0.5, 16));
    const geo = new THREE.CylinderGeometry(0.016, 0.016, beamLen, 5);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.85,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    this.scene.add(mesh);
    this.tracers.push({ mesh, ttl: 0.085, maxTtl: 0.085 });
  }

  private spawnImpactSparks(pos: THREE.Vector3, colorHex: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      const mesh = new THREE.Mesh(this.sparkGeo, mat);
      mesh.position.copy(pos);
      this.scene.add(mesh);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 7,
        Math.random() * 5 + 1.5,
        (Math.random() - 0.5) * 7,
      );
      this.sparks.push({ mesh, vel, ttl: 0.24 });
    }
  }

  update(dt: number): void {
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const tr = this.tracers[i];
      tr.ttl -= dt;
      if (tr.ttl <= 0) {
        this.scene.remove(tr.mesh);
        tr.mesh.geometry.dispose();
        (tr.mesh.material as THREE.Material).dispose();
        this.tracers.splice(i, 1);
      } else {
        (tr.mesh.material as THREE.MeshBasicMaterial).opacity = (tr.ttl / tr.maxTtl) * 0.85;
      }
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.ttl -= dt;
      if (sp.ttl <= 0) {
        this.scene.remove(sp.mesh);
        (sp.mesh.material as THREE.Material).dispose();
        this.sparks.splice(i, 1);
      } else {
        sp.vel.y -= 14 * dt;
        sp.mesh.position.addScaledVector(sp.vel, dt);
      }
    }
  }
}
