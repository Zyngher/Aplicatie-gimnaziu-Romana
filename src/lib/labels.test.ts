import { describe, it, expect } from 'vitest';
import { stageLabels, countPhrase } from './labels';

describe('countPhrase', () => {
  it('pune "de" dupa numerele terminate in 20-99 sau 00, ca in romana corecta', () => {
    expect(countPhrase(20, 'seturi')).toBe('20 de seturi');
    expect(countPhrase(21, 'seturi')).toBe('21 de seturi');
    expect(countPhrase(100, 'seturi')).toBe('100 de seturi');
    expect(countPhrase(120, 'seturi')).toBe('120 de seturi');
  });

  it('nu pune "de" dupa numerele sub 20 sau terminate in 01-19', () => {
    expect(countPhrase(2, 'seturi')).toBe('2 seturi');
    expect(countPhrase(19, 'seturi')).toBe('19 seturi');
    expect(countPhrase(101, 'seturi')).toBe('101 seturi');
    expect(countPhrase(119, 'seturi')).toBe('119 seturi');
  });
});

describe('stageLabels', () => {
  it('are o etichetă românească pentru fiecare PedagogicalStage', () => {
    const expected = ['explanation', 'example', 'guided', 'independent', 'transfer', 'review'];
    expected.forEach((stage) => {
      expect(stageLabels[stage as keyof typeof stageLabels]).toBeTruthy();
      expect(stageLabels[stage as keyof typeof stageLabels]).not.toBe(stage);
    });
  });

  it('conține exact etichetele așteptate', () => {
    expect(stageLabels.guided).toBe('Ghidat');
    expect(stageLabels.independent).toBe('Independent');
    expect(stageLabels.transfer).toBe('Aplică');
    expect(stageLabels.review).toBe('Recapitulare');
  });
});
