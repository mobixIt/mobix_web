import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock MobixButton to inspect props like startIcon / endIcon
vi.mock('@/components/mobix/button', () => {
  interface MockMobixButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
  }

  const MobixButton = ({
    children,
    startIcon,
    endIcon,
    ...props
  }: MockMobixButtonProps) => (
    <button
      data-testid="mobix-button"
      data-has-start-icon={Boolean(startIcon)}
      data-has-end-icon={Boolean(endIcon)}
      {...props}
    >
      {children}
    </button>
  );

  return { MobixButton };
});

import PageHeaderSection, {
  PageHeaderSectionProps,
} from '@/components/layout/page-header/PageHeaderSection';

const renderComponent = (props: Partial<PageHeaderSectionProps> = {}) => {
  const defaultProps: PageHeaderSectionProps = {
    title: 'Usuarios',
    subtitle: undefined,
    actionLabel: undefined,
    onActionClick: undefined,
    actionDisabled: false,
    showActionButton: true,
    actionIcon: undefined,
    actionIconPosition: 'left',
  };

  return render(<PageHeaderSection {...defaultProps} {...props} />);
};

describe('PageHeaderSection', () => {
  it('renders the main title and default subtitle', () => {
    renderComponent({ title: 'Usuarios' });

    expect(
      screen.getByRole('heading', { name: 'Usuarios' }),
    ).toBeInTheDocument();

    // default subtitle
    expect(
      screen.getByText('Gestiona y administra los recursos del sistema'),
    ).toBeInTheDocument();

    // default button label
    expect(screen.getByRole('button', { name: 'Crear nuevo' })).toBeInTheDocument();
  });

  it('renders a custom subtitle and custom action label', () => {
    renderComponent({
      title: 'Vehículos',
      subtitle: 'Gestiona la flota de buses',
      actionLabel: 'Registrar vehículo',
    });

    expect(
      screen.getByRole('heading', { name: 'Vehículos' }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Gestiona la flota de buses'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Registrar vehículo' }),
    ).toBeInTheDocument();
  });

  it('does not render the action button when showActionButton is false', () => {
    renderComponent({
      title: 'Dashboard',
      showActionButton: false,
    });

    // No button with the default label should be present
    expect(
      screen.queryByRole('button', { name: /crear nuevo/i }),
    ).not.toBeInTheDocument();
  });

  it('calls onActionClick when the button is clicked', () => {
    const handleClick = vi.fn();

    renderComponent({
      title: 'Usuarios',
      onActionClick: handleClick,
    });

    const button = screen.getByRole('button', { name: 'Crear nuevo' });

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables the action button when actionDisabled is true', () => {
    renderComponent({
      title: 'Usuarios',
      actionDisabled: true,
    });

    const button = screen.getByTestId('mobix-button');

    expect(button).toBeDisabled();
  });

  it('uses a start icon by default (left position)', () => {
    renderComponent({
      title: 'Usuarios',
    });

    const button = screen.getByTestId('mobix-button');

    expect(button.getAttribute('data-has-start-icon')).toBe('true');
    expect(button.getAttribute('data-has-end-icon')).toBe('false');
  });

  it('uses end icon when actionIconPosition is "right"', () => {
    renderComponent({
      title: 'Usuarios',
      actionIconPosition: 'right',
    });

    const button = screen.getByTestId('mobix-button');

    expect(button.getAttribute('data-has-start-icon')).toBe('false');
    expect(button.getAttribute('data-has-end-icon')).toBe('true');
  });

  it('renders with a custom action label and keeps icon behavior', () => {
    renderComponent({
      title: 'Importar datos',
      actionLabel: 'Subir archivo',
    });

    const button = screen.getByRole('button', { name: 'Subir archivo' });
    expect(button).toBeInTheDocument();

    const mockButton = screen.getByTestId('mobix-button');
    expect(mockButton.getAttribute('data-has-start-icon')).toBe('true');
  });
});
