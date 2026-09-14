import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation } from '../../lib/navigation';
import { markExerciseCompleted } from '../../lib/progress';
import { OrtogrameHome } from './OrtogrameHome';

function CurrentScreenProbe() {
  const navigation = useNavigation();
  return <p data-testid="current">{JSON.stringify(navigation.current)}</p>;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('OrtogrameHome — mod traseu (implicit)', () => {
  it('afiseaza toate cele 20 de seturi din manifest', () => {
    render(<NavigationProvider><OrtogrameHome /></NavigationProvider>);
    expect(screen.getAllByRole('listitem')).toHaveLength(20);
  });

  it('grupele A-F apar ca anteturi de sectiune, in ordine, in ambele moduri', () => {
    render(<NavigationProvider><OrtogrameHome /></NavigationProvider>);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      'Grupa A — Fundamente',
      'Grupa B — Cratimă cu "a" I',
      'Grupa C — Cratimă cu "a" II',
      'Grupa D — Cratimă diversă',
      'Grupa E — Două forme, aceeași pronunție',
      'Grupa F — Reguli finale',
    ]);
  });

  it('primul set (autorat) e deblocat si arata avatarul personajului — fix #5', () => {
    render(<NavigationProvider><OrtogrameHome /></NavigationProvider>);
    const button = screen.getByRole('button', { name: /sa \/ s-a/i });
    expect(button).not.toBeDisabled();
    expect(screen.getByAltText('Mira')).toBeInTheDocument();
  });

  it('un set neautorat arata "continut in lucru", nu e clickabil', () => {
    render(<NavigationProvider><OrtogrameHome /></NavigationProvider>);
    const button = screen.getByRole('button', { name: /î și â/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/conținut în lucru/i)).toBeInTheDocument();
  });

  it('click pe setul autorat si deblocat navigheaza la setDetail', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider>
        <OrtogrameHome />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getByRole('button', { name: /sa \/ s-a/i }));
    expect(screen.getByTestId('current')).toHaveTextContent('setDetail');
    expect(screen.getByTestId('current')).toHaveTextContent('set-06-sa-sau-ia-iau');
  });
});

describe('OrtogrameHome — buton inapoi catre Home', () => {
  it('afiseaza un buton care revine la pagina principala', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider initialStack={[{ name: 'home' }, { name: 'ortogrameHome' }]}>
        <OrtogrameHome />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getByRole('button', { name: /înapoi/i }));
    expect(screen.getByTestId('current')).toHaveTextContent('"name":"home"');
  });
});

describe('OrtogrameHome — mod index liber', () => {
  it('cu singurul set autorat la 100%, comuta la index liber (fara blocare)', () => {
    // set-06 are 6 exercitii — le completam pe toate
    ['ex-set06-mcq-01', 'ex-set06-mcq-02', 'ex-set06-fillblank-01', 'ex-set06-error-01', 'ex-set06-wordbank-01']
      .forEach((id) => markExerciseCompleted('ortograme:set-06-sa-sau-ia-iau', id));
    render(<NavigationProvider><OrtogrameHome /></NavigationProvider>);
    // ex-set06-free-01 (openText) inca nemarcat -> sub 100%, deci NU e inca in mod index liber
    expect(screen.getByText(/traseu/i)).toBeInTheDocument();
  });
});
