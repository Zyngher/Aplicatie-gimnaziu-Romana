import { describe, it, expect } from 'vitest';
import { isSetUnlocked, isIndexModeActive, computeAuthoredChainUnlockState } from './unlock';

describe('isSetUnlocked — fix #9: regula nu era niciodată testată cu un set blocat real', () => {
  it('primul set (index 0) e mereu deblocat', () => {
    expect(isSetUnlocked(0, null)).toBe(true);
  });

  it('setul următor e blocat dacă precedentul nu are conținut autorat (percent null)', () => {
    expect(isSetUnlocked(1, null)).toBe(false);
  });

  it('setul următor e blocat dacă precedentul e sub prag', () => {
    expect(isSetUnlocked(1, 50)).toBe(false);
  });

  it('setul următor e deblocat dacă precedentul atinge exact pragul', () => {
    expect(isSetUnlocked(1, 80)).toBe(true);
  });

  it('setul următor e deblocat dacă precedentul depășește pragul', () => {
    expect(isSetUnlocked(1, 100)).toBe(true);
  });

  it('acceptă un prag custom', () => {
    expect(isSetUnlocked(1, 60, 50)).toBe(true);
    expect(isSetUnlocked(1, 40, 50)).toBe(false);
  });

  it('setul următor rămâne blocat la 79%, imediat sub pragul de 80', () => {
    expect(isSetUnlocked(1, 79)).toBe(false);
  });

  it('setul următor e deblocat la 81%, imediat peste pragul de 80', () => {
    expect(isSetUnlocked(1, 81)).toBe(true);
  });
});

describe('isIndexModeActive', () => {
  it('e fals dacă niciun set nu are conținut autorat', () => {
    expect(isIndexModeActive([null, null, null])).toBe(false);
  });

  it('e fals dacă orice set autorat e sub prag', () => {
    expect(isIndexModeActive([100, 79, null])).toBe(false);
  });

  it('e adevărat dacă toate seturile autorate ating pragul, indiferent de cele neautorate', () => {
    expect(isIndexModeActive([100, 80, null, null])).toBe(true);
  });

  // D2: OrtogrameHome.tsx apelează isIndexModeActive(percentages, 100) — pragul real de
  // producție pentru modul index liber, distinct de pragul implicit (80) testat mai sus.
  // Cazul pozitiv (100% chiar atins) nu era testat la acest prag exact.
  it('cu pragul real de producție (100), e adevărat când toate seturile autorate ating exact 100%', () => {
    expect(isIndexModeActive([100, 100, null], 100)).toBe(true);
  });

  it('cu pragul real de producție (100), e fals dacă un set autorat e sub 100%, chiar și la 99%', () => {
    expect(isIndexModeActive([100, 99, null], 100)).toBe(false);
  });
});

describe('computeAuthoredChainUnlockState — C-arch2: lanțul de deblocare extras din OrtogrameHome ca funcție pură', () => {
  it('un singur set autorat, la index 0: mereu deblocat', () => {
    expect(computeAuthoredChainUnlockState([{ authored: true, percent: 0 }], false)).toEqual([true]);
  });

  it('al doilea set autorat, apărut DUPĂ un placeholder neautorat, se deblochează pe baza procentului primului set autorat — nu e blocat de placeholder-ul dintre ele', () => {
    const entries = [
      { authored: true, percent: 80 }, // set autorat #1 — la prag, deblochează ce urmează
      { authored: false, percent: null }, // placeholder "conținut în lucru"
      { authored: true, percent: null }, // set autorat #2, neînceput încă
    ];
    expect(computeAuthoredChainUnlockState(entries, false)).toEqual([true, true, true]);
  });

  it('al doilea set autorat, după un placeholder neautorat, rămâne blocat dacă primul set autorat e sub prag — placeholder-ul nu "resetează" lanțul la null', () => {
    const entries = [
      { authored: true, percent: 50 }, // sub pragul de 80
      { authored: false, percent: null },
      { authored: true, percent: null },
    ];
    expect(computeAuthoredChainUnlockState(entries, false)).toEqual([true, false, false]);
  });

  it('în mod index liber (indexModeActive=true), totul e deblocat necondiționat, indiferent de procente', () => {
    const entries = [
      { authored: true, percent: 10 },
      { authored: false, percent: null },
    ];
    expect(computeAuthoredChainUnlockState(entries, true)).toEqual([true, true]);
  });

  it('acceptă un prag custom, la fel ca isSetUnlocked', () => {
    const entries = [
      { authored: true, percent: 60 },
      { authored: true, percent: null },
    ];
    expect(computeAuthoredChainUnlockState(entries, false, 50)).toEqual([true, true]);
    expect(computeAuthoredChainUnlockState(entries, false, 70)).toEqual([true, false]);
  });
});
