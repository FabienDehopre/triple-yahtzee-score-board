/// <reference types="vite/client" />

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  /* eslint-disable @typescript-eslint/naming-convention */
  readonly NG_APP_REPORT_ISSUE_ENDPOINT?: string;
  readonly NG_APP_TURNSTILE_SITE_KEY?: string;
  readonly NG_APP_BUILD_ID?: string;
  readonly VITEST?: boolean;
  /* eslint-enable @typescript-eslint/naming-convention */
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
