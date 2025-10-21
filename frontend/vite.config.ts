import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
	https: {
		key: fs.readFileSync(path.join(dirname, 'ssl/proxy.key')),
    	cert: fs.readFileSync(path.join(dirname, 'ssl/proxy.crt'))
	},
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
