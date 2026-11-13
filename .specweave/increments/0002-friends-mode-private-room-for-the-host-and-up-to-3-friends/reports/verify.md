# Verify — 0002-friends-mode-private-room-for-the-host-and-up-to-3-friends

FAIL · 2026-11-13T02:06:08.737Z · commands from explicit

## Commands

### `npm run build` → exit 0 (1s)

```

> eyewall-marazul-bay@0.1.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 117 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                      2.12 kB │ gzip:     0.72 kB
dist/assets/worker-CcbVXqcE.js      37.54 kB
dist/assets/shops-BAmVq9qa.css       4.21 kB │ gzip:     1.39 kB
dist/assets/index-CHNy7PPE.css      33.55 kB │ gzip:     7.29 kB
dist/assets/vehicle-CW-4IerV.js      5.31 kB │ gzip:     2.00 kB
dist/assets/boats-qLFdR6ga.js       32.82 kB │ gzip:    13.51 kB
dist/assets/cars-C1CDHn2b.js        45.33 kB │ gzip:    18.33 kB
dist/assets/shops-7KVAl7Ef.js       66.31 kB │ gzip:    24.93 kB
dist/assets/config-HOpE_oFZ.js     246.87 kB │ gzip:    65.96 kB
dist/assets/index-BBc8P77K.js      871.51 kB │ gzip:   262.14 kB
dist/assets/layout-Wautyo69.js   4,346.55 kB │ gzip: 1,674.80 kB

[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 4000 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 330ms
```

### `npm run lint` → exit 0 (0s)

```

> eyewall-marazul-bay@0.1.0 lint
> oxlint src tests tools
```

### `npx playwright test art audio boot bots car combat drop` → exit 0 (452s)

```

Running 21 tests using 1 worker

  ✓   1 tests/e2e/art.spec.ts:294:3 › key art, billboards and signs › the title screen shows the key art (4.8s)
  ✓   2 tests/e2e/art.spec.ts:407:3 › key art, billboards and signs › every picture in the manifest ships with the game and is credited (83ms)
  ✓   3 tests/e2e/art.spec.ts:427:3 › key art, billboards and signs › billboards stand on rooftops and poles and murals cover blank walls, each with its picture loaded (4.1s)
  ✓   4 tests/e2e/art.spec.ts:513:3 › key art, billboards and signs › walking up to a billboard or a mural and looking at it puts its picture on screen, and lamps light the billboard at night (11.2s)
  ✓   5 tests/e2e/audio.spec.ts:38:3 › audio, music and settings › nothing sounds before the first click; after it music plays, and steps, a box, a shot and a wound each start a voice (7.8s)
  ✓   6 tests/e2e/audio.spec.ts:135:3 › audio, music and settings › the settings card changes volume and picture quality at once, and both survive a reload (7.0s)
  ✓   7 tests/e2e/audio.spec.ts:239:3 › audio, music and settings › the ambience follows the place: the sea at the beach, the city inland, the seaplane aboard, the storm outside the eye (15.5s)
  ✓   8 tests/e2e/boot.spec.ts:4:1 › the game boots to the title, Play starts the match aboard the seaplane, and the scene renders on the GPU (10.2s)
  ✓   9 tests/e2e/bots.spec.ts:24:3 › bots › a round plays itself out to one survivor while the player does nothing (2.5m)
  ✓  10 tests/e2e/bots.spec.ts:85:3 › bots › armed bots find the player, shoot, and can be shot (7.0s)
  ✓  11 tests/e2e/car.spec.ts:62:3 › cars › parked cars are spread across the city, clear of the lanes and of each other (3.4s)
  ✓  12 tests/e2e/car.spec.ts:98:3 › cars › get in, pass 60 km/h, steer, brake, drift on the handbrake and get out (22.7s)
  ✓  13 tests/e2e/car.spec.ts:175:3 › cars › suspension works over a kerb, wheel by wheel, and settles (8.4s)
  ✓  14 tests/e2e/car.spec.ts:227:3 › cars › a crash damages the car (7.1s)
  ✓  15 tests/e2e/car.spec.ts:252:3 › cars › traffic keeps to its lanes, crosses junctions and stops for someone in the road (15.1s)
  ✓  16 tests/e2e/combat.spec.ts:63:3 › weapons, combat and loot › opens a container, takes the weapon and ammunition, and the display shows them (6.1s)
  ✓  17 tests/e2e/combat.spec.ts:127:3 › weapons, combat and loot › five weapon classes fire with recoil, spread, tracers and impacts, reload and switch (12.3s)
  ✓  18 tests/e2e/combat.spec.ts:227:3 › weapons, combat and loot › rivals are eliminated, headshots hurt more, and grenades and medicine work (16.4s)
  ✓  19 tests/e2e/drop.spec.ts:31:3 › seaplane drop › boards the seaplane, jumps, steers the fall, opens the parachute and lands alive (40.3s)
  ✓  20 tests/e2e/drop.spec.ts:93:3 › seaplane drop › the parachute opens by itself and nobody rides the seaplane home (1.0m)
  ✓  21 tests/e2e/drop.spec.ts:119:3 › seaplane drop › lands on a rooftop, on a street and in the water (35.5s)

  21 passed (7.5m)
```

