import React, { useEffect, useRef } from 'react';

/* Text Funnel - faithful React/TS port of the supplied standalone document.
   The measured 540x540 hourglass warp, 20-line list, spline tables, flat-canvas
   row-by-row resampling, font calibration and endless re-centring scroll are all
   preserved from the reference. Selectors are scoped under .tf-root; compact
   preview and an on-demand rAF are the only adaptations, so the component is
   safe inside the library grid. */

const TF_CSS = `
.tf-root {
  --bg: #000;
  color-scheme: dark;
  position: relative;
  width: 100%;
  background: var(--bg);
  overflow-x: clip;
  -webkit-font-smoothing: antialiased;
}
.tf-root * { box-sizing: border-box; }
.tf-root .tf-stage {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: var(--bg);
  z-index: 0;
}
.tf-root canvas {
  width: min(100vw, 100vh);
  height: min(100vw, 100vh);
  display: block;
}
.tf-root .tf-spacer { width: 1px; pointer-events: none; }

/* Compact preview: a hidden inner scroll column drives the same endless warp. */
.tf-compact { height: 100%; overflow: hidden; }
.tf-compact .tf-track {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.tf-compact .tf-track::-webkit-scrollbar { display: none; }
.tf-compact .tf-stage {
  position: sticky;
  top: 0;
  height: 100%;
  min-height: 0;
}
.tf-compact canvas {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}
@media (prefers-reduced-motion: reduce) {
  .tf-root .tf-stage { pointer-events: none; }
}
`;

type Key = [number, number];

/* '~' switches the rest of the line to italic (as in the source). Exactly 20
   lines so the endless loop is seamless. */
const LINES: string[] = [
  'UI HUB  ~COMPONENT LIBRARY',
  'BUTTONS  CARDS  ~MODALS',
  'NAVBARS  FORMS  ~TABLES',
  'REACT  NEXT.JS  ~TAILWIND',
  'FRAMER MOTION  ~GSAP',
  'THREE.JS  ~WEBGL SCENES',
  'FIGMA TO ~CODE',
  'LANDING PAGES  ~DASHBOARDS',
  'ANIMATED HERO ~SECTIONS',
  'SCROLL EFFECTS  ~PARALLAX',
  'GLASSMORPHISM  ~NEUMORPHISM',
  'DARK MODE  ~LIGHT MODE',
  'COPY  PASTE  ~SHIP',
  'FREE TEMPLATES  ~PRO KITS',
  'OPEN SOURCE  ~UI KITS',
  'PIXEL PERFECT  ~RESPONSIVE',
  'DESIGN SYSTEMS  ~TOKENS',
  'MICRO INTERACTIONS  ~UX',
  'BUILD FASTER  ~DESIGN BETTER',
  'UI HUB  ~EVERY INTERFACE',
];

const W = 540, H = 540;
const RS = 3;                       /* render scale (sharper) */
const SS = 3;                       /* flat supersample */
const PITCH = 32;                   /* source line pitch (units) */
const CAP_H = 20.8;                 /* target cap height (units) */
const REF_ADV = 21.5;               /* avg glyph advance the SX curve assumes */
const BLOCK = LINES.length * PITCH; /* 640 units: one full pass of the list */
const UPP = 0.64;                   /* 1 page-scroll px = UPP source units */
const PX_PER_LOOP = Math.round(BLOCK / UPP);   /* 1000 */
const ENTER_Y = 450, ENTER_PX = 600, ENTER_POW = 1.6;

/* Hourglass warp keys, measured from the reference GIF. Constant while scrolling. */
const P: Record<'SX' | 'G' | 'OX' | 'TRK', Key[]> = {
  SX:  [[0,0.82],[60,0.80],[140,0.68],[220,0.57],[290,0.55],[360,0.58],[410,0.70],[450,0.84],[490,1.02],[520,1.18],[540,1.30]],
  G:   [[0,1.00],[35,1.00],[85,1.05],[135,1.26],[185,1.28],[435,1.28],[470,1.12],[505,0.98],[540,0.90]],
  OX:  [[0,20],[55,61],[100,92],[145,113],[190,129],[235,136],[280,138],[325,133],[370,122],[415,105],[460,81],[505,43],[540,22]],
  TRK: [[0,0],[330,0],[400,1.5],[450,4],[490,8],[520,12],[540,16]],
};

function enterOffset(y: number): number {
  const u = Math.max(0, Math.min(1, (y - ENTER_Y) / (H + 30 - ENTER_Y)));
  return ENTER_PX * Math.pow(u, ENTER_POW);
}

function makeSpline(keys: Key[]): (x: number) => number {
  const n = keys.length, m = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const a = keys[Math.max(0, i - 1)], b = keys[Math.min(n - 1, i + 1)];
    m[i] = (b[1] - a[1]) / ((b[0] - a[0]) || 1);
  }
  return function (x: number): number {
    if (x <= keys[0][0]) return keys[0][1];
    if (x >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (keys[i + 1][0] < x) i++;
    const x0 = keys[i][0], x1 = keys[i + 1][0], h = x1 - x0, u = (x - x0) / h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * keys[i][1] + (u3 - 2 * u2 + u) * h * m[i] +
           (-2 * u3 + 3 * u2) * keys[i + 1][1] + (u3 - u2) * h * m[i + 1];
  };
}

