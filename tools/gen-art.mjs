// Generates the original AI artwork in public/assets/img: the title key art, eight billboards, six murals and
// six shop posters. Every brand name in the prompts is fictional and made up for EYEWALL: Marazul Bay.
//
// Provider: the Higgsfield API (https://docs.higgsfield.ai). Credentials come from the environment only and are
// never printed:  HF_API_KEY_ID  and  HF_API_KEY_SECRET.
//
// Usage: node tools/gen-art.mjs                       generate everything, convert, write art.json
//        node tools/gen-art.mjs --only <slug>[,<slug>]  regenerate some images (a slug or a group name)
//        node tools/gen-art.mjs --convert-only         rebuild the WebP files from the newest downloads
//        node tools/gen-art.mjs --list                 print the catalogue
// Options: --out <dir> (default public/assets/img), --from <download dir> (with --convert-only and one slug),
//          --quality <low|medium|high|xhigh|max> (override for this run), --concurrency <n> (default 4), --dry-run.
//
// Each download lands in its own new directory under .temp/art/dl/<slug>/ and is only ever decoded as an image.
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DL = join(ROOT, '.temp/art/dl');
const API = 'https://api.higgsfield.ai';
const USER_AGENT = 'art-pipeline/1.0';
const MAX_DOWNLOAD_BYTES = 60 * 1024 * 1024;
const POLL_TIMEOUT_MS = 12 * 60 * 1000;

/** Higgsfield model endpoints. `body` maps a prompt, an aspect ratio and a quality tier to the documented request body. */
const MODELS = {
  flare: {
    label: 'Marketing Studio Image 2.5 Flare',
    endpoint: 'marketing-studio/image/flare',
    ratios: { '16:9': '16:9', '3:2': '3:2', '2:3': '2:3' },
    qualities: ['low', 'medium', 'high', 'xhigh', 'max'],
    body: (prompt, ratio, quality) => ({ prompt, aspect_ratio: ratio, resolution: '2k', quality, enhance_prompt: false }),
  },
};

/** Output shape per group. Billboards are drawn 16:9 (the model has no 2:1) and centre-cropped to 2:1. */
const GROUPS = {
  title: { ratio: '16:9', width: 1920, height: 1080, quality: 84, maxBytes: 450 * 1024 },
  billboards: { ratio: '16:9', width: 1024, height: 512, quality: 82 },
  murals: { ratio: '3:2', width: 1152, height: 768, quality: 82 },
  posters: { ratio: '2:3', width: 512, height: 768, quality: 80 },
};

const ORIGINAL =
  'Original artwork for a fictional brand in a fictional city. Do not imitate any real brand, logo, trademark, mascot, ' +
  'existing game, film, character, celebrity or named artist. No watermark, no signature.';

function billboard(headline, tagline, art, palette, lettering) {
  return [
    `Retro-tropical advertising billboard artwork: "${headline}".`,
    'Flat vector-like illustration, bold flat colour, mid-century screen-print feel, thick clean shapes, very light paper grain.',
    `Artwork: ${art}`,
    `Palette: ${palette}.`,
    `The only text in the image is exactly these two lines, spelled exactly as written: the headline "${headline}" and the tagline "${tagline}".`,
    `Lettering: ${lettering}; the headline is huge and readable from far away, the tagline is smaller but still large and crisp.`,
    'No other words, letters, numbers, fine print, labels, logos or badges with text anywhere in the image.',
    'Wide landscape layout for a 2:1 billboard: keep every letter and all key artwork inside the central band and leave a generous plain strip of background colour, about one tenth of the height, along the top edge and along the bottom edge.',
    'The image is the flat poster artwork itself filling the whole frame edge to edge: no billboard structure, no frame, no mock-up, no wall, no perspective.',
    ORIGINAL,
  ].join(' ');
}

