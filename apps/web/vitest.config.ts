import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [
    svelte(),
    // picks up $lib from tsconfig, but we also hard-alias below for certainty
    tsconfigPaths(),
  ],
  resolve: {
    conditions: ['browser'],
    dedupe: ['svelte'],
    alias: {
      $lib: path.resolve(__dirname, 'src/lib'),
    },
  },
  test: {
    environment: 'jsdom',
    css: true,
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    include: ['src/lib/**/*.test.ts', 'src/lib/**/__tests__/**/*.{test,spec}.ts'],
  },
});
