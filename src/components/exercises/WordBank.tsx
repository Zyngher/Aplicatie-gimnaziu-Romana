import { useState } from 'react';
import type { Exercise } from '../../types/exercise';
import styles from './WordBank.module.css';

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
      <p className={styles.prompt}>{exercise.prompt}</p>
      <p className={styles.text}>
        {parts.map((part, i) => {
          const match = part.match(/^\{\{(\w+)\}\}$/);
          if (!match) return <span key={i}>{part}</span>;
          const marker = match[1];
          const blankPosition = blanks.findIndex((b) => b.marker === marker) + 1;
          return (
            <select
              key={marker}
              className={styles.blank}
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
