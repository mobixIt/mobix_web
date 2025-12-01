import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

export const MobixFileUploadRoot = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6, 3),
  borderRadius: theme.shape.borderRadius,
  border: `2px dashed ${theme.palette.neutral.main}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.paper,
  transition:
    'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease',

  '&:hover': {
    borderColor: theme.palette.secondary.main,
    backgroundColor: theme.palette.neutral.light,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transform: 'translateY(-1px)',
  },

  '&.MobixFileUpload--dragOver': {
    borderColor: theme.palette.secondary.main,
    backgroundColor: theme.palette.accent.light,
  },
}));