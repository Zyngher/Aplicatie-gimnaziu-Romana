import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('arată un ecran de recuperare in loc de pagina alba, la o eroare de randare', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/ceva n-a mers/i)).toBeInTheDocument();
    spy.mockRestore();
  });

  it('randează copiii normal cand nu exista nicio eroare', () => {
    render(
      <ErrorBoundary>
        <p>Continut normal</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Continut normal')).toBeInTheDocument();
  });
});
