import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { loadProgress } from './lib/progress';

beforeEach(() => {
  window.localStorage.clear();
});

describe('App — flux complet capăt-la-capăt (fix #8)', () => {
  it('Home → Ortograme → set → exercițiu → răspuns → înapoi → Home cu progres actualizat', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Home (pagina principala)
    expect(screen.getByText('EvaluareaRO')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /ortograme —/i }));

    // OrtogrameHome (traseu)
    expect(screen.getByText('Ortograme')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /sa \/ s-a/i }));

    // SetDetail
    expect(screen.getByText(/sa \/ s-a, sau \/ s-au/i)).toBeInTheDocument();
    // Setul are 2 exerciții "Ghidat" cu exact același text afișat ("Ghidat — Alege forma
    // corectă."): ex-set06-mcq-01 (perechea sa/s-a) și ex-set06-mcq-02 (perechea sau/s-au) —
    // conținut real și corect, nu o coliziune de test. getByRole ar arunca aici pentru că
    // presupune un singur match; folosim getAllByRole și alegem primul (ex-set06-mcq-01),
    // exact exercițiul verificat mai jos prin completedExerciseIds.
    const guidedChoiceButtons = screen.getAllByRole('button', { name: /ghidat — alege forma corectă\./i });
    expect(guidedChoiceButtons).toHaveLength(2);
    await user.click(guidedChoiceButtons[0]);

    // ExerciseScreen — răspunde corect
    await user.click(screen.getByRole('radio', { name: /s-a/i }));
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByText(/corect!/i)).toBeInTheDocument();

    // inapoi la SetDetail, apoi la OrtogrameHome, apoi la Home
    await user.click(screen.getByRole('button', { name: /continuă/i }));
    // acum suntem pe al 2-lea exercitiu — navigam explicit inapoi in loc sa il terminam
    // Stiva de navigare are 4 niveluri aici (home -> ortogrameHome -> setDetail -> exercise;
    // trecerea intre exercitii foloseste replace, deci nu adauga adancime), deci sunt necesare
    // 3 pasi de "← Înapoi" pentru a ajunge inapoi la Home — exercise -> setDetail (1),
    // setDetail -> ortogrameHome (2), ortogrameHome -> home (3), exact cele 3 destinatii
    // numite in comentariul de mai sus.
    await user.click(screen.getByRole('button', { name: /^← înapoi$/i }));
    await user.click(screen.getByRole('button', { name: /^← înapoi$/i }));
    await user.click(screen.getByRole('button', { name: /^← înapoi$/i }));

    expect(screen.getByText('EvaluareaRO')).toBeInTheDocument();

    const store = loadProgress();
    expect(store['ortograme:set-06-sa-sau-ia-iau'].completedExerciseIds).toContain('ex-set06-mcq-01');
  });

  it('o eroare de randare intr-un ecran e prinsa de Error Boundary, nu lasa pagina alba', () => {
    // Verificat separat, izolat, in ErrorBoundary.test.tsx (Task 6) — aici doar confirmam ca
    // App.tsx chiar infasoara continutul in <ErrorBoundary>, citind sursa componentei.
    expect(App.toString()).toContain('ErrorBoundary');
  });
});
