import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultipleChoice } from './MultipleChoice';
import type { Exercise } from '../../types/exercise';

const singleAnswerExercise: Extract<Exercise, { responseMode: 'multipleChoice' }> = {
  id: 'ex-1', stage: 'guided', responseMode: 'multipleChoice', difficulty: 1,
  targetIds: ['og-sa-s-a'], prompt: 'Alege forma corectă.',
  response: { text: 'Echipa ___ pregătit.', options: ['sa', 's-a'], correctIndices: [1] },
};

const multiAnswerExercise: Extract<Exercise, { responseMode: 'multipleChoice' }> = {
  id: 'ex-2', stage: 'independent', responseMode: 'multipleChoice', difficulty: 2,
  targetIds: ['og-sa-s-a', 'og-sau-s-au'], prompt: 'Alege TOATE formele corecte.',
  response: {
    text: 'Care dintre variante sunt corecte gramatical?',
    options: ['sa', 's-a', 'sau', 'sa-u'],
    correctIndices: [0, 1, 2],
  },
};

describe('MultipleChoice — răspuns unic', () => {
  it('butonul e dezactivat pana la o selectie', () => {
    render(<MultipleChoice exercise={singleAnswerExercise} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /verifică/i })).toBeDisabled();
  });

  it('selectarea raspunsului corect apeleaza onSubmit(true)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MultipleChoice exercise={singleAnswerExercise} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('radio', { name: /s-a/i }));
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(onSubmit).toHaveBeenCalledWith(true);
  });

  it('selectarea raspunsului gresit apeleaza onSubmit(false)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MultipleChoice exercise={singleAnswerExercise} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('radio', { name: 'sa' }));
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(onSubmit).toHaveBeenCalledWith(false);
  });
});

describe('MultipleChoice — mai multe raspunsuri corecte (fix #4)', () => {
  it('foloseste checkbox-uri, nu radio, cand correctIndices are lungime > 1', () => {
    render(<MultipleChoice exercise={multiAnswerExercise} onSubmit={vi.fn()} />);
    const group = screen.getByRole('group', { name: /opțiuni/i });
    expect(within(group).getAllByRole('checkbox')).toHaveLength(4);
  });

  it('bifarea EXACT a setului corect apeleaza onSubmit(true)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MultipleChoice exercise={multiAnswerExercise} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('checkbox', { name: 'sa' }));
    await user.click(screen.getByRole('checkbox', { name: 's-a' }));
    await user.click(screen.getByRole('checkbox', { name: 'sau' }));
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(onSubmit).toHaveBeenCalledWith(true);
  });

  it('bifarea doar a UNUIA dintre raspunsurile corecte multiple apeleaza onSubmit(false) — bug-ul anterior', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MultipleChoice exercise={multiAnswerExercise} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('checkbox', { name: 'sa' }));
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(onSubmit).toHaveBeenCalledWith(false);
  });

  it('bifarea setului corect PLUS unul gresit apeleaza onSubmit(false)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MultipleChoice exercise={multiAnswerExercise} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('checkbox', { name: 'sa' }));
    await user.click(screen.getByRole('checkbox', { name: 's-a' }));
    await user.click(screen.getByRole('checkbox', { name: 'sau' }));
    await user.click(screen.getByRole('checkbox', { name: 'sa-u' }));
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(onSubmit).toHaveBeenCalledWith(false);
  });
});
