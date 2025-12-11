'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';

import SessionTimeoutModal from '@/components/SessionTimeoutModal';
import {
  refreshUserToken,
  notifyBackendOfActivity,
  logoutUser,
} from '@/services/userAuthService';
import {
  readSessionIdleCookie,
  writeSessionIdleCookie,
  updateLastActivityInCookie,
  clearSessionIdleCookie,
} from '@/utils/sessionIdleCookie';
import {
  normalizeSessionMeta,
  normalizeSessionMetaForRefresh,
} from '@/session/sessionMeta';

const BACKEND_NOTIFY_INTERVAL_MS = 60_000;
const IDLE_WARNING_THRESHOLD_SECONDS = 30;
const REFRESH_WINDOW_SECONDS = 15;

type SessionStatus = 'loading' | 'active' | 'invalid';

type SessionContextType = {
  status: SessionStatus;
  secondsUntilIdleLogout: number;
  secondsUntilTokenExpires: number;
  isRefreshing: boolean;
  forceLogout: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [secondsUntilIdleLogout, setSecondsUntilIdleLogout] = useState(0);
  const [secondsUntilTokenExpires, setSecondsUntilTokenExpires] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivity = useRef<number | null>(null);
  const idleTimeoutMsRef = useRef<number>(0);
  const hasUserInteracted = useRef(false);
  const lastBackendNotify = useRef<number>(0);
  const logoutScheduledRef = useRef(false);

  function handleLogicalLogout() {
    clearSessionIdleCookie();
    setStatus('invalid');
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }

  function getSecondsIdle(): number {
    if (!lastActivity.current) return Infinity;
    return (Date.now() - lastActivity.current) / 1000;
  }

  function startIdleTimer(timeoutMs: number) {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setSecondsUntilIdleLogout(0);
    }, timeoutMs);
  }

  function resetIdleTimer(timeoutMs: number) {
    startIdleTimer(timeoutMs);
  }

  function updateIdleCountdown(timeoutSeconds: number): number {
    const secondsIdle = getSecondsIdle();
    const secondsLeft = Math.max(0, timeoutSeconds - secondsIdle);
    setSecondsUntilIdleLogout(Math.floor(secondsLeft));
    return secondsLeft;
  }

  function checkTokenValidity() {
    const raw = readSessionIdleCookie();
    if (!raw) {
      handleLogicalLogout();
      return;
    }

    const meta = normalizeSessionMeta(raw);
    const now = Date.now();
    const timeLeft = Math.floor((meta.expiresAtMs - now) / 1000);

    setSecondsUntilTokenExpires(Math.max(0, timeLeft));

    if (timeLeft <= 0 || Number.isNaN(meta.expiresAtMs)) {
      return;
    }

    const userActive = hasUserInteracted.current && getSecondsIdle() < 60;
    const inFinalWindow = timeLeft <= REFRESH_WINDOW_SECONDS;

    if (inFinalWindow && userActive && !isRefreshing) {
      refreshTokenSilently();
    }
  }

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    function initSessionFromCookie() {
      setStatus('loading');

      const raw = readSessionIdleCookie();
      if (!raw) {
        if (!cancelled) handleLogicalLogout();
        return;
      }

      const meta = normalizeSessionMeta(raw);
      const now = Date.now();

      if (!Number.isFinite(meta.expiresAtMs) || now >= meta.expiresAtMs) {
        if (!cancelled) handleLogicalLogout();
        return;
      }

      const secondsIdle = (now - meta.last_activity_at) / 1000;
      const timeoutSeconds = meta.idle_timeout_minutes * 60;

      if (secondsIdle >= timeoutSeconds) {
        if (!cancelled) handleLogicalLogout();
        return;
      }

      if (cancelled) return;

      idleTimeoutMsRef.current = meta.idleTimeoutMs;
      lastActivity.current = meta.last_activity_at;
      lastBackendNotify.current = now;
      hasUserInteracted.current = true;
      logoutScheduledRef.current = false;

      setSecondsUntilIdleLogout(Math.floor(timeoutSeconds - secondsIdle));
      setSecondsUntilTokenExpires(
        Math.max(0, Math.floor((meta.expiresAtMs - now) / 1000)),
      );
      setStatus('active');

      startIdleTimer(meta.idleTimeoutMs);

      const interval = setInterval(() => {
        updateIdleCountdown(timeoutSeconds);
        checkTokenValidity();
      }, 1000);

      const backendNotifyInterval = setInterval(() => {
        const nowTs = Date.now();
        const secondsSinceLastActivity = getSecondsIdle();
        if (
          hasUserInteracted.current &&
          secondsSinceLastActivity < idleTimeoutMsRef.current / 1000 &&
          nowTs - lastBackendNotify.current > BACKEND_NOTIFY_INTERVAL_MS
        ) {
          notifyBackendOfActivity();
          lastBackendNotify.current = nowTs;
        }
      }, 5_000);

      const events: Array<keyof WindowEventMap> = [
        'mousemove',
        'keydown',
        'click',
        'scroll',
      ];

      const handleActivity = () => {
        hasUserInteracted.current = true;
        const nowActivity = Date.now();
        lastActivity.current = nowActivity;
        updateLastActivityInCookie(nowActivity);
        resetIdleTimer(idleTimeoutMsRef.current);
      };

      events.forEach((ev) => window.addEventListener(ev, handleActivity));

      cleanup = () => {
        clearInterval(interval);
        clearInterval(backendNotifyInterval);
        events.forEach((ev) =>
          window.removeEventListener(ev, handleActivity),
        );
        if (idleTimer.current) clearTimeout(idleTimer.current);
      };
    }

    initSessionFromCookie();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    if (status !== 'active') return;
    if (logoutScheduledRef.current) return;

    const idleExpired = secondsUntilIdleLogout <= 0;
    const tokenExpired = secondsUntilTokenExpires <= 0;

    if (idleExpired || tokenExpired) {
      logoutScheduledRef.current = true;

      handleLogicalLogout();

      logoutUser().catch((err) => {
        console.error(
          '[Session] Error calling /auth/logout after idle timeout',
          err,
        );
      });
    }
  }, [status, secondsUntilIdleLogout, secondsUntilTokenExpires]);

  async function refreshTokenSilently() {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      const { data } = await refreshUserToken();

      const raw = {
        last_activity_at: Date.now(),
        idle_timeout_minutes: data.idle_timeout_minutes,
        expires_at: data.expires_at,
      };

      const meta = normalizeSessionMetaForRefresh(raw);

      writeSessionIdleCookie({
        last_activity_at: meta.lastActivity,
        idle_timeout_minutes: meta.idleMinutes,
        expires_at: meta.expiresAtMs,
      });

      idleTimeoutMsRef.current = meta.idleMs;
      lastActivity.current = meta.lastActivity;
      resetIdleTimer(meta.idleMs);

      setSecondsUntilTokenExpires(
        Math.max(0, Math.floor((meta.expiresAtMs - Date.now()) / 1000)),
      );
      setSecondsUntilIdleLogout(Math.ceil(meta.idleMs / 1000));
    } catch {
      handleLogicalLogout();
    } finally {
      setIsRefreshing(false);
    }
  }

  async function forceLogout() {
    logoutScheduledRef.current = true;
    handleLogicalLogout();
    logoutUser().catch((err) => {
      console.error(
        '[Session] Error calling /auth/logout from forceLogout',
        err,
      );
    });
  }

  return (
    <SessionContext.Provider
      value={{
        status,
        secondsUntilIdleLogout,
        secondsUntilTokenExpires,
        isRefreshing,
        forceLogout,
      }}
    >
      {secondsUntilIdleLogout < IDLE_WARNING_THRESHOLD_SECONDS &&
        secondsUntilIdleLogout > 0 &&
        status === 'active' && (
          <SessionTimeoutModal
            secondsLeft={secondsUntilIdleLogout}
            onStayActive={() => {
              const nowActivity = Date.now();
              hasUserInteracted.current = true;
              lastActivity.current = nowActivity;
              updateLastActivityInCookie(nowActivity);

              const idleMs = idleTimeoutMsRef.current;
              if (idleMs > 0) {
                resetIdleTimer(idleMs);
                setSecondsUntilIdleLogout(Math.ceil(idleMs / 1000));
              }
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
