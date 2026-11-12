#!/usr/bin/env bash
# Publish the comparison page to GitHub Pages under vs/: tools/pages/vs/index.html (as committed) and its
# media, which are films and stills and so are not in the repository.
# Usage: tools/deploy-vs.sh [media folder]   (default evidence/vs: fable-vs-carbon.mp4, poster.jpg, fable.jpg, carbon.jpg)
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
remote="$(git -C "$root" remote get-url origin)"
media="${1:-$root/evidence/vs}"
work="$root/.temp/pages-vs"
sha="$(git -C "$root" rev-parse --short HEAD)"
site="${EYEWALL_SITE:-$(node -e '
  const m = process.argv[1].match(/github\.com[:\/]([^\/]+)\/(.+?)(\.git)?$/);
  if (m) console.log(`https://${m[1].toLowerCase()}.github.io/${m[2]}/`);
' "$remote")}"
for f in fable-vs-carbon.mp4 poster.jpg fable.jpg carbon.jpg; do
  [ -f "$media/$f" ] || { echo "deploy-vs: $media/$f is missing" >&2; exit 1; }
done

rm -rf "$work"
git clone --quiet --depth 1 --branch gh-pages "$remote" "$work"
rm -rf "${work:?}/vs"
mkdir -p "$work/vs"
git -C "$root" show HEAD:tools/pages/vs/index.html | sed "s#__SITE__#$site#g" > "$work/vs/index.html"
cp "$media/fable-vs-carbon.mp4" "$media/poster.jpg" "$media/fable.jpg" "$media/carbon.jpg" "$work/vs/"

git -C "$work" add -A
if git -C "$work" diff --cached --quiet; then
  echo "deploy-vs: nothing changed in vs/"
else
  git -C "$work" commit --quiet -m "Deploy vs from $sha"
  git -C "$work" push --quiet origin gh-pages
  echo "deploy-vs: pushed vs/ from $sha, served at ${site}vs/"
fi
