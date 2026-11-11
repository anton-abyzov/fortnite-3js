import {
  Color,
  HalfFloatType,
  PerspectiveCamera,
  Scene,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import type { QualityPreset } from '../core/settings';

/** Vignette, saturation, colour wash (underwater, squall, damage) in linear HDR before tone mapping. */
const GradeShader = {
  name: 'GradeShader',
  uniforms: {
    tDiffuse: { value: null },
    uVignette: { value: 0.32 },
    uSaturation: { value: 1.08 },
    uContrast: { value: 1.04 },
    uTint: { value: new Color(1, 1, 1) },
    uTintAmount: { value: 0 },
    uFlash: { value: new Color(1, 0, 0) },
    uFlashAmount: { value: 0 },
    uExposure: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uVignette;
    uniform float uSaturation;
    uniform float uContrast;
    uniform vec3 uTint;
    uniform float uTintAmount;
    uniform vec3 uFlash;
    uniform float uFlashAmount;
    uniform float uExposure;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 c = texel.rgb * uExposure;
      float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(luma), c, uSaturation);
      c = (c - 0.18) * uContrast + 0.18;
      c = max(c, vec3(0.0));
      c = mix(c, c * uTint * 1.6, uTintAmount);
      vec2 q = vUv - 0.5;
      float r2 = dot(q, q);
      float vig = 1.0 - uVignette * smoothstep(0.12, 0.75, r2 * 1.9);
      c *= vig;
      float edge = smoothstep(0.08, 0.5, r2);
      c = mix(c, uFlash * (0.4 + luma), uFlashAmount * edge);
      gl_FragColor = vec4(c, texel.a);
    }`,
};

export class PostFX {
  readonly composer: EffectComposer;
  readonly renderPass: RenderPass;
  readonly bloom: UnrealBloomPass;
  readonly grade: ShaderPass;
  private fxaa: ShaderPass;
  private renderer: WebGLRenderer;
  private size = new Vector2();
  private msaa = -1;

  constructor(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera, quality: QualityPreset) {
    this.renderer = renderer;
    renderer.getDrawingBufferSize(this.size);
    this.composer = new EffectComposer(renderer, this.makeTarget(quality.msaa));
    this.msaa = quality.msaa;
    this.renderPass = new RenderPass(scene, camera);
    this.bloom = new UnrealBloomPass(new Vector2(this.size.x / 2, this.size.y / 2), 0.42, 0.62, 1.22);
    this.grade = new ShaderPass(GradeShader);
    this.fxaa = new ShaderPass(FXAAShader);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloom);
    this.composer.addPass(this.grade);
    this.composer.addPass(new OutputPass());
    this.composer.addPass(this.fxaa);
    this.applyQuality(quality);
  }

  private makeTarget(samples: number): WebGLRenderTarget {
    return new WebGLRenderTarget(Math.max(1, this.size.x), Math.max(1, this.size.y), {
      type: HalfFloatType,
      samples,
    });
  }

  applyQuality(quality: QualityPreset): void {
    this.bloom.enabled = quality.bloom;
    // FXAA only when there is no multisampling.
    this.fxaa.enabled = quality.msaa === 0;
    if (quality.msaa !== this.msaa) {
      this.msaa = quality.msaa;
      this.composer.reset(this.makeTarget(quality.msaa));
    }
    this.resize();
  }

  resize(): void {
    const r = this.renderer;
    const pr = r.getPixelRatio();
    const w = r.domElement.clientWidth || r.domElement.width;
    const h = r.domElement.clientHeight || r.domElement.height;
    this.composer.setPixelRatio(pr);
    this.composer.setSize(w, h);
    const res = this.fxaa.material.uniforms['resolution']!.value as Vector2;
    res.set(1 / (w * pr), 1 / (h * pr));
  }

  get gradeUniforms(): (typeof GradeShader)['uniforms'] {
    return this.grade.uniforms as (typeof GradeShader)['uniforms'];
  }

  render(dt: number): void {
    this.composer.render(dt);
  }
}
