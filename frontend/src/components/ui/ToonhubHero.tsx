import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const IMAGES = [
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png', bg: '#F4845F', panel: '#F79B7F' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png', bg: '#6BBF7A', panel: '#85CC92' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png', bg: '#E882B4', panel: '#ED9DC4' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png', bg: '#6EB5FF', panel: '#8DC4FF' },
];

export default function ToonhubHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Preload images
    IMAGES.forEach((img) => {
      const image = new Image();
      image.src = img.src;
    });

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigate = useCallback((dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => {
      if (dir === 'next') return (prev + 1) % 4;
      return (prev + 3) % 4;
    });
    setTimeout(() => {
      setIsAnimating(false);
    }, 650);
  }, [isAnimating]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navigate('prev');
      } else if (e.key === 'ArrowRight') {
        navigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const getRole = (index: number) => {
    if (index === activeIndex) return 'center';
    if (index === (activeIndex + 3) % 4) return 'left';
    if (index === (activeIndex + 1) % 4) return 'right';
    return 'back';
  };

  const getStyleForRole = (role: string) => {
    const baseTransition = 'transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms cubic-bezier(0.4,0,0.2,1), opacity 650ms cubic-bezier(0.4,0,0.2,1), left 650ms cubic-bezier(0.4,0,0.2,1)';
    const willChange = 'transform, filter, opacity, left';

    switch (role) {
      case 'center':
        return {
          transform: `translateX(-50%) scale(${isMobile ? 1.05 : 1.15})`,
          filter: 'blur(0px)',
          opacity: 1,
          zIndex: 20,
          left: '50%',
          height: isMobile ? '65%' : '80%',
          bottom: isMobile ? '12%' : '4%',
          transition: baseTransition,
          willChange
        };
      case 'left':
        return {
          transform: 'translateX(-50%) scale(0.85)',
          filter: 'blur(2px)',
          opacity: 0.75,
          zIndex: 10,
          left: isMobile ? '18%' : '24%',
          height: isMobile ? '45%' : '55%',
          bottom: isMobile ? '20%' : '10%',
          transition: baseTransition,
          willChange
        };
      case 'right':
        return {
          transform: 'translateX(-50%) scale(0.85)',
          filter: 'blur(2px)',
          opacity: 0.75,
          zIndex: 10,
          left: isMobile ? '82%' : '76%',
          height: isMobile ? '45%' : '55%',
          bottom: isMobile ? '20%' : '10%',
          transition: baseTransition,
          willChange
        };
      case 'back':
        return {
          transform: 'translateX(-50%) scale(0.7)',
          filter: 'blur(4px)',
          opacity: 0.4,
          zIndex: 5,
          left: '50%',
          height: isMobile ? '35%' : '45%',
          bottom: isMobile ? '25%' : '15%',
          transition: baseTransition,
          willChange
        };
      default:
        return {};
    }
  };

  // Grain SVG URI
  const grainUri = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E";

  return (
    <div 
      className="relative w-full h-full min-h-[420px] sm:min-h-[480px] overflow-hidden select-none" 
      style={{ 
        containerType: 'inline-size',
        backgroundColor: IMAGES[activeIndex].bg,
        transition: 'background-color 650ms cubic-bezier(0.4,0,0.2,1)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div className="relative w-full h-full min-h-[420px] sm:min-h-[480px] overflow-hidden">
        
        {/* Grain overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-50"
          style={{
            opacity: 0.3,
            backgroundImage: `url("${grainUri}")`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat'
          }}
        />

        {/* Giant ghost text */}
        <div 
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none z-[2] text-center"
          style={{
            top: '14%',
            fontFamily: "'Impact', 'Anton', sans-serif",
            fontSize: 'clamp(36px, 12cqi, 130px)',
            fontWeight: 900,
            color: 'white',
            opacity: 0.95,
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap'
          }}
        >
          3D SHAPE
        </div>

        {/* Top-left brand label */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[60] text-[10px] sm:text-xs font-bold uppercase text-white opacity-90 tracking-widest">
          TOONHUB
        </div>

        {/* Carousel */}
        <div className="absolute inset-0 z-[3]">
          {IMAGES.map((img, idx) => {
            const role = getRole(idx);
            const roleStyle = getStyleForRole(role);
            return (
              <div 
                key={idx} 
                className="absolute"
                style={{
                  ...roleStyle,
                  aspectRatio: '0.6 / 1'
                }}
              >
                <img 
                  src={img.src} 
                  alt={`Character ${idx}`}
                  className="w-full h-full object-contain object-bottom"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom-left text + nav buttons */}
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-[60] max-w-[260px]">
          <p className="font-bold uppercase tracking-wider mb-1 text-xs sm:text-sm text-white opacity-95">
            TOONHUB FIGURINES
          </p>
          <div className="flex gap-2.5 mt-2">
            <button 
              onClick={() => navigate('prev')}
              className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-transparent border-2 border-white transition-all duration-150 hover:scale-105 hover:bg-white/20 cursor-pointer"
            >
              <ArrowLeft size={16} strokeWidth={2.5} className="text-white" />
            </button>
            <button 
              onClick={() => navigate('next')}
              className="group flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-transparent border-2 border-white transition-all duration-150 hover:scale-105 hover:bg-white/20 cursor-pointer"
            >
              <ArrowRight size={16} strokeWidth={2.5} className="text-white" />
            </button>
          </div>
        </div>

        {/* Bottom-right link */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60]">
          <a 
            href="#" 
            className="flex items-center gap-1.5 sm:gap-2 text-white opacity-95 hover:opacity-100 transition-opacity font-bold uppercase tracking-wider text-xs sm:text-sm font-heading"
          >
            DISCOVER IT
            <ArrowRight size={14} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </div>
  );
}
