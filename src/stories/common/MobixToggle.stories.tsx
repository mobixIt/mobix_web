'use client';

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MobixToggle } from '@/components/mobix/toggle/MobixToggle';

interface ToggleStoryProps {
  onChange: (value: boolean) => void;
}

const meta: Meta<ToggleStoryProps> = {
  title: 'Mobix/Common/MobixToggle',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onChange: { action: 'change' },
  },
};

export default meta;

type Story = StoryObj<ToggleStoryProps>;

export const Basic: Story = {
  render: ({ onChange }) => {
    const [value, setValue] = React.useState(false);

    const handleChange = (next: boolean) => {
      setValue(next);
      onChange(next);
    };

    return (
      <MobixToggle
        value={value}
        onChange={handleChange}
        inactiveLabel="Inactive"
        activeLabel="Active"
      />
    );
  },
};

export const WithCustomLabels: Story = {
  render: ({ onChange }) => {
    const [value, setValue] = React.useState(true);

    const handleChange = (next: boolean) => {
      setValue(next);
      onChange(next);
    };

    return (
      <MobixToggle
        value={value}
        onChange={handleChange}
        inactiveLabel="Desactivado"
        activeLabel="Activado"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <MobixToggle
      value={false}
      onChange={() => {}}
      inactiveLabel="Off"
      activeLabel="On"
      disabled
    />
  ),
};