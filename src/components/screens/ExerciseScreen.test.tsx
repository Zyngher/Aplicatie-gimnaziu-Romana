import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation, type Screen } from '../../lib/navigation';
import { loadProgress } from '../../lib/progress';
import { ExerciseScreen } from './ExerciseScreen';

function CurrentScreenProbe() {
  const navigation = useNavigation();
  return <p data-testid="current">{JSON.stringify(navigation.current)}</p>;
}

const initialStack: Screen[] = [
  { name: 'home' },
  { name: 'ortogrameHome' },
  { name: 'setDetail', setId: 'set-06-sa-sau-ia-iau' },
  { name: 'exercise', setId: 'set-06-sa-sau-ia-iau', exerciseIndex: 0 },
];

beforeEach(() => {
  window.localStorage.clear();
});

describe('ExerciseScreen', () => {
  it('fix #3: are un buton inapoi care revine la SetDetail', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider initialStack={initialStack}>
        <ExerciseScreen />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getByRole('button', { name: /^← înapoi$/i }));
    expect(screen.getByTestId('current')).toHaveTextContent('"name":"setDetail"');
  });

  it('randeaza componenta corecta pentru modul exercitiului curent (multipleChoice) si salveaza progresul', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={initialStack}><ExerciseScreen /></NavigationProvider>);
    await user.click(screen.getByRole('radio', { name: /s-a/i }));
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByText(/corect!/i)).toBeInTheDocument();
    const store = loadProgress();
    expect(store['ortograme:set-06-sa-sau-ia-iau'].completedExerciseIds).toContain('ex-set06-mcq-01');
  });

  it('Continua avanseaza la exercitiul urmator', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={initialStack}><ExerciseScreen /></NavigationProvider>);
    await user.click(screen.getByRole('radio', { name: /s-a/i }));
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    await user.click(screen.getByRole('button', { name: /continuă/i }));
    // al 2-lea exercitiu (index 1) e tot multipleChoice, cu alt text
    expect(screen.getByText(/unboxing/i)).toBeInTheDocument();
  });
});
