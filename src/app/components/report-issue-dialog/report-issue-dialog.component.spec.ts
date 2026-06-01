import { DialogRef } from '@angular/cdk/dialog';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import {
  IS_TEST_ENV,
  REPORT_ISSUE_ENDPOINT,
  TURNSTILE_SITE_KEY
} from '../../services/injection-tokens';
import { ToastComponent } from '../toast/toast.component';
import { ReportIssueDialogComponent } from './report-issue-dialog.component';

const EN = {
  reportIssue: {
    dialogTitle: 'Report an Issue',
    typeLabel: 'Type',
    typeBug: 'Bug',
    typeEnhancement: 'Enhancement',
    titleLabel: 'Title',
    titlePlaceholder: 'Brief summary of the issue',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Please describe the issue in detail…',
    contactLabel: 'Contact (optional)',
    contactPlaceholder: 'Email or handle so we can follow up',
    submit: 'Submit',
    cancel: 'Cancel',
    titleRequired: 'Title is required.',
    titleMaxLength: 'Title must be {{ length }} characters or fewer.',
    descriptionRequired: 'Description is required.',
    descriptionMinLength: 'Description must be at least {{ length }} characters.',
    descriptionMaxLength: 'Description must be {{ length }} characters or fewer.',
    contactMaxLength: 'Contact must be {{ length }} characters or fewer.',
    turnstileHint: 'Please complete the security check to submit.',
    successToast: 'Issue filed! <a href="{{ url }}">View #{{ issueNumber }}</a>',
    errorRateLimited: 'Too many reports. Please wait before trying again.',
    errorTurnstileFailed: 'Security check failed. Please try again.',
    errorNetwork: 'Something went wrong. Please try again later.',
  },
};

const MOCK_DIALOG_REF = {
  close: vi.fn(),
};
const REPORT_ISSUE_ENDPOINT_URL = 'http://localhost:8787/report';

async function renderComponent() {
  // Render the dialog alongside the toast so toast assertions work in isolation.
  // In the real app the toast lives at app root; here we co-render it.
  return render(`<app-report-issue-dialog /><app-toast />`, {
    imports: [
      ReportIssueDialogComponent,
      ToastComponent,
      TranslocoTestingModule.forRoot({
        langs: { en: EN },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        preloadLangs: true,
      }),
    ],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: DialogRef, useValue: MOCK_DIALOG_REF },
      { provide: IS_TEST_ENV, useValue: true },
      { provide: TURNSTILE_SITE_KEY, useValue: '1x00000000000000000000AA' },
      { provide: REPORT_ISSUE_ENDPOINT, useValue: REPORT_ISSUE_ENDPOINT_URL },
    ],
  });
}

describe('reportIssueDialogComponent', () => {
  let http: HttpTestingController | undefined;

  beforeEach(() => {
    MOCK_DIALOG_REF.close.mockReset();
  });

  afterEach(() => {
    http?.verify();
  });

  test('renders dialog title', async () => {
    await renderComponent();
    expect(screen.getByRole('heading', { name: /report an issue/i })).toBeInTheDocument();
  });

  test('renders type, title, description, and contact fields', async () => {
    await renderComponent();
    expect(screen.getByRole('combobox', { name: /type/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /contact/i })).toBeInTheDocument();
  });

  test('submit button is disabled when form is empty', async () => {
    await renderComponent();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  test('submit button is disabled when required fields are valid but turnstile token is absent', async () => {
    const events = userEvent.setup();
    await renderComponent();
    await events.type(screen.getByRole('textbox', { name: /title/i }), 'My issue title');
    await events.type(
      screen.getByRole('textbox', { name: /description/i }),
      'A long enough description for this'
    );
    // No Turnstile token → submit still disabled
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  test('shows title validation error when title is empty and field is touched', async () => {
    const events = userEvent.setup();
    await renderComponent();
    const titleInput = screen.getByRole('textbox', { name: /title/i });
    await events.click(titleInput);
    await events.tab();
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
  });

  test('shows description validation error when too short and field is touched', async () => {
    const events = userEvent.setup();
    await renderComponent();
    const desc = screen.getByRole('textbox', { name: /description/i });
    await events.type(desc, 'short');
    await events.tab();
    expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument();
  });

  test('cancel button closes the dialog', async () => {
    const events = userEvent.setup();
    await renderComponent();
    await events.click(screen.getByRole('button', { name: /cancel/i }));
    expect(MOCK_DIALOG_REF.close).toHaveBeenCalledTimes(1);
  });

  test('successful submission shows success toast and closes dialog', async () => {
    const events = userEvent.setup();
    await renderComponent();
    http = TestBed.inject(HttpTestingController);

    await events.selectOptions(screen.getByRole('combobox', { name: /type/i }), 'bug');
    await events.type(screen.getByRole('textbox', { name: /title/i }), 'My bug report title');
    await events.type(
      screen.getByRole('textbox', { name: /description/i }),
      'Detailed description that is long enough'
    );

    // Simulate Turnstile token arriving
    await events.type(screen.getByTestId('turnstile-token-input'), 'mock-turnstile-token');

    const submitBtn = screen.getByRole('button', { name: /submit/i });
    expect(submitBtn).toBeEnabled();
    await events.click(submitBtn);

    http.expectOne(REPORT_ISSUE_ENDPOINT_URL).flush({
      url: 'https://github.com/FabienDehopre/triple-yahtzee-score-board/issues/99',
      issueNumber: 99,
    });

    expect(await screen.findByRole('status')).toHaveTextContent(/issue filed/i);
    expect(MOCK_DIALOG_REF.close).toHaveBeenCalledTimes(1);
  });

  test('error response shows error toast and does not close dialog', async () => {
    const events = userEvent.setup();
    await renderComponent();
    http = TestBed.inject(HttpTestingController);

    await events.selectOptions(screen.getByRole('combobox', { name: /type/i }), 'bug');
    await events.type(screen.getByRole('textbox', { name: /title/i }), 'My bug report title');
    await events.type(
      screen.getByRole('textbox', { name: /description/i }),
      'Detailed description that is long enough'
    );
    const tokenInput = screen.getByTestId('turnstile-token-input');
    await events.type(tokenInput, 'mock-token');
    await events.click(screen.getByRole('button', { name: /submit/i }));

    http
      .expectOne(REPORT_ISSUE_ENDPOINT_URL)
      .flush(
        { error: 'rate_limited', message: 'rate limited' },
        { status: 429, statusText: 'Too Many Requests' }
      );

    expect(await screen.findByRole('status')).toHaveTextContent(/too many reports/i);
    expect(MOCK_DIALOG_REF.close).not.toHaveBeenCalled();
  });
});
