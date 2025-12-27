'use client';

import React from 'react';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { MenuItem, InputAdornment } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

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
import {
  AsyncSelectOption,
  AsyncSelectFilterField,
  FiltersSectionValue,
  FiltersSectionProps,
  FiltersSectionField,
} from './FiltersSection.types';

import { MobixButtonProgress, MobixButtonText } from '@/components/mobix/button';
import { MobixTextField } from '@/components/mobix/inputs/MobixTextField';
import { MobixMultiSelect } from '@/components/mobix/inputs/MobixMultiSelect';

// --- Helpers ---

const normalizeStr = (x: unknown): string => String(x ?? '').trim();
const toLowerSafe = (x: unknown): string => normalizeStr(x).toLowerCase();

const UNIFIED_INPUT_HEIGHT = 48;

function filterAsyncOptionsByLabelAndCode(
  options: AsyncSelectOption[],
  inputValue: string,
): AsyncSelectOption[] {
  const q = toLowerSafe(inputValue);
  if (!q) return options;

  return options.filter((o) => {
    const token = `${o.label} ${(o.code ?? '')}`.toLowerCase();
    return token.includes(q);
  });
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

// --- Componentes Internos Optimizados ---

const AsyncSelectControl = React.memo(({
  field,
  value,
  onChange,
}: {
  field: AsyncSelectFilterField;
  value: FiltersSectionValue | undefined;
  onChange: (fieldId: string, value: FiltersSectionValue) => void;
}) => {
  const selected = (value && typeof value === 'object' ? value : null) as AsyncSelectOption | null;

  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<AsyncSelectOption[]>([]);
  const [loading, setLoading] = React.useState(false);

  const debounceMs = field.debounceMs ?? 300;
  const minChars = field.minCharsToSearch ?? 2;
  const debounced = useDebouncedValue(inputValue, debounceMs);

  const isDisabled = Boolean(field.disabled) || Boolean(field.loading);

  const runLoad = React.useCallback(
    async (q: string) => {
      setLoading(true);
      try {
        const result = await field.loadOptions(q);
        setOptions(result ?? []);
      } finally {
        setLoading(false);
      }
    },
    [field],
  );

  React.useEffect(() => {
    let alive = true;

    async function run() {
      if (isDisabled) {
        setOptions([]);
        return;
      }

      const q = debounced.trim();

      if (minChars > 0 && (!q || q.length < minChars)) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const result = await field.loadOptions(q);
        if (alive) setOptions(result ?? []);
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => { alive = false; };
  }, [debounced, field, minChars, isDisabled]);

  const handleOpen = () => {
    if (isDisabled) return;
    if ((field.minCharsToSearch ?? 2) !== 0) return;
    void runLoad('');
  };

  return (
    <Autocomplete
      options={options}
      value={selected}
      loading={loading || Boolean(field.loading)}
      disabled={isDisabled}
      onChange={(_, newValue) => onChange(field.id, (newValue as AsyncSelectOption) ?? null)}
      inputValue={inputValue}
      onInputChange={(_, newInput) => setInputValue(newInput)}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      getOptionLabel={(opt) => opt?.label ?? ''}
      filterOptions={(opts, state) => filterAsyncOptionsByLabelAndCode(opts, state.inputValue)}
      onOpen={handleOpen}
      renderOption={(props, option) => {
        const code = (option.code ?? '').trim();
        return (
          <li {...props}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>{option.label}</span>
              {code ? (
                <span style={{ opacity: 0.7, fontSize: 12, lineHeight: 1.2 }}>{code}</span>
              ) : null}
            </div>
          </li>
        );
      }}
      renderInput={(params) => (
        <MobixTextField
          {...params}
          fullWidth
          size="small"
          placeholder={field.placeholder}
          disabled={isDisabled}
          sx={{ '& .MuiInputBase-root': { minHeight: UNIFIED_INPUT_HEIGHT, height: UNIFIED_INPUT_HEIGHT } }}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading || field.loading ? <CircularProgress size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
});

AsyncSelectControl.displayName = 'AsyncSelectControl';
// --- Componente Principal ---

export default function FiltersSection({
  title = 'Filtros',
  fields,
  values,
  onFieldChange,
  columns = 3,
  onClear,
  onApply,
  showApplyButton = true,
  showClearButton = true,
  clearLabel = 'Restablecer',
  applyLabel = 'Aplicar',
  isApplying = false,
  id = 'filters-section',
  enableRowToggle = true,
  collapsedRows = 1,
}: FiltersSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [renderAllFields, setRenderAllFields] = React.useState(false);
  const collapseTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
    };
  }, []);

  const handleToggleExpand = React.useCallback(() => {
    if (!enableRowToggle) return;

    if (!isExpanded) {
      setRenderAllFields(true);
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = setTimeout(() => {
        setRenderAllFields(false);
      }, 350);
    }
  }, [enableRowToggle, isExpanded]);

  const renderFieldControl = React.useCallback((field: FiltersSectionField) => {
    if (field.type === 'custom') return field.render();

    const isDisabled = Boolean(field.disabled) || Boolean(field.loading);

    if (field.type === 'select') {
      const currentValue = (values[field.id] as string) ?? '';
      return (
        <MobixTextField
          id={field.id}
          select
          fullWidth
          size="small"
          value={currentValue}
          onChange={(e) => onFieldChange(field.id, e.target.value)}
          disabled={isDisabled}
          sx={{ '& .MuiInputBase-root': { minHeight: UNIFIED_INPUT_HEIGHT, height: UNIFIED_INPUT_HEIGHT } }}
          slotProps={{
            input: { endAdornment: field.loading ? <CircularProgress size={16} /> : undefined },
          }}
        >
          {field.placeholder && <MenuItem value="">{field.placeholder}</MenuItem>}
          {field.options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </MobixTextField>
      );
    }

    if (field.type === 'multi-select') {
      const currentValue = Array.isArray(values[field.id]) ? (values[field.id] as string[]) : [];
      return (
        <MobixMultiSelect
          id={field.id}
          label={field.label}
          options={field.options}
          placeholder={field.placeholder}
          helperText={field.helperText}
          searchable={field.searchable}
          maxChips={field.maxChips}
          value={currentValue}
          onChange={(next) => onFieldChange(field.id, next)}
          loading={Boolean(field.loading)}
          inputHeight={UNIFIED_INPUT_HEIGHT}
        />
      );
    }

    if (field.type === 'async-select') {
      return <AsyncSelectControl field={field} value={values[field.id]} onChange={onFieldChange} />;
    }

    const currentValue = (values[field.id] as string) ?? '';
    const isSearch = field.type === 'search';

    return (
      <MobixTextField
        id={field.id}
        fullWidth
        size="small"
        placeholder={field.placeholder}
        value={currentValue}
        onChange={(e) => onFieldChange(field.id, e.target.value)}
        type={isSearch ? 'search' : 'text'}
        disabled={isDisabled}
        sx={{ '& .MuiInputBase-root': { minHeight: UNIFIED_INPUT_HEIGHT, height: UNIFIED_INPUT_HEIGHT } }}
        slotProps={isSearch ? {
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={(theme) => ({ color: theme.palette.neutral.dark })} />
              </InputAdornment>
            ),
          },
        } : undefined}
      />
    );
  }, [values, onFieldChange]);

  // Memoize visible fields calculation
  const { visibleFields } = React.useMemo(() => {
    if (!enableRowToggle || renderAllFields || isExpanded) {
      return { visibleFields: fields, hasHiddenFields: false };
    }

    const visible: FiltersSectionField[] = [];
    let currentRow = 0;
    let currentCol = 0;

    for (const field of fields) {
      const span = Math.min(field.colSpan ?? 1, columns);
      if (currentCol + span > columns) {
        currentRow += 1;
        currentCol = 0;
      }
      if (currentRow >= collapsedRows) break;
      visible.push(field);
      currentCol += span;
    }

    return { 
      visibleFields: visible, 
      hasHiddenFields: visible.length < fields.length 
    };
  }, [fields, enableRowToggle, renderAllFields, isExpanded, columns, collapsedRows]);

  // Update hasHiddenFields only when fully expanded/collapsed state is stable
  // But for the toggle button visibility, we need to know if fields *would* be hidden
  // Reworking this: calculate collapsed fields once to know if toggle is needed
  const shouldShowToggle = React.useMemo(() => {
    if (!enableRowToggle) return false;
    // Calculate if collapsing would hide anything
    let currentRow = 0;
    let currentCol = 0;
    let count = 0;
    
    for (const field of fields) {
      const span = Math.min(field.colSpan ?? 1, columns);
      if (currentCol + span > columns) {
        currentRow += 1;
        currentCol = 0;
      }
      if (currentRow >= collapsedRows) break;
      currentCol += span;
      count++;
    }
    return count < fields.length;
  }, [fields, columns, collapsedRows, enableRowToggle]);

  return (
    <FiltersSectionRoot id={id}>
      <FiltersCard>
        <FiltersHeader>
          <FiltersTitle component="h2">{title}</FiltersTitle>
        </FiltersHeader>

        <FiltersGridWrapper expanded={!enableRowToggle || isExpanded} collapsedRows={collapsedRows}>
          <FiltersGrid columns={columns}>
            {visibleFields.map((field) => (
              <FilterFieldItem key={field.id} colSpan={field.colSpan}>
                <FilterLabel htmlFor={field.id}>{field.label}</FilterLabel>
                {renderFieldControl(field)}
              </FilterFieldItem>
            ))}
          </FiltersGrid>
        </FiltersGridWrapper>

        <FiltersToggleWrapper>
          {shouldShowToggle && (
            <MobixButtonText
              size="small"
              color="secondary"
              onClick={handleToggleExpand}
              data-testid="filters-section-toggle"
              startIcon={isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
              sx={{ padding: '0 2px', minWidth: 0, justifyContent: 'flex-start' }}
            >
              {isExpanded ? 'Ocultar Filtros avanzados' : 'Mostrar Filtros avanzados'}
            </MobixButtonText>
          )}

          <FiltersActions>
            {showClearButton && onClear && (
              <MobixButtonText
                size="small"
                color="secondary"
                data-testid="filters-section-clear"
                onClick={onClear}
                startIcon={<RotateRightIcon fontSize="small" />}
              >
                {clearLabel}
              </MobixButtonText>
            )}

            {showApplyButton && onApply && (
              <MobixButtonProgress
                size="small"
                variant="contained"
                color="primary"
                data-testid="filters-section-apply"
                isSubmitting={isApplying}
                onClick={onApply}
                aria-label={applyLabel}
              >
                {applyLabel}
              </MobixButtonProgress>
            )}
          </FiltersActions>
        </FiltersToggleWrapper>
      </FiltersCard>
    </FiltersSectionRoot>
  );
}
