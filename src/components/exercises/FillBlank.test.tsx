import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FillBlank } from './FillBlank';
import type { Exercise } from '../../types/exercise';
import styles from './FillBlank.module.css';

const exercise: Extract<Exercise, { responseMode: 'fillBlank' }> = {
  id: 'ex-fb-1', stage: 'guided', responseMode: 'fillBlank', difficulty: 1,
  targetIds: ['og-ia-i-a'], prompt: 'Completează spațiul liber.',
  response: { text: 'Alina ___ controllerul.', correctAnswers: ['ia'] },
};

describe('FillBlank', () => {
  it('butonul e dezactivat cat timp campul e gol', () => {
    render(<FillBlank exercise={exercise} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /verifică/i })).toBeDisabled();
  });

  it('un raspuns corect (case-insensitiv, cu spatii) apeleaza onSubmit(true)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FillBlank exercise={exercise} onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox'), '  IA  ');
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(onSubmit).toHaveBeenCalledWith(true);
  });

  it('un raspuns gresit apeleaza onSubmit(false)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FillBlank exercise={exercise} onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox'), 'i-a');
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(onSubmit).toHaveBeenCalledWith(false);
  });

  it('foloseste clasa temei vizuale pe campul de raspuns', () => {
    render(<FillBlank exercise={exercise} onSubmit={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveClass(styles.input);
  });
});
