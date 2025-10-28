import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // Ignore generated and build output everywhere
  globalIgnores([
    '.config/*',
    '**/.svelte-kit/**',
    '**/dist/**',
    '**/build/**',
    '**/node_modules/**',
    '**/*.min.*',
    '**/*.d.ts',
  ]),
  js.configs.recommended,
  {
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'import/order': [
        'warn',
        { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } },
      ],
      'no-restricted-imports': ['error', { patterns: ['@neuronal/*/*', '@neuronal/*/**'] }],
    },
  },
]);
