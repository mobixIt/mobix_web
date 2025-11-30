'use client';

import * as React from 'react';
import HeaderView from './HeaderView';
import { NotificationItem } from '@/components/notifications/NotificationsDrawer';

const MOCK_NOTIFICATIONS: NotificationItem[] = [
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
    readAt: null,
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

export default function Header() {
  const userMock = {
    name: 'Harold Rangel',
    email: 'user@example.com',
    avatarUrl: undefined,
  };

  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] =
    React.useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleOpenNotifications = () => {
    setNotificationsOpen(true);
  };

  const handleCloseNotifications = () => {
    setNotificationsOpen(false);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    console.log('Go to notification destination:', notification);
  };

  const handleViewAllNotifications = () => {
    console.log('Navigate to /notifications');
  };

  return (
    <HeaderView
      userName={userMock.name}
      userEmail={userMock.email}
      avatarUrl={userMock.avatarUrl}
      notifications={notifications}
      notificationsOpen={notificationsOpen}
      notificationsCount={unreadCount}
      onOpenNotifications={handleOpenNotifications}
      onCloseNotifications={handleCloseNotifications}
      onMarkNotificationAsRead={handleMarkNotificationAsRead}
      onNotificationClick={handleNotificationClick}
      onViewAllNotifications={handleViewAllNotifications}
      onMyAccountClick={() => console.log('Ir a Mi cuenta')}
      onLogoutClick={() => console.log('Cerrar sesión')}
      onCalendarClick={() => console.log('Abrir calendario')}
    />
  );
}