function mural(art, palette) {
  return [
    'Street-art mural artwork, seen perfectly flat and frontal.',
    `Subject: ${art}`,
    `Palette: ${palette}.`,
    'Bold spray-paint and brush mural style, crisp graphic shapes, confident outlines, subtle paint texture with a faint stucco grain showing through.',
    'The painted artwork itself fills the entire frame edge to edge: no wall edges, no border, no frame, no street, no pavement, no surrounding sky, no perspective, no people.',
    'Absolutely no text, letters, numbers, graffiti tags, signatures or watermarks.',
    ORIGINAL,
  ].join(' ');
}

function poster(lines, art, palette, lettering) {
  const quoted = lines.map((l) => `"${l}"`).join(' and ');
  return [
    `Small retail shop-window poster, portrait format: ${quoted}.`,
    'Flat bold retro-tropical print style, chunky shapes, thick outlines, a few flat colours, very light paper grain.',
    `Artwork: ${art}`,
    `Palette: ${palette}.`,
    `The only text in the image is exactly ${quoted}, spelled exactly as written. Lettering: ${lettering}, large, bold and highly legible.`,
    'No other words, letters, numbers, prices, fine print, labels, logos or badges with text anywhere in the image.',
    'The image is the flat poster artwork itself filling the whole frame edge to edge: no frame, no wall, no tape, no mock-up, no perspective.',
    ORIGINAL,
  ].join(' ');
}

