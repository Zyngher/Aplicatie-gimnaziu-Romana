import { useState } from 'react';
import type { Exercise } from '../../types/exercise';
import styles from './Ordering.module.css';

type OrderingExercise = Extract<Exercise, { responseMode: 'ordering' }>;

interface Props {
  exercise: OrderingExercise;
  onSubmit: (correct: boolean) => void;
}

export function Ordering({ exercise, onSubmit }: Props) {
  const { items } = exercise.response;
  const [order, setOrder] = useState<number[]>(items.map((_, i) => i));
  const [submitted, setSubmitted] = useState(false);

  function moveUp(position: number) {
    if (position === 0) return;
    setOrder((current) => {
      const next = [...current];
      [next[position - 1], next[position]] = [next[position], next[position - 1]];
      return next;
    });
  }

  function moveDown(position: number) {
    if (position === order.length - 1) return;
    setOrder((current) => {
      const next = [...current];
      [next[position + 1], next[position]] = [next[position], next[position + 1]];
      return next;
    });
  }

  function handleSubmit() {
    if (submitted) return;
    const correct = order.every(
      (itemIndex, position) => itemIndex === exercise.response.correctOrder[position],
    );
    setSubmitted(true);
    onSubmit(correct);
  }

  return (
    <div>
      <p className={styles.prompt}>{exercise.prompt}</p>
      <ol className={styles.list}>
        {order.map((itemIndex, position) => (
          <li key={itemIndex} className={styles.item}>
            {items[itemIndex]}
            <button
              type="button"
              onClick={() => moveUp(position)}
              aria-label={`Mută în sus: ${items[itemIndex]}`}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveDown(position)}
              aria-label={`Mută în jos: ${items[itemIndex]}`}
            >
              ↓
            </button>
          </li>
        ))}
      </ol>
      <button type="button" onClick={handleSubmit} disabled={submitted}>
        Verifică
      </button>
    </div>
  );
}
