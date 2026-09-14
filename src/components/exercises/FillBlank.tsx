import { useState } from 'react';
import type { Exercise } from '../../types/exercise';

type FillBlankExercise = Extract<Exercise, { responseMode: 'fillBlank' }>;

interface Props {
  exercise: FillBlankExercise;
  onSubmit: (correct: boolean) => void;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function FillBlank({ exercise, onSubmit }: Props) {
  const [value, setValue] = useState('');

  function handleSubmit() {
    const correct = exercise.response.correctAnswers.some(
      (answer) => normalize(answer) === normalize(value),
    );
    onSubmit(correct);
  }

  return (
    <div>
      <p>{exercise.prompt}</p>
      <p>{exercise.response.text}</p>
      <label>
        Răspunsul tău
        <input value={value} onChange={(e) => setValue(e.target.value)} />
      </label>
      <button type="button" onClick={handleSubmit} disabled={value.trim().length === 0}>
        Verifică
      </button>
    </div>
  );
}
