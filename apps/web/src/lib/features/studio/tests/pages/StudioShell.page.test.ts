import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Page from '$lib/features/studio/pages/StudioShell.page.svelte';

describe('StudioShell.page', () => {
  it('renders overview content', () => {
    const { getByText } = render(Page);

    expect(getByText('Attributes')).toBeTruthy();
    expect(getByText('Publish')).toBeTruthy();
  });
});
