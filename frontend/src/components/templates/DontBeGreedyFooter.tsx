import React, { useState, useCallback, useRef } from 'react';

const LEFT_CHAR_URL =
  'https://res.cloudinary.com/chhwhdhk/image/upload/v1788466181/349937f6-856e-4cab-a0da-92f91b81728c_iqhncx.png';
const RIGHT_CHAR_URL =
  'https://res.cloudinary.com/chhwhdhk/image/upload/v1788466146/7f8c6e5b-5b63-4aaf-8478-805e391b879c_ntow6a.png';

// ── 1. DUAL MASCOTS STAGE ──────────────────────────────────────────────────
interface AKCBCharactersProps {
  parallaxX?: number;
  parallaxY?: number;
}

const AKCBCharacters: React.FC<AKCBCharactersProps> = ({
  parallaxX = 0,
  parallaxY = 0,
}) => {
  return (
    <div
      id="akcb-characters-container"
      className="absolute inset-0 z-20 pointer-events-none flex items-end justify-center select-none overflow-visible"
    >
      <div
        id="character-stage"
        className="relative w-[62%] sm:w-[60%] md:w-[58%] lg:w-[55%] max-w-[880px] h-[88%] sm:h-[89%] md:h-[91%] lg:h-[93%] flex items-end justify-center pb-2 sm:pb-3 md:pb-4 mb-5 sm:mb-7 md:mb-9 lg:mb-11"
        style={{
          transform: `translate3d(${parallaxX * 3}px, ${parallaxY * 1.5}px, 0)`,
        }}
      >
        {/* Contact Floor Shadow */}
        <div
          className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 w-[92%] sm:w-[94%] h-12 sm:h-16 md:h-20 rounded-full opacity-85 blur-[16px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 75% 35% at 50% 50%, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.7) 45%, transparent 75%)',
            transform: `translate3d(${parallaxX * 2}px, ${parallaxY * 1}px, 0)`,
          }}
        />

        {/* Ambient Neon Lime Rim Light */}
        <div
          className="absolute bottom-24 right-1/4 w-52 h-72 rounded-full opacity-20 blur-[65px] pointer-events-none"
          style={{
            background: '#B8F500',
            transform: `translate3d(${parallaxX * 4}px, ${parallaxY * 2}px, 0)`,
          }}
        />

        {/* Mascot Stance */}
        <div className="relative flex items-end justify-center w-full h-full">
          {/* Left Character (Horned Overlord) */}
          <div
            id="character-left-wrapper"
            className="relative z-10 w-[54%] max-w-[420px] h-[98%] sm:h-[99%] md:h-full flex items-end justify-center -mr-[18%] sm:-mr-[20%] md:-mr-[22%] lg:-mr-[24%] transition-transform duration-200 ease-out animate-float-left"
            style={{
              transform: `translate3d(${parallaxX * 4.5}px, ${parallaxY * 2.5}px, 0) rotateY(${parallaxX * 1.5}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <img
              id="character-left-img"
              src={LEFT_CHAR_URL}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/char_left.png';
              }}
              alt="AKCB Left Character - Horned vinyl mascot in baroque coat"
              className="w-full h-full object-contain object-bottom drop-shadow-[0_16px_30px_rgba(0,0,0,0.85)] filter brightness-[1.02] contrast-[1.04]"
              draggable={false}
              loading="eager"
            />
          </div>

          {/* Right Character (Neon Streetwear) */}
          <div
            id="character-right-wrapper"
            className="relative z-10 w-[50%] max-w-[390px] h-[86%] sm:h-[87%] md:h-[88%] flex items-end justify-center transition-transform duration-200 ease-out animate-float-right"
            style={{
              transform: `translate3d(${parallaxX * 6.5}px, ${parallaxY * 4}px, 0) rotateY(${parallaxX * 2}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <img
              id="character-right-img"
              src={RIGHT_CHAR_URL}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/char_right.png';
              }}
              alt="AKCB Right Character - Streetwear vinyl mascot with bandana"
              className="w-full h-full object-contain object-bottom drop-shadow-[0_16px_30px_rgba(0,0,0,0.85)] filter brightness-[1.02] contrast-[1.04]"
              draggable={false}
              loading="eager"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 2. TYPOGRAPHY POSTER LAYER: DON'T BE GREED ─────────────────────────────
interface TypographyLayerProps {
  parallaxX?: number;
  parallaxY?: number;
}

const TypographyLayer: React.FC<TypographyLayerProps> = ({
  parallaxX = 0,
  parallaxY = 0,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      <div
        id="typography-behind"
        className="absolute inset-x-0 top-0 pt-4 sm:pt-6 md:pt-8 lg:pt-10 px-4 sm:px-6 md:px-8 lg:px-12 z-10 pointer-events-none select-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${parallaxX * -4}px, ${parallaxY * -2}px, 0)`,
        }}
      >
        <div className="flex justify-between items-start w-full leading-none">
          {/* DON'T + FOR THE KID */}
          <div className="flex flex-col items-start">
            <span
              id="text-dont"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              className="font-black tracking-[-0.035em] text-white uppercase select-none text-[18vw] sm:text-[16vw] md:text-[14vw] lg:text-[13vw] leading-[0.82] filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
            >
              DON'T
            </span>
            <span
              id="text-for-the-kid"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              className="font-black tracking-[-0.02em] text-white uppercase text-[5.2vw] sm:text-[4.5vw] md:text-[4vw] lg:text-[3.5vw] leading-[0.88] -mt-1 sm:-mt-2 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            >
              FOR THE KID
            </span>
          </div>

          {/* BE */}
          <div className="flex flex-col items-center">
            <span
              id="text-be"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              className="font-black tracking-[-0.035em] text-white uppercase select-none text-[18vw] sm:text-[16vw] md:text-[14vw] lg:text-[13vw] leading-[0.82] filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
            >
              BE
            </span>
          </div>

          {/* GREED */}
          <div className="flex flex-col items-end">
            <span
              id="text-greed"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              className="font-black tracking-[-0.035em] text-white uppercase select-none text-[18vw] sm:text-[16vw] md:text-[14vw] lg:text-[13vw] leading-[0.82] filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
            >
              GREED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 3. TORN PAPER BOTTOM DECKLED BORDER ────────────────────────────────────
const TornPaperBottom: React.FC = () => {
  return (
    <div
      id="torn-paper-wrapper"
      className="absolute bottom-0 inset-x-0 z-30 pointer-events-none select-none overflow-hidden"
    >
      <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
      <svg
        viewBox="0 0 1440 120"
        className="w-full h-12 sm:h-16 md:h-20 lg:h-24 filter drop-shadow-[0_-8px_16px_rgba(0,0,0,0.95)]"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,120 L1440,120 L1440,40 Q1380,60 1320,35 Q1260,15 1200,45 Q1140,70 1080,40 Q1020,10 960,35 Q900,60 840,45 Q780,25 720,50 Q660,70 600,40 Q540,15 480,35 Q420,60 360,40 Q300,20 240,45 Q180,70 120,35 Q60,10 0,40 Z"
          fill="#FFFFFF"
        />
        <path
          d="M0,120 L1440,120 L1440,48 Q1380,66 1320,43 Q1260,25 1200,52 Q1140,75 1080,48 Q1020,20 960,43 Q900,66 840,52 Q780,35 720,58 Q660,76 600,48 Q540,26 480,43 Q420,66 360,48 Q300,28 240,52 Q180,75 120,43 Q60,22 0,48 Z"
          fill="#EEEEEE"
          opacity="0.85"
        />
      </svg>
    </div>
  );
};

// ── 4. HERO BANNER COMPONENT ───────────────────────────────────────────────
const HeroBanner: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 10, y: y * 10 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  return (
    <div className="w-full bg-[#050505] flex items-center justify-center p-0 sm:p-2 md:p-4 lg:p-6">
      <div
        ref={containerRef}
        id="hero-banner-frame"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[1500px] aspect-[1.62/1] min-h-[520px] sm:min-h-[580px] bg-[#0A0A0A] overflow-hidden rounded-none sm:rounded-lg md:rounded-xl shadow-[0_24px_70px_rgba(0,0,0,0.95)] border border-[#161616]"
      >
        {/* Subtle Background Radial Spotlight */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08) 0%, transparent 65%)',
          }}
        />

        {/* Technical Specs Floating Overlays */}
        <div className="absolute top-3 left-4 sm:top-5 sm:left-6 z-30 font-mono text-[9px] sm:text-[10px] text-neutral-400 tracking-[0.2em] uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B8F500] animate-ping" />
          <span>SHDR: TOY_VINYL_PBR</span>
          <span className="text-neutral-600">|</span>
          <span className="text-[#B8F500]">POLYGON: 842,019</span>
        </div>

        <div className="absolute top-3 right-4 sm:top-5 sm:right-6 z-30 font-mono text-[9px] sm:text-[10px] text-neutral-400 tracking-[0.2em] uppercase">
          <span>COLOR: 050505 / B8F500</span>
        </div>

        {/* Typographic Poster Title: DON'T BE GREED */}
        <TypographyLayer parallaxX={mousePos.x} parallaxY={mousePos.y} />

        {/* Mascot Centerstage */}
        <AKCBCharacters parallaxX={mousePos.x} parallaxY={mousePos.y} />

        {/* Bottom Torn Paper Edge */}
        <TornPaperBottom />
      </div>
    </div>
  );
};

