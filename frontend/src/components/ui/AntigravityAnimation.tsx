import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import "./AntigravityAnimation.css";

/* ================= CONFIG (edit freely) ================= */
const W = 1000, H = 1800;
const PATH =
  "M -20 180 C 300 190, 600 220, 780 300 C 960 380, 960 560, 780 620 C 560 700, 120 700, 120 860 C 120 1020, 700 980, 700 1180 C 700 1340, 300 1320, 300 1500";

const MILESTONES = [
  { f: 0.03, tag: "Born",   title: "Birth baseline",       items: ["Microbiome profile", "Genetic test"] },
  { f: 0.26, tag: "Age 22", title: "Annual baseline",      items: ["60 biomarker blood test", "Microbiome test"] },
  { f: 0.5,  tag: "Age 26", title: "Gut health protocol",  items: ["Personalized probiotic", "Gut lining peptide"] },
  { f: 0.72, tag: "Age 34", title: "Hormone optimization", items: ["Testosterone check", "Sleep & recovery plan"] },
  { f: 0.93, tag: "Age 41", title: "Longevity review",     items: ["Cardio risk panel", "Bone density scan"] },
];

// glow layers, outer -> inner: cream, yellow, amber, orange, red, black
const COLORS = ["#fffbe0", "#fff25c", "#ffb000", "#ff4a00", "#8c1300", "#000"];
const LH = [0.98, 0.84, 0.72, 0.6, 0.5, 0.42]; // relative height of each layer
const LW = [300, 270, 240, 210, 185, 160];     // relative width of each layer

/* ================= HELPERS ================= */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ramp = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

/** Bell curve for glow layer i. g: 0 = thin rim at the bottom → 1 = full black dome. */
function bellPath(i, g) {
  const mid = 0.55;
  const Hs = 0.147 + 2.65 * Math.pow(g, 1.3);
  const ws = g < mid ? lerp(2.6, 1, g / mid) : lerp(1, 3.2, (g - mid) / (1 - mid));
  const e = g < mid ? lerp(3, 1.5, g / mid) : lerp(1.5, 3, (g - mid) / (1 - mid));
  const w = LW[i] * ws, h = LH[i] * Hs * 1000;
  let d = "M-100 1100";
  for (let x = -100; x <= 1100; x += 20) {
    d += ` L${x} ${(1000 - h / (1 + Math.pow(Math.abs(x - 500) / w, e))).toFixed(1)}`;
  }
  return d + " L1100 1100Z";
}

/* ================= SMALL COMPONENTS ================= */
function Hero({ innerRef }: { innerRef?: any }) {
  return (
    <div className="layer hero" ref={innerRef}>
      <div className="rule l" aria-hidden="true" />
      <div className="rule r" aria-hidden="true" />
      <div className="frame">
        <i /><i /><i /><i />
        <div className="dots" aria-hidden="true"><b /><b /><b /></div>
        <p className="quote">Beautiful, ready-to-use components for your next build.</p>
        <div className="who"><span />UI-HUB, curated interactive library</div>
      </div>
    </div>
  );
}

/** If layerRefs is passed the paths are animated from scroll; otherwise a static g=0 rim is drawn. */
function Bell({ layerRefs }: { layerRefs?: any }) {
  return (
    <svg className="layer bell" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
      {COLORS.map((c, i) => (
        <path
          key={c}
          fill={c}
          ref={layerRefs ? (el) => { layerRefs.current[i] = el; } : undefined}
          d={layerRefs ? undefined : bellPath(i, 0)}
        />
      ))}
    </svg>
  );
}

/* ================= MAIN COMPONENT ================= */
export interface AntigravityAnimationProps {
  compact?: boolean;
  showDemoButton?: boolean;
  className?: string;
}

