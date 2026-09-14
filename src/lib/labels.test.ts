import { describe, it, expect } from 'vitest';
import { stageLabels } from './labels';

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
    expect(stageLabels.transfer).toBe('Transfer');
    expect(stageLabels.review).toBe('Recapitulare');
  });
});
