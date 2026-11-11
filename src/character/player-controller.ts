import * as THREE from 'three';
import { clamp, damp, dampAngleRad, lerp } from '../core/math';
import { SEA_LEVEL_Y, sampleWaterWave } from '../rendering/water-system';
import type { DropPhase, InputState, SurfaceMaterial } from '../types/game';
import type { PhysicsWorld } from '../world/physics-world';
import { BiomechanicalAnimator } from './biomechanics';
import { HumanoidRig, PLAYER_PALETTE } from './human-rig';
import { AUTO_DEPLOY_ALTITUDE_Y, type DropAircraftController, ParachuteCanopyVisual } from './parachute-system';

export class PlayerController {
  public readonly rig: HumanoidRig;
  public readonly canopy: ParachuteCanopyVisual;
  public readonly animator = new BiomechanicalAnimator();

  public position = new THREE.Vector3(82, 142, -58);
  public velocity = new THREE.Vector3();
  public yaw = 1.05;
  public pitch = -0.56;
  public phase: DropPhase = 'aircraft';

  public health = 100;
  public shield = 50;
  public stamina = 100;
  public speedBoostSec = 0;
  public crouchAmount = 0;
  public aimAmount = 0;
  public lastSurface: SurfaceMaterial = 'concrete';

  private recoilImpulse = 0;
  private cameraDistance = 4.6;
  private readonly smoothCamPos = new THREE.Vector3();
  private readonly smoothLookAt = new THREE.Vector3();
  private camInitialized = false;

  constructor(scene: THREE.Scene) {
    this.rig = new HumanoidRig(PLAYER_PALETTE);
    this.canopy = new ParachuteCanopyVisual();
    this.rig.root.add(this.canopy.root);
    scene.add(this.rig.root);
  }

  addWeaponRecoil(kick: number): void {
    this.recoilImpulse += kick;
    this.pitch = clamp(this.pitch + kick * 0.045, -1.25, 1.15);
  }

  teleportTo(x: number, y: number, z: number, nextPhase: DropPhase = 'grounded'): void {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.phase = nextPhase;
    this.rig.root.visible = nextPhase !== 'aircraft';
    this.rig.root.position.copy(this.position);
  }

