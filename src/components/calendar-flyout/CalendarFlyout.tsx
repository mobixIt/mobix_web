import React, { useMemo, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { getDateKey } from '@/utils/date';

import { MobixButton } from '@/components/mobix/button/MobixButton';
import { MobixButtonOutlined } from '@/components/mobix/button/MobixButtonOutlined';
import { MobixButtonText } from '@/components/mobix/button/MobixButtonText';

import {
  CalendarFlyoutRoot,
  CalendarPanelHeader,
  CalendarHeaderLeft,
  CalendarHeaderTitle,
  CalendarHeaderSubtitle,
  CalendarHeaderActions,
  CalendarNavButton,
  CalendarMainContent,
  MiniCalendarSection,
  DayDetailPanel,
  MonthTitleRow,
  MonthTitle,
  HeatLegend,
  HeatLegendItem,
  HeatLegendSwatch,
  WeekdayHeaderRow,
  WeekdayHeaderCell,
  CalendarGrid,
  HeatDayTile,
  DayNumber,
  DayDotsRow,
  DayDot,
  CriticalBadge,
  DayDetailHeader,
  DayDetailTitle,
  DayDetailChipsRow,
  DayDetailChip,
  DayEventsList,
  DayEventRow,
  DayEventHeaderRow,
  DayEventHeaderLeft,
  DayEventIconWrapper,
  DayEventTime,
  DayEventPill,
  DayEventTitle,
  DayEventSubtitle,
  CalendarPanelFooter,
  DayEmptyState,
  DayEmptyStateIconWrapper,
  DayEmptyStateTitle,
  DayEmptyStateSubtitle,
} from './CalendarFlyout.styled';

import type {
  CalendarFlyoutProps,
  DayData,
  HeatLevel,
  DayDotVariant,
} from './CalendarFlyout.types';

import { WEEKDAYS } from './CalendarFlyout.constants';

export const CalendarFlyout: React.FC<CalendarFlyoutProps> = ({
  open,
  daysByDate,
  initialMonth,
  initialSelectedDate,
  onOpenFullCalendar,
  onCreateEvent,
  onDayClick,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    initialMonth ?? new Date(),
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialSelectedDate ?? null,
  );

  const handlePrevMonth = () =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );

  const handleNextMonth = () =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      }),
    [currentMonth],
  );

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    for (let i = 0; i < 42; i += 1) {
      let dayNumber: number;
      let cellMonth = month;
      let cellYear = year;
      let outside = false;

      if (i < startWeekday) {
        dayNumber = daysInPrevMonth - (startWeekday - 1 - i);
        cellMonth = month - 1;
        if (cellMonth < 0) {
          cellMonth = 11;
          cellYear = year - 1;
        }
        outside = true;
      } else if (i >= startWeekday + daysInMonth) {
        dayNumber = i - (startWeekday + daysInMonth) + 1;
        cellMonth = month + 1;
        if (cellMonth > 11) {
          cellMonth = 0;
          cellYear = year + 1;
        }
        outside = true;
      } else {
        dayNumber = i - startWeekday + 1;
      }

      cells.push({
        date: new Date(cellYear, cellMonth, dayNumber),
        outsideMonth: outside,
      });
    }

    return cells;
  }, [currentMonth]);

  const selectedKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedDayData = selectedKey ? daysByDate[selectedKey] : undefined;

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    onDayClick?.(date);
  };

  const renderDayTooltipContent = (dayData?: DayData) => {
    if (!dayData?.dots?.length) return null;

    const labels: Record<DayDotVariant, string> = {
      maintenance: 'Mantenimiento',
      critical: 'Alerta crítica',
      expiry: 'Vencimiento de documento',
      dispatch: 'Cambio de despacho',
      admin: 'Administrativo',
    };

    const counts: Partial<Record<DayDotVariant, number>> = {};
    dayData.dots.forEach((d) => {
      counts[d] = (counts[d] || 0) + 1;
    });

    return (
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          {dayData.dots.length} eventos
        </div>
        {Object.entries(counts).map(([variant, count]) => (
          <div key={variant}>
            • {labels[variant as DayDotVariant]} ({count})
          </div>
        ))}
      </div>
    );
  };

  const renderEventIcon = (variant: DayDotVariant) => {
    switch (variant) {
      case 'critical':
        return <WarningAmberIcon fontSize="small" />;
      case 'expiry':
        return <DescriptionIcon fontSize="small" />;
      case 'maintenance':
        return <BuildIcon fontSize="small" />;
      case 'dispatch':
        return <AltRouteIcon fontSize="small" />;
      default:
        return <AccessTimeIcon fontSize="small" />;
    }
  };

  const handleCreateEvent = () => {
    if (selectedDate) onCreateEvent?.(selectedDate);
  };

  if (!open) return null;

  return (
    <CalendarFlyoutRoot>
      <CalendarPanelHeader>
        <CalendarHeaderLeft>
          <CalendarHeaderTitle>Calendario operativo</CalendarHeaderTitle>
          <CalendarHeaderSubtitle>
            Resumen de actividad operativa
          </CalendarHeaderSubtitle>
        </CalendarHeaderLeft>

        <CalendarHeaderActions>
          <CalendarNavButton onClick={handlePrevMonth} size="small">
            <ChevronLeftIcon fontSize="small" />
          </CalendarNavButton>

          <MobixButtonOutlined onClick={handleToday} color="secondary">
            Hoy
          </MobixButtonOutlined>

          <CalendarNavButton onClick={handleNextMonth} size="small">
            <ChevronRightIcon fontSize="small" />
          </CalendarNavButton>
        </CalendarHeaderActions>
      </CalendarPanelHeader>

      <CalendarMainContent>
        <MiniCalendarSection>
          <MonthTitleRow>
            <MonthTitle>{monthLabel}</MonthTitle>

            <HeatLegend>
              <HeatLegendItem>
                <HeatLegendSwatch level="light" />
                <span>0–3</span>
              </HeatLegendItem>

              <HeatLegendItem>
                <HeatLegendSwatch level="medium" />
                <span>4–7</span>
              </HeatLegendItem>

              <HeatLegendItem>
                <HeatLegendSwatch level="high" />
                <span>8–12</span>
              </HeatLegendItem>

              <HeatLegendItem>
                <HeatLegendSwatch level="critical" />
                <span>12+</span>
              </HeatLegendItem>
            </HeatLegend>
          </MonthTitleRow>

          <WeekdayHeaderRow>
            {WEEKDAYS.map((wd) => (
              <WeekdayHeaderCell key={wd}>{wd}</WeekdayHeaderCell>
            ))}
          </WeekdayHeaderRow>

          <CalendarGrid>
            {calendarCells.map(({ date, outsideMonth }) => {
              const key = getDateKey(date);
              const dayData = daysByDate[key];

              const heatLevel: HeatLevel =
                dayData?.heatLevel ?? 'veryLight';

              const isSelected =
                selectedDate &&
                getDateKey(selectedDate) === key &&
                !outsideMonth;

              const isCritical = !!dayData?.critical;

              const tooltip = renderDayTooltipContent(dayData);

              const node = (
                <HeatDayTile
                  key={key}
                  heatLevel={heatLevel}
                  selected={isSelected ?? false}
                  outsideMonth={outsideMonth}
                  isCritical={isCritical}
                  onClick={() => handleDayClick(date)}
                >
                  {isCritical && (
                    <CriticalBadge>
                      <WarningAmberIcon sx={{ fontSize: 10 }} />
                    </CriticalBadge>
                  )}

                  <DayNumber outsideMonth={outsideMonth}>
                    {date.getDate()}
                  </DayNumber>

                  {dayData?.dots?.length ? (
                    <DayDotsRow>
                      {dayData.dots.slice(0, 3).map((d, i) => (
                        <DayDot key={`${key}-${i}`} variant={d} />
                      ))}
                      {dayData.dots.length > 3 && (
                        <span style={{ fontSize: 10 }}>
                          +{dayData.dots.length - 3}
                        </span>
                      )}
                    </DayDotsRow>
                  ) : null}
                </HeatDayTile>
              );

              return tooltip ? (
                <Tooltip key={key} title={tooltip} arrow placement="top">
                  <div>{node}</div>
                </Tooltip>
              ) : (
                node
              );
            })}
          </CalendarGrid>
        </MiniCalendarSection>

        <DayDetailPanel>
          <DayDetailHeader>
            <DayDetailTitle>
              {selectedDate
                ? `${selectedDate.toLocaleString('default', {
                    month: 'long',
                  })} ${selectedDate.getDate()}${
                    selectedDayData?.events?.length
                      ? ` — ${selectedDayData.events.length} eventos`
                      : ''
                  }`
                : 'Selecciona un día'}
            </DayDetailTitle>

            {selectedDayData?.metrics && (
              <DayDetailChipsRow>
                {selectedDayData.metrics.critical > 0 && (
                  <DayDetailChip variant="critical">
                    {selectedDayData.metrics.critical} críticos
                  </DayDetailChip>
                )}
                {selectedDayData.metrics.important > 0 && (
                  <DayDetailChip variant="important">
                    {selectedDayData.metrics.important} importantes
                  </DayDetailChip>
                )}
                {selectedDayData.metrics.scheduled > 0 && (
                  <DayDetailChip variant="scheduled">
                    {selectedDayData.metrics.scheduled} programados
                  </DayDetailChip>
                )}
              </DayDetailChipsRow>
            )}
          </DayDetailHeader>

          <DayEventsList disablePadding>
            {selectedDayData?.events?.length ? (
              selectedDayData.events.map((e) => (
                <DayEventRow key={e.id}>
                  <DayEventHeaderRow>
                    <DayEventHeaderLeft>
                      <DayEventIconWrapper variant={e.pillVariant}>
                        {renderEventIcon(e.iconVariant)}
                      </DayEventIconWrapper>

                      <DayEventTime>{e.timeLabel}</DayEventTime>
                    </DayEventHeaderLeft>

                    <DayEventPill variant={e.pillVariant}>
                      {e.pillLabel}
                    </DayEventPill>
                  </DayEventHeaderRow>

                  <DayEventTitle>{e.title}</DayEventTitle>
                  <DayEventSubtitle>{e.subtitle}</DayEventSubtitle>
                </DayEventRow>
              ))
            ) : (
              <DayEmptyState>
                <DayEmptyStateIconWrapper>
                  <CalendarMonthIcon sx={{ color: 'accent.main', fontSize: 24 }} />
                </DayEmptyStateIconWrapper>

                <DayEmptyStateTitle variant="subtitle1">
                  No hay eventos para este día.
                </DayEmptyStateTitle>

                <DayEmptyStateSubtitle variant="body2">
                  No se registran actividades programadas para este día.
                </DayEmptyStateSubtitle>
              </DayEmptyState>
            )}
          </DayEventsList>
        </DayDetailPanel>
      </CalendarMainContent>

      <CalendarPanelFooter>
        <MobixButtonText onClick={onOpenFullCalendar} sx={{ p: 0 }}>
          Abrir calendario completo →
        </MobixButtonText>

        <MobixButton onClick={handleCreateEvent} variant="contained">
          Crear evento
        </MobixButton>
      </CalendarPanelFooter>
    </CalendarFlyoutRoot>
  );
};

export default CalendarFlyout;