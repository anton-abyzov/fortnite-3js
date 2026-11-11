import * as THREE from 'three';
import { ensureThreeBvhPatched } from '../assets/asset-loader';
import { SeededRng } from '../core/rng';
import type { MiamiMaterialSet } from '../rendering/materials';
import { FoliageAndPropsSystem } from './foliage-props';
import {
  CANAL_BED_Y,
  DOCK_DECK_Y,
  ISLAND_GROUND_Y,
  MIAMI_BRIDGES,
  MIAMI_DOCKS,
  MIAMI_ISLANDS,
  OCEAN_BED_Y,
} from './miami-layout';
import type { PhysicsWorld } from './physics-world';
import { ShopManager } from './shops';

export interface BuiltMiamiWorld {
  worldGroup: THREE.Group;
  shops: ShopManager;
  foliage: FoliageAndPropsSystem;
}

export function buildMiamiWorld(
  scene: THREE.Scene,
  physics: PhysicsWorld,
  materials: MiamiMaterialSet,
): BuiltMiamiWorld {
  ensureThreeBvhPatched();
  const worldGroup = new THREE.Group();
  worldGroup.name = 'miami_coastal_world';
  scene.add(worldGroup);

  // 1. Continuous sandy seabed & canal floor so shallow caustics & path-tracer refraction shine
  const canalBedMesh = new THREE.Mesh(new THREE.BoxGeometry(360, 1.0, 360), materials.sand);
  canalBedMesh.position.set(-10, CANAL_BED_Y - 0.5, 0);
  canalBedMesh.receiveShadow = true;
  worldGroup.add(canalBedMesh);
  physics.addFixedBox({ x: -10, y: CANAL_BED_Y - 0.5, z: 0 }, { x: 180, y: 0.5, z: 180 }, 'sand');

  const oceanBedMesh = new THREE.Mesh(new THREE.BoxGeometry(240, 1.0, 380), materials.sand);
  oceanBedMesh.position.set(165, OCEAN_BED_Y - 0.5, 0);
  oceanBedMesh.receiveShadow = true;
  worldGroup.add(oceanBedMesh);
  physics.addFixedBox({ x: 165, y: OCEAN_BED_Y - 0.5, z: 0 }, { x: 120, y: 0.5, z: 190 }, 'sand');

  // 2. Miami Island Plates + Concrete Seawall Quays
  for (const isl of MIAMI_ISLANDS) {
    const sx = isl.maxX - isl.minX;
    const sz = isl.maxZ - isl.minZ;
    const cx = (isl.minX + isl.maxX) * 0.5;
    const cz = (isl.minZ + isl.maxZ) * 0.5;
    const sy = isl.topY - CANAL_BED_Y;
    const cy = CANAL_BED_Y + sy * 0.5;

    const plate = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), materials.sidewalk);
    plate.position.set(cx, cy, cz);
    plate.receiveShadow = true;
    plate.castShadow = true;
    worldGroup.add(plate);

    physics.addFixedBox(
      { x: cx, y: cy, z: cz },
      { x: sx * 0.5, y: sy * 0.5, z: sz * 0.5 },
      'concrete',
    );

    // Seawall coping trim along island perimeter
    const coping = new THREE.Mesh(
      new THREE.BoxGeometry(sx + 0.35, 0.28, sz + 0.35),
      materials.canalWall,
    );
    coping.position.set(cx, isl.topY - 0.12, cz);
    coping.receiveShadow = true;
    worldGroup.add(coping);
  }

  // 3. Sloping Sandy Atlantic Beach along South Beach / Central Ocean Drive (X = 47 .. 92, Z in [-72, 72])
  const beachRunX = 45;
  const beachDropY = ISLAND_GROUND_Y - OCEAN_BED_Y;
  const beachHyp = Math.hypot(beachRunX, beachDropY);
  const beachAngle = Math.atan2(beachDropY, beachRunX);
  const beachCenterX = 47 + beachRunX * 0.5;
  const beachCenterY = ISLAND_GROUND_Y - beachDropY * 0.5 - 0.35;

  const beachSlope = new THREE.Mesh(new THREE.BoxGeometry(beachHyp, 0.8, 144), materials.sand);
  beachSlope.position.set(beachCenterX, beachCenterY, 0);
  beachSlope.rotation.z = -beachAngle;
  beachSlope.receiveShadow = true;
  worldGroup.add(beachSlope);

  physics.addFixedBox(
    { x: beachCenterX, y: beachCenterY, z: 0 },
    { x: beachHyp * 0.5, y: 0.4, z: 72 },
    'sand',
    { z: -beachAngle },
    0.92,
  );

  // 4. Paved Coastal Boulevards & Avenues (Ocean Blvd X=35, Brickell Ave X=-66, Causeway East-West Z=+-38)
  const addRoadStrip = (cx: number, cz: number, sx: number, sz: number) => {
    const road = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.08, sz), materials.asphalt);
    road.position.set(cx, ISLAND_GROUND_Y + 0.03, cz);
    road.receiveShadow = true;
    worldGroup.add(road);
    physics.addFixedBox(
      { x: cx, y: ISLAND_GROUND_Y + 0.02, z: cz },
      { x: sx * 0.5, y: 0.04, z: sz * 0.5 },
      'asphalt',
      undefined,
      1.05,
    );
  };

  // Ocean Blvd segments across Barrier Island
  addRoadStrip(35, 0, 11, 140);
  addRoadStrip(35, -118, 11, 34);
  addRoadStrip(35, 118, 11, 34);
  // Brickell Ave North & South
  addRoadStrip(-66, -75, 12, 118);
  addRoadStrip(-66, 75, 12, 118);
  // East-West Causeway Boulevards connecting Brickell to Ocean Drive bridges
  addRoadStrip(-78, -38, 104, 11);
  addRoadStrip(-78, 38, 104, 11);

  // 5. Arched Venetian & Inlet Bridges (cars drive OVER at Y=5.4m, boats pass UNDER Y=0..5.0m!)
  for (const br of MIAMI_BRIDGES) {
    const rise = br.deckY - br.baseY;
    const rampAngle = Math.atan2(rise, br.rampLength);
    const rampHyp = Math.hypot(br.rampLength, rise);
    const deckThick = 0.42;

    if (br.axis === 'x') {
      // Flat elevated center span over canal
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(br.spanLength, deckThick, br.width),
        materials.asphalt,
      );
      deck.position.set(br.centerX, br.deckY - deckThick * 0.5, br.centerZ);
      deck.castShadow = true;
      deck.receiveShadow = true;
      worldGroup.add(deck);
      physics.addFixedBox(
        { x: br.centerX, y: br.deckY - deckThick * 0.5, z: br.centerZ },
        { x: br.spanLength * 0.5, y: deckThick * 0.5, z: br.width * 0.5 },
        'asphalt',
        undefined,
        1.05,
      );

      // Guardrails along north & south edges of span
      for (const side of [-1, 1]) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(br.spanLength, 0.85, 0.28),
          materials.canalWall,
        );
        rail.position.set(br.centerX, br.deckY + 0.42, br.centerZ + side * (br.width * 0.5 - 0.14));
        rail.castShadow = true;
        worldGroup.add(rail);
        physics.addFixedBox(
          { x: br.centerX, y: br.deckY + 0.42, z: br.centerZ + side * (br.width * 0.5 - 0.14) },
          { x: br.spanLength * 0.5, y: 0.42, z: 0.14 },
          'concrete',
        );
      }

      // West (-X) and East (+X) smooth approach ramps
      for (const sign of [-1, 1]) {
        const rx = br.centerX + sign * (br.spanLength * 0.5 + br.rampLength * 0.5);
        const ry = br.baseY + rise * 0.5 - deckThick * 0.5;
        const rotZ = -sign * rampAngle;

        const ramp = new THREE.Mesh(
          new THREE.BoxGeometry(rampHyp + 0.4, deckThick, br.width),
          materials.asphalt,
        );
        ramp.position.set(rx, ry, br.centerZ);
        ramp.rotation.z = rotZ;
        ramp.castShadow = true;
        ramp.receiveShadow = true;
        worldGroup.add(ramp);

        physics.addFixedBox(
          { x: rx, y: ry, z: br.centerZ },
          { x: (rampHyp + 0.4) * 0.5, y: deckThick * 0.5, z: br.width * 0.5 },
          'asphalt',
          { z: rotZ },
          1.05,
        );
      }
    } else {
      // Axis 'z' bridge
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(br.width, deckThick, br.spanLength),
        materials.asphalt,
      );
      deck.position.set(br.centerX, br.deckY - deckThick * 0.5, br.centerZ);
      deck.castShadow = true;
      deck.receiveShadow = true;
      worldGroup.add(deck);
      physics.addFixedBox(
        { x: br.centerX, y: br.deckY - deckThick * 0.5, z: br.centerZ },
        { x: br.width * 0.5, y: deckThick * 0.5, z: br.spanLength * 0.5 },
        'asphalt',
        undefined,
        1.05,
      );

      for (const side of [-1, 1]) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.85, br.spanLength),
          materials.canalWall,
        );
        rail.position.set(br.centerX + side * (br.width * 0.5 - 0.14), br.deckY + 0.42, br.centerZ);
        rail.castShadow = true;
        worldGroup.add(rail);
        physics.addFixedBox(
          { x: br.centerX + side * (br.width * 0.5 - 0.14), y: br.deckY + 0.42, z: br.centerZ },
          { x: 0.14, y: 0.42, z: br.spanLength * 0.5 },
          'concrete',
        );
      }

      for (const sign of [-1, 1]) {
        const rz = br.centerZ + sign * (br.spanLength * 0.5 + br.rampLength * 0.5);
        const ry = br.baseY + rise * 0.5 - deckThick * 0.5;
        const rotX = sign * rampAngle;

        const ramp = new THREE.Mesh(
          new THREE.BoxGeometry(br.width, deckThick, rampHyp + 0.4),
          materials.asphalt,
        );
        ramp.position.set(br.centerX, ry, rz);
        ramp.rotation.x = rotX;
        ramp.castShadow = true;
        ramp.receiveShadow = true;
        worldGroup.add(ramp);

        physics.addFixedBox(
          { x: br.centerX, y: ry, z: rz },
          { x: br.width * 0.5, y: deckThick * 0.5, z: (rampHyp + 0.4) * 0.5 },
          'asphalt',
          { x: rotX },
          1.05,
        );
      }
    }
  }

  // 6. Wooden Marina Docks + Access Ramps from Island Quay (Y=2.2m) down to Water Pier (Y=0.68m)
  for (const dock of MIAMI_DOCKS) {
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(dock.sizeX, 0.28, dock.sizeZ),
      materials.woodDock,
    );
    deck.position.set(dock.centerX, DOCK_DECK_Y, dock.centerZ);
    deck.castShadow = true;
    deck.receiveShadow = true;
    worldGroup.add(deck);

    physics.addFixedBox(
      { x: dock.centerX, y: DOCK_DECK_Y, z: dock.centerZ },
      { x: dock.sizeX * 0.5, y: 0.14, z: dock.sizeZ * 0.5 },
      'wood',
    );

    // Gangway ramp connecting island quay to floating timber dock
    const rise = ISLAND_GROUND_Y - DOCK_DECK_Y;
    const run = 4.4;
    const hyp = Math.hypot(run, rise);
    const ang = Math.atan2(rise, run);
    const attachDir = dock.stairAttachSide === 'west' ? -1 : 1;
    const gx = dock.centerX + attachDir * (dock.sizeX * 0.5 + run * 0.35);
    const gy = DOCK_DECK_Y + rise * 0.5;

    const gangway = new THREE.Mesh(new THREE.BoxGeometry(hyp, 0.2, 2.4), materials.woodDock);
    gangway.position.set(gx, gy, dock.centerZ);
    gangway.rotation.z = -attachDir * ang;
    gangway.castShadow = true;
    worldGroup.add(gangway);

    physics.addFixedBox(
      { x: gx, y: gy, z: dock.centerZ },
      { x: hyp * 0.5, y: 0.1, z: 1.2 },
      'wood',
      { z: -attachDir * ang },
    );
  }

  // 7. Art Deco Ocean Drive Hotels & Contemporary Brickell Waterfront Skyline Towers
  buildMiamiSkylineBlocks(worldGroup, physics, materials);

  // 8. Four Open-Doorway Enterable Interactive Shops
  const shops = new ShopManager();
  shops.buildAllShops(worldGroup, materials, physics);

  // 9. Swaying Royal Palms, Lifeguard Towers, Umbrellas & Dynamic Physics Crates
  const foliage = new FoliageAndPropsSystem();
  foliage.populateBeachAndStreetProps(worldGroup, materials, physics);

  // Compute MeshBVH for every static mesh so raycasts & GPU path-tracer run fast
  worldGroup.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const m = obj as THREE.Mesh;
      if (m.geometry && !m.geometry.boundsTree) {
        m.geometry.computeBoundsTree();
      }
    }
  });

  return { worldGroup, shops, foliage };
}

