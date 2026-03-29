import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { APP_CONFIG } from './app/app.config';

bootstrapApplication(App, APP_CONFIG)
  .catch((error: unknown) => console.error(error));
