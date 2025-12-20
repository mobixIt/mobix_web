import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';
import { MobixButtonProgress } from '@/components/mobix/button/MobixButtonProgress';

type MobixButtonMockProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'contained' | 'outlined' | 'text';
  sx?: unknown;
};

vi.mock('@/components/mobix/button/MobixButton', async () => {
  const ReactModule = await import('react');
  const ReactLocal = ReactModule.default;

  const MobixButton = ReactLocal.forwardRef<HTMLButtonElement, MobixButtonMockProps>(
    ({ children, ...props }, ref) => (
      <button ref={ref} type="button" {...props}>
        {children}
      </button>
    ),
  );

  return { MobixButton };
});

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('MobixButtonProgress', () => {
  it('renders children inside the button when isSubmitting is false', () => {
    renderWithTheme(<MobixButtonProgress isSubmitting={false}>Guardar</MobixButtonProgress>);

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('disables the button and preserves the label text in the DOM when isSubmitting is true', () => {
    renderWithTheme(<MobixButtonProgress isSubmitting>Guardar</MobixButtonProgress>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Guardar');
  });

  it('applies no-border class to the button when isSubmitting is true', () => {
    renderWithTheme(<MobixButtonProgress isSubmitting>Guardar</MobixButtonProgress>);

    expect(screen.getByRole('button')).toHaveClass('no-border');
  });

  it('keeps consumer-provided disabled true even when isSubmitting is false', () => {
    renderWithTheme(
      <MobixButtonProgress isSubmitting={false} disabled>
        Guardar
      </MobixButtonProgress>,
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('prevents onClick from firing when isSubmitting is true', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    renderWithTheme(
      <MobixButtonProgress isSubmitting onClick={onClick}>
        Guardar
      </MobixButtonProgress>,
    );

    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a progressbar overlay when isSubmitting is true and variant is contained', () => {
    renderWithTheme(
      <MobixButtonProgress isSubmitting variant="contained">
        Guardar
      </MobixButtonProgress>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a progressbar overlay when isSubmitting is true and variant is outlined', () => {
    renderWithTheme(
      <MobixButtonProgress isSubmitting variant="outlined">
        Guardar
      </MobixButtonProgress>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a progressbar overlay when isSubmitting is true and variant is text', () => {
    renderWithTheme(
      <MobixButtonProgress isSubmitting variant="text">
        Guardar
      </MobixButtonProgress>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('Guardar');
  });

  it('forwards button type prop to MobixButton', () => {
    renderWithTheme(
      <MobixButtonProgress type="submit" isSubmitting={false}>
        Guardar
      </MobixButtonProgress>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
