import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   1. TopNav Component
   ───────────────────────────────────────────────────────────── */
export const TopNav: React.FC = () => {
  return (
    <header className="relative z-30 w-full px-6 sm:px-8 pt-4 sm:pt-5 pb-2 flex items-center justify-between pointer-events-auto">
      <div className="flex items-center gap-2 group cursor-pointer" id="brand-logo">
        <div className="relative w-5 h-5 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-black fill-current" aria-hidden="true">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.24l6.54 3.63L12 11.5 5.46 7.87 12 4.24zM5 9.47l6 3.33v6.96l-6-3.33V9.47zm8 10.29v-6.96l6-3.33v6.96l-6 3.33z" />
          </svg>
        </div>
        <span className="text-[10px] tracking-[0.24em] font-medium text-neutral-400 select-none uppercase">
          Future<sup className="text-[7px] tracking-normal ml-[1px]">™</sup>
        </span>
      </div>

      <nav className="flex items-center gap-6 sm:gap-7" aria-label="Main Navigation">
        <a
          href="#download"
          onClick={(e) => e.preventDefault()}
          className="text-[10px] sm:text-[10.5px] font-medium text-neutral-900 tracking-tight hover:opacity-75 transition-opacity"
        >
          Download App
        </a>
        <a
          href="#login"
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] font-medium text-neutral-900 tracking-tight hover:opacity-75 transition-opacity group"
        >
          <span>Log in</span>
          <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      </nav>
    </header>
  );
};

/* ─────────────────────────────────────────────────────────────
   2. PillsNav Component
   ───────────────────────────────────────────────────────────── */
const PILL_ITEMS = [
  { id: 'pill-users', label: 'Large user base' },
  { id: 'pill-ai', label: 'Smart AI' },
  { id: 'pill-quality', label: 'Quality' },
  { id: 'pill-reliability', label: 'Data reliability' },
  { id: 'pill-support', label: 'Support' },
];

