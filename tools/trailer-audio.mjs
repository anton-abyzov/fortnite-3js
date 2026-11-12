// The trailer's soundtrack. A film is stepped by hand, far slower than real time, so the game's sound
// cannot simply be recorded while it is shot. Instead the page keeps a log of what the game's audio
// asks for, in film time (every one-shot, and every loop's level and pitch on every frame), and when
// the shoot is over the same synths that sound in the game render that log into a WAV, offline.
// Nothing here is a recording: the music, the guns and the engines are the game's own.
// Both functions run inside the page; they must not use anything from this file's scope.

/** In the page: start logging. Returns false when the game has no audio (an old build). */
export async function installRecorder() {
  const game = window.__eyewall.game;
  const A = game.audio;
  if (!A?.engine?.loops) return false;
  const { SOUNDS } = await import('/src/audio/sounds.ts');
  const eng = A.engine;
  const rec = (window.__sound = { live: false, t: 0, sim0: 0, shots: [], frames: [], loops: eng.loops.map((st) => st.name) });
  const smooth = (a, b, x) => {
    const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return u * u * (3 - 2 * u);
  };
  const heard = (d, [near, far]) => (d >= far ? 0 : d <= near ? 1 : (near / d) * (1 - smooth(far * 0.55, far, d)));
  const play = eng.play.bind(eng);
  eng.play = (name, opts = {}) => {
    const def = SOUNDS[name];
    if (rec.live && def) {
      let level = def.gain * Math.max(0, opts.volume ?? 1);
      let pan = 0;
      let dist = 0;
      const pos = opts.position;
      if (pos) {
        const dx = pos.x - eng.lx;
        const dy = pos.y - eng.ly;
        const dz = pos.z - eng.lz;
        dist = Math.hypot(dx, dy, dz);
        level *= heard(dist, def.range);
        // Left or right of where the camera looks.
        const e = game.engine.camera.matrixWorld.elements;
        if (dist > 0.5) pan = Math.max(-1, Math.min(1, (dx * e[0] + dy * e[1] + dz * e[2]) / dist)) * 0.7;
      }
      // Between two filmed frames the game takes two steps: the simulation clock places the sound.
      if (level > 0.0008) rec.shots.push([rec.t + (game.engine.time - rec.sim0), name, level, pan, opts.pitch ?? 1, opts.jitter ?? def.jitter, dist, def.range[1]]);
    }
    play(name, opts);
  };
  // The game's own frame hook works by the wall clock. A film has its own clock.
  A.frame = () => {};
  window.__filmStep = (dt, t) => {
    rec.t = t;
    rec.sim0 = game.engine.time;
    rec.live = true;
    game.engine.step(dt);
    const cam = game.engine.camera;
    const p = cam.position;
    const e = cam.matrixWorld.elements;
    A.lx = p.x;
    A.ly = p.y;
    A.lz = p.z;
    eng.setListener(p.x, p.y, p.z, -e[8], -e[9], -e[10]);
    A.tick(dt);
    rec.live = false;
    const row = [t];
    for (const st of eng.loops) row.push(st.active ? eng.loopLevel(st) : 0, st.pitch);
    rec.frames.push(row);
  };
  return true;
}

/**
 * In the page: render the log into 16-bit stereo PCM and hand it to `window.__wav(base64)` in pieces.
 * `plan.music` is [[seconds, track, fade, startBar, level]], `plan.sfxCues` is [[seconds, level]] for the
 * effects bus, and `plan.extra` is [[seconds, sound, level]] for one-shots the film adds (a clap of thunder on a cut).
 */
