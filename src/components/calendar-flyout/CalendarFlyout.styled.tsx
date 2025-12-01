import { styled, alpha } from '@mui/material/styles';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
} from '@mui/material';
import { HeatLevel, DayDotVariant, EventPillVariant } from './CalendarFlyout.types';

export const CalendarFlyoutRoot = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(10),
  right: theme.spacing(4),
  width: 880,
  maxWidth: '100%',
  borderRadius: 4,
  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.25)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  zIndex: theme.zIndex.modal - 1,
  animation: 'mobix-slide-down 0.3s ease-out',
  '@keyframes mobix-slide-down': {
    from: {
      opacity: 0,
      transform: 'translateY(-20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  backgroundColor: theme.palette.background.paper,
}));

export const CalendarPanelHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  borderBottom: `1px solid ${theme.palette.neutral.main}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const CalendarHeaderLeft = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export const CalendarHeaderTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
}));

export const CalendarHeaderSubtitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  fontSize: '0.825rem',
  color: theme.palette.text.secondary,
}));

export const CalendarHeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const CalendarNavButton = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: 4,
  border: `1px solid ${theme.palette.neutral.main}`,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  transition: 'background-color 0.16s ease, border-color 0.16s ease',

  '&:hover': {
    backgroundColor: theme.palette.neutral.light,
    borderColor: theme.palette.neutral.dark,
  },
}));

export const CalendarMainContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  borderTop: `1px solid ${theme.palette.neutral.light}`,
  borderBottom: `1px solid ${theme.palette.neutral.light}`,
}));

export const MiniCalendarSection = styled(Box)(({ theme }) => ({
  width: 480,
  maxWidth: '100%',
  padding: theme.spacing(3),
  borderRight: `1px solid ${theme.palette.neutral.main}`,
}));

export const DayDetailPanel = styled(Box)(({ theme }) => ({
  width: 400,
  maxWidth: '100%',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
}));

export const MonthTitleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

export const MonthTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  color: theme.palette.primary.main,
}));

export const HeatLegend = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
}));

export const HeatLegendItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  '& span': {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
  },
}));

export const HeatLegendSwatch = styled('div')<{
  level: 'light' | 'medium' | 'high' | 'critical';
}>(({ theme, level }) => {
  const getBg = () => {
    switch (level) {
      case 'light':
        return alpha(theme.palette.success.light, 0.3);
      case 'medium':
        return alpha(theme.palette.warning.main, 0.3);
      case 'high':
        return alpha(theme.palette.warning.dark, 0.4);
      case 'critical':
        return alpha(theme.palette.error.main, 0.35);
      default:
        return theme.palette.background.paper;
    }
  };
  return {
    width: 12,
    height: 12,
    borderRadius: 4,
    backgroundColor: getBg(),
  };
});

export const WeekdayHeaderRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

export const WeekdayHeaderCell = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  paddingBlock: theme.spacing(1),
  fontSize: '0.7rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

export const CalendarGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: theme.spacing(1),
}));

export const HeatDayTile = styled(Box)<{
  heatLevel: HeatLevel;
  selected?: boolean;
  outsideMonth?: boolean;
  isCritical?: boolean;
}>(({ theme, heatLevel, selected, outsideMonth, isCritical }) => {
  const baseBorder = theme.palette.neutral.light;

  const getBackground = () => {
    switch (heatLevel) {
      case 'light':
        return alpha(theme.palette.success.light, 0.3);
      case 'medium':
        return alpha(theme.palette.warning.main, 0.3);
      case 'high':
        return alpha(theme.palette.warning.dark, 0.4);
      case 'critical':
        return alpha(theme.palette.error.main, 0.35);
      case 'veryLight':
      default:
        return theme.palette.background.paper;
    }
  };

  return {
    position: 'relative',
    borderRadius: 4,
    padding: theme.spacing(1),
    textAlign: 'center',
    cursor: 'pointer',
    border:
      heatLevel === 'critical'
        ? `1px solid ${alpha(theme.palette.error.main, 0.7)}`
        : `1px solid ${baseBorder}`,
    backgroundColor: getBackground(),
    transition:
      'background-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease, border-color 0.16s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(8, 42, 63, 0.15)',
      backgroundColor:
        heatLevel === 'veryLight'
          ? theme.palette.neutral.light
          : getBackground(),
    },
    ...(outsideMonth && {
      backgroundColor: theme.palette.background.paper,
    }),
    ...(selected && {
      border: `2px solid ${theme.palette.accent.main}`,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.accent.main, 0.1)}`,
    }),
    ...(isCritical && {
      borderWidth: 2,
      borderColor: theme.palette.error.main,
    }),
  };
});

export const DayNumber = styled(Typography)<{
  outsideMonth?: boolean;
}>(({ theme, outsideMonth }) => ({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: outsideMonth ? theme.palette.text.disabled : theme.palette.text.primary,
  marginBottom: theme.spacing(0.75),
}));

