'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import SessionTimeoutModal from '@/components/SessionTimeoutModal';
import { clearSessionStorage } from '@/utils/session/clearSessionStorage';
import { refreshUserToken } from '@/services/userAuthService';
import { initSessionStorageFromSessionResponse } from '@/utils/session/initSessionStorageFromSessionResponse';

const TOKEN_REFRESH_THRESHOLD_SECONDS = 300;

type SessionContextType = {
  isSessionActive: boolean;
  secondsUntilIdleLogout: number;
  secondsUntilTokenExpires: number;
  isRefreshing: boolean;
  forceLogout: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [secondsUntilIdleLogout, setSecondsUntilIdleLogout] = useState(0);
  const [secondsUntilTokenExpires, setSecondsUntilTokenExpires] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivity = useRef<number | null>(null);
  const hasUserInteracted = useRef(false);
  const idleTimeoutMsRef = useRef<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const expiresAtStr = localStorage.getItem('userTokenExpiresAt');
    const idleTimeoutStr = localStorage.getItem('userIdleTimeout');

    if (!token || !expiresAtStr) {
      logout('Sesión no encontrada');
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = parseInt(expiresAtStr, 10);

    if (now >= expiresAt) {
      logout('Sesión expirada');
      return;
    }

    const idleTimeoutMinutes = parseFloat(idleTimeoutStr ?? '0.3');
    const idleTimeoutMs = idleTimeoutMinutes * 60 * 1000;
    idleTimeoutMsRef.current = idleTimeoutMs;

    setIsSessionActive(true);
    setSecondsUntilTokenExpires(expiresAt - now);
    setSecondsUntilIdleLogout(idleTimeoutMinutes * 60);
    startIdleTimer(idleTimeoutMs);

    const interval = setInterval(() => {
      updateIdleCountdown(idleTimeoutMinutes * 60);
      checkTokenValidity();
    }, 1000);

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const handleActivity = () => {
      console.log('[Session] Activity detected');
      hasUserInteracted.current = true;
      lastActivity.current = Date.now();
      resetIdleTimer(idleTimeoutMsRef.current);
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      clearInterval(interval);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearTimeout(idleTimer.current as NodeJS.Timeout);
    };
  }, []);

  function getSecondsIdle(): number {
    if (!lastActivity.current) return Infinity;
    return (Date.now() - lastActivity.current) / 1000;
  }

  function startIdleTimer(timeoutMs: number) {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      console.log('[IdleTimer] Anterior timer limpiado');
    }

    idleTimer.current = setTimeout(() => {
      console.log('[IdleTimer] Ejecutando logout por inactividad');
      const minutesIdle = getSecondsIdle() / 60;
      const idleTimeout = parseFloat(localStorage.getItem('userIdleTimeout') || '0.3');
      if (minutesIdle >= idleTimeout) {
        logout('Inactividad detectada');
      }
    }, timeoutMs);

    console.log('[IdleTimer] Nuevo timer configurado:', timeoutMs, 'ms');
  }

  function resetIdleTimer(timeoutMs: number) {
    console.log('[IdleTimer] Reiniciando timer por actividad');
    startIdleTimer(timeoutMs);
  }

  function updateIdleCountdown(timeoutSeconds: number) {
    const secondsIdle = getSecondsIdle();
    const secondsLeft = Math.max(0, timeoutSeconds - secondsIdle);
    setSecondsUntilIdleLogout(Math.floor(secondsLeft));
  }

  function checkTokenValidity() {
    const token = localStorage.getItem('userToken');
    const expiresAtStr = localStorage.getItem('userTokenExpiresAt');

    if (!token || !expiresAtStr) {
      logout('Token ausente o vencido');
      return;
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = expiresAt - now;

    setSecondsUntilTokenExpires(Math.max(0, timeLeft));

    if (timeLeft <= 0) {
      logout('Token expirado');
    } else if (
      timeLeft <= TOKEN_REFRESH_THRESHOLD_SECONDS &&
      hasUserInteracted.current &&
      getSecondsIdle() < 60 &&
      !isRefreshing
    ) {
      refreshTokenSilently();
    } else if (timeLeft <= TOKEN_REFRESH_THRESHOLD_SECONDS && !hasUserInteracted.current) {
      console.log('[Session] No se refresca token: sin actividad del usuario desde login');
    }
  }

  async function refreshTokenSilently() {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) throw new Error('No refresh token');

      const res = await refreshUserToken(storedRefreshToken);
      initSessionStorageFromSessionResponse(res);

      console.log('[Session] Token refreshed por actividad reciente');
    } catch (err) {
      console.error('[Session] Error refreshing token:', err);
      logout('Error al refrescar token');
    } finally {
      setIsRefreshing(false);
    }
  }

  function logout(reason: string) {
    console.log('[SessionProvider] Logout:', reason);
    setIsSessionActive(false);
    clearSessionStorage();
    router.push('/login');
  }

  return (
    <SessionContext.Provider
      value={{
        isSessionActive,
        secondsUntilIdleLogout,
        secondsUntilTokenExpires,
        isRefreshing,
        forceLogout: () => logout('Logout manual'),
      }}
    >
      {secondsUntilIdleLogout <= 30 && secondsUntilIdleLogout > 0 && (
        <SessionTimeoutModal
          secondsLeft={secondsUntilIdleLogout}
          onStayActive={() => {
            resetIdleTimer(idleTimeoutMsRef.current);
          }}
        />
      )}
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}
