import type { Character } from '../character/character';
import type { Input } from '../core/input';
import type { Settings } from '../core/settings';
import type { CameraSubject, ThirdPersonCamera } from './camera';
import type { Interactable, Interactions } from './interactions';
import { damp } from '../core/math';
import { bestArmor, bestHeal } from './combat';
import { WEAPON_IDS } from './items';

const _look = { x: 0, y: 0 };

/** Turns keyboard and mouse into the player's movement and view. */
export class PlayerController {
  /** Aim-down-sights amount, 0..1. */
  aim = 0;
  /** 1 right shoulder, -1 left. */
  shoulderSide = 1;
  crouchToggle = false;
  /** Set by weapons and vehicles to stop the player from moving on foot. */
  locked = false;
  /** What the interact key would use right now, if anything. */
  target: Interactable | null = null;
  /** When set, the camera frames this and not the character: the seaplane, the fall, the canopy. */
  subjectOverride: CameraSubject | null = null;
  /** When set, shown as the prompt for the action key: "Jump", "Open parachute". */
  promptOverride = '';
  private readonly foot: CameraSubject;
  private sprintKick = 0;

  constructor(
    readonly character: Character,
    private input: Input,
    private camera: ThirdPersonCamera,
    private settings: Settings,
    private interactions: Interactions,
  ) {
    this.foot = { position: character.visual, height: 1.55, distance: 3.3, shoulder: 0.55, aim: 0, fovKick: 0 };
  }

  /** What the camera should frame: the character on foot, or the vehicle they sit in. */
  get subject(): CameraSubject {
    if (this.subjectOverride) return this.subjectOverride;
    return this.character.vehicle ? this.character.vehicle.cameraSubject : this.foot;
  }

  /** The words for the interact prompt, or an empty string. */
  get prompt(): string {
    if (this.promptOverride) return this.promptOverride;
    if (this.character.vehicle) return 'Get out';
    if (this.character.state === 'seated') return 'Stand up';
    return this.target ? this.interactions.labelOf(this.target, this.character) : '';
  }

  /** Use whatever is on offer (the interact key, or a test). Returns true when something was used. */
  interact(): boolean {
    const c = this.character;
    if (!c.alive || this.locked) return false;
    if (c.vehicle) {
      c.vehicle.exit(c);
      return true;
    }
    if (c.state === 'seated') {
      c.rise();
      return true;
    }
    if (c.state !== 'normal') return false;
    const t = this.target ?? this.interactions.find(c, this.camera.forward);
    if (!t) return false;
    t.use(c);
    this.target = null;
    return true;
  }

  /** Per frame: mouse look. The view must turn at display rate, not at the physics rate. */
  frameUpdate(dt: number, wantAim: boolean): void {
    const input = this.input;
    input.consumeLook(_look);
    const s = this.settings.data;
    this.camera.look(_look.x, _look.y, s.sensitivity, s.invertY);
    if (input.pressedThisFrame('KeyV')) this.shoulderSide = -this.shoulderSide;
    this.aim = damp(this.aim, wantAim ? 1 : 0, 14, dt);

    const c = this.character;
    const m = c.motor;
    const sprinting = m.speed > 5.6 && m.grounded;
    this.sprintKick = damp(this.sprintKick, sprinting ? 7 : m.mode === 'slide' ? 10 : 0, 6, dt);
    const sub = this.foot;
    sub.height = damp(sub.height, m.swimming ? 1.25 : m.crouched ? 1.12 : 1.56, 10, dt);
    sub.distance = 3.3;
    sub.shoulder = 0.55 * this.shoulderSide * (1 - 0.25 * this.aim);
    // The view closes in only as far as the weapon is actually up: not mid-reload, not at a sprint.
    sub.aim = c.vehicle ? 0 : c.aiming;
    sub.zoom = c.loadout.weapon?.zoom;
    sub.fovKick = this.sprintKick;

    c.aimYaw = this.camera.yaw;
    c.aimPitch = this.camera.pitch;
    c.aimPoint.copy(this.camera.aimPoint);
  }

