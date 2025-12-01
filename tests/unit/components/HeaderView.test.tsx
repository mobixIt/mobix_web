import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { HeaderView, type HeaderViewProps } from '@/components/header/HeaderView';
import { getUserAvatarUrl } from '@/services/avatarService';

vi.mock('@/services/avatarService', () => ({
  getUserAvatarUrl: vi.fn(),
}));

vi.mock('@/components/user-card/UserCard', () => ({
  default: ({ name, email }: { name: string; email: string }) => (
    <div data-testid="user-card">
      <span>{name}</span>
      <span>{email}</span>
    </div>
  ),
}));

vi.mock('@/components/calendar-flyout/CalendarFlyout', () => ({
  __esModule: true,
  CalendarFlyout: () => <div data-testid="calendar-flyout" />,
  default: () => <div data-testid="calendar-flyout" />,
}));

vi.mock('@mui/material/ClickAwayListener', async () => {
  const React = await import('react');

  return {
    __esModule: true,
    default: ({
      children,
      onClickAway,
    }: {
      children: React.ReactNode;
      onClickAway: () => void;
    }) => (
      <div data-testid="click-away-wrapper">
        {children}
        <button
          type="button"
          data-testid="click-away-target"
          onClick={onClickAway}
        />
      </div>
    ),
  };
});

const mockedGetUserAvatarUrl = getUserAvatarUrl as unknown as Mock;

const BASE_USER = {
  userName: 'Harold Rangel',
  userEmail: 'harold@example.com',
};

const createProps = (overrides: Partial<HeaderViewProps> = {}): HeaderViewProps => ({
  ...BASE_USER,
  avatarUrl: undefined,
  notifications: [],
  notificationsOpen: false,
  notificationsCount: 0,
  onOpenNotifications: vi.fn(),
  onCloseNotifications: vi.fn(),
  onMarkNotificationAsRead: vi.fn(),
  onNotificationClick: vi.fn(),
  onViewAllNotifications: vi.fn(),
  onCalendarClick: vi.fn(),
  onMyAccountClick: vi.fn(),
  onLogoutClick: vi.fn(),
  ...overrides,
});

describe('HeaderView component', () => {
  beforeEach(() => {
    mockedGetUserAvatarUrl.mockReset();
    mockedGetUserAvatarUrl.mockReturnValue('https://fake-avatar.com/avatar.svg');
  });

  it('renders without crashing and displays the avatar image', () => {
    const props = createProps();
    render(<HeaderView {...props} />);
    const avatarImg = screen.getByRole('img', { name: BASE_USER.userName });
    expect(avatarImg).toBeInTheDocument();
  });

  it('uses avatarUrl from props when provided', () => {
    const props = createProps({ avatarUrl: 'https://my-avatar.com/img.png' });
    render(<HeaderView {...props} />);
    const avatarImg = screen.getByRole('img', { name: BASE_USER.userName });
    expect(avatarImg).toHaveAttribute('src', 'https://my-avatar.com/img.png');
    expect(mockedGetUserAvatarUrl).not.toHaveBeenCalled();
  });

  it('calls getUserAvatarUrl when avatarUrl is not provided', () => {
    mockedGetUserAvatarUrl.mockReturnValue('https://service-avatar.com/email.svg');
    const props = createProps({ avatarUrl: undefined });
    render(<HeaderView {...props} />);
    expect(mockedGetUserAvatarUrl).toHaveBeenCalledWith(BASE_USER.userEmail);
    const avatarImg = screen.getByRole('img', { name: BASE_USER.userName });
    expect(avatarImg).toHaveAttribute('src', 'https://service-avatar.com/email.svg');
  });

  it('opens the user menu when clicking the avatar and applies the active class', () => {
    const props = createProps();
    render(<HeaderView {...props} />);
    const avatarImg = screen.getByRole('img', { name: BASE_USER.userName });
    const avatarButton = avatarImg.closest('button') as HTMLButtonElement;
    fireEvent.click(avatarButton);
    expect(screen.getByText(/Mi cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/Cerrar sesión/i)).toBeInTheDocument();
    expect(avatarButton).toHaveClass('active');
  });

  it('calls onMyAccountClick and closes the menu when selecting "Mi cuenta"', async () => {
    const onMyAccountClick = vi.fn();
    const props = createProps({ onMyAccountClick });
    render(<HeaderView {...props} />);
    const avatarImg = screen.getByRole('img', { name: BASE_USER.userName });
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
    const props = createProps({ onLogoutClick });
    render(<HeaderView {...props} />);
    const avatarImg = screen.getByRole('img', { name: BASE_USER.userName });
    const avatarButton = avatarImg.closest('button')!;
    fireEvent.click(avatarButton);
    const logoutItem = screen.getByText(/Cerrar sesión/i);
    fireEvent.click(logoutItem);
    expect(onLogoutClick).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByText(/Cerrar sesión/i)).not.toBeInTheDocument();
    });
  });

  it('calls onOpenNotifications when clicking the notifications button', () => {
    const onOpenNotifications = vi.fn();
    const props = createProps({ notificationsCount: 3, onOpenNotifications });
    render(<HeaderView {...props} />);
    const notificationsButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(notificationsButton);
    expect(onOpenNotifications).toHaveBeenCalledTimes(1);
  });

  it('calls onCalendarClick when clicking the calendar button', () => {
    const onCalendarClick = vi.fn();
    const props = createProps({ onCalendarClick });
    render(<HeaderView {...props} />);
    const calendarButton = screen.getByRole('button', { name: /calendar/i });
    fireEvent.click(calendarButton);
    expect(onCalendarClick).toHaveBeenCalledTimes(1);
  });

  it('renders the notifications badge when notificationsCount > 0', () => {
    const props = createProps({ notificationsCount: 7 });
    render(<HeaderView {...props} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('does not render a badge when notificationsCount is 0', () => {
    const props = createProps({ notificationsCount: 0 });
    render(<HeaderView {...props} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('closes the calendar flyout when clicking outside', async () => {
    const props = createProps();
    render(<HeaderView {...props} />);
    const calendarButton = screen.getByRole('button', { name: /calendar/i });
    expect(calendarButton).not.toHaveClass('active');
    fireEvent.click(calendarButton);
    expect(calendarButton).toHaveClass('active');
    const clickAwayTarget = screen.getByTestId('click-away-target');
    fireEvent.click(clickAwayTarget);
    await waitFor(() => {
      expect(calendarButton).not.toHaveClass('active');
    });
  });
});
