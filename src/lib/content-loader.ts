import manifestData from '../content/ortograme/manifest.json';
import charactersData from '../content/ortograme/characters.json';
import type { Manifest, GuideCharacter, OrthogramSet } from '../types/content';

const manifest = manifestData as Manifest;
const characters = charactersData as GuideCharacter[];

const setModules = import.meta.glob<OrthogramSet>('../content/ortograme/sets/*.json', {
  eager: true,
  import: 'default',
});

const setsById = new Map<string, OrthogramSet>();
for (const set of Object.values(setModules)) {
  setsById.set(set.id, set);
}

export function getManifest(): Manifest {
  return manifest;
}

export function getCharacterById(id: string | null): GuideCharacter | null {
  if (id === null) return null;
  return characters.find((c) => c.id === id) ?? null;
}

export function getSetById(id: string): OrthogramSet {
  const set = setsById.get(id);
  if (!set) throw new Error(`Set necunoscut: ${id}`);
  return set;
}
