import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, X, RotateCcw } from 'lucide-react';

// ============================================================================
// 1. BOTTOM CURVED TYPOGRAPHY (Kinetic SVG TextPath Arc)
// ============================================================================
interface BottomCurvedTextProps {
  parallaxX: number;
}

export const BottomCurvedText: React.FC<BottomCurvedTextProps> = ({ parallaxX }) => {
  const shouldReduceMotion = useReducedMotion();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;

    let animId: number;
    let start: number | null = null;
    const speed = 0.015;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      setOffset((elapsed * speed) % 1000);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [shouldReduceMotion]);

  return (
    <div
      className="w-full overflow-hidden pointer-events-none select-none relative -mt-4 sm:-mt-6 pb-2"
      style={{
        transform: `translate3d(${parallaxX * 1.5}px, 0, 0)`,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 220"
        className="w-full h-[120px] sm:h-[160px] md:h-[190px] overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path id="textArcCurve" d="M -300 240 Q 720 -30 1740 240" />
        </defs>

        <text
          fill="#111111"
          opacity="0.08"
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontWeight: 800,
            fontSize: '56px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          <textPath
            href="#textArcCurve"
            startOffset={shouldReduceMotion ? '10%' : `${15 - (offset % 800) / 16}%`}
          >
            PUT BACK GIVING BACK TO THE BUILDERS • 2586 LABS • DEFINITELY NOT A CULT • GO BACK AGAIN • PUT BACK GIVING
          </textPath>
        </text>
      </svg>
    </div>
  );
};

// ============================================================================
// 2. TWO-COLUMN BLACK SPLIT PANEL
// ============================================================================
interface SplitPanelProps {
  parallaxX: number;
  parallaxY: number;
}

export const SplitPanel: React.FC<SplitPanelProps> = ({ parallaxX, parallaxY }) => {
  return (
    <div
      className="relative z-10 w-full max-w-[690px] mx-auto bg-[#111111] rounded-[10px] sm:rounded-[12px] border border-[#262626] shadow-[0_18px_40px_-15px_rgba(0,0,0,0.35)] overflow-hidden transition-transform duration-200"
      style={{
        transform: `translate3d(${parallaxX * 2}px, ${parallaxY * 1.5}px, 0)`,
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_0.6px,transparent_0.6px)] [background-size:16px_16px]" />

      <div className="grid grid-cols-1 md:grid-cols-2 relative">
        {/* Column 01: Devfolio */}
        <div className="p-6 sm:p-8 flex flex-col justify-between min-h-[330px] sm:min-h-[360px] relative border-b md:border-b-0 md:border-r border-[#2A2A2A]">
          <div>
            <span className="font-mono text-[10.5px] text-[#6A6A6A] font-semibold tracking-wider">
              01.
            </span>
            <h2 className="mt-3.5 text-[#FAFAF8] text-[17.5px] sm:text-[19px] font-semibold leading-[1.3] tracking-tight max-w-[270px]">
              We are creating a vibrant builder ecosystem with{' '}
              <span className="text-white font-bold underline decoration-[#444444] underline-offset-4">
                Devfolio.
              </span>
            </h2>

            <div className="mt-4.5">
              <a
                href="https://devfolio.co"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 bg-[#FAFAF8] hover:bg-neutral-200 active:bg-neutral-300 text-[#111111] text-[10.5px] font-semibold px-3.5 py-1 rounded-full transition-all duration-150 shadow-xs hover:shadow-sm group cursor-pointer"
              >
                <span className="tracking-tight">devfolio.co</span>
                <ArrowUpRight className="w-2.5 h-2.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          <div className="mt-4 flex justify-center items-center w-full h-[120px] sm:h-[135px] select-none pointer-events-none opacity-75 hover:opacity-100 transition-opacity">
            <svg
              viewBox="0 0 160 120"
              className="w-[140px] h-[105px] overflow-visible"
              fill="none"
              stroke="#555555"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 52 24 C 86 16, 120 40, 124 74 C 126 94, 110 106, 88 106 C 64 106, 44 94, 42 74 Z" stroke="#404040" />
              <path d="M 52 24 C 66 40, 70 70, 48 98" stroke="#666666" strokeWidth="1.1" />
              <path d="M 48 98 C 76 102, 110 96, 116 78 C 120 54, 94 32, 64 28" stroke="#4C4C4C" />
              <path d="M 54 36 C 80 40, 102 56, 106 76" stroke="#383838" strokeWidth="0.75" />
              <path d="M 56 46 C 78 50, 96 64, 100 80" stroke="#383838" strokeWidth="0.75" />
              <path d="M 58 56 C 76 60, 90 72, 94 84" stroke="#383838" strokeWidth="0.75" />
              <path d="M 44 98 L 48 102 L 56 104" stroke="#606060" />
              <ellipse cx="80" cy="108" rx="42" ry="4" fill="#0A0A0A" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* Column 02: Fold */}
        <div className="p-6 sm:p-8 flex flex-col justify-between min-h-[330px] sm:min-h-[360px] relative">
          <div>
            <span className="font-mono text-[10.5px] text-[#6A6A6A] font-semibold tracking-wider">
              02.
            </span>
            <h2 className="mt-3.5 text-[#FAFAF8] text-[17.5px] sm:text-[19px] font-semibold leading-[1.3] tracking-tight max-w-[270px]">
              We are making personal finance delightful, simple and easy with{' '}
              <span className="text-white font-bold underline decoration-[#444444] underline-offset-4">
                Fold.
              </span>
            </h2>

            <div className="mt-4.5">
              <a
                href="https://fold.money"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 bg-[#FAFAF8] hover:bg-neutral-200 active:bg-neutral-300 text-[#111111] text-[10.5px] font-semibold px-3.5 py-1 rounded-full transition-all duration-150 shadow-xs hover:shadow-sm group cursor-pointer"
              >
                <span className="tracking-tight">fold.money</span>
                <ArrowUpRight className="w-2.5 h-2.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          <div className="mt-4 flex justify-center items-center w-full h-[120px] sm:h-[135px] select-none pointer-events-none opacity-75 hover:opacity-100 transition-opacity">
            <svg
              viewBox="0 0 160 120"
              className="w-[140px] h-[105px] overflow-visible"
              fill="none"
              stroke="#555555"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="80" cy="62" r="44" stroke="#4C4C4C" strokeWidth="1" />
              <path d="M 80 18 C 102 18, 118 36, 118 58 C 118 78, 102 96, 88 102 C 76 96, 68 76, 76 54 C 80 42, 88 32, 80 18 Z" stroke="#666666" strokeWidth="1.1" />
              <path d="M 84 32 C 96 42, 104 56, 104 70 C 104 82, 94 94, 84 98" stroke="#444444" strokeWidth="0.75" />
              <path d="M 44 48 C 50 42, 60 40, 70 42" stroke="#363636" strokeWidth="0.6" />
              <path d="M 40 58 C 48 52, 58 50, 68 52" stroke="#363636" strokeWidth="0.6" />
              <ellipse cx="80" cy="110" rx="38" ry="4" fill="#0A0A0A" opacity="0.6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. FLOATING YELLOW ANNOUNCEMENT NOTE
// ============================================================================
interface YellowCardProps {
  parallaxX: number;
  parallaxY: number;
}

export const YellowCard: React.FC<YellowCardProps> = ({ parallaxX, parallaxY }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <div className="relative z-20 flex justify-center -mb-3">
        <button
          type="button"
          onClick={() => setIsVisible(true)}
          className="flex items-center gap-1.5 bg-[#F6D238] hover:bg-[#ebcb35] text-[#111111] text-[9.5px] font-semibold px-2.5 py-1 rounded-full shadow-sm cursor-pointer transition-transform hover:scale-105"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Show announcement ($2.5M note)</span>
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.95 }}
        style={{
          transform: `translate3d(${parallaxX * 4}px, ${parallaxY * 3}px, 0)`,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="relative z-20 w-full max-w-[325px] sm:max-w-[340px] mx-auto bg-[#F6D238] rounded-[7px] p-3 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.18)] select-none border border-[#E5BE22]/60"
      >
        <div className="flex items-center justify-between text-[#111111] pb-1 mb-1.5 border-b border-[#111111]/10">
          <div className="flex items-center gap-1.5 text-[8.5px] font-semibold tracking-wide">
            <span className="inline-flex items-center gap-1 bg-[#111111] text-white px-1.5 py-[1px] rounded-[3px] text-[7.5px] font-mono uppercase tracking-wider">
              <span className="w-1 h-1 rounded-full bg-[#F6D238] animate-pulse" />
              NOTE
            </span>
            <span className="opacity-40">•</span>
            <span className="font-mono text-[8px] opacity-75">MAY '23</span>
            <span className="opacity-40">•</span>
            <span className="uppercase text-[8px] tracking-wider opacity-85 font-mono">ANNOUNCEMENT</span>
          </div>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#111111]/15 active:bg-[#111111]/25 text-[#111111] transition-colors cursor-pointer"
            aria-label="Dismiss note"
          >
            <X className="w-2.5 h-2.5 stroke-[2.5]" />
          </button>
        </div>

        <p className="text-[#111111] text-[11px] leading-[1.35] font-medium tracking-tight">
          We have raised $2.5M to build stellar personal finance products for India
        </p>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// 4. CENTER ISOMETRIC 3D OBJECT (THE HERO PIECE - 100% PRESERVED)
// ============================================================================
export interface IsometricBlockProps {
  mouseX?: number;
  mouseY?: number;
}

export const IsometricBlock: React.FC<IsometricBlockProps> = ({ mouseX = 0, mouseY = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  // Parallax offsets (enhanced response on hover)
  const tiltX = shouldReduceMotion ? 0 : mouseY * -8 + (isHovered ? -4 : 0);
  const tiltY = shouldReduceMotion ? 0 : mouseX * 9 + (isHovered ? 3 : 0);
  const liftY = isHovered ? -8 : 0;

  // Generate smooth 3D yellow slab extrusion slices
  // Extruding 36px in depth from base to top
  const slabSlicesCount = 28;
  const slabSlices = Array.from({ length: slabSlicesCount }, (_, i) => {
    const progress = i / (slabSlicesCount - 1); // 0 at bottom, 1 at top
    const yOffset = (1 - progress) * 38; // 38px down at bottom, 0 at top
    return {
      index: i,
      yOffset,
      progress,
    };
  });

  // Numerals 3D extrusion slices (from base on plate up by 12px normal to surface)
  const numeralExtrusionLevels = [
    { dy: -1.0, color: '#525250', stroke: '#525250', width: 3.5 },
    { dy: -2.5, color: '#686865', stroke: '#686865', width: 3.2 },
    { dy: -4.0, color: '#7E7E7B', stroke: '#7E7E7B', width: 3.0 },
    { dy: -5.5, color: '#959592', stroke: '#959592', width: 2.8 },
    { dy: -7.0, color: '#ACACA9', stroke: '#ACACA9', width: 2.5 },
    { dy: -8.5, color: '#C3C3C0', stroke: '#C3C3C0', width: 2.2 },
    { dy: -10.0, color: '#D9D9D7', stroke: '#D9D9D7', width: 1.8 },
    { dy: -11.5, color: '#EEEEEC', stroke: '#EEEEEC', width: 1.5 },
  ];

  return (
    <div className="relative w-full max-w-[620px] sm:max-w-[700px] md:max-w-[760px] h-[340px] sm:h-[400px] md:h-[450px] mx-auto flex items-center justify-center select-none py-1">
      <motion.div
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          y: shouldReduceMotion ? 0 : [0, -10, 0],
          rotateX: tiltX,
          rotateY: tiltY,
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 5.8,
            ease: 'easeInOut',
          },
          rotateX: { type: 'spring', stiffness: 140, damping: 22 },
          rotateY: { type: 'spring', stiffness: 140, damping: 22 },
        }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: 1400,
        }}
      >
        <svg
          viewBox="0 0 760 520"
          className="w-full h-full overflow-visible drop-shadow-sm transition-transform duration-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ambient diffuse floor shadow */}
            <radialGradient id="floorShadowWide" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1E190F" stopOpacity="0.28" />
              <stop offset="45%" stopColor="#1E190F" stopOpacity="0.14" />
              <stop offset="85%" stopColor="#1E190F" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#1E190F" stopOpacity="0" />
            </radialGradient>

            {/* Dense contact shadow under the slab */}
            <radialGradient id="floorShadowCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0F0C07" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#0F0C07" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0F0C07" stopOpacity="0" />
            </radialGradient>

            {/* Yellow slab left lit face gradient */}
            <linearGradient id="yellowLeftLit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FED736" />
              <stop offset="50%" stopColor="#F9C71D" />
              <stop offset="100%" stopColor="#E5B20B" />
            </linearGradient>

            {/* Yellow slab right shaded face gradient */}
            <linearGradient id="yellowRightShaded" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2AE11" />
              <stop offset="50%" stopColor="#C99405" />
              <stop offset="100%" stopColor="#A87900" />
            </linearGradient>

            {/* Top black face matte sheen */}
            <linearGradient id="matteBlackPlate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#222222" />
              <stop offset="40%" stopColor="#191919" />
              <stop offset="100%" stopColor="#101010" />
            </linearGradient>

            {/* Drop shadow filter for numerals */}
            <filter id="numeralShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4.5" />
              <feOffset dx="3" dy="5" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.65" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Arrow marker for blueprint drafting */}
            <marker
              id="draftArrowBig"
              viewBox="0 0 6 6"
              refX="3"
              refY="3"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 4.5 3 L 0 4.5 z" fill="#757065" />
            </marker>
          </defs>

          {/* ====================================================
              1. CONTACT FLOOR SHADOW
          ==================================================== */}
          <ellipse
            cx="380"
            cy="424"
            rx="250"
            ry="74"
            fill="url(#floorShadowWide)"
            className="transition-all duration-300"
            opacity={isHovered ? 0.8 : 1}
          />
          <ellipse
            cx="380"
            cy="410"
            rx="180"
            ry="48"
            fill="url(#floorShadowCore)"
            className="transition-all duration-300"
            opacity={isHovered ? 0.75 : 0.95}
          />

          {/* ====================================================
              2. ARCHITECTURAL / TECHNICAL BLUEPRINT LINES
          ==================================================== */}
          <g className="blueprint-markup text-[#7E786B] font-mono text-[9px]">
            {/* Outer dashed boundary lines along isometric axes */}
            <line x1="165" y1="135" x2="380" y2="260" stroke="#262626" strokeWidth="0.8" strokeDasharray="4 4" />
            <line x1="380" y1="260" x2="595" y2="135" stroke="#262626" strokeWidth="0.8" strokeDasharray="4 4" />
            <line x1="165" y1="365" x2="380" y2="490" stroke="#262626" strokeWidth="0.8" strokeDasharray="4 4" />
            <line x1="380" y1="490" x2="595" y2="365" stroke="#262626" strokeWidth="0.8" strokeDasharray="4 4" />

            {/* Corner extension projection lines */}
            {/* Top corner vertical extension */}
            <line x1="380" y1="40" x2="380" y2="85" stroke="#222222" strokeWidth="0.9" />
            <line x1="374" y1="65" x2="386" y2="65" stroke="#222222" strokeWidth="0.9" />
            <circle cx="380" cy="65" r="3" fill="#F9C71D" stroke="#111111" strokeWidth="0.75" />

            {/* Left corner extension */}
            <line x1="90" y1="240" x2="135" y2="240" stroke="#222222" strokeWidth="0.9" />
            <line x1="110" y1="234" x2="110" y2="246" stroke="#222222" strokeWidth="0.9" />
            <circle cx="110" cy="240" r="3.5" fill="#F9C71D" stroke="#111111" strokeWidth="0.75" />

            {/* Right corner extension */}
            <line x1="625" y1="240" x2="670" y2="240" stroke="#222222" strokeWidth="0.9" />
            <line x1="650" y1="234" x2="650" y2="246" stroke="#222222" strokeWidth="0.9" />
            <circle cx="650" cy="240" r="3.5" fill="#F9C71D" stroke="#111111" strokeWidth="0.75" />

            {/* Bottom corner vertical extension */}
            <line x1="380" y1="440" x2="380" y2="480" stroke="#222222" strokeWidth="0.9" />
            <line x1="374" y1="460" x2="386" y2="460" stroke="#222222" strokeWidth="0.9" />
            <circle cx="380" cy="460" r="2.5" fill="#111111" />

            {/* Corner crosshairs (+) */}
            <g stroke="#2B2B2B" strokeWidth="0.9">
              <line x1="200" y1="135" x2="212" y2="135" />
              <line x1="206" y1="129" x2="206" y2="141" />
              <line x1="548" y1="135" x2="560" y2="135" />
              <line x1="554" y1="129" x2="554" y2="141" />
              <line x1="200" y1="365" x2="212" y2="365" />
              <line x1="206" y1="359" x2="206" y2="371" />
              <line x1="548" y1="365" x2="560" y2="365" />
              <line x1="554" y1="359" x2="554" y2="371" />
            </g>

            {/* Small black dots at guideline reference points */}
            <circle cx="270" cy="198" r="2.5" fill="#111111" />
            <circle cx="490" cy="198" r="2.5" fill="#111111" />
            <circle cx="270" cy="428" r="2.5" fill="#111111" />
            <circle cx="490" cy="428" r="2.5" fill="#111111" />

            {/* Technical Dimension Marks */}
            <line
              x1="180"
              y1="195"
              x2="270"
              y2="143"
              stroke="#857F72"
              strokeWidth="0.75"
              markerStart="url(#draftArrowBig)"
              markerEnd="url(#draftArrowBig)"
            />
            <text x="220" y="162" fill="#757065" transform="rotate(-30 220 162)" textAnchor="middle">
              25.86 mm
            </text>

            <line
              x1="490"
              y1="143"
              x2="580"
              y2="195"
              stroke="#857F72"
              strokeWidth="0.75"
              markerStart="url(#draftArrowBig)"
              markerEnd="url(#draftArrowBig)"
            />
            <text x="540" y="162" fill="#757065" transform="rotate(30 540 162)" textAnchor="middle">
              ISO 30°
            </text>

            {/* Blueprint corner labels */}
            <text x="145" y="90" fill="#888274" fontSize="8px">
              SEC 01 // LABS-CORE
            </text>
            <text x="540" y="440" fill="#888274" fontSize="8px">
              TOL ±0.02
            </text>
          </g>

          {/* ====================================================
              3. ISOMETRIC 3D SLAB & TYPOGRAPHY
          ==================================================== */}
          <g transform={`translate(0, ${liftY})`} className="transition-transform duration-300">
            {/* 3A. Extruded Yellow Slab Base and Sides */}
            {slabSlices.map((slice) => {
              const isBase = slice.index === 0;
              const isTop = slice.index === slabSlicesCount - 1;
              const fillColor = isBase
                ? '#9C6F00'
                : slice.progress < 0.4
                ? '#D49C0A'
                : slice.progress < 0.8
                ? '#F5C21B'
                : '#FED736';
              const strokeColor = isBase
                ? '#7A5700'
                : slice.progress > 0.8
                ? '#FFECA2'
                : '#B88506';

              return (
                <g
                  key={slice.index}
                  transform={`translate(380, ${240 + slice.yOffset}) matrix(0.866 0.5 -0.866 0.5 0 0)`}
                >
                  <rect
                    x="-152"
                    y="-152"
                    width="304"
                    height="304"
                    rx="32"
                    ry="32"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isTop ? '1.5' : '0.5'}
                  />
                </g>
              );
            })}

            {/* 3B. High-definition side highlight on front corner */}
            <g transform="translate(380, 240)">
              <line
                x1="0"
                y1="152"
                x2="0"
                y2="190"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.65"
              />
              <line
                x1="-1"
                y1="152"
                x2="-1"
                y2="190"
                stroke="#FFEBA3"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.85"
              />
            </g>

            {/* 3C. Top Isometric Face with Matte Black Plate & Numerals */}
            <g transform="translate(380, 240) matrix(0.866 0.5 -0.866 0.5 0 0)">
              {/* Outer yellow border rim */}
              <rect
                x="-148"
                y="-148"
                width="296"
                height="296"
                rx="30"
                ry="30"
                fill="#FED536"
                stroke="#FFFFFF"
                strokeWidth="1"
              />

              {/* Matte Black Face Plate */}
              <rect
                x="-143"
                y="-143"
                width="286"
                height="286"
                rx="26"
                ry="26"
                fill="url(#matteBlackPlate)"
                stroke="#1A1A1A"
                strokeWidth="1.5"
              />

              {/* Subtle inner bevel edge */}
              <rect
                x="-140"
                y="-140"
                width="280"
                height="280"
                rx="24"
                ry="24"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.2"
              />

              {/* 3D Numerals: Layer 1 - Drop Shadow */}
              <g transform="translate(4, 7)" opacity="0.65" filter="url(#numeralShadow)">
                <text x="-48" y="-22" textAnchor="middle" fill="#000000" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '94px', letterSpacing: '-2px' }}>2</text>
                <text x="56" y="-22" textAnchor="middle" fill="#000000" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '94px', letterSpacing: '-2px' }}>5</text>
                <text x="-48" y="86" textAnchor="middle" fill="#000000" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '94px', letterSpacing: '-2px' }}>8</text>
                <text x="56" y="86" textAnchor="middle" fill="#000000" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '94px', letterSpacing: '-2px' }}>6</text>
              </g>

              {/* 3D Numerals: Layer 2 - Side Wall Extrusions */}
              {numeralExtrusionLevels.map((lvl, index) => (
                <g key={index} transform={`translate(${lvl.dy}, ${lvl.dy})`}>
                  <text x="-48" y="-22" textAnchor="middle" fill={lvl.color} stroke={lvl.stroke} strokeWidth={lvl.width} strokeLinejoin="round" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '94px', letterSpacing: '-2px' }}>2</text>
                  <text x="56" y="-22" textAnchor="middle" fill={lvl.color} stroke={lvl.stroke} strokeWidth={lvl.width} strokeLinejoin="round" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '94px', letterSpacing: '-2px' }}>5</text>
                  <text x="-48" y="86" textAnchor="middle" fill={lvl.color} stroke={lvl.stroke} strokeWidth={lvl.width} strokeLinejoin="round" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '94px', letterSpacing: '-2px' }}>8</text>
                  <text x="56" y="86" textAnchor="middle" fill={lvl.color} stroke={lvl.stroke} strokeWidth={lvl.width} strokeLinejoin="round" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '94px', letterSpacing: '-2px' }}>6</text>
                </g>
              ))}

              {/* 3D Numerals: Layer 3 - Pure White Top Face */}
              <g transform="translate(-13, -13)">
                <text x="-48" y="-22" textAnchor="middle" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.2" strokeLinejoin="round" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '94px', letterSpacing: '-2px' }}>2</text>
                <text x="56" y="-22" textAnchor="middle" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.2" strokeLinejoin="round" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '94px', letterSpacing: '-2px' }}>5</text>
                <text x="-48" y="86" textAnchor="middle" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.2" strokeLinejoin="round" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '94px', letterSpacing: '-2px' }}>8</text>
                <text x="56" y="86" textAnchor="middle" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.2" strokeLinejoin="round" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '94px', letterSpacing: '-2px' }}>6</text>
              </g>

              {/* Technical Registration Dots inside Top Plate */}
              <circle cx="-120" cy="-120" r="1.5" fill="#444444" />
              <circle cx="120" cy="-120" r="1.5" fill="#444444" />
              <circle cx="-120" cy="120" r="1.5" fill="#444444" />
              <circle cx="120" cy="120" r="1.5" fill="#444444" />
            </g>
          </g>
        </svg>
      </motion.div>
    </div>
  );
};

