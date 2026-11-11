import * as THREE from 'three';
import { SeededRng } from '../core/rng';
import type { MiamiMaterialSet } from '../rendering/materials';
import type { PhysicsWorld } from './physics-world';

export class FoliageAndPropsSystem {
  private readonly palmCrowns: THREE.Object3D[] = [];

  buildPalmTree(
    x: number,
    y: number,
    z: number,
    height: number,
    leanAngle: number,
    leanYaw: number,
    materials: MiamiMaterialSet,
    physics: PhysicsWorld,
  ): THREE.Group {
    const root = new THREE.Group();
    root.position.set(x, y, z);

    const segments = 6;
    const segHeight = height / segments;
    let curX = 0;
    let curY = 0;
    let curZ = 0;

    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const rBottom = 0.24 * (1 - t * 0.42);
      const rTop = 0.24 * (1 - ((i + 1) / segments) * 0.42);
      const segGeo = new THREE.CylinderGeometry(rTop, rBottom, segHeight * 1.06, 7);
      const seg = new THREE.Mesh(segGeo, materials.palmBark);
      const bend = leanAngle * (t + 0.2);
      const dx = Math.cos(leanYaw) * Math.sin(bend) * segHeight;
      const dz = Math.sin(leanYaw) * Math.sin(bend) * segHeight;
      const dy = Math.cos(bend) * segHeight;

      seg.position.set(curX + dx * 0.5, curY + dy * 0.5, curZ + dz * 0.5);
      seg.rotation.z = -Math.cos(leanYaw) * bend;
      seg.rotation.x = Math.sin(leanYaw) * bend;
      seg.castShadow = true;
      seg.receiveShadow = true;
      root.add(seg);

      curX += dx;
      curY += dy;
      curZ += dz;
    }

    // Trunk physics collider
    physics.addFixedBox(
      { x, y: y + height * 0.42, z },
      { x: 0.26, y: height * 0.42, z: 0.26 },
      'wood',
    );

    const crown = new THREE.Group();
    crown.position.set(curX, curY, curZ);
    const frondCount = 9;
    for (let f = 0; f < frondCount; f++) {
      const yaw = (f / frondCount) * Math.PI * 2 + (f % 2) * 0.18;
      const frondHolder = new THREE.Group();
      frondHolder.rotation.y = yaw;

      const blade = new THREE.Mesh(
        new THREE.ConeGeometry(0.42, 2.75, 4),
        materials.palmFrond,
      );
      blade.scale.set(1.0, 1.0, 0.16);
      blade.rotation.z = -Math.PI * 0.42;
      blade.position.set(1.25, -0.18, 0);
      blade.castShadow = true;
      frondHolder.add(blade);
      crown.add(frondHolder);
    }

