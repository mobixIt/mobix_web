import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import AiNoResultsBanner from '@/components/ai/AiNoResultsBanner';

const meta: Meta<typeof AiNoResultsBanner> = {
  title: 'Final/AiNoResultsBanner',
  component: AiNoResultsBanner,
  args: {
    onRetry: fn(),
    onClear: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AiNoResultsBanner>;

export const Default: Story = {};

export const WithoutNote: Story = {
  args: {
    note: undefined,
  },
};

export const CustomCopy: Story = {
  args: {
    message: 'No encontramos coincidencias todavía. ¿Probamos afinando la pregunta?',
    hint: 'Agrega marca, modelo o un rango de años para ayudarme.',
    note: 'Mostrando resultados previos.',
    retryLabel: 'Reintentar',
    clearLabel: 'Ver todos',
  },
};

export const ErrorState: Story = {
  args: {
    tone: 'error',
    message: 'Tuvimos un problema al procesar tu consulta. ¿Probamos de nuevo?',
    hint: 'Revisa tu conexión o intenta con otra frase.',
    note: 'Mostrando los últimos resultados mientras reintentas.',
    retryLabel: 'Reintentar',
    clearLabel: 'Ver todos',
  },
};
