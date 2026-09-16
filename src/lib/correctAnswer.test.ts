import { describe, it, expect } from 'vitest';
import { getCorrectAnswerText } from './correctAnswer';
import type { Exercise } from '../types/exercise';

const base = {
  id: 'ex-1',
  stage: 'guided' as const,
  difficulty: 1 as const,
  prompt: 'Prompt.',
  targetIds: ['og-x'],
};

describe('getCorrectAnswerText — A1: text afișabil cu răspunsul corect, pentru panoul de feedback', () => {
  it('multipleChoice cu un singur răspuns corect: "Răspunsul corect: <opțiune>"', () => {
    const exercise: Exercise = {
      ...base,
      responseMode: 'multipleChoice',
      response: { text: 't', options: ['sa', 's-a'], correctIndices: [1] },
    };
    expect(getCorrectAnswerText(exercise)).toBe('Răspunsul corect: s-a');
  });

  it('multipleChoice cu mai multe răspunsuri corecte: "Răspunsurile corecte: ..."', () => {
    const exercise: Exercise = {
      ...base,
      responseMode: 'multipleChoice',
      response: { text: 't', options: ['a', 'b', 'c'], correctIndices: [0, 2] },
    };
    expect(getCorrectAnswerText(exercise)).toBe('Răspunsurile corecte: a, c');
  });

  it('fillBlank: "Răspunsul corect: <primul răspuns acceptat>"', () => {
    const exercise: Exercise = {
      ...base,
      responseMode: 'fillBlank',
      response: { text: 't', correctAnswers: ['ia', 'Ia'] },
    };
    expect(getCorrectAnswerText(exercise)).toBe('Răspunsul corect: ia');
  });

  it('wordBank cu un singur spațiu: "Răspunsul corect: <cuvânt>"', () => {
    const exercise: Exercise = {
      ...base,
      responseMode: 'wordBank',
      response: {
        text: 't {{b1}}',
        bank: [{ id: 'wb-iau', word: 'iau' }],
        blanks: [{ marker: 'b1', correctWordId: 'wb-iau' }],
      },
    };
    expect(getCorrectAnswerText(exercise)).toBe('Răspunsul corect: iau');
  });

  it('wordBank cu mai multe spații: "Răspunsurile corecte: ..." în ordinea blanks', () => {
    const exercise: Exercise = {
      ...base,
      responseMode: 'wordBank',
      response: {
        text: 't {{b1}} {{b2}}',
        bank: [
          { id: 'wb-iau', word: 'iau' },
          { id: 'wb-sa', word: 'sa' },
        ],
        blanks: [
          { marker: 'b1', correctWordId: 'wb-iau' },
          { marker: 'b2', correctWordId: 'wb-sa' },
        ],
      },
    };
    expect(getCorrectAnswerText(exercise)).toBe('Răspunsurile corecte: iau, sa');
  });

  it('ordering: "Ordinea corectă: ..." folosind correctOrder, nu ordinea curentă din items', () => {
    const exercise: Exercise = {
      ...base,
      responseMode: 'ordering',
      response: { items: ['s-a', 'Filmul', 'terminat', 'deja'], correctOrder: [1, 0, 2, 3] },
    };
    expect(getCorrectAnswerText(exercise)).toBe('Ordinea corectă: Filmul s-a terminat deja');
  });

  it('errorCorrection: null (își afișează deja propria explicație, în componentă)', () => {
    const exercise: Exercise = {
      ...base,
      responseMode: 'errorCorrection',
      response: { tokens: ['a', 'b'], errorTokenIndex: 0, correctToken: 'a', explanation: 'exp' },
    };
    expect(getCorrectAnswerText(exercise)).toBeNull();
  });

  it('openText: null (nu are un răspuns unic corect — e autoevaluat de elev)', () => {
    const exercise: Exercise = {
      ...base,
      responseMode: 'openText',
      response: { instructions: 'i', modelAnswer: 'm', selfCheckCriteria: ['c'] },
    };
    expect(getCorrectAnswerText(exercise)).toBeNull();
  });
});
