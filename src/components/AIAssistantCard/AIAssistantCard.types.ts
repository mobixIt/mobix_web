export type AIAssistantCardActions = {
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onCloseSuggestion?: () => void;
};

export type AIAssistantCardProps = {
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  suggestionTitle?: string;
  suggestionBody?: string;
  actions?: AIAssistantCardActions;
  inputPlaceholder?: string;
  tipText?: string;
  defaultQuestion?: string;
  onSendQuestion?: (question: string) => void;
};
