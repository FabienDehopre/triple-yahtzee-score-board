import type { ApplicationConfig } from '@angular/core';

import { provideBrowserGlobalErrorListeners } from '@angular/core';

export const APP_CONFIG: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners()],
};
