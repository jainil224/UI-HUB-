// Card Cascade — UI HUB
import { useEffect, useRef, useState, type ComponentType } from "react";
import { useIsMobile } from "../../hooks/use-mobile";
import {
  SiMongodb,
  SiExpress,
  SiReact,
  SiNodedotjs,
  SiHtml5,
  SiCss,
  SiJavascript,
  SiTailwindcss,
  SiJsonwebtokens,
  SiGit,
  SiGithub,
  SiNpm,
  SiYarn,
  SiPostman,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import { Globe, Layers, Shield } from "lucide-react";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type Skill = {
  name: string;
  Icon: ComponentType<{ className?: string }>;
  color?: string;
};

type SlideCard = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  skills: Skill[];
  theme: "red" | "dark" | "light" | "accent";
};

/* ================================================================== */
/*  Data                                                               */
/* ================================================================== */

const slideCards: SlideCard[] = [
  {
    id: "mern",
    label: "MERN Stack",
    shortLabel: "MERN",
    description:
      "End-to-end JavaScript stack for building scalable, production-grade web applications.",
    skills: [
      { name: "MongoDB", Icon: SiMongodb, color: "#47A248" },
      { name: "Express.js", Icon: SiExpress, color: "#ffffff" },
      { name: "React", Icon: SiReact, color: "#61DAFB" },
      { name: "Node.js", Icon: SiNodedotjs, color: "#5FA04E" },
    ],
    theme: "red",
  },
  {
    id: "frontend",
    label: "Frontend Development",
    shortLabel: "FRONT",
    description:
      "Crafting responsive, accessible interfaces with modern markup, styling, and interaction patterns.",
    skills: [
      { name: "HTML5", Icon: SiHtml5, color: "#E34F26" },
      { name: "CSS3", Icon: SiCss, color: "#663399" },
      { name: "JavaScript", Icon: SiJavascript, color: "#F7DF1E" },
      { name: "Tailwind CSS", Icon: SiTailwindcss, color: "#06B6D4" },
    ],
    theme: "dark",
  },
  {
    id: "backend",
    label: "Backend & APIs",
    shortLabel: "API",
    description:
      "Designing secure REST APIs, authentication flows and clean server architectures.",
    skills: [
      { name: "REST APIs", Icon: Globe, color: "#3b82f6" },
      { name: "JWT Auth", Icon: SiJsonwebtokens, color: "#D63AFF" },
      { name: "MVC", Icon: Layers, color: "#22d3ee" },
      { name: "Security", Icon: Shield, color: "#22c55e" },
    ],
    theme: "light",
  },
  {
    id: "tools",
    label: "Development Tools",
    shortLabel: "TOOLS",
    description:
      "Everyday tooling for version control, package management, testing, and shipping code.",
    skills: [
      { name: "Git", Icon: SiGit, color: "#F05032" },
      { name: "GitHub", Icon: SiGithub, color: "#ffffff" },
      { name: "npm", Icon: SiNpm, color: "#CB3837" },
      { name: "Yarn", Icon: SiYarn, color: "#2C8EBB" },
      { name: "Postman", Icon: SiPostman, color: "#FF6C37" },
      { name: "VS Code", Icon: VscVscode, color: "#007ACC" },
    ],
    theme: "accent",
  },
];

/* ================================================================== */
/*  Per-card unique layout renderers                                   */
/* ================================================================== */

