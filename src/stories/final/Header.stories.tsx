import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HeaderView } from '@/components/header/HeaderView';
import type { NotificationItem } from '@/components/notifications/NotificationsDrawer';

const meta: Meta<typeof HeaderView> = {
  title: 'Mobix/Final/Header',
  component: HeaderView,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof HeaderView>;

const createMockNotifications = (unreadCount: number): NotificationItem[] => {
  const base: NotificationItem[] = [
    {
      id: '1',
      title: 'Vehicle inspection completed',
      message: 'Bus XC-123 has passed the scheduled inspection',
      createdAt: '2025-11-29T15:20:00Z',
      readAt: null,
      severity: 'success',
      domain: 'vehicle',
      event: 'vehicle_inspection_completed',
      iconKey: 'vehicle',
      actionable: true,
      action: {
        type: 'navigate',
        url: '/workshop/vehicles/XC-123/inspections/latest',
        label: 'View inspection',
      },
      notifiable: {
        type: 'Vehicle',
        id: 'vehicle-uuid-123',
        plate: 'XC-123',
      },
    },
    {
      id: '2',
      title: 'Urgent: Battery replacement needed',
      message: 'Unit 45 battery is showing critical levels',
      createdAt: '2025-11-29T15:05:00Z',
      readAt: null,
      severity: 'error',
      domain: 'vehicle',
      event: 'vehicle_battery_critical',
      iconKey: 'battery',
      actionable: true,
      action: {
        type: 'navigate',
        url: '/vehicles/45/maintenance/battery',
        label: 'Review battery status',
      },
      notifiable: {
        type: 'Vehicle',
        id: 'vehicle-uuid-45',
        plate: 'XYZ-045',
      },
    },
    {
      id: '3',
      title: 'Workshop appointment confirmed',
      message: 'Service scheduled for tomorrow at 10:00 AM',
      createdAt: '2025-11-29T14:00:00Z',
      readAt: null,
      severity: 'info',
      domain: 'workshop',
      event: 'workshop_appointment_confirmed',
      iconKey: 'wrench',
      actionable: true,
      action: {
        type: 'navigate',
        url: '/workshop/appointments/next',
        label: 'View appointment',
      },
      notifiable: {
        type: 'Vehicle',
        id: 'vehicle-uuid-777',
        plate: 'ABC-777',
      },
    },
    {
      id: '4',
      title: 'System maintenance completed',
      message: 'All systems are now running normally',
      createdAt: '2025-11-29T12:00:00Z',
      readAt: '2025-11-29T12:30:00Z',
      severity: 'info',
      domain: 'system',
      event: 'system_maintenance_completed',
      iconKey: 'bell',
      actionable: false,
    },
    {
      id: '5',
      title: 'Monthly report ready',
      message: 'Your fleet performance report is available for download',
      createdAt: '2025-11-28T09:00:00Z',
      readAt: '2025-11-28T10:00:00Z',
      severity: 'info',
      domain: 'report',
      event: 'monthly_report_ready',
      iconKey: 'report',
      actionable: true,
      action: {
        type: 'navigate',
        url: '/reports/fleet/monthly',
        label: 'Open report',
      },
    },
  ];

  return base.map((n, index) =>
    index < unreadCount ? { ...n, readAt: null } : { ...n, readAt: n.readAt ?? new Date().toISOString() },
  );
};

export const Default: Story = {
  args: {
    userName: 'Harold Rangel',
    userEmail: 'user@example.com',
    avatarUrl: undefined,
    onMyAccountClick: () => alert('Go to "My account"'),
    onLogoutClick: () => alert('Logout'),
    onCalendarClick: () => alert('Open calendar'),
  },
  render: (args) => {
    const [notifications, setNotifications] = React.useState<NotificationItem[]>(
      createMockNotifications(0),
    );
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);

    const unreadCount = notifications.filter((n) => !n.readAt).length;

    return (
      <HeaderView
        {...args}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        notificationsCount={unreadCount}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onCloseNotifications={() => setNotificationsOpen(false)}
        onMarkNotificationAsRead={(id) =>
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
            ),
          )
        }
        onNotificationClick={(notification) =>
          alert(`Notification clicked: ${notification.title}`)
        }
        onViewAllNotifications={() => alert('View all notifications')}
      />
    );
  },
};

export const WithNotificationsBadge: Story = {
  args: {
    userName: 'Harold Rangel',
    userEmail: 'user@example.com',
    avatarUrl: undefined,
    onMyAccountClick: () => alert('Go to "My account"'),
    onLogoutClick: () => alert('Logout'),
    onCalendarClick: () => alert('Open calendar'),
  },
  render: (args) => {
    const [notifications, setNotifications] = React.useState<NotificationItem[]>(
      createMockNotifications(3),
    );
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);

    const unreadCount = notifications.filter((n) => !n.readAt).length;

    return (
      <HeaderView
        {...args}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        notificationsCount={unreadCount}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onCloseNotifications={() => setNotificationsOpen(false)}
        onMarkNotificationAsRead={(id) =>
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
            ),
          )
        }
        onNotificationClick={(notification) =>
          alert(`Notification clicked: ${notification.title}`)
        }
        onViewAllNotifications={() => alert('View all notifications')}
      />
    );
  },
};

export const WithAvatarImageAndBadge: Story = {
  args: {
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@company.com',
    avatarUrl:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&q=80',
    onMyAccountClick: () => alert('Go to "My account"'),
    onLogoutClick: () => alert('Logout'),
    onCalendarClick: () => alert('Open calendar'),
  },
  render: (args) => {
    const [notifications, setNotifications] = React.useState<NotificationItem[]>(
      createMockNotifications(5),
    );
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);

    const unreadCount = notifications.filter((n) => !n.readAt).length;

    return (
      <HeaderView
        {...args}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        notificationsCount={unreadCount}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onCloseNotifications={() => setNotificationsOpen(false)}
        onMarkNotificationAsRead={(id) =>
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
            ),
          )
        }
        onNotificationClick={(notification) =>
          alert(`Notification clicked: ${notification.title}`)
        }
        onViewAllNotifications={() => alert('View all notifications')}
      />
    );
  },
};
