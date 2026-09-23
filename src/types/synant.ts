import type { Exercise } from './exercise';

export interface FocusWord {
  id: string;
  headword: string;
  partOfSpeech: string;
  meaningNote: string;
}

export interface SynAntTopic {
  schemaVersion: number;
  id: string;
  order: number;
  level: 'mediu' | 'avansat';
  relation: 'synonym' | 'antonym' | 'mixed';
  title: string;
  focusWords: FocusWord[];
  exercises: Exercise[];
}

export interface SynAntManifestEntry {
  id: string;
  order: number;
  level: 'mediu' | 'avansat';
  relation: 'synonym' | 'antonym' | 'mixed';
  title: string;
  filePath: string | null;
  groupLabel: string;
}

export interface SynAntManifest {
  schemaVersion: number;
  topics: SynAntManifestEntry[];
}
