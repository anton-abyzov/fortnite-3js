#!/usr/bin/env node
// Friends-room signaling on its own, for a build served by something other than Vite.
// Usage: node tools/signal-server.mjs [--port 8787] [--host 0.0.0.0]
// Clients point at it with ?signal=ws://<host>:<port>/signal (wss:// behind TLS).
import { createServer } from 'node:http';
import { attachSignaling } from './signal-core.mjs';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const port = Number(opt('port', process.env.PORT ?? 8787));
const host = opt('host', '0.0.0.0');

const server = createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('EYEWALL friends signaling. Connect a WebSocket to /signal.\n');
});
attachSignaling(server, { log: (line) => console.log(new Date().toISOString(), line) });
server.listen(port, host, () => console.log(`signaling on ws://${host}:${port}/signal`));
