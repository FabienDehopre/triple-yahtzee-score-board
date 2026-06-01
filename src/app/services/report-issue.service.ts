import type { HttpErrorResponse } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { AnonymizedGameState } from './game-state-anonymizer.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { injectReportIssueEndpoint } from './injection-tokens';

export type IssueType = 'bug' | 'enhancement';

export interface ReportIssuePayload {
  type: IssueType;
  title: string;
  description: string;
  contact?: string;
  gameState: AnonymizedGameState;
  turnstileToken: string;
}

export interface ReportIssueResult {
  url: string;
  issueNumber: number;
}

export interface ReportIssueError {
  code: 'network_error' | 'rate_limited' | 'turnstile_failed' | 'validation';
  message: string;
}

const STATUS_TO_CODE: Partial<Record<number, ReportIssueError['code']>> = {
  401: 'turnstile_failed',
  400: 'validation',
  429: 'rate_limited',
};

export function isReportIssueError(error: unknown): error is ReportIssueError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

/**
 * Submits a bug/enhancement report to the Cloudflare Worker proxy,
 * which creates a GitHub issue on behalf of the user.
 */
@Injectable({ providedIn: 'root' })
export class ReportIssueService {
  readonly #http = inject(HttpClient);
  readonly #endpoint = injectReportIssueEndpoint();

  submit(payload: ReportIssuePayload): Observable<ReportIssueResult> {
    return this.#http
      .post<ReportIssueResult>(this.#endpoint, payload, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const code = STATUS_TO_CODE[err.status] ?? 'network_error';
          return throwError(() => ({ code, message: err.message }) satisfies ReportIssueError);
        })
      );
  }
}
