import { useState } from 'react';
import type { Exercise } from '../../types/exercise';

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
      <p>{exercise.prompt}</p>
      <p>{exercise.response.instructions}</p>
      <label>
        Răspunsul tău
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} />
      </label>
      {!revealed && (
        <button type="button" onClick={() => setRevealed(true)} disabled={answer.trim().length === 0}>
          Arată răspunsul model
        </button>
      )}
      {revealed && (
        <div>
          <p>Răspuns model: {exercise.response.modelAnswer}</p>
          <ul>
            {exercise.response.selfCheckCriteria.map((criterion) => (
              <li key={criterion}>{criterion}</li>
            ))}
          </ul>
          <button type="button" onClick={() => handleSelfCheck(true)} disabled={submitted}>
            Am reușit
          </button>
          <button type="button" onClick={() => handleSelfCheck(false)} disabled={submitted}>
            Mai exersez
          </button>
        </div>
      )}
    </div>
  );
}
