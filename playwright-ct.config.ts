import { defineConfig } from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  testDir: './tests/ct',
  fullyParallel: true,
  reporter: 'list',
  use: {
    ctPort: 3100,
    ctViteConfig: {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
    },
  },
});
