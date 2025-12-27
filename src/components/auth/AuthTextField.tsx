'use client';

import * as React from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import {
  FieldRoot,
  Label,
  InputWrapper,
  Input,
  ToggleButton,
  ErrorText,
} from './AuthTextField.styled';

type AuthTextFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  label: string;
  error?: string;
  type?: 'text' | 'email' | 'password';
  showPasswordToggle?: boolean;
};

export default function AuthTextField({
  label,
  error,
  type = 'text',
  showPasswordToggle = false,
  id,
  ...rest
}: AuthTextFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const isPassword = type === 'password' && showPasswordToggle;

  const [showPassword, setShowPassword] = React.useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <FieldRoot>
      <Label htmlFor={inputId}>{label}</Label>

      <InputWrapper>
        <Input
          id={inputId}
          type={inputType}
          hasToggle={isPassword}
          suppressHydrationWarning
          {...rest}
        />

        {isPassword && (
          <ToggleButton
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={handleTogglePassword}
          >
            {showPassword ? (
              <VisibilityOff sx={{ width: 20, height: 20 }} />
            ) : (
              <Visibility sx={{ width: 20, height: 20 }} />
            )}
          </ToggleButton>
        )}
      </InputWrapper>

      {error && <ErrorText>{error}</ErrorText>}
    </FieldRoot>
  );
}
