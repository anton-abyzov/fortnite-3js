import { clamp } from '../core/math';
import type { SurfaceMaterial, WeaponId } from '../types/game';

export class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private muted = false;

  unlock(): void {
    if (this.ctx || typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    try {
      this.ctx = new AudioCtx();
      const length = this.ctx.sampleRate * 1.0;
      this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 55;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 260;

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.0;

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    } catch {
      this.ctx = null;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted && this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  playFootstep(surface: SurfaceMaterial): void {
    if (!this.ctx || !this.noiseBuffer || this.muted) return;
    const now = this.ctx.currentTime;

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = surface === 'water' || surface === 'sand' ? 'bandpass' : 'lowpass';
    filter.frequency.value =
      surface === 'tile'
        ? 1450
        : surface === 'asphalt'
          ? 920
          : surface === 'wood'
            ? 380
            : surface === 'sand'
              ? 1850
              : 680;

    const gain = this.ctx.createGain();
    const dur = surface === 'sand' || surface === 'water' ? 0.095 : 0.055;
    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(now);
    src.stop(now + dur);
  }

  playWeaponFire(weaponId: WeaponId, attenuation = 1.0): void {
    if (!this.ctx || !this.noiseBuffer || this.muted || attenuation <= 0.02) return;
    const now = this.ctx.currentTime;
    const vol = clamp(0.18 * attenuation, 0.01, 0.22);

    // Punchy sub-transient
    const osc = this.ctx.createOscillator();
    osc.type = weaponId === 'marksman' ? 'triangle' : 'sawtooth';
    const startFreq =
      weaponId === 'shotgun' ? 125 : weaponId === 'marksman' ? 240 : weaponId === 'smg' ? 210 : 175;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.09);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(vol, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);

    // Filtered propellant crack
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = weaponId === 'shotgun' ? 680 : weaponId === 'marksman' ? 1950 : 1280;
    const nGain = this.ctx.createGain();
    const nDur = weaponId === 'shotgun' ? 0.18 : 0.085;
    nGain.gain.setValueAtTime(vol * 0.9, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + nDur);
    noise.connect(bp);
    bp.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + nDur);
  }

  playCanopyDeploy(): void {
    if (!this.ctx || !this.noiseBuffer || this.muted) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1600, now);
    lp.frequency.exponentialRampToValueAtTime(280, now + 0.42);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    src.connect(lp);
    lp.connect(g);
    g.connect(this.ctx.destination);
    src.start(now);
    src.stop(now + 0.46);
  }

  playPickupChime(high = false): void {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(high ? 660 : 520, now);
    osc.frequency.setValueAtTime(high ? 880 : 690, now + 0.065);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.09, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  updateVehicleEngine(active: boolean, speedKmh: number, isWatercraft: boolean): void {
    if (!this.ctx || !this.engineOsc || !this.engineGain || this.muted) return;
    const now = this.ctx.currentTime;
    if (!active) {
      this.engineGain.gain.setTargetAtTime(0, now, 0.08);
      return;
    }
    const baseHz = isWatercraft ? 72 : 52;
    const targetHz = baseHz + clamp(speedKmh, 0, 130) * (isWatercraft ? 1.55 : 1.25);
    this.engineOsc.frequency.setTargetAtTime(targetHz, now, 0.06);
    this.engineGain.gain.setTargetAtTime(0.055, now, 0.08);
  }
}
