import { useState } from 'react';
import type { Exercise } from '../../types/exercise';
import styles from './MultipleChoice.module.css';
import { MarkerButton } from '../MarkerButton';

type MultipleChoiceExercise = Extract<Exercise, { responseMode: 'multipleChoice' }>;

interface Props {
  exercise: MultipleChoiceExercise;
  onSubmit: (correct: boolean) => void;
}

export function MultipleChoice({ exercise, onSubmit }: Props) {
  const isMulti = exercise.response.correctIndices.length > 1;
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  function toggle(index: number) {
    if (isMulti) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    } else {
      setSelected(new Set([index]));
    }
  }

  function handleSubmit() {
    if (submitted) return;
    const correctSet = new Set(exercise.response.correctIndices);
    const correct =
      selected.size === correctSet.size && [...selected].every((i) => correctSet.has(i));
    setSubmitted(true);
    onSubmit(correct);
  }

  return (
    <div>
      <p className={styles.prompt}>{exercise.prompt}</p>
      <p className={styles.text}>{exercise.response.text}</p>
      <div className={styles.options} role="group" aria-label="Opțiuni de răspuns">
        {exercise.response.options.map((option, index) => (
          <label key={index} className={styles.option}>
            <input
              type={isMulti ? 'checkbox' : 'radio'}
              name={isMulti ? undefined : exercise.id}
              checked={selected.has(index)}
              onChange={() => toggle(index)}
              disabled={submitted}
            />
            {option}
          </label>
        ))}
      </div>
      <MarkerButton
        color="var(--marker-ortograme)"
        onClick={handleSubmit}
        disabled={selected.size === 0 || submitted}
      >
        Verifică
      </MarkerButton>
    </div>
  );
}
