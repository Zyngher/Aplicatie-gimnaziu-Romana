import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorCorrection } from './ErrorCorrection';
import type { Exercise } from '../../types/exercise';

const exercise: Extract<Exercise, { responseMode: 'errorCorrection' }> = {
  id: 'ex-ec-1', stage: 'independent', responseMode: 'errorCorrection', difficulty: 2,
  targetIds: ['og-sa-s-a'], prompt: 'Găsește și corectează greșeala.',
  response: {
    tokens: ['Vlogger-ul', 's-a', 'pregătit', 'canalul', 'nou.'],
    errorTokenIndex: 1, correctToken: 'sa',
    explanation: 'Aici e vorba de „canalul lui", deci adjectiv posesiv → „sa", nu verbul „s-a".',
  },
};

describe('ErrorCorrection', () => {
  it('butonul e dezactivat pana se selecteaza un token si se scrie o corectie', () => {
    render(<ErrorCorrection exercise={exercise} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /verifică/i })).toBeDisabled();
  });

  it('selectarea tokenului gresit + corectia corecta apeleaza onSubmit(true)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ErrorCorrection exercise={exercise} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 's-a' }));
    await user.type(screen.getByRole('textbox'), 'sa');
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(onSubmit).toHaveBeenCalledWith(true);
  });

  it('fix #6: explicatia devine vizibila dupa trimitere, indiferent de rezultat', async () => {
    const user = userEvent.setup();
    render(<ErrorCorrection exercise={exercise} onSubmit={vi.fn()} />);
    expect(screen.queryByText(/adjectiv posesiv/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'canalul' }));
    await user.type(screen.getByRole('textbox'), 'orice');
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(screen.getByText(/adjectiv posesiv/i)).toBeInTheDocument();
  });
});
