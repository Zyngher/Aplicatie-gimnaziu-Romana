# EvaluareaRO — Ortograme (web)

Aplicație web pentru exersarea limbii române, gândită pentru copii de **10-14 ani**. Acest
repo conține track-ul **web** (React + Vite + TypeScript) al proiectului EvaluareaRO, cu scopul
curent limitat la **Unitatea 1 — Ortograme**: perechi de forme care se confundă des în scris
(„sa"/„s-a", „ia"/„i-a" etc.), predate prin exerciții scurte și auto-corectate.

Nu există backend pentru conținut — totul e static, bundlat în aplicație. Progresul elevului
(exerciții terminate, auto-evaluări) se ține doar local, în `localStorage` (fără PII, fără cont).

## Pornire rapidă

```bash
npm install
npm run dev       # server de dezvoltare (Vite), cu HMR
```

Alte comenzi utile:

```bash
npm test          # rulează suita de teste (Vitest + Testing Library)
npm run typecheck # tsc -b, fără emitere de fișiere
npm run lint      # oxlint
npm run build     # typecheck + build de producție (tsc -b && vite build)
npm run preview   # servește local build-ul de producție
npm audit         # verificare dependențe
```

## Structura conținutului

Fiecare „set" e o grupă de exerciții în jurul unei perechi/unor perechi de forme ortografice.
Sursa de adevăr pentru ce seturi există (autorate sau nu) e manifestul:

- `src/content/ortograme/manifest.json` — lista completă a seturilor (ordine, titlu, grupă,
  personaj-ghid, și `filePath` către fișierul JSON al setului — `null` dacă setul nu e încă
  autorat, caz în care apare în interfață ca „Conținut în lucru").
- `src/content/ortograme/sets/*.json` — câte un fișier JSON per set autorat, cu perechile
  ortografice (`pairs`) și exercițiile propriu-zise (`exercises`). În acest moment e autorat
  un singur set: `set-06-sa-sau-ia-iau.json`.
- `src/content/ortograme/characters.json` — personajele-ghid asociate seturilor (nume, avatar,
  culoare temă); dacă imaginea de avatar lipsește, interfața arată automat un fallback cu
  inițialele personajului.

Exercițiile suportă 6 moduri de răspuns (`responseMode`): `multipleChoice`, `fillBlank`,
`wordBank`, `ordering`, `errorCorrection`, `openText` — tipate ca uniune discriminată în
`src/types/exercise.ts`, cu câte o componentă dedicată în `src/components/exercises/`.

## Teste

Fiecare modul de logică/componentă are un fișier `.test.ts(x)` colocat. Nu există teste
end-to-end (Playwright/Cypress) — doar teste unitare și de integrare la nivel de componentă,
rulate cu Vitest + React Testing Library.
