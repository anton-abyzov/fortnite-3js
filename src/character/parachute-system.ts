import * as THREE from 'three';
import type { AssetLibrary } from '../assets/asset-loader';
import { clamp, damp, lerp } from '../core/math';
import { AIRCRAFT_FLIGHT_PATH } from '../world/miami-layout';

export const AUTO_DEPLOY_ALTITUDE_Y = 64.0;

export class DropAircraftController {
  public readonly root = new THREE.Group();
  private readonly propLeft: THREE.Mesh;
  private readonly propRight: THREE.Mesh;
  private progressSec = 0;

  constructor(scene: THREE.Scene, assets: AssetLibrary) {
    this.root.name = 'coastal_jump_aircraft';
    const model = assets.instantiate('coastal_aircraft');
    this.root.add(model);

    const propGeo = new THREE.BoxGeometry(2.3, 0.14, 0.08);
    const propMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.65,
    });
    this.propLeft = new THREE.Mesh(propGeo, propMat);
    this.propLeft.position.set(-3.4, 0.85, -3.2);
    this.propRight = new THREE.Mesh(propGeo, propMat);
    this.propRight.position.set(3.4, 0.85, -3.2);
    this.root.add(this.propLeft, this.propRight);

    scene.add(this.root);
    this.update(0);
  }

  reset(): void {
    this.progressSec = 0;
    this.update(0);
  }

  update(dt: number): { position: THREE.Vector3; headingRad: number; finishedPass: boolean } {
    this.progressSec += dt;
    const dx = AIRCRAFT_FLIGHT_PATH.end.x - AIRCRAFT_FLIGHT_PATH.start.x;
    const dz = AIRCRAFT_FLIGHT_PATH.end.z - AIRCRAFT_FLIGHT_PATH.start.z;
    const totalDist = Math.hypot(dx, dz);
    const traveled = this.progressSec * AIRCRAFT_FLIGHT_PATH.speedMps;
    const t = clamp(traveled / totalDist, 0, 1);

    this.root.position.set(
      lerp(AIRCRAFT_FLIGHT_PATH.start.x, AIRCRAFT_FLIGHT_PATH.end.x, t),
      AIRCRAFT_FLIGHT_PATH.start.y + Math.sin(this.progressSec * 1.4) * 0.45,
      lerp(AIRCRAFT_FLIGHT_PATH.start.z, AIRCRAFT_FLIGHT_PATH.end.z, t),
    );

    const headingRad = Math.atan2(-dx, -dz);
    this.root.rotation.y = headingRad;
    this.propLeft.rotation.z += dt * 42;
    this.propRight.rotation.z -= dt * 42;

    return {
      position: this.root.position,
      headingRad,
      finishedPass: t >= 0.96,
    };
  }
}

/**
 * 7-cell ram-air parafoil wing canopy + 8 suspension risers attached to character harness.
 */
export class ParachuteCanopyVisual {
  public readonly root = new THREE.Group();
  private deployScale = 0;

  constructor() {
    this.root.name = 'ram_air_canopy';
    this.root.visible = false;

    const colors = [0x0ea5b7, 0xf8fafc, 0xff6b57, 0xf8fafc, 0xff6b57, 0xf8fafc, 0x0ea5b7];
    const cellWidth = 0.62;
    const spanZ = 1.95;

    for (let i = 0; i < 7; i++) {
      const offsetIdx = i - 3;
      const archY = 3.25 - Math.abs(offsetIdx) * Math.abs(offsetIdx) * 0.055;
      const archRoll = -offsetIdx * 0.085;
      const cellMat = new THREE.MeshStandardMaterial({
        color: colors[i],
        roughness: 0.52,
        metalness: 0.04,
        side: THREE.DoubleSide,
      });

      const cell = new THREE.Mesh(new THREE.BoxGeometry(cellWidth * 0.96, 0.24, spanZ), cellMat);
      cell.position.set(offsetIdx * cellWidth, archY, 0);
      cell.rotation.z = archRoll;
      cell.castShadow = true;
      this.root.add(cell);
    }

    // Suspension riser cords connecting shoulder harness (Y=1.38) to canopy cells (Y=3.2)
    const cordMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    for (const sx of [-1.6, -0.65, 0.65, 1.6]) {
      for (const sz of [-0.65, 0.65]) {
        const dx = sx - Math.sign(sx) * 0.16;
        const dy = 3.12 - 1.38;
        const dz = sz;
        const len = Math.hypot(dx, dy, dz);
        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 5), cordMat);
        cord.position.set(Math.sign(sx) * 0.16 + dx * 0.5, 1.38 + dy * 0.5, dz * 0.5);
        cord.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(dx, dy, dz).normalize(),
        );
        this.root.add(cord);
      }
    }
  }

  update(dt: number, deployed: boolean, steerInput: number, flareAmount: number): void {
    if (!deployed) {
      this.deployScale = 0;
      this.root.visible = false;
      return;
    }

    this.root.visible = true;
    this.deployScale = damp(this.deployScale, 1, 9.5, dt);
    const s = Math.max(0.05, this.deployScale);
    this.root.scale.set(s, s, s);
    this.root.rotation.z = clamp(-steerInput * 0.36, -0.42, 0.42);
    this.root.rotation.x = flareAmount * 0.22;
  }
}
