import { useState } from 'react';
import { getSetById } from '../../lib/content-loader';
import { markExerciseCompleted, markOpenTextSelfCheck } from '../../lib/progress';
import { useNavigation } from '../../lib/navigation';
import { MultipleChoice } from '../exercises/MultipleChoice';
import { FillBlank } from '../exercises/FillBlank';
import { WordBank } from '../exercises/WordBank';
import { Ordering } from '../exercises/Ordering';
import { ErrorCorrection } from '../exercises/ErrorCorrection';
import { OpenText } from '../exercises/OpenText';

const UNIT_ID = 'ortograme';

export function ExerciseScreen() {
  const navigation = useNavigation();
  const screen = navigation.current;
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  if (screen.name !== 'exercise') return null;
  const set = getSetById(screen.setId);
  const exerciseIndex = screen.exerciseIndex;
  const exercise = set.exercises[exerciseIndex];
  const progressKey = `${UNIT_ID}:${set.id}`;

  function handleSubmit(ok: boolean) {
    if (exercise.responseMode === 'openText') {
      markOpenTextSelfCheck(progressKey, exercise.id, ok);
    } else if (ok) {
      markExerciseCompleted(progressKey, exercise.id);
    }
    setFeedback(ok ? 'correct' : 'incorrect');
  }

  function handleContinue() {
    setFeedback(null);
    const nextIndex = exerciseIndex + 1;
    if (nextIndex < set.exercises.length) {
      navigation.replace({ name: 'exercise', setId: set.id, exerciseIndex: nextIndex });
    } else {
      navigation.pop();
    }
  }

  return (
    <div>
      <button type="button" onClick={() => navigation.pop()}>
        ← Înapoi
      </button>
      {feedback === null && (
        <>
          {exercise.responseMode === 'multipleChoice' && (
            <MultipleChoice exercise={exercise} onSubmit={handleSubmit} />
          )}
          {exercise.responseMode === 'fillBlank' && <FillBlank exercise={exercise} onSubmit={handleSubmit} />}
          {exercise.responseMode === 'wordBank' && <WordBank exercise={exercise} onSubmit={handleSubmit} />}
          {exercise.responseMode === 'ordering' && <Ordering exercise={exercise} onSubmit={handleSubmit} />}
          {exercise.responseMode === 'errorCorrection' && (
            <ErrorCorrection exercise={exercise} onSubmit={handleSubmit} />
          )}
          {exercise.responseMode === 'openText' && <OpenText exercise={exercise} onSubmit={handleSubmit} />}
        </>
      )}
      {feedback !== null && (
        <div>
          <p>{feedback === 'correct' ? 'Corect!' : 'Mai încearcă data viitoare.'}</p>
          <button type="button" onClick={handleContinue}>
            Continuă
          </button>
        </div>
      )}
    </div>
  );
}
