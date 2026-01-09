'use client';

import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
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

export function SecureContent({ children }: { children: React.ReactNode }) {
  const { status: sessionStatus } = useSession();
  const dispatch = useAppDispatch();

  const authStatus = useAppSelector(selectAuthStatus);
  const authErrorStatus = useAppSelector(selectAuthErrorStatus);
  const membership = useAppSelector(selectMembershipRaw);
  const permissionsReady = useAppSelector(selectPermissionsReady);

  const [hasFinishedFirstBootstrap, setHasFinishedFirstBootstrap] = useState(false);

  const tenantSlug = useMemo(() => 
    typeof window !== 'undefined' ? getTenantSlugFromHost(window.location.hostname) : null
  , []);

  const isCurrentlyBootstrapping = useMemo(() => {
    return (
      sessionStatus === 'loading' ||
      authStatus === 'idle' ||
      authStatus === 'loading' ||
      (authStatus === 'succeeded' &&
        Boolean(tenantSlug) &&
        (!permissionsReady ||
          !membership?.memberships?.some((m) => m.tenant.slug === tenantSlug)))
    );
  }, [sessionStatus, authStatus, tenantSlug, permissionsReady, membership]);

  if (!isCurrentlyBootstrapping && !hasFinishedFirstBootstrap) {
    setHasFinishedFirstBootstrap(true);
  }

  useEffect(() => {
    if (sessionStatus !== 'loading' && sessionStatus !== 'invalid' && authStatus === 'idle') {
      void dispatch(fetchMe());
    }
  }, [sessionStatus, authStatus, dispatch]);

  useEffect(() => {
    const sessionReady = sessionStatus !== 'loading' && sessionStatus !== 'invalid';
    if (!sessionReady || !tenantSlug || authStatus !== 'succeeded') return;

    const alreadyHasMembership = membership?.memberships?.some((m) => m.tenant.slug === tenantSlug);
    if (!alreadyHasMembership) {
      void dispatch(loadTenantPermissions(tenantSlug));
    }
  }, [sessionStatus, tenantSlug, membership, authStatus, dispatch]);

  useEffect(() => {
    const isUnauthorized = authStatus === 'failed' && authErrorStatus === 401;
    if (sessionStatus === 'invalid' || isUnauthorized) {
      redirectToBaseLogin();
    }
  }, [sessionStatus, authStatus, authErrorStatus]);

  const shouldShowBootstrapLoader = isCurrentlyBootstrapping && !hasFinishedFirstBootstrap;

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

  if (sessionStatus === 'invalid') return null;

  if (authStatus === 'failed' && authErrorStatus && authErrorStatus >= 500) {
    return <ServerErrorPage />;
  }

  return <SecureLayout>{children}</SecureLayout>;
}

export default SecureContent;
