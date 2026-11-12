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

## Original artwork (AI-generated)

The pictures in `public/assets/img` were generated for this project from the prompts in `tools/gen-art.mjs`, and the project owns them. Licence: Original (AI-generated, project-owned).

All 21 pictures came from the same provider and model: the Higgsfield API (`api.higgsfield.ai`), model Marketing Studio Image 2.5 Flare, resolution `2k`, quality `max`.

| Asset | Pictures | Provider | Model | Shipped as |
|---|---|---|---|---|
| EYEWALL title key art | `title` | Higgsfield API | Marketing Studio Image 2.5 Flare | `public/assets/img/title.webp`, and `public/assets/img/social-card.jpg` (the same picture cropped to 1200x630 with the title set over it, for link previews) |
| Marazul Bay billboards | `cascabel-cola`, `marazul-air`, `sol-987`, `pelican-surf`, `hotel-flamingo`, `tidewater-cold-brew`, `garza-marina`, `storm-watch` | Higgsfield API | Marketing Studio Image 2.5 Flare | `public/assets/img/billboards/*.webp` |
| Marazul Bay street murals | `flamingos`, `big-wave`, `pelican`, `fruit`, `eye`, `manatee` | Higgsfield API | Marketing Studio Image 2.5 Flare | `public/assets/img/murals/*.webp` |
| Marazul Bay shop posters | `mango-smoothie`, `sunscreen`, `arcade-night`, `fresh-ceviche`, `board-rental`, `ammo-sale` | Higgsfield API | Marketing Studio Image 2.5 Flare | `public/assets/img/posters/*.webp` |

Every brand name in these pictures is fictional and was invented for the game: Cascabel Cola, Marazul Air, Sol 98.7 FM, Pelican Surf Co., Hotel Flamingo Heights, Tidewater Cold Brew, Garza Marina, Eyewall Storm Watch (Channel 5) and Sol-Block. None refers to a real company, product or broadcaster.

Each picture was downloaded as a PNG, cropped and resized with sharp, and encoded as WebP without metadata.

Where they appear in the game: the title key art is the backdrop of the title screen. The eight billboards stand on rooftops and on poles beside the plaza, the pier and the causeway. The six murals are painted on blank side walls. The six posters hang in shop windows and inside the shops. `public/assets/img/art.json` lists the pictures; `src/world/billboards.ts` places them.

## Project files

| Asset | Author | Licence |
|---|---|---|
| Credits manifest | EYEWALL project | MIT |
| Artwork manifest | EYEWALL project | MIT |

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
node tools/gen-art.mjs  # regenerates public/assets/img; needs HF_API_KEY_ID and HF_API_KEY_SECRET in the environment
npm run credits         # checks every shipped file is listed
```