export async function renderMix(plan) {
  const rec = window.__sound;
  const [{ Music }, { BufferBank }, { RECIPES }, { LOOPS }] = await Promise.all([
    import('/src/audio/music.ts'),
    import('/src/audio/bank.ts'),
    import('/src/audio/recipes.ts'),
    import('/src/audio/loops.ts'),
  ]);
  const sr = 48000;
  const length = plan.length;
  const ctx = new OfflineAudioContext(2, Math.ceil(length * sr), sr);
  const bank = new BufferBank(ctx, RECIPES);

  // The game's own order: effects and music into a master, a gentle compressor after it.
  const master = ctx.createGain();
  master.gain.value = plan.master ?? 0.5;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 10;
  comp.ratio.value = 3;
  comp.attack.value = 0.004;
  comp.release.value = 0.18;
  master.connect(comp).connect(ctx.destination);
  const sfxLevel = plan.sfx ?? 1;
  const sfx = ctx.createGain();
  sfx.gain.value = sfxLevel;
  sfx.connect(master);
  for (const [at, level] of plan.sfxCues ?? []) sfx.gain.setTargetAtTime(sfxLevel * level, Math.max(0, at - 0.05), 0.06);
  const musicLevel = plan.musicLevel ?? 1;
  const musicBus = ctx.createGain();
  musicBus.gain.value = musicLevel;
  musicBus.connect(master);
  for (const cue of plan.music) if (cue[4] !== undefined) musicBus.gain.setTargetAtTime(musicLevel * cue[4], Math.max(0, cue[0] - 0.05), 0.08);

  // Seeded, so the same film always sounds the same.
  let seed = 0x2f6e2b1;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // ---- one-shots ----
  const last = new Map();
  const variant = new Map();
  let shots = 0;
  const all = rec.shots.concat((plan.extra ?? []).map(([at, name, level]) => [at, name, level, 0, 1, 0, 0, 1]));
  for (const [t, name, level, pan, pitch, jitter, dist, far] of all) {
    if (t < 0 || t >= length) continue;
    const prev = last.get(name);
    if (prev !== undefined && t - prev < 0.015) continue;
    last.set(name, t);
    const buffers = bank.get(name);
    const pick = ((variant.get(name) ?? -1) + 1 + Math.floor(rand() * Math.max(1, buffers.length - 1))) % buffers.length;
    variant.set(name, pick);
    const src = ctx.createBufferSource();
    src.buffer = buffers[pick];
    src.playbackRate.value = Math.max(0.05, pitch * (1 + (rand() * 2 - 1) * jitter));
    const gain = ctx.createGain();
    gain.gain.value = level;
    let tail = src.connect(gain);
    if (dist > 12) {
      // Air soaks up the top end over distance.
      const air = ctx.createBiquadFilter();
      air.type = 'lowpass';
      air.frequency.value = 20000 * Math.exp((-2.2 * dist) / far);
      tail = tail.connect(air);
    }
    if (pan !== 0) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      tail = tail.connect(p);
    }
    tail.connect(sfx);
    src.start(t + (dist > 20 ? Math.min(dist / 343, 0.4) : 0));
    shots++;
  }

  // ---- loops: wind, sea, city, storm, engines ----
  const voices = [];
  rec.loops.forEach((name, i) => {
    const col = 1 + i * 2;
    if (!rec.frames.some((row) => row[col] > 0.002)) return;
    const voice = LOOPS[name].build(ctx, bank);
    const level = ctx.createGain();
    level.gain.setValueAtTime(0, 0);
    voice.out.connect(level).connect(sfx);
    let sentPitch = NaN;
    let prevT = -1;
    for (const row of rec.frames) {
      const t = row[0];
      // Across a cut (a still, a scene that was set up off camera) the level glides instead of jumping.
      if (t - prevT > 0.2) level.gain.setValueAtTime(prevT < 0 ? 0 : level.gain.value, Math.max(0, t - 0.08));
      level.gain.linearRampToValueAtTime(row[col], t);
      if (!(Math.abs(row[col + 1] - sentPitch) < 0.004)) {
        sentPitch = row[col + 1];
        voice.setPitch(sentPitch, t);
      }
      prevT = t;
    }
    level.gain.linearRampToValueAtTime(0, Math.min(length, prevT + 0.4));
    voices.push({ voice, col });
  });

  // ---- music ----
  const music = new Music(ctx, musicBus, bank);
  const cues = plan.music.map((c) => ({ at: c[0], track: c[1], fade: c[2] ?? 1, bar: c[3] ?? 0, done: false }));
  const conduct = (now) => {
    for (const cue of cues) {
      if (cue.done || cue.at > now + 0.001) continue;
      cue.done = true;
      music.play(cue.track, cue.fade);
      // Start a looping track part of the way into its arrangement.
      const deck = music.decks[music.decks.length - 1];
      if (cue.bar && deck && deck.def.steps === undefined) deck.step = cue.bar * 16;
    }
    music.update();
  };
  const levelAt = (col, now) => {
    let v = 0;
    for (const row of rec.frames) {
      if (row[0] > now) break;
      v = row[col];
    }
    return v;
  };
  const step = 0.2;
  for (let k = 1; k * step < length; k++) {
    const at = k * step;
    void ctx.suspend(at).then(() => {
      conduct(at);
      for (const v of voices) v.voice.tick?.(at, levelAt(v.col, at) > 0.01);
      void ctx.resume();
    });
  }
  conduct(0);
  const rendered = await ctx.startRendering();

  // ---- out: fade the very ends, interleave, 16 bit ----
  const L = rendered.getChannelData(0);
  const R = rendered.getChannelData(1);
  const n = L.length;
  const fadeIn = Math.round(sr * 0.05);
  const fadeOut = Math.round(sr * (plan.fadeOut ?? 0.6));
  let peak = 0;
  let sum = 0;
  const pcm = new Int16Array(n * 2);
  for (let i = 0; i < n; i++) {
    const g = Math.min(1, i / fadeIn, (n - 1 - i) / fadeOut);
    const l = L[i] * g;
    const r = R[i] * g;
    peak = Math.max(peak, Math.abs(l), Math.abs(r));
    sum += l * l + r * r;
    pcm[i * 2] = Math.max(-1, Math.min(1, l)) * 32767;
    pcm[i * 2 + 1] = Math.max(-1, Math.min(1, r)) * 32767;
  }
  const bytes = new Uint8Array(pcm.buffer);
  const chunk = 3 * 256 * 1024;
  for (let o = 0; o < bytes.length; o += chunk) {
    let s = '';
    const part = bytes.subarray(o, o + chunk);
    for (let i = 0; i < part.length; i += 0x8000) s += String.fromCharCode.apply(null, part.subarray(i, i + 0x8000));
    await window.__wav(btoa(s));
  }
  return { seconds: n / sr, shots, loops: voices.length, peak: Number(peak.toFixed(3)), rms: Number(Math.sqrt(sum / (n * 2)).toFixed(4)), sampleRate: sr };
}
