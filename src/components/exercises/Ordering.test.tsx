import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Ordering } from './Ordering';
import type { Exercise } from '../../types/exercise';

const exercise: Extract<Exercise, { responseMode: 'ordering' }> = {
  id: 'ex-ord-1', stage: 'guided', responseMode: 'ordering', difficulty: 1,
  targetIds: ['og-sa-s-a'], prompt: 'Reordonează cuvintele ca să obții o propoziție corectă.',
  response: { items: ['s-a', 'Filmul', 'terminat', 'deja'], correctOrder: [1, 0, 2, 3] },
};

describe('Ordering', () => {
  it('afiseaza toate elementele in ordinea initiala', () => {
    render(<Ordering exercise={exercise} onSubmit={vi.fn()} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('s-a');
    expect(items[1]).toHaveTextContent('Filmul');
  });

  it('mutarea unui element in sus pana la ordinea corecta apeleaza onSubmit(true)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Ordering exercise={exercise} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: /mută în sus: filmul/i }));
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(onSubmit).toHaveBeenCalledWith(true);
  });

  it('fara nicio mutare, ordinea gresita apeleaza onSubmit(false)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Ordering exercise={exercise} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: /verifică/i }));
    expect(onSubmit).toHaveBeenCalledWith(false);
  });
});
