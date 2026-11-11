import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';
import {
  type AssetModelKey,
  type AssetNormalizationSpec,
  MODEL_ASSET_MANIFEST,
} from './asset-manifest';

let bvhPatched = false;

export function ensureThreeBvhPatched(): void {
  if (bvhPatched) return;
  bvhPatched = true;
  THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
  THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
  THREE.Mesh.prototype.raycast = acceleratedRaycast;
}

export function normalizeLoadedModel(
  rawScene: THREE.Object3D,
  spec: AssetNormalizationSpec,
): THREE.Group {
  ensureThreeBvhPatched();
  const wrapper = new THREE.Group();
  wrapper.name = `asset_${spec.key}`;

  const model = rawScene.clone(true);
  model.updateMatrixWorld(true);

  const initialBox = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  initialBox.getSize(size);

  // Align primary axis: watercraft & cars run nose-forward along -Z (length > width).
  // Aircraft keeps wingspan along X (width > length) and fuselage along -Z.
  let autoYaw = spec.yawOffsetRad;
  if (spec.key === 'coastal_aircraft') {
    if (size.z > size.x) {
      autoYaw += Math.PI * 0.5;
    }
  } else if (size.x > size.z * 1.12) {
    autoYaw += Math.PI * 0.5;
  }

  const orientedPivot = new THREE.Group();
  orientedPivot.rotation.y = autoYaw;
  orientedPivot.add(model);
  orientedPivot.updateMatrixWorld(true);

  const orientedBox = new THREE.Box3().setFromObject(orientedPivot);
  const orientedSize = new THREE.Vector3();
  const orientedCenter = new THREE.Vector3();
  orientedBox.getSize(orientedSize);
  orientedBox.getCenter(orientedCenter);

  const safeX = Math.max(orientedSize.x, 0.001);
  const safeY = Math.max(orientedSize.y, 0.001);
  const safeZ = Math.max(orientedSize.z, 0.001);

  const scale = Math.min(
    spec.targetWidthX / safeX,
    spec.targetHeightY / safeY,
    spec.targetLengthZ / safeZ,
  );

  orientedPivot.scale.setScalar(scale);
  orientedPivot.updateMatrixWorld(true);

  const scaledBox = new THREE.Box3().setFromObject(orientedPivot);
  const scaledCenter = new THREE.Vector3();
  scaledBox.getCenter(scaledCenter);

  orientedPivot.position.set(
    -scaledCenter.x,
    spec.groundOffsetY - scaledBox.min.y,
    -scaledCenter.z,
  );
  orientedPivot.updateMatrixWorld(true);

  orientedPivot.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (mesh.geometry && !mesh.geometry.boundsTree) {
        mesh.geometry.computeBoundsTree();
      }
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
          const std = mat as THREE.MeshStandardMaterial;
          std.roughness = Math.max(0.08, std.roughness * spec.roughnessScale);
          std.metalness = Math.max(spec.metalnessFloor, std.metalness);
          std.envMapIntensity = 1.35;
          std.needsUpdate = true;
        }
      }
    }
  });

  wrapper.add(orientedPivot);
  return wrapper;
}

export function buildProceduralFallbackModel(key: AssetModelKey): THREE.Group {
  ensureThreeBvhPatched();
  const group = new THREE.Group();
  group.name = `fallback_${key}`;

  const bodyPaint = new THREE.MeshPhysicalMaterial({
    color: key === 'miami_jetski' ? 0x0ea5b7 : key === 'miami_speedboat' ? 0xf4f6f8 : 0xff6b57,
    roughness: 0.2,
    metalness: 0.45,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x16222c,
    roughness: 0.48,
    metalness: 0.35,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x8fd8ef,
    roughness: 0.06,
    metalness: 0.05,
    transmission: 0.72,
    transparent: true,
    opacity: 0.78,
  });

  if (key === 'miami_convertible') {
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.56, 4.45), bodyPaint);
    chassis.position.y = 0.52;
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.22, 1.55), bodyPaint);
    hood.position.set(0, 0.84, -1.25);
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.46, 0.12), glassMat);
    windshield.position.set(0, 1.04, -0.45);
    windshield.rotation.x = -0.52;
    const interior = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.34, 1.5), trimMat);
    interior.position.set(0, 0.78, 0.35);
    group.add(chassis, hood, windshield, interior);
  } else if (key === 'miami_jetski') {
    const hull = new THREE.Mesh(new THREE.ConeGeometry(0.68, 3.05, 8), bodyPaint);
    hull.rotation.x = -Math.PI * 0.5;
    hull.scale.set(0.95, 1, 0.48);
    hull.position.y = 0.22;
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.36, 1.25), trimMat);
    saddle.position.set(0, 0.52, 0.22);
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.55, 8), trimMat);
    column.position.set(0, 0.78, -0.42);
    column.rotation.x = 0.32;
    group.add(hull, saddle, column);
  } else if (key === 'miami_speedboat') {
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.88, 7.4), bodyPaint);
    hull.position.y = 0.24;
    const bow = new THREE.Mesh(new THREE.ConeGeometry(1.24, 2.2, 6), bodyPaint);
    bow.rotation.x = -Math.PI * 0.5;
    bow.scale.set(1, 1, 0.45);
    bow.position.set(0, 0.32, -4.2);
    const consoleBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.15, 1.2), trimMat);
    consoleBox.position.set(0, 1.05, -0.35);
    const tTop = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.08, 2.5), bodyPaint);
    tTop.position.set(0, 2.08, -0.2);
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.52, 0.08), glassMat);
    windshield.position.set(0, 1.72, -0.9);
    group.add(hull, bow, consoleBox, tTop, windshield);
  } else {
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.85, 14.8, 14), bodyPaint);
    fuselage.rotation.x = Math.PI * 0.5;
    const wings = new THREE.Mesh(new THREE.BoxGeometry(18.2, 0.24, 2.35), bodyPaint);
    wings.position.set(0, 0.85, -0.8);
    const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.8, 2.1), bodyPaint);
    tailFin.position.set(0, 1.65, 6.2);
    const hStab = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.16, 1.35), trimMat);
    hStab.position.set(0, 0.65, 6.4);
    group.add(fuselage, wings, tailFin, hStab);
  }

  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh;
      m.castShadow = true;
      m.receiveShadow = true;
      m.geometry.computeBoundsTree();
    }
  });

  return group;
}

export class AssetLibrary {
  private readonly loader = new GLTFLoader();
  private readonly templates = new Map<AssetModelKey, THREE.Group>();
  private readonly loadedFromGlb = new Set<AssetModelKey>();

  async preloadAll(): Promise<void> {
    const entries = Object.values(MODEL_ASSET_MANIFEST);
    await Promise.all(
      entries.map(async (spec) => {
        try {
          const gltf = await this.loader.loadAsync(spec.url);
          const normalized = normalizeLoadedModel(gltf.scene, spec);
          this.templates.set(spec.key, normalized);
          this.loadedFromGlb.add(spec.key);
        } catch {
          this.templates.set(spec.key, buildProceduralFallbackModel(spec.key));
        }
      }),
    );
  }

  instantiate(key: AssetModelKey): THREE.Group {
    const existing = this.templates.get(key) ?? buildProceduralFallbackModel(key);
    if (!this.templates.has(key)) {
      this.templates.set(key, existing);
    }
    return existing.clone(true);
  }

  isLoadedFromGlb(key: AssetModelKey): boolean {
    return this.loadedFromGlb.has(key);
  }
}
