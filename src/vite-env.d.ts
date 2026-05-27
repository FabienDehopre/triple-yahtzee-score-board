/// <reference types="vite/client" />

interface ImportMetaEnv {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly NG_APP_REPORT_ISSUE_ENDPOINT?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly NG_APP_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
