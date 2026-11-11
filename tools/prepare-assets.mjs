#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const JOBS = [
  { key: 'miami_convertible', jobId: 'c0db5df6-388a-4792-ab1c-6e1b4085dab2' },
  { key: 'miami_jetski', jobId: 'cb36a268-1e89-47af-895e-738870800d41' },
  { key: 'miami_speedboat', jobId: '057149ea-efe7-44cd-931a-d0c89a26bf35' },
  { key: 'coastal_aircraft', jobId: '4732990b-7989-4b5f-b0c3-e8ec0808cfd2' },
];

const outDir = join(process.cwd(), 'public', 'assets', 'models');
mkdirSync(outDir, { recursive: true });

function extractGlbUrl(payload) {
  if (payload && typeof payload.result_url === 'string' && payload.result_url.startsWith('http')) {
    return payload.result_url;
  }
  const text = JSON.stringify(payload);
  const matches = text.match(/https:\/\/[^"\\]+\.glb(?:\?[^"\\]*)?/gi);
  if (matches && matches.length > 0) {
    const pbrMatch = matches.find((u) => /pbr|textured|model/i.test(u));
    return pbrMatch ?? matches[0];
  }
  const anyUrl = text.match(/https:\/\/[^"\\]+/gi) ?? [];
  return anyUrl.find((u) => u.includes('.glb') || u.includes('model')) ?? null;
}

for (const item of JOBS) {
  const targetPath = join(outDir, `${item.key}.glb`);
  if (existsSync(targetPath) && statSync(targetPath).size > 1024) {
    console.log(`[skip] ${item.key}.glb already downloaded (${statSync(targetPath).size} bytes)`);
    continue;
  }

  console.log(`[wait] Waiting for Higgsfield 3D job ${item.key} (${item.jobId})...`);
  execFileSync(
    'higgsfield',
    ['generate', 'wait', item.jobId, '--timeout', '15m', '--interval', '5s'],
    { stdio: 'inherit' },
  );

  const rawJson = execFileSync('higgsfield', ['generate', 'get', item.jobId, '--json'], {
    encoding: 'utf8',
  });
  const parsed = JSON.parse(rawJson);
  const glbUrl = extractGlbUrl(parsed);
  if (!glbUrl) {
    throw new Error(`No .glb URL found in Higgsfield job ${item.jobId}: ${rawJson.slice(0, 500)}`);
  }

  console.log(`[download] Fetching ${item.key}.glb...`);
  const resp = await fetch(glbUrl);
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} downloading ${item.key}`);
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.readUInt32LE(0) !== 0x46546c67) {
    throw new Error(`${item.key}: downloaded payload is not a valid binary GLB`);
  }
  writeFileSync(targetPath, buf);
  console.log(`[done] Saved ${targetPath} (${buf.length} bytes)`);
}
