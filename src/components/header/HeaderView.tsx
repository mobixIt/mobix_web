import * as React from 'react';
import { Tooltip, ListItemText } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import {
  NotificationsNone,
  CalendarMonth,
  PersonOutline,
  Logout,
} from '@mui/icons-material';

import {
  HeaderRoot,
  HeaderLeft,
  HeaderRight,
  IconSquareButton,
  AvatarButton,
  AvatarCircle,
  UserMenuContent,
  NotificationBadge,
  UserMenu,
  StyledDivider,
  StyledListItemIcon,
  StyledMenuItem,
} from './Header.styled';
import UserCard from '@/components/user-card/UserCard';
import { getUserAvatarUrl } from '@/services/avatarService';
import NotificationsDrawer, {
  NotificationItem,
} from '@/components/notifications/NotificationsDrawer';
import { CalendarFlyout } from '@/components/calendar-flyout/CalendarFlyout';
import type { CalendarFlyoutProps, DayData } from '@/components/calendar-flyout/CalendarFlyout.types';

export type HeaderViewProps = {
  userName: string;
  userEmail: string;
  avatarUrl?: string;

  notifications: NotificationItem[];
  notificationsOpen: boolean;
  notificationsCount?: number;
  onOpenNotifications: () => void;
  onCloseNotifications: () => void;
  onMarkNotificationAsRead: (id: string) => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  onViewAllNotifications?: () => void;

  onCalendarClick?: () => void;

  calendarDaysByDate?: Record<string, DayData>;
  calendarInitialMonth?: CalendarFlyoutProps['initialMonth'];
  calendarInitialSelectedDate?: CalendarFlyoutProps['initialSelectedDate'];
  onOpenFullCalendar?: CalendarFlyoutProps['onOpenFullCalendar'];
  onCreateCalendarEvent?: CalendarFlyoutProps['onCreateEvent'];
  onCalendarDayClick?: CalendarFlyoutProps['onDayClick'];

  onMyAccountClick?: () => void;
  onLogoutClick?: () => void;
};

const getDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export function HeaderView({
  userName,
  userEmail,
  avatarUrl,
  notifications,
  notificationsOpen,
  notificationsCount = 0,
  onOpenNotifications,
  onCloseNotifications,
  onMarkNotificationAsRead,
  onNotificationClick,
  onViewAllNotifications,
  onCalendarClick,
  calendarDaysByDate,
  calendarInitialMonth,
  calendarInitialSelectedDate,
  onOpenFullCalendar,
  onCreateCalendarEvent,
  onCalendarDayClick,
  onMyAccountClick,
  onLogoutClick,
}: HeaderViewProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const userMenuOpen = Boolean(anchorEl);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMyAccount = () => {
    onMyAccountClick?.();
    handleCloseMenu();
  };

  const handleLogout = () => {
    onLogoutClick?.();
    handleCloseMenu();
  };

  const showBadge = notificationsCount > 0;

  const resolvedAvatarUrl =
    avatarUrl || getUserAvatarUrl(userEmail || userName);

  const hasTodayCalendarEvents = React.useMemo(() => {
    if (!calendarDaysByDate) return false;

    const today = new Date();
    const key = getDateKey(today);
    const dayData = calendarDaysByDate[key];

    if (!dayData) return false;

    const hasDots = Array.isArray(dayData.dots) && dayData.dots.length > 0;
    const hasEvents = Array.isArray(dayData.events) && dayData.events.length > 0;

    return hasDots || hasEvents;
  }, [calendarDaysByDate]);

  const handleCalendarButtonClick = () => {
    setCalendarOpen((prev) => !prev);
    onCalendarClick?.();
  };

  const handleCloseCalendar = () => {
    if (calendarOpen) {
      setCalendarOpen(false);
    }
  };

  return (
    <>
      <HeaderRoot>
        <HeaderLeft />
        <HeaderRight>
          <Tooltip title="Notificaciones">
            <IconSquareButton
              aria-label="notifications"
              onClick={onOpenNotifications}
              className={notificationsOpen ? 'active' : undefined}
            >
              <NotificationBadge
                invisible={!showBadge}
                badgeContent={notificationsCount}
                color="error"
                overlap="circular"
              >
                <NotificationsNone />
              </NotificationBadge>
            </IconSquareButton>
          </Tooltip>

          {/* Calendar: botón + flyout envueltos en el mismo ClickAwayListener */}
          <ClickAwayListener onClickAway={handleCloseCalendar}>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <Tooltip title="Calendario">
                <IconSquareButton
                  onClick={handleCalendarButtonClick}
                  aria-label="calendar"
                  className={calendarOpen ? 'active' : undefined}
                >
                  <NotificationBadge
                    variant="dot"
                    invisible={!hasTodayCalendarEvents}
                    color="secondary"
                    overlap="circular"
                  >
                    <CalendarMonth />
                  </NotificationBadge>
                </IconSquareButton>
              </Tooltip>

              <CalendarFlyout
                open={calendarOpen}
                daysByDate={calendarDaysByDate ?? {}}
                initialMonth={calendarInitialMonth}
                initialSelectedDate={calendarInitialSelectedDate}
                onOpenFullCalendar={onOpenFullCalendar}
                onCreateEvent={onCreateCalendarEvent}
                onDayClick={onCalendarDayClick}
              />
            </div>
          </ClickAwayListener>

          <AvatarButton
            onClick={handleAvatarClick}
            className={userMenuOpen ? 'active' : undefined}
          >
            <AvatarCircle src={resolvedAvatarUrl} alt={userName}>
              {!resolvedAvatarUrl && userName?.[0]?.toUpperCase()}
            </AvatarCircle>
          </AvatarButton>

          <UserMenu
            anchorEl={anchorEl}
            open={userMenuOpen}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <UserMenuContent>
              <UserCard
                name={userName}
                email={userEmail}
                avatarUrl={resolvedAvatarUrl}
              />
            </UserMenuContent>
            <StyledDivider />
            <StyledMenuItem onClick={handleMyAccount}>
              <StyledListItemIcon className="menu-item-icon">
                <PersonOutline fontSize="small" />
              </StyledListItemIcon>
              <ListItemText primary="Mi cuenta" />
            </StyledMenuItem>

            <StyledMenuItem onClick={handleLogout}>
              <StyledListItemIcon className="menu-item-icon">
                <Logout fontSize="small" />
              </StyledListItemIcon>
              <ListItemText primary="Cerrar sesión" />
            </StyledMenuItem>
          </UserMenu>
        </HeaderRight>
      </HeaderRoot>

      <NotificationsDrawer
        open={notificationsOpen}
        onClose={onCloseNotifications}
        notifications={notifications}
        onMarkAsRead={onMarkNotificationAsRead}
        onNotificationClick={onNotificationClick}
        onViewAll={onViewAllNotifications}
      />
    </>
  );
}

export default HeaderView;
