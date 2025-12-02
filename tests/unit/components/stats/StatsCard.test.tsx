// src/components/stats/StatsCard.test.tsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';

import StatsCard, { type StatsCardProps } from '@/components/stats/StatsCard';
import theme from '@/theme';

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('StatsCard', () => {
  const baseProps: StatsCardProps = {
    title: 'Total usuarios',
    value: 248,
    helperText: '12% vs mes anterior',
    'data-testid': 'stats-card',
  };

  it('renders title and value', () => {
    renderWithTheme(<StatsCard {...baseProps} />);

    expect(screen.getByText('Total usuarios')).toBeInTheDocument();
    expect(screen.getByText('248')).toBeInTheDocument();
  });

  it('renders helper text when provided', () => {
    renderWithTheme(<StatsCard {...baseProps} />);

    expect(screen.getByText('12% vs mes anterior')).toBeInTheDocument();
  });

  it('does not render helper section when helperText is not provided', () => {
    renderWithTheme(
      <StatsCard
        title="Total usuarios"
        value={248}
        data-testid="stats-card-no-helper"
      />,
    );

    expect(
      screen.queryByText('12% vs mes anterior'),
    ).not.toBeInTheDocument();
  });

  it('uses default ArrowUpwardIcon when helperIcon is not provided', () => {
    renderWithTheme(<StatsCard {...baseProps} />);

    const defaultIcon = screen.getByTestId('ArrowUpwardIcon');
    expect(defaultIcon).toBeInTheDocument();
  });

  it('uses custom helperIcon when provided', () => {
    const CustomHelperIcon: React.FC = () => (
      <span data-testid="custom-helper-icon">↑</span>
    );

    renderWithTheme(
      <StatsCard
        {...baseProps}
        helperIcon={<CustomHelperIcon />}
      />,
    );

    expect(
      screen.queryByTestId('ArrowUpwardIcon'),
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId('custom-helper-icon'),
    ).toBeInTheDocument();
  });

  it('renders right-side icon when icon prop is provided', () => {
    const RightSideIcon: React.FC = () => (
      <span data-testid="right-side-icon">👤</span>
    );

    renderWithTheme(
      <StatsCard
        {...baseProps}
        icon={<RightSideIcon />}
      />,
    );

    expect(screen.getByTestId('right-side-icon')).toBeInTheDocument();
  });

  it('is not clickable by default when onClick is not provided', () => {
    const onClick = vi.fn();

    renderWithTheme(
      <StatsCard
        {...baseProps}
        onClick={undefined}
        data-testid="non-clickable-card"
      />,
    );

    const card = screen.getByTestId('non-clickable-card');

    expect(card).not.toHaveAttribute('role', 'button');
    expect(card).not.toHaveAttribute('tabindex');

    fireEvent.click(card);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('becomes clickable when onClick is provided', () => {
    const onClick = vi.fn();

    renderWithTheme(
      <StatsCard
        {...baseProps}
        onClick={onClick}
        data-testid="clickable-card"
      />,
    );

    const card = screen.getByTestId('clickable-card');

    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabindex', '0');

    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when pressing Enter or Space', () => {
    const onClick = vi.fn();

    renderWithTheme(
      <StatsCard
        {...baseProps}
        onClick={onClick}
        data-testid="keyboard-card"
      />,
    );

    const card = screen.getByTestId('keyboard-card');

    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not call onClick for other keys', () => {
    const onClick = vi.fn();

    renderWithTheme(
      <StatsCard
        {...baseProps}
        onClick={onClick}
        data-testid="keyboard-card-other"
      />,
    );

    const card = screen.getByTestId('keyboard-card-other');

    fireEvent.keyDown(card, { key: 'Escape' });
    fireEvent.keyDown(card, { key: 'Tab' });

    expect(onClick).not.toHaveBeenCalled();
  });

  it('sets aria-pressed when clickable and isActive is true', () => {
    renderWithTheme(
      <StatsCard
        {...baseProps}
        onClick={vi.fn()}
        isActive
        data-testid="active-card"
      />,
    );

    const card = screen.getByTestId('active-card');

    expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not set aria-pressed when not clickable', () => {
    renderWithTheme(
      <StatsCard
        {...baseProps}
        isActive
        data-testid="non-clickable-active-card"
      />,
    );

    const card = screen.getByTestId('non-clickable-active-card');

    expect(card).not.toHaveAttribute('aria-pressed');
  });
});
