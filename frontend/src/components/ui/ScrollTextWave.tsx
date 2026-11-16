import React, { useEffect, useRef } from 'react';

import './ScrollTextWave.css';

/* ------------------------------------------------------------------ */
/* Content (UI HUB copy; swap it with the `word` / `phases` props)      */
/* ------------------------------------------------------------------ */

export interface ScrollTextWavePhase {
  /** Headline split into a plain lead and an accent tail. */
  title: [string, string];
  /** Supporting paragraph under the canvas. */
  copy: string;
  /** Whether the "Scroll" nudge is visible during this phase. */
  hint: boolean;
}

const DEFAULT_PHASES: ScrollTextWavePhase[] = [
  {
    title: ['Components that ', 'move'],
    copy: 'UI Hub is a library of animated UI components you can browse, preview and copy. Scroll to see one in motion.',
    hint: true,
  },
  {
    title: ['Preview it, ', 'live'],
    copy: 'Every component runs in the browser before you take it. Keep scrolling to open it up.',
    hint: true,
  },
  {
    title: ['Copy the code. ', 'Ship it.'],
    copy: 'Copy-paste React and Tailwind code, ready for your next project. Find more at @uihub.codes',
    hint: false,
  },
];

/* Tunables - the defaults are the reference values verbatim. */
const ORANGE = '#f85010';
const PURPLE = '#9008f8';
const WORD = 'UI HUB';
const FONT = '400px Anton, Impact, "Haettenschweiler", "Arial Narrow", sans-serif';

/* Bump profile, measured from the reference clip in 720px-wide source units. */
const SHAPE: [number, number][] = [
  [0, 1], [60, 0.924], [100, 0.79], [140, 0.63],
  [180, 0.467], [220, 0.26], [260, 0.125], [290, 0],
];

/* Where the bump profile has decayed to nothing, in the same source units. */
const SHAPE_SPAN = 290;

