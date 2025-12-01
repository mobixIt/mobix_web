import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { CalendarFlyout } from '@/components/calendar-flyout/CalendarFlyout';
import type { CalendarFlyoutProps, DayData } from '@/components/calendar-flyout/CalendarFlyout.types'

const meta: Meta<typeof CalendarFlyout> = {
  title: 'Mobix/Calendar/CalendarFlyout',
  component: CalendarFlyout,
  args: {
    open: true,
  },
};

export default meta;

type Story = StoryObj<typeof CalendarFlyout>;

const MOCK_DAYS: Record<string, DayData> = {
  '2025-02-01': { heatLevel: 'veryLight' },

  '2025-02-02': {
    heatLevel: 'light',
    dots: ['maintenance'],
  },

  '2025-02-03': {
    heatLevel: 'light',
    dots: ['dispatch', 'maintenance', 'expiry'],
  },

  '2025-02-04': {
    heatLevel: 'medium',
    dots: ['maintenance', 'expiry', 'dispatch', 'admin'],
  },

  '2025-02-05': {
    heatLevel: 'medium',
    dots: ['expiry', 'expiry', 'dispatch', 'maintenance', 'admin'],
  },

  '2025-02-06': {
    heatLevel: 'high',
    dots: [
      'dispatch', 'maintenance', 'expiry', 'expiry',
      'admin', 'maintenance', 'dispatch', 'dispatch'
    ],
  },

  '2025-02-07': {
    heatLevel: 'critical',
    critical: true,
    dots: [
      'critical','critical','critical','expiry','maintenance','dispatch',
      'critical','expiry','maintenance','critical','dispatch','expiry','admin'
    ],
    metrics: {
      critical: 4,
      important: 3,
      scheduled: 2,
    },
    events: [
      {
        id: 'evt-701',
        timeLabel: '08:00',
        pillVariant: 'critical',
        pillLabel: 'Crítico',
        iconVariant: 'critical',
        title: 'Alerta de sobrecalentamiento del motor',
        subtitle: 'Unidad 32 · Patio Norte',
      },
      {
        id: 'evt-702',
        timeLabel: '13:30',
        pillVariant: 'urgent',
        pillLabel: 'Urgente',
        iconVariant: 'expiry',
        title: 'Licencia de conducción por vencer – 2 conductores',
        subtitle: 'Talento Humano · Oficina de Certificación',
      },
    ],
  },

  '2025-02-10': {
    heatLevel: 'light',
    dots: ['dispatch'],
  },

  '2025-02-12': {
    heatLevel: 'medium',
    dots: ['critical', 'expiry', 'maintenance', 'dispatch'],
    critical: true,
    metrics: { critical: 1, important: 2, scheduled: 1 },
    events: [
      {
        id: '1',
        timeLabel: '09:00',
        pillVariant: 'critical',
        pillLabel: 'Crítico',
        iconVariant: 'critical',
        title: 'Falla de batería',
        subtitle: 'Unidad 45 · Taller A',
      },
    ],
  },

  '2025-02-14': {
    heatLevel: 'high',
    dots: [
      'maintenance','dispatch','dispatch','expiry','expiry',
      'admin','critical','maintenance'
    ],
  },

  '2025-02-16': {
    heatLevel: 'light',
    dots: ['maintenance', 'dispatch'],
  },

  '2025-02-18': {
    heatLevel: 'medium',
    dots: ['expiry', 'dispatch', 'maintenance', 'admin'],
  },

  '2025-02-20': {
    heatLevel: 'high',
    dots: [
      'dispatch','dispatch','expiry','expiry',
      'maintenance','maintenance','admin','critical'
    ],
  },

  '2025-02-22': {
    heatLevel: 'critical',
    critical: true,
    dots: [
      'critical','critical','critical','expiry','expiry',
      'maintenance','maintenance','dispatch','admin','critical',
      'expiry','dispatch','maintenance'
    ],
  },

  '2025-02-28': { heatLevel: 'veryLight' },
};

export const Default: Story = {
  args: {
    open: true,
    daysByDate: MOCK_DAYS,
    initialMonth: new Date(2025, 1, 1),
    initialSelectedDate: new Date(2025, 1, 12),

    onOpenFullCalendar: fn(),
    onDayClick: fn(),
    onCreateEvent: fn(),
  } satisfies CalendarFlyoutProps,
};