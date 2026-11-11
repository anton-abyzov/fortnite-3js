import {
  AdditiveBlending,
  Color,
  DoubleSide,
  FrontSide,
  type Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type WebGLProgramParametersWithUniforms,
} from 'three';
import type { QualityPreset } from '../core/settings';
import { SignAtlas } from './signs';
import {
  asphaltTexture,
  concreteTexture,
  frondTexture,
  grassTexture,
  plazaTexture,
  roofTexture,
  sandTexture,
  sidewalkTexture,
  softDotTexture,
  stuccoTexture,
  woodTexture,
} from './textures';

/**
 * Facade shader: windows are drawn in the fragment shader from the wall UVs instead of textures.
 * UV units are bays (u) and floors (v). The `aStyle` vertex attribute selects the window:
 *   x: window width as a fraction of the bay (0 = blank wall)
 *   y: window height as a fraction of the floor
 *   z: type (0 rectangle, 1 porthole, 2 ribbon band, 3 storefront glass)
 *   w: random seed for lit windows
 */
function patchFacade(material: MeshStandardMaterial, shared: SharedUniforms): void {
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms['uNight'] = shared.uNight;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 aStyle;\nvarying vec4 vStyle;\nvarying vec2 vFacadeUv;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvStyle = aStyle;\nvFacadeUv = uv;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
        uniform float uNight;
        varying vec4 vStyle;
        varying vec2 vFacadeUv;
        float facadeHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float gWindow = 0.0;
        float gFrame = 0.0;
        float gLit = 0.0;`,
      )
      .replace(
        '#include <map_fragment>',
        /* glsl */ `#include <map_fragment>
        {
          vec2 cell = floor(vFacadeUv);
          vec2 f = fract(vFacadeUv);
          float aa = max(max(fwidth(vFacadeUv.x), fwidth(vFacadeUv.y)) * 1.2, 1e-4);
          float fade = 1.0 - smoothstep(0.25, 0.6, aa);
          float w = vStyle.x;
          float h = vStyle.y;
          float kind = vStyle.z;
          float inside = 0.0;
          float frame = 0.0;
          if (w > 0.001) {
            vec2 c = vec2(0.5, kind > 2.5 ? 0.46 : 0.54);
            if (kind > 0.5 && kind < 1.5) {
              float r = length((f - c) * vec2(1.0, 1.08)) / (w * 0.5);
              inside = 1.0 - smoothstep(1.0 - aa * 4.0, 1.0 + aa * 4.0, r);
              frame = (1.0 - smoothstep(1.16 - aa * 4.0, 1.16 + aa * 4.0, r)) - inside;
            } else {
              vec2 half_ = vec2(kind > 1.5 && kind < 2.5 ? 0.5 : w * 0.5, h * 0.5);
              vec2 d = abs(f - c) - half_;
              float sd = max(d.x, d.y);
              inside = 1.0 - smoothstep(-aa, aa, sd);
              frame = (1.0 - smoothstep(0.035 - aa, 0.035 + aa, sd)) - inside;
              // Mullions split a window into panes.
              float mx = kind > 2.5 ? 0.0 : abs(f.x - c.x);
              float my = abs(f.y - (c.y + h * 0.12));
              float bars = max(1.0 - smoothstep(0.008, 0.008 + aa, mx), kind > 2.5 ? 0.0 : 1.0 - smoothstep(0.008, 0.008 + aa, my));
              frame = max(frame, bars * inside * 0.9);
              inside *= 1.0 - bars * 0.9;
            }
          }
          inside *= fade;
          frame *= fade;
          float rnd = facadeHash(cell + vStyle.w);
          float lit = step(1.0 - (0.1 + uNight * 0.3), rnd) * inside;
          vec3 glass = mix(vec3(0.05, 0.11, 0.15), vec3(0.10, 0.22, 0.27), rnd);
          // Blinds on some windows.
          float blind = step(0.72, facadeHash(cell * 1.7 + 3.1 + vStyle.w)) * step(f.y, 0.54 + h * (0.1 + 0.3 * rnd)) * (kind > 2.5 ? 0.0 : 1.0);
          glass = mix(glass, vec3(0.62, 0.6, 0.55), blind * 0.55);
          vec3 frameCol = vec3(0.93, 0.93, 0.9);
          diffuseColor.rgb = mix(diffuseColor.rgb, glass, inside);
          diffuseColor.rgb = mix(diffuseColor.rgb, frameCol, clamp(frame, 0.0, 1.0));
          gWindow = inside * (1.0 - blind * 0.7);
          gFrame = frame;
          gLit = lit;
        }`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        /* glsl */ `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.07, gWindow);`,
      )
      .replace(
        '#include <metalnessmap_fragment>',
        /* glsl */ `#include <metalnessmap_fragment>
        metalnessFactor = mix(metalnessFactor, 0.42, gWindow);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        /* glsl */ `#include <emissivemap_fragment>
        {
          vec3 warm = mix(vec3(1.0, 0.78, 0.46), vec3(0.75, 0.9, 1.0), step(0.8, facadeHash(floor(vFacadeUv) * 2.3 + vStyle.w)));
          totalEmissiveRadiance += warm * gLit * (0.16 + uNight * 1.05);
        }`,
      );
  };
  material.customProgramCacheKey = () => 'facade';
}

interface SharedUniforms {
  uNight: { value: number };
}

