// src/components/header/HeaderView.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HeaderView } from '@/components/header/HeaderView';

const meta: Meta<typeof HeaderView> = {
  title: 'Mobix/Final/Header',
  component: HeaderView,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof HeaderView>;

export const Default: Story = {
  args: {
    userName: 'Harold Rangel',
    userEmail: 'user@example.com',
    avatarUrl: undefined,
    notificationsCount: 0,
    onNotificationsClick: () => alert('Abrir panel de notificaciones'),
    onCalendarClick: () => alert('Abrir calendario'),
    onMyAccountClick: () => alert('Ir a "Mi cuenta"'),
    onLogoutClick: () => alert('Cerrar sesión'),
  },
};

export const WithNotificationsBadge: Story = {
  args: {
    userName: 'Harold Rangel',
    userEmail: 'user@example.com',
    avatarUrl: undefined,
    notificationsCount: 3,
    onNotificationsClick: () => alert('Abrir panel de notificaciones (3)'),
    onCalendarClick: () => alert('Abrir calendario'),
    onMyAccountClick: () => alert('Ir a "Mi cuenta"'),
    onLogoutClick: () => alert('Cerrar sesión'),
  },
};

export const WithAvatarImageAndBadge: Story = {
  args: {
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@company.com',
    avatarUrl:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&q=80',
    notificationsCount: 5,
    onNotificationsClick: () => alert('Abrir panel de notificaciones (5)'),
    onCalendarClick: () => alert('Abrir calendario'),
    onMyAccountClick: () => alert('Ir a "Mi cuenta"'),
    onLogoutClick: () => alert('Cerrar sesión'),
  },
};