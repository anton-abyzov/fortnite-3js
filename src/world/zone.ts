import { Color, CylinderGeometry, DoubleSide, Mesh, ShaderMaterial } from 'three';
import { WORLD } from '../core/config';
import { clamp01, damp, lerp, smoothstep } from '../core/math';
import { Rng } from '../core/rng';
import type { GameSystem } from '../core/system';
import type { Game } from '../game';

/** One closing of the eye: wait, then shrink to `radius`. Outside it, `damage` health a second. */
export interface ZonePhase {
  hold: number;
  shrink: number;
  radius: number;
  damage: number;
}

export const ZONE_PHASES: readonly ZonePhase[] = [
  { hold: 90, shrink: 60, radius: 360, damage: 1 },
  { hold: 60, shrink: 45, radius: 210, damage: 2 },
  { hold: 45, shrink: 40, radius: 115, damage: 4 },
  { hold: 35, shrink: 30, radius: 55, damage: 7 },
  { hold: 25, shrink: 25, radius: 20, damage: 10 },
  { hold: 15, shrink: 20, radius: 0, damage: 14 },
];

/** Radius before the first closing: the whole bay is calm. */
const OPEN_RADIUS = 940;
const WALL_HEIGHT = 420;

export type ZoneStage = 'idle' | 'hold' | 'shrink' | 'closed';

const _spot = { x: 0, z: 0 };

