# Original Miami-inspired battle royale browser game (Fable build)

## Problem

The repository is empty. The user wants a battle-royale browser game anyone can open and play with no install: parachute into a Miami-inspired coastal city, run with believable human movement, drive cars, ride boats and jet skis on canals and ocean, walk into shops, and fight AI bots with guns. Two builds compete on separate branches (`build/fable`, `build/gemini`) so the user can compare approaches. This increment is the Fable 5.2 build.

The game must be original. It shares genre mechanics only (drop, loot, shrinking zone, last one standing). It has its own name, characters, art, UI, sounds and map, and uses no names, logos, characters, sounds, map layout or signature look from any existing game.

## Scope

In:

- **EYEWALL: Marazul Bay**, a single-player battle royale against bots, playable in a desktop browser from a static bundle.
- Drop: seaplane flyover, freefall, parachute, landing.
- An original city, Marazul Bay: ocean beach, canals with bridges, marina, causeway and island, port, palm boulevards, art-deco blocks.
- Physics everywhere: character controller, raycast-suspension cars, buoyant boats and jet skis, thrown and knocked props.
- Human locomotion built from CC0 motion clips plus procedural layers: stride matching, orientation warping, foot IK, pelvis adjustment, lean, head look, aim offsets, hand IK, landing compression, swim, skydive and canopy poses.
- Cars you can drive, and traffic that follows lanes and yields at intersections.
- Enterable shops with doors, counters, purchases, and things to use (fridges, seats, jukebox, changing booth).
- Guns, loot, health and armor, bots that drop, loot, fight, heal and follow the zone.
- Match loop: shrinking hurricane eye, HUD, minimap, kill feed, win and loss screens, restart.
- Procedural audio and music, quality settings, credits.
- AI-generated original art (title key art, billboards, signs) through Higgsfield, with Kie.ai as the second path.
- A written multiplayer evaluation with a recommendation.

Out:

- Multiplayer networking (evaluation only).
- Building or harvesting mechanics, cosmetics store, accounts, progression.
- Mobile touch controls (desktop keyboard and mouse first; gamepad if time allows).
- Deployment to a public host. The bundle is static and host-ready; publishing is the user's call after comparing builds.

## Acceptance Criteria

- [ ] AC-01: `npm install && npm run dev` serves the game; the menu renders, a match starts with no console errors, and `npm run build` produces a static `dist/`.
- [ ] AC-02: Every shipped third-party asset is CC0 or otherwise licensed for redistribution and is listed with source and license in `CREDITS.md`; a check script fails on unlisted files.
- [ ] AC-03: The match starts aboard a seaplane crossing the map; the player jumps, steers in freefall, deploys a parachute (manual or auto), and lands alive on land, rooftop or water.
- [ ] AC-04: The world shows an ocean with a beach, canals crossed by bridges, a causeway to an island, a marina, palms and art-deco buildings, with animated water, sun, shadows and time-of-day lighting.
- [ ] AC-05: The player walks, jogs, sprints, crouches, jumps, lands and swims with blended animation. Feet stay planted on slopes and steps (foot IK within 6 cm of ground), stride matches ground speed (foot slide under 15% of travel), the body leans into turns, the head tracks the aim point, and the torso twists to aim while legs follow movement.
- [ ] AC-06: The player enters a parked car, accelerates past 60 km/h, steers, brakes, drifts on handbrake and exits. Suspension reacts to curbs. Traffic cars follow lanes, cross intersections, and brake for obstacles.
- [ ] AC-07: Boats and jet skis float on the waves with visible bob and roll, accelerate, turn and plane; the player boards and leaves them from docks or water, and swims when in deep water.
- [ ] AC-08: The player walks through a shop door into a furnished interior, buys items with cash at a counter, and uses at least four other interactables (fridge heal, seat, jukebox, changing booth, vending machine).
- [ ] AC-09: The player picks up weapons and ammo from loot containers, fires five weapon classes with recoil, spread, tracers and impact effects, reloads, switches slots, and eliminates bots; headshots deal extra damage.
- [ ] AC-10: Bots drop from the plane, land, loot, move through the city, fight the player and each other, heal, and move into the safe zone. A full match resolves to one survivor without the player acting.
- [ ] AC-11: The eye shrinks in phases; standing outside it deals damage; HUD shows health, armor, ammo, slots, minimap with the eye, compass, alive count, kill feed and timers; win and loss screens appear and restart works.
- [ ] AC-12: Audio plays after the first click: weapon, footstep, engine, water, wind and UI sounds plus menu music, with volume settings. Quality presets change render cost, and settings persist.
- [ ] AC-13: The title screen and at least six in-world billboards or murals use original AI-generated art made through Higgsfield (or Kie.ai if Higgsfield is unavailable), recorded in `CREDITS.md`.
- [ ] AC-14: `docs/multiplayer-evaluation.md` answers whether multiplayer is worth building, with architecture, netcode options, hosting cost and a recommendation.
- [ ] AC-15: On this machine's GPU at 1920x1080, the match holds an average of 45 fps or more on the High preset during a 60-second scripted playthrough, and the full e2e suite passes headless.

