import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Box } from '@mui/material';
import { MobixMultiSelect } from '@/components/mobix/inputs/MobixMultiSelect';

const meta: Meta<typeof MobixMultiSelect> = {
  title: 'Mobix/Inputs/MultiSelect',
  component: MobixMultiSelect,
};

export default meta;

type Story = StoryObj<typeof MobixMultiSelect>;

const sampleOptions = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Mantenimiento', value: 'maintenance' },
  { label: 'Hino', value: 'hino' },
  { label: 'Chevrolet', value: 'chevrolet' },
  { label: 'Buseta', value: 'buseta' },
  { label: 'Microbus', value: 'microbus' },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['active', 'draft']);
    return (
      <Box sx={{ maxWidth: 420 }}>
        <MobixMultiSelect
          label="Estados"
          placeholder="Selecciona uno o más"
          options={sampleOptions.slice(0, 4)}
          value={value}
          onChange={setValue}
          searchable={false}
          helperText="Puedes seleccionar más de uno"
        />
      </Box>
    );
  },
};

export const WithSearch: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['hino', 'chevrolet']);
    return (
      <Box sx={{ maxWidth: 420 }}>
        <MobixMultiSelect
          label="Marca / Clase"
          placeholder="Selecciona uno o más"
          options={sampleOptions.slice(4)}
          value={value}
          onChange={setValue}
          searchable
          helperText="Busca y selecciona múltiples opciones"
          maxChips={3}
        />
      </Box>
    );
  },
};

export const LongListTruncated: Story = {
  render: () => {
    const longOptions = Array.from({ length: 12 }).map((_, idx) => ({
      label: `Opción ${idx + 1}`,
      value: `opt-${idx + 1}`,
    }));
    const [value, setValue] = useState<string[]>(longOptions.map((o) => o.value).slice(0, 7));
    return (
      <Box sx={{ maxWidth: 420 }}>
        <MobixMultiSelect
          label="Lista larga"
          options={longOptions}
          value={value}
          onChange={setValue}
          maxChips={3}
          helperText="Cuando hay más de 3, se muestra +N"
        />
      </Box>
    );
  },
};
