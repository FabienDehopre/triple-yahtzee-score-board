import { defineConfig } from '@fabdeh/eslint-config';

export default defineConfig({
  ignores: [
    '.agents/**',
    '.angular/**',
    '.claude/**',
    '.codex/**',
    '.github/**',
    '.sandcastle/**',
    '.vscode/**',
    'worker/.wrangler/**',
  ],
  angular: {
    banDeveloperPreviewApi: false,
    banExperimentalApi: false,
  },
  playwright: {
    e2eFolderPath: 'e2e/',
  },
  tailwindcss: {
    entryPoint: 'src/styles.css',
  },
  typescript: {
    enableErasableSyntaxOnly: true,
    useRelaxedNamingConventionForCamelAndPascalCases: true,
  },
});
