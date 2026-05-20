import type {
  AfterViewInit,
  ElementRef,
  OnDestroy } from '@angular/core';

import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';

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
      callback?: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
    }
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const turnstile: TurnstileAPI | undefined;

/**
 * Wraps the Cloudflare Turnstile widget.
 * The Turnstile script must be loaded in index.html before this component mounts.
 *
 * Emits a token string when the challenge passes, or an empty string on error/expire.
 */
@Component({
  selector: 'app-turnstile',
  template: '<div #container></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TurnstileComponent implements AfterViewInit, OnDestroy {
  readonly #container = viewChild.required<ElementRef<HTMLElement>>('container');
  readonly #widgetId = signal<string | undefined>(undefined);

  readonly siteKey = input.required<string>();
  readonly tokenChange = output<string>();

  ngAfterViewInit(): void {
    if (turnstile === undefined) return;
    const id = turnstile.render(this.#container().nativeElement, {
      sitekey: this.siteKey(),
      theme: 'light',
      callback: (token) => this.tokenChange.emit(token),
      'expired-callback': () => this.tokenChange.emit(''),
      'error-callback': () => this.tokenChange.emit(''),
    });
    this.#widgetId.set(id);
  }

  ngOnDestroy(): void {
    const id = this.#widgetId();
    if (id !== undefined && turnstile !== undefined) {
      turnstile.remove(id);
    }
  }

  reset(): void {
    const id = this.#widgetId();
    if (id !== undefined && turnstile !== undefined) {
      turnstile.reset(id);
    }
    this.tokenChange.emit('');
  }
}
