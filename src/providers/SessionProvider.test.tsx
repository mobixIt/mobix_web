import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { SessionProvider } from './SessionProvider';
import React from 'react';
import * as userAuthService from '@/services/userAuthService';

// ✅ Mocks correctamente definidos al inicio
vi.mock('@/services/userAuthService', () => ({
  refreshUserToken: vi.fn(() => Promise.resolve({
    token: 'newMockToken',
    refreshToken: 'newMockRefreshToken',
    expiresAt: Math.floor(Date.now() / 1000) + 600,
    idle_timeout_minutes: 30,
  })),
  notifyBackendOfActivity: vi.fn(),
}));

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('SessionProvider', () => {
  const mockRefresh = vi.mocked(userAuthService.refreshUserToken);
  const mockNotify = vi.mocked(userAuthService.notifyBackendOfActivity);

  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockNotify.mockClear();
  });

  it('should redirect to login if session info is missing', () => {
    render(
      <SessionProvider>
        <div>Protected Content</div>
      </SessionProvider>
    );

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should show children if session info is present', () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 600;
    localStorage.setItem('userToken', 'mockToken');
    localStorage.setItem('userTokenExpiresAt', `${expiresAt}`);
    localStorage.setItem('userIdleTimeout', '5');

    render(
      <SessionProvider>
        <div>Protected Content</div>
      </SessionProvider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show SessionTimeoutModal if about to expire (<=30s)', async () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 600;
    localStorage.setItem('userToken', 'mockToken');
    localStorage.setItem('userTokenExpiresAt', `${expiresAt}`);
    localStorage.setItem('userIdleTimeout', '0.01');

    render(
      <SessionProvider>
        <div>Test content</div>
      </SessionProvider>
    );

    expect(screen.getByText(/Test content/)).toBeInTheDocument();
    await act(() => new Promise((res) => setTimeout(res, 700)));
    expect(screen.getByText(/¿Sigues ahí/i)).toBeInTheDocument();
  });

  it('should logout if token expired', () => {
    const expiredAt = Math.floor(Date.now() / 1000) - 10;
    localStorage.setItem('userToken', 'mockToken');
    localStorage.setItem('userTokenExpiresAt', `${expiredAt}`);
    localStorage.setItem('userIdleTimeout', '5');

    render(
      <SessionProvider>
        <div>Should not show</div>
      </SessionProvider>
    );

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should refresh token if close to expiry and user active', async () => {
    const expiresSoon = Math.floor(Date.now() / 1000) + 250;
    localStorage.setItem('userToken', 'mockToken');
    localStorage.setItem('refreshToken', 'mockRefresh');
    localStorage.setItem('userTokenExpiresAt', `${expiresSoon}`);
    localStorage.setItem('userIdleTimeout', '1');

    render(
      <SessionProvider>
        <div>Refresh test</div>
      </SessionProvider>
    );

    await act(() => new Promise((res) => setTimeout(res, 500)));
    fireEvent.mouseMove(window);
    await act(() => new Promise((res) => setTimeout(res, 1500)));

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should notify backend after user activity', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-07-27T10:00:00Z'));

    const expiresAt = Math.floor(Date.now() / 1000) + 600;
    localStorage.setItem('userToken', 'mockToken');
    localStorage.setItem('userTokenExpiresAt', `${expiresAt}`);
    localStorage.setItem('refreshToken', 'mockRefreshToken');
    localStorage.setItem('userIdleTimeout', '1');

    render(
      <SessionProvider>
        <div>Notify test</div>
      </SessionProvider>
    );

    fireEvent.mouseMove(window);

    await act(() => Promise.resolve());
    await act(() => vi.advanceTimersByTimeAsync(5001));
    expect(mockNotify).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should logout after idle timeout', async () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 600;
    localStorage.setItem('userToken', 'mockToken');
    localStorage.setItem('userTokenExpiresAt', `${expiresAt}`);
    localStorage.setItem('userIdleTimeout', '0.01');

    render(
      <SessionProvider>
        <div>Idle test</div>
      </SessionProvider>
    );

    await act(() => new Promise((res) => setTimeout(res, 1000)));
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