const WALL_VERT = /* glsl */ `
  varying vec3 vWorld;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const WALL_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uRadius;
  uniform float uFlash;
  uniform float uDay;
  uniform float uFar;
  uniform vec3 uRain;
  uniform vec3 uGlow;
  varying vec3 vWorld;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    // Metres around the wall and up it, so the pattern keeps its size as the eye closes.
    float around = vUv.x * 6.2831853 * max(uRadius, 30.0);
    float up = vWorld.y;
    // Rain driven sideways: long streaks leaning with the wind, in two layers.
    float lean = around + up * 0.55;
    float streaks = noise(vec2(lean * 0.9, up * 0.035 + uTime * 2.6));
    streaks = smoothstep(0.55, 0.95, streaks);
    float sheets = noise(vec2(around * 0.012 - uTime * 0.11, up * 0.01 + uTime * 0.05));
    float bands = noise(vec2(around * 0.045 - uTime * 0.35, up * 0.02 - uTime * 0.2));
    float body = 0.34 + 0.3 * sheets + 0.22 * bands;
    // Thick at the ground where the spray is, thinning into the cloud above.
    float foot = 1.0 - smoothstep(0.0, 26.0, up);
    float top = 1.0 - smoothstep(180.0, ${WALL_HEIGHT.toFixed(1)}, up);
    float alpha = clamp((body + streaks * 0.3 + foot * 0.35) * top, 0.0, 0.92);
    vec3 col = mix(uRain * 0.55, uRain, sheets) * (0.35 + 0.65 * uDay);
    col += uGlow * (foot * 0.5 + streaks * 0.25);
    // Lightning inside the wall lights a patch of it.
    float lit = smoothstep(0.62, 1.0, noise(vec2(around * 0.006 + floor(uTime * 0.9) * 3.7, up * 0.004)));
    col += vec3(0.85, 0.95, 1.0) * uFlash * lit * 2.4;
    // The wall melts into the haze well before the far end of the view, so it never ends in a cut edge.
    alpha *= 1.0 - smoothstep(uFar * 0.5, uFar * 0.9, distance(cameraPosition, vWorld));
    gl_FragColor = vec4(col, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * The eye of the storm: the calm circle that closes in phases. Anyone outside it is in the wall
 * and loses health every second.
 */
export class Zone implements GameSystem {
  /** The wall right now. */
  x = 0;
  z = 0;
  radius = OPEN_RADIUS;
  /** Where the wall is going next (shown on the map before it moves). */
  nextX = 0;
  nextZ = 0;
  nextRadius = OPEN_RADIUS;
  phase = 0;
  stage: ZoneStage = 'idle';
  /** Seconds left in this stage. */
  left = 0;
  /** Health a second lost outside the eye right now. */
  damage = 0;
  private fromX = 0;
  private fromZ = 0;
  private fromRadius = OPEN_RADIUS;
  private tick = 0;
  private time = 0;
  private flash = 0;
  private flashIn = 3;
  private rng = new Rng(1);
  /** Lightning timing: its own stream, so what is drawn never changes where the eye goes. */
  private readonly sparks = new Rng(0x51a7);
  private readonly wall: Mesh;
  private readonly material: ShaderMaterial;
  /** How deep in the wall the player's view is, 0..1, smoothed: drives the fog and the screen edge. */
  playerOutside = 0;

  constructor(private readonly game: Game) {
    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRadius: { value: OPEN_RADIUS },
        uFlash: { value: 0 },
        uDay: { value: 1 },
        uFar: { value: 2000 },
        uRain: { value: new Color(0x8fb6c4) },
        uGlow: { value: new Color(0x2ad3c2).multiplyScalar(0.5) },
      },
      vertexShader: WALL_VERT,
      fragmentShader: WALL_FRAG,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      fog: false,
    });
    const geometry = new CylinderGeometry(1, 1, WALL_HEIGHT, 160, 1, true);
    geometry.translate(0, WALL_HEIGHT / 2 - 6, 0);
    this.wall = new Mesh(geometry, this.material);
    this.wall.name = 'eyewall';
    this.wall.renderOrder = 6;
    this.wall.frustumCulled = false;
    this.wall.visible = false;
    game.engine.scene.add(this.wall);
  }

  /** Start the eye for a round: wide open, with the first closing already chosen. */
  begin(seed: number): void {
    this.rng = new Rng(seed ^ 0xe7e3a11);
    this.phase = 0;
    this.x = this.fromX = 0;
    this.z = this.fromZ = 0;
    this.radius = this.fromRadius = OPEN_RADIUS;
    this.stage = 'hold';
    this.left = ZONE_PHASES[0]!.hold;
    this.damage = ZONE_PHASES[0]!.damage;
    this.tick = 0;
    this.pickNext();
    this.wall.visible = true;
    this.emit();
  }

  /** Put the storm away (back to the menu, or a free-roam start). */
  clear(): void {
    this.stage = 'idle';
    this.radius = this.nextRadius = OPEN_RADIUS;
    this.wall.visible = false;
    this.playerOutside = 0;
    this.game.world.sky.storm = 0;
  }

  /** Choose the next circle: inside the current one, centred on open ground in the city. */
  private pickNext(): void {
    const p = ZONE_PHASES[this.phase]!;
    const rng = this.rng;
    const nav = this.game.nav;
    const slack = Math.max(0, this.fromRadius - p.radius);
    let x = this.fromX;
    let z = this.fromZ;
    for (let i = 0; i < 24; i++) {
      let cx: number;
      let cz: number;
      if (this.phase === 0) {
        // The first eye settles over a named part of the city.
        const pois = this.game.world.layout.pois;
        const poi = pois.length > 0 ? rng.pick(pois) : { x: 0, z: 0, r: 60 };
        cx = poi.x + rng.range(-70, 70);
        cz = poi.z + rng.range(-70, 70);
        const limit = WORLD.half - p.radius * 0.7;
        if (Math.abs(cx) > limit || Math.abs(cz) > limit) continue;
      } else {
        const a = rng.range(0, Math.PI * 2);
        const d = slack * 0.85 * Math.sqrt(rng.next());
        cx = this.fromX + Math.cos(a) * d;
        cz = this.fromZ + Math.sin(a) * d;
      }
      if (nav.nearestOpen(cx, cz, Math.min(5, 2 + p.radius * 0.05), 60, _spot) && Math.hypot(_spot.x - this.fromX, _spot.z - this.fromZ) <= slack) {
        x = _spot.x;
        z = _spot.z;
        break;
      }
    }
    this.nextX = x;
    this.nextZ = z;
    this.nextRadius = p.radius;
  }

  private emit(): void {
    this.game.events.emit('zone', { phase: this.phase, stage: this.stage, left: this.left });
  }

  /** Is a point inside the calm? `margin` moves the line inward. */
  inside(x: number, z: number, margin = 0): boolean {
    return Math.hypot(x - this.x, z - this.z) <= this.radius - margin;
  }

  /** Metres a point is outside the next circle (zero or less when it is inside). */
  outsideNext(x: number, z: number): number {
    return Math.hypot(x - this.nextX, z - this.nextZ) - this.nextRadius;
  }

  /** Metres from a point to the wall, positive inside the eye. */
  toWall(x: number, z: number): number {
    return this.radius - Math.hypot(x - this.x, z - this.z);
  }

  /** Seconds until the wall has finished closing to the next circle. */
  get closesIn(): number {
    if (this.stage === 'hold') return this.left + ZONE_PHASES[this.phase]!.shrink;
    return this.stage === 'shrink' ? this.left : 0;
  }

  fixedUpdate(dt: number): void {
    if (this.stage === 'idle') return;
    const game = this.game;
    this.time += dt;
    if (this.stage !== 'closed' && game.match.running) {
      this.left -= dt;
      if (this.stage === 'shrink') {
        const p = ZONE_PHASES[this.phase]!;
        const t = smoothstep(0, 1, clamp01(1 - this.left / p.shrink));
        this.x = lerp(this.fromX, this.nextX, t);
        this.z = lerp(this.fromZ, this.nextZ, t);
        this.radius = lerp(this.fromRadius, this.nextRadius, t);
      }
      if (this.left <= 0) {
        if (this.stage === 'hold') {
          this.stage = 'shrink';
          this.left = ZONE_PHASES[this.phase]!.shrink;
          this.damage = ZONE_PHASES[this.phase]!.damage;
          game.sound('zone_warning');
        } else {
          this.x = this.fromX = this.nextX;
          this.z = this.fromZ = this.nextZ;
          this.radius = this.fromRadius = this.nextRadius;
          this.phase++;
          if (this.phase >= ZONE_PHASES.length) {
            this.phase = ZONE_PHASES.length - 1;
            this.stage = 'closed';
            this.left = 0;
          } else {
            this.stage = 'hold';
            this.left = ZONE_PHASES[this.phase]!.hold;
            this.pickNext();
          }
        }
        this.emit();
      }
    }
    // The wall takes its toll once a second.
    this.tick += dt;
    if (this.tick < 1) return;
    this.tick -= 1;
    if (!game.match.running) return;
    for (const c of game.match.combatants) {
      if (!c.alive || c.state === 'plane') continue;
      const p = c.position;
      if (this.inside(p.x, p.z)) continue;
      game.hurt(c, this.damage, { by: null, cause: 'storm' });
      if (!game.match.running) return;
    }
  }

  frameUpdate(dt: number): void {
    if (this.stage === 'idle') return;
    const u = this.material.uniforms;
    const sky = this.game.world.sky;
    this.wall.position.set(this.x, 0, this.z);
    const r = Math.max(0.5, this.radius);
    this.wall.scale.set(r, 1, r);
    this.flashIn -= dt;
    if (this.flashIn <= 0) {
      this.flash = 1;
      this.flashIn = 2.5 + this.sparks.next() * 7;
    }
    this.flash = Math.max(0, this.flash - dt * 3.2);
    u['uTime']!.value = this.time;
    u['uRadius']!.value = r;
    u['uFlash']!.value = this.flash;
    u['uDay']!.value = 1 - sky.night * 0.75;
    u['uFar']!.value = this.game.engine.camera.far;
    // In the wall: the air thickens and darkens around the view.
    const cam = this.game.engine.camera.position;
    const out = this.inside(cam.x, cam.z) ? 0 : clamp01((Math.hypot(cam.x - this.x, cam.z - this.z) - this.radius) / 12 + 0.35);
    this.playerOutside = damp(this.playerOutside, out, 4, dt);
    sky.storm = this.playerOutside * 0.55;
  }

  dispose(): void {
    this.wall.removeFromParent();
    this.wall.geometry.dispose();
    this.material.dispose();
  }
}
