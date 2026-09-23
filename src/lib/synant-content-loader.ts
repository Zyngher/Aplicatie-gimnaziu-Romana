import manifestData from '../content/sinonime-antonime/manifest.json';
import type { SynAntManifest, SynAntTopic } from '../types/synant';

const manifest = manifestData as SynAntManifest;

const topicModules = import.meta.glob<SynAntTopic>('../content/sinonime-antonime/topics/*.json', {
  eager: true,
  import: 'default',
});

const topicsById = new Map<string, SynAntTopic>();
for (const topic of Object.values(topicModules)) {
  topicsById.set(topic.id, topic);
}

export function getManifest(): SynAntManifest {
  return manifest;
}

export function getTopicById(id: string): SynAntTopic {
  const topic = topicsById.get(id);
  if (!topic) throw new Error(`Temă necunoscută: ${id}`);
  return topic;
}
