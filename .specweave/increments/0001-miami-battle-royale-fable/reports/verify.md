# Verify — 0001-miami-battle-royale-fable

PASS · 2026-11-12T04:56:58.264Z · commands from package.json scripts

## Commands

### `npm run test` → exit 0 (1075s)

```
  ✓   4 tests/e2e/art.spec.ts:513:3 › key art, billboards and signs › walking up to a billboard or a mural and looking at it puts its picture on screen, and lamps light the billboard at night (12.9s)
  ✓   5 tests/e2e/audio.spec.ts:38:3 › audio, music and settings › nothing sounds before the first click; after it music plays, and steps, a box, a shot and a wound each start a voice (8.5s)
  ✓   6 tests/e2e/audio.spec.ts:135:3 › audio, music and settings › the settings card changes volume and picture quality at once, and both survive a reload (7.9s)
  ✓   7 tests/e2e/audio.spec.ts:239:3 › audio, music and settings › the ambience follows the place: the sea at the beach, the city inland, the seaplane aboard, the storm outside the eye (12.2s)
  ✓   8 tests/e2e/boot.spec.ts:4:1 › the game boots to the title, Play starts the match aboard the seaplane, and the scene renders on the GPU (8.1s)
  ✓   9 tests/e2e/bots.spec.ts:24:3 › bots › a round plays itself out to one survivor while the player does nothing (2.5m)
  ✓  10 tests/e2e/bots.spec.ts:85:3 › bots › armed bots find the player, shoot, and can be shot (5.3s)
  ✓  11 tests/e2e/car.spec.ts:62:3 › cars › parked cars are spread across the city, clear of the lanes and of each other (3.8s)
  ✓  12 tests/e2e/car.spec.ts:98:3 › cars › get in, pass 60 km/h, steer, brake, drift on the handbrake and get out (19.0s)
  ✓  13 tests/e2e/car.spec.ts:175:3 › cars › suspension works over a kerb, wheel by wheel, and settles (7.4s)
  ✓  14 tests/e2e/car.spec.ts:227:3 › cars › a crash damages the car (7.5s)
  ✓  15 tests/e2e/car.spec.ts:252:3 › cars › traffic keeps to its lanes, crosses junctions and stops for someone in the road (15.5s)
  ✓  16 tests/e2e/combat.spec.ts:63:3 › weapons, combat and loot › opens a container, takes the weapon and ammunition, and the display shows them (6.4s)
  ✓  17 tests/e2e/combat.spec.ts:127:3 › weapons, combat and loot › five weapon classes fire with recoil, spread, tracers and impacts, reload and switch (12.7s)
  ✓  18 tests/e2e/combat.spec.ts:227:3 › weapons, combat and loot › rivals are eliminated, headshots hurt more, and grenades and medicine work (17.1s)
  ✓  19 tests/e2e/drop.spec.ts:31:3 › seaplane drop › boards the seaplane, jumps, steers the fall, opens the parachute and lands alive (39.5s)
  ✓  20 tests/e2e/drop.spec.ts:93:3 › seaplane drop › the parachute opens by itself and nobody rides the seaplane home (1.0m)
  ✓  21 tests/e2e/drop.spec.ts:119:3 › seaplane drop › lands on a rooftop, on a street and in the water (35.3s)
  ✓  22 tests/e2e/locomotion.spec.ts:42:3 › locomotion › walks, jogs, sprints and crouch-walks with planted feet and matched strides (26.2s)
  ✓  23 tests/e2e/locomotion.spec.ts:85:3 › locomotion › legs follow the movement while the torso and head stay on the aim (10.6s)
  ✓  24 tests/e2e/locomotion.spec.ts:138:3 › locomotion › leans into turns and into acceleration (7.3s)
  ✓  25 tests/e2e/locomotion.spec.ts:174:3 › locomotion › jumps, lands with a dip, and keeps its feet on kerbs and a bridge ramp (12.1s)
  ✓  26 tests/e2e/locomotion.spec.ts:240:3 › locomotion › wades into the sea and swims (17.9s)
  ✓  27 tests/e2e/match.spec.ts:155:3 › match › after Play the display counts 24 alive, the compass turns with the view and the maps show the bay and the eye (6.1s)
  ✓  28 tests/e2e/match.spec.ts:261:3 › match › Escape stops the round behind a pause card; Resume carries on and Title leaves (7.5s)
  ✓  29 tests/e2e/match.spec.ts:319:3 › match › the eye closes in phases, the storm hurts outside it, and going down brings spectating, the loss screen and another round (2.5m)
  ✓  30 tests/e2e/match.spec.ts:584:3 › match › the last one standing gets the win screen; the keyboard starts another round or goes to the title (16.3s)
perf: 55.9 fps average over 60.2 s (3365 frames), median 16.7 ms, p95 33.3 ms, p99 33.4 ms, 3 frames over 50 ms, render scale 1.00 (lowest 0.70, mean 0.86); drop 52.3, on foot 57.2, driving 58.1 fps; 140 draw calls, 1105983 triangles in the last frame
  ✓  31 tests/e2e/perf.spec.ts:41:3 › performance › a full round at 1920x1080 on High averages 45 frames a second or more over a minute of play (1.2m)
  ✓  32 tests/e2e/playthrough.spec.ts:87:3 › playthrough › one sitting: drop in, loot, win a fight, drive, ride a jet ski, shop, lose to the storm and play again (1.3m)
  ✓  33 tests/e2e/shops.spec.ts:126:3 › shops › every shop has a furnished room, and the player walks in, buys at the counter and is refused without the cash (12.4s)
  ✓  34 tests/e2e/shops.spec.ts:251:3 › shops › in a cafe the player drinks from the fridge when hurt, sits on a stool and plays the jukebox (15.9s)
  ✓  35 tests/e2e/shops.spec.ts:308:3 › shops › in a surf shop the player changes outfit in a booth, then buys a cola from the machine outside (15.3s)
    marina launch: bob 0.45 m, roll -5.3..5.8 deg, pitch -2.1..1.3 deg, drift 0.02 m; jet ski roll -7.8..6.3 deg
    canal launch: bob 0.046 m, roll -1.9..1.8 deg, drift 0.00 m
  ✓  36 tests/e2e/water.spec.ts:217:3 › boats and jet skis › moored craft bob and roll at their berths, less in the canal than out on the marina (22.3s)
    canal: top 17.2 m/s, bow up 7.1 deg over the hump then 2.5 deg, rides 0.30 m higher, roll 1.2 deg on average and 5.0 at most
    corner into the creek: roll -13.1..4.5 deg
    creek with the boost: top 20.3 m/s
    ocean: pitch -4.7..8.9 deg, heave 1.28 m (canal 0.11 m), roll under 22.4 deg, speed 16.9..17.8 m/s
  ✓  37 tests/e2e/water.spec.ts:288:3 › boats and jet skis › takes a skiff from the canal steps down the canal, up the creek and out onto the ocean swell (1.5m)
    jet ski: 0 to 15 m/s in 2.97 s
    jet ski: top 23.0 m/s with the boost
    jet ski turn: roll down to -36.5 deg, slowest 15.8 m/s
  ✓  38 tests/e2e/water.spec.ts:433:3 › boats and jet skis › swims to a jet ski, rides it out on the bay leaning into a hard turn, and steps off onto the pier (55.3s)
  ✓  39 tests/e2e/world.spec.ts:8:3 › Marazul Bay › has an ocean beach, canals with bridges, a causeway, a marina, palms and deco blocks (8.8s)
  ✓  40 tests/e2e/world.spec.ts:80:3 › Marazul Bay › water is animated, and the ocean is rougher than the canals (5.4s)
  ✓  41 tests/e2e/world.spec.ts:108:3 › Marazul Bay › time of day drives the sun, shadows, neon and lit windows (6.3s)

  41 passed (17.9m)
```

