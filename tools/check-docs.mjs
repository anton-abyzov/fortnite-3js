#!/usr/bin/env node
// Checks that the written multiplayer evaluation answers what AC-14 asks:
// is it worth building, the architecture, the netcode options, the hosting cost, and a recommendation.
import { readFileSync } from 'node:fs';

const file = 'docs/multiplayer-evaluation.md';
let text;
try {
  text = readFileSync(file, 'utf8');
} catch {
  console.error(`check-docs: ${file} is missing`);
  process.exit(1);
}

/** Split into sections by second-level heading. */
const sections = new Map();
let name = '';
for (const line of text.split('\n')) {
  const m = /^## +(.+?)\s*$/.exec(line);
  if (m) {
    name = m[1].toLowerCase();
    sections.set(name, '');
  } else if (name) {
    sections.set(name, sections.get(name) + line + '\n');
  }
}

const problems = [];
const words = (s) => s.split(/\s+/).filter(Boolean).length;

/** A section must exist, say something, and mention what it is there to answer. */
function need(title, minWords, patterns) {
  const body = sections.get(title);
  if (body === undefined) {
    problems.push(`no "## ${title}" section`);
    return;
  }
  if (words(body) < minWords) problems.push(`"${title}" is too thin: ${words(body)} words, expected at least ${minWords}`);
  for (const [what, re] of patterns) if (!re.test(body)) problems.push(`"${title}" does not ${what}`);
}

need('recommendation', 80, [
  ['give a yes or no', /^\s*(yes|no)\b/i],
  ['name the server model', /authoritative/i],
  ['put a number on the cost', /[€$]\s?\d/],
  ['put a number on the effort', /\d+\s*(to\s*\d+\s*)?weeks/i],
]);
need('is it worth it', 150, [['answer the question', /\b(yes|no)\b/i]]);
need('architecture', 250, [
  ['compare peer-to-peer with a dedicated server', /peer-to-peer[\s\S]*dedicated server|dedicated server[\s\S]*peer-to-peer/i],
  ['say where physics runs', /physics/i],
]);
need('netcode options', 150, [
  ['cover client prediction', /predict/i],
  ['cover snapshots or interpolation', /snapshot|interpolat/i],
  ['cover lockstep or rollback', /lockstep|rollback/i],
  ['cover the transport', /websocket|webtransport|webrtc/i],
]);
need('hosting cost', 150, [
  ['give prices', /[€$]\s?\d/],
  ['give them per month', /month/i],
  ['say how many players a server holds', /players|rooms|matches/i],
]);

if (!/https?:\/\/\S+/.test(text)) problems.push('no sources are linked');
if (/\bTODO\b|\bTBD\b|lorem ipsum/i.test(text)) problems.push('unfinished text (TODO, TBD or filler)');

if (problems.length) {
  console.error(`check-docs: ${file} fails:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`check-docs: ${file} ok (${words(text)} words, ${sections.size} sections: ${[...sections.keys()].join(', ')})`);
