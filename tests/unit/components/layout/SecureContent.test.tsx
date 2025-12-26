import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

// --- TYPES & INTERFACES ---

type SessionStatus = 'loading' | 'invalid' | 'valid';
type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type Membership = {
  tenant: { slug: string };
};

type MembershipState = {
  memberships: Membership[] | null;
};

// Minimal state structure consumed by the component
type MockRootState = {
  auth: {
    status: AuthStatus;
    errorStatus: number | null;
  };
  permissions: {
    membershipRaw: MembershipState | null;
    permissionsReady: boolean;
  };
};

// Strict definition for simulated Redux actions
type MockAction = {
  type: string;
  payload?: unknown;
};

// --- MOCKS SETUP ---

const dispatchSpy = vi.fn();
const redirectToBaseLoginSpy = vi.fn();

// Mutable control variables for mocks
let mockSessionStatus: SessionStatus = 'loading';
let mockTenantSlug: string | null = 'coolitoral';
let mockState: MockRootState;

// 1. Mock Session Provider
vi.mock('@/providers/SessionProvider', () => ({
  useSession: () => ({ status: mockSessionStatus }),
}));

// 2. Mock Redux (Base and Custom Hooks)
// CRITICAL FIX: useSelector now executes the selector.
// This prevents returning undefined and breaking components that expect data.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: MockRootState) => unknown) => selector(mockState),
    useDispatch: () => dispatchSpy,
  };
});

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => dispatchSpy,
  useAppSelector: <T,>(selector: (state: MockRootState) => T) => selector(mockState),
}));

// 3. Mock Slices (Selectors & Actions)
const mockFetchMeAction: MockAction = { type: 'auth/fetchMe' };
const mockLoadPermissionsAction = (slug: string): MockAction => ({ 
  type: 'permissions/loadTenantPermissions', 
  payload: slug 
});

// Mock Auth Slice
vi.mock('@/store/slices/authSlice', () => ({
  fetchMe: () => mockFetchMeAction,
  selectAuthStatus: (state: MockRootState) => state.auth.status,
  selectAuthErrorStatus: (state: MockRootState) => state.auth.errorStatus,
  selectCurrentPerson: vi.fn(() => null),
}));

// Mock Permissions Slice
vi.mock('@/store/slices/permissionsSlice', () => ({
  loadTenantPermissions: (slug: string) => mockLoadPermissionsAction(slug),
  selectMembershipRaw: (state: MockRootState) => state.permissions.membershipRaw,
  selectPermissionsReady: (state: MockRootState) => state.permissions.permissionsReady,
  selectEffectiveModules: vi.fn(() => []), // Returns empty array to avoid Sidebar crash
}));

// 4. Mock Utils & Libs
vi.mock('@/utils/redirectToLogin', () => ({
  redirectToBaseLogin: () => redirectToBaseLoginSpy(),
}));

vi.mock('@/lib/getTenantSlugFromHost', () => ({
  getTenantSlugFromHost: () => mockTenantSlug,
}));

// 5. Mock UI Components
vi.mock('@/components/loaders/MobixLoader', () => ({
  default: () => <div data-testid="mobix-loader-mock" />,
}));

vi.mock('@/components/error-pages', () => ({
  ServerErrorPage: () => <div data-testid="server-error-page-mock" />,
}));

// CRITICAL FIX: Use absolute path (alias) to mock SecureLayout.
// Using './SecureLayout' failed because it is relative to the test file, not the component.
// When the mock was missing it rendered the real Sidebar and caused the crash.
vi.mock('@/components/layout/secure/SecureLayout', () => ({
  SecureLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="secure-layout-mock">{children}</div>
  ),
}));

// Helper to load the component with reset module flags
const loadSecureContent = async () => {
  const module = await import('@/components/layout/secure/SecureContent');
  return module.SecureContent;
};

// --- SUITE DE PRUEBAS ---

