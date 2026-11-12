import { expect, type Page, test } from '@playwright/test';
import { expectNoErrors, openGame, state, watchConsole } from './helpers';

type Rec = Record<string, any>;

/** What the audio is doing: the engine's own numbers, read through the debug entry point. */
const audio = (page: Page): Promise<Rec> => page.evaluate(() => window.__eyewall!.ext['audio']());
const player = (page: Page): Promise<Rec> => page.evaluate(() => window.__eyewall!.player()!);
const weapon = (page: Page): Promise<Rec> => page.evaluate(() => window.__eyewall!.weapon()!);
/** How many voices of a sound have really been started (not merely asked for). */
const started = async (page: Page, name: string): Promise<number> => ((await audio(page))['started'][name] as number | undefined) ?? 0;
/** How loud a loop is right now, as the audio thread has it. */
const loop = async (page: Page, name: string): Promise<number> => ((await audio(page))['loopLevels'][name] as number | undefined) ?? 0;

/** What the renderer is set to, straight from three.js and the canvas. */
const picture = (page: Page): Promise<Rec> =>
  page.evaluate(() => {
    const g = window.__eyewall!.game;
    const r = g.engine.renderer;
    return {
      quality: g.settings.data.quality,
      // The engine may draw at a fraction of the preset on a busy machine; this takes that back out.
      ratio: r.getPixelRatio() / g.engine.renderScale,
      shadows: r.shadowMap.enabled,
      bloom: g.engine.post.bloom.enabled,
      far: g.engine.camera.far,
      width: g.canvas.width,
      expected: Math.floor(window.innerWidth * r.getPixelRatio()),
    };
  });

/** The sound bank is synthesised in the background after the first click; one-shots need it. */
async function bankReady(page: Page): Promise<void> {
  await expect.poll(async () => (await audio(page))['ready'], { timeout: 150_000, intervals: [250] }).toBe(true);
}

