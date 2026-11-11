import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createMiamiMaterialSet } from '../../src/rendering/materials';
import { computeMiamiSolarState, TIME_PRESET_HOURS, TimeOfDaySystem } from '../../src/rendering/time-of-day';
import { computeWaveAttenuation, sampleWaterWave, WaterSystem } from '../../src/rendering/water-system';

describe('Miami solar ephemeris, Gerstner water, and PBR material system', () => {
  it('computes physically consistent Miami sun elevations and colors across dawn, noon, sunset, and night', () => {
    const dawn = computeMiamiSolarState(TIME_PRESET_HOURS.dawn);
    const noon = computeMiamiSolarState(TIME_PRESET_HOURS.noon);
    const sunset = computeMiamiSolarState(TIME_PRESET_HOURS.sunset);
    const night = computeMiamiSolarState(TIME_PRESET_HOURS.night);

    expect(noon.elevationDeg).toBeGreaterThan(65);
    expect(noon.sunDirection.y).toBeGreaterThan(0.85);
    expect(dawn.sunDirection.x).toBeGreaterThan(0.5); // rises in East (+X)
    expect(sunset.sunDirection.x).toBeLessThan(-0.5); // sets in West (-X)
    expect(night.elevationDeg).toBeLessThan(-10);
    expect(night.nightFactor).toBeGreaterThan(0.95);
    expect(noon.sunIntensity).toBeGreaterThan(night.sunIntensity * 4);
  });

  it('updates TimeOfDaySystem lights, sky dome, and procedural HDR equirectangular texture', () => {
    const scene = new THREE.Scene();
    const tod = new TimeOfDaySystem(scene);
    tod.setPreset('sunset', new THREE.Vector3(10, 0, -20));
    expect(tod.state.hours).toBeCloseTo(TIME_PRESET_HOURS.sunset, 3);
    const hdr = tod.refreshEquirectForPathTracer();
    expect(hdr.image.width).toBe(512);
    expect(hdr.image.height).toBe(256);
  });

  it('samples deterministic Gerstner waves with unit normals, canal attenuation, and surf foam', () => {
    expect(computeWaveAttenuation(-20)).toBeCloseTo(0.28, 3);
    expect(computeWaveAttenuation(100)).toBeCloseTo(1.0, 3);

    const canalSample = sampleWaterWave(0, 15, 4.2, -3.5);
    const oceanSurf = sampleWaterWave(62, 15, 4.2, -0.25);

    const normLen = Math.hypot(canalSample.normalX, canalSample.normalY, canalSample.normalZ);
    expect(normLen).toBeCloseTo(1.0, 4);
    expect(oceanSurf.foam).toBeGreaterThan(canalSample.foam);

    const scene = new THREE.Scene();
    const water = new WaterSystem(scene);
    water.bakePathTracerWaveSurface(3.5);
    const pos = water.pathTracerMesh.geometry.attributes.position;
    let nonZero = 0;
    for (let i = 0; i < pos.count; i += 37) {
      if (Math.abs(pos.getY(i)) > 0.001) nonZero++;
    }
    expect(nonZero).toBeGreaterThan(10);
  });

  it('creates Miami architectural PBR materials with procedural maps', () => {
    const mats = createMiamiMaterialSet();
    expect(mats.asphalt.map).toBeDefined();
    expect(mats.terrazzo.clearcoat).toBeGreaterThan(0.5);
    const coralStucco = mats.createStucco(0xf6b8a8);
    expect(coralStucco.bumpMap).toBeDefined();
  });
});
