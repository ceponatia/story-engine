import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Widget from '$lib/features/studio/widgets/StudioSidebar.widget.svelte';

describe('StudioSidebar.widget', () => {
  it('lists project navigation items', () => {
    const { getByText } = render(Widget);

    expect(getByText('Characters')).toBeTruthy();
  });
});