const ITEMS = [
  {
    slug: 'title',
    group: 'title',
    name: 'Title key art',
    file: 'title.webp',
    prompt: [
      'Wide cinematic key art for an original video game, 16:9, with no text at all.',
      'Golden hour over the waterfront of a fictional tropical coastal city: rows of pastel art-deco buildings in mint, coral, pink and butter yellow, with rounded corners, porthole windows, vertical fins and stepped rooflines, lining a turquoise canal.',
      'In the foreground a low arched bridge crosses the canal, flanked by tall coconut palms.',
      'Neon signs are just switching on along the facades. They are plain glowing tube shapes only (arcs, stripes, circles, arrows, a wave line, a bird outline), completely free of letters, numbers and glyphs.',
      'A small cream-and-teal seaplane with twin floats banks overhead in the upper right.',
      'On the horizon stands a vast curved hurricane wall of towering dark storm cloud wrapping around the city, and directly above the city the storm opens into a clear, perfectly circular eye of calm golden-pink sky.',
      'Stylised painterly 3D look: clean simplified shapes, soft bevelled forms, saturated teal, coral, pink and sun-yellow palette, long warm light, soft haze, glassy reflections on the water.',
      'Composition: the left third of the frame is calmer and darker (shadowed palms and one deep-teal building mass with very little detail) so interface text can sit on it; the bridge, the canal and the brightest light sit in the centre and right.',
      'No people in the foreground. Absolutely no text, letters, numbers, logos, interface elements, signature or watermark anywhere.',
      ORIGINAL,
    ].join(' '),
  },

  {
    slug: 'cascabel-cola',
    group: 'billboards',
    name: 'Cascabel Cola',
    prompt: billboard(
      'CASCABEL COLA',
      'Shake the heat.',
      'an ice-cold glass bottle of dark cola tilted at an angle, beaded with condensation, its label a plain blank diamond shape with no writing, ice cubes tumbling around it and a splash of fizz; a band of repeating rattlesnake-tail rattle segments (a geometric chevron and bead pattern) runs across the design; sunburst rays behind the bottle.',
      'deep teal background, coral orange, sun yellow and cream; no red-and-white scheme',
      'a chunky geometric sans-serif in cream with a coral drop shadow, not a script',
    ),
  },
  {
    slug: 'marazul-air',
    group: 'billboards',
    name: 'Marazul Air',
    prompt: billboard(
      'MARAZUL AIR',
      'Fly the bay.',
      'a cream and teal seaplane with twin floats and a single propeller flying across the picture above small green islands ringed with white sand in a turquoise bay; a big stylised sun and layered flat clouds; the aircraft carries no lettering or numbers.',
      'teal, turquoise, cream, coral and sun yellow',
      'an elegant wide art-deco sans-serif in cream and deep teal',
    ),
  },
  {
    slug: 'sol-987',
    group: 'billboards',
    name: 'Sol 98.7 FM',
    prompt: billboard(
      'SOL 98.7 FM',
      'All night. All neon.',
      'a big stylised half sun on the horizon sending out concentric sound-wave rings and a row of equaliser bars, palm tree silhouettes on both sides, a dusk sky in flat bands of colour, glowing neon-tube outlines.',
      'magenta, violet, hot orange, sun yellow and midnight blue',
      'bold rounded neon-sign style capitals in glowing yellow and pink',
    ),
  },
  {
    slug: 'pelican-surf',
    group: 'billboards',
    name: 'Pelican Surf Co.',
    prompt: billboard(
      'PELICAN SURF CO.',
      'Wax on. Worries off.',
      'a geometric stylised pelican built from simple arcs and triangles, unmistakably a pelican: stocky body, short legs, webbed feet and a very long bill with a big rounded throat pouch hanging beneath it; it stands proudly with a striped surfboard tucked under one wing; simple rolling wave shapes and a sun disc behind it; the surfboard carries stripes only, no writing.',
      'coral, cream, deep navy-teal and mustard yellow',
      'a friendly heavy slab-serif in navy-teal and cream',
    ),
  },
  {
    slug: 'hotel-flamingo',
    group: 'billboards',
    name: 'Hotel Flamingo Heights',
    prompt: billboard(
      'HOTEL FLAMINGO HEIGHTS',
      'Rooms above the storm.',
      'a tall symmetrical art-deco hotel facade with a stepped central tower, vertical fins, rounded balconies and warmly lit windows, rising above a low band of dark storm cloud into a clear sky; beside it a simple flamingo emblem inside a round medallion; the building carries no signage or lettering.',
      'flamingo pink, mint, cream and deep plum',
      'a tall condensed art-deco display face in cream and flamingo pink',
    ),
  },
  {
    slug: 'tidewater-cold-brew',
    group: 'billboards',
    name: 'Tidewater Cold Brew',
    prompt: billboard(
      'TIDEWATER COLD BREW',
      'Slow drip. Fast mornings.',
      'a tall glass of iced coffee with chunky ice cubes and a swirl of cream, drops falling slowly into it from above, and one stylised curling wave rising behind the glass; a rising sun disc; the glass is plain with no writing.',
      'deep coffee brown, cream, turquoise and coral',
      'a sturdy rounded sans-serif in cream and turquoise',
    ),
  },
  {
    slug: 'garza-marina',
    group: 'billboards',
    name: 'Garza Marina',
    prompt: billboard(
      'GARZA MARINA',
      'Boats. Jet skis. Trouble.',
      'an elegant standing heron emblem inside a round rope-edged badge on one side, and a speedboat cutting a big white V-shaped wake across teal water on the other, with a small jet ski in the distance and a string of plain pennant flags; the boat and the badge carry no writing or numbers.',
      'navy, teal, white and coral red',
      'a bold nautical sans-serif in white with a coral tagline',
    ),
  },
  {
    slug: 'storm-watch',
    group: 'billboards',
    name: 'Eyewall Storm Watch',
    prompt: billboard(
      'EYEWALL STORM WATCH',
      'Channel 5 knows where the eye is.',
      'a friendly local weather-television promotion: a large round radar screen showing a pink and teal hurricane spiral with a clear eye, concentric range rings and a sweeping radar beam; around it a few simple rounded weather icons (sun, cloud, raindrop, lightning bolt); no channel emblem, no station logo.',
      'navy, teal, hot pink, sun yellow and white',
      'a bold friendly rounded sans-serif in white and sun yellow',
    ),
  },

  {
    slug: 'flamingos',
    group: 'murals',
    name: 'Flamingos',
    prompt: mural(
      'a flock of flamingos in geometric art-deco style, the birds built from arcs, fans and chevrons and overlapping in a rhythm across the whole picture, with sunburst rays and stepped deco motifs between them.',
      'flamingo pink, coral, mint, teal and cream with a few gold accents',
    ),
  },
  {
    slug: 'big-wave',
    group: 'murals',
    name: 'Big Wave',
    prompt: mural(
      'one huge curling turquoise wave at sunset with a hollow barrel and stylised fingers of foam, a glowing sun low behind it and the sky in graphic bands of colour.',
      'turquoise, deep teal, white foam, coral, magenta and sun yellow',
    ),
  },
  {
    slug: 'pelican',
    group: 'murals',
    name: 'Pelican',
    prompt: mural(
      'a bold close-up portrait of a pelican in three-quarter profile with a large pouched bill and a calm, confident eye, surrounded by big tropical leaves (monstera, banana, palm fronds) and a few hibiscus flowers.',
      'teal, leaf green, coral, mustard and cream',
    ),
  },
  {
    slug: 'fruit',
    group: 'murals',
    name: 'Tropical Fruit',
    prompt: mural(
      'a dense all-over pattern of tropical fruit: halved papayas with black seeds, whole and sliced mangoes, and slices of orange, lime and pink grapefruit, with leaves filling the gaps.',
      'papaya orange, mango yellow, lime green and grapefruit pink on a deep teal ground',
    ),
  },
  {
    slug: 'eye',
    group: 'murals',
    name: 'The Eye',
    prompt: mural(
      'an abstract hurricane seen from space: sweeping spiral cloud bands in pink and teal turning around a small calm circular eye at the centre, graphic and rhythmic, with fine speckles like stars in the corners.',
      'hot pink, teal, turquoise, cream and navy',
    ),
  },
  {
    slug: 'manatee',
    group: 'murals',
    name: 'Manatee',
    prompt: mural(
      'an underwater scene with a gentle manatee and its calf drifting above seagrass, shafts of sunlight slanting down from the surface, small fish, bubbles and soft coral shapes.',
      'aquamarine, teal, soft green and sandy cream with touches of coral',
    ),
  },

  {
    slug: 'mango-smoothie',
    group: 'posters',
    name: 'Mango Smoothie',
    prompt: poster(
      ['MANGO SMOOTHIE', '$4'],
      'a tall smoothie cup with a striped straw and a mango slice on the rim, halved mangoes and leaves around it, and a big starburst holding the price "$4"; the cup is plain with no writing.',
      'mango yellow, orange, leaf green and cream on a turquoise ground',
      'a chunky rounded sans-serif in cream and orange',
    ),
  },
  {
    slug: 'sunscreen',
    group: 'posters',
    name: 'Sol-Block SPF 50',
    prompt: poster(
      ['SOL-BLOCK SPF 50'],
      'a plain sunscreen bottle with a flip cap showing only a simple sun icon and no writing, under a big geometric sun with plain rays and no face, with a striped beach umbrella and a strip of sand and sea.',
      'sun yellow, coral, white and turquoise',
      'a clean bold geometric sans-serif in white and coral, set on two lines as "SOL-BLOCK" over "SPF 50"',
    ),
  },
  {
    slug: 'arcade-night',
    group: 'posters',
    name: 'Arcade Night',
    prompt: poster(
      ['ARCADE NIGHT', 'Every Friday'],
      'a generic upright arcade cabinet of original design with a joystick and round buttons, its screen showing only abstract geometric shapes, surrounded by neon stars, zigzags and confetti; no existing game characters and no writing on the cabinet.',
      'midnight purple, hot pink, electric cyan and sun yellow',
      'glowing neon-tube capitals for the headline and a simple rounded sans-serif for the second line',
    ),
  },
  {
    slug: 'fresh-ceviche',
    group: 'posters',
    name: 'Fresh Ceviche',
    prompt: poster(
      ['FRESH CEVICHE'],
      'a bowl of ceviche seen from a slight angle with chunks of white fish, red onion rings, cilantro leaves and a chilli, with lime halves and wedges around it and a simple fish silhouette above.',
      'lime green, coral, cream and deep sea blue',
      'a bold condensed sans-serif in cream on two lines, "FRESH" over "CEVICHE"',
    ),
  },
  {
    slug: 'board-rental',
    group: 'posters',
    name: 'Board Rental',
    prompt: poster(
      ['BOARD RENTAL', 'By the hour'],
      'three surfboards standing upright in the sand side by side, each with a different pattern of stripes and no writing, with a sun disc and a simple wave behind them.',
      'coral, teal, mustard and cream',
      'a heavy friendly slab-serif in cream for the headline and a simple sans-serif for the second line',
    ),
  },
  {
    slug: 'ammo-sale',
    group: 'posters',
    name: 'Range Day Sale',
    prompt: poster(
      ['RANGE DAY SALE', 'Stock up'],
      'a playful sporting-goods shop poster: a round paper bullseye target with coloured rings, a pair of ear defenders, safety glasses and a stack of plain cardboard boxes, with a blank starburst shape behind them; friendly and cartoonish, with no firearms shown and no writing on any object.',
      'safety orange, forest green, cream and navy',
      'a bold athletic block sans-serif in cream and orange',
    ),
  },
];

