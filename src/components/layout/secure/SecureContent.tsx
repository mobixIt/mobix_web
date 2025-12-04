'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';

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
} from '@/store/slices/permissionsSlice';

import { ServerErrorPage } from '@/components/error-pages/ServerErrorPage';

type SecureContentProps = {
  children: React.ReactNode;
};

export function SecureContent({ children }: SecureContentProps) {
  const { status: sessionStatus } = useSession();
  const dispatch = useAppDispatch();

  const authStatus = useAppSelector(selectAuthStatus);
  const authErrorStatus = useAppSelector(selectAuthErrorStatus);
  const membership = useAppSelector(selectMembershipRaw);

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

    if (authStatus === 'idle') {
      void dispatch(fetchMe());
    }
  }, [sessionReady, authStatus, dispatch]);

  useEffect(() => {
    if (!sessionReady || !tenantSlug || authStatus !== 'succeeded') return;

    const alreadyHasMembershipForTenant = membership?.memberships?.some(
      (m) => m.tenant.slug === tenantSlug,
    );

    if (!alreadyHasMembershipForTenant) {
      void dispatch(loadTenantPermissions(tenantSlug));
    }
  }, [sessionReady, tenantSlug, membership, authStatus, dispatch]);

  useEffect(() => {
    if (!sessionReady) return;

    if (authStatus === 'failed' && authErrorStatus === 401) {
      redirectToBaseLogin();
    }
  }, [sessionReady, authStatus, authErrorStatus]);

  const isBootstrapping =
    sessionStatus === 'loading' ||
    authStatus === 'idle' ||
    authStatus === 'loading';

  if (isBootstrapping) {
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
        <CircularProgress />
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
