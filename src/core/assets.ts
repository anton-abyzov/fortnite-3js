import {
  AnimationClip,
  Group,
  LoadingManager,
  Mesh,
  Object3D,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const BASE = `${import.meta.env.BASE_URL}assets/`;

export interface ModelAsset {
  scene: Group;
  animations: AnimationClip[];
}

/** Loads and caches models and textures from `public/assets`. */
export class Assets {
  private manager = new LoadingManager();
  private gltf = new GLTFLoader(this.manager);
  private textures = new TextureLoader(this.manager);
  private models = new Map<string, ModelAsset>();
  private modelLoads = new Map<string, Promise<ModelAsset>>();
  private textureCache = new Map<string, Texture>();
  onProgress: (loaded: number, total: number) => void = () => undefined;

  constructor() {
    this.gltf.setMeshoptDecoder(MeshoptDecoder);
    this.manager.onProgress = (_url, loaded, total) => this.onProgress(loaded, total);
  }

  url(path: string): string {
    return BASE + path;
  }

  loadModel(path: string): Promise<ModelAsset> {
    let load = this.modelLoads.get(path);
    if (!load) {
      load = this.gltf.loadAsync(this.url(path)).then((g: GLTF) => {
        const asset: ModelAsset = { scene: g.scene, animations: g.animations };
        this.models.set(path, asset);
        return asset;
      });
      this.modelLoads.set(path, load);
    }
    return load;
  }

  async loadModels(paths: readonly string[]): Promise<void> {
    await Promise.all(paths.map((p) => this.loadModel(p)));
  }

  /** A model that was preloaded. Throws when it was not: preload lists should be complete. */
  model(path: string): ModelAsset {
    const m = this.models.get(path);
    if (!m) throw new Error(`Model not preloaded: ${path}`);
    return m;
  }

  hasModel(path: string): boolean {
    return this.models.has(path);
  }

  /** Independent copy of a static model (geometry and materials stay shared). */
  instance(path: string): Object3D {
    return this.model(path).scene.clone(true);
  }

  /** Independent copy of a skinned model with its own skeleton. */
  instanceSkinned(path: string): Object3D {
    return SkeletonUtils.clone(this.model(path).scene);
  }

  texture(path: string, srgb = true): Texture {
    let t = this.textureCache.get(path);
    if (!t) {
      t = this.textures.load(this.url(path));
      if (srgb) t.colorSpace = SRGBColorSpace;
      this.textureCache.set(path, t);
    }
    return t;
  }

  loadTexture(path: string, srgb = true): Promise<Texture> {
    const cached = this.textureCache.get(path);
    if (cached) return Promise.resolve(cached);
    return this.textures.loadAsync(this.url(path)).then((t) => {
      if (srgb) t.colorSpace = SRGBColorSpace;
      this.textureCache.set(path, t);
      return t;
    });
  }
}

export function forEachMesh(root: Object3D, fn: (mesh: Mesh) => void): void {
  root.traverse((o) => {
    if ((o as Mesh).isMesh) fn(o as Mesh);
  });
}
