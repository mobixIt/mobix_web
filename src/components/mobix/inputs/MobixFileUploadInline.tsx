'use client';

import React, { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import UploadIcon from '@mui/icons-material/Upload';

import { MobixButton } from '@/components/mobix/button';
import { MobixTextField } from '@/components/mobix/inputs/MobixTextField';

export interface MobixFileUploadInlineProps {
  label?: string;
  helperText?: string;
  placeholder?: string;
  buttonLabel?: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected?: (files: FileList) => void;
}

export const MobixFileUploadInline: React.FC<MobixFileUploadInlineProps> = ({
  label = 'Subida con botón',
  helperText,
  placeholder = 'Ningún archivo seleccionado',
  buttonLabel = 'Subir archivo',
  accept,
  multiple = false,
  onFilesSelected,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFileName(
      multiple
        ? `${e.target.files.length} archivo(s)`
        : e.target.files[0]?.name ?? ''
    );
    onFilesSelected?.(e.target.files);
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          {label}
        </Typography>
      )}

      <Stack direction="row" spacing={2} alignItems="center">
        <MobixTextField
          fullWidth
          value={fileName}
          placeholder={placeholder}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

        <MobixButton
          variant="contained"
          color="secondary"
          onClick={() => inputRef.current?.click()}
          startIcon={<UploadIcon />}
        >
          {buttonLabel.toUpperCase()}
        </MobixButton>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Stack>

      {helperText && (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </Box>
  );
};