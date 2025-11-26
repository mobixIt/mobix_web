import { styled } from '@mui/material/styles';
import { Dialog, Box } from '@mui/material';

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 0,
    boxShadow: theme.shadows[8],
  },
}));

export const StyledFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing()
}));
