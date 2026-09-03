import React, { useState, useMemo } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   1. SteppedGrid Component (Parametric Amphitheater Arena)
   ───────────────────────────────────────────────────────────── */
export const SteppedGrid: React.FC = () => {
  const width = 1400;
  const height = 760;
  const centerX = width / 2;

  const numCols = 16;
  const halfCols = numCols / 2;

  // Desktop Stepped Inverted Pyramid Configuration
  const purpleRowsConfig = useMemo(() => [
    { row: 1, startCol: 0, endCol: 15, colorTop: '#F6F0FF', colorBot: '#EADEFF' },
    { row: 2, startCol: 1, endCol: 14, colorTop: '#E6D4FF', colorBot: '#D8BCFF' },
    { row: 3, startCol: 2, endCol: 13, colorTop: '#D3B2FF', colorBot: '#C195FF' },
    { row: 4, startCol: 3, endCol: 12, colorTop: '#BA88FF', colorBot: '#A166FF' },
    { row: 5, startCol: 4, endCol: 11, colorTop: '#9550FF', colorBot: '#7E29FF' },
    { row: 6, startCol: 6, endCol: 9,  colorTop: '#751FED', colorBot: '#5D0CD6' },
    { row: 7, startCol: 7, endCol: 8,  colorTop: '#5507D4', colorBot: '#4301C2' },
  ], []);

  const getPoint = useMemo(() => {
    const rowBaseY = [12, 52, 100, 158, 224, 298, 380, 466, 528, 608, 686, 760];
    const rowSag = [14, 19, 24, 29, 34, 38, 41, 43, 44, 45, 46, 47];

    return (c: number, r: number) => {
      const cNorm = (c - halfCols) / halfCols;
      const colWidthFactor = 1 - (r / 11) * 0.16;
      const x = centerX + cNorm * (width * 0.49) * colWidthFactor;
      const sag = (1 - cNorm * cNorm) * rowSag[r];
      const y = rowBaseY[r] + sag;
      return { x, y };
    };
  }, [width, centerX, halfCols]);

  const { horizontalLines, verticalLines, purpleCells } = useMemo(() => {
    const hLines: string[] = [];
    const vLines: string[] = [];
    const cells: { id: string; path: string; colorTop: string; colorBot: string; row: number }[] = [];

    for (let r = 0; r <= 11; r++) {
      let pathD = '';
      for (let c = 0; c <= numCols; c++) {
        const pt = getPoint(c, r);
        if (c === 0) pathD += `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
        else pathD += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      }
      hLines.push(pathD);
    }

    for (let c = 0; c <= numCols; c++) {
      let pathD = '';
      for (let r = 0; r <= 11; r++) {
        const pt = getPoint(c, r);
        if (r === 0) pathD += `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
        else pathD += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      }
      vLines.push(pathD);
    }

    purpleRowsConfig.forEach((cfg) => {
      for (let c = cfg.startCol; c <= cfg.endCol; c++) {
        const pTL = getPoint(c, cfg.row);
        const pTR = getPoint(c + 1, cfg.row);
        const pBR = getPoint(c + 1, cfg.row + 1);
        const pBL = getPoint(c, cfg.row + 1);
        const pathD = `M ${pTL.x.toFixed(1)} ${pTL.y.toFixed(1)} L ${pTR.x.toFixed(1)} ${pTR.y.toFixed(1)} L ${pBR.x.toFixed(1)} ${pBR.y.toFixed(1)} L ${pBL.x.toFixed(1)} ${pBL.y.toFixed(1)} Z`;
        cells.push({
          id: `cell-r${cfg.row}-c${c}`,
          path: pathD,
          colorTop: cfg.colorTop,
          colorBot: cfg.colorBot,
          row: cfg.row,
        });
      }
    });

    return { horizontalLines: hLines, verticalLines: vLines, purpleCells: cells };
  }, [getPoint, numCols, purpleRowsConfig]);

  // Mobile Grid Configuration (420x680)
  const mobileWidth = 420;
  const mobileHeight = 680;
  const mobCols = 12;
  const mobHalfCols = mobCols / 2;

  const mobPurpleRowsConfig = useMemo(() => [
    { row: 1, startCol: 0, endCol: 11, colorTop: '#F6F0FF', colorBot: '#EADEFF' },
    { row: 2, startCol: 1, endCol: 10, colorTop: '#E6D4FF', colorBot: '#D8BCFF' },
    { row: 3, startCol: 2, endCol: 9,  colorTop: '#D3B2FF', colorBot: '#C195FF' },
    { row: 4, startCol: 3, endCol: 8,  colorTop: '#BA88FF', colorBot: '#A166FF' },
    { row: 5, startCol: 4, endCol: 7,  colorTop: '#9550FF', colorBot: '#7E29FF' },
    { row: 6, startCol: 5, endCol: 6,  colorTop: '#6912EB', colorBot: '#4301C2' },
  ], []);

  const getMobPoint = useMemo(() => {
    const mobRowBaseY = [12, 42, 84, 132, 186, 244, 306, 374, 446, 522, 600, 676];
    const mobRowSag = [8, 12, 16, 20, 24, 27, 29, 31, 32, 33, 34, 35];

    return (c: number, r: number) => {
      const cNorm = (c - mobHalfCols) / mobHalfCols;
      const colWidthFactor = 1 - (r / 11) * 0.16;
      const x = 210 + cNorm * (mobileWidth * 0.495) * colWidthFactor;
      const sag = (1 - cNorm * cNorm) * mobRowSag[r];
      const y = mobRowBaseY[r] + sag;
      return { x, y };
    };
  }, [mobHalfCols, mobileWidth]);

  const { mobHLines, mobVLines, mobPurpleCells } = useMemo(() => {
    const hLines: string[] = [];
    const vLines: string[] = [];
    const cells: { id: string; path: string; colorTop: string; colorBot: string; row: number }[] = [];

    for (let r = 0; r <= 11; r++) {
      let pathD = '';
      for (let c = 0; c <= mobCols; c++) {
        const pt = getMobPoint(c, r);
        if (c === 0) pathD += `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
        else pathD += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      }
      hLines.push(pathD);
    }

    for (let c = 0; c <= mobCols; c++) {
      let pathD = '';
      for (let r = 0; r <= 11; r++) {
        const pt = getMobPoint(c, r);
        if (r === 0) pathD += `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
        else pathD += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      }
      vLines.push(pathD);
    }

    mobPurpleRowsConfig.forEach((cfg) => {
      for (let c = cfg.startCol; c <= cfg.endCol; c++) {
        const pTL = getMobPoint(c, cfg.row);
        const pTR = getMobPoint(c + 1, cfg.row);
        const pBR = getMobPoint(c + 1, cfg.row + 1);
        const pBL = getMobPoint(c, cfg.row + 1);
        const pathD = `M ${pTL.x.toFixed(1)} ${pTL.y.toFixed(1)} L ${pTR.x.toFixed(1)} ${pTR.y.toFixed(1)} L ${pBR.x.toFixed(1)} ${pBR.y.toFixed(1)} L ${pBL.x.toFixed(1)} ${pBL.y.toFixed(1)} Z`;
        cells.push({
          id: `mob-cell-r${cfg.row}-c${c}`,
          path: pathD,
          colorTop: cfg.colorTop,
          colorBot: cfg.colorBot,
          row: cfg.row,
        });
      }
    });

    return { mobHLines: hLines, mobVLines: vLines, mobPurpleCells: cells };
  }, [getMobPoint, mobCols, mobPurpleRowsConfig]);

  return (
    <div
      id="stepped-hero-grid-container"
      className="absolute inset-0 w-full h-full pointer-events-none select-none flex items-center justify-center overflow-hidden z-0"
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[340px] pointer-events-none opacity-40 blur-[85px] -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(179,127,255,0.45) 0%, rgba(240,230,255,0.15) 55%, transparent 75%)',
        }}
      />

      {/* Desktop Grid SVG */}
      <svg
        id="hero-grid-svg-desktop"
        viewBox={`0 0 ${width} ${height}`}
        className="hidden md:block w-full h-full max-w-[1600px] max-h-[820px] object-contain transform -translate-y-2 sm:-translate-y-3"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {purpleRowsConfig.map((cfg) => (
            <linearGradient
              key={`grad-row-${cfg.row}`}
              id={`grad-row-${cfg.row}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={cfg.colorTop} />
              <stop offset="100%" stopColor={cfg.colorBot} />
            </linearGradient>
          ))}
          <filter id="purple-subtle-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#8B42FF" floodOpacity="0.18" />
          </filter>
        </defs>

        <g stroke="#EEEEEE" strokeWidth="0.8" opacity="0.9" fill="none">
          {horizontalLines.map((d, i) => (
            <path key={`h-out-${i}`} d={d} />
          ))}
          {verticalLines.map((d, i) => (
            <path key={`v-out-${i}`} d={d} />
          ))}
        </g>

        <g filter="url(#purple-subtle-glow)">
          {purpleCells.map((cell) => (
            <path
              key={cell.id}
              id={cell.id}
              d={cell.path}
              fill={`url(#grad-row-${cell.row})`}
              stroke="none"
            />
          ))}
        </g>

        <g stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.9" fill="none">
          {horizontalLines.map((d, i) => (
            <path key={`h-in-${i}`} d={d} />
          ))}
          {verticalLines.map((d, i) => (
            <path key={`v-in-${i}`} d={d} />
          ))}
        </g>
      </svg>

      {/* Mobile Grid SVG */}
      <svg
        id="hero-grid-svg-mobile"
        viewBox={`0 0 ${mobileWidth} ${mobileHeight}`}
        className="block md:hidden w-full h-full object-fill pointer-events-none"
        preserveAspectRatio="xMidYMin meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {mobPurpleRowsConfig.map((cfg) => (
            <linearGradient
              key={`mob-grad-row-${cfg.row}`}
              id={`mob-grad-row-${cfg.row}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={cfg.colorTop} />
              <stop offset="100%" stopColor={cfg.colorBot} />
            </linearGradient>
          ))}
          <filter id="mob-purple-subtle-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#8B42FF" floodOpacity="0.16" />
          </filter>
        </defs>

        <g stroke="#EEEEEE" strokeWidth="0.8" opacity="0.9" fill="none">
          {mobHLines.map((d, i) => (
            <path key={`mob-h-out-${i}`} d={d} />
          ))}
          {mobVLines.map((d, i) => (
            <path key={`mob-v-out-${i}`} d={d} />
          ))}
        </g>

        <g filter="url(#mob-purple-subtle-glow)">
          {mobPurpleCells.map((cell) => (
            <path
              key={cell.id}
              id={cell.id}
              d={cell.path}
              fill={`url(#mob-grad-row-${cell.row})`}
              stroke="none"
            />
          ))}
        </g>

        <g stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.9" fill="none">
          {mobHLines.map((d, i) => (
            <path key={`mob-h-in-${i}`} d={d} />
          ))}
          {mobVLines.map((d, i) => (
            <path key={`mob-v-in-${i}`} d={d} />
          ))}
        </g>
      </svg>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   2. Navbar Component
   ───────────────────────────────────────────────────────────── */
export const Navbar: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState(false);

  const navLinks = [
    { label: 'AI', hasDropdown: false },
    { label: 'Staking', hasDropdown: false },
    { label: 'Launchpad', hasDropdown: false },
    { label: 'Space', hasDropdown: false },
    { label: 'Ecosystem', hasDropdown: false },
    { label: 'Docs', hasDropdown: false },
    { label: 'Bridge', hasDropdown: false },
    { label: 'Governance', hasDropdown: false },
  ];

  return (
    <header
      id="tars-main-navbar"
      className="w-full h-[39px] bg-white border-b border-[#EAEAEA] flex items-center justify-between px-3.5 sm:px-6 select-none z-50 relative shrink-0"
    >
      {/* Brand Logo */}
      <div id="nav-brand-logo" className="flex items-center gap-2 cursor-pointer">
        <div className="w-[14px] h-[14px] grid grid-cols-3 gap-[1.5px] items-center">
          <div className="w-[2.5px] h-[2.5px] bg-[#111111] rounded-[0.5px]" />
          <div className="w-[2.5px] h-[2.5px] bg-[#111111] rounded-[0.5px]" />
          <div className="w-[2.5px] h-[2.5px] bg-[#111111] rounded-[0.5px]" />
          <div className="w-[2.5px] h-[2.5px] bg-[#111111] rounded-[0.5px]" />
          <div className="w-[2.5px] h-[2.5px] bg-[#111111] rounded-[0.5px]" />
          <div className="w-[2.5px] h-[2.5px] bg-[#111111] rounded-[0.5px]" />
          <div className="w-[2.5px] h-[2.5px] bg-[#111111] rounded-[0.5px]" />
          <div className="w-[2.5px] h-[2.5px] bg-[#111111] rounded-[0.5px]" />
          <div className="w-[2.5px] h-[2.5px] bg-[#111111] rounded-[0.5px]" />
        </div>
        <span className="text-[13px] font-bold tracking-tight text-[#111111]">TARS</span>
      </div>

      {/* Center Navigation Links (Desktop) */}
      <nav id="nav-desktop-links" className="hidden lg:flex items-center gap-6">
        {navLinks.map((item) => (
          <a
            key={item.label}
            href={`#${item.label.toLowerCase()}`}
            className="text-[11px] font-medium text-[#666666] hover:text-[#111111] transition-colors flex items-center gap-0.5"
          >
            <span>{item.label}</span>
            {item.hasDropdown && <ChevronDown className="w-2.5 h-2.5 opacity-60" />}
          </a>
        ))}
      </nav>

      {/* Connect Wallet Button */}
      <div id="nav-wallet-actions" className="flex items-center gap-2">
        <button
          id="nav-connect-wallet-btn"
          onClick={() => setWalletConnected(!walletConnected)}
          className="h-[27px] px-3 bg-[#111111] hover:bg-[#282828] active:scale-[0.98] text-white text-[11px] font-medium rounded-[5px] flex items-center gap-1.5 transition-all shadow-[0_1px_4px_rgba(0,0,0,0.1)] cursor-pointer"
        >
          <span>{walletConnected ? 'Connected 0x4f...9a' : 'Connect Wallet'}</span>
          <ExternalLink className="w-3 h-3 opacity-80" />
        </button>
      </div>
    </header>
  );
};

