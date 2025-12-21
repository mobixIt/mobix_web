import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TableSkeleton } from '@/components/mobix/table/TableSkeleton';

const meta: Meta<typeof TableSkeleton> = {
  title: 'Mobix/Common/MobixTableSkeleton',
  component: TableSkeleton,
  args: {
    rows: 5,
    columns: 5,
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof TableSkeleton>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    rows: 3,
    columns: 4,
  },
};

export const Dense: Story = {
  args: {
    rows: 10,
    columns: 5,
  },
};