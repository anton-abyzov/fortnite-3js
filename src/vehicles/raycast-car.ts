import type RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import type { AssetLibrary } from '../assets/asset-loader';
import { clamp, damp, lerp } from '../core/math';
import { sampleWaterWave } from '../rendering/water-system';
import type { InputState, VehicleKind } from '../types/game';
import type { PhysicsWorld } from '../world/physics-world';

interface WheelMount {
  localAnchor: THREE.Vector3;
  steer: boolean;
  drive: boolean;
  steerPivot: THREE.Group;
  spinMesh: THREE.Group;
  prevCompression: number;
}

export class RaycastCar {
  public readonly id: string;
  public readonly kind: 'convertible' | 'suv';
  public readonly root = new THREE.Group();
  public readonly seatAnchor = new THREE.Group();
  public readonly body: RAPIER.RigidBody;

  public steerAngle = 0;
  public speedMps = 0;
  public groundedWheels = 0;

  private readonly wheels: WheelMount[] = [];
  private readonly tailLightMat: THREE.MeshStandardMaterial;
  private wheelSpinRad = 0;
  private readonly mass: number;
  private readonly restLength = 0.44;
  private readonly wheelRadius = 0.34;
  private readonly maxTravel = 0.24;

  constructor(
    id: string,
    kind: 'convertible' | 'suv',
    spawnPos: { x: number; y: number; z: number },
    spawnYaw: number,
    scene: THREE.Scene,
    physics: PhysicsWorld,
    assets: AssetLibrary,
  ) {
    this.id = id;
    this.kind = kind;
    this.mass = kind === 'convertible' ? 1180 : 1480;

    this.root.name = `vehicle_${id}`;
    const hull = assets.instantiate('miami_convertible');
    if (kind === 'suv') {
      hull.scale.set(1.06, 1.28, 1.04);
      hull.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          const m = c as THREE.Mesh;
          if ((m.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
            const cloned = (m.material as THREE.MeshStandardMaterial).clone();
            cloned.color.lerp(new THREE.Color(0x0ea5b7), 0.45);
            m.material = cloned;
          }
        }
      });
    }
    this.root.add(hull);

    // Driver seat anchor for HumanoidRig when player boards
    this.seatAnchor.position.set(-0.42, 0.46, 0.15);
    this.root.add(this.seatAnchor);

    // Emissive LED headlights & brake taillights
    const headLightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xfff5d6),
      emissiveIntensity: 3.2,
      roughness: 0.15,
    });
    this.tailLightMat = new THREE.MeshStandardMaterial({
      color: 0xff2a3c,
      emissive: new THREE.Color(0xff1e32),
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });

    for (const sx of [-0.72, 0.72]) {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.11, 0.08), headLightMat);
      hl.position.set(sx, 0.62, -2.22);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.11, 0.08), this.tailLightMat);
      tl.position.set(sx, 0.68, 2.22);
      this.root.add(hl, tl);
    }

    // Build 4 articulated suspension wheel assemblies
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x17191c, roughness: 0.82, metalness: 0.08 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.22, metalness: 0.85 });

    const wheelConfigs: Array<{ x: number; z: number; steer: boolean; drive: boolean }> = [
      { x: -0.92, z: -1.42, steer: true, drive: true },
      { x: 0.92, z: -1.42, steer: true, drive: true },
      { x: -0.92, z: 1.38, steer: false, drive: true },
      { x: 0.92, z: 1.38, steer: false, drive: true },
    ];

    for (const wc of wheelConfigs) {
      const steerPivot = new THREE.Group();
      steerPivot.position.set(wc.x, 0.48, wc.z);
      const spinMesh = new THREE.Group();

      const tire = new THREE.Mesh(
        new THREE.CylinderGeometry(this.wheelRadius, this.wheelRadius, 0.26, 16),
        tireMat,
      );
      tire.rotation.z = Math.PI * 0.5;
      tire.castShadow = true;

      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(this.wheelRadius * 0.62, this.wheelRadius * 0.62, 0.27, 10),
        rimMat,
      );
      rim.rotation.z = Math.PI * 0.5;

      spinMesh.add(tire, rim);
      steerPivot.add(spinMesh);
      this.root.add(steerPivot);

      this.wheels.push({
        localAnchor: new THREE.Vector3(wc.x, 0.68, wc.z),
        steer: wc.steer,
        drive: wc.drive,
        steerPivot,
        spinMesh,
        prevCompression: 0.14,
      });
    }

    scene.add(this.root);

    // Rapier dynamic chassis rigid body
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spawnYaw);
    const rbDesc = physics.rapier.RigidBodyDesc.dynamic()
      .setTranslation(spawnPos.x, spawnPos.y, spawnPos.z)
      .setRotation({ x: q.x, y: q.y, z: q.z, w: q.w })
      .setLinearDamping(0.22)
      .setAngularDamping(2.4);

    this.body = physics.world.createRigidBody(rbDesc);
    const colDesc = physics.rapier.ColliderDesc.cuboid(0.95, 0.44, 2.18)
      .setTranslation(0, 0.68, 0)
      .setMass(this.mass)
      .setFriction(0.35)
      .setRestitution(0.08);
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

  stepPhysics(
    dt: number,
    timeSec: number,
    physics: PhysicsWorld,
    driverInput: InputState | null,
  ): void {
    const safeDt = clamp(dt, 0.002, 0.035);
    const t = this.body.translation();
    const r = this.body.rotation();
    const chassisQuat = new THREE.Quaternion(r.x, r.y, r.z, r.w);
    const chassisPos = new THREE.Vector3(t.x, t.y, t.z);

    const chassisUp = new THREE.Vector3(0, 1, 0).applyQuaternion(chassisQuat);
    const chassisFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(chassisQuat);

    // Auto-upright stabilization torque if car tips aggressively off a ramp
    if (chassisUp.y < 0.35) {
      const righting = new THREE.Vector3().crossVectors(chassisUp, new THREE.Vector3(0, 1, 0));
      this.body.applyTorqueImpulse(
        {
          x: righting.x * this.mass * 8 * safeDt,
          y: 0,
          z: righting.z * this.mass * 8 * safeDt,
        },
        true,
      );
    }

    const linVel = this.body.linvel();
    const velVec = new THREE.Vector3(linVel.x, linVel.y, linVel.z);
    this.speedMps = velVec.dot(chassisFwd);
    const absSpeed = Math.abs(this.speedMps);

    const throttle = driverInput ? driverInput.forward : 0;
    const steerRaw = driverInput ? -driverInput.right : 0;
    const handbrake = driverInput ? driverInput.handbrake : true;
    const nitro = driverInput?.sprint ? 1.38 : 1.0;

    // Speed-sensitive Ackermann steering limit
    const maxSteer = lerp(0.56, 0.24, clamp(absSpeed / 28, 0, 1));
    this.steerAngle = damp(this.steerAngle, steerRaw * maxSteer, 10.5, safeDt);

    this.tailLightMat.emissiveIntensity = throttle < -0.1 || handbrake ? 4.2 : 1.2;

    const springStiffness = this.mass * 38;
    const springDamper = this.mass * 5.2;
    const maxRayLen = this.restLength + this.maxTravel + this.wheelRadius;
    const rayDir = chassisUp.clone().negate();

    this.groundedWheels = 0;

    for (const w of this.wheels) {
      const worldAnchor = w.localAnchor.clone().applyQuaternion(chassisQuat).add(chassisPos);
      const hit = physics.raycast(worldAnchor, rayDir, maxRayLen, this.body);

      const wheelSteer = w.steer ? this.steerAngle : 0;
      w.steerPivot.rotation.y = wheelSteer;

      if (hit && hit.normal.y > 0.35) {
        this.groundedWheels++;
        const suspLen = clamp(
          hit.distance - this.wheelRadius,
          this.restLength - this.maxTravel,
          this.restLength + this.maxTravel,
        );
        const compression = Math.max(0, this.restLength + this.maxTravel - suspLen);
        const compVel = (compression - w.prevCompression) / safeDt;
        w.prevCompression = compression;

        const suspForce = Math.max(0, springStiffness * compression + springDamper * compVel);
        const upImpulse = hit.normal.clone().multiplyScalar(suspForce * safeDt);

        // Wheel forward & lateral basis in world space
        const wheelQuat = chassisQuat
          .clone()
          .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), wheelSteer));
        const wheelFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(wheelQuat);
        const wheelRight = new THREE.Vector3(1, 0, 0).applyQuaternion(wheelQuat);

        // Point velocity at tire patch
        const angVel = this.body.angvel();
        const rArm = hit.point.clone().sub(chassisPos);
        const rotVel = new THREE.Vector3(angVel.x, angVel.y, angVel.z).cross(rArm);
        const tireVel = velVec.clone().add(rotVel);

        // Lateral cornering grip (reduced on rear tires during handbrake drift!)
        const lateralSpeed = tireVel.dot(wheelRight);
        const gripFactor = !w.steer && handbrake && driverInput ? 0.26 : 0.86;
        const lateralImpulseMag = -lateralSpeed * (this.mass * 0.25) * gripFactor;
        const latImpulse = wheelRight.clone().multiplyScalar(lateralImpulseMag);

        // Engine drive / braking force
        let longForce = 0;
        if (driverInput) {
          const topSpeed = (this.kind === 'convertible' ? 33 : 27) * nitro;
          if (Math.abs(throttle) > 0.05 && absSpeed < topSpeed) {
            const enginePower = (this.kind === 'convertible' ? 14800 : 16200) * nitro;
            longForce = throttle * (enginePower / 4);
          }
          if (handbrake && !w.steer) {
            longForce -= clamp(this.speedMps, -12, 12) * this.mass * 0.8;
          }
        } else {
          // Parked rolling resistance so empty cars stay put on bridge slopes
          longForce = -clamp(this.speedMps, -6, 6) * this.mass * 1.4;
        }

        const driveImpulse = wheelFwd.clone().multiplyScalar(longForce * safeDt);
        const totalImpulse = upImpulse.add(latImpulse).add(driveImpulse);

        // Apply impulse slightly closer to COM height to keep high-speed turns crisp & roll-stable
        const appPoint = hit.point.clone().lerp(worldAnchor, 0.55);
        this.body.applyImpulseAtPoint(
          { x: totalImpulse.x, y: totalImpulse.y, z: totalImpulse.z },
          { x: appPoint.x, y: appPoint.y, z: appPoint.z },
          true,
        );

        w.steerPivot.position.y = w.localAnchor.y - suspLen;
      } else {
        w.prevCompression = 0;
        w.steerPivot.position.y = w.localAnchor.y - (this.restLength + this.maxTravel * 0.65);
      }
    }

    // Gentle canal/ocean buoyancy drag if someone launches a car into the water
    const wave = sampleWaterWave(chassisPos.x, chassisPos.z, timeSec);
    if (chassisPos.y < wave.height - 0.15) {
      const sub = clamp(wave.height - chassisPos.y, 0, 1.5);
      this.body.applyImpulse(
        {
          x: -linVel.x * this.mass * 1.8 * safeDt,
          y: (this.mass * 9.2 * sub - linVel.y * this.mass * 2.5) * safeDt,
          z: -linVel.z * this.mass * 1.8 * safeDt,
        },
        true,
      );
    }

    // Aerodynamic drag
    this.body.applyImpulse(
      {
        x: -linVel.x * absSpeed * 0.42 * safeDt,
        y: 0,
        z: -linVel.z * absSpeed * 0.42 * safeDt,
      },
      true,
    );

    this.wheelSpinRad += (this.speedMps / this.wheelRadius) * safeDt;
    for (const w of this.wheels) {
      w.spinMesh.rotation.x = -this.wheelSpinRad;
    }

    this.syncVisualsFromBody();
  }

  private syncVisualsFromBody(): void {
    const t = this.body.translation();
    const r = this.body.rotation();
    this.root.position.set(t.x, t.y, t.z);
    this.root.quaternion.set(r.x, r.y, r.z, r.w);
  }
}
