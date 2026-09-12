import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

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

export default function Labs2586({ className = '' }: { className?: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      className={`relative min-h-[600px] h-full w-full bg-[#F8F3E5] flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none font-['Inter',sans-serif] ${className}`}
      style={{
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}
    >
      <IsometricBlock mouseX={mousePos.x} mouseY={mousePos.y} />
    </div>
  );
}
