import {
  type Bone,
  BoxGeometry,
  BufferAttribute,
  type BufferGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  type SkinnedMesh,
  Sphere,
  SphereGeometry,
  Vector3,
  Vector4,
  type WebGLProgramParametersWithUniforms,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import type { ModelAsset } from '../core/assets';
import type { Rng } from '../core/rng';
import { BONE, type ClipBank, Pose } from './clips';

export type HairStyle = 'short' | 'cap' | 'mohawk' | 'bun' | 'bandana' | 'visor' | 'long' | 'bald';

/** What a character wears. Clothing is painted by a shader from the T-pose position of each pixel. */
export interface Outfit {
  skin: Color;
  shirt: Color;
  shirt2: Color;
  pants: Color;
  shoes: Color;
  sole: Color;
  accent: Color;
  hair: Color;
  /** 0 plain, 1 hoops, 2 chest band, 3 floral, 4 side panels. */
  shirtStyle: number;
  /** How far the sleeve reaches along the arm, in metres from the body centre (0.17 vest, 0.37 tee, 0.72 long). */
  sleeve: number;
  /** Height of the trouser hem above the sole (0.56 shorts, 0.44 long shorts, 0.15 trousers). */
  hem: number;
  gloves: boolean;
  hairStyle: HairStyle;
  glasses: boolean;
  pack: Color;
}

const SKIN = [0xf1c9a5, 0xe0ac7e, 0xc68642, 0x9c6b43, 0x6f4a2f, 0xffd9b8, 0xb5794f];
const HAIR = [0x1c1a19, 0x3b2a1e, 0x6b4a2b, 0xd9b36a, 0xb23a2e, 0xe8e2d4, 0x1f4fd6, 0xff5fa2];
const BRIGHT = [0xff4f9a, 0x18b8b0, 0xffc83d, 0xff7a59, 0x8a5cf5, 0x3aa0ff, 0x7fe0c4, 0xfafaf5, 0xf7a8b8, 0x2ee6d6, 0xff9e3d, 0x9be15d];
const DARK = [0x22303a, 0x2b2d42, 0x3a2f4f, 0x1d3b3a, 0x40312a, 0x343a40, 0xf5f1e6, 0x0f4c5c, 0x7a2e3b];
const SHOES = [0xfafaf5, 0x22303a, 0xff4f9a, 0x18b8b0, 0xffc83d, 0xe63946];

export function randomOutfit(rng: Rng): Outfit {
  const shirt = new Color(rng.pick(BRIGHT));
  let shirt2 = new Color(rng.pick(BRIGHT));
  if (shirt2.equals(shirt)) shirt2 = new Color(0xfafaf5);
  return {
    skin: new Color(rng.pick(SKIN)),
    shirt,
    shirt2,
    pants: new Color(rng.pick(rng.chance(0.65) ? DARK : BRIGHT)),
    shoes: new Color(rng.pick(SHOES)),
    sole: new Color(rng.chance(0.7) ? 0xf2f2ec : 0x22262b),
    accent: new Color(rng.pick(BRIGHT)),
    hair: new Color(rng.pick(HAIR)),
    shirtStyle: rng.weighted([
      [0, 3],
      [1, 2],
      [2, 2],
      [3, 3],
      [4, 2],
    ] as const),
    sleeve: rng.weighted([
      [0.17, 2],
      [0.37, 5],
      [0.72, 2],
    ] as const),
    hem: rng.weighted([
      [0.56, 4],
      [0.44, 3],
      [0.15, 3],
    ] as const),
    gloves: rng.chance(0.3),
    hairStyle: rng.pick<HairStyle>(['short', 'cap', 'mohawk', 'bun', 'bandana', 'visor', 'long', 'short', 'cap', 'bald']),
    glasses: rng.chance(0.45),
    pack: new Color(rng.pick(BRIGHT)),
  };
}

/** The player's default look. */
export function heroOutfit(): Outfit {
  return {
    skin: new Color(0xe0ac7e),
    shirt: new Color(0xff4f9a),
    shirt2: new Color(0xffc83d),
    pants: new Color(0x22303a),
    shoes: new Color(0xfafaf5),
    sole: new Color(0x18b8b0),
    accent: new Color(0x2ee6d6),
    hair: new Color(0x1c1a19),
    shirtStyle: 3,
    sleeve: 0.37,
    hem: 0.44,
    gloves: true,
    hairStyle: 'cap',
    glasses: true,
    pack: new Color(0x18b8b0),
  };
}

interface OutfitUniforms {
  uSkin: { value: Color };
  uShirt: { value: Color };
  uShirt2: { value: Color };
  uPants: { value: Color };
  uShoes: { value: Color };
  uSole: { value: Color };
  uAccent: { value: Color };
  /** x sleeve reach, y hem height, z shirt style, w gloves. */
  uCut: { value: Vector4 };
  /** rgb flash colour, a amount. */
  uFlash: { value: Vector4 };
}

const OUTFIT_GLSL = /* glsl */ `
  uniform vec3 uSkin;
  uniform vec3 uShirt;
  uniform vec3 uShirt2;
  uniform vec3 uPants;
  uniform vec3 uShoes;
  uniform vec3 uSole;
  uniform vec3 uAccent;
  uniform vec4 uCut;
  uniform vec4 uFlash;
  varying vec3 vBind;
  float outfitRough = 0.7;
  float outfitHash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

  // Clothing from the T-pose position: x is across the body, y is height, z is front (+) to back (-).
  vec3 outfitColor(vec3 p) {
    float ax = abs(p.x);
    vec3 col = uSkin;
    outfitRough = 0.62;
    float style = uCut.z;
    bool torso = p.y > 0.97 && p.y < 1.5 && ax < 0.2;
    bool arm = p.y > 1.3 && ax >= 0.2;
    if (torso || (arm && ax < uCut.x)) {
      col = uShirt;
      outfitRough = 0.82;
      if (style > 0.5 && style < 1.5) {
        col = mix(uShirt, uShirt2, step(0.5, fract(p.y * 11.0)));
      } else if (style > 1.5 && style < 2.5) {
        if (p.y > 1.24 && p.y < 1.34) col = uShirt2;
        if (arm && ax > uCut.x - 0.035) col = uShirt2;
      } else if (style > 2.5 && style < 3.5) {
        // Floral print: scattered petals on a grid, in two tints.
        vec2 g = vec2(p.x + p.z * 0.6, p.y) * 15.0;
        vec2 cell = floor(g);
        vec2 f = fract(g) - 0.5;
        float h = outfitHash(cell);
        vec2 o = (vec2(outfitHash(cell + 3.1), outfitHash(cell + 7.7)) - 0.5) * 0.5;
        float petal = smoothstep(0.34, 0.26, length(f - o) + 0.1 * sin(atan(f.y - o.y, f.x - o.x) * 5.0 + h * 6.0));
        col = mix(uShirt, mix(uShirt2, uAccent, step(0.6, h)), petal * step(0.35, h));
      } else if (style > 3.5) {
        if (torso && ax > 0.115) col = uShirt2;
      }
      // Collar opening at the neck.
      if (p.y > 1.44 && ax < 0.06 && p.z > -0.02) col = uSkin;
    }
    if (p.y <= 0.97 && p.y > uCut.y) {
      col = uPants;
      outfitRough = 0.85;
      if (ax > 0.165 && p.y < 0.93) col = mix(uPants, uAccent, 0.85);
    }
    if (p.y > 0.955 && p.y < 1.0 && ax < 0.2) {
      col = uPants * 0.55;
      if (ax < 0.022 && p.z > 0.0) col = uAccent;
    }
    if (p.y <= uCut.y && p.y > 0.13 && p.y < 0.2 && uCut.y > 0.3) {
      col = vec3(0.93);
      outfitRough = 0.9;
    }
    if (p.y <= 0.13) {
      col = p.y < 0.03 ? uSole : uShoes;
      outfitRough = 0.5;
      if (p.y > 0.06 && p.y < 0.075) col = uAccent;
    }
    if (ax > 0.735 && uCut.w > 0.5) {
      col = uAccent * 0.35 + 0.03;
      outfitRough = 0.55;
    }
    if (ax > 0.68 && ax < 0.715 && p.x > 0.0 && uCut.x < 0.6) col = vec3(0.08);
    return col;
  }
`;

/** One material program for every character. Each character gets its own clone with its own uniforms. */
function createOutfitMaterial(): { material: MeshStandardMaterial; uniforms: OutfitUniforms } {
  const uniforms: OutfitUniforms = {
    uSkin: { value: new Color(0xe0ac7e) },
    uShirt: { value: new Color(0xff4f9a) },
    uShirt2: { value: new Color(0xffffff) },
    uPants: { value: new Color(0x22303a) },
    uShoes: { value: new Color(0xffffff) },
    uSole: { value: new Color(0xeeeeee) },
    uAccent: { value: new Color(0x2ee6d6) },
    uCut: { value: new Vector4(0.37, 0.44, 0, 0) },
    uFlash: { value: new Vector4(1, 1, 1, 0) },
  };
  const material = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0 });
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vBind;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvBind = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${OUTFIT_GLSL}`)
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = outfitColor(vBind);')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = outfitRough;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uFlash.rgb * uFlash.a;');
  };
  material.customProgramCacheKey = () => 'outfit';
  return { material, uniforms };
}

const accessoryMaterial = new MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.05 });
const glassMaterial = new MeshStandardMaterial({ color: 0x0b1116, roughness: 0.12, metalness: 0.6 });

function tinted(geometry: BufferGeometry, color: Color): BufferGeometry {
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  const n = g.attributes['position']!.count;
  const c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    c[i * 3] = color.r;
    c[i * 3 + 1] = color.g;
    c[i * 3 + 2] = color.b;
  }
  g.setAttribute('color', new BufferAttribute(c, 3));
  g.deleteAttribute('uv');
  return g;
}

/**
 * Hair, hat and glasses as one mesh in head-bone space (y up from the base of the skull, z forward).
 * The mannequin's head is an ellipsoid about 17 cm wide, 27 cm tall and 23 cm deep, centred at HEAD.
 */
const HEAD = { x: 0, y: 0.14, z: -0.006, rx: 0.087, ry: 0.127, rz: 0.117 };

function buildHeadwear(o: Outfit): Mesh[] {
  const parts: BufferGeometry[] = [];
  /**
   * A cap of the head ellipsoid, `margin` metres proud of the skin. `phi` is how far down from the crown
   * it reaches (half a turn is the whole head) and `tilt` tips it back, raising the front edge and
   * lowering the one at the nape, the way a hairline or a hat sits.
   */
  const dome = (margin: number, color: Color, phi = Math.PI * 0.5, tilt = 0): void => {
    const g = new SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, phi);
    g.scale(HEAD.rx + margin, HEAD.ry + margin, HEAD.rz + margin);
    if (tilt) g.rotateX(-tilt);
    g.translate(HEAD.x, HEAD.y, HEAD.z);
    parts.push(tinted(g, color));
  };
  /** A band round the head at height `y`. */
  const band = (y: number, height: number, margin: number, color: Color): void => {
    const k = Math.sqrt(Math.max(0.05, 1 - ((y - HEAD.y) / HEAD.ry) ** 2));
    const g = new CylinderGeometry(1, 1, height, 20, 1, true);
    g.scale(HEAD.rx * k + margin, 1, HEAD.rz * k + margin);
    g.translate(HEAD.x, y, HEAD.z);
    parts.push(tinted(g, color));
  };
  const box = (sx: number, sy: number, sz: number, x: number, y: number, z: number, color: Color, rx = 0): void => {
    const g = new BoxGeometry(sx, sy, sz);
    if (rx) g.rotateX(rx);
    g.translate(x, y, z);
    parts.push(tinted(g, color));
  };
  /** The front half of a disc: a peak for a cap or a visor. */
  const brim = (y: number, color: Color, droop: number): void => {
    const g = new CylinderGeometry(0.092, 0.092, 0.012, 18, 1, false, -Math.PI / 2, Math.PI);
    g.scale(1, 1, 1.3);
    g.rotateX(droop);
    g.translate(0, y, 0.082);
    parts.push(tinted(g, color));
  };
  const hair = o.hair;
  switch (o.hairStyle) {
    case 'short':
      dome(0.008, hair, Math.PI * 0.53, 0.3);
      break;
    case 'long':
      dome(0.011, hair, Math.PI * 0.55, 0.32);
      box(0.165, 0.2, 0.05, 0, 0.03, -0.112, hair, 0.1);
      break;
    case 'bun': {
      dome(0.008, hair, Math.PI * 0.53, 0.3);
      const g = new SphereGeometry(0.048, 10, 8);
      g.translate(0, 0.262, -0.085);
      parts.push(tinted(g, hair));
      break;
    }
    case 'mohawk':
      dome(0.003, hair.clone().multiplyScalar(0.5), Math.PI * 0.5, 0.3);
      box(0.034, 0.075, 0.21, 0, 0.292, -0.012, hair, 0.08);
      break;
    case 'bandana':
      dome(0.006, hair, Math.PI * 0.55, 0.32);
      band(0.205, 0.05, 0.012, o.accent);
      box(0.03, 0.1, 0.02, 0.025, 0.15, -0.135, o.accent, 0.35);
      break;
    case 'cap':
      // Hair shows under the cap at the sides and the nape.
      dome(0.004, hair, Math.PI * 0.56, 0.35);
      dome(0.013, o.accent, Math.PI * 0.43, 0.08);
      brim(0.176, o.accent.clone().multiplyScalar(0.7), 0.1);
      break;
    case 'visor':
      dome(0.007, hair, Math.PI * 0.53, 0.3);
      band(0.19, 0.04, 0.014, o.shirt2);
      brim(0.178, o.shirt2, 0.14);
      break;
    default:
      break;
  }
  const out: Mesh[] = [];
  if (parts.length) {
    const merged = mergeGeometries(parts, false);
    if (merged) out.push(new Mesh(merged, accessoryMaterial));
  }
  if (o.glasses) {
    const lens = new BoxGeometry(0.16, 0.038, 0.022);
    lens.translate(0, 0.122, 0.108);
    const arms = [new BoxGeometry(0.008, 0.012, 0.12), new BoxGeometry(0.008, 0.012, 0.12)];
    arms[0]!.translate(0.082, 0.128, 0.05);
    arms[1]!.translate(-0.082, 0.128, 0.05);
    const merged = mergeGeometries([lens, ...arms], false);
    if (merged) out.push(new Mesh(merged, glassMaterial));
  }
  return out;
}

/** Parachute pack in chest-bone space. */
function buildPack(o: Outfit): Mesh {
  const parts: BufferGeometry[] = [];
  const body = new BoxGeometry(0.26, 0.32, 0.1);
  body.translate(0, -0.03, -0.14);
  parts.push(tinted(body, o.pack));
  const flap = new BoxGeometry(0.24, 0.09, 0.11);
  flap.translate(0, 0.09, -0.142);
  parts.push(tinted(flap, o.pack.clone().multiplyScalar(0.72)));
  for (const s of [-1, 1]) {
    const strap = new BoxGeometry(0.035, 0.36, 0.02);
    strap.rotateX(-0.1);
    strap.translate(s * 0.09, 0.03, 0.105);
    parts.push(tinted(strap, new Color(0x20262c)));
    const top = new BoxGeometry(0.035, 0.02, 0.24);
    top.translate(s * 0.09, 0.19, -0.03);
    parts.push(tinted(top, new Color(0x20262c)));
  }
  const handle = new BoxGeometry(0.05, 0.03, 0.03);
  handle.translate(0.11, -0.05, 0.12);
  parts.push(tinted(handle, new Color(0xe63946)));
  return new Mesh(mergeGeometries(parts, false)!, accessoryMaterial);
}

const NAMED = [
  'hips',
  'spine1',
  'spine2',
  'spine3',
  'neck',
  'head',
  'shoulderL',
  'upperArmL',
  'forearmL',
  'handL',
  'shoulderR',
  'upperArmR',
  'forearmR',
  'handR',
  'thighL',
  'shinL',
  'footL',
  'toeL',
  'thighR',
  'shinR',
  'footR',
  'toeR',
] as const;
type NamedBone = (typeof NAMED)[number];

let gripQuat: Quaternion | null = null;

/** One character's skeleton, skinned meshes, clothing and accessories. */
export class CharacterRig {
  /** Sits at the character's feet. Its yaw is the facing direction plus half a turn (the model faces +Z). */
  readonly root = new Group();
  readonly bones: Bone[] = [];
  readonly b: Record<NamedBone, Bone>;
  readonly rootBone: Bone;
  /** Where a held item attaches: +Z along the barrel, +Y up, origin in the palm. */
  readonly grip = new Object3D();
  readonly back = new Object3D();
  private model: Object3D;
  private uniforms: OutfitUniforms;
  private material: MeshStandardMaterial;
  private accessories: Mesh[] = [];
  private meshes: SkinnedMesh[] = [];
  outfit: Outfit;

  constructor(asset: ModelAsset, bank: ClipBank, outfit: Outfit) {
    this.model = SkeletonUtils.clone(asset.scene);
    this.root.add(this.model);
    const byName = new Map<string, Bone>();
    this.model.traverse((o) => {
      if ((o as Bone).isBone) byName.set(o.name, o as Bone);
      if ((o as SkinnedMesh).isSkinnedMesh) this.meshes.push(o as SkinnedMesh);
    });
    for (const name of bank.boneNames) {
      const bone = byName.get(name);
      if (!bone) throw new Error(`rig is missing bone ${name}`);
      this.bones.push(bone);
    }
    this.rootBone = this.bones[0]!;
    const b = {} as Record<NamedBone, Bone>;
    for (const key of NAMED) b[key] = this.bones[bank.bone(BONE[key])]!;
    this.b = b;

    const made = createOutfitMaterial();
    this.material = made.material;
    this.uniforms = made.uniforms;
    for (const mesh of this.meshes) {
      mesh.material = this.material;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // Poses reach far outside the T-pose bounds; one generous sphere avoids per-frame bounds work.
      mesh.geometry.boundingSphere = new Sphere(new Vector3(0, 0.95, 0), 1.7);
      mesh.frustumCulled = true;
    }

    if (!gripQuat) gripQuat = CharacterRig.measureGrip(asset, bank);
    this.grip.quaternion.copy(gripQuat);
    this.grip.position.set(-0.028, 0.092, 0.012);
    this.b.handR.add(this.grip);
    this.back.position.set(0.08, 0.05, -0.2);
    this.back.rotation.set(0.2, 0, 2.2);
    this.b.spine3.add(this.back);

    this.outfit = outfit;
    this.setOutfit(outfit);
  }

  /**
   * The grip frame is defined by the pistol aim pose: there the barrel points straight ahead (+Z of the
   * model) with the sights up, so the socket is the inverse of the hand's rotation in that pose.
   */
  private static measureGrip(asset: ModelAsset, bank: ClipBank): Quaternion {
    const probe = SkeletonUtils.clone(asset.scene);
    const byName = new Map<string, Bone>();
    probe.traverse((o) => {
      if ((o as Bone).isBone) byName.set(o.name, o as Bone);
    });
    const bones = bank.boneNames.map((n) => byName.get(n)!);
    const aim = bank.sample(bank.clip('Pistol_Aim_Neutral'), 0, new Pose(bank.boneCount));
    bank.apply(aim, bones);
    probe.updateMatrixWorld(true);
    const hand = byName.get(BONE.handR)!;
    return hand.getWorldQuaternion(new Quaternion()).invert();
  }

  setOutfit(o: Outfit): void {
    this.outfit = o;
    const u = this.uniforms;
    u.uSkin.value.copy(o.skin);
    u.uShirt.value.copy(o.shirt);
    u.uShirt2.value.copy(o.shirt2);
    u.uPants.value.copy(o.pants);
    u.uShoes.value.copy(o.shoes);
    u.uSole.value.copy(o.sole);
    u.uAccent.value.copy(o.accent);
    u.uCut.value.set(o.sleeve, o.hem, o.shirtStyle, o.gloves ? 1 : 0);
    for (const m of this.accessories) {
      m.removeFromParent();
      m.geometry.dispose();
    }
    this.accessories = [];
    for (const m of buildHeadwear(o)) {
      this.b.head.add(m);
      this.accessories.push(m);
    }
    const pack = buildPack(o);
    this.b.spine3.add(pack);
    this.accessories.push(pack);
    for (const m of this.accessories) {
      m.castShadow = true;
      m.receiveShadow = false;
    }
  }

  /** Brief emissive flash, for hits and pickups. */
  setFlash(r: number, g: number, b: number, amount: number): void {
    this.uniforms.uFlash.value.set(r, g, b, amount);
  }

  setVisible(v: boolean): void {
    this.root.visible = v;
  }

  setShadows(v: boolean): void {
    for (const m of this.meshes) m.castShadow = v;
    for (const m of this.accessories) m.castShadow = v;
  }

  dispose(): void {
    this.root.removeFromParent();
    this.material.dispose();
    for (const m of this.accessories) m.geometry.dispose();
  }
}
