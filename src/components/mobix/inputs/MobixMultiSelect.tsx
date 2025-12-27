import React from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Checkbox,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

import { MobixButton, MobixButtonText } from '@/components/mobix/button';
import { MobixTextFieldRoot } from './MobixTextField.styled';

export type MobixMultiSelectOption = { label: string; value: string };

export type MobixMultiSelectProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  options: MobixMultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
  maxChips?: number;
  inputHeight?: number;
};

const DEFAULT_MAX_CHIPS = 3;
const DEFAULT_INPUT_HEIGHT = 48;

export function MobixMultiSelect({
  id,
  label,
  placeholder = 'Selecciona uno o más',
  options,
  value,
  onChange,
  searchable = true,
  maxChips = DEFAULT_MAX_CHIPS,
  inputHeight = DEFAULT_INPUT_HEIGHT,
}: MobixMultiSelectProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const handleOpen = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    setAnchorEl(null);
  }, []);

  const toggleValue = React.useCallback((val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  }, [onChange, value]);

  const handleClear = React.useCallback(() => onChange([]), [onChange]);

  const filteredOptions = React.useMemo(() => {
    if (!searchable) return options;
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, search, searchable]);

  const hasValue = value.length > 0;

  const chipColor = theme.palette.secondary.light;
  const chipText = theme.palette.primary.main;

  const renderChips = () => {
    if (!hasValue) {
      return null;
    }

    const maxVisible = Math.max(1, maxChips - 1);
    const visibleValues = value.slice(0, maxVisible);
    const extra = value.length - visibleValues.length;

    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap', alignItems: 'center', overflow: 'hidden' }}>
        {visibleValues.map((val) => {
          const opt = options.find((o) => o.value === val);
          const label = opt?.label ?? val;
          return (
            <Chip
              key={val}
              label={label}
              size="small"
              onMouseDown={(e) => e.preventDefault()}
              onDelete={() => onChange(value.filter((v) => v !== val))}
              sx={{
                height: 24,
                backgroundColor: chipColor,
                color: chipText,
                '& .MuiChip-deleteIcon': { color: chipText },
              }}
            />
          );
        })}
        {extra > 0 ? (
          <Chip
            label={`+${extra}`}
            size="small"
            onMouseDown={(e) => e.preventDefault()}
            sx={{
              height: 24,
              backgroundColor: chipColor,
              color: chipText,
            }}
          />
        ) : null}
      </Box>
    );
  };

  const renderList = React.useCallback(() => (
    <Box sx={{ width: 320, maxHeight: 320, display: 'flex', flexDirection: 'column' }}>
      {searchable ? (
        <Box sx={{ p: 1, pb: 0 }}>
          <MobixTextFieldRoot
            fullWidth
            size="small"
            value={search}
            placeholder="Buscar"
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      ) : null}
      <List dense sx={{ overflowY: 'auto', maxHeight: 280, p: 0 }}>
        {filteredOptions.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <ListItemButton
              key={opt.value}
              onClick={() => toggleValue(opt.value)}
              role="option"
              aria-selected={checked}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox edge="start" tabIndex={-1} disableRipple checked={checked} />
              </ListItemIcon>
              <ListItemText primary={opt.label} />
            </ListItemButton>
          );
        })}
      </List>
      <DialogActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
        <MobixButtonText size="small" color="secondary" onClick={handleClear}>
          Limpiar
        </MobixButtonText>
        <MobixButton size="small" variant="contained" onClick={handleClose}>
          Listo
        </MobixButton>
      </DialogActions>
    </Box>
  ), [filteredOptions, handleClear, handleClose, searchable, search, toggleValue, value]);

  return (
    <Box>
      <MobixTextFieldRoot
        id={id}
        fullWidth
        label={label}
        value=""
        onClick={handleOpen}
        slotProps={{
          inputLabel: { shrink: hasValue || open },
          input: {
            readOnly: true,
            startAdornment: hasValue ? (
              <InputAdornment position="start" sx={{ width: '100%', pointerEvents: 'none' }}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    flexWrap: 'nowrap',
                    width: '100%',
                    minHeight: 32,
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {renderChips()}
                </Box>
              </InputAdornment>
            ) : undefined,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" edge="end" aria-label="open multi select" tabIndex={-1}>
                  <KeyboardArrowDownIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              cursor: 'pointer',
              minHeight: inputHeight,
              height: inputHeight,
              '& .MuiInputBase-input': {
                paddingTop: (theme) => theme.spacing(1.25),
                paddingBottom: (theme) => theme.spacing(1.25),
              },
            },
          },
        }}
        placeholder={hasValue ? undefined : placeholder}
        inputProps={{ 'aria-label': label ?? placeholder }}
      />

      {isMobile ? (
        <Dialog fullWidth open={open} onClose={handleClose}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {label ?? 'Seleccionar'}
            <IconButton onClick={handleClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>{open ? renderList() : null}</DialogContent>
        </Dialog>
      ) : (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: (theme) => ({
                mt: 0.5,
                boxShadow: theme.shadows[8],
              }),
            },
          }}
        >
          {open ? renderList() : null}
        </Popover>
      )}
    </Box>
  );
}
