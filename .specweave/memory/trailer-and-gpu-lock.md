# Filming and the GPU lock

`node tools/trailer.mjs` films the trailer headless while a dev server is up (`EYEWALL_PORT`). The game is stepped by hand, one filmed frame at a time, so the film is smooth on any machine. `tools/trailer-audio.mjs` gives it sound: it logs every one-shot and every loop's level and pitch in film time, then renders the log offline with the game's own synths and music. Useful flags: `--size 1080x1920` for a vertical cut, `--only` and `--skip` for scenes, `--hook` for an opening line, `--link` for the end card, `--stems` to balance the mix.

On a machine with one GPU, real-time browser runs disturb each other: a test that measures frames, or a film, run next to another gives wrong results. Every Playwright run and every film takes the same lock: `flock /tmp/eyewall-gpu.lock <command>`.

Game time can be run without drawing for tests that do not need the picture: `engine.stop()`, `engine.renderEnabled = false`, then `window.__eyewall.fastForward(seconds)`. A whole round takes about half a minute that way.
