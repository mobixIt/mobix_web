import { Alert, Box, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const LoginCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 480,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[6],
  animation: `${fadeInUp} 350ms ease-out`,
  overflow: 'hidden',
  zIndex: 10,
  [theme.breakpoints.down('md')]: {
    margin: theme.spacing(2),
  },
}));

export const AccentStripe = styled(Box)(({ theme }) => ({
  height: 4,
  background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`,
}));

export const CardContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
}));

export const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

export const LogoWrapper = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  marginBottom: theme.spacing(3),
}));

export const Form = styled('form')(() => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

export const FieldsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

export const HiddenInput = styled('input')({
  display: 'none',
});

export const ErrorAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const ForgotPasswordBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textAlign: 'center',
}));

export const PasswordToggleIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  transition: 'color 150ms ease',
  '&:hover': {
    color: theme.palette.secondary.main,
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.secondary.main}`,
    outlineOffset: 2,
  },
}));
