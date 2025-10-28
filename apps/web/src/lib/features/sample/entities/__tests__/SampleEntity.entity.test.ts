// @ts-nocheck
import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import Cmp from '$lib/features/sample/entities/SampleEntity.entity.svelte';

test('renders', () => {
  const { container } = render(Cmp, {});
  expect(container).toBeTruthy();
});
