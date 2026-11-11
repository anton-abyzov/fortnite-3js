import type { Character } from '../character/character';
import type { Input } from '../core/input';
import type { Settings } from '../core/settings';
import type { CameraSubject, ThirdPersonCamera } from './camera';
import { damp } from '../core/math';

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
  readonly subject: CameraSubject;
  private sprintKick = 0;

  constructor(
    readonly character: Character,
    private input: Input,
    private camera: ThirdPersonCamera,
    private settings: Settings,
  ) {
    this.subject = { position: character.visual, height: 1.55, distance: 3.3, shoulder: 0.55, aim: 0, fovKick: 0 };
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
    const sub = this.subject;
    sub.height = damp(sub.height, m.swimming ? 1.25 : m.crouched ? 1.12 : 1.56, 10, dt);
    sub.distance = 3.3;
    sub.shoulder = 0.55 * this.shoulderSide * (1 - 0.25 * this.aim);
    sub.aim = this.aim;
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
    if (this.locked || !c.alive) {
      mi.moveX = 0;
      mi.moveZ = 0;
      mi.sprint = false;
      mi.jump = false;
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
    // Nobody runs backward or sideways as fast as forward.
    const pace = fwd < 0 ? 0.7 : right !== 0 && fwd === 0 ? 0.88 : 1;
    mi.moveX = mx * pace;
    mi.moveZ = mz * pace;
    // Sprinting needs forward intent; nobody sprints backward.
    mi.sprint = input.held('ShiftLeft') && fwd > 0 && this.aim < 0.5;
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