### `npx playwright test friends locomotion match perf playthrough shops water world` → exit 0 (877s)

```
Running 24 tests using 1 worker

Teo in both lists after 3.0 s (from page load)
Ines in both lists after 3.0 s (from page load)
Rafa in both lists after 3.3 s (from page load)
transports at the host: webrtc, webrtc, webrtc
  ✓   1 tests/e2e/friends.spec.ts:108:3 › friends mode › room: create, invite link, join, full (17.8s)
gap while running, m: 0.40 0.40 0.39 0.40 0.40 0.40
gap after stopping: 0.00 m
guest hit host: 100 -> 70.3
host downed guest from 100
  ✓   2 tests/e2e/friends.spec.ts:158:3 › friends mode › move: friends see each other move, shoot, hit and the same winner (12.7s)
car moved 43.4 m; gap while driving 0.68 0.74 0.84 0.91 0.79; gap stopped 0.28 m
guest at the car is offered: Ride in Marlin GT
  ✓   3 tests/e2e/friends.spec.ts:238:3 › friends mode › car: the driver’s car moves on the other screen and its seat is taken (11.5s)
  ✓   4 tests/e2e/friends.spec.ts:323:3 › friends mode › rejoin: away, back with the same health, out after the grace, room closes with the host (45.6s)
  ✓   5 tests/e2e/locomotion.spec.ts:42:3 › locomotion › walks, jogs, sprints and crouch-walks with planted feet and matched strides (32.1s)
  ✓   6 tests/e2e/locomotion.spec.ts:85:3 › locomotion › legs follow the movement while the torso and head stay on the aim (13.0s)
  ✓   7 tests/e2e/locomotion.spec.ts:138:3 › locomotion › leans into turns and into acceleration (6.9s)
  ✓   8 tests/e2e/locomotion.spec.ts:174:3 › locomotion › jumps, lands with a dip, and keeps its feet on kerbs and a bridge ramp (11.2s)
  ✓   9 tests/e2e/locomotion.spec.ts:240:3 › locomotion › wades into the sea and swims (19.9s)
  ✓  10 tests/e2e/match.spec.ts:155:3 › match › after Play the display counts 24 alive, the compass turns with the view and the maps show the bay and the eye (8.1s)
  ✓  11 tests/e2e/match.spec.ts:261:3 › match › Escape stops the round behind a pause card; Resume carries on and Title leaves (6.9s)
  ✓  12 tests/e2e/match.spec.ts:319:3 › match › the eye closes in phases, the storm hurts outside it, and going down brings spectating, the loss screen and another round (4.5m)
  ✓  13 tests/e2e/match.spec.ts:584:3 › match › the last one standing gets the win screen; the keyboard starts another round or goes to the title (23.8s)
perf: 49.5 fps average over 60.2 s (2978 frames), median 16.7 ms, p95 16.8 ms, p99 66.8 ms, 36 frames over 50 ms, render scale 1.00 (lowest 0.61, mean 0.90); drop 28.5, on foot 60, driving 59.9 fps; 140 draw calls, 1105985 triangles in the last frame
  ✓  14 tests/e2e/perf.spec.ts:41:3 › performance › a full round at 1920x1080 on High averages 45 frames a second or more over a minute of play (1.4m)
  ✓  15 tests/e2e/playthrough.spec.ts:87:3 › playthrough › one sitting: drop in, loot, win a fight, drive, ride a jet ski, shop, lose to the storm and play again (1.4m)
  ✓  16 tests/e2e/shops.spec.ts:126:3 › shops › every shop has a furnished room, and the player walks in, buys at the counter and is refused without the cash (12.0s)
  ✓  17 tests/e2e/shops.spec.ts:251:3 › shops › in a cafe the player drinks from the fridge when hurt, sits on a stool and plays the jukebox (15.3s)
  ✓  18 tests/e2e/shops.spec.ts:308:3 › shops › in a surf shop the player changes outfit in a booth, then buys a cola from the machine outside (15.3s)
    marina launch: bob 0.45 m, roll -5.3..5.8 deg, pitch -2.1..1.3 deg, drift 0.02 m; jet ski roll -7.8..6.4 deg
    canal launch: bob 0.048 m, roll -1.9..1.8 deg, drift 0.00 m
  ✓  19 tests/e2e/water.spec.ts:217:3 › boats and jet skis › moored craft bob and roll at their berths, less in the canal than out on the marina (22.4s)
    canal: top 17.2 m/s, bow up 7.2 deg over the hump then 2.5 deg, rides 0.30 m higher, roll 1.2 deg on average and 5.9 at most
    corner into the creek: roll -12.8..1.2 deg
    creek with the boost: top 20.4 m/s
    ocean: pitch -4.1..7.3 deg, heave 1.36 m (canal 0.10 m), roll under 22.4 deg, speed 16.7..17.8 m/s
  ✓  20 tests/e2e/water.spec.ts:288:3 › boats and jet skis › takes a skiff from the canal steps down the canal, up the creek and out onto the ocean swell (1.5m)
    jet ski: 0 to 15 m/s in 3.00 s
    jet ski: top 22.7 m/s with the boost
    jet ski turn: roll down to -36.7 deg, slowest 15.8 m/s
  ✓  21 tests/e2e/water.spec.ts:433:3 › boats and jet skis › swims to a jet ski, rides it out on the bay leaning into a hard turn, and steps off onto the pier (56.6s)
  ✓  22 tests/e2e/world.spec.ts:8:3 › Marazul Bay › has an ocean beach, canals with bridges, a causeway, a marina, palms and deco blocks (7.9s)
  ✓  23 tests/e2e/world.spec.ts:80:3 › Marazul Bay › water is animated, and the ocean is rougher than the canals (4.7s)
  ✓  24 tests/e2e/world.spec.ts:108:3 › Marazul Bay › time of day drives the sun, shadows, neon and lit windows (5.6s)

  Slow test file: tests/e2e/match.spec.ts (5.1m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  24 passed (14.6m)
```

