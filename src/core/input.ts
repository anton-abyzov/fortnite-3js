/**
 * Keyboard and mouse state.
 *
 * Gameplay reads input inside the fixed 60 Hz step, but browser events arrive per frame, and a frame can
 * contain zero or several fixed steps. Edge events ("pressed this tick") are therefore latched until one
 * fixed step has consumed them, and separately until the end of the frame for per-frame readers like the UI.
 */
export class Input {
  private down = new Set<string>();
  private pressedFixed = new Set<string>();
  private pressedFrame = new Set<string>();
  private releasedFixed = new Set<string>();
  private lookX = 0;
  private lookY = 0;
  private wheel = 0;
  locked = false;
  private free = false;
  private lastX = Number.NaN;
  private lastY = Number.NaN;
  /** Gameplay input is ignored while a menu or text field owns the keyboard. */
  enabled = true;
  private element: HTMLElement;
  private wantLock = false;
  /**
   * A pointer-lock request made from a click was refused, so the page is somewhere that does not allow
   * it (an embedded preview, a locked-down browser). The view then follows the pointer instead, and
   * keeps turning while the pointer rests near the left or right edge.
   */
  lockDenied = false;
  private everLocked = false;
  private gestureRequest = false;
  private edgeAt = 0;

  constructor(element: HTMLElement) {
    this.element = element;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    element.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    element.addEventListener('wheel', this.onWheel, { passive: true });
    element.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('pointerlockchange', this.onLockChange);
    document.addEventListener('pointerlockerror', () => this.onLockRefused());
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (this.enabled && GAME_KEYS.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    this.press(e.code);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.release(e.code);
  };

  private onBlur = (): void => {
    for (const code of this.down) this.releasedFixed.add(code);
    this.down.clear();
  };

  private onMouseDown = (e: MouseEvent): void => {
    this.press(`Mouse${e.button}`);
    if (this.wantLock && !this.locked) this.requestLock();
  };

  private onMouseUp = (e: MouseEvent): void => {
    this.release(`Mouse${e.button}`);
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (this.locked) {
      this.lookX += e.movementX;
      this.lookY += e.movementY;
    } else if (this.free && document.pointerLockElement !== this.element) {
      // No pointer lock: the pointer moves over the page, so turn by how far it travelled.
      if (!Number.isNaN(this.lastX)) {
        this.lookX += e.clientX - this.lastX;
        this.lookY += e.clientY - this.lastY;
      }
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    }
  };

  /**
   * Turn the view with plain mouse movement instead of pointer lock. For embedded pages and for automated
   * browsers, where a locked pointer cannot be driven.
   */
  get freeLook(): boolean {
    return this.free;
  }

  set freeLook(on: boolean) {
    this.free = on;
    this.lastX = Number.NaN;
    if (on && document.pointerLockElement === this.element) {
      this.locked = false;
      document.exitPointerLock();
    }
  }

  private onWheel = (e: WheelEvent): void => {
    this.wheel += Math.sign(e.deltaY);
  };

  private onLockRefused(): void {
    this.locked = false;
    // Browsers also refuse a lock asked for without a click, or too soon after Escape. Neither means
    // the lock is unavailable, so only a refused click on a page that never had the lock counts.
    if (!this.gestureRequest || this.everLocked || this.free) return;
    this.lockDenied = true;
    this.freeLook = true;
  }

  private onLockChange = (): void => {
    this.locked = document.pointerLockElement === this.element;
    if (this.locked) this.everLocked = true;
    this.lastX = Number.NaN;
    // A lock that was asked for before free look was switched on can still arrive: give it straight back.
    if (this.locked && this.free) {
      this.locked = false;
      document.exitPointerLock();
    }
  };

  press(code: string): void {
    if (!this.down.has(code)) {
      this.pressedFixed.add(code);
      this.pressedFrame.add(code);
    }
    this.down.add(code);
  }

  release(code: string): void {
    if (this.down.delete(code)) this.releasedFixed.add(code);
  }

  /** Ask for pointer lock now and again on the next click if the browser refuses (it needs a user gesture). */
  setWantLock(want: boolean): void {
    this.wantLock = want;
    if (want) this.requestLock();
    else if (document.pointerLockElement === this.element) document.exitPointerLock();
  }

  private requestLock(): void {
    if (this.free) return;
    this.gestureRequest = navigator.userActivation?.isActive ?? true;
    try {
      const result = this.element.requestPointerLock() as unknown;
      if (result instanceof Promise) result.catch(() => undefined);
    } catch {
      this.onLockRefused();
    }
  }

  held(code: string): boolean {
    return this.enabled && this.down.has(code);
  }

  /** True once per press, for code that runs in the fixed step. */
  pressed(code: string): boolean {
    return this.enabled && this.pressedFixed.has(code);
  }

  released(code: string): boolean {
    return this.enabled && this.releasedFixed.has(code);
  }

  /** True once per press, for code that runs once per rendered frame. */
  pressedThisFrame(code: string): boolean {
    return this.pressedFrame.has(code);
  }

  axis(negative: string, positive: string): number {
    return (this.held(positive) ? 1 : 0) - (this.held(negative) ? 1 : 0);
  }

  /** Mouse movement since the last call, in pixels. */
  consumeLook(out: { x: number; y: number }): void {
    if (this.lockDenied && this.free && !Number.isNaN(this.lastX)) {
      // The pointer cannot leave the page, so resting it near a side edge keeps the view turning.
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - this.edgeAt) / 1000));
      this.edgeAt = now;
      const w = window.innerWidth;
      const margin = Math.max(48, w * 0.14);
      let push = 0;
      if (this.lastX < margin) push = this.lastX / margin - 1;
      else if (this.lastX > w - margin) push = 1 - (w - this.lastX) / margin;
      this.lookX += push * 1100 * dt;
    }
    out.x = this.enabled ? this.lookX : 0;
    out.y = this.enabled ? this.lookY : 0;
    this.lookX = 0;
    this.lookY = 0;
  }

  consumeWheel(): number {
    const w = this.wheel;
    this.wheel = 0;
    return this.enabled ? w : 0;
  }

  endFixedStep(): void {
    this.pressedFixed.clear();
    this.releasedFixed.clear();
  }

  endFrame(): void {
    this.pressedFrame.clear();
  }

  releaseAll(): void {
    this.onBlur();
  }
}

const GAME_KEYS = new Set([
  'Space',
  'Tab',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyE',
  'KeyF',
  'KeyQ',
  'KeyR',
  'KeyC',
  'KeyG',
  'KeyM',
  'KeyH',
  'KeyX',
  'KeyV',
  'ControlLeft',
  'ShiftLeft',
  'AltLeft',
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'Digit5',
  'Slash',
  'Quote',
]);
