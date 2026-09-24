import { getTopicById } from '../../lib/synant-content-loader';
import { buildProgressKey, getSetProgressPercent } from '../../lib/progress';
import { useNavigation } from '../../lib/navigation';
import { HomeButton } from '../HomeButton';
import { MascotMoment } from '../MascotMoment';
import { MarkerButton } from '../MarkerButton';
import styles from './TopicComplete.module.css';

const UNIT_ID = 'sinonime-antonime';

export function TopicComplete() {
  const navigation = useNavigation();
  const screen = navigation.current;
  if (screen.name !== 'topicComplete') return null;
  const topic = getTopicById(screen.topicId);
  const percent = getSetProgressPercent(buildProgressKey(UNIT_ID, topic.id), topic.exercises.length);

  function handleBackToTraseu() {
    navigation.pop();
    navigation.pop();
  }

  return (
    <div className={styles.screen}>
      <HomeButton />
      <MascotMoment variant="sarbatorire" size="hero" />
      <h1 className={styles.title}>Ai terminat tema!</h1>
      <p className={styles.percent}>{percent}% completat</p>
      <div className={styles.stamp}>Bravo!</div>
      <MarkerButton color="var(--marker-ortograme)" onClick={handleBackToTraseu}>
        Înapoi la traseu
      </MarkerButton>
    </div>
  );
}
