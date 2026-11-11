import { describe, expect, it } from 'vitest';
import {
  clamp,
  damp,
  dampAngleRad,
  lerp,
  saturate,
  smoothstep,
  stepSpringDamper,
  wrapAngleRad,
} from '../../src/core/math';
import { SeededRng } from '../../src/core/rng';

describe('core math & deterministic RNG', () => {
  it('clamps, saturates, and interpolates accurately', () => {
    expect(clamp(12, 0, 5)).toBe(5);
    expect(clamp(-4, 0, 5)).toBe(0);
    expect(saturate(0.4)).toBeCloseTo(0.4, 5);
    expect(lerp(10, 20, 0.25)).toBeCloseTo(12.5, 5);
    expect(smoothstep(0, 10, 5)).toBeCloseTo(0.5, 5);
  });

  it('wraps and damps angles across the -PI/PI boundary without spinning the long way', () => {
    expect(wrapAngleRad(Math.PI * 2.5)).toBeCloseTo(Math.PI * 0.5, 5);
    const next = dampAngleRad(Math.PI - 0.05, -Math.PI + 0.05, 10, 0.1);
    expect(Math.abs(next)).toBeGreaterThan(Math.PI - 0.15);
    expect(damp(0, 10, 8, 0.25)).toBeGreaterThan(8);
  });

  it('converges spring-damper toward target cleanly', () => {
    let spring = { value: 0, velocity: 0 };
    for (let i = 0; i < 120; i++) {
      spring = stepSpringDamper(spring, 1, 140, 18, 1 / 60);
    }
    expect(spring.value).toBeCloseTo(1, 2);
    expect(Math.abs(spring.velocity)).toBeLessThan(0.05);
  });

  it('produces reproducible sequences from SeededRng', () => {
    const a = new SeededRng(42);
    const b = new SeededRng(42);
    const seqA = [a.next(), a.range(-5, 5), a.int(1, 10)];
    const seqB = [b.next(), b.range(-5, 5), b.int(1, 10)];
    expect(seqA).toEqual(seqB);
  });
});
