import * as THREE from 'three';
import { clamp } from '../core/math';

export class TropicalStormZone {
  public readonly center = new THREE.Vector2(4, 0);
  public radius = 175;
  public readonly minRadius = 26;
  public readonly shrinkSpeedMps = 0.72;
  public readonly wallMesh: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    const geo = new THREE.CylinderGeometry(1, 1, 160, 64, 1, true);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0ea5b7,
      emissive: new THREE.Color(0x09738a),
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 0.4,
    });

    this.wallMesh = new THREE.Mesh(geo, mat);
    this.wallMesh.name = 'tropical_storm_wall';
    this.wallMesh.position.set(this.center.x, 72, this.center.y);
    this.wallMesh.scale.set(this.radius, 1, this.radius);
    scene.add(this.wallMesh);
  }

  update(dt: number, active: boolean): void {
    if (active && this.radius > this.minRadius) {
      this.radius = clamp(this.radius - this.shrinkSpeedMps * dt, this.minRadius, 220);
    }
    this.wallMesh.scale.set(this.radius, 1, this.radius);
  }

  isOutside(x: number, z: number): boolean {
    return Math.hypot(x - this.center.x, z - this.center.y) > this.radius;
  }
}
