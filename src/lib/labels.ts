import type { PedagogicalStage } from '../types/exercise';

export const stageLabels: Record<PedagogicalStage, string> = {
  explanation: 'Explicație',
  example: 'Exemplu',
  guided: 'Ghidat',
  independent: 'Independent',
  transfer: 'Aplică',
  review: 'Recapitulare',
};

/**
 * Numeral + substantiv la plural, cu "de" acolo unde gramatica romaneasca il cere: numerele ale
 * caror ultime doua cifre sunt 00 sau 20-99 primesc "de" ("20 de seturi", "21 de seturi",
 * "100 de seturi"); cele sub 20 sau terminate in 01-19 nu ("19 seturi", "101 seturi").
 * Folosit pentru numere calculate din continut, ca textul sa nu ramana in urma (vezi Home).
 */
export function countPhrase(count: number, pluralNoun: string): string {
  const lastTwo = count % 100;
  const needsDe = count >= 20 && (lastTwo === 0 || lastTwo >= 20);
  return needsDe ? `${count} de ${pluralNoun}` : `${count} ${pluralNoun}`;
}
