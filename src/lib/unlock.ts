export function isSetUnlocked(
  index: number,
  previousSetPercent: number | null,
  threshold = 80,
): boolean {
  if (index === 0) return true;
  if (previousSetPercent === null) return false;
  return previousSetPercent >= threshold;
}

export function isIndexModeActive(
  percentages: Array<number | null>,
  threshold = 80,
): boolean {
  const authored = percentages.filter((p): p is number => p !== null);
  if (authored.length === 0) return false;
  return authored.every((p) => p >= threshold);
}