## Approach

Research summary (November 11, 2026) and the choices it led to. Sources are listed in `docs/research.md`.

**Stack**

- three.js r187 with `WebGLRenderer` (WebGL2). `WebGPURenderer` is still slower on many-mesh scenes (reports of about 2x CPU cost at r183) and breaks utilities that hook WebGL internals. WebGL2 runs everywhere today. Rejected: Babylon.js (heavier, Havok tie-in), PlayCanvas (editor workflow), WebGPU-first (risk without gain here).
- Rapier 0.21 (`@dimforge/rapier3d-compat`, WASM). It is the best-supported engine for three.js and ships both a kinematic character controller and a raycast vehicle controller. Rejected: Jolt (fewer three.js examples), Havok (Babylon-centric), cannon-es (slow, unmaintained).
- Vite 8 and TypeScript 7, no UI framework. HUD is DOM and CSS over the canvas.
- Playwright 1.65 for headless e2e against the real game with the machine's GPU. A debug API on `window.__eyewall` exposes state for assertions and scripted setups; inputs go through real keyboard and mouse events.

**Rendering**

- Physically based materials, ACES tone mapping, sRGB output.
- Procedural sky (`Sky` shader) with a moving sun. A match runs from late afternoon through sunset into neon dusk. The environment map is re-baked from the sky with PMREM every few seconds.
- One sun shadow map whose frustum follows the player and widens with camera height (70 m on foot, 720 m in the drop), snapped to whole texels. This replaced the planned three-cascade CSM: it needs one shadow pass, not three, over a city of about a million triangles, and the player never sees near and far shadows at once in a street canyon. See D-13.
- Night lighting: lit windows and neon come from the facade shader and vertex-coloured emissive geometry; street lamps paint additive light pools and a small pool of real point lights follows the player from lamp to lamp.
- Post chain: MSAA on the HDR target (FXAA on Low), bloom for neon and sun glints, vignette and grade, ACES output.
- Water: one shader for ocean and canals. Five Gerstner waves displace a camera-following grid; a baked shore-distance field drives turquoise shallows, foam lines and wave damping inside canals. The same wave function runs on the CPU for buoyancy and swimming.
- Instancing for palms, lamps, props and windows; merged static geometry per city block; distance culling and animation LOD.

**World** (all generated in code from a seeded layout)

- `layout.ts` defines land parcels, canals, roads, lots and named districts. Terrain, roads, buildings, props, nav grid, traffic lanes and the minimap all derive from it.
- Art-deco buildings are generated: stepped massing, rounded corners, eyebrow ledges, fins, porthole and ribbon windows, pastel stucco, neon trim and signs. Facade detail comes from canvas-drawn textures.
- Shops are real interiors with door openings, colliders, Kenney Mini Shop and Food Kit furniture, and interactables.
- Terrain collider is a trimesh built from the layout. Buildings are cuboids.

**Characters**

