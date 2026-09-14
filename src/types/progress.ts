export interface ItemProgress {
  completedExerciseIds: string[];
  openTextSelfMarkedOk: Record<string, boolean>;
  lastAccessedAt: string;
}

export type ProgressStore = Record<string, ItemProgress>;
