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
  },
  typescript: {
    enableErasableSyntaxOnly: true,
    useRelaxedNamingConventionForCamelAndPascalCases: true,
  },
});
