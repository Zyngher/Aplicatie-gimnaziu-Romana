import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation, type Screen } from '../../lib/navigation';
import { SetDetail } from './SetDetail';
import styles from './SetDetail.module.css';
import { markExerciseCompleted } from '../../lib/progress';

function CurrentScreenProbe() {
  const navigation = useNavigation();
  return <p data-testid="current">{JSON.stringify(navigation.current)}</p>;
}

const initialStack: Screen[] = [{ name: 'home' }, { name: 'setDetail', setId: 'set-06-sa-sau-ia-iau' }];

describe('SetDetail', () => {
  it('afiseaza regula si exemplele contrastive pentru fiecare pereche', () => {
    render(<NavigationProvider initialStack={initialStack}><SetDetail /></NavigationProvider>);
    expect(screen.getByText(/adjectiv posesiv/i)).toBeInTheDocument();
    expect(screen.getByText(/ruta sa \(a lui\) de călătorie/i)).toBeInTheDocument();
  });

  it('fix #7: etapele exercitiilor apar in romana, nu ca enum englezesc', () => {
    render(<NavigationProvider initialStack={initialStack}><SetDetail /></NavigationProvider>);
    // Set 6 are mai multe exerciții "guided" (Ghidat) — getAllByText, nu getByText, pentru că
    // mai multe potriviri sunt corecte și așteptate aici, nu o eroare de ambiguitate.
    expect(screen.getAllByText(/ghidat/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^guided$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^independent$/)).not.toBeInTheDocument();
  });

  it('click pe un exercitiu navigheaza la ExerciseScreen cu indexul corect', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider initialStack={initialStack}>
        <SetDetail />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    // Set 6 are 2 exerciții "Ghidat" cu exact același text afișat ("Ghidat — Alege forma
    // corectă."), la fel ca in App.test.tsx — getAllByRole, alegem primul (ex-set06-mcq-01,
    // exerciseIndex 0, verificat mai jos).
    await user.click(screen.getAllByRole('button', { name: 'Ghidat — Alege forma corectă.' })[0]);
    expect(screen.getByTestId('current')).toHaveTextContent('"name":"exercise"');
    expect(screen.getByTestId('current')).toHaveTextContent('"exerciseIndex":0');
  });

  it('foloseste clasele temei vizuale pe ecran, titlu si exemplele contrastive', () => {
    const { container } = render(<NavigationProvider initialStack={initialStack}><SetDetail /></NavigationProvider>);
    expect(container.firstElementChild).toHaveClass(styles.screen);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass(styles.title);
  });

  it('arata o bifa langa exercitiile deja completate', () => {
    window.localStorage.clear();
    markExerciseCompleted('ortograme:set-06-sa-sau-ia-iau', 'ex-set06-mcq-01');
    render(<NavigationProvider initialStack={initialStack}><SetDetail /></NavigationProvider>);
    const completedButtons = screen.getAllByRole('button', { name: /✓/ });
    expect(completedButtons.length).toBeGreaterThanOrEqual(1);
  });
});
