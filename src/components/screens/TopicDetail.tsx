import { getTopicById } from '../../lib/synant-content-loader';
import { stageLabels } from '../../lib/labels';
import { useNavigation } from '../../lib/navigation';
import { buildProgressKey, loadProgress, getItemProgress, getCompletedExerciseIds } from '../../lib/progress';
import { HomeButton } from '../HomeButton';
import styles from './TopicDetail.module.css';

const UNIT_ID = 'sinonime-antonime';

export function TopicDetail() {
  const navigation = useNavigation();
  const screen = navigation.current;
  if (screen.name !== 'topicDetail') return null;
  const topic = getTopicById(screen.topicId);
  const progressKey = buildProgressKey(UNIT_ID, topic.id);
  const itemProgress = getItemProgress(loadProgress(), progressKey);
  const completedIds = getCompletedExerciseIds(itemProgress);

  return (
    <div className={styles.screen}>
      <button type="button" className={styles.backButton} onClick={() => navigation.pop()}>
        ← Înapoi
      </button>
      <HomeButton />
      <h1 className={styles.title}>{topic.title}</h1>
      <ol className={styles.exerciseList}>
        {topic.exercises.map((exercise, index) => (
          <li key={exercise.id}>
            <button
              type="button"
              className={styles.exerciseButton}
              onClick={() => navigation.push({ name: 'synantExercise', topicId: topic.id, exerciseIndex: index })}
            >
              {stageLabels[exercise.stage]} — {exercise.prompt}
              {completedIds.has(exercise.id) && <span className={styles.completedMark}>✓</span>}
            </button>
          </li>
        ))}
      </ol>
      <h2 className={styles.wordsHeading}>Ce trebuie să știi</h2>
      {topic.focusWords.map((word) => (
        <section key={word.id} className={styles.word}>
          <h3 className={styles.wordTitle}>{word.headword}</h3>
          <p className={styles.meaningNote}>{word.partOfSpeech} — {word.meaningNote}</p>
        </section>
      ))}
    </div>
  );
}
