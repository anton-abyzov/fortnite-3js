# Release: GitHub Pages, one folder per build

The game is published from the `gh-pages` branch of the repository, each build in its own folder. The Fable build lives in `fable/`, and the bare site address redirects to it.

`tools/deploy-pages.sh [slot]` does the whole release: it exports the committed tree (`git archive HEAD`, so uncommitted work never ships), type-checks it, builds it with `EYEWALL_SITE` set to the public address (the link-preview tags in `index.html` need an absolute URL), checks the credits, and pushes the result to `gh-pages/<slot>/`. Other folders on that branch are left alone.

Renaming the repository changes the public address. Redeploy after a rename so the link-preview tags point at the new one.
