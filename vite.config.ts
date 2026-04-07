import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/cv-builder/',
  plugins: [
    tailwindcss(),
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
      disable: !process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 510,
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          docx: ['docx'],
          genai: ['@google/genai'],
          mammoth: ['mammoth'],
          sentry: ['@sentry/react'],
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
