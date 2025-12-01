export type HeatLevel =
  | 'veryLight'
  | 'light'
  | 'medium'
  | 'high'
  | 'critical';

export type DayDotVariant =
  | 'maintenance'
  | 'critical'
  | 'expiry'
  | 'dispatch'
  | 'admin';

export type EventPillVariant =
  | 'critical'
  | 'urgent'
  | 'scheduled'
  | 'upcoming'
  | 'normal';

export type DayEvent = {
  id: string;
  timeLabel: string;
  pillVariant: EventPillVariant;
  pillLabel: string;
  iconVariant: DayDotVariant;
  title: string;
  subtitle: string;
};

export type DayMetrics = {
  critical: number;
  important: number;
  scheduled: number;
};

export type DayData = {
  heatLevel: HeatLevel;
  dots?: DayDotVariant[];
  critical?: boolean;
  metrics?: DayMetrics;
  events?: DayEvent[];
};

export type CalendarFlyoutProps = {
  open: boolean;
  daysByDate: Record<string, DayData>;
  initialMonth?: Date;
  initialSelectedDate?: Date | null;
  onOpenFullCalendar?: () => void;
  onCreateEvent?: (date: Date) => void;
  onDayClick?: (date: Date) => void;
};