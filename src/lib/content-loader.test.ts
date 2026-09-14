import { describe, it, expect } from 'vitest';
import { getManifest, getCharacterById, getSetById } from './content-loader';

describe('content-loader', () => {
  it('getManifest returnează toate cele 20 de seturi, ordonate', () => {
    const manifest = getManifest();
    expect(manifest.sets).toHaveLength(20);
    expect(manifest.sets[0].order).toBe(1);
    expect(manifest.sets[19].order).toBe(20);
  });

  it('getCharacterById returnează null pentru id null', () => {
    expect(getCharacterById(null)).toBeNull();
  });

  it('getCharacterById găsește un personaj real', () => {
    const character = getCharacterById('char-mira');
    expect(character?.name).toBe('Mira');
  });

  it('getSetById returnează setul autorat cu toate exercițiile', () => {
    const set = getSetById('set-06-sa-sau-ia-iau');
    expect(set.pairs).toHaveLength(4);
    expect(set.exercises).toHaveLength(6);
  });

  it('getSetById aruncă eroare pentru un id complet inexistent', () => {
    expect(() => getSetById('set-inexistent')).toThrow();
  });
});
