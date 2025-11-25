import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },

  optimizeDeps: {
    include: [
      '@mui/icons-material/KeyboardArrowDown',
      '@mui/icons-material/KeyboardArrowUp',
      '@mui/icons-material/SaveAlt',
      '@mui/icons-material/Delete',
      '@mdi/react',
      '@mdi/js',
    ],
  },

  plugins: [
    storybookTest({
      configDir: path.join(dirname, '.storybook'),
    }),
  ],

  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
    },
    setupFiles: ['.storybook/vitest.setup.ts'],
  },
});