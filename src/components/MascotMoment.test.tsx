import { describe, it, expect, vi, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { MascotMoment } from './MascotMoment';
import styles from './MascotMoment.module.css';

const RAS_SEGMENT_START = 4.6;
const SARBATORIRE_SEGMENT_START = 0.3;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MascotMoment', () => {
  it('nu cauta in video inainte de metadate; cauta o singura data dupa, chiar sub StrictMode', () => {
    // Regresie (2026-10-01): pe SetComplete, mascota hero aparea ca un dreptunghi negru in dev —
    // efectul cauta (currentTime = start) imediat la montare, pe un video inca neincarcat, iar
    // StrictMode ruleaza efectul de doua ori: doua cautari pe un video fara metadate => Chrome
    // raporta MEDIA_ERR_DECODE. In productie (efect rulat o data) mergea doar din noroc.
    vi.spyOn(HTMLMediaElement.prototype, 'readyState', 'get').mockReturnValue(0);
    const seek = vi.spyOn(HTMLMediaElement.prototype, 'currentTime', 'set');

    const { container } = render(
      <StrictMode>
        <MascotMoment variant="sarbatorire" size="hero" />
      </StrictMode>,
    );
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(seek).not.toHaveBeenCalled();

    video.dispatchEvent(new Event('loadedmetadata'));
    expect(seek).toHaveBeenCalledTimes(1);
    expect(seek).toHaveBeenCalledWith(SARBATORIRE_SEGMENT_START);
  });

  it('randeaza un element video cu sursa corecta, mut', () => {
    const { container } = render(<MascotMoment variant="idle" size="companion" />);
    const video = container.querySelector('video');
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute('src', '/mascots/matilda-momente.mp4');
    expect((video as HTMLVideoElement).muted).toBe(true);
  });

  it('foloseste clasa de container "companion" cand size="companion"', () => {
    const { container } = render(<MascotMoment variant="idle" size="companion" />);
    expect(container.firstElementChild).toHaveClass(styles.companion);
  });

  it('foloseste clasa de container "hero" cand size="hero"', () => {
    const { container } = render(<MascotMoment variant="sarbatorire" size="hero" />);
    expect(container.firstElementChild).toHaveClass(styles.hero);
  });

  it('cauta la segmentul corect cand variant se schimba', () => {
    // Situatia reala: mascota-companion e deja incarcata (metadate disponibile) cand elevul
    // raspunde corect si variant trece pe "ras" — cautarea se face imediat.
    vi.spyOn(HTMLMediaElement.prototype, 'readyState', 'get').mockReturnValue(HTMLMediaElement.HAVE_METADATA);
    const { container, rerender } = render(<MascotMoment variant="idle" size="companion" />);
    const video = container.querySelector('video') as HTMLVideoElement;

    rerender(<MascotMoment variant="ras" size="companion" />);

    expect(video.currentTime).toBe(RAS_SEGMENT_START);
  });
});
