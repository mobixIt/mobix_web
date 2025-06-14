'use client';

import { TextField, TextFieldProps } from '@mui/material';

export default function BaseTextField(props: TextFieldProps) {
  return (
    <TextField
      variant="filled"
      fullWidth
      margin="normal"
      {...props}
    />
  );
}