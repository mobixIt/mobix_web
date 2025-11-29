import { styled, alpha } from '@mui/material/styles';
import { IconButton, Avatar, Box, Badge, Menu, Divider, ListItemIcon, MenuItem } from '@mui/material';

export const HeaderRoot = styled('header')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 74,
  paddingInline: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow:
    'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px',
}));

export const HeaderLeft = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

export const HeaderRight = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
});

export const IconSquareButton = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 46,
  borderRadius: 8,
  border: `1px solid ${theme.palette.grey[300]}`,
  backgroundColor: theme.palette.common.white,
  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition:
    'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, background-color 0.16s ease',

  '& .MuiSvgIcon-root': {
    color: theme.palette.text.secondary,
    fontSize: 24,
  },

  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: `0 12px 30px ${alpha(theme.palette.secondary.main, 0.18)}`,
    borderColor: theme.palette.secondary.main,
    backgroundColor: theme.palette.common.white,

    '& .MuiSvgIcon-root': {
      color: theme.palette.secondary.main,
    },
  },
}));

export const AvatarButton = styled(IconButton)(({ theme }) => ({
  padding: 0,
  borderRadius: '50%',
  border: `2px solid ${theme.palette.grey[300]}`,
  transition: 'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease',

  '&:hover': {
    borderColor: theme.palette.secondary.main,
    transform: 'translateY(-1px)',
    boxShadow: `0 12px 30px ${alpha(theme.palette.secondary.main, 0.18)}`,
  },

  '&.active': {
    borderColor: theme.palette.secondary.main,
    transform: 'translateY(-1px)',
    boxShadow: `0 12px 30px ${alpha(theme.palette.secondary.main, 0.18)}`,
  },
}));

export const AvatarCircle = styled(Avatar)(() => ({
  width: 44,
  height: 44,
}));

export const UserMenuContent = styled(Box)(() => ({
  padding: 0,
}));

export const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    fontWeight: 700,
    fontSize: 12,
    minWidth: 20,
    height: 20,
    borderRadius: 11,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    top: -4,
    right: -4,
  },
}));

export const UserMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    marginTop: theme.spacing(1.5),
    borderRadius: 4,
    boxShadow: '0 18px 45px rgba(15, 23, 42, 0.25)',
    minWidth: 280,
    overflow: 'hidden',
    padding: 0,
  },
}));

export const StyledDivider = styled(Divider)(({ theme }) => ({
  borderColor: theme.palette.grey[300],
  marginBottom: theme.spacing(0.75),
}));

export const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  '&&': {
    minWidth: 0,
    width: 16,
    height: 16,
    marginRight: theme.spacing(1.5),
    color: theme.palette.grey[400],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
  }
}));

export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  fontSize: '0.875rem',
  color: theme.palette.grey[700],
  transition: 'background-color 150ms ease',
  
  '&:hover': {
    backgroundColor: theme.palette.grey[50],

    '& .MuiListItemIcon-root': {
      color: theme.palette.secondary.main,
    },
  },
}));