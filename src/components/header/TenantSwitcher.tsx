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
import type { AvatarProps } from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

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

const TriggerButton = styled(Button)(({ theme }) => ({
  width: '100%',
  borderRadius: 4,
  padding: theme.spacing(1, 1.5),
  textTransform: 'none',
  borderColor: 'transparent',
  minWidth: 0,
  boxShadow: 'none',
  backgroundColor: `${theme.palette.primary.main}15`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: theme.spacing(1),
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}15`,
    borderColor: 'transparent',
    boxShadow: 'none',
  },
}));

const TriggerLogo = styled(Avatar)(() => ({
  width: 28,
  height: 28,
  borderRadius: 4,
  backgroundColor: '#1D4ED8',
  color: '#FFFFFF',
  fontSize: 14,
}));

const TriggerText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: 14,
  fontFamily: 'Roboto, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  color: theme.palette.text.primary,
}));

const TriggerArrow = styled(KeyboardArrowDownIcon)(({ theme }) => ({
  fontSize: 18,
  color: theme.palette.text.secondary,
  marginLeft: 'auto',
}));

const MenuHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2, 0.75, 2),
}));

const MenuHeaderLabel = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.7,
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
}));

interface StyledMenuItemProps {
  $selected?: boolean;
}

const StyledMenuItem = styled(MenuItem, {
  shouldForwardProp: (prop) => prop !== '$selected',
})<StyledMenuItemProps>(({ theme, $selected }) => ({
  borderRadius: 4,
  marginInline: theme.spacing(1),
  marginBlock: theme.spacing(0.25),
  padding: theme.spacing(1, 1.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}15`,
  },
  ...( $selected && {
    backgroundColor: `${theme.palette.primary.main}15`,
  }),
}));

const CompanyLogo = styled((props: AvatarProps) => (
  <Avatar variant="square" {...props} />
))(({ theme }) => ({
  width: "40px !important",
  height: "40px !important",
  borderRadius: 4,
  backgroundColor: '#FFFFFF',
  boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.35)',
  fontSize: 14,
  color: theme.palette.text.primary,
  '& .MuiAvatar-img': {
    objectFit: 'contain',
    padding: 0,
    width: '100%',
    height: '100%',
  },
}));

const TriggerCompanyLogo = styled(CompanyLogo)(() => ({
  width: 32,
  height: 32,
}));

const CompanyTextColumn = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
}));

const CompanyName = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.25,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const SelectedIconWrapper = styled('div')(({ theme }) => ({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    marginTop: theme.spacing(1),
    borderRadius: 4,
    boxShadow: '0px 18px 45px rgba(15, 23, 42, 0.25)',
    minWidth: 280,
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(1),
  },
}));

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

  const renderLogo = (tenant: TenantOption, size: 'trigger' | 'menu') => {
    if (tenant.logoUrl) {
      const commonProps = {
        src: tenant.logoUrl,
        alt: tenant.name,
        imgProps: { referrerPolicy: 'no-referrer' as const },
      };

      if (size === 'trigger') {
        return <TriggerCompanyLogo {...commonProps} />;
      }

      return <CompanyLogo {...commonProps} />;
    }

    // Fallback sin logo
    if (size === 'trigger') {
      return (
        <TriggerLogo>
          <ApartmentIcon fontSize="small" />
        </TriggerLogo>
      );
    }

    return (
      <CompanyLogo>
        <ApartmentIcon fontSize="small" />
      </CompanyLogo>
    );
  };

  return (
    <>
      <TriggerButton
        data-testid="tenant-switcher"
        variant="outlined"
        onClick={handleOpen}
        disableRipple
      >
        {renderLogo(currentTenant, 'trigger')}
        <TriggerText>{currentTenant.name}</TriggerText>
        {hasMultipleTenants && <TriggerArrow />}
      </TriggerButton>

      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuHeader>
          <MenuHeaderLabel>Tus empresas</MenuHeaderLabel>
        </MenuHeader>

        {tenants.map((tenant) => {
          const selected = tenant.id === currentTenant.id;

          return (
            <StyledMenuItem
              key={tenant.id}
              $selected={selected}
              onClick={() => handleSelect(tenant)}
            >
              {renderLogo(tenant, 'menu')}

              <CompanyTextColumn>
                <CompanyName>{tenant.name}</CompanyName>
              </CompanyTextColumn>

              {selected && (
                <SelectedIconWrapper>
                  <CheckCircleRoundedIcon fontSize="small" />
                </SelectedIconWrapper>
              )}
            </StyledMenuItem>
          );
        })}
      </StyledMenu>
    </>
  );
}
