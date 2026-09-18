import { getSetById } from '../../lib/content-loader';
import { buildProgressKey, getSetProgressPercent } from '../../lib/progress';
import { useNavigation } from '../../lib/navigation';
import { HomeButton } from '../HomeButton';
import { MascotMoment } from '../MascotMoment';
import { MarkerButton } from '../MarkerButton';
import styles from './SetComplete.module.css';

const UNIT_ID = 'ortograme';

export function SetComplete() {
  const navigation = useNavigation();
  const screen = navigation.current;
  if (screen.name !== 'setComplete') return null;
  const set = getSetById(screen.setId);
  const percent = getSetProgressPercent(buildProgressKey(UNIT_ID, set.id), set.exercises.length);

  function handleBackToTraseu() {
    navigation.pop();
    navigation.pop();
  }

  return (
    <div className={styles.screen}>
      <HomeButton />
      <MascotMoment variant="sarbatorire" size="hero" />
      <h1 className={styles.title}>Ai terminat setul!</h1>
      <p className={styles.percent}>{percent}% completat</p>
      <div className={styles.stamp}>Bravo!</div>
      <MarkerButton color="var(--marker-ortograme)" onClick={handleBackToTraseu}>
        Înapoi la traseu
      </MarkerButton>
    </div>
  );
}