### `npm run lint` → exit 0 (0s)

```

> eyewall-marazul-bay@0.1.0 lint
> oxlint src tests tools
```

### `npm run build` → exit 0 (1s)

```

> eyewall-marazul-bay@0.1.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 110 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                      2.12 kB │ gzip:     0.72 kB
dist/assets/worker-CcbVXqcE.js      37.54 kB
dist/assets/shops-BAmVq9qa.css       4.21 kB │ gzip:     1.39 kB
dist/assets/index-CL6v6ZMy.css      30.23 kB │ gzip:     6.69 kB
dist/assets/vehicle-CoVWtvSF.js      4.55 kB │ gzip:     1.70 kB
dist/assets/boats-CIJZsjiw.js       32.82 kB │ gzip:    13.51 kB
dist/assets/cars-NqDthZbP.js        45.31 kB │ gzip:    18.32 kB
dist/assets/shops-CRnDTxFP.js       66.31 kB │ gzip:    24.93 kB
dist/assets/config-HOpE_oFZ.js     246.87 kB │ gzip:    65.96 kB
dist/assets/index-DB4EZUeP.js      842.07 kB │ gzip:   252.19 kB
dist/assets/layout-Wautyo69.js   4,346.55 kB │ gzip: 1,674.80 kB

[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 4000 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 387ms
```

## Acceptance criteria

15/15 met

