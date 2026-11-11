import * as THREE from 'three';
import { BiomechanicalAnimator } from '../character/biomechanics';
import { type CharacterPalette, HumanoidRig } from '../character/human-rig';
import { AUTO_DEPLOY_ALTITUDE_Y, ParachuteCanopyVisual } from '../character/parachute-system';
import type { DamageableTarget } from '../combat/projectiles-bvh';
import { WEAPON_SPECS } from '../combat/weapons';
import { clamp, damp, dampAngleRad } from '../core/math';
import { SeededRng } from '../core/rng';
import { SEA_LEVEL_Y, sampleWaterWave } from '../rendering/water-system';
import type { DropPhase, WeaponId } from '../types/game';
import { ISLAND_GROUND_Y } from '../world/miami-layout';
import type { PhysicsWorld } from '../world/physics-world';

const BOT_WAYPOINTS: ReadonlyArray<{ x: number; z: number }> = [
  { x: 34, z: -48 },
  { x: 34, z: -16 },
  { x: 34, z: 18 },
  { x: 34, z: 48 },
  { x: 52, z: -12 },
  { x: 52, z: 24 },
  { x: -34, z: -36 },
  { x: -64, z: -34 },
  { x: -34, z: 32 },
  { x: -64, z: 36 },
  { x: -9, z: -38 }, // Venetian Bridge North
  { x: -9, z: 38 },  // Bayside Bridge South
  { x: 24, z: -22 }, // Outside Surf Outfitter
  { x: -35, z: -28 }, // Outside Calle Ocho Bodega
];

export class BotAgent implements DamageableTarget {
  public readonly id: string;
  public readonly callsign: string;
  public readonly rig: HumanoidRig;
  public readonly canopy: ParachuteCanopyVisual;
  public readonly animator = new BiomechanicalAnimator();

  public position = new THREE.Vector3();
  public velocity = new THREE.Vector3();
  public yaw = 0;
  public phase: DropPhase = 'aircraft';
  public health = 100;
  public shield = 25;
  public alive = true;
  public readonly radius = 0.44;
  public readonly height = 1.82;
  public readonly weaponId: WeaponId;

  private dropDelaySec: number;
  private goalPoint = new THREE.Vector3();
  private retargetTimer = 0;
  private fireCooldown = 0;
  private strafeDir = 1;
  private recoilImpulse = 0;