function buildMiamiSkylineBlocks(
  worldGroup: THREE.Group,
  physics: PhysicsWorld,
  materials: MiamiMaterialSet,
): void {
  const rng = new SeededRng(0x88305);
  const artDecoPalette = [0xf8d5c8, 0xc9f0e8, 0xfbe7b2, 0xe2d4f4, 0xf5f1e8];
  const neonPalette = [0x0ea5b7, 0xff6b57, 0xf78fb3, 0xffbe3d];

  interface TowerPlacement {
    x: number;
    z: number;
    sx: number;
    sz: number;
    sy: number;
    glass: boolean;
  }

  // Carefully placed outside roads, bridges, and the 4 enterable shops!
  const towers: TowerPlacement[] = [
    // Ocean Drive Art Deco Boutique Hotels (low-to-mid rise with neon verticals)
    { x: 18, z: -56, sx: 13, sz: 16, sy: 14, glass: false },
    { x: 18, z: 0, sx: 12, sz: 14, sy: 12, glass: false },
    { x: 18, z: 56, sx: 13, sz: 16, sy: 15, glass: false },
    { x: 20, z: -118, sx: 14, sz: 16, sy: 18, glass: true },
    { x: 20, z: 118, sx: 14, sz: 16, sy: 16, glass: false },
    // Brickell Luxury Waterfront Glass & Limestone Condominiums (West Island)
    { x: -94, z: -88, sx: 18, sz: 20, sy: 38, glass: true },
    { x: -94, z: -60, sx: 16, sz: 16, sy: 28, glass: false },
    { x: -44, z: -88, sx: 16, sz: 18, sy: 30, glass: true },
    { x: -94, z: 62, sx: 18, sz: 18, sy: 34, glass: true },
    { x: -94, z: 94, sx: 18, sz: 20, sy: 42, glass: true },
    { x: -44, z: 88, sx: 16, sz: 18, sy: 26, glass: false },
  ];

  for (const t of towers) {
    const bGroup = new THREE.Group();
    const stuccoColor = rng.pick(artDecoPalette);
    const neonColor = rng.pick(neonPalette);
    const baseMat = materials.createStucco(stuccoColor, 0.62);
    const neonMat = materials.createNeon(neonColor, 2.4);

    // Podium base
    const podiumH = Math.min(5.5, t.sy * 0.35);
    const podium = new THREE.Mesh(new THREE.BoxGeometry(t.sx, podiumH, t.sz), baseMat);
    podium.position.set(t.x, ISLAND_GROUND_Y + podiumH * 0.5, t.z);
    podium.castShadow = true;
    podium.receiveShadow = true;
    bGroup.add(podium);

    // Upper tower shaft (glass curtainwall with balcony slabs or stepped Art Deco setback)
    const upperH = t.sy - podiumH;
    const upperSx = t.sx * 0.84;
    const upperSz = t.sz * 0.84;
    const shaftMat = t.glass ? materials.glassTower : baseMat;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(upperSx, upperH, upperSz), shaftMat);
    shaft.position.set(t.x, ISLAND_GROUND_Y + podiumH + upperH * 0.5, t.z);
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    bGroup.add(shaft);

    // Horizontal wrap-around Miami balcony slabs every 3.6m
    const floorStep = 3.6;
    for (let h = podiumH + floorStep; h < t.sy - 1.5; h += floorStep) {
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(upperSx + 0.9, 0.24, upperSz + 0.9),
        baseMat,
      );
      slab.position.set(t.x, ISLAND_GROUND_Y + h, t.z);
      slab.castShadow = true;
      slab.receiveShadow = true;
      bGroup.add(slab);
    }

    // Vertical Art Deco fin + neon spire accent
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, t.sy + 1.6, 0.32),
      neonMat,
    );
    fin.position.set(t.x + upperSx * 0.5 + 0.12, ISLAND_GROUND_Y + (t.sy + 1.6) * 0.5, t.z);
    bGroup.add(fin);

    worldGroup.add(bGroup);

    physics.addFixedBox(
      { x: t.x, y: ISLAND_GROUND_Y + t.sy * 0.5, z: t.z },
      { x: t.sx * 0.5, y: t.sy * 0.5, z: t.sz * 0.5 },
      'concrete',
    );
  }
}