## Acceptance criteria

5/6 met

| AC | Met | Acceptance | Text |
|---|---|---|---|
| AC-01 | x (tasks) | met | The title screen offers Friends. Creating a room shows a 4-letter code, a copyable invite link and the player list; a second browser that opens the link (or types the code) appears in both lists within 10 seconds, and a fifth player is refused with a message. |
| AC-02 | x (tasks) | met | After the host starts the round, each browser shows every other player as a moving, animated character; a remote player's position on another screen is within 1.5 m of where they are after they stop moving, and within 4 m while running. |
| AC-03 | x (tasks) | met | A shot by one player that hits another lowers the target's health by the same amount on every screen, shows a tracer on the other screen, and a kill shows in every kill feed; when one player is left, every browser shows the same winner. |
| AC-04 | x (tasks) | met | A player drives a car; the others see the car and its driver move to within 3 m of the driver's own position, and a second player cannot take the occupied driver's seat. |
| AC-05 | x (tasks) | met | A guest who closes the page and reopens the invite link within 30 seconds is back in the same round with the health they left with; the others saw them as away meanwhile. A guest who leaves for good is counted out of the round; when the host leaves, guests see that the room closed. |
| AC-06 |   | open | Single player is unchanged: the existing browser suite still passes and the High preset frame-rate gate still holds. |

## Tasks (ledger)

| Task | State | By | Evidence | Note |
|---|---|---|---|---|
| T-01 | done | claude@minisforum | flock /tmp/eyewall-gpu.lock npx playwright test friends -g … |  |
| T-02 | done | claude@minisforum | flock /tmp/eyewall-gpu.lock npx playwright test friends -g … |  |
| T-03 | done | claude@minisforum | 66a6dd2: npm test 45 passed (19.6m), perf 56.9 fps on High;… |  |
| T-04 | done | claude@minisforum | flock /tmp/eyewall-gpu.lock npx playwright test friends -g … |  |
| T-05 | done | claude@minisforum | flock /tmp/eyewall-gpu.lock npx playwright test friends -g … |  |
| T-06 | done | claude@minisforum | flock /tmp/eyewall-gpu.lock npx playwright test friends -g … |  |
| T-07 | done | claude@minisforum | flock /tmp/eyewall-gpu.lock npx playwright test friends -g … |  |
| T-08 | done | claude@minisforum | 66a6dd2: npm test 45 passed, perf 56.9 fps on High; docs/fr… |  |
| T-09 | open |  |  |  |

8/9 done · 0 skipped · 0 claimed · 0 blocked · 0 stale · 1 open
