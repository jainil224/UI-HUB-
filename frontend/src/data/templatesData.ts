export interface TemplateItem {
    id: string;
    title: string;
    description: string;
    category: 'All' | 'SaaS & AI' | 'Agency & Portfolio' | 'E-Commerce' | 'Web3 & FinTech';
    badge?: string;
    framework: string;
    styling: string;
    animation: string;
    isPro: boolean;
    liveDemoUrl?: string;
    githubUrl?: string;
    previewGradient: string;
    accentColor: string;
    stats: {
        pages: number;
        rating: number;
        downloads: string;
    };
    features: string[];
    promptPreview: string;
    toolPrompts?: {
        advance?: string;
        antigravity?: string;
        claude?: string;
        cursor?: string;
        lovable?: string;
    };
}

export const templateCategories = [
    'All',
    'SaaS & AI',
    'Agency & Portfolio',
    'E-Commerce',
    'Web3 & FinTech',
] as const;

export type TemplateCategory = (typeof templateCategories)[number];

export const websiteTemplates: TemplateItem[] = [
    {
        id: 'tars-protocol',
        title: 'TARS Protocol Hero & Arena',
        description: 'Perspective amphitheater SVG grid, floating 3D metallic sculpture with keyframe physics, and Solana AI ecosystem hero.',
        category: 'Web3 & FinTech',
        badge: 'NEW',
        framework: 'React 19 (TypeScript)',
        styling: 'Tailwind CSS',
        animation: 'CSS 3D Float Physics',
        isPro: false,
        liveDemoUrl: '/demo/tars-hero-arena',
        githubUrl: 'https://github.com/ui-hub/tars-protocol-arena',
        previewGradient: 'from-purple-900/40 via-indigo-950 to-black',
        accentColor: '#8B42FF',
        stats: {
            pages: 1,
            rating: 5.0,
            downloads: '4.8k',
        },
        features: [
            'Parametric SVG amphitheater perspective grid',
            'Central 3D floating metallic sculpture with physics',
            'Solana Foundation verified ecosystem badge',
            'Dual-view SVG responsive architecture'
        ],
        promptPreview: `Generate a high-fidelity, production-grade clone of the TARS Protocol Hero & Arena Section in React (TypeScript) + Tailwind CSS + Lucide Icons. Follow every single design specification, mathematical formula, typography scale, asset link, and component breakdown detailed below.

================================================================================
1. CORE ARCHITECTURAL OVERVIEW
================================================================================
The view is a full-viewport hero section (\`w-full h-screen h-[100dvh] bg-white text-[#111111] relative overflow-hidden flex flex-col\`) composed of:
1. Top Navigation Bar (39px height) with TARS logo, navigation links, and "Connect Wallet" button.
2. Perspective Arena Stepped Grid: An SVG-rendered amphitheater/arena grid with horizontal sag curves, vertical convergence, and a stepped inverted-pyramid purple gradient that descends and terminates into a pure white grid floor.
   - Dual-view SVG architecture: Desktop uses a 1400x760 canvas; Mobile uses an optimized 420x680 canvas that spans corner-to-corner right below the header.
3. Central 3D Floating Metallic Y-Sculpture: A high-gloss lilac/silver metallic tripod sculpture floating in the center with continuous CSS keyframe floating physics and an ambient violet cast shadow.
4. Information Layer:
   - Top center: "Grant recipient from [Solana Foundation logo]".
   - Left side: "The AI Architecture Protocol On Solana" + description.
   - Right side: "AI Market" + description + "More details →" interactive link.
   - Bottom center: High-contrast pill button "Start Now →" + 4 carousel navigation indicator buttons situated cleanly after the purple gradient ends.

================================================================================
2. COLOR PALETTE & GRADIENT SPECIFICATIONS
================================================================================
- Background: Pure White #FFFFFF
- Primary Dark / Text / CTA: #111111, #171717, #222222
- Subtle / Secondary Body Text: #555555, #777777
- Outer Inactive Grid Lines: #EEEEEE (strokeWidth: 0.8px, opacity: 0.9)
- Inner Active Grid Lines (over purple field): rgba(255, 255, 255, 0.45) (strokeWidth: 0.9px)
- Stepped Inverted Pyramid Gradient Tiers (Top to Bottom):
  * Row 1: Top #F6F0FF -> Bottom #EADEFF (stretches corner-to-corner)
  * Row 2: Top #E6D4FF -> Bottom #D8BCFF
  * Row 3: Top #D3B2FF -> Bottom #C195FF
  * Row 4: Top #BA88FF -> Bottom #A166FF
  * Row 5: Top #9550FF -> Bottom #7E29FF
  * Row 6: Top #751FED -> Bottom #5D0CD6
  * Row 7 (Tip): Top #5507D4 -> Bottom #4301C2 (terminates sharply at Row 8, exposing clean white grid below)
- Ambient Glow Filter: feDropShadow(dx: 0, dy: 3, stdDeviation: 6, floodColor: "#8B42FF", floodOpacity: 0.16)
- Central Object Ambient Floor Shadow: bg-[#29084D]/30 blur-[20px] rounded-full

================================================================================
3. EXACT TYPOGRAPHY, SIZING & POSITIONING TOKENS
================================================================================
- Font Family: Inter, -apple-system, BlinkMacSystemFont, sans-serif

A. Navigation Bar (h-[39px] border-b border-[#EAEAEA] px-3.5 sm:px-6):
   - Logo: 3x3 dot grid (#111111) + "TARS" (text-[13px] font-bold tracking-tight text-[#111111]).
   - Center Links (Desktop): text-[11px] font-medium text-[#666666] hover:text-black transition-colors, items: AI, Staking, Launchpad, Space, Ecosystem, Docs, Bridge, Governance.
   - Connect Wallet Button: h-[27px] px-3 bg-[#111111] hover:bg-[#282828] text-white text-[11px] font-medium rounded-[5px] flex items-center gap-1.5.

B. Solana Foundation Tag:
   - Position: absolute top-[16px] sm:top-[22px] md:top-[30px] left-1/2 -translate-x-1/2
   - Label: text-[8px] sm:text-[9px] md:text-[9.5px] text-[#555555] font-normal tracking-wide
   - Logo: Three horizontal rounded Solana parallelogram bars with "SOLANA FOUNDATION" in tracked uppercase (text-[6.5px] font-bold tracking-[0.08em]).

C. Left Information Block (#left-hero-text):
   - Desktop: left-[50px] lg:left-[64px] md:top-[58%] md:-translate-y-1/2 max-w-[260px] lg:max-w-[280px]
   - Mobile: left-3.5 sm:left-6 bottom-[68px] sm:bottom-[76px] max-w-[148px] xs:max-w-[160px]
   - Title: text-[12px] xs:text-[13px] sm:text-[14px] md:text-[17.5px] lg:text-[18.5px] font-semibold text-[#111111] leading-[1.22] tracking-[-0.015em]
     Text: "The AI Architecture Protocol On Solana"
   - Body: text-[7.5px] xs:text-[8px] sm:text-[9px] md:text-[10px] text-[#555555] mt-1 xs:mt-1.5 md:mt-2.5 leading-[1.38]
     Text: "Symbiotic AI app ecosystem dedicated to 1,000,000+ Solana users."

D. Right Information Block (#right-hero-text):
   - Desktop: right-[50px] lg:right-[64px] md:top-[58%] md:-translate-y-1/2 max-w-[260px] lg:max-w-[280px]
   - Mobile: right-3.5 sm:right-6 bottom-[68px] sm:bottom-[76px] max-w-[148px] xs:max-w-[160px]
   - Title: text-[12px] xs:text-[13px] sm:text-[14px] md:text-[17.5px] lg:text-[18.5px] font-semibold text-[#111111] leading-[1.22]
     Text: "AI Market"
   - Body: text-[7.5px] xs:text-[8px] sm:text-[9px] md:text-[10px] text-[#555555] mt-1 xs:mt-1.5 md:mt-2.5 leading-[1.38]
     Text: "Access modular AI app and ecosystem products at a glance in one super-app."
   - Link: text-[7.5px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-medium text-[#222222] hover:text-black, "More details →".

E. Central 3D Sculpture Stage (#hero-3d-center-stage):
   - Desktop: md:w-[440px] md:h-[440px] lg:w-[490px] lg:h-[490px] -translate-y-4
   - Mobile: w-[165px] h-[165px] xs:w-[190px] xs:h-[190px] sm:w-[260px] sm:h-[260px] -translate-y-16 sm:-translate-y-10
   - Image Asset: https://res.cloudinary.com/chhwhdhk/image/upload/v1788396671/3a059f9d-8c46-4728-bf70-841e4e9e51f4_d5prsx.png
   - Attributes: referrerPolicy="no-referrer" draggable={false}
   - Animation: CSS @keyframes heroFloat with 7s duration, cubic ease:
     * 0%, 100%: transform: translateY(-6px) rotate(-0.5deg);
     * 50%: transform: translateY(6px) rotate(0.5deg);
   - Shadow: w-[120px] sm:w-[160px] md:w-[220px] h-[26px] sm:h-[34px] md:h-[48px] bg-[#29084D]/30 rounded-full blur-[14px] md:blur-[20px] -rotate-2

F. Bottom Central CTA & Indicators (#central-cta-container):
   - Position: absolute bottom-[14px] sm:bottom-[22px] md:bottom-[34px] left-1/2 -translate-x-1/2 flex flex-col items-center z-30
   - Start Now Button: h-[26px] sm:h-[28px] md:h-[30px] px-3.5 sm:px-4 bg-[#171717] hover:bg-[#282828] active:scale-[0.98] text-white text-[10.5px] sm:text-[11px] md:text-[11.5px] font-medium rounded-[6px] flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.2)]
   - 4-Item Indicator Switcher: flex items-center gap-3 sm:gap-3.5 mt-2.5 sm:mt-3 md:mt-3.5
     * 1. 3x3 Dots Grid Icon (w-3.5 h-3.5)
     * 2. Vertical double-headed arrow ↕ (w-3.5 h-3.5)
     * 3. 3-Dot Triangle Icon (w-3.5 h-3.5)
     * 4. 4-Corner Squares / Crosshairs Icon (w-3.5 h-3.5)
     * Hover: hover:opacity-100 hover:scale-110; Active: opacity-100 text-[#111111]; Inactive: opacity-35 text-[#888888].

================================================================================
4. PERSPECTIVE ARENA GRID MATHEMATICAL FORMULAS
================================================================================
The SVG grid is generated analytically using parametric functions:
- Desktop viewBox: 0 0 1400 760, 16 columns (numCols = 16, halfCols = 8), rows 0 to 11.
- cNorm = (c - halfCols) / halfCols (ranges from -1 to 1).
- Convergence: colWidthFactor = 1 - (r / 11) * 0.16 (rows narrow slightly towards the camera).
- X-Coordinate: x = 700 + cNorm * (1400 * 0.49) * colWidthFactor.
- Row Base Y Array: [12, 52, 100, 158, 224, 298, 380, 466, 528, 608, 686, 760].
- Row Sag Curvature Array: [14, 19, 24, 29, 34, 38, 41, 43, 44, 45, 46, 47].
- Downward Parabolic Sag: sag = (1 - cNorm * cNorm) * rowSag[r].
- Y-Coordinate: y = rowBaseY[r] + sag.
- Stepped cell quad coordinates: (c, r) -> (c+1, r) -> (c+1, r+1) -> (c, r+1) -> close.

================================================================================
5. COMPLETE EXECUTABLE SOURCE CODE
================================================================================

\`\`\`tsx
import React, { useState } from 'react';
import { ArrowRight, Wallet, ArrowUpDown, Grid, Triangle, Maximize2 } from 'lucide-react';

export default function TarsHeroArena() {
  const [activeTab, setActiveTab] = useState(0);

  const numCols = 16;
  const halfCols = 8;
  const rowBaseY = [12, 52, 100, 158, 224, 298, 380, 466, 528, 608, 686, 760];
  const rowSag = [14, 19, 24, 29, 34, 38, 41, 43, 44, 45, 46, 47];

  const getPoint = (c: number, r: number) => {
    const cNorm = (c - halfCols) / halfCols;
    const colWidthFactor = 1 - (r / 11) * 0.16;
    const x = 700 + cNorm * (1400 * 0.49) * colWidthFactor;
    const sag = (1 - cNorm * cNorm) * rowSag[r];
    const y = rowBaseY[r] + sag;
    return { x, y };
  };

  return (
    <div className="w-full h-screen h-[100dvh] bg-white text-[#111111] relative overflow-hidden flex flex-col font-sans select-none">
      {/* Top Navigation */}
      <header className="h-[39px] border-b border-[#EAEAEA] px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-3 gap-0.5 w-3 h-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 rounded-full bg-[#111111]" />
            ))}
          </div>
          <span className="text-[13px] font-bold tracking-tight text-[#111111]">TARS</span>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-[11px] font-medium text-[#666666]">
          {['AI', 'Staking', 'Launchpad', 'Space', 'Ecosystem', 'Docs', 'Bridge', 'Governance'].map(item => (
            <a key={item} href={\`#\${item.toLowerCase()}\`} className="hover:text-black transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <button className="h-[27px] px-3 bg-[#111111] hover:bg-[#282828] text-white text-[11px] font-medium rounded-[5px] flex items-center gap-1.5 transition-colors">
          <Wallet size={12} />
          <span>Connect Wallet</span>
        </button>
      </header>

      {/* Grant Recipient Badge */}
      <div className="absolute top-[52px] sm:top-[60px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-[#EEEEEE] rounded-full shadow-sm">
        <span className="text-[9px] text-[#555555] tracking-wide">Grant recipient from</span>
        <span className="text-[7.5px] font-black tracking-widest uppercase text-[#111111]">SOLANA FOUNDATION</span>
      </div>

      {/* Arena Stepped Grid SVG */}
      <div className="absolute inset-0 top-[39px] pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 1400 760" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="purpleGrad7" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5507D4" />
              <stop offset="100%" stopColor="#4301C2" />
            </linearGradient>
          </defs>

          <polygon
            points={\`
              \${getPoint(0, 0).x},\${getPoint(0, 0).y}
              \${getPoint(16, 0).x},\${getPoint(16, 0).y}
              \${getPoint(13, 7).x},\${getPoint(13, 7).y}
              \${getPoint(8, 8).x},\${getPoint(8, 8).y}
              \${getPoint(3, 7).x},\${getPoint(3, 7).y}
            \`}
            fill="url(#purpleGrad7)"
            opacity="0.9"
          />

          {Array.from({ length: 12 }).map((_, r) => (
            <path
              key={\`row-\${r}\`}
              d={\`M \${getPoint(0, r).x} \${getPoint(0, r).y} Q \${getPoint(8, r).x} \${getPoint(8, r).y + 10} \${getPoint(16, r).x} \${getPoint(16, r).y}\`}
              stroke={r < 8 ? "rgba(255,255,255,0.45)" : "#EEEEEE"}
              strokeWidth="0.8"
              fill="none"
            />
          ))}
        </svg>
      </div>

      {/* Floating 3D Sculpture */}
      <div className="relative flex-1 flex items-center justify-center z-20">
        <div className="relative flex flex-col items-center">
          <img
            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788396671/3a059f9d-8c46-4728-bf70-841e4e9e51f4_d5prsx.png"
            alt="TARS 3D Sculpture"
            className="w-[240px] sm:w-[320px] md:w-[420px] animate-hero-float select-none drop-shadow-[0_20px_35px_rgba(139,66,255,0.25)]"
            referrerPolicy="no-referrer"
            draggable={false}
          />
          <div className="w-[180px] sm:w-[240px] h-[32px] bg-[#29084D]/25 rounded-full blur-[18px] -mt-6" />
        </div>
      </div>

      {/* Left Info Block */}
      <div className="absolute left-6 md:left-14 top-[58%] -translate-y-1/2 max-w-[260px] z-30">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-[#111111] leading-[1.22] tracking-tight">
          The AI Architecture Protocol On Solana
        </h2>
        <p className="text-[9.5px] md:text-[10px] text-[#555555] mt-2 leading-[1.4]">
          Symbiotic AI app ecosystem dedicated to 1,000,000+ Solana users.
        </p>
      </div>

      {/* Right Info Block */}
      <div className="absolute right-6 md:right-14 top-[58%] -translate-y-1/2 max-w-[260px] z-30 text-right md:text-left">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-[#111111] leading-[1.22]">
          AI Market
        </h2>
        <p className="text-[9.5px] md:text-[10px] text-[#555555] mt-2 leading-[1.4]">
          Access modular AI app and ecosystem products at a glance in one super-app.
        </p>
        <a href="#details" className="inline-flex items-center gap-1 text-[10px] font-medium text-[#222222] hover:text-black mt-2">
          <span>More details</span>
          <ArrowRight size={11} />
        </a>
      </div>

      {/* Bottom Center CTA & Carousel Indicators */}
      <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <button className="h-[30px] px-4 bg-[#171717] hover:bg-[#282828] active:scale-[0.98] text-white text-[11px] font-medium rounded-[6px] flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-all">
          <span>Start Now</span>
          <ArrowRight size={12} />
        </button>

        <div className="flex items-center gap-3.5 mt-3 text-[#888888]">
          <button onClick={() => setActiveTab(0)} className={\`hover:text-black \${activeTab === 0 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Grid size={14} />
          </button>
          <button onClick={() => setActiveTab(1)} className={\`hover:text-black \${activeTab === 1 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <ArrowUpDown size={14} />
          </button>
          <button onClick={() => setActiveTab(2)} className={\`hover:text-black \${activeTab === 2 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Triangle size={14} />
          </button>
          <button onClick={() => setActiveTab(3)} className={\`hover:text-black \${activeTab === 3 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
\`\`\``,
        toolPrompts: {
            cursor: `/* .cursorrules - TARS Protocol Clone */
You are an expert Frontend Systems Architect. Implement the production-ready TARS Protocol Hero & Arena component in React (TypeScript) + Tailwind CSS + Lucide Icons using the exact mathematical SVG formulas and source code below:

` + `\`\`\`tsx
import React, { useState } from 'react';
import { ArrowRight, Wallet, ArrowUpDown, Grid, Triangle, Maximize2 } from 'lucide-react';

export default function TarsHeroArena() {
  const [activeTab, setActiveTab] = useState(0);

  const numCols = 16;
  const halfCols = 8;
  const rowBaseY = [12, 52, 100, 158, 224, 298, 380, 466, 528, 608, 686, 760];
  const rowSag = [14, 19, 24, 29, 34, 38, 41, 43, 44, 45, 46, 47];

  const getPoint = (c: number, r: number) => {
    const cNorm = (c - halfCols) / halfCols;
    const colWidthFactor = 1 - (r / 11) * 0.16;
    const x = 700 + cNorm * (1400 * 0.49) * colWidthFactor;
    const sag = (1 - cNorm * cNorm) * rowSag[r];
    const y = rowBaseY[r] + sag;
    return { x, y };
  };

  return (
    <div className="w-full h-screen h-[100dvh] bg-white text-[#111111] relative overflow-hidden flex flex-col font-sans select-none">
      <header className="h-[39px] border-b border-[#EAEAEA] px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-3 gap-0.5 w-3 h-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 rounded-full bg-[#111111]" />
            ))}
          </div>
          <span className="text-[13px] font-bold tracking-tight text-[#111111]">TARS</span>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-[11px] font-medium text-[#666666]">
          {['AI', 'Staking', 'Launchpad', 'Space', 'Ecosystem', 'Docs', 'Bridge', 'Governance'].map(item => (
            <a key={item} href={\`#\${item.toLowerCase()}\`} className="hover:text-black transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <button className="h-[27px] px-3 bg-[#111111] hover:bg-[#282828] text-white text-[11px] font-medium rounded-[5px] flex items-center gap-1.5 transition-colors">
          <Wallet size={12} />
          <span>Connect Wallet</span>
        </button>
      </header>

      <div className="absolute top-[52px] sm:top-[60px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-[#EEEEEE] rounded-full shadow-sm">
        <span className="text-[9px] text-[#555555] tracking-wide">Grant recipient from</span>
        <span className="text-[7.5px] font-black tracking-widest uppercase text-[#111111]">SOLANA FOUNDATION</span>
      </div>

      <div className="absolute inset-0 top-[39px] pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 1400 760" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="purpleGrad7" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5507D4" />
              <stop offset="100%" stopColor="#4301C2" />
            </linearGradient>
          </defs>

          <polygon
            points={\`
              \${getPoint(0, 0).x},\${getPoint(0, 0).y}
              \${getPoint(16, 0).x},\${getPoint(16, 0).y}
              \${getPoint(13, 7).x},\${getPoint(13, 7).y}
              \${getPoint(8, 8).x},\${getPoint(8, 8).y}
              \${getPoint(3, 7).x},\${getPoint(3, 7).y}
            \`}
            fill="url(#purpleGrad7)"
            opacity="0.9"
          />

          {Array.from({ length: 12 }).map((_, r) => (
            <path
              key={\`row-\${r}\`}
              d={\`M \${getPoint(0, r).x} \${getPoint(0, r).y} Q \${getPoint(8, r).x} \${getPoint(8, r).y + 10} \${getPoint(16, r).x} \${getPoint(16, r).y}\`}
              stroke={r < 8 ? "rgba(255,255,255,0.45)" : "#EEEEEE"}
              strokeWidth="0.8"
              fill="none"
            />
          ))}
        </svg>
      </div>

      <div className="relative flex-1 flex items-center justify-center z-20">
        <div className="relative flex flex-col items-center">
          <img
            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788396671/3a059f9d-8c46-4728-bf70-841e4e9e51f4_d5prsx.png"
            alt="TARS 3D Sculpture"
            className="w-[240px] sm:w-[320px] md:w-[420px] animate-hero-float select-none drop-shadow-[0_20px_35px_rgba(139,66,255,0.25)]"
            referrerPolicy="no-referrer"
            draggable={false}
          />
          <div className="w-[180px] sm:w-[240px] h-[32px] bg-[#29084D]/25 rounded-full blur-[18px] -mt-6" />
        </div>
      </div>

      <div className="absolute left-6 md:left-14 top-[58%] -translate-y-1/2 max-w-[260px] z-30">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-[#111111] leading-[1.22] tracking-tight">
          The AI Architecture Protocol On Solana
        </h2>
        <p className="text-[9.5px] md:text-[10px] text-[#555555] mt-2 leading-[1.4]">
          Symbiotic AI app ecosystem dedicated to 1,000,000+ Solana users.
        </p>
      </div>

      <div className="absolute right-6 md:right-14 top-[58%] -translate-y-1/2 max-w-[260px] z-30 text-right md:text-left">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-[#111111] leading-[1.22]">
          AI Market
        </h2>
        <p className="text-[9.5px] md:text-[10px] text-[#555555] mt-2 leading-[1.4]">
          Access modular AI app and ecosystem products at a glance in one super-app.
        </p>
        <a href="#details" className="inline-flex items-center gap-1 text-[10px] font-medium text-[#222222] hover:text-black mt-2">
          <span>More details</span>
          <ArrowRight size={11} />
        </a>
      </div>

      <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <button className="h-[30px] px-4 bg-[#171717] hover:bg-[#282828] active:scale-[0.98] text-white text-[11px] font-medium rounded-[6px] flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-all">
          <span>Start Now</span>
          <ArrowRight size={12} />
        </button>

        <div className="flex items-center gap-3.5 mt-3 text-[#888888]">
          <button onClick={() => setActiveTab(0)} className={\`hover:text-black \${activeTab === 0 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Grid size={14} />
          </button>
          <button onClick={() => setActiveTab(1)} className={\`hover:text-black \${activeTab === 1 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <ArrowUpDown size={14} />
          </button>
          <button onClick={() => setActiveTab(2)} className={\`hover:text-black \${activeTab === 2 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Triangle size={14} />
          </button>
          <button onClick={() => setActiveTab(3)} className={\`hover:text-black \${activeTab === 3 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
\`\`\``,
            claude: `[Claude Code Engineer Directive]
Build the TARS Protocol Hero & Arena section autonomously.
Dependencies: lucide-react, tailwindcss.
Live Reference: https://ai.studio/apps/38ae773c-b5c7-4703-965d-39cc37a24b0d

Implementation Code:
` + `\`\`\`tsx
import React, { useState } from 'react';
import { ArrowRight, Wallet, ArrowUpDown, Grid, Triangle, Maximize2 } from 'lucide-react';

export default function TarsHeroArena() {
  const [activeTab, setActiveTab] = useState(0);

  const numCols = 16;
  const halfCols = 8;
  const rowBaseY = [12, 52, 100, 158, 224, 298, 380, 466, 528, 608, 686, 760];
  const rowSag = [14, 19, 24, 29, 34, 38, 41, 43, 44, 45, 46, 47];

  const getPoint = (c: number, r: number) => {
    const cNorm = (c - halfCols) / halfCols;
    const colWidthFactor = 1 - (r / 11) * 0.16;
    const x = 700 + cNorm * (1400 * 0.49) * colWidthFactor;
    const sag = (1 - cNorm * cNorm) * rowSag[r];
    const y = rowBaseY[r] + sag;
    return { x, y };
  };

  return (
    <div className="w-full h-screen h-[100dvh] bg-white text-[#111111] relative overflow-hidden flex flex-col font-sans select-none">
      <header className="h-[39px] border-b border-[#EAEAEA] px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-3 gap-0.5 w-3 h-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 rounded-full bg-[#111111]" />
            ))}
          </div>
          <span className="text-[13px] font-bold tracking-tight text-[#111111]">TARS</span>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-[11px] font-medium text-[#666666]">
          {['AI', 'Staking', 'Launchpad', 'Space', 'Ecosystem', 'Docs', 'Bridge', 'Governance'].map(item => (
            <a key={item} href={\`#\${item.toLowerCase()}\`} className="hover:text-black transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <button className="h-[27px] px-3 bg-[#111111] hover:bg-[#282828] text-white text-[11px] font-medium rounded-[5px] flex items-center gap-1.5 transition-colors">
          <Wallet size={12} />
          <span>Connect Wallet</span>
        </button>
      </header>

      <div className="absolute top-[52px] sm:top-[60px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-[#EEEEEE] rounded-full shadow-sm">
        <span className="text-[9px] text-[#555555] tracking-wide">Grant recipient from</span>
        <span className="text-[7.5px] font-black tracking-widest uppercase text-[#111111]">SOLANA FOUNDATION</span>
      </div>

      <div className="absolute inset-0 top-[39px] pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 1400 760" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="purpleGrad7" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5507D4" />
              <stop offset="100%" stopColor="#4301C2" />
            </linearGradient>
          </defs>

          <polygon
            points={\`
              \${getPoint(0, 0).x},\${getPoint(0, 0).y}
              \${getPoint(16, 0).x},\${getPoint(16, 0).y}
              \${getPoint(13, 7).x},\${getPoint(13, 7).y}
              \${getPoint(8, 8).x},\${getPoint(8, 8).y}
              \${getPoint(3, 7).x},\${getPoint(3, 7).y}
            \`}
            fill="url(#purpleGrad7)"
            opacity="0.9"
          />

          {Array.from({ length: 12 }).map((_, r) => (
            <path
              key={\`row-\${r}\`}
              d={\`M \${getPoint(0, r).x} \${getPoint(0, r).y} Q \${getPoint(8, r).x} \${getPoint(8, r).y + 10} \${getPoint(16, r).x} \${getPoint(16, r).y}\`}
              stroke={r < 8 ? "rgba(255,255,255,0.45)" : "#EEEEEE"}
              strokeWidth="0.8"
              fill="none"
            />
          ))}
        </svg>
      </div>

      <div className="relative flex-1 flex items-center justify-center z-20">
        <div className="relative flex flex-col items-center">
          <img
            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788396671/3a059f9d-8c46-4728-bf70-841e4e9e51f4_d5prsx.png"
            alt="TARS 3D Sculpture"
            className="w-[240px] sm:w-[320px] md:w-[420px] animate-hero-float select-none drop-shadow-[0_20px_35px_rgba(139,66,255,0.25)]"
            referrerPolicy="no-referrer"
            draggable={false}
          />
          <div className="w-[180px] sm:w-[240px] h-[32px] bg-[#29084D]/25 rounded-full blur-[18px] -mt-6" />
        </div>
      </div>

      <div className="absolute left-6 md:left-14 top-[58%] -translate-y-1/2 max-w-[260px] z-30">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-[#111111] leading-[1.22] tracking-tight">
          The AI Architecture Protocol On Solana
        </h2>
        <p className="text-[9.5px] md:text-[10px] text-[#555555] mt-2 leading-[1.4]">
          Symbiotic AI app ecosystem dedicated to 1,000,000+ Solana users.
        </p>
      </div>

      <div className="absolute right-6 md:right-14 top-[58%] -translate-y-1/2 max-w-[260px] z-30 text-right md:text-left">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-[#111111] leading-[1.22]">
          AI Market
        </h2>
        <p className="text-[9.5px] md:text-[10px] text-[#555555] mt-2 leading-[1.4]">
          Access modular AI app and ecosystem products at a glance in one super-app.
        </p>
        <a href="#details" className="inline-flex items-center gap-1 text-[10px] font-medium text-[#222222] hover:text-black mt-2">
          <span>More details</span>
          <ArrowRight size={11} />
        </a>
      </div>

      <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <button className="h-[30px] px-4 bg-[#171717] hover:bg-[#282828] active:scale-[0.98] text-white text-[11px] font-medium rounded-[6px] flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-all">
          <span>Start Now</span>
          <ArrowRight size={12} />
        </button>

        <div className="flex items-center gap-3.5 mt-3 text-[#888888]">
          <button onClick={() => setActiveTab(0)} className={\`hover:text-black \${activeTab === 0 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Grid size={14} />
          </button>
          <button onClick={() => setActiveTab(1)} className={\`hover:text-black \${activeTab === 1 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <ArrowUpDown size={14} />
          </button>
          <button onClick={() => setActiveTab(2)} className={\`hover:text-black \${activeTab === 2 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Triangle size={14} />
          </button>
          <button onClick={() => setActiveTab(3)} className={\`hover:text-black \${activeTab === 3 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
\`\`\``,
            antigravity: `[Antigravity Agent Blueprint]
Task: Deploy production TARS Protocol Arena clone.
Tech Stack: React 19, TypeScript, Tailwind CSS, Lucide Icons.
Asset: https://res.cloudinary.com/chhwhdhk/image/upload/v1788396671/3a059f9d-8c46-4728-bf70-841e4e9e51f4_d5prsx.png
Live Reference: https://ai.studio/apps/38ae773c-b5c7-4703-965d-39cc37a24b0d

Production Component:
` + `\`\`\`tsx
import React, { useState } from 'react';
import { ArrowRight, Wallet, ArrowUpDown, Grid, Triangle, Maximize2 } from 'lucide-react';

export default function TarsHeroArena() {
  const [activeTab, setActiveTab] = useState(0);

  const numCols = 16;
  const halfCols = 8;
  const rowBaseY = [12, 52, 100, 158, 224, 298, 380, 466, 528, 608, 686, 760];
  const rowSag = [14, 19, 24, 29, 34, 38, 41, 43, 44, 45, 46, 47];

  const getPoint = (c: number, r: number) => {
    const cNorm = (c - halfCols) / halfCols;
    const colWidthFactor = 1 - (r / 11) * 0.16;
    const x = 700 + cNorm * (1400 * 0.49) * colWidthFactor;
    const sag = (1 - cNorm * cNorm) * rowSag[r];
    const y = rowBaseY[r] + sag;
    return { x, y };
  };

  return (
    <div className="w-full h-screen h-[100dvh] bg-white text-[#111111] relative overflow-hidden flex flex-col font-sans select-none">
      <header className="h-[39px] border-b border-[#EAEAEA] px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-3 gap-0.5 w-3 h-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 rounded-full bg-[#111111]" />
            ))}
          </div>
          <span className="text-[13px] font-bold tracking-tight text-[#111111]">TARS</span>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-[11px] font-medium text-[#666666]">
          {['AI', 'Staking', 'Launchpad', 'Space', 'Ecosystem', 'Docs', 'Bridge', 'Governance'].map(item => (
            <a key={item} href={\`#\${item.toLowerCase()}\`} className="hover:text-black transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <button className="h-[27px] px-3 bg-[#111111] hover:bg-[#282828] text-white text-[11px] font-medium rounded-[5px] flex items-center gap-1.5 transition-colors">
          <Wallet size={12} />
          <span>Connect Wallet</span>
        </button>
      </header>

      <div className="absolute top-[52px] sm:top-[60px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-[#EEEEEE] rounded-full shadow-sm">
        <span className="text-[9px] text-[#555555] tracking-wide">Grant recipient from</span>
        <span className="text-[7.5px] font-black tracking-widest uppercase text-[#111111]">SOLANA FOUNDATION</span>
      </div>

      <div className="absolute inset-0 top-[39px] pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 1400 760" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="purpleGrad7" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5507D4" />
              <stop offset="100%" stopColor="#4301C2" />
            </linearGradient>
          </defs>

          <polygon
            points={\`
              \${getPoint(0, 0).x},\${getPoint(0, 0).y}
              \${getPoint(16, 0).x},\${getPoint(16, 0).y}
              \${getPoint(13, 7).x},\${getPoint(13, 7).y}
              \${getPoint(8, 8).x},\${getPoint(8, 8).y}
              \${getPoint(3, 7).x},\${getPoint(3, 7).y}
            \`}
            fill="url(#purpleGrad7)"
            opacity="0.9"
          />

          {Array.from({ length: 12 }).map((_, r) => (
            <path
              key={\`row-\${r}\`}
              d={\`M \${getPoint(0, r).x} \${getPoint(0, r).y} Q \${getPoint(8, r).x} \${getPoint(8, r).y + 10} \${getPoint(16, r).x} \${getPoint(16, r).y}\`}
              stroke={r < 8 ? "rgba(255,255,255,0.45)" : "#EEEEEE"}
              strokeWidth="0.8"
              fill="none"
            />
          ))}
        </svg>
      </div>

      <div className="relative flex-1 flex items-center justify-center z-20">
        <div className="relative flex flex-col items-center">
          <img
            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788396671/3a059f9d-8c46-4728-bf70-841e4e9e51f4_d5prsx.png"
            alt="TARS 3D Sculpture"
            className="w-[240px] sm:w-[320px] md:w-[420px] animate-hero-float select-none drop-shadow-[0_20px_35px_rgba(139,66,255,0.25)]"
            referrerPolicy="no-referrer"
            draggable={false}
          />
          <div className="w-[180px] sm:w-[240px] h-[32px] bg-[#29084D]/25 rounded-full blur-[18px] -mt-6" />
        </div>
      </div>

      <div className="absolute left-6 md:left-14 top-[58%] -translate-y-1/2 max-w-[260px] z-30">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-[#111111] leading-[1.22] tracking-tight">
          The AI Architecture Protocol On Solana
        </h2>
        <p className="text-[9.5px] md:text-[10px] text-[#555555] mt-2 leading-[1.4]">
          Symbiotic AI app ecosystem dedicated to 1,000,000+ Solana users.
        </p>
      </div>

      <div className="absolute right-6 md:right-14 top-[58%] -translate-y-1/2 max-w-[260px] z-30 text-right md:text-left">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-[#111111] leading-[1.22]">
          AI Market
        </h2>
        <p className="text-[9.5px] md:text-[10px] text-[#555555] mt-2 leading-[1.4]">
          Access modular AI app and ecosystem products at a glance in one super-app.
        </p>
        <a href="#details" className="inline-flex items-center gap-1 text-[10px] font-medium text-[#222222] hover:text-black mt-2">
          <span>More details</span>
          <ArrowRight size={11} />
        </a>
      </div>

      <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <button className="h-[30px] px-4 bg-[#171717] hover:bg-[#282828] active:scale-[0.98] text-white text-[11px] font-medium rounded-[6px] flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-all">
          <span>Start Now</span>
          <ArrowRight size={12} />
        </button>

        <div className="flex items-center gap-3.5 mt-3 text-[#888888]">
          <button onClick={() => setActiveTab(0)} className={\`hover:text-black \${activeTab === 0 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Grid size={14} />
          </button>
          <button onClick={() => setActiveTab(1)} className={\`hover:text-black \${activeTab === 1 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <ArrowUpDown size={14} />
          </button>
          <button onClick={() => setActiveTab(2)} className={\`hover:text-black \${activeTab === 2 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Triangle size={14} />
          </button>
          <button onClick={() => setActiveTab(3)} className={\`hover:text-black \${activeTab === 3 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
\`\`\``,
            lovable: `[Lovable Component Generator]
Create a high-fidelity Web3 Hero component for TARS Protocol on Solana with amphitheater SVG grid and floating 3D sculpture.

Code:
` + `\`\`\`tsx
import React, { useState } from 'react';
import { ArrowRight, Wallet, ArrowUpDown, Grid, Triangle, Maximize2 } from 'lucide-react';

export default function TarsHeroArena() {
  const [activeTab, setActiveTab] = useState(0);

  const numCols = 16;
  const halfCols = 8;
  const rowBaseY = [12, 52, 100, 158, 224, 298, 380, 466, 528, 608, 686, 760];
  const rowSag = [14, 19, 24, 29, 34, 38, 41, 43, 44, 45, 46, 47];

  const getPoint = (c: number, r: number) => {
    const cNorm = (c - halfCols) / halfCols;
    const colWidthFactor = 1 - (r / 11) * 0.16;
    const x = 700 + cNorm * (1400 * 0.49) * colWidthFactor;
    const sag = (1 - cNorm * cNorm) * rowSag[r];
    const y = rowBaseY[r] + sag;
    return { x, y };
  };

  return (
    <div className="w-full h-screen h-[100dvh] bg-white text-[#111111] relative overflow-hidden flex flex-col font-sans select-none">
      <header className="h-[39px] border-b border-[#EAEAEA] px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-3 gap-0.5 w-3 h-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 rounded-full bg-[#111111]" />
            ))}
          </div>
          <span className="text-[13px] font-bold tracking-tight text-[#111111]">TARS</span>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-[11px] font-medium text-[#666666]">
          {['AI', 'Staking', 'Launchpad', 'Space', 'Ecosystem', 'Docs', 'Bridge', 'Governance'].map(item => (
            <a key={item} href={\`#\${item.toLowerCase()}\`} className="hover:text-black transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <button className="h-[27px] px-3 bg-[#111111] hover:bg-[#282828] text-white text-[11px] font-medium rounded-[5px] flex items-center gap-1.5 transition-colors">
          <Wallet size={12} />
          <span>Connect Wallet</span>
        </button>
      </header>

      <div className="absolute top-[52px] sm:top-[60px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-[#EEEEEE] rounded-full shadow-sm">
        <span className="text-[9px] text-[#555555] tracking-wide">Grant recipient from</span>
        <span className="text-[7.5px] font-black tracking-widest uppercase text-[#111111]">SOLANA FOUNDATION</span>
      </div>

      <div className="absolute inset-0 top-[39px] pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 1400 760" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="purpleGrad7" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5507D4" />
              <stop offset="100%" stopColor="#4301C2" />
            </linearGradient>
          </defs>

          <polygon
            points={\`
              \${getPoint(0, 0).x},\${getPoint(0, 0).y}
              \${getPoint(16, 0).x},\${getPoint(16, 0).y}
              \${getPoint(13, 7).x},\${getPoint(13, 7).y}
              \${getPoint(8, 8).x},\${getPoint(8, 8).y}
              \${getPoint(3, 7).x},\${getPoint(3, 7).y}
            \`}
            fill="url(#purpleGrad7)"
            opacity="0.9"
          />

          {Array.from({ length: 12 }).map((_, r) => (
            <path
              key={\`row-\${r}\`}
              d={\`M \${getPoint(0, r).x} \${getPoint(0, r).y} Q \${getPoint(8, r).x} \${getPoint(8, r).y + 10} \${getPoint(16, r).x} \${getPoint(16, r).y}\`}
              stroke={r < 8 ? "rgba(255,255,255,0.45)" : "#EEEEEE"}
              strokeWidth="0.8"
              fill="none"
            />
          ))}
        </svg>
      </div>

      <div className="relative flex-1 flex items-center justify-center z-20">
        <div className="relative flex flex-col items-center">
          <img
            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788396671/3a059f9d-8c46-4728-bf70-841e4e9e51f4_d5prsx.png"
            alt="TARS 3D Sculpture"
            className="w-[240px] sm:w-[320px] md:w-[420px] animate-hero-float select-none drop-shadow-[0_20px_35px_rgba(139,66,255,0.25)]"
            referrerPolicy="no-referrer"
            draggable={false}
          />
          <div className="w-[180px] sm:w-[240px] h-[32px] bg-[#29084D]/25 rounded-full blur-[18px] -mt-6" />
        </div>
      </div>

      <div className="absolute left-6 md:left-14 top-[58%] -translate-y-1/2 max-w-[260px] z-30">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-[#111111] leading-[1.22] tracking-tight">
          The AI Architecture Protocol On Solana
        </h2>
        <p className="text-[9.5px] md:text-[10px] text-[#555555] mt-2 leading-[1.4]">
          Symbiotic AI app ecosystem dedicated to 1,000,000+ Solana users.
        </p>
      </div>

      <div className="absolute right-6 md:right-14 top-[58%] -translate-y-1/2 max-w-[260px] z-30 text-right md:text-left">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-[#111111] leading-[1.22]">
          AI Market
        </h2>
        <p className="text-[9.5px] md:text-[10px] text-[#555555] mt-2 leading-[1.4]">
          Access modular AI app and ecosystem products at a glance in one super-app.
        </p>
        <a href="#details" className="inline-flex items-center gap-1 text-[10px] font-medium text-[#222222] hover:text-black mt-2">
          <span>More details</span>
          <ArrowRight size={11} />
        </a>
      </div>

      <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <button className="h-[30px] px-4 bg-[#171717] hover:bg-[#282828] active:scale-[0.98] text-white text-[11px] font-medium rounded-[6px] flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-all">
          <span>Start Now</span>
          <ArrowRight size={12} />
        </button>

        <div className="flex items-center gap-3.5 mt-3 text-[#888888]">
          <button onClick={() => setActiveTab(0)} className={\`hover:text-black \${activeTab === 0 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Grid size={14} />
          </button>
          <button onClick={() => setActiveTab(1)} className={\`hover:text-black \${activeTab === 1 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <ArrowUpDown size={14} />
          </button>
          <button onClick={() => setActiveTab(2)} className={\`hover:text-black \${activeTab === 2 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Triangle size={14} />
          </button>
          <button onClick={() => setActiveTab(3)} className={\`hover:text-black \${activeTab === 3 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
\`\`\``,
            advance: `[Advance Architecture Specification & Source Code]
Specification & Full Executable Source for TARS Protocol Hero & Arena Section:

` + `\`\`\`tsx
import React, { useState } from 'react';
import { ArrowRight, Wallet, ArrowUpDown, Grid, Triangle, Maximize2 } from 'lucide-react';

export default function TarsHeroArena() {
  const [activeTab, setActiveTab] = useState(0);

  const numCols = 16;
  const halfCols = 8;
  const rowBaseY = [12, 52, 100, 158, 224, 298, 380, 466, 528, 608, 686, 760];
  const rowSag = [14, 19, 24, 29, 34, 38, 41, 43, 44, 45, 46, 47];

  const getPoint = (c: number, r: number) => {
    const cNorm = (c - halfCols) / halfCols;
    const colWidthFactor = 1 - (r / 11) * 0.16;
    const x = 700 + cNorm * (1400 * 0.49) * colWidthFactor;
    const sag = (1 - cNorm * cNorm) * rowSag[r];
    const y = rowBaseY[r] + sag;
    return { x, y };
  };

  return (
    <div className="w-full h-screen h-[100dvh] bg-white text-[#111111] relative overflow-hidden flex flex-col font-sans select-none">
      <header className="h-[39px] border-b border-[#EAEAEA] px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-3 gap-0.5 w-3 h-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 rounded-full bg-[#111111]" />
            ))}
          </div>
          <span className="text-[13px] font-bold tracking-tight text-[#111111]">TARS</span>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-[11px] font-medium text-[#666666]">
          {['AI', 'Staking', 'Launchpad', 'Space', 'Ecosystem', 'Docs', 'Bridge', 'Governance'].map(item => (
            <a key={item} href={\`#\${item.toLowerCase()}\`} className="hover:text-black transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <button className="h-[27px] px-3 bg-[#111111] hover:bg-[#282828] text-white text-[11px] font-medium rounded-[5px] flex items-center gap-1.5 transition-colors">
          <Wallet size={12} />
          <span>Connect Wallet</span>
        </button>
      </header>

      <div className="absolute top-[52px] sm:top-[60px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-[#EEEEEE] rounded-full shadow-sm">
        <span className="text-[9px] text-[#555555] tracking-wide">Grant recipient from</span>
        <span className="text-[7.5px] font-black tracking-widest uppercase text-[#111111]">SOLANA FOUNDATION</span>
      </div>

      <div className="absolute inset-0 top-[39px] pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 1400 760" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="purpleGrad7" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5507D4" />
              <stop offset="100%" stopColor="#4301C2" />
            </linearGradient>
          </defs>

          <polygon
            points={\`
              \${getPoint(0, 0).x},\${getPoint(0, 0).y}
              \${getPoint(16, 0).x},\${getPoint(16, 0).y}
              \${getPoint(13, 7).x},\${getPoint(13, 7).y}
              \${getPoint(8, 8).x},\${getPoint(8, 8).y}
              \${getPoint(3, 7).x},\${getPoint(3, 7).y}
            \`}
            fill="url(#purpleGrad7)"
            opacity="0.9"
          />

          {Array.from({ length: 12 }).map((_, r) => (
            <path
              key={\`row-\${r}\`}
              d={\`M \${getPoint(0, r).x} \${getPoint(0, r).y} Q \${getPoint(8, r).x} \${getPoint(8, r).y + 10} \${getPoint(16, r).x} \${getPoint(16, r).y}\`}
              stroke={r < 8 ? "rgba(255,255,255,0.45)" : "#EEEEEE"}
              strokeWidth="0.8"
              fill="none"
            />
          ))}
        </svg>
      </div>

      <div className="relative flex-1 flex items-center justify-center z-20">
        <div className="relative flex flex-col items-center">
          <img
            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788396671/3a059f9d-8c46-4728-bf70-841e4e9e51f4_d5prsx.png"
            alt="TARS 3D Sculpture"
            className="w-[240px] sm:w-[320px] md:w-[420px] animate-hero-float select-none drop-shadow-[0_20px_35px_rgba(139,66,255,0.25)]"
            referrerPolicy="no-referrer"
            draggable={false}
          />
          <div className="w-[180px] sm:w-[240px] h-[32px] bg-[#29084D]/25 rounded-full blur-[18px] -mt-6" />
        </div>
      </div>

      <div className="absolute left-6 md:left-14 top-[58%] -translate-y-1/2 max-w-[260px] z-30">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-[#111111] leading-[1.22] tracking-tight">
          The AI Architecture Protocol On Solana
        </h2>
        <p className="text-[9.5px] md:text-[10px] text-[#555555] mt-2 leading-[1.4]">
          Symbiotic AI app ecosystem dedicated to 1,000,000+ Solana users.
        </p>
      </div>

      <div className="absolute right-6 md:right-14 top-[58%] -translate-y-1/2 max-w-[260px] z-30 text-right md:text-left">
        <h2 className="text-[17px] md:text-[19px] font-semibold text-[#111111] leading-[1.22]">
          AI Market
        </h2>
        <p className="text-[9.5px] md:text-[10px] text-[#555555] mt-2 leading-[1.4]">
          Access modular AI app and ecosystem products at a glance in one super-app.
        </p>
        <a href="#details" className="inline-flex items-center gap-1 text-[10px] font-medium text-[#222222] hover:text-black mt-2">
          <span>More details</span>
          <ArrowRight size={11} />
        </a>
      </div>

      <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <button className="h-[30px] px-4 bg-[#171717] hover:bg-[#282828] active:scale-[0.98] text-white text-[11px] font-medium rounded-[6px] flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-all">
          <span>Start Now</span>
          <ArrowRight size={12} />
        </button>

        <div className="flex items-center gap-3.5 mt-3 text-[#888888]">
          <button onClick={() => setActiveTab(0)} className={\`hover:text-black \${activeTab === 0 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Grid size={14} />
          </button>
          <button onClick={() => setActiveTab(1)} className={\`hover:text-black \${activeTab === 1 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <ArrowUpDown size={14} />
          </button>
          <button onClick={() => setActiveTab(2)} className={\`hover:text-black \${activeTab === 2 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Triangle size={14} />
          </button>
          <button onClick={() => setActiveTab(3)} className={\`hover:text-black \${activeTab === 3 ? 'text-[#111111] opacity-100' : 'opacity-40'}\`}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
\`\`\``
        }
    },
    {
        id: 'split-fuzzy-orb',
        title: 'Split-Canvas Creative Agency',
        description: 'Single-screen, dual-panel split canvas landing hero with an interactive 3D fuzzy purple torus orb, parallax physics, and minimalist editorial layout.',
        category: 'Agency & Portfolio',
        badge: 'NEW',
        framework: 'React 19 (TypeScript)',
        styling: 'Tailwind CSS',
        animation: 'CSS Keyframes + Parallax',
        isPro: false,
        liveDemoUrl: '/demo/split-fuzzy-orb',
        githubUrl: 'https://github.com/ui-hub/split-canvas-agency',
        previewGradient: 'from-purple-300 via-purple-400 to-purple-500',
        accentColor: '#d6c0e3',
        stats: {
            pages: 1,
            rating: 5.0,
            downloads: '3.4k',
        },
        features: [
            'Dual-tone split background canvas (#dccae9 / #d4bde2)',
            'Centerpiece fuzzy purple torus with CSS clip-path split',
            'Synchronized continuous circular spin & orbital float animations',
            'Interactive cursor tilt mouse parallax (±14px)',
            'Custom 7x7 diamond dot matrix SVG logo',
            'Interactive micro-button with hover copy transition'
        ],
        promptPreview: `Act as an elite frontend engineer and creative UI designer specializing in React, TypeScript, and Tailwind CSS. 

Generate a single-screen, split-canvas landing hero website inspired by modern minimalist creative agency aesthetics. Follow every specification, visual token, layout constraint, micro-interaction, animation keyframe, and piece of code detailed below with 100% precision.

---

### 1. Color Palette & Canvas Background
- **Root Background**: #d6c0e3 (soft pastel lilac/purple canvas).
- **Dual-Panel Split Tone**:
  - Left half (0% to 50%): #dccae9 (soft warm lilac tint).
  - Right half (50% to 100%): #d4bde2 (slightly deeper lavender tone).
  - Background CSS: linear-gradient(90deg, #dccae9 0%, #dccae9 50%, #d4bde2 50%, #d4bde2 100%).
- **Center Vertical Divider Line**:
  - Position: absolute left-1/2 top-0 bottom-0 w-[1px] (hidden on mobile, visible on md: and up).
  - Styling: bg-white/30 shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none z-10.
- **Text & Accent Colors**:
  - Primary text: text-white (#ffffff) with subtle drop shadow drop-shadow-[0_2px_10px_rgba(105,33,160,0.12)].
  - Subtitle: text-white/90 with tracking tracking-[0.04em].
  - Hamburger Menu lines: Deep plum #521c6e.

---

### 2. The Centerpiece: Split Fuzzy Purple Torus Object
- **High-Res Asset URL**:
  https://res.cloudinary.com/chhwhdhk/image/upload/v1788397387/163c51fa-49b7-4592-bbf9-1170c2a7a31d_j3aik9.png
- **Center Alignment**:
  - Sits dead-center horizontally and vertically (inset-0 flex items-center justify-center).
  - Rendered in two synchronized, overlapping halves using CSS clip-path.
- **Sizing Constraints**:
  - Height: h-[68vh] sm:h-[72vh] md:h-[78vh] lg:h-[82vh].
  - Min/Max bounds: min-h-[400px] max-h-[860px] w-auto max-w-none select-none pointer-events-none object-contain.
- **Split Mechanics**:
  1. Left Half (Blurry / Defocused):
     - Clip Path: clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)'
     - Filter: filter: 'blur(22px) saturate(135%) brightness(105%)'
     - Opacity: 0.98
  2. Right Half (Razor-Crisp & Sharp):
     - Clip Path: clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'
     - Filter: filter: 'contrast(110%) saturate(120%) brightness(102%) drop-shadow(0 20px 60px rgba(90, 20, 150, 0.42))'
- **Circular Motion & Physics**:
  Both halves must be wrapped in matching animation containers so the texture lines stay perfectly aligned:
  - Spin Animation (animate-orb-spin): Continuous 360° rotation (orbCircularMotion 45s linear infinite).
  - Circular Orbit Float (animate-orb-orbit): Gentle orbital floating path (orbCircularFloat 12s ease-in-out infinite).
  - Interactive Mouse Parallax: Smooth cursor tilt of ±14px based on mouse position.

---

### 3. Layout Grid & Micro-Element Placements
- Top-Left: Dotted Diamond Matrix Logo (7x7 matrix, fill="white" opacity-95)
- Left Panel: Typography & CTA Button ("We Build Digital", "We Design | We Develop | We Inspire.", "KNOW MORE" / "EXPLORE MORE")
- Top-Right: Navigation & Animated Hamburger Menu (bars #521c6e)
- Upper-Right Micro Navigation Chevrons (< and >)
- Bottom-Right: Social Media Badges (Instagram, Twitter/X, Facebook)`,
        toolPrompts: {
            cursor: `// .cursorrules - Creative Agency Split Canvas Directive
// Specialized Cursor Rule for Split-Canvas Minimalist Agency Hero

Follow this specification to generate the split-canvas agency hero with blurred/crisp torus and parallax physics:

1. DUAL-TONE CANVAS:
   - Root: #d6c0e3
   - Gradient: linear-gradient(90deg, #dccae9 0%, #dccae9 50%, #d4bde2 50%, #d4bde2 100%)
   - Center Line: absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/30

2. SPLIT FUZZY TORUS:
   - Asset: https://res.cloudinary.com/chhwhdhk/image/upload/v1788397387/163c51fa-49b7-4592-bbf9-1170c2a7a31d_j3aik9.png
   - Left half: clip-path polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%) with blur(22px)
   - Right half: clip-path polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%) with contrast(110%) drop-shadow(0 20px 60px rgba(90, 20, 150, 0.42))
   - Physics: animate-orb-spin (45s linear infinite) + animate-orb-orbit (12s ease-in-out infinite) + mouse parallax (±14px)

3. EXACT REACT + TAILWIND CODE:
\`\`\`tsx
import React, { useState, useEffect } from 'react';

const ORB_IMAGE_URL =
  'https://res.cloudinary.com/chhwhdhk/image/upload/v1788397387/163c51fa-49b7-4592-bbf9-1170c2a7a31d_j3aik9.png';

export const SplitFuzzyOrb: React.FC<{ interactiveOffset?: { x: number; y: number } }> = ({
  interactiveOffset = { x: 0, y: 0 },
}) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = ((e.clientX / innerWidth) - 0.5) * 14;
      const y = ((e.clientY / innerHeight) - 0.5) * 14;
      setMouseOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const totalOffsetX = mouseOffset.x + interactiveOffset.x;
  const totalOffsetY = mouseOffset.y + interactiveOffset.y;

  return (
    <div id="split-fuzzy-orb-container" className="absolute inset-0 pointer-events-none z-10 overflow-hidden flex items-center justify-center select-none">
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)' }}
      >
        <div
          className="transition-transform duration-300 ease-out will-change-transform animate-orb-orbit flex items-center justify-center"
          style={{ transform: \`translate(\${totalOffsetX}px, \${totalOffsetY}px)\` }}
        >
          <div className="animate-orb-spin flex items-center justify-center">
            <img
              src={ORB_IMAGE_URL}
              alt="Fuzzy Purple Torus - Defocused Left"
              className="h-[68vh] sm:h-[72vh] md:h-[78vh] lg:h-[82vh] max-h-[860px] min-h-[400px] w-auto max-w-none select-none pointer-events-none object-contain"
              style={{ filter: 'blur(22px) saturate(135%) brightness(105%)', opacity: 0.98 }}
            />
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)' }}
      >
        <div
          className="transition-transform duration-300 ease-out will-change-transform animate-orb-orbit flex items-center justify-center"
          style={{ transform: \`translate(\${totalOffsetX}px, \${totalOffsetY}px)\` }}
        >
          <div className="animate-orb-spin flex items-center justify-center">
            <img
              src={ORB_IMAGE_URL}
              alt="Fuzzy Purple Torus - Crisp Right"
              className="h-[68vh] sm:h-[72vh] md:h-[78vh] lg:h-[82vh] max-h-[860px] min-h-[400px] w-auto max-w-none select-none pointer-events-none object-contain"
              style={{ filter: 'contrast(110%) saturate(120%) brightness(102%) drop-shadow(0 20px 60px rgba(90, 20, 150, 0.42))' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DotLogo: React.FC = () => {
  const grid = [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ];
  const dotRadius = 1.6;
  const spacing = 4.2;
  const size = 7 * spacing;

  return (
    <div className="inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-105">
      <svg width={size} height={size} viewBox={\`0 0 \${size} \${size}\`} fill="none">
        {grid.map((row, r) =>
          row.map((val, c) =>
            val ? (
              <circle
                key={\`\${r}-\${c}\`}
                cx={c * spacing + dotRadius + 1}
                cy={r * spacing + dotRadius + 1}
                r={dotRadius}
                fill="white"
                className="opacity-95 hover:opacity-100 transition-opacity"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};

export const HeroContent: React.FC<{ onExploreClick?: () => void }> = ({ onExploreClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col items-start justify-center select-none z-10">
      <h1 className="text-white font-extrabold text-[52px] sm:text-[62px] md:text-[70px] lg:text-[78px] xl:text-[84px] leading-[0.93] tracking-[-0.035em] drop-shadow-[0_2px_10px_rgba(105,33,160,0.12)]">
        <span className="block">We</span>
        <span className="block">Build</span>
        <span className="block">Digital</span>
      </h1>
      <p className="mt-4 sm:mt-5 text-white/90 text-[10.5px] sm:text-[11.5px] md:text-[12px] font-normal tracking-[0.04em] whitespace-nowrap drop-shadow-[0_1px_4px_rgba(105,33,160,0.15)]">
        We Design | We Develop | We Inspire.
      </p>
      <div className="mt-4 sm:mt-5">
        <button
          onClick={onExploreClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="inline-flex items-center justify-center border border-white/95 rounded-[3px] px-3.5 py-[3.5px] sm:px-4 sm:py-[4px] bg-transparent text-white text-[9.5px] sm:text-[10px] font-semibold tracking-[0.14em] uppercase cursor-pointer transition-all duration-200 hover:bg-white/20 active:scale-95 shadow-[0_1px_4px_rgba(105,33,160,0.15)]"
        >
          {isHovered ? 'EXPLORE MORE' : 'KNOW MORE'}
        </button>
      </div>
    </div>
  );
};

export const ArrowControls: React.FC<{ onPrev?: () => void; onNext?: () => void }> = ({ onPrev, onNext }) => (
  <div className="flex items-center space-x-5 sm:space-x-6 z-20">
    <button onClick={onPrev} className="text-white/90 hover:text-white transition-transform duration-200 hover:-translate-x-0.5 active:scale-90 cursor-pointer p-1">
      <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-current drop-shadow-[0_1px_4px_rgba(105,33,160,0.2)]" viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button onClick={onNext} className="text-white/90 hover:text-white transition-transform duration-200 hover:translate-x-0.5 active:scale-90 cursor-pointer p-1">
      <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-current drop-shadow-[0_1px_4px_rgba(105,33,160,0.2)]" viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);

export const SocialIcons: React.FC = () => {
  const iconBox = "w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] rounded-[3px] border border-white/85 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200 cursor-pointer shadow-[0_1px_3px_rgba(105,33,160,0.12)] active:scale-95";
  return (
    <div className="flex items-center space-x-2.5 sm:space-x-3 z-20">
      <a href="#instagram" className={iconBox}>
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </a>
      <a href="#twitter" className={iconBox}>
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        </svg>
      </a>
      <a href="#facebook" className={iconBox}>
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      </a>
    </div>
  );
};

export const NavHeader: React.FC<{ onMenuToggle?: () => void; isMenuOpen?: boolean }> = ({ onMenuToggle, isMenuOpen }) => {
  const [activeNav, setActiveNav] = useState('Home');
  const links = ['Home', 'About us', 'Portfolio'];

  return (
    <nav className="flex items-center space-x-6 sm:space-x-7 z-20">
      <div className="hidden sm:flex items-center space-x-6 sm:space-x-7">
        {links.map((link) => (
          <button
            key={link}
            onClick={() => setActiveNav(link)}
            className={\`text-[11px] sm:text-[12px] tracking-wider transition-all duration-200 cursor-pointer \${
              activeNav === link ? 'text-white font-medium opacity-100' : 'text-white/85 font-normal hover:text-white hover:opacity-100'
            }\`}
          >
            {link}
          </button>
        ))}
      </div>
      <button onClick={onMenuToggle} className="flex flex-col justify-center items-end w-6 h-6 space-y-[4px] cursor-pointer group p-1 -mr-1">
        <span className={\`h-[2px] rounded-full bg-[#521c6e] transition-all duration-300 \${isMenuOpen ? 'w-5 translate-y-[6px] rotate-45' : 'w-5'}\`} />
        <span className={\`h-[2px] rounded-full bg-[#521c6e] transition-all duration-300 \${isMenuOpen ? 'w-5 opacity-0' : 'w-5'}\`} />
        <span className={\`h-[2px] rounded-full bg-[#521c6e] transition-all duration-300 \${isMenuOpen ? 'w-5 -translate-y-[6px] -rotate-45' : 'w-5'}\`} />
      </button>
    </nav>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [orbOffset, setOrbOffset] = useState({ x: 0, y: 0 });

  const handlePrev = () => {
    setOrbOffset((prev) => ({ x: prev.x - 12, y: prev.y }));
    setTimeout(() => setOrbOffset({ x: 0, y: 0 }), 300);
  };

  const handleNext = () => {
    setOrbOffset((prev) => ({ x: prev.x + 12, y: prev.y }));
    setTimeout(() => setOrbOffset({ x: 0, y: 0 }), 300);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none bg-[#d6c0e3] flex">
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'linear-gradient(90deg, #dccae9 0%, #dccae9 50%, #d4bde2 50%, #d4bde2 100%)' }}
      />
      <SplitFuzzyOrb interactiveOffset={orbOffset} />
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/30 z-10 pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.4)]" />

      <section className="relative z-20 w-full md:w-1/2 h-full flex flex-col justify-between px-8 sm:px-12 md:px-14 lg:px-16 py-7 sm:py-8 pointer-events-none">
        <div className="flex items-center pointer-events-auto">
          <DotLogo />
        </div>
        <div className="my-auto pointer-events-auto">
          <HeroContent onExploreClick={() => setIsMenuOpen(true)} />
        </div>
        <div className="h-6 opacity-0 pointer-events-none" />
      </section>

      <section className="hidden md:flex relative z-20 w-1/2 h-full flex-col justify-between px-8 sm:px-12 md:px-14 lg:px-16 py-7 sm:py-8 pointer-events-none">
        <div className="flex justify-end items-center pointer-events-auto">
          <NavHeader onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />
        </div>
        <div className="absolute top-[21%] lg:top-[22%] right-[22%] lg:right-[24%] pointer-events-auto">
          <ArrowControls onPrev={handlePrev} onNext={handleNext} />
        </div>
        <div className="flex justify-end items-center pointer-events-auto">
          <SocialIcons />
        </div>
      </section>
    </main>
  );
}
\`\`\``,
            claude: `You are Claude Code, an expert autonomous engineering agent.
Execute the specification to build the Split-Canvas Creative Agency Hero website with dual-panel split tone, centerpiece fuzzy purple torus (clip-path split with left blur, right sharp contrast), 7x7 diamond dot matrix SVG logo, and mouse parallax physics.`,
            antigravity: `ANTIGRAVITY DESIGN & IMPLEMENTATION BLUEPRINT:
Task: Build Split-Canvas Creative Agency Hero with continuous 3D torus physics, dual-tone split canvas, and SVG dot diamond matrix.

Follow all architectural parameters:
- Root: #d6c0e3
- Left 50%: #dccae9, Right 50%: #d4bde2
- Center vertical 1px divider: bg-white/30
- Asset: https://res.cloudinary.com/chhwhdhk/image/upload/v1788397387/163c51fa-49b7-4592-bbf9-1170c2a7a31d_j3aik9.png
- Physics: animate-orb-spin (45s linear infinite) + animate-orb-orbit (12s ease-in-out infinite) + mouse parallax (±14px)`,
            lovable: `Generate a single-screen creative agency split hero in React, TypeScript, and Tailwind CSS.
Include:
- Dual-tone gradient canvas background (#dccae9 to #d4bde2)
- Centered 3D fuzzy purple torus with CSS polygon clip-path split (blurred left, sharp right)
- Dot diamond matrix logo and interactive micro-CTA button`,
            advance: `ENGINEERING SPECIFICATION & ARCHITECTURAL OVERVIEW:
SPLIT-CANVAS CREATIVE AGENCY HERO

1. Split-Canvas Physics & Math:
- Polygon clip-path 50% split with synchronous dual-layer container
- Parallax tilt delta: ±14px via normalized mouse client offset

2. Micro-interactions:
- Interactive button hover text swap ('KNOW MORE' -> 'EXPLORE MORE')
- Micro navigation chevrons (< and >) with nudge animation
- 7x7 SVG diamond dot matrix logo`
        }
    },
    {
        id: 'segmint-2026',
        title: 'Segmint 2026',
        description: 'Brutalist Web3 editorial metadata footer component inspired by Swiss brutalism, technical cryptographic ledger interfaces, and retro voxel typography.',
        category: 'Web3 & FinTech',
        badge: 'NEW',
        framework: 'React + TS + Tailwind',
        styling: 'Tailwind CSS',
        animation: '5x5 SVG Voxel Engine',
        isPro: false,
        liveDemoUrl: '/demo/segmint-2026',
        githubUrl: 'https://github.com/ui-hub/segmint-2026',
        previewGradient: 'from-neutral-200 via-[#0755CE]/10 to-neutral-300',
        accentColor: '#0755CE',
        stats: {
            pages: 1,
            rating: 5.0,
            downloads: '3.1k',
        },
        features: [
            'Disintegrating crypto pixel wave transition (#0755CE to #E8E9EE)',
            'Mid-right brutalist marketing statement with 24px dash rule',
            'Giant pixel-art typography for SEGMINT 2026 (5x5 SVG engine)',
            'Full-width 1.5px hairline divider and 3-column brutalist legal footer'
        ],
        promptPreview: `Create a standalone, pixel-perfect brutalist Web3 editorial footer section in React 18+ with TypeScript and Tailwind CSS matching this exact layout:

1. BACKGROUND & PALETTE:
   - Top edge starts with an organic, disintegrating crypto pixel wave transitioning from cobalt blue (#0755CE) to concrete light gray (#E8E9EE).
   - Section background: solid concrete light gray (#E8E9EE).
   - Pixel typography and accent ink: vibrant cobalt blue (#0755CE).
   - Text, divider rules, and dashes: pure black (#000000).

2. MID-RIGHT STATEMENT BLOCK:
   - Positioned in the middle right of the canvas.
   - A bold black horizontal dash (width 24px, height 2px) preceding the text.
   - Text in bold uppercase monospace (font-mono font-bold text-xs sm:text-sm tracking-widest text-black):
     MARKETING
     APPROACH
     WEBSITE
     DEVELOPMENT
     WITH OUTSTANDING
     DESIGN
   - Slightly to the right of this block, the label: "IN"

3. LOWER TYPOGRAPHIC & INQUIRY SECTION:
   - Bottom-Left: Giant pixel-art typography rendered via crisp SVG bitmap matrices:
     Line 1: "SEGMINT" (cobalt blue #0755CE)
     Line 2: "2026" (cobalt blue #0755CE)
     Rendered with shapeRendering="crispEdges" and zero external font dependencies.
   - Bottom-Center / Right:
     A small inquiry prompt in micro uppercase monospace (text-[9px] sm:text-[10px] tracking-wider text-black):
     "INTERESTED TO START A PROJECT WITH US?"
   - Far Bottom-Right:
     Stacked micro copy (text-[8px] sm:text-[9px] font-mono tracking-widest uppercase text-right text-black):
     LETS FIND OUT
     WHAT WE CAN DO
     FOR YOU.

4. FULL-WIDTH HAIRLINE DIVIDER:
   - A crisp 1.5px solid black divider line spanning the full width with horizontal padding.

5. BOTTOM LEGAL FOOTER:
   - Clean 3-column flex layout (text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-black pt-3 pb-4):
     - Left: "© BY JAINIL PATEL"
     - Center: "[ WEB 3 ] [ NFT ]"
     - Right: "UI HUB 2026"`,
        toolPrompts: {
            cursor: `/* .cursorrules - Segmint 2026 Brutalist Web3 Editorial Footer Directive */
Create a standalone, pixel-perfect brutalist Web3 editorial footer section in React 18+ with TypeScript and Tailwind CSS.
Include:
1. PixelParticleTransition: organic disintegrating crypto pixel wave (cobalt blue #0755CE to concrete #E8E9EE).
2. Mid-right statement block: 24px black dash preceding uppercase marketing statement + 'IN'.
3. Lower section: 5x5 SVG pixel typography for SEGMINT 2026 (#0755CE) + project inquiry callouts.
4. 1.5px solid black divider line.
5. 3-Column legal footer: © BY JAINIL PATEL | [ WEB 3 ] [ NFT ] | UI HUB 2026.`,
            claude: `You are Claude Code, an expert autonomous engineering agent.
Rebuild the Segmint 2026 Brutalist Web3 editorial footer section with:
- Disintegrating pixel wave transition (#0755CE to #E8E9EE)
- Mid-right marketing statement with dash prefix
- Bottom-left giant SVG pixel typography for SEGMINT 2026
- Micro project inquiry callouts and 3-column legal footer`,
            antigravity: `ANTIGRAVITY BLUEPRINT: SEGMINT 2026 FOOTER
Task: Build brutalist Web3 editorial footer with disintegrating crypto pixel wave and retro voxel typography.
Palette:
- Concrete Gray: #E8E9EE
- Cobalt Blue: #0755CE
- Black Ink: #000000 (1.5px divider, 2px dash)
Components:
- PixelParticleTransition (stepped organic columns)
- Mid-right statement block with horizontal rule
- PixelText SVG engine (5x5 glyph matrices with crispEdges)`,
            lovable: `Create the Segmint 2026 brutalist Web3 editorial footer in React, TypeScript, and Tailwind CSS with disintegrating pixel wave transition, mid-right marketing statement, SEGMINT 2026 pixel typography, and legal footer.`,
            advance: `ENGINEERING SPECIFICATION: SEGMINT 2026 EDITORIAL FOOTER
1. Wave Transition: 55-column organic stepped bars with opacity-90 white overlay and #E8E9EE base
2. Mid-right Statement: font-mono text-xs sm:text-sm font-bold uppercase with 24px dash rule
3. SVG Pixel Engine: 5x5 character matrices rendered as SVG rects with crispEdges for SEGMINT 2026
4. Legal Footer: 3-column responsive flex with 1.5px hairline divider`
        }
    },
    {
        id: 'haos-tech-solutions',
        title: 'HAOS Tech Solutions',
        description: 'Pixel-perfect brutalist technical dark-mode showcase with split 3D volumetric glowing neon-green circle, sliced blurred glass louvers, and progress telemetry.',
        category: 'Agency & Portfolio',
        badge: 'NEW',
        framework: 'React 19 (TypeScript)',
        styling: 'Tailwind CSS',
        animation: 'Split 3D Volumetric Canvas Bloom',
        isPro: false,
        liveDemoUrl: '/demo/haos-tech-solutions',
        githubUrl: 'https://github.com/ui-hub/haos-tech-solutions',
        previewGradient: 'from-black via-[#061B0B] to-[#98FF68]/30',
        accentColor: '#98FF68',
        stats: {
            pages: 1,
            rating: 5.0,
            downloads: '4.2k',
        },
        features: [
            'Split 3D volumetric glowing neon-green circle on HTML5 Canvas',
            'Left-side sliced slit-scan optical glass strips with harmonic displacement',
            'Right-side 6-pass crystal-clear radiant bloom semicircle',
            'Technical metadata header & High-Quality Development +2K metric bar',
            'Precision custom SVG geometric NAOS vector logo',
            'Glassmorphic action button with radial ambient glow and hover micro-interaction'
        ],
        promptPreview: `Create a pixel-perfect, ultra-clean brutalist/technical dark-mode showcase hero and footer section inspired by high-end design agencies (HAOS Tech Solutions / NAOS). The layout features a deep obsidian canvas (#020202), crisp white typography, an interactive technical progress indicator, a floating glassmorphic action button, and a real-time animated HTML5 Canvas artwork featuring a split 3D volumetric glowing neon-green circle (with sliced, blurred optical glass strips on the left and a pristine, crystal-clear radiant semicircle on the right).

---

### 1. Visual Identity, Spacing & Layout Architecture

- **Canvas Background**: Pure deep black \`#020202\` spanning full viewport height (\`min-h-[100dvh]\`, \`h-[100dvh]\`, \`overflow-hidden\`, \`select-none\`).
- **Layout Structure**: Vertical flex container (\`flex flex-col justify-between\`) split into 3 distinct layers:
  1. **Top Metadata Header**: \`pt-6 sm:pt-[55px] lg:pt-[65px] px-6 sm:px-[60px] lg:px-[95px]\`.
  2. **Middle Content Stage**: Full flex height, containing the main titles on the left and the centered/offset geometric vector logo.
  3. **Bottom Footer Section**: \`pb-6 sm:pt-4 sm:pb-[55px] lg:pb-[65px] px-6 sm:px-[60px] lg:px-[95px] flex items-end justify-between\`.
- **Z-Index Hierarchy**:
  - Background Canvas + Gradient Masks: \`z-0\` & \`z-10\`
  - Interactive & Typographic Layers: \`z-20\`

---

### 2. Typography & Text Placements

- **Font Families**:
  - Primary Display & Headings: \`Inter\`, sans-serif (weights: 300 Light, 700 Bold).
  - Technical Data & Metadata Labels: \`Space Grotesk\`, sans-serif (weights: 500 Medium, 600 SemiBold, 700 Bold).

- **Header Metadata (Top Bar)**:
  - Mobile: 2-column responsive grid (\`grid grid-cols-2 gap-y-3 gap-x-6\`).
  - Desktop: Horizontal aligned flex row (\`sm:flex sm:flex-row sm:items-start sm:gap-0\`).
  - Column 1 (\`w-full sm:w-[29%]\`): Label \`"CATEGORY:"\` (\`text-[9px] sm:text-[10px] font-medium tracking-widest text-white/80\`), Value \`"BRANDING"\` (\`text-[10px] sm:text-[11px] font-bold tracking-widest text-white\`).
  - Column 2 (\`w-full sm:w-[26%]\`): Label \`"YEAR"\` (\`text-[9px] sm:text-[10px] font-medium tracking-widest text-white/80\`), Value \`"2024"\` (\`text-[10px] sm:text-[11px] font-bold tracking-widest text-white\`).
  - Column 3 (\`w-full sm:w-[45%]\`): Label \`"TECH SOLUTIONS"\` (\`text-[9px] sm:text-[10px] font-medium tracking-widest text-white/80\`), Value \`"AUTOMATION & ROBOTICS"\` (\`text-[10px] sm:text-[11px] font-bold tracking-widest text-white\`).

- **Hero Headings (Middle Left Block)**:
  - Container width constrained to \`max-w-[420px]\`.
  - Main Title: \`"HAOS Tech\\nSolutions"\` (\`text-[25px] sm:text-[32px] lg:text-[34px] font-bold text-white tracking-[-0.02em] leading-[1.12]\`).
  - Subtitle: \`"Brand Concept &\\nIdentity"\` (\`mt-5 sm:mt-7 lg:mt-9 text-[17px] sm:text-[22px] lg:text-[23px] font-bold text-white tracking-[-0.015em] leading-[1.2]\`).

- **Geometric NAOS Logo**:
  - Position on desktop: \`lg:absolute lg:left-[48%] lg:top-[38%] transform -translate-y-1/2\`.
  - Precision custom SVG paths for letters \`N\`, \`A\`, \`O\`, \`S\` with rounded corners and consistent stroke width.
  - Sizing: \`w-[102px] sm:w-[115px] lg:w-[128px]\`, \`drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]\`.

- **Lower-Left Technical Metric & Timeline**:
  - Label: \`"HIGH-QUALITY\\nDEVELOPMENT"\` (\`text-[9px] sm:text-[10px] lg:text-[11px] font-semibold tracking-wider text-white/95 uppercase leading-[1.25] font-['Space_Grotesk']\`).
  - Large Metric Counter: \`"+2K"\` (\`text-[32px] sm:text-[40px] lg:text-[46px] font-light text-white tracking-tight leading-none font-['Inter']\`).
  - Timeline Width: \`w-[190px] sm:w-[230px] lg:w-[250px]\`.
  - 4 Vertical Calibration Ticks: Height \`10px\`, width \`1px\`, background \`rgba(255,255,255,0.38)\` placed precisely at \`0%\`, \`33.3%\`, \`66.6%\`, and \`100%\`.
  - Progress Track: Base background \`rgba(255,255,255,0.15)\`, active filled segment \`w-[66.6%]\` colored in radiant neon green \`#98FF68\` with \`box-shadow: 0 0 10px rgba(152,255,104,0.7)\`.

- **Lower-Right Glass Action Button ("+")**:
  - Sizing: \`w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] lg:w-[54px] lg:h-[54px]\`.
  - Styling: Rounded square (\`rounded-2xl\`), frosted glass backdrop blur (\`backdrop-blur-md\`), surface background \`rgba(255,255,255,0.04)\`.
  - Border: Subtle gradient border (\`border border-white/10 hover:border-[#98FF68]/40\`).
  - Subtle green interior ambient glow: \`radial-gradient(circle at center, rgba(152,255,104,0.14) 0%, transparent 70%)\`.
  - Hover state: Spring animation \`scale(1.05)\` with neon green border glow.
  - Center Icon: Minimalist \`+\` cross icon in crisp white.

---

### 3. Canvas Artwork Specification: Split 3D Neon Green Circle

The background runs on an HTML5 \`<canvas>\` animated via \`requestAnimationFrame\`:
1. **Coordinates**:
   - Desktop: Center X \`cx = width * 0.75\`, Center Y \`cy = height * 0.48\`. Base radius \`baseRadius = max(min(width * 0.22, height * 0.36), 230)\`.
   - Mobile: Center X \`cx = width * 0.82\`, Center Y \`cy = height * 0.46\`. Base radius \`baseRadius = max(min(width * 0.36, height * 0.22), 130)\`.
   - Smooth subtle breathing pulse: \`curRadius = baseRadius * (1 + Math.sin(time * 0.6) * 0.016)\`.
2. **Right Side (Perfectly Crisp Semicircle)**:
   - Sliced strictly from \`cx\` to the right viewport edge (\`ctx.rect(cx - 0.5, 0, width - cx + 10, height)\`).
   - Multi-layer volumetric bloom stack with 6 blur/stroke passes:
     - Outer glow: \`blur: 95px, stroke: 230px, color: #103816, alpha: 0.72\`
     - Mid glow: \`blur: 58px, stroke: 165px, color: #267e28, alpha: 0.82\`
     - Lime body: \`blur: 32px, stroke: 112px, color: #5cd342, alpha: 0.90\`
     - Core neon: \`blur: 16px, stroke: 64px, color: #98FF68, alpha: 0.98\`
     - Intense rim: \`blur: 7px, stroke: 26px, color: #C6FF8E, alpha: 1.0\`
     - Pure white focal wire: \`blur: 1.5px, stroke: 8px, color: #FFFFFF, alpha: 0.95\`
   - Orbiting photon waves revolving continuously along the perimeter.
   - Dark hollow center void: \`ctx.filter = 'blur(34px)'; ctx.fillStyle = '#020202'; ctx.arc(cx, cy, curRadius * 0.54, 0, Math.PI * 2)\`.
3. **Left Side (Blurred Slit-Scan Glass Strips)**:
   - 8 distinct vertical louvers on desktop (6 on mobile) occupying the left semicircle width (\`totalWidth = curRadius * 1.35\`).
   - Vertical harmonic displacement: \`stepY = Math.sin(slicePhase) * 6 + ((i % 2 === 0) ? -3.5 : 3.5)\`.
   - Frosted optical strip gradients, interior glow lines, and fine vertical glass divider lines.
   - Atmospheric edge bleed and linear feathering so the leftmost edge fades smoothly into \`#020202\` without any hard boundary cuts.
4. **Dividing Meridian**:
   - Soft glow line (\`blur: 4px, stroke: 3px, color: rgba(152,255,104,0.35)\`) and hairline center tick (\`lineWidth: 1px, color: rgba(255,255,255,0.12)\`) at X = \`cx\`.
5. **Film Grain & Legibility Overlay**:
   - SVG noise overlay with \`opacity-[0.06] mix-blend-overlay\`.
   - Dark horizontal gradient mask keeping all typography on the left 100% readable and pitch-black.`,
        toolPrompts: {
            cursor: `/* .cursorrules - HAOS Tech Solutions Dark Brutalist Showcase Directive */
Create a pixel-perfect, ultra-clean brutalist technical dark-mode showcase hero and footer in React 18+ with TypeScript and Tailwind CSS.
Include:
1. BackgroundArtwork: Animated split 3D volumetric glowing neon-green circle on HTML5 Canvas (#020202 base, #98FF68 core neon, 8 blurred glass louvers on left, pristine 6-pass bloom semicircle on right).
2. TopMetadata: Responsive grid header (CATEGORY: BRANDING, YEAR: 2024, TECH SOLUTIONS: AUTOMATION & ROBOTICS).
3. Hero title: 'HAOS Tech Solutions' + 'Brand Concept & Identity'.
4. HaosLogo: Precision geometric vector NAOS logo with custom SVG paths.
5. MetricProgress: 'HIGH-QUALITY DEVELOPMENT' + '+2K' with 4-tick calibration bar and neon-green progress track.
6. TechIcon: Frosted glassmorphic action button with radial ambient glow and hover rotate-90.`,
            claude: `You are Claude Code, an expert autonomous frontend engineer.
Build the HAOS Tech Solutions dark-mode brutalist technical showcase hero:
- Deep obsidian canvas (#020202) with noise overlay and dark gradient mask
- Real-time animated HTML5 Canvas split 3D volumetric neon-green sphere (#98FF68)
- Left side with 8 sliced optical blurred glass strips and harmonic displacement
- Right side with 6-pass crystal-clear radiant bloom and revolving photon arcs
- Top metadata bar, middle titles, geometric NAOS logo, and lower-left calibration timeline (+2K)`,
            antigravity: `ANTIGRAVITY DIRECTIVE: HAOS TECH SOLUTIONS SHOWCASE
Objective: Construct an ultra-clean brutalist technical dark-mode showcase inspired by high-end design agencies (HAOS Tech Solutions / NAOS).
Visual Tokens:
- Canvas: #020202 (pure deep obsidian)
- Accent: #98FF68 (radiant neon green with 0 0 10px glow)
- Secondary Accent: #C6FF8E & #5cd342
Canvas Mechanics:
- Split circle at X = 0.75 * width, Y = 0.48 * height
- Sliced left half (8 optical frosted strips with vertical sine displacement)
- 6-pass volumetric bloom right half with hollow center void
- Geometric NAOS SVG logo and lower-left +2K timeline with 4 calibration ticks`,
            lovable: `Create the HAOS Tech Solutions dark brutalist showcase in React, TypeScript, and Tailwind CSS with real-time animated split 3D volumetric neon-green circle canvas, top technical metadata header, geometric NAOS logo, and lower-left progress timeline.`,
            advance: `MATHEMATICAL & TECHNICAL SPECIFICATION: HAOS TECH SOLUTIONS
1. Split Semicircle Bloom: Multi-pass canvas rendering with filters ranging from 95px down to 1.5px using colors #103816, #267e28, #5cd342, #98FF68, #C6FF8E, #FFFFFF.
2. Slit-Scan Harmonic Louvers: 8 vertical slices with phase shift stepY = Math.sin(slicePhase) * 6 + ((i % 2 === 0) ? -3.5 : 3.5).
3. Geometric Vector Logo: Exact stroke geometry for N, A, O, S letters with rounded corners.
4. Telemetry Bar: 4 ticks at 0%, 33.3%, 66.6%, 100% with neon green #98FF68 active track.`
        }
    },
    {
        id: 'mentality',
        title: 'mēntality',
        description: 'Bauhaus-inspired minimalist healthcare & mental wellbeing landing page with technical blueprint geometry, inline SVG glyphs, and interactive AI search.',
        category: 'Agency & Portfolio',
        badge: 'NEW',
        framework: 'React 19 (TypeScript)',
        styling: 'Tailwind CSS',
        animation: 'Interactive Blueprint SVG Canvas',
        isPro: false,
        liveDemoUrl: '/demo/mentality',
        githubUrl: 'https://github.com/ui-hub/mentality',
        previewGradient: 'from-[#F0F0F0] via-[#E2E2E2] to-[#B7B7B7]/30',
        accentColor: '#111111',
        stats: {
            pages: 1,
            rating: 5.0,
            downloads: '3.9k',
        },
        features: [
            'Minimalist Bauhaus aesthetic on light warm-neutral gray (#F0F0F0)',
            'Technical blueprint guidelines with concentric sweeping arcs and diamond markers',
            '3-line typographic headline with inline geometric eye SVG glyph',
            'Interactive AI prompt search input with instant query feedback',
            'Clean vector character artwork with preserved aspect ratio',
            'Lower-right interactive language toggle badge (pl - en / en - pl)'
        ],
        promptPreview: `Build a pixel-perfect, minimalist Bauhaus-inspired landing hero and interactive artwork section for "mēntality" in React, TypeScript, and Tailwind CSS. Ensure all font sizes, spacings, colors, mathematical layout dimensions, SVG vectors, animations, and image placements match the exact specification provided below.

---

### 1. DESIGN SPECIFICATIONS & TOKENS

- **Canvas & Background Color**: \`#F0F0F0\` (light warm-neutral gray)
- **Container**: Max width \`1100px\`, centered (\`mx-auto\`), full viewport height min (\`min-h-screen\`), flex column layout.
- **Typography Font Family**: \`'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif\`
- **Primary Text Colors**:
  - Headings / Strong: \`#111111\`
  - Subheadings / Faded lines: \`#666666\`
  - Secondary / Links: \`#222222\` and \`#444444\`
- **Technical Drawing Grid Lines**:
  - Horizontal guideline: \`#B7B7B7\` (stroke-width: 0.8, dasharray: "2 3")
  - Diagonal guidelines: \`#BFBFBF\` (stroke-width: 0.8) and \`#CECECE\` (dasharray: "3 3")
  - Concentric curves: \`#C5C5C5\` and \`#B5B5B5\` (stroke-width: 0.8–0.9)
- **Button Colors**:
  - Black action button: Background \`#050505\`, hover \`#222222\`, text \`#FFFFFF\`
- **Central Character Asset**:
  - URL: \`https://res.cloudinary.com/chhwhdhk/image/upload/v1788400409/8edc532e-6a4a-463d-a224-b4da52b15c8e_rwv0s3.png\`
  - No glow effect, rendered clean with SVG \`<image>\` preserveAspectRatio="xMidYMid meet"`,
        toolPrompts: {
            cursor: `/* .cursorrules - mēntality Bauhaus Healthcare Landing Page Directive */
Create a pixel-perfect, minimalist Bauhaus-inspired landing hero for mēntality in React, TypeScript, and Tailwind CSS.
Include:
1. Palette: #F0F0F0 background, #111111 text, #666666 subheadings, #050505 buttons.
2. Header: Geometric cross logo + 'mēntality', navigation links (service/patient resources stacked, about us, education center), 'get started →' button.
3. Hero: 4-line typography headline with inline geometric eye SVG glyph.
4. AI Prompt Input: pill input + curved diagonal launch arrow button with simulated search state.
5. Central Blueprint SVG: Technical dashed lines, anchor circles with diamond centers, concentric arcs, clean character image asset, and interactive language badge.`,
            claude: `You are Claude Code, an expert frontend engineer.
Build the mēntality Bauhaus-inspired mental wellbeing landing hero:
- Warm-neutral gray (#F0F0F0) canvas
- Geometric cross logo and stacked navigation links
- 4-line headline with inline eye SVG icon
- AI search prompt input with action button
- Technical drawing blueprint SVG canvas with anchor circles, concentric arcs, and character artwork`,
            antigravity: `ANTIGRAVITY BLUEPRINT: MĒNTALITY HERO
Design System:
- Canvas: #F0F0F0 (warm-neutral gray)
- Inks: #111111, #666666, #222222
- Geometry: Mathematical grid lines, anchor circles (cx=50, cy=340 & cx=910, cy=340), concentric arcs at y=490
- Typographic hierarchy: 4-line stacked text with inline eye icon (28x16)
- Interactive prompt bar with live response indicator and pl/en toggle badge`,
            lovable: `Create the mēntality Bauhaus mental wellbeing landing hero in React, TypeScript, and Tailwind CSS with warm gray #F0F0F0 background, 4-line headline with eye icon, AI prompt input, and technical blueprint artwork SVG with character illustration.`,
            advance: `TECHNICAL SPECIFICATION: MĒNTALITY BAUHAUS HERO
1. Blueprint Geometry: SVG viewBox 0 0 960 490 with horizontal guide at y=290, diagonal rays, dual r=92 anchor circles with diamond centroids, and 3 concentric sweeping arcs (r=420, 360, 300).
2. Typographic Glyph: Eye icon vector inline in heading line 4 with pupil circle r=2.8.
3. Character Layer: Crisp SVG image embed without drop-shadow or blur.`
        }
    },
    {
        id: 'lakera-ai-security',
        title: 'Lakera AI Security Hero',
        description: 'GenAI security hero with slit-scan volumetric circular core graphic, responsive brand proof trust section, and floating support chat bubble.',
        category: 'SaaS & AI',
        badge: 'NEW',
        framework: 'React 19 (TypeScript)',
        styling: 'Tailwind CSS',
        animation: 'Slit-Scan Graphic & Ambient Pulse',
        isPro: false,
        liveDemoUrl: '/demo/lakera-ai-security',
        githubUrl: 'https://github.com/ui-hub/lakera-ai-security',
        previewGradient: 'from-white via-neutral-100 to-neutral-200',
        accentColor: '#000000',
        stats: {
            pages: 1,
            rating: 5.0,
            downloads: '4.7k',
        },
        features: [
            'Clean pure white (#ffffff) enterprise GenAI security hero layout',
            'Right-side slit-scan circular core graphic with responsive viewport scaling',
            'Precise vector SVG logos for Cohere, Nexxiot, DEKRA, ANYbotics, Protex AI, and Juro',
            'Elevated negative translation rhythm (-translate-y-3 to -translate-y-6)',
            'Floating support chat bubble with custom smiling avatar SVG',
            'Full enterprise navigation header with dropdowns and CTA'
        ],
        promptPreview: `Act as a Principal Design Technologist and Staff Frontend Engineer specializing in Tailwind CSS, React, and high-fidelity enterprise landing pages.

Build an exact 1:1 pixel-perfect, responsive replica of the Lakera AI Hero landing page. Do not skip any detail. Every font size, weight, tracking value, exact hex color, SVG vector, hover transition, layout grid coordinate, and responsive behavior must match the specification below.

---

### 1. GLOBAL ENVIRONMENT & CONTAINER RULES
- **Page Canvas**: Pure white background (\`#ffffff\` / \`bg-white\`), \`min-h-screen text-neutral-900 font-sans antialiased flex flex-col justify-between selection:bg-neutral-900 selection:text-white\`.
- **Horizontal Max Width**: \`max-w-[1440px] mx-auto w-full\`.
- **Grid / Padding Math**:
  - Navbar: \`h-[68px] sm:h-[76px] px-4 xs:px-6 sm:px-10 md:px-14 lg:px-20\`.
  - Hero Main: \`px-4 xs:px-6 sm:px-10 md:px-14 lg:px-20 pt-2 sm:pt-6 md:pt-8 pb-12 sm:pb-16 md:pb-20\`.

### 2. NAVBAR SPECIFICATIONS (HEADER)
- Brand Logo: \`w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] bg-black text-white rounded-[6px]\` + "lakera" lowercase (\`text-[19px] sm:text-[21px] font-black tracking-[-0.04em]\`).
- Desktop Nav: Platform, Solutions, Pricing, Company, Resources with chevrons.
- Actions: Log in + Book a demo pill button.

### 3. HERO CONTENT & TYPOGRAPHY
- Eyebrow: \`font-mono text-[11px] sm:text-[11.5px] font-medium tracking-[0.18em] text-[#557b97] uppercase\`: "INTRODUCING LAKERA GUARD".
- H1 Headline: "Protect your LLM applications against security threats, instantly." (\`text-[38px] xs:text-[44px] sm:text-[54px] md:text-[62px] lg:text-[68px] font-normal leading-[1.04] tracking-[-0.04em] text-black font-serif mb-4 sm:mb-6\`).
- Description: "Lakera Guard empowers organizations to build GenAI applications without worrying about prompt injections, data loss, harmful content, and other LLM risks. Powered by the world’s most advanced AI threat intelligence."
- CTAs: "Start for free" (black pill) + "Book a demo" (white bordered pill).

### 4. RIGHT-SIDE SLIT-SCAN CIRCULAR OBJECT
- URL: \`https://res.cloudinary.com/chhwhdhk/image/upload/v1788364280/ChatGPT_Image_Sep_2_2026_09_21_07_PM_te7wxd.png\`

### 5. TRUSTED BY LOGO SECTION
- Subtitle: "Lakera is trusted by leading LLM providers, enterprises, and startups."
- 6 Partner Logos: Cohere, Nexxiot, DEKRA, ANYbotics, Protex AI, Juro.

### 6. FLOATING SUPPORT CHAT BUTTON
- Smiling chat bubble icon in fixed bottom-right corner (\`#0d1b2e\`).`,
        toolPrompts: {
            cursor: `/* .cursorrules - Lakera AI Security Hero Directive */
Build an exact 1:1 pixel-perfect, responsive replica of the Lakera AI Hero landing page in React, TypeScript, and Tailwind CSS.
Include:
1. Navbar: Black 'L' badge + 'lakera' lowercase wordmark, dropdown links (Platform, Solutions, Pricing, Company, Resources), 'Log in', and 'Book a demo'.
2. Eyebrow: 'INTRODUCING LAKERA GUARD' in font-mono text-[11px] tracking-[0.18em] text-[#557b97].
3. H1 Headline: 'Protect your LLM applications against security threats, instantly.' in editorial serif display weight.
4. CTAs: 'Start for free' (black pill) and 'Book a demo' (white pill).
5. Slit-scan circular portal graphic on right side.
6. TrustLogos: 6 precision SVG vector logos (Cohere, Nexxiot, DEKRA, ANYbotics, Protex AI, Juro).
7. ChatButton: Floating bottom-right support bubble with custom smiling avatar SVG.`,
            claude: `You are Claude Code, an elite frontend engineer.
Rebuild the Lakera AI Security Hero:
- Pinned navbar with lowercase 'lakera' branding and mobile drawer
- Technical monospace eyebrow 'INTRODUCING LAKERA GUARD'
- Editorial serif headline 'Protect your LLM applications against security threats, instantly.'
- Right-side slit-scan iridescent circular graphic
- TrustLogos brand proof section and floating smiling chat bubble`,
            antigravity: `ANTIGRAVITY DIRECTIVE: LAKERA AI SECURITY HERO
Tokens & Layout:
- Background: #FFFFFF
- Display Font: Serif display with tracking-[-0.04em] and leading-[1.04]
- Eyebrow: font-mono text-[#557b97] tracking-[0.18em]
- Hero graphic: Slit-scan portal on right side (max-w-[1600px] desktop, max-w-[500px] mobile)
- Brand Proof: Exact SVG vectors for Cohere, Nexxiot, DEKRA, ANYbotics, Protex AI, Juro`,
            lovable: `Create the Lakera AI Security Hero landing page in React, TypeScript, and Tailwind CSS with 'lakera' navbar, 'INTRODUCING LAKERA GUARD' eyebrow, serif H1 headline, right-side slit-scan graphic, TrustLogos partner bar, and floating chat button.`,
            advance: `TECHNICAL SPECIFICATION: LAKERA AI SECURITY HERO
1. Typography: font-serif H1 leading-[1.04] tracking-[-0.04em] text-[38px] to text-[68px]; font-mono eyebrow text-[#557b97] tracking-[0.18em].
2. Brand SVGs: Cohere circle centroid, Nexxiot twin arrowheads, DEKRA strokeWidth=2.6 triangle, ANYbotics monogram, Protex AI badge.
3. Slit-Scan Alignment: absolute top-[65px] to top-[120px] right-[-12%] to right-[-4%] max-h-[1200px].`
        }
    },
    {
        id: 'interior-design',
        title: 'Interior Design Showcase',
        description: 'Luxury editorial furniture hero showcase with an olive accent panel, overlapping modular armchair artwork, pill purchase control, and bottom feature cards.',
        category: 'E-Commerce',
        badge: 'NEW',
        framework: 'React 19 (TypeScript)',
        styling: 'Tailwind CSS',
        animation: 'Micro-Interactions & Hover Glow',
        isPro: false,
        liveDemoUrl: '/demo/interior-design',
        githubUrl: 'https://github.com/ui-hub/interior-design',
        previewGradient: 'from-white via-[#B2C951]/20 to-[#EEEEEE]',
        accentColor: '#B2C951',
        stats: {
            pages: 1,
            rating: 5.0,
            downloads: '3.9k',
        },
        features: [
            'Luxury editorial typography pairing Cormorant Garamond serif with Plus Jakarta Sans',
            'Dynamic 3-line headline with custom italicized serif "Lives" glyph',
            'Contrasting olive showcase panel (#B2C951) with overlapping armchair product cutout',
            'Interactive pill purchase control with black "Shop now" button and $599 price tag',
            'Four bottom feature cards (Handcrafted Quality, Timeless Design, Built to Last, Seamless Delivery)',
            'Ultra-clean viewport-locking desktop layout with responsive mobile adaptability'
        ],
        promptPreview: `Build a luxury, editorial furniture hero showcase and bottom feature footer card section using React (TypeScript), Tailwind CSS, and Lucide React icons. Replicate all design specifications, exact dimensions, typography pairings, micro-interactions, responsive offsets, and the complete source code below.

---

### 1. Global Dimensions, Canvas & Color Palette
- **Canvas Background:** Pure white (\`#FFFFFF\`) with dark neutral body text (\`#252525\`).
- **Selection Color:** Olive tint \`selection:bg-[#B2C951]/30\`.
- **Viewport Structure:** Fits cleanly in desktop viewports without vertical scrolling (\`min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col justify-between overflow-x-hidden\`).
- **Main Container:** Centered flex container \`max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 py-5 sm:py-6 lg:py-6 xl:py-8 flex-1 flex flex-col justify-between\`.
- **Color Codes:**
  - Olive Showcase Background: \`#B2C951\`
  - Card & Pill Background: \`#EEEEEE\`
  - Dark Action Button: \`#050505\` (Hover: \`#1a1a1a\`)
  - Primary Dark Text: \`#222222\`
  - Secondary Gray Text: \`#555555\`

### 2. Typography Pairing
- Top Label: "Elevate Your Home, Effortlessly" (Cormorant Garamond serif)
- Hero Heading: "Design That" / "Lives With" (with "Lives" in Cormorant Garamond italic) / "You"
- Hero Description: "Timeless pieces, crafted with care and built to elevate your everyday spaces..."

### 3. CTA Pill Button & Pricing Badge
- Pill Container: Height \`43px\`, \`rounded-full\`, background \`#EEEEEE\`
- "Shop now" Button: Black pill with white arrow circle
- Price Label: "$599"

### 4. Right Product Showcase
- Olive card container: \`#B2C951\` (\`w-[285px]\` to \`w-[355px]\`, \`h-[395px]\` to \`h-[475px]\`)
- Overlapping modular chair asset: \`https://res.cloudinary.com/chhwhdhk/image/upload/v1788399032/013ede30-542d-4a45-a9f1-5a48fad37592_wvscrb.png\`

### 5. Bottom Feature Footer Cards
- 4 cards: Handcrafted Quality, Timeless Design, Built to Last, Seamless Delivery.`,
        toolPrompts: {
            cursor: `/* .cursorrules - Interior Design Luxury Furniture Hero Directive */
Create an exact luxury, editorial furniture hero showcase and bottom feature footer card section in React, TypeScript, and Tailwind CSS.
Include:
1. Palette: Pure white (#FFFFFF), Olive showcase (#B2C951), Card gray (#EEEEEE), Dark text (#222222), Accent button (#050505).
2. Typography: Cormorant Garamond serif for label & italic 'Lives'; Plus Jakarta Sans for bold headline.
3. Headline: 3 lines: 'Design That' / 'Lives With' ('Lives' in italic serif) / 'You'.
4. CTA: Pill container (#EEEEEE) with 'Shop now' black button, white arrow icon, and '$599' price.
5. Product Panel: Olive vertical panel (#B2C951) with overlapping modular armchair cutout.
6. Footer Cards: 4 light gray cards (Handcrafted Quality, Timeless Design, Built to Last, Seamless Delivery).`,
            claude: `You are Claude Code, an expert frontend designer.
Build the Interior Design luxury furniture hero:
- Editorial serif + bold sans headline pairing
- 3-line headline with italic serif 'Lives'
- Olive showcase container (#B2C951) with overlapping armchair image
- Pill purchase button with '$599' price tag
- 4 bottom feature cards in responsive grid`,
            antigravity: `ANTIGRAVITY BLUEPRINT: INTERIOR DESIGN SHOWCASE
Aesthetic: Luxury Editorial E-Commerce
- Canvas: #FFFFFF
- Olive Tone: #B2C951
- Typography: Cormorant Garamond serif + Plus Jakarta Sans 800
- Overlapping asset: https://res.cloudinary.com/chhwhdhk/image/upload/v1788399032/013ede30-542d-4a45-a9f1-5a48fad37592_wvscrb.png
- Feature footer: 4 mini cards with subtle hover shift`,
            lovable: `Create the Interior Design luxury furniture showcase in React, TypeScript, and Tailwind CSS with olive showcase card, overlapping modular armchair image, 3-line mixed serif headline, '$599' pill purchase button, and 4 feature cards.`,
            advance: `TECHNICAL SPECIFICATION: INTERIOR DESIGN HERO
1. Headline Math: Leading 0.95, tracking -0.035em, font-extrabold with inline Cormorant Garamond italic 'Lives' glyph.
2. Product Panel Math: w-[285px] to w-[355px], h-[395px] to h-[475px] in #B2C951; armchair image w-[400px] to w-[530px] with negative left offset.
3. Grid: 4-column footer cards in #EEEEEE with hover:bg-[#EAEAEA].`
        }
    }
];
