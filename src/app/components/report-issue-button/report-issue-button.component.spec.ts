import { Dialog } from '@angular/cdk/dialog';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ReportIssueButtonComponent } from './report-issue-button.component';

const EN = { reportIssue: { fabAriaLabel: 'Report an issue' } };

const MOCK_DIALOG = { open: vi.fn() };

async function renderComponent() {
  return render(ReportIssueButtonComponent, {
    providers: [{ provide: Dialog, useValue: MOCK_DIALOG }],
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: EN },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        preloadLangs: true,
      }),
    ],
  });
}

describe('reportIssueButtonComponent', () => {
  beforeEach(() => {
    MOCK_DIALOG.open.mockReset();
  });

  test('renders a button with accessible label', async () => {
    await renderComponent();
    const btn = screen.getByRole('button', { name: /report an issue/i });
    expect(btn).toBeInTheDocument();
  });

  test('button is keyboard-focusable', async () => {
    const events = userEvent.setup();
    await renderComponent();
    const btn = screen.getByRole('button', { name: /report an issue/i });
    await events.tab();
    expect(btn).toHaveFocus();
  });

  test('clicking the button opens the report dialog', async () => {
    const events = userEvent.setup();
    await renderComponent();
    await events.click(screen.getByRole('button', { name: /report an issue/i }));
    expect(MOCK_DIALOG.open).toHaveBeenCalledTimes(1);
  });

  test('pressing Enter on the button opens the dialog', async () => {
    const events = userEvent.setup();
    await renderComponent();
    const btn = screen.getByRole('button', { name: /report an issue/i });
    btn.focus();
    await events.keyboard('{Enter}');
    expect(MOCK_DIALOG.open).toHaveBeenCalledTimes(1);
  });
});
