'use client';

import * as React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  Typography,
} from '@mui/material';
import {
  Settings,
  NotificationsNone,
  StarOutline,
  Translate,
} from '@mui/icons-material';

import { TenantSwitcher, TenantOption } from './TenantSwitcher';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentPerson } from '@/store/slices/authSlice';
import type { Membership } from '@/types/access-control';
import { buildTenantUrl } from '@/utils/tenantUrl';

export default function Header() {
  const person = useAppSelector(selectCurrentPerson);
  const memberships = React.useMemo(
    () => ((person?.memberships ?? []) as Membership[]),
    [person],
  );

  const tenantOptions: TenantOption[] = React.useMemo(
    () =>
      memberships.map((membership) => ({
        id: String(membership.tenant.id),
        name: membership.tenant.slug ?? membership.tenant.slug,
        slug: membership.tenant.slug,
      })),
    [memberships],
  );

  const [currentTenant, setCurrentTenant] = React.useState<TenantOption | null>(
    null,
  );

  React.useEffect(() => {
    if (!tenantOptions.length) {
      setCurrentTenant((prev) => (prev !== null ? null : prev));
      return;
    }

    const host =
      typeof window !== 'undefined' ? window.location.hostname : '';

    let fromHost: TenantOption | undefined;

    if (host && host.length > 0) {
      fromHost = tenantOptions.find((tenant) =>
        host.startsWith(`${tenant.slug}.`),
      );
    }

    const nextTenant = fromHost ?? tenantOptions[0];

    setCurrentTenant((prev) => {
      if (prev?.slug === nextTenant.slug) return prev;
      return nextTenant;
    });
  }, [tenantOptions]);

  const handleTenantChange = (tenant: TenantOption) => {
    if (!tenant || tenant.slug === currentTenant?.slug) return;

    const url = buildTenantUrl(tenant.slug);
    const dashboardUrl = `${url}/dashboard`;
    window.location.href = dashboardUrl;
  };

  const displayName = person
    ? `${person.first_name} ${person.last_name}`.trim()
    : 'Usuario';
  const displayEmail = person?.email ?? '';

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        px: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {tenantOptions.length > 1 && currentTenant && (
          <TenantSwitcher
            currentTenant={currentTenant}
            tenants={tenantOptions}
            onChange={handleTenantChange}
          />
        )}
      </Box>

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Tooltip title="Change language">
          <IconButton size="small">
            <Translate fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Preferences">
          <IconButton size="small">
            <Settings fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Favorites">
          <IconButton size="small">
            <StarOutline fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Notifications">
          <IconButton size="small">
            <NotificationsNone fontSize="small" />
          </IconButton>
        </Tooltip>

        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32 }}>
            {displayName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {displayName}
            </Typography>
            {displayEmail && (
              <Typography variant="caption" color="text.secondary">
                {displayEmail}
              </Typography>
            )}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