// ============================================================================
// 5. TOP TECHNICAL NAVBAR
// ============================================================================
export const Navbar: React.FC = () => {
  return (
    <header className="w-full max-w-5xl mx-auto px-6 sm:px-10 pt-6 pb-2 flex items-center justify-between z-20">
      {/* Left Logo Mark */}
      <div className="flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] rounded-[3px] bg-[#111111] flex flex-col items-center justify-center text-white select-none shadow-sm">
          <span className="text-[11px] font-bold leading-none tracking-tight">25</span>
          <span className="text-[11px] font-bold leading-none tracking-tight">86</span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[6.5px] uppercase font-semibold tracking-[0.2em] text-[#6A665D]">
            LABS, INC.
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Hiring Pill */}
        <div className="inline-flex items-center gap-1.5 bg-[#F6D238] text-[#111111] text-[9.5px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-ping" />
          <span>we're hiring</span>
        </div>

        {/* Status */}
        <div className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-mono text-[#7A756C]">
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          <span>status: ok</span>
        </div>

        {/* Email Pill Button */}
        <a
          href="mailto:hello@2586labs.com"
          className="inline-flex items-center gap-1 bg-[#111111] hover:bg-neutral-800 text-white text-[9.5px] font-medium px-3 py-1 rounded-full transition-colors group cursor-pointer"
        >
          <span>hello@2586labs.com</span>
          <ArrowUpRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </header>
  );
};

// ============================================================================
// 6. MAIN 2586 LABS LANDING PAGE COMPONENT
// ============================================================================
export interface Labs2586Props {
  className?: string;
}

export default function Labs2586({ className = '' }: Labs2586Props) {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || typeof window === 'undefined') return;
    const deltaX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const deltaY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    setMousePos({ x: deltaX, y: deltaY });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      className={`relative min-h-screen w-full bg-[#F8F3E5] text-[#111111] flex flex-col justify-between overflow-x-hidden font-['Inter',sans-serif] selection:bg-[#F6D238] selection:text-[#111111] ${className}`}
      id="labs-2586-root"
      style={{
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Technical Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center pt-2 sm:pt-4">
        {/* Isometric 3D Hero Piece (100% untouched) */}
        <IsometricBlock mouseX={mousePos.x} mouseY={mousePos.y} />

        {/* Editorial Heading & Description */}
        <div className="text-center max-w-md mx-auto px-4 mt-2 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-[29px] font-bold text-[#111111] tracking-tight leading-tight">
            Definitely not a cult
          </h1>
          <p className="mt-2 text-[11px] sm:text-[11.5px] leading-[1.6] text-[#6B665C] font-normal">
            2586 Labs, Inc. is the umbrella under which beautiful software &amp; thriving communities are built and encouraged. Scroll to learn more about everything that we are working on.
          </p>

          <div className="mt-4 flex justify-center">
            <a
              href="mailto:hello@2586labs.com"
              className="inline-flex items-center gap-1.5 bg-[#111111] hover:bg-neutral-800 text-white text-[10px] font-medium px-4 py-1.5 rounded-full transition-all hover:scale-105 cursor-pointer shadow-xs"
            >
              <span>hello@2586labs.com</span>
              <ArrowUpRight className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Floating Yellow Announcement Note */}
        <div className="w-full relative z-20 mb-[-14px]">
          <YellowCard parallaxX={mousePos.x} parallaxY={mousePos.y} />
        </div>

        {/* Two-Column Black Split Panel */}
        <div className="w-full relative z-10">
          <SplitPanel parallaxX={mousePos.x} parallaxY={mousePos.y} />
        </div>
      </main>

      {/* Bottom Kinetic Curved Typography */}
      <footer className="relative w-full mt-4 sm:mt-6">
        <BottomCurvedText parallaxX={mousePos.x} />
      </footer>
    </div>
  );
}
