import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-content-directory',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/content/')) {
            const relativePath = req.url.replace(/^\/content\//, '');
            const filePath = path.resolve(__dirname, 'content', relativePath);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              res.setHeader('Content-Type', 'application/json');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }
          next();
        });
      },
      closeBundle() {
        // Copy content/ to dist/content/ on build
        const srcDir = path.resolve(__dirname, 'content');
        const destDir = path.resolve(__dirname, 'dist', 'content');
        if (fs.existsSync(srcDir)) {
          fs.mkdirSync(destDir, { recursive: true });
          const files = fs.readdirSync(srcDir);
          for (const file of files) {
            const srcFile = path.join(srcDir, file);
            if (fs.statSync(srcFile).isFile()) {
              fs.copyFileSync(srcFile, path.join(destDir, file));
            }
          }
        }
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
    },
  },
  // public/ is Vite's default publicDir; declaring it explicitly ensures
  // that public/content/*.json is always served as /content/*.json in both
  // `vite dev` and after `vite build` without any extra middleware.
  publicDir: 'public',
});
