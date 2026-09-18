import { useState } from 'react';
import type { Exercise } from '../../types/exercise';
import styles from './FillBlank.module.css';
import { MarkerButton } from '../MarkerButton';
import { normalizeAnswer } from '../../lib/textCompare';

type FillBlankExercise = Extract<Exercise, { responseMode: 'fillBlank' }>;

interface Props {
  exercise: FillBlankExercise;
  onSubmit: (correct: boolean) => void;
}

export function FillBlank({ exercise, onSubmit }: Props) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (submitted) return;
    const correct = exercise.response.correctAnswers.some(
      (answer) => normalizeAnswer(answer) === normalizeAnswer(value),
    );
    setSubmitted(true);
    onSubmit(correct);
  }

  return (
    <div>
      <p className={styles.prompt}>{exercise.prompt}</p>
      <p className={styles.text}>{exercise.response.text}</p>
      <label className={styles.label}>
        Răspunsul tău
        <input className={styles.input} value={value} onChange={(e) => setValue(e.target.value)} />
      </label>
      <MarkerButton
        color="var(--marker-ortograme)"
        onClick={handleSubmit}
        disabled={value.trim().length === 0 || submitted}
      >
        Verifică
      </MarkerButton>
    </div>
  );
}
