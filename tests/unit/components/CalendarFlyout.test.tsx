import React from 'react';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';
import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ThemeProvider, createTheme } from '@mui/material/styles';

import { CalendarFlyout } from '@/components/calendar-flyout/CalendarFlyout';

import type {
  CalendarFlyoutProps,
  DayData,
} from '@/components/calendar-flyout/CalendarFlyout.types';
import { getDateKey } from '@/utils/date';

const baseTheme = createTheme({
  palette: {
    primary: { main: '#1E6687' },
    secondary: { main: '#0B7285' },
    neutral: { main: '#E5E7EB' },
    accent: { main: '#12445A' },
  },
});

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={baseTheme}>{ui}</ThemeProvider>);

const BASE_DATE = new Date(2025, 1, 12);

const MOCK_DAYS: Record<string, DayData> = {
  '2025-02-10': {
    heatLevel: 'high',
    dots: ['critical', 'expiry', 'maintenance'],
    critical: true,
  },
  '2025-02-12': {
    heatLevel: 'critical',
    dots: ['critical', 'expiry', 'maintenance', 'dispatch'],
    critical: true,
    metrics: {
      critical: 1,
      important: 2,
      scheduled: 2,
    },
    events: [
      {
        id: '1',
        timeLabel: '08:30',
        pillVariant: 'critical',
        pillLabel: 'Critical',
        iconVariant: 'critical',
        title: 'Alert: Unit 45 battery failure',
        subtitle: 'Maintenance · Depot A',
      },
      {
        id: '2',
        timeLabel: 'All day',
        pillVariant: 'urgent',
        pillLabel: 'Urgent',
        iconVariant: 'expiry',
        title: 'SOAT expiring - 2 buses',
        subtitle: 'Documents · Units 12, 18',
      },
    ],
  },
  '2025-02-20': {
    heatLevel: 'medium',
    dots: ['maintenance'],
    metrics: {
      critical: 0,
      important: 1,
      scheduled: 0,
    },
  },
};

const createProps = (
  overrides: Partial<CalendarFlyoutProps> = {},
): CalendarFlyoutProps => ({
  open: true,
  daysByDate: MOCK_DAYS,
  initialMonth: new Date(2025, 1, 1),
  initialSelectedDate: BASE_DATE,
  onOpenFullCalendar: vi.fn(),
  onCreateEvent: vi.fn(),
  onDayClick: vi.fn(),
  ...overrides,
});

