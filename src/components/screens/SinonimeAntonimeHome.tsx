import { getManifest, getTopicById } from '../../lib/synant-content-loader';
import { buildProgressKey, getSetProgressPercent } from '../../lib/progress';
import { computeAuthoredChainUnlockState, isIndexModeActive } from '../../lib/unlock';
import { useNavigation } from '../../lib/navigation';
import { HomeButton } from '../HomeButton';
import type { SynAntManifestEntry } from '../../types/synant';
import styles from './SinonimeAntonimeHome.module.css';

const UNIT_ID = 'sinonime-antonime';

interface EntryWithState {
  entry: SynAntManifestEntry;
  percent: number | null;
  unlocked: boolean;
}

export function SinonimeAntonimeHome() {
  const navigation = useNavigation();
  const manifest = getManifest();
  const sortedEntries = [...manifest.topics].sort((a, b) => a.order - b.order);

  const percentages: Array<number | null> = sortedEntries.map((entry) => {
    if (entry.filePath === null) return null;
    const topic = getTopicById(entry.id);
    return getSetProgressPercent(buildProgressKey(UNIT_ID, entry.id), topic.exercises.length);
  });

  // Index liber pornește doar la finalizarea completă (100%) a conținutului autorat existent —
  // distinct de pragul de 80% folosit pentru deblocarea nodului următor pe traseu.
  const indexMode = isIndexModeActive(percentages, 100);

  // Lanțul de deblocare pe traseu ține cont doar de seturile autorate: un set neautorat
  // ("conținut în lucru") nu are progres propriu, deci nu poate fi folosit ca "set precedent"
  // pentru un set autorat aflat mai departe în manifest (vezi fix #5 — primul set autorat
  // trebuie să fie mereu deblocat, nu doar primul rând din manifest). Logica propriu-zisă
  // e o funcție pură, testată separat, în lib/unlock.ts.
  const unlockedStates = computeAuthoredChainUnlockState(
    sortedEntries.map((entry, index) => ({ authored: entry.filePath !== null, percent: percentages[index] })),
    indexMode,
  );
  const withState: EntryWithState[] = sortedEntries.map((entry, index) => ({
    entry,
    percent: percentages[index],
    unlocked: unlockedStates[index],
  }));

  const groups = new Map<string, EntryWithState[]>();
  withState.forEach((item) => {
    const list = groups.get(item.entry.groupLabel) ?? [];
    list.push(item);
    groups.set(item.entry.groupLabel, list);
  });

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button type="button" className={styles.backButton} onClick={() => navigation.pop()}>
          ← Înapoi
        </button>
        <HomeButton />
        <h1 className={styles.title}>Sinonime și Antonime</h1>
        <p className={styles.modeLabel}>
          {indexMode
            ? 'Index liber — recapitulare: ai terminat tot, acum poți relua orice temă.'
            : 'Traseu: temele se deblochează pe rând, pe măsură ce avansezi.'}
        </p>
      </div>
      {[...groups.entries()].map(([groupLabel, items]) => (
        <section key={groupLabel} className={styles.group}>
          <h2 className={styles.groupTitle}>{groupLabel}</h2>
          <ul className={styles.topicList}>
            {items.map(({ entry, percent, unlocked }) => {
              const authored = entry.filePath !== null;
              const clickable = authored && unlocked;

              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={styles.topicButton}
                    disabled={!clickable}
                    onClick={() => {
                      if (clickable) navigation.push({ name: 'topicDetail', topicId: entry.id });
                    }}
                  >
                    {entry.title}
                    {!authored && <span className={styles.workInProgress}> (Conținut în lucru)</span>}
                    {authored && <span className={styles.percent}> ({percent}%)</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
