import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5179,
    strictPort: false,
  },
  preview: {
    port: 4179,
    strictPort: false,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 3500,
  },
  optimizeDeps: {
    exclude: ['@dimforge/rapier3d-compat'],
  },
});
