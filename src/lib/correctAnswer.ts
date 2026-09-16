import type { Exercise } from '../types/exercise';

/**
 * Deriva un text afisabil, in romana, cu raspunsul corect al unui exercitiu — folosit in
 * panoul de feedback al ExerciseScreen dupa un raspuns gresit, ca elevul sa vada forma
 * corecta si sa invete din greseala (nu doar "gresit", fara nicio explicatie).
 *
 * Datele necesare exista deja in fiecare `ResponseMode` (sunt aceleasi campuri folosite deja
 * pentru auto-corectare), deci asta e strict derivare/afisare, nu o schimbare de date.
 *
 * Returneaza null pentru `errorCorrection` (isi afiseaza deja propria explicatie, in propria
 * componenta) si pentru `openText` (nu are un raspuns unic "corect" — e autoevaluat de elev).
 */
export function getCorrectAnswerText(exercise: Exercise): string | null {
  switch (exercise.responseMode) {
    case 'multipleChoice': {
      const { options, correctIndices } = exercise.response;
      const correct = correctIndices.map((i) => options[i]);
      return correct.length > 1
        ? `Răspunsurile corecte: ${correct.join(', ')}`
        : `Răspunsul corect: ${correct[0]}`;
    }
    case 'fillBlank': {
      const [first] = exercise.response.correctAnswers;
      return `Răspunsul corect: ${first}`;
    }
    case 'wordBank': {
      const { bank, blanks } = exercise.response;
      const words = blanks.map(
        (b) => bank.find((item) => item.id === b.correctWordId)?.word ?? b.correctWordId,
      );
      return words.length > 1
        ? `Răspunsurile corecte: ${words.join(', ')}`
        : `Răspunsul corect: ${words[0]}`;
    }
    case 'ordering': {
      const { items, correctOrder } = exercise.response;
      const ordered = correctOrder.map((i) => items[i]);
      return `Ordinea corectă: ${ordered.join(' ')}`;
    }
    case 'errorCorrection':
    case 'openText':
      return null;
  }
}
