import { describe, it, expect } from 'vitest';
import { getManifest, getCharacterById, getSetById } from './content-loader';

describe('content-loader', () => {
  it('getManifest returnează toate seturile din manifest, ordonate', () => {
    // Nu hardcoda numărul de seturi aici — a devenit deja stale o dată (20 → 21 la 2026-09-30,
    // vezi comparatie-toate-exercitiile.md). Verifică ordinea, nu un total fix.
    const manifest = getManifest();
    expect(manifest.sets.length).toBeGreaterThan(0);
    expect(manifest.sets[0].order).toBe(1);
    expect(manifest.sets[manifest.sets.length - 1].order).toBe(manifest.sets.length);
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
