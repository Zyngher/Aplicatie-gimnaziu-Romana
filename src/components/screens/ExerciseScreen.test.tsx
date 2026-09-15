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

// Indici reali în set-06-sa-sau-ia-iau.json:
// 0 mcq-01, 1 mcq-02, 2 fillblank-01, 3 error-01, 4 wordbank-01, 5 free-01 (openText). Fără ordering.
function stackAt(exerciseIndex: number): Screen[] {
  return [
    { name: 'home' },
    { name: 'ortogrameHome' },
    { name: 'setDetail', setId: 'set-06-sa-sau-ia-iau' },
    { name: 'exercise', setId: 'set-06-sa-sau-ia-iau', exerciseIndex },
  ];
}

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

describe('ExerciseScreen — Critical #1: explicatia errorCorrection trebuie sa ramana vizibila dupa trimitere', () => {
  it('dupa un raspuns corect la ex-set06-error-01, explicatia e in DOM alaturi de feedback', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={stackAt(3)}><ExerciseScreen /></NavigationProvider>);
    // ex-set06-error-01: tokenul gresit e "s-a" (index 1), forma corecta e "sa"
    await user.click(screen.getByRole('button', { name: 's-a' }));
    await user.type(screen.getByRole('textbox'), 'sa');
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByText(/corect!/i)).toBeInTheDocument();
    // exercitiul nu mai e demontat la trimitere — explicatia chiar apare in pagina
    expect(screen.getByText(/adjectiv posesiv/i)).toBeInTheDocument();
  });
});

describe('ExerciseScreen — Important #7: acoperire de integrare pentru celelalte moduri de raspuns', () => {
  it('fillBlank (ex-set06-fillblank-01): un raspuns corect arata Corect!', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={stackAt(2)}><ExerciseScreen /></NavigationProvider>);
    await user.type(screen.getByRole('textbox'), 'ia');
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByText(/corect!/i)).toBeInTheDocument();
  });

  it('wordBank (ex-set06-wordbank-01): selectiile corecte pentru toate spatiile arata Corect!', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={stackAt(4)}><ExerciseScreen /></NavigationProvider>);
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'wb-iau');
    await user.selectOptions(selects[1], 'wb-sa');
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByText(/corect!/i)).toBeInTheDocument();
  });

  it('openText (ex-set06-free-01): "Am reușit" scrie openTextSelfMarkedOk=true in progres', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={stackAt(5)}><ExerciseScreen /></NavigationProvider>);
    await user.type(screen.getByRole('textbox'), 'Raspunsul meu propriu.');
    await user.click(screen.getByRole('button', { name: /arată răspunsul model/i }));
    await user.click(screen.getByRole('button', { name: /am reușit/i }));
    const store = loadProgress();
    expect(store['ortograme:set-06-sa-sau-ia-iau'].openTextSelfMarkedOk['ex-set06-free-01']).toBe(true);
  });
});
