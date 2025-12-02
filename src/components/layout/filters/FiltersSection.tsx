'use client';

import React from 'react';
import type { ReactNode } from 'react';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { MenuItem, InputAdornment } from '@mui/material';

import {
  FiltersSectionRoot,
  FiltersCard,
  FiltersHeader,
  FiltersTitle,
  FiltersActions,
  FiltersGrid,
  FilterFieldItem,
  FilterLabel,
  FiltersToggleWrapper,
  FiltersGridWrapper,
} from './FiltersSection.styled';

import { MobixButton, MobixButtonText } from '@/components/mobix/button';
import { MobixTextField } from '@/components/mobix/inputs/MobixTextField';

export type FilterFieldBase = {
  id: string;
  label: string;
  colSpan?: number;
};

export type SelectFilterField = FilterFieldBase & {
  type: 'select';
  options: { label: string; value: string }[];
  placeholder?: string;
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
  | TextFilterField
  | CustomFilterField;

export type FiltersSectionValues = Record<string, string>;

export type FiltersSectionProps = {
  title?: string;
  fields: FiltersSectionField[];
  values: FiltersSectionValues;
  onFieldChange: (fieldId: string, value: string) => void;
  columns?: 2 | 3 | 4;
  onClear?: () => void;
  onApply?: () => void;
  showApplyButton?: boolean;
  showClearButton?: boolean;
  clearLabel?: string;
  applyLabel?: string;
  id?: string;
  enableRowToggle?: boolean;
  collapsedRows?: number;
};

export default function FiltersSection({
  title = 'Filtros de búsqueda',
  fields,
  values,
  onFieldChange,
  columns = 3,
  onClear,
  onApply,
  showApplyButton = true,
  showClearButton = true,
  clearLabel = 'Limpiar filtros',
  applyLabel = 'Aplicar filtros',
  id = 'filters-section',
  enableRowToggle = true,
  collapsedRows = 1,
}: FiltersSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const [renderAllFields, setRenderAllFields] = React.useState(false);
  const collapseTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectChange =
    (fieldId: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onFieldChange(fieldId, event.target.value);
    };

  const handleTextChange =
    (fieldId: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onFieldChange(fieldId, event.target.value);
    };

  const renderFieldControl = (field: FiltersSectionField) => {
    if (field.type === 'custom') {
      return field.render();
    }

    if (field.type === 'select') {
      const currentValue = values[field.id] ?? '';

      return (
        <MobixTextField
          select
          fullWidth
          size="small"
          value={currentValue}
          onChange={handleSelectChange(field.id)}
        >
          {field.placeholder && (
            <MenuItem value="">{field.placeholder}</MenuItem>
          )}
          {field.options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </MobixTextField>
      );
    }

    const currentValue = values[field.id] ?? '';
    const isSearch = field.type === 'search';

    return (
      <MobixTextField
        fullWidth
        size="small"
        placeholder={field.placeholder}
        value={currentValue}
        onChange={handleTextChange(field.id)}
        type={isSearch ? 'search' : 'text'}
        slotProps={
          isSearch
            ? {
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        fontSize="small"
                        sx={(theme) => ({
                          color: theme.palette.neutral.dark,
                        })}
                      />
                    </InputAdornment>
                  ),
                },
              }
            : undefined
        }
      />
    );
  };

  /**
   * Calcula qué campos caben en las primeras `collapsedRows` filas.
   */
  const computeCollapsedFields = (): FiltersSectionField[] => {
    const visible: FiltersSectionField[] = [];
    let currentRow = 0;
    let currentCol = 0;

    for (const field of fields) {
      const span = Math.min(field.colSpan ?? 1, columns);

      if (currentCol + span > columns) {
        currentRow += 1;
        currentCol = 0;
      }

      if (currentRow >= collapsedRows) {
        break;
      }

      visible.push(field);
      currentCol += span;
    }

    return visible;
  };

  const collapsedFields = computeCollapsedFields();
  const hasHiddenFields =
    enableRowToggle && collapsedFields.length < fields.length;

  const visibleFields =
    !enableRowToggle || renderAllFields || isExpanded
      ? fields
      : collapsedFields;

  const isGridExpanded = !enableRowToggle || isExpanded;

  const handleToggleExpand = () => {
    if (!enableRowToggle) return;

    if (!isExpanded) {
      setRenderAllFields(true);
      setIsExpanded(true);
    } else {
      setIsExpanded(false);

      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }

      collapseTimeoutRef.current = setTimeout(() => {
        setRenderAllFields(false);
      }, 350);
    }
  };

  return (
    <FiltersSectionRoot id={id}>
      <FiltersCard>
        <FiltersHeader>
          <FiltersTitle component="h2">{title}</FiltersTitle>

          <FiltersActions>
            {showClearButton && onClear && (
              <MobixButtonText
                size="small"
                color="secondary"
                onClick={onClear}
                startIcon={<RotateRightIcon fontSize="small" />}
              >
                {clearLabel}
              </MobixButtonText>
            )}

            {showApplyButton && onApply && (
              <MobixButton
                size="small"
                variant="contained"
                color="primary"
                onClick={onApply}
              >
                {applyLabel}
              </MobixButton>
            )}
          </FiltersActions>
        </FiltersHeader>

        <FiltersGridWrapper
          expanded={isGridExpanded}
          collapsedRows={collapsedRows}
        >
          <FiltersGrid columns={columns}>
            {visibleFields.map((field) => (
              <FilterFieldItem key={field.id} colSpan={field.colSpan}>
                <FilterLabel htmlFor={field.id}>{field.label}</FilterLabel>
                {renderFieldControl(field)}
              </FilterFieldItem>
            ))}
          </FiltersGrid>
        </FiltersGridWrapper>

        {hasHiddenFields && (
          <FiltersToggleWrapper>
            <MobixButtonText
              size="small"
              color="secondary"
              onClick={handleToggleExpand}
              startIcon={
                isExpanded ? (
                  <KeyboardArrowUpIcon fontSize="small" />
                ) : (
                  <KeyboardArrowDownIcon fontSize="small" />
                )
              }
              sx={{
                padding: '0 2px',
                minWidth: 0,
                justifyContent: 'flex-start',
              }}
            >
              {isExpanded ? 'Mostrar menos filtros' : 'Mostrar más filtros'}
            </MobixButtonText>
          </FiltersToggleWrapper>
        )}
      </FiltersCard>
    </FiltersSectionRoot>
  );
}