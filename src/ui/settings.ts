import './settings.css';
import { LIMITS, QUALITY, QUALITY_NAMES, type QualityName, type QualityPreset, type SettingsData } from '../core/settings';
import type { Game } from '../game';
import { button, el } from './dom';

type SliderKey = 'masterVolume' | 'sfxVolume' | 'musicVolume' | 'sensitivity';

interface SliderDef {
  key: SliderKey;
  id: string;
  label: string;
  /** Slider units per unit of the setting: volumes are kept 0..1 and shown 0..100. */
  scale: number;
  step: number;
  show(value: number): string;
}

const percent = (v: number): string => (v <= 0 ? 'Off' : String(Math.round(v * 100)));

const SOUND: readonly SliderDef[] = [
  { key: 'masterVolume', id: 'settings-master', label: 'Master', scale: 100, step: 1, show: percent },
  { key: 'sfxVolume', id: 'settings-effects', label: 'Effects', scale: 100, step: 1, show: percent },
  { key: 'musicVolume', id: 'settings-music', label: 'Music', scale: 100, step: 1, show: percent },
];

const MOUSE: readonly SliderDef[] = [{ key: 'sensitivity', id: 'settings-sensitivity', label: 'Sensitivity', scale: 100, step: 5, show: (v) => `${v.toFixed(2)}x` }];

/** What a preset does, in the words of someone choosing one. */
function describe(q: QualityPreset): string {
  const sharp = q.pixelRatio < 1 ? `${Math.round(q.pixelRatio * 100)}% resolution` : q.pixelRatio > 1 ? `Up to ${q.pixelRatio}x resolution` : 'Full resolution';
  const parts = [sharp, q.shadows ? `${q.shadowMapSize} px shadows` : 'no shadows', q.bloom ? 'glow' : 'no glow', q.msaa > 0 ? `${q.msaa}x smoothing` : 'light smoothing', `${(q.drawDistance / 1000).toFixed(1)} km view`];
  return `${parts.join(', ')}.`;
}

interface Slider {
  def: SliderDef;
  input: HTMLInputElement;
  value: HTMLOutputElement;
}

/**
 * The settings card: sound levels, picture quality and the mouse. Every control writes straight to
 * `game.settings`, which applies the change at once and keeps it for the next visit, so there is nothing
 * to confirm. It reads the same settings back, so it is right whoever changed them (the game lowers the
 * quality by itself on a struggling machine).
 */
export class SettingsPanel {
  private readonly screen: HTMLElement;
  private readonly card: HTMLElement;
  private readonly sliders: Slider[] = [];
  private readonly presets = new Map<QualityName, HTMLButtonElement>();
  private readonly presetNote: HTMLElement;
  private readonly invert: HTMLInputElement;
  private readonly done: HTMLButtonElement;
  private shown = false;
  /** What had the keyboard before the card opened, to give it back. */
  private opener: HTMLElement | null = null;
  private inputWas = true;
  private hadLock = false;

  constructor(
    private readonly game: Game,
    private readonly root: HTMLElement,
  ) {
    this.screen = el('section', 'settings');
    this.screen.setAttribute('role', 'dialog');
    this.screen.setAttribute('aria-modal', 'true');
    this.screen.setAttribute('aria-labelledby', 'settings-title');
    this.card = el('div', 'settings-card');
    this.card.tabIndex = -1;

    const head = el('header', 'settings-head');
    const title = el('h2', 'settings-title', 'Settings');
    title.id = 'settings-title';
    head.append(title, el('p', 'settings-sub', 'Changes apply at once and are kept on this device.'));

    const sound = this.group('Sound');
    for (const def of SOUND) sound.append(this.slider(def));

    const picture = this.group('Picture');
    const row = el('div', 'settings-row');
    row.append(el('span', 'settings-label', 'Quality'));
    const presets = el('div', 'settings-presets');
    presets.setAttribute('role', 'group');
    presets.setAttribute('aria-label', 'Picture quality');
    for (const name of QUALITY_NAMES) {
      const b = button('settings-preset', QUALITY[name].label, () => this.game.settings.set('quality', name));
      b.dataset['quality'] = name;
      this.presets.set(name, b);
      presets.append(b);
    }
    row.append(presets);
    this.presetNote = el('p', 'settings-note');
    this.presetNote.setAttribute('role', 'status');
    picture.append(row, this.presetNote);

    const mouse = this.group('Mouse');
    for (const def of MOUSE) mouse.append(this.slider(def));
    const invertRow = el('label', 'settings-row settings-switch');
    invertRow.append(el('span', 'settings-label', 'Invert up and down'));
    this.invert = el('input', 'settings-check');
    this.invert.type = 'checkbox';
    this.invert.id = 'settings-invert';
    this.invert.addEventListener('change', () => this.game.settings.set('invertY', this.invert.checked));
    invertRow.append(this.invert, el('span', 'settings-toggle'));
    mouse.append(invertRow);

    const foot = el('footer', 'settings-foot');
    const reset = button('settings-reset', 'Reset', () => this.game.settings.reset());
    reset.title = 'Put every setting back to how the game came';
    this.done = button('settings-done', 'Done', () => this.close());
    foot.append(reset, this.done);

    const body = el('div', 'settings-body');
    body.append(sound, picture, mouse);
    this.card.append(head, body, foot);
    this.screen.append(this.card);
    // A click on the dimmed page around the card puts it away.
    this.screen.addEventListener('mousedown', (e) => {
      if (e.target === this.screen) this.close();
    });
    root.append(this.screen);

    game.settings.onChange(() => this.refresh());
    window.addEventListener('keydown', this.onKey, true);
    this.refresh();
  }

