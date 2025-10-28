<script lang="ts">
  interface NavItem {
    href: string;
    label: string;
    icon: string;
    active?: boolean;
  }

  interface FooterAction {
    label: string;
    icon: string;
    href: string;
  }

  const navItems: NavItem[] = buildNavItems();
  const footerActions: FooterAction[] = buildFooterActions();

  function buildNavItems(): NavItem[] {
    return [
      {
        href: '/app/studio/characters',
        label: 'Characters',
        icon: 'M12 12a4 4 0 1 0 -0.01 0Zm0 2.5c-3 0-6 1.46-6 3.5v1h12v-1c0-2.04-3-3.5-6-3.5Z',
        active: true,
      },
      {
        href: '/app/studio/locations',
        label: 'Locations',
        icon: 'M12 3a6 6 0 0 0-6 6c0 4 6 11 6 11s6-7 6-11a6 6 0 0 0-6-6Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z',
      },
      {
        href: '/app/studio/items',
        label: 'Items',
        icon: 'M5 7.5 12 4l7 3.5V17l-7 3-7-3V7.5Zm7 8.7 4.5-2.1V9.4L12 11.5 7.5 9.4v4.7Z',
      },
      {
        href: '/app/studio/factions',
        label: 'Factions',
        icon: 'M5 4h3l2 3h3l2 -3h4v16h-4l-2 -3h-3l-2 3H5Z',
      },
      {
        href: '/app/studio/rules',
        label: 'Rules',
        icon: 'M7 4h10v2H7Zm0 4h10v2H7Zm0 4h7v2H7Zm0 4h5v2H7Z',
      },
      {
        href: '/app/studio/prompts',
        label: 'Prompts',
        icon: 'M4 5h16v9H8l-4 4Z',
      },
      {
        href: '/app/studio/assets',
        label: 'Assets',
        icon: 'M5 4h14v4H5Zm0 6h14v10H5Z',
      },
      {
        href: '/app/studio/settings',
        label: 'Settings',
        icon: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0 -7Zm8.5 3.5 2.2 1.27-1 1.73-2.2 -1.27a6.97 6.97 0 0 1 -1.64 0.95l-0.34 2.53h-2l-0.34 -2.53a6.97 6.97 0 0 1 -1.64 -0.95l-2.2 1.27-1 -1.73 2.2 -1.27a6.97 6.97 0 0 1 0 -1.9L5.58 10.5l1 -1.73 2.2 1.27a6.97 6.97 0 0 1 1.64 -0.95l0.34 -2.53h2l0.34 2.53a6.97 6.97 0 0 1 1.64 0.95l2.2 -1.27 1 1.73-2.2 1.27a6.97 6.97 0 0 1 0 1.9Z',
      },
    ];
  }

  function buildFooterActions(): FooterAction[] {
    return [
      { label: 'New', icon: 'M12 5v14m-7 -7h14', href: '/app/studio/new' },
      {
        label: 'Import',
        icon: 'M12 5v9l-3.5 -3.5M12 14l3.5 -3.5M5 19h14',
        href: '/app/studio/import',
      },
      {
        label: 'Export',
        icon: 'M12 19v-9l3.5 3.5M12 10 8.5 13.5M5 5h14',
        href: '/app/studio/export',
      },
      {
        label: 'Undo',
        icon: 'M6.5 9 3 12.5l3.5 3.5M3 12.5h9a5 5 0 1 1 -4.9 6',
        href: '/app/studio/history',
      },
      {
        label: 'Redo',
        icon: 'M17.5 9 21 12.5l-3.5 3.5M21 12.5h-9a5 5 0 1 0 4.9 6',
        href: '/app/studio/history',
      },
    ];
  }

  // Narrow unknown each-items inside markup
  function asNavItem(x: unknown): NavItem {
    return x as NavItem;
  }
  function asFooterAction(x: unknown): FooterAction {
    return x as FooterAction;
  }
</script>

<aside class="studio-sidebar" aria-label="Studio navigation">
  <div class="studio-sidebar__header">
    <p class="studio-sidebar__title">Projects</p>
  </div>

  <nav class="studio-sidebar__nav">
    {#each navItems as item}
      <a class:active={asNavItem(item).active} href={asNavItem(item).href}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={asNavItem(item).icon} />
        </svg>
        <span>{asNavItem(item).label}</span>
      </a>
    {/each}
  </nav>

  <button class="studio-sidebar__primary" type="button">+ New</button>

  <div class="studio-sidebar__footer">
    <span class="studio-sidebar__footer-label">Export</span>
    <div class="studio-sidebar__footer-actions" role="group" aria-label="Studio utilities">
      {#each footerActions as action}
        <a
          class="studio-sidebar__footer-button"
          href={asFooterAction(action).href}
          aria-label={asFooterAction(action).label}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d={asFooterAction(action).icon} />
          </svg>
        </a>
      {/each}
    </div>
  </div>
</aside>

<style>
  .studio-sidebar {
    width: 240px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 28px 24px;
    border-radius: var(--studio-radius-lg);
    background: rgba(11, 17, 32, 0.85);
    border: 1px solid rgba(148, 163, 184, 0.14);
    box-shadow: var(--studio-shadow-soft);
  }

  .studio-sidebar__title {
    margin: 0;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--studio-color-text);
  }

  .studio-sidebar__nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .studio-sidebar__nav a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: var(--studio-radius-sm);
    color: var(--studio-color-text-muted);
    font-size: 0.95rem;
    text-decoration: none;
    transition:
      background 0.2s ease,
      color 0.2s ease;
  }

  .studio-sidebar__nav a:hover {
    background: rgba(111, 125, 255, 0.12);
    color: var(--studio-color-text);
  }

  .studio-sidebar__nav a.active {
    background: rgba(111, 125, 255, 0.18);
    color: var(--studio-color-text);
    box-shadow: inset 0 0 0 1px rgba(111, 125, 255, 0.35);
  }

  .studio-sidebar__nav svg {
    width: 18px;
    height: 18px;
  }

  .studio-sidebar__primary {
    margin-top: 8px;
    padding: 14px 12px;
    border-radius: var(--studio-radius-sm);
    border: none;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 0 18px 38px rgba(99, 102, 241, 0.32);
  }

  .studio-sidebar__footer {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .studio-sidebar__footer-label {
    font-size: 0.85rem;
    color: var(--studio-color-text-muted);
  }

  .studio-sidebar__footer-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .studio-sidebar__footer-button {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(148, 163, 184, 0.2);
    color: var(--studio-color-text-muted);
    background: rgba(15, 23, 42, 0.55);
  }

  .studio-sidebar__footer-button:hover {
    color: var(--studio-color-text);
    border-color: rgba(111, 125, 255, 0.4);
  }

  .studio-sidebar__footer-button svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 1080px) {
    .studio-sidebar {
      width: 100%;
      flex-direction: row;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .studio-sidebar__nav {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    }

    .studio-sidebar__footer {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