    root.add(crown);
    this.palmCrowns.push(crown);
    return root;
  }

  buildLifeguardTower(
    x: number,
    y: number,
    z: number,
    accentHex: number,
    materials: MiamiMaterialSet,
    physics: PhysicsWorld,
  ): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const woodMat = materials.woodDock;
    const cabinMat = materials.createStucco(accentHex, 0.55);
    const trimMat = materials.createStucco(0xffffff, 0.45);

    // 4 stilts + elevated deck
    for (const sx of [-1.1, 1.1]) {
      for (const sz of [-1.1, 1.1]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 0.18), woodMat);
        post.position.set(sx, 0.9, sz);
        post.castShadow = true;
        group.add(post);
      }
    }

    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.18, 3.1), woodMat);
    deck.position.set(0, 1.85, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    group.add(deck);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.1, 2.2), cabinMat);
    cabin.position.set(0, 2.98, 0);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    group.add(cabin);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.15, 0.95, 4), trimMat);
    roof.rotation.y = Math.PI * 0.25;
    roof.position.set(0, 4.48, 0);
    roof.castShadow = true;
    group.add(roof);

    const ramp = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 2.6), woodMat);
    ramp.position.set(0, 0.95, -2.25);
    ramp.rotation.x = 0.64;
    ramp.castShadow = true;
    group.add(ramp);

    physics.addFixedBox(
      { x, y: y + 2.1, z },
      { x: 1.35, y: 2.1, z: 1.35 },
      'wood',
    );

    return group;
  }

  populateBeachAndStreetProps(
    parent: THREE.Object3D,
    materials: MiamiMaterialSet,
    physics: PhysicsWorld,
  ): void {
    const rng = new SeededRng(0x305b1a);
    const umbrellaColors = [0xff5e4d, 0x0ea5b7, 0xffbe3d, 0xf78fb3, 0x38c695];

    // Palm colonnade along Ocean Blvd (X = 30 & X = 44), Brickell Ave, and Marina promenades
    const palmSpots: Array<[number, number, number]> = [];
    for (let z = -66; z <= 66; z += 14) {
      palmSpots.push([29.5, 2.2, z]);
      palmSpots.push([45.5, 2.2, z + 4]);
    }
    for (let z = -124; z <= 124; z += 20) {
      if (Math.abs(z) > 18) {
        palmSpots.push([-27.5, 2.2, z]);
        palmSpots.push([-56.0, 2.2, z]);
      }
    }

    for (const [px, py, pz] of palmSpots) {
      const palm = this.buildPalmTree(
        px,
        py,
        pz,
        rng.range(7.4, 10.6),
        rng.range(0.08, 0.24),
        rng.range(0, Math.PI * 2),
        materials,
        physics,
      );
      parent.add(palm);
    }

    // Iconic Miami Beach Lifeguard Towers along the sandy shoreline
    const towerColors = [0xff6b5b, 0x2ec4b6, 0xffca3a];
    [-44, 0, 44].forEach((z, idx) => {
      const tower = this.buildLifeguardTower(53.5, 1.55, z, towerColors[idx], materials, physics);
      parent.add(tower);
    });

    // Beach umbrellas + loungers
    for (let z = -54; z <= 54; z += 12) {
      if (Math.abs(z) < 6 || Math.abs(Math.abs(z) - 44) < 6) continue;
      const ux = rng.range(51.5, 55.5);
      const groundY = 2.2 * (1 - Math.max(0, (ux - 48) / 44)) + -6.8 * Math.max(0, (ux - 48) / 44);
      const umbrella = new THREE.Group();
      umbrella.position.set(ux, groundY, z);

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.3, 6),
        materials.createStucco(0xf5f5f5, 0.4),
      );
      pole.position.y = 1.15;
      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(1.55, 0.55, 8),
        materials.createStucco(rng.pick(umbrellaColors), 0.65),
      );
      canopy.position.y = 2.25;
      canopy.castShadow = true;
      umbrella.add(pole, canopy);
      parent.add(umbrella);
    }

    // Dynamic physics crates near docks & storefronts (react to bullets, cars, and footsteps)
    const crateMat = materials.woodDock;
    const crateCoords: Array<[number, number, number]> = [
      [-25.5, 2.8, 19.5],
      [-25.5, 2.8, 21.0],
      [16.5, 2.8, -16.5],
      [-32.0, 2.8, -24.5],
      [16.5, 2.8, 22.0],
    ];
    for (const [cx, cy, cz] of crateCoords) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), crateMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(cx, cy, cz);
      parent.add(mesh);
      physics.addDynamicCrate({ x: cx, y: cy, z: cz }, { x: 0.45, y: 0.45, z: 0.45 }, mesh, 16, 'wood');
    }
  }

  update(timeSec: number): void {
    for (let i = 0; i < this.palmCrowns.length; i++) {
      const crown = this.palmCrowns[i];
      crown.rotation.z = Math.sin(timeSec * 1.65 + i * 0.9) * 0.045;
      crown.rotation.x = Math.cos(timeSec * 1.35 + i * 0.7) * 0.035;
    }
  }
}
