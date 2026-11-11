// Fails when a shipped asset has no credit entry, an entry points at a missing file, a licence is not on the
// allow list, or CREDITS.md does not mention an entry. Usage: node tools/check-credits.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'public/assets');
const ALLOWED = new Set(['CC0 1.0', 'MIT', 'Original (AI-generated, project-owned)', 'Original (project-owned)']);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(relative(ASSETS, path).split('\\').join('/'));
  }
  return out;
}

function matches(pattern, file) {
  if (pattern.endsWith('/*')) return file.startsWith(pattern.slice(0, -1));
  return pattern === file;
}

const manifest = JSON.parse(readFileSync(join(ASSETS, 'credits.json'), 'utf8'));
const creditsMd = readFileSync(join(ROOT, 'CREDITS.md'), 'utf8');
const files = walk(ASSETS);
const problems = [];

for (const file of files) {
  if (!manifest.entries.some((e) => e.files.some((p) => matches(p, file)))) problems.push(`no credit entry for public/assets/${file}`);
}
for (const entry of manifest.entries) {
  if (!ALLOWED.has(entry.license)) problems.push(`licence not on the allow list: "${entry.license}" (${entry.title})`);
  for (const p of entry.files) if (!files.some((f) => matches(p, f))) problems.push(`credit entry matches no file: ${p}`);
  if (!creditsMd.includes(entry.title)) problems.push(`CREDITS.md does not mention: ${entry.title}`);
  for (const key of ['title', 'author', 'license', 'source']) if (!entry[key]) problems.push(`entry missing ${key}: ${JSON.stringify(entry.files)}`);
}

const bytes = files.reduce((sum, f) => sum + statSync(join(ASSETS, f)).size, 0);
if (bytes > 40 * 1024 * 1024) problems.push(`public/assets is ${(bytes / 1048576).toFixed(1)} MB, over the 40 MB cap`);

if (problems.length) {
  console.error(`credits check failed:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`credits ok: ${files.length} files, ${manifest.entries.length} entries, ${(bytes / 1048576).toFixed(1)} MB`);
