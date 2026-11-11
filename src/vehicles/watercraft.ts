import type RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import type { AssetLibrary } from '../assets/asset-loader';
import { clamp, damp } from '../core/math';
import { sampleWaterWave } from '../rendering/water-system';
import type { InputState, VehicleKind } from '../types/game';
import type { PhysicsWorld } from '../world/physics-world';

export class BuoyantWatercraft {
  public readonly id: string;
  public readonly kind: 'jetski' | 'speedboat';
  public readonly root = new THREE.Group();
  public readonly seatAnchor = new THREE.Group();
  public readonly body: RAPIER.RigidBody;

  public steerAngle = 0;
  public speedMps = 0;
  public inWater = true;

  private readonly mass: number;
  private readonly probes: THREE.Vector3[];
  private readonly wakeRibbon: THREE.Mesh;
  private readonly wakeMat: THREE.MeshBasicMaterial;

  constructor(
    id: string,
    kind: 'jetski' | 'speedboat',
    spawnPos: { x: number; y: number; z: number },
    spawnYaw: number,
    scene: THREE.Scene,
    physics: PhysicsWorld,
    assets: AssetLibrary,
  ) {
    this.id = id;
    this.kind = kind;
    this.mass = kind === 'jetski' ? 340 : 1180;

    this.root.name = `watercraft_${id}`;
    const hull = assets.instantiate(kind === 'jetski' ? 'miami_jetski' : 'miami_speedboat');
    this.root.add(hull);

    if (kind === 'jetski') {
      this.seatAnchor.position.set(0, 0.36, 0.18);
      this.probes = [
        new THREE.Vector3(0, -0.14, -1.25),
        new THREE.Vector3(-0.52, -0.16, -0.25),
        new THREE.Vector3(0.52, -0.16, -0.25),
        new THREE.Vector3(-0.5, -0.18, 1.15),
        new THREE.Vector3(0.5, -0.18, 1.15),
      ];
    } else {
      this.seatAnchor.position.set(0, 0.62, 0.28);
      this.probes = [
        new THREE.Vector3(0, -0.24, -3.2),
        new THREE.Vector3(-1.05, -0.28, -0.9),
        new THREE.Vector3(1.05, -0.28, -0.9),
        new THREE.Vector3(-1.05, -0.3, 2.85),
        new THREE.Vector3(1.05, -0.3, 2.85),
      ];
    }
    this.root.add(this.seatAnchor);

    // Whitewater stern wake / spray trail mesh
    this.wakeMat = new THREE.MeshBasicMaterial({
      color: 0xf1fbff,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const wakeLen = kind === 'jetski' ? 4.8 : 9.2;
    const wakeWidth = kind === 'jetski' ? 1.4 : 2.8;
    const wakeGeo = new THREE.PlaneGeometry(wakeWidth, wakeLen);
    wakeGeo.rotateX(-Math.PI * 0.5);
    this.wakeRibbon = new THREE.Mesh(wakeGeo, this.wakeMat);
    this.wakeRibbon.position.set(0, 0.05, (kind === 'jetski' ? 1.6 : 3.9) + wakeLen * 0.5);
    this.root.add(this.wakeRibbon);

    scene.add(this.root);

    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spawnYaw);
    const rbDesc = physics.rapier.RigidBodyDesc.dynamic()
      .setTranslation(spawnPos.x, spawnPos.y, spawnPos.z)
      .setRotation({ x: q.x, y: q.y, z: q.z, w: q.w })
      .setLinearDamping(0.55)
      .setAngularDamping(3.4);

    this.body = physics.world.createRigidBody(rbDesc);
    const halfX = kind === 'jetski' ? 0.58 : 1.18;
    const halfY = kind === 'jetski' ? 0.36 : 0.58;
    const halfZ = kind === 'jetski' ? 1.48 : 3.65;

    const colDesc = physics.rapier.ColliderDesc.cuboid(halfX, halfY, halfZ)
      .setTranslation(0, halfY * 0.55, 0)
      .setMass(this.mass)
      .setFriction(0.22)
      .setRestitution(0.12);
    const col = physics.world.createCollider(colDesc, this.body);
    physics.registerMaterial(col, 'metal');

    this.syncVisualsFromBody();
  }

  getKind(): VehicleKind {
    return this.kind;
  }

  getPosition(): THREE.Vector3 {
    return this.root.position;
  }

  getHeadingYaw(): number {
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(this.root.quaternion);
    return Math.atan2(-fwd.x, -fwd.z);
  }

  stepPhysics(dt: number, timeSec: number, driverInput: InputState | null): void {
    const safeDt = clamp(dt, 0.002, 0.035);
    const t = this.body.translation();
    const r = this.body.rotation();
    const hullQuat = new THREE.Quaternion(r.x, r.y, r.z, r.w);
    const hullPos = new THREE.Vector3(t.x, t.y, t.z);

    const hullFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(hullQuat);
    const hullRight = new THREE.Vector3(1, 0, 0).applyQuaternion(hullQuat);
    const hullUp = new THREE.Vector3(0, 1, 0).applyQuaternion(hullQuat);

    const linVel = this.body.linvel();
    const angVel = this.body.angvel();
    const velVec = new THREE.Vector3(linVel.x, linVel.y, linVel.z);
    this.speedMps = velVec.dot(hullFwd);
    const absSpeed = Math.abs(this.speedMps);

    const throttle = driverInput ? driverInput.forward : 0;
    const steerRaw = driverInput ? -driverInput.right : 0;
    const boost = driverInput?.sprint ? 1.32 : 1.0;
    this.steerAngle = damp(this.steerAngle, steerRaw, 8.5, safeDt);

    // 1. Multi-point Archimedes Buoyancy against live Gerstner wave field!
    let submergedCount = 0;
    const perProbeDisplacementForce = (this.mass * 9.81 * 2.45) / this.probes.length;
    const verticalDampCoeff = (this.mass * 6.8) / this.probes.length;

    for (const localP of this.probes) {
      const worldP = localP.clone().applyQuaternion(hullQuat).add(hullPos);
      const wave = sampleWaterWave(worldP.x, worldP.z, timeSec);
      const depth = wave.height - worldP.y;

      if (depth > 0) {
        submergedCount++;
        const subRatio = clamp(depth / 0.55, 0, 1.45);
        const rArm = worldP.clone().sub(hullPos);
        const pointVel = new THREE.Vector3(angVel.x, angVel.y, angVel.z).cross(rArm).add(velVec);

        const buoyY = Math.max(0, perProbeDisplacementForce * subRatio - pointVel.y * verticalDampCoeff);
        this.body.applyImpulseAtPoint(
          { x: 0, y: buoyY * safeDt, z: 0 },
          { x: worldP.x, y: worldP.y, z: worldP.z },
          true,
        );
      }
    }

    this.inWater = submergedCount > 0;

    // Self-righting roll/pitch stabilization torque so swells never turtle the craft
    const righting = new THREE.Vector3().crossVectors(hullUp, new THREE.Vector3(0, 1, 0));
    this.body.applyTorqueImpulse(
      {
        x: righting.x * this.mass * 12 * safeDt,
        y: 0,
        z: righting.z * this.mass * 14 * safeDt,
      },
      true,
    );

    if (this.inWater) {
      // 2. Hydrodynamic Keel Resistance (kills sideways slip so watercraft carve crisply!)
      const lateralSpeed = velVec.dot(hullRight);
      const keelGrip = this.kind === 'jetski' ? 4.8 : 5.6;
      const latImpulse = hullRight.clone().multiplyScalar(-lateralSpeed * this.mass * keelGrip * safeDt);
      this.body.applyImpulse({ x: latImpulse.x, y: 0, z: latImpulse.z }, true);

      // 3. Waterjet / Twin-Outboard Propulsion + Planing Bow-Rise + Carve Lean!
      if (driverInput) {
        const topSpeed = (this.kind === 'jetski' ? 29 : 24) * boost;
        if (Math.abs(throttle) > 0.04 && absSpeed < topSpeed) {
          const thrustMag =
            (this.kind === 'jetski' ? 6900 : 18500) * throttle * (throttle < 0 ? 0.48 : boost);
          const planarFwd = new THREE.Vector3(hullFwd.x, 0, hullFwd.z).normalize();
          this.body.applyImpulse(
            {
              x: planarFwd.x * thrustMag * safeDt,
              y: 0,
              z: planarFwd.z * thrustMag * safeDt,
            },
            true,
          );
        }

        // Steering yaw torque + dynamic carve roll lean (especially pronounced on Jet Ski!)
        const steerAuthority = clamp(0.35 + absSpeed / 8, 0.35, 1.35);
        const turnSign = this.speedMps >= -0.5 ? 1 : -1;
        const yawTorque =
          this.steerAngle *
          turnSign *
          steerAuthority *
          this.mass *
          (this.kind === 'jetski' ? 5.2 : 3.4);

        const carveBankTorque =
          this.steerAngle *
          clamp(this.speedMps / 14, 0, 1.2) *
          this.mass *
          (this.kind === 'jetski' ? 4.2 : 1.6);

        // Planing bow-rise pitch torque under forward speed
        const planingPitch = clamp(this.speedMps / 16, 0, 1) * this.mass * (this.kind === 'speedboat' ? 2.1 : 1.1);
        const pitchAxis = hullRight.clone().multiplyScalar(planingPitch);
        const bankAxis = hullFwd.clone().multiplyScalar(-carveBankTorque);

        this.body.applyTorqueImpulse(
          {
            x: (pitchAxis.x + bankAxis.x) * safeDt,
            y: yawTorque * safeDt,
            z: (pitchAxis.z + bankAxis.z) * safeDt,
          },
          true,
        );
      } else {
        // Moored station-keeping damping so docked boats & jet skis don't drift away on waves!
        this.body.applyImpulse(
          {
            x: -linVel.x * this.mass * 3.2 * safeDt,
            y: 0,
            z: -linVel.z * this.mass * 3.2 * safeDt,
          },
          true,
        );
      }

      // Quadratic water drag
      this.body.applyImpulse(
        {
          x: -linVel.x * absSpeed * (this.kind === 'jetski' ? 6.5 : 18.0) * safeDt,
          y: 0,
          z: -linVel.z * absSpeed * (this.kind === 'jetski' ? 6.5 : 18.0) * safeDt,
        },
        true,
      );
    }

    // Wake foam visibility scales smoothly with planing speed
    const wakeOpacity = this.inWater ? clamp((absSpeed - 2.2) / 14, 0, 0.72) : 0;
    this.wakeMat.opacity = damp(this.wakeMat.opacity, wakeOpacity, 8, safeDt);
    this.wakeRibbon.scale.set(
      1 + clamp(absSpeed / 22, 0, 0.65),
      1,
      0.4 + clamp(absSpeed / 16, 0, 1.3),
    );

    this.syncVisualsFromBody();
  }

  private syncVisualsFromBody(): void {
    const t = this.body.translation();
    const r = this.body.rotation();
    this.root.position.set(t.x, t.y, t.z);
    this.root.quaternion.set(r.x, r.y, r.z, r.w);
  }
}
