'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import SessionTimeoutModal from '@/components/SessionTimeoutModal';
import { refreshUserToken, notifyBackendOfActivity } from '@/services/userAuthService';
import { initSessionStorageFromSessionResponse } from '@/utils/sessionAuthStorage';

const TOKEN_REFRESH_THRESHOLD_SECONDS = 300; // 5 min
const BACKEND_NOTIFY_INTERVAL_MS = 60_000;

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
  const lastBackendNotify = useRef<number>(0);

  useEffect(() => {
    // ahora solo miramos lo que guardó initSessionStorageFromSessionResponse
    const expiresAtStr = localStorage.getItem('userTokenExpiresAt');
    const idleTimeoutStr = localStorage.getItem('userIdleTimeout');

    if (!expiresAtStr) {
      logout('Sesión no encontrada');
      return;
    }

    const expiresAtMs = parseInt(expiresAtStr, 10);
    const nowMs = Date.now();

    if (nowMs >= expiresAtMs) {
      logout('Sesión expirada');
      return;
    }

    // idle timeout en minutos → a ms
    const idleTimeoutMinutes = parseFloat(idleTimeoutStr ?? '0.3');
    const idleTimeoutMs = idleTimeoutMinutes * 60 * 1000;
    idleTimeoutMsRef.current = idleTimeoutMs;

    setIsSessionActive(true);

    // segundos hasta que expire el token
    const secondsLeft = Math.floor((expiresAtMs - nowMs) / 1000);
    setSecondsUntilTokenExpires(secondsLeft);
    setSecondsUntilIdleLogout(idleTimeoutMinutes * 60);

    startIdleTimer(idleTimeoutMs);

    const interval = setInterval(() => {
      updateIdleCountdown(idleTimeoutMinutes * 60);
      checkTokenValidity();
    }, 1000);

    const backendNotifyInterval = setInterval(() => {
      const now = Date.now();
      const secondsSinceLastActivity = getSecondsIdle();

      if (
        hasUserInteracted.current &&
        secondsSinceLastActivity < idleTimeoutMsRef.current / 1000 &&
        now - lastBackendNotify.current > BACKEND_NOTIFY_INTERVAL_MS
      ) {
        notifyBackendOfActivity();
        lastBackendNotify.current = now;
      }
    }, 5_000);

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const handleActivity = () => {
      hasUserInteracted.current = true;
      lastActivity.current = Date.now();
      resetIdleTimer(idleTimeoutMsRef.current);
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      clearInterval(interval);
      clearInterval(backendNotifyInterval);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  function getSecondsIdle(): number {
    if (!lastActivity.current) return Infinity;
    return (Date.now() - lastActivity.current) / 1000;
  }

  function startIdleTimer(timeoutMs: number) {
    if (idleTimer.current) clearTimeout(idleTimer.current);

    idleTimer.current = setTimeout(() => {
      const minutesIdle = getSecondsIdle() / 60;
      const idleTimeout = parseFloat(localStorage.getItem('userIdleTimeout') || '0.3');
      if (minutesIdle >= idleTimeout) {
        logout('Inactividad detectada');
      }
    }, timeoutMs);
  }

  function resetIdleTimer(timeoutMs: number) {
    startIdleTimer(timeoutMs);
  }

  function updateIdleCountdown(timeoutSeconds: number) {
    const secondsIdle = getSecondsIdle();
    const secondsLeft = Math.max(0, timeoutSeconds - secondsIdle);
    setSecondsUntilIdleLogout(Math.floor(secondsLeft));
  }

  function checkTokenValidity() {
    const expiresAtStr = localStorage.getItem('userTokenExpiresAt');
    if (!expiresAtStr) {
      logout('Expiración ausente');
      return;
    }

    const expiresAtMs = parseInt(expiresAtStr, 10);
    const nowMs = Date.now();
    const timeLeftSeconds = Math.floor((expiresAtMs - nowMs) / 1000);

    setSecondsUntilTokenExpires(Math.max(0, timeLeftSeconds));

    if (timeLeftSeconds <= 0) {
      logout('Sesión expirada');
    } else if (
      timeLeftSeconds <= TOKEN_REFRESH_THRESHOLD_SECONDS &&
      hasUserInteracted.current &&
      getSecondsIdle() < 60 &&
      !isRefreshing
    ) {
      refreshTokenSilently();
    }
  }

  async function refreshTokenSilently() {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      // ahora no mandamos refreshToken, solo golpeamos /auth/refresh
      const res = await refreshUserToken();
      // res debe venir como el login: { expires_at, idle_timeout_minutes }
      initSessionStorageFromSessionResponse(res);
    } catch (err) {
      console.error('[Session] Error refreshing token:', err);
      logout('Error al refrescar sesión');
    } finally {
      setIsRefreshing(false);
    }
  }

  function logout(reason: string) {
    console.log('[SessionProvider] Logout:', reason);
    setIsSessionActive(false);
    // opcional: limpiar localStorage de esas claves
    localStorage.removeItem('userTokenExpiresAt');
    localStorage.removeItem('userIdleTimeout');
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
