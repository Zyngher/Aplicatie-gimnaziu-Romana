import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadProgress, markExerciseCompleted, markOpenTextSelfCheck,
  computeSetProgressPercent, getSetProgressPercent,
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