  /** Fixed step: movement keys into the motor's input, relative to the camera. */
  fixedUpdate(): void {
    const input = this.input;
    const c = this.character;
    const mi = c.input;
    const act = c.act;
    act.fire = false;
    act.aim = false;
    if (this.locked || !c.alive) {
      mi.moveX = 0;
      mi.moveZ = 0;
      mi.sprint = false;
      mi.jump = false;
      this.target = null;
      return;
    }
    const v = c.vehicle;
    if (v) {
      // Seated: the movement keys drive when this is the driver's seat.
      this.target = null;
      this.crouchToggle = false;
      if (v.driver === c) {
        const k = v.controls;
        k.throttle = input.axis('KeyS', 'KeyW') + input.axis('ArrowDown', 'ArrowUp');
        k.steer = input.axis('KeyA', 'KeyD') + input.axis('ArrowLeft', 'ArrowRight');
        k.handbrake = input.held('Space');
        k.brake = 0;
        k.boost = input.held('ShiftLeft');
      }
      // The wheel does nothing at the wheel, and a turn of it is not saved up for getting out.
      input.consumeWheel();
      if (input.pressed('KeyE') || input.pressed('KeyF')) v.exit(c);
      return;
    }
    if (c.state === 'seated') {
      // On a stool or a bench: any movement key stands up.
      this.target = null;
      if (input.pressed('KeyE') || input.pressed('KeyF') || input.pressed('Space') || input.axis('KeyS', 'KeyW') !== 0 || input.axis('KeyA', 'KeyD') !== 0) c.rise();
      return;
    }
    const fwd = input.axis('KeyS', 'KeyW') + input.axis('ArrowDown', 'ArrowUp');
    const right = input.axis('KeyA', 'KeyD') + input.axis('ArrowLeft', 'ArrowRight');
    const yaw = this.camera.yaw;
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    // Forward is (-sin, -cos); right is (cos, -sin).
    let mx = -sin * fwd + cos * right;
    let mz = -cos * fwd - sin * right;
    const len = Math.hypot(mx, mz);
    if (len > 1) {
      mx /= len;
      mz /= len;
    }
    if (c.state === 'plane' || c.state === 'freefall' || c.state === 'chute') {
      // In the drop: the same keys steer through the air, and the action keys jump out and open the canopy.
      this.target = null;
      this.crouchToggle = false;
      mi.moveX = mx;
      mi.moveZ = mz;
      mi.sprint = false;
      mi.walk = false;
      mi.crouch = false;
      if (input.pressed('Space') || input.pressed('KeyE') || input.pressed('KeyF')) mi.jump = true;
      return;
    }
    if (c.state !== 'normal') {
      this.target = null;
      return;
    }
    this.target = this.interactions.find(c, this.camera.forward);
    if (this.target && (input.pressed('KeyE') || input.pressed('KeyF'))) this.interact();
    // Nobody runs backward or sideways as fast as forward.
    const pace = fwd < 0 ? 0.7 : right !== 0 && fwd === 0 ? 0.88 : 1;
    mi.moveX = mx * pace;
    mi.moveZ = mz * pace;
    // Sprinting needs forward intent; nobody sprints backward.
    // Hands: fire, aim, reload, switch, heal, armor up, throw.
    act.fire = input.held('Mouse0');
    act.aim = input.held('Mouse2');
    if (input.pressed('KeyR')) act.reload = true;
    if (input.pressed('KeyG')) act.throw = true;
    if (input.pressed('KeyQ')) act.use = bestHeal(c);
    if (input.pressed('KeyX')) act.use = bestArmor(c);
    for (let i = 0; i < WEAPON_IDS.length; i++) if (input.pressed(`Digit${i + 1}`)) act.slot = WEAPON_IDS[i]!;
    const wheel = input.consumeWheel();
    if (wheel !== 0) act.cycle = wheel;
    // Nobody sprints while shooting, aiming or patching themselves up.
    mi.sprint = input.held('ShiftLeft') && fwd > 0 && this.aim < 0.5 && !act.fire && c.loadout.using === null;
    mi.walk = input.held('AltLeft');
    if (input.pressed('KeyC')) this.crouchToggle = !this.crouchToggle;
    if (input.pressed('Space') && this.crouchToggle) this.crouchToggle = false;
    if (mi.sprint && this.crouchToggle && c.motor.mode !== 'slide' && c.motor.speed < 5.4) this.crouchToggle = false;
    mi.crouch = this.crouchToggle || input.held('ControlLeft');
    if (c.motor.mode === 'slide' && !mi.crouch) this.crouchToggle = false;
    if (input.pressed('Space')) mi.jump = true;
    c.strafe = true;
  }
}
