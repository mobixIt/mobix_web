import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import MobixButtonProgress from '@/components/mobix/button/MobixButtonProgress';

test('renders children and no progress overlay when isSubmitting is false', async ({ mount }) => {
  const component = await mount(<MobixButtonProgress isSubmitting={false}>Guardar</MobixButtonProgress>);

  await expect(component.getByRole('button', { name: 'Guardar' })).toBeVisible();
  await expect(component.locator('.MuiCircularProgress-root')).toHaveCount(0);
});

test('disables the button and shows progress when isSubmitting is true', async ({ mount }) => {
  const component = await mount(<MobixButtonProgress isSubmitting>Guardar</MobixButtonProgress>);

  const button = component.getByRole('button');
  await expect(button).toBeDisabled();
  await expect(component.locator('.MuiCircularProgress-root')).toHaveCount(1);
});
