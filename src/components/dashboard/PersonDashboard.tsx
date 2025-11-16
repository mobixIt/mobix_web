'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography, FormControl, Select, MenuItem } from '@mui/material';

import { useAppSelector } from '@/store/hooks';
import { selectCurrentPerson } from '@/store/slices/authSlice';
import { logoutUser } from '@/services/userAuthService';
import { buildTenantUrl } from '@/utils/tenantUrl';
import type { Membership } from '@/types/auth';

export function PersonDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const person = useAppSelector(selectCurrentPerson);
  const memberships = (person?.memberships ?? []) as Array<Membership>;

  useEffect(() => {
    const expiresAtStr = localStorage.getItem('userTokenExpiresAt');

    if (!expiresAtStr) {
      router.push('/login');
      return;
    }

    const expiresAtMs = parseInt(expiresAtStr, 10);
    const nowMs = Date.now();

    if (Number.isNaN(expiresAtMs) || nowMs >= expiresAtMs) {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      router.push('/login');
    }
  };

  const handleTenantSelect = (tenantSlug: string) => {
    if (!tenantSlug) return;
    const url = buildTenantUrl(tenantSlug);
    const dashboardUrl = `${url}/dashboard`;
    window.location.href = dashboardUrl;
  };

  if (loading) {
    return <Typography sx={{ p: 4 }}>Cargando...</Typography>;
  }

  return (
    <Box sx={{ p: 4 }} data-testid="person-dashboard">
      <Typography variant="h4" mb={2}>
        {person
          ? `Bienvenido, ${person.first_name} ${person.last_name}`
          : 'Bienvenido al Dashboard'}
      </Typography>

      <Typography variant="body1" mb={4}>
        Has iniciado sesión correctamente.
      </Typography>

      {memberships.length > 1 && (
        <Box mt={2}>
          <Typography variant="subtitle1" mb={1}>
            Selecciona la empresa:
          </Typography>
          <FormControl size="small">
            <Select
              data-testid="tenant-switcher"
              displayEmpty
              defaultValue=""
              onChange={(e) => handleTenantSelect(e.target.value as string)}
            >
              <MenuItem value="" disabled>
                Selecciona un tenant
              </MenuItem>
              {memberships.map((membership: Membership) => (
                <MenuItem key={membership.id} value={membership.tenant.slug}>
                  {membership.tenant.slug}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Button variant="outlined" color="secondary" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </Box>
  );
}