/** Every material in the world, created once. Time of day drives the shared uniforms. */
export class Materials {
  readonly shared: SharedUniforms = { uNight: { value: 0 } };
  readonly asphalt: MeshStandardMaterial;
  readonly sidewalk: MeshStandardMaterial;
  readonly plaza: MeshStandardMaterial;
  readonly sand: MeshStandardMaterial;
  readonly grass: MeshStandardMaterial;
  readonly wood: MeshStandardMaterial;
  readonly concrete: MeshStandardMaterial;
  readonly facade: MeshStandardMaterial;
  readonly roof: MeshStandardMaterial;
  /** Flat vertex-coloured surfaces: trims, props, awnings, painted metal. */
  readonly paint: MeshStandardMaterial;
  /** Glossy vertex-coloured surfaces. */
  readonly gloss: MeshStandardMaterial;
  readonly metal: MeshStandardMaterial;
  readonly glass: MeshStandardMaterial;
  /** Road paint. Sits a hair above the asphalt with polygon offset. */
  readonly marking: MeshStandardMaterial;
  /** Neon tubes and lit signs: vertex colour times an intensity that rises at dusk. */
  readonly neon: MeshBasicMaterial;
  /** Lamp heads and lit panels that are off by day. */
  readonly lamp: MeshBasicMaterial;
  readonly frond: MeshStandardMaterial;
  readonly pool: MeshStandardMaterial;
  /** Additive light pools painted on the ground under street lamps. Off by day. */
  readonly glow: MeshBasicMaterial;
  /** Lettering atlas and its material for lit signs. */
  readonly signs = new SignAtlas();
  private neonBase = 1;

  constructor(quality: QualityPreset) {
    const a = quality.anisotropy;
    this.asphalt = new MeshStandardMaterial({ map: asphaltTexture(a), roughness: 0.92, metalness: 0, vertexColors: true });
    this.sidewalk = new MeshStandardMaterial({ map: sidewalkTexture(a), roughness: 0.88, metalness: 0, vertexColors: true });
    this.plaza = new MeshStandardMaterial({ map: plazaTexture(a), roughness: 0.55, metalness: 0, vertexColors: true });
    this.sand = new MeshStandardMaterial({ map: sandTexture(a), roughness: 1, metalness: 0, vertexColors: true });
    this.grass = new MeshStandardMaterial({ map: grassTexture(a), roughness: 1, metalness: 0, vertexColors: true });
    this.wood = new MeshStandardMaterial({ map: woodTexture(a), roughness: 0.85, metalness: 0, vertexColors: true });
    this.concrete = new MeshStandardMaterial({ map: concreteTexture(a), roughness: 0.9, metalness: 0, vertexColors: true });
    this.roof = new MeshStandardMaterial({ map: roofTexture(a), roughness: 0.95, metalness: 0, vertexColors: true });
    this.facade = new MeshStandardMaterial({ map: stuccoTexture(a), roughness: 0.86, metalness: 0, vertexColors: true });
    patchFacade(this.facade, this.shared);
    this.paint = new MeshStandardMaterial({ roughness: 0.7, metalness: 0, vertexColors: true });
    this.gloss = new MeshStandardMaterial({ roughness: 0.25, metalness: 0.1, vertexColors: true });
    this.metal = new MeshStandardMaterial({ roughness: 0.35, metalness: 0.9, vertexColors: true });
    this.glass = new MeshStandardMaterial({
      color: 0x9fd8e0,
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.28,
      side: DoubleSide,
      depthWrite: false,
    });
    this.marking = new MeshStandardMaterial({
      roughness: 0.75,
      metalness: 0,
      vertexColors: true,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    this.neon = new MeshBasicMaterial({ vertexColors: true, toneMapped: true, side: DoubleSide });
    this.lamp = new MeshBasicMaterial({ color: 0xfff2cf, toneMapped: true });
    this.frond = new MeshStandardMaterial({
      map: frondTexture(),
      roughness: 0.8,
      metalness: 0,
      alphaTest: 0.35,
      side: DoubleSide,
      vertexColors: true,
    });
    this.glow = new MeshBasicMaterial({
      map: softDotTexture(),
      color: 0x000000,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      fog: false,
      toneMapped: true,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
    });
    this.glow.visible = false;
    this.pool = new MeshStandardMaterial({ color: 0x3fd0e6, roughness: 0.08, metalness: 0.1, emissive: new Color(0x0a6a80), emissiveIntensity: 0.35, side: FrontSide });
  }

  /** `night` is 0 by day and 1 after dusk. */
  setNight(night: number): void {
    this.shared.uNight.value = night;
    this.neonBase = 1.1 + night * 1.5;
    this.neon.color.setScalar(this.neonBase);
    this.signs.material.color.setScalar(0.95 + night * 1.45);
    this.lamp.color.setRGB(0.5 + night * 3.2, 0.48 + night * 2.8, 0.42 + night * 2.0);
    this.glow.color.setRGB(night * 0.2, night * 0.165, night * 0.1);
    this.glow.visible = night > 0.02;
    this.pool.emissiveIntensity = 0.3 + night * 1.6;
  }

  /** Brief flicker for neon, called every frame with the game time. */
  flicker(time: number): void {
    const f = 1 + Math.sin(time * 31) * 0.015 + (Math.sin(time * 7.3) > 0.985 ? -0.25 : 0);
    this.neon.color.setScalar(this.neonBase * f);
  }

  all(): Material[] {
    return Object.values(this).filter((v): v is Material => !!v && (v as Material).isMaterial === true);
  }
}
