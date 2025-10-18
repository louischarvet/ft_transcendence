import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://proxy-service',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
  assetsInclude: ['**/*.glb'],
});
