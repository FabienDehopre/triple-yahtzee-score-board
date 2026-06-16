import { defineConfig } from '@fabdeh/eslint-config';

export default defineConfig({
  ignores: [
    '.agents/**',
    '.claude/**',
    '.codex/**',
    '.github/**',
    '.sandcastle/**',
    '.vscode/**',
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
