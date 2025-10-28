module.exports = function (plop) {
  const base = 'apps/web/src/lib/features';

  // Helpers
  plop.setHelper('featureDir', (name) => `${base}/${plop.getHelper('kebabCase')(name)}`);

  // 1) Feature scaffold: folders + baseline files (no implementation)
  plop.setGenerator('feature', {
    description: 'Create a new feature scaffold (folders, docs, map, style, index barrel) — no code.',
    prompts: [
      { type: 'input', name: 'name', message: 'Feature name (e.g., chat, sessions, characters):', validate: v => v && v.trim().length > 0 || 'Required' },
    ],
    actions: () => {
      const featureRoot = `${base}/{{kebabCase name}}`;
      return [
        // Ensure role folders
        { type: 'add', path: `${featureRoot}/pages/.gitkeep`, template: '' },
        { type: 'add', path: `${featureRoot}/widgets/.gitkeep`, template: '' },
        { type: 'add', path: `${featureRoot}/entities/.gitkeep`, template: '' },
        { type: 'add', path: `${featureRoot}/model/.gitkeep`, template: '' },
        { type: 'add', path: `${featureRoot}/api/.gitkeep`, template: '' },
        { type: 'add', path: `${featureRoot}/styles/.gitkeep`, template: '' },
        { type: 'add', path: `${featureRoot}/tests/.gitkeep`, template: '' },

        // Baseline files
        { type: 'add', path: `${featureRoot}/docs.md`, templateFile: 'tools/plop/templates/feature/docs.md.hbs', skipIfExists: true },
        { type: 'add', path: `${featureRoot}/map.md`, templateFile: 'tools/plop/templates/feature/map.md.hbs', skipIfExists: true },
        { type: 'add', path: `${featureRoot}/index.ts`, templateFile: 'tools/plop/templates/feature/index.ts.hbs', skipIfExists: true },
        { type: 'add', path: `${featureRoot}/styles/_{{kebabCase name}}.css`, templateFile: 'tools/plop/templates/feature/style.css.hbs', skipIfExists: true },

        // Widgets barrel
        { type: 'add', path: `${featureRoot}/widgets/index.ts`, template: '// widgets barrel\n', skipIfExists: true },
      ];
    }
  });

  // 2) Page component
  plop.setGenerator('page', {
    description: 'Create a routed page component (*.page.svelte) within a feature.',
    prompts: [
      { type: 'input', name: 'feature', message: 'Feature (e.g., chat):', validate: v => v && v.trim().length > 0 || 'Required' },
      { type: 'input', name: 'name', message: 'Page name (e.g., ChatSession):', validate: v => v && v.trim().length > 0 || 'Required' },
    ],
    actions: [
      { type: 'add', path: `${base}/{{kebabCase feature}}/pages/{{pascalCase name}}.page.svelte`, templateFile: 'tools/plop/templates/page/page.svelte.hbs' },
    ],
  });

  // 3) Widget component
  plop.setGenerator('widget', {
    description: 'Create a widget component (*.widget.svelte) within a feature and export it from widgets/index.ts.',
    prompts: [
      { type: 'input', name: 'feature', message: 'Feature (e.g., chat):', validate: v => v && v.trim().length > 0 || 'Required' },
      { type: 'input', name: 'name', message: 'Widget name (e.g., InputBar):', validate: v => v && v.trim().length > 0 || 'Required' },
    ],
    actions: [
      { type: 'add', path: `${base}/{{kebabCase feature}}/widgets/{{pascalCase name}}.widget.svelte`, templateFile: 'tools/plop/templates/widget/widget.svelte.hbs' },
      { type: 'append', path: `${base}/{{kebabCase feature}}/widgets/index.ts`, pattern: /$/g, template: "export { default as {{pascalCase name}} } from './{{pascalCase name}}.widget.svelte';\n" },
    ],
  });

  // 4) Entity component (+types)
  plop.setGenerator('entity', {
    description: 'Create an entity component (*.entity.svelte) and a local *.types.ts within a feature.',
    prompts: [
      { type: 'input', name: 'feature', message: 'Feature (e.g., chat):', validate: v => v && v.trim().length > 0 || 'Required' },
      { type: 'input', name: 'name', message: 'Entity name (e.g., Message):', validate: v => v && v.trim().length > 0 || 'Required' },
    ],
    actions: [
      { type: 'add', path: `${base}/{{kebabCase feature}}/entities/{{pascalCase name}}.entity.svelte`, templateFile: 'tools/plop/templates/entity/entity.svelte.hbs' },
      { type: 'add', path: `${base}/{{kebabCase feature}}/entities/{{pascalCase name}}.types.ts`, templateFile: 'tools/plop/templates/entity/entity.types.ts.hbs', skipIfExists: true },
    ],
  });

  // 5) Store module (*.store.ts)
  plop.setGenerator('store', {
    description: 'Create a store module (*.store.ts) within a feature model/.',
    prompts: [
      { type: 'input', name: 'feature', message: 'Feature (e.g., chat):', validate: v => v && v.trim().length > 0 || 'Required' },
      { type: 'input', name: 'name', message: 'Store base name (e.g., chat):', validate: v => v && v.trim().length > 0 || 'Required' },
    ],
    actions: [
      { type: 'add', path: `${base}/{{kebabCase feature}}/model/{{kebabCase name}}.store.ts`, templateFile: 'tools/plop/templates/model/store.ts.hbs' },
    ],
  });

  // 6) Actions module (*.actions.ts) or VerbNoun.action.ts
  plop.setGenerator('action', {
    description: 'Create a user action file within a feature model/ (VerbNoun.action.ts).',
    prompts: [
      { type: 'input', name: 'feature', message: 'Feature (e.g., chat):', validate: v => v && v.trim().length > 0 || 'Required' },
      { type: 'input', name: 'name', message: 'Action name (VerbNoun, e.g., sendTurn):', validate: v => v && v.trim().length > 0 || 'Required' },
    ],
    actions: [
      { type: 'add', path: `${base}/{{kebabCase feature}}/model/{{camelCase name}}.action.ts`, templateFile: 'tools/plop/templates/model/action.ts.hbs' },
    ],
  });

  // 7) API shim (*.api.ts)
  plop.setGenerator('api', {
    description: 'Create or update a feature API client shim (*.api.ts).',
    prompts: [
      { type: 'input', name: 'feature', message: 'Feature (e.g., chat):', validate: v => v && v.trim().length > 0 || 'Required' },
      { type: 'input', name: 'name', message: 'API file base name (usually the feature name):', default: answers => answers.feature },
    ],
    actions: [
      { type: 'add', path: `${base}/{{kebabCase feature}}/api/{{kebabCase name}}.api.ts`, templateFile: 'tools/plop/templates/api/api.ts.hbs', skipIfExists: true },
    ],
  });
};
