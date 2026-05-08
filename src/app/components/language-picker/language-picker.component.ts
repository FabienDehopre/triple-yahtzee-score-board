import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AVAILABLE_LANGS, LOCALE_STORAGE_KEY } from '../../app.config';

@Component({
  selector: 'app-language-picker',
  imports: [TranslocoPipe],
  templateUrl: './language-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguagePickerComponent {
  readonly #transloco = inject(TranslocoService);

  protected readonly availableLangs = AVAILABLE_LANGS;
  protected readonly activeLang = signal(
    localStorage.getItem(LOCALE_STORAGE_KEY) ?? this.#transloco.getActiveLang()
  );

  protected onLangChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value;
    this.activeLang.set(lang);
    this.#transloco.setActiveLang(lang);
    localStorage.setItem(LOCALE_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }
}