export function AntigravityAnimation({
  compact = false,
  showDemoButton = false,
  className,
}: AntigravityAnimationProps) {
  const root = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLElement>(null);
  const seq = useRef<HTMLElement>(null);
  const nav = useRef<HTMLElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const dark = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLHeadingElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const loop = useRef<HTMLDivElement>(null);
  const base = useRef<SVGPathElement>(null);
  const done = useRef<SVGPathElement>(null);
  const tip = useRef<SVGPathElement>(null);
  const barFill = useRef<HTMLElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const layers = useRef<(SVGPathElement | null)[]>([]);
  const msRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pts, setPts] = useState<DOMPoint[]>([]);

  const setVh = () => {
    const h = compact && shell.current ? shell.current.clientHeight : window.innerHeight;
    root.current?.style.setProperty("--ag-vh", `${h / 100}px`);
  };

  useLayoutEffect(() => {
    setVh();
  }, [compact]);

  // measure milestone positions on the curve once
  useLayoutEffect(() => {
    const L = base.current.getTotalLength();
    setPts(MILESTONES.map((m) => base.current.getPointAtLength(m.f * L)));
  }, []);

  useEffect(() => {
    if (!pts.length) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const viewH = () => (compact && shell.current ? shell.current.clientHeight : window.innerHeight);
    const pos = () => (compact && shell.current ? shell.current.scrollTop : window.scrollY);
    const setPos = (y) => {
      if (compact && shell.current) shell.current.scrollTo(0, y);
      else window.scrollTo(0, y);
    };
    const L = base.current.getTotalLength();
    done.current.style.strokeDasharray = `${L} ${L}`;

    const drawBell = (g) =>
      layers.current.forEach((p, i) => p && p.setAttribute("d", bellPath(i, g)));

    // s = overall scroll fraction (0..1). The last 100vh is the "loop reveal".
    function render(s) {
      const T = seq.current.offsetHeight / viewH() - 1;
      const p = clamp((s * T) / (T - 1), 0, 1);      // sequence progress
      const rv = clamp(s * T - (T - 1), 0, 1);       // loop-reveal progress
      loop.current.style.transform = `translateY(${(1 - ease(rv)) * 100}%)`;

      // Stage 1: hero exits fast
      const h = ramp(p, 0.02, 0.1);
      hero.current.style.opacity = `${1 - ease(h)}`;
      hero.current.style.transform = `translateY(${-ramp(p, 0, 0.12) * 120}px) scale(${1 - 0.04 * h})`;

      // Stage 2: bell glow rises and swallows the page
      drawBell(Math.pow(ramp(p, 0, 0.3), 1.25));
      veil.current.style.opacity = `${ramp(p, 0.24, 0.32)}`;
      nav.current.classList.toggle("dark", p > 0.2 && rv < 0.5);

      // Stage 3: black section
      dark.current.style.opacity = `${ramp(p, 0.26, 0.32)}`;
      const r = ease(ramp(p, 0.3, 0.42));
      head.current.style.opacity = `${0.15 + 0.85 * r}`;
      head.current.style.filter = `blur(${6 * (1 - r)}px)`;
      head.current.style.transform = `translateY(${30 * (1 - r)}px)`;

      // timeline curve draws itself; camera follows the head
      const q = ramp(p, 0.45, 0.95), len = q * L;
      const pt = base.current.getPointAtLength(len);
      const sc = world.current.offsetWidth / W;
      done.current.style.strokeDashoffset = `${L * (1 - q)}`;
      tip.current.style.strokeDasharray = `${Math.min(70, len)} ${L * 2}`;
      tip.current.style.strokeDashoffset = `${-Math.max(0, len - 70)}`;
      const y = viewH() * 0.72 - pt.y * sc;
      const x = (0.5 - pt.x / W) * sc * 60;
      world.current.style.transform =
        `translate3d(${x}px,${y}px,0) rotate(${Math.sin(q * 3.1) * 1.4}deg)`;
      world.current.style.opacity = `${1 - ramp(p, 0.95, 1)}`;

      MILESTONES.forEach((m, i) => {
        const el = msRefs.current[i];
        if (!el) return;
        let a = ramp(q, m.f - 0.005, m.f + 0.03) * (1 - ramp(q, m.f + 0.2, m.f + 0.26));
        if (m.f > 0.9) a = ramp(q, m.f - 0.005, m.f + 0.03);
        el.style.opacity = `${a}`;
        el.style.transform = `translateX(${(1 - a) * 14}px)`;
      });
      barFill.current.style.transform = `scaleY(${q})`;
      pct.current.textContent = `${Math.round(q * 100)}%`;
    }

    let cur = 0, target = 0, raf;
    const maxY = () => seq.current.offsetHeight - viewH();
    const measure = () => {
      const r = seq.current.getBoundingClientRect();
      const origin = compact && shell.current ? shell.current.getBoundingClientRect().top : 0;
      target = clamp((origin - r.top) / maxY(), 0, 1);
    };
    const onResize = () => { setVh(); measure(); render(cur); };
    const onWheel = (e) => {
      // scrolling up at the very top jumps to the end of the loop (reverse infinite scroll)
      if (pos() <= 0 && e.deltaY < 0 && !reduce) {
        setPos(maxY() - 2);
        cur = target = 0.999;
        render(cur);
      }
    };

    const scroller: HTMLElement | Window = compact && shell.current ? shell.current : window;
    scroller.addEventListener("scroll", measure, { passive: true });
    addEventListener("resize", onResize);
    addEventListener("wheel", onWheel, { passive: true });

    if (reduce) {
      render(0.7);
    } else {
      measure(); cur = target; render(cur);
      const tick = () => {
        const d = target - cur;
        if (Math.abs(d) > 0.0001) { cur += d * 0.12; render(cur); }
        // end of loop == start of page → silent jump back to the top
        if (target > 0.9985 && cur > 0.996) { setPos(0); cur = target = 0; render(0); }
        raf = requestAnimationFrame(tick);
      };
      tick();
    }

    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", measure);
      removeEventListener("resize", onResize);
      removeEventListener("wheel", onWheel);
    };
  }, [pts, compact]);

  return (
    <div
      ref={root}
      className={"antigravity-animation" + (compact ? " ag-compact" : "") + (className ? " " + className : "")}
    >
      {showDemoButton && compact && (
        <Link to="/demo/antigravity-animation" className="ag-demo-btn">
          <ExternalLink size={12} /> Live Demo
        </Link>
      )}

      <main className="ag-shell" ref={shell}>
        <section className="seq" ref={seq} aria-label="Scroll sequence">
          <div className="stage">
            <nav className="nav" ref={nav}>
              <a className="logo" href="#">lifeline</a>
              <div className="links">
                <a href="#">Manifesto</a><a href="#">Marketplace</a><a href="#">Log in</a>
                <a className="btn" href="#">Join waitlist</a>
              </div>
            </nav>

            <Hero innerRef={hero} />
            <Bell layerRefs={layers} />
            <div className="layer veil" ref={veil} aria-hidden="true" />

            <div className="layer dark" ref={dark}>
              <h2 className="headline" ref={head}>
                Unlock all the potential<br />your life holds
              </h2>

              <div className="view" aria-hidden="true">
                <div className="world" ref={world}>
                  <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" fill="none">
                    <path ref={base} d={PATH} stroke="rgba(255,255,255,.38)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                    <path ref={done} d={PATH} stroke="#ff6a1f" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
                    <path ref={tip} d={PATH} stroke="#fff" strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  </svg>

                  {MILESTONES.map((m, i) =>
                    pts[i] ? (
                      <div
                        key={m.tag}
                        ref={(el) => { msRefs.current[i] = el; }}
                        className={`ms ${pts[i].x > 520 ? "L" : "R"}`}
                        style={{ left: `${(pts[i].x / W) * 100}%`, top: `${(pts[i].y / H) * 100}%` }}
                      >
                        <span className="vl" />
                        <span className="dot" />
                        <span className="tag">{m.tag}</span>
                        <div className="card">
                          <h4>{m.title}</h4>
                          <ul>{m.items.map((t) => <li key={t}>{t}</li>)}</ul>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              <div className="prog">
                <div className="bar"><i ref={barFill} /></div>
                <div><span className="pct" ref={pct}>0%</span><br />Section</div>
              </div>
            </div>

            {/* loop layer: static copy of the start state that slides in at the end */}
            <div className="layer loop" ref={loop}>
              <Hero />
              <Bell />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AntigravityAnimation;
