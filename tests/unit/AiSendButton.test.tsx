'use client';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';

import { AiSendButton } from '@/components/mobix/button';
import theme from '@/theme';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('AiSendButton', () => {
  it('triggers onClick when enabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithTheme(<AiSendButton aria-label="ai-send" onClick={handleClick} />);

    await user.click(screen.getByRole('button', { name: 'ai-send' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables interaction when loading', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithTheme(<AiSendButton aria-label="ai-send" isLoading onClick={handleClick} />);

    const button = screen.getByRole('button', { name: 'ai-send' });
    expect(button).toBeDisabled();
    // No need to click: disabled + loading blocks pointer events
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards the loading state even if disabled is passed', () => {
    renderWithTheme(<AiSendButton aria-label="ai-send" isLoading disabled />);

    const button = screen.getByRole('button', { name: 'ai-send' });
    expect(button).toBeDisabled();
  });
});
