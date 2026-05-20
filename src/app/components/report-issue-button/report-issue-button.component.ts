import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ReportIssueDialogComponent } from '../report-issue-dialog/report-issue-dialog.component';
import { ToastComponent } from '../toast/toast.component';

/**
 * Floating action button anchored to the bottom-right of the viewport.
 * Opens the ReportIssueDialogComponent via CDK Dialog on activation.
 * z-index 40 — above all content but below the game-over overlay (z-50).
 */
@Component({
  selector: 'app-report-issue-button',
  imports: [TranslocoPipe, ToastComponent],
  templateUrl: './report-issue-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportIssueButtonComponent {
  readonly #dialog = inject(Dialog);

  protected openDialog(): void {
    this.#dialog.open(ReportIssueDialogComponent, {
      hasBackdrop: true,
      backdropClass: 'bg-black/50',
      panelClass: ['w-full', 'max-w-lg', 'mx-auto', 'px-4'],
      restoreFocus: true,
    });
  }
}
