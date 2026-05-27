import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

import { ToastService } from '../../services/toast.service';

/**
 * Displays short-lived success/error notifications anchored bottom-left.
 * Used exclusively by the report-issue flow.
 */
@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  readonly #toastService = inject(ToastService);
  readonly #transloco = inject(TranslocoService);

  protected readonly toast = this.#toastService.current;
  protected readonly isSuccess = computed(() => this.toast()?.type === 'success');

  protected readonly message = computed(() => {
    void this.#transloco.activeLang();
    const t = this.toast();
    if (!t) return '';
    if (t.type === 'success') {
      return this.#transloco.translate('reportIssue.successToast', {
        url: t.url,
        issueNumber: t.issueNumber,
      });
    }
    const errorKeys = new Map<string, string>([
      ['rate_limited', 'reportIssue.errorRateLimited'],
      ['turnstile_failed', 'reportIssue.errorTurnstileFailed'],
      ['validation', 'reportIssue.errorNetwork'],
      ['network_error', 'reportIssue.errorNetwork'],
    ]);
    const key = errorKeys.get(t.code) ?? 'reportIssue.errorNetwork';
    return this.#transloco.translate(key);
  });
}