export const DayDotsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(0.25),
}));

export const DayDot = styled('span')<{
  variant: DayDotVariant;
}>(({ theme, variant }) => {
  const mapColor: Record<DayDotVariant, string> = {
    maintenance: theme.palette.info.main,
    critical: theme.palette.error.main,
    expiry: theme.palette.warning.main,
    dispatch: theme.palette.success.main,
    admin: '#8B5CF6',
  };
  return {
    width: 6,
    height: 6,
    borderRadius: '50%',
    display: 'inline-block',
    backgroundColor: mapColor[variant],
  };
});

export const CriticalBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -6,
  right: -6,
  width: 18,
  height: 18,
  borderRadius: '999px',
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  fontWeight: 700,
}));

export const DayDetailHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
}));

export const DayDetailTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}));

export const DayDetailChipsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

export const DayDetailChip = styled(Box)<{
  variant: 'critical' | 'important' | 'scheduled';
}>(({ theme, variant }) => {
  const mapBg: Record<typeof variant, string> = {
    critical: alpha(theme.palette.error.light, 0.6),
    important: alpha(theme.palette.warning.light, 0.6),
    scheduled: alpha(theme.palette.info.light, 0.6),
  };
  const mapColor: Record<typeof variant, string> = {
    critical: theme.palette.error.dark,
    important: theme.palette.warning.dark,
    scheduled: theme.palette.info.dark,
  };

  return {
    paddingInline: theme.spacing(1),
    paddingBlock: theme.spacing(0.5),
    borderRadius: 999,
    fontSize: '0.7rem',
    fontWeight: 600,
    backgroundColor: mapBg[variant],
    color: mapColor[variant],
  };
});

export const DayEventsList = styled(List)(({ theme }) => ({
  padding: 0,
  maxHeight: 440,
  overflowY: 'auto',
  paddingRight: theme.spacing(0.5),
}));

export const DayEventRow = styled(Box)(({ theme }) => ({
  borderRadius: 4,
  border: `1px solid ${theme.palette.neutral.light}`,
  padding: theme.spacing(1.5),
  cursor: 'pointer',
  marginBottom: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  transition:
    'background-color 0.15s ease, transform 0.15s ease, border-color 0.15s ease',
  '&:hover': {
    backgroundColor: theme.palette.neutral.light,
    transform: 'translateX(4px)',
    borderColor: theme.palette.neutral.dark,
  },
  '&:last-of-type': {
    marginBottom: 0,
  },
}));

export const DayEventHeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
}));

export const DayEventHeaderLeft = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const DayEventIconWrapper = styled(Box)<{
  variant: EventPillVariant;
}>(({ theme, variant }) => {
  const bgMap: Record<EventPillVariant, string> = {
    critical: alpha(theme.palette.error.light, 0.15),
    urgent: alpha(theme.palette.warning.light, 0.15),
    scheduled: alpha(theme.palette.info.light, 0.15),
    upcoming: alpha(theme.palette.warning.light, 0.15),
    normal: alpha(theme.palette.success.light, 0.15),
  };

  const colorMap: Record<EventPillVariant, string> = {
    critical: theme.palette.error.main,
    urgent: theme.palette.warning.main,
    scheduled: theme.palette.info.main,
    upcoming: theme.palette.warning.dark,
    normal: theme.palette.success.main,
  };

  return {
    width: 32,
    height: 32,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bgMap[variant],
    color: colorMap[variant],
  };
});

export const DayEventTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

export const DayEventPill = styled(Box)<{
  variant: 'critical' | 'urgent' | 'scheduled' | 'upcoming' | 'normal';
}>(({ theme, variant }) => {
  const bgMap: Record<typeof variant, string> = {
    critical: theme.palette.error.main,
    urgent: theme.palette.warning.main,
    scheduled: theme.palette.info.main,
    upcoming: theme.palette.warning.light,
    normal: theme.palette.success.main,
  };
  return {
    paddingInline: theme.spacing(1),
    paddingBlock: theme.spacing(0.5),
    borderRadius: 999,
    fontSize: '0.7rem',
    fontWeight: 600,
    backgroundColor: bgMap[variant],
    color: theme.palette.common.white,
  };
});

export const DayEventTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  fontWeight: 700,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

export const DayEventSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

export const CalendarPanelFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.neutral.main}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const DayEmptyState = styled(Box)(({ theme }) => ({
  border: `1px dashed ${theme.palette.neutral.main}`,
  backgroundColor: theme.palette.background.default,
  borderRadius: 8,
  paddingInline: theme.spacing(4),
  paddingBlock: theme.spacing(5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: theme.spacing(1.5),
}));

export const DayEmptyStateIconWrapper = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: theme.palette.accent.light,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
}));

export const DayEmptyStateTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

export const DayEmptyStateSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  maxWidth: 360,
}));
