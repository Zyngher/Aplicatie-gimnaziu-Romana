import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { loadProgress, buildProgressKey, markExerciseCompleted, markOpenTextSelfCheck } from './lib/progress';
import { getManifest, getSetById } from './lib/content-loader';
import { getTopicById } from './lib/synant-content-loader';

beforeEach(() => {
  window.localStorage.clear();
});

// Completeaza un set autorat direct in localStorage, citind continutul lui real (nu id-uri de
// exercitii hardcodate) — acelasi tipar ca in OrtogrameHome.test.tsx (vezi jurnalul de lucru,
// 2026-09-18/19).
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

describe('App — flux complet capăt-la-capăt (fix #8)', () => {
  it('Home → Ortograme → set → exercițiu → răspuns → înapoi → Home cu progres actualizat', async () => {
    // Testul verifica deliberat continutul REAL din set-06 (nu un set oarecare) — dar set-06 nu
    // mai e neaparat primul autorat (din 2026-09-20/21, set-01 poate precede in manifest).
    // Completam dinamic toate seturile autorate care preced set-06, oricare ar fi ele la un
    // moment dat, ca setul sa ramana accesibil prin clic real, fara sa hardcodam id-uri de
    // seturi care s-ar rupe la fiecare set nou autorat inaintea lui set-06.
    const targetSetId = 'set-06-sa-sau-ia-iau';
    const manifest = getManifest();
    const targetOrder = manifest.sets.find((s) => s.id === targetSetId)?.order ?? Infinity;
    manifest.sets
      .filter((s) => s.filePath !== null && s.order < targetOrder)
      .forEach((s) => completeAuthoredSet(s.id));

    const user = userEvent.setup();
    render(<App />);

    // Home (pagina principala)
    expect(screen.getByText('Dascăl în acțiune')).toBeInTheDocument();
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
    // ex-set06-mcq-01 (conținut rescris): „Andra a câștigat finala, iar echipa ___ sărbătorește
    // pe server.” — „sa” (adjectiv posesiv, „echipa ei”) e forma corectă, nu „s-a”.
    await user.click(screen.getByRole('radio', { name: 'sa' }));
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

    expect(screen.getByText('Dascăl în acțiune')).toBeInTheDocument();

    const store = loadProgress();
    expect(store['ortograme:set-06-sa-sau-ia-iau'].completedExerciseIds).toContain('ex-set06-mcq-01');
  });
});

describe('App — flux complet capăt-la-capăt, Sinonime și Antonime (fix final review #5)', () => {
  it('Home → Sinonime și Antonime → temă → exercițiu → răspuns → înapoi → Home cu progres actualizat', async () => {
    // Spre deosebire de fluxul Ortograme de mai sus (unde set-06 nu e neaparat primul autorat),
    // topic-01-vremea-vesela e chiar prima tema autorata din manifest.json — deblocata
    // neconditionat, deci nu trebuie completat nimic in prealabil ca sa fie accesibila prin clic.
    const topic = getTopicById('topic-01-vremea-vesela');

    const user = userEvent.setup();
    render(<App />);

    // Home (pagina principala)
    expect(screen.getByText('Dascăl în acțiune')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /sinonime și antonime —/i }));

    // SinonimeAntonimeHome (traseu)
    expect(screen.getByText('Sinonime și Antonime')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /vremea/i }));

    // TopicDetail
    expect(screen.getByText(topic.title)).toBeInTheDocument();
    // ex-topic01-mcq-01 e primul exercitiu din topic-01-vremea-vesela: "Ghidat — Alege forma
    // corectă." — text unic pe acest ecran (ex-topic01-mcq-02 a fost rescris, vezi fix-ul pentru
    // finding 2 din review-ul final, la "Alege răspunsul corect.", deci nu mai coincide).
    await user.click(screen.getByRole('button', { name: /ghidat — alege forma corectă\./i }));

    // SynAntExerciseScreen — răspunde corect
    // ex-topic01-mcq-01: „Copilul era ___ că a luat cea mai mare notă la test.” — „vesel”
    // (index 0) e forma corectă.
    await user.click(screen.getByRole('radio', { name: 'vesel' }));
    await user.click(screen.getByRole('button', { name: /^verifică$/i }));
    expect(screen.getByText(/corect!/i)).toBeInTheDocument();

    // Inapoi la TopicDetail, apoi la SinonimeAntonimeHome, apoi la Home — fara sa apasam
    // "Continuă" (progresul e deja marcat in handleSubmit, la raspunsul corect, inainte de orice
    // click ulterior). Stiva de navigare are aceeasi adancime ca la Ortograme (home ->
    // sinonimeAntonimeHome -> topicDetail -> synantExercise; vezi lib/navigation.tsx — fiecare
    // ecran foloseste push, nu replace, pana la exercitiu), deci sunt necesari tot 3 pasi de
    // "← Înapoi": synantExercise -> topicDetail (1), topicDetail -> sinonimeAntonimeHome (2),
    // sinonimeAntonimeHome -> home (3).
    await user.click(screen.getByRole('button', { name: /^← înapoi$/i }));
    await user.click(screen.getByRole('button', { name: /^← înapoi$/i }));
    await user.click(screen.getByRole('button', { name: /^← înapoi$/i }));

    expect(screen.getByText('Dascăl în acțiune')).toBeInTheDocument();

    const store = loadProgress();
    expect(store['sinonime-antonime:topic-01-vremea-vesela'].completedExerciseIds).toContain(
      'ex-topic01-mcq-01',
    );
  });
});
