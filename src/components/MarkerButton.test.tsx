import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkerButton } from './MarkerButton';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('MarkerButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    // @ts-expect-error curatam mock-ul intre teste, tipul exact nu conteaza aici
    delete window.matchMedia;
  });

  it('randeaza textul dat ca accessible name si raspunde la click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<MarkerButton color="#7ec8e3" onClick={onClick}>Verifică</MarkerButton>);
    const button = screen.getByRole('button', { name: 'Verifică' });
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respecta prop-ul disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <MarkerButton color="#7ec8e3" onClick={onClick} disabled>
        Verifică
      </MarkerButton>,
    );
    const button = screen.getByRole('button', { name: 'Verifică' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('cu prefers-reduced-motion, hover-ul aplica direct culoare solida, fara benzi', () => {
    mockMatchMedia(true);
    const { container } = render(<MarkerButton color="#7ec8e3">Verifică</MarkerButton>);
    const button = screen.getByRole('button', { name: 'Verifică' });
    fireEvent.mouseEnter(button);
    const fillChildren = container.querySelectorAll('[data-marker-fill] > *');
    expect(fillChildren).toHaveLength(1);
    expect((fillChildren[0] as HTMLElement).style.background).toBe('rgb(126, 200, 227)');
  });

  it('mouseleave goleste stratul de umplere dupa un hover anterior', () => {
    mockMatchMedia(true);
    const { container } = render(<MarkerButton color="#7ec8e3">Verifică</MarkerButton>);
    const button = screen.getByRole('button', { name: 'Verifică' });
    fireEvent.mouseEnter(button);
    expect(container.querySelectorAll('[data-marker-fill] > *')).toHaveLength(1);
    fireEvent.mouseLeave(button);
    expect(container.querySelectorAll('[data-marker-fill] > *')).toHaveLength(0);
  });

  it('la focus, cu dimensiuni reale simulate, construieste benzile plus stratul de siguranta', () => {
    mockMatchMedia(false);
    const { container } = render(<MarkerButton color="#7ec8e3">Verifică</MarkerButton>);
    const button = screen.getByRole('button', { name: 'Verifică' });
    Object.defineProperty(button, 'offsetWidth', { value: 100, configurable: true });
    Object.defineProperty(button, 'offsetHeight', { value: 44, configurable: true });
    fireEvent.focus(button);
    // 4 benzi + 1 strat de siguranta = 5 elemente copil in stratul de umplere
    expect(container.querySelectorAll('[data-marker-fill] > *')).toHaveLength(5);
    // fiecare banda contine un <svg> generat de rough.js
    expect(container.querySelectorAll('[data-marker-fill] svg')).toHaveLength(4);
  });
});
