#!/usr/bin/env bash
# Build the game and publish dist/ to GitHub Pages: the gh-pages branch, under <slot>/ (default: fable).
# Other folders on that branch are left alone, so each build of the game keeps its own address.
# Usage: tools/deploy-pages.sh [slot]
set -euo pipefail

slot="${1:-fable}"
root="$(git rev-parse --show-toplevel)"
remote="$(git -C "$root" remote get-url origin)"
work="$root/.temp/pages"
sha="$(git -C "$root" rev-parse --short HEAD)"

npm --prefix "$root" run build
node "$root/tools/check-credits.mjs"

rm -rf "$work"
if git ls-remote --exit-code --heads "$remote" gh-pages >/dev/null 2>&1; then
  git clone --quiet --depth 1 --branch gh-pages "$remote" "$work"
else
  mkdir -p "$work"
  git -C "$work" init --quiet -b gh-pages
  git -C "$work" remote add origin "$remote"
fi

rm -rf "${work:?}/$slot"
mkdir -p "$work/$slot"
cp -R "$root/dist/." "$work/$slot/"
# Serve the files as they are: no Jekyll pass over them.
touch "$work/.nojekyll"
# The bare address sends visitors to this build until someone puts a front page there.
if [ ! -f "$work/index.html" ]; then
  cat > "$work/index.html" <<HTML
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>EYEWALL: Marazul Bay</title>
    <meta http-equiv="refresh" content="0; url=./$slot/" />
    <link rel="canonical" href="./$slot/" />
  </head>
  <body>
    <p><a href="./$slot/">Play EYEWALL: Marazul Bay</a></p>
  </body>
</html>
HTML
fi

git -C "$work" add -A
if git -C "$work" diff --cached --quiet; then
  echo "deploy-pages: nothing changed in $slot/"
else
  git -C "$work" commit --quiet -m "Deploy $slot from $sha"
  git -C "$work" push --quiet origin gh-pages
  echo "deploy-pages: pushed $slot/ from $sha"
fi