for (const item of ITEMS) item.file ??= `${item.group}/${item.slug}.webp`;

function parseArgs(argv) {
  const args = { only: [], out: join(ROOT, 'public/assets/img'), concurrency: 4 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only') args.only.push(...String(argv[++i] ?? '').split(',').filter(Boolean));
    else if (a === '--out') args.out = resolve(argv[++i]);
    else if (a === '--from') args.from = resolve(argv[++i]);
    else if (a === '--quality') args.quality = argv[++i];
    else if (a === '--concurrency') args.concurrency = Math.max(1, Number(argv[++i]) || 1);
    else if (a === '--convert-only') args.convertOnly = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--list') args.list = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  return args;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function credentials() {
  const id = process.env.HF_API_KEY_ID;
  const secret = process.env.HF_API_KEY_SECRET;
  if (!id || !secret) throw new Error('set HF_API_KEY_ID and HF_API_KEY_SECRET in the environment (they are never read from a file)');
  return `Key ${id.trim()}:${secret.trim()}`;
}

/** Call the Higgsfield API. The auth header only ever goes to API, never to a URL taken from a response. */
async function api(method, path, auth, body, extraHeaders = {}) {
  const res = await fetch(`${API}/${path}`, {
    method,
    headers: { Authorization: auth, 'Content-Type': 'application/json', 'User-Agent': USER_AGENT, ...extraHeaders },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60_000),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Left as null: the caller reports the status code.
  }
  return { status: res.status, json, retryAfter: Number(res.headers.get('retry-after')) || 0, text: text.slice(0, 300) };
}

async function submit(model, prompt, ratio, quality, auth) {
  const idempotencyKey = randomUUID();
  if (!model.qualities.includes(quality)) throw new Error(`unknown quality: ${quality}`);
  const body = model.body(prompt, model.ratios[ratio], quality);
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await api('POST', model.endpoint, auth, body, { 'Idempotency-Key': idempotencyKey });
    } catch (err) {
      if (attempt >= 5) throw err;
      await sleep(2000 * attempt);
      continue;
    }
    if (res.status === 200 || res.status === 201 || res.status === 202) {
      const id = res.json?.request_id;
      if (!/^[0-9a-f-]{36}$/i.test(id ?? '')) throw new Error(`submit returned no request id (HTTP ${res.status})`);
      return { requestId: id, body };
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      await sleep(Math.max(res.retryAfter * 1000, 3000 * attempt));
      continue;
    }
    throw new Error(`submit failed: HTTP ${res.status} ${res.text}`);
  }
}

