import { useState } from 'react';
import type { Exercise } from '../../types/exercise';

type WordBankExercise = Extract<Exercise, { responseMode: 'wordBank' }>;

interface Props {
  exercise: WordBankExercise;
  onSubmit: (correct: boolean) => void;
}

export function WordBank({ exercise, onSubmit }: Props) {
  const { text, bank, blanks } = exercise.response;
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const parts = text.split(/(\{\{\w+\}\})/g);
  const allFilled = blanks.every((b) => selections[b.marker]);

  function handleSubmit() {
    if (submitted) return;
    const correct = blanks.every((b) => selections[b.marker] === b.correctWordId);
    setSubmitted(true);
    onSubmit(correct);
  }

  return (
    <div>
      <p>{exercise.prompt}</p>
      <p>
        {parts.map((part, i) => {
          const match = part.match(/^\{\{(\w+)\}\}$/);
          if (!match) return <span key={i}>{part}</span>;
          const marker = match[1];
          // Eticheta pentru cititor de ecran trebuie sa fie pozitionala (indexul real din
          // `blanks`, 1-indexat pentru un om), nu markerul brut de continut ("b1"/"b2") —
          // markerul e un id intern de autor, fara sens pentru un elev care asculta exercitiul.
          const blankPosition = blanks.findIndex((b) => b.marker === marker) + 1;
          return (
            <select
              key={marker}
              aria-label={`Spațiu ${blankPosition}`}
              value={selections[marker] ?? ''}
              onChange={(e) => setSelections((s) => ({ ...s, [marker]: e.target.value }))}
            >
              <option value="" disabled>
                alege
              </option>
              {bank.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.word}
                </option>
              ))}
            </select>
          );
        })}
      </p>
      <button type="button" onClick={handleSubmit} disabled={!allFilled || submitted}>
        Verifică
      </button>
    </div>
  );
}
