import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  buildProceduralFallbackModel,
  normalizeLoadedModel,
} from '../../src/assets/asset-loader';
import { MODEL_ASSET_MANIFEST } from '../../src/assets/asset-manifest';

describe('3D GLB assets & normalization pipeline', () => {
  it('validates binary GLB headers and non-empty geometry for all generated models', () => {
    for (const spec of Object.values(MODEL_ASSET_MANIFEST)) {
      const diskPath = join(process.cwd(), 'public', spec.url.replace(/^\//, ''));
      expect(existsSync(diskPath), `expected GLB file at ${diskPath}`).toBe(true);
      const buf = readFileSync(diskPath);
      expect(buf.byteLength).toBeGreaterThan(2048);
      // glTF binary magic 'glTF' = 0x46546C67
      expect(buf.readUInt32LE(0)).toBe(0x46546c67);
      expect(buf.readUInt32LE(4)).toBe(2);
    }
  });

  it('normalizes arbitrary raw meshes to target dimensions, orientation, and BVH bounds', () => {
    const raw = new THREE.Group();
    // Deliberately rotated sideways (length along X = 12, width along Z = 4)
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(12, 3.2, 4.8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, metalness: 0.1 }),
    );
    mesh.position.set(15, 9, -7);
    raw.add(mesh);

    const spec = MODEL_ASSET_MANIFEST.miami_convertible;
    const normalized = normalizeLoadedModel(raw, spec);
    normalized.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(normalized);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    expect(size.z).toBeGreaterThan(size.x);
    expect(size.z).toBeLessThanOrEqual(spec.targetLengthZ + 0.02);
    expect(size.x).toBeLessThanOrEqual(spec.targetWidthX + 0.02);
    expect(center.x).toBeCloseTo(0, 2);
    expect(center.z).toBeCloseTo(0, 2);
    expect(box.min.y).toBeCloseTo(spec.groundOffsetY, 2);
  });

  it('builds procedural fallback hulls with BVH trees for every vehicle/aircraft key', () => {
    for (const key of Object.keys(MODEL_ASSET_MANIFEST) as Array<keyof typeof MODEL_ASSET_MANIFEST>) {
      const group = buildProceduralFallbackModel(key);
      let meshCount = 0;
      group.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          meshCount++;
          expect((obj as THREE.Mesh).geometry.boundsTree).toBeDefined();
        }
      });
      expect(meshCount).toBeGreaterThanOrEqual(3);
    }
  });
});
