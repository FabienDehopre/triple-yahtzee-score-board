/// <reference types="vitest" />

import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['dotenv/config', 'src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['json', 'text-summary'],
      include: ['src/**/*.ts'],
    },
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
  envPrefix: 'NG_APP_',
}));