- Rig and clips: Quaternius Universal Animation Library 1 and 2 (CC0), one 53-bone mannequin and 50 clips, all in place (no root motion). The model faces +Z, so its root is turned half a turn from the game's yaw.
- `clips.ts`: every clip is sampled once at 30 fps into flat arrays shared by all characters (`ClipBank`), and poses are blended by hand with per-bone masks. three's `AnimationMixer` is used only for that bake. See D-14.
- `animator.ts`, in order each frame:
  - Base pose. Walking and running are separate gaits that cross over between 2.1 and 3.3 m/s; jog and sprint blend by speed; all share one stride phase. A clip's natural speed is measured from how fast its toes travel while they are on the floor. Speed changes are split between cadence and stride length (square root each), cadence is capped at 1.45 times the authored rate, and the rest is taken up by stretching the stride in the foot targets.
  - Snapshot crossfades between states (ground, air, swim, slide, seat, dead), an upper-body mask for weapon stances and one-shot actions.
  - Orientation warping: the legs turn up to 80 degrees toward the direction of travel and the spine turns back by the same amount, so the chest stays on the aim; beyond about 106 degrees the legs run backward with the phase reversed.
  - Lean from smoothed acceleration (forward when speeding up, into the turn when the path curves), breathing that deepens with exertion, recoil and flinch springs.
  - Legs: a foot is in contact while it travels backward under the body and is low. A planted foot is pinned in the world, at the ankle while flat and at the toe once the heel lifts, and released into the swing with a blend. Two-bone IK puts the ankle on the pin and on the ground found by a ray; the pelvis drops for the lower foot, sinks up to 12 cm more when a planted leg would run out of length, and beyond that the pin is pulled in. Standing still, feet stay put while the upper body turns and step round one at a time once they are 55 degrees or 15 cm off.
  - Landing: a critically damped spring drops the hips by about 13 cm from a jump and up to 29 cm from a long fall.
  - Head and neck look-at within neck limits.
- `ik.ts`: analytic two-bone IK, world-space bone rotation and translation helpers, aim-a-bone. Left-hand IK to weapon foregrips and steering wheels arrives with T-06 and T-07.
- `poses.ts` (T-05): procedural skydive arch and canopy hang through the animator's `poseFn` hook.
- `motor.ts`: capsule on Rapier's `KinematicCharacterController` with acceleration that favours stopping and reversing, coyote time, jump buffering, crouch with headroom check, slide, wading and swimming. A capsule pressed onto a triangle mesh sometimes catches an inner edge of flat ground and stops dead for a step; the motor retries such a step without the downward push.
- Outfits: clothing is painted per fragment from the bind-pose position in a patched `MeshStandardMaterial` (sleeve and hem lengths, shirt patterns, gloves, socks, shoes), with hair, hats, glasses and the parachute pack as small meshes fitted to the measured head and chest. Every combatant gets a different combination.
- Bots share the system with LOD: full IK near the camera, reduced update rate and no IK far away.
- Third-person camera on a boom over the shoulder; the boom shortens at once when a wall is in the way and grows back slowly. The crosshair ray starts beyond the character.
- Pointer lock for mouse look, with a free-look mode (plain mouse movement) for embedded pages and headless tests, where a locked pointer cannot be driven.

**Physics and vehicles**

- Fixed 60 Hz step with render interpolation.
- Characters: capsule with Rapier's `KinematicCharacterController` (autostep, ground snap, slope limits), custom acceleration, air control, coyote time and jump buffering.
- Cars: `DynamicRayCastVehicleController` on Kenney Car Kit bodies with separate wheels; engine curve, steering that tightens with speed, handbrake slip, anti-roll.
- Traffic: lane followers on kinematic bodies with look-ahead braking and intersection reservation; they become dynamic vehicles when hit or driven.
- Boats and jet skis: dynamic bodies with multi-point buoyancy on the CPU wave field, anisotropic drag, stern thrust and rudder torque; spray and wake particles.

**Gameplay**

