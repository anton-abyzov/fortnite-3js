// Builds the shipped model files in public/assets/models from the raw CC0 packs in .temp/dl.
// Run tools/fetch-assets.sh first. Usage: node tools/build-assets.mjs [--report]
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, mergeDocuments, prune, resample, unpartition } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DL = join(ROOT, '.temp/dl');
const OUT = join(ROOT, 'public/assets/models');
const REPORT = process.argv.includes('--report');

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

function sizeKb(path) {
  return `${Math.round(statSync(path).size / 1024)} KB`;
}

/** Pack several single-model .glb files into one file. Each model becomes a root node named after its file. */
async function packKit(outName, dir, names) {
  const target = new Document();
  target.createBuffer();
  const scene = target.createScene(outName);
  for (const name of names) {
    const path = join(dir, `${name}.glb`);
    if (!existsSync(path)) throw new Error(`Missing source model ${path}`);
    const src = await io.read(path);
    const srcRoots = src.getRoot().listScenes()[0].listChildren();
    const map = mergeDocuments(target, src);
    const holder = target.createNode(name);
    for (const r of srcRoots) holder.addChild(map.get(r));
    scene.addChild(holder);
  }
  // mergeDocuments also copies every source scene; keep only the combined one.
  for (const s of target.getRoot().listScenes()) if (s !== scene) s.dispose();
  target.getRoot().setDefaultScene(scene);
  await target.transform(unpartition(), dedup(), prune());
  const out = join(OUT, `${outName}.glb`);
  mkdirSync(dirname(out), { recursive: true });
  await io.write(out, target);
  console.log(`${outName}.glb: ${names.length} models, ${sizeKb(out)}`);
}

/** UAL2 uses Unreal bone names, UAL1 (Godot export) uses Rigify DEF- names. Same rig underneath. */
const UAL2_TO_UAL1 = (() => {
  const m = {
    root: 'root',
    pelvis: 'DEF-hips',
    spine_01: 'DEF-spine.001',
    spine_02: 'DEF-spine.002',
    spine_03: 'DEF-spine.003',
    neck_01: 'DEF-neck',
    Head: 'DEF-head',
  };
  for (const [s, S] of [
    ['l', 'L'],
    ['r', 'R'],
  ]) {
    m[`clavicle_${s}`] = `DEF-shoulder.${S}`;
    m[`upperarm_${s}`] = `DEF-upper_arm.${S}`;
    m[`lowerarm_${s}`] = `DEF-forearm.${S}`;
    m[`hand_${s}`] = `DEF-hand.${S}`;
    m[`thigh_${s}`] = `DEF-thigh.${S}`;
    m[`calf_${s}`] = `DEF-shin.${S}`;
    m[`foot_${s}`] = `DEF-foot.${S}`;
    m[`ball_${s}`] = `DEF-toe.${S}`;
    for (const f of ['index', 'middle', 'ring', 'pinky']) {
      for (const i of [1, 2, 3]) m[`${f}_0${i}_${s}`] = `DEF-f_${f}.0${i}.${S}`;
    }
    for (const i of [1, 2, 3]) m[`thumb_0${i}_${s}`] = `DEF-thumb.0${i}.${S}`;
  }
  return m;
})();

/** Clips that are not needed in the game are dropped to keep the download small. */
const UAL1_DROP = new Set(['Sword_Attack', 'Sword_Attack_RM', 'Sword_Idle', 'Spell_Simple_Enter', 'Spell_Simple_Exit', 'Spell_Simple_Idle_Loop', 'Spell_Simple_Shoot', 'Idle_Torch_Loop', 'Roll_RM', 'Fixing_Kneeling', 'Walk_Formal_Loop']);
const UAL2_KEEP = new Set(['Chest_Open', 'ClimbUp_1m_RM', 'Consume', 'Hit_Knockback', 'Idle_FoldArms_Loop', 'Idle_TalkingPhone_Loop', 'Melee_Hook', 'OverhandThrow', 'Slide_Loop', 'Slide_Start', 'Slide_Exit', 'Yes', 'Idle_No_Loop', 'Idle_Rail_Loop', 'LayToIdle']);

