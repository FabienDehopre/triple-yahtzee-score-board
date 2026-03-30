import type { DiceSet } from '../../models';

import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { DiceInputComponent } from './dice-input.component';

describe('diceInputComponent', () => {
  // ─── Render ──────────────────────────────────────────────────────────────────

  test('should render 6 dice face increment buttons', async () => {
    await render(DiceInputComponent);

    for (let face = 1; face <= 6; face++) {
      expect(screen.getByRole('button', { name: `Increment face ${face}` })).toBeInTheDocument();
    }
  });

  // ─── Increment ───────────────────────────────────────────────────────────────

  test('should display count 1 after tapping a die face button once', async () => {
    const user = userEvent.setup();
    await render(DiceInputComponent);

    await user.click(screen.getByRole('button', { name: 'Increment face 3' }));

    expect(screen.getByTestId('count-face-3')).toHaveTextContent('1');
  });

  test('should not increment beyond a total of 5 dice', async () => {
    const user = userEvent.setup();
    await render(DiceInputComponent);

    const face1Btn = screen.getByRole('button', { name: 'Increment face 1' });
    await user.click(face1Btn);
    await user.click(face1Btn);
    await user.click(face1Btn);
    await user.click(face1Btn);
    await user.click(face1Btn);
    // 6th click – total already 5, should be no-op
    await user.click(face1Btn);

    expect(screen.getByTestId('count-face-1')).toHaveTextContent('5');
  });

  // ─── Decrement ───────────────────────────────────────────────────────────────

  test('should decrement a face count when the decrement button is clicked', async () => {
    const user = userEvent.setup();
    await render(DiceInputComponent);

    await user.click(screen.getByRole('button', { name: 'Increment face 2' }));
    await user.click(screen.getByRole('button', { name: 'Increment face 2' }));
    await user.click(screen.getByRole('button', { name: 'Decrement face 2' }));

    expect(screen.getByTestId('count-face-2')).toHaveTextContent('1');
  });

  test('should not decrement a face count below 0', async () => {
    const user = userEvent.setup();
    await render(DiceInputComponent);

    await user.click(screen.getByRole('button', { name: 'Decrement face 4' }));

    expect(screen.getByTestId('count-face-4')).toHaveTextContent('0');
  });

  // ─── Confirm button ──────────────────────────────────────────────────────────

  test('should disable the confirm button when total is less than 5', async () => {
    await render(DiceInputComponent);

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
  });

  test('should enable the confirm button when total equals exactly 5', async () => {
    const user = userEvent.setup();
    await render(DiceInputComponent);

    const face1Btn = screen.getByRole('button', { name: 'Increment face 1' });
    await user.click(face1Btn);
    await user.click(face1Btn);
    await user.click(face1Btn);
    await user.click(face1Btn);
    await user.click(face1Btn);

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
  });

  // ─── DiceSet output ──────────────────────────────────────────────────────────

  test('should emit DiceSet with correct counts when confirmed', async () => {
    const user = userEvent.setup();
    let emitted: DiceSet | undefined;
    await render(DiceInputComponent, {
      on: { confirmed: (v: DiceSet) => (emitted = v) },
    });

    // Roll: two 1s, one 2, two 5s  → [2,1,0,0,2,0]
    const face1Btn = screen.getByRole('button', { name: 'Increment face 1' });
    const face2Btn = screen.getByRole('button', { name: 'Increment face 2' });
    const face5Btn = screen.getByRole('button', { name: 'Increment face 5' });
    await user.click(face1Btn);
    await user.click(face1Btn);
    await user.click(face2Btn);
    await user.click(face5Btn);
    await user.click(face5Btn);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(emitted).toEqual([2, 1, 0, 0, 2, 0]);
  });

  // ─── Reset ───────────────────────────────────────────────────────────────────

  test('should reset all counts to 0 when the reset button is clicked', async () => {
    const user = userEvent.setup();
    await render(DiceInputComponent);

    await user.click(screen.getByRole('button', { name: 'Increment face 1' }));
    await user.click(screen.getByRole('button', { name: 'Increment face 3' }));
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    for (let face = 1; face <= 6; face++) {
      expect(screen.getByTestId(`count-face-${face}`)).toHaveTextContent('0');
    }
  });

  // ─── Remaining display ───────────────────────────────────────────────────────

  test('should show remaining dice count starting at 5', async () => {
    await render(DiceInputComponent);

    expect(screen.getByTestId('remaining')).toHaveTextContent(/5/);
  });

  test('should decrease remaining count as dice are added', async () => {
    const user = userEvent.setup();
    await render(DiceInputComponent);

    await user.click(screen.getByRole('button', { name: 'Increment face 6' }));
    await user.click(screen.getByRole('button', { name: 'Increment face 6' }));

    expect(screen.getByTestId('remaining')).toHaveTextContent(/3/);
  });
});
