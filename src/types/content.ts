import type { Exercise } from './exercise';

export interface GuideCharacter {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  avatarAsset: string;
  themeColorHex: string;
}

export interface OrthogramPair {
  id: string;
  formA: string;
  formB: string;
  explanation: string;
  contrastExamples: string[];
}

export interface OrthogramSet {
  schemaVersion: number;
  id: string;
  order: number;
  characterId: string;
  title: string;
  pairs: OrthogramPair[];
  exercises: Exercise[];
}

export interface ManifestEntry {
  id: string;
  order: number;
  characterId: string | null;
  title: string;
  filePath: string | null;
  groupLabel: string;
}

export interface Manifest {
  schemaVersion: number;
  sets: ManifestEntry[];
}