test.describe('audio, music and settings', () => {
  test('nothing sounds before the first click; after it music plays, and steps, a box, a shot and a wound each start a voice', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);

    // Before any click there is no running AudioContext, and sounds asked for are dropped without a murmur.
    const before = await audio(page);
    expect(before['state'], 'no audio before a gesture').not.toBe('running');
    expect(before['unlocked']).toBe(false);
    await page.evaluate(() => {
      const g = window.__eyewall!.game;
      g.sound('ui_click');
      g.sound('shot_pistol', { x: 40, y: 150, z: 430 });
      g.sound('win');
    });
    await page.waitForTimeout(600);
    const still = await audio(page);
    expect(still['state']).not.toBe('running');
    expect(still['voices']).toBe(0);
    expect(Object.keys(still['started'])).toEqual([]);
    expectNoErrors(watch);

    // The first click (choosing where to start) is the gesture the browser waits for.
    await page.locator('.chip', { hasText: 'Deco Row' }).click();
    await expect.poll(async () => (await audio(page))['state'], { timeout: 30_000 }).toBe('running');
    // The title has its music, and it reaches the output.
    await expect.poll(async () => (await audio(page))['music'], { timeout: 30_000 }).toBe('menu');
    await expect.poll(async () => (await audio(page))['rms'], { timeout: 60_000, intervals: [100] }).toBeGreaterThan(0.001);

    // Into a round on foot: the music gives way to the quieter bed.
    await page.locator('#play').click();
    await expect.poll(async () => (await state(page))['phase']).toBe('match');
    await expect.poll(async () => (await audio(page))['music'], { timeout: 30_000 }).toBe('match');
    await bankReady(page);

    // Walk up to a container that has open, level ground to its south, and open it.
    const box = await page.evaluate(() => {
      const api = window.__eyewall!;
      const all = api.loot().containers.filter((c) => !c['roof']);
      all.sort((a, b) => Math.hypot(a['x'] + 60, a['z'] - 13) - Math.hypot(b['x'] + 60, b['z'] - 13));
      const level = (c: Record<string, any>): boolean => [1, 2, 3, 4, 5, 6].every((k) => Math.abs(api.probe(c['x'], c['z'] + k).ground - c['y']) < 0.2);
      const c = all.find(level)!;
      api.startAt(c['x'], c['z'] + 5, 0);
      api.setFreeLook(true);
      return c;
    });
    const opened = await started(page, 'chest_open');
    const stepsBefore = await page.evaluate(() => Object.entries(window.__eyewall!.ext['audio']().started as Record<string, number>).reduce((n, [k, v]) => (k.startsWith('step_') ? n + v : n), 0));
    let prompt = '';
    for (let i = 0; i < 50 && !/^Open (cooler|duffel bag)$/.test(prompt); i++) {
      await page.keyboard.down('KeyW');
      await page.waitForTimeout(120);
      await page.keyboard.up('KeyW');
      await page.waitForTimeout(100);
      prompt = (await player(page))['prompt'] ?? '';
    }
    expect(prompt).toMatch(/^Open (cooler|duffel bag)$/);
    // Every step on the way was heard.
    const steps = await page.evaluate(() => Object.entries(window.__eyewall!.ext['audio']().started as Record<string, number>).reduce((n, [k, v]) => (k.startsWith('step_') ? n + v : n), 0));
    expect(steps, 'footsteps while walking').toBeGreaterThan(stepsBefore);
    await page.keyboard.press('KeyE');
    await expect.poll(async () => (await page.evaluate((id) => window.__eyewall!.loot().containers.find((c) => c['id'] === id)!['opened'], box['id'])) as boolean, { timeout: 20_000 }).toBe(true);
    await expect.poll(() => started(page, 'chest_open'), { timeout: 20_000 }).toBe(opened + 1);

    // A shot from a sidearm.
    await page.evaluate(() => {
      const api = window.__eyewall!;
      api.give('pistol', 1);
      api.give('ammo_light', 60);
    });
    await page.keyboard.press('Digit1');
    await expect.poll(async () => (await weapon(page))['id'], { timeout: 20_000 }).toBe('pistol');
    await expect.poll(async () => (await weapon(page))['drawing'], { timeout: 20_000 }).toBe(false);
    const shots = (await weapon(page))['shots'] as number;
    const shotVoices = await started(page, 'shot_pistol');
    await page.mouse.move(640, 300);
    await page.mouse.down();
    await page.waitForTimeout(60);
    await page.mouse.up();
    await expect.poll(async () => (await weapon(page))['shots'], { timeout: 20_000 }).toBe(shots + 1);
    await expect.poll(() => started(page, 'shot_pistol'), { timeout: 20_000 }).toBe(shotVoices + 1);
    // The report is sounding now, not just counted.
    await expect.poll(async () => (await audio(page))['voices'], { timeout: 5_000, intervals: [20] }).toBeGreaterThan(0);

    // A wound.
    const wounds = await started(page, 'damage');
    await page.evaluate(() => {
      const g = window.__eyewall!.game;
      g.hurt(g.player!, 20, { by: null, cause: 'fall' });
    });
    expect((await player(page))['health']).toBe(80);
    await expect.poll(() => started(page, 'damage'), { timeout: 20_000 }).toBe(wounds + 1);

    // Nothing the game asked for was a name the engine does not know.
    expect((await audio(page))['unknown']).toEqual([]);
    expectNoErrors(watch);
  });

  test('the settings card changes volume and picture quality at once, and both survive a reload', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    expect((await picture(page))['quality'], 'a fresh visit starts on the default preset').toBe('high');

    // Open the card from the title. The click is also the first gesture, so audio starts.
    await page.locator('.title .settings-button').click();
    await expect(page.locator('.settings')).toBeVisible();
    await expect.poll(async () => (await audio(page))['state'], { timeout: 30_000 }).toBe('running');
    const master = page.locator('#settings-master');
    await expect(master).toHaveValue('80');
    await expect.poll(async () => (await audio(page))['levels']['master'], { timeout: 20_000 }).toBeCloseTo(0.8 * 0.8, 2);

    // Drag the master slider down by clicking a third of the way along it: the master gain follows.
    const track = (await master.boundingBox())!;
    await page.mouse.click(track.x + track.width * 0.3, track.y + track.height / 2);
    const value = Number(await master.inputValue());
    expect(value, 'the slider moved to where it was clicked').toBeGreaterThan(15);
    expect(value).toBeLessThan(45);
    await expect.poll(async () => (await audio(page))['levels']['master'], { timeout: 20_000 }).toBeCloseTo((value / 100) ** 2, 2);
    await expect(page.locator('output[for="settings-master"]')).toHaveText(String(value));

    // Effects off and music full, from the keyboard.
    await page.locator('#settings-effects').focus();
    await page.keyboard.press('Home');
    await expect(page.locator('output[for="settings-effects"]')).toHaveText('Off');
    await expect.poll(async () => (await audio(page))['levels']['sfx'], { timeout: 20_000 }).toBeCloseTo(0, 3);
    await page.locator('#settings-music').focus();
    await page.keyboard.press('End');
    await expect.poll(async () => (await audio(page))['levels']['music'], { timeout: 20_000 }).toBeCloseTo(1, 2);

    // The mouse.
    await page.locator('#settings-sensitivity').focus();
    await page.keyboard.press('End');
    await expect(page.locator('output[for="settings-sensitivity"]')).toHaveText('3.00x');
    await page.locator('.settings-switch').click();
    await expect(page.locator('#settings-invert')).toBeChecked();

    // Picture quality: the renderer itself changes, there and then.
    const high = await picture(page);
    expect(high['shadows']).toBe(true);
    expect(high['bloom']).toBe(true);
    expect(high['ratio']).toBeCloseTo(1, 3);
    await page.locator('.settings-preset[data-quality="low"]').click();
    await expect(page.locator('.settings-preset[data-quality="low"]')).toHaveAttribute('aria-pressed', 'true');
    const low = await picture(page);
    expect(low['quality']).toBe('low');
    expect(low['ratio'], 'three quarters of the resolution').toBeCloseTo(0.75, 3);
    expect(low['shadows'], 'no shadow pass').toBe(false);
    expect(low['bloom'], 'no bloom pass').toBe(false);
    expect(low['far']).toBeLessThan(high['far']);
    expect(low['width'], 'the canvas itself has fewer pixels').toBe(low['expected']);
    expect(low['width']).toBeLessThan(high['width']);
    await page.locator('.settings-preset[data-quality="ultra"]').click();
    const ultra = await picture(page);
    expect(ultra['shadows']).toBe(true);
    expect(ultra['bloom']).toBe(true);
    expect(ultra['far']).toBeGreaterThan(high['far']);
    expect(ultra['width']).toBeGreaterThan(low['width']);
    await page.locator('.settings-preset[data-quality="low"]').click();
    await page.screenshot({ path: 'evidence/t12-settings.png' });

    // Done puts the card away; Escape does too.
    await page.locator('.settings-done').click();
    await expect(page.locator('.settings')).toBeHidden();
    await page.locator('.title .settings-button').click();
    await expect(page.locator('.settings')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.settings')).toBeHidden();
    expect((await state(page))['phase'], 'still on the title').toBe('menu');

    // A reload: the game comes up as it was left.
    await openGame(page);
    const again = await picture(page);
    expect(again['quality']).toBe('low');
    expect(again['ratio']).toBeCloseTo(0.75, 3);
    expect(again['shadows']).toBe(false);
    expect(again['bloom']).toBe(false);
    const saved = await page.evaluate(() => ({ ...window.__eyewall!.game.settings.data }));
    expect(saved['masterVolume']).toBeCloseTo(value / 100, 5);
    expect(saved['sfxVolume']).toBe(0);
    expect(saved['musicVolume']).toBe(1);
    expect(saved['sensitivity']).toBe(3);
    expect(saved['invertY']).toBe(true);
    await page.locator('.title .settings-button').click();
    await expect(master).toHaveValue(String(value));
    await expect(page.locator('#settings-invert')).toBeChecked();
    await expect(page.locator('.settings-preset[data-quality="low"]')).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(async () => (await audio(page))['state'], { timeout: 30_000 }).toBe('running');
    await expect.poll(async () => (await audio(page))['levels']['master'], { timeout: 20_000 }).toBeCloseTo((value / 100) ** 2, 2);
    await expect.poll(async () => (await audio(page))['levels']['sfx'], { timeout: 20_000 }).toBeCloseTo(0, 3);

    // Reset: everything back to how the game came, on the page and in the engine.
    await page.locator('.settings-reset').click();
    await expect(master).toHaveValue('80');
    await expect(page.locator('#settings-invert')).not.toBeChecked();
    await expect.poll(async () => (await audio(page))['levels']['master'], { timeout: 20_000 }).toBeCloseTo(0.8 * 0.8, 2);
    const back = await picture(page);
    expect(back['quality']).toBe('high');
    expect(back['shadows']).toBe(true);
    expect(back['ratio']).toBeCloseTo(1, 3);
    expectNoErrors(watch);
  });

  test('the ambience follows the place: the sea at the beach, the city inland, the seaplane aboard, the storm outside the eye', async ({ page }) => {
    const watch = watchConsole(page);
    await openGame(page);
    // Start on the beach, the way a player would.
    await page.locator('.chip', { hasText: 'Ocean Parade' }).click();
    await page.locator('#play').click();
    await expect.poll(async () => (await state(page))['phase']).toBe('match');
    await bankReady(page);

    // On the sand the sea is loud.
    await expect.poll(() => loop(page, 'ocean'), { timeout: 30_000 }).toBeGreaterThan(0.25);
    const beach = { ocean: await loop(page, 'ocean'), city: await loop(page, 'city') };
    expect(await loop(page, 'storm'), 'no storm on a calm day').toBeLessThan(0.01);
    expect(await loop(page, 'rain')).toBeLessThan(0.01);

    // A few streets inland it has all but gone, and the city has taken its place.
    await page.evaluate(() => window.__eyewall!.startAt(-60, 13, 0));
    await expect.poll(() => loop(page, 'ocean'), { timeout: 30_000 }).toBeLessThan(beach.ocean * 0.4);
    await expect.poll(() => loop(page, 'city'), { timeout: 30_000 }).toBeGreaterThan(beach.city * 1.5);
    const street = { wind: await loop(page, 'wind') };

    // A round: aboard the seaplane its engine is heard, and up there the wind is stronger.
    await page.evaluate(() => window.__eyewall!.startMatch());
    await expect.poll(async () => (await player(page))['state']).toBe('plane');
    await expect.poll(() => loop(page, 'plane_engine'), { timeout: 30_000 }).toBeGreaterThan(0.15);
    await expect.poll(() => loop(page, 'wind'), { timeout: 30_000 }).toBeGreaterThan(street.wind * 1.5);
    await expect.poll(() => loop(page, 'city'), { timeout: 30_000 }).toBeLessThan(0.02);

    // Out over the sea, beyond the wall of the storm: the storm and its rain close in.
    const zone = await page.evaluate(() => window.__eyewall!.zone());
    expect(Math.hypot(700 - zone['x'], 700 - zone['z']), 'the corner of the bay is outside the eye').toBeGreaterThan(zone['radius']);
    await page.evaluate(() => window.__eyewall!.skydive(700, 260, 700));
    await expect.poll(() => loop(page, 'storm'), { timeout: 30_000 }).toBeGreaterThan(0.4);
    await expect.poll(() => loop(page, 'rain'), { timeout: 30_000 }).toBeGreaterThan(0.25);
    expect(await loop(page, 'wind'), 'falling through the storm').toBeGreaterThan(street.wind * 2);
    // The music turns with the weather.
    await expect.poll(async () => (await audio(page))['music'], { timeout: 30_000 }).toBe('storm');
    expectNoErrors(watch);
  });
});