/* ─────────────────────────────────────────────────────────────
   3. HeroContent Component (Information Layer & Controls)
   ───────────────────────────────────────────────────────────── */
export const HeroContent: React.FC = () => {
  const [activeIndicator, setActiveIndicator] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);

  const handleStartNow = () => {
    setIsStarted(true);
    setTimeout(() => setIsStarted(false), 1500);
  };

  return (
    <div
      id="hero-content-layer"
      className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between"
    >
      {/* Top Center: Solana Foundation Badge */}
      <div
        id="grant-recipient-tag"
        className="absolute top-[16px] sm:top-[22px] md:top-[30px] left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 sm:gap-2 pointer-events-auto z-20"
      >
        <span className="text-[8px] sm:text-[9px] md:text-[9.5px] text-[#555555] font-normal tracking-wide whitespace-nowrap">
          Grant recipient from
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col gap-[1.5px] justify-center">
            <div className="w-[11px] h-[1.8px] bg-black rounded-[0.5px] transform -skew-x-[20deg]" />
            <div className="w-[11px] h-[1.8px] bg-black rounded-[0.5px] transform skew-x-[20deg] translate-x-[2px]" />
            <div className="w-[11px] h-[1.8px] bg-black rounded-[0.5px] transform -skew-x-[20deg]" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[7.5px] font-bold tracking-tight text-black">SOLANA</span>
            <span className="text-[5.5px] font-medium tracking-[0.06em] text-[#666666]">FOUNDATION</span>
          </div>
        </div>
      </div>

      {/* Left Information Block */}
      <div
        id="left-hero-text"
        className="absolute left-3.5 sm:left-6 md:left-[50px] lg:left-[64px] bottom-[68px] sm:bottom-[76px] md:bottom-auto md:top-[58%] md:-translate-y-1/2 max-w-[148px] xs:max-w-[160px] sm:max-w-[200px] md:max-w-[260px] lg:max-w-[280px] pointer-events-auto z-20 text-left"
      >
        <h1 className="text-[12px] xs:text-[13px] sm:text-[14px] md:text-[17.5px] lg:text-[18.5px] font-semibold text-[#111111] leading-[1.22] tracking-[-0.015em]">
          The AI Architecture
          <br />
          Protocol On Solana
        </h1>
        <p className="text-[7.5px] xs:text-[8px] sm:text-[9px] md:text-[10px] text-[#555555] mt-1 xs:mt-1.5 md:mt-2.5 leading-[1.38] tracking-[0.005em]">
          Symbiotic AI app ecosystem dedicated to
          <br className="hidden sm:inline" />
          {' '}1,000,000+ Solana users.
        </p>
      </div>

      {/* Right Information Block */}
      <div
        id="right-hero-text"
        className="absolute right-3.5 sm:right-6 md:right-[50px] lg:right-[64px] bottom-[68px] sm:bottom-[76px] md:bottom-auto md:top-[58%] md:-translate-y-1/2 max-w-[148px] xs:max-w-[160px] sm:max-w-[200px] md:max-w-[260px] lg:max-w-[280px] pointer-events-auto z-20 text-left"
      >
        <h2 className="text-[12px] xs:text-[13px] sm:text-[14px] md:text-[17.5px] lg:text-[18.5px] font-semibold text-[#111111] leading-[1.22] tracking-[-0.015em]">
          AI Market
        </h2>
        <p className="text-[7.5px] xs:text-[8px] sm:text-[9px] md:text-[10px] text-[#555555] mt-1 xs:mt-1.5 md:mt-2.5 leading-[1.38] tracking-[0.005em]">
          Access modular AI app and ecosystem
          <br className="hidden sm:inline" />
          {' '}products at a glance in one super-app.
        </p>
        <div className="mt-1 xs:mt-1.5 md:mt-2.5">
          <a
            href="#ai-market"
            id="more-details-link"
            className="inline-flex items-center gap-1 text-[7.5px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-medium text-[#222222] hover:text-black transition-colors group cursor-pointer"
          >
            <span>More details</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>
      </div>

      {/* Central Bottom CTA & Carousel Indicators */}
      <div
        id="central-cta-container"
        className="absolute bottom-[14px] sm:bottom-[22px] md:bottom-[34px] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto z-30"
      >
        <button
          id="hero-start-now-btn"
          onClick={handleStartNow}
          className="h-[26px] sm:h-[28px] md:h-[30px] px-3.5 sm:px-4 bg-[#171717] hover:bg-[#282828] active:scale-[0.98] text-white text-[10.5px] sm:text-[11px] md:text-[11.5px] font-medium rounded-[6px] flex items-center gap-1.5 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.2)] cursor-pointer select-none"
        >
          <span>{isStarted ? 'Launching...' : 'Start Now'}</span>
          <span className="text-[11px] leading-none">→</span>
        </button>

        <div
          id="hero-indicators"
          className="flex items-center gap-3 sm:gap-3.5 mt-2.5 sm:mt-3 md:mt-3.5"
        >
          <button
            onClick={() => setActiveIndicator(0)}
            className={`transition-all duration-200 cursor-pointer p-0.5 ${
              activeIndicator === 0 ? 'opacity-100 text-[#111111]' : 'opacity-35 text-[#888888] hover:opacity-75'
            }`}
          >
            <div className="w-3.5 h-3.5 grid grid-cols-3 gap-[1px] items-center">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-[1.8px] h-[1.8px] bg-currentColor rounded-[0.4px]" />
              ))}
            </div>
          </button>

          <button
            onClick={() => setActiveIndicator(1)}
            className={`transition-all duration-200 cursor-pointer p-0.5 ${
              activeIndicator === 1 ? 'opacity-100 text-[#111111]' : 'opacity-35 text-[#888888] hover:opacity-75'
            }`}
          >
            <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 2.5V11.5M7 2.5L4.5 5M7 2.5L9.5 5M7 11.5L4.5 9M7 11.5L9.5 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={() => setActiveIndicator(2)}
            className={`transition-all duration-200 cursor-pointer p-0.5 ${
              activeIndicator === 2 ? 'opacity-100 text-[#111111]' : 'opacity-35 text-[#888888] hover:opacity-75'
            }`}
          >
            <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="currentColor">
              <circle cx="7" cy="3.5" r="1.2" />
              <circle cx="3.8" cy="9.5" r="1.2" />
              <circle cx="10.2" cy="9.5" r="1.2" />
            </svg>
          </button>

          <button
            onClick={() => setActiveIndicator(3)}
            className={`transition-all duration-200 cursor-pointer p-0.5 ${
              activeIndicator === 3 ? 'opacity-100 text-[#111111]' : 'opacity-35 text-[#888888] hover:opacity-75'
            }`}
          >
            <div className="w-3.5 h-3.5 grid grid-cols-2 gap-[2.5px] items-center p-[1px]">
              <div className="w-[2.2px] h-[2.2px] bg-currentColor rounded-[0.4px]" />
              <div className="w-[2.2px] h-[2.2px] bg-currentColor rounded-[0.4px]" />
              <div className="w-[2.2px] h-[2.2px] bg-currentColor rounded-[0.4px]" />
              <div className="w-[2.2px] h-[2.2px] bg-currentColor rounded-[0.4px]" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   4. Main TarsHeroArena Section
   ───────────────────────────────────────────────────────────── */
