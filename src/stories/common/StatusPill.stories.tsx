import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import StatusPill from '@/components/mobix/status-pill/StatusPill';
import type { StatusPillVariant } from '@/components/mobix/status-pill/StatusPill.styled';

const meta: Meta<typeof StatusPill> = {
  title: 'Mobix/Common/StatusPill',
  component: StatusPill,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Texto que se muestra dentro del pill',
    },
    variant: {
      control: { type: 'select' },
      options: ['active', 'inactive'] satisfies StatusPillVariant[],
      description: 'Variante visual del estado',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusPill>;

export const Activo: Story = {
  args: {
    label: 'Activo',
    variant: 'active',
  },
};

export const Inactivo: Story = {
  args: {
    label: 'Inactivo',
    variant: 'inactive',
  },
};

export const Playground: Story = {
  args: {
    label: 'Estado',
    variant: 'active',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <StatusPill label="Activo" variant="active" />
      <StatusPill label="Inactivo" variant="inactive" />
    </div>
  ),
};
