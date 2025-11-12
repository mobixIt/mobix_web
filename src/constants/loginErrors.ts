export const loginErrorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Credenciales inválidas. Verifica tu ID o correo y tu contraseña.',
  ACCOUNT_INACTIVE: 'Tu cuenta está inactiva. Comunícate con tu administrador.',
  NO_ROLE_ACCESS: 'No tienes roles asignados en ninguna empresa. Comunícate con tu administrador.',
  NO_TENANT_ACCESS: 'No tienes acceso a ninguna empresa. Contacta al administrador.',
  TOO_MANY_ATTEMPTS: 'Has excedido el número máximo de intentos. Intenta nuevamente más tarde.',
  LOGIN_FAILED: 'No se pudo iniciar sesión. Verifica tus datos e intenta nuevamente.',
  SESSION_ALREADY_ACTIVE: 'Ya tienes una sesión activa. Cierra la sesión en otro dispositivo para continuar.',
  NO_ACTIVE_TENANT: 'No tienes empresas activas asociadas. Comunícate con tu administrador para reactivar tu acceso.',
  NO_MEMBERSHIP: 'Tu usuario no tiene membresías activas. Comunícate con tu administrador para obtener acceso.',
};