export default function TarsHeroArena() {
  return (
    <div
      id="tars-landing-app"
      className="w-full h-full min-h-[580px] bg-white text-[#111111] flex flex-col overflow-hidden relative select-none font-sans"
    >
      <Navbar />

      <main id="hero-section" className="flex-1 w-full relative overflow-hidden">
        <SteppedGrid />

        {/* Central 3D Floating Metallic Glossy Y-Sculpture */}
        <div
          id="hero-3d-center-stage"
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <div className="w-[165px] h-[165px] xs:w-[190px] xs:h-[190px] sm:w-[260px] sm:h-[260px] md:w-[440px] md:h-[440px] lg:w-[490px] lg:h-[490px] relative pointer-events-auto -translate-y-16 sm:-translate-y-10 md:-translate-y-4">
            <div className="w-full h-full relative flex items-center justify-center animate-hero-float">
              <img
                src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788396671/3a059f9d-8c46-4728-bf70-841e4e9e51f4_d5prsx.png"
                alt="TARS 3D Hero Sculpture"
                className="w-full h-full object-contain select-none pointer-events-none filter drop-shadow-[0_16px_28px_rgba(75,18,148,0.22)] md:drop-shadow-[0_22px_32px_rgba(75,18,148,0.22)]"
                referrerPolicy="no-referrer"
                draggable={false}
              />
              <div
                className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[120px] sm:w-[160px] md:w-[220px] h-[26px] sm:h-[34px] md:h-[48px] bg-[#29084D]/30 rounded-full blur-[14px] sm:blur-[18px] md:blur-[20px] pointer-events-none -rotate-2 -z-10"
              />
            </div>
          </div>
        </div>

        <HeroContent />
      </main>
    </div>
  );
}
