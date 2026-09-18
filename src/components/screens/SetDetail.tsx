import { getSetById } from '../../lib/content-loader';
import { stageLabels } from '../../lib/labels';
import { useNavigation } from '../../lib/navigation';
import { buildProgressKey, loadProgress, getItemProgress } from '../../lib/progress';
import { HomeButton } from '../HomeButton';
import styles from './SetDetail.module.css';

const UNIT_ID = 'ortograme';

export function SetDetail() {
  const navigation = useNavigation();
  const screen = navigation.current;
  if (screen.name !== 'setDetail') return null;
  const set = getSetById(screen.setId);
  const progressKey = buildProgressKey(UNIT_ID, set.id);
  const itemProgress = getItemProgress(loadProgress(), progressKey);
  const completedIds = new Set([
    ...itemProgress.completedExerciseIds,
    ...Object.entries(itemProgress.openTextSelfMarkedOk)
      .filter(([, ok]) => ok)
      .map(([id]) => id),
  ]);

  return (
    <div className={styles.screen}>
      <button type="button" className={styles.backButton} onClick={() => navigation.pop()}>
        ← Înapoi
      </button>
      <HomeButton />
      <h1 className={styles.title}>{set.title}</h1>
      {set.pairs.map((pair) => (
        <section key={pair.id} className={styles.pair}>
          <h2 className={styles.pairTitle}>
            {pair.formA} / {pair.formB}
          </h2>
          <p className={styles.explanation}>{pair.explanation}</p>
          <ul className={styles.examples}>
            {pair.contrastExamples.map((example) => (
              <li key={example} className={styles.example}>
                {example}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <ol className={styles.exerciseList}>
        {set.exercises.map((exercise, index) => (
          <li key={exercise.id}>
            <button
              type="button"
              className={styles.exerciseButton}
              onClick={() => navigation.push({ name: 'exercise', setId: set.id, exerciseIndex: index })}
            >
              {stageLabels[exercise.stage]} — {exercise.prompt}
              {completedIds.has(exercise.id) && <span className={styles.completedMark}>✓</span>}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
