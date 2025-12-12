import React, { type ReactNode } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

type RefreshUserTokenResponse = {
  data: {
    expires_at: string | number | null;
    idle_timeout_minutes?: number | null;
  };
};

type SessionIdleCookieMeta = {
  last_activity_at: number;
  idle_timeout_minutes: number;
  expires_at: string | number;
};

vi.mock('@/services/userAuthService', () => ({
  refreshUserToken: vi.fn<() => Promise<RefreshUserTokenResponse>>(),
  notifyBackendOfActivity: vi.fn<() => Promise<void> | void>(),
  logoutUser: vi.fn<() => Promise<void>>(),
}));

vi.mock('@/utils/sessionIdleCookie', () => ({
  readSessionIdleCookie: vi.fn<() => SessionIdleCookieMeta | null>(),
  writeSessionIdleCookie: vi.fn<(meta: SessionIdleCookieMeta) => void>(),
  updateLastActivityInCookie: vi.fn<(lastActivity: number) => void>(),
  clearSessionIdleCookie: vi.fn<() => void>(),
}));

vi.mock('@/components/SessionTimeoutModal', () => ({
  default: ({
    secondsLeft,
    onStayActive,
  }: {
    secondsLeft: number;
    onStayActive: () => void;
  }) => (
    <div data-testid="session-timeout-modal">
      <span data-testid="session-timeout-seconds">{secondsLeft}</span>
      <button
        type="button"
        onClick={onStayActive}
        data-testid="session-timeout-stay-active"
      >
        Stay active
      </button>
    </div>
  ),
}));

import { SessionProvider, useSession } from '@/providers/SessionProvider';
import { refreshUserToken, notifyBackendOfActivity, logoutUser } from '@/services/userAuthService';
import {
  readSessionIdleCookie,
  writeSessionIdleCookie,
  updateLastActivityInCookie,
  clearSessionIdleCookie,
} from '@/utils/sessionIdleCookie';

function SessionConsumer() {
  const { status, secondsUntilIdleLogout, secondsUntilTokenExpires, isRefreshing, forceLogout } =
    useSession();

  return (
    <div>
      <span data-testid="session-status">{status}</span>
      <span data-testid="session-idle-seconds">{secondsUntilIdleLogout}</span>
      <span data-testid="session-token-seconds">{secondsUntilTokenExpires}</span>
      <span data-testid="session-refreshing">{isRefreshing ? 'true' : 'false'}</span>
      <button type="button" data-testid="session-force-logout" onClick={forceLogout}>
        Force logout
      </button>
    </div>
  );
}

