import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logError, getErrorLog } from './errorLog';

beforeEach(() => {
  window.localStorage.clear();
});

describe('logError', () => {
  it('scrie eroarea în jurnalul local', () => {
    logError(new Error('ceva a picat'), 'ExerciseScreen');
    const log = getErrorLog();
    expect(log).toHaveLength(1);
    expect(log[0].message).toBe('ceva a picat');
    expect(log[0].screen).toBe('ExerciseScreen');
  });

  it('plafonează jurnalul la ultimele 50 de intrări', () => {
    for (let i = 0; i < 55; i++) {
      logError(new Error(`eroare ${i}`));
    }
    const log = getErrorLog();
    expect(log).toHaveLength(50);
    expect(log[0].message).toBe('eroare 5');
    expect(log[49].message).toBe('eroare 54');
  });

  it('trimite eroarea și în consolă', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logError(new Error('vizibil in consola'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('getErrorLog', () => {
  it('returnează listă goală dacă nu există jurnal', () => {
    expect(getErrorLog()).toEqual([]);
  });
});
