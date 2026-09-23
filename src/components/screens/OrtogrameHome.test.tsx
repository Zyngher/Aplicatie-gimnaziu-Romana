import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation } from '../../lib/navigation';
import { markExerciseCompleted, markOpenTextSelfCheck, buildProgressKey } from '../../lib/progress';
import { getManifest, getSetById } from '../../lib/content-loader';
import { OrtogrameHome } from './OrtogrameHome';
import styles from './OrtogrameHome.module.css';

function CurrentScreenProbe() {
  const navigation = useNavigation();
  return <p data-testid="current">{JSON.stringify(navigation.current)}</p>;
}

// getByRole's `name` matcher cu `exact: false` nu face potrivire pe substring asa cum ar face
// getByText — verificat direct, ramane strict pe numele intreg calculat. Un regex neancorat e
// singura cale sigura sa potrivim doar inceputul titlului unui buton (care mai are un sufix de
// stare, "(0%)" sau "(Continut in lucru)", lipit fara spatiu in numele accesibil calculat).
function titleMatcher(title: string): RegExp {
  return new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
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

  it('primul set autorat este deblocat necondiționat — fix #5', () => {
    // Derivat direct din manifest, nu hardcodat la un set anume — primul set AUTORAT (in ordinea
    // din manifest) trebuie sa fie mereu deblocat, indiferent care set e acesta la un moment dat
    // (vezi jurnalul de lucru, 2026-09-20/21: set-01 a devenit primul autorat, nu mai e set-06).
    // Randarea avatarului e verificata separat, pe Mira, in testul "fix #4" de mai jos, care nu
    // depinde de starea de deblocare (avatarul se randeaza indiferent daca butonul e disabled).
    const firstAuthored = getManifest().sets.find((s) => s.filePath !== null);
    if (!firstAuthored) throw new Error('Testul presupune cel putin un set autorat in manifest');
    render(<NavigationProvider><OrtogrameHome /></NavigationProvider>);
    const button = screen.getByRole('button', { name: titleMatcher(firstAuthored.title) });
    expect(button).not.toBeDisabled();
  });

  it('un set neautorat arata "continut in lucru", nu e clickabil', () => {
    render(<NavigationProvider><OrtogrameHome /></NavigationProvider>);
    const firstUnauthored = getManifest().sets.find((s) => s.filePath === null);
    if (!firstUnauthored) throw new Error('Testul presupune cel putin un set neautorat in manifest');
    const button = screen.getByRole('button', { name: titleMatcher(firstUnauthored.title) });
    expect(button).toBeDisabled();
    // fix #5: eticheta trebuie sa apara pentru toate seturile neautorate, nu doar pentru cele
    // deblocate — altfel majoritatea sunt butoane fara nicio explicatie pentru un elev nou.
    // Numarul asteptat e derivat direct din manifest (nu un numar magic hardcodat) ca testul sa
    // nu ceara o editare manuala de fiecare data cand se autoreaza un set nou — vezi jurnalul de
    // lucru, 2026-09-18/19: acelasi 2 teste au trebuit reactualizate la fiecare din set-07/08/09.
    const unauthoredCount = getManifest().sets.filter((s) => s.filePath === null).length;
    expect(screen.getAllByText(/conținut în lucru/i)).toHaveLength(unauthoredCount);
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
    const firstAuthored = getManifest().sets.find((s) => s.filePath !== null);
    if (!firstAuthored) throw new Error('Testul presupune cel putin un set autorat in manifest');
    render(
      <NavigationProvider>
        <OrtogrameHome />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getByRole('button', { name: titleMatcher(firstAuthored.title) }));
    expect(screen.getByTestId('current')).toHaveTextContent('setDetail');
    expect(screen.getByTestId('current')).toHaveTextContent(firstAuthored.id);
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

// Completeaza toate exercitiile unui set autorat (folosind markOpenTextSelfCheck pentru
// openText, markExerciseCompleted pentru rest) — derivat generic din continutul real al setului,
// nu dintr-o lista hardcodata de id-uri, ca testele care il folosesc sa nu ceara o editare
// manuala de fiecare data cand se autoreaza un set nou (vezi jurnalul de lucru, 2026-09-18/19:
// aceleasi 2 teste au trebuit reactualizate manual la fiecare din set-07/08/09, inainte de asta).
function completeAuthoredSet(setId: string) {
  const set = getSetById(setId);
  const progressKey = buildProgressKey('ortograme', set.id);
  for (const exercise of set.exercises) {
    if (exercise.responseMode === 'openText') {
      markOpenTextSelfCheck(progressKey, exercise.id, true);
    } else {
      markExerciseCompleted(progressKey, exercise.id);
    }
  }
}

describe('OrtogrameHome — mod index liber', () => {
  it('cu un set autorat la 100% si celelalte neterminate, ramane in mod traseu (fara blocare completa)', () => {
    // Completeaza DOAR primul set autorat din manifest — restul raman neatinse, deci NU toate
    // seturile autorate sunt la 100% — index liber cere TOATE, nu doar unul.
    const authoredIds = getManifest().sets.filter((s) => s.filePath !== null).map((s) => s.id);
    expect(authoredIds.length).toBeGreaterThan(1); // testul presupune >1 set autorat, ca sa aiba sens cazul negativ
    completeAuthoredSet(authoredIds[0]);
    render(<NavigationProvider><OrtogrameHome /></NavigationProvider>);
    expect(screen.getByText(/traseu/i)).toBeInTheDocument();
  });

  // D2: OrtogrameHome.tsx foloseste isIndexModeActive(percentages, 100) — pragul real de
  // productie, aplicat la TOATE seturile autorate, nu doar la unul. Testul de mai sus verifica
  // cazul negativ (un set autorat neterminat); acesta completeaza integral TOATE seturile
  // autorate din manifest (inclusiv exercitiile openText, autoevaluate "Am reusit") ca sa
  // confirme ca tranzitia reala la "Index liber" chiar se intampla in productie, nu doar la
  // nivel de unitate pura (vezi si unlock.test.ts).
  it('cu toate exercitiile tuturor seturilor autorate terminate (inclusiv openText autoevaluat "Am reușit"), comută la index liber', () => {
    const authoredIds = getManifest().sets.filter((s) => s.filePath !== null).map((s) => s.id);
    authoredIds.forEach(completeAuthoredSet);
    render(<NavigationProvider><OrtogrameHome /></NavigationProvider>);
    expect(screen.getByText(/index liber — recapitulare/i)).toBeInTheDocument();
  });
});
