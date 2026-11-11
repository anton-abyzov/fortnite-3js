import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { ProceduralEquirectTexture } from 'three-gpu-pathtracer';
import { clamp, lerp, smoothstep } from '../core/math';
import type { TimePreset } from '../types/game';

export const TIME_PRESET_HOURS: Record<TimePreset, number> = {
  dawn: 6.65,
  noon: 13.25,
  sunset: 18.35,
  night: 21.75,
};

export interface SolarState {
  hours: number;
  sunDirection: THREE.Vector3;
  elevationDeg: number;
  azimuthDeg: number;
  sunColor: THREE.Color;
  skyZenithColor: THREE.Color;
  skyHorizonColor: THREE.Color;
  sunIntensity: number;
  ambientIntensity: number;
  nightFactor: number;
  fogColor: THREE.Color;
}

export function computeMiamiSolarState(hoursInput: number): SolarState {
  const hours = ((hoursInput % 24) + 24) % 24;
  // Miami latitude ~25.76 N: peak solar elevation ~78 deg near midday
  const hourAngle = ((hours - 12.75) / 12) * Math.PI;
  const latRad = THREE.MathUtils.degToRad(25.76);
  const declRad = THREE.MathUtils.degToRad(16.5);

  const sinElev =
    Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngle);
  const elevRad = Math.asin(clamp(sinElev, -1, 1));
  const elevationDeg = THREE.MathUtils.radToDeg(elevRad);

  // East (+X) at dawn, South (+Z) at noon, West (-X) at sunset
  const azimuthRad = -hourAngle;
  const azimuthDeg = THREE.MathUtils.radToDeg(azimuthRad);

  const cosElev = Math.cos(elevRad);
  const sunDirection = new THREE.Vector3(
    Math.sin(azimuthRad) * cosElev,
    Math.sin(elevRad),
    Math.cos(azimuthRad) * cosElev,
  ).normalize();

  const dayFactor = smoothstep(-4, 14, elevationDeg);
  const goldenFactor =
    smoothstep(-6, 4, elevationDeg) * (1 - smoothstep(6, 24, elevationDeg));
  const nightFactor = 1 - smoothstep(-8, 4, elevationDeg);

  const noonSun = new THREE.Color(0xfff7ea);
  const goldenSun = new THREE.Color(0xff7a45);
  const moonLight = new THREE.Color(0x5278b8);

  const sunColor = noonSun
    .clone()
    .lerp(goldenSun, goldenFactor * 0.92)
    .lerp(moonLight, nightFactor);

  const zenithDay = new THREE.Color(0x1668c4);
  const zenithGolden = new THREE.Color(0x283a78);
  const zenithNight = new THREE.Color(0x060d1c);
  const skyZenithColor = zenithDay
    .clone()
    .lerp(zenithGolden, goldenFactor)
    .lerp(zenithNight, nightFactor);

  const horizonDay = new THREE.Color(0x9be2f5);
  const horizonGolden = new THREE.Color(0xff865c);
  const horizonNight = new THREE.Color(0x11223b);
  const skyHorizonColor = horizonDay
    .clone()
    .lerp(horizonGolden, goldenFactor * 0.95)
    .lerp(horizonNight, nightFactor);

  const sunIntensity = lerp(0.32, 4.4, dayFactor) * lerp(1.0, 0.72, goldenFactor);
  const ambientIntensity = lerp(0.36, 1.15, dayFactor);
  const fogColor = skyHorizonColor.clone().lerp(skyZenithColor, 0.22);

  return {
    hours,
    sunDirection,
    elevationDeg,
    azimuthDeg,
    sunColor,
    skyZenithColor,
    skyHorizonColor,
    sunIntensity,
    ambientIntensity,
    nightFactor,
    fogColor,
  };
}

export class TimeOfDaySystem {
  public readonly sunLight: THREE.DirectionalLight;
  public readonly hemiLight: THREE.HemisphereLight;
  public readonly skyMesh: Sky;
  public readonly equirectEnv: ProceduralEquirectTexture;

  private hours = TIME_PRESET_HOURS.sunset - 1.55; // Golden-afternoon Miami default (16:48)
  private timeCycleSpeed = 0; // 0 = steady unless user enables timelapse
  private lastEnvUpdateHours = -999;
  private pmremGenerator: THREE.PMREMGenerator | null = null;
  private currentEnvRenderTarget: THREE.WebGLRenderTarget | null = null;
  private currentState: SolarState;

  constructor(private readonly scene: THREE.Scene, renderer?: THREE.WebGLRenderer) {
    this.sunLight = new THREE.DirectionalLight(0xfff2de, 3.8);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.near = 8;
    this.sunLight.shadow.camera.far = 420;
    const frustum = 135;
    this.sunLight.shadow.camera.left = -frustum;
    this.sunLight.shadow.camera.right = frustum;
    this.sunLight.shadow.camera.top = frustum;
    this.sunLight.shadow.camera.bottom = -frustum;
    this.sunLight.shadow.bias = -0.00035;
    this.sunLight.shadow.normalBias = 0.025;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    this.hemiLight = new THREE.HemisphereLight(0x9be2f5, 0xc8b99e, 0.95);
    this.scene.add(this.hemiLight);

    this.skyMesh = new Sky();
    this.skyMesh.scale.setScalar(2400);
    this.skyMesh.name = 'miami_physical_sky';
    this.scene.add(this.skyMesh);

    this.equirectEnv = new ProceduralEquirectTexture(256, 128);
    this.equirectEnv.name = 'miami_procedural_equirect_hdr';

    if (renderer) {
      this.pmremGenerator = new THREE.PMREMGenerator(renderer);
      this.pmremGenerator.compileEquirectangularShader();
    }

    this.currentState = computeMiamiSolarState(this.hours);
    this.applySolarState(new THREE.Vector3(0, 0, 0), true);
  }

