import { defineConfig } from '@fabdeh/eslint-config';

export default defineConfig({
  ignores: [
    '.agents/**',
    '.angular/**',
    '.claude/**',
    '.github/**',
    '.vscode/**',
  ],
  angular: {
    banDeveloperPreviewApi: false,
    banExperimentalApi: false,
  },
  formatters: true,
  tailwindcss: {
    entryPoint: 'src/styles.css',
    overrides: {
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    },
    preferSingleLine: true,
    printWidth: 100,
  },
  typescript: {
    enableErasableSyntaxOnly: true,
    useRelaxedNamingConventionForCamelAndPascalCases: true,
  },
});
