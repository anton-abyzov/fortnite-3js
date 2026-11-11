import * as THREE from 'three';
import { WebGLPathTracer } from 'three-gpu-pathtracer';
import type { TimeOfDaySystem } from './time-of-day';
import type { WaterSystem } from './water-system';

export class SunbreakPathTracer {
  private tracer: WebGLPathTracer | null = null;
  private active = false;
  private savedEnvironment: THREE.Texture | null = null;
  private savedBackground: THREE.Color | THREE.Texture | THREE.CubeTexture | null = null;
  private savedSkyVisible = true;
  private hiddenCustomShaderObjects: THREE.Object3D[] = [];

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly timeOfDay: TimeOfDaySystem,
    private readonly water: WaterSystem,
  ) {}

  isActive(): boolean {
    return this.active;
  }

  getSamples(): number {
    return this.tracer ? Math.floor(this.tracer.samples) : 0;
  }

  enable(simTimeSec: number): void {
    if (this.active) return;
    if (!this.tracer) {
      this.tracer = new WebGLPathTracer(this.renderer);
      this.tracer.bounces = 5;
      this.tracer.transmissiveBounces = 6;
      this.tracer.multipleImportanceSampling = true;
      this.tracer.filterGlossyFactor = 0.4;
      this.tracer.renderDelay = 0;
      this.tracer.fadeDuration = 0;
      this.tracer.minSamples = 1;
      this.tracer.dynamicLowRes = false;
      this.tracer.tiles.set(1, 1);
      this.tracer.renderScale = 1.0;
      this.tracer.synchronizeRenderSize = true;
    }

    this.savedEnvironment = this.scene.environment;
    this.savedBackground = this.scene.background;
    this.savedSkyVisible = this.timeOfDay.skyMesh.visible;

    // Swap custom ShaderMaterial water and sky dome for physical dielectric water + HDR equirect sky
    this.timeOfDay.skyMesh.visible = false;
    this.water.realtimeMesh.visible = false;
    this.water.bakePathTracerWaveSurface(simTimeSec);
    this.water.pathTracerMesh.visible = true;

    this.hiddenCustomShaderObjects = [];
    this.scene.traverse((obj) => {
      if (!obj.visible || obj === this.water.pathTracerMesh) return;
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        if (mats.some((m) => (m as THREE.ShaderMaterial).isShaderMaterial && !(m as THREE.MeshStandardMaterial).isMeshStandardMaterial)) {
          obj.visible = false;
          this.hiddenCustomShaderObjects.push(obj);
        }
      } else if ((obj as THREE.Points).isPoints || (obj as THREE.Line).isLine) {
        obj.visible = false;
        this.hiddenCustomShaderObjects.push(obj);
      }
    });

    const hdrEquirect = this.timeOfDay.refreshEquirectForPathTracer();
    this.scene.environment = hdrEquirect;
    this.scene.background = hdrEquirect;
    this.scene.updateMatrixWorld(true);

    const prevToneMapping = this.renderer.toneMapping;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.tracer.setScene(this.scene, this.camera);
    this.tracer.updateEnvironment();
    this.tracer.updateCamera();
    this.tracer.reset();
    this.renderer.toneMapping = prevToneMapping;

    this.active = true;
  }

  disable(): void {
    if (!this.active) return;
    this.active = false;

    this.water.pathTracerMesh.visible = false;
    this.water.realtimeMesh.visible = true;
    this.timeOfDay.skyMesh.visible = this.savedSkyVisible;

    for (const obj of this.hiddenCustomShaderObjects) {
      obj.visible = true;
    }
    this.hiddenCustomShaderObjects = [];

    this.scene.environment = this.savedEnvironment;
    this.scene.background = this.savedBackground;
  }

  notifyCameraMoved(): void {
    if (this.active && this.tracer) {
      this.tracer.updateCamera();
    }
  }

  notifyLightingChanged(): void {
    if (!this.active || !this.tracer) return;
    const hdrEquirect = this.timeOfDay.refreshEquirectForPathTracer();
    this.scene.environment = hdrEquirect;
    this.scene.background = hdrEquirect;
    this.tracer.updateLights();
    this.tracer.updateEnvironment();
    this.tracer.reset();
  }

  renderSample(): void {
    if (!this.active || !this.tracer) return;
    const prevTone = this.renderer.toneMapping;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.tracer.renderSample();
    this.renderer.toneMapping = prevTone;
  }

  dispose(): void {
    this.disable();
    this.tracer?.dispose();
    this.tracer = null;
  }
}
