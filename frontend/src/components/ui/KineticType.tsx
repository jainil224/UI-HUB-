import React, { useEffect, useRef } from 'react';

/* Kinetic Type - faithful React/TS port of the supplied standalone document.
   The measured sine model, row geometry, union-outline algorithm, font fitting,
   copy and word-reveal behaviour are preserved from the reference. Selectors are
   scoped under .kt-root; compact preview and an on-demand rAF are the only
   adaptations, so the component is safe inside the library grid. */

const KT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

.kt-root {
  --bg: #000;
  --fg: #fff;
  --muted: #9a9a9a;
  --line: #fff;
  color-scheme: dark;
  box-sizing: border-box;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  position: relative;
  width: 100%;
  background: var(--bg);
  container-type: inline-size;
  -webkit-font-smoothing: antialiased;
}
.kt-root * { box-sizing: border-box; }
.kt-root .kt-track { position: relative; height: 300vh; }
.kt-root .kt-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--bg);
}
.kt-root canvas { max-width: 100%; max-height: 100%; display: block; }
.kt-root .kt-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(18px + env(safe-area-inset-bottom, 0px));
  text-align: center;
  font: 12px/1 system-ui, sans-serif;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--muted);
  transition: opacity .4s;
  pointer-events: none;
}
.kt-root .kt-hint i {
  display: block;
  margin: 8px auto 0;
  width: 1px;
  height: 26px;
  background: linear-gradient(var(--muted), transparent);
  animation: kt-drip 1.6s ease-in-out infinite;
}
@keyframes kt-drip {
  0% { transform: scaleY(0); transform-origin: top; }
  50% { transform: scaleY(1); transform-origin: top; }
  51% { transform-origin: bottom; }
  100% { transform: scaleY(0); transform-origin: bottom; }
}
.kt-root .kt-about {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 12vh clamp(24px, 8vw, 120px);
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
}
.kt-root .kt-lede {
  font-family: "Instrument Serif", "Playfair Display", Georgia, "Times New Roman", serif;
  font-size: clamp(34px, 6.2vw, 84px);
  line-height: 1.04;
  letter-spacing: -.01em;
  margin: 0 0 40px;
  font-weight: 400;
}
.kt-root .kt-lede em { font-style: italic; }
.kt-root .kt-lede .kt-dim { color: var(--muted); }
.kt-root .kt-more {
  font-family: "Instrument Serif", "Playfair Display", Georgia, "Times New Roman", serif;
  font-size: clamp(20px, 2.6vw, 34px);
  line-height: 1.3;
  color: #cfcfcf;
  max-width: 38em;
  margin: 0 0 44px;
}
.kt-root .kt-w { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: .14em; margin-bottom: -.14em; }
.kt-root .kt-wi {
  display: inline-block;
  transform: translateY(112%);
  opacity: 0;
  filter: blur(6px);
  transition: transform .9s cubic-bezier(.2,.8,.2,1), opacity .9s ease, filter .9s ease;
  transition-delay: calc(var(--i) * 55ms);
  will-change: transform;
}
.kt-root .kt-lede.in .kt-wi { transform: none; opacity: 1; filter: none; }
.kt-root .kt-more .kt-w { overflow: visible; padding: 0; margin: 0; }
.kt-root .kt-more .kt-wi {
  transform: none;
  filter: none;
  opacity: .18;
  transition: opacity .35s ease, color .35s ease;
  transition-delay: 0s;
}
.kt-root .kt-more .kt-wi.kt-lit { opacity: 1; color: #f2f2f2; }
.kt-root .kt-cta {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity .8s ease .5s, transform .8s cubic-bezier(.2,.8,.2,1) .5s, background .2s;
}
.kt-root .kt-cta.in { opacity: 1; transform: none; }
.kt-root .kt-cta.in:hover { transform: translateY(-2px); }
.kt-root .kt-cta .kt-arr { display: inline-block; transition: transform .25s; }
.kt-root .kt-cta:hover .kt-arr { transform: translate(3px, -3px); }
.kt-root .kt-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font: 500 16px/1 system-ui, sans-serif;
  color: #000;
  background: #fff;
  padding: 16px 26px;
  border-radius: 999px;
  text-decoration: none;
  transition: transform .2s, background .2s;
}
.kt-root .kt-cta:hover { transform: translateY(-2px); background: #e9e9e9; }
.kt-root .kt-cta:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.kt-root .kt-footer {
  padding: 0 clamp(24px, 8vw, 120px) 40px;
  font: 12px system-ui, sans-serif;
  color: var(--muted);
  text-align: center;
}

/* Compact preview: the 300vh runway becomes a hidden inner scroll column. */
.kt-compact { height: 100%; }
.kt-compact .kt-track {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.kt-compact .kt-track::-webkit-scrollbar { display: none; }
.kt-compact .kt-stage { position: sticky; top: 0; height: 100%; min-height: 0; }
.kt-compact .kt-spacer { height: 300%; }
.kt-compact .kt-hint {
  bottom: 8px;
  font-size: clamp(7px, 2.1cqw, 11px);
  letter-spacing: .12em;
}
.kt-compact .kt-hint i { height: clamp(12px, 4cqw, 24px); margin-top: 5px; }

@media (prefers-reduced-motion: reduce) {
  .kt-root .kt-hint i { animation: none; }
  .kt-root .kt-wi, .kt-root .kt-cta { transition: none !important; transform: none !important; opacity: 1 !important; filter: none !important; }
}
`;

type RowDef = [string, string, number, number];

/* Row text + closed box x-positions, measured from the source video. */
const ROWS: RowDef[] = [
  ['Pick a', 'template', 223, 482],
  ['We curate', 'buttons', 182, 486],
  ['You copy', 'navbars', 173, 482],
  ['Fresh', 'components daily', 232, 587],
  ['Build with', 'Tailwind CSS', 149, 591],
  ['Copy and', 'paste code', 228, 531],
  ['Design', 'responsive pages', 182, 532],
  ['Animate', 'everything', 173, 537],
  ['Mix themes', 'and styles', 190, 515],
  ['Launch faster', 'with UI blocks', 149, 593],
];

const W = 720, H = 900;
const FPS = 25.133, DUR = 14.96, CYCLES = 3;
const T = DUR / CYCLES;
const T_TOP = 1.25;
const ROW_PITCH = 50.6;
const BASE0 = 247;
const ROW_CY0 = 233;
const OPEN = 98;
const PLAY_MID = 449.5, PLAY_AMP = 286.5;
const PLAY_X = 262, PLAY_W = 199;
const PLAY_BOX = { up: 77, down: 108, pad: 10 };
const HANDLE = 10;
const FONT_STACK = '"Instrument Serif", "Playfair Display", Georgia, "Times New Roman", serif';

interface KtItem {
  kind: 'L' | 'R' | 'P';
  row: number;
  o: number;
  text: string;
  tx: number;
  base: number;
  cy: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface Outline {
  segs: number[][];
  inside: (px: number, py: number) => boolean;
}

declare global {
  interface Window { __seek?: (p: number) => void; }
}

export interface KineticTypeProps {
  compact?: boolean;
  word?: string;
  className?: string;
}

export const KineticType: React.FC<KineticTypeProps> = ({ compact = false, word = 'UI HUB', className = '' }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const moreRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!root || !track || !stage || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = W;
    canvas.height = H;

    const REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cancelled = false;
    let target = T_TOP;
    let cur = T_TOP;
    let raf = 0;
    let running = false;
    let last = performance.now();

    let fs = 36, pfs = 130, wL: number[] = [], wR: number[] = [], fsRow: number[] = [], wPlay = PLAY_W;

    function fit() {
      ctx.font = 'italic 100px ' + FONT_STACK;
      fs = 100 * 182 / ctx.measureText('Never stop to').width;
      pfs = 100 * 178 / ctx.measureText(word).width;
      ctx.font = 'italic ' + fs + 'px ' + FONT_STACK;
      /* One uniform size: the largest scale at which no row's two phrases collide. */
      let k = 1.15;
      ROWS.forEach((r) => {
        const a = ctx.measureText(r[0]).width, b = ctx.measureText(r[1]).width;
        k = Math.min(k, ((r[3] - 10) - (r[2] + 15) - 21) / (a + b));
      });
      wL = ROWS.map((r) => ctx.measureText(r[0]).width * k);
      wR = ROWS.map((r) => ctx.measureText(r[1]).width * k);
      fsRow = ROWS.map(() => fs * k);
      ctx.font = 'italic ' + pfs + 'px ' + FONT_STACK;
      wPlay = ctx.measureText(word).width;
    }

    const smooth = (a: number, b: number, x: number) => {
      const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return u * u * (3 - 2 * u);
    };
    const playCy = (t: number) => PLAY_MID - PLAY_AMP * Math.cos(2 * Math.PI * (t - T_TOP) / T);
    const openness = (d: number) => 1 - smooth(62, 165, Math.abs(d + 15));
    const rowBase = (i: number) => BASE0 + ROW_PITCH * i;
    const rowCy = (i: number) => ROW_CY0 + ROW_PITCH * i;

    function scene(t: number): KtItem[] {
      const cy = playCy(t);
      const items: KtItem[] = [];
      ROWS.forEach((r, i) => {
        const o = openness(cy - rowCy(i));
        const needL = Math.max(OPEN, (r[2] + 15 + wL[i]) - (PLAY_X - 18));
        const needR = Math.max(OPEN, (PLAY_X + PLAY_W + 18) - (r[3] - 10 - wR[i]));
        const lx = r[2] + 15 - needL * o;
        const rx = r[3] - 10 + needR * o;
        const top = rowBase(i) - ROW_PITCH + 3, bot = rowBase(i) + 3, base = rowBase(i);
        items.push({ kind: 'L', row: i, o, text: r[0], tx: lx, base, cy: 0, x0: lx - 14, x1: lx + wL[i] + 14, y0: top, y1: bot });
        items.push({ kind: 'R', row: i, o, text: r[1], tx: rx - wR[i], base, cy: 0, x0: rx - wR[i] - 14, x1: rx + 10, y0: top, y1: bot });
      });
      items.push({
        kind: 'P', row: -1, o: 1, text: word, tx: 0, base: 0, cy,
        x0: PLAY_X - PLAY_BOX.pad, x1: PLAY_X + PLAY_W + PLAY_BOX.pad,
        y0: cy - PLAY_BOX.up, y1: cy + PLAY_BOX.down,
      });
      return items;
    }

    const k2 = (v: number) => Math.round(v * 100) / 100;
    function outline(items: KtItem[]): Outline {
      const xs = [...new Set(items.flatMap((r) => [k2(r.x0), k2(r.x1)]))].sort((a, b) => a - b);
      const ys = [...new Set(items.flatMap((r) => [k2(r.y0), k2(r.y1)]))].sort((a, b) => a - b);
      const nx = xs.length - 1, ny = ys.length - 1;
      const g = new Uint8Array(nx * ny);
      const xi = new Map(xs.map((v, i) => [v, i] as const));
      const yi = new Map(ys.map((v, i) => [v, i] as const));
      for (const r of items) {
        const a = xi.get(k2(r.x0)), b = xi.get(k2(r.x1));
        const c = yi.get(k2(r.y0)), d = yi.get(k2(r.y1));
        if (a === undefined || b === undefined || c === undefined || d === undefined) continue;
        for (let y = c; y < d; y++) for (let x = a; x < b; x++) g[y * nx + x] = 1;
      }
      const f = (x: number, y: number) => (x < 0 || y < 0 || x >= nx || y >= ny) ? 0 : g[y * nx + x];
      const segs: number[][] = [];
      for (let y = 0; y <= ny; y++) for (let x = 0; x < nx; x++)
        if (f(x, y - 1) !== f(x, y)) segs.push([xs[x], ys[y], xs[x + 1], ys[y]]);
      for (let x = 0; x <= nx; x++) for (let y = 0; y < ny; y++)
        if (f(x - 1, y) !== f(x, y)) segs.push([xs[x], ys[y], xs[x], ys[y + 1]]);
      return { segs, inside: (px, py) => items.some((r) => px > r.x0 && px < r.x1 && py > r.y0 && py < r.y1) };
    }

    function handle(x: number, y: number) {
      ctx.fillStyle = '#000';
      ctx.fillRect(x - HANDLE / 2, y - HANDLE / 2, HANDLE, HANDLE);
      ctx.strokeRect(x - HANDLE / 2 + .5, y - HANDLE / 2 + .5, HANDLE - 1, HANDLE - 1);
    }

    function draw() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      const items = scene(cur);
      const result = outline(items);

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'butt';
      ctx.beginPath();
      for (const s of result.segs) { ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); }
      ctx.stroke();

      const e = 1.2;
      const seen = new Set<string>();
      for (const r of items) {
        const pts: number[][] = [[r.x0, r.y0], [r.x1, r.y0], [r.x0, r.y1], [r.x1, r.y1]];
        if (r.kind === 'P') pts.push(
          [(r.x0 + r.x1) / 2, r.y0], [(r.x0 + r.x1) / 2, r.y1],
          [r.x0, (r.y0 + r.y1) / 2], [r.x1, (r.y0 + r.y1) / 2],
        );
        for (const [px, py] of pts) {
          const key = k2(px) + ',' + k2(py);
          if (seen.has(key)) continue;
          seen.add(key);
          const n = Number(result.inside(px - e, py - e)) + Number(result.inside(px + e, py - e))
            + Number(result.inside(px - e, py + e)) + Number(result.inside(px + e, py + e));
          if ((n > 0 && n < 4) || r.kind === 'P') handle(px, py);
        }
      }

      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      for (const r of items) if (r.kind !== 'P') {
        ctx.font = 'italic ' + fsRow[r.row] + 'px ' + FONT_STACK;
        ctx.fillText(r.text, r.tx, r.base - 2);
      }
      const p = items[items.length - 1];
      ctx.font = 'italic ' + pfs + 'px ' + FONT_STACK;
      ctx.fillText(word, PLAY_X + (PLAY_W - wPlay) / 2, p.cy + 0.34 * pfs);
    }

    function scrollTarget(): number {
      let pos: number, max: number;
      if (compact) {
        pos = track.scrollTop;
        max = track.scrollHeight - track.clientHeight;
      } else {
        pos = window.scrollY - (track.getBoundingClientRect().top + window.scrollY);
        max = track.offsetHeight - window.innerHeight;
      }
      const p = max > 0 ? Math.min(1, Math.max(0, pos / max)) : 0;
      if (hintRef.current) hintRef.current.style.opacity = p > 0.015 ? '0' : '1';
      return T_TOP + p * (T / 2);
    }

    function loop(now: number) {
      if (cancelled) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      target = scrollTarget();
      const diff = target - cur;
      if (Math.abs(diff) > 0.0004) {
        cur += REDUCED ? diff : diff * (1 - Math.exp(-dt * 9));
        draw();
        raf = requestAnimationFrame(loop);
      } else {
        if (diff !== 0) { cur = target; draw(); }
        running = false;
      }
    }

    /* Every external state change restarts the on-demand loop. Without the
       kick() in onScroll the idle rAF stays stopped and scrolling looks frozen. */
    function kick() {
      if (running || cancelled) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
    function onScroll() { kick(); }

    function onResize() {
      if (cancelled) return;
      onScroll();
      fit();
      draw();
    }

    const seek = (p: number) => {
      const t = T_TOP + Math.min(1, Math.max(0, p)) * (T / 2);
      target = cur = t;
      draw();
    };
    const prevSeek = window.__seek;
    window.__seek = seek;

    (document.fonts && document.fonts.ready
      ? Promise.all([document.fonts.load('italic 40px "Instrument Serif"'), document.fonts.ready])
      : Promise.resolve()
    ).then(() => {
      if (!cancelled) { fit(); draw(); kick(); }
    }).catch(() => { /* font loading unavailable: keep the fallback fit */ });

    fit();
    draw();
    const pane: HTMLElement | Window = compact ? track : window;
    pane.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onResize);
      ro.observe(stage);
    }
    kick();

    /* Word-by-word reveal for the text section (full demo only). */
    let io: IntersectionObserver | undefined;
    let revealScroll: (() => void) | undefined;
    if (!compact) {
      const lede = ledeRef.current, more = moreRef.current, cta = ctaRef.current;
      if (lede && more) {
        let idx = 0;
        const split = (node: Node) => {
          Array.prototype.slice.call(node.childNodes).forEach((n: Node) => {
            if (n.nodeType === 3) {
              const frag = document.createDocumentFragment();
              (n.textContent || '').split(/(\s+)/).forEach((part) => {
                if (!part) return;
                if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
                const w = document.createElement('span'); w.className = 'kt-w';
                const wi = document.createElement('span'); wi.className = 'kt-wi';
                wi.style.setProperty('--i', String(idx++));
                wi.textContent = part; w.appendChild(wi); frag.appendChild(w);
              });
              if (n.parentNode) n.parentNode.replaceChild(frag, n);
            } else if (n.nodeType === 1) split(n);
          });
        };
        split(lede);
        idx = 0;
        split(more);
        const words = Array.prototype.slice.call(more.querySelectorAll('.kt-wi')) as HTMLElement[];
        if (REDUCED) {
          lede.classList.add('in');
          if (cta) cta.classList.add('in');
          words.forEach((w) => w.classList.add('kt-lit'));
        } else {
          io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                lede.classList.add('in');
                if (cta) cta.classList.add('in');
              } else if (entry.boundingClientRect.top > 0) {
                lede.classList.remove('in');
                if (cta) cta.classList.remove('in');
              }
            });
          }, { threshold: 0.25 });
          io.observe(lede);
          revealScroll = () => {
            const r = more.getBoundingClientRect(), vh = window.innerHeight;
            let p = (vh * 0.9 - r.top) / (r.height + vh * 0.35);
            p = Math.max(0, Math.min(1, p));
            const n = Math.round(p * words.length);
            for (let i = 0; i < words.length; i++) words[i].classList.toggle('kt-lit', i < n);
          };
          window.addEventListener('scroll', revealScroll, { passive: true });
          window.addEventListener('resize', revealScroll);
          revealScroll();
        }
      }
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      pane.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      if (revealScroll) {
        window.removeEventListener('scroll', revealScroll);
        window.removeEventListener('resize', revealScroll);
      }
      if (window.__seek === seek) window.__seek = prevSeek;
    };
  }, [compact, word]);

  return (
    <div ref={rootRef} className={'kt-root' + (compact ? ' kt-compact' : '') + (className ? ' ' + className : '')}>
      <style>{KT_CSS}</style>
      <div ref={trackRef} className="kt-track">
        <div ref={stageRef} className="kt-stage" aria-label="Kinetic Type - scroll-driven typography with selection handles">
          <canvas ref={canvasRef} aria-label="UI HUB kinetic typography" />
          <div ref={hintRef} className="kt-hint">Scroll<i /></div>
        </div>
        {compact ? <div className="kt-spacer" /> : null}
      </div>
      {compact ? null : (
        <>
          <section className="kt-about">
            <p ref={ledeRef} className="kt-lede">Little words, <em>big</em> interfaces. <span className="kt-dim">UI HUB is a free, hand-picked library of components, templates and animations&mdash;copy, paste and ship in minutes.</span></p>
            <p ref={moreRef} className="kt-more">Every block is built with Tailwind CSS, responsive from the first pixel and ready for dark mode, so you spend less time fiddling with styles and more time shipping the interface people remember. Browse navbars, hero sections, cards, forms and buttons, remix them to fit your brand, then drop the code straight into your project. New components land regularly, so there is always something fresh to build with.</p>
            <a ref={ctaRef} className="kt-cta" href="https://www.uihub.codes/" target="_blank" rel="noopener noreferrer">Visit uihub.codes <span className="kt-arr" aria-hidden="true">&#8599;</span></a>
          </section>
          <footer className="kt-footer">uihub.codes</footer>
        </>
      )}
    </div>
  );
};

export default KineticType;