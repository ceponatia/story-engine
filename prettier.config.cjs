module.exports = {
  semi: true,
  singleQuote: true,
  printWidth: 100,
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-svelte'],
  // Ensure plugins resolve from repo root in a monorepo/workspaces setup
  pluginSearchDirs: ['.'],
  importOrder: ['^svelte', '^@?\\w', '^\\$lib/(.*)$', '^[./]'],
  importOrderSeparation: true,
  overrides: [
    {
      files: '*.svelte',
      options: { parser: 'svelte' },
    },
  ],
};