describe('CalendarFlyout component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 1, 15).getTime());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not render anything when open is false', () => {
    const props = createProps({ open: false });

    const { container } = renderWithTheme(<CalendarFlyout {...props} />);

    expect(
      screen.queryByText(/Calendario operativo/i),
    ).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('renders header title, subtitle, month label and weekday headers', () => {
    const props = createProps();
    renderWithTheme(<CalendarFlyout {...props} />);

    expect(
      screen.getByText(/Calendario operativo/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Resumen de actividad operativa/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/February 2025/i)).toBeInTheDocument();

    ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SAB'].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('respects initialMonth and initialSelectedDate', () => {
    const props = createProps({
      initialMonth: new Date(2025, 1, 1),
      initialSelectedDate: new Date(2025, 1, 12),
    });

    renderWithTheme(<CalendarFlyout {...props} />);

    expect(
      screen.getByText(/February 12 — 2 eventos/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/2 eventos/i),
    ).toBeInTheDocument();
  });

  it('shows day metrics as chips when metrics are present', () => {
    const props = createProps();
    renderWithTheme(<CalendarFlyout {...props} />);

    expect(screen.getByText('1 críticos')).toBeInTheDocument();
    expect(screen.getByText('2 importantes')).toBeInTheDocument();
    expect(screen.getByText('2 programados')).toBeInTheDocument();
  });

  it('renders the list of events for the selected day', () => {
    const props = createProps();
    renderWithTheme(<CalendarFlyout {...props} />);

    expect(
      screen.getByText(/Alert: Unit 45 battery failure/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/SOAT expiring - 2 buses/i),
    ).toBeInTheDocument();

    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();

    expect(screen.getByText('08:30')).toBeInTheDocument();
    expect(screen.getByText('All day')).toBeInTheDocument();
  });

  it('calls onDayClick and updates selected day when clicking a day cell', () => {
    const onDayClick = vi.fn();
    const props = createProps({ onDayClick });

    renderWithTheme(<CalendarFlyout {...props} />);

    const day20Cell = screen.getAllByText('20')[0];
    fireEvent.click(day20Cell);

    expect(onDayClick).toHaveBeenCalledTimes(1);
    const calledDate = onDayClick.mock.calls[0][0] as Date;

    expect(getDateKey(calledDate)).toBe('2025-02-20');

    const matchingNodes = screen.getAllByText(/February 20/i);
    const detailTitle = matchingNodes.find(
      (el) => el.textContent === 'February 20',
    );

    expect(detailTitle).toBeInTheDocument();
  });

  it('navigates to previous and next months when clicking nav buttons', () => {
    const props = createProps();
    renderWithTheme(<CalendarFlyout {...props} />);

    expect(screen.getByText(/February 2025/i)).toBeInTheDocument();

    const navButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.className.includes('MuiIconButton'));

    const prevButton = navButtons[0];
    const nextButton = navButtons[navButtons.length - 1];

    fireEvent.click(nextButton);
    expect(screen.getByText(/March 2025/i)).toBeInTheDocument();

    fireEvent.click(prevButton);
    expect(screen.getByText(/February 2025/i)).toBeInTheDocument();
  });

  it('clicking Hoy jumps to current month and selects today', () => {
    const props = createProps({
      initialMonth: new Date(2025, 0, 1),
      initialSelectedDate: null,
    });

    renderWithTheme(<CalendarFlyout {...props} />);

    expect(screen.getByText(/January 2025/i)).toBeInTheDocument();

    const todayButton = screen.getByRole('button', { name: /Hoy/i });
    fireEvent.click(todayButton);

    expect(screen.getByText(/February 2025/i)).toBeInTheDocument();

    expect(
      screen.getByText(/February 15/i),
    ).toBeInTheDocument();
  });

  it('calls onCreateEvent with currently selected date when clicking "Crear evento"', () => {
    const onCreateEvent = vi.fn();
    const initialSelected = new Date(2025, 1, 12);

    const props = createProps({
      onCreateEvent,
      initialSelectedDate: initialSelected,
    });

    renderWithTheme(<CalendarFlyout {...props} />);

    const createButton = screen.getByRole('button', {
      name: /Crear evento/i,
    });
    fireEvent.click(createButton);

    expect(onCreateEvent).toHaveBeenCalledTimes(1);
    const calledDate = onCreateEvent.mock.calls[0][0] as Date;
    expect(getDateKey(calledDate)).toBe('2025-02-12');
  });

  it('does not call onCreateEvent if there is no selected date', () => {
    const onCreateEvent = vi.fn();

    const props = createProps({
      onCreateEvent,
      initialSelectedDate: null,
    });

    renderWithTheme(<CalendarFlyout {...props} />);

    const createButton = screen.getByRole('button', {
      name: /Crear evento/i,
    });
    fireEvent.click(createButton);

    expect(onCreateEvent).not.toHaveBeenCalled();
  });

  it('calls onOpenFullCalendar when clicking "Abrir calendario completo"', () => {
    const onOpenFullCalendar = vi.fn();
    const props = createProps({ onOpenFullCalendar });

    renderWithTheme(<CalendarFlyout {...props} />);

    const openFullCalendarLink = screen.getByText(
      /Abrir calendario completo/i,
    );
    fireEvent.click(openFullCalendarLink);

    expect(onOpenFullCalendar).toHaveBeenCalledTimes(1);
  });

  it('shows empty state message when selected day has no events', () => {
    const props = createProps({
      initialSelectedDate: new Date(2025, 1, 20),
    });

    renderWithTheme(<CalendarFlyout {...props} />);

    expect(
      screen.getByText(/No hay eventos para este día./i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /No se registran actividades programadas para este día./i,
      ),
    ).toBeInTheDocument();
  });
});