async function waitFor(requestId, auth) {
  const started = Date.now();
  let delay = 2000;
  let failures = 0;
  while (Date.now() - started < POLL_TIMEOUT_MS) {
    await sleep(delay + Math.random() * 500);
    delay = Math.min(delay * 1.5, 10_000);
    let res;
    try {
      res = await api('GET', `requests/${requestId}/status`, auth);
    } catch (err) {
      if (++failures > 8) throw err;
      continue;
    }
    if (res.status >= 500) {
      if (++failures > 8) throw new Error(`status check failed: HTTP ${res.status}`);
      continue;
    }
    if (res.status !== 200) throw new Error(`status check failed: HTTP ${res.status} ${res.text}`);
    const status = res.json?.status;
    if (status === 'completed') return res.json;
    if (status === 'failed' || status === 'nsfw' || status === 'canceled') {
      throw new Error(`request ${requestId} ended as ${status}${res.json?.error ? `: ${res.json.error}` : ''}`);
    }
  }
  throw new Error(`request ${requestId} did not finish in ${POLL_TIMEOUT_MS / 60000} minutes`);
}

/** Download the result into a new empty directory and check that it decodes as an image. */
async function download(url, slug) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') throw new Error('result URL is not https');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '');
  mkdirSync(join(DL, slug), { recursive: true });
  const dir = join(DL, slug, `${stamp}-${randomBytes(4).toString('hex')}`);
  mkdirSync(dir); // Throws when it already exists, so a batch never shares a directory.
  const res = await fetch(parsed, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
  const data = Buffer.from(await res.arrayBuffer());
  if (data.length === 0 || data.length > MAX_DOWNLOAD_BYTES) throw new Error(`download has an unexpected size: ${data.length} bytes`);
  const meta = await sharp(data, { limitInputPixels: 80_000_000 }).metadata();
  if (!['png', 'jpeg', 'webp'].includes(meta.format)) throw new Error(`download is not a PNG, JPEG or WebP image: ${meta.format}`);
  const raw = join(dir, 'raw.bin');
  writeFileSync(raw, data);
  return { dir, raw, format: meta.format, width: meta.width, height: meta.height, bytes: data.length, host: parsed.host };
}

