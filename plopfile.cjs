module.exports = function (plop) {
  const fs = require('fs');
  const path = require('path');
  const { execSync } = require('child_process');

  const base = 'apps/web/src/lib/features';

  // Explicit case helpers
  plop.setHelper('pascal', (s) => plop.getHelper('properCase')(s));
  plop.setHelper('camel', (s) => plop.getHelper('camelCase')(s));
  plop.setHelper('kebab', (s) => plop.getHelper('dashCase')(s));

  // Back-compat helper used elsewhere in this file
  plop.setHelper('featureDir', (name) => `${base}/${plop.getHelper('kebabCase')(name)}`);

  // Utilities
  function appendUnique(file, line) {
    if (!fs.existsSync(file)) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, '', 'utf8');
    }
    const content = fs.readFileSync(file, 'utf8');
    const escaped = line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('^' + escaped + '$', 'm');
    if (!re.test(content)) {
      fs.appendFileSync(
        file,
        (content && !content.endsWith('\n') ? '\n' : '') + line + '\n',
        'utf8',
      );
    }
  }

  // Simple shell action type to run formatting as a post-step
  plop.setActionType('shell', async (answers, cfg) => {
    const cmd = typeof cfg.command === 'function' ? cfg.command(answers) : cfg.command;
    if (!cmd) return 'no command';
    try {
      execSync(cmd, { stdio: 'inherit' });
      return `ran: ${cmd}`;
    } catch {
      // keep scaffolding successful even if formatting fails
      return `failed (ignored): ${cmd}`;
    }
  });

  // Generic custom action to run imperative steps via cfg.execute(answers)
  plop.setActionType('custom', async (answers, cfg) => {
    if (typeof cfg.execute !== 'function') return 'no-op';
    const res = await cfg.execute(answers);
    return typeof res === 'string' ? res : 'ok';
  });

  // 1) Feature scaffold: folders + baseline files (no implementation)
  plop.setGenerator('feature', {
    description:
      'Create a new feature scaffold (folders, docs, map, style, index barrel) — no code.',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Feature name (e.g., chat, sessions, characters):',
        validate: (v) => (v && v.trim().length > 0) || 'Required',
      },
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
        {
          type: 'add',
          path: `${featureRoot}/docs.md`,
          templateFile: 'tools/plop/templates/feature/docs.md.hbs',
          skipIfExists: true,
        },
        {
          type: 'add',
          path: `${featureRoot}/map.md`,
          templateFile: 'tools/plop/templates/feature/map.md.hbs',
          skipIfExists: true,
        },
        {
          type: 'add',
          path: `${featureRoot}/index.ts`,
          templateFile: 'tools/plop/templates/feature/index.ts.hbs',
          skipIfExists: true,
        },
        {
          type: 'add',
          path: `${featureRoot}/styles/_{{kebabCase name}}.css`,
          templateFile: 'tools/plop/templates/feature/style.css.hbs',
          skipIfExists: true,
        },

        // Widgets barrel
        {
          type: 'add',
          path: `${featureRoot}/widgets/index.ts`,
          template: '// widgets barrel\n',
          skipIfExists: true,
        },
        // Entities barrel
        {
          type: 'add',
          path: `${featureRoot}/entities/index.ts`,
          template: '// entities barrel\n',
          skipIfExists: true,
        },
        // Format
        {
          type: 'shell',
          command: ({ name }) =>
            `pnpm prettier --write "apps/web/src/lib/features/${plop.getHelper('dashCase')(name)}"`,
        },
      ];
    },
  });

  // 2) Page component
  plop.setGenerator('page', {
    description: 'Create a routed page component (*.page.svelte) within a feature.',
    prompts: [
      {
        type: 'input',
        name: 'feature',
        message: 'Feature (required):',
        validate: (v) => !!v,
      },
      {
        type: 'input',
        name: 'name',
        message: 'Page Name (PascalCase):',
        validate: (v) => /^[A-Z][A-Za-z0-9]*$/.test(v) || 'Use PascalCase (e.g., CharacterList)',
      },
      {
        type: 'confirm',
        name: 'createRoute',
        message: 'Create route re-export stub?',
        default: false,
      },
      {
        type: 'input',
        name: 'routePath',
        message: 'Route subpath (optional, e.g., [id] or items/[id]):',
        default: '',
      },
    ],
    actions: (answers) => {
      const kebabFeature = plop.getHelper('dashCase')(answers.feature);
      const pascalName = plop.getHelper('properCase')(answers.name);
      const actions = [];
      actions.push({
        type: 'add',
        path: `${base}/${kebabFeature}/pages/${pascalName}.page.svelte`,
        templateFile: 'tools/plop/templates/page/page.svelte.hbs',
        skipIfExists: true,
      });
      // tiny smoke test
      actions.push({
        type: 'add',
        path: `${base}/${kebabFeature}/tests/pages/${pascalName}.page.test.ts`,
        templateFile: 'tools/plop/templates/page/page.test.ts.hbs',
        skipIfExists: true,
      });
      // docs/map bullets
      actions.push({
        type: 'custom',
        description: 'Update docs.md and map.md',
        async execute() {
          const docs = `${base}/${kebabFeature}/docs.md`;
          const map = `${base}/${kebabFeature}/map.md`;
          fs.mkdirSync(path.dirname(docs), { recursive: true });
          if (!fs.existsSync(docs))
            fs.writeFileSync(
              docs,
              `# ${plop.getHelper('properCase')(answers.feature)} feature\n\n`,
              'utf8',
            );
          if (!fs.existsSync(map))
            fs.writeFileSync(
              map,
              `# Correlation map: ${kebabFeature}\n\n| UI file | Calls | Backend |\n| --- | --- | --- |\n`,
              'utf8',
            );
          appendUnique(docs, `- Page: ${pascalName}.page.svelte`);
          appendUnique(map, `| pages/${pascalName}.page.svelte | | |`);
        },
      });
      // optional route stub
      actions.push({
        type: 'custom',
        description: 'Create optional route re-export',
        async execute() {
          if (!answers.createRoute) return;
          const sub = (answers.routePath || '').replace(/^\/+|\/+$/g, ''); // trim slashes
          const dir = sub
            ? `apps/web/src/routes/app/${kebabFeature}/${sub}`
            : `apps/web/src/routes/app/${kebabFeature}`;
          const routePath = `${dir}/+page.svelte`;
          const target = `$lib/features/${kebabFeature}/pages/${pascalName}.page.svelte`;
          const exportLine = `<script>export { default as component } from '${target}';</script>`;
          if (fs.existsSync(routePath)) {
            const content = fs.readFileSync(routePath, 'utf8');
            if (!content.includes(exportLine)) {
              fs.writeFileSync(routePath, exportLine + '\n', 'utf8');
            }
          } else {
            fs.mkdirSync(path.dirname(routePath), { recursive: true });
            fs.writeFileSync(routePath, exportLine + '\n', 'utf8');
          }
        },
      });
      // format
      actions.push({
        type: 'shell',
        command: () => `pnpm prettier --write "apps/web/src/lib/features/${kebabFeature}"`,
      });
      if (answers.createRoute) {
        actions.push({
          type: 'shell',
          command: () => {
            const sub = (answers.routePath || '').replace(/^\/+|\/+$/g, '');
            const dir = sub
              ? `apps/web/src/routes/app/${kebabFeature}/${sub}`
              : `apps/web/src/routes/app/${kebabFeature}`;
            return `pnpm prettier --write "${dir}/+page.svelte"`;
          },
        });
      }
      return actions;
    },
  });

  // 3) Widget component
  plop.setGenerator('widget', {
    description:
      'Create a widget component (*.widget.svelte) within a feature and export it from widgets/index.ts.',
    prompts: [
      {
        type: 'input',
        name: 'feature',
        message: 'Feature (required):',
        validate: (v) => !!v,
      },
      {
        type: 'input',
        name: 'name',
        message: 'Widget Name (PascalCase):',
        validate: (v) => /^[A-Z][A-Za-z0-9]*$/.test(v) || 'Use PascalCase (e.g., InputBar)',
      },
    ],
    actions: (answers) => {
      const kebabFeature = plop.getHelper('dashCase')(answers.feature);
      const pascalName = plop.getHelper('properCase')(answers.name);
      const actions = [];
      actions.push({
        type: 'add',
        path: `${base}/${kebabFeature}/widgets/${pascalName}.widget.svelte`,
        templateFile: 'tools/plop/templates/widget/widget.svelte.hbs',
        skipIfExists: true,
      });
      actions.push({
        type: 'custom',
        description: 'Append export to widgets barrel (idempotent)',
        async execute() {
          const file = `${base}/${kebabFeature}/widgets/index.ts`;
          const line = `export { default as ${pascalName} } from './${pascalName}.widget.svelte';`;
          appendUnique(file, line);
        },
      });
      // tiny smoke test
      actions.push({
        type: 'add',
        path: `${base}/${kebabFeature}/widgets/__tests__/${pascalName}.widget.test.ts`,
        templateFile: 'tools/plop/templates/widget/widget.test.ts.hbs',
        skipIfExists: true,
      });
      // docs/map bullets
      actions.push({
        type: 'custom',
        description: 'Update docs.md and map.md',
        async execute() {
          const docs = `${base}/${kebabFeature}/docs.md`;
          const map = `${base}/${kebabFeature}/map.md`;
          fs.mkdirSync(path.dirname(docs), { recursive: true });
          if (!fs.existsSync(docs))
            fs.writeFileSync(
              docs,
              `# ${plop.getHelper('properCase')(answers.feature)} feature\n\n`,
              'utf8',
            );
          if (!fs.existsSync(map))
            fs.writeFileSync(
              map,
              `# Correlation map: ${kebabFeature}\n\n| UI file | Calls | Backend |\n| --- | --- | --- |\n`,
              'utf8',
            );
          appendUnique(docs, `- Widget: ${pascalName}.widget.svelte`);
          appendUnique(map, `| widgets/${pascalName}.widget.svelte | | |`);
        },
      });
      // format
      actions.push({
        type: 'shell',
        command: () => `pnpm prettier --write "apps/web/src/lib/features/${kebabFeature}"`,
      });
      return actions;
    },
  });

  // 4) Entity component (+types)
  plop.setGenerator('entity', {
    description:
      'Create an entity component (*.entity.svelte) and a local *.types.ts within a feature.',
    prompts: [
      {
        type: 'input',
        name: 'feature',
        message: 'Feature (required):',
        validate: (v) => !!v,
      },
      {
        type: 'input',
        name: 'name',
        message: 'Entity Name (PascalCase):',
        validate: (v) => /^[A-Z][A-Za-z0-9]*$/.test(v) || 'Use PascalCase (e.g., Message)',
      },
    ],
    actions: (answers) => {
      const kebabFeature = plop.getHelper('dashCase')(answers.feature);
      const pascalName = plop.getHelper('properCase')(answers.name);
      const actions = [];
      actions.push({
        type: 'add',
        path: `${base}/${kebabFeature}/entities/${pascalName}.entity.svelte`,
        templateFile: 'tools/plop/templates/entity/entity.svelte.hbs',
        skipIfExists: true,
      });
      actions.push({
        type: 'add',
        path: `${base}/${kebabFeature}/entities/${pascalName}.types.ts`,
        templateFile: 'tools/plop/templates/entity/entity.types.ts.hbs',
        skipIfExists: true,
      });
      actions.push({
        type: 'custom',
        description: 'Append export(s) to entities barrel (idempotent)',
        async execute() {
          const file = `${base}/${kebabFeature}/entities/index.ts`;
          appendUnique(
            file,
            `export { default as ${pascalName} } from './${pascalName}.entity.svelte';`,
          );
          appendUnique(file, `export * from './${pascalName}.types';`);
        },
      });
      // tiny smoke test
      actions.push({
        type: 'add',
        path: `${base}/${kebabFeature}/entities/__tests__/${pascalName}.entity.test.ts`,
        templateFile: 'tools/plop/templates/entity/entity.test.ts.hbs',
        skipIfExists: true,
      });
      // docs/map bullets
      actions.push({
        type: 'custom',
        description: 'Update docs.md and map.md',
        async execute() {
          const docs = `${base}/${kebabFeature}/docs.md`;
          const map = `${base}/${kebabFeature}/map.md`;
          fs.mkdirSync(path.dirname(docs), { recursive: true });
          if (!fs.existsSync(docs))
            fs.writeFileSync(
              docs,
              `# ${plop.getHelper('properCase')(answers.feature)} feature\n\n`,
              'utf8',
            );
          if (!fs.existsSync(map))
            fs.writeFileSync(
              map,
              `# Correlation map: ${kebabFeature}\n\n| UI file | Calls | Backend |\n| --- | --- | --- |\n`,
              'utf8',
            );
          appendUnique(docs, `- Entity: ${pascalName}.entity.svelte`);
          appendUnique(map, `| entities/${pascalName}.entity.svelte | | |`);
        },
      });
      // format
      actions.push({
        type: 'shell',
        command: () => `pnpm prettier --write "apps/web/src/lib/features/${kebabFeature}"`,
      });
      return actions;
    },
  });

  // 5) Store module (*.store.ts)
  plop.setGenerator('store', {
    description: 'Create a store module (*.store.ts) within a feature model/.',
    prompts: [
      {
        type: 'input',
        name: 'feature',
        message: 'Feature (required):',
        validate: (v) => !!v,
      },
      {
        type: 'input',
        name: 'name',
        message: 'Store base name (kebab-case):',
        validate: (v) => /^[a-z][a-z0-9-]*$/.test(v) || 'Use kebab-case (e.g., chat)',
      },
    ],
    actions: (answers) => {
      const kebabFeature = plop.getHelper('dashCase')(answers.feature);
      const kebabName = plop.getHelper('dashCase')(answers.name);
      const actions = [];
      actions.push({
        type: 'add',
        path: `${base}/${kebabFeature}/model/${kebabName}.store.ts`,
        templateFile: 'tools/plop/templates/model/store.ts.hbs',
      });
      actions.push({
        type: 'shell',
        command: () => `pnpm prettier --write "apps/web/src/lib/features/${kebabFeature}"`,
      });
      return actions;
    },
  });

  // 6) Actions module (*.actions.ts) or VerbNoun.action.ts
  plop.setGenerator('action', {
    description: 'Create a user action file within a feature model/ (VerbNoun.action.ts).',
    prompts: [
      {
        type: 'input',
        name: 'feature',
        message: 'Feature (required):',
        validate: (v) => !!v,
      },
      {
        type: 'input',
        name: 'name',
        message: 'Action name (camelCase VerbNoun):',
        validate: (v) => /^[a-z][A-Za-z0-9]*$/.test(v) || 'Use camelCase (e.g., sendTurn)',
      },
    ],
    actions: (answers) => {
      const kebabFeature = plop.getHelper('dashCase')(answers.feature);
      const camelName = plop.getHelper('camelCase')(answers.name);
      const actions = [];
      actions.push({
        type: 'add',
        path: `${base}/${kebabFeature}/model/${camelName}.action.ts`,
        templateFile: 'tools/plop/templates/model/action.ts.hbs',
      });
      actions.push({
        type: 'shell',
        command: () => `pnpm prettier --write "apps/web/src/lib/features/${kebabFeature}"`,
      });
      return actions;
    },
  });

  // 7) API shim (*.api.ts)
  plop.setGenerator('api', {
    description: 'Create or update a feature API client shim (*.api.ts).',
    prompts: [
      {
        type: 'input',
        name: 'feature',
        message: 'Feature (required):',
        validate: (v) => !!v,
      },
      {
        type: 'input',
        name: 'name',
        message: 'API file base name (kebab-case):',
        default: (answers) => answers.feature,
        validate: (v) => /^[a-z][a-z0-9-]*$/.test(v) || 'Use kebab-case (e.g., chat)',
      },
    ],
    actions: (answers) => {
      const kebabFeature = plop.getHelper('dashCase')(answers.feature);
      const kebabName = plop.getHelper('dashCase')(answers.name);
      const actions = [];
      actions.push({
        type: 'add',
        path: `${base}/${kebabFeature}/api/${kebabName}.api.ts`,
        templateFile: 'tools/plop/templates/api/api.ts.hbs',
        skipIfExists: true,
      });
      actions.push({
        type: 'shell',
        command: () => `pnpm prettier --write "apps/web/src/lib/features/${kebabFeature}"`,
      });
      return actions;
    },
  });
};
