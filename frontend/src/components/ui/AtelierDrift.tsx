import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./AtelierDrift.css";

gsap.registerPlugin(ScrollTrigger);

const reduce =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Scroll context: `compact` renders the whole site inside a self-     */
/* contained scroll column (library preview); otherwise the page uses  */
/* the window. Every ScrollTrigger binds to the same scroller.         */
/* ------------------------------------------------------------------ */

interface AdCtxValue {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  compact: boolean;
}
const ScrollCtx = createContext<AdCtxValue>({ scrollRef: { current: null }, compact: false });

function useAd() {
  const { scrollRef, compact } = useContext(ScrollCtx);
  const vw = () => {
    const s = compact ? scrollRef.current : null;
    return s ? s.clientWidth : window.innerWidth;
  };
  const vh = () => {
    const s = compact ? scrollRef.current : null;
    return s ? s.clientHeight : window.innerHeight;
  };
  const scroller = () => (compact ? scrollRef.current || undefined : undefined);
  const pinST = (trigger: any, end: any, extra: any = {}) => ({
    trigger,
    start: "top top",
    end,
    scrub: reduce ? true : 0.8,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    scroller: scroller(),
    ...extra,
  });
  return { compact, vw, vh, scroller, pinST };
}

/* ------------------------------------------------------------------ */
/* Generated art (original, CSS-only abstract portraits)               */
/* Each palette is [c1, c2, c3, head, body].                           */
/* ------------------------------------------------------------------ */

const PALETTES: string[][] = [
  ["#2fa36b", "#9be28f", "#0f5b3b", "#f1c9a5", "#f2f2ee"],
  ["#ffb703", "#ffd966", "#e07a00", "#7b4a2b", "#e63946"],
  ["#3a2fd4", "#7a8bff", "#1b1670", "#f4c9b0", "#ffd23f"],
  ["#ff6b4a", "#ffb199", "#c93a1e", "#5b3a29", "#f7f1e8"],
  ["#111827", "#3b4a6b", "#05070d", "#e7b894", "#ff5c93"],
  ["#8a3ffc", "#d6a8ff", "#4a1b9c", "#f7d3bd", "#ffe066"],
  ["#00a6a6", "#8ee7dc", "#006b6b", "#8a5a3c", "#ff8a3d"],
  ["#ff4d8d", "#ffb3cf", "#b30e50", "#f0c4a2", "#1f1f24"],
  ["#e9d8a6", "#fff1c9", "#bb9457", "#6f4e37", "#2a6f97"],
];

function artVars(i: number): React.CSSProperties {
  const p = PALETTES[i % PALETTES.length];
  return {
    ["--c1"]: p[0],
    ["--c2"]: p[1],
    ["--c3"]: p[2],
    ["--c4"]: p[3],
    ["--c5"]: p[4],
  } as React.CSSProperties;
}

/** A tile that paints an abstract portrait. `as` lets you render it as <i>, <figure>, etc. */
function Tile(props: any) {
  const { i, as: Tag = "div", className, style, children, ...rest } = props;
  return (
    <Tag className={className} style={{ ...artVars(i), ...style }} {...rest}>
      <span className={"ad-art" + (i % 4 === 3 ? " ad-abs" : "")} />
      {children}
    </Tag>
  );
}

/* ---- line icons ---- */
const ICONS: React.ReactNode[] = [
  <circle key="0" cx="12" cy="12" r="8" />,
  <path key="1" d="M12 4l8 14H4z" />,
  <path key="2" d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />,
  <path key="3" d="M12 3l2.6 6.2L21 10l-5 4.3L17.5 21 12 17.6 6.5 21 8 14.3 3 10l6.4-.8z" />,
  <path key="4" d="M12 3l9 9-9 9-9-9z" />,
  <path key="5" d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />,
  <rect key="6" x="4" y="4" width="16" height="16" rx="3" />,
  <path key="7" d="M12 3c5 0 9 4 9 9s-4 9-9 9M12 3c-5 0-9 4-9 9s4 9 9 9" />,
];

function Icon({ n }: { n: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {ICONS[n % ICONS.length]}
    </svg>
  );
}