function newestDownload(slug) {
  const base = join(DL, slug);
  if (!existsSync(base)) return null;
  const dirs = readdirSync(base)
    .filter((d) => existsSync(join(base, d, 'raw.bin')))
    .sort();
  return dirs.length ? join(base, dirs[dirs.length - 1]) : null;
}

/**
 * Cover-crop to the target size, encode WebP without metadata, and step the quality down to fit a byte budget.
 * `item.crop` picks which part survives the crop: 0 keeps the top or left edge, 0.5 the centre, 1 the bottom or right.
 */
async function convert(item, rawPath, outDir) {
  const spec = GROUPS[item.group];
  const outPath = join(outDir, item.file);
  mkdirSync(dirname(outPath), { recursive: true });
  const source = sharp(readFileSync(rawPath), { limitInputPixels: 80_000_000 }).rotate();
  const meta = await source.metadata();
  const scale = Math.max(spec.width / meta.width, spec.height / meta.height);
  const width = Math.max(spec.width, Math.round(meta.width * scale));
  const height = Math.max(spec.height, Math.round(meta.height * scale));
  const bias = item.crop ?? 0.5;
  const region = { left: Math.round((width - spec.width) * bias), top: Math.round((height - spec.height) * bias), width: spec.width, height: spec.height };
  const pixels = await source.resize(width, height, { fit: 'fill', kernel: 'lanczos3' }).extract(region).png().toBuffer();
  let quality = spec.quality;
  let data;
  for (;;) {
    data = await sharp(pixels).webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
    if (!spec.maxBytes || data.length <= spec.maxBytes || quality <= 60) break;
    quality -= 2;
  }
  writeFileSync(outPath, data);
  return { outPath, bytes: data.length, quality };
}