function quatAngle(a, b) {
  const d = Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]);
  return (2 * Math.acos(Math.min(1, d)) * 180) / Math.PI;
}

/** Disposing an animation leaves its samplers (and their keyframe data) behind unless they go first. */
function disposeAnimation(anim) {
  for (const ch of anim.listChannels()) ch.dispose();
  for (const sampler of anim.listSamplers()) sampler.dispose();
  anim.dispose();
}

async function buildCharacter() {
  const ual1Path = join(DL, 'ual1/Animation Library[Standard]/Godot/AnimationLibrary_Godot_Standard.glb');
  const ual2Path = join(DL, 'ual2/Universal Animation Library 2 [Standard]/Unreal-Godot/UAL2_Standard.glb');
  const doc = await io.read(ual1Path);
  const root = doc.getRoot();
  for (const a of root.listAnimations()) if (UAL1_DROP.has(a.getName())) disposeAnimation(a);

  const byName = new Map(root.listNodes().map((n) => [n.getName(), n]));
  let merged = 0;
  if (existsSync(ual2Path)) {
    const src = await io.read(ual2Path);
    const srcNodes = src.getRoot().listNodes();
    // Compare rest poses of mapped bones before trusting a rename-only retarget.
    let worstRot = 0;
    let worstPos = 0;
    let worstBone = '';
    for (const n of srcNodes) {
      const targetName = UAL2_TO_UAL1[n.getName()];
      if (!targetName) continue;
      const t = byName.get(targetName);
      if (!t) throw new Error(`UAL1 has no bone ${targetName}`);
      const rot = quatAngle(n.getRotation(), t.getRotation());
      const p = n.getTranslation();
      const q = t.getTranslation();
      const pos = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
      if (rot > worstRot) {
        worstRot = rot;
        worstBone = n.getName();
      }
      worstPos = Math.max(worstPos, pos);
    }
    console.log(`UAL2 vs UAL1 rest pose: worst rotation ${worstRot.toFixed(3)} deg (${worstBone}), worst offset ${(worstPos * 100).toFixed(2)} cm`);
    if (REPORT) {
      for (const n of srcNodes) {
        const targetName = UAL2_TO_UAL1[n.getName()];
        if (!targetName) continue;
        const t = byName.get(targetName);
        console.log(`  ${n.getName().padEnd(16)} rot ${quatAngle(n.getRotation(), t.getRotation()).toFixed(2)} deg`);
      }
    }
    const compatible = worstRot < 1.0 && worstPos < 0.02;
    if (compatible) {
      const srcAnims = src.getRoot().listAnimations().filter((a) => UAL2_KEEP.has(a.getName()));
      const map = mergeDocuments(doc, src);
      for (const srcAnim of srcAnims) {
        const anim = map.get(srcAnim);
        for (const ch of anim.listChannels()) {
          const node = ch.getTargetNode();
          const targetName = node ? UAL2_TO_UAL1[node.getName()] : undefined;
          const target = targetName ? byName.get(targetName) : undefined;
          if (target) {
            ch.setTargetNode(target);
          } else {
            const sampler = ch.getSampler();
            ch.dispose();
            if (sampler && sampler.listParents().length <= 1) sampler.dispose();
          }
        }
        merged++;
      }
      // Drop everything else that came across with the merge: second mesh, skin, skeleton, unused clips, scene.
      const keep = new Set(srcAnims.map((a) => map.get(a)));
      const srcRoot = src.getRoot();
      for (const a of srcRoot.listAnimations()) if (!keep.has(map.get(a))) disposeAnimation(map.get(a));
      for (const list of [srcRoot.listScenes(), srcRoot.listSkins(), srcRoot.listMeshes(), srcRoot.listMaterials(), srcRoot.listNodes()]) {
        for (const p of list) map.get(p)?.dispose();
      }
      root.setDefaultScene(root.listScenes()[0]);
    } else {
      console.log('UAL2 rest pose differs from UAL1: skipping the UAL2 clips.');
    }
  }

  await doc.transform(resample({ tolerance: 1e-4 }), unpartition(), dedup(), prune());
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
  const out = join(OUT, 'character.glb');
  mkdirSync(dirname(out), { recursive: true });
  await io.write(out, doc);
  const names = root.listAnimations().map((a) => a.getName());
  console.log(`character.glb: ${names.length} clips (${merged} from UAL2), ${sizeKb(out)}`);
  if (REPORT) console.log(names.join(', '));
}