  get state(): SolarState {
    return this.currentState;
  }

  getHours(): number {
    return this.hours;
  }

  setHours(hours: number, focusPos = new THREE.Vector3(), forceEnv = false): void {
    this.hours = ((hours % 24) + 24) % 24;
    this.currentState = computeMiamiSolarState(this.hours);
    this.applySolarState(focusPos, forceEnv);
  }

  setPreset(preset: TimePreset, focusPos = new THREE.Vector3()): void {
    this.setHours(TIME_PRESET_HOURS[preset], focusPos, true);
  }

  setTimelapseRate(hoursPerSecond: number): void {
    this.timeCycleSpeed = hoursPerSecond;
  }

  getTimelapseRate(): number {
    return this.timeCycleSpeed;
  }

  update(dt: number, focusPos: THREE.Vector3): void {
    if (this.timeCycleSpeed !== 0) {
      this.hours = ((this.hours + this.timeCycleSpeed * dt) % 24 + 24) % 24;
      this.currentState = computeMiamiSolarState(this.hours);
    }
    this.applySolarState(focusPos, false);
  }

  refreshEquirectForPathTracer(): ProceduralEquirectTexture {
    this.rebuildEquirectTexture();
    return this.equirectEnv;
  }

  private rebuildEquirectTexture(): void {
    const st = this.currentState;
    const rayDir = new THREE.Vector3();
    const activeLightDir =
      st.sunDirection.y >= -0.05
        ? st.sunDirection
        : st.sunDirection.clone().negate().normalize();

    this.equirectEnv.generationCallback = (polar, _uv, _coord, color) => {
      rayDir.setFromSpherical(polar).normalize();
      if (rayDir.y < 0) {
        const bounce = clamp(-rayDir.y, 0, 1);
        color
          .copy(st.skyHorizonColor)
          .multiplyScalar(0.32)
          .lerp(new THREE.Color(0x0c4f5c), bounce * 0.65);
        return;
      }
      const zenithT = Math.pow(clamp(rayDir.y, 0, 1), 0.58);
      color.copy(st.skyHorizonColor).lerp(st.skyZenithColor, zenithT);

      const cosTheta = clamp(rayDir.dot(activeLightDir), -1, 1);
      const mieGlow = Math.pow(Math.max(0, cosTheta), 18) * (0.45 * (1 - st.nightFactor) + 0.08);
      color.r += st.sunColor.r * mieGlow;
      color.g += st.sunColor.g * mieGlow;
      color.b += st.sunColor.b * mieGlow;

      // Soft physical solar disk (~2.2 deg angular radius for realistic soft penumbra in PathTracer)
      if (cosTheta > 0.9991) {
        const diskPower = st.nightFactor > 0.7 ? 3.5 : 26.0;
        color.r += st.sunColor.r * diskPower;
        color.g += st.sunColor.g * diskPower;
        color.b += st.sunColor.b * diskPower;
      }
    };
    this.equirectEnv.update();
  }

  private applySolarState(focusPos: THREE.Vector3, forceEnv: boolean): void {
    const st = this.currentState;
    const activeDir =
      st.sunDirection.y >= -0.04
        ? st.sunDirection
        : new THREE.Vector3(-st.sunDirection.x, Math.abs(st.sunDirection.y) + 0.25, -st.sunDirection.z).normalize();

    // Snap shadow camera target to texel-like grid around player to eliminate shadow shimmer
    const snap = 2.0;
    const tx = Math.round(focusPos.x / snap) * snap;
    const tz = Math.round(focusPos.z / snap) * snap;
    this.sunLight.target.position.set(tx, 0, tz);
    this.sunLight.position.set(
      tx + activeDir.x * 190,
      Math.max(24, activeDir.y * 190),
      tz + activeDir.z * 190,
    );
    this.sunLight.color.copy(st.sunColor);
    this.sunLight.intensity = st.sunIntensity;

    this.hemiLight.color.copy(st.skyHorizonColor);
    this.hemiLight.groundColor.setHex(st.nightFactor > 0.5 ? 0x0c1724 : 0xc7bba3);
    this.hemiLight.intensity = st.ambientIntensity;

    const skyUniforms = this.skyMesh.material.uniforms;
    skyUniforms['turbidity'].value = lerp(1.8, 3.2, 1 - st.nightFactor);
    skyUniforms['rayleigh'].value = lerp(0.25, 1.35, 1 - st.nightFactor * 0.85);
    skyUniforms['mieCoefficient'].value = 0.0028;
    skyUniforms['mieDirectionalG'].value = 0.76;
    skyUniforms['sunPosition'].value.copy(st.sunDirection).multiplyScalar(1000);
    this.skyMesh.position.set(focusPos.x, 0, focusPos.z);

    if (!this.scene.fog) {
      this.scene.fog = new THREE.FogExp2(st.fogColor.getHex(), 0.00028);
    } else if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.copy(st.fogColor);
      this.scene.fog.density = lerp(0.00026, 0.00068, st.nightFactor);
    }

    const hourDelta = Math.abs(this.hours - this.lastEnvUpdateHours);
    if (this.pmremGenerator && (forceEnv || hourDelta > 0.12)) {
      this.lastEnvUpdateHours = this.hours;
      this.rebuildEquirectTexture();
      const nextTarget = this.pmremGenerator.fromEquirectangular(this.equirectEnv);
      if (this.currentEnvRenderTarget) {
        this.currentEnvRenderTarget.dispose();
      }
      this.currentEnvRenderTarget = nextTarget;
      this.scene.environment = nextTarget.texture;
    }
  }
}
