import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { CATEGORY_LABEL_KEYS } from '../../models/i18n-keys';
import { SessionStore } from '../../services/session.store';
import { UndoStore } from '../../services/undo.store';

@Component({
  selector: 'app-undo-banner',
  imports: [TranslocoPipe],
  templateUrl: './undo-banner.component.html',
  styleUrl: './undo-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UndoBannerComponent {
  readonly #undoStore = inject(UndoStore);
  readonly #sessionStore = inject(SessionStore);
  readonly #transloco = inject(TranslocoService);

  protected readonly canUndo = this.#undoStore.canUndo;

  protected readonly undoMessage = computed(() => {
    void this.#transloco.activeLang();
    const cat = this.#undoStore.lastCategory();
    if (cat === undefined) return '';
    const categoryName = this.#transloco.translate(CATEGORY_LABEL_KEYS[cat]);
    return this.#transloco.translate('undoBanner.message', { category: categoryName });
  });

  protected onUndo(): void {
    this.#sessionStore.undo();
  }
}