  constructor(
    index: number,
    callsign: string,
    palette: CharacterPalette,
    weaponId: WeaponId,
    dropDelaySec: number,
    landingGoal: { x: number; z: number },
    private readonly rng: SeededRng,
    scene: THREE.Scene,
  ) {
    this.id = `bot_${index}`;
    this.callsign = callsign;
    this.weaponId = weaponId;
    this.dropDelaySec = dropDelaySec;
    this.goalPoint.set(landingGoal.x, ISLAND_GROUND_Y, landingGoal.z);

    this.rig = new HumanoidRig(palette);
    this.canopy = new ParachuteCanopyVisual();
    this.rig.root.add(this.canopy.root);
    this.rig.root.visible = false;

    // Attach compact weapon silhouette to bot right hand
    const gunMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.1, 0.46),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.7 }),
    );
    gunMesh.position.set(0, 0.02, -0.2);
    this.rig.weaponMount.add(gunMesh);

    scene.add(this.rig.root);
  }

  applyDamage(amount: number, _hitPoint: THREE.Vector3, _attackerId: string): boolean {
    if (!this.alive) return false;
    let rem = amount;
    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, rem);
      this.shield -= absorbed;
      rem -= absorbed;
    }
    this.health -= rem;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
      this.rig.root.visible = false;
      return true;
    }
    return false;
  }

  update(
    dt: number,
    timeSec: number,
    aircraftPos: THREE.Vector3,
    physics: PhysicsWorld,
    stormCenter: THREE.Vector2,
    stormRadius: number,
    potentialTargets: readonly DamageableTarget[],
    onFireShot: (
      bot: BotAgent,
      origin: THREE.Vector3,
      dir: THREE.Vector3,
    ) => void,
  ): void {
    if (!this.alive) return;
    const safeDt = clamp(dt, 0.001, 0.05);
    const prevYaw = this.yaw;

    if (this.phase === 'aircraft') {
      this.dropDelaySec -= safeDt;
      this.position.copy(aircraftPos).add(new THREE.Vector3(this.rng.range(-2, 2), -2.2, this.rng.range(-2, 2)));
      if (this.dropDelaySec <= 0) {
        this.phase = 'freefall';
        this.rig.root.visible = true;
      }
      return;
    }

    if (this.phase === 'freefall' || this.phase === 'canopy') {
      const toGoalX = this.goalPoint.x - this.position.x;
      const toGoalZ = this.goalPoint.z - this.position.z;
      const targetYaw = Math.atan2(-toGoalX, -toGoalZ);
      this.yaw = dampAngleRad(this.yaw, targetYaw, 3.5, safeDt);

      const horizSpeed = this.phase === 'freefall' ? 21 : 14.5;
      const sink = this.phase === 'freefall' ? -36 : -6.2;
      const fwdX = -Math.sin(this.yaw);
      const fwdZ = -Math.cos(this.yaw);

      this.velocity.set(fwdX * horizSpeed, sink, fwdZ * horizSpeed);
      this.position.addScaledVector(this.velocity, safeDt);

      const groundCheck = physics.raycast(
        { x: this.position.x, y: this.position.y + 1.2, z: this.position.z },
        { x: 0, y: -1, z: 0 },
        160,
      );
      const groundY = groundCheck ? Math.max(SEA_LEVEL_Y, groundCheck.point.y) : SEA_LEVEL_Y;

      if (this.phase === 'freefall' && this.position.y - groundY <= AUTO_DEPLOY_ALTITUDE_Y) {
        this.phase = 'canopy';
      } else if (this.phase === 'canopy') {
        const wave = sampleWaterWave(this.position.x, this.position.z, timeSec);
        if (groundCheck && this.position.y <= groundCheck.point.y + 0.25 && groundCheck.point.y >= wave.height - 0.8) {
          this.position.y = groundCheck.point.y;
          this.velocity.y = 0;
          this.phase = 'grounded';
        } else if (this.position.y <= wave.height - 0.55) {
          this.position.y = wave.height - 0.72;
          this.velocity.y = 0;
          this.phase = 'swimming';
        }
      }
    } else {
      // Grounded or Swimming tactical AI
      this.retargetTimer -= safeDt;
      this.fireCooldown = Math.max(0, this.fireCooldown - safeDt);

      const distFromStorm = Math.hypot(
        this.position.x - stormCenter.x,
        this.position.z - stormCenter.y,
      );

      // Find nearest visible enemy within 58m
      let nearestEnemy: { target: DamageableTarget; dist: number } | null = null;
      for (const t of potentialTargets) {
        if (!t.alive || t.id === this.id) continue;
        const d = this.position.distanceTo(t.position);
        if (d < 58 && (!nearestEnemy || d < nearestEnemy.dist)) {
          // Line of sight check
          const eye = { x: this.position.x, y: this.position.y + 1.5, z: this.position.z };
          const dir = t.position
            .clone()
            .add(new THREE.Vector3(0, 1.1, 0))
            .sub(new THREE.Vector3(eye.x, eye.y, eye.z));
          const len = dir.length();
          dir.normalize();
          const wall = physics.raycast(eye, dir, len - 0.6);
          if (!wall) {
            nearestEnemy = { target: t, dist: d };
          }
        }
      }

      if (distFromStorm > stormRadius * 0.88) {
        this.goalPoint.set(
          stormCenter.x + this.rng.range(-18, 18),
          ISLAND_GROUND_Y,
          stormCenter.y + this.rng.range(-18, 18),
        );
      } else if (this.retargetTimer <= 0 || this.position.distanceTo(this.goalPoint) < 3.5) {
        const wp = this.rng.pick(BOT_WAYPOINTS);
        this.goalPoint.set(wp.x + this.rng.range(-5, 5), ISLAND_GROUND_Y, wp.z + this.rng.range(-5, 5));
        this.retargetTimer = this.rng.range(4.5, 9.0);
        this.strafeDir = this.rng.next() > 0.5 ? 1 : -1;
      }

      let moveDirX = 0;
      let moveDirZ = 0;
      let desiredSpeed = 4.6;

      if (nearestEnemy && this.phase === 'grounded') {
        const dx = nearestEnemy.target.position.x - this.position.x;
        const dz = nearestEnemy.target.position.z - this.position.z;
        const faceYaw = Math.atan2(-dx, -dz);
        this.yaw = dampAngleRad(this.yaw, faceYaw, 7.5, safeDt);

        // Tactical strafe + range maintenance
        const rightX = Math.cos(this.yaw);
        const rightZ = -Math.sin(this.yaw);
        const fwdX = -Math.sin(this.yaw);
        const fwdZ = -Math.cos(this.yaw);
        const rangePush = nearestEnemy.dist > 24 ? 0.65 : nearestEnemy.dist < 10 ? -0.55 : 0.0;
        moveDirX = rightX * this.strafeDir * 0.75 + fwdX * rangePush;
        moveDirZ = rightZ * this.strafeDir * 0.75 + fwdZ * rangePush;
        desiredSpeed = 3.6;

        if (this.fireCooldown <= 0) {
          const sp = WEAPON_SPECS[this.weaponId];
          // Moderated bot cadence + humane spread so gunfights feel exciting & fair
          this.fireCooldown = (60 / sp.rpm) * 3.4 + this.rng.range(0.08, 0.28);
          this.recoilImpulse = 0.35;
          const muzzle = new THREE.Vector3(this.position.x, this.position.y + 1.38, this.position.z);
          const aimVec = nearestEnemy.target.position
            .clone()
            .add(new THREE.Vector3(this.rng.range(-0.65, 0.65), 1.0 + this.rng.range(-0.35, 0.35), this.rng.range(-0.65, 0.65)))
            .sub(muzzle)
            .normalize();
          onFireShot(this, muzzle, aimVec);
        }
      } else {
        const dx = this.goalPoint.x - this.position.x;
        const dz = this.goalPoint.z - this.position.z;
        const len = Math.hypot(dx, dz) || 1;
        moveDirX = dx / len;
        moveDirZ = dz / len;
        this.yaw = dampAngleRad(this.yaw, Math.atan2(-moveDirX, -moveDirZ), 6.0, safeDt);
        desiredSpeed = this.phase === 'swimming' ? 4.2 : 5.4;
      }

      this.velocity.x = damp(this.velocity.x, moveDirX * desiredSpeed, 8.5, safeDt);
      this.velocity.z = damp(this.velocity.z, moveDirZ * desiredSpeed, 8.5, safeDt);

      // Wall avoidance probe
      const stepLen = Math.hypot(this.velocity.x, this.velocity.z) * safeDt;
      if (stepLen > 1e-4) {
        const wallHit = physics.raycast(
          { x: this.position.x, y: this.position.y + 1.1, z: this.position.z },
          { x: this.velocity.x, y: 0, z: this.velocity.z },
          stepLen + 0.55,
        );
        if (wallHit && wallHit.normal.y < 0.55) {
          const prevVx = this.velocity.x;
          this.velocity.x = -this.velocity.z * this.strafeDir;
          this.velocity.z = prevVx * this.strafeDir;
          this.retargetTimer = 0;
        }
      }

      this.position.x = clamp(this.position.x + this.velocity.x * safeDt, -130, 120);
      this.position.z = clamp(this.position.z + this.velocity.z * safeDt, -130, 130);

      const wave = sampleWaterWave(this.position.x, this.position.z, timeSec);
      const groundHit = physics.raycast(
        { x: this.position.x, y: this.position.y + 1.8, z: this.position.z },
        { x: 0, y: -1, z: 0 },
        8.0,
      );

      if (groundHit && groundHit.point.y >= wave.height - 0.85) {
        this.position.y = damp(this.position.y, groundHit.point.y, 18, safeDt);
        this.phase = 'grounded';
      } else {
        this.position.y = damp(this.position.y, wave.height - 0.75, 8, safeDt);
        this.phase = 'swimming';
      }
    }

    const planarSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    const yawRate = (this.yaw - prevYaw) / safeDt;

    this.animator.update(this.rig, {
      dt: safeDt,
      timeSec,
      phase: this.phase,
      planarSpeed,
      forwardSpeed: planarSpeed,
      strafeSpeed: 0,
      verticalSpeed: this.velocity.y,
      yawRate,
      crouchAmount: 0,
      aimAmount: 0.35,
      aimPitchRad: 0,
      armed: this.phase === 'grounded',
      recoilImpulse: this.recoilImpulse,
      steerInput: 0,
      leftGroundDeltaY: 0,
      rightGroundDeltaY: 0,
      groundSlopePitchRad: 0,
    });
    this.recoilImpulse = 0;

    this.canopy.update(safeDt, this.phase === 'canopy', 0, 0);
    this.rig.root.position.copy(this.position);
    this.rig.root.rotation.y = this.yaw;
  }
}
