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
    // ex-set06-mcq-01 (conținut rescris): „sa” (adjectiv posesiv, „echipa ei”) e forma corectă.
    await user.click(screen.getByRole('radio', { name: 'sa' }));
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByText(/corect!/i)).toBeInTheDocument();
    const store = loadProgress();
    expect(store['ortograme:set-06-sa-sau-ia-iau'].completedExerciseIds).toContain('ex-set06-mcq-01');
  });

  it('Continua avanseaza la exercitiul urmator, cu stare proaspata (regresie key={exercise.id})', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={initialStack}><ExerciseScreen /></NavigationProvider>);
    await user.click(screen.getByRole('radio', { name: /s-a/i }));
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    await user.click(screen.getByRole('button', { name: /continuă/i }));
    // al 2-lea exercitiu (index 1) e tot multipleChoice, cu alt text
    expect(screen.getByText(/unboxing/i)).toBeInTheDocument();
    // Critical (audit teste): asertiunile de mai sus ar trece si fara key={exercise.id}, pentru
    // ca textul vine direct din props. Asertiunile de mai jos chiar discrimineaza regresia:
    // ex-set06-mcq-02 are optiunile ["sau","s-au"] — fara un remount fortat de key, starea
    // interna din MultipleChoice.tsx (selected: Set<number>, submitted: boolean) ar ramane cea
    // de la exercitiul anterior (unde indexul 1 era "s-a", selectat si trimis), deci radio-ul
    // "s-au" (acelasi index 1, in noul exercitiu) ar aparea deja bifat, iar butonul Verifica ar
    // ramane dezactivat (submitted inca true). Cu key={exercise.id} prezent, ambele trebuie sa
    // fie in starea initiala proaspata.
    expect(screen.getByRole('radio', { name: /s-au/i })).not.toBeChecked();
    expect(screen.getByRole('button', { name: /^verifică$/i })).toBeDisabled();
  });
});

describe('ExerciseScreen — A1: raspunsul corect e aratat dupa un raspuns gresit, pentru modurile auto-corectate fara explicatie proprie', () => {
  it('multipleChoice (ex-set06-mcq-01): un raspuns gresit arata "Răspunsul corect: sa"', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={initialStack}><ExerciseScreen /></NavigationProvider>);
    // "s-a" e optiunea gresita la ex-set06-mcq-01 (conținut rescris: corect e "sa")
    await user.click(screen.getByRole('radio', { name: /^s-a$/i }));
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByText(/răspunsul corect: sa/i)).toBeInTheDocument();
  });

  it('fillBlank (ex-set06-fillblank-01): un raspuns gresit arata "Răspunsul corect: ia"', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={stackAt(2)}><ExerciseScreen /></NavigationProvider>);
    await user.type(screen.getByRole('textbox'), 'gresit');
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByText(/răspunsul corect: ia/i)).toBeInTheDocument();
  });

  it('wordBank (ex-set06-wordbank-01): o selectie gresita arata "Răspunsurile corecte: iau, sa"', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={stackAt(4)}><ExerciseScreen /></NavigationProvider>);
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'wb-i-au');
    await user.selectOptions(selects[1], 'wb-s-a');
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByText(/răspunsurile corecte: iau, sa/i)).toBeInTheDocument();
  });

  it('un raspuns corect NU arata textul "Răspunsul corect" (afisat doar la gresit)', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={initialStack}><ExerciseScreen /></NavigationProvider>);
    await user.click(screen.getByRole('radio', { name: 'sa' }));
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByText(/corect!/i)).toBeInTheDocument();
    expect(screen.queryByText(/răspunsul corect/i)).not.toBeInTheDocument();
  });
});

describe('ExerciseScreen — Critical #1: explicatia errorCorrection trebuie sa ramana vizibila dupa trimitere', () => {
  it('dupa un raspuns corect la ex-set06-error-01, explicatia e in DOM alaturi de feedback', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider initialStack={stackAt(3)}><ExerciseScreen /></NavigationProvider>);
    // ex-set06-error-01 (conținut rescris): tokenul gresit e "sa" (index 1), forma corecta e "s-a"
    await user.click(screen.getByRole('button', { name: 'sa' }));
    await user.type(screen.getByRole('textbox'), 's-a');
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
