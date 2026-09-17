import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MascotMoment } from './MascotMoment';
import styles from './MascotMoment.module.css';

const RAS_SEGMENT_START = 4.6;

describe('MascotMoment', () => {
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
    const { container, rerender } = render(<MascotMoment variant="idle" size="companion" />);
    const video = container.querySelector('video') as HTMLVideoElement;

    rerender(<MascotMoment variant="ras" size="companion" />);

    expect(video.currentTime).toBe(RAS_SEGMENT_START);
  });
});