export const PillsNav: React.FC = () => {
  const [activePill, setActivePill] = useState<string | null>(null);

  return (
    <div className="relative z-30 w-full flex justify-center items-center pt-2 pb-1 px-4 pointer-events-auto">
      <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-[9px] max-w-full" role="tablist">
        {PILL_ITEMS.map((pill) => {
          const isActive = activePill === pill.id;
          return (
            <button
              key={pill.id}
              id={pill.id}
              type="button"
              onClick={() => setActivePill(isActive ? null : pill.id)}
              className={`group relative inline-flex items-center justify-center px-3 sm:px-3.5 py-[3px] sm:py-[4px] rounded-full text-[9px] sm:text-[10px] font-normal tracking-normal transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-neutral-900 text-white border border-neutral-900 shadow-xs'
                  : 'bg-transparent text-neutral-800 border border-[#7A748E]/40 hover:border-neutral-900/60 hover:bg-white/20 active:scale-98'
              }`}
            >
              <span className="whitespace-nowrap leading-none select-none">{pill.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   3. GiantTypography Component
   ───────────────────────────────────────────────────────────── */
export const GiantTypography: React.FC<{ word?: string }> = ({ word = 'LOVEAPP' }) => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden"
    >
      <div className="w-full flex items-center justify-center">
        <h1
          id="giant-background-typography"
          className="font-bold text-black tracking-[-0.01em] uppercase leading-none text-center select-none whitespace-nowrap"
          style={{
            fontFamily: "'Bebas Neue', 'Oswald', sans-serif",
            fontSize: 'clamp(170px, 26.5vw, 370px)',
            transform: 'scaleY(1.36)',
            transformOrigin: 'center center',
            letterSpacing: 'clamp(0.02em, 0.6vw, 0.05em)',
            color: '#050407',
            textShadow: '0 0 1px rgba(0,0,0,0.5)',
          }}
        >
          {word}
        </h1>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   4. FrostedDistortion Component
   ───────────────────────────────────────────────────────────── */
export const FrostedDistortion: React.FC<{ parallaxX?: number; parallaxY?: number }> = ({
  parallaxX = 0,
  parallaxY = 0,
}) => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-15"
      style={{
        transform: `translate3d(${parallaxX * 0.4}px, ${parallaxY * 0.4 - 15}px, 0)`,
        transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <div
        className="relative w-[320px] sm:w-[380px] md:w-[420px] h-[280px] sm:h-[320px] md:h-[350px] flex items-center justify-center"
        style={{
          maskImage: 'radial-gradient(ellipse 60% 55% at 50% 48%, black 40%, rgba(0,0,0,0.7) 65%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 48%, black 40%, rgba(0,0,0,0.7) 65%, transparent 95%)',
          backdropFilter: 'blur(10px) saturate(1.2) brightness(1.03)',
          WebkitBackdropFilter: 'blur(10px) saturate(1.2) brightness(1.03)',
        }}
      >
        <div
          className="absolute inset-0 rounded-[45%_45%_40%_40%/50%_50%_45%_45%]"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 48%, rgba(45, 30, 60, 0.18) 72%, rgba(20, 10, 30, 0.28) 88%, transparent 100%)',
            filter: 'blur(8px)',
          }}
        />
        <div
          className="absolute w-[260px] h-[220px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(243, 75, 131, 0.18) 0%, rgba(141, 90, 197, 0.12) 45%, transparent 75%)',
            filter: 'blur(20px)',
          }}
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   5. FlowingRibbons Component
   ───────────────────────────────────────────────────────────── */
export const FlowingRibbons: React.FC<{ parallaxX?: number; parallaxY?: number }> = ({
  parallaxX = 0,
  parallaxY = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      'rgba(255, 255, 255, 0.75)',
      'rgba(255, 175, 205, 0.7)',
      'rgba(180, 160, 240, 0.65)',
      'rgba(215, 240, 255, 0.7)',
    ];

    const particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: height * 0.3 + Math.random() * (height * 0.45),
      radius: Math.random() * 1.5 + 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.12 - 0.05,
      baseAlpha: Math.random() * 0.5 + 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.02;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < height * 0.2) p.y = height * 0.75;
        if (p.y > height * 0.8) p.y = height * 0.25;

        const currentAlpha = p.baseAlpha + Math.sin(p.phase) * 0.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d\.]+\)$/, `${Math.max(0.1, currentAlpha)})`);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-18 overflow-hidden select-none"
      style={{
        transform: `translate3d(${parallaxX * 0.25}px, ${parallaxY * 0.25}px, 0)`,
        transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <linearGradient id="iridLeft" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#DDF1FF" stopOpacity="0.8" />
            <stop offset="55%" stopColor="#E6DEFF" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#FFCCE0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="highlightStrokeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#C8EBFF" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#FFD3E2" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="iridRight" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="30%" stopColor="#D5ECFF" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#E3DBFF" stopOpacity="0.75" />
            <stop offset="85%" stopColor="#FFC8DD" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="highlightStrokeRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#D0F0FF" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#FFCEE2" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
          </linearGradient>
          <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Left Ribbon */}
      <div className="absolute left-0 top-[38%] -translate-y-1/2 w-[38vw] max-w-[480px] min-w-[240px] h-[300px] sm:h-[360px] animate-pulse">
        <svg viewBox="0 0 450 320" fill="none" className="w-full h-full overflow-visible">
          <path d="M-40,165 C60,165 110,120 180,110 C260,98 330,140 370,190 C405,235 340,290 280,265 C230,245 250,175 320,150 C380,128 430,145 460,160" stroke="url(#iridLeft)" strokeWidth="32" strokeLinecap="round" filter="url(#ribbonGlow)" className="opacity-75" />
          <path d="M-30,162 C70,162 120,118 185,110 C265,100 325,142 365,188 C398,228 342,275 290,258 C245,242 260,180 325,154 C375,134 425,148 455,160" stroke="url(#iridLeft)" strokeWidth="16" strokeLinecap="round" className="opacity-90" />
          <path d="M-30,152 C70,152 118,108 185,102 C265,92 328,135 368,180 C402,222 345,270 295,252 C248,236 264,174 328,148 C380,126 428,140 458,154" stroke="url(#highlightStrokeLeft)" strokeWidth="4.5" strokeLinecap="round" className="opacity-95" />
        </svg>
      </div>

      {/* Right Ribbon */}
      <div className="absolute right-0 top-[38%] -translate-y-1/2 w-[38vw] max-w-[480px] min-w-[240px] h-[300px] sm:h-[360px] animate-pulse" style={{ animationDelay: '1.5s' }}>
        <svg viewBox="0 0 450 320" fill="none" className="w-full h-full overflow-visible">
          <path d="M490,165 C390,165 340,120 270,110 C190,98 120,140 80,190 C45,235 110,290 170,265 C220,245 200,175 130,150 C70,128 20,145 -10,160" stroke="url(#iridRight)" strokeWidth="32" strokeLinecap="round" filter="url(#ribbonGlow)" className="opacity-75" />
          <path d="M480,162 C380,162 330,118 265,110 C185,100 125,142 85,188 C52,228 108,275 160,258 C205,242 190,180 125,154 C75,134 25,148 -5,160" stroke="url(#iridRight)" strokeWidth="16" strokeLinecap="round" className="opacity-90" />
          <path d="M480,152 C380,152 332,108 265,102 C185,92 122,135 82,180 C48,222 105,270 155,252 C202,236 186,174 122,148 C70,126 22,140 -8,154" stroke="url(#highlightStrokeRight)" strokeWidth="4.5" strokeLinecap="round" className="opacity-95" />
        </svg>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   6. CenterObject Component
   ───────────────────────────────────────────────────────────── */
interface CenterObjectProps {
  parallaxX?: number;
  parallaxY?: number;
}

const HEART_IMAGE_URL = 'https://res.cloudinary.com/chhwhdhk/image/upload/v1788462111/74ce5ea8-d47d-4de3-a636-7411198f4b28_hi8xrw.png';
const LOCAL_FALLBACK_URL = '/heart.png';

export const CenterObject: React.FC<CenterObjectProps> = ({
  parallaxX = 0,
  parallaxY = 0,
}) => {
  const [imgSrc, setImgSrc] = useState(HEART_IMAGE_URL);

  return (
    <div
      className="relative flex items-center justify-center pointer-events-none select-none z-20"
      style={{
        transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
        transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Radial Glow */}
        <div
          aria-hidden="true"
          className="absolute w-[80%] h-[75%] rounded-full -z-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(243, 75, 131, 0.28) 0%, rgba(184, 25, 84, 0.15) 45%, rgba(141, 90, 197, 0.08) 70%, transparent 85%)',
            filter: 'blur(28px)',
          }}
        />

        {/* 3D Glossy Heart Object */}
        <img
          id="center-glass-heart"
          src={imgSrc}
          onError={() => setImgSrc(LOCAL_FALLBACK_URL)}
          alt="Glossy 3D Glass Heart"
          referrerPolicy="no-referrer"
          className="w-[260px] sm:w-[320px] md:w-[360px] lg:w-[400px] h-auto object-contain drop-shadow-[0_12px_28px_rgba(180,40,90,0.18)] select-none pointer-events-none transition-transform duration-300"
          style={{
            transform: `rotate(${parallaxX * 0.25}deg)`,
          }}
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   7. CenterHeroContent Component
   ───────────────────────────────────────────────────────────── */
export const CenterHeroContent: React.FC = () => {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="relative z-30 flex flex-col items-center justify-center text-center px-4 mt-2 sm:mt-3 pointer-events-auto select-none">
      <p id="hero-description" className="text-[11.5px] sm:text-[12.5px] md:text-[13px] font-normal text-[#1A1820] tracking-normal leading-relaxed text-center">
        Your special way to find the love of your life in{' '}
        <span className="underline underline-offset-[3px] decoration-1 decoration-[#1A1820] font-medium cursor-pointer hover:opacity-80">
          one click
        </span>
      </p>

      <div className="mt-3 sm:mt-3.5">
        <button
          id="btn-find-love"
          type="button"
          onClick={() => {
            setClicked(true);
            setTimeout(() => setClicked(false), 1200);
          }}
          className="relative inline-flex items-center justify-center w-[120px] sm:w-[126px] h-[32px] sm:h-[35px] rounded-full bg-black text-white text-[11px] sm:text-[12px] font-medium tracking-tight shadow-sm hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden group"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          <span className="relative z-10 select-none">{clicked ? 'Connected!' : 'Find love'}</span>
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   8. BottomDecorations & NoiseOverlay
   ───────────────────────────────────────────────────────────── */
export const BottomDecorations: React.FC = () => (
  <>
    <div aria-hidden="true" className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full pointer-events-none z-5 opacity-40" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(220,212,255,0.3) 50%, transparent 80%)', filter: 'blur(16px)' }} />
    <div aria-hidden="true" className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full pointer-events-none z-5 opacity-40" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(220,212,255,0.3) 50%, transparent 80%)', filter: 'blur(16px)' }} />
    <div aria-hidden="true" className="absolute bottom-0 inset-x-0 flex justify-center pointer-events-none z-20">
      <div className="w-[180px] sm:w-[240px] h-[7px] border-t border-x border-[#CBC3EE]/70 rounded-t-[10px] bg-[#E6E2FF]/30 backdrop-blur-[1px]" />
    </div>
  </>
);

export const NoiseOverlay: React.FC = () => (
  <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-40 opacity-[0.04] mix-blend-overlay overflow-hidden select-none">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilterLoveApp">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilterLoveApp)" />
    </svg>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   9. LoveAppHero Main Component
   ───────────────────────────────────────────────────────────── */
export const LoveAppHero: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (window.innerWidth < 768) return;
    const { innerWidth, innerHeight } = window;
    const normX = (e.clientX / innerWidth) * 2 - 1;
    const normY = (e.clientY / innerHeight) * 2 - 1;
    mouseTargetRef.current = { x: normX * 10, y: normY * 10 };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseTargetRef.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const updateParallax = () => {
      currentPosRef.current.x = lerp(currentPosRef.current.x, mouseTargetRef.current.x, 0.08);
      currentPosRef.current.y = lerp(currentPosRef.current.y, mouseTargetRef.current.y, 0.08);
      setMousePos({ x: currentPosRef.current.x, y: currentPosRef.current.y });
      animFrameRef.current = requestAnimationFrame(updateParallax);
    };

    animFrameRef.current = requestAnimationFrame(updateParallax);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      className="w-full h-full min-h-[600px] bg-[#D8D2F8] p-1 sm:p-2 md:p-2.5 flex items-center justify-center select-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <main
        id="hero-frame"
        className="relative w-full h-full rounded-[8px] sm:rounded-[10px] bg-[#E6E2FF] border border-[#CBC4EC] shadow-[0_4px_30px_rgba(140,130,190,0.15)] flex flex-col justify-between overflow-hidden"
      >
        <NoiseOverlay />

        <div className="w-full flex-shrink-0">
          <TopNav />
          <PillsNav />
        </div>

        <div className="relative flex-1 w-full flex flex-col items-center justify-center my-auto min-h-[280px]">
          <GiantTypography word="LOVEAPP" />
          <FrostedDistortion parallaxX={mousePos.x} parallaxY={mousePos.y} />
          <FlowingRibbons parallaxX={mousePos.x} parallaxY={mousePos.y} />
          <CenterObject parallaxX={mousePos.x} parallaxY={mousePos.y} />
        </div>

        <div className="w-full flex-shrink-0 pb-6 sm:pb-8 pt-1">
          <CenterHeroContent />
          <BottomDecorations />
        </div>
      </main>
    </div>
  );
};

export default LoveAppHero;
