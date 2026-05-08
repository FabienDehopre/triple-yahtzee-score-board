import type { Translation, TranslocoLoader } from '@jsverse/transloco';
import type { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  readonly #http = inject(HttpClient);

  getTranslation(lang: string): Observable<Translation> {
    return this.#http.get<Translation>(`/i18n/${lang}.json`);
  }
}
