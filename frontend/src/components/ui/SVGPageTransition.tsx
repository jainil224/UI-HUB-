import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';

interface SVGPageTransitionProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const SVGPageTransition: React.FC<SVGPageTransitionProps> = ({ containerRef }) => {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'contact'>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);

  const activeContainer = containerRef || localContainerRef;

  // Initialize SVG stroke dasharray and dashoffset
  useEffect(() => {
    const p1 = path1Ref.current;
    const p2 = path2Ref.current;

    if (p1 && p2) {
      const len1 = p1.getTotalLength();
      const len2 = p2.getTotalLength();

      // Setup initial styles
      p1.style.strokeDasharray = `${len1}`;
      p1.style.strokeDashoffset = `${len1}`;

      p2.style.strokeDasharray = `${len2}`;
      p2.style.strokeDashoffset = `${len2}`;
    }
  }, []);

  const leave = () => {
    return new Promise<void>((resolve) => {
      const p1 = path1Ref.current;
      const p2 = path2Ref.current;

      if (!p1 || !p2) {
        resolve();
        return;
      }

      const tl = gsap.timeline({ onComplete: resolve });

      // Animating paths drawing in
      tl.to(p1, {
        strokeDashoffset: 0,
        attr: { "stroke-width": 700 },
        duration: 0.85,
        ease: "power2.inOut",
      }, 0);

      tl.to(p2, {
        strokeDashoffset: 0,
        attr: { "stroke-width": 700 },
        duration: 0.85,
        ease: "power2.inOut",
      }, 0.08); // Slight stagger for depth
    });
  };

  const enter = () => {
    return new Promise<void>((resolve) => {
      const p1 = path1Ref.current;
      const p2 = path2Ref.current;

      if (!p1 || !p2) {
        resolve();
        return;
      }

      const len1 = p1.getTotalLength();
      const len2 = p2.getTotalLength();

      const tl = gsap.timeline({ onComplete: resolve });

      // Animating paths drawing out
      tl.to(p1, {
        strokeDashoffset: -len1,
        attr: { "stroke-width": 200 },
        duration: 0.85,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(p1, { strokeDashoffset: len1 });
        }
      }, 0);

      tl.to(p2, {
        strokeDashoffset: -len2,
        attr: { "stroke-width": 200 },
        duration: 0.85,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(p2, { strokeDashoffset: len2 });
        }
      }, 0.08);
    });
  };

  const handleNavigation = async (page: 'home' | 'about' | 'contact') => {
    if (isTransitioning || page === currentPage) return;
    setIsTransitioning(true);

    // Draw transition overlay
    await leave();

    // Switch page content
    setCurrentPage(page);

    // Wipe transition overlay away
    await enter();

    setIsTransitioning(false);
  };

  const getPageContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <h1 className="text-6xl md:text-[9rem] font-black uppercase tracking-tight text-white select-none animate-pulse duration-[3000ms]">
              HOME
            </h1>
            <p className="text-white/40 text-xs md:text-sm font-semibold uppercase tracking-[0.25em] max-w-md">
              SVG WIPE-DRAW PAGE TRANSITION INTERACTIVE SHOWCASE
            </p>
          </div>
        );
      case 'about':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <h1 className="text-6xl md:text-[9rem] font-black uppercase tracking-tight text-indigo-400 select-none">
              ABOUT
            </h1>
            <p className="text-white/40 text-xs md:text-sm font-semibold uppercase tracking-[0.25em] max-w-md">
              POWERED BY HIGH-PERFORMANCE GSAP VECTOR MORPHING
            </p>
          </div>
        );
      case 'contact':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <h1 className="text-6xl md:text-[9rem] font-black uppercase tracking-tight text-cyan-400 select-none">
              CONTACT
            </h1>
            <p className="text-white/40 text-xs md:text-sm font-semibold uppercase tracking-[0.25em] max-w-md">
              CONNECT MULTIPLE WEB PAGES SEAMLESSLY
            </p>
          </div>
        );
    }
  };

  return (
    <div
      ref={localContainerRef}
      className="relative w-full h-full min-h-[400px] overflow-hidden bg-[#040406]"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 80%), radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.03) 0%, transparent 50%)',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}
    >
      {/* Pinned Mock Navbar */}
      <nav className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6 z-10 bg-black/10 backdrop-blur-md border-b border-white/[0.04]">
        <div className="text-white font-black tracking-tight text-sm md:text-base">
          UI<span className="text-indigo-400">HUB</span>
        </div>
        <ul className="flex gap-1 bg-white/[0.03] border border-white/[0.05] p-1 rounded-full">
          {(['home', 'about', 'contact'] as const).map((page) => (
            <li key={page}>
              <button
                onClick={() => handleNavigation(page)}
                disabled={isTransitioning}
                className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  currentPage === page
                    ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {page}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Page Content Screen */}
      <div className="w-full h-full pt-16">
        {getPageContent()}
      </div>

      {/* SVG Transition Layer */}
      <div 
        className="absolute -inset-[30%] pointer-events-none z-50 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 2453 2535"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            ref={path1Ref}
            d="M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262"
            stroke="#16151f"
            strokeWidth="200"
            strokeLinecap="round"
            shapeRendering="geometricPrecision"
          />
          <path
            ref={path2Ref}
            d="M1661.28 2255.51C1661.28 2255.51 2311.09 1960.37 2111.78 1817.01C1944.47 1696.67 718.456 2870.17 499.781 2255.51C308.969 1719.17 2457.51 1613.83 2111.78 963.512C1766.05 313.198 427.949 2195.17 132.281 1455.51C-155.219 736.292 2014.78 891.514 1708.78 252.012C1437.81 -314.29 369.471 909.169 132.281 566.512C18.1772 401.672 244.781 193.012 244.781 193.012"
            stroke="#6366f1"
            strokeWidth="200"
            strokeLinecap="round"
            shapeRendering="geometricPrecision"
          />
        </svg>
      </div>
    </div>
  );
};
