import { expect, test } from '@playwright/test';
import type { WorldProbe } from '../../src/core/debug';
import { canvasLuma, canvasVariety, expectNoErrors, openGame, state, view, watchConsole } from './helpers';

const probe = (page: import('@playwright/test').Page, x: number, z: number): Promise<WorldProbe> => page.evaluate(([px, pz]) => window.__eyewall!.probe(px!, pz!), [x, z]);

test.describe('Marazul Bay', () => {
  test('has an ocean beach, canals with bridges, a causeway, a marina, palms and deco blocks', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    const census = await page.evaluate(() => window.__eyewall!.census());
    expect(census.buildings).toBeGreaterThanOrEqual(200);
    expect(census.palms).toBeGreaterThanOrEqual(500);
    expect(census.bridges).toBeGreaterThanOrEqual(8);
    expect(census.piers).toBeGreaterThanOrEqual(3);
    expect(census.shops).toBeGreaterThanOrEqual(12);
    expect(census.pois).toBeGreaterThanOrEqual(8);

    // Open ocean east of the beach: deep water with a bed the physics can hit.
    const ocean = await probe(page, 600, 150);
    expect(ocean.water).toBe(true);
    expect(ocean.ground).toBeLessThan(-2);

    // The beach shelves from the promenade down into the sea, walking east.
    const profile: WorldProbe[] = [];
    for (let x = 340; x <= 470; x += 5) profile.push(await probe(page, x, 150));
    const sand = profile.filter((p) => p.type === 'sand');
    expect(sand.length).toBeGreaterThanOrEqual(8);
    expect(sand[0]!.height).toBeGreaterThan(sand[sand.length - 1]!.height + 1);
    // The collider follows the visible sand. Beach furniture may sit on a sample point, so allow a few misses.
    const onSand = sand.filter((p) => Math.abs(p.ground - p.height) < 0.2).length;
    expect(onSand / sand.length).toBeGreaterThan(0.75);
    for (const p of sand) expect(p.ground, 'nothing on the beach is below the sand').toBeGreaterThan(p.height - 0.2);
    expect(profile[profile.length - 1]!.water).toBe(true);

    // Canal water, with a street bridge arching over it above street level.
    const canal = await probe(page, 60, -155);
    expect(canal.water).toBe(true);
    const bridge = await probe(page, -5, -155);
    expect(bridge.type).toBe('bridge');
    expect(bridge.ground).toBeGreaterThan(3.5);
    // The causeway to Isla Garza rises high enough for boats to pass under.
    const causeway = await probe(page, -395, 0);
    expect(causeway.type).toBe('bridge');
    expect(causeway.ground).toBeGreaterThan(7);
    expect((await probe(page, -395, 40)).water).toBe(true);
    expect((await probe(page, -540, 0)).water).toBe(false);

    // Marina pontoons sit just above the water; streets have kerbs; roofs are solid.
    const marina = await probe(page, -350, -60);
    expect(marina.type).toBe('pier');
    expect(marina.ground).toBeGreaterThan(0.5);
    expect(marina.ground).toBeLessThan(2);
    const street = await probe(page, -60, 6);
    const sidewalk = await probe(page, -60, 12);
    expect(street.type).toBe('road');
    expect(street.ground).toBeCloseTo(2.0, 1);
    expect(sidewalk.ground - street.ground).toBeCloseTo(0.16, 1);
    const roof = await probe(page, -60, 40);
    expect(roof.type).toBe('building');
    expect(roof.ground).toBeGreaterThan(6);

    for (const [name, pos, target] of [
      ['aerial', [520, 330, 620], [0, 0, 0]],
      ['beach', [420, 10, -80], [330, 8, -200]],
      ['canal', [-100, 9, -156], [60, 3, -154]],
      ['street', [-60, 3.8, 6], [40, 6, -4]],
      ['causeway', [-330, 14, 40], [-470, 6, -10]],
    ] as const) {
      await view(page, [...pos], [...target], 15.5);
      expect(await canvasVariety(page), `${name} view is not blank`).toBeGreaterThan(0.2);
      await page.screenshot({ path: `evidence/world-${name}.png` });
    }
    const s = await state(page);
    expect(s.fps).toBeGreaterThan(30);
    expect(s.drawCalls).toBeLessThan(1500);
    expectNoErrors(watch);
  });

  test('water is animated, and the ocean is rougher than the canals', async ({ page }) => {
    await openGame(page);
    const ranges = await page.evaluate(() => {
      const w = window.__eyewall!.game.world.water;
      const span = (x: number, z: number): number => {
        let lo = Infinity;
        let hi = -Infinity;
        for (let t = 0; t < 12; t += 0.1) {
          const h = w.height(x, z, t);
          lo = Math.min(lo, h);
          hi = Math.max(hi, h);
        }
        return hi - lo;
      };
      return { ocean: span(600, 150), canal: span(60, -155) };
    });
    expect(ranges.ocean).toBeGreaterThan(0.35);
    expect(ranges.canal).toBeLessThan(ranges.ocean * 0.5);
    expect(ranges.canal).toBeGreaterThan(0.005);

    // The drawn surface moves too: two frames of open sea a second apart differ.
    await view(page, [560, 6, 150], [640, 0, 200], 15.5);
    const a = await page.locator('#game').screenshot();
    await page.waitForTimeout(900);
    const b = await page.locator('#game').screenshot();
    expect(a.equals(b)).toBe(false);
  });

  test('time of day drives the sun, shadows, neon and lit windows', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    const read = (): Promise<{ night: number; sun: number; shadow: boolean; neon: number; elevation: number }> =>
      page.evaluate(() => {
        const g = window.__eyewall!.game;
        const sky = g.world.sky;
        return {
          night: sky.night,
          sun: sky.sun.intensity,
          shadow: g.engine.renderer.shadowMap.enabled && sky.sun.castShadow && sky.sun.shadow.map !== null,
          neon: g.world.materials.neon.color.r,
          elevation: sky.uniforms.uSunDir.value.y,
        };
      });

    await view(page, [-100, 14, -156], [60, 3, -150], 13);
    const noon = await read();
    const noonLuma = await canvasLuma(page);
    expect(noon.night).toBeLessThan(0.01);
    expect(noon.sun).toBeGreaterThan(2);
    expect(noon.elevation).toBeGreaterThan(0.8);
    expect(noon.shadow).toBe(true);
    await page.screenshot({ path: 'evidence/world-noon.png' });

    await view(page, [-100, 14, -156], [60, 3, -150], 19.1);
    const dusk = await read();
    expect(dusk.elevation).toBeLessThan(0.2);
    expect(dusk.night).toBeGreaterThan(0.05);
    expect(dusk.night).toBeLessThan(0.95);
    await page.screenshot({ path: 'evidence/world-dusk.png' });

    await view(page, [-100, 14, -156], [60, 3, -150], 22);
    const night = await read();
    const nightLuma = await canvasLuma(page);
    expect(night.night).toBeGreaterThan(0.99);
    expect(night.neon).toBeGreaterThan(noon.neon * 1.5);
    expect(nightLuma).toBeLessThan(noonLuma * 0.6);
    // Lit windows, neon and lamps keep the night scene from going black.
    expect(nightLuma).toBeGreaterThan(8);
    await page.screenshot({ path: 'evidence/world-night.png' });
    expectNoErrors(watch);
  });
});
