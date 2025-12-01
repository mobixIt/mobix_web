import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HeaderView } from '@/components/header/HeaderView';
import type { NotificationItem } from '@/components/notifications/NotificationsDrawer';
import type { DayData } from '@/components/calendar-flyout/CalendarFlyout.types';
import { getDateKey } from '@/utils/date';

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
      title: 'Inspección del vehículo completada',
      message: 'El bus XC-123 ha aprobado la inspección programada',
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
        label: 'Ver inspección',
      },
      notifiable: {
        type: 'Vehicle',
        id: 'vehicle-uuid-123',
        plate: 'XC-123',
      },
    },
    {
      id: '2',
      title: 'Urgente: Reemplazo de batería necesario',
      message: 'La batería de la unidad 45 muestra niveles críticos',
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
        label: 'Revisar estado de la batería',
      },
      notifiable: {
        type: 'Vehicle',
        id: 'vehicle-uuid-45',
        plate: 'XYZ-045',
      },
    },
    {
      id: '3',
      title: 'Cita en taller confirmada',
      message: 'Servicio programado para mañana a las 10:00 a. m.',
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
        label: 'Ver cita',
      },
      notifiable: {
        type: 'Vehicle',
        id: 'vehicle-uuid-777',
        plate: 'ABC-777',
      },
    },
    {
      id: '4',
      title: 'Mantenimiento del sistema completado',
      message: 'Todos los sistemas están funcionando con normalidad',
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
      title: 'Reporte mensual disponible',
      message: 'Tu reporte de rendimiento de flota está listo para descargar',
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
        label: 'Abrir reporte',
      },
    },
  ];

  return base.map((n, index) =>
    index < unreadCount
      ? { ...n, readAt: null }
      : { ...n, readAt: n.readAt ?? new Date().toISOString() },
  );
};

const createMockCalendarDays = (
  withTodayEvents: boolean,
): Record<string, DayData> => {
  const today = new Date();
  const yesterday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
  );
  const tomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );

  const todayKey = getDateKey(today);
  const yesterdayKey = getDateKey(yesterday);
  const tomorrowKey = getDateKey(tomorrow);

  const base: Record<string, DayData> = {
    [yesterdayKey]: {
      heatLevel: 'medium',
      dots: ['maintenance'],
      metrics: {
        critical: 0,
        important: 1,
        scheduled: 1,
      },
      events: [
        {
          id: 'y1',
          timeLabel: '09:00',
          pillVariant: 'scheduled',
          pillLabel: 'Programado',
          iconVariant: 'maintenance',
          title: 'Cambio de aceite – Unidad 32',
          subtitle: 'Taller · Bahía 3',
        },
      ],
    },

    [tomorrowKey]: {
      heatLevel: 'high',
      dots: ['dispatch'],
      metrics: {
        critical: 0,
        important: 2,
        scheduled: 1,
      },
      events: [
        {
          id: 'tm1',
          timeLabel: '05:00',
          pillVariant: 'upcoming',
          pillLabel: 'Próximo',
          iconVariant: 'dispatch',
          title: 'Ajuste en ventana de despacho',
          subtitle: 'Ruta Manantial · Nuevo horario',
        },
      ],
    },
  };

  if (withTodayEvents) {
    base[todayKey] = {
      heatLevel: 'critical',
      critical: true,
      dots: ['critical', 'expiry', 'dispatch', 'maintenance'],
      metrics: {
        critical: 2,
        important: 1,
        scheduled: 2,
      },
      events: [
        {
          id: 't1',
          timeLabel: '07:30',
          pillVariant: 'critical',
          pillLabel: 'Crítico',
          iconVariant: 'critical',
          title: 'Viajes sobrecargados detectados',
          subtitle: 'Ruta B10 · Hora pico mañana',
        },
        {
          id: 't2',
          timeLabel: 'Todo el día',
          pillVariant: 'urgent',
          pillLabel: 'Urgente',
          iconVariant: 'expiry',
          title: 'SOAT por vencer – 3 buses',
          subtitle: 'Unidades: 12, 18, 45',
        },
      ],
    };
  }

  return base;
};

const calendarDaysWithTodayEvents = createMockCalendarDays(true);
const calendarDaysWithoutTodayEvents = createMockCalendarDays(false);
const calendarInitialMonth = new Date();

export const Default: Story = {
  args: {
    userName: 'Harold Rangel',
    userEmail: 'user@example.com',
    avatarUrl: undefined,
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
        onMyAccountClick={() => alert('Go to "My account"')}
        onLogoutClick={() => alert('Logout')}
        onCalendarClick={() => {}}
        calendarDaysByDate={calendarDaysWithoutTodayEvents}
        calendarInitialMonth={calendarInitialMonth}
        calendarInitialSelectedDate={new Date()}
        onOpenFullCalendar={() => alert('Open full calendar')}
        onCreateCalendarEvent={(date) =>
          alert(`Create event on ${date.toDateString()}`)
        }
        onCalendarDayClick={(date) =>
          console.log('Day clicked in calendar flyout:', date.toISOString())
        }
      />
    );
  },
};

export const WithNotificationsBadge: Story = {
  args: {
    userName: 'Harold Rangel',
    userEmail: 'user@example.com',
    avatarUrl: undefined,
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
        onMyAccountClick={() => alert('Go to "My account"')}
        onLogoutClick={() => alert('Logout')}
        onCalendarClick={() => {}}
        calendarDaysByDate={calendarDaysWithTodayEvents}
        calendarInitialMonth={calendarInitialMonth}
        calendarInitialSelectedDate={new Date()}
        onOpenFullCalendar={() => alert('Open full calendar')}
        onCreateCalendarEvent={(date) =>
          alert(`Create event on ${date.toDateString()}`)
        }
        onCalendarDayClick={(date) =>
          console.log('Day clicked in calendar flyout:', date.toISOString())
        }
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
        onMyAccountClick={() => alert('Go to "My account"')}
        onLogoutClick={() => alert('Logout')}
        onCalendarClick={() => {}}
        calendarDaysByDate={calendarDaysWithTodayEvents}
        calendarInitialMonth={calendarInitialMonth}
        calendarInitialSelectedDate={new Date()}
        onOpenFullCalendar={() => alert('Open full calendar')}
        onCreateCalendarEvent={(date) =>
          alert(`Create event on ${date.toDateString()}`)
        }
        onCalendarDayClick={(date) =>
          console.log('Day clicked in calendar flyout:', date.toISOString())
        }
      />
    );
  },
};
