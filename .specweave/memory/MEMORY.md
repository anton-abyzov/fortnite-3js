# Project memory index
Committed and read by every tool and account: one file per durable fact in this folder, one line per file here (see AGENTS.md).
- [Release on GitHub Pages](release-github-pages.md): `tools/deploy-pages.sh` builds the committed tree into `gh-pages/<slot>/`
- [Filming and the GPU lock](trailer-and-gpu-lock.md): `tools/trailer.mjs` with the game's own sound; one GPU job at a time through `flock /tmp/eyewall-gpu.lock`
