import { useNavigation, type Screen } from '../../lib/navigation';
import { MascotMoment } from '../MascotMoment';
import styles from './Home.module.css';

interface UnitInfo {
  id: string;
  title: string;
  subtitle: string;
  active: boolean;
}

const UNITS: UnitInfo[] = [
  { id: 'ortograme', title: 'Ortograme', subtitle: '20 de seturi de exersat', active: true },
  {
    id: 'sinonime-antonime',
    title: 'Sinonime și Antonime',
    subtitle: 'Cuvinte cu înțeles asemănător sau opus',
    active: true,
  },
  { id: 'literatura', title: 'Literatură', subtitle: 'Texte și înțelegerea lor', active: false },
];

const UNIT_SCREENS: Record<string, Screen> = {
  ortograme: { name: 'ortogrameHome' },
  'sinonime-antonime': { name: 'sinonimeAntonimeHome' },
};

export function Home() {
  const navigation = useNavigation();

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dascăl în acțiune</h1>
          <p className={styles.subtitle}>Exersează limba română alături de personajele-ghid, în ritmul tău.</p>
        </div>
        <div className={styles.mascotSlot}>
          <MascotMoment variant="idle" size="companion" />
        </div>
      </div>
      <ul className={styles.unitList}>
        {UNITS.map((unit) => (
          <li key={unit.id}>
            <button
              type="button"
              className={styles.unitButton}
              disabled={!unit.active}
              onClick={() => {
                const target = UNIT_SCREENS[unit.id];
                if (unit.active && target) navigation.push(target);
              }}
            >
              <span className={styles.unitTitle}>{unit.title}</span> — {unit.subtitle}
              {!unit.active && <span className={styles.badge}> (În curând)</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
