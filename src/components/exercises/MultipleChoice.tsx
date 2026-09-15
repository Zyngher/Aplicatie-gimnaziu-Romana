import { useState } from 'react';
import type { Exercise } from '../../types/exercise';

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
      <p>{exercise.prompt}</p>
      <p>{exercise.response.text}</p>
      <div role="group" aria-label="Opțiuni de răspuns">
        {exercise.response.options.map((option, index) => (
          <label key={option}>
            <input
              type={isMulti ? 'checkbox' : 'radio'}
              name={isMulti ? undefined : exercise.id}
              checked={selected.has(index)}
              onChange={() => toggle(index)}
            />
            {option}
          </label>
        ))}
      </div>
      <button type="button" onClick={handleSubmit} disabled={selected.size === 0 || submitted}>
        Verifică
      </button>
    </div>
  );
}
