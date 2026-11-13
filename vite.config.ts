import { defineConfig } from 'vite';
// @ts-expect-error plain JavaScript module shared with tools/signal-server.mjs
import { attachSignaling } from './tools/signal-core.mjs';

// Static bundle with relative asset paths so dist/ can be served from any folder or host.
// Link previews need absolute addresses: EYEWALL_SITE is where the build will be served from, with
// its closing slash. Without it the tags stay relative, which is fine for a local copy.
const site = process.env.EYEWALL_SITE || './';

export default defineConfig({
  base: './',
  plugins: [
    { name: 'eyewall-site', transformIndexHtml: (html) => html.replaceAll('%EYEWALL_SITE%', site) },
    // Friends rooms: WebRTC signaling on /signal of the dev and preview servers. Free, local, no account.
    {
      name: 'eyewall-signal',
      configureServer: (server) => {
        if (server.httpServer) attachSignaling(server.httpServer);
      },
      configurePreviewServer: (server) => {
        if (server.httpServer) attachSignaling(server.httpServer);
      },
    },
  ],
  // A second checkout sharing this node_modules (an agent's worktree) keeps its own dependency cache.
  cacheDir: process.env.EYEWALL_VITE_CACHE || 'node_modules/.vite',
  // EYEWALL_NO_HMR=1: a page never reloads by itself when a file changes. Scripted checks need that
  // when someone else is editing the same checkout.
  server: { port: 5183, strictPort: true, host: '127.0.0.1', hmr: process.env.EYEWALL_NO_HMR ? false : undefined },
  preview: { port: 4183, strictPort: true, host: '127.0.0.1' },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 4000,
    sourcemap: false,
  },
});
