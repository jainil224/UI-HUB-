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
      const x = (e.clientX / innerWidth - 0.5) * 14;
      const y = (e.clientY / innerHeight - 0.5) * 14;
      setMouseOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const totalOffsetX = mouseOffset.x + interactiveOffset.x;
  const totalOffsetY = mouseOffset.y + interactiveOffset.y;

  return (
    <div id="split-fuzzy-orb-container" className="absolute inset-0 pointer-events-none z-10 overflow-hidden flex items-center justify-center select-none">
      {/* Left Half (Blurry) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)' }}
      >
        <div
          className="transition-transform duration-300 ease-out will-change-transform animate-orb-orbit flex items-center justify-center"
          style={{ transform: `translate(${totalOffsetX}px, ${totalOffsetY}px)` }}
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

      {/* Right Half (Razor-Crisp) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)' }}
      >
        <div
          className="transition-transform duration-300 ease-out will-change-transform animate-orb-orbit flex items-center justify-center"
          style={{ transform: `translate(${totalOffsetX}px, ${totalOffsetY}px)` }}
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
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        {grid.map((row, r) =>
          row.map((val, c) =>
            val ? (
              <circle
                key={`${r}-${c}`}
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
            className={`text-[11px] sm:text-[12px] tracking-wider transition-all duration-200 cursor-pointer ${
              activeNav === link ? 'text-white font-medium opacity-100' : 'text-white/85 font-normal hover:text-white hover:opacity-100'
            }`}
          >
            {link}
          </button>
        ))}
      </div>
      <button onClick={onMenuToggle} className="flex flex-col justify-center items-end w-6 h-6 space-y-[4px] cursor-pointer group p-1 -mr-1">
        <span className={`h-[2px] rounded-full bg-[#521c6e] transition-all duration-300 ${isMenuOpen ? 'w-5 translate-y-[6px] rotate-45' : 'w-5'}`} />
        <span className={`h-[2px] rounded-full bg-[#521c6e] transition-all duration-300 ${isMenuOpen ? 'w-5 opacity-0' : 'w-5'}`} />
        <span className={`h-[2px] rounded-full bg-[#521c6e] transition-all duration-300 ${isMenuOpen ? 'w-5 -translate-y-[6px] -rotate-45' : 'w-5'}`} />
      </button>
    </nav>
  );
};

export default function SplitFuzzyOrbHero() {
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
    <main className="relative w-full h-full min-h-[580px] overflow-hidden select-none bg-[#d6c0e3] flex">
      {/* 1. Dual-tone Split Background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'linear-gradient(90deg, #dccae9 0%, #dccae9 50%, #d4bde2 50%, #d4bde2 100%)' }}
      />

      {/* 2. Centerpiece Object (50% Split, Circular Spin & Orbit) */}
      <SplitFuzzyOrb interactiveOffset={orbOffset} />

      {/* 3. 50% Divider Line */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/30 z-10 pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.4)]" />

      {/* 4. Left 50% Panel */}
      <section className="relative z-20 w-full md:w-1/2 h-full flex flex-col justify-between px-8 sm:px-12 md:px-14 lg:px-16 py-7 sm:py-8 pointer-events-none">
        <div className="flex items-center pointer-events-auto">
          <DotLogo />
        </div>
        <div className="my-auto pointer-events-auto">
          <HeroContent onExploreClick={() => setIsMenuOpen(true)} />
        </div>
        <div className="h-6 opacity-0 pointer-events-none" />
      </section>

      {/* 5. Right 50% Panel */}
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
