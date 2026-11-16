import React, { useEffect, useRef } from 'react';

import './ScrollTextReveal.css';

/* ------------------------------------------------------------------ */
/* Content (UI HUB copy; swap it with the `paragraphs` prop)            */
/* ------------------------------------------------------------------ */

const DEFAULT_PARAGRAPHS = [
  'Amid endless (copy-paste code), we long for a place built for builders, a library of deep (motion). Here we browse, preview and ship together,',
  'Discover & copy animated components made for the modern web. Great UI is not merely decoration. It is a (craft). UI HUB.',
];

/* Tunables - the defaults are the reference values verbatim. */
const START = 0.94;   // viewport fraction where a line begins to light up (bottom)
const END = 0.40;     // viewport fraction where it is fully black
const STAGGER = 0.55; // how much left->right delay inside a line (0..1 of the transition)
const CELL = 4;       // halftone tile size (px)

const GREY = [216, 216, 210];
const GREEN = [107, 255, 58];
const INK = [5, 5, 5];

const rgb = (c: number[]) => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';

/* Walk up the DOM for the nearest element that actually scrolls (computed
   style, not class names - the library container uses `md:overflow-y-auto`,
   which a `.overflow-y-auto` selector never matches). */
const findScrollParent = (el: HTMLElement): HTMLElement | Window => {
  let node = el.parentElement;
  while (node) {
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return node;
    }
    node = node.parentElement;
  }
  return window;
};

interface CharState {
  el: HTMLElement;
  /** vertical centre of the glyph, in the scroller's content space */
  y: number;
  /** 0..1 across the reveal block */
  x: number;
  /** last painted progress bucket, so unchanged glyphs are skipped */
  last: number;
}

export interface ScrollTextRevealProps {
  /** Preview mode: the story runs inside its own scroll column instead of the page. */
  compact?: boolean;
  /** Paragraphs revealed character by character. */
  paragraphs?: string[];
  /** Viewport fraction where a glyph starts to light up (bottom edge). */
  start?: number;
  /** Viewport fraction where a glyph is fully inked. */
  end?: number;
  /** Left-to-right delay inside a line, 0..1 of the transition. */
  stagger?: number;
  /** Halftone tile size, in px. */
  cell?: number;
  /** Additional class names for the root container. */
  className?: string;
}

export const ScrollTextReveal: React.FC<ScrollTextRevealProps> = ({
  compact = false,
  paragraphs = DEFAULT_PARAGRAPHS,
  start = START,
  end = END,
  stagger = STAGGER,
  cell = CELL,
  className = '',
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const column = columnRef.current;
    const reveal = revealRef.current;
    if (!root || !column || !reveal) return;

    /* preview mode scrubs against its own column; full mode follows whatever
       ancestor actually scrolls (the page, or the library pane when embedded) */
    const scrollParent: HTMLElement | Window = compact ? column : findScrollParent(root);
    const pane: HTMLElement | null = scrollParent === window ? null : (scrollParent as HTMLElement);

    const chars: CharState[] = Array.from(
      reveal.querySelectorAll<HTMLElement>('.str-ch'),
    ).map((el) => ({ el, y: 0, x: 0, last: -1 }));

    let vh = 0;
    let raf = 0;
    let ticking = false;
    let cancelled = false;

    const viewportHeight = () => (pane ? pane.clientHeight : window.innerHeight);
    const scrollPos = () => (pane ? pane.scrollTop : window.scrollY);

    /* ---------- measure (scroller-content space) ---------- */
    const measure = () => {
      vh = viewportHeight();
      root.style.setProperty('--str-vh', vh + 'px');
      const paneTop = pane ? pane.getBoundingClientRect().top : 0;
      const sy = scrollPos();
      const box = reveal.getBoundingClientRect();
      for (const c of chars) {
        const r = c.el.getBoundingClientRect();
        c.y = r.top - paneTop + sy + r.height * 0.5;
        c.x = Math.min(1, Math.max(0, (r.left - box.left) / box.width));
        c.last = -1;
      }
    };

    /* ---------- paint one character for progress p (0..1) ---------- */
    const paint = (c: CharState, p: number) => {
      const key = Math.round(p * 200);
      if (key === c.last) return;
      c.last = key;
      const s = c.el.style;

      if (p <= 0) { s.backgroundImage = 'none'; s.backgroundColor = rgb(GREY); return; }
      if (p >= 1) { s.backgroundImage = 'none'; s.backgroundColor = rgb(INK); return; }

      /* two dithered stages: grey -> green, then green -> ink */
      let from: number[];
      let to: number[];
      let q: number;
      if (p < 0.5) { from = GREY; to = GREEN; q = p / 0.5; }
      else { from = GREEN; to = INK; q = (p - 0.5) / 0.5; }

      /* the dot radius grows from 0 until it covers the whole cell */
      const r = (q * cell * 0.72).toFixed(2);
      s.backgroundColor = rgb(from);
      s.backgroundImage =
        'radial-gradient(circle at 50% 50%, ' + rgb(to) + ' ' + r + 'px, transparent ' +
        (+r + 0.7).toFixed(2) + 'px)';
    };

    /* ---------- scroll loop ---------- */
    const update = () => {
      ticking = false;
      if (cancelled) return;
      const sy = scrollPos();
      const top = vh * end;
      const bottom = vh * start;
      const span = bottom - top;
      for (const c of chars) {
        const yv = c.y - sy;                 /* scroller-space y of the glyph */
        const t = (bottom - yv) / span;      /* 0 at the START line -> 1 at the END line */
        const p = Math.min(1, Math.max(0, t * (1 + stagger) - c.x * stagger));
        paint(c, p);
      }
    };

    const req = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(update);
    };

    const remeasure = () => { measure(); req(); };
    const onScroll = () => req();

    if (pane) pane.addEventListener('scroll', onScroll, { passive: true });
    else window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', remeasure);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(remeasure);
      ro.observe(root);
    }

    /* the glyph metrics are only right once Anton has actually loaded */
    const fontReady: Promise<unknown> =
      document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const settle = () => { if (!cancelled) { measure(); update(); } };
    fontReady.then(settle, settle);

    measure();
    update();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (pane) pane.removeEventListener('scroll', onScroll);
      else window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', remeasure);
      if (ro) ro.disconnect();
    };
  }, [compact, paragraphs, start, end, stagger, cell]);

  return (
    <div
      ref={rootRef}
      className={'str-root' + (compact ? ' str-compact' : '') + (className ? ' ' + className : '')}
    >
      <div ref={columnRef} className={compact ? 'str-scroll' : 'str-flow'}>
        <div className="str-spacer">Scroll &darr;</div>

        <main ref={revealRef} className="str-reveal">
          {paragraphs.map((paragraph, pi) => {
            const words = paragraph.trim().split(/\s+/);
            return (
              <p key={pi}>
                {words.map((word, wi) => (
                  <React.Fragment key={wi}>
                    <span className="str-word">
                      {Array.from(word).map((ch, ci) => (
                        <span key={ci} className="str-ch">{ch}</span>
                      ))}
                    </span>
                    {wi < words.length - 1 ? <span className="str-space" /> : null}
                  </React.Fragment>
                ))}
              </p>
            );
          })}
        </main>

        <div className="str-spacer end">&uarr; Scroll back up to reverse</div>
      </div>
    </div>
  );
};

export default ScrollTextReveal;