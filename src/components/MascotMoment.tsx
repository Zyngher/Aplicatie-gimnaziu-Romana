import { useEffect, useRef } from 'react';
import styles from './MascotMoment.module.css';

export type MascotVariant = 'idle' | 'ras' | 'sarbatorire';
export type MascotSize = 'companion' | 'hero';

interface Props {
  variant: MascotVariant;
  size: MascotSize;
}

// Segmente din wimpy img/Matilda_jumping_with_book_1080p_202608271145.mp4,
// identificate cadru-cu-cadru in docs/mascota-matilda.md §16. `idle` nu are segment —
// ramane pe cadrul static de repaus (t=0). Deliberat fara bucla pe interval fix pentru idle —
// vezi .claude/skills/integrare-mascota-web/SKILL.md pentru motivul tehnic si de design.
const SEGMENTS: Partial<Record<MascotVariant, { start: number; end: number }>> = {
  ras: { start: 4.6, end: 9.5 },
  sarbatorire: { start: 0.3, end: 2.5 },
};

export function MascotMoment({ variant, size }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const segment = SEGMENTS[variant];
    if (!segment) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    let frameId = 0;

    const checkEnd = () => {
      if (video.currentTime >= segment.end) {
        video.pause();
        return;
      }
      frameId = requestAnimationFrame(checkEnd);
    };

    const handleSeeked = () => {
      // video.play() poate arunca/respinge (politica de autoplay a browserului) — nu blocam
      // fluxul daca esueaza, doar nu pornim redarea.
      const playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(() => {});
      }
      frameId = requestAnimationFrame(checkEnd);
    };

    // Cautarea se face doar dupa ce video-ul are metadatele incarcate. O cautare pe un video inca
    // neincarcat — mai ales repetata, cum face StrictMode in dev, care ruleaza efectul de doua ori —
    // facea Chrome sa raporteze MEDIA_ERR_DECODE: mascota hero de pe SetComplete ramanea un
    // dreptunghi negru (gasit 2026-10-01). Companion-ul nu era afectat: e deja incarcat cand
    // variant se schimba, deci ramura cu cautare imediata se aplica.
    const startSegment = () => {
      video.addEventListener('seeked', handleSeeked, { once: true });
      video.currentTime = segment.start;
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      startSegment();
    } else {
      video.addEventListener('loadedmetadata', startSegment, { once: true });
    }

    return () => {
      video.removeEventListener('loadedmetadata', startSegment);
      video.removeEventListener('seeked', handleSeeked);
      cancelAnimationFrame(frameId);
    };
  }, [variant]);

  return (
    <div className={size === 'hero' ? styles.hero : styles.companion}>
      <video
        ref={videoRef}
        className={styles.video}
        src="/mascots/matilda-momente.mp4"
        muted
        playsInline
        aria-hidden="true"
      />
    </div>
  );
}
