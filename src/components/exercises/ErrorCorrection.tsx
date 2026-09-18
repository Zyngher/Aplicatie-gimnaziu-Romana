import { useState } from 'react';
import styles from './ErrorCorrection.module.css';
import type { Exercise } from '../../types/exercise';
import { MarkerButton } from '../MarkerButton';

type ErrorCorrectionExercise = Extract<Exercise, { responseMode: 'errorCorrection' }>;

interface Props {
  exercise: ErrorCorrectionExercise;
  onSubmit: (correct: boolean) => void;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function ErrorCorrection({ exercise, onSubmit }: Props) {
  const { tokens, errorTokenIndex, correctToken, explanation } = exercise.response;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [correction, setCorrection] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (submitted) return;
    const correct = selectedIndex === errorTokenIndex && normalize(correction) === normalize(correctToken);
    setSubmitted(true);
    onSubmit(correct);
  }

  return (
    <div>
      <p className={styles.prompt}>{exercise.prompt}</p>
      <p className={styles.tokens}>
        {tokens.map((token, index) => (
          <button
            key={index}
            type="button"
            className={styles.token}
            onClick={() => setSelectedIndex(index)}
            aria-pressed={selectedIndex === index}
          >
            {token}
          </button>
        ))}
      </p>
      <label className={styles.label}>
        Forma corectă
        <input className={styles.input} value={correction} onChange={(e) => setCorrection(e.target.value)} />
      </label>
      <MarkerButton
        color="var(--marker-ortograme)"
        onClick={handleSubmit}
        disabled={selectedIndex === null || correction.trim().length === 0 || submitted}
      >
        Verifică
      </MarkerButton>
      {submitted && <p className={styles.explanation}>{explanation}</p>}
    </div>
  );
}
