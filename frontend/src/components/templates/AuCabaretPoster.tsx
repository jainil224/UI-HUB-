import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const CHARACTER_IMAGE =
  'https://res.cloudinary.com/chhwhdhk/image/upload/v1788462734/fe3a66ef-196e-4220-acfd-7f5f170bdce9_y5ggt9.png';

interface Artist {
  id: string;
  name: string;
  number: string;
  setNumber?: string;
  hasSocials?: boolean;
}

const ARTISTS: Artist[] = [
  { id: '1', name: 'CARL CRAIG', number: '01' },
  { id: '2', name: 'DJEBALI', number: '02', setNumber: '037', hasSocials: true },
  { id: '3', name: 'NINA KRAVIZ', number: '03' },
];

export const AuCabaretPoster: React.FC = () => {
  const [selectedArtistIndex, setSelectedArtistIndex] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Airbrush radial gradient neon cloud on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = container.clientWidth;
      const h = container.clientHeight;

      if (w === 0 || h === 0) return;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      ctx.save();
      ctx.scale(dpr, dpr);

      // Base canvas paper tone
      ctx.fillStyle = '#EDEDED';
      ctx.fillRect(0, 0, w, h);

      // Helper for airbrush lobes
      const drawAirbrushLobe = (
        cx: number,
        cy: number,
        rx: number,
        ry: number,
        r: number,
        g: number,
        b: number,
        peakAlpha: number
      ) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(rx, ry);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        grad.addColorStop(0.0, `rgba(${r}, ${g}, ${b}, ${peakAlpha})`);
        grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${peakAlpha * 0.82})`);
        grad.addColorStop(0.65, `rgba(${r}, ${g}, ${b}, ${peakAlpha * 0.45})`);
        grad.addColorStop(0.85, `rgba(${r}, ${g}, ${b}, ${peakAlpha * 0.18})`);
        grad.addColorStop(1.0, `rgba(${r}, ${g}, ${b}, 0.0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      // Exact gradient distribution:
      // Bottom-Left Violet
      drawAirbrushLobe(w * 0.12, h * 0.67, w * 0.25, h * 0.28, 185, 70, 248, 0.92);
      // Lower-Left Edge Violet
      drawAirbrushLobe(w * 0.03, h * 0.55, w * 0.20, h * 0.32, 175, 58, 245, 0.88);
      // Top-Left Soft Warm Rose Pink
      drawAirbrushLobe(w * 0.09, h * 0.22, w * 0.24, h * 0.23, 252, 95, 175, 0.82);
      // Core Intense Hot Magenta behind 019
      drawAirbrushLobe(w * 0.22, h * 0.44, w * 0.26, h * 0.27, 255, 24, 218, 0.98);
      // Upper Crest left of hair
      drawAirbrushLobe(w * 0.31, h * 0.25, w * 0.18, h * 0.17, 255, 48, 210, 0.86);
      // Neck Bridge
      drawAirbrushLobe(w * 0.42, h * 0.40, w * 0.20, h * 0.16, 255, 45, 215, 0.92);
      // Right Plume sweeping past neck
      drawAirbrushLobe(w * 0.55, h * 0.405, w * 0.19, h * 0.15, 255, 70, 224, 0.88);
      // Plume wrapping MAI 0 x 2 2014
      drawAirbrushLobe(w * 0.68, h * 0.41, w * 0.18, h * 0.13, 255, 105, 232, 0.72);
      // Plume tip taper
      drawAirbrushLobe(w * 0.77, h * 0.41, w * 0.11, h * 0.09, 255, 145, 242, 0.48);

      ctx.restore();
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  const handlePrev = () => {
    setSelectedArtistIndex((selectedArtistIndex - 1 + ARTISTS.length) % ARTISTS.length);
  };

  const handleNext = () => {
    setSelectedArtistIndex((selectedArtistIndex + 1) % ARTISTS.length);
  };

  return (
    <div
      id="root-hero-section"
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] overflow-hidden bg-[#EDEDED] text-[#111111] select-none flex flex-col justify-between font-sans"
    >
      {/* 1. Static Airbrush Background Canvas + Subtle Paper Grain */}
      <div
        id="hero-background-glow-container"
        className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10"
        aria-hidden="true"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.025] mix-blend-overlay pointer-events-none">
          <filter id="noiseFilterPaper019">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilterPaper019)" />
        </svg>
      </div>

      {/* 2. Top Header Navigation */}
      <header className="relative w-full h-16 sm:h-20 px-6 sm:px-12 md:px-16 lg:px-20 flex items-center justify-between z-40 select-none">
        <div className="flex items-center">
          <div className="flex flex-col">
            <span className="text-[8px] sm:text-[9px] font-extrabold tracking-widest text-[#111111] leading-none">
              HERONDIR
            </span>
            <span className="text-[8px] sm:text-[9px] font-extrabold tracking-widest text-[#111111] leading-none mt-0.5">
              PRODUCTION
            </span>
          </div>
          <span className="ml-2.5 text-base sm:text-lg font-black tracking-tight text-[#111111]">ME</span>
          <button
            type="button"
            className="ml-6 sm:ml-12 flex flex-col justify-center space-y-[3px] py-2 cursor-pointer hover:opacity-75 transition-opacity"
            aria-label="Toggle navigation menu"
          >
            <span className="w-4 sm:w-5 h-[2px] bg-[#111111]" />
            <span className="w-4 sm:w-5 h-[2px] bg-[#111111]" />
            <span className="w-4 sm:w-5 h-[2px] bg-[#111111]" />
          </button>
        </div>

        <nav className="hidden sm:flex items-center space-x-8 sm:space-x-12">
          <a
            href="#home"
            onClick={(e) => e.preventDefault()}
            className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#111111] uppercase hover:text-black transition-colors"
          >
            HOME
          </a>
          <a
            href="#about"
            onClick={(e) => e.preventDefault()}
            className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#333333] uppercase hover:text-black transition-colors"
          >
            ABOUT
          </a>
          <a
            href="#contact"
            onClick={(e) => e.preventDefault()}
            className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#333333] uppercase hover:text-black transition-colors"
          >
            CONTACT
          </a>
        </nav>

        <div className="flex items-center space-x-6 sm:space-x-8">
          <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-[#666666] uppercase cursor-pointer hover:text-black">
            ENG
          </span>
          <button
            type="button"
            className="text-[#111111] hover:opacity-70 transition-opacity cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* 3. Left Headline (019 AU CABARET SAUVAGE) */}
      <div
        id="left-headline-block"
        className="absolute left-6 sm:left-12 md:left-16 lg:left-24 top-[24%] sm:top-[28%] md:top-[30%] lg:top-[32%] z-30 select-none pointer-events-none"
      >
        <h1
          id="hero-edition-number"
          className="font-black tracking-tighter text-[#0A0A0A] leading-none text-7xl sm:text-8xl md:text-[10rem] lg:text-[12rem] xl:text-[13.5rem]"
        >
          019
        </h1>
        <p
          id="hero-venue-name"
          className="font-bold tracking-[0.28em] text-[10px] sm:text-[12px] md:text-[14px] text-[#111111] uppercase mt-2 sm:mt-4 md:mt-5 ml-1 sm:ml-2"
        >
          AU CABARET SAUVAGE
        </p>
      </div>

      {/* 4. Right Technical Notation (MAI 0 x 2 2014) */}
      <div
        id="right-technical-mark-container"
        className="absolute right-6 sm:right-12 md:right-16 lg:right-24 xl:right-32 top-[36%] sm:top-[38%] md:top-[40%] lg:top-[41%] z-30 flex items-center select-none pointer-events-none"
      >
        <div className="relative w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full text-[#111111]" viewBox="0 0 54 54" fill="none">
            <line x1="6" y1="6" x2="48" y2="48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <line x1="48" y1="6" x2="6" y2="48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
          <span className="absolute top-0 text-[8px] sm:text-[9px] font-bold tracking-widest text-[#111111] uppercase">
            MAI
          </span>
          <span className="absolute left-0 text-[13px] sm:text-[15px] font-black text-[#111111]">0</span>
          <span className="absolute right-0 text-[13px] sm:text-[15px] font-black text-[#111111]">2</span>
          <span className="absolute bottom-0 text-[8px] sm:text-[9px] font-bold tracking-wider text-[#111111]">
            2014
          </span>
        </div>
        <div className="ml-6 sm:ml-8 w-16 sm:w-28 md:w-40 lg:w-56 h-[1.5px] bg-[#111111]" />
      </div>

      {/* 5. Fixed Central Model Character */}
      <div
        id="central-character-container"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center select-none pointer-events-none"
      >
        <div className="relative flex items-center justify-center">
          <img
            id="central-character-image"
            src={CHARACTER_IMAGE}
            alt="Featured Artist Hero Model"
            loading="eager"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`h-[68vh] sm:h-[75vh] md:h-[82vh] lg:h-[88vh] max-w-[90vw] object-contain object-bottom pointer-events-none transition-opacity duration-700 ease-out drop-shadow-[0_20px_45px_rgba(0,0,0,0.12)] ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </div>

      {/* 6. Editorial Footer & Artist Track */}
      <footer className="relative w-full h-24 sm:h-28 px-4 sm:px-8 md:px-12 lg:px-16 flex items-end justify-between pb-6 sm:pb-8 z-40 select-none">
        {/* Left Nav Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="w-8 h-8 sm:w-9 sm:h-9 bg-[#111111] text-white flex items-center justify-center hover:bg-black active:scale-95 transition-transform cursor-pointer"
          aria-label="Previous artist"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* 3 Column Artist List */}
        <div className="flex-1 max-w-4xl mx-4 sm:mx-8 grid grid-cols-3 items-end text-center">
          {ARTISTS.map((artist, idx) => {
            const isCenter = idx === selectedArtistIndex;
            return (
              <div
                key={artist.id}
                onClick={() => setSelectedArtistIndex(idx)}
                className="flex flex-col items-center justify-end cursor-pointer group"
              >
                {artist.hasSocials && (
                  <div className="flex items-center space-x-3 mb-1 text-[9px] sm:text-[10px] font-semibold text-[#555555] tracking-widest">
                    <span className="hover:text-black transition-colors">Fb</span>
                    <span className="hover:text-black transition-colors">Tw</span>
                    <span className="hover:text-black transition-colors">In</span>
                  </div>
                )}
                <h2
                  className={`font-black tracking-tight text-[#111111] uppercase transition-all duration-200 ${
                    isCenter ? 'text-base sm:text-lg md:text-xl text-black' : 'text-sm sm:text-base md:text-lg text-[#555555]'
                  } group-hover:opacity-75`}
                >
                  {artist.name}
                </h2>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-[#777777] mt-0.5">
                  {artist.number}
                </span>
                {artist.setNumber && (
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#444444] mt-2 tracking-widest">
                    {artist.setNumber}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Nav Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          className="w-8 h-8 sm:w-9 sm:h-9 bg-[#111111] text-white flex items-center justify-center hover:bg-black active:scale-95 transition-transform cursor-pointer"
          aria-label="Next artist"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
      </footer>
    </div>
  );
};

export default AuCabaretPoster;
