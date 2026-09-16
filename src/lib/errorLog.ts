const ERROR_LOG_KEY = 'evaluarea-ro:error-log:v1';
const MAX_ENTRIES = 50;

export interface ErrorLogEntry {
  message: string;
  stack?: string;
  screen?: string;
  timestamp: string;
}

export function logError(error: Error, screen?: string): void {
  console.error(error);
  try {
    const raw = window.localStorage.getItem(ERROR_LOG_KEY);
    const entries: ErrorLogEntry[] = raw ? JSON.parse(raw) : [];
    entries.push({ message: error.message, stack: error.stack, screen, timestamp: new Date().toISOString() });
    const trimmed = entries.slice(-MAX_ENTRIES);
    window.localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage indisponibil — eroarea a ajuns deja in consola mai sus
  }
}

// Neconsumat momentan de nicio componenta/ecran (doar propriul test) — infrastructura
// intentionala, pregatita pentru un viitor ecran de debug/suport care ar afisa jurnalul
// din localStorage unui adult/dezvoltator. Nu e cod mort: logError() scrie in el la fiecare
// eroare prinsa de ErrorBoundary.
export function getErrorLog(): ErrorLogEntry[] {
  try {
    const raw = window.localStorage.getItem(ERROR_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
