import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  type Camera,
  CanvasTexture,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  type PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  Quaternion,
  type Scene,
  ShaderMaterial,
  Vector3,
} from 'three';
import type { GameSystem } from '../core/system';

/** The looks a system can ask for. Each is a short-lived puff, spray or flash at a point. */
export type FxKind = 'dust' | 'smoke' | 'spark' | 'spray' | 'splash' | 'wake' | 'skid' | 'muzzle' | 'impact' | 'glass' | 'blood' | 'explosion' | 'shell';

export interface FxOptions {
  /** Direction the effect leans toward (a surface normal, a velocity). Need not be normalised. */
  dx?: number;
  dy?: number;
  dz?: number;
  /** Scales how many particles are made. 1 by default. */
  amount?: number;
  /** Overrides the main colour (0xrrggbb), for dust that matches the ground it came from. */
  color?: number;
}

/** One kind of particle inside an effect. Speeds in m/s, sizes in metres, times in seconds. */
interface Recipe {
  /** 0 soft (smoke, dust, water), 1 glow (fire, sparks). */
  layer: 0 | 1;
  count: number;
  speed: [number, number];
  /** 0 flies off in every direction, 1 straight along the given direction. */
  focus: number;
  life: [number, number];
  /** Size at birth and at death. */
  size: [number, number];
  color: number;
  /** Brightness multiplier. Above 1 feeds the bloom. */
  gain: number;
  alpha: number;
  /** Downward acceleration. Negative rises. */
  gravity: number;
  drag: number;
  /** Radius of the cloud the particles start in. */
  spawn: number;
}

const R = (layer: 0 | 1, count: number, speed: [number, number], focus: number, life: [number, number], size: [number, number], color: number, gain: number, alpha: number, gravity: number, drag: number, spawn = 0.05): Recipe => ({
  layer,
  count,
  speed,
  focus,
  life,
  size,
  color,
  gain,
  alpha,
  gravity,
  drag,
  spawn,
});

const RECIPES: Record<FxKind, Recipe[]> = {
  dust: [R(0, 6, [0.5, 1.8], 0.35, [0.5, 1.1], [0.25, 0.95], 0xcbb89a, 1, 0.32, 0.2, 2.5, 0.15)],
  smoke: [R(0, 5, [0.4, 1.3], 0.5, [1.2, 2.4], [0.5, 2.3], 0x5b6064, 1, 0.38, -0.9, 1.2, 0.2)],
  spark: [R(1, 9, [3, 9], 0.45, [0.15, 0.45], [0.06, 0.012], 0xffc060, 3.2, 1, 9, 0.5)],
  spray: [R(0, 8, [2, 6], 0.55, [0.4, 0.9], [0.18, 0.55], 0xe8f4f8, 1, 0.5, 9, 0.6, 0.2)],
  splash: [R(0, 14, [3, 8], 0.7, [0.5, 1.0], [0.25, 0.85], 0xeef8fb, 1, 0.55, 11, 0.5, 0.25), R(0, 5, [0.5, 1.6], 0, [0.8, 1.4], [0.5, 1.7], 0xf4fbfa, 1, 0.32, 0, 2, 0.3)],
  wake: [R(0, 3, [0.2, 0.9], 0, [1.2, 2.2], [0.6, 2.0], 0xf2fafb, 1, 0.3, 0, 1.6, 0.35)],
  skid: [R(0, 3, [0.3, 1.1], 0.3, [0.6, 1.2], [0.4, 1.5], 0xd8d8d8, 1, 0.28, -0.5, 1.4, 0.2)],
  muzzle: [R(1, 3, [4, 11], 0.9, [0.03, 0.06], [0.3, 0.1], 0xffd9a0, 4, 1, 0, 0), R(0, 1, [0.6, 1.4], 0.8, [0.35, 0.6], [0.12, 0.5], 0x9a9a9a, 1, 0.2, -0.6, 2)],
  impact: [R(0, 5, [0.8, 2.6], 0.6, [0.3, 0.7], [0.1, 0.45], 0xb9b2a6, 1, 0.5, 2.5, 2.2), R(1, 3, [2, 6], 0.5, [0.1, 0.28], [0.04, 0.01], 0xffcf80, 3, 1, 9, 0.5)],
  glass: [R(0, 10, [2, 6], 0.5, [0.4, 0.8], [0.07, 0.03], 0xdff6ff, 1, 0.9, 12, 0.3, 0.1)],
  blood: [R(0, 6, [1, 3.6], 0.6, [0.25, 0.5], [0.1, 0.32], 0xb8324a, 1, 0.7, 6, 1.5)],
  explosion: [
    R(1, 14, [2, 7], 0.2, [0.25, 0.6], [1.3, 3.1], 0xffa040, 3, 0.9, -1, 2.5, 0.5),
    R(0, 16, [1.5, 5], 0.2, [1.5, 3.0], [1.5, 4.6], 0x3c3d40, 1, 0.5, -0.9, 1.6, 0.8),
    R(1, 24, [8, 20], 0.15, [0.3, 0.8], [0.09, 0.02], 0xffc070, 3.5, 1, 9, 0.6, 0.3),
  ],
  shell: [R(0, 1, [2, 3.2], 0.9, [0.5, 0.8], [0.05, 0.05], 0xd9a441, 1, 1, 12, 0.2, 0)],
};

