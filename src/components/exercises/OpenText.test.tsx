import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpenText } from './OpenText';
import type { Exercise } from '../../types/exercise';

const exercise: Extract<Exercise, { responseMode: 'openText' }> = {
  id: 'ex-ot-1', stage: 'transfer', responseMode: 'openText', difficulty: 2,
  targetIds: ['og-sa-s-a'], prompt: 'Scrie două propoziții proprii.',
  response: {
    instructions: 'Folosește fiecare formă cel puțin o dată.',
    modelAnswer: 'Familia sa a plecat în excursie. Trenul s-a oprit la munte.',
    selfCheckCriteria: ['Am folosit „sa" corect?', 'Am folosit „s-a" corect?'],
  },
};

describe('OpenText', () => {
  it('butonul de reveal e dezactivat pana se scrie un raspuns', () => {
    render(<OpenText exercise={exercise} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /arată răspunsul model/i })).toBeDisabled();
  });

  it('dupa reveal, arata raspunsul model si criteriile, apoi Am reusit apeleaza onSubmit(true)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<OpenText exercise={exercise} onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox'), 'Raspunsul meu propriu.');
    await user.click(screen.getByRole('button', { name: /arată răspunsul model/i }));
    expect(screen.getByText(/familia sa a plecat/i)).toBeInTheDocument();
    expect(screen.getByText(/am folosit „sa" corect\?/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /am reușit/i }));
    expect(onSubmit).toHaveBeenCalledWith(true);
  });

  it('Mai exersez apeleaza onSubmit(false)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<OpenText exercise={exercise} onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox'), 'Raspunsul meu.');
    await user.click(screen.getByRole('button', { name: /arată răspunsul model/i }));
    await user.click(screen.getByRole('button', { name: /mai exersez/i }));
    expect(onSubmit).toHaveBeenCalledWith(false);
  });
});
