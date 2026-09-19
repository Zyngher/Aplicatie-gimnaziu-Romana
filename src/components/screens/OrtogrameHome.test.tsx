import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation } from '../../lib/navigation';
import { markExerciseCompleted, markOpenTextSelfCheck } from '../../lib/progress';
import { OrtogrameHome } from './OrtogrameHome';
import styles from './OrtogrameHome.module.css';

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
    // fix #5: eticheta trebuie sa apara pentru toate seturile neautorate (20 in manifest,
    // 3 autorate — set-06, set-07, set-08), nu doar pentru cele deblocate — altfel majoritatea
    // sunt butoane fara nicio explicatie pentru un elev nou. Assertie pe cardinalitate, nu pe un
    // singur match (acelasi precedent ca la Task 16, documentat in review-ul final).
    expect(screen.getAllByText(/conținut în lucru/i)).toHaveLength(17);
  });

  it('fix #4: daca avatarul mascotei nu se incarca, arata un fallback cu initialele, nu o imagine spartă', () => {
    render(<NavigationProvider><OrtogrameHome /></NavigationProvider>);
    const img = screen.getByAltText('Mira');
    fireEvent.error(img);
    expect(screen.queryByAltText('Mira')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Mira' })).toHaveTextContent('MI');
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

  it('foloseste clasele temei vizuale pe ecran si pe titlu', () => {
    const { container } = render(<NavigationProvider initialStack={[{ name: 'ortogrameHome' }]}><OrtogrameHome /></NavigationProvider>);
    expect(container.firstElementChild).toHaveClass(styles.screen);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass(styles.title);
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
  it('cu un set autorat la 100% si celelalte neterminate, ramane in mod traseu (fara blocare completa)', () => {
    // set-06 are 6 exercitii — le completam pe toate; set-07 si set-08 (autorate ulterior) raman
    // neatinse, deci NU toate seturile autorate sunt la 100% — index liber cere TOATE, nu doar unul.
    ['ex-set06-mcq-01', 'ex-set06-mcq-02', 'ex-set06-fillblank-01', 'ex-set06-error-01', 'ex-set06-wordbank-01']
      .forEach((id) => markExerciseCompleted('ortograme:set-06-sa-sau-ia-iau', id));
    markOpenTextSelfCheck('ortograme:set-06-sa-sau-ia-iau', 'ex-set06-free-01', true);
    render(<NavigationProvider><OrtogrameHome /></NavigationProvider>);
    // set-06 chiar la 100%, dar set-07/set-08 la 0% -> nu toate seturile autorate sunt la prag
    expect(screen.getByText(/traseu/i)).toBeInTheDocument();
  });

  // D2: OrtogrameHome.tsx foloseste isIndexModeActive(percentages, 100) — pragul real de
  // productie, aplicat la TOATE seturile autorate (set-06, set-07, set-08), nu doar la unul.
  // Testul de mai sus verifica cazul negativ (un set autorat neterminat); acesta completeaza
  // integral toate cele 3 seturi autorate (inclusiv exercitiile openText, autoevaluate
  // "Am reusit") ca sa confirme ca tranzitia reala la "Index liber" chiar se intampla in
  // productie, nu doar la nivel de unitate pura (vezi si unlock.test.ts).
  it('cu toate exercitiile celor 3 seturi autorate terminate (inclusiv openText autoevaluat "Am reușit"), comută la index liber', () => {
    ['ex-set06-mcq-01', 'ex-set06-mcq-02', 'ex-set06-fillblank-01', 'ex-set06-error-01', 'ex-set06-wordbank-01']
      .forEach((id) => markExerciseCompleted('ortograme:set-06-sa-sau-ia-iau', id));
    markOpenTextSelfCheck('ortograme:set-06-sa-sau-ia-iau', 'ex-set06-free-01', true);
    ['ex-set07-mcq-01', 'ex-set07-mcq-02', 'ex-set07-fillblank-01', 'ex-set07-error-01', 'ex-set07-wordbank-01']
      .forEach((id) => markExerciseCompleted('ortograme:set-07-la-sai-nea-neam', id));
    markOpenTextSelfCheck('ortograme:set-07-la-sai-nea-neam', 'ex-set07-free-01', true);
    [
      'ex-set08-mcq-01', 'ex-set08-mcq-02', 'ex-set08-mcq-03',
      'ex-set08-fillblank-01', 'ex-set08-fillblank-02', 'ex-set08-error-01', 'ex-set08-wordbank-01',
    ].forEach((id) => markExerciseCompleted('ortograme:set-08-mai-sar-iar-nai-cai', id));
    markOpenTextSelfCheck('ortograme:set-08-mai-sar-iar-nai-cai', 'ex-set08-free-01', true);
    render(<NavigationProvider><OrtogrameHome /></NavigationProvider>);
    expect(screen.getByText(/index liber — recapitulare/i)).toBeInTheDocument();
  });
});