/* Half-width of the wave as a function of distance from the centre line. */
const shape = (dx: number): number => {
  dx = Math.abs(dx);
  if (dx >= SHAPE_SPAN) return 0;
  for (let i = 1; i < SHAPE.length; i++) {
    if (dx <= SHAPE[i][0]) {
      const a = SHAPE[i - 1];
      const b = SHAPE[i];
      const u = (dx - a[0]) / (b[0] - a[0]);
      return a[1] + (b[1] - a[1]) * (u * u * (3 - 2 * u) * 0.35 + u * 0.65);
    }
  }
  return 0;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* Scroll progress -> animation state:
     0.00-0.40  the wave pops open (ease-out)
     0.40-0.55  hold on the "first image" state
     0.55-0.95  purple floods outward, orange is removed
     0.95-1.00  hold on the full purple lettering */
const stateAt = (p: number) => {
  const a = clamp(p / 0.4, 0, 1);
  return { amp: 1 - Math.pow(1 - a, 3), k: inOut(clamp((p - 0.55) / 0.4, 0, 1)) };
};

const pad2 = (n: number) => (n < 10 ? '0' + n : String(n));

export interface ScrollTextWaveProps {
  /** Preview mode: the wave is scrubbed by an invisible scroll column inside the card. */
  compact?: boolean;
  /** The big lettering drawn on the canvas. */
  word?: string;
  /** Copy phases, cross-faded as the scroll passes 0.12 and 0.6. */
  phases?: ScrollTextWavePhase[];
  /** Additional class names for the root container. */
  className?: string;
}

export const ScrollTextWave: React.FC<ScrollTextWaveProps> = ({
  compact = false,
  word = WORD,
  phases = DEFAULT_PHASES,
  className = '',
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLElement>(null);
  const bottomRef = useRef<HTMLElement>(null);
  const titleLeadRef = useRef<HTMLSpanElement>(null);
  const titleTailRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const stepRef = useRef<HTMLElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const art = artRef.current;
    const cv = canvasRef.current;
    const prog = progRef.current;
    const topBar = topRef.current;
    const bottomBar = bottomRef.current;
    const titleLead = titleLeadRef.current;
    const titleTail = titleTailRef.current;
    const copyEl = copyRef.current;
    const stepEl = stepRef.current;
    const hintEl = hintRef.current;
    if (
      !root || !track || !art || !cv || !prog || !topBar || !bottomBar ||
      !titleLead || !titleTail || !copyEl || !stepEl || !hintEl
    ) {
      return;
    }
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    if (phases.length === 0) return;

    let cancelled = false;
    let W = 1;
    let H = 1;
    let DPR = 1;
    let dotPat: CanvasPattern | null = null;
    let metrics: { left: number; bw: number; asc: number; th: number } | null = null;
    let target = 0;
    let cur = 0;
    let shown = -1;
    let running = false;
    let rafId = 0;
    let phase = -1;
    let swapTimer = 0;

    /* ---------- glyph metrics (independent of canvas resolution) ---------- */
    const measure = () => {
      ctx.save();
      ctx.font = FONT;
      const m = ctx.measureText(word);
      metrics = {
        left: m.actualBoundingBoxLeft,
        bw: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
        asc: m.actualBoundingBoxAscent,
        th: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
      };
      ctx.restore();
    };

    const drawWord = (color: string, x: number, y: number, w: number, h: number) => {
      if (!metrics) measure();
      if (!metrics) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(w / metrics.bw, h / metrics.th);
      ctx.font = FONT;
      ctx.fillStyle = color;
      ctx.fillText(word, metrics.left, metrics.asc);
      ctx.restore();
    };

    /* ---------- the halftone tile that is laid over the finished frame ---------- */
    const makeDots = () => {
      const pitch = Math.max(3, Math.round(Math.max(4, Math.min(W, H) / 110) * DPR));
      const tile = document.createElement('canvas');
      tile.width = pitch;
      tile.height = pitch;
      const g = tile.getContext('2d');
      if (!g) return;
      g.fillStyle = '#000';
      g.beginPath();
      g.arc(pitch / 2, pitch / 2, pitch * 0.24, 0, 7);
      g.fill();
      dotPat = ctx.createPattern(tile, 'repeat');
    };

    /* ---------- the wave: a clipped lens between two mirrored outlines ---------- */
    const bump = (amp: number, k: number) => {
      const hw = 0.403 * Math.sqrt(W * H * 0.5625);
      const ou = hw / SHAPE_SPAN;              /* px per source unit */
      const wf = 1 + 5 * k;
      const af = 1 + 2 * k;
      const A = H * 0.254;
      const e = (x: number) =>
        Math.max(A * af * amp * shape((x - W / 2) / ou / wf), H * 0.52 * Math.pow(k, 5));
      const step = Math.max(2, W / 360);
      const xs: number[] = [];
      for (let x = 0; x <= W + step; x += step) xs.push(Math.min(x, W));
      const topY = (x: number) => H / 2 - e(x);
      const botY = (x: number) => H / 2 + e(x);

      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < xs.length; i++) {
        if (i === 0) ctx.moveTo(xs[i], topY(xs[i]));
        else ctx.lineTo(xs[i], topY(xs[i]));
      }
      for (let i = xs.length - 1; i >= 0; i--) ctx.lineTo(xs[i], botY(xs[i]));
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      drawWord(PURPLE, W * 0.011, lerp(H * 0.3125, H * 0.011, k), W * 0.978, lerp(H * 0.473, H * 0.978, k));
      /* translucent shadow band beneath the top outline */
      const band = 58 * ou * (1 - k) * Math.min(1, amp * 3);
      if (band > 0.5) {
        ctx.fillStyle = 'rgba(60,0,110,.42)';
        ctx.beginPath();
        for (let i = 0; i < xs.length; i++) {
          if (i === 0) ctx.moveTo(xs[i], topY(xs[i]));
          else ctx.lineTo(xs[i], topY(xs[i]));
        }
        for (let i = xs.length - 1; i >= 0; i--) {
          const x = xs[i];
          ctx.lineTo(x, topY(x) + band * Math.min(1, shape((x - W / 2) / ou / wf) * 3));
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      /* outlines only where the bump actually exists */
      let i0 = -1;
      let i1 = -1;
      for (let i = 0; i < xs.length; i++) {
        if (e(xs[i]) > 0.8) {
          if (i0 < 0) i0 = i;
          i1 = i;
        }
      }
      if (i0 >= 0 && k < 0.98) {
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 15 * ou * Math.min(1, amp * 4);
        ctx.beginPath();
        for (let i = i0; i <= i1; i++) {
          if (i === i0) ctx.moveTo(xs[i], topY(xs[i]));
          else ctx.lineTo(xs[i], topY(xs[i]));
        }
        ctx.stroke();
        ctx.strokeStyle = ORANGE;
        ctx.lineWidth = Math.max(2, 5 * ou);
        ctx.beginPath();
        for (let i = i0; i <= i1; i++) {
          if (i === i0) ctx.moveTo(xs[i], botY(xs[i]));
          else ctx.lineTo(xs[i], botY(xs[i]));
        }
        ctx.stroke();
      }
    };

    /* ---------- one frame ---------- */
    const render = (p: number) => {
      const s = stateAt(p);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      drawWord(ORANGE, W * 0.011, H * 0.011, W * 0.978, H * 0.473);     /* top: orange letters on black */
      ctx.fillStyle = ORANGE;
      ctx.fillRect(0, H * 0.5, W, H * 0.5);                             /* bottom: orange field ... */
      drawWord('#000', W * 0.011, H * 0.509, W * 0.978, H * 0.481);     /* ... with black letters */
      if (s.amp > 0.004) bump(s.amp, s.k);
      ctx.setTransform(1, 0, 0, 1, 0, 0);                               /* halftone dots, device pixels */
      const pat = dotPat;
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, cv.width, cv.height);
      }
    };

    /* ---------- copy that changes with the phase ---------- */
    const setPhase = (n: number) => {
      if (n === phase) return;
      const isFirst = phase < 0;
      phase = n;
      const apply = () => {
        if (cancelled) return;
        const P = phases[n] ?? phases[0];
        if (!P) return;
        titleLead.textContent = P.title[0];
        titleTail.textContent = P.title[1];
        copyEl.textContent = P.copy;
        stepEl.textContent = pad2(n + 1) + ' / ' + pad2(phases.length);
        hintEl.classList.toggle('off', !P.hint);
        root.style.setProperty('--accent', n === phases.length - 1 ? PURPLE : ORANGE);
        topBar.classList.remove('swap');
        bottomBar.classList.remove('swap');
      };
      if (isFirst) {
        apply();
        return;
      }
      topBar.classList.add('swap');
      bottomBar.classList.add('swap');
      window.clearTimeout(swapTimer);
      swapTimer = window.setTimeout(apply, 220);
    };

    /* ---------- scroll progress (0..1 over the runway) ---------- */
    const readScroll = () => {
      const max = compact
        ? track.scrollHeight - track.clientHeight
        : track.offsetHeight - window.innerHeight;
      const pos = compact
        ? track.scrollTop
        : window.scrollY - (track.getBoundingClientRect().top + window.scrollY);
      target = max > 0 ? clamp(pos / max, 0, 1) : 0;
    };

    /* The reference runs one continuous rAF. Here the loop only exists while the
       eased value is still travelling, so a grid of previews costs nothing. */
    const loop = () => {
      if (cancelled) return;
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0004) cur = target;
      if (cur !== shown) {
        shown = cur;
        render(cur);
        prog.style.transform = 'scaleX(' + cur.toFixed(4) + ')';
        setPhase(Math.min(phases.length - 1, cur < 0.12 ? 0 : cur < 0.6 ? 1 : 2));
      }
      if (cur === target) {
        running = false;
        return;
      }
      rafId = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (running || cancelled) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    };

    const onScroll = () => {
      readScroll();
      kick();
    };

    const resize = () => {
      if (cancelled) return;
      const r = art.getBoundingClientRect();
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      cv.width = Math.round(W * DPR);
      cv.height = Math.round(H * DPR);
      makeDots();
      readScroll();
      shown = -1;
      kick();
    };

    const pane: HTMLElement | null = compact ? track : null;
    if (pane) pane.addEventListener('scroll', onScroll, { passive: true });
    else window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(resize);
      ro.observe(art);
    }

    /* the glyph metrics are only right once Anton has actually loaded */
    const fontReady: Promise<unknown> =
      document.fonts && document.fonts.load ? document.fonts.load('400 100px Anton') : Promise.resolve();
    const settle = () => {
      if (cancelled) return;
      metrics = null;
      shown = -1;
      kick();
    };
    fontReady.then(settle, settle);

    resize();
    readScroll();
    cur = target;
    kick();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.clearTimeout(swapTimer);
      if (pane) pane.removeEventListener('scroll', onScroll);
      else window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      if (ro) ro.disconnect();
    };
  }, [compact, word, phases]);

  const first = phases[0] ?? DEFAULT_PHASES[0];

  return (
    <div
      ref={rootRef}
      className={'stw-root' + (compact ? ' stw-compact' : '') + (className ? ' ' + className : '')}
    >
      <div ref={trackRef} className="stw-track">
        <section className="stw-stage" aria-label="Scroll-driven typographic wave">
          <div ref={progRef} className="stw-prog" />

          <header ref={topRef} className="stw-bar stw-top">
            <div className="stw-kicker">
              UI Hub <b ref={stepRef}>{'01 / ' + pad2(phases.length)}</b>
            </div>
            <h1>
              <span ref={titleLeadRef}>{first.title[0]}</span>
              <em ref={titleTailRef}>{first.title[1]}</em>
            </h1>
          </header>

          <div ref={artRef} className="stw-art">
            <canvas
              ref={canvasRef}
              className="stw-cv"
              role="img"
              aria-label="UI Hub animated lettering: an orange halftone word with a purple wave that grows as you scroll"
            />
          </div>

          <footer ref={bottomRef} className="stw-bar stw-bottom">
            <p ref={copyRef}>{first.copy}</p>
            <div ref={hintRef} className={'stw-hint' + (first.hint ? '' : ' off')}>
              <span>Scroll</span>
              <i />
            </div>
          </footer>
        </section>

        {compact ? <div className="stw-spacer" /> : null}
      </div>
    </div>
  );
};

export default ScrollTextWave;