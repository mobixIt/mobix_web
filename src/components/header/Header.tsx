'use client';

import * as React from 'react';
import HeaderView from './HeaderView';
import { NotificationItem } from '@/components/notifications/NotificationsDrawer';
import { type DayData } from '@/components/calendar-flyout/CalendarFlyout.types';
import { getDateKey } from '@/utils/date';

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Inspección vehicular completada',
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
    title: 'Urgente: se requiere cambio de batería',
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
      label: 'Revisar estado de batería',
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
    message: 'Servicio programado para mañana a las 10:00 AM',
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
    title: 'Informe mensual disponible',
    message: 'Tu informe de rendimiento de flota está listo para descargar',
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
      label: 'Abrir informe',
    },
  },
];

const today = new Date();
const todayKey = getDateKey(today);

const MOCK_CALENDAR_DAYS: Record<string, DayData> = {
  [todayKey]: {
    heatLevel: 'medium',
    dots: ['maintenance', 'dispatch'],
    critical: false,
    metrics: {
      critical: 0,
      important: 1,
      scheduled: 2,
    },
    events: [
      {
        id: 'evt-1',
        timeLabel: '09:00',
        pillVariant: 'scheduled',
        pillLabel: 'Programado',
        iconVariant: 'maintenance',
        title: 'Revisión preventiva · Unidad 32',
        subtitle: 'Taller A',
      },
      {
        id: 'evt-2',
        timeLabel: '16:00',
        pillVariant: 'upcoming',
        pillLabel: 'Próximo',
        iconVariant: 'dispatch',
        title: 'Cambio de ruta · Línea 7',
        subtitle: 'Despacho · Conductor Morales',
      },
    ],
  },
};

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
      prev.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
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
      onCalendarClick={() => console.log('Click header calendar button')}
      calendarDaysByDate={MOCK_CALENDAR_DAYS}
      calendarInitialMonth={today}
      calendarInitialSelectedDate={today}
      onOpenFullCalendar={() => console.log('Open full calendar')}
      onCreateCalendarEvent={(date) =>
        console.log('Create event on date:', date)
      }
      onCalendarDayClick={(date) =>
        console.log('Day clicked in calendar flyout:', date)
      }
    />
  );
}