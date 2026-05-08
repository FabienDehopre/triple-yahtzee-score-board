import type { ApplicationConfig } from '@angular/core';

import { provideHttpClient } from '@angular/common/http';
import { inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';

import { TranslocoHttpLoader } from './transloco-loader';

export const LOCALE_STORAGE_KEY = 'triple-yahtzee-locale';
export const AVAILABLE_LANGS = ['en', 'fr'];
export const DEFAULT_LANG = 'en';

export const APP_CONFIG: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: AVAILABLE_LANGS,
        defaultLang: DEFAULT_LANG,
        reRenderOnLangChange: true,
        prodMode: false,
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => {
      const transloco = inject(TranslocoService);
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      const lang = stored && AVAILABLE_LANGS.includes(stored) ? stored : DEFAULT_LANG;
      transloco.setActiveLang(lang);
      document.documentElement.lang = lang;
      return transloco.load(lang);
    }),
  ],
};
