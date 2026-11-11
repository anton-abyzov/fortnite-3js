import { defineConfig } from 'vite';

// Static bundle with relative asset paths so dist/ can be served from any folder or host.
export default defineConfig({
  base: './',
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