  update(
    dt: number,
    timeSec: number,
    input: InputState,
    physics: PhysicsWorld,
    aircraft: DropAircraftController,
  ): { stepSoundMaterial: SurfaceMaterial | null; deployedCanopyNow: boolean } {
    const safeDt = clamp(dt, 0.001, 0.05);
    const prevYaw = this.yaw;

    this.yaw -= input.yawDelta;
    this.pitch = clamp(this.pitch - input.pitchDelta, -1.22, 1.12);
    const yawRate = (this.yaw - prevYaw) / safeDt;

    if (this.speedBoostSec > 0) {
      this.speedBoostSec = Math.max(0, this.speedBoostSec - safeDt);
    }

    let deployedCanopyNow = false;

    if (this.phase === 'aircraft') {
      const flight = aircraft.update(0);
      this.position.copy(flight.position).add(new THREE.Vector3(0, -1.8, 0));
      this.velocity.set(0, 0, 0);
      this.rig.root.visible = false;

      if (input.jumpJustPressed || flight.finishedPass) {
        this.phase = 'freefall';
        this.rig.root.visible = true;
        const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
        this.velocity.set(fwd.x * 16, -12, fwd.z * 16);
      }
    } else if (this.phase === 'freefall') {
      const diveHeld = input.forward > 0.2;
      const targetFall = diveHeld ? -54 : -34;
      const horizSpeed = diveHeld ? 30 : 21;
      const fwdX = -Math.sin(this.yaw);
      const fwdZ = -Math.cos(this.yaw);
      const rightX = Math.cos(this.yaw);
      const rightZ = -Math.sin(this.yaw);

      const wishVx = (fwdX * Math.max(0.25, input.forward) + rightX * input.right * 0.65) * horizSpeed;
      const wishVz = (fwdZ * Math.max(0.25, input.forward) + rightZ * input.right * 0.65) * horizSpeed;

      this.velocity.x = damp(this.velocity.x, wishVx, 2.8, safeDt);
      this.velocity.z = damp(this.velocity.z, wishVz, 2.8, safeDt);
      this.velocity.y = damp(this.velocity.y, targetFall, 2.2, safeDt);

      this.position.addScaledVector(this.velocity, safeDt);

      const groundCheck = physics.raycast(
        { x: this.position.x, y: this.position.y + 1.0, z: this.position.z },
        { x: 0, y: -1, z: 0 },
        180,
      );
      const groundY = groundCheck ? Math.max(SEA_LEVEL_Y, groundCheck.point.y) : SEA_LEVEL_Y;

      if (input.jumpJustPressed || this.position.y - groundY <= AUTO_DEPLOY_ALTITUDE_Y) {
        this.phase = 'canopy';
        this.velocity.y = Math.max(this.velocity.y * 0.35, -9.5);
        deployedCanopyNow = true;
      }
    } else if (this.phase === 'canopy') {
      const flare = input.forward < -0.2 ? 1 : 0;
      const glideSpeed = lerp(16.5, 7.5, flare) * (input.forward > 0.1 ? 1.2 : 0.85);
      const sinkSpeed = lerp(-5.8, -2.5, flare);

      this.yaw -= input.right * 1.35 * safeDt;
      const fwdX = -Math.sin(this.yaw);
      const fwdZ = -Math.cos(this.yaw);

      this.velocity.x = damp(this.velocity.x, fwdX * glideSpeed, 3.4, safeDt);
      this.velocity.z = damp(this.velocity.z, fwdZ * glideSpeed, 3.4, safeDt);
      this.velocity.y = damp(this.velocity.y, sinkSpeed, 4.2, safeDt);
      this.position.addScaledVector(this.velocity, safeDt);

      const hit = physics.raycast(
        { x: this.position.x, y: this.position.y + 1.4, z: this.position.z },
        { x: 0, y: -1, z: 0 },
        4.0,
      );
      const wave = sampleWaterWave(this.position.x, this.position.z, timeSec);

      if (hit && this.position.y <= hit.point.y + 0.18 && hit.point.y >= wave.height - 0.85) {
        this.position.y = hit.point.y;
        this.animator.triggerLandingImpact(this.velocity.y);
        this.velocity.y = 0;
        this.phase = 'grounded';
        this.pitch = clamp(this.pitch, -0.22, 0.35);
        this.lastSurface = hit.material;
      } else if (this.position.y <= wave.height - 0.55) {
        this.position.y = wave.height - 0.72;
        this.velocity.y = 0;
        this.phase = 'swimming';
        this.lastSurface = 'water';
      }
    } else if (this.phase === 'grounded' || this.phase === 'swimming') {
      this.stepGroundedOrSwimming(safeDt, timeSec, input, physics);
    }

    // Clamp to outer Miami sea boundary so player stays inside playable coastal region
    this.position.x = clamp(this.position.x, -134, 155);
    this.position.z = clamp(this.position.z, -134, 134);

    // Foot ground probes for uneven slopes / stairs / sandbars
    let leftDeltaY = 0;
    let rightDeltaY = 0;
    let slopePitch = 0;

    if (this.phase === 'grounded') {
      const rightVecX = Math.cos(this.yaw) * 0.14;
      const rightVecZ = -Math.sin(this.yaw) * 0.14;
      const hitL = physics.raycast(
        { x: this.position.x - rightVecX, y: this.position.y + 0.9, z: this.position.z - rightVecZ },
        { x: 0, y: -1, z: 0 },
        1.55,
      );
      const hitR = physics.raycast(
        { x: this.position.x + rightVecX, y: this.position.y + 0.9, z: this.position.z + rightVecZ },
        { x: 0, y: -1, z: 0 },
        1.55,
      );
      if (hitL) leftDeltaY = hitL.point.y - this.position.y;
      if (hitR) rightDeltaY = hitR.point.y - this.position.y;
      if (hitL && hitR) {
        const avgN = hitL.normal.clone().add(hitR.normal).normalize();
        slopePitch = Math.acos(clamp(avgN.y, -1, 1));
      }
    }

    this.crouchAmount = damp(
      this.crouchAmount,
      this.phase === 'grounded' && input.crouch ? 1 : 0,
      12,
      safeDt,
    );
    this.aimAmount = damp(this.aimAmount, input.aim && this.phase === 'grounded' ? 1 : 0, 14, safeDt);

    const fwdX = -Math.sin(this.yaw);
    const fwdZ = -Math.cos(this.yaw);
    const rightX = Math.cos(this.yaw);
    const rightZ = -Math.sin(this.yaw);
    const planarSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    const forwardSpeed = this.velocity.x * fwdX + this.velocity.z * fwdZ;
    const strafeSpeed = this.velocity.x * rightX + this.velocity.z * rightZ;

    const telem = this.animator.update(this.rig, {
      dt: safeDt,
      timeSec,
      phase: this.phase,
      planarSpeed,
      forwardSpeed,
      strafeSpeed,
      verticalSpeed: this.velocity.y,
      yawRate,
      crouchAmount: this.crouchAmount,
      aimAmount: this.aimAmount,
      aimPitchRad: this.pitch,
      armed: this.phase === 'grounded',
      recoilImpulse: this.recoilImpulse,
      steerInput: input.right,
      leftGroundDeltaY: leftDeltaY,
      rightGroundDeltaY: rightDeltaY,
      groundSlopePitchRad: slopePitch,
    });
    this.recoilImpulse = 0;

    this.canopy.update(
      safeDt,
      this.phase === 'canopy',
      input.right,
      this.phase === 'canopy' && input.forward < -0.2 ? 1 : 0,
    );

    this.rig.root.position.copy(this.position);
    this.rig.root.rotation.y = this.yaw;

    const stepSoundMaterial =
      this.phase === 'grounded' && telem.stepTriggeredSide ? this.lastSurface : null;

    return { stepSoundMaterial, deployedCanopyNow };
  }

