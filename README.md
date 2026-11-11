# Sunbreak: Biscayne

An original browser-native coastal drop-zone survival game set in a Miami-inspired waterfront district, built with **Three.js**, **Rapier3D WASM**, **`three-mesh-bvh`**, and **`three-gpu-pathtracer`**.

## Highlights

- **High-Altitude Coastal Drop & Ram-Air Canopy**: Start aboard a twin-turboprop jump plane cruising at `142 m` over Biscayne’s shoreline, dive in aerodynamic freefall, and pull a steerable 7-cell ram-air canopy to touch down on rooftops, boulevards, beaches, docks, or canals.
- **Biomechanical Human Locomotion**: Analytical Law-of-Cosines two-bone leg IK with Rapier ground-raycast foot planting, heel-strike to toe-off ankle roll, double-peak pelvic oscillation, pelvic shift/list, spine counter-rotation, contra-lateral cross-body arm swing with speed-scaled elbow flexion, two-handed weapon grip/ADS/recoil kinematics, crouch compression, freestyle swimming, canopy toggle steering, and seated vehicle steering.
- **Photoreal Solar Cycle & Live Browser GPU Path Tracer**: Continuous Miami latitude (`25.76° N`) Rayleigh/Mie sky and sun ephemeris (`Dawn`, `Noon`, `Sunset`, `Night`, solar slider, and live orbit `[T]`), dynamic PMREM environment GI, custom Gerstner wave shader with Fresnel sky/neon reflections and underwater sandbar caustics, plus a one-key **`WebGLPathTracer` BVH GPU Path-Tracing mode (`[P]`)** for progressive multi-bounce global illumination and soft area-sun penumbra shadows.
- **Miami Canals, Arched Bridges, Atlantic Beach & Enterable Shops**: Interconnected Intracoastal and Venetian canals with 5 arched bridges (drive cars over, pilot boats and jet skis underneath), wooden marina piers, sloping sandy South Beach with lifeguard towers, and 4 open-doorway enterable shops (`Biscayne Surf & Outfitter`, `Calle Ocho Espresso & Bodega`, `Bayside Marine & Exotic Lounge`, `Ocean Drive Boutique & Rooftop`) stocked with weapons, `Cafecito` speed boosts, armor, medkits, and interactive cash registers (`[E]`).
- **Drivable Physics Cars, Jet Skis & Speedboats**: Hunyuan 3D v3.1 Pro PBR GLB hulls normalized onto 4-wheel raycast spring-damper suspension sports convertibles and SUVs, plus 5-probe Gerstner-buoyant Biscayne Jet Skis and twin-outboard Center-Console Speedboats.
- **Ranged Combat, Autonomous Drop Bots & Tropical Storm**: 4 original weapon classes (`Coastal Carbine`, `Breacher Shotgun`, `Biscayne SMG`, `Reef Marksman`) with ballistic tracers and headshot multipliers against 18 autonomous drop bots inside a shrinking tropical squall wall, paired with zero-asset procedural WebAudio synthesis.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5179` in any WebGL2-capable desktop browser.

## Controls

| Input | Action |
|---|---|
| `Space` | Jump from aircraft, deploy ram-air canopy, jump on foot, handbrake in car |
| `W A S D` | Move, dive/glide canopy, swim, drive cars and watercraft |
| `Shift` | Sprint, fast-swim, vehicle nitro / waterjet boost |
| `C` / `Ctrl` | Crouch |
| `E` | Board / exit car, jet ski, or speedboat; collect shop gear & ring registers |
| `Left Click` / `Right Click` | Fire weapon / Aim down sights (ADS) |
| `1` `2` `3` `4` / `R` | Switch weapon slot / Reload |
| `P` | Toggle live BVH GPU Path-Traced Global Illumination (`WebGLPathTracer`) |
| `T` / `[` `]` | Toggle solar time-lapse orbit / Scrub Miami time of day |

## Verification & Architecture Docs

- Run typecheck + unit suite: `npm run lint && npm run test:unit`
- Run production build + headless Playwright E2E suite: `npm run build && npm run test:e2e`
- Run full verification pipeline: `npm run verify:all`
- Multiplayer architecture evaluation (`60-100` players): [`docs/multiplayer-evaluation.md`](docs/multiplayer-evaluation.md)
