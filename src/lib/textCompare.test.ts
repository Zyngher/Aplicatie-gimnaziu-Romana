import { describe, it, expect } from 'vitest';
import { normalizeAnswer } from './textCompare';

describe('normalizeAnswer', () => {
  it('elimina spatiile de la capete', () => {
    expect(normalizeAnswer('  sa  ')).toBe('sa');
  });

  it('converteste la litere mici', () => {
    expect(normalizeAnswer('SA')).toBe('sa');
  });

  it('combina ambele reguli', () => {
    expect(normalizeAnswer('  S-A  ')).toBe('s-a');
  });
});