describe('SecureContent Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    
    // Reset Default State
    mockSessionStatus = 'loading';
    mockTenantSlug = 'coolitoral';
    mockState = {
      auth: { status: 'idle', errorStatus: null },
      permissions: { membershipRaw: null, permissionsReady: false },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the loading state while session is initializing', async () => {
    mockSessionStatus = 'loading';
    mockState.auth.status = 'succeeded';

    const SecureContent = await loadSecureContent();

    render(
      <SecureContent>
        <div data-testid="protected-child" />
      </SecureContent>
    );

    expect(screen.getByTestId('mobix-loader-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-child')).not.toBeInTheDocument();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('redirects to login and renders nothing when session is invalid', async () => {
    mockSessionStatus = 'invalid';
    mockState.auth.status = 'failed'; 
    const SecureContent = await loadSecureContent();

    const { container } = render(
      <SecureContent>
        <div data-testid="protected-child" />
      </SecureContent>
    );

    await waitFor(() => {
      expect(redirectToBaseLoginSpy).toHaveBeenCalledTimes(1);
    });

    expect(container.firstChild).toBeNull();
  });

  it('dispatches fetchMe when session is valid but auth is idle', async () => {
    mockSessionStatus = 'valid';
    mockState.auth.status = 'idle';
    const SecureContent = await loadSecureContent();

    render(
      <SecureContent>
        <div data-testid="protected-child" />
      </SecureContent>
    );

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(mockFetchMeAction);
    });
    
    expect(screen.getByTestId('mobix-loader-mock')).toBeInTheDocument();
  });

  it('dispatches loadTenantPermissions when auth succeeds but tenant membership is missing', async () => {
    mockSessionStatus = 'valid';
    mockState.auth.status = 'succeeded';
    mockTenantSlug = 'coolitoral';
    const SecureContent = await loadSecureContent();
    
    mockState.permissions.membershipRaw = { 
      memberships: [{ tenant: { slug: 'other-tenant' } }] 
    };
    mockState.permissions.permissionsReady = false;

    render(
      <SecureContent>
        <div data-testid="protected-child" />
      </SecureContent>
    );

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ 
          type: 'permissions/loadTenantPermissions', 
          payload: 'coolitoral' 
        })
      );
    });

    expect(screen.getByTestId('mobix-loader-mock')).toBeInTheDocument();
  });

  it('does not dispatch permissions load if user already has membership for current tenant', async () => {
    mockSessionStatus = 'valid';
    mockState.auth.status = 'succeeded';
    mockTenantSlug = 'coolitoral';
    const SecureContent = await loadSecureContent();
    
    mockState.permissions.membershipRaw = { 
      memberships: [{ tenant: { slug: 'coolitoral' } }] 
    };
    mockState.permissions.permissionsReady = true;

    render(
      <SecureContent>
        <div data-testid="protected-child" />
      </SecureContent>
    );

    await new Promise(resolve => setTimeout(resolve, 0));

    const calls = dispatchSpy.mock.calls.map(call => call[0] as MockAction);
    const permissionCalls = calls.filter((action) => 
      action.type === 'permissions/loadTenantPermissions'
    );

    expect(permissionCalls).toHaveLength(0);
    expect(screen.getByTestId('secure-layout-mock')).toBeInTheDocument();
  });

  it('redirects to login on 401 authentication error', async () => {
    mockSessionStatus = 'valid';
    mockState.auth.status = 'failed';
    mockState.auth.errorStatus = 401;
    const SecureContent = await loadSecureContent();

    render(
      <SecureContent>
        <div data-testid="protected-child" />
      </SecureContent>
    );

    await waitFor(() => {
      expect(redirectToBaseLoginSpy).toHaveBeenCalled();
    });
  });

  it('renders server error page on 500 authentication error', async () => {
    mockSessionStatus = 'valid';
    mockState.auth.status = 'failed';
    mockState.auth.errorStatus = 500;
    mockState.permissions.permissionsReady = true;
    const SecureContent = await loadSecureContent();

    render(
      <SecureContent>
        <div data-testid="protected-child" />
      </SecureContent>
    );

    expect(screen.getByTestId('server-error-page-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('mobix-loader-mock')).not.toBeInTheDocument();
  });

  it('renders children inside SecureLayout when everything is valid', async () => {
    mockSessionStatus = 'valid';
    mockState.auth.status = 'succeeded';
    mockTenantSlug = 'coolitoral';
    const SecureContent = await loadSecureContent();
    mockState.permissions.membershipRaw = { 
      memberships: [{ tenant: { slug: 'coolitoral' } }] 
    };
    mockState.permissions.permissionsReady = true;

    render(
      <SecureContent>
        <div data-testid="protected-child">Content</div>
      </SecureContent>
    );

    expect(screen.getByTestId('secure-layout-mock')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByTestId('mobix-loader-mock')).not.toBeInTheDocument();
  });

  it('avoids refetching auth once bootstrap completed', async () => {
    mockSessionStatus = 'valid';
    mockState.auth.status = 'succeeded';
    mockTenantSlug = 'coolitoral';
    mockState.permissions.membershipRaw = { 
      memberships: [{ tenant: { slug: 'coolitoral' } }] 
    };
    mockState.permissions.permissionsReady = true;

    const SecureContent = await loadSecureContent();

    const { unmount } = render(
      <SecureContent>
        <div data-testid="protected-child">Content</div>
      </SecureContent>
    );

    await waitFor(() => {
      expect(screen.getByTestId('secure-layout-mock')).toBeInTheDocument();
    });

    // First render may dispatch nothing; ensure counters are captured
    dispatchSpy.mockClear();
    // Simulate a navigation by rendering again without tearing down the module flags
    const { container: secondRender } = render(
      <SecureContent>
        <div data-testid="protected-child">Content</div>
      </SecureContent>
    );

    await waitFor(() => {
      expect(secondRender.querySelectorAll('[data-testid="secure-layout-mock"]').length).toBeGreaterThanOrEqual(1);
    });

    const fetchMeCalls = dispatchSpy.mock.calls.filter(
      ([action]) => (action as MockAction).type === 'auth/fetchMe',
    );

    expect(fetchMeCalls).toHaveLength(0);
    secondRender.parentElement?.remove();
  });
});
