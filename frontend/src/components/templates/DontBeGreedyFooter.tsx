import React, { useState, useCallback, useRef } from 'react';

const CHAR_LEFT_URL =
  'https://res.cloudinary.com/dv9wtwmsf/image/upload/v1772782787/char_left_t9iqq1.png';

export const DontBeGreedyFooter: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Parallax on section background
  const handleSectionMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 16, y: y * 12 });
  }, []);

  // 3D Tilt calculation specifically for the collectible card
  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -12; // tilt degrees on X
    const tiltY = ((x - centerX) / centerX) * 14;  // tilt degrees on Y
    setCardTilt({ x: tiltX, y: tiltY });
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setIsHovered(false);
    setCardTilt({ x: 0, y: 0 });
  }, []);

  return (
    <footer
      id="akcb-footer-section"
      onMouseMove={handleSectionMouseMove}
      className="relative w-full h-full min-h-[600px] flex flex-col justify-between bg-[#050505] overflow-hidden pt-12 sm:pt-20 md:pt-24 pb-8 sm:pb-12 px-4 sm:px-8 md:px-14 border-t border-[#161616] select-none font-sans"
    >
      {/* ========================================================================= */}
      {/* LAYER 0: ENORMOUS LOW-CONTRAST WATERMARK LETTERING BEHIND EVERYTHING     */}
      {/* ========================================================================= */}
      <div
        id="footer-watermark-layer"
        className="absolute inset-0 z-0 pointer-events-none select-none flex flex-col justify-between overflow-hidden opacity-90 transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * -0.4}px, ${mousePos.y * -0.4}px, 0)`,
        }}
        aria-hidden="true"
      >
        <div className="w-[150%] -ml-[25%] text-[#101010] font-black text-[16vw] leading-[0.72] tracking-[-0.04em] uppercase whitespace-nowrap">
          AKCB ARCHIVE TOY DIVISION
        </div>
        <div className="w-[150%] -ml-[10%] text-[#141414] font-black text-[24vw] leading-[0.72] tracking-[-0.05em] uppercase whitespace-nowrap">
          HISTORY 01
        </div>
        <div className="w-[150%] -ml-[30%] text-[#0F0F0F] font-black text-[15vw] leading-[0.72] tracking-[-0.04em] uppercase whitespace-nowrap">
          VINYL COLLECTIBLES TOKYO 2026
        </div>

        {/* Ambient radial vignette keeping edges dark */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 25%, rgba(5,5,5,0.75) 75%, #050505 100%)',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* LAYER 1: AMBIENT NEON LIME ACCENT REFLECTION                             */}
      {/* ========================================================================= */}
      <div
        className="absolute top-1/3 left-1/4 w-80 sm:w-96 h-80 rounded-full bg-[#B8F500] opacity-10 blur-[110px] pointer-events-none z-1"
        style={{
          transform: `translate3d(${mousePos.x * 0.7}px, ${mousePos.y * 0.7}px, 0)`,
        }}
      />

      {/* ========================================================================= */}
      {/* LAYER 2: PRIMARY INTERACTIVE CONTENT (TWO-COLUMN DESKTOP SPLIT)          */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 my-auto">
        
        {/* LEFT COLUMN: MONOLITHIC DISPLAY TYPOGRAPHY STACK */}
        <div
          id="footer-typography-stack"
          className="flex flex-col items-center lg:items-start text-center lg:text-left transition-transform duration-300 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px, 0)`,
          }}
        >
          {/* Eyebrow Label with pulsating green dot */}
          <div className="mb-2 sm:mb-4 flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] tracking-[0.25em] text-[#777777] uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8F500] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B8F500]" />
            </span>
            <span>OFFICIAL ARCHIVAL CATALOGUE</span>
            <span className="text-[#333333]">|</span>
            <span className="text-[#B8F500]">SERIES 01</span>
          </div>

          {/* AKCB */}
          <h1
            className="text-white font-black uppercase tracking-[-0.035em] leading-[0.82] select-none filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
            style={{
              fontSize: 'clamp(3.8rem, 11vw, 10.5rem)',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            AKCB
          </h1>

          {/* COLLECTION */}
          <h2
            className="text-white font-black uppercase tracking-[-0.035em] leading-[0.82] select-none filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] -mt-1 sm:-mt-3 md:-mt-4"
            style={{
              fontSize: 'clamp(3.4rem, 10vw, 9.8rem)',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            COLLECTION
          </h2>

          {/* HISTORY (NEON GREEN) */}
          <div className="relative inline-block -mt-1 sm:-mt-3 md:-mt-4">
            <h2
              className="text-[#B8F500] font-black uppercase tracking-[-0.035em] leading-[0.82] select-none filter drop-shadow-[0_0_35px_rgba(184,245,0,0.6)]"
              style={{
                fontSize: 'clamp(3.8rem, 11vw, 10.5rem)',
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              HISTORY
            </h2>

            {/* Distressed Neon Brush Underline */}
            <svg
              viewBox="0 0 400 24"
              className="w-[90%] sm:w-[96%] h-3.5 sm:h-5 mt-1 sm:mt-2 overflow-visible"
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

          {/* Descriptive Mission Subtext */}
          <p className="mt-4 sm:mt-6 max-w-[500px] text-[#888888] font-sans text-xs sm:text-sm leading-relaxed tracking-wide">
            The genesis archive of limited vinyl sculptures. Sculpted digitally and cast in heavy
            matte resin, featuring signature dual street-culture silhouettes.
          </p>
        </div>

        {/* RIGHT COLUMN: 3D INTERACTIVE COLLECTIBLE FIGURINE CARD */}
        <div
          id="collectible-card-container"
          className="relative perspective-[1200px] w-full max-w-[340px] sm:max-w-[400px] md:max-w-[430px]"
        >
          {/* Glowing Aura behind Card */}
          <div
            className={`absolute -inset-2 rounded-2xl bg-[#B8F500] opacity-0 blur-2xl transition-opacity duration-500 pointer-events-none ${
              isHovered ? 'opacity-25' : ''
            }`}
          />

          <div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleCardMouseLeave}
            className="relative w-full h-[460px] sm:h-[530px] rounded-lg bg-gradient-to-br from-[#151515] via-[#0D0D0D] to-[#080808] border border-[#242424] hover:border-[#B8F500] p-5 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] transition-all duration-200 ease-out cursor-pointer"
            style={{
              transform: `rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg) scale3d(${
                isHovered ? 1.02 : 1
              }, ${isHovered ? 1.02 : 1}, 1)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* CARD TOP BAR: BADGE & RARITY */}
            <div className="flex items-center justify-between z-10 font-mono text-[10px] tracking-wider text-[#A0A0A0] uppercase">
              <div className="flex items-center gap-1.5 bg-[#1C1C1C] px-2.5 py-1 rounded border border-[#2B2B2B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8F500]" />
                <span className="text-white font-bold">AKCB // 001</span>
              </div>
              <span className="text-[#B8F500] font-bold">1 OF 500 EDITIONS</span>
            </div>

            {/* CARD CENTER: MASCOT 3D FIGURE & CONTACT FLOOR SHADOW */}
            <div className="relative flex-1 w-full flex items-center justify-center my-2 overflow-visible">
              {/* Elliptical floor shadow */}
              <div
                className="absolute bottom-2 w-48 h-8 rounded-full pointer-events-none opacity-80"
                style={{
                  background:
                    'radial-gradient(ellipse 65% 25% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 75%)',
                }}
              />

              {/* Figurine cutout image */}
              <img
                src={CHAR_LEFT_URL}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/char_left.png';
                }}
                alt="AKCB Horned Figurine Collectible"
                className={`h-[92%] object-contain object-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] filter brightness-[1.03] transition-transform duration-300 ${
                  isHovered ? 'scale-108 -translate-y-2' : 'scale-100'
                }`}
                draggable={false}
                loading="eager"
              />
            </div>

            {/* CARD BOTTOM: SERIAL NUMBER, NAME & BARCODE */}
            <div className="z-10 pt-3 border-t border-[#1C1C1C] flex items-end justify-between font-mono">
              <div className="flex flex-col">
                <span className="text-[9px] text-[#666666] tracking-widest uppercase">
                  CHARACTER ARCHIVE
                </span>
                <span className="text-white font-bold text-sm tracking-wide">
                  HORNED OVERLORD // 01
                </span>
                <span className="text-[10px] text-[#B8F500] tracking-wider mt-0.5">
                  STATUS: VERIFIED GENESIS
                </span>
              </div>

              {/* Vector Barcode */}
              <div className="flex items-center gap-[2.5px] h-6 opacity-70">
                <span className="w-[1.5px] h-full bg-white" />
                <span className="w-[3px] h-full bg-white" />
                <span className="w-[1px] h-full bg-white" />
                <span className="w-[2px] h-full bg-white" />
                <span className="w-[4px] h-full bg-white" />
                <span className="w-[1px] h-full bg-white" />
                <span className="w-[2.5px] h-full bg-white" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* LAYER 3: BOTTOM TECHNICAL METADATA BAR                                    */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto pt-6 sm:pt-10 mt-8 sm:mt-12 border-t border-[#161616] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] sm:text-[11px] text-[#666666] uppercase">
        <div className="flex items-center gap-6">
          <span>&copy; 2026 AKUTAMI CHARACTER BUREAU</span>
          <span className="hidden sm:inline text-[#2B2B2B]">•</span>
          <span className="hidden sm:inline">ALL RIGHTS RESERVED</span>
        </div>

        <div className="flex items-center gap-6 tracking-widest text-[#888888]">
          <span className="hover:text-white cursor-pointer transition-colors">OPENSEA</span>
          <span className="hover:text-white cursor-pointer transition-colors">DISCORD</span>
          <span className="hover:text-white cursor-pointer transition-colors">TWITTER / X</span>
          <span className="text-[#B8F500] hover:underline cursor-pointer">VERIFY CONTRACT</span>
        </div>
      </div>
    </footer>
  );
};

export default DontBeGreedyFooter;