/** Unified Card Layout based on the MERN card design */
function CardLayout({ card, index }: { card: SlideCard; index: number }) {
  const isLight = card.theme === "light";
  
  // Dynamic colors based on theme
  const textPrimary = isLight ? "text-black/90" : "text-white";
  const textSecondary = isLight ? "text-black/50" : "text-white/50";
  const textTertiary = isLight ? "text-black/40" : "text-white/40";
  const borderCol = isLight ? "border-black/15" : "border-white/15";
  const iconBg = isLight ? "bg-black/5 border-black/10" : "bg-white/10 border-white/10";
  const iconText = isLight ? "text-black/70" : "text-white/70";
  const bigNumColor = isLight ? "text-black/[0.04]" : "text-white/[0.08]";
  const stripe = isLight ? "from-black/10 via-black/5" : "from-white/30 via-white/10";

  return (
    <div className="relative w-full h-full overflow-hidden flex">
      {/* Left side — content */}
      <div className="relative z-10 flex flex-col justify-between p-7 w-[60%]">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-[0.35em] ${textSecondary}`}>
            0{index + 1} / 04
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${textSecondary} border ${borderCol} rounded-full px-2.5 py-0.5`}>
            {card.skills.length} Skills
          </span>
        </div>
        
        <div>
          <p className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${textTertiary} mb-2`}>
            {card.shortLabel}
          </p>
          <h3 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${textPrimary} leading-none`}>
            {card.label}
          </h3>
          <p className={`mt-3 text-[11px] leading-relaxed ${textSecondary} max-w-[200px]`}>
            {card.description}
          </p>
        </div>
        
        <div className="flex flex-col gap-1.5">
          {card.skills.map((s) => (
            <div key={s.name} className="flex items-center gap-2.5">
              <div
                className={`grid h-7 w-7 place-items-center rounded-lg ${iconBg}`}
                style={{ color: s.color }}
              >
                <s.Icon className="h-3.5 w-3.5" />
              </div>
              <span className={`text-[11px] font-semibold ${iconText} uppercase tracking-wider`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right side — giant cropped number */}
      <div
        className={`absolute right-[-30px] top-1/2 -translate-y-1/2 font-black ${bigNumColor} leading-none select-none pointer-events-none`}
        style={{ fontSize: "clamp(220px, 35vw, 380px)" }}
      >
        {index + 1}
      </div>
      
      {/* Accent stripe */}
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${stripe} to-transparent`} />
    </div>
  );
}

function CardContent({ card, index }: { card: SlideCard; index: number }) {
  return <CardLayout card={card} index={index} />;
}

/* ================================================================== */
/*  Theme styles                                                       */
/* ================================================================== */

const themeShell: Record<
  SlideCard["theme"],
  { bg: string; border: string; shadow: string }
> = {
  red: {
    bg: "linear-gradient(145deg, #dc2626 0%, #991b1b 100%)",
    border: "rgba(255,255,255,0.12)",
    shadow: "0 30px 80px rgba(220,38,38,0.25), 0 15px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
  },
  dark: {
    bg: "linear-gradient(145deg, #0a0a0a 0%, #171717 100%)",
    border: "rgba(255,255,255,0.08)",
    shadow: "0 30px 80px rgba(0,0,0,0.5), 0 15px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  light: {
    bg: "linear-gradient(145deg, #fafafa 0%, #e5e5e5 100%)",
    border: "rgba(0,0,0,0.06)",
    shadow: "0 30px 80px rgba(0,0,0,0.2), 0 15px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
  },
  accent: {
    bg: "linear-gradient(145deg, #18181b 0%, #27272a 100%)",
    border: "rgba(255,255,255,0.08)",
    shadow: "0 30px 80px rgba(0,0,0,0.4), 0 15px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
};

/* ================================================================== */
/*  Icon Rail — vertical marquee on the right                          */
/* ================================================================== */

function IconRail({ skills, isActive, isMobile }: { skills: Skill[]; isActive: boolean; isMobile?: boolean }) {
  // Duplicate skills for seamless loop
  const doubled = [...skills, ...skills, ...skills];
  return (
    <div
      className="absolute right-3 sm:right-10 top-1/2 z-20 flex flex-col items-center"
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? "translate(0, -50%)" : "translate(20px, -50%)",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      {/* Masked container for infinite scroll */}
      <div
        className="relative overflow-hidden"
        style={{
          height: isMobile ? "240px" : "360px",
          width: isMobile ? "70px" : "90px",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      >
        <div
          className={`flex flex-col items-center ${isMobile ? "gap-2" : "gap-3"}`}
          style={{
            animation: isActive ? "iconMarqueeDown 12s linear infinite" : "none",
          }}
        >
          {doubled.map((skill, i) => (
            <div
              key={`${skill.name}-${i}`}
              className={`grid shrink-0 place-items-center rounded-[1.2rem] border border-white/10 bg-white/[0.04] backdrop-blur-sm ${isMobile ? "h-[3.25rem] w-[3.25rem]" : "h-20 w-20"}`}
              style={{ color: skill.color }}
              title={skill.name}
            >
              <skill.Icon className={isMobile ? "h-6 w-6" : "h-10 w-10"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main Component — Semi-circular scroll-driven cascade               */
/* ================================================================== */
export function CardCascade({ preview = false }: { preview?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [entered, setEntered] = useState(false);

  const total = slideCards.length;

  // Scroll tracking — rAF-throttled to avoid excessive re-renders. In preview
  // mode there is no page scroll (the component is boxed inside a fixed-height
  // preview), so the progress is auto-driven instead: it eases through all
  // cards, pauses on each, then loops.
  useEffect(() => {
    if (preview) {
      setEntered(true);
      let rafId = 0;
      let last = performance.now();
      const START_HOLD = 1200; // let the cascade-in finish before moving
      const CARD_HOLD = 1000;  // dwell on each card

      const frame = (now: number) => {
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
        last = now;

        setScrollProgress((prev) => {
          // Hold on the first card long enough to see the entrance animation.
          const hold = prev === 0 ? START_HOLD : CARD_HOLD;
          const eased = Math.min(1, prev + dt / (hold / 1000));
          // Loop back to the start once the last card has had its dwell.
          const next = prev >= 1 - 1e-6 ? 0 : eased;
          return next;
        });

        rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(rafId);
    }

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const el = sectionRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const sectionHeight = el.offsetHeight - window.innerHeight;
        if (sectionHeight <= 0) return;

        const raw = -rect.top / sectionHeight;
        const clamped = Math.max(0, Math.min(1, raw));
        setScrollProgress(clamped);

        // Enter when section is visible in the viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setEntered(true);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Run on mount + small delay to ensure layout is ready
    onScroll();
    const t = setTimeout(onScroll, 100);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [preview]);

  // Continuous active position (0..total-1)
  const activeFloat = scrollProgress * (total - 1);
  const activeIndex = Math.round(activeFloat);

  /* --------------------------------------------------------------- */
  /*  Semi-circle arc maths                                           */
  /*                                                                   */
  /*  Imagine a circle whose centre is far to the LEFT of the cards.  */
  /*  Cards sit on the right edge of that circle, so as they move     */
  /*  up/down they curve slightly to the left — creating the arc.     */
  /*                                                                   */
  /*  offset = card's distance from the "active" centre position      */
  /*  angle  = offset mapped to radians on the arc                    */
  /*  x      = R·cos(angle)  (horizontal curve)                       */
  /*  y      = R·sin(angle)  (vertical spread)                        */
  /*  rot    = tangent angle  (cards tilt with the curve)              */
  /* --------------------------------------------------------------- */

  const ARC_RADIUS = isMobile ? 1200 : 900;        // px — bigger = gentler curve
  const ANGLE_PER_CARD = 0.28;   // radians (~16°) between cards
  const CARD_WIDTH = isMobile ? "min(85vw, 310px)" : "clamp(310px, 42vw, 440px)";
  const CARD_HEIGHT = isMobile ? "min(60vh, 420px)" : "clamp(380px, 50vh, 540px)";

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative w-full bg-black"
      style={{ height: preview ? "100%" : `${(total + 1) * 100}vh` }}
    >
      {/* ===== Sticky viewport ===== */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">

        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cascade-bg-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cascade-bg-grid)" />
          </svg>
        </div>

        {/* Header */}
        <div
          className="relative z-10 pt-10 sm:pt-16 pb-2 text-center"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.4em]" style={{ color: "rgba(255,255,255,0.3)" }}>
            What I Work With
          </p>
          <h2
            className="mt-3 text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-widest text-white px-2 sm:px-4"
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
            }}
          >
            TECHNICAL SKILLS
          </h2>
        </div>

        {/* ===== 3D Arc Stage ===== */}
        <div
          className="relative z-10 flex items-center justify-center"
          style={{
            height: "calc(100vh - 140px)",
            perspective: "1800px",
            perspectiveOrigin: "40% 50%",
          }}
        >
          {/* Card container — positioned to the left of center so the icon rail fits on the right */}
          <div
            className="relative"
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              transformStyle: "preserve-3d",
              marginRight: isMobile ? "35px" : "80px",
            }}
          >
            {slideCards.map((card, i) => {
              const shell = themeShell[card.theme];
              const offset = i - activeFloat; // distance from active centre

              // Arc positioning
              const angle = offset * ANGLE_PER_CARD;
              // Y = vertical position along the arc
              const yPos = ARC_RADIUS * Math.sin(angle);
              // X = horizontal curve (cards at center bulge right, edges go left)
              const xPos = ARC_RADIUS * (Math.cos(angle) - 1);
              // Rotation follows the tangent of the arc
              const rotZ = -(angle * 180) / Math.PI; // convert radians to degrees

              // Distance-based effects
              const dist = Math.abs(offset);
              const scale = Math.max(0.7, 1 - dist * 0.08);
              const opacity = Math.max(0, 1 - dist * 0.4);
              const blur = Math.min(6, dist * 2);
              const zIdx = 100 - Math.round(dist * 10);

              // Entry animation
              let entryTy = 0, entryRz = 0, entryScale = 1, entryOpacity = 1, entryBlur = 0;
              const entryTx = 0;
              if (!entered) {
                entryTy = -800 + i * 50;
                entryRz = -30 + i * 8;
                entryScale = 0.8;
                entryOpacity = 0;
                entryBlur = 10;
              }

              const finalX = entered ? xPos : entryTx;
              const finalY = entered ? yPos : entryTy;
              const finalRz = entered ? rotZ : entryRz;
              const finalScale = entered ? scale : entryScale;
              const finalOpacity = entered ? opacity : entryOpacity;
              const finalBlur = entered ? blur : entryBlur;

              return (
                <div
                  key={card.id}
                  className="absolute inset-0"
                  style={{
                    zIndex: zIdx,
                    transformStyle: "preserve-3d",
                    transform: `translate3d(${finalX}px, ${finalY}px, 0px) rotateZ(${finalRz}deg) scale(${finalScale})`,
                    opacity: Math.max(0, finalOpacity),
                    filter: `blur(${finalBlur}px)`,
                    transition: entered
                      ? "transform 0.15s ease-out, opacity 0.15s ease-out, filter 0.15s ease-out"
                      : `transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s, opacity 0.6s ease-out ${i * 0.15}s, filter 0.8s ease-out ${i * 0.15}s`,
                    willChange: "transform, opacity, filter",
                  }}
                >
                  <div
                    className="w-full h-full rounded-2xl overflow-hidden relative"
                    style={{
                      background: shell.bg,
                      border: `1px solid ${shell.border}`,
                      boxShadow: shell.shadow,
                    }}
                  >
                    {/* Grid overlay */}
                    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }}>
                      <svg width="100%" height="100%">
                        <defs>
                          <pattern id={`cg-${card.id}`} width="25" height="25" patternUnits="userSpaceOnUse">
                            <path d="M 25 0 L 0 0 0 25" fill="none" stroke={card.theme === "light" ? "#000" : "#fff"} strokeWidth="0.3" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#cg-${card.id})`} />
                      </svg>
                    </div>
                    <CardContent card={card} index={i} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== Icon Rails (one per card, only active one visible) ===== */}
          {slideCards.map((card, i) => (
            <IconRail
              key={card.id}
              skills={card.skills}
              isActive={entered && i === activeIndex}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* ===== Left-side progress indicator ===== */}
        <div
          className="absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4"
          style={{
            opacity: entered ? 1 : 0,
            transition: "opacity 0.8s ease-out 0.5s",
          }}
        >
          {/* Dot indicators */}
          <div className="flex flex-col items-center gap-3">
            {slideCards.map((_, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={i}
                  className="relative flex items-center justify-center"
                  style={{ transition: "all 0.3s ease-out" }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: isActive ? "10px" : "6px",
                      height: isActive ? "10px" : "6px",
                      background: isActive ? "#ffffff" : "rgba(255,255,255,0.2)",
                      boxShadow: isActive ? "0 0 12px rgba(255,255,255,0.3)" : "none",
                      transition: "all 0.3s ease-out",
                    }}
                  />
                </div>
              );
            })}
          </div>
          {/* Counter */}
          <span className="text-[11px] font-bold text-white/50 tabular-nums">
            {String(activeIndex + 1).padStart(2, "0")}
            <span className="text-white/20"> / </span>
            {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* ===== Active card label — bottom left ===== */}
        <div
          className="absolute bottom-8 left-6 sm:left-10 z-20"
          style={{
            opacity: entered ? 1 : 0,
            transition: "opacity 0.8s ease-out 0.5s",
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/25 block mb-1">
            Category
          </span>
          <span
            key={activeIndex}
            className="text-base sm:text-lg font-black uppercase tracking-tight text-white/80 block"
            style={{ animation: "fadeSlideIn 0.35s ease-out" }}
          >
            {slideCards[activeIndex].label}
          </span>
        </div>

        {/* ===== Scroll hint ===== */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          style={{
            opacity: entered && activeIndex < total - 1 ? 0.4 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/50">
            Scroll to explore
          </span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-white/50" style={{ animation: "scrollDot 1.8s ease-in-out infinite" }} />
          </div>
        </div>

      </div>

      {/* ===== Keyframes ===== */}
      <style>{`
        @keyframes scrollDot {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(6px); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes iconMarqueeDown {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.333%); }
        }
      `}</style>
    </section>
  );
}

export default CardCascade;
