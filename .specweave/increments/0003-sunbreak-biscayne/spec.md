# 0003 Sunbreak Biscayne: Original Miami Coastal Drop-Zone Game

## Problem

The repository currently contains only project scaffolding with no playable application. We need an original, zero-install browser battle-royale-style drop-zone survival game set in a photorealistic Miami-inspired coastal district with full rigid-body physics, detailed human leg and arm biomechanics, drivable land and water vehicles across canals and the Atlantic shoreline, enterable shops with interactive interiors, ranged combat against autonomous bots, and a live sun/time-of-day lighting pipeline with browser GPU path tracing.

## Scope

In: single-player browser drop-zone match loop against autonomous bots, high-altitude aircraft jump + freefall + steerable ram-air canopy, Rapier3D physics world, Miami beach + Intracoastal canals + arched bridges + marina + Art Deco blocks + 4 enterable interactive shops, rigged skeletal human locomotion with analytical 2-bone foot/hand IK and micro-kinematics, 4-wheel raycast suspension cars, buoyant jet skis and speedboats on a shared GPU/CPU Gerstner wave field, 4 original weapon classes, shrinking tropical storm wall, procedural WebAudio, photorealistic sun/sky time-of-day cycle + dynamic PMREM GI + live `three-gpu-pathtracer` BVH path-tracing render mode, automated unit + headless Playwright E2E suite, and a written multiplayer architecture evaluation.

Out: live networked multiplayer runtime, persistent user accounts, commercial IP or third-party game branding.

## Acceptance Criteria

- [ ] AC-01: `npm run build`, `npm run lint`, and `npm run test:unit` exit 0, and launching the web app initializes the Three.js WebGL2 renderer and Rapier3D physics world cleanly with zero uncaught console or page errors.
- [ ] AC-02: Every match begins aboard a coastal twin-turboprop jump aircraft cruising over the Miami shoreline, transitions on jump into aerodynamic freefall with pitch/bank drag control, deploys a steerable ram-air canopy manually or automatically below safe altitude, and lands smoothly on roofs, streets, sand, docks, or water.
- [ ] AC-03: Human characters (player and bots) execute real-time skeletal biomechanics over a rigged mesh: analytical 2-bone leg IK with ground raycast foot planting on slopes and stairs, heel-strike to toe-off ankle roll, double-peak pelvis vertical oscillation, pelvic shift/list and spine counter-rotation, contra-lateral cross-body arm swing with speed-scaled elbow flexion, two-handed weapon grip/ADS/recoil IK, crouch compression, swimming strokes in water, canopy toggle pulls, and seated vehicle steering poses.
- [ ] AC-04: The lighting engine provides a continuous Rayleigh/Mie physical sun-and-sky time-of-day cycle (dawn, noon, sunset, night) with dynamic PMREM environment GI, stabilized sun shadows, screen-space contact/bloom post-processing, Fresnel/caustic Gerstner water, and an interactive in-browser `three-gpu-pathtracer` BVH GPU path-tracing mode (`P` key or HUD studio toggle) that accumulates multi-bounce global illumination and soft sun penumbra shadows and resumes real-time gameplay cleanly.
- [ ] AC-05: The Miami coastal map includes the east-side Atlantic Ocean and sandy beach, interconnected Intracoastal canals with arched bridges (drive over by car, pass under by watercraft) and marina docks, Art Deco and contemporary towers, swaying palms, and 4 open-doorway enterable shops with interior physics colliders, counters, shelving, rooftop stairs, weapon racks, consumables, and interactive cash registers/crates (`E`).
- [ ] AC-06: Players seamlessly board and exit (`E`) drivable Miami convertible sports cars and coastal SUVs (4-wheel raycast spring-damper suspension, Ackermann steering, handbrake drift, nitro boost, headlights/taillights) and drivable personal watercraft (jet skis with banking turns and spray) plus center-console speedboats (multi-probe Gerstner wave buoyancy, bow planing pitch, wake trails) using normalized PBR 3D GLB hulls.
- [ ] AC-07: Players loot and fire 4 original weapon classes (Coastal Carbine, Breacher Shotgun, Biscayne SMG, Reef Marksman Rifle) and consumables against 18 autonomous bots that parachute in, navigate streets/shops/beaches, and fight inside a shrinking tropical storm boundary with procedural WebAudio feedback and an original Miami coastal HUD + minimap.
- [ ] AC-08: `docs/multiplayer-evaluation.md` documents a concrete 60-100 player multiplayer architecture evaluation covering transport protocols, server-authoritative Rapier simulation and snapshot interpolation, client-side prediction for human/car/watercraft physics, BVH lag-compensated hitscan rewind, spatial AOI, anti-cheat, and infrastructure sizing.