/** Round icon badges positioned by [left%, top%]. */
function IconField({ positions, className }: { positions: number[][]; className?: string }) {
  return (
    <div className={className}>
      {positions.map(([l, t], i) => (
        <div className="ad-ico" key={i} style={{ left: l + "%", top: t + "%" }}>
          <Icon n={i} />
        </div>
      ))}
    </div>
  );
}

/** Small seeded RNG so avatar layout is identical on every render. */
function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* 1. hero: one card -> fan -> diagonal cascade -> exit                */
/* ------------------------------------------------------------------ */

function Hero() {
  const root = useRef<HTMLElement>(null);
  const { vw, vh, pinST, compact } = useAd();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const cards = q(".ad-card") as any;
      const chips = q(".ad-chip") as any;
      const mid = (cards.length - 1) / 2;
      const cw = () => cards[0].offsetWidth;
      const small = () => vw() < 720;
      // Compact (library preview) cards are smaller, so the fan snaps wider to
      // fill the preview edge-to-edge instead of leaving paper gutters.
      const spread = compact ? 0.95 : 0.64;

      gsap.set(cards, {
        xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.64,
        rotation: (i: number) => (i - mid) * 1.2,
        zIndex: (i: number) => i,
      });
      gsap.set(".ad-h-b", { autoAlpha: 0, y: 30 });
      gsap.set(chips, { autoAlpha: 0, scale: 0.6 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: pinST(root.current, "+=340%"),
      });

      tl.to(".ad-sub", { autoAlpha: 0, duration: 0.3 }, 0)
        // fan out into a shallow arc
        .to(cards, {
          x: (i: number) => (i - mid) * cw() * spread,
          y: (i: number) => Math.pow(i - mid, 2) * cw() * 0.025,
          rotation: (i: number) => (i - mid) * 6,
          scale: 1,
          duration: 1.2,
          stagger: { each: 0.05, from: "center" },
        }, 0)
        .to(chips, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.1 }, 0.9)
        .to({}, { duration: 0.5 })
        // swap headline
        .to(".ad-h-a", { autoAlpha: 0, y: -50, duration: 0.7 }, ">")
        .to(chips, { autoAlpha: 0, duration: 0.3 }, "<")
        .to(".ad-h-b", { autoAlpha: 1, y: 0, duration: 0.7 }, "<+.3")
        // diagonal cascade (lower right)
        .to(cards, {
          x: (i: number) => (i - mid) * cw() * 0.42 + vw() * (small() ? 0.05 : 0.25),
          y: (i: number) => (i - mid) * cw() * 0.13 + vh() * (small() ? 0.22 : 0.12),
          rotation: -8,
          scale: () => (small() ? 0.8 : 0.95),
          duration: 1.3,
          stagger: { each: 0.04, from: "start" },
        }, "<")
        .to({}, { duration: 0.6 })
        // exit top-right
        .to(".ad-h-b", { autoAlpha: 0, y: -40, duration: 0.6 }, ">")
        .to(cards, {
          x: () => "+=" + vw() * 0.8,
          y: () => "-=" + vh() * 0.9,
          duration: 1,
          stagger: 0.04,
        }, "<");
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="ad-stage" id="ad-s1" ref={root as any}>
      <h1 className="ad-h-a">
        A place to display <br />
        <span>your masterpiece.</span>
      </h1>
      <div className="ad-h-b">
        <h2>
          Showcase, sell,
          <br />
          <em>&amp; acquire art</em>
          <br />
          in our marketplace
        </h2>
        <p>A community where artists and buyers meet. Atelier Drift brings makers and collectors into one place.</p>
        <div className="ad-row">
          <button className="ad-pill ad-dark">Join for $9/mo</button>
          <button className="ad-pill ad-ghost">Read more</button>
        </div>
      </div>

      <div className="ad-stack">
        {Array.from({ length: 7 }, (_, i) => (
          <Tile key={i} i={i} className="ad-card" />
        ))}
      </div>

      <span className="ad-chip ad-b" style={{ left: "21%", top: "34%" }}>@coplin</span>
      <span className="ad-chip ad-g" style={{ right: "20%", top: "30%" }}>@andrea</span>
      <span className="ad-chip ad-r" style={{ right: "30%", top: "20%" }}>@howard</span>
      <div className="ad-sub"><span>Scroll to explore</span></div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2. gateway: panel rises, image parallax, then the trust row         */
