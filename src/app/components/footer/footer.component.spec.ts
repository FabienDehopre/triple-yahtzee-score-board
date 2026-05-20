import { TranslocoTestingModule } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { FooterComponent } from './footer.component';

const GITHUB_URL = 'https://github.com/FabienDehopre/triple-yahtzee-score-board';

const EN = {
  footer: {
    copyright: '© {{ year }} Fabien Dehopré',
    githubLinkLabel: 'View source on GitHub',
  },
};

function setup() {
  return render(FooterComponent, {
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: EN },
        translocoConfig: { availableLangs: ['en', 'fr'], defaultLang: 'en' },
        preloadLangs: true,
      }),
    ],
  });
}

describe('footerComponent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders a footer element', async () => {
    await setup();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  test('copyright shows the current year', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2030, 5, 15));

    await setup();

    expect(screen.getByRole('contentinfo')).toHaveTextContent('2030');
  });

  test('github link has correct href', async () => {
    await setup();
    expect(screen.getByRole('link', { name: /view source on github/i })).toHaveAttribute('href', GITHUB_URL);
  });

  test('github link opens in a new tab', async () => {
    await setup();
    expect(screen.getByRole('link', { name: /view source on github/i })).toHaveAttribute('target', '_blank');
  });

  test('github link has rel noopener noreferrer', async () => {
    await setup();
    expect(screen.getByRole('link', { name: /view source on github/i })).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('github link is keyboard-focusable', async () => {
    await setup();
    const link = screen.getByRole('link', { name: /view source on github/i });
    expect(link).not.toHaveAttribute('tabindex', '-1');
  });
});