## Approach

1. Build a modular TypeScript + Vite application backed by `three@0.187.0`, `@dimforge/rapier3d-compat@0.21.0`, `three-mesh-bvh@0.9.18`, `three-gpu-pathtracer@0.0.28`, and `postprocessing@6.39.6`.
2. Generate detailed PBR 3D GLB hulls via Higgsfield `tripo_3d` for the Miami convertible sports car, personal watercraft jet ski, center-console speedboat, and twin-turboprop jump aircraft, normalize bounding boxes and pivots via `tools/prepare-assets.mjs`, and build an articulated skeletal humanoid rig with procedural fallback resiliency so offline/headless tests never flake.
3. Share a deterministic multi-band Gerstner wave solver (`src/rendering/water-system.ts`) between the custom GLSL ocean/canal water shader (Fresnel sky/city reflection, Beer-Lambert turquoise absorption, shoreline surf foam, underwater sandbar caustics) and the CPU multi-probe watercraft/swimmer buoyancy integrator.
4. Combine real-time physical rendering (Preetham/Hosek atmospheric sun/sky, dynamic PMREM cube environment map updates, ACES Filmic tone mapping, stabilized high-res directional shadow frustums, selective bloom) with an on-demand `WebGLPathTracer` (`three-gpu-pathtracer`) mode that synchronizes dynamic meshes into a scene BVH for true multi-bounce path-traced GI and area-sun shadows directly in the browser.
5. Drive human movement through an analytical two-bone IK solver (`src/character/ik-solver.ts`) and phase-locked gait controller (`src/character/biomechanics.ts`) layered onto a hierarchical bone skeleton so every stride, slope adaptation, arm swing, weapon recoil kick, swim stroke, canopy hang, and steering wheel grip responds physically to live velocity and terrain normals.
6. Expose a deterministic debug/inspection bridge (`window.__SUNBREAK__`) for automated headless Playwright E2E verification across every game phase (aircraft drop, canopy glide, street locomotion, shop entry + register interaction, car driving over canal bridge, jet ski and speedboat cruising in canals/ocean, bot combat, time-of-day transitions, and GPU path-tracing accumulation).

## Decisions

### Asked
- D-01 Parallel build target and visual focus -> Build on branch `build/gemini` with photorealistic sun/time-of-day lighting and browser ray-traced/path-traced lighting and shadows (user).
- D-02 Multiplayer scope -> Single-player playable match with autonomous bots now, plus a written multiplayer engineering evaluation (user).
- D-03 Asset pipeline -> Use 3D generators (Higgsfield CLI) and open/procedural PBR assets with strictly original Miami coastal art and zero third-party game IP (user).

### Defaulted (change any before sw-do)
- D-04 Physics engine -> `@dimforge/rapier3d-compat` WASM rigid-body + raycast world at fixed 60 Hz substeps (deterministic, fast raycasts for foot IK, vehicle suspension, and buoyancy).
- D-05 Browser ray-tracing strategy -> Dual-mode pipeline: 60 FPS real-time PBR + dynamic PMREM GI + ray-marched water reflections/caustics during active movement, paired with live `three-gpu-pathtracer` BVH path-tracing toggle (`P` key / HUD) for true multi-bounce GI and soft area shadows in WebGL2.
- D-06 Aesthetic identity -> "Sunbreak: Biscayne" architectural coastal HUD (Fraunces + Plus Jakarta Sans + JetBrains Mono, warm limestone `#F6F2EA`, Biscayne turquoise `#0E9AA7`, coral sun `#FF5E4D`, deep Atlantic `#081C24`).