/* ------------------------------------------------------------------ */

const LOGOS = ["Northfold", "Quillbase", "Marrow&Co", "Tidewire", "Lumen Arc", "Kiln"];

function Gateway() {
  const root = useRef<HTMLElement>(null);
  const { vh, pinST } = useAd();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".ad-panel", { y: () => vh() * 0.75, autoAlpha: 1 });
      gsap.set(".ad-trust", { autoAlpha: 0, y: 60 });
      gsap.set(".ad-g-head", { autoAlpha: 0, y: 30 });

      gsap
        .timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: pinST(root.current, "+=300%"),
        })
        .to(".ad-g-head", { autoAlpha: 1, y: 0, duration: 0.5 }, 0)
        .to(".ad-panel", { y: 0, duration: 1.2 }, 0)
        // image moves against the panel: parallax
        .fromTo(".ad-panel .ad-art", { yPercent: 10, scale: 1.15 }, { yPercent: -8, scale: 1, duration: 3, ease: "none" }, 0)
        .to({}, { duration: 0.5 })
        .to(".ad-panel", { y: () => -vh() * 0.58, duration: 1.1 }, ">")
        .to(".ad-g-head", { autoAlpha: 0, y: -50, duration: 0.6 }, "<")
        .to(".ad-trust", { autoAlpha: 1, y: 0, duration: 0.7 }, "<+.3")
        .to({}, { duration: 0.5 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="ad-stage" id="ad-s2" ref={root as any}>
      <div className="ad-g-head">
        <div className="ad-eyebrow">Studio class by Mira Ostrow</div>
        <h2>Gateway to<br />artist people.</h2>
      </div>
      <div className="ad-panel">
        <span className="ad-art" />
        <div className="ad-sq"><i /><i /></div>
        <button className="ad-pill ad-dark">Watch</button>
      </div>
      <div className="ad-trust">
        <h3>Trusted by the <span>best.</span></h3>
        <p>Our growth teams are experts in identifying and capitalizing on the next wave of art.</p>
        <div className="ad-logos">
          {LOGOS.map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. statement: sentence -> card stack -> staircase -> framed grid    */
/* ------------------------------------------------------------------ */

const SENTENCE =
  "Whether you're an artist looking to sell your work or a buyer seeking unique pieces, Atelier Drift connects you to a world of creativity and commerce.";
const VISION = "Our vision for any art technology.";
const INLINE_ICON: Record<string, number> = { connects: 3, "commerce.": 5 };

function Words({ text, icons }: { text: string; icons?: Record<string, number> }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <React.Fragment key={i}>
          {i > 0 && " "}
          <span className="ad-w">
            {w}
            {icons && icons[w] !== undefined && (
              <>
                {" "}
                <span className="ad-ib"><Icon n={icons[w]} /></span>
              </>
            )}
          </span>
        </React.Fragment>
      ))}
    </>
  );
}