- 24 combatants (one player, 23 bots), about nine minutes per match.
- Five weapon classes with original names and four tiers. Hitscan with spread bloom, falloff and headshots; thrown grenades are physics bodies.
- Loot in beach coolers, duffel bags and supply drops; cash for shop purchases.
- Bots: utility-driven state machine (drop, loot, travel, engage, reposition, heal, flee the squall) on an A* nav grid with steering; aim model with reaction time and error that tightens over time.
- Zone: the hurricane eye, a shrinking circle with a rain wall; five phases.

**Audio**

- WebAudio only. Synthesised gunshots, footsteps keyed to foot plants and surface, engines mapped to rpm, water, wind, UI. A generated synthwave loop for the menu.

**Assets**

- Kenney Car Kit, Watercraft Kit, Blaster Kit, Mini Shop, Food Kit (CC0); Quaternius UAL 1 and 2 (CC0). Processed by `tools/build-assets.mjs` into `public/assets/` and committed.
- AI images through Higgsfield's HTTP API (`tools/gen-art.mjs`, model Marketing Studio Image 2.5 Flare). No Higgsfield MCP is registered on this machine and the `@higgsfield/cli` package only signs in through a browser, so neither could be used from an agent; Kie.ai was the second path and was not needed.

**Risks**

- Scope. Mitigation: milestones below are ordered so each leaves a playable game.
- Headless GPU rendering. Mitigation: ANGLE on the AMD iGPU, SwiftShader as a slower fallback.
- Retargeting UAL2 onto the UAL1 rig. Mitigation: compare rest poses first; drop the UAL2 extras if they differ.
- Performance with 24 skinned characters and a city. Mitigation: animation LOD, instancing, quality presets, dynamic resolution.

## Decisions

### Asked
- none. The coordinator settled originality, no multiplayer build, branch and assets policy.

### Defaulted (change any before sw-do)
- D-01 Renderer → three.js r187 `WebGLRenderer` (WebGL2), not WebGPU.
- D-02 Physics → Rapier 0.21 WASM.
- D-03 Character motion → CC0 mocap-style clips plus procedural IK layers, not fully procedural and not Mixamo.
- D-04 City → generated in code from a seeded layout, not hand-modelled or a downloaded city kit.
- D-05 Title → "EYEWALL: Marazul Bay" (working title, one constant in `src/core/config.ts`). "Neon Tide" was rejected because a Steam game uses it.
- D-06 No building mechanic. It is another game's signature, and its absence keeps this one distinct.
- D-07 24 combatants per match, single player versus bots.
- D-08 Zone theme → hurricane eye with a rain wall (teal and white), named the Eye and the Squall.
- D-09 Loot containers → beach coolers and duffel bags; tiers named Stock, Tuned, Custom, Signature.
- D-10 Audio → synthesised in WebAudio, no sampled sound files.
- D-13 Shadows → one adaptive shadow map instead of cascades (one pass over the city instead of three). Ambient occlusion is left out: flat-shaded pastel blocks gain little from it and it costs a full-screen pass.
- D-14 Animation runtime → clips baked into a shared `ClipBank` and blended by hand, not one `AnimationMixer` per character. 24 characters share one copy of the data, pose blending with bone masks costs about 0.08 ms per character, and the procedural layers (warping, foot locking, IK) need direct access to the pose anyway.
- D-15 Vehicles do not collide with character capsules. A kinematic capsule is an immovable wall to a dynamic car, so walking into a parked car would shove it and a car hitting a pedestrian would stop dead. Run-overs and door blocking are handled in gameplay code from overlap tests.
- D-16 The fixed step runs up to six times per frame, which keeps game time equal to real time down to 10 frames a second; below that the game slows down instead of spiralling.
- D-11 Hosting → static `dist/`; no public deployment in this increment.
- D-12 Committed binary assets live under `public/assets/` (about 30 MB cap); raw downloads stay in ignored `.temp/`.

### Open
- none

## Tasks

