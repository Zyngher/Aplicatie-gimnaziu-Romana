import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation, type Screen } from '../../lib/navigation';
import { loadProgress } from '../../lib/progress';
import { SynAntExerciseScreen } from './SynAntExerciseScreen';
import { ErrorBoundary } from '../ErrorBoundary';
import styles from './SynAntExerciseScreen.module.css';

function CurrentScreenProbe() {
  const navigation = useNavigation();
  return <p data-testid="current">{JSON.stringify(navigation.current)}</p>;
}

// Indici reali in topic-01-vremea-vesela.json:
// 0 mcq-01, 1 mcq-02, 2 fillblank-01, 3 wordbank-01, 4 error-01, 5 free-01 (openText).
function stackAt(exerciseIndex: number): Screen[] {
  return [
    { name: 'home' },
    { name: 'sinonimeAntonimeHome' },
    { name: 'topicDetail', topicId: 'topic-01-vremea-vesela' },
    { name: 'synantExercise', topicId: 'topic-01-vremea-vesela', exerciseIndex },
  ];
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('SynAntExerciseScreen', () => {
  it('are un buton inapoi care revine la TopicDetail', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider initialStack={stackAt(0)}>
        <SynAntExerciseScreen />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getByRole('button', { name: /^← înapoi$/i }));
    expect(screen.getByTestId('current')).toHaveTextContent('"name":"topicDetail"');
  });

  it('randeaza multipleChoice si salveaza progresul la raspuns corect', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={stackAt(0)}><SynAntExerciseScreen /></NavigationProvider>);
    await user.click(screen.getByRole('radio', { name: 'vesel' }));
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByText(/corect!/i)).toBeInTheDocument();
    const store = loadProgress();
    expect(store['sinonime-antonime:topic-01-vremea-vesela'].completedExerciseIds).toContain('ex-topic01-mcq-01');
  });

  it('Continua avanseaza la exercitiul urmator, cu stare proaspata (regresie key={exercise.id})', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={stackAt(0)}><SynAntExerciseScreen /></NavigationProvider>);
    await user.click(screen.getByRole('radio', { name: 'trist' }));
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    await user.click(screen.getByRole('button', { name: /continuă/i }));
    expect(screen.getByText(/bucuros/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^verifică$/i })).toBeDisabled();
  });

  it('la un raspuns gresit, arata "Incearca din nou" si raspunsul corect', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={stackAt(0)}><SynAntExerciseScreen /></NavigationProvider>);
    await user.click(screen.getByRole('radio', { name: 'trist' }));
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByRole('button', { name: /încearcă din nou/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuă/i })).toBeInTheDocument();
    expect(screen.getByText(/răspunsul corect: vesel/i)).toBeInTheDocument();
  });

  it('"Incearca din nou" remonteaza exercitiul cu stare proaspata', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={stackAt(0)}><SynAntExerciseScreen /></NavigationProvider>);
    await user.click(screen.getByRole('radio', { name: 'trist' }));
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    await user.click(screen.getByRole('button', { name: /încearcă din nou/i }));
    expect(screen.getByRole('radio', { name: 'trist' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: /^verifică$/i })).toBeDisabled();
  });

  it('la ultimul exercitiu din tema, Continua navigheaza la topicComplete', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider initialStack={stackAt(5)}>
        <SynAntExerciseScreen />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.type(screen.getByRole('textbox'), 'Raspunsul meu propriu.');
    await user.click(screen.getByRole('button', { name: /arată răspunsul model/i }));
    await user.click(screen.getByRole('button', { name: /am reușit/i }));
    await user.click(screen.getByRole('button', { name: /continuă/i }));
    expect(screen.getByTestId('current')).toHaveTextContent('"name":"topicComplete"');
  });

  it('afiseaza componenta de mascota', () => {
    const { container } = render(<NavigationProvider initialStack={stackAt(0)}><SynAntExerciseScreen /></NavigationProvider>);
    expect(container.querySelector('video')).not.toBeNull();
  });

  it('foloseste clasa temei vizuale pe ecran', () => {
    const { container } = render(<NavigationProvider initialStack={stackAt(0)}><SynAntExerciseScreen /></NavigationProvider>);
    expect(container.firstElementChild).toHaveClass(styles.screen);
  });
});

describe('SynAntExerciseScreen — index de exercitiu invalid', () => {
  it('un index in afara intervalului valid e prins de ErrorBoundary, nu lasa pagina alba', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // topic-01 are exact 6 exercitii (indici 0-5) — indexul 6 e primul invalid, real.
    render(
      <ErrorBoundary>
        <NavigationProvider initialStack={stackAt(6)}>
          <SynAntExerciseScreen />
        </NavigationProvider>
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    spy.mockRestore();
  });
});
