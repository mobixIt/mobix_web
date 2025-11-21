'use client';

import * as React from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ApartmentIcon from '@mui/icons-material/Apartment';

export type TenantOption = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
};

type TenantSwitcherProps = {
  currentTenant: TenantOption;
  tenants: TenantOption[];
  onChange?: (tenant: TenantOption) => void;
};

export function TenantSwitcher({
  currentTenant,
  tenants,
  onChange,
}: TenantSwitcherProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const hasMultipleTenants = tenants.length > 1;
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!hasMultipleTenants) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (tenant: TenantOption) => {
    handleClose();
    onChange?.(tenant);
  };

  return (
    <>
      <Button
        data-testid="tenant-switcher"
        variant="outlined"
        onClick={handleOpen}
        disableRipple
        sx={{
          borderRadius: 6,
          px: 2,
          py: 1,
          textTransform: 'none',
          borderColor: (t) => t.palette.grey[300],
          color: 'text.primary',
          boxShadow: 'none',
          '&:hover': {
            borderColor: (t) => t.palette.grey[400],
            backgroundColor: (t) => t.palette.action.hover,
          },
        }}
        endIcon={
          hasMultipleTenants ? (
            <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
          ) : null
        }
      >
        {currentTenant.logoUrl ? (
          <Avatar
            src={currentTenant.logoUrl}
            alt={currentTenant.name}
            sx={{
              width: 24,
              height: 24,
              mr: 1,
            }}
          />
        ) : (
          <Box
            sx={{
              width: 24,
              height: 24,
              mr: 1,
              borderRadius: 1.5,
              bgcolor: (t) => t.palette.grey[200],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: (t) => t.palette.grey[700],
            }}
          >
            <ApartmentIcon sx={{ fontSize: 18 }} />
          </Box>
        )}

        <Typography variant="subtitle1" fontWeight={600}>
          {currentTenant.name}
        </Typography>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {tenants.map((tenant) => (
          <MenuItem
            key={tenant.id}
            selected={tenant.id === currentTenant.id}
            onClick={() => handleSelect(tenant)}
          >
            {tenant.logoUrl ? (
              <Avatar
                src={tenant.logoUrl}
                alt={tenant.name}
                sx={{ width: 24, height: 24, mr: 1 }}
              />
            ) : (
              <ApartmentIcon sx={{ fontSize: 18, mr: 1 }} />
            )}
            {tenant.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
