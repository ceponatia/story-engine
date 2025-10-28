// @ts-nocheck
import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import Page from '$lib/features/demo/pages/DemoPage.page.svelte';

test('renders', () => {
  const { container } = render(Page, {});
  expect(container).toBeTruthy();
});