const CAR_DIR = join(DL, 'carkit/Models/GLB format');
const BOAT_DIR = join(DL, 'watercraft/Models/GLB format');
const BLASTER_DIR = join(DL, 'blaster/Models/GLB format');
const SHOP_DIR = join(DL, 'minishop/Models/GLB format');
const FOOD_DIR = join(DL, 'food/Models/GLB format');

const CARS = ['sedan', 'sedan-sports', 'suv', 'suv-luxury', 'taxi', 'police', 'hatchback-sports', 'van', 'truck', 'delivery', 'cone', 'box', 'debris-tire', 'debris-bumper', 'debris-door', 'debris-plate-a'];
const BOATS = ['boat-speed-a', 'boat-speed-b', 'boat-speed-c', 'boat-speed-d', 'boat-speed-e', 'boat-speed-f', 'boat-speed-g', 'boat-speed-h', 'boat-speed-i', 'boat-speed-j', 'boat-sail-a', 'boat-sail-b', 'boat-fishing-small', 'boat-row-small', 'boat-row-large', 'boat-house-a', 'boat-house-b', 'boat-house-c', 'boat-house-d', 'boat-tug-a', 'boat-tow-a', 'ship-cargo-a', 'ship-ocean-liner', 'ship-large', 'buoy', 'buoy-flag', 'cargo-container-a', 'cargo-container-b', 'cargo-container-c', 'cargo-pile-a', 'cargo-pile-b', 'ramp', 'ramp-wide'];
const BLASTERS = ['blaster-a', 'blaster-b', 'blaster-c', 'blaster-d', 'blaster-e', 'blaster-f', 'blaster-g', 'blaster-h', 'blaster-i', 'blaster-j', 'blaster-k', 'blaster-l', 'blaster-m', 'blaster-n', 'blaster-o', 'blaster-p', 'blaster-q', 'blaster-r', 'clip-large', 'clip-small', 'crate-medium', 'crate-small', 'crate-wide', 'grenade-a', 'grenade-b', 'scope-large-a', 'scope-small', 'silencer-small'];
const SHOP = ['bottle-return', 'cash-register', 'cash-register-self', 'character-employee', 'clothing-rack', 'clothing-table', 'column', 'display-bread', 'display-cans', 'display-flowers', 'display-fruit', 'display-small', 'freezer', 'freezers-standing', 'gacha-machine', 'hand-truck', 'mannequin', 'shelf-bags', 'shelf-boxes', 'shelf-end', 'shopping-basket', 'shopping-cart'];
const FOOD = ['burger', 'hot-dog', 'pizza', 'taco', 'fries', 'donut-sprinkles', 'ice-cream', 'soda', 'soda-bottle', 'soda-can', 'coconut', 'coconut-half', 'pineapple', 'watermelon', 'banana', 'orange', 'apple', 'cake', 'croissant', 'cocktail', 'cup-coffee', 'cup-tea', 'plate', 'bottle-ketchup', 'bag', 'can', 'carton', 'wine-red', 'sandwich', 'sushi-salmon'];

function existing(dir, names) {
  const ok = [];
  const missing = [];
  for (const n of names) (existsSync(join(dir, `${n}.glb`)) ? ok : missing).push(n);
  if (missing.length) console.log(`  not in pack, skipped: ${missing.join(', ')}`);
  return ok;
}

await buildCharacter();
await packKit('vehicles', CAR_DIR, existing(CAR_DIR, CARS));
await packKit('boats', BOAT_DIR, existing(BOAT_DIR, BOATS));
await packKit('weapons', BLASTER_DIR, existing(BLASTER_DIR, BLASTERS));
await packKit('shop', SHOP_DIR, existing(SHOP_DIR, SHOP));
await packKit('food', FOOD_DIR, existing(FOOD_DIR, FOOD));
