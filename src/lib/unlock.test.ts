import { describe, it, expect } from 'vitest';
import { isSetUnlocked, isIndexModeActive } from './unlock';

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
});