  private stepGroundedOrSwimming(
    dt: number,
    timeSec: number,
    input: InputState,
    physics: PhysicsWorld,
  ): void {
    const fwdX = -Math.sin(this.yaw);
    const fwdZ = -Math.cos(this.yaw);
    const rightX = Math.cos(this.yaw);
    const rightZ = -Math.sin(this.yaw);

    let wishX = fwdX * input.forward + rightX * input.right;
    let wishZ = fwdZ * input.forward + rightZ * input.right;
    const wishLen = Math.hypot(wishX, wishZ);
    if (wishLen > 1) {
      wishX /= wishLen;
      wishZ /= wishLen;
    }

    const boostMult = this.speedBoostSec > 0 ? 1.35 : 1.0;

    if (this.phase === 'swimming') {
      const swimSpeed = (input.sprint && this.stamina > 5 ? 6.4 : 4.4) * boostMult;
      if (input.sprint && wishLen > 0.1) {
        this.stamina = Math.max(0, this.stamina - 14 * dt);
      } else {
        this.stamina = Math.min(100, this.stamina + 16 * dt);
      }

      this.velocity.x = damp(this.velocity.x, wishX * swimSpeed, 5.5, dt);
      this.velocity.z = damp(this.velocity.z, wishZ * swimSpeed, 5.5, dt);
      this.applyHorizontalWallSlide(dt, physics);

      const wave = sampleWaterWave(this.position.x, this.position.z, timeSec);
      const floorHit = physics.raycast(
        { x: this.position.x, y: wave.height + 2.5, z: this.position.z },
        { x: 0, y: -1, z: 0 },
        16,
      );

      const targetFloatY = wave.height - 0.78;
      this.position.y = damp(this.position.y, targetFloatY, 7.5, dt);

      // Climb seamlessly onto sandy beach, marina dock, or gangway when water shallows or Jump pressed near dock!
      if (floorHit && wave.height - floorHit.point.y < 0.88) {
        this.position.y = floorHit.point.y;
        this.velocity.y = 0;
        this.phase = 'grounded';
        this.lastSurface = floorHit.material;
      } else if (input.jumpJustPressed) {
        // Vault up onto low marina dock if adjacent
        const dockProbe = physics.raycast(
          { x: this.position.x + fwdX * 1.1, y: wave.height + 1.8, z: this.position.z + fwdZ * 1.1 },
          { x: 0, y: -1, z: 0 },
          2.6,
        );
        if (dockProbe && dockProbe.point.y <= wave.height + 1.1) {
          this.position.set(dockProbe.point.x, dockProbe.point.y, dockProbe.point.z);
          this.velocity.y = 2.5;
          this.phase = 'grounded';
          this.lastSurface = dockProbe.material;
        }
      }
      return;
    }

    // Grounded movement: walk 4.4 m/s, sprint 7.9 m/s, crouch 2.6 m/s
    const canSprint = input.sprint && !input.crouch && !input.aim && this.stamina > 4 && wishLen > 0.1;
    if (canSprint) {
      this.stamina = Math.max(0, this.stamina - 18 * dt);
    } else {
      this.stamina = Math.min(100, this.stamina + 22 * dt);
    }

    const baseSpeed = input.crouch ? 2.75 : input.aim ? 3.35 : canSprint ? 7.95 : 4.65;
    const moveSpeed = baseSpeed * boostMult;

    this.velocity.x = damp(this.velocity.x, wishX * moveSpeed, 11.5, dt);
    this.velocity.z = damp(this.velocity.z, wishZ * moveSpeed, 11.5, dt);

    this.applyHorizontalWallSlide(dt, physics);

    // Vertical gravity + ground snap + stair/ramp step-up (up to 0.62m)
    const groundProbe = physics.raycast(
      { x: this.position.x, y: this.position.y + 0.68, z: this.position.z },
      { x: 0, y: -1, z: 0 },
      1.65,
    );

    const onGround = groundProbe !== null && this.velocity.y <= 0.6 && this.position.y - groundProbe.point.y <= 0.35;

    if (onGround && groundProbe) {
      if (this.velocity.y < -4.5) {
        this.animator.triggerLandingImpact(this.velocity.y);
      }
      this.position.y = damp(this.position.y, groundProbe.point.y, 26, dt);
      this.velocity.y = 0;
      this.lastSurface = groundProbe.material;

      if (input.jumpJustPressed) {
        this.velocity.y = 6.65;
        this.position.y += 0.08;
      }
    } else {
      this.velocity.y -= 18.5 * dt;
      this.position.y += this.velocity.y * dt;

      const catchHit = physics.raycast(
        { x: this.position.x, y: this.position.y + 0.9, z: this.position.z },
        { x: 0, y: -1, z: 0 },
        1.0,
      );
      if (catchHit && this.velocity.y < 0 && this.position.y <= catchHit.point.y + 0.05) {
        this.animator.triggerLandingImpact(this.velocity.y);
        this.position.y = catchHit.point.y;
        this.velocity.y = 0;
        this.lastSurface = catchHit.material;
      }
    }

    // Enter swimming automatically when wading into deep canal or ocean water
    const wave = sampleWaterWave(this.position.x, this.position.z, timeSec);
    if (this.position.y < wave.height - 0.92) {
      this.phase = 'swimming';
      this.velocity.y = 0;
      this.lastSurface = 'water';
    }
  }

