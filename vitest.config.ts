import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    projects: [
      {
        resolve: {
          alias: { '@': path.resolve(__dirname, './src') },
        },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        resolve: {
          alias: { '@': path.resolve(__dirname, './src') },
        },
        test: {
          name: 'component',
          environment: 'happy-dom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['src/test-setup.ts'],
        },
      },
    ],
  },
});
