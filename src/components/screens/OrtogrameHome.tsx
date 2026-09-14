import { getManifest, getCharacterById, getSetById } from '../../lib/content-loader';
import { getSetProgressPercent } from '../../lib/progress';
import { isSetUnlocked, isIndexModeActive } from '../../lib/unlock';
import { useNavigation } from '../../lib/navigation';
import type { ManifestEntry } from '../../types/content';

const UNIT_ID = 'ortograme';

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
    return getSetProgressPercent(`${UNIT_ID}:${entry.id}`, set.exercises.length);
  });

  // Index liber pornește doar la finalizarea completă (100%) a conținutului autorat existent —
  // distinct de pragul de 80% folosit pentru deblocarea nodului următor pe traseu.
  const indexMode = isIndexModeActive(percentages, 100);

  // Lanțul de deblocare pe traseu ține cont doar de seturile autorate: un set neautorat
  // ("conținut în lucru") nu are progres propriu, deci nu poate fi folosit ca "set precedent"
  // pentru un set autorat aflat mai departe în manifest (vezi fix #5 — primul set autorat
  // trebuie să fie mereu deblocat, nu doar primul rând din manifest).
  let authoredIndex = 0;
  let previousAuthoredPercent: number | null = null;
  const withState: EntryWithState[] = sortedEntries.map((entry, index) => {
    const percent = percentages[index];
    const authored = entry.filePath !== null;
    const unlocked = indexMode
      ? true
      : authored
        ? isSetUnlocked(authoredIndex, previousAuthoredPercent)
        : isSetUnlocked(index, percentages[index - 1] ?? null);
    if (authored) {
      previousAuthoredPercent = percent;
      authoredIndex += 1;
    }
    return { entry, percent, unlocked };
  });

  const groups = new Map<string, EntryWithState[]>();
  withState.forEach((item) => {
    const list = groups.get(item.entry.groupLabel) ?? [];
    list.push(item);
    groups.set(item.entry.groupLabel, list);
  });

  return (
    <div>
      <button type="button" onClick={() => navigation.pop()}>
        ← Înapoi
      </button>
      <h1>Ortograme</h1>
      <p>{indexMode ? 'Index liber — recapitulare' : 'Traseu'}</p>
      {[...groups.entries()].map(([groupLabel, items]) => (
        <section key={groupLabel}>
          <h2>{groupLabel}</h2>
          <ul>
            {items.map(({ entry, percent, unlocked }) => {
              const authored = entry.filePath !== null;
              const character = getCharacterById(entry.characterId);
              const clickable = authored && unlocked;

              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => {
                      if (clickable) navigation.push({ name: 'setDetail', setId: entry.id });
                    }}
                  >
                    {character && <img src={character.avatarAsset} alt={character.name} />}
                    {entry.title}
                    {!authored && unlocked && <span> (Conținut în lucru)</span>}
                    {authored && <span> ({percent}%)</span>}
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
