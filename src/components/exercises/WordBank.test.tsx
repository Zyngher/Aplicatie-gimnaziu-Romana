import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WordBank } from './WordBank';
import type { Exercise } from '../../types/exercise';

const exercise: Extract<Exercise, { responseMode: 'wordBank' }> = {
  id: 'ex-wb-1', stage: 'guided', responseMode: 'wordBank', difficulty: 2,
  targetIds: ['og-iau-i-au', 'og-sa-s-a'], prompt: 'Alege din bancă forma potrivită.',
  response: {
    text: 'Prietenii {{b1}} bagajele. Camera {{b2}} foto e în geantă.',
    bank: [
      { id: 'wb-iau', word: 'iau' }, { id: 'wb-i-au', word: 'i-au' },
      { id: 'wb-sa', word: 'sa' }, { id: 'wb-s-a', word: 's-a' },
    ],
    blanks: [{ marker: 'b1', correctWordId: 'wb-iau' }, { marker: 'b2', correctWordId: 'wb-sa' }],
  },
};

describe('WordBank', () => {
  it('butonul e dezactivat pana toate spatiile sunt completate', () => {
    render(<WordBank exercise={exercise} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /verifică/i })).toBeDisabled();
  });

  it('selectarea corecta pentru toate spatiile apeleaza onSubmit(true)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<WordBank exercise={exercise} onSubmit={onSubmit} />);
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'wb-iau');
    await user.selectOptions(selects[1], 'wb-sa');
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(onSubmit).toHaveBeenCalledWith(true);
  });

  it('o selectie gresita apeleaza onSubmit(false)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<WordBank exercise={exercise} onSubmit={onSubmit} />);
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'wb-i-au');
    await user.selectOptions(selects[1], 'wb-sa');
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(onSubmit).toHaveBeenCalledWith(false);
  });
});
