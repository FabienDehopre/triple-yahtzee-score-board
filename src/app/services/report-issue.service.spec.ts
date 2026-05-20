import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { ENVIRONMENT } from '../../environments/environment';
import { ReportIssueService } from './report-issue.service';

const MOCK_PAYLOAD = {
  type: 'bug' as const,
  title: 'Something broke',
  description: 'Steps to reproduce this issue: 1) open app 2) crash',
  contact: undefined,
  gameState: { anonymizedGames: [], diagnostics: { appVersion: '0.0.0', locale: 'en', userAgent: 'test' } },
  turnstileToken: 'test-token',
};

describe('reportIssueService', () => {
  let service: ReportIssueService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReportIssueService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  test('pOSTs to the configured report endpoint', () => {
    service.submit(MOCK_PAYLOAD).subscribe();
    const req = http.expectOne(ENVIRONMENT.reportIssueEndpoint);
    expect(req.request.method).toBe('POST');
    req.flush({ url: 'https://github.com/…/issues/1', issueNumber: 1 });
  });

  test('sends the payload as JSON with Content-Type header', () => {
    service.submit(MOCK_PAYLOAD).subscribe();
    const req = http.expectOne(ENVIRONMENT.reportIssueEndpoint);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.body).toMatchObject({ type: 'bug', title: 'Something broke' });
    req.flush({ url: 'https://github.com/…/issues/1', issueNumber: 1 });
  });

  test('returns the issue url and number on success', async () => {
    const promise = firstValueFrom(service.submit(MOCK_PAYLOAD));
    http.expectOne(ENVIRONMENT.reportIssueEndpoint).flush({
      url: 'https://github.com/FabienDehopre/triple-yahtzee-score-board/issues/42',
      issueNumber: 42,
    });
    const result = await promise;
    expect(result.url).toBe('https://github.com/FabienDehopre/triple-yahtzee-score-board/issues/42');
    expect(result.issueNumber).toBe(42);
  });

  test('maps HTTP 429 to rate_limited error', async () => {
    const promise = firstValueFrom(service.submit(MOCK_PAYLOAD));
    http.expectOne(ENVIRONMENT.reportIssueEndpoint).flush(
      { error: 'rate_limited', message: 'Too many requests' },
      { status: 429, statusText: 'Too Many Requests' }
    );
    await expect(promise).rejects.toMatchObject({ code: 'rate_limited' });
  });

  test('maps HTTP 401 to turnstile_failed error', async () => {
    const promise = firstValueFrom(service.submit(MOCK_PAYLOAD));
    http.expectOne(ENVIRONMENT.reportIssueEndpoint).flush(
      { error: 'turnstile_failed', message: 'Token invalid' },
      { status: 401, statusText: 'Unauthorized' }
    );
    await expect(promise).rejects.toMatchObject({ code: 'turnstile_failed' });
  });

  test('maps unknown HTTP errors to network_error', async () => {
    const promise = firstValueFrom(service.submit(MOCK_PAYLOAD));
    http.expectOne(ENVIRONMENT.reportIssueEndpoint).flush(
      { error: 'github_error', message: 'Failed' },
      { status: 500, statusText: 'Internal Server Error' }
    );
    await expect(promise).rejects.toMatchObject({ code: 'network_error' });
  });
});
