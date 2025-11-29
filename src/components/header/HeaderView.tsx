import * as React from 'react';
import {
  Tooltip,
  ListItemText,
} from '@mui/material';
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

export type HeaderViewProps = {
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  notificationsCount?: number;
  onNotificationsClick?: () => void;
  onCalendarClick?: () => void;
  onMyAccountClick?: () => void;
  onLogoutClick?: () => void;
};

export function HeaderView({
  userName,
  userEmail,
  avatarUrl,
  notificationsCount = 0,
  onNotificationsClick,
  onCalendarClick,
  onMyAccountClick,
  onLogoutClick,
}: HeaderViewProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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

  return (
    <HeaderRoot>
      <HeaderLeft />
      <HeaderRight>
        <Tooltip title="Notificaciones">
          <IconSquareButton onClick={onNotificationsClick}>
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

        <Tooltip title="Calendario">
          <IconSquareButton onClick={onCalendarClick}>
            <CalendarMonth />
          </IconSquareButton>
        </Tooltip>

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
  );
}

export default HeaderView;