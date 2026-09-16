import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadProgress, getItemProgress, markExerciseCompleted, markOpenTextSelfCheck,
  computeSetProgressPercent, getSetProgressPercent, buildProgressKey,
} from './progress';
import type { ItemProgress } from '../types/progress';

const KEY = 'ortograme:set-06-sa-sau-ia-iau';

beforeEach(() => {
  window.localStorage.clear();
});

describe('loadProgress', () => {
  it('returnează un store gol dacă localStorage e gol', () => {
    expect(loadProgress()).toEqual({});
  });

  it('cade grațios pe store gol dacă localStorage conține JSON invalid', () => {
    window.localStorage.setItem('evaluarea-ro:progress:v1', 'not json');
    expect(loadProgress()).toEqual({});
  });
});

describe('getItemProgress — fix #8: o intrare cu forma gresita nu trebuie sa arunce', () => {
  it('o intrare valida ca JSON dar cu forma gresita (fara completedExerciseIds/openTextSelfMarkedOk) se trateaza ca progres gol', () => {
    window.localStorage.setItem(
      'evaluarea-ro:progress:v1',
      JSON.stringify({ [KEY]: { lastAccessedAt: '2026-01-01T00:00:00.000Z' } }),
    );
    const store = loadProgress();
    expect(() => getItemProgress(store, KEY)).not.toThrow();
    const item = getItemProgress(store, KEY);
    expect(item.completedExerciseIds).toEqual([]);
    expect(item.openTextSelfMarkedOk).toEqual({});
    // trebuie sa poata trece si prin computeSetProgressPercent fara sa arunce
    expect(() => computeSetProgressPercent(item, 6)).not.toThrow();
    expect(computeSetProgressPercent(item, 6)).toBe(0);
  });
});

describe('markExerciseCompleted', () => {
  it('adaugă un id nou, fără duplicate la apel repetat', () => {
    markExerciseCompleted(KEY, 'ex-1');
    markExerciseCompleted(KEY, 'ex-1');
    const store = loadProgress();
    expect(store[KEY].completedExerciseIds).toEqual(['ex-1']);
  });
});

describe('computeSetProgressPercent — fix pentru bug-ul "nu poate ajunge la 100%"', () => {
  it('un exercițiu openText auto-evaluat "Am reușit" contează ca terminat', () => {
    const item: ItemProgress = {
      completedExerciseIds: ['ex-1', 'ex-2'],
      openTextSelfMarkedOk: { 'ex-3': true },
      lastAccessedAt: new Date().toISOString(),
    };
    expect(computeSetProgressPercent(item, 3)).toBe(100);
  });

  it('un openText auto-evaluat "Mai exersez" (false) NU contează ca terminat', () => {
    const item: ItemProgress = {
      completedExerciseIds: ['ex-1', 'ex-2'],
      openTextSelfMarkedOk: { 'ex-3': false },
      lastAccessedAt: new Date().toISOString(),
    };
    expect(computeSetProgressPercent(item, 3)).toBe(67);
  });

  it('nu numără de două ori dacă același id apare și completat și openText', () => {
    const item: ItemProgress = {
      completedExerciseIds: ['ex-1'],
      openTextSelfMarkedOk: { 'ex-1': true },
      lastAccessedAt: new Date().toISOString(),
    };
    expect(computeSetProgressPercent(item, 2)).toBe(50);
  });

  it('returnează 0 pentru un set fără exerciții', () => {
    const item: ItemProgress = { completedExerciseIds: [], openTextSelfMarkedOk: {}, lastAccessedAt: '' };
    expect(computeSetProgressPercent(item, 0)).toBe(0);
  });
});

describe('markOpenTextSelfCheck + getSetProgressPercent (integrare cu localStorage)', () => {
  it('un set cu 1 exercițiu multipleChoice + 1 openText ajunge la 100% după ambele', () => {
    markExerciseCompleted(KEY, 'ex-mcq');
    expect(getSetProgressPercent(KEY, 2)).toBe(50);
    markOpenTextSelfCheck(KEY, 'ex-open', true);
    expect(getSetProgressPercent(KEY, 2)).toBe(100);
  });
});

describe('buildProgressKey — C-arch1: helper centralizat pentru construcția cheii de progres', () => {
  it('construiește cheia din unitId și setId, în formatul așteptat de ProgressStore', () => {
    expect(buildProgressKey('ortograme', 'set-06-sa-sau-ia-iau')).toBe('ortograme:set-06-sa-sau-ia-iau');
  });
});

describe('saveProgress — D1: cade grațios dacă localStorage aruncă la scriere (quotă depășită / mod privat)', () => {
  it('markExerciseCompleted nu aruncă și tot returnează store-ul actualizat în memorie, chiar dacă scrierea în localStorage eșuează', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    try {
      expect(() => markExerciseCompleted(KEY, 'ex-degradare')).not.toThrow();
      const result = markExerciseCompleted(KEY, 'ex-degradare');
      expect(result[KEY].completedExerciseIds).toContain('ex-degradare');
    } finally {
      setItemSpy.mockRestore();
    }
  });

  it('markOpenTextSelfCheck nu aruncă, chiar dacă scrierea în localStorage eșuează', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    try {
      expect(() => markOpenTextSelfCheck(KEY, 'ex-open-degradare', true)).not.toThrow();
    } finally {
      setItemSpy.mockRestore();
    }
  });
});
