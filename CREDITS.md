# Credits

EYEWALL: Marazul Bay is an original game. Its name, map, characters, interface, sounds and music were made for this project. Sound effects and music are synthesised in the browser at run time, so no audio files ship.

The machine-readable list is `public/assets/credits.json`. `npm run credits` fails when a shipped file is missing from it.

## Third-party assets

| Asset | Author | Licence | Source | Shipped as |
|---|---|---|---|---|
| Universal Animation Library 1 and 2 (Standard): mannequin rig and 50 motion clips | Quaternius | CC0 1.0 | https://quaternius.com/packs/universalanimationlibrary.html | `public/assets/models/character.glb` |
| Car Kit 3.1 | Kenney | CC0 1.0 | https://kenney.nl/assets/car-kit | `public/assets/models/vehicles.glb` |
| Watercraft Kit | Kenney | CC0 1.0 | https://kenney.nl/assets/watercraft-kit | `public/assets/models/boats.glb` |
| Blaster Kit 2.1 | Kenney | CC0 1.0 | https://kenney.nl/assets/blaster-kit | `public/assets/models/weapons.glb` |
| Mini Shop 2.1 (Mini Market) | Kenney | CC0 1.0 | https://kenney.nl/assets/mini-market | `public/assets/models/shop.glb` |
| Food Kit | Kenney | CC0 1.0 | https://kenney.nl/assets/food-kit | `public/assets/models/food.glb` |

CC0 1.0 is a public-domain dedication: https://creativecommons.org/publicdomain/zero/1.0/. Credit is not required. It is given here with thanks.

## Project files

| Asset | Author | Licence |
|---|---|---|
| Credits manifest | EYEWALL project | MIT |

## Software

| Library | Licence |
|---|---|
| three.js | MIT |
| Rapier (`@dimforge/rapier3d-compat`) | Apache-2.0 |
| Vite, TypeScript, Playwright, oxlint, glTF-Transform, meshoptimizer (build and test only) | MIT / Apache-2.0 |

## Rebuilding the assets

```
tools/fetch-assets.sh   # downloads the raw packs into .temp/dl
npm run assets          # writes public/assets/models
npm run credits         # checks every shipped file is listed
```
