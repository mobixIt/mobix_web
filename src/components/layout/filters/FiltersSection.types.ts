import type { ReactNode } from 'react';

export type AsyncSelectOption = {
  label: string;
  value: string;
  code?: string | null;
};

export type FilterFieldBase = {
  id: string;
  label: string;
  colSpan?: number;
  disabled?: boolean;
  loading?: boolean;
};

export type FilterFieldUiState = {
  disabled?: boolean;
  loading?: boolean;
};

export type SelectFilterField = FilterFieldBase & FilterFieldUiState & {
  type: 'select';
  options: { label: string; value: string; code?: string | null }[];
  placeholder?: string;
};

export type MultiSelectFilterField = FilterFieldBase & FilterFieldUiState & {
  type: 'multi-select';
  options: { label: string; value: string; code?: string | null }[];
  placeholder?: string;
  helperText?: string;
  searchable?: boolean;
  maxChips?: number;
};

export type AsyncSelectFilterField = FilterFieldBase & FilterFieldUiState & {
  type: 'async-select';
  placeholder?: string;
  loadOptions: (input: string) => Promise<AsyncSelectOption[]>;
  minCharsToSearch?: number;
  debounceMs?: number;
};

export type TextFilterField = FilterFieldBase & {
  type: 'text' | 'search';
  placeholder?: string;
};

export type CustomFilterField = FilterFieldBase & {
  type: 'custom';
  render: () => ReactNode;
};

export type FiltersSectionField =
  | SelectFilterField
  | MultiSelectFilterField
  | TextFilterField
  | CustomFilterField
  | AsyncSelectFilterField;

export type FiltersSectionValue = string | string[] | AsyncSelectOption | null;
export type FiltersSectionValues = Record<string, FiltersSectionValue>;

export type FiltersSectionProps = {
  title?: string;
  fields: FiltersSectionField[];
  values: FiltersSectionValues;
  onFieldChange: (fieldId: string, value: FiltersSectionValue) => void;
  columns?: 2 | 3 | 4;
  onClear?: () => void;
  onApply?: () => void;
  showApplyButton?: boolean;
  showClearButton?: boolean;
  clearLabel?: string;
  applyLabel?: string;
  isApplying?: boolean;
  id?: string;
  enableRowToggle?: boolean;
  collapsedRows?: number;
};