  private applyHorizontalWallSlide(dt: number, physics: PhysicsWorld): void {
    const stepX = this.velocity.x * dt;
    const stepZ = this.velocity.z * dt;
    const stepLen = Math.hypot(stepX, stepZ);
    if (stepLen < 1e-5) return;

    const capsuleRadius = 0.38;
    const dirX = stepX / stepLen;
    const dirZ = stepZ / stepLen;

    // Check chest & knee height so walls/counters block cleanly while stairs/curbs (<0.62m) do not!
    for (const hOffset of [0.75, 1.38]) {
      const hit = physics.raycast(
        { x: this.position.x, y: this.position.y + hOffset, z: this.position.z },
        { x: dirX, y: 0, z: dirZ },
        stepLen + capsuleRadius,
      );
      if (hit && hit.normal.y < 0.55) {
        // Slide along wall tangent
        const vn = this.velocity.x * hit.normal.x + this.velocity.z * hit.normal.z;
        if (vn < 0) {
          this.velocity.x -= hit.normal.x * vn;
          this.velocity.z -= hit.normal.z * vn;
        }
      }
    }

    this.position.x += this.velocity.x * dt;
    this.position.z += this.velocity.z * dt;
  }

  updateThirdPersonCamera(
    dt: number,
    camera: THREE.PerspectiveCamera,
    physics: PhysicsWorld,
    overrideAnchor?: THREE.Vector3,
    overrideDistance?: number,
  ): void {
    const anchor = overrideAnchor ?? this.position;
    const ads = this.phase === 'grounded' ? this.aimAmount : 0;

    const desiredDist =
      overrideDistance ??
      (this.phase === 'aircraft'
        ? 22.0
        : this.phase === 'freefall' || this.phase === 'canopy'
          ? 7.2
          : lerp(4.35, 2.05, ads));
    this.cameraDistance = damp(this.cameraDistance, desiredDist, 10, dt);

    const shoulderOffset = overrideAnchor ? 0 : lerp(0.52, 0.68, ads);
    const heightOffset =
      overrideAnchor
        ? 1.75
        : this.phase === 'aircraft'
          ? 3.2
          : lerp(1.58, 1.32, this.crouchAmount);

    const rightX = Math.cos(this.yaw);
    const rightZ = -Math.sin(this.yaw);
    const pivot = new THREE.Vector3(
      anchor.x + rightX * shoulderOffset,
      anchor.y + heightOffset,
      anchor.z + rightZ * shoulderOffset,
    );

    const cosP = Math.cos(this.pitch);
    const backDir = new THREE.Vector3(
      Math.sin(this.yaw) * cosP,
      -Math.sin(this.pitch),
      Math.cos(this.yaw) * cosP,
    ).normalize();

    let safeDist = this.cameraDistance;
    if (this.phase !== 'aircraft') {
      const camHit = physics.raycast(pivot, backDir, this.cameraDistance + 0.35);
      if (camHit) {
        safeDist = Math.max(0.75, camHit.distance - 0.28);
      }
    }

    const desiredCamPos = pivot.clone().addScaledVector(backDir, safeDist);
    const lookAtTarget = pivot.clone().addScaledVector(backDir, -18);

    if (!this.camInitialized) {
      this.smoothCamPos.copy(desiredCamPos);
      this.smoothLookAt.copy(lookAtTarget);
      this.camInitialized = true;
    } else {
      const followRate = overrideAnchor ? 12 : 18;
      this.smoothCamPos.lerp(desiredCamPos, 1 - Math.exp(-followRate * dt));
      this.smoothLookAt.lerp(lookAtTarget, 1 - Math.exp(-22 * dt));
    }

    camera.position.copy(this.smoothCamPos);
    camera.fov = damp(camera.fov, lerp(64, 46, ads), 12, dt);
    camera.updateProjectionMatrix();
    camera.lookAt(this.smoothLookAt);
  }

  alignYawSmoothly(targetYaw: number, dt: number): void {
    this.yaw = dampAngleRad(this.yaw, targetYaw, 8, dt);
  }
}
