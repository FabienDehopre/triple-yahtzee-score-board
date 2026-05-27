import { InjectionToken } from '@angular/core';

export const IS_TEST_ENV = new InjectionToken<boolean>('IS_TEST_ENV', {
  providedIn: 'root',
  factory: () => {
    // Vitest
    try {
      if (import.meta.env.MODE === 'test' || import.meta.env['VITEST']) return true;
    } catch {
      /* not in a vitest context */
    }

    // if the browser is controlled by automation, consider it a test environment.
    // This is true for most test runners (Vitest, Karma, Protractor, Cypress, Playwright, etc.)
    // but not 100% reliable on its own so we combine it with the Vite-specific check above.
    return navigator.webdriver;
  },
});
