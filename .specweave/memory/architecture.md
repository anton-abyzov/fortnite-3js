# Sunbreak: Biscayne Architecture

- **Engine Stack**: `three@0.187.0` + `@dimforge/rapier3d-compat@0.21.0` (fixed 60 Hz physics + raycasts) + `three-mesh-bvh@0.9.18` + `three-gpu-pathtracer@0.0.28` + `postprocessing@6.39.6`.
- **Dual-Mode Photoreal Rendering**: Real-time 60 Hz gameplay uses `Sky` + dynamic `PMREMGenerator` IBL + `PCFShadowMap` + custom Gerstner caustic `ShaderMaterial` water; pressing `P` swaps custom shader water to a displaced `MeshPhysicalMaterial` surface (`IOR 1.333`) and runs `WebGLPathTracer` (`1x1` full-frame progressive multi-bounce GI).
- **Shared Wave Field**: `sampleWaterWave(x, z, timeSec)` in `src/rendering/water-system.ts` drives both GPU Gerstner wave visuals and CPU 5-probe watercraft/swimmer buoyancy (`src/vehicles/watercraft.ts`).
- **Biomechanical Human IK**: `solveTwoBoneIKPositions` (`src/character/ik-solver.ts`) and `BiomechanicalAnimator` (`src/character/biomechanics.ts`) compute real-time 2-bone leg IK, ankle roll, pelvis 6-DOF oscillation, spine counter-rotation, contra-lateral arm swing, and contextual poses (`freefall`, `canopy`, `swimming`, `driving`) for the player and all 18 bots.
- **Deterministic E2E Bridge**: `window.__SUNBREAK__` in `src/game/sunbreak-game.ts` exposes telemetry snapshots and frame stepping verified headlessly by `tests/e2e/sunbreak.spec.ts`.
