import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { ToastService } from '../../services/toast.service';
import { ToastComponent } from './toast.component';

const TRANSLATIONS = {
  en: {
    reportIssue: {
      successToast: 'Issue filed! <a href="{{ url }}">View #{{ issueNumber }}</a>',
      errorRateLimited: 'Too many reports. Please wait before trying again.',
      errorTurnstileFailed: 'Security check failed. Please try again.',
      errorNetwork: 'Something went wrong. Please try again later.',
    },
  },
};

async function setup() {
  return render(ToastComponent, {
    providers: [ToastService],
    imports: [
      TranslocoTestingModule.forRoot({
        langs: TRANSLATIONS,
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        preloadLangs: true,
      }),
    ],
  });
}

describe('toastComponent', () => {
  test('shows nothing when no toast is active', async () => {
    await setup();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('shows success toast with a link when show() is called with success', async () => {
    await setup();
    const toastService = TestBed.inject(ToastService);
    toastService.show({
      type: 'success',
      url: 'https://github.com/FabienDehopre/triple-yahtzee-score-board/issues/42',
      issueNumber: 42,
    });
    const status = await screen.findByRole('status');
    expect(status).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/FabienDehopre/triple-yahtzee-score-board/issues/42'
    );
  });

  test('shows rate_limited error toast', async () => {
    await setup();
    const toastService = TestBed.inject(ToastService);
    toastService.show({ type: 'error', code: 'rate_limited' });
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/too many reports/i);
  });

  test('shows turnstile_failed error toast', async () => {
    await setup();
    const toastService = TestBed.inject(ToastService);
    toastService.show({ type: 'error', code: 'turnstile_failed' });
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/security check failed/i);
  });

  test('shows generic network error toast', async () => {
    await setup();
    const toastService = TestBed.inject(ToastService);
    toastService.show({ type: 'error', code: 'network_error' });
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/something went wrong/i);
  });
});
