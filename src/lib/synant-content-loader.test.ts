import { describe, it, expect } from 'vitest';
import { getManifest, getTopicById } from './synant-content-loader';

describe('synant-content-loader', () => {
  it('getManifest returnează toate temele, ordonate', () => {
    const manifest = getManifest();
    expect(manifest.topics).toHaveLength(2);
    expect(manifest.topics[0].order).toBe(1);
    expect(manifest.topics[1].order).toBe(2);
  });

  it('getTopicById returnează tema autorată cu toate cuvintele-cheie și exercițiile', () => {
    const topic = getTopicById('topic-01-vremea-vesela');
    expect(topic.focusWords).toHaveLength(2);
    expect(topic.exercises).toHaveLength(6);
  });

  it('getTopicById gaseste si a doua tema', () => {
    const topic = getTopicById('topic-02-zi-si-noapte');
    expect(topic.relation).toBe('antonym');
    expect(topic.exercises).toHaveLength(6);
  });

  it('getTopicById aruncă eroare pentru un id complet inexistent', () => {
    expect(() => getTopicById('topic-inexistent')).toThrow();
  });
});
