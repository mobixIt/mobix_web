'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Switch, FormControlLabel } from '@mui/material';

export interface MobixToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  name?: string;
  inactiveLabel?: React.ReactNode;
  activeLabel?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  top: 3,
  ...theme.typography.body2,
}));

const InlineLabel = styled('span', {
  shouldForwardProp: (prop) => prop !== 'dimmed',
})<{ dimmed?: boolean }>(({ theme, dimmed }) => ({
  cursor: 'pointer',
  marginRight: theme.spacing(1.5),
  color: dimmed ? theme.palette.text.secondary : theme.palette.text.primary,
}));

const SwitchLabel = styled('span', {
  shouldForwardProp: (prop) => prop !== 'dimmed',
})<{ dimmed?: boolean }>(({ theme, dimmed }) => ({
  ...theme.typography.body2,
  color: dimmed ? theme.palette.text.secondary : theme.palette.text.primary,
}));

export function MobixToggle({
  value,
  onChange,
  name = 'active',
  inactiveLabel = 'Inactive',
  activeLabel = 'Active',
  className,
  disabled,
}: MobixToggleProps) {
  const handleToggle = () => {
    if (disabled) return;
    onChange(!value);
  };

  const handleSwitchChange = (
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    if (disabled) return;
    onChange(checked);
  };

  return (
    <Root className={className}>
      <InlineLabel
        dimmed={value}
        onClick={handleToggle}
      >
        {inactiveLabel}
      </InlineLabel>

      <FormControlLabel
        sx={{ m: 0 }}
        control={
          <Switch
            checked={value}
            onChange={handleSwitchChange}
            value={name}
            color="primary"
            disabled={disabled}
          />
        }
        label={
          <SwitchLabel dimmed={!value}>
            {activeLabel}
          </SwitchLabel>
        }
      />
    </Root>
  );
}

export default MobixToggle;
