import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   1. BackgroundTypography Component
   ───────────────────────────────────────────────────────────── */
export const BackgroundTypography: React.FC = () => {
  return (
    <div
      id="huge-background-typography"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-7 sm:bottom-9 md:bottom-11 flex items-end justify-between select-none overflow-hidden z-0 px-2 md:px-6"
    >
      <div className="w-full flex justify-between items-end text-[#E5E5E3] font-black text-[22vw] md:text-[21.5vw] leading-none tracking-tight uppercase opacity-95">
        <span className="inline-block transform -translate-x-[2%]">L</span>
        <span className="inline-block">U</span>
        <span className="inline-block">M</span>
        <span className="inline-block">O</span>
        <span className="inline-block transform translate-x-[2%]">S</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   2. TopNav Component
   ───────────────────────────────────────────────────────────── */
interface TopNavProps {
  onGetStarted?: () => void;
  onSquareClick?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onGetStarted, onSquareClick }) => {
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  const menuItems = [
    { label: 'ABOUT', id: 'about' },
    { label: 'OUR SERVICES', id: 'services' },
    { label: 'CASES', id: 'cases' },
    { label: 'CONTACT US', id: 'contact' },
  ];

  return (
    <header
      id="top-nav"
      className="absolute top-0 inset-x-0 z-30 flex items-start justify-between px-3 md:px-5 py-2.5 md:py-3 pointer-events-auto"
    >
      <div id="brand-logo" className="flex items-center">
        <span className="text-[10px] md:text-[11px] font-black tracking-widest text-[#111111] uppercase select-none">
          LUMOS
        </span>
      </div>

      <div
        id="technical-nav-menu"
        className="hidden sm:flex flex-col items-start gap-[2px] ml-16 md:ml-28 lg:ml-40"
      >
        <div className="flex flex-col space-y-[2px]">
          {menuItems.map((item, idx) => (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onMouseEnter={() => setActiveMenuIndex(idx)}
              onMouseLeave={() => setActiveMenuIndex(null)}
              className="group flex items-center space-x-1.5 text-left text-[8px] tracking-[0.14em] font-semibold text-[#111111] hover:text-[#F54D92] transition-colors cursor-pointer"
            >
              <span
                className={`h-[1px] bg-[#111111] group-hover:bg-[#F54D92] transition-all duration-200 ${
                  activeMenuIndex === idx ? 'w-4' : 'w-2.5'
                }`}
              />
              <span className="leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div id="top-right-controls" className="flex items-center space-x-1.5">
        <button
          id="btn-nav-square"
          onClick={onSquareClick}
          aria-label="Control Panel Toggle"
          className="w-7 h-7 md:w-8 md:h-8 bg-[#111111] text-white flex items-center justify-center text-[10px] font-mono tracking-tighter hover:bg-[#282828] active:scale-95 transition-all duration-150 cursor-pointer shadow-xs"
        >
          <span className="text-[9px] font-bold tracking-tight">01 +</span>
        </button>

        <button
          id="btn-get-started"
          onClick={onGetStarted}
          className="h-7 md:h-8 px-3 md:px-4 bg-[#F54D92] hover:bg-[#ff3d8a] active:scale-95 text-white flex items-center space-x-2 text-[9px] md:text-[10px] font-black tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-sm group"
        >
          <span className="whitespace-nowrap">GET STARTED</span>
          <Plus className="w-2.5 h-2.5 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>
    </header>
  );
};

/* ─────────────────────────────────────────────────────────────
   3. LeftContent Component
   ───────────────────────────────────────────────────────────── */
export const LeftContent: React.FC = () => {
  return (
    <div
      id="left-hero-section"
      className="flex flex-col justify-between h-full pointer-events-none z-10 select-none py-12 md:py-16"
    >
      <div className="mt-8 md:mt-16 lg:mt-20 max-w-[280px] sm:max-w-[320px] md:max-w-[360px]">
        <h1
          id="hero-headline-left"
          className="text-[#111111] text-[24px] sm:text-[28px] md:text-[31px] lg:text-[33px] font-semibold tracking-[-0.03em] leading-[1.08] text-left"
        >
          <span className="block">We believe</span>
          <span className="block">there&apos;s no bad</span>
          <span className="block">business, there&apos;s ba</span>
          <span className="block font-black text-[#111111] mt-[2px]">marketing</span>
        </h1>
      </div>

      <div
        id="left-edge-decoration"
        className="pointer-events-auto mt-auto pt-6 flex items-center"
      >
        <div
          id="icon-smiley-minimal"
          className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-[#111111] flex items-center justify-center relative hover:scale-110 transition-transform cursor-pointer opacity-85 hover:opacity-100"
          title="LUMOS Studio"
        >
          <div className="absolute top-[4px] md:top-[5px] flex space-x-[3px]">
            <div className="w-[1.5px] h-[1.5px] bg-[#111111] rounded-full" />
            <div className="w-[1.5px] h-[1.5px] bg-[#111111] rounded-full" />
          </div>
          <div className="w-[7px] md:w-[8px] h-[3.5px] border-b-[1.2px] border-[#111111] rounded-b-full mt-1.5" />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   4. RightContent Component
   ───────────────────────────────────────────────────────────── */
export const RightContent: React.FC = () => {
  return (
    <div
      id="right-hero-section"
      className="flex flex-col justify-between h-full pointer-events-none z-10 select-none py-12 md:py-16 text-right"
    >
      <div className="mt-8 md:mt-16 lg:mt-20 flex flex-col items-end">
        <span
          id="right-micro-tag"
          className="text-[7.5px] md:text-[8.5px] font-mono font-semibold tracking-widest text-[#555555] uppercase mb-1.5"
        >
          [ LUMOS ]
        </span>

        <h2
          id="hero-headline-right"
          className="text-[#111111] text-[24px] sm:text-[27px] md:text-[30px] lg:text-[32px] font-semibold tracking-[-0.03em] leading-[1.08] text-right"
        >
          <span className="block">For</span>
          <span className="block">every</span>
          <span className="block font-black text-[#111111] mt-[1px]">business</span>
        </h2>
      </div>

      <div className="mt-auto pt-6 flex flex-col items-end space-y-3">
        <div
          id="right-technical-metadata"
          className="text-[7.5px] sm:text-[8px] md:text-[8.5px] font-mono leading-[1.35] tracking-[0.06em] text-[#444444] font-medium uppercase text-right max-w-[170px]"
        >
          <p className="block">A QUICK AND</p>
          <p className="block">EFFECTIVE SOLUTION</p>
          <p className="block">CAN BE FOUND.</p>
          <p className="block">CONTACT US &amp; WE</p>
          <p className="block">WILL FIND THAT</p>
          <p className="block">SOLUTION FOR YOU</p>
        </div>

        <div
          id="right-horizontal-divider"
          className="w-[150px] sm:w-[170px] md:w-[185px] h-[1.2px] bg-[#111111]"
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   5. CentralArtwork Component
   ───────────────────────────────────────────────────────────── */
interface CentralArtworkProps {
  onInteraction?: () => void;
}

export const CentralArtwork: React.FC<CentralArtworkProps> = ({ onInteraction }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handlePointerMove = (e: PointerEvent) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth - 0.5) * 2;
      const normY = (e.clientY / innerHeight - 0.5) * 2;

      setOffset({
        x: normX * 10,
        y: normY * 8,
        rotateX: -normY * 5,
        rotateY: normX * 6,
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    if (onInteraction) onInteraction();
  };

  const IMAGE_URL =
    'https://res.cloudinary.com/chhwhdhk/image/upload/v1788461532/964ef29e-b274-436f-8f56-dbff69f2a55d_rbp0io.png';

  return (
    <div
      id="central-artwork-wrapper"
      ref={containerRef}
      onClick={handleClick}
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none"
      style={{ perspective: '1000px' }}
    >
      <div
        className={`relative flex items-center justify-center transition-transform duration-200 ease-out ${
          isClicked ? 'scale-95' : 'scale-100'
        }`}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0px) rotateX(${offset.rotateX}deg) rotateY(${offset.rotateY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-8 bottom-6 h-12 bg-black/15 blur-2xl rounded-full transform translate-y-6 pointer-events-none"
        />

        <img
          id="central-sculptural-object"
          src={IMAGE_URL}
          alt="LUMOS central surreal 3D eye artwork"
          referrerPolicy="no-referrer"
          loading="eager"
          onLoad={() => setIsLoaded(true)}
          className={`relative z-10 w-auto h-[380px] sm:h-[460px] md:h-[520px] lg:h-[600px] max-h-[82vh] object-contain select-none drop-shadow-[0_20px_35px_rgba(0,0,0,0.12)] transition-all duration-700 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } hover:drop-shadow-[0_25px_40px_rgba(245,77,146,0.28)]`}
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   6. BottomFooter Component
   ───────────────────────────────────────────────────────────── */
export const BottomFooter: React.FC = () => {
  const barcodePattern = [
    2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 2, 1, 3
  ];

  return (
    <footer
      id="bottom-footer-strip"
      className="absolute bottom-0 inset-x-0 z-20 flex items-center justify-between px-3 md:px-5 py-2.5 md:py-3.5 select-none pointer-events-auto"
    >
      <div id="footer-left" className="flex items-center">
        <span className="text-[9.5px] sm:text-[10.5px] md:text-[11px] font-black tracking-wider text-[#111111] uppercase font-sans">
          ILLUMINATE BUSINESS POTENTIAL
        </span>
      </div>

      <div
        id="footer-center-barcode"
        className="flex items-center justify-center space-x-[1.5px] h-4 md:h-[18px] px-2 py-0.5 opacity-90"
        title="LUMOS IDENT 0924-883"
      >
        {barcodePattern.map((width, idx) => (
          <div
            key={idx}
            className="h-full bg-[#111111]"
            style={{ width: `${width * 0.9}px` }}
          />
        ))}
      </div>

      <div id="footer-right" className="flex items-center text-right">
        <span className="text-[9.5px] sm:text-[10.5px] md:text-[11px] font-black tracking-wider text-[#111111] uppercase font-sans">
          ENHANCE COMMERCIAL POWER
        </span>
      </div>
    </footer>
  );
};

/* ─────────────────────────────────────────────────────────────
   7. LumosHero Main Component
   ───────────────────────────────────────────────────────────── */
export const LumosHero: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  return (
    <main
      id="lumos-hero-poster"
      className="relative w-full h-full min-h-[640px] bg-[#F1F1F0] text-[#111111] overflow-hidden flex flex-col justify-between select-none font-sans"
    >
      {/* Paper grain texture overlay */}
      <div
        id="paper-grain-overlay"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(#111111 1px, transparent 1px)`,
          backgroundSize: '3px 3px',
        }}
      />

      <BackgroundTypography />

      <TopNav
        onGetStarted={() => showToast('LUMOS /// INITIATING CLIENT BRIEFING // CONNECTING...')}
        onSquareClick={() => showToast('LUMOS SYSTEM IDENT: 01 // READY')}
      />

      <div
        id="hero-grid-stage"
        className="relative z-10 w-full h-full flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 flex flex-col md:flex-row items-center justify-between pointer-events-none"
      >
        <div
          id="left-column-wrapper"
          className="w-full md:w-[32%] lg:w-[30%] h-full flex flex-col justify-between order-2 md:order-1 pointer-events-auto"
        >
          <LeftContent />
        </div>

        <div
          id="center-eye-stage"
          className="w-full md:w-[38%] lg:w-[42%] h-[380px] sm:h-[440px] md:h-full flex items-center justify-center relative order-1 md:order-2 pointer-events-auto my-auto"
        >
          <div className="w-full h-full max-w-[480px] relative flex items-center justify-center">
            <CentralArtwork onInteraction={() => showToast('OBJECT INTERACTION // FOCUSED')} />
          </div>
        </div>

        <div
          id="right-column-wrapper"
          className="w-full md:w-[32%] lg:w-[30%] h-full flex flex-col justify-between order-3 pointer-events-auto"
        >
          <RightContent />
        </div>
      </div>

      <BottomFooter />

      {toastMessage && (
        <div
          id="editorial-toast"
          role="status"
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-[#111111] text-white px-3.5 py-1.5 text-[9px] font-mono tracking-widest uppercase shadow-md border border-[#333333] pointer-events-none"
        >
          {toastMessage}
        </div>
      )}
    </main>
  );
};

export default LumosHero;