function ProviderHarness({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

describe('SessionProvider integration', () => {
  const refreshUserTokenMock = vi.mocked(refreshUserToken);
  const notifyBackendOfActivityMock = vi.mocked(notifyBackendOfActivity);
  const logoutUserMock = vi.mocked(logoutUser);

  const readSessionIdleCookieMock = vi.mocked(readSessionIdleCookie);
  const writeSessionIdleCookieMock = vi.mocked(writeSessionIdleCookie);
  const updateLastActivityInCookieMock = vi.mocked(updateLastActivityInCookie);
  const clearSessionIdleCookieMock = vi.mocked(clearSessionIdleCookie);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sets status to invalid and clears cookie when session cookie is missing', async () => {
    readSessionIdleCookieMock.mockReturnValueOnce(null);

    render(
      <ProviderHarness>
        <SessionConsumer />
      </ProviderHarness>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe('invalid');
    });

    expect(clearSessionIdleCookieMock).toHaveBeenCalledTimes(1);
    expect(logoutUserMock).not.toHaveBeenCalled();
  });

  it('activates session when cookie meta is valid and not expired and not idle-expired', async () => {
    const nowMs = Date.now();

    readSessionIdleCookieMock.mockReturnValue({
      last_activity_at: nowMs - 10_000,
      idle_timeout_minutes: 5,
      expires_at: nowMs + 60_000,
    });

    render(
      <ProviderHarness>
        <SessionConsumer />
      </ProviderHarness>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe('active');
    });

    const idleSeconds = Number(screen.getByTestId('session-idle-seconds').textContent);
    const tokenSeconds = Number(screen.getByTestId('session-token-seconds').textContent);

    expect(idleSeconds).toBeGreaterThan(0);
    expect(idleSeconds).toBeLessThanOrEqual(5 * 60);

    expect(tokenSeconds).toBeGreaterThan(0);
    expect(tokenSeconds).toBeLessThanOrEqual(60);
  });

  it('shows modal under warning threshold and clicking stay active updates last activity and resets idle countdown', async () => {
    const nowMs = Date.now();

    readSessionIdleCookieMock.mockReturnValue({
      last_activity_at: nowMs - 40_000,
      idle_timeout_minutes: 1,
      expires_at: nowMs + 60_000,
    });

    render(
      <ProviderHarness>
        <SessionConsumer />
      </ProviderHarness>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe('active');
    });

    expect(screen.getByTestId('session-timeout-modal')).toBeInTheDocument();

    const secondsLeftBeforeClick = Number(screen.getByTestId('session-timeout-seconds').textContent);
    expect(secondsLeftBeforeClick).toBeGreaterThan(0);
    expect(secondsLeftBeforeClick).toBeLessThan(30);

    fireEvent.click(screen.getByTestId('session-timeout-stay-active'));

    expect(updateLastActivityInCookieMock).toHaveBeenCalled();

    await waitFor(() => {
      const secondsLeftAfterClick = Number(screen.getByTestId('session-idle-seconds').textContent);
      expect(secondsLeftAfterClick).toBeGreaterThan(secondsLeftBeforeClick);
    });
  });

  it('refreshes token when expiration is inside refresh window and user is considered active', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

    const nowMs = Date.now();

    readSessionIdleCookieMock.mockReturnValue({
      last_activity_at: nowMs,
      idle_timeout_minutes: 5,
      expires_at: nowMs + 10_000,
    });

    refreshUserTokenMock.mockResolvedValue({
      data: {
        expires_at: (nowMs + 60_000).toString(),
        idle_timeout_minutes: 10,
      },
    });

    render(
      <ProviderHarness>
        <SessionConsumer />
      </ProviderHarness>,
    );

    expect(screen.getByTestId('session-status').textContent).toBe('active');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_100);
    });

    expect(refreshUserTokenMock).toHaveBeenCalledTimes(1);
    expect(writeSessionIdleCookieMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('session-refreshing').textContent).toBe('false');
  });

  it('notifies backend of activity after BACKEND_NOTIFY_INTERVAL_MS while user remains below idle timeout', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

    const nowMs = Date.now();

    readSessionIdleCookieMock.mockReturnValue({
      last_activity_at: nowMs,
      idle_timeout_minutes: 5,
      expires_at: nowMs + 10 * 60_000,
    });

    render(
      <ProviderHarness>
        <SessionConsumer />
      </ProviderHarness>,
    );

    expect(screen.getByTestId('session-status').textContent).toBe('active');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(70_000);
    });

    expect(notifyBackendOfActivityMock).toHaveBeenCalledTimes(1);
  });

  it('marks session invalid and calls logoutUser when idle countdown reaches zero', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

    const nowMs = Date.now();

    readSessionIdleCookieMock.mockReturnValue({
      last_activity_at: nowMs,
      idle_timeout_minutes: 0.001,
      expires_at: nowMs + 60_000,
    });

    logoutUserMock.mockResolvedValue();

    render(
      <ProviderHarness>
        <SessionConsumer />
      </ProviderHarness>,
    );

    expect(screen.getByTestId('session-status').textContent).toBe('active');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId('session-status').textContent).toBe('invalid');
    expect(clearSessionIdleCookieMock).toHaveBeenCalledTimes(1);
    expect(logoutUserMock).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('forceLogout clears cookie, moves to invalid, and calls logoutUser', async () => {
    const nowMs = Date.now();

    readSessionIdleCookieMock.mockReturnValue({
      last_activity_at: nowMs,
      idle_timeout_minutes: 5,
      expires_at: nowMs + 60_000,
    });

    logoutUserMock.mockResolvedValue();

    render(
      <ProviderHarness>
        <SessionConsumer />
      </ProviderHarness>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe('active');
    });

    fireEvent.click(screen.getByTestId('session-force-logout'));

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe('invalid');
    });

    expect(clearSessionIdleCookieMock).toHaveBeenCalledTimes(1);
    expect(logoutUserMock).toHaveBeenCalledTimes(1);
  });

  it('throws when useSession is called outside of SessionProvider', () => {
    function ConsumerWithoutProvider() {
      useSession();
      return null;
    }

    expect(() => render(<ConsumerWithoutProvider />)).toThrow(
      'useSession must be used within SessionProvider',
    );
  });
});
