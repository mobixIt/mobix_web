'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

import { useSession } from '@/providers/SessionProvider';
import { redirectToBaseLogin } from '@/utils/redirectToLogin';
import { SecureLayout } from './SecureLayout';
import { getTenantSlugFromHost } from '@/lib/getTenantSlugFromHost';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchMe,
  selectAuthStatus,
  selectAuthErrorStatus,
} from '@/store/slices/authSlice';
import {
  loadTenantPermissions,
  selectMembershipRaw,
  selectPermissionsReady,
} from '@/store/slices/permissionsSlice';

import { ServerErrorPage } from '@/components/error-pages';
import MobixLoader from '@/components/loaders/MobixLoader';

type SecureContentProps = {
  children: React.ReactNode;
};

// Persist across component remounts during client-side navigation to avoid refetch loops
let fetchedMeOnce = false;
const loadedTenantPermissions = new Set<string>();

export function SecureContent({ children }: SecureContentProps) {
  const { status: sessionStatus } = useSession();
  const dispatch = useAppDispatch();

  const authStatus = useAppSelector(selectAuthStatus);
  const authErrorStatus = useAppSelector(selectAuthErrorStatus);
  const membership = useAppSelector(selectMembershipRaw);
  const permissionsReady = useAppSelector(selectPermissionsReady);

  // Prevent double-fetch of /auth/me in dev StrictMode or fast re-renders
  const requestedMeRef = useRef(false);

  const tenantSlug =
    typeof window !== 'undefined'
      ? getTenantSlugFromHost(window.location.hostname)
      : null;

  useEffect(() => {
    if (sessionStatus === 'invalid') {
      redirectToBaseLogin();
    }
  }, [sessionStatus]);

  const sessionReady =
    sessionStatus !== 'loading' && sessionStatus !== 'invalid';

  useEffect(() => {
    if (!sessionReady) return;

    if (authStatus === 'idle' && !requestedMeRef.current && !fetchedMeOnce) {
      requestedMeRef.current = true;
      void dispatch(fetchMe());
    }
  }, [sessionReady, authStatus, dispatch]);

  // If auth gets cleared back to idle (e.g. logout/clearAuth in same mount),
  // allow fetching again next time we become ready.
  useEffect(() => {
    if (authStatus === 'idle') {
      requestedMeRef.current = false;
      fetchedMeOnce = false;
    }

    if (authStatus === 'succeeded') {
      fetchedMeOnce = true;
    }
  }, [authStatus]);

  useEffect(() => {
    if (!sessionReady || !tenantSlug || authStatus !== 'succeeded') return;

    const alreadyHasMembershipForTenant = membership?.memberships?.some(
      (m) => m.tenant.slug === tenantSlug,
    );

    if (!alreadyHasMembershipForTenant && !loadedTenantPermissions.has(tenantSlug)) {
      void dispatch(loadTenantPermissions(tenantSlug));
      loadedTenantPermissions.add(tenantSlug);
    }
  }, [sessionReady, tenantSlug, membership, authStatus, dispatch]);

  useEffect(() => {
    if (!sessionReady) return;

    if (authStatus === 'failed' && authErrorStatus === 401) {
      redirectToBaseLogin();
    }
  }, [sessionReady, authStatus, authErrorStatus]);

  const isBootstrapping = React.useMemo(
    () =>
      sessionStatus === 'loading' ||
      authStatus === 'idle' ||
      authStatus === 'loading' ||
      (authStatus === 'succeeded' &&
        Boolean(tenantSlug) &&
        (!permissionsReady ||
          !membership?.memberships?.some((m) => m.tenant.slug === tenantSlug))),
    [sessionStatus, authStatus, tenantSlug, permissionsReady, membership],
  );

  const hasBootstrappedRef = useRef(false);

  React.useEffect(() => {
    if (!isBootstrapping) {
      hasBootstrappedRef.current = true;
    }
  }, [isBootstrapping]);

  const shouldShowBootstrapLoader = isBootstrapping && !hasBootstrappedRef.current;

  if (shouldShowBootstrapLoader) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
       <MobixLoader />
      </Box>
    );
  }

  if (sessionStatus === 'invalid') {
    return null;
  }

  if (authStatus === 'failed' && authErrorStatus && authErrorStatus >= 500) {
    return <ServerErrorPage />;
  }

  return <SecureLayout>{children}</SecureLayout>;
}

export default SecureContent;
