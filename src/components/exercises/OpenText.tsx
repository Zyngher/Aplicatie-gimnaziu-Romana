import { useState } from 'react';
import type { Exercise } from '../../types/exercise';
import styles from './OpenText.module.css';
import { MarkerButton } from '../MarkerButton';

type OpenTextExercise = Extract<Exercise, { responseMode: 'openText' }>;

interface Props {
  exercise: OpenTextExercise;
  onSubmit: (selfMarkedOk: boolean) => void;
}

export function OpenText({ exercise, onSubmit }: Props) {
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSelfCheck(selfMarkedOk: boolean) {
    if (submitted) return;
    setSubmitted(true);
    onSubmit(selfMarkedOk);
  }

  return (
    <div>
      <p className={styles.prompt}>{exercise.prompt}</p>
      <p className={styles.instructions}>{exercise.response.instructions}</p>
      <label className={styles.label}>
        Răspunsul tău
        <textarea className={styles.textarea} value={answer} onChange={(e) => setAnswer(e.target.value)} />
      </label>
      {!revealed && (
        <button
          type="button"
          className={styles.revealButton}
          onClick={() => setRevealed(true)}
          disabled={answer.trim().length === 0}
        >
          Arată răspunsul model
        </button>
      )}
      {revealed && (
        <div className={styles.modelAnswer}>
          <p>Răspuns model: {exercise.response.modelAnswer}</p>
          <ul className={styles.criteria}>
            {exercise.response.selfCheckCriteria.map((criterion) => (
              <li key={criterion}>{criterion}</li>
            ))}
          </ul>
          <div className={styles.successButton}>
            <MarkerButton
              color="var(--marker-ortograme)"
              onClick={() => handleSelfCheck(true)}
              disabled={submitted}
            >
              Am reușit
            </MarkerButton>
          </div>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => handleSelfCheck(false)}
            disabled={submitted}
          >
            Mai exersez
          </button>
        </div>
      )}
    </div>
  );
}
