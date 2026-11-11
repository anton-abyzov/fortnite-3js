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
    document.addEventListener('pointerlockerror', () => {
      this.locked = false;
    });
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

  private onLockChange = (): void => {
    this.locked = document.pointerLockElement === this.element;
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
    try {
      const result = this.element.requestPointerLock() as unknown;
      if (result instanceof Promise) result.catch(() => undefined);
    } catch {
      // Pointer lock is unavailable (headless or embedded); freeLook covers that case.
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
