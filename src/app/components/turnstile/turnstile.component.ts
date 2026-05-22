import type {
  ElementRef
} from '@angular/core';

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

import { TurnstileService } from './turnstile.service';

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
export class TurnstileComponent {
  readonly #widgetId = signal<string | undefined>(undefined);
  readonly #transloco = inject(TranslocoService);
  readonly #turnstile = inject(TurnstileService);

  protected readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

  readonly siteKey = input.required<string>();
  readonly tokenChange = output<string>();

  constructor() {
    afterNextRender(() => {
      const container = this.container().nativeElement;
      untracked(() => {
        const id = this.#turnstile.render(container, {
          sitekey: this.siteKey(),
          theme: 'light',
          language: this.#transloco.getActiveLang(),
          callback: (token) => this.tokenChange.emit(token),
          'expired-callback': () => this.reset(),
          'error-callback': (errorCode: string): void => {
            this.tokenChange.emit('');
            console.error('Turnstile error:', errorCode);
          },
        });
        this.#widgetId.set(id);
      });
    });
    inject(DestroyRef).onDestroy(() => {
      const id = this.#widgetId();

      if (id !== undefined) {
        this.#turnstile.remove(id);
      }
    });
  }

  reset(): void {
    const id = this.#widgetId();

    if (id !== undefined) {
      this.#turnstile.reset(id);
      this.tokenChange.emit('');
    }
  }

  // ngAfterViewInit(): void {
  //   if (typeof turnstile === 'undefined') return;
  //   const id = turnstile.render(this.container().nativeElement, {
  //     sitekey: this.siteKey(),
  //     theme: 'light',
  //     callback: (token) => this.tokenChange.emit(token),
  //     'expired-callback': () => this.tokenChange.emit(''),
  //     'error-callback': () => this.tokenChange.emit(''),
  //   });
  //   this.#widgetId.set(id);
  // }

  // ngOnDestroy(): void {
  //   const id = this.#widgetId();

  //   if (id !== undefined && typeof turnstile !== 'undefined') {
  //     turnstile.remove(id);
  //   }
  // }

  // reset(): void {
  //   const id = this.#widgetId();

  //   if (id !== undefined && typeof turnstile !== 'undefined') {
  //     turnstile.reset(id);
  //   }
  //   this.tokenChange.emit('');
  // }
}
