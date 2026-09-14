/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    // Limitat la un singur worker: mașina de dezvoltare are RAM foarte puțin liber la un
    // moment dat (verificat: ~530MB liberi dintr-un total de ~8GB), iar pool-ul implicit al
    // Vitest (un fork per nucleu, 8 nuclee aici) l-a saturat, cu worker-e omorâte (exit 134,
    // SIGABRT) și suita raportând "no tests" în loc de rezultate reale. Un singur worker
    // rulează secvențial, mai lent, dar fiabil pe acest mediu.
    fileParallelism: false,
  },
});
