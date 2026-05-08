import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { LanguagePickerComponent } from './language-picker.component';

const EN = { languagePicker: { ariaLabel: 'Select language', en: 'English', fr: 'French' } };
const FR = { languagePicker: { ariaLabel: 'Sélectionner la langue', en: 'Anglais', fr: 'Français' } };

async function setup(storedLang?: string) {
  if (storedLang) {
    localStorage.setItem('triple-yahtzee-locale', storedLang);
  } else {
    localStorage.removeItem('triple-yahtzee-locale');
  }
  return render(LanguagePickerComponent, {
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: EN, fr: FR },
        translocoConfig: { availableLangs: ['en', 'fr'], defaultLang: 'en' },
        preloadLangs: true,
      }),
    ],
  });
}

describe('languagePickerComponent', () => {
  afterEach(() => {
    localStorage.removeItem('triple-yahtzee-locale');
  });

  test('renders language select', async () => {
    await setup();
    expect(screen.getByRole('combobox', { name: /select language/i })).toBeInTheDocument();
  });

  test('shows English and French options', async () => {
    await setup();
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue('en');
    expect(options[1]).toHaveValue('fr');
  });

  test('defaults to English when no locale in localStorage', async () => {
    await setup();
    expect(screen.getByRole('combobox')).toHaveValue('en');
  });

  test('initializes from localStorage', async () => {
    await setup('fr');
    expect(screen.getByRole('combobox')).toHaveValue('fr');
  });

  test('persists selected locale to localStorage', async () => {
    await setup();

    await userEvent.selectOptions(screen.getByRole('combobox'), 'fr');

    expect(localStorage.getItem('triple-yahtzee-locale')).toBe('fr');
  });

  test('updates html lang attribute on change', async () => {
    await setup();

    await userEvent.selectOptions(screen.getByRole('combobox'), 'fr');

    expect(document.documentElement.lang).toBe('fr');
  });

  test('calls TranslocoService.setActiveLang on change', async () => {
    await setup();
    const { TranslocoService } = await import('@jsverse/transloco');
    const transloco = TestBed.inject(TranslocoService);
    const spy = vi.spyOn(transloco, 'setActiveLang');

    await userEvent.selectOptions(screen.getByRole('combobox'), 'fr');

    expect(spy).toHaveBeenCalledWith('fr');
  });
});
