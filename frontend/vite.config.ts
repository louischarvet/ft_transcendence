// frontend/vite.config.ts

import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      // tout ce qui commence par /api/* est envoyé à localhost:3000
      '/api': {
        target: 'http://proxy-service:3000',
        changeOrigin: true,
        secure: false,
        //rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});