  get open(): boolean {
    return this.shown;
  }

  show(): void {
    if (this.shown) return;
    const input = this.game.input;
    this.shown = true;
    this.opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // The class goes on first: it tells the rest of the page that giving up the pointer is not a pause.
    this.root.classList.add('settings-open');
    this.screen.classList.add('show');
    this.inputWas = input.enabled;
    input.enabled = false;
    this.hadLock = input.locked;
    if (this.hadLock) input.setWantLock(false);
    this.refresh();
    this.card.focus({ preventScroll: true });
  }

  close(): void {
    if (!this.shown) return;
    const input = this.game.input;
    this.shown = false;
    this.screen.classList.remove('show');
    this.root.classList.remove('settings-open');
    input.enabled = this.inputWas;
    if (this.inputWas) {
      // Keys pressed while the card was up are not orders for the game.
      input.endFixedStep();
      input.endFrame();
    }
    if (this.hadLock && this.game.phase === 'match') input.setWantLock(true);
    this.opener?.focus({ preventScroll: true });
    this.opener = null;
  }

  /** What the card shows, for tests. */
  describe(): Record<string, unknown> {
    return { open: this.shown, ...this.game.settings.data };
  }

  private group(name: string): HTMLElement {
    const group = el('section', 'settings-group');
    group.append(el('h3', 'settings-legend', name));
    return group;
  }

  private slider(def: SliderDef): HTMLElement {
    const [lo, hi] = LIMITS[def.key];
    const row = el('label', 'settings-row');
    row.htmlFor = def.id;
    const input = el('input', 'settings-range');
    input.type = 'range';
    input.id = def.id;
    input.min = String(lo * def.scale);
    input.max = String(hi * def.scale);
    input.step = String(def.step);
    const value = el('output', 'settings-value');
    value.htmlFor.add(def.id);
    input.addEventListener('input', () => this.game.settings.set(def.key, Number(input.value) / def.scale));
    row.append(el('span', 'settings-label', def.label), input, value);
    this.sliders.push({ def, input, value });
    return row;
  }

  /** Bring every control into line with the settings. */
  private refresh(): void {
    const data: SettingsData = this.game.settings.data;
    for (const s of this.sliders) {
      const v = data[s.def.key];
      const [lo, hi] = LIMITS[s.def.key];
      const units = String(Math.round(v * s.def.scale));
      // Left alone while it is where it should be, so a drag in progress is never fought.
      if (s.input.value !== units) s.input.value = units;
      s.input.style.setProperty('--fill', `${((v - lo) / (hi - lo)) * 100}%`);
      s.value.textContent = s.def.show(v);
    }
    for (const [name, b] of this.presets) {
      const on = name === data.quality;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    }
    this.presetNote.textContent = describe(QUALITY[data.quality]);
    this.invert.checked = data.invertY;
  }

  private readonly onKey = (e: KeyboardEvent): void => {
    if (!this.shown) return;
    if (e.code === 'Escape') {
      // Prevented, so nothing else takes the same key for a pause.
      e.preventDefault();
      e.stopPropagation();
      this.close();
    } else if (e.code === 'Tab') {
      // The keyboard stays in the card while it is up.
      const stops = [...this.card.querySelectorAll<HTMLElement>('input, button')];
      const first = stops[0];
      const last = stops[stops.length - 1];
      const at = document.activeElement;
      if (!first || !last) return;
      if (e.shiftKey && (at === first || at === this.card)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && at === last) {
        e.preventDefault();
        first.focus();
      } else if (!this.card.contains(at)) {
        e.preventDefault();
        first.focus();
      }
    }
  };
}

let panel: SettingsPanel | null = null;

/** Build the settings card under the page's overlay root. Call once, when the game is ready. */
export function installSettings(game: Game, root: HTMLElement): SettingsPanel {
  panel ??= new SettingsPanel(game, root);
  const made = panel;
  game.debugExt['settings'] = () => made.describe();
  return made;
}

/** Bring the settings card up, from the title or from a pause. Does nothing before `installSettings`. */
export function openSettings(): void {
  panel?.show();
}

export function closeSettings(): void {
  panel?.close();
}

/** A "Settings" button that opens the card, for whoever has a place for one. */
export function settingsButton(): HTMLButtonElement {
  return button('settings-button', 'Settings', () => openSettings());
}
