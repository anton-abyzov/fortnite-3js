#!/usr/bin/env bash
# Downloads the raw CC0 asset packs into .temp/dl (ignored by git). The processed files that the game
# ships are committed under public/assets, so this is only needed to rebuild them: npm run assets
set -euo pipefail
cd "$(dirname "$0")/.."
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36'
OGA='https://opengameart.org/sites/default/files'

fetch() { # name url
  local dir=".temp/dl/$1"
  if [ -d "$dir" ] && [ -n "$(ls -A "$dir" 2>/dev/null)" ]; then echo "have $1"; return; fi
  mkdir -p "$dir"
  echo "fetch $1"
  curl -fsSL -m 600 -A "$UA" -o "$dir/$1.zip" "$2"
  (cd "$dir" && unzip -q -o "$1.zip")
}

# Quaternius, CC0: https://quaternius.com/packs/universalanimationlibrary.html
fetch ual1 "$OGA/universal_animation_librarystandard.zip"
fetch ual2 "$OGA/universal_animation_library_2standard.zip"
# Kenney, CC0: https://kenney.nl/assets
fetch carkit "$OGA/kenney_car-kit_3.1.zip"
fetch watercraft "$OGA/kenney_watercraft_kit_0.zip"
fetch blaster "$OGA/kenney_blaster-kit_2.1.zip"
fetch minishop "$OGA/kenney_mini-shop_2.1.zip"
fetch food "$OGA/kenney_food-kit.zip"
echo "done. Now run: npm run assets"
