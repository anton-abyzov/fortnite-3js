import * as THREE from 'three';
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing';

export class SunbreakPostPipeline {
  public readonly composer: EffectComposer;
  public readonly bloom: BloomEffect;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
  ) {
    this.composer = new EffectComposer(renderer, {
      frameBufferType: THREE.HalfFloatType,
      multisampling: 0,
    });

    renderer.toneMappingExposure = 0.68;
    const renderPass = new RenderPass(scene, camera);
    this.bloom = new BloomEffect({
      intensity: 0.36,
      luminanceThreshold: 1.18,
      luminanceSmoothing: 0.25,
      mipmapBlur: true,
    });

    const smaa = new SMAAEffect({ preset: SMAAPreset.HIGH });
    const toneMapping = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
    const vignette = new VignetteEffect({ darkness: 0.26, offset: 0.36 });

    const effectPass = new EffectPass(camera, smaa, this.bloom, vignette, toneMapping);
    this.composer.addPass(renderPass);
    this.composer.addPass(effectPass);
  }

  setSize(width: number, height: number): void {
    this.composer.setSize(width, height);
  }

  render(dt: number): void {
    this.composer.render(dt);
  }

  dispose(): void {
    this.composer.dispose();
  }
}
