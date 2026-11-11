import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createMiamiMaterialSet } from '../../src/rendering/materials';
import { buildMiamiWorld } from '../../src/world/miami-builder';
import { BRIDGE_DECK_Y, ISLAND_GROUND_Y, MIAMI_BRIDGES } from '../../src/world/miami-layout';
import { PhysicsWorld } from '../../src/world/physics-world';

describe('Miami coastal physics world, canals, bridges, and enterable shops', () => {
  it('builds islands, beach, bridges with boat clearance, and 4 walkable open-doorway shops', async () => {
    const scene = new THREE.Scene();
    const physics = await PhysicsWorld.create();
    const materials = createMiamiMaterialSet();
    const built = buildMiamiWorld(scene, physics, materials);
    physics.step(1 / 60);

    // 1. Ocean Blvd asphalt road surface check at (35, *, 0)
    const roadHit = physics.raycast({ x: 35, y: 20, z: 0 }, { x: 0, y: -1, z: 0 }, 30);
    expect(roadHit).not.toBeNull();
    expect(roadHit!.point.y).toBeCloseTo(ISLAND_GROUND_Y + 0.06, 1);
    expect(roadHit!.material).toBe('asphalt');

    // 2. Atlantic Beach slopes smoothly into ocean surf at X = 60, Z = 0
    const beachHit = physics.raycast({ x: 60, y: 15, z: 0 }, { x: 0, y: -1, z: 0 }, 30);
    expect(beachHit).not.toBeNull();
    expect(beachHit!.material).toBe('sand');
    expect(beachHit!.point.y).toBeLessThan(ISLAND_GROUND_Y);
    expect(beachHit!.point.y).toBeGreaterThan(-2.5);

    // 3. Every arched bridge has elevated car deck AND unobstructed watercraft passage underneath
    for (const br of MIAMI_BRIDGES) {
      const topHit = physics.raycast(
        { x: br.centerX, y: 15, z: br.centerZ },
        { x: 0, y: -1, z: 0 },
        20,
      );
      expect(topHit, `bridge ${br.id} deck`).not.toBeNull();
      expect(topHit!.point.y).toBeCloseTo(BRIDGE_DECK_Y, 1);

      // Ray along the canal under the bridge at boat mast height Y = 1.6m must NOT collide
      const boatDir = br.axis === 'x' ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
      const boatOrigin = {
        x: br.centerX - boatDir.x * 8,
        y: 1.6,
        z: br.centerZ - boatDir.z * 8,
      };
      const underHit = physics.raycast(boatOrigin, boatDir, 16);
      expect(underHit, `watercraft clearance under ${br.id}`).toBeNull();
    }

    // 4. All 4 shops have unobstructed walk-in doorways and interactive interiors
    expect(built.shops.shops.length).toBe(4);
    for (const shop of built.shops.shops) {
      // Horizontal walk-in ray from outside East street into shop interior at chest height Y = 3.5m
      const outsideX = shop.center.x + shop.size.x * 0.5 + 2.0;
      const walkRay = physics.raycast(
        { x: outsideX, y: ISLAND_GROUND_Y + 1.3, z: shop.center.z },
        { x: -1, y: 0, z: 0 },
        4.0, // passes right through the 3.8m wide doorway without hitting front wall!
      );
      expect(walkRay, `open doorway for ${shop.id}`).toBeNull();

      // Inside shop floor is polished tile
      const floorHit = physics.raycast(
        { x: shop.center.x + 1.5, y: ISLAND_GROUND_Y + 2.0, z: shop.center.z },
        { x: 0, y: -1, z: 0 },
        4.0,
      );
      expect(floorHit).not.toBeNull();
      expect(floorHit!.material).toBe('tile');
      expect(built.shops.findShopContaining({ x: shop.center.x, y: ISLAND_GROUND_Y + 1, z: shop.center.z })?.id).toBe(
        shop.id,
      );

      // Register is interactable near counter
      const regItem = shop.items.find((i) => i.kind === 'register');
      expect(regItem).toBeDefined();
      const nearest = built.shops.findNearestInteractable({
        x: regItem!.position.x + 0.8,
        y: ISLAND_GROUND_Y,
        z: regItem!.position.z,
      });
      expect(nearest).not.toBeNull();
    }
  });
});
