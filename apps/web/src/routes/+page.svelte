<script>
  const links = [
    { href: '/app/characters', label: 'Characters' },
    { href: '/app/demo', label: 'Demo' },
    { href: '/app/sample', label: 'Sample' },
    { href: '/app/sessions', label: 'Sessions' },
    { href: '/app/studio', label: 'Studio' },
  ];
</script>

<main>
  <h1>Story‑Engine Web</h1>
  <p>A minimal SvelteKit shell. Pick a feature route to explore:</p>
  <ul>
    {#each links as link}
      <li><a href={link.href}>{link.label}</a></li>
    {/each}
  </ul>
</main>

<style>
  main {
    max-width: 720px;
    margin: 3rem auto;
    padding: 0 1rem;
    font:
      16px/1.5 system-ui,
      sans-serif;
  }
  h1 {
    font-size: 1.75rem;
    margin: 0 0 0.5rem;
  }
  p {
    color: #555;
    margin: 0 0 1.25rem;
  }
  ul {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.5rem;
  }
  a {
    display: block;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    text-decoration: none;
    color: #0366d6;
  }
  a:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
</style>
