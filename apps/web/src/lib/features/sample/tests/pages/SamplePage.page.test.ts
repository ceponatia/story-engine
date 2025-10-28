// @ts-nocheck
import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import Page from '$lib/features/sample/pages/SamplePage.page.svelte';

test('renders', () => {
  const { container } = render(Page, {});
  expect(container).toBeTruthy();
});
