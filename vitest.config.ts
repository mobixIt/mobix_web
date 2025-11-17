import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],

    include: [
      'tests/unit/**/*.test.ts',
      'tests/unit/**/*.spec.ts',
    ],

    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
      'playwright-report',
      'test-results',
      'tests/e2e/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
