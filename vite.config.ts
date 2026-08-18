import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        // xAI's API sends no CORS headers, so a browser fetch to api.x.ai is blocked.
        // Route the Grok Vision fallback through the dev server instead.
        '/xai': {
          target: 'https://api.x.ai',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/xai/, ''),
        },
      },
    },
  };
});
