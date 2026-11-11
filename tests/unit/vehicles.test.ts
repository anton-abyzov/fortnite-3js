import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { AssetLibrary } from '../../src/assets/asset-loader';
import type { InputState } from '../../src/types/game';
import { RaycastCar } from '../../src/vehicles/raycast-car';
import { BuoyantWatercraft } from '../../src/vehicles/watercraft';
import { PhysicsWorld } from '../../src/world/physics-world';

function makeThrottleInput(forward = 1, right = 0): InputState {
  return {
    forward,
    right,
    jump: false,
    jumpJustPressed: false,
    sprint: false,
    crouch: false,
    interactJustPressed: false,
    fire: false,
    aim: false,
    reloadJustPressed: false,
    handbrake: false,
    weaponSlot: null,
    yawDelta: 0,
    pitchDelta: 0,
  };
}

describe('Raycast suspension cars, buoyant jet skis, and speedboats', () => {
  it('supports a 4-wheel raycast convertible on asphalt and accelerates forward under throttle', async () => {
    const scene = new THREE.Scene();
    const physics = await PhysicsWorld.create();
    physics.addFixedBox({ x: 0, y: -0.5, z: 0 }, { x: 40, y: 0.5, z: 120 }, 'asphalt');

    const assets = new AssetLibrary();
    const car = new RaycastCar('test_car', 'convertible', { x: 0, y: 0.7, z: 0 }, 0, scene, physics, assets);

    const driveInput = makeThrottleInput(1, 0.25);
    for (let i = 0; i < 90; i++) {
      car.stepPhysics(1 / 60, i / 60, physics, driveInput);
      physics.step(1 / 60);
    }

    expect(car.groundedWheels).toBeGreaterThanOrEqual(2);
    expect(car.speedMps).toBeGreaterThan(5.0);
    expect(car.getPosition().z).toBeLessThan(-3.0);
    expect(Math.abs(car.steerAngle)).toBeGreaterThan(0.05);
  });

  it('floats and propels both jet ski and center-console speedboat on Gerstner waves', async () => {
    const scene = new THREE.Scene();
    const physics = await PhysicsWorld.create();
    const assets = new AssetLibrary();

    const jetski = new BuoyantWatercraft('test_js', 'jetski', { x: 0, y: 0.3, z: 0 }, 0, scene, physics, assets);
    const boat = new BuoyantWatercraft('test_boat', 'speedboat', { x: 10, y: 0.4, z: 0 }, 0, scene, physics, assets);

    const throttle = makeThrottleInput(1, -0.3);
    for (let i = 0; i < 90; i++) {
      const t = i / 60;
      jetski.stepPhysics(1 / 60, t, throttle);
      boat.stepPhysics(1 / 60, t, throttle);
      physics.step(1 / 60);
    }

    // Both remain buoyant near sea level (Y=0) rather than sinking!
    expect(jetski.getPosition().y).toBeGreaterThan(-0.7);
    expect(jetski.getPosition().y).toBeLessThan(1.2);
    expect(boat.getPosition().y).toBeGreaterThan(-0.8);
    expect(boat.getPosition().y).toBeLessThan(1.4);

    // Both accelerate cleanly across water
    expect(jetski.speedMps).toBeGreaterThan(6.0);
    expect(boat.speedMps).toBeGreaterThan(4.0);
  });
});
