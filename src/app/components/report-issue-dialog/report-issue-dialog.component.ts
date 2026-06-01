import type { ReportIssuePayload, ReportIssueResult } from '../../services/report-issue.service';

import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, minLength, required } from '@angular/forms/signals';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { GameStateAnonymizerService } from '../../services/game-state-anonymizer.service';
import { GameStateService } from '../../services/game-state.service';
import { injectIsTestEnv, injectTurnstileSiteKey } from '../../services/injection-tokens';
import { isReportIssueError, ReportIssueService } from '../../services/report-issue.service';
import { ToastService } from '../../services/toast.service';
import { TurnstileComponent } from '../turnstile/turnstile.component';

const TITLE_MAX = 100;
const DESC_MIN = 10;
const DESC_MAX = 2000;
const CONTACT_MAX = 200;

type ReportIssueFormModel = Required<Omit<ReportIssuePayload, 'gameState'>>;

/**
 * Modal dialog that allows users to file a bug or enhancement report.
 * Integrates Cloudflare Turnstile for spam protection and attaches an
 * anonymized game state snapshot to every submission.
 */
@Component({
  selector: 'app-report-issue-dialog',
  imports: [FormField, FormRoot, TranslocoPipe, TurnstileComponent],
  templateUrl: './report-issue-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIssueDialogComponent {
  readonly #dialogRef = inject(DialogRef);
  readonly #reportService = inject(ReportIssueService);
  readonly #anonymizer = inject(GameStateAnonymizerService);
  readonly #gameState = inject(GameStateService);
  readonly #toastService = inject(ToastService);
  readonly #transloco = inject(TranslocoService);
  readonly #reportIssueModel = signal<ReportIssueFormModel>({
    type: 'bug',
    title: '',
    description: '',
    contact: '',
    turnstileToken: '',
  });

  protected readonly isTest = injectIsTestEnv();
  protected readonly siteKey = injectTurnstileSiteKey();

  protected readonly form = form(
    this.#reportIssueModel,
    (schemaPath) => {
      required(schemaPath.type);
      required(schemaPath.title, {
        message: this.#transloco.translate('reportIssue.titleRequired'),
      });
      required(schemaPath.description, {
        message: this.#transloco.translate('reportIssue.descriptionRequired'),
      });
      required(schemaPath.turnstileToken);
      maxLength(schemaPath.title, TITLE_MAX, {
        message: this.#transloco.translate('reportIssue.titleMaxLength', { length: TITLE_MAX }),
      });
      minLength(schemaPath.description, DESC_MIN, {
        message: this.#transloco.translate('reportIssue.descriptionMinLength', {
          length: DESC_MIN,
        }),
      });
      maxLength(schemaPath.description, DESC_MAX, {
        message: this.#transloco.translate('reportIssue.descriptionMaxLength', {
          length: DESC_MAX,
        }),
      });
      maxLength(schemaPath.contact, CONTACT_MAX, {
        message: this.#transloco.translate('reportIssue.contactMaxLength', { length: CONTACT_MAX }),
      });
    },
    {
      submission: {
        ignoreValidators: 'none',
        action: async (field) => {
          const value = field().value();
          try {
            const result = await this.#submit(value);
            this.#toastService.show({
              type: 'success',
              url: result.url,
              issueNumber: result.issueNumber,
            });
            this.#dialogRef.close();
            return undefined;
          } catch (error: unknown) {
            if (isReportIssueError(error)) {
              this.#toastService.show({ type: 'error', code: error.code });
              return { kind: error.code, message: error.message };
            }

            this.#toastService.show({ type: 'error', code: 'network_error' });
            return {
              kind: 'network_error',
              message: this.#transloco.translate('reportIssue.errorNetwork'),
            };
          }
        },
      },
    }
  );

  protected readonly canSubmit = computed(() => this.form().valid() && !this.form().submitting());
  protected readonly cannotSubmit = computed(() => !this.canSubmit());

  protected onCancel(): void {
    this.#dialogRef.close();
  }

  async #submit(formValue: ReportIssueFormModel): Promise<ReportIssueResult> {
    const games = this.#gameState.games();
    const lang = this.#transloco.getActiveLang();
    const gameState = this.#anonymizer.anonymize(games, lang);
    return await firstValueFrom(
      this.#reportService.submit({
        ...formValue,
        contact: formValue.contact === '' ? undefined : formValue.contact,
        gameState,
      })
    );
  }
}
