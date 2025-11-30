import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import BuildIcon from '@mui/icons-material/Build';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import {
  NotificationsDrawerRoot,
  DrawerHeader,
  DrawerHeaderRow,
  DrawerHeaderText,
  DrawerHeaderTitle,
  DrawerHeaderSubtitle,
  DrawerHeaderCloseButton,
  NotificationsListContainer,
  NotificationsList,
  NotificationItemButton,
  NotificationAvatarWrapper,
  NotificationAvatar,
  UnreadDot,
  NotificationFooter,
  ViewAllNotificationsLink,
  NotificationTextContainer,
  NotificationTitle,
  NotificationMessage,
  NotificationTimestamp,
  NotificationActions,
  ActionIconButton,
  ActionChevronIcon,
  NotificationsDivider,
} from './NotificationsDrawer.styled';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export type NotificationDomain =
  | 'vehicle'
  | 'workshop'
  | 'user'
  | 'report'
  | 'system';

export type NotificationIconKey =
  | 'vehicle'
  | 'battery'
  | 'wrench'
  | 'bell'
  | 'report'
  | 'user-add';

export type NotificationEvent = string;

export type NotificationAction = {
  type: 'navigate';
  url: string;
  label?: string;
};

export type NotificationNotifiable = {
  type: string;
  id: string;
  plate?: string;
  code?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message?: string;
  createdAt: string;
  readAt: string | null;

  severity: NotificationSeverity;
  domain: NotificationDomain;
  event: NotificationEvent;
  iconKey: NotificationIconKey;

  actionable: boolean;
  action?: NotificationAction;
  notifiable?: NotificationNotifiable;
};

export type NotificationsDrawerProps = {
  open: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  onViewAll?: () => void;
};

const ICON_BY_KEY: Record<NotificationIconKey, React.ReactNode> = {
  vehicle: <DirectionsCarIcon fontSize="small" />,
  battery: <BatteryAlertIcon fontSize="small" />,
  wrench: <BuildIcon fontSize="small" />,
  bell: <NotificationsIcon fontSize="small" />,
  report: <DescriptionIcon fontSize="small" />,
  'user-add': <PersonAddIcon fontSize="small" />,
};

const formatNotificationTimestamp = (createdAt: string): string => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }
  return date.toLocaleString();
};

export function NotificationsDrawer({
  open,
  onClose,
  notifications = [],
  onMarkAsRead,
  onNotificationClick,
  onViewAll,
}: NotificationsDrawerProps) {
  const theme = useTheme();

  const handleItemClick = (notification: NotificationItem) => {
    if (!notification.actionable) return;
    onNotificationClick?.(notification);
  };

  const getTypeColor = (severity: NotificationSeverity): string => {
    switch (severity) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      case 'info':
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <NotificationsDrawerRoot anchor="right" open={open} onClose={onClose}>
      <DrawerHeader>
        <DrawerHeaderRow>
          <DrawerHeaderText>
            <DrawerHeaderTitle>
              Notifications
            </DrawerHeaderTitle>
            <DrawerHeaderSubtitle>
              Latest updates in your account
            </DrawerHeaderSubtitle>
          </DrawerHeaderText>

          <DrawerHeaderCloseButton onClick={onClose}>
            <CloseIcon />
          </DrawerHeaderCloseButton>
        </DrawerHeaderRow>
      </DrawerHeader>

      <NotificationsDivider />

      <NotificationsListContainer>
        <NotificationsList>
          {notifications.map((notification) => {
            const typeColor = getTypeColor(notification.severity);
            const isRead = Boolean(notification.readAt);
            const timestampLabel = formatNotificationTimestamp(
              notification.createdAt,
            );

            return (
              <NotificationItemButton
                key={notification.id}
                read={isRead}
                actionable={notification.actionable}
                onClick={() => handleItemClick(notification)}
              >
                {!isRead && <UnreadDot />}

                <NotificationAvatarWrapper>
                  <NotificationAvatar
                    style={{
                      backgroundColor: `${typeColor}1A`,
                      color: typeColor,
                    }}
                  >
                    {ICON_BY_KEY[notification.iconKey]}
                  </NotificationAvatar>
                </NotificationAvatarWrapper>

                <NotificationTextContainer>
                  <NotificationTitle>{notification.title}</NotificationTitle>

                  {notification.message && (
                    <NotificationMessage>{notification.message}</NotificationMessage>
                  )}

                  <NotificationTimestamp>{timestampLabel}</NotificationTimestamp>
                </NotificationTextContainer>

                <NotificationActions>
                  {!isRead && onMarkAsRead && (
                    <ActionIconButton
                      className="action-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                    >
                      <CheckIcon fontSize="small" />
                    </ActionIconButton>
                  )}

                  {notification.actionable && (
                    <ActionChevronIcon className="action-icon" />
                  )}
                </NotificationActions>
              </NotificationItemButton>
            );
          })}
        </NotificationsList>
      </NotificationsListContainer>

      <NotificationsDivider />
      <NotificationFooter>
        <ViewAllNotificationsLink variant="body2" onClick={onViewAll}>
          View all notifications →
        </ViewAllNotificationsLink>
      </NotificationFooter>
    </NotificationsDrawerRoot>
  );
}

export default NotificationsDrawer;