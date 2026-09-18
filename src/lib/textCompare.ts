/**
 * Normalizeaza un raspuns scris de elev inainte de comparatie — elimina spatiile de la capete
 * si converteste la litere mici, ca "Sa", " sa ", "SA" sa fie toate tratate identic. Centralizat
 * aici (nu duplicat per componenta) ca sa nu diverga silentios regula de comparatie intre
 * FillBlank si ErrorCorrection.
 */
export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase();
}
