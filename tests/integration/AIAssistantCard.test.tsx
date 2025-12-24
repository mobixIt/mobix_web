'use client';

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';

import AIAssistantCard from '@/components/AIAssistantCard/AIAssistantCard';
import { aiAssistantDefaults } from '@/components/AIAssistantCard/AIAssistantCard.constants';
import theme from '@/theme';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('AIAssistantCard', () => {
  it('renders header, suggestion and actions', () => {
    const actions = {
      primaryLabel: 'ABRIR REPORTE HISTÓRICO',
      secondaryLabel: 'VER EN ANALYTICS',
      onPrimary: vi.fn(),
      onSecondary: vi.fn(),
      onCloseSuggestion: vi.fn(),
    };

    renderWithTheme(<AIAssistantCard actions={actions} />);

    expect(screen.getByText(aiAssistantDefaults.title)).toBeInTheDocument();
    expect(screen.getByText(aiAssistantDefaults.subtitle)).toBeInTheDocument();
    expect(screen.getByText(actions.primaryLabel)).toBeInTheDocument();
    expect(screen.getByText(actions.secondaryLabel)).toBeInTheDocument();
    expect(screen.getByText(aiAssistantDefaults.suggestionTitle)).toBeInTheDocument();
    expect(screen.getByText(aiAssistantDefaults.suggestionBody)).toBeInTheDocument();
    expect(screen.getByLabelText('send question')).toBeInTheDocument();
  });

  it('fires primary, secondary and close handlers when clicking actions', async () => {
    const user = userEvent.setup();
    const actions = {
      primaryLabel: 'ABRIR REPORTE HISTÓRICO',
      secondaryLabel: 'VER EN ANALYTICS',
      onPrimary: vi.fn(),
      onSecondary: vi.fn(),
      onCloseSuggestion: vi.fn(),
    };

    renderWithTheme(<AIAssistantCard actions={actions} />);

    await user.click(screen.getByText(actions.primaryLabel));
    await user.click(screen.getByText(actions.secondaryLabel));
    await user.click(screen.getByLabelText('close suggestion'));

    expect(actions.onPrimary).toHaveBeenCalledTimes(1);
    expect(actions.onSecondary).toHaveBeenCalledTimes(1);
    expect(actions.onCloseSuggestion).toHaveBeenCalledTimes(1);
  });

  it('sends trimmed question when clicking send', async () => {
    const user = userEvent.setup();
    const handleSendQuestion = vi.fn();

    renderWithTheme(<AIAssistantCard onSendQuestion={handleSendQuestion} />);

    const input = screen.getByPlaceholderText(aiAssistantDefaults.inputPlaceholder);
    await user.type(input, '   consulta de prueba  ');
    await user.click(screen.getByLabelText('send question'));

    expect(handleSendQuestion).toHaveBeenCalledWith('consulta de prueba');
  });

  it('does not send when input is empty', async () => {
    const user = userEvent.setup();
    const handleSendQuestion = vi.fn();

    renderWithTheme(<AIAssistantCard onSendQuestion={handleSendQuestion} />);

    await user.click(screen.getByLabelText('send question'));

    expect(handleSendQuestion).not.toHaveBeenCalled();
  });
});
