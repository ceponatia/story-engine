import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Widget from '$lib/features/studio/widgets/StudioTopNav.widget.svelte';

describe('StudioTopNav.widget', () => {
  it('shows studio link', () => {
    const { getByText } = render(Widget);

    expect(getByText('Studio')).toBeTruthy();
  });
});
