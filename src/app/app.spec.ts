import type { DiceSet } from './models/dice-set.model';

import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { render, screen } from '@testing-library/angular';

import { App } from './app';
import { SessionStore } from './services/session.store';
import { getTranslocoTestingModule } from './testing/transloco-testing';

@Component({
  selector: 'app-dice-input',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StubDiceInputComponent {
  readonly confirmed = output<DiceSet>();
}

function makeStub(selector: string): typeof StubDiceInputComponent {
  @Component({ selector, template: '', changeDetection: ChangeDetectionStrategy.OnPush })
  class StubComponent {}
  return StubComponent as unknown as typeof StubDiceInputComponent;
}

const STUB_CHILDREN = [
  StubDiceInputComponent,
  makeStub('app-language-picker'),
  makeStub('app-clear-session-button'),
  makeStub('app-game-count-picker'),
  makeStub('app-suggestion-bar'),
  makeStub('app-score-sheet'),
  makeStub('app-undo-banner'),
  makeStub('app-footer'),
  makeStub('app-report-issue-button'),
  makeStub('app-toast'),
  makeStub('app-game-over'),
];

const MOCK_SET_CURRENT_DICE = vi.fn();
const MOCK_IS_GAME_OVER = signal(false);

async function renderApp() {
  return render(App, {
    componentImports: [TranslocoPipe, ...STUB_CHILDREN],
    imports: [getTranslocoTestingModule()],
    providers: [
      { provide: SessionStore, useValue: { setCurrentDice: MOCK_SET_CURRENT_DICE, isGameOver: MOCK_IS_GAME_OVER } },
    ],
  });
}

describe('app', () => {
  beforeEach(() => {
    MOCK_SET_CURRENT_DICE.mockReset();
    MOCK_IS_GAME_OVER.set(false);
  });

  test('delegates confirmed dice to SessionStore', async () => {
    const { fixture } = await renderApp();
    const dice: DiceSet = [2, 0, 1, 0, 2, 0];

    fixture.debugElement
      .query(By.directive(StubDiceInputComponent))
      .componentInstance.confirmed.emit(dice);

    expect(MOCK_SET_CURRENT_DICE).toHaveBeenCalledExactlyOnceWith(dice);
  });

  test('renders the game-over overlay when the game is over', async () => {
    const { fixture } = await renderApp();
    MOCK_IS_GAME_OVER.set(true);
    fixture.detectChanges();

    expect(screen.getByTestId('game-over-overlay')).toBeInTheDocument();
  });

  test('hides the game-over overlay while the game is ongoing', async () => {
    await renderApp();

    expect(screen.queryByTestId('game-over-overlay')).not.toBeInTheDocument();
  });
});
