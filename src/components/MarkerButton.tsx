import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import rough from 'roughjs';
import styles from './MarkerButton.module.css';

interface MarkerButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  color: string;
  children: ReactNode;
}

// Parametrii coregrafiei — vezi docs/superpowers/specs/2026-09-18-butoane-actiune-marker-zigzag-design.md §2.2,
// confirmati prin testare live in companion vizual (evaluarea-web/.superpowers/brainstorm/).
const BANDS = 4;
const BAND_OVERLAP_RATIO = 0.4;
const OVERSHOOT_PX = 6;
const BAND_DELAY_MS = 130;
const BAND_TRANSITION_MS = 220;
const STROKE_WIDTH_RATIO = 1.7;

export function MarkerButton({ color, children, ...buttonProps }: MarkerButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fillWrapRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const button = buttonRef.current;
    const fillWrap = fillWrapRef.current;
    if (!button || !fillWrap) return;

    function clearScheduled() {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    }

    function prefersReducedMotion(): boolean {
      return typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function reveal() {
      clearScheduled();
      fillWrap!.innerHTML = '';

      if (prefersReducedMotion()) {
        const solid = document.createElement('div');
        solid.style.position = 'absolute';
        solid.style.inset = '0';
        solid.style.background = color;
        fillWrap!.appendChild(solid);
        return;
      }

      const w = button!.offsetWidth;
      const h = button!.offsetHeight;
      if (w === 0 || h === 0) return;

      const bandH = h / BANDS;
      const overlap = bandH * BAND_OVERLAP_RATIO;

      const safety = document.createElement('div');
      safety.style.position = 'absolute';
      safety.style.inset = '-2px';
      safety.style.background = color;
      safety.style.transition = `clip-path ${BAND_TRANSITION_MS}ms linear`;
      const lastLeftToRight = (BANDS - 1) % 2 === 0;
      safety.style.clipPath = lastLeftToRight ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
      fillWrap!.appendChild(safety);

      for (let i = 0; i < BANDS; i++) {
        const leftToRight = i % 2 === 0;
        const top = Math.max(0, bandH * i - overlap);
        const bottom = Math.min(h, bandH * (i + 1) + overlap);
        const bandViewH = bottom - top;

        const bandDiv = document.createElement('div');
        bandDiv.style.position = 'absolute';
        bandDiv.style.left = '0';
        bandDiv.style.right = '0';
        bandDiv.style.overflow = 'hidden';
        bandDiv.style.top = `${top}px`;
        bandDiv.style.height = `${bandViewH}px`;
        bandDiv.style.transition = `clip-path ${BAND_TRANSITION_MS}ms linear`;
        bandDiv.style.clipPath = leftToRight ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
        fillWrap!.appendChild(bandDiv);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${w} ${bandViewH}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.overflow = 'visible';
        bandDiv.appendChild(svg);

        const rc = rough.svg(svg);
        const yMid = bandH * i + bandH / 2 - top;
        const x1 = leftToRight ? -OVERSHOOT_PX : w + OVERSHOOT_PX;
        const x2 = leftToRight ? w + OVERSHOOT_PX : -OVERSHOOT_PX;
        const node = rc.line(x1, yMid, x2, yMid, {
          stroke: color,
          strokeWidth: bandH * STROKE_WIDTH_RATIO,
          roughness: 2.2,
          bowing: 1.2,
        });
        svg.appendChild(node);

        const delay = i * BAND_DELAY_MS;
        const timeoutId = window.setTimeout(() => {
          bandDiv.style.clipPath = 'inset(0 0 0 0)';
          if (i === BANDS - 1) {
            safety.style.clipPath = 'inset(0 0 0 0)';
          }
        }, delay);
        timeoutsRef.current.push(timeoutId);
      }
    }

    function hide() {
      clearScheduled();
      fillWrap!.innerHTML = '';
    }

    button.addEventListener('mouseenter', reveal);
    button.addEventListener('focus', reveal);
    button.addEventListener('mouseleave', hide);
    button.addEventListener('blur', hide);

    return () => {
      clearScheduled();
      button.removeEventListener('mouseenter', reveal);
      button.removeEventListener('focus', reveal);
      button.removeEventListener('mouseleave', hide);
      button.removeEventListener('blur', hide);
    };
  }, [color]);

  return (
    <button ref={buttonRef} type="button" className={styles.button} {...buttonProps}>
      <div className={styles.fillWrap} ref={fillWrapRef} data-marker-fill aria-hidden="true" />
      <span className={styles.label}>{children}</span>
    </button>
  );
}
