import { useState } from 'react';
import { getTopicById } from '../../lib/synant-content-loader';
import { buildProgressKey, markExerciseCompleted, markOpenTextSelfCheck } from '../../lib/progress';
import { getCorrectAnswerText } from '../../lib/correctAnswer';
import { useNavigation } from '../../lib/navigation';
import { HomeButton } from '../HomeButton';
import { MarkerButton } from '../MarkerButton';
import { MascotMoment } from '../MascotMoment';
import { MultipleChoice } from '../exercises/MultipleChoice';
import { FillBlank } from '../exercises/FillBlank';
import { WordBank } from '../exercises/WordBank';
import { Ordering } from '../exercises/Ordering';
import { ErrorCorrection } from '../exercises/ErrorCorrection';
import { OpenText } from '../exercises/OpenText';
import styles from './SynAntExerciseScreen.module.css';

const UNIT_ID = 'sinonime-antonime';

export function SynAntExerciseScreen() {
  const navigation = useNavigation();
  const screen = navigation.current;
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [attempt, setAttempt] = useState(0);

  if (screen.name !== 'synantExercise') return null;
  const topic = getTopicById(screen.topicId);
  const exerciseIndex = screen.exerciseIndex;
  const exercise = topic.exercises[exerciseIndex];
  const progressKey = buildProgressKey(UNIT_ID, topic.id);

  function handleSubmit(ok: boolean) {
    if (exercise.responseMode === 'openText') {
      markOpenTextSelfCheck(progressKey, exercise.id, ok);
    } else if (ok) {
      markExerciseCompleted(progressKey, exercise.id);
    }
    setFeedback(ok ? 'correct' : 'incorrect');
  }

  function handleRetry() {
    setFeedback(null);
    setAttempt((a) => a + 1);
  }

  function handleContinue() {
    setFeedback(null);
    const nextIndex = exerciseIndex + 1;
    if (nextIndex < topic.exercises.length) {
      navigation.replace({ name: 'synantExercise', topicId: topic.id, exerciseIndex: nextIndex });
    } else {
      navigation.replace({ name: 'topicComplete', topicId: topic.id });
    }
  }

  const correctAnswerText = getCorrectAnswerText(exercise);
  const exerciseKey = `${exercise.id}-${attempt}`;

  return (
    <div className={styles.screen}>
      <button type="button" className={styles.backButton} onClick={() => navigation.pop()}>
        ← Înapoi
      </button>
      <HomeButton />
      <div className={styles.mascotSlot}>
        <MascotMoment variant={feedback === 'correct' ? 'ras' : 'idle'} size="companion" />
      </div>
      <p className={styles.progress}>
        Exercițiul {exerciseIndex + 1} din {topic.exercises.length}
      </p>
      {exercise.responseMode === 'multipleChoice' && (
        <MultipleChoice key={exerciseKey} exercise={exercise} onSubmit={handleSubmit} />
      )}
      {exercise.responseMode === 'fillBlank' && (
        <FillBlank key={exerciseKey} exercise={exercise} onSubmit={handleSubmit} />
      )}
      {exercise.responseMode === 'wordBank' && (
        <WordBank key={exerciseKey} exercise={exercise} onSubmit={handleSubmit} />
      )}
      {exercise.responseMode === 'ordering' && (
        <Ordering key={exerciseKey} exercise={exercise} onSubmit={handleSubmit} />
      )}
      {exercise.responseMode === 'errorCorrection' && (
        <ErrorCorrection key={exerciseKey} exercise={exercise} onSubmit={handleSubmit} />
      )}
      {exercise.responseMode === 'openText' && (
        <OpenText key={exerciseKey} exercise={exercise} onSubmit={handleSubmit} />
      )}
      {feedback !== null && (
        <div>
          <p className={feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect}>
            {feedback === 'correct'
              ? 'Corect!'
              : 'Nu-i nimic! Mai încearcă o dată, sau treci mai departe.'}
          </p>
          {feedback === 'incorrect' && correctAnswerText && (
            <p className={styles.correctAnswerHint}>{correctAnswerText}</p>
          )}
          {feedback === 'incorrect' && (
            <button type="button" className={styles.retryButton} onClick={handleRetry}>
              Încearcă din nou
            </button>
          )}
          <MarkerButton
            color="var(--marker-ortograme)"
            className={styles.continueButton}
            onClick={handleContinue}
          >
            Continuă
          </MarkerButton>
        </div>
      )}
    </div>
  );
}
