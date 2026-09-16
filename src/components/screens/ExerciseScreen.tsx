import { useState } from 'react';
import { getSetById } from '../../lib/content-loader';
import { buildProgressKey, markExerciseCompleted, markOpenTextSelfCheck } from '../../lib/progress';
import { getCorrectAnswerText } from '../../lib/correctAnswer';
import { useNavigation } from '../../lib/navigation';
import { MultipleChoice } from '../exercises/MultipleChoice';
import { FillBlank } from '../exercises/FillBlank';
import { WordBank } from '../exercises/WordBank';
import { Ordering } from '../exercises/Ordering';
import { ErrorCorrection } from '../exercises/ErrorCorrection';
import { OpenText } from '../exercises/OpenText';
import styles from './ExerciseScreen.module.css';

const UNIT_ID = 'ortograme';

export function ExerciseScreen() {
  const navigation = useNavigation();
  const screen = navigation.current;
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  if (screen.name !== 'exercise') return null;
  const set = getSetById(screen.setId);
  const exerciseIndex = screen.exerciseIndex;
  const exercise = set.exercises[exerciseIndex];
  const progressKey = buildProgressKey(UNIT_ID, set.id);

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

  const correctAnswerText = getCorrectAnswerText(exercise);

  return (
    <div className={styles.screen}>
      <button type="button" onClick={() => navigation.pop()}>
        ← Înapoi
      </button>
      <p className={styles.progress}>
        Exercițiul {exerciseIndex + 1} din {set.exercises.length}
      </p>
      {exercise.responseMode === 'multipleChoice' && (
        <MultipleChoice key={exercise.id} exercise={exercise} onSubmit={handleSubmit} />
      )}
      {exercise.responseMode === 'fillBlank' && (
        <FillBlank key={exercise.id} exercise={exercise} onSubmit={handleSubmit} />
      )}
      {exercise.responseMode === 'wordBank' && (
        <WordBank key={exercise.id} exercise={exercise} onSubmit={handleSubmit} />
      )}
      {exercise.responseMode === 'ordering' && (
        <Ordering key={exercise.id} exercise={exercise} onSubmit={handleSubmit} />
      )}
      {exercise.responseMode === 'errorCorrection' && (
        <ErrorCorrection key={exercise.id} exercise={exercise} onSubmit={handleSubmit} />
      )}
      {exercise.responseMode === 'openText' && (
        <OpenText key={exercise.id} exercise={exercise} onSubmit={handleSubmit} />
      )}
      {feedback !== null && (
        <div>
          <p className={feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect}>
            {feedback === 'correct'
              ? 'Corect!'
              : 'Nu-i nimic! Mergem mai departe — vei exersa din nou acest tip de exercițiu.'}
          </p>
          {feedback === 'incorrect' && correctAnswerText && (
            <p className={styles.correctAnswerHint}>{correctAnswerText}</p>
          )}
          <button type="button" className={styles.continueButton} onClick={handleContinue}>
            Continuă
          </button>
        </div>
      )}
    </div>
  );
}
