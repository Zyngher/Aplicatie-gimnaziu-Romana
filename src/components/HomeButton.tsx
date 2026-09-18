import { useNavigation } from '../lib/navigation';
import styles from './HomeButton.module.css';

export function HomeButton() {
  const navigation = useNavigation();
  return (
    <button type="button" className={styles.button} onClick={() => navigation.goHome()}>
      Acasă
    </button>
  );
}