interface WarpTables {
  SX: Float32Array;
  G: Float32Array;
  OX: Float32Array;
  TRK: Float32Array;
  V: Float32Array;
  vtot: number;
}

declare global {
  interface Window {
    __tfSeek?: (px: number) => void;
    __tfReady?: boolean;
  }
}

export interface TextFunnelProps {
  compact?: boolean;
  className?: string;
}

export const TextFunnel: React.FC<TextFunnelProps> = ({ compact = false, className = '' }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const spacer = spacerRef.current;
    if (!root || !track || !stage || !canvas || !spacer) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    canvas.width = W * RS;
    canvas.height = H * RS;

    const REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cancelled = false;

    const ROWS = H * RS;
    const rowAt = (y: number): number => Math.max(0, Math.min(ROWS - 1, Math.floor(y * RS)));

    /* --- warp tables --------------------------------------------------- */
    const table = (keys: Key[]): Float32Array => {
      const f = makeSpline(keys), a = new Float32Array(ROWS);
      for (let r = 0; r < ROWS; r++) a[r] = f((r + 0.5) / RS);
      return a;
    };
    const cur: WarpTables = {
      SX: table(P.SX), G: table(P.G), OX: table(P.OX), TRK: table(P.TRK),
      V: new Float32Array(ROWS + 1), vtot: 0,
    };
    for (let r = 0; r < ROWS; r++) cur.V[r + 1] = cur.V[r] + 1 / (cur.G[r] * RS);
    cur.vtot = cur.V[ROWS];

    function yAtV(p: number): number {
      const V = cur.V;
      if (p <= 0) return 0;
      if (p >= cur.vtot) return H;
      let lo = 0, hi = ROWS;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (V[mid] <= p) lo = mid; else hi = mid;
      }
      return lo / RS;
    }
    let SCROLL0 = 0;
    function initScroll0(): void { SCROLL0 = PITCH * 0.5 - cur.V[rowAt(30)]; }

    /* --- font calibration (platform independent) ---------------------- */
    let FAMILY = 'Impact,Haettenschweiler,"Arial Narrow",sans-serif', WEIGHT = '400';
    const MIN_TRK = 1.4;
    function pickFont(): void {
      const c = document.createElement('canvas').getContext('2d');
      if (!c) return;
      const w = (f: string): number => { c.font = '100px ' + f; return c.measureText('MWmw0123').width; };
      const base = w('sans-serif');
      for (const fam of ['Impact', 'Haettenschweiler', '"Arial Narrow"']) {
        if (Math.abs(w(fam + ',sans-serif') - base) > 1) {
          FAMILY = fam + ',"Arial Narrow",sans-serif'; WEIGHT = '400'; return;
        }
      }
      FAMILY = '"Arial Black","Helvetica Neue",Arial,sans-serif'; WEIGHT = '900';
    }

    const FW = Math.ceil(1300 * SS);
    const FH = Math.ceil((540 / 0.78 + PITCH * 3) * SS);
    const flat = document.createElement('canvas');
    flat.width = FW; flat.height = FH;
    const fctx = flat.getContext('2d');
    if (!fctx) return;
    let fontPx = 29, widthK = 1;

    function calibrate(): void {
      pickFont();
      fctx.setTransform(1, 0, 0, 1, 0, 0);
      fctx.font = WEIGHT + ' 100px ' + FAMILY;
      const asc = fctx.measureText('H').actualBoundingBoxAscent || 72;
      fontPx = 100 * CAP_H / asc;
      fctx.font = WEIGHT + ' ' + fontPx + 'px ' + FAMILY;
      const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      widthK = REF_ADV / (fctx.measureText(abc).width / abc.length);
      for (const k in wCache) delete wCache[k];
    }
    const wCache: Record<string, number> = {};
    function charW(ch: string, it: boolean): number {
      const k = (it ? 'i' : 'n') + ch;
      return wCache[k] != null ? wCache[k] : (wCache[k] = fctx.measureText(ch).width);
    }
    const FONT_N = (): string => WEIGHT + ' ' + fontPx + 'px ' + FAMILY;
    const FONT_I = (): string => 'italic ' + WEIGHT + ' ' + fontPx + 'px ' + FAMILY;

    function drawFlat(scroll: number): void {
      fctx.setTransform(1, 0, 0, 1, 0, 0);
      fctx.clearRect(0, 0, FW, FH);
      fctx.setTransform(SS, 0, 0, SS, 0, 0);
      fctx.fillStyle = '#fff';
      fctx.textBaseline = 'alphabetic';
      const first = Math.floor(scroll / PITCH) - 1, last = Math.ceil((scroll + cur.vtot) / PITCH) + 1;
      for (let i = first; i <= last; i++) {
        const p = i * PITCH - scroll;
        const r = rowAt(yAtV(p + PITCH * 0.5));
        const k = cur.SX[r] * widthK;
        const trk = (cur.TRK[r] + MIN_TRK) / k;
        const txt = LINES[((i % LINES.length) + LINES.length) % LINES.length];
        const base = p + PITCH * 0.78;
        let x = enterOffset(yAtV(p + PITCH * 0.5)) / k, it = false;
        fctx.font = FONT_N();
        for (let c = 0; c < txt.length; c++) {
          const ch = txt[c];
          if (ch === '~') { it = true; fctx.font = FONT_I(); continue; }
          if (ch !== ' ') fctx.fillText(ch, x, base);
          x += charW(ch, it) + trk;
        }
      }
    }

    function column(target: CanvasRenderingContext2D, units: number): void {
      drawFlat(SCROLL0 + units);
      target.save();
      target.setTransform(1, 0, 0, 1, 0, 0);
      target.imageSmoothingEnabled = true;
      target.imageSmoothingQuality = 'high';
      const CW = W * RS;
      for (let r = 0; r < ROWS; r++) {
        const sc = cur.SX[r] * widthK * RS / SS;
        const x0 = cur.OX[r] * RS;
        const sx0 = Math.max(0, -x0 / sc), sx1 = Math.min(FW, (CW - x0) / sc);
        if (sx1 <= sx0) continue;
        const sy = cur.V[r] * SS, sh = 1 / cur.G[r];
        target.drawImage(flat, sx0, sy, sx1 - sx0, Math.min(sh, FH - sy), x0 + sx0 * sc, r, (sx1 - sx0) * sc, 1);
      }
      target.restore();
    }

    function draw(units: number): void {
      ctx.setTransform(RS, 0, 0, RS, 0, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      column(ctx, units);
    }

    /* --- runtime: endless page scroll drives the text ------------------ */
    const SPAN = 50, START = PX_PER_LOOP * 25;
    const SMOOTH = REDUCED ? 1 : 0.16;
    let pos = START, target = START, lastU = NaN;
    let raf = 0, running = false;

    const getScroll = (): number => compact ? track.scrollTop : window.scrollY;
    const setScroll = (y: number): void => {
      if (compact) track.scrollTop = y; else window.scrollTo(0, y);
    };
    const viewportH = (): number => compact ? track.clientHeight : window.innerHeight;

    function sizeSpacer(): void {
      spacer.style.height = (PX_PER_LOOP * SPAN + viewportH()) + 'px';
    }
    function wrapIfNeeded(): void {
      const sy = getScroll();
      if (sy < PX_PER_LOOP * 8 || sy > PX_PER_LOOP * 42) {
        const shift = Math.round((START - sy) / PX_PER_LOOP) * PX_PER_LOOP;
        setScroll(sy + shift);
        pos += shift; target += shift;
      }
    }
    function frame(): void {
      if (cancelled) return;
      pos += (target - pos) * SMOOTH;
      if (Math.abs(target - pos) < 0.05) pos = target;
      const units = (((pos * UPP) % BLOCK) + BLOCK) % BLOCK;
      if (units !== lastU) { lastU = units; draw(units); }
      if (pos !== target) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    }
    function kick(): void {
      if (running || cancelled) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function onScroll(): void {
      target = getScroll();
      wrapIfNeeded();
      kick();
    }

    const seek = (px: number): void => {
      const y = START + px;
      setScroll(y);
      pos = target = y;
      lastU = NaN;
      kick();
    };
    const prevSeek = window.__tfSeek;
    window.__tfSeek = seek;

    let ro: ResizeObserver | undefined;
    const onResize = (): void => { if (cancelled) return; sizeSpacer(); onScroll(); };
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onResize);
      ro.observe(stage);
    }
    window.addEventListener('resize', onResize);
    const pane: HTMLElement | Window = compact ? track : window;
    pane.addEventListener('scroll', onScroll, { passive: true });

    const prevRestoration = 'scrollRestoration' in history ? history.scrollRestoration : undefined;
    if (!compact && 'scrollRestoration' in history) history.scrollRestoration = 'manual';

    const start = (): void => {
      if (cancelled) return;
      calibrate();
      initScroll0();
      sizeSpacer();
      setScroll(START);
      pos = target = START;
      draw(0);
      window.__tfReady = true;
      kick();
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve())
      .then(start)
      .catch(() => { /* font loading unavailable: use calibrated fallback */ });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      pane.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      if (window.__tfSeek === seek) window.__tfSeek = prevSeek;
      if (!compact && 'scrollRestoration' in history && prevRestoration) history.scrollRestoration = prevRestoration;
    };
  }, [compact]);

  return (
    <div ref={rootRef} className={'tf-root' + (compact ? ' tf-compact' : '') + (className ? ' ' + className : '')}>
      <style>{TF_CSS}</style>
      <div ref={trackRef} className="tf-track">
        <div ref={stageRef} className="tf-stage" aria-label="Text Funnel - warped scrolling typography">
          <canvas ref={canvasRef} aria-label="Scrolling text warped through an hourglass funnel" />
        </div>
        <div ref={spacerRef} className="tf-spacer" />
      </div>
    </div>
  );
};

export default TextFunnel;