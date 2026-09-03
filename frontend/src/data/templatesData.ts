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
    }
];
