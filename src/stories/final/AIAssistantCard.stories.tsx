import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import AIAssistantCard from '@/components/AIAssistantCard/AIAssistantCard';
import { aiAssistantDefaults } from '@/components/AIAssistantCard/AIAssistantCard.constants';

const meta: Meta<typeof AIAssistantCard> = {
  title: 'Components/AIAssistantCard',
  component: AIAssistantCard,
  args: {
    title: aiAssistantDefaults.title,
    subtitle: aiAssistantDefaults.subtitle,
    suggestionTitle: aiAssistantDefaults.suggestionTitle,
    suggestionBody: aiAssistantDefaults.suggestionBody,
    inputPlaceholder: aiAssistantDefaults.inputPlaceholder,
    tipText: aiAssistantDefaults.tipText,
    actions: {
      primaryLabel: aiAssistantDefaults.primaryActionLabel,
      secondaryLabel: aiAssistantDefaults.secondaryActionLabel,
      onPrimary: fn(),
      onSecondary: fn(),
      onCloseSuggestion: fn(),
    },
    onSendQuestion: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AIAssistantCard>;

export const Default: Story = {};

export const WithoutSuggestion: Story = {
  args: {
    suggestionTitle: undefined,
    suggestionBody: undefined,
    actions: undefined,
  },
};

export const CustomLabels: Story = {
  args: {
    title: 'Asistente de Ventas',
    subtitle: 'Consulta tus KPIs comerciales',
    badgeLabel: 'ALPHA',
    suggestionTitle: 'Sugerencia de forecast',
    suggestionBody:
      'Tu pregunta apunta a proyecciones de ventas. Podemos generar un forecast y compararlo con el pipeline.',
    actions: {
      primaryLabel: 'Ver forecast',
      secondaryLabel: 'Abrir tablero',
      onPrimary: fn(),
      onSecondary: fn(),
    },
    inputPlaceholder: 'Pregunta sobre oportunidades, MRR, churn...',
    tipText: 'Tip: Pregunta "¿Qué deals requieren atención esta semana?"',
  },
};