function Statement() {
  const root = useRef<HTMLElement>(null);
  const { vw, pinST } = useAd();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const stage = root.current;
      const q = gsap.utils.selector(root);
      const tiles = q(".ad-tiles .ad-t") as any;
      const ws = q(".ad-statement .ad-w") as any;
      const vws = q(".ad-vision h2 .ad-w") as any;
      const icons = q(".ad-icons .ad-ico") as any;
      const chips = q(".ad-s3c") as any;
      const minis = q(".ad-minis i") as any;
      const mid = (tiles.length - 1) / 2;
      const small = () => vw() < 720;

      // position of an element's centre inside the stage, ignoring transforms
      const rel = (el: any) => {
        let x = 0, y = 0, e = el;
        while (e && e !== stage) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
        return { x, y };
      };
      // how far a tile must travel (from its grid cell) to land its centre on (px, py)
      const dx = (el: any, px: number) => px - (rel(el).x + el.offsetWidth / 2);
      const dy = (el: any, py: number) => py - (rel(el).y + el.offsetHeight / 2);
      const W = () => (stage as HTMLElement).clientWidth;
      const H = () => (stage as HTMLElement).clientHeight;

      gsap.set(".ad-vision", { autoAlpha: 0 });
      gsap.set(".ad-frame-bg, .ad-tabs", { autoAlpha: 0 });
      gsap.set(icons, { autoAlpha: 0, y: 50, scale: 0.6 });
      gsap.set(chips, { autoAlpha: 0, scale: 0.6 });
      gsap.set(tiles, { zIndex: (i: number) => i });

      gsap
        .timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: pinST(stage, "+=520%"),
        })
        // reading highlight
        .to(ws, { opacity: 1, duration: 0.4, stagger: 0.07, ease: "none" }, 0)
        // stack appears over the middle of the sentence
        .fromTo(
          tiles,
          { x: (i: number, el: any) => dx(el, W() / 2), y: (i: number, el: any) => dy(el, H() * 0.44), scale: 0.3, rotation: 0, autoAlpha: 0 },
          {
            x: (i: number, el: any) => dx(el, W() / 2) + (i - mid) * 7,
            y: (i: number, el: any) => dy(el, H() * 0.4) - (i - mid) * 5,
            scale: 1.05,
            rotation: (i: number) => (i - mid) * 5,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.07,
          },
          ">-.1"
        )
        .to(chips, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.1 }, "<+.4")
        .to({}, { duration: 0.5 })
        // diagonal staircase down-right, text clears
        .to(
          tiles,
          {
            x: (i: number, el: any) => dx(el, W() * (small() ? 0.2 : 0.3) + i * W() * (small() ? 0.1 : 0.085)),
            y: (i: number, el: any) => dy(el, H() * 0.3 + i * H() * 0.075),
            scale: () => (small() ? 0.9 : 1.3),
            rotation: -4,
            duration: 1.3,
            stagger: 0.05,
          },
          ">"
        )
        .to(ws, { opacity: 0, duration: 0.5, stagger: 0.01 }, "<")
        .to(minis, { autoAlpha: 0, duration: 0.3 }, "<")
        .to(chips, { x: (i: number) => (i ? 80 : -80), y: -30, duration: 1, autoAlpha: 0 }, "<+.4")
        .to({}, { duration: 0.5 })
        // settle into the framed grid, vision copy appears word by word
        .to(tiles, { x: 0, y: 0, scale: 1, rotation: 0, duration: 1.2, stagger: 0.05 }, ">")
        .to(".ad-frame-bg, .ad-tabs", { autoAlpha: 1, duration: 0.5 }, ">-.6")
        .to(".ad-vision", { autoAlpha: 1, duration: 0.3 }, "<")
        .to(vws, { opacity: 1, duration: 0.5, stagger: 0.12, ease: "none" }, "<")
        .to(icons, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08 }, "<+.2")
        .to({}, { duration: 0.8 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="ad-stage" id="ad-s3" ref={root as any}>
      <p className="ad-statement">
        <Words text={SENTENCE} icons={INLINE_ICON} />
      </p>
      <span className="ad-chip ad-b ad-s3c" style={{ left: "27%", top: "30%" }}>@alician</span>
      <span className="ad-chip ad-b ad-s3c" style={{ right: "22%", top: "34%" }}>@andrea</span>
      <div className="ad-minis">
        {[1, 6, 4].map((n) => <i key={n}><Icon n={n} /></i>)}
      </div>

      <div className="ad-vision">
        <h2><Words text={VISION} /></h2>
        <p>Every piece tells a story. Our tools let artists share the journey behind each work.</p>
        <button className="ad-pill ad-ghost">Read more</button>
      </div>

      <IconField className="ad-icons" positions={[[8, 52], [34, 20], [58, 66], [30, 78], [64, 24], [84, 56], [6, 12]]} />

      <div className="ad-frame">
        <div className="ad-frame-bg" />
        <div className="ad-tabs"><span>Business</span><b>Personal</b></div>
        <div className="ad-tiles">
          {Array.from({ length: 6 }, (_, i) => <Tile key={i} i={i + 7} className="ad-t" />)}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. community: avatars drift past at different depths                */
/* ------------------------------------------------------------------ */

function Community() {
  const root = useRef<HTMLElement>(null);
  const { vh, pinST } = useAd();

  // fixed layout: spread over six horizontal bands so nothing piles up
  const avatars = useMemo(() => {
    const R = rng(7);
    return Array.from({ length: 30 }, (_, k) => {
      const size = 72 + Math.round(R() * 64);
      const left = 2 + (k % 6) * 16 + R() * 8;
      const top = 6 + R() * 78;
      const depth = 0.5 + R() * 1.3;
      return { k, size, left, top, depth };
    });
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      gsap.set(".ad-title", { autoAlpha: 0, scale: 0.92 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: pinST(root.current, "+=300%"),
      });

      (q(".ad-av") as any).forEach((el: any, i: number) => {
        const d = avatars[i].depth; // deeper = travels further = looks closer
        tl.fromTo(
          el,
          { y: () => vh() * (0.55 + 0.4 * d), rotation: (d - 1) * -14, scale: 0.7 },
          { y: () => -vh() * (0.35 + 0.55 * d), rotation: (d - 1) * 14, scale: 1, duration: 3 },
          0
        );
      });
      tl.to(".ad-title", { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power2.out" }, 0.2);
    }, root);
    return () => ctx.revert();
  }, [avatars]);

  return (
    <section className="ad-stage" id="ad-s4" ref={root as any}>
      <div className="ad-title">
        <h2>You will find yourself among us</h2>
        <p>Dive into a dynamic community where artists and buyers swap work, notes and commissions.</p>
      </div>
      {avatars.map((a) => (
        <Tile
          key={a.k}
          i={a.k + 3}
          className="ad-av"
          style={{ width: a.size, height: a.size, left: a.left + "%", top: a.top + "%" }}
        />
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. marketplace: pinned section, horizontal track                    */
/* ------------------------------------------------------------------ */

const ITEMS = [
  ["Artesia Gap", "Print"],
  ["Immortalise Works", "Digital"],
  ["Creativity Class", "Mixed"],
  ["Celebrates Party", "Poster"],
  ["Static Bloom", "Print"],
  ["Halftone Hours", "Digital"],
  ["North Window", "Photo"],
];

function Marketplace() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { vw, vh, scroller, pinST } = useAd();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const dist = () => Math.max(0, (track.current as HTMLDivElement).scrollWidth - vw());
      const end = () => "+=" + (dist() + vh() * 0.4);

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: pinST(root.current, end),
        })
        .to(track.current, { x: () => -dist(), duration: 1 }, 0)
        .to(".ad-hbar span", { scaleX: 1, duration: 1 }, 0);

      // each image counter-moves inside its frame
      (gsap.utils.selector(root)("figure .ad-gt") as any).forEach((el: any, i: number) => {
        gsap.fromTo(
          el,
          { yPercent: () => (i % 2 ? 8 : -8) },
          {
            yPercent: () => (i % 2 ? -8 : 8),
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end, scrub: true, invalidateOnRefresh: true, scroller: scroller() },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="ad-stage" id="ad-s5" ref={root as any}>
      <div className="ad-track" ref={track}>
        <div className="ad-head">
          <h2>Marketplace for creativity</h2>
          <p>In the realm of Atelier Drift, creativity knows no bounds. Browse collections from makers around the world.</p>
          <button className="ad-pill">View all</button>
        </div>
        {ITEMS.map(([name, kind], i) => (
          <figure key={name}>
            <Tile i={i + 2} className="ad-gt" />
            <figcaption>{name}<span>{kind}</span></figcaption>
          </figure>
        ))}
      </div>
      <div className="ad-hbar"><span /></div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6. portrait grid: the centre card swells while the rest recede      */
/* ------------------------------------------------------------------ */

const CELLS = Array.from({ length: 15 }, (_, n) => ({ n, col: n % 5, center: n === 7 }));

function PortraitGrid() {
  const root = useRef<HTMLElement>(null);
  const { vw, vh, pinST } = useAd();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const c = (q(".ad-hc") as any)[0];
      const others = q(".ad-gt") as any;
      const small = () => vw() < 720;
      const target = () =>
        Math.min((vw() * (small() ? 0.78 : 0.3)) / c.offsetWidth, (vh() * 0.82) / c.offsetHeight);

      // columns enter from opposite sides depending on parity
      gsap.set(others, { y: (i: number, el: any) => (+el.dataset.col % 2 ? 1 : -1) * vh() * 0.5, autoAlpha: 0 });
      gsap.set(c, { scale: 0.9, autoAlpha: 0 });

      gsap
        .timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: pinST(root.current, "+=340%"),
        })
        .to(others, { y: 0, autoAlpha: 1, duration: 1, stagger: { each: 0.03, from: "center" } }, 0)
        .to(c, { autoAlpha: 1, scale: 1, duration: 0.8 }, 0.3)
        .to({}, { duration: 0.3 })
        .to(c, { scale: () => target(), duration: 1.1 }, ">")
        .to(others, { autoAlpha: 0.25, scale: 0.94, duration: 1.1 }, "<")
        .to({}, { duration: 0.5 })
        .to(c, { scale: () => target() * 0.62, duration: 0.9 }, ">")
        .to(others, { autoAlpha: 1, scale: 1, duration: 0.9 }, "<")
        .to({}, { duration: 0.4 })
        .to(".ad-grid", { yPercent: -130, duration: 1, ease: "power2.in" }, ">");
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="ad-stage" id="ad-s6" ref={root as any}>
      <div className="ad-grid">
        {CELLS.map(({ n, col, center }) =>
          center ? (
            <Tile key={n} i={0} className="ad-hc" data-col={col}>
              <span className="ad-tag">&hearts; Like</span>
              <div className="ad-who">Trisha Woodward <span>&middot; Atelier Drift</span></div>
            </Tile>
          ) : (
            <Tile key={n} i={n + 1} className="ad-gt" data-col={col} />
          )
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 7. membership: pricing cards slide in, lime ribbon swells           */
/* ------------------------------------------------------------------ */

const PLANS = [
  { name: "Monthly", price: 9, note: "Billed monthly" },
  { name: "Quarterly", price: 24, note: "Billed every 3 months", hot: true },
  { name: "Annually", price: 84, note: "Billed yearly" },
];

const MARQUEE = ["Inspired by people", "New art platform", "Made to be collected"];

function Membership() {
  const root = useRef<HTMLElement>(null);
  const marq = useRef<HTMLDivElement>(null);
  const { vh, pinST } = useAd();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const plans = q(".ad-plan") as any;
      const icos = q(".ad-bico .ad-ico") as any;

      gsap.set(plans, { y: () => vh(), rotation: (i: number) => (i - 1) * 10, autoAlpha: 1 });
      gsap.set(".ad-mem", { autoAlpha: 0, x: -40 });
      gsap.set(icos, { autoAlpha: 0, scale: 0.2, rotation: -30 });
      gsap.set(".ad-bigmark", { autoAlpha: 0, rotation: -40 });

      gsap
        .timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: pinST(root.current, "+=400%"),
        })
        .to(".ad-mem", { autoAlpha: 1, x: 0, duration: 0.6 }, 0)
        .to(plans, { y: 0, rotation: (i: number) => (i - 1) * -3, duration: 1, stagger: 0.12 }, 0)
        // marquee text is scrubbed by scroll, not time
        .to(marq.current, { x: () => -(marq.current as HTMLDivElement).scrollWidth / 2, duration: 4, ease: "none" }, 0)
        .to({}, { duration: 0.5 })
        .to(".ad-band", { height: () => vh() * 0.8, duration: 1.3 }, ">")
        .to([".ad-mem", ".ad-plans"], { autoAlpha: 0, duration: 0.8 }, "<+.4")
        .to(".ad-bigmark", { autoAlpha: 1, rotation: 0, duration: 1 }, "<")
        .to(icos, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.5, stagger: { each: 0.06, from: "random" } }, "<+.5")
        .to({}, { duration: 0.9 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="ad-stage" id="ad-s7" ref={root as any}>
      <div className="ad-mem">
        <h2>Membership</h2>
        <p>Offering buyers a chance to own a piece of the narrative. Pick the plan that fits how you collect.</p>
      </div>

      <div className="ad-plans">
        {PLANS.map((p) => (
          <div className={"ad-plan" + (p.hot ? " ad-hot" : "")} key={p.name}>
            <small>{p.name}</small>
            {p.hot && <i>Popular</i>}
            <b><sup>$</sup>{p.price}</b>
            <small>{p.note}</small>
          </div>
        ))}
      </div>

      <div className="ad-band">
        <div className="ad-bigmark" aria-hidden="true">&#10058;</div>
        <IconField
          className="ad-bico"
          positions={[[6, 14], [16, 48], [26, 22], [38, 64], [47, 30], [58, 70], [68, 18], [76, 52], [88, 28], [92, 72], [12, 78], [54, 8]]}
        />
        {/* text is rendered twice so translating by -50% loops seamlessly */}
        <div className="ad-marq" ref={marq} aria-label="Inspired by people. New art platform.">
          {[0, 1].map((rep) => (
            <span key={rep}>
              {MARQUEE.map((t, k) => (
                <span key={t} style={{ display: "contents" }}>
                  {t} <Tile as="i" i={rep * 3 + k + 1} className="ad-mini" />{" "}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 8. finale: two panels lift in at different speeds (no pin)          */
/* ------------------------------------------------------------------ */

function Finale() {
  const root = useRef<HTMLElement>(null);
  const { vh, scroller } = useAd();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      (gsap.utils.selector(root)(".ad-fp") as any).forEach((p: any, i: number) => {
        gsap.fromTo(
          p,
          { y: () => vh() * (i ? 0.38 : 0.22) },
          {
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 20%", scrub: true, invalidateOnRefresh: true, scroller: scroller() },
          }
        );
        gsap.fromTo(
          p.querySelector(".ad-vis"),
          { yPercent: -8 },
          { yPercent: 8, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true, scroller: scroller() } }
        );
        gsap.from(p.querySelector(".ad-copy"), {
          y: 50, autoAlpha: 0, scale: 0.96, ease: "power2.out",
          scrollTrigger: { trigger: p, start: "top 60%", end: "top 20%", scrub: true, scroller: scroller() },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="ad-s8" ref={root as any}>
      <article className="ad-fp ad-one">
        <div className="ad-vis"><span className="ad-art" /></div>
        <div className="ad-copy">
          <h3>Meets new people</h3>
          <p>Creators and collectors share ideas, discover work and trade pieces.</p>
          <button className="ad-pill">Let's meet</button>
        </div>
      </article>
      <article className="ad-fp ad-two">
        <div className="ad-vis" />
        <div className="ad-copy">
          <h3>Archive of new arts</h3>
          <p>Atelier Drift keeps every release in one searchable, collectable library.</p>
          <button className="ad-pill">Archive</button>
        </div>
      </article>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Nav                                                                 */
/* ------------------------------------------------------------------ */

const LINKS: [string, string][] = [
  ["Get started", "ad-s1"],
  ["Marketplace", "ad-s5"],
  ["Pricing", "ad-s7"],
  ["Contact", "ad-s8"],
];

function Nav() {
  const { scrollRef, compact } = useContext(ScrollCtx);

  // jump to a pinned section's real start position (pin spacers shift the layout)
  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const st = ScrollTrigger.getAll().find((s) => s.trigger === el && (s as any).pin);
    const scrollEl = compact ? scrollRef.current : null;
    let top: number;
    if (st) {
      top = st.start;
    } else {
      const offset = scrollEl ? scrollEl.scrollTop : window.scrollY;
      const base = scrollEl ? scrollEl.getBoundingClientRect().top : 0;
      top = el.getBoundingClientRect().top - base + offset;
    }
    if (scrollEl) scrollEl.scrollTo({ top, behavior: "smooth" });
    else window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav className="ad-nav" aria-label="Main">
      <a className="ad-brand" href="#ad-s1" onClick={(e) => { e.preventDefault(); goTo("ad-s1"); }}>
        <i />Atelier Drift
      </a>
      <ul>
        {LINKS.map(([label, id]) => (
          <li key={id}>
            <a href={"#" + id} onClick={(e) => { e.preventDefault(); goTo(id); }}>{label}</a>
          </li>
        ))}
      </ul>
      <div className="ad-dots" aria-hidden="true"><span /><span /></div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export interface AtelierDriftProps {
  /** Library-preview mode: the whole site runs inside a self-contained scroll column. */
  compact?: boolean;
  /** In compact mode, float a "Full Preview" pill that opens the full-screen demo in a new tab. */
  showDemoButton?: boolean;
  /** Additional class names for the root container. */
  className?: string;
}

export const AtelierDrift: React.FC<AtelierDriftProps> = ({
  compact = false,
  showDemoButton = false,
  className = "",
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const ctxValue = useMemo<AdCtxValue>(() => ({ scrollRef, compact }), [compact]);

  // page-wide progress bar
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(barRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: true, scroller: compact ? scrollRef.current || undefined : undefined },
      });
    }, rootRef);
    return () => ctx.revert();
  }, [compact]);

  // In the library preview the column is nested inside an `overflow-hidden`
  // stage, so a pointer-wheel over it can be swallowed by the host. Drive the
  // column ourselves and only hand the gesture back to the page at an edge.
  useEffect(() => {
    if (!compact) return;
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      const max = el.scrollHeight - el.clientHeight;
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      if (max <= 1 || delta === 0) return;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop >= max - 1;
      if ((delta < 0 && atTop) || (delta > 0 && atBottom)) return;
      event.preventDefault();
      event.stopPropagation();
      el.scrollTop = Math.max(0, Math.min(max, el.scrollTop + delta));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [compact]);

  // derive the 1%-of-container units the CSS lays out against, then refresh pins
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const setUnits = () => {
      const w = compact && scrollRef.current ? scrollRef.current.clientWidth : window.innerWidth;
      const h = compact && scrollRef.current ? scrollRef.current.clientHeight : window.innerHeight;
      root.style.setProperty("--ad-vw1", w / 100 + "px");
      root.style.setProperty("--ad-vh1", h / 100 + "px");
      ScrollTrigger.refresh();
    };
    setUnits();

    let ro: ResizeObserver | undefined;
    if (compact && typeof ResizeObserver !== "undefined" && scrollRef.current) {
      ro = new ResizeObserver(setUnits);
      ro.observe(scrollRef.current);
    }
    window.addEventListener("resize", setUnits);
    return () => {
      window.removeEventListener("resize", setUnits);
      if (ro) ro.disconnect();
    };
  }, [compact]);

  // pin positions depend on fonts and images, so re-measure once they settle
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  const backToTop = () => {
    if (compact && scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openFullPreview = () => {
    window.open("/demo/atelier-drift", "_blank", "noopener,noreferrer");
  };

  return (
    <div
      ref={rootRef}
      className={"ad-root" + (compact ? " ad-compact" : "") + (className ? " " + className : "")}
    >
      <div className="ad-progress" ref={barRef} />
      {compact && showDemoButton && (
        <button
          type="button"
          className="ad-open-full"
          onClick={openFullPreview}
          aria-label="Open full preview in a new tab"
        >
          <span>Full Preview</span>
          <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
          </svg>
        </button>
      )}
      <ScrollCtx.Provider value={ctxValue}>
        <Nav />
        <div className="ad-scroll" ref={scrollRef}>
          <main className="ad-main">
            {/* Order matters: ScrollTrigger measures pins top to bottom, so sections mount in page order. */}
            <Hero />
            <Gateway />
            <Statement />
            <Community />
            <Marketplace />
            <PortraitGrid />
            <Membership />
            <Finale />
          </main>
          <footer className="ad-footer">
            <span>Atelier Drift. Sample site built to demonstrate a scroll sequence.</span>
            <button onClick={backToTop}>Back to top</button>
          </footer>
        </div>
      </ScrollCtx.Provider>
    </div>
  );
};

export default AtelierDrift;
