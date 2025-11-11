import { loginErrorMessages } from '@/constants/loginErrors';

export function getLoginErrorMessage(code?: string): string {
  return loginErrorMessages[code ?? '']
    ?? 'Ocurrió un error al intentar iniciar sesión. Inténtalo más tarde.';
}