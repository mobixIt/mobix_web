// src/components/mobix/inputs/MobixFileUpload.tsx
import * as React from 'react';
import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { MobixFileUploadRoot } from './MobixFileUpload.styled';

export interface MobixFileUploadProps {
  /** Label displayed above the control */
  label?: string;
  /** Helper text shown inside the dropzone (secondary line) */
  helperText?: string;
  /** Main text shown inside the dropzone when no file is selected */
  placeholder?: string;
  /** Native `accept` attribute for allowed file types */
  accept?: string;
  /** Whether multiple files can be selected */
  multiple?: boolean;
  /** Callback fired when files are selected or dropped */
  onFilesSelected?: (files: FileList) => void;
}

export const MobixFileUpload: React.FC<MobixFileUploadProps> = ({
  label = 'Carga de archivos',
  placeholder = 'Arrastra archivos aquí o haz clic para seleccionar',
  helperText = 'Formatos: JPG, PNG, PDF (máx. 10MB)',
  accept,
  multiple,
  onFilesSelected,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFileDialog = () => inputRef.current?.click();

  const setFilesState = (files: FileList) => {
    if (!files || files.length === 0) return;

    setFileName(
      files.length === 1
        ? files[0].name
        : `${files.length} archivos seleccionados`,
    );

    onFilesSelected?.(files);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setFilesState(event.target.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    if (!event.dataTransfer.files) return;
    setFilesState(event.dataTransfer.files);
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
      )}

      <MobixFileUploadRoot
        elevation={0}
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={isDragOver ? 'MobixFileUpload--dragOver' : undefined}
      >
        <CloudUploadIcon
          sx={{
            fontSize: 48,
            color: (theme) => theme.palette.neutral.main,
            mb: 1.5,
          }}
        />

        <Typography
          variant="body1"
          fontWeight={500}
          color="text.primary"
          sx={{ mb: 0.5 }}
        >
          {fileName || placeholder}
        </Typography>

        {helperText && (
          <Typography variant="body2" color="text.secondary">
            {helperText}
          </Typography>
        )}

        <input
          ref={inputRef}
          type="file"
          hidden
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />
      </MobixFileUploadRoot>
    </Box>
  );
};

export default MobixFileUpload;