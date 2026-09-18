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

const originalMatchMedia = window.matchMedia;

describe('MarkerButton', () => {
  afterEach(() => {
    if (originalMatchMedia === undefined) {
      // @ts-expect-error jsdom nu implementeaza matchMedia implicit — revenim la starea reala (nedefinit)
      delete window.matchMedia;
    } else {
      window.matchMedia = originalMatchMedia;
    }
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
    // maybeHide() verifica starea reala :hover in DOM (vezi comentariul din MarkerButton.tsx).
    // jsdom aproximeaza :hover pe baza ultimului eveniment mouseover/mouseout (nu mouseenter/
    // mouseleave) primit — vezi @asamuzakjp/dom-selector, evaluator.js #matchHoverPseudoClass.
    // Intr-un browser real, ordinea evenimentelor la parasirea unui element e mouseout inaintea
    // lui mouseleave (spec UI Events), iar :hover e deja actualizat cand oricare din ele se
    // declanseaza. jsdom insa declanseaza mouseleave INAINTE de perechea sa de compatibilitate
    // mouseout atunci cand fireEvent.mouseLeave() e apelat izolat — asa ca simulam explicit
    // mouseout intai, ca sa reproducem corect ordinea reala de browser pe care se bazeaza fix-ul.
    fireEvent.mouseOut(button);
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

  it('un al doilea eveniment de reveal (focus dupa mouseenter) nu reconstruieste umplerea deja in curs', () => {
    mockMatchMedia(false);
    const { container } = render(<MarkerButton color="#7ec8e3">Verifică</MarkerButton>);
    const button = screen.getByRole('button', { name: 'Verifică' });
    Object.defineProperty(button, 'offsetWidth', { value: 100, configurable: true });
    Object.defineProperty(button, 'offsetHeight', { value: 44, configurable: true });
    fireEvent.mouseEnter(button);
    const fillAfterHover = container.querySelector('[data-marker-fill]')!.innerHTML;
    fireEvent.focus(button);
    const fillAfterFocus = container.querySelector('[data-marker-fill]')!.innerHTML;
    expect(fillAfterFocus).toBe(fillAfterHover);
  });
});
