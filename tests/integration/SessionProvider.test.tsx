import React from 'react';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type Mock,
} from 'vitest';

vi.mock('@/services/userAuthService', () => ({
  refreshUserToken: vi.fn(),
  notifyBackendOfActivity: vi.fn(),
  logoutUser: vi.fn(),
}));

vi.mock('@/utils/sessionIdleCookie', () => ({
  readSessionIdleCookie: vi.fn(),
  writeSessionIdleCookie: vi.fn(),
  updateLastActivityInCookie: vi.fn(),
  clearSessionIdleCookie: vi.fn(),
}));

vi.mock('@/components/SessionTimeoutModal', () => {
  return {
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
  };
});

import { SessionProvider, useSession } from '@/providers/SessionProvider';
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

const refreshUserTokenMock = refreshUserToken as unknown as Mock;
const notifyBackendOfActivityMock =
  notifyBackendOfActivity as unknown as Mock;
const logoutUserMock = logoutUser as unknown as Mock;

const readSessionIdleCookieMock = readSessionIdleCookie as unknown as Mock;
const writeSessionIdleCookieMock =
  writeSessionIdleCookie as unknown as Mock;
const updateLastActivityInCookieMock =
  updateLastActivityInCookie as unknown as Mock;
const clearSessionIdleCookieMock =
  clearSessionIdleCookie as unknown as Mock;

function TestConsumer() {
  const {
    status,
    secondsUntilIdleLogout,
    secondsUntilTokenExpires,
    isRefreshing,
  } = useSession();

  return (
    <div>
      <span data-testid="session-status">{status}</span>
      <span data-testid="session-idle-seconds">{secondsUntilIdleLogout}</span>
      <span data-testid="session-token-seconds">
        {secondsUntilTokenExpires}
      </span>
      <span data-testid="session-refreshing">
        {isRefreshing ? 'true' : 'false'}
      </span>
    </div>
  );
}

describe('SessionProvider', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('sets status to invalid and clears cookie when there is no session meta', async () => {
    readSessionIdleCookieMock.mockReturnValueOnce(null);

    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe(
        'invalid',
      );
    });

    expect(clearSessionIdleCookieMock).toHaveBeenCalledTimes(1);
    expect(logoutUserMock).not.toHaveBeenCalled();
  });

  it('activates session when cookie meta is valid and not expired', async () => {
    const now = Date.now();
    const lastActivity = now - 10_000; // 10s ago
    const idleTimeoutMinutes = 5;
    const expiresAt = now + 60_000; // 60s from now

    readSessionIdleCookieMock.mockReturnValue({
      last_activity_at: lastActivity,
      idle_timeout_minutes: idleTimeoutMinutes,
      expires_at: expiresAt,
    });

    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe(
        'active',
      );
    });

    const idleSeconds = Number(
      screen.getByTestId('session-idle-seconds').textContent,
    );
    const tokenSeconds = Number(
      screen.getByTestId('session-token-seconds').textContent,
    );

    expect(idleSeconds).toBeGreaterThan(0);
    expect(idleSeconds).toBeLessThanOrEqual(idleTimeoutMinutes * 60);

    expect(tokenSeconds).toBeGreaterThan(0);
    expect(tokenSeconds).toBeLessThanOrEqual(60);
  });

  it('shows timeout modal when idle countdown is below warning threshold and allows staying active', async () => {
    const now = Date.now();
    const lastActivity = now - 40_000; // 40s ago
    const idleTimeoutMinutes = 1; // 60s
    const expiresAt = now + 60_000;

    readSessionIdleCookieMock.mockReturnValue({
      last_activity_at: lastActivity,
      idle_timeout_minutes: idleTimeoutMinutes,
      expires_at: expiresAt,
    });

    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe('active');
    });

    const modal = screen.getByTestId('session-timeout-modal');
    expect(modal).toBeInTheDocument();

    const secondsLeftBefore = Number(
      screen.getByTestId('session-timeout-seconds').textContent,
    );
    expect(secondsLeftBefore).toBeGreaterThan(0);
    expect(secondsLeftBefore).toBeLessThan(30);

    fireEvent.click(screen.getByTestId('session-timeout-stay-active'));

    expect(updateLastActivityInCookieMock).toHaveBeenCalled();

    await waitFor(() => {
      const idleFromContext = Number(
        screen.getByTestId('session-idle-seconds').textContent,
      );
      expect(idleFromContext).toBeGreaterThan(secondsLeftBefore);
    });
  });

  it('refreshes token silently when in final window and user is active', async () => {
    const now = Date.now();
    const lastActivity = now;
    const idleTimeoutMinutes = 5;
    const expiresAtSoon = now + 10_000; // 10s

    readSessionIdleCookieMock.mockReturnValue({
      last_activity_at: lastActivity,
      idle_timeout_minutes: idleTimeoutMinutes,
      expires_at: expiresAtSoon,
    });

    refreshUserTokenMock.mockResolvedValue({
      data: {
        expires_at: now + 60_000,
        idle_timeout_minutes: 10,
      },
    });

    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-status').textContent).toBe(
        'active',
      );
    });

    await waitFor(
      () => {
        expect(refreshUserTokenMock).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 },
    );

    expect(writeSessionIdleCookieMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('session-refreshing').textContent).toBe(
      'false',
    );
  });

  it(
    'calls notifyBackendOfActivity periodically while user is active and below idle timeout',
    async () => {
      vi.useFakeTimers();

      const now = Date.now();
      const idleTimeoutMinutes = 5;
      const expiresAt = now + 10 * 60_000;

      readSessionIdleCookieMock.mockReturnValue({
        last_activity_at: now,
        idle_timeout_minutes: idleTimeoutMinutes,
        expires_at: expiresAt,
      });

      render(
        <SessionProvider>
          <TestConsumer />
        </SessionProvider>,
      );

      expect(screen.getByTestId('session-status').textContent).toBe('active');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(65_000);
      });

      expect(notifyBackendOfActivityMock).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    },
    10_000,
  );

  it('logs out logically when token is expired (invalid session meta)', async () => {
    const now = Date.now();
    const lastActivity = now - 1_000;
    const idleTimeoutMinutes = 5;
    const expiredAt = now - 1_000;

    readSessionIdleCookieMock.mockReturnValue({
      last_activity_at: lastActivity,
      idle_timeout_minutes: idleTimeoutMinutes,
      expires_at: expiredAt,
    });

    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('session-status').textContent).toBe(
          'invalid',
        );
      },
      { timeout: 4000 },
    );

    expect(clearSessionIdleCookieMock).toHaveBeenCalled();
    expect(logoutUserMock).not.toHaveBeenCalled();
  });

  it('throws when useSession is used outside SessionProvider', () => {
    function LonelyConsumer() {
      useSession();
      return null;
    }

    expect(() => render(<LonelyConsumer />)).toThrow(
      'useSession must be used within SessionProvider',
    );
  });
});