### Open
- none

## Tasks

### T-01 Scaffold Vite, TypeScript, Three.js, Rapier3D, PathTracer workspace and math/test harness
- AC: AC-01 | Files: package.json, package-lock.json, tsconfig.json, vite.config.ts, vitest.config.ts, playwright.config.ts, index.html, AGENTS.md, .gitignore, .gitattributes, .specweave/config.json, src/types/game.ts, src/core/math.ts, src/core/rng.ts, tests/unit/math.test.ts | Test: npm run lint && npm run test:unit

### T-02 Generate and normalize PBR 3D GLB assets and skeletal humanoid rig
- AC: AC-03, AC-06 | Files: tools/glb-info.py, tools/prepare-assets.mjs, public/assets/models/miami_convertible.glb, public/assets/models/miami_jetski.glb, public/assets/models/miami_speedboat.glb, public/assets/models/coastal_aircraft.glb, src/assets/asset-manifest.ts, src/assets/asset-loader.ts, tests/unit/assets.test.ts | Test: npm run test:unit -- tests/unit/assets.test.ts

### T-03 Implement photorealistic lighting, time-of-day cycle, Gerstner caustic water and BVH GPU path tracer
- AC: AC-04 | Files: src/rendering/materials.ts, src/rendering/time-of-day.ts, src/rendering/water-system.ts, src/rendering/post-processing.ts, src/rendering/path-tracer.ts, tests/unit/water-lighting.test.ts | Test: npm run test:unit -- tests/unit/water-lighting.test.ts

### T-04 Build Miami coastal world, canals, bridges, Atlantic beach and enterable interactive shops
- AC: AC-05 | Files: src/world/physics-world.ts, src/world/miami-layout.ts, src/world/foliage-props.ts, src/world/shops.ts, src/world/miami-builder.ts, tests/unit/world-shops.test.ts | Test: npm run test:unit -- tests/unit/world-shops.test.ts

### T-05 Implement biomechanical human locomotion, two-bone IK, parachute aerodynamics and player controller
- AC: AC-02, AC-03 | Files: src/character/ik-solver.ts, src/character/human-rig.ts, src/character/biomechanics.ts, src/character/parachute-system.ts, src/character/player-controller.ts, tests/unit/biomechanics.test.ts | Test: npm run test:unit -- tests/unit/biomechanics.test.ts

### T-06 Implement drivable 4-wheel raycast suspension cars, planing jet skis and buoyant speedboats
- AC: AC-06 | Files: src/vehicles/raycast-car.ts, src/vehicles/watercraft.ts, src/vehicles/vehicle-manager.ts, tests/unit/vehicles.test.ts | Test: npm run test:unit -- tests/unit/vehicles.test.ts

### T-07 Implement original weapons, autonomous drop bots, tropical storm zone, procedural audio, HUD and E2E verification
- AC: AC-01, AC-02, AC-04, AC-05, AC-06, AC-07 | Files: src/combat/weapons.ts, src/combat/projectiles-bvh.ts, src/ai/bot-agent.ts, src/ai/bot-manager.ts, src/gameplay/storm-zone.ts, src/audio/sound-engine.ts, src/ui/styles.css, src/ui/hud.ts, src/game/sunbreak-game.ts, src/main.ts, tests/e2e/sunbreak.spec.ts | Test: npm run build && npm run test:e2e

### T-08 Author multiplayer architecture evaluation and project documentation
- AC: AC-08 | Files: docs/multiplayer-evaluation.md, README.md, .specweave/memory/MEMORY.md, .specweave/memory/architecture.md | Test: npm run verify:all