// ── 5. MONOLITHIC AKCB COLLECTION HISTORY SECTION ─────────────────────────
const HistoryCollectionSection: React.FC = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setOffset({ x: x * 18, y: y * 12 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <section
      id="akcb-collection-history-section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full flex items-center justify-center bg-[#050505] overflow-hidden py-20 sm:py-28 md:py-32 px-4 sm:px-6 md:px-12 border-t border-[#141414] select-none"
    >
      {/* LAYER 0: ENORMOUS LOW-CONTRAST WATERMARK LETTERING */}
      <div
        id="bg-giant-lettering-layer"
        className="absolute inset-0 z-0 pointer-events-none select-none flex flex-col justify-around overflow-hidden transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${offset.x * -0.5}px, ${offset.y * -0.5}px, 0)`,
        }}
        aria-hidden="true"
      >
        <div className="w-[140%] -ml-[20%] text-[#101010] font-black text-[15vw] leading-[0.75] tracking-[-0.04em] uppercase whitespace-nowrap opacity-90 blur-[0.3px]">
          AKCB ARCHIVE COLLECTION EDITION 001
        </div>
        <div className="w-[140%] -ml-[10%] text-[#131313] font-black text-[22vw] leading-[0.75] tracking-[-0.05em] uppercase whitespace-nowrap opacity-85">
          AKCB VINYL 01
        </div>
        <div className="w-[140%] -ml-[25%] text-[#0f0f0f] font-black text-[16vw] leading-[0.75] tracking-[-0.04em] uppercase whitespace-nowrap opacity-90">
          HISTORY EXHIBITION TOY SERIES
        </div>

        {/* Central Ghost Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none">
          <span className="inline-block text-[#0d0d0d] font-black text-[30vw] leading-none tracking-[-0.05em] opacity-80 select-none">
            AKCB
          </span>
        </div>

        {/* Soft Vignette Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, rgba(5,5,5,0.7) 70%, #050505 100%)',
          }}
        />
      </div>

      {/* LAYER 1: AMBIENT NEON GLOW REFLECTION */}
      <div
        className="absolute w-72 sm:w-96 md:w-[480px] h-48 sm:h-64 rounded-full bg-[#B8F500] opacity-10 blur-[100px] pointer-events-none z-1"
        style={{
          transform: `translate3d(${offset.x * 0.8}px, calc(15% + ${offset.y * 0.6}px), 0)`,
        }}
      />

      {/* LAYER 2: CENTRAL TYPOGRAPHY STACK */}
      <div
        id="central-typography-container"
        className="relative z-10 w-full max-w-[1300px] mx-auto flex flex-col items-center justify-center text-center transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${offset.x * 0.4}px, ${offset.y * 0.4}px, 0)`,
        }}
      >
        {/* Archival Eyebrow Tag */}
        <div className="mb-4 sm:mb-6 md:mb-8 flex items-center justify-center gap-3 font-mono text-[10px] sm:text-[11px] md:text-[12px] tracking-[0.25em] text-[#666666] uppercase">
          <span className="inline-block w-2 h-2 rounded-full bg-[#B8F500] shadow-[0_0_8px_#B8F500]" />
          <span>EXHIBITION ARCHIVE // 2026</span>
          <span className="text-[#333333]">|</span>
          <span className="text-[#888888]">SERIES 01</span>
        </div>

        {/* Monolithic Stack: AKCB / COLLECTION / HISTORY */}
        <div className="flex flex-col items-center justify-center w-full select-none">
          <h1
            className="text-white font-black uppercase tracking-[-0.035em] leading-[0.82] select-none filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
            style={{
              fontSize: 'clamp(4.2rem, 14vw, 13rem)',
              fontFamily: "'Barlow Condensed', 'Impact', sans-serif",
            }}
          >
            AKCB
          </h1>

          <h2
            className="text-white font-black uppercase tracking-[-0.035em] leading-[0.82] select-none filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] -mt-1 sm:-mt-2 md:-mt-4"
            style={{
              fontSize: 'clamp(3.8rem, 12.8vw, 11.8rem)',
              fontFamily: "'Barlow Condensed', 'Impact', sans-serif",
            }}
          >
            COLLECTION
          </h2>

          <div className="relative inline-block -mt-1 sm:-mt-2 md:-mt-4">
            <h2
              className="text-[#B8F500] font-black uppercase tracking-[-0.035em] leading-[0.82] select-none filter drop-shadow-[0_0_30px_rgba(184,245,0,0.55)]"
              style={{
                fontSize: 'clamp(4.2rem, 14vw, 13rem)',
                fontFamily: "'Barlow Condensed', 'Impact', sans-serif",
              }}
            >
              HISTORY
            </h2>

            {/* Distressed Neon Brush Underline */}
            <svg
              viewBox="0 0 400 24"
              className="w-[85%] sm:w-[90%] md:w-[95%] h-3 sm:h-4 md:h-6 mx-auto mt-1 sm:mt-2 overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 4 12 Q 60 7, 130 14 Q 210 18, 290 9 Q 350 6, 396 13"
                stroke="#B8F500"
                strokeWidth="5"
                strokeLinecap="round"
                className="filter drop-shadow-[0_0_12px_rgba(184,245,0,0.85)]"
              />
              <path
                d="M 25 16 Q 100 18, 190 14 Q 290 17, 375 12"
                stroke="#B8F500"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.8"
              />
              <circle cx="50" cy="19" r="1.5" fill="#B8F500" />
              <circle cx="210" cy="5" r="1.2" fill="#B8F500" />
              <circle cx="340" cy="18" r="1.8" fill="#B8F500" />
            </svg>
          </div>
        </div>

        {/* Technical Archival Details Grid */}
        <div className="mt-8 sm:mt-12 md:mt-16 w-full max-w-[850px] grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-[#181818] font-mono text-[10px] sm:text-[11px] text-[#777777] uppercase text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[#B8F500] font-bold">01 // CLASSIFICATION</span>
            <span className="text-[#CCCCCC]">3D Vinyl Figurine Art</span>
            <span className="text-[#555555]">Edition: First Wave Collectible</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[#B8F500] font-bold">02 // PALETTE PROFILE</span>
            <span className="text-[#CCCCCC]">#050505 Dark Obsidian</span>
            <span className="text-[#555555]">Accent: #B8F500 Neon Lime</span>
          </div>

          <div className="flex flex-col gap-1 sm:text-right">
            <span className="text-[#B8F500] font-bold">03 // ARCHIVAL STATUS</span>
            <span className="text-[#CCCCCC]">Verified Genesis Run</span>
            <span className="text-[#555555]">Akutami Character Bureau</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── 6. MAIN COMPLETE TURNKEY EXPORT ─────────────────────────────────────────
export const DontBeGreedyFooter: React.FC = () => {
  return (
    <main className="w-full min-h-full bg-[#050505] text-white flex flex-col items-center justify-start overflow-x-hidden selection:bg-[#B8F500] selection:text-black font-sans">
      <HeroBanner />
      <HistoryCollectionSection />
    </main>
  );
};

export default DontBeGreedyFooter;
