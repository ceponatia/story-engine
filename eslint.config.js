import svelteParser from 'svelte-eslint-parser';

import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vitest from '@vitest/eslint-plugin';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import svelte from 'eslint-plugin-svelte';
import unused from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // ── Global ignores (build, generated, etc.)
  globalIgnores([
    '.config/*',
    '**/.svelte-kit/**',
    '**/dist/**',
    '**/build/**',
    '**/node_modules/**',
    '**/*.min.*',
    '**/*.d.ts',
  ]),

  // Base JS recommendations
  js.configs.recommended,

  // ── TypeScript files (TS parser + resolver, boundaries, import rules)
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        // Disable TS project service to avoid monorepo parse errors for non-tsconfig files
        projectService: false,
        extraFileExtensions: ['.svelte'],
      },
      globals: { process: 'readonly' },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      boundaries,
      'unused-imports': unused,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      // Let eslint-plugin-import resolve TS path aliases (e.g., $lib/*)
      'import/resolver': { typescript: true },

      // Feature-first element groups for boundaries
      'boundaries/elements': [
        { type: 'feature-root', pattern: 'apps/web/src/lib/features/*' },
        { type: 'pages', pattern: 'apps/web/src/lib/features/*/pages/**' },
        { type: 'widgets', pattern: 'apps/web/src/lib/features/*/widgets/**' },
        {
          type: 'entities',
          pattern: 'apps/web/src/lib/features/*/entities/**',
        },
        { type: 'model', pattern: 'apps/web/src/lib/features/*/model/**' },
        { type: 'api', pattern: 'apps/web/src/lib/features/*/api/**' },
        { type: 'styles', pattern: 'apps/web/src/lib/features/*/styles/**' },
        { type: 'tests', pattern: 'apps/web/src/lib/features/*/tests/**' },
      ],
    },
    rules: {
      // Prefer the TS rule
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['off'], // replaced by unused-imports
      'unused-imports/no-unused-imports': 'warn',

      // Import hygiene
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',

      'no-console': 'warn',

      // If you keep this, it's fine; simple-import-sort usually replaces it:
      // 'import/order': [ 'warn', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } } ],

      // Baseline feature layering: keep pages/widgets/entities/model/api clean
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            // Pages can depend on widgets, entities, model, api (plus styles)
            {
              from: 'pages',
              allow: ['widgets', 'entities', 'model', 'api', 'styles'],
            },
            // Widgets can depend on entities and model (plus styles)
            { from: 'widgets', allow: ['entities', 'model', 'styles'] },
            // Entities are leaf/presentational (styles allowed)
            { from: 'entities', allow: ['styles'] },
            // Model (stores/actions) can depend on api and entities (types-only)
            { from: 'model', allow: ['api', 'entities'] },
            // API should not depend back into UI layers
            {
              from: 'api',
              disallow: ['model', 'widgets', 'pages', 'entities'],
            },
          ],
        },
      ],

      // Prefer $lib alias and ban deep cross-feature absolute imports; use feature barrels
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['$lib/features/*/*/**'],
              message:
                'Cross-feature imports must use the feature barrel: $lib/features/<feature> (or widgets/entities barrel).',
            },
          ],
        },
      ],
    },
  },

  // ── Svelte files (.svelte parsing + light Svelte-specific rules)
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser, // make <script lang="ts"> blocks TS-aware
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.svelte'],
        projectService: false,
      },
    },
    plugins: {
      svelte,
      'unused-imports': unused,
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
      boundaries,
    },
    settings: {
      'import/resolver': { typescript: true },
      'boundaries/elements': [
        { type: 'feature-root', pattern: 'apps/web/src/lib/features/*' },
        { type: 'pages', pattern: 'apps/web/src/lib/features/*/pages/**' },
        { type: 'widgets', pattern: 'apps/web/src/lib/features/*/widgets/**' },
        {
          type: 'entities',
          pattern: 'apps/web/src/lib/features/*/entities/**',
        },
        { type: 'model', pattern: 'apps/web/src/lib/features/*/model/**' },
        { type: 'api', pattern: 'apps/web/src/lib/features/*/api/**' },
        { type: 'styles', pattern: 'apps/web/src/lib/features/*/styles/**' },
        { type: 'tests', pattern: 'apps/web/src/lib/features/*/tests/**' },
      ],
    },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',

      // Handy Svelte lint
      'svelte/no-at-html-tags': 'warn',
      // Prefer $lib alias and ban deep cross-feature absolute imports; use feature barrels
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['$lib/features/*/*/**'],
              message:
                'Cross-feature imports must use the feature barrel: $lib/features/<feature> (or widgets/entities barrel).',
            },
          ],
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: 'pages',
              allow: ['widgets', 'entities', 'model', 'api', 'styles'],
            },
            { from: 'widgets', allow: ['entities', 'model', 'styles'] },
            { from: 'entities', allow: ['styles'] },
            { from: 'model', allow: ['api', 'entities'] },
            {
              from: 'api',
              disallow: ['model', 'widgets', 'pages', 'entities'],
            },
          ],
        },
      ],
    },
  },

  // ── Tests (Vitest/Playwright globals, etc.)
  {
    files: ['**/*.{test,spec}.ts', '**/tests/**/*.{ts,js}'],
    plugins: { vitest },
    rules: { ...vitest.configs.recommended.rules },
  },

  // ── App-specific override: prefer $lib alias over deep relatives
  {
    files: ['apps/web/src/**/*.{ts,tsx,svelte}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '../../*', '../../../*', '../../../../*'],
              message: 'Use $lib/... path aliases instead of deep relative imports.',
            },
          ],
        },
      ],
    },
  },
]);
