import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { HeaderView } from '@/components/header/HeaderView';
import { getUserAvatarUrl } from '@/services/avatarService';

// Mock avatar service
vi.mock('@/services/avatarService', () => ({
  getUserAvatarUrl: vi.fn(),
}));

// Mock UserCard
vi.mock('@/components/user-card/UserCard', () => ({
  default: ({ name, email }: { name: string; email: string }) => (
    <div data-testid="user-card">
      <span>{name}</span>
      <span>{email}</span>
    </div>
  ),
}));

const mockedGetUserAvatarUrl = getUserAvatarUrl as unknown as Mock;

describe('HeaderView component', () => {
  const defaultProps = {
    userName: 'Harold Rangel',
    userEmail: 'harold@example.com',
  };

  beforeEach(() => {
    mockedGetUserAvatarUrl.mockReset();
    mockedGetUserAvatarUrl.mockReturnValue('https://fake-avatar.com/avatar.svg');
  });

  it('renders without crashing and displays the avatar image', () => {
    render(<HeaderView {...defaultProps} />);

    const avatarImg = screen.getByRole('img', { name: defaultProps.userName });
    expect(avatarImg).toBeInTheDocument();
  });

  it('uses avatarUrl from props when provided', () => {
    render(
      <HeaderView
        {...defaultProps}
        avatarUrl="https://my-avatar.com/img.png"
      />,
    );

    const avatarImg = screen.getByRole('img', { name: defaultProps.userName });
    expect(avatarImg).toHaveAttribute('src', 'https://my-avatar.com/img.png');

    // Should NOT call the fallback generator
    expect(mockedGetUserAvatarUrl).not.toHaveBeenCalled();
  });

  it('calls getUserAvatarUrl when avatarUrl is not provided', () => {
    mockedGetUserAvatarUrl.mockReturnValue('https://service-avatar.com/email.svg');

    render(<HeaderView {...defaultProps} />);

    expect(mockedGetUserAvatarUrl).toHaveBeenCalledWith(defaultProps.userEmail);

    const avatarImg = screen.getByRole('img', { name: defaultProps.userName });
    expect(avatarImg).toHaveAttribute('src', 'https://service-avatar.com/email.svg');
  });

  it('opens the user menu when clicking the avatar and applies the active class', () => {
    render(<HeaderView {...defaultProps} />);

    const avatarImg = screen.getByRole('img', { name: defaultProps.userName });
    const avatarButton = avatarImg.closest('button') as HTMLButtonElement;

    fireEvent.click(avatarButton);

    expect(screen.getByText(/Mi cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/Cerrar sesión/i)).toBeInTheDocument();

    expect(avatarButton).toHaveClass('active');
  });

  it('calls onMyAccountClick and closes the menu when selecting "Mi cuenta"', async () => {
    const onMyAccountClick = vi.fn();

    render(
      <HeaderView
        {...defaultProps}
        onMyAccountClick={onMyAccountClick}
      />,
    );

    const avatarImg = screen.getByRole('img', { name: defaultProps.userName });
    const avatarButton = avatarImg.closest('button')!;
    fireEvent.click(avatarButton);

    const myAccountItem = screen.getByText(/Mi cuenta/i);
    fireEvent.click(myAccountItem);

    expect(onMyAccountClick).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByText(/Mi cuenta/i)).not.toBeInTheDocument();
    });
  });

  it('calls onLogoutClick and closes the menu when selecting "Cerrar sesión"', async () => {
    const onLogoutClick = vi.fn();

    render(
      <HeaderView
        {...defaultProps}
        onLogoutClick={onLogoutClick}
      />,
    );

    const avatarImg = screen.getByRole('img', { name: defaultProps.userName });
    const avatarButton = avatarImg.closest('button')!;
    fireEvent.click(avatarButton);

    const logoutItem = screen.getByText(/Cerrar sesión/i);
    fireEvent.click(logoutItem);

    expect(onLogoutClick).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.queryByText(/Cerrar sesión/i)).not.toBeInTheDocument();
    });
  });

  it('calls onNotificationsClick when clicking the notifications button', () => {
    const onNotificationsClick = vi.fn();

    render(
      <HeaderView
        {...defaultProps}
        notificationsCount={3}
        onNotificationsClick={onNotificationsClick}
      />,
    );

    const buttons = screen.getAllByRole('button');
    const notificationsButton = buttons[0];

    fireEvent.click(notificationsButton);

    expect(onNotificationsClick).toHaveBeenCalledTimes(1);
  });

  it('calls onCalendarClick when clicking the calendar button', () => {
    const onCalendarClick = vi.fn();

    render(
      <HeaderView
        {...defaultProps}
        onCalendarClick={onCalendarClick}
      />,
    );

    const buttons = screen.getAllByRole('button');
    const calendarButton = buttons[1];

    fireEvent.click(calendarButton);

    expect(onCalendarClick).toHaveBeenCalledTimes(1);
  });

  it('renders the notifications badge when notificationsCount > 0', () => {
    render(
      <HeaderView {...defaultProps} notificationsCount={7} />,
    );

    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('does not render a badge when notificationsCount is 0', () => {
    render(
      <HeaderView {...defaultProps} notificationsCount={0} />,
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
