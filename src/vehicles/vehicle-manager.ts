import * as THREE from 'three';
import type { AssetLibrary } from '../assets/asset-loader';
import type { PlayerController } from '../character/player-controller';
import { sampleWaterWave } from '../rendering/water-system';
import type { InputState, VehicleKind } from '../types/game';
import { ISLAND_GROUND_Y } from '../world/miami-layout';
import type { PhysicsWorld } from '../world/physics-world';
import { RaycastCar } from './raycast-car';
import { BuoyantWatercraft } from './watercraft';

export type ManagedVehicle = RaycastCar | BuoyantWatercraft;

export class VehicleManager {
  public readonly vehicles: ManagedVehicle[] = [];
  public activeVehicle: ManagedVehicle | null = null;

  spawnMiamiFleet(
    scene: THREE.Scene,
    physics: PhysicsWorld,
    assets: AssetLibrary,
  ): void {
    // 1. Land Cars along Ocean Blvd, Brickell Ave & Bayside Marina
    this.vehicles.push(
      new RaycastCar(
        'car_ocean_surf',
        'convertible',
        { x: 32.2, y: ISLAND_GROUND_Y + 0.65, z: -18 },
        0,
        scene,
        physics,
        assets,
      ),
      new RaycastCar(
        'car_ocean_south',
        'suv',
        { x: 37.8, y: ISLAND_GROUND_Y + 0.65, z: 22 },
        Math.PI,
        scene,
        physics,
        assets,
      ),
      new RaycastCar(
        'car_bayside_causeway',
        'convertible',
        { x: -30.5, y: ISLAND_GROUND_Y + 0.65, z: 36.5 },
        -Math.PI * 0.5,
        scene,
        physics,
        assets,
      ),
      new RaycastCar(
        'car_brickell_bodega',
        'convertible',
        { x: -63.5, y: ISLAND_GROUND_Y + 0.65, z: -28 },
        0,
        scene,
        physics,
        assets,
      ),
    );

    // 2. Jet Skis & Center-Console Speedboats at Marina Docks, Venetian Canals & Atlantic Beach!
    this.vehicles.push(
      new BuoyantWatercraft(
        'jetski_bayside_marina',
        'jetski',
        { x: -12.8, y: 0.25, z: 20.0 },
        0,
        scene,
        physics,
        assets,
      ),
      new BuoyantWatercraft(
        'speedboat_bayside_marina',
        'speedboat',
        { x: -11.2, y: 0.35, z: 27.5 },
        0,
        scene,
        physics,
        assets,
      ),
      new BuoyantWatercraft(
        'jetski_ocean_slip',
        'jetski',
        { x: -4.6, y: 0.25, z: -13.5 },
        Math.PI,
        scene,
        physics,
        assets,
      ),
      new BuoyantWatercraft(
        'speedboat_ocean_slip',
        'speedboat',
        { x: -5.4, y: 0.35, z: -21.5 },
        Math.PI,
        scene,
        physics,
        assets,
      ),
      new BuoyantWatercraft(
        'jetski_atlantic_surf',
        'jetski',
        { x: 66.5, y: 0.25, z: 10.0 },
        -Math.PI * 0.5,
        scene,
        physics,
        assets,
      ),
      new BuoyantWatercraft(
        'speedboat_atlantic_offshore',
        'speedboat',
        { x: 74.0, y: 0.35, z: -12.0 },
        0,
        scene,
        physics,
        assets,
      ),
    );
  }

  findNearestBoardable(pos: THREE.Vector3, maxDist = 4.8): ManagedVehicle | null {
    if (this.activeVehicle) return null;
    let best: { v: ManagedVehicle; dist: number } | null = null;
    for (const v of this.vehicles) {
      const vp = v.getPosition();
      const d = Math.hypot(pos.x - vp.x, pos.y - vp.y, pos.z - vp.z);
      if (d <= maxDist && (!best || d < best.dist)) {
        best = { v, dist: d };
      }
    }
    return best ? best.v : null;
  }

  boardVehicle(vehicle: ManagedVehicle, player: PlayerController): void {
    this.activeVehicle = vehicle;
    player.phase = 'driving';
    player.rig.root.visible = true;
    vehicle.seatAnchor.add(player.rig.root);
    player.rig.root.position.set(0, 0, 0);
    player.rig.root.rotation.set(0, 0, 0);
    player.yaw = vehicle.getHeadingYaw();
  }

  exitActiveVehicle(
    scene: THREE.Scene,
    player: PlayerController,
    physics: PhysicsWorld,
    timeSec: number,
  ): void {
    const v = this.activeVehicle;
    if (!v) return;
    this.activeVehicle = null;

    scene.add(player.rig.root);
    const vp = v.getPosition();
    const rightSide = new THREE.Vector3(-1.95, 0.8, 0).applyQuaternion(v.root.quaternion).add(vp);

    const groundHit = physics.raycast(
      { x: rightSide.x, y: rightSide.y + 2.5, z: rightSide.z },
      { x: 0, y: -1, z: 0 },
      6.0,
      v.body,
    );
    const wave = sampleWaterWave(rightSide.x, rightSide.z, timeSec);

    if (groundHit && groundHit.point.y >= wave.height - 0.75) {
      player.teleportTo(rightSide.x, groundHit.point.y, rightSide.z, 'grounded');
    } else {
      player.teleportTo(rightSide.x, wave.height - 0.72, rightSide.z, 'swimming');
    }
  }

  update(
    dt: number,
    timeSec: number,
    physics: PhysicsWorld,
    player: PlayerController,
    input: InputState,
  ): void {
    for (const v of this.vehicles) {
      const driverInput = v === this.activeVehicle ? input : null;
      if (v instanceof RaycastCar) {
        v.stepPhysics(dt, timeSec, physics, driverInput);
      } else {
        v.stepPhysics(dt, timeSec, driverInput);
      }
    }

    if (this.activeVehicle) {
      const vp = this.activeVehicle.getPosition();
      player.position.copy(vp);
      const lv = this.activeVehicle.body.linvel();
      player.velocity.set(lv.x, lv.y, lv.z);

      // Update seated steering animation on the player's rig inside the cockpit/saddle!
      player.animator.update(player.rig, {
        dt,
        timeSec,
        phase: 'driving',
        planarSpeed: Math.abs(this.activeVehicle.speedMps),
        forwardSpeed: this.activeVehicle.speedMps,
        strafeSpeed: 0,
        verticalSpeed: lv.y,
        yawRate: 0,
        crouchAmount: 0,
        aimAmount: 0,
        aimPitchRad: player.pitch,
        armed: false,
        recoilImpulse: 0,
        steerInput: input.right,
        leftGroundDeltaY: 0,
        rightGroundDeltaY: 0,
        groundSlopePitchRad: 0,
      });

      if (Math.abs(this.activeVehicle.speedMps) > 1.2 && Math.abs(input.yawDelta) < 0.001) {
        player.alignYawSmoothly(this.activeVehicle.getHeadingYaw(), dt * 0.65);
      }
    }
  }

  getActiveKind(): VehicleKind | null {
    return this.activeVehicle ? this.activeVehicle.getKind() : null;
  }

  getActiveSpeedKmh(): number {
    return this.activeVehicle ? Math.abs(this.activeVehicle.speedMps) * 3.6 : 0;
  }
}
