import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation, type Screen } from '../../lib/navigation';
import { SetDetail } from './SetDetail';

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
    await user.click(screen.getAllByRole('button')[1]); // primul buton = "Înapoi"
    expect(screen.getByTestId('current')).toHaveTextContent('"name":"exercise"');
    expect(screen.getByTestId('current')).toHaveTextContent('"exerciseIndex":0');
  });
});
