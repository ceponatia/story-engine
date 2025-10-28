<script lang="ts">
  interface NavLink {
    href: string;
    label: string;
    active?: boolean;
  }

  const links = [
    { href: '/app/dashboard', label: 'Dashboard' },
    { href: '/app/studio', label: 'Studio', active: true },
    { href: '/app/game', label: 'Game' },
    { href: '/app/library', label: 'Library' },
  ] satisfies NavLink[];

  // Narrow unknown each-items inside markup
  function asNavLink(x: unknown): NavLink {
    return x as NavLink;
  }
</script>

<header class="studio-top-nav">
  <div class="studio-top-nav__inner">
    <a class="studio-top-nav__brand" href="/app/dashboard">Story-Engine</a>

    <nav class="studio-top-nav__links" aria-label="Primary">
      {#each links as link}
        <a
          class:active={asNavLink(link).active}
          href={asNavLink(link).href}
          aria-current={asNavLink(link).active ? 'page' : undefined}
        >
          {asNavLink(link).label}
        </a>
      {/each}
    </nav>

    <div class="studio-top-nav__actions">
      <button class="studio-icon-button" type="button" aria-label="Search">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </button>
      <button class="studio-avatar" type="button" aria-label="Open profile">
        <span>AR</span>
      </button>
    </div>
  </div>
</header>

<style>
  .studio-top-nav {
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(6, 10, 18, 0.72);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  }

  .studio-top-nav__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    width: min(1200px, 100%);
    margin: 0 auto;
    padding: 20px 40px;
    box-sizing: border-box;
  }

  .studio-top-nav__brand {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--studio-color-text);
    text-decoration: none;
  }

  .studio-top-nav__links {
    display: flex;
    gap: 26px;
    flex: 1;
  }

  .studio-top-nav__links a {
    position: relative;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--studio-color-text-muted);
    text-decoration: none;
    padding-bottom: 8px;
  }

  .studio-top-nav__links a.active {
    color: var(--studio-color-text);
  }

  .studio-top-nav__links a.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    border-radius: 999px;
    background: var(--studio-color-accent);
  }

  .studio-top-nav__actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .studio-icon-button {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: rgba(15, 23, 42, 0.5);
    color: var(--studio-color-text-muted);
    display: grid;
    place-items: center;
  }

  .studio-icon-button:hover {
    color: var(--studio-color-text);
    border-color: rgba(111, 125, 255, 0.4);
  }

  .studio-icon-button svg {
    width: 18px;
    height: 18px;
  }

  .studio-avatar {
    border: none;
    background: linear-gradient(135deg, #64748b, #1f2937);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-weight: 600;
    color: var(--studio-color-text);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.45);
  }

  @media (max-width: 900px) {
    .studio-top-nav__inner {
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
    }

    .studio-top-nav__links {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
</style>
