import type { AbstractControl } from '@angular/forms';

import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ENVIRONMENT } from '../../../environments/environment';
import { GameStateAnonymizerService } from '../../services/game-state-anonymizer.service';
import { GameStateService } from '../../services/game-state.service';
import { ReportIssueService } from '../../services/report-issue.service';
import { ToastService } from '../../services/toast.service';
import { TurnstileComponent } from '../turnstile/turnstile.component';

const TITLE_MAX = 100;
const DESC_MIN = 10;
const DESC_MAX = 2000;
const CONTACT_MAX = 200;

/**
 * Modal dialog that allows users to file a bug or enhancement report.
 * Integrates Cloudflare Turnstile for spam protection and attaches an
 * anonymized game state snapshot to every submission.
 */
@Component({
  selector: 'app-report-issue-dialog',
  imports: [ReactiveFormsModule, TranslocoPipe, TurnstileComponent],
  templateUrl: './report-issue-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIssueDialogComponent {
  readonly #fb = inject(FormBuilder);
  readonly #dialogRef = inject(DialogRef);
  readonly #reportService = inject(ReportIssueService);
  readonly #anonymizer = inject(GameStateAnonymizerService);
  readonly #gameState = inject(GameStateService);
  readonly #toastService = inject(ToastService);
  readonly #transloco = inject(TranslocoService);

  protected readonly isSubmitting = signal(false);
  protected readonly turnstileToken = signal('');
  protected readonly siteKey = ENVIRONMENT.turnstileSiteKey;

  protected readonly form = this.#fb.group({
    type: ['bug', Validators.required],
    title: ['', [Validators.required, Validators.maxLength(TITLE_MAX)]],
    description: ['', [Validators.required, Validators.minLength(DESC_MIN), Validators.maxLength(DESC_MAX)]],
    contact: ['', Validators.maxLength(CONTACT_MAX)],
  });

  protected get canSubmit(): boolean {
    return this.form.valid && this.turnstileToken() !== '' && !this.isSubmitting();
  }

  get titleErrors(): AbstractControl | null {
    return this.form.get('title');
  }

  get descriptionErrors(): AbstractControl | null {
    return this.form.get('description');
  }

  get contactErrors(): AbstractControl | null {
    return this.form.get('contact');
  }

  protected onTurnstileToken(token: string): void {
    this.turnstileToken.set(token);
  }

  protected onTurnstileTokenInput(event: Event): void {
    this.turnstileToken.set((event.target as HTMLInputElement).value);
  }

  protected onCancel(): void {
    this.#dialogRef.close();
  }

  protected onSubmit(): void {
    if (!this.canSubmit) return;
    this.isSubmitting.set(true);

    const games = this.#gameState.games();
    const lang = this.#transloco.getActiveLang();
    const gameState = this.#anonymizer.anonymize(games, lang);
    const raw = this.form.getRawValue();

    this.#reportService
      .submit({
        type: raw.type as 'bug' | 'enhancement',
        title: raw.title ?? '',
        description: raw.description ?? '',
        contact: raw.contact ?? undefined,
        gameState,
        turnstileToken: this.turnstileToken(),
      })
      .subscribe({
        next: (result) => {
          this.isSubmitting.set(false);
          this.#toastService.show({ type: 'success', url: result.url, issueNumber: result.issueNumber });
          this.#dialogRef.close();
        },
        error: (err: { code: 'network_error' | 'rate_limited' | 'turnstile_failed' | 'validation' }) => {
          this.isSubmitting.set(false);
          this.#toastService.show({ type: 'error', code: err.code });
        },
      });
  }
}
