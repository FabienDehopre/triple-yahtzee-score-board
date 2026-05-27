import { Injectable } from '@angular/core';

/**
 * Minimal ambient type for the Cloudflare Turnstile JS API.
 * The full script is loaded via <script> in index.html.
 */
interface TurnstileAPI {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: 'auto' | 'dark' | 'light';
      size?: 'compact' | 'flexible' | 'normal';
      callback?: (token: string) => void;
      'error-callback'?: (errorCode: string) => void;
      'expired-callback'?: () => void;
      'timeout-callback'?: () => void;
      language: string;
    }
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile: TurnstileAPI;
  }
}

@Injectable({
  providedIn: 'root',
})
export class TurnstileService {
  render(container: HTMLElement, options: Parameters<TurnstileAPI['render']>[1]): string {
    return window.turnstile.render(container, options);
  }

  reset(widgetId: string): void {
    window.turnstile.reset(widgetId);
  }

  remove(widgetId: string): void {
    window.turnstile.remove(widgetId);
  }
}
