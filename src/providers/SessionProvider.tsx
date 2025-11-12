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

const BACKEND_NOTIFY_INTERVAL_MS = 60_000;
const IDLE_WARNING_THRESHOLD_SECONDS = 30;
const REFRESH_WINDOW_SECONDS = 15;

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

    const idleTimeoutMinutes = parseFloat(idleTimeoutStr ?? '0.3');
    const idleTimeoutMs = idleTimeoutMinutes * 60 * 1000;
    idleTimeoutMsRef.current = idleTimeoutMs;

    lastActivity.current = Date.now();
    hasUserInteracted.current = true;

    setIsSessionActive(true);

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

  const handleStayActive = () => {
    hasUserInteracted.current = true;
    lastActivity.current = Date.now();

    const idleTimeoutStr = localStorage.getItem('userIdleTimeout') ?? '0.3';
    const idleTimeoutMinutes = parseFloat(idleTimeoutStr);
    const idleTimeoutMs = idleTimeoutMinutes * 60 * 1000;

    idleTimeoutMsRef.current = idleTimeoutMs;

    resetIdleTimer(idleTimeoutMs);

    const fullSeconds = Math.ceil(idleTimeoutMs / 1000);
    setSecondsUntilIdleLogout(fullSeconds);
  };

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

    const expiresAtMs = Number.isNaN(Number(expiresAtStr))
      ? new Date(expiresAtStr).getTime()
      : parseInt(expiresAtStr, 10);

    const currentMilisecondsTime = Date.now();
    const timeLeftSeconds = Math.floor((expiresAtMs - currentMilisecondsTime) / 1000);

    setSecondsUntilTokenExpires(Math.max(0, timeLeftSeconds));

    if (timeLeftSeconds <= 0) {
      logout('Sesión expirada');
      return;
    }

    const userActive = hasUserInteracted.current && getSecondsIdle() < 60;
    const inFinalWindow = timeLeftSeconds <= REFRESH_WINDOW_SECONDS;

    if (inFinalWindow && userActive && !isRefreshing) {
      refreshTokenSilently();
    }
  }

  async function refreshTokenSilently() {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      const { data: { expires_at, idle_timeout_minutes } } = await refreshUserToken();

      initSessionStorageFromSessionResponse({ expires_at, idle_timeout_minutes });

      if (typeof idle_timeout_minutes === 'number') {
        idleTimeoutMsRef.current = idle_timeout_minutes * 60 * 1000;
      }
      lastActivity.current = Date.now();
      resetIdleTimer(idleTimeoutMsRef.current);

      if (expires_at) {
        const nextExpiresMs = Number.isNaN(Number(expires_at))
          ? new Date(expires_at).getTime()
          : parseInt(expires_at, 10);

        setSecondsUntilTokenExpires(
          Math.max(0, Math.floor((nextExpiresMs - Date.now()) / 1000))
        );
      }
      setSecondsUntilIdleLogout(Math.ceil(idleTimeoutMsRef.current / 1000));
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
      {secondsUntilIdleLogout < IDLE_WARNING_THRESHOLD_SECONDS && secondsUntilIdleLogout > 0 && (
        <SessionTimeoutModal
          secondsLeft={secondsUntilIdleLogout}
          onStayActive={handleStayActive}
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
