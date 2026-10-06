import React, { useEffect, useId, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './DotsToSolidText.css';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Content (UI HUB branding; swap for any copy)                        */
/* ------------------------------------------------------------------ */

export interface CardData {
  title: string;
  subtitle: string;
  n: string; // big monogram
  a: string; // gradient center color
  b: string; // gradient edge color
  beam: string; // light-ray color
  field: string; // bottom strip color
  rot: number; // motif rotation
}

const DEFAULT_HEADLINE = 'UI HUB';
const DEFAULT_QUOTE: [string, string, string] = ['I WANT PEOPLE TO', 'REMEMBER ME FOR', 'MORE THAN CODE'];
const DEFAULT_SUB = [
  'More than borders, more than breakpoints, more than the markup itself.',
  'Writing interfaces that outlast every trend, every refactor, every era.',
];
const DEFAULT_YARDS = ['20', '30', '40', '50', '40', '30'];
const DEFAULT_CARDS: CardData[] = [
  { title: 'UI', subtitle: '', n: 'UI', a: '#9a49ff', b: '#1a0b3d', beam: '#ffd9ff', field: '#2b1a55', rot: -24 },
  { title: 'HUB', subtitle: '', n: 'HUB', a: '#5c9b3b', b: '#10260f', beam: '#f6ffb8', field: '#1e4a18', rot: 18 },
  { title: 'scroll', subtitle: '', n: 'scroll', a: '#ffb23a', b: '#2d1260', beam: '#fff0b8', field: '#3a1d70', rot: -8 },
  { title: 'Build by', subtitle: '', n: 'Build by', a: '#4aa0ff', b: '#0c1d4d', beam: '#d6ecff', field: '#142a66', rot: 30 },
  { title: 'jainil', subtitle: '', n: 'jainil', a: '#ff5a7a', b: '#2a0d3a', beam: '#ffd3dc', field: '#40124f', rot: -34 },
];

const FONT = 'Anton, Impact, "Arial Narrow", sans-serif';
const SKEW = 22; // diagonal wipe skew, in % of the line box width

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generated card artwork (brand monogram + rays + halo + scanline strip). */
const CardArt: React.FC<{ c: CardData }> = ({ c }) => {
  const uid = useId().replace(/:/g, '');
  const rays = Array.from({ length: 14 }, (_, k) => {
    const ang = (k / 14) * Math.PI * 2;
    return <line key={k} x1="150" y1="170" x2={150 + Math.cos(ang) * 320} y2={170 + Math.sin(ang) * 320} />;
  });
  const spokes = Array.from({ length: 4 }, (_, k) => {
    const ang = (k / 4) * Math.PI * 2;
    const dx = Math.cos(ang), dy = Math.sin(ang);
    return <line key={k} x1={150 + dx * 84} y1={170 + dy * 84} x2={150 + dx * 102} y2={170 + dy * 102} />;
  });
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id={`g${uid}`} cx="50%" cy="40%" r="75%">
          <stop offset="0" stopColor={c.a} />
          <stop offset="1" stopColor={c.b} />
        </radialGradient>
        <radialGradient id={`h${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={c.beam} stopOpacity=".85" />
          <stop offset="1" stopColor={c.beam} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill={`url(#g${uid})`} />
      <g stroke={c.beam} strokeOpacity=".28" strokeWidth="3">{rays}</g>
      <circle cx="150" cy="170" r="118" fill={`url(#h${uid})`} opacity=".55" />
      <circle cx="150" cy="170" r="80" fill="none" stroke="rgba(255,255,255,.38)" strokeWidth="1.5" opacity=".9" />
      <g stroke={c.beam} strokeOpacity=".85" strokeWidth="2" strokeLinecap="round">{spokes}</g>
      <circle cx="150" cy="170" r="5" fill="#fff" opacity=".9" />
      <text x="150" y="268" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize={Math.max(48, Math.min(150, Math.round(433 / c.n.length)))} fill={c.a} stroke="rgba(255,255,255,.4)" strokeWidth="1.5" letterSpacing=".02em">{c.n}</text>
      <rect y="326" width="300" height="74" fill={c.field} />
      {[0, 1, 2, 3, 4].map((y) => (
        <path key={y} d={`M0 ${330 + y * 18} H300`} stroke="rgba(255,255,255,.18)" strokeWidth="1.5" />
      ))}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export interface DotsToSolidTextProps {
  compact?: boolean;
  showDemoButton?: boolean;
  className?: string;
  headline?: string;
  /** Exactly three lines. */
  quote?: [string, string, string];
  sub?: string[];
  yardNumbers?: string[];
  cards?: CardData[];
}

export const DotsToSolidText: React.FC<DotsToSolidTextProps> = ({
  compact = false,
  showDemoButton = false,
  className = '',
  headline = DEFAULT_HEADLINE,
  quote = DEFAULT_QUOTE,
  sub = DEFAULT_SUB,
  yardNumbers = DEFAULT_YARDS,
  cards = DEFAULT_CARDS,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const s1Ref = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const numsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const qlinesRef = useRef<HTMLDivElement>(null);
  const qiconRef = useRef<HTMLDivElement>(null);
  const qsubRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const lineRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    let cleanup: () => void = () => {};

    const setup = () => {
      const root = rootRef.current!;
      const runway = runwayRef.current!;
      const spacer = spacerRef.current!;
      const stage = stageRef.current!;
      const s1 = s1Ref.current!;
      const head = headRef.current!;
      const nums = numsRef.current!;
      const cvs = canvasRef.current!;
      const glow = glowRef.current!;
      const qlinesEl = qlinesRef.current!;
      const qicon = qiconRef.current!;
      const qsub = qsubRef.current!;
      const hint = hintRef.current!;
      const cardEls = cardRefs.current.filter(Boolean) as HTMLElement[];
      const lineEls = lineRefs.current.filter(Boolean) as HTMLElement[];
      const brights = lineEls.map((l) => l.querySelector('.ss-bright') as HTMLElement);
      const numSpans = Array.from(nums.children) as HTMLElement[];

      const ctx = cvs.getContext('2d')!;
      const off = document.createElement('canvas');
      const octx = off.getContext('2d', { willReadFrequently: true })!;

      /* shared state, mutated by the timeline */
      let W = 0, H = 0, S = 6, cols = 0, rows = 0;
      let rnd = new Float32Array(0);
      let rowEdge = new Float32Array(0);
      let fs = 100, bigF = 340;
      let baseShift = 0.33, qLeft = 0, qW = 0;
      /* P: dot-matrix text. a=alpha, e=dissolve edge, cy=center y, f=font px, d=dot size (0-1 of cell), o0..o2=per-line x offset */
      const P: Record<string, number> = { a: 0, e: 1.7, cy: 0, f: 0, d: 0.55, o0: 0, o1: 0, o2: 0 };
      const wp: Record<string, number> = { w0: 0, w1: 0, w2: 0 }; /* diagonal wipe progress per line (0-1) */
      const bgT = { t: 0 }; /* stage background mix (black -> purple) */
      let tl: gsap.core.Timeline | null = null;

      /* ---- dot-matrix renderer ---- */
      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        if (P.a < 0.01 || !cols) return;
        octx.setTransform(1, 0, 0, 1, 0, 0);
        octx.clearRect(0, 0, cols, rows);
        octx.setTransform(1 / S, 0, 0, 1 / S, 0, 0);
        octx.font = `${P.f}px ${FONT}`;
        octx.textAlign = 'center';
        octx.textBaseline = 'alphabetic';
        octx.fillStyle = '#fff';
        const pc = P.f * 0.98;
        const shift = baseShift * P.f;
        for (let i = 0; i < 3; i++) octx.fillText(quote[i], W / 2 + P['o' + i], P.cy + (i - 1) * pc + shift);
        const data = octx.getImageData(0, 0, cols, rows).data;

        /* where the solid text has already replaced the dots (follows the diagonal wipe) */
        const wiping = wp.w0 > 0 || wp.w1 > 0 || wp.w2 > 0;
        if (wiping) {
          const top0 = P.cy - 1.5 * pc;
          for (let y = 0; y < rows; y++) {
            const cyp = y * S + S / 2;
            const li = Math.floor((cyp - top0) / pc);
            if (li < 0 || li > 2) { rowEdge[y] = -1e9; continue; }
            const fy = (cyp - top0 - li * pc) / pc;
            const X = wp['w' + li] * (100 + SKEW);
            rowEdge[y] = qLeft + (qW * (X - (SKEW * (fy + 0.05)) / 1.1)) / 100;
          }
        }

        ctx.fillStyle = `rgba(214,206,226,${P.a.toFixed(3)})`;
        const d = S * P.d;
        const o = (S - d) / 2;
        for (let y = 0; y < rows; y++) {
          const edge = wiping ? rowEdge[y] : -1e9;
          for (let x = 0; x < cols; x++) {
            const idx = y * cols + x;
            if (data[idx * 4 + 3] < 110) continue;
            if (x * S + S / 2 < edge) continue;
            const t = ((x * S) / W - P.e) / 0.4;
            const p = t >= 0 ? 1 : t < -1 ? 0 : 1 + t;
            if (rnd[idx] > p) continue;
            ctx.fillRect(x * S + o, y * S + o, d, d);
          }
        }
      };

      const apply = () => {
        draw();
        for (let i = 0; i < 3; i++) {
          const X = wp['w' + i] * (100 + SKEW);
          brights[i].style.clipPath = `polygon(0 -5%,${X}% -5%,${X - SKEW}% 105%,0 105%)`;
        }
        stage.style.backgroundColor = gsap.utils.interpolate('#07050f', '#1d1340', bgT.t) as string;
        glow.style.opacity = String(0.25 + bgT.t * 0.75);
      };

      /* ---- layout + timeline (rebuilt on resize) ---- */
      const build = () => {
        if (tl) {
          tl.scrollTrigger?.kill();
          tl.kill();
          tl = null;
        }
        gsap.set([...cardEls, head, nums, s1, qicon, qsub, hint], { clearProps: 'all' });

        W = stage.clientWidth;
        H = stage.clientHeight;
        if (W < 160 || H < 120) return;
        const mobile = W < 700;
        if (!compact) runway.style.height = (mobile ? 900 : 1100) + 'vh';

        /* canvas */
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cvs.width = Math.round(W * dpr);
        cvs.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        S = Math.max(3, Math.round(W / 380)); /* dot spacing in css px */
        cols = Math.ceil(W / S);
        rows = Math.ceil(H / S);
        off.width = cols;
        off.height = rows;
        const r = mulberry32(7);
        rnd = new Float32Array(cols * rows);
        for (let i = 0; i < rnd.length; i++) rnd[i] = r();
        rowEdge = new Float32Array(rows);

        /* quote metrics */
        ctx.save();
        ctx.font = `100px ${FONT}`;
        let longest = 0;
        quote.forEach((q) => { longest = Math.max(longest, ctx.measureText(q).width); });
        const fm = ctx.measureText('H');
        baseShift = fm.fontBoundingBoxAscent != null ? (fm.fontBoundingBoxAscent - fm.fontBoundingBoxDescent) / 200 : 0.33;
        ctx.restore();
        fs = Math.min(H * 0.135, (W * 0.84) / (longest / 100));
        const pitch = fs * 0.98;
        bigF = fs * 3.4;
        lineEls.forEach((l) => {
          l.style.fontSize = fs + 'px';
          l.style.lineHeight = pitch + 'px';
          l.style.height = pitch + 'px';
        });
        qicon.style.fontSize = fs * 0.55 + 'px';
        qicon.style.marginBottom = pitch * 0.1 + 'px';
        qsub.style.marginTop = pitch * 0.32 + 'px';
        qsub.style.fontSize = Math.max(11, Math.min(15, fs * 0.125)) + 'px';
        qW = qlinesEl.offsetWidth;
        qLeft = (W - qW) / 2;

        /* scene 1 geometry */
        const cardH = Math.min(H * 0.42, (W * 0.5) / 0.75);
        const cardW = cardH * 0.75;
        const gap = Math.max(W * 0.34, cardW * 1.55);
        const x0 = W * (mobile ? 0.12 : 0.08);
        const yFrac = [0.13, 0.38, 0.2, 0.36, 0.16];
        const rot0 = [-3, 4, -2, 5, -4];
        const drot = [-7, 6, -5, 8, -6];
        const speed = [1, 1.12, 1.04, 1.18, 1.08];
        const drift = [-1, 1, -1, 1, -1];
        const n = cardEls.length;
        const travel = x0 + (n - 1) * gap + cardW + W * 0.08;
        head.style.fontSize = Math.min(H * 0.3, W * 0.3) + 'px';
        nums.style.width = W * 2.8 + 'px';
        nums.style.fontSize = Math.min(H * 0.13, W * 0.1) + 'px';
        numSpans.forEach((s, k) => { s.style.left = W * (0.05 + k * 0.42) + 'px'; });

        cardEls.forEach((el, i) => {
          el.style.width = cardW + 'px';
          el.style.height = cardH + 'px';
          gsap.set(el, { x: x0 + i * gap, y: yFrac[i % 5] * H, rotation: rot0[i % 5] });
        });

        /* initial state of everything the timeline drives */
        P.a = 0; P.e = 1.7; P.cy = H * 0.58; P.f = bigF; P.d = 0.55;
        P.o0 = W * 0.9; P.o1 = W * 1.25; P.o2 = W * 1.6;
        wp.w0 = wp.w1 = wp.w2 = 0;
        bgT.t = 0;

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
scrollTrigger: compact
          ? {
            // Preview mode: the animation is driven by an invisible scroll
            // column that lives entirely inside the preview card, decoupled
            // from the page scroll. scrolling the card plays it in place.
            trigger: spacer,
            scroller: runway,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1,
            invalidateOnRefresh: true,
          }
          : { trigger: runway, start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true },
          onUpdate: apply,
        });
        tl = timeline;

        /* from/to tween that never renders immediately, so scrubbing up and down is deterministic */
        const T = (target: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, at: number, dur: number, ease = 'none') =>
          timeline.fromTo(target, from, { ...to, duration: dur, ease, immediateRender: false }, at);

        timeline.to({}, { duration: 170 }, 0); /* fixes the total length at 170 units */

        /* ---- Scene 1: parallax cards (0-40) */
        cardEls.forEach((el, i) => {
          const k = i % 5;
          T(
            el,
            { x: x0 + i * gap, y: yFrac[k] * H, rotation: rot0[k] },
            { x: x0 + i * gap - travel * speed[k], y: yFrac[k] * H + drift[k] * H * 0.07, rotation: rot0[k] + drot[k] },
            0, 40,
          );
        });
        T(head, { x: 0 }, { x: -W * 0.12 }, 0, 42);
        T(nums, { x: 0 }, { x: -W * 1.1 }, 0, 42);
        T(hint, { opacity: 1 }, { opacity: 0 }, 0, 4);
        T(s1, { opacity: 1 }, { opacity: 0 }, 35, 9);

        /* ---- Scene 2: dot text slides in line by line (own speed per line) and assembles (33-84) */
        T(P, { a: 0 }, { a: 0.9 }, 33, 7);
        T(P, { cy: H * 0.58 }, { cy: H * 0.5 }, 34, 46, 'power1.out');
        T(P, { e: 1.7 }, { e: -0.3 }, 34, 46);
        T(P, { o0: W * 0.9 }, { o0: 0 }, 34, 38, 'power1.out');
        T(P, { o1: W * 1.25 }, { o1: 0 }, 34, 44, 'power1.out');
        T(P, { o2: W * 1.6 }, { o2: 0 }, 34, 50, 'power1.out');
        /* 84-92: the dot text is complete and holds */

        /* ---- Dot text shrinks into quote size (92-112); stage turns purple */
        T(P, { f: bigF }, { f: fs }, 92, 20, 'power2.inOut');
        T(bgT, { t: 0 }, { t: 1 }, 92, 28);

        /* ---- Scene 3: solid text replaces the dots in place, line by line, on a diagonal edge (112-142) */
        T(wp, { w0: 0 }, { w0: 1 }, 112, 16, 'power1.inOut');
        T(wp, { w1: 0 }, { w1: 1 }, 119, 16, 'power1.inOut');
        T(wp, { w2: 0 }, { w2: 1 }, 126, 16, 'power1.inOut');
        T(qicon, { opacity: 0, y: 10 }, { opacity: 0.75, y: 0 }, 140, 7);
        T(qsub, { opacity: 0, y: 10 }, { opacity: 1, y: 0 }, 143, 7);

        apply();
      };

      build();

      /* rebuild on resize/container size change (debounced; ignore small jitter) */
      let timer: number | undefined;
      let ro: ResizeObserver | undefined;
      const schedule = () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (cancelled || !root.isConnected) return;
          const nw = stage.clientWidth;
          const nh = stage.clientHeight;
          if (W && (nw !== W || Math.abs(nh - H) > 140)) {
            build();
            ScrollTrigger.refresh();
          }
        }, 200);
      };
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(schedule);
        ro.observe(root);
      }
      window.addEventListener('resize', schedule);

      return () => {
        window.removeEventListener('resize', schedule);
        window.clearTimeout(timer);
        if (ro) ro.disconnect();
        if (tl) {
          tl.scrollTrigger?.kill();
          tl.kill();
          tl = null;
        }
      };
    };

    const init = () => {
      if (cancelled) return;
      cleanup = setup();
    };
    /* the canvas needs the display font before it measures and draws text */
    const fontReady: Promise<unknown> = document.fonts?.load
      ? Promise.race([document.fonts.load('100px Anton'), new Promise((res) => window.setTimeout(res, 1800))])
      : Promise.resolve();
    fontReady.then(init, init);

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [compact, quote, cards, yardNumbers, headline, sub]);

  return (
    <div ref={rootRef} className={'dts-root' + (compact ? ' dts-compact' : '') + (className ? ' ' + className : '')}>
      {showDemoButton && compact && (
        <Link to="/demo/dots-to-solid-text" className="dts-demo-btn">
          <ExternalLink size={12} /> Live Demo
        </Link>
      )}
      <div ref={runwayRef} className={compact ? 'ss-scroll' : 'ss-runway'}>
        <div className="ss-stage" ref={stageRef}>
          <div className="ss-layer ss-topglow" />
          <div className="ss-layer ss-glow" ref={glowRef} />

          {/* Scene 1 */}
          <div className="ss-layer ss-s1" ref={s1Ref}>
            <div className="ss-headline" ref={headRef}>{headline}</div>
            <div className="ss-nums" ref={numsRef}>
              {yardNumbers.map((y, i) => <span key={i}>{y}</span>)}
            </div>
            <div>
              {cards.map((c, i) => (
                <figure className="ss-card" key={i} ref={(el) => { cardRefs.current[i] = el; }}>
                  <div className="ss-frame">
                    <div className="ss-art"><CardArt c={c} /></div>
                    <i className="ss-sheen" />
                  </div>
                  <figcaption>
                    <b>{c.title}</b>
                    {c.subtitle ? <span>{c.subtitle}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          {/* Scene 2 */}
          <canvas className="ss-dots" ref={canvasRef} />

          {/* Scene 3 */}
          <div className="ss-quote">
            <div className="ss-qicon" ref={qiconRef}>&ldquo;&rdquo;</div>
            <div className="ss-qlines" ref={qlinesRef}>
              {quote.map((t, i) => (
                <div className="ss-qline" key={i} ref={(el) => { lineRefs.current[i] = el; }}>
                  <span className="ss-sizer">{t}</span>
                  <span className="ss-bright">{t}</span>
                </div>
              ))}
            </div>
            <div className="ss-qsub" ref={qsubRef}>
              {sub.map((s, i) => (
                <span key={i}>{s}{i < sub.length - 1 && <br />}</span>
              ))}
            </div>
          </div>

          <div className="ss-layer ss-vignette" />

          <svg className="ss-ui ss-logo" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" aria-label="Logo">
            <path d="M16 3 L22 17 L16 13 L10 17 Z" />
            <path d="M6 27 L16 17 L26 27" />
            <path d="M3 21 L10 17 M29 21 L22 17" />
          </svg>
          <svg className="ss-ui ss-menu" viewBox="0 0 26 18" fill="none" stroke="currentColor" strokeWidth="3" aria-label="Menu">
            <path d="M7 4 H25" />
            <path d="M1 12 H19" />
          </svg>
          <svg className="ss-ui ss-snd" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
            <rect x="0" y="6" width="2" height="6" />
            <rect x="4" y="2" width="2" height="10" />
            <rect x="8" y="4" width="2" height="8" />
            <rect x="12" y="0" width="2" height="12" />
          </svg>
          <div className="ss-hint" ref={hintRef}>Scroll<i /></div>
        </div>
        {compact ? <div className="ss-spacer" ref={spacerRef} /> : null}
      </div>
      {!compact && (
        <section className="ss-outro">
          <p>Respect the space between the lines<br />and the lines themselves.</p>
        </section>
      )}
    </div>
  );
};

export default DotsToSolidText;