import { describe, it, expect } from 'vitest';
import { isAutoCorrected } from './exercise';

describe('isAutoCorrected', () => {
  it('returnează false doar pentru openText', () => {
    expect(isAutoCorrected('openText')).toBe(false);
  });

  it('returnează true pentru toate celelalte moduri', () => {
    const rest: Array<Parameters<typeof isAutoCorrected>[0]> = [
      'multipleChoice', 'fillBlank', 'wordBank', 'ordering', 'errorCorrection',
    ];
    rest.forEach((mode) => expect(isAutoCorrected(mode)).toBe(true));
  });
});
