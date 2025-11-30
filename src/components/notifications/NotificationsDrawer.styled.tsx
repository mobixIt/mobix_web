import {
  Divider,
  Drawer,
  Box,
  Typography,
  List,
  Avatar,
  ListItemButton,
  IconButton,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export const NotificationsDrawerRoot = styled(Drawer)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: 400,
    maxWidth: '100%',
    borderRadius: '6px 0 0 6px',
    boxShadow: '0 18px 45px rgba(15, 23, 42, 0.25)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
  },
}));

export const DrawerHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
}));

export const DrawerHeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5),
}));

export const DrawerHeaderText = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export const DrawerHeaderTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 500,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(0.5),
}));

export const DrawerHeaderSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

export const DrawerHeaderCloseButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  color: theme.palette.grey[400],
  transition: 'color 150ms ease',

  '&:hover': {
    color: theme.palette.grey[600],
  },

  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
  },
}));

export const NotificationsListContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  backgroundColor: alpha(theme.palette.background.default, 0.6),
  padding: theme.spacing(2),
}));

export const NotificationsList = styled(List)(({ theme }) => ({
  paddingTop: theme.spacing(0),
  paddingBottom: theme.spacing(0),
}));

export const NotificationItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'read' && prop !== 'actionable',
})<{
  read: boolean;
  actionable?: boolean;
}>(({ theme, read, actionable }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  padding: theme.spacing(1.5),
  paddingLeft: theme.spacing(2),
  borderRadius: 4,
  cursor: actionable ? 'pointer' : 'default',
  transition: `
    background-color 150ms ease,
    opacity 150ms ease,
    border-color 150ms ease
  `,
  gap: theme.spacing(1.5),

  ...(read
    ? {
        opacity: 0.75,
        backgroundColor: theme.palette.background.paper,
        borderLeft: '3px solid transparent',
      }
    : {
        backgroundColor: 'rgba(139, 210, 201, 0.08)',
        borderLeft: '3px solid rgba(101, 187, 176, 0.2)',
      }),

  '&:hover': actionable
    ? {
        backgroundColor:
          theme.palette.neutral?.light || 'rgba(243,244,246,1)',
      }
    : {},

  marginBottom: theme.spacing(1.5),

  '&:last-child': {
    marginBottom: 0,
  },

  '&:hover .action-icon': actionable
    ? { color: theme.palette.secondary.main }
    : {},
}));

export const NotificationAvatarWrapper = styled(Box)(() => ({
  position: 'relative',
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const NotificationAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  fontSize: 16,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.neutral.dark, 0.3)}`,
}));

export const UnreadDot = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 6,
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.secondary.main,
}));

export const NotificationFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  justifyContent: 'center',
}));

export const ViewAllNotificationsLink = styled(Typography)(({ theme }) => ({
  width: '100%',
  textAlign: 'center',
  fontSize: '0.875rem',
  cursor: 'pointer',
  color: theme.palette.accent.main,
  fontWeight: 500,
  transition: 'color 150ms ease, text-decoration 150ms ease',

  '&:hover': {
    textDecoration: 'underline',
    color: theme.palette.accent.dark,
  },
}));

export const StyledChevronRightIcon = styled(ChevronRightIcon)(({ theme }) => ({
  color: theme.palette.neutral.dark,
  fontSize: 18,
}));

export const NotificationTextContainer = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
  marginLeft: 8,
}));

export const NotificationTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const NotificationMessage = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: 4,
}));

export const NotificationTimestamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.disabled,
  marginTop: 4,
}));

export const NotificationActions = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}));

export const ActionIconButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  color: theme.palette.text.disabled,
  transition: 'color 150ms ease',
}));

export const ActionChevronIcon = styled(ChevronRightIcon)(({ theme }) => ({
  fontSize: 18,
  color: theme.palette.text.disabled,
  transition: 'color 150ms ease',
}));

export const NotificationsDivider = styled(Divider)(({ theme }) => ({
  borderColor: theme.palette.grey[200],
}));