function writeManifest(outDir) {
  const present = (item) => existsSync(join(outDir, item.file));
  const list = (group) =>
    ITEMS.filter((i) => i.group === group && present(i)).map((i) => ({
      file: i.file,
      name: i.name,
      width: GROUPS[group].width,
      height: GROUPS[group].height,
    }));
  const manifest = { title: 'title.webp', billboards: list('billboards'), murals: list('murals'), posters: list('posters') };
  writeFileSync(join(outDir, 'art.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

async function produce(item, args, auth) {
  const model = MODELS[item.model ?? 'flare'];
  const quality = args.quality ?? item.quality ?? 'max';
  const spec = GROUPS[item.group];
  let rawDir;
  if (args.convertOnly) {
    rawDir = args.from ?? newestDownload(item.slug);
    if (!rawDir) throw new Error('nothing downloaded yet');
  } else {
    const started = Date.now();
    const { requestId, body } = await submit(model, item.prompt, spec.ratio, quality, auth);
    const result = await waitFor(requestId, auth);
    const url = result.images?.[0]?.url;
    if (!url) throw new Error(`request ${requestId} completed without an image`);
    const got = await download(url, item.slug);
    rawDir = got.dir;
    const { prompt: _prompt, ...params } = body;
    const record = {
      slug: item.slug,
      provider: 'Higgsfield API',
      model: model.label,
      endpoint: model.endpoint,
      params,
      requestId,
      promptSha256: createHash('sha256').update(item.prompt).digest('hex'),
      source: { host: got.host, format: got.format, width: got.width, height: got.height, bytes: got.bytes },
      seconds: Math.round((Date.now() - started) / 1000),
      createdAt: new Date().toISOString(),
    };
    writeFileSync(join(rawDir, 'meta.json'), `${JSON.stringify(record, null, 2)}\n`);
    console.log(`${item.slug}: ${model.label} (${quality}), ${got.width}x${got.height} ${got.format}, ${record.seconds}s, request ${requestId}`);
  }
  const out = await convert(item, join(rawDir, 'raw.bin'), args.out);
  console.log(`${item.slug}: wrote ${item.file} ${spec.width}x${spec.height} q${out.quality} ${(out.bytes / 1024).toFixed(0)} KB`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const wanted = args.only.length ? ITEMS.filter((i) => args.only.includes(i.slug) || args.only.includes(i.group)) : ITEMS;
  const unknown = args.only.filter((s) => !ITEMS.some((i) => i.slug === s || i.group === s));
  if (unknown.length) throw new Error(`unknown slug or group: ${unknown.join(', ')}`);
  if (args.from && (!args.convertOnly || wanted.length !== 1)) throw new Error('--from needs --convert-only and exactly one slug');

  if (args.list || args.dryRun) {
    for (const item of wanted) {
      const spec = GROUPS[item.group];
      console.log(`${item.slug}  ->  ${item.file}  (${spec.ratio} drawn, ${spec.width}x${spec.height} q${spec.quality})`);
      if (args.dryRun) console.log(`  ${item.prompt}\n`);
    }
    return;
  }

  const auth = args.convertOnly ? null : credentials();
  const queue = [...wanted];
  const failed = [];
  const worker = async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      try {
        await produce(item, args, auth);
      } catch (err) {
        failed.push(item.slug);
        console.error(`${item.slug}: ${err.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(args.concurrency, wanted.length) }, worker));

  const manifest = writeManifest(args.out);
  const count = manifest.billboards.length + manifest.murals.length + manifest.posters.length + (existsSync(join(args.out, 'title.webp')) ? 1 : 0);
  const bytes = ITEMS.filter((i) => existsSync(join(args.out, i.file))).reduce((sum, i) => sum + statSync(join(args.out, i.file)).size, 0);
  console.log(`art.json lists ${count} of ${ITEMS.length} images, ${(bytes / 1048576).toFixed(2)} MB`);
  if (failed.length) {
    console.error(`failed: ${failed.join(', ')}`);
    process.exit(1);
  }
}

await main();
