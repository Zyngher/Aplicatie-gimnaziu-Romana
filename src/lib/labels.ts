import type { PedagogicalStage } from '../types/exercise';

export const stageLabels: Record<PedagogicalStage, string> = {
  explanation: 'Explicație',
  example: 'Exemplu',
  guided: 'Ghidat',
  independent: 'Independent',
  transfer: 'Aplică',
  review: 'Recapitulare',
};
