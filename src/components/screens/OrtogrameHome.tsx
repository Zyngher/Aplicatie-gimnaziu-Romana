import { useState } from 'react';
import { getManifest, getCharacterById, getSetById } from '../../lib/content-loader';
import { buildProgressKey, getSetProgressPercent } from '../../lib/progress';
import { computeAuthoredChainUnlockState, isIndexModeActive } from '../../lib/unlock';
import { useNavigation } from '../../lib/navigation';
import { HomeButton } from '../HomeButton';
import type { GuideCharacter, ManifestEntry } from '../../types/content';
import styles from './OrtogrameHome.module.css';

const UNIT_ID = 'ortograme';

function characterInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

// avatarAsset nu are neaparat un fisier real livrat (vezi fix #4) — daca imaginea nu se
// incarca, aratam un fallback cu initialele personajului, tintat cu themeColorHex (deja
// autorat, altfel nefolosit — vezi Minor #20 din review).
function CharacterAvatar({ character }: { character: GuideCharacter }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={character.name}
        style={{
          display: 'inline-block',
          width: '2em',
          height: '2em',
          lineHeight: '2em',
          textAlign: 'center',
          borderRadius: '50%',
          backgroundColor: character.themeColorHex,
          color: '#fff',
          fontSize: '0.75em',
          fontWeight: 'bold',
        }}
      >
        {characterInitials(character.name)}
      </span>
    );
  }

  return <img src={character.avatarAsset} alt={character.name} onError={() => setFailed(true)} />;
}

interface EntryWithState {
  entry: ManifestEntry;
  percent: number | null;
  unlocked: boolean;
}

export function OrtogrameHome() {
  const navigation = useNavigation();
  const manifest = getManifest();
  const sortedEntries = [...manifest.sets].sort((a, b) => a.order - b.order);

  const percentages: Array<number | null> = sortedEntries.map((entry) => {
    if (entry.filePath === null) return null;
    const set = getSetById(entry.id);
    return getSetProgressPercent(buildProgressKey(UNIT_ID, entry.id), set.exercises.length);
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
        <h1 className={styles.title}>Ortograme</h1>
        <p className={styles.modeLabel}>{indexMode ? 'Index liber — recapitulare' : 'Traseu'}</p>
      </div>
      {[...groups.entries()].map(([groupLabel, items]) => (
        <section key={groupLabel} className={styles.group}>
          <h2 className={styles.groupTitle}>{groupLabel}</h2>
          <ul className={styles.setList}>
            {items.map(({ entry, percent, unlocked }) => {
              const authored = entry.filePath !== null;
              const character = getCharacterById(entry.characterId);
              const clickable = authored && unlocked;

              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={styles.setButton}
                    disabled={!clickable}
                    onClick={() => {
                      if (clickable) navigation.push({ name: 'setDetail', setId: entry.id });
                    }}
                  >
                    {character && <CharacterAvatar character={character} />}
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
