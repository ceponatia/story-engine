<script lang="ts">
  import '$lib/features/studio/styles/_studio.css';

  import { StudioSidebar, StudioTopNav } from '$lib/features/studio';

  interface Attribute {
    label: string;
    value: number;
  }

  interface IconAction {
    label: string;
    icon: string;
  }

  const tabs = ['Overview', 'Stats', 'Traits', 'Inventory', 'Notes'] as const;

  const attributes: Attribute[] = createAttributes();
  const inventory: string[] = createInventory();
  const traits: string[] = createTraits();
  const propertiesActions: IconAction[] = createPropertiesActions();
  const footerActions: IconAction[] = createFooterActions();

  function createAttributes(): Attribute[] {
    return [
      { label: 'Strength', value: 14 },
      { label: 'Dexterity', value: 18 },
      { label: 'Intelligence', value: 12 },
    ];
  }

  function createInventory(): string[] {
    return ['Sneaky', 'Quick Reflexes', 'Keen Eyesight'];
  }

  function createTraits(): string[] {
    return ['Sneaky', 'Quick Reflexes'];
  }

  function createPropertiesActions(): IconAction[] {
    return [
      {
        label: 'Generate Backstory',
        icon: 'M12 3 14.1 7.6 19.3 8 15.4 11.3 16.6 16.2 12 13.6 7.4 16.2 8.6 11.3 4.7 8 9.9 7.6Z',
      },
      { label: 'Balance Stats', icon: 'M5 15l4 -6 3 4 4 -7 3 5' },
      {
        label: 'Validate Canon',
        icon: 'M12 5a7 7 0 1 1 0 14 7 7 0 0 1 0 -14ZM10 12l1.8 1.8L15 10.6',
      },
    ];
  }

  function createFooterActions(): IconAction[] {
    return [
      { label: '+ New', icon: 'M12 5v14m-7 -7h14' },
      { label: 'Import', icon: 'M12 5v9l-3.5 -3.5M12 14l3.5 -3.5M5 19h14' },
      { label: 'Export', icon: 'M12 19v-9l3.5 3.5M12 10 8.5 13.5M5 5h14' },
      { label: 'Undo', icon: 'M6.5 9 3 12.5l3.5 3.5M3 12.5h9a5 5 0 1 1 -4.9 6' },
      { label: 'Redo', icon: 'M17.5 9 21 12.5l-3.5 3.5M21 12.5h-9a5 5 0 1 0 4.9 6' },
    ];
  }

  // Narrow unknown each-items inside markup
  function asAttribute(x: unknown): Attribute {
    return x as Attribute;
  }
  function asIconAction(x: unknown): IconAction {
    return x as IconAction;
  }
</script>

<div class="studio-shell">
  <StudioTopNav />

  <div class="studio-shell__body">
    <StudioSidebar />

    <main class="studio-shell__main" aria-label="Studio detail">
      <nav class="studio-breadcrumbs" aria-label="Breadcrumb">
        <span>Studio</span>
        <span>/</span>
        <span>Characters</span>
        <span>/</span>
        <strong>Aric</strong>
      </nav>

      <div class="studio-tabs" role="tablist" aria-label="Character views">
        {#each tabs as tab}
          <span
            class="studio-tab"
            class:is-active={tab === 'Overview'}
            role="tab"
            aria-selected={tab === 'Overview'}
            tabindex={tab === 'Overview' ? 0 : -1}
          >
            {tab}
          </span>
        {/each}
      </div>

      <div class="studio-content">
        <section class="studio-content-primary" aria-label="Overview panels">
          <article class="studio-card" aria-labelledby="attr-heading">
            <h3 id="attr-heading">Attributes</h3>
            <dl>
              {#each attributes as attribute}
                <dt>{asAttribute(attribute).label}</dt>
                <dd>{asAttribute(attribute).value}</dd>
              {/each}
            </dl>
          </article>

          <article class="studio-card" aria-labelledby="inventory-heading">
            <h3 id="inventory-heading">Inventory</h3>
            <ul class="studio-list">
              {#each inventory as item}
                <li>{item}</li>
              {/each}
            </ul>
            <button class="studio-inline-button" type="button">+ Save</button>
          </article>

          <article class="studio-card" aria-labelledby="traits-heading">
            <h3 id="traits-heading">Traits</h3>
            <ul class="studio-list">
              {#each traits as trait}
                <li>{trait}</li>
              {/each}
            </ul>
          </article>

          <article class="studio-card studio-card--cta" aria-label="Publish call to action">
            <p class="studio-microcopy">Ready to share the latest revision?</p>
            <button class="studio-primary-button" type="button">Publish</button>
          </article>
        </section>

        <aside class="studio-content-secondary" aria-label="Properties and actions">
          <article class="studio-card" aria-labelledby="properties-heading">
            <h3 id="properties-heading">Properties</h3>
            <a class="studio-properties__link" href="/app/studio/properties">
              <div>
                <p class="studio-microcopy">Linked to</p>
                <p class="studio-properties__link-title">Campaign —</p>
                <p class="studio-properties__link-subtitle">Sneaks in Black Hollow</p>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </a>

            <hr class="studio-divider" />

            <div class="studio-properties__actions">
              {#each propertiesActions as action}
                <button type="button">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d={asIconAction(action).icon} />
                  </svg>
                  <span>{asIconAction(action).label}</span>
                </button>
              {/each}
            </div>
          </article>
        </aside>
      </div>

      <div class="studio-footer-actions">
        {#each footerActions as action}
          <button type="button">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d={asIconAction(action).icon} />
            </svg>
            <span>{asIconAction(action).label}</span>
          </button>
        {/each}
      </div>
    </main>
  </div>
</div>
