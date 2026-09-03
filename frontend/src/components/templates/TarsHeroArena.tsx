import React, { useState } from 'react';
import { ArrowRight, Wallet, ArrowUpDown, Grid, Triangle, Maximize2 } from 'lucide-react';

export default function TarsHeroArena() {
  const [activeTab, setActiveTab] = useState(0);

  // SVG Parametric Amphitheater Grid Calculations
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
    <div className="w-full h-full min-h-[580px] bg-white text-[#111111] relative overflow-hidden flex flex-col font-sans select-none">
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
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-black transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <button className="h-[27px] px-3 bg-[#111111] hover:bg-[#282828] text-white text-[11px] font-medium rounded-[5px] flex items-center gap-1.5 transition-colors cursor-pointer">
          <Wallet size={12} />
          <span>Connect Wallet</span>
        </button>
      </header>

      {/* Grant Recipient Badge */}
      <div className="absolute top-[52px] sm:top-[60px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 bg-white/90 border border-[#EEEEEE] rounded-full shadow-sm">
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
            <filter id="glowArena" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#8B42FF" floodOpacity="0.16" />
            </filter>
          </defs>

          {/* Stepped Arena Inverted Tiers */}
          <polygon
            points={`
              ${getPoint(0, 0).x},${getPoint(0, 0).y}
              ${getPoint(16, 0).x},${getPoint(16, 0).y}
              ${getPoint(13, 7).x},${getPoint(13, 7).y}
              ${getPoint(8, 8).x},${getPoint(8, 8).y}
              ${getPoint(3, 7).x},${getPoint(3, 7).y}
            `}
            fill="url(#purpleGrad7)"
            opacity="0.9"
            filter="url(#glowArena)"
          />

          {/* Grid Lines */}
          {Array.from({ length: 12 }).map((_, r) => (
            <path
              key={`row-${r}`}
              d={`M ${getPoint(0, r).x} ${getPoint(0, r).y} Q ${getPoint(8, r).x} ${getPoint(8, r).y + 10} ${getPoint(16, r).x} ${getPoint(16, r).y}`}
              stroke={r < 8 ? "rgba(255,255,255,0.45)" : "#EEEEEE"}
              strokeWidth="0.8"
              fill="none"
            />
          ))}

          {/* Longitudinal Column Grid Lines */}
          {Array.from({ length: numCols + 1 }).map((_, c) => (
            <path
              key={`col-${c}`}
              d={`M ${getPoint(c, 0).x} ${getPoint(c, 0).y} L ${getPoint(c, 11).x} ${getPoint(c, 11).y}`}
              stroke="#EEEEEE"
              strokeWidth="0.6"
              opacity="0.7"
              fill="none"
            />
          ))}
        </svg>
      </div>

      {/* Floating 3D Sculpture */}
      <div className="relative flex-1 flex items-center justify-center z-20 pointer-events-none">
        <div className="relative flex flex-col items-center">
          <img
            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788396671/3a059f9d-8c46-4728-bf70-841e4e9e51f4_d5prsx.png"
            alt="TARS 3D Sculpture"
            className="w-[240px] sm:w-[320px] md:w-[420px] animate-hero-float select-none drop-shadow-[0_20px_35px_rgba(139,66,255,0.25)] pointer-events-auto"
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
        <button className="h-[30px] px-4 bg-[#171717] hover:bg-[#282828] active:scale-[0.98] text-white text-[11px] font-medium rounded-[6px] flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-all cursor-pointer">
          <span>Start Now</span>
          <ArrowRight size={12} />
        </button>

        <div className="flex items-center gap-3.5 mt-3 text-[#888888]">
          <button onClick={() => setActiveTab(0)} className={`hover:text-black cursor-pointer transition-opacity ${activeTab === 0 ? 'text-[#111111] opacity-100' : 'opacity-40'}`}>
            <Grid size={14} />
          </button>
          <button onClick={() => setActiveTab(1)} className={`hover:text-black cursor-pointer transition-opacity ${activeTab === 1 ? 'text-[#111111] opacity-100' : 'opacity-40'}`}>
            <ArrowUpDown size={14} />
          </button>
          <button onClick={() => setActiveTab(2)} className={`hover:text-black cursor-pointer transition-opacity ${activeTab === 2 ? 'text-[#111111] opacity-100' : 'opacity-40'}`}>
            <Triangle size={14} />
          </button>
          <button onClick={() => setActiveTab(3)} className={`hover:text-black cursor-pointer transition-opacity ${activeTab === 3 ? 'text-[#111111] opacity-100' : 'opacity-40'}`}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
