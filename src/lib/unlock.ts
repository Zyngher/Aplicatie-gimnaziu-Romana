export const UNLOCK_THRESHOLD_PERCENT = 80;

export function isSetUnlocked(
  index: number,
  previousSetPercent: number | null,
  threshold = UNLOCK_THRESHOLD_PERCENT,
): boolean {
  if (index === 0) return true;
  if (previousSetPercent === null) return false;
  return previousSetPercent >= threshold;
}

export function isIndexModeActive(
  percentages: Array<number | null>,
  threshold = UNLOCK_THRESHOLD_PERCENT,
): boolean {
  const authored = percentages.filter((p): p is number => p !== null);
  if (authored.length === 0) return false;
  return authored.every((p) => p >= threshold);
}

export interface AuthoredChainEntry {
  /** Are acest rand din manifest continut autorat propriu (filePath != null)? */
  authored: boolean;
  /** Procentul de progres al setului, sau null daca nu e autorat / nu are progres. */
  percent: number | null;
}

/**
 * Deriva starea de deblocare pentru fiecare rand dintr-un traseu de seturi, in ordine.
 *
 * Regula: doar seturile AUTORATE conteaza ca "set precedent" pentru lantul de deblocare —
 * un rand neautorat ("continut in lucru") nu are progres propriu si e sarit la calculul
 * "procentul setului autorat precedent", altfel un set autorat aflat dupa unul sau mai
 * multe placeholdere neautorate ar fi gresit blocat (procentul precedentului neautorat
 * fiind mereu null). Cand `indexModeActive` e adevarat, totul e deblocat neconditionat.
 */
export function computeAuthoredChainUnlockState(
  entries: AuthoredChainEntry[],
  indexModeActive: boolean,
  threshold = UNLOCK_THRESHOLD_PERCENT,
): boolean[] {
  let authoredIndex = 0;
  let previousAuthoredPercent: number | null = null;
  return entries.map((entry, index) => {
    const unlocked = indexModeActive
      ? true
      : entry.authored
        ? isSetUnlocked(authoredIndex, previousAuthoredPercent, threshold)
        : isSetUnlocked(index, entries[index - 1]?.percent ?? null, threshold);
    if (entry.authored) {
      previousAuthoredPercent = entry.percent;
      authoredIndex += 1;
    }
    return unlocked;
  });
}
