import React, { useEffect, useRef } from 'react';

/* Form Is Time - faithful React/TS port of the supplied standalone document.
   CSS declarations, copy, BLOCKS, timeline maths and damping are kept from the
   reference. Selectors are scoped under .fit-root so the component is safe in
   the library; on-demand rAF and compact mode are the only adaptations. */

const FIT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Jost:wght@500;600&family=Oswald:wght@500;600&family=Space+Mono&display=swap');

.fit-root {
  --bg: #efefef;
  --fg: #000;
  --blue: #0000ff;
  position: relative;
  width: 100%;
  background: #000;
  container-type: inline-size;
  -webkit-font-smoothing: antialiased;
}
.fit-root * { box-sizing: border-box; margin: 0; padding: 0; }
.fit-root .track { position: relative; height: 1200vh; overflow-x: clip; }
.fit-root .stage {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  width: 100%;
  overflow: hidden;
  background: var(--bg);
}
.fit-root .world { position: absolute; left: 50%; top: 50%; width: 0; height: 0; will-change: transform; }
.fit-root .tile { position: absolute; width: 480px; height: 480px; color: var(--fg); }
.fit-root .b {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 0 0;
  white-space: nowrap;
  line-height: .8;
  font-family: "Jost", "Futura", "Century Gothic", sans-serif;
  font-weight: 600;
  text-transform: uppercase;
}
.fit-root .l { display: inline-block; will-change: transform; }
.fit-root .big { font-size: 54px; }
.fit-root .blue {
  color: var(--blue);
  font-family: "Oswald", "Franklin Gothic Condensed", "Arial Narrow", sans-serif;
  font-weight: 600;
  font-size: 48px;
  line-height: .82;
  letter-spacing: -.5px;
}
.fit-root .mono {
  font-family: "Space Mono", "Courier New", monospace;
  font-weight: 400;
  font-size: 12.5px;
  line-height: 1.25;
  letter-spacing: 1.4px;
}
.fit-root .r { text-align: right; }
.fit-root .hud {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 14px;
  display: flex;
  gap: 12px;
  align-items: center;
  font: 12px/1 "Space Mono", monospace;
  color: #fff;
  mix-blend-mode: difference;
  pointer-events: none;
  z-index: 5;
}
.fit-root .hud i { flex: 1; height: 2px; background: #fff4; position: relative; }
.fit-root .hud i b { position: absolute; left: 0; top: 0; bottom: 0; background: #fff; width: 0; }
.fit-root .hint {
  position: absolute;
  top: 14px;
  left: 16px;
  font: 12px "Space Mono", monospace;
  color: #fff;
  mix-blend-mode: difference;
  z-index: 5;
  transition: opacity .4s;
}
.fit-root .brand {
  position: absolute;
  top: 14px;
  right: 16px;
  font: 600 14px "Oswald", sans-serif;
  letter-spacing: 2px;
  color: #fff;
  mix-blend-mode: difference;
  z-index: 5;
}

/* Compact preview: the 1200vh runway becomes a hidden inner scroll column. */
.fit-compact { height: 100%; }
.fit-compact .track {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.fit-compact .track::-webkit-scrollbar { display: none; }
.fit-compact .stage { position: sticky; top: 0; height: 100%; min-height: 0; }
.fit-compact .spacer { height: 300%; }
.fit-compact .hud { left: 10px; right: 10px; bottom: 8px; gap: 7px; font-size: clamp(7px, 2.1cqw, 11px); }
.fit-compact .hint { top: 8px; left: 10px; font-size: clamp(7px, 2.1cqw, 11px); }
.fit-compact .brand { top: 8px; right: 10px; font-size: clamp(8px, 2.4cqw, 13px); }

@media (prefers-reduced-motion: reduce) {
  .fit-root .hint { transition: none; }
}
`;
/* ---- edit the copy here -------------------------------------------------- */
type Block = [string, number, number, number, string, number, [number, number]?];

export interface FormIsTimeCopy {
  blue1: string;
  blue2: string;
  info: string;
  side: string;
}

export interface FormIsTimeProps {
  compact?: boolean;
  copy?: Partial<FormIsTimeCopy>;
  className?: string;
}

const T: FormIsTimeCopy = {
  blue1: 'UI HUB', blue2: 'Components',
  info: 'uihub.codes<br>Animated UI<br>Copy &amp; Paste',
  side: 'Component<br>Library<br>&amp; Demo',
};

/* 480x480 seamless tile, two clean columns (left x 30-220, right x 250-400),
   vertical words in their own lanes so nothing overlaps */
const BLOCKS = (t: FormIsTimeCopy): Block[] => [
  // [text, x, y, rot, class, spread, range [from,to] along the word own axis]
  ['Time', 30, 34, 0, 'big', 1, [20, 400]], ['Is', 30, 86, 0, 'big', 1, [20, 400]], ['Form', 30, 130, 0, 'big', 1, [20, 400]],
  [t.blue1, 30, 184, 0, 'blue', 0],
  [t.info, 30, 236, 0, 'mono', 0],
  [t.blue2, 250, 184, 0, 'blue', 0],
  [t.side, 450, 232, 0, 'mono r', 0],
  ['Form', 250, 300, 0, 'big', 1, [110, 400]], ['Is', 250, 350, 0, 'big', 1, [110, 400]], ['Time', 250, 394, 0, 'big', 1, [110, 400]],
  ['Time', 424, 460, -90, 'big', 1, [20, 460]],
  [t.blue1, 40, 470, -90, 'blue', 0],
];

interface WordState {
  x: number;
  y: number;
  r: number;
  rg: [number, number];
  spans: HTMLSpanElement[];
}

const DUR = 4.4667;
const ease = (t: number) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
function state(t: number) {
  const o1 = ease(seg(t, .35, 1.2)) - ease(seg(t, 1.9, 2.5));
  const o2 = ease(seg(t, 2.7, 3.3)) - ease(seg(t, 3.85, 4.4));
  return {
    track: Math.min(1, Math.max(o1, 0) + Math.max(o2, 0)),
    dark: t > .62 && t < 2.65,
    rot: 90 * ease(seg(t, 1.9, 2.35)) - 90 * ease(seg(t, 4.0, 4.45)),
    scale: 1 + .22 * (ease(seg(t, .35, 1.2)) - ease(seg(t, 1.9, 2.6)) + ease(seg(t, 2.7, 3.3)) - ease(seg(t, 3.85, 4.4))),
    dy: -60 * seg(t, .6, 1.9) - 60 * seg(t, 3.0, 3.85)
  };
}

declare global {
  interface Window { __seek?: (p: number) => void; }
}
export const FormIsTime: React.FC<FormIsTimeProps> = ({ compact = false, copy, className = '' }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const labRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const tcopy: FormIsTimeCopy = { ...T, ...copy };

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    const world = worldRef.current;
    if (!root || !track || !stage || !world) return;
    const bar = barRef.current;
    const lab = labRef.current;
    const hint = hintRef.current;

    let cancelled = false;
    let target = 0;
    let cur = 0;
    let raf = 0;
    let running = false;
    let last = performance.now();
    const words: WordState[] = [];
    const blocks = BLOCKS(tcopy);

    for (let ty = -2; ty <= 2; ty++) for (let tx = -2; tx <= 2; tx++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.style.left = (tx * 480 - 240) + 'px';
      tile.style.top = (ty * 480 - 240) + 'px';
      blocks.forEach(([text, x, y, r, c, sp, rg]) => {
        const d = document.createElement('div');
        d.className = 'b ' + c;
        if (c.includes(' r')) d.style.right = (480 - x) + 'px';
        else d.style.left = x + 'px';
        d.style.top = y + 'px';
        if (r) d.style.transform = `rotate(${r}deg)` + (c === 'blue' ? ' scaleX(.66)' : '');
        else if (c === 'blue') d.style.transform = 'scaleX(.66)';
        if (sp && rg) {
          d.innerHTML = [...text].map(ch => `<span class="l">${ch}</span>`).join('');
          words.push({ x, y, r, rg, spans: [...d.children] as HTMLSpanElement[] });
        } else d.innerHTML = text;
        tile.appendChild(d);
      });
      world.appendChild(tile);
    }

    function measure() {
      words.forEach(w => {
        w.spans.forEach(s => { s.style.transform = ''; });
        const n = w.spans.length, lastW = w.spans[n - 1].offsetWidth, [a, b] = w.rg;
        const step = n > 1 ? (b - a - lastW) / (n - 1) : 0;
        const start = w.r === -90 ? (w.y - b) : (a - w.x);
        w.spans.forEach((s, i) => { s.dataset.dx = String((start + i * step) - s.offsetLeft); });
      });
    }

    function render(t: number, progress: number) {
      const s = state(t);
      const fit = Math.min(stage.clientWidth || window.innerWidth, stage.clientHeight || window.innerHeight) / 480;
      root.style.setProperty('--bg', s.dark ? '#000' : '#efefef');
      root.style.setProperty('--fg', s.dark ? '#fff' : '#000');
      world.style.transform = `scale(${fit * s.scale}) rotate(${s.rot}deg) translateY(${s.dy}px)`;
      for (const w of words) for (const sp of w.spans) sp.style.transform = `translateX(${(+sp.dataset.dx || 0) * s.track}px)`;
      if (bar) bar.style.width = (progress * 100) + '%';
      if (lab) lab.textContent = t.toFixed(2).padStart(5, '0') + 's';
    }
    function onScroll() {
      let pos: number, max: number;
      if (compact) {
        pos = track.scrollTop;
        max = track.scrollHeight - track.clientHeight;
      } else {
        pos = window.scrollY - (track.getBoundingClientRect().top + window.scrollY);
        max = track.offsetHeight - window.innerHeight;
      }
      target = max > 0 ? Math.min(1, Math.max(0, pos / max)) : 0;
      if (hint) hint.style.opacity = pos > 20 ? '0' : '1';
      /* Restart the on-demand loop: without this the idle rAF has stopped and
         scroll only changes `target`, leaving the rendered poster frozen. */
      kick();
    }

    /* Identical damping to the reference; the rAF stops once the eased value
       lands, so idle previews cost nothing. */
    function loop(now: number) {
      if (cancelled) return;
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      cur += (target - cur) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - cur) < 1e-5) cur = target;
      render(cur * DUR, cur);
      if (cur !== target) raf = requestAnimationFrame(loop);
      else running = false;
    }

    function kick() {
      if (running || cancelled) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {
      if (!cancelled) { measure(); kick(); }
    }, () => { /* fonts unavailable: keep the synchronous measurement */ });
    measure();

    const pane: HTMLElement | Window = compact ? track : window;
    pane.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    function onResize() { if (cancelled) return; onScroll(); measure(); kick(); }

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onResize);
      ro.observe(stage);
    }

    const seek = (p: number) => { target = cur = Math.min(1, Math.max(0, p)); render(cur * DUR, cur); };
    const prevSeek = window.__seek;
    window.__seek = seek;

    onScroll();
    cur = target;
    kick();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      pane.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      if (window.__seek === seek) window.__seek = prevSeek;
      world.replaceChildren();
    };
  }, [compact, tcopy.blue1, tcopy.blue2, tcopy.info, tcopy.side]);

  return (
    <div ref={rootRef} className={'fit-root' + (compact ? ' fit-compact' : '') + (className ? ' ' + className : '')}>
      <style>{FIT_CSS}</style>
      <div ref={trackRef} className="track">
        <div ref={stageRef} className="stage" aria-label="Form Is Time - scroll-driven typography">
          <div ref={worldRef} className="world" />
          <div ref={hintRef} className="hint">scroll &#8595;</div>
          <div className="brand">UI HUB</div>
          <div className="hud">
            <span ref={labRef}>00.00s</span><i><b ref={barRef} /></i><span>UI HUB &#183; FORM IS TIME</span>
          </div>
        </div>
        {compact ? <div className="spacer" /> : null}
      </div>
    </div>
  );
};

export default FormIsTime;


