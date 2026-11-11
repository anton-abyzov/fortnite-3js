import * as THREE from 'three';
import type { MiamiMaterialSet } from '../rendering/materials';
import type { ShopDefinition, ShopItemSpec, Vec3Like } from '../types/game';
import { ISLAND_GROUND_Y } from './miami-layout';
import type { PhysicsWorld } from './physics-world';

export const MIAMI_SHOPS: ShopDefinition[] = [
  {
    id: 'surf_tactical',
    name: 'Biscayne Surf & Outfitter',
    subtitle: 'Coastal Gear & Rifles',
    themeColor: '#0EA5B7',
    accentHex: 0x0ea5b7,
    center: { x: 20, y: ISLAND_GROUND_Y, z: -22 },
    size: { x: 12, y: 4.6, z: 14 },
    doorSide: 'east',
    hasRooftopStairs: false,
    items: [
      {
        id: 'surf_carbine',
        label: 'Coastal Carbine',
        kind: 'weapon',
        weaponId: 'carbine',
        position: { x: 17.2, y: ISLAND_GROUND_Y + 1.05, z: -25.2 },
        collected: false,
      },
      {
        id: 'surf_shotgun',
        label: 'Breacher Shotgun',
        kind: 'weapon',
        weaponId: 'shotgun',
        position: { x: 17.2, y: ISLAND_GROUND_Y + 1.05, z: -18.8 },
        collected: false,
      },
      {
        id: 'surf_ammo',
        label: 'Reserve Ammo Case',
        kind: 'ammo',
        position: { x: 21.5, y: ISLAND_GROUND_Y + 0.65, z: -26.4 },
        collected: false,
      },
      {
        id: 'surf_register',
        label: 'Ring Outfitter Register (+Shield & Ammo)',
        kind: 'register',
        position: { x: 18.4, y: ISLAND_GROUND_Y + 1.15, z: -22.0 },
        collected: false,
      },
    ],
  },
  {
    id: 'calle_ocho_bodega',
    name: 'Calle Ocho Espresso & Bodega',
    subtitle: 'Cafecito, Meds & Kevlar',
    themeColor: '#FF6B57',
    accentHex: 0xff6b57,
    center: { x: -42, y: ISLAND_GROUND_Y, z: -28 },
    size: { x: 12, y: 4.6, z: 14 },
    doorSide: 'east',
    hasRooftopStairs: false,
    items: [
      {
        id: 'bodega_cafecito_1',
        label: 'Cuban Cafecito (+35% Speed Boost)',
        kind: 'cafecito',
        position: { x: -44.6, y: ISLAND_GROUND_Y + 1.1, z: -30.5 },
        collected: false,
      },
      {
        id: 'bodega_medkit',
        label: 'Trauma Medkit (+50 HP)',
        kind: 'medkit',
        position: { x: -44.6, y: ISLAND_GROUND_Y + 1.1, z: -25.5 },
        collected: false,
      },
      {
        id: 'bodega_smg',
        label: 'Biscayne SMG',
        kind: 'weapon',
        weaponId: 'smg',
        position: { x: -40.2, y: ISLAND_GROUND_Y + 1.05, z: -32.2 },
        collected: false,
      },
      {
        id: 'bodega_register',
        label: 'Ring Bodega Register (+Shield & Cafecito)',
        kind: 'register',
        position: { x: -43.5, y: ISLAND_GROUND_Y + 1.15, z: -28.0 },
        collected: false,
      },
    ],
  },
  {
    id: 'bayside_marine',
    name: 'Bayside Marine & Exotic Lounge',
    subtitle: 'Watercraft Access & Armor',
    themeColor: '#2EC4B6',
    accentHex: 0x2ec4b6,
    center: { x: -38, y: ISLAND_GROUND_Y, z: 24 },
    size: { x: 12, y: 4.6, z: 14 },
    doorSide: 'east',
    hasRooftopStairs: false,
    items: [
      {
        id: 'marine_shield',
        label: 'Coastal Armor Vest (+50 Shield)',
        kind: 'shield',
        position: { x: -40.8, y: ISLAND_GROUND_Y + 1.05, z: 20.5 },
        collected: false,
      },
      {
        id: 'marine_carbine',
        label: 'Coastal Carbine',
        kind: 'weapon',
        weaponId: 'carbine',
        position: { x: -40.8, y: ISLAND_GROUND_Y + 1.05, z: 27.5 },
        collected: false,
      },
      {
        id: 'marine_register',
        label: 'Ring Marina Desk (+Ammo & Shield)',
        kind: 'register',
        position: { x: -39.2, y: ISLAND_GROUND_Y + 1.15, z: 24.0 },
        collected: false,
      },
    ],
  },
  {
    id: 'ocean_drive_rooftop',
    name: 'Ocean Drive Boutique & Rooftop',
    subtitle: 'Marksman Perch & Terrace',
    themeColor: '#F78FB3',
    accentHex: 0xf78fb3,
    center: { x: 20, y: ISLAND_GROUND_Y, z: 24 },
    size: { x: 12, y: 4.6, z: 14 },
    doorSide: 'east',
    hasRooftopStairs: true,
    items: [
      {
        id: 'boutique_shield',
        label: 'Coastal Armor Vest (+50 Shield)',
        kind: 'shield',
        position: { x: 17.5, y: ISLAND_GROUND_Y + 1.05, z: 21.0 },
        collected: false,
      },
      {
        id: 'boutique_register',
        label: 'Ring Boutique Register (+Shield & Medkit)',
        kind: 'register',
        position: { x: 18.6, y: ISLAND_GROUND_Y + 1.15, z: 24.0 },
        collected: false,
      },
      {
        id: 'rooftop_marksman',
        label: 'Reef Marksman Rifle',
        kind: 'weapon',
        weaponId: 'marksman',
        position: { x: 22.0, y: ISLAND_GROUND_Y + 4.6 + 1.05, z: 24.0 },
        collected: false,
      },
    ],
  },
];

export class ShopManager {
  public readonly shops: ShopDefinition[];
  private readonly itemMeshes = new Map<string, THREE.Object3D>();

  constructor() {
    this.shops = MIAMI_SHOPS.map((s) => ({
      ...s,
      items: s.items.map((item) => ({ ...item, collected: false })),
    }));
  }

  buildAllShops(
    parent: THREE.Object3D,
    materials: MiamiMaterialSet,
    physics: PhysicsWorld,
  ): void {
    for (const shop of this.shops) {
      this.buildSingleShop(shop, parent, materials, physics);
    }
  }

  private buildSingleShop(
    shop: ShopDefinition,
    parent: THREE.Object3D,
    materials: MiamiMaterialSet,
    physics: PhysicsWorld,
  ): void {
    const group = new THREE.Group();
    group.name = `shop_${shop.id}`;

    const cx = shop.center.x;
    const cy = shop.center.y;
    const cz = shop.center.z;
    const sx = shop.size.x;
    const sy = shop.size.y;
    const sz = shop.size.z;
    const wallThick = 0.36;
    const doorWidth = 3.8;
    const doorHeight = 3.1;

    const wallMat = materials.createStucco(0xf6f1e7, 0.68);
    const accentMat = materials.createStucco(shop.accentHex, 0.52);
    const neonMat = materials.createNeon(shop.accentHex, 2.8);
    const counterMat = materials.woodDock;

    // Polished terrazzo interior floor slab
    const floor = new THREE.Mesh(new THREE.BoxGeometry(sx - 0.1, 0.16, sz - 0.1), materials.terrazzo);
    floor.position.set(cx, cy + 0.08, cz);
    floor.receiveShadow = true;
    group.add(floor);
    physics.addFixedBox(
      { x: cx, y: cy + 0.04, z: cz },
      { x: sx * 0.5, y: 0.06, z: sz * 0.5 },
      'tile',
    );

    // Ceiling / walkable rooftop deck slab
    const roofY = cy + sy;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(sx + 0.5, 0.36, sz + 0.5), wallMat);
    roof.position.set(cx, roofY, cz);
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);
    physics.addFixedBox(
      { x: cx, y: roofY, z: cz },
      { x: (sx + 0.5) * 0.5, y: 0.18, z: (sz + 0.5) * 0.5 },
      'concrete',
    );

    // Art Deco rooftop eyebrow marquee + neon trim
    const eyebrow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, sz + 1.1), accentMat);
    eyebrow.position.set(cx + sx * 0.5 + 0.35, cy + doorHeight + 0.45, cz);
    eyebrow.castShadow = true;
    group.add(eyebrow);

    const neonBand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, sz + 0.7), neonMat);
    neonBand.position.set(cx + sx * 0.5 + 0.32, roofY + 0.28, cz);
    group.add(neonBand);

    // West back wall (solid)
    this.addWallSegment(
      group,
      physics,
      wallMat,
      cx - sx * 0.5 + wallThick * 0.5,
      cy + sy * 0.5,
      cz,
      wallThick,
      sy,
      sz,
    );

    // North & South side walls (solid)
    this.addWallSegment(
      group,
      physics,
      wallMat,
      cx,
      cy + sy * 0.5,
      cz - sz * 0.5 + wallThick * 0.5,
      sx,
      sy,
      wallThick,
    );
    this.addWallSegment(
      group,
      physics,
      wallMat,
      cx,
      cy + sy * 0.5,
      cz + sz * 0.5 - wallThick * 0.5,
      sx,
      sy,
      wallThick,
    );

    // East storefront wall with wide 3.8m open walk-in doorway + display windows!
    const sideSpanZ = (sz - doorWidth) * 0.5;
    const frontX = cx + sx * 0.5 - wallThick * 0.5;

    // Lower parapet + glass display windows on left & right of open doorway
    for (const sign of [-1, 1]) {
      const segZ = cz + sign * (doorWidth * 0.5 + sideSpanZ * 0.5);
      // Waist-high Art Deco knee wall
      this.addWallSegment(group, physics, accentMat, frontX, cy + 0.55, segZ, wallThick, 1.1, sideSpanZ);
      // Storefront glass pane (collidable so players enter via the wide open doorway)
      this.addWallSegment(
        group,
        physics,
        materials.shopGlass,
        frontX,
        cy + 2.1,
        segZ,
        0.1,
        2.0,
        sideSpanZ - 0.3,
      );
      // Upper header above window
      this.addWallSegment(
        group,
        physics,
        wallMat,
        frontX,
        cy + 3.1 + (sy - 3.1) * 0.5,
        segZ,
        wallThick,
        sy - 3.1,
        sideSpanZ,
      );
    }

    // Lintel header ABOVE the open doorway (doorway itself is completely open Y in [cy, cy + 3.1])
    this.addWallSegment(
      group,
      physics,
      accentMat,
      frontX,
      cy + doorHeight + (sy - doorHeight) * 0.5,
      cz,
      wallThick,
      sy - doorHeight,
      doorWidth,
    );

    // Interior service counter + back shelving + warm interior ceiling fixture
    const counter = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 4.8), counterMat);
    counter.position.set(cx - 1.6, cy + 0.58, cz);
    counter.castShadow = true;
    counter.receiveShadow = true;
    group.add(counter);
    physics.addFixedBox(
      { x: cx - 1.6, y: cy + 0.58, z: cz },
      { x: 0.55, y: 0.5, z: 2.4 },
      'wood',
    );

    // Warm interior point light for inviting storefront glow
    const interiorLight = new THREE.PointLight(0xffe5c4, 8.5, 16, 1.6);
    interiorLight.position.set(cx, cy + sy - 0.55, cz);
    group.add(interiorLight);

    // Optional exterior side staircase up to the Miami Rooftop Lounge!
    if (shop.hasRooftopStairs) {
      const rampLen = 9.2;
      const rise = sy;
      const angle = Math.atan2(rise, rampLen);
      const hyp = Math.hypot(rampLen, rise);
      const stairX = cx;
      const stairZ = cz + sz * 0.5 + 1.15;

      const stairRamp = new THREE.Mesh(new THREE.BoxGeometry(hyp, 0.28, 2.0), accentMat);
      stairRamp.position.set(stairX, cy + rise * 0.5, stairZ);
      stairRamp.rotation.z = -angle;
      stairRamp.castShadow = true;
      stairRamp.receiveShadow = true;
      group.add(stairRamp);

      physics.addFixedBox(
        { x: stairX, y: cy + rise * 0.5, z: stairZ },
        { x: hyp * 0.5, y: 0.16, z: 1.0 },
        'concrete',
        { z: -angle },
      );

      // Rooftop lounge umbrella + low parapet
      const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8), wallMat);
      umbrellaPole.position.set(cx + 2.2, roofY + 1.3, cz - 2.5);
      const umbrellaTop = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.6, 8), accentMat);
      umbrellaTop.position.set(cx + 2.2, roofY + 2.45, cz - 2.5);
      group.add(umbrellaPole, umbrellaTop);
    }

    // Build visual 3D pickup/register props for each shop item
    for (const item of shop.items) {
      const itemNode = this.buildItemVisual(item, materials);
      itemNode.position.set(item.position.x, item.position.y, item.position.z);
      group.add(itemNode);
      this.itemMeshes.set(item.id, itemNode);
    }

    parent.add(group);
  }

  private addWallSegment(
    group: THREE.Group,
    physics: PhysicsWorld,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
  ): void {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    physics.addFixedBox({ x, y, z }, { x: sx * 0.5, y: sy * 0.5, z: sz * 0.5 }, 'concrete');
  }

  private buildItemVisual(item: ShopItemSpec, materials: MiamiMaterialSet): THREE.Group {
    const g = new THREE.Group();
    if (item.kind === 'register') {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.32, 0.48),
        materials.createStucco(0x25323b, 0.35),
      );
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.24, 0.06),
        materials.createNeon(0x2ec4b6, 1.8),
      );
      screen.position.set(0.08, 0.26, 0);
      g.add(base, screen);
    } else if (item.kind === 'weapon') {
      const bodyColor =
        item.weaponId === 'marksman'
          ? 0xffb703
          : item.weaponId === 'shotgun'
            ? 0xff5e4d
            : item.weaponId === 'smg'
              ? 0x9b5de5
              : 0x0ea5b7;
      const receiver = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.2, 0.86),
        materials.createStucco(0x1f2933, 0.32),
      );
      const accent = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.08, 0.42),
        materials.createNeon(bodyColor, 1.5),
      );
      accent.position.y = 0.08;
      g.add(receiver, accent);
    } else if (item.kind === 'cafecito') {
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.08, 0.26, 10),
        materials.createNeon(0xff9f1c, 1.4),
      );
      g.add(cup);
    } else if (item.kind === 'medkit') {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.28, 0.32),
        materials.createNeon(0x2ec4b6, 1.4),
      );
      g.add(box);
    } else if (item.kind === 'shield') {
      const vest = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.5, 0.24),
        materials.createNeon(0x3a86ff, 1.6),
      );
      g.add(vest);
    } else {
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.3, 0.36),
        materials.createStucco(0xe9c46a, 0.45),
      );
      g.add(crate);
    }
    return g;
  }

  findShopContaining(pos: Vec3Like): ShopDefinition | null {
    for (const shop of this.shops) {
      const dx = Math.abs(pos.x - shop.center.x);
      const dz = Math.abs(pos.z - shop.center.z);
      const dy = pos.y - shop.center.y;
      if (dx <= shop.size.x * 0.5 && dz <= shop.size.z * 0.5 && dy >= -0.4 && dy <= shop.size.y + 3.0) {
        return shop;
      }
    }
    return null;
  }

  findNearestInteractable(pos: Vec3Like, maxDist = 2.9): { shop: ShopDefinition; item: ShopItemSpec } | null {
    let best: { shop: ShopDefinition; item: ShopItemSpec; dist: number } | null = null;
    for (const shop of this.shops) {
      for (const item of shop.items) {
        if (item.collected) continue;
        const d = Math.hypot(
          pos.x - item.position.x,
          pos.y + 0.9 - item.position.y,
          pos.z - item.position.z,
        );
        if (d <= maxDist && (!best || d < best.dist)) {
          best = { shop, item, dist: d };
        }
      }
    }
    return best ? { shop: best.shop, item: best.item } : null;
  }

  markItemCollected(itemId: string): ShopItemSpec | null {
    for (const shop of this.shops) {
      for (const item of shop.items) {
        if (item.id === itemId && !item.collected) {
          item.collected = true;
          const mesh = this.itemMeshes.get(itemId);
          if (mesh && item.kind !== 'register') {
            mesh.visible = false;
          }
          return item;
        }
      }
    }
    return null;
  }

  update(timeSec: number): void {
    let idx = 0;
    for (const [id, mesh] of this.itemMeshes.entries()) {
      if (!mesh.visible || id.endsWith('register')) continue;
      mesh.rotation.y = timeSec * 1.4 + idx * 0.7;
      idx++;
    }
  }
}
