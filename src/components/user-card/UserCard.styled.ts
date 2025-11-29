import { styled } from '@mui/material/styles';
import { Box, Avatar, IconButton, Typography } from '@mui/material';

export const UserCardRoot = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

export const UserAvatar = styled(Avatar)(() => ({
  width: 36,
  height: 36,
}));

export const UserInfo = styled(Box)({
  minWidth: 0,
  flex: '1 1 auto',
});

export const OptionsButtonWrapper = styled(Box)({
  marginLeft: 'auto',
});

export const OptionsButton = styled(IconButton)({
  padding: 4,
});

export const UserName = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.palette.grey[900],
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const UserEmail = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.grey[500],
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));