import type { ItemProgress, ProgressStore } from '../types/progress';

const STORAGE_KEY = 'evaluarea-ro:progress:v1';

/**
 * Construieste cheia canonica de progres pentru o pereche unitate/set, folosita atat ca
 * cheie in ProgressStore cat si la apelurile getSetProgressPercent. Centralizat aici (nu
 * duplicat in fiecare ecran) ca sa nu poata aparea un format divergent (alt separator, alta
 * ordine) care ar fragmenta silentios progresul unui elev intre chei diferite pentru acelasi set.
 */
export function buildProgressKey(unitId: string, setId: string): string {
  return `${unitId}:${setId}`;
}

function emptyItemProgress(): ItemProgress {
  return { completedExerciseIds: [], openTextSelfMarkedOk: {}, lastAccessedAt: new Date().toISOString() };
}

export function loadProgress(): ProgressStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as ProgressStore;
  } catch {
    return {};
  }
}

export function saveProgress(store: ProgressStore): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage indisponibil (mod privat etc.) — progresul rămâne doar în memorie pentru sesiunea curentă
  }
}

export function getItemProgress(store: ProgressStore, key: string): ItemProgress {
  const raw = store[key];
  if (!raw) return emptyItemProgress();
  // Validare de formă: o intrare scrisă parțial (ex. o salvare întreruptă la depășirea
  // cotei) sau dintr-o versiune de schemă viitoare poate exista în localStorage fără
  // câmpurile așteptate. Fără verificarea asta, computeSetProgressPercent aruncă la
  // Object.entries(undefined) și aplicația se blochează fără nicio cale de recuperare
  // (vezi fix #8 din review-ul final).
  if (!Array.isArray(raw.completedExerciseIds)) return emptyItemProgress();
  if (typeof raw.openTextSelfMarkedOk !== 'object' || raw.openTextSelfMarkedOk === null) {
    return emptyItemProgress();
  }
  return raw;
}

export function markExerciseCompleted(key: string, exerciseId: string): ProgressStore {
  const store = loadProgress();
  const current = getItemProgress(store, key);
  const completedExerciseIds = current.completedExerciseIds.includes(exerciseId)
    ? current.completedExerciseIds
    : [...current.completedExerciseIds, exerciseId];
  const next: ProgressStore = {
    ...store,
    [key]: { ...current, completedExerciseIds, lastAccessedAt: new Date().toISOString() },
  };
  saveProgress(next);
  return next;
}

export function markOpenTextSelfCheck(key: string, exerciseId: string, ok: boolean): ProgressStore {
  const store = loadProgress();
  const current = getItemProgress(store, key);
  const next: ProgressStore = {
    ...store,
    [key]: {
      ...current,
      openTextSelfMarkedOk: { ...current.openTextSelfMarkedOk, [exerciseId]: ok },
      lastAccessedAt: new Date().toISOString(),
    },
  };
  saveProgress(next);
  return next;
}

export function computeSetProgressPercent(item: ItemProgress, totalExerciseCount: number): number {
  if (totalExerciseCount <= 0) return 0;
  const openTextOkIds = Object.entries(item.openTextSelfMarkedOk)
    .filter(([, ok]) => ok)
    .map(([id]) => id);
  const allCompletedIds = new Set([...item.completedExerciseIds, ...openTextOkIds]);
  return Math.round((allCompletedIds.size / totalExerciseCount) * 100);
}

export function getSetProgressPercent(key: string, totalExerciseCount: number): number {
  const store = loadProgress();
  const item = getItemProgress(store, key);
  return computeSetProgressPercent(item, totalExerciseCount);
}
