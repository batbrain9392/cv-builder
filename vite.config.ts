import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

function stampServiceWorker(): Plugin {
  return {
    name: 'stamp-service-worker',
    writeBundle({ dir }) {
      if (!dir) return;
      const swPath = path.resolve(dir, 'sw.js');
      let sw: string;
      try {
        sw = readFileSync(swPath, 'utf-8');
      } catch {
        return;
      }
      const version = (() => {
        try {
          return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
        } catch {
          return Date.now().toString(36);
        }
      })();
      writeFileSync(swPath, sw.replace('__BUILD_VERSION__', version));
    },
  };
}

export default defineConfig({
  base: '/cv-builder/',
  plugins: [tailwindcss(), react(), stampServiceWorker()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          docx: ['docx'],
          genai: ['@google/genai'],
          mammoth: ['mammoth'],
          vendor: [
            'react',
            'react-dom',
            'react-router',
            'react-hook-form',
            'zod',
            '@base-ui/react',
            'sonner',
            'marked',
          ],
        },
      },
    },
  },
});
