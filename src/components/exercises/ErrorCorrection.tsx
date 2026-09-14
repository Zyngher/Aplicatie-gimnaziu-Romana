import { useState } from 'react';
import type { Exercise } from '../../types/exercise';

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
    const correct = selectedIndex === errorTokenIndex && normalize(correction) === normalize(correctToken);
    setSubmitted(true);
    onSubmit(correct);
  }

  return (
    <div>
      <p>{exercise.prompt}</p>
      <p>
        {tokens.map((token, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedIndex(index)}
            aria-pressed={selectedIndex === index}
          >
            {token}
          </button>
        ))}
      </p>
      <label>
        Forma corectă
        <input value={correction} onChange={(e) => setCorrection(e.target.value)} />
      </label>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={selectedIndex === null || correction.trim().length === 0}
      >
        Verifică
      </button>
      {submitted && <p>{explanation}</p>}
    </div>
  );
}