const KINDS = Object.keys(RECIPES) as FxKind[];

const POINT_VERT = /* glsl */ `
attribute vec4 aColor;
attribute float aSize;
uniform float uScale;
varying vec4 vColor;
varying float vFog;
uniform float uFogDensity;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(0.05, -mv.z);
  // Size is in metres: turn it into pixels at this distance.
  gl_PointSize = min(260.0, aSize * uScale / dist);
  vColor = aColor;
  vFog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
}`;

const POINT_FRAG = /* glsl */ `
varying vec4 vColor;
varying float vFog;
uniform vec3 uFogColor;
uniform float uLight;
uniform float uGlow;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.25, d) * vColor.a;
  if (a < 0.004) discard;
  // Smoke and dust are lit by the sky; fire lights itself.
  vec3 col = vColor.rgb * mix(uLight, 1.0, uGlow);
  col = mix(col, uFogColor * (1.0 - uGlow), vFog);
  gl_FragColor = vec4(col, a * (1.0 - vFog * uGlow));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const TRACER_VERT = /* glsl */ `
attribute vec3 iA;
attribute vec3 iB;
attribute vec4 iColor;
uniform vec3 uEye;
varying vec4 vColor;
varying vec2 vUv;
void main() {
  vec3 p = mix(iA, iB, uv.x);
  vec3 along = normalize(iB - iA + vec3(0.0, 1e-5, 0.0));
  vec3 side = normalize(cross(along, uEye - p));
  // Keep the streak at least about a pixel wide however far away it is.
  float w = max(0.03, distance(uEye, p) * 0.0016);
  p += side * (uv.y - 0.5) * w * 2.0;
  vColor = iColor;
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`;

const TRACER_FRAG = /* glsl */ `
varying vec4 vColor;
varying vec2 vUv;
void main() {
  float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
  // Bright at the head, fading to nothing at the tail.
  float a = across * smoothstep(0.0, 0.55, vUv.x) * vColor.a;
  gl_FragColor = vec4(vColor.rgb * a, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** A pool of point sprites simulated on the CPU. */
class Layer {
  readonly points: Points;
  readonly material: ShaderMaterial;
  private readonly pos: Float32Array;
  private readonly vel: Float32Array;
  private readonly life: Float32Array;
  private readonly span: Float32Array;
  private readonly size: Float32Array;
  private readonly tint: Float32Array;
  private readonly force: Float32Array;
  private readonly outPos: Float32Array;
  private readonly outColor: Float32Array;
  private readonly outSize: Float32Array;
  private readonly geometry = new BufferGeometry();
  private next = 0;
  /** Particles alive after the last update. */
  alive = 0;

  constructor(
    readonly capacity: number,
    glow: boolean,
  ) {
    this.pos = new Float32Array(capacity * 3);
    this.vel = new Float32Array(capacity * 3);
    this.life = new Float32Array(capacity);
    this.span = new Float32Array(capacity);
    this.size = new Float32Array(capacity * 2);
    this.tint = new Float32Array(capacity * 4);
    this.force = new Float32Array(capacity * 2);
    this.outPos = new Float32Array(capacity * 3);
    this.outColor = new Float32Array(capacity * 4);
    this.outSize = new Float32Array(capacity);
    const g = this.geometry;
    g.setAttribute('position', new BufferAttribute(this.outPos, 3).setUsage(DynamicDrawUsage));
    g.setAttribute('aColor', new BufferAttribute(this.outColor, 4).setUsage(DynamicDrawUsage));
    g.setAttribute('aSize', new BufferAttribute(this.outSize, 1).setUsage(DynamicDrawUsage));
    g.setDrawRange(0, 0);
    this.material = new ShaderMaterial({
      vertexShader: POINT_VERT,
      fragmentShader: POINT_FRAG,
      uniforms: {
        uScale: { value: 800 },
        uFogColor: { value: new Color(0xffffff) },
        uFogDensity: { value: 0.0005 },
        uLight: { value: 1 },
        uGlow: { value: glow ? 1 : 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: glow ? AdditiveBlending : NormalBlending,
    });
    this.points = new Points(g, this.material);
    this.points.frustumCulled = false;
    // After the water, which is also see-through.
    this.points.renderOrder = glow ? 12 : 11;
    this.points.name = glow ? 'fx-glow' : 'fx-soft';
  }

  spawn(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, size0: number, size1: number, r: number, g: number, b: number, a: number, gravity: number, drag: number): void {
    // When the pool is full the oldest slot is reused; nobody misses one puff of a hundred.
    const i = this.next;
    this.next = (i + 1) % this.capacity;
    const i3 = i * 3;
    this.pos[i3] = x;
    this.pos[i3 + 1] = y;
    this.pos[i3 + 2] = z;
    this.vel[i3] = vx;
    this.vel[i3 + 1] = vy;
    this.vel[i3 + 2] = vz;
    this.life[i] = life;
    this.span[i] = life;
    this.size[i * 2] = size0;
    this.size[i * 2 + 1] = size1;
    const i4 = i * 4;
    this.tint[i4] = r;
    this.tint[i4 + 1] = g;
    this.tint[i4 + 2] = b;
    this.tint[i4 + 3] = a;
    this.force[i * 2] = gravity;
    this.force[i * 2 + 1] = drag;
  }

  update(dt: number): void {
    const { pos, vel, life, span, size, tint, force, outPos, outColor, outSize } = this;
    let n = 0;
    for (let i = 0; i < this.capacity; i++) {
      let l = life[i]!;
      if (l <= 0) continue;
      l -= dt;
      life[i] = l;
      if (l <= 0) continue;
      const i3 = i * 3;
      const k = Math.max(0, 1 - force[i * 2 + 1]! * dt);
      vel[i3] = vel[i3]! * k;
      vel[i3 + 1] = (vel[i3 + 1]! - force[i * 2]! * dt) * k;
      vel[i3 + 2] = vel[i3 + 2]! * k;
      pos[i3] = pos[i3]! + vel[i3]! * dt;
      pos[i3 + 1] = pos[i3 + 1]! + vel[i3 + 1]! * dt;
      pos[i3 + 2] = pos[i3 + 2]! + vel[i3 + 2]! * dt;
      const t = 1 - l / span[i]!;
      const n3 = n * 3;
      outPos[n3] = pos[i3]!;
      outPos[n3 + 1] = pos[i3 + 1]!;
      outPos[n3 + 2] = pos[i3 + 2]!;
      const i4 = i * 4;
      const n4 = n * 4;
      outColor[n4] = tint[i4]!;
      outColor[n4 + 1] = tint[i4 + 1]!;
      outColor[n4 + 2] = tint[i4 + 2]!;
      // In quickly, out slowly.
      outColor[n4 + 3] = tint[i4 + 3]! * Math.min(1, t * 12) * (1 - t) * (1 - t * 0.35);
      outSize[n] = size[i * 2]! + (size[i * 2 + 1]! - size[i * 2]!) * t;
      n++;
    }
    this.alive = n;
    const g = this.geometry;
    g.setDrawRange(0, n);
    if (n > 0) {
      for (const name of ['position', 'aColor', 'aSize'] as const) {
        const a = g.getAttribute(name) as BufferAttribute;
        a.clearUpdateRanges();
        a.addUpdateRange(0, n * a.itemSize);
        a.needsUpdate = true;
      }
    }
  }

  clear(): void {
    this.life.fill(0);
    this.alive = 0;
    this.geometry.setDrawRange(0, 0);
  }
}

interface Tracer {
  ax: number;
  ay: number;
  az: number;
  dx: number;
  dy: number;
  dz: number;
  length: number;
  travelled: number;
  r: number;
  g: number;
  b: number;
  live: boolean;
}

const TRACERS = 48;
const DECALS = 160;
const TRACER_SPEED = 420;
const TRACER_STREAK = 14;

const _c = new Color();
const _m = new Matrix4();
const _q = new Quaternion();
const _n = new Vector3();
const _p = new Vector3();
const _s = new Vector3();
const Z = new Vector3(0, 0, 1);

/** A dark round mark with soft edges, drawn once. */
function scorchTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  grad.addColorStop(0, 'rgba(8,8,10,0.95)');
  grad.addColorStop(0.35, 'rgba(18,18,20,0.75)');
  grad.addColorStop(0.7, 'rgba(30,30,32,0.28)');
  grad.addColorStop(1, 'rgba(30,30,32,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

/**
 * Every short-lived effect in the game: smoke, dust, water spray, sparks, muzzle flashes, bullet
 * streaks and the marks they leave. Two point-sprite pools, one strip pool and one decal pool, so
 * a firefight costs four draw calls.
 */
export class Effects implements GameSystem {
  /** How many bursts of each kind have been asked for. Tests read it. */
  readonly counts: Record<FxKind, number>;
  tracers = 0;
  decals = 0;
  /** 0 night .. 1 day: how brightly the sky lights smoke and dust. */
  daylight = 1;
  private soft: Layer | null = null;
  private glow: Layer | null = null;
  private camera: PerspectiveCamera | null = null;
  private scene: Scene | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private streaks: Tracer[] = [];
  private streakMesh: Mesh | null = null;
  private streakA!: InstancedBufferAttribute;
  private streakB!: InstancedBufferAttribute;
  private streakColor!: InstancedBufferAttribute;
  private marks: InstancedMesh | null = null;
  private nextMark = 0;
  private light: PointLight | null = null;
  private lightLife = 0;
  private seed = 0x2f6e2b1;

  constructor() {
    this.counts = Object.fromEntries(KINDS.map((k) => [k, 0])) as Record<FxKind, number>;
  }

  /** Put the pools in the scene. Until this is called, effects are counted and nothing is drawn. */
  attach(scene: Scene, camera: Camera, canvas: HTMLCanvasElement): void {
    this.scene = scene;
    this.canvas = canvas;
    this.camera = camera as PerspectiveCamera;
    this.soft = new Layer(2400, false);
    this.glow = new Layer(1200, true);
    scene.add(this.soft.points, this.glow.points);

    const quad = new PlaneGeometry(1, 1);
    quad.translate(0.5, 0.5, 0);
    const g = new InstancedBufferGeometry();
    g.index = quad.index;
    g.setAttribute('position', quad.getAttribute('position'));
    g.setAttribute('uv', quad.getAttribute('uv'));
    this.streakA = new InstancedBufferAttribute(new Float32Array(TRACERS * 3), 3).setUsage(DynamicDrawUsage);
    this.streakB = new InstancedBufferAttribute(new Float32Array(TRACERS * 3), 3).setUsage(DynamicDrawUsage);
    this.streakColor = new InstancedBufferAttribute(new Float32Array(TRACERS * 4), 4).setUsage(DynamicDrawUsage);
    g.setAttribute('iA', this.streakA);
    g.setAttribute('iB', this.streakB);
    g.setAttribute('iColor', this.streakColor);
    g.instanceCount = 0;
    const streakMaterial = new ShaderMaterial({
      vertexShader: TRACER_VERT,
      fragmentShader: TRACER_FRAG,
      uniforms: { uEye: { value: new Vector3() } },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
    });
    this.streakMesh = new Mesh(g, streakMaterial);
    this.streakMesh.frustumCulled = false;
    this.streakMesh.renderOrder = 13;
    this.streakMesh.name = 'fx-tracers';
    scene.add(this.streakMesh);
    for (let i = 0; i < TRACERS; i++) this.streaks.push({ ax: 0, ay: 0, az: 0, dx: 0, dy: 0, dz: 1, length: 0, travelled: 0, r: 1, g: 1, b: 1, live: false });

    const markMaterial = new MeshBasicMaterial({ map: scorchTexture(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    this.marks = new InstancedMesh(new PlaneGeometry(1, 1), markMaterial, DECALS);
    this.marks.count = 0;
    this.marks.frustumCulled = false;
    this.marks.renderOrder = 3;
    this.marks.name = 'fx-marks';
    scene.add(this.marks);

    // One light for every flash. It stays in the scene at zero so the first shot compiles nothing.
    this.light = new PointLight(0xffc98a, 0, 14, 1.8);
    this.light.name = 'fx-flash';
    scene.add(this.light);
  }

  private random(): number {
    // Small xorshift: effects must not disturb the game's own random streams.
    let s = this.seed;
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    this.seed = s;
    return (s >>> 0) / 4294967296;
  }

  /** Make an effect at a point. Safe to call from anywhere, any number of times a step. */
  burst(kind: FxKind, x: number, y: number, z: number, options?: FxOptions): void {
    this.counts[kind]++;
    const soft = this.soft;
    const glow = this.glow;
    const cam = this.camera;
    if (!soft || !glow || !cam) return;
    // Too far to see: skip the work.
    const cx = x - cam.position.x;
    const cy = y - cam.position.y;
    const cz = z - cam.position.z;
    const far = kind === 'explosion' ? 500 : 230;
    if (cx * cx + cy * cy + cz * cz > far * far) return;
    let dx = options?.dx ?? 0;
    let dy = options?.dy ?? 1;
    let dz = options?.dz ?? 0;
    const dl = Math.hypot(dx, dy, dz);
    if (dl > 1e-5) {
      dx /= dl;
      dy /= dl;
      dz /= dl;
    } else {
      dx = 0;
      dy = 1;
      dz = 0;
    }
    const amount = options?.amount ?? 1;
    const recipes = RECIPES[kind];
    for (let ri = 0; ri < recipes.length; ri++) {
      const r = recipes[ri]!;
      const layer = r.layer === 1 ? glow : soft;
      _c.setHex(ri === 0 && options?.color !== undefined ? options.color : r.color);
      const count = Math.max(1, Math.round(r.count * amount));
      for (let i = 0; i < count; i++) {
        // A random direction, pulled toward the given one by `focus`.
        const u = this.random() * 2 - 1;
        const a = this.random() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        let vx = s * Math.cos(a) * (1 - r.focus) + dx * r.focus;
        let vy = u * (1 - r.focus) + dy * r.focus;
        let vz = s * Math.sin(a) * (1 - r.focus) + dz * r.focus;
        const vl = Math.hypot(vx, vy, vz) || 1;
        const speed = r.speed[0] + (r.speed[1] - r.speed[0]) * this.random();
        vx = (vx / vl) * speed;
        vy = (vy / vl) * speed;
        vz = (vz / vl) * speed;
        const life = r.life[0] + (r.life[1] - r.life[0]) * this.random();
        const grow = 0.75 + this.random() * 0.5;
        const shade = 0.85 + this.random() * 0.3;
        layer.spawn(
          x + (this.random() - 0.5) * 2 * r.spawn,
          y + (this.random() - 0.5) * 2 * r.spawn,
          z + (this.random() - 0.5) * 2 * r.spawn,
          vx,
          vy,
          vz,
          life,
          r.size[0] * grow,
          r.size[1] * grow,
          _c.r * r.gain * shade,
          _c.g * r.gain * shade,
          _c.b * r.gain * shade,
          r.alpha,
          r.gravity,
          r.drag,
        );
      }
    }
    if (kind === 'explosion') this.flash(x, y + 0.6, z, 60);
  }

  /** A bullet's streak from one point to another. */
  tracer(ax: number, ay: number, az: number, bx: number, by: number, bz: number, color = 0xffe2a8): void {
    this.tracers++;
    if (!this.streakMesh) return;
    const length = Math.hypot(bx - ax, by - ay, bz - az);
    if (length < 1.5) return;
    let t = this.streaks.find((s) => !s.live);
    if (!t) t = this.streaks[this.tracers % TRACERS]!;
    t.ax = ax;
    t.ay = ay;
    t.az = az;
    t.dx = (bx - ax) / length;
    t.dy = (by - ay) / length;
    t.dz = (bz - az) / length;
    t.length = length;
    // Start a little way out so the streak never draws inside the gun.
    t.travelled = Math.min(length, 1.2);
    _c.setHex(color);
    t.r = _c.r * 4;
    t.g = _c.g * 4;
    t.b = _c.b * 4;
    t.live = true;
  }

  /** A mark left on a surface: a bullet hole, a scorch. `nx, ny, nz` is the surface normal. */
  decal(x: number, y: number, z: number, nx: number, ny: number, nz: number, size = 0.16): void {
    this.decals++;
    const marks = this.marks;
    if (!marks) return;
    _n.set(nx, ny, nz).normalize();
    _q.setFromUnitVectors(Z, _n);
    _p.set(x, y, z).addScaledVector(_n, 0.012);
    _m.compose(_p, _q, _s.set(size, size, size));
    const i = this.nextMark;
    this.nextMark = (i + 1) % DECALS;
    marks.setMatrixAt(i, _m);
    marks.count = Math.min(DECALS, Math.max(marks.count, i + 1));
    marks.instanceMatrix.needsUpdate = true;
  }

  /** A brief light at a point: a muzzle flash, an explosion. */
  flash(x: number, y: number, z: number, intensity = 14): void {
    const light = this.light;
    if (!light) return;
    // The nearest and brightest flash wins the one light.
    if (this.lightLife > 0 && intensity < light.intensity) return;
    light.position.set(x, y, z);
    light.intensity = intensity;
    light.distance = intensity > 30 ? 34 : 14;
    this.lightLife = intensity > 30 ? 0.22 : 0.06;
  }

  /** Remove everything at once (a new round). */
  clear(): void {
    this.soft?.clear();
    this.glow?.clear();
    for (const t of this.streaks) t.live = false;
    if (this.marks) this.marks.count = 0;
    this.nextMark = 0;
    if (this.light) this.light.intensity = 0;
  }

  /** Particles on screen right now. */
  get alive(): number {
    return (this.soft?.alive ?? 0) + (this.glow?.alive ?? 0);
  }

  frameUpdate(dt: number): void {
    const soft = this.soft;
    const glow = this.glow;
    const cam = this.camera;
    if (!soft || !glow || !cam || !this.scene) return;
    soft.update(dt);
    glow.update(dt);
    const fog = this.scene.fog as { color: Color; density?: number } | null;
    // Pixels per metre at one metre away, for sizing the sprites.
    // (Point sizes count drawing-buffer pixels, so this follows the render resolution.)
    const scale = (this.canvas?.height ?? window.innerHeight) / (2 * Math.tan(((cam.fov * Math.PI) / 180) * 0.5));
    for (const layer of [soft, glow]) {
      const u = layer.material.uniforms;
      u['uScale']!.value = scale;
      u['uLight']!.value = 0.22 + this.daylight * 0.78;
      if (fog) {
        (u['uFogColor']!.value as Color).copy(fog.color);
        u['uFogDensity']!.value = fog.density ?? 0;
      }
    }

    // Streaks fly from the gun to where the bullet went, then vanish.
    let n = 0;
    const a = this.streakA.array as Float32Array;
    const b = this.streakB.array as Float32Array;
    const col = this.streakColor.array as Float32Array;
    for (const t of this.streaks) {
      if (!t.live) continue;
      t.travelled += TRACER_SPEED * dt;
      const tail = Math.max(0, t.travelled - TRACER_STREAK);
      if (tail >= t.length) {
        t.live = false;
        continue;
      }
      const head = Math.min(t.length, t.travelled);
      a[n * 3] = t.ax + t.dx * tail;
      a[n * 3 + 1] = t.ay + t.dy * tail;
      a[n * 3 + 2] = t.az + t.dz * tail;
      b[n * 3] = t.ax + t.dx * head;
      b[n * 3 + 1] = t.ay + t.dy * head;
      b[n * 3 + 2] = t.az + t.dz * head;
      col[n * 4] = t.r;
      col[n * 4 + 1] = t.g;
      col[n * 4 + 2] = t.b;
      col[n * 4 + 3] = 1;
      n++;
    }
    const mesh = this.streakMesh!;
    (mesh.geometry as InstancedBufferGeometry).instanceCount = n;
    if (n > 0) {
      this.streakA.needsUpdate = true;
      this.streakB.needsUpdate = true;
      this.streakColor.needsUpdate = true;
      ((mesh.material as ShaderMaterial).uniforms['uEye']!.value as Vector3).copy(cam.position);
    }

    const light = this.light!;
    if (this.lightLife > 0) {
      this.lightLife -= dt;
      if (this.lightLife <= 0) light.intensity = 0;
      else light.intensity *= Math.exp(-dt * 26);
    }
  }

  dispose(): void {
    for (const o of [this.soft?.points, this.glow?.points, this.streakMesh, this.marks, this.light]) o?.removeFromParent();
  }
}
