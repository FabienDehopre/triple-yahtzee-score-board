import type { ReportIssueError } from './report-issue.service';

import { Injectable, signal } from '@angular/core';

export interface SuccessToast {
  type: 'success';
  url: string;
  issueNumber: number;
}

export interface ErrorToast {
  type: 'error';
  code: ReportIssueError['code'];
}

export type ToastData = ErrorToast | SuccessToast;

/** Signal-based service that holds a single short-lived toast notification. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly #current = signal<ToastData | undefined>(undefined);
  readonly #timeoutId = signal<ReturnType<typeof setTimeout> | undefined>(undefined);

  /** The currently active toast, or null when none is shown. */
  readonly current = this.#current.asReadonly();

  show(data: ToastData, durationMs = 7000): void {
    const existing = this.#timeoutId();
    if (existing !== undefined) clearTimeout(existing);
    this.#current.set(data);
    this.#timeoutId.set(setTimeout(() => this.dismiss(), durationMs));
  }

  dismiss(): void {
    const existing = this.#timeoutId();
    if (existing !== undefined) clearTimeout(existing);
    this.#current.set(undefined);
    this.#timeoutId.set(undefined);
  }
}