### T-01 Scaffold, engine loop and headless test harness
- AC: AC-01 | Files: package.json, tsconfig.json, vite.config.ts, eslint.config.js, playwright.config.ts, index.html, src/main.ts, src/core/*, tests/e2e/boot.spec.ts, AGENTS.md | Test: npx playwright test tests/e2e/boot.spec.ts

### T-02 Asset pipeline and credits check
- AC: AC-02 | Files: tools/fetch-assets.sh, tools/build-assets.mjs, tools/check-credits.mjs, public/assets/**, CREDITS.md | Test: node tools/check-credits.mjs

### T-03 Marazul Bay world: layout, terrain, roads, buildings, props, sky, water
- AC: AC-04 | Files: src/world/*, src/render/*, tests/e2e/world.spec.ts | Test: npx playwright test tests/e2e/world.spec.ts

### T-04 Character rig, locomotion animation, IK and third-person camera
- AC: AC-05 | Files: src/character/*, src/physics/*, src/gameplay/player.ts, src/gameplay/camera.ts, tests/e2e/locomotion.spec.ts | Test: npx playwright test tests/e2e/locomotion.spec.ts

### T-05 Seaplane drop, freefall, parachute and landing
- AC: AC-03 | Files: src/gameplay/drop.ts, src/gameplay/match.ts, src/character/poses.ts, tests/e2e/drop.spec.ts | Test: npx playwright test tests/e2e/drop.spec.ts

### T-06 Weapons, combat, loot and inventory
- AC: AC-09 | Files: src/gameplay/weapons.ts, src/gameplay/combat.ts, src/gameplay/inventory.ts, src/world/loot.ts, src/render/particles.ts, tests/e2e/combat.spec.ts | Test: npx playwright test tests/e2e/combat.spec.ts

### T-07 Cars and traffic
- AC: AC-06 | Files: src/vehicles/car.ts, src/vehicles/traffic.ts, src/vehicles/vehicleManager.ts, tests/e2e/car.spec.ts | Test: npx playwright test tests/e2e/car.spec.ts

### T-08 Boats, jet skis, buoyancy and swimming
- AC: AC-07 | Files: src/vehicles/boat.ts, src/physics/buoyancy.ts, tests/e2e/water.spec.ts | Test: npx playwright test tests/e2e/water.spec.ts

### T-09 Enterable shops and interactables
- AC: AC-08 | Files: src/world/shops.ts, src/gameplay/interact.ts, src/ui/shopMenu.ts, tests/e2e/shops.spec.ts | Test: npx playwright test tests/e2e/shops.spec.ts

### T-10 Bots
- AC: AC-10 | Files: src/ai/*, src/world/navgrid.ts, tests/e2e/bots.spec.ts | Test: npx playwright test tests/e2e/bots.spec.ts

### T-11 Match loop, zone, HUD, minimap, menus
- AC: AC-11 | Files: src/world/zone.ts, src/ui/*, src/gameplay/match.ts, tests/e2e/match.spec.ts | Test: npx playwright test tests/e2e/match.spec.ts

### T-12 Audio, music, settings and quality presets
- AC: AC-12 | Files: src/audio/*, src/core/settings.ts, src/ui/settings.ts, tests/e2e/audio.spec.ts | Test: npx playwright test tests/e2e/audio.spec.ts

### T-13 AI-generated key art, billboards and signs
- AC: AC-13 | Files: tools/gen-art.mjs, public/assets/img/**, src/world/billboards.ts, CREDITS.md, tests/e2e/art.spec.ts | Test: npx playwright test tests/e2e/art.spec.ts

### T-14 Multiplayer evaluation
- AC: AC-14 | Files: docs/multiplayer-evaluation.md | Test: node tools/check-docs.mjs

### T-15 Performance, polish, full playthrough evidence and README
- AC: AC-15 | Files: README.md, src/**, tests/e2e/perf.spec.ts, tests/e2e/playthrough.spec.ts | Test: npm test

### T-16 Verify and close 0001
- AC: AC-01 | Files: .specweave/increments/0001-miami-battle-royale-fable/** | Test: npm run build && npm run lint && npm test
