import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [
    svelte({
      compilerOptions: { runes: true },
      hot: false,
    }),
  ],
  resolve: {
    conditions: ['browser'],
    dedupe: ['svelte'],
    alias: {
      $lib: path.resolve(__dirname, 'src/lib'),
      $routes: path.resolve(__dirname, 'src/routes'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/lib/test/setup.ts'],
    css: true,
    server: {
      deps: {
        inline: [/svelte/],
      },
    },
    include: ['src/lib/**/*.test.ts', 'src/lib/**/__tests__/**/*.{test,spec}.ts'],
  },
});