| AC | Met | Acceptance | Text |
|---|---|---|---|
| AC-01 | x (tasks) | met | `npm install && npm run dev` serves the game; the menu renders, a match starts with no console errors, and `npm run build` produces a static `dist/`. |
| AC-02 | x (tasks) | met | Every shipped third-party asset is CC0 or otherwise licensed for redistribution and is listed with source and license in `CREDITS.md`; a check script fails on unlisted files. |
| AC-03 | x (tasks) | met | The match starts aboard a seaplane crossing the map; the player jumps, steers in freefall, deploys a parachute (manual or auto), and lands alive on land, rooftop or water. |
| AC-04 | x (tasks) | met | The world shows an ocean with a beach, canals crossed by bridges, a causeway to an island, a marina, palms and art-deco buildings, with animated water, sun, shadows and time-of-day lighting. |
| AC-05 | x (tasks) | met | The player walks, jogs, sprints, crouches, jumps, lands and swims with blended animation. Feet stay planted on slopes and steps (foot IK within 6 cm of ground), stride matches ground speed (foot slide under 15% of travel), the body leans into turns, the head tracks the aim point, and the torso twists to aim while legs follow movement. |
| AC-06 | x (tasks) | met | The player enters a parked car, accelerates past 60 km/h, steers, brakes, drifts on handbrake and exits. Suspension reacts to curbs. Traffic cars follow lanes, cross intersections, and brake for obstacles. |
| AC-07 | x (tasks) | met | Boats and jet skis float on the waves with visible bob and roll, accelerate, turn and plane; the player boards and leaves them from docks or water, and swims when in deep water. |
| AC-08 | x (tasks) | met | The player walks through a shop door into a furnished interior, buys items with cash at a counter, and uses at least four other interactables (fridge heal, seat, jukebox, changing booth, vending machine). |
| AC-09 | x (tasks) | met | The player picks up weapons and ammo from loot containers, fires five weapon classes with recoil, spread, tracers and impact effects, reloads, switches slots, and eliminates bots; headshots deal extra damage. |
| AC-10 | x (tasks) | met | Bots drop from the plane, land, loot, move through the city, fight the player and each other, heal, and move into the safe zone. A full match resolves to one survivor without the player acting. |
| AC-11 | x (tasks) | met | The eye shrinks in phases; standing outside it deals damage; HUD shows health, armor, ammo, slots, minimap with the eye, compass, alive count, kill feed and timers; win and loss screens appear and restart works. |
| AC-12 | x (tasks) | met | Audio plays after the first click: weapon, footstep, engine, water, wind and UI sounds plus menu music, with volume settings. Quality presets change render cost, and settings persist. |
| AC-13 | x (tasks) | met | The title screen and at least six in-world billboards or murals use original AI-generated art made through Higgsfield (or Kie.ai if Higgsfield is unavailable), recorded in `CREDITS.md`. |
| AC-14 | x (tasks) | met | `docs/multiplayer-evaluation.md` answers whether multiplayer is worth building, with architecture, netcode options, hosting cost and a recommendation. |
| AC-15 | x (tasks) | met | On this machine's GPU at 1920x1080, the match holds an average of 45 fps or more on the High preset during a 60-second scripted playthrough, and the full e2e suite passes headless. |

## Tasks (ledger)

| Task | State | By | Evidence | Note |
|---|---|---|---|---|
| T-01 | done | claude@minisforum | npx playwright test tests/e2e/boot.spec.ts → exit 0 log: .s… |  |
| T-02 | done | claude@minisforum | node tools/check-credits.mjs → exit 0 log: .specweave/incre… |  |
| T-03 | done | claude@minisforum | npx playwright test tests/e2e/world.spec.ts → exit 0 log: .… |  |
| T-04 | done | claude@minisforum | npx playwright test tests/e2e/locomotion.spec.ts → exit 0 l… |  |
| T-05 | done | claude@minisforum | npx playwright test tests/e2e/drop.spec.ts → exit 0 log: .s… |  |
| T-06 | done | claude@minisforum | npx playwright test tests/e2e/combat.spec.ts → exit 0 log: … |  |
| T-07 | done | claude@minisforum | npx playwright test tests/e2e/car.spec.ts → exit 0 log: .sp… |  |
| T-08 | done | claude@minisforum | npx playwright test tests/e2e/water.spec.ts → exit 0 log: .… |  |
| T-09 | done | claude@minisforum | npx playwright test tests/e2e/shops.spec.ts → exit 0 log: .… |  |
| T-10 | done | claude@minisforum | npx playwright test tests/e2e/bots.spec.ts → exit 0 log: .s… |  |
| T-11 | done | claude@minisforum | npx playwright test tests/e2e/match.spec.ts → exit 0 log: .… |  |
| T-12 | done | claude@minisforum | npx playwright test tests/e2e/audio.spec.ts → exit 0 log: .… |  |
| T-13 | done | claude@minisforum | npx playwright test tests/e2e/art.spec.ts → exit 0 log: .sp… |  |
| T-14 | done | claude@minisforum | node tools/check-docs.mjs → exit 0 log: .specweave/incremen… |  |
| T-15 | done | claude@minisforum | npm test → exit 0 log: .specweave/increments/0001-miami-bat… |  |
| T-16 | done | claude@minisforum | npm run build && npm run lint && npm test → exit 0 log: .sp… |  |

16/16 done · 0 skipped · 0 claimed · 0 blocked · 0 stale · 0 open
