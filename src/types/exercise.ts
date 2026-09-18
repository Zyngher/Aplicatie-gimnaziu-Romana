export type PedagogicalStage =
  | 'explanation' | 'example' | 'guided' | 'independent' | 'transfer' | 'review';

export type ResponseMode =
  | 'multipleChoice' | 'fillBlank' | 'wordBank' | 'ordering' | 'errorCorrection' | 'openText';

export interface MultipleChoiceResponse { text: string; options: string[]; correctIndices: number[]; }
export interface FillBlankResponse { text: string; correctAnswers: string[]; }
export interface WordBankItem { id: string; word: string; }
export interface WordBankBlankSpec { marker: string; correctWordId: string; }
export interface WordBankResponse { text: string; bank: WordBankItem[]; blanks: WordBankBlankSpec[]; }
export interface OrderingResponse { items: string[]; correctOrder: number[]; }
export interface ErrorCorrectionResponse {
  tokens: string[]; errorTokenIndex: number; correctToken: string; explanation: string;
}
export interface OpenTextResponse { instructions: string; modelAnswer: string; selfCheckCriteria: string[]; }

interface ExerciseBase {
  id: string;
  stage: PedagogicalStage;
  difficulty: 1 | 2 | 3;
  prompt: string;
  theme?: string;
  targetIds: string[];
}

export type Exercise =
  | (ExerciseBase & { responseMode: 'multipleChoice'; response: MultipleChoiceResponse })
  | (ExerciseBase & { responseMode: 'fillBlank'; response: FillBlankResponse })
  | (ExerciseBase & { responseMode: 'wordBank'; response: WordBankResponse })
  | (ExerciseBase & { responseMode: 'ordering'; response: OrderingResponse })
  | (ExerciseBase & { responseMode: 'errorCorrection'; response: ErrorCorrectionResponse })
  | (ExerciseBase & { responseMode: 'openText'; response: OpenTextResponse });

// Testata (exercise.test.ts), inca neconsumata de nicio componenta de productie — infrastructura
// intentionata pentru un eventual UI care distinge vizual modurile auto-corectate de cele cu
// auto-evaluare (ex. o iconita/eticheta pe SetDetail), nu cod mort. Acelasi tratament ca
// getErrorLog (errorLog.ts) — vezi C-arch3, fix-cod-report.md, 2026-09-16.
export function isAutoCorrected(mode: ResponseMode): boolean {
  return mode !== 'openText';
}
