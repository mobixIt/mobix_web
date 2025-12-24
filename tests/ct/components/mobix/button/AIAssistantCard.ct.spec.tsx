import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';

import AIAssistantCard from '@/components/AIAssistantCard/AIAssistantCard';
import { aiAssistantDefaults } from '@/components/AIAssistantCard/AIAssistantCard.constants';
import theme from '@/theme';

test('renders header, suggestion and tip', async ({ mount }) => {
  const component = await mount(
    <ThemeProvider theme={theme}>
      <AIAssistantCard />
    </ThemeProvider>,
  );

  await expect(component.getByText(aiAssistantDefaults.title)).toBeVisible();
  await expect(component.getByText(aiAssistantDefaults.subtitle)).toBeVisible();
  await expect(component.getByText(aiAssistantDefaults.suggestionTitle)).toBeVisible();
  await expect(component.getByText(aiAssistantDefaults.tipText)).toBeVisible();
});

test('triggers actions and send question', async ({ mount }) => {
  const calls = {
    primary: 0,
    secondary: 0,
    close: 0,
    send: 0,
    lastQuestion: '',
  };

  const component = await mount(
    <ThemeProvider theme={theme}>
      <AIAssistantCard
        actions={{
          primaryLabel: aiAssistantDefaults.primaryActionLabel,
          secondaryLabel: aiAssistantDefaults.secondaryActionLabel,
          onPrimary: () => calls.primary++,
          onSecondary: () => calls.secondary++,
          onCloseSuggestion: () => calls.close++,
        }}
        onSendQuestion={(question) => {
          calls.send++;
          calls.lastQuestion = question;
        }}
      />
    </ThemeProvider>,
  );

  await component.getByText(aiAssistantDefaults.primaryActionLabel).click();
  await component.getByText(aiAssistantDefaults.secondaryActionLabel).click();
  await component.getByLabel('close suggestion').click();

  const input = component.getByPlaceholder(aiAssistantDefaults.inputPlaceholder);
  await input.fill('Estado de la flota hoy');
  await component.getByLabel('send question').click();

  expect(calls.primary).toBe(1);
  expect(calls.secondary).toBe(1);
  expect(calls.close).toBe(1);
  expect(calls.send).toBe(1);
  expect(calls.lastQuestion).toBe('Estado de la flota hoy');
});
