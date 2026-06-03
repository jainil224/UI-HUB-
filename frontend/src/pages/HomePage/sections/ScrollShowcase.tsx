import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useTheme } from '../../../context/ThemeContext';
import { useSkeleton } from '../../../context/SkeletonContext';

gsap.registerPlugin(ScrollTrigger);

// Inline What I Do SVG Component representing the vector headers
const WhatIDoSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    viewBox="0 0 5172 723" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M1022.19 11L849.188 716H608.188L511.188 284L412.188 716H171.188L0.187501 11H212.188L294.188 493L405.188 11H620.188L728.188 489L810.188 11H1022.19ZM1716.36 11V716H1520.36V433H1281.36V716H1085.36V11H1281.36V276H1520.36V11H1716.36ZM2254.52 601H2004.52L1966.52 716H1760.52L2017.52 11H2243.52L2499.52 716H2292.52L2254.52 601ZM2205.52 451L2129.52 223L2054.52 451H2205.52ZM3074.41 11V167H2886.41V716H2690.41V167H2504.41V11H3074.41ZM3494.33 11V716H3298.33V11H3494.33ZM4036.35 11C4110.35 11 4175.02 26 4230.35 56C4286.35 85.3333 4329.35 126.667 4359.35 180C4389.35 233.333 4404.35 294.333 4404.35 363C4404.35 431 4389.02 491.667 4358.35 545C4328.35 598.333 4285.35 640.333 4229.35 671C4174.02 701 4109.68 716 4036.35 716H3757.35V11H4036.35ZM4021.35 543C4078.68 543 4123.68 527.333 4156.35 496C4189.02 464.667 4205.35 420.333 4205.35 363C4205.35 305 4189.02 260.333 4156.35 229C4123.68 197 4078.68 181 4021.35 181H3953.35V543H4021.35ZM4810.7 723C4744.7 723 4684.04 707.667 4628.7 677C4573.37 645.667 4529.37 602.667 4496.7 548C4464.7 492.667 4448.7 430.333 4448.7 361C4448.7 291.667 4464.7 229.667 4496.7 175C4529.37 119.667 4573.37 76.6667 4628.7 46C4684.04 15.3333 4744.7 -2.0504e-05 4810.7 -2.0504e-05C4877.37 -2.0504e-05 4938.04 15.3333 4992.7 46C5048.04 76.6667 5091.7 119.667 5123.7 175C5155.7 229.667 5171.7 291.667 5171.7 361C5171.7 430.333 5155.7 492.667 5123.7 548C5091.7 602.667 5048.04 645.667 4992.7 677C4937.37 707.667 4876.7 723 4810.7 723ZM4810.7 541C4860.7 541 4900.04 524.667 4928.7 492C4958.04 459.333 4972.7 415.667 4972.7 361C4972.7 305 4958.04 261 4928.7 229C4900.04 196.333 4860.7 180 4810.7 180C4760.04 180 4720.37 196.333 4691.7 229C4663.04 261 4648.7 305 4648.7 361C4648.7 416.333 4663.04 460.333 4691.7 493C4720.37 525 4760.04 541 4810.7 541Z" 
      fill="currentColor" 
    />
  </svg>
);

export const ScrollShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme: activeMode } = useTheme();
  const { isLoading } = useSkeleton();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useGSAP(() => {
    // 1. Text Scroll reveal clip-path math
    const textElements = gsap.utils.toArray<HTMLElement>('.animate-scroll-text');
    textElements.forEach((textElement) => {
      const text = textElement.textContent?.trim() || '';
      textElement.setAttribute('data-text', text);

      ScrollTrigger.create({
        trigger: textElement,
        start: 'top 50%',
        end: 'bottom 50%',
        scrub: 1,
        onUpdate: (self) => {
          const clipValue = Math.max(0, 100 - self.progress * 100);
          textElement.style.setProperty('--clip-value', `${clipValue}%`);
        },
      });
    });

    // 2. Services translate entry from sides
    ScrollTrigger.create({
      trigger: '.services-pin-container',
      start: 'top bottom',
      end: 'top top',
      scrub: 1,
      onUpdate: (self) => {
        const headers = gsap.utils.toArray<HTMLElement>('.services-header-row');
        if (headers.length >= 3) {
          gsap.set(headers[0], { x: `${100 - self.progress * 100}%` });
          gsap.set(headers[1], { x: `${-100 + self.progress * 100}%` });
          gsap.set(headers[2], { x: `${100 - self.progress * 100}%` });
        }
      },
    });

    // 3. Services pin and scale animations
    ScrollTrigger.create({
      trigger: '.services-pin-container',
      start: 'top top',
      end: `+=${window.innerHeight * 2}`,
      pin: true,
      scrub: 1,
      pinSpacing: false, // matches style.css margin-top spacing tricks
      onUpdate: (self) => {
        const headers = gsap.utils.toArray<HTMLElement>('.services-header-row');
        if (headers.length === 0) return;

        if (self.progress <= 0.5) {
          const yProgress = self.progress / 0.5;
          gsap.set(headers[0], { y: `${yProgress * 100}%` });
          gsap.set(headers[2], { y: `${yProgress * -100}%` });
        } else {
          gsap.set(headers[0], { y: '100%' });
          gsap.set(headers[2], { y: '-100%' });

          const scaleProgress = (self.progress - 0.5) / 0.5;
          const minScale = window.innerWidth <= 1000 ? 0.3 : 0.1;
          const scale = 1 - scaleProgress * (1 - minScale);

          headers.forEach((header) => gsap.set(header, { scale }));
        }
      },
    });
  }, { scope: containerRef });

  // Marquee items — doubled for seamless infinite loop
  const marqueeItems = Array(12).fill('UI HUB');

  return (
    <div ref={containerRef} className="scroll-showcase-container w-full bg-[#050508] dark:bg-[#000000] overflow-hidden relative border-t border-b border-white/5">
      {/* Dynamic Style block for scoped animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-scroll-text {
          position: relative;
          color: #2d2d5a;
          --clip-value: 100%;
          line-height: 1.25;
        }
        .animate-scroll-text::before {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: #FFFFFF;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.55);
          clip-path: inset(0 0 var(--clip-value) 0);
          will-change: clip-path;
          pointer-events: none;
        }
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 18s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* 1. First Text Reveal Section */}
      <section className="w-full h-[80vh] flex justify-center items-center p-8 overflow-hidden relative z-10">
        <h1 className="animate-scroll-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-center max-w-[900px] leading-snug">
          UI Hub is where developers come to stop reinventing the wheel — and start building things that actually matter.
        </h1>
      </section>

      {/* 2. Services pinned animation section */}
      <section className="services-pin-container w-full h-screen flex flex-col justify-center items-center overflow-hidden relative">
        <div className="services-header-row w-full px-8 py-4 flex justify-center bg-transparent will-change-transform">
          <WhatIDoSVG 
            className={`max-h-[14vh] md:max-h-[18vh] transition-all duration-300 ${
              activeMode === 'light' 
                ? 'text-[#2c5c85]' 
                : 'text-[#4B4A4E]'
            }`} 
          />
        </div>
        <div className="services-header-row w-full px-8 py-4 flex justify-center bg-transparent will-change-transform z-10">
          <WhatIDoSVG 
            className={`max-h-[14vh] md:max-h-[18vh] transition-all duration-300 ${
              activeMode === 'light' 
                ? 'text-[#2c5c85]' 
                : 'text-[#4B4A4E]'
            }`} 
          />
        </div>
        <div className="services-header-row w-full px-8 py-4 flex justify-center bg-transparent will-change-transform">
          <WhatIDoSVG 
            className={`max-h-[14vh] md:max-h-[18vh] transition-all duration-300 ${
              activeMode === 'light' 
                ? 'text-[#2c5c85]' 
                : 'text-[#4B4A4E]'
            }`} 
          />
        </div>
      </section>

      {/* 3. UI HUB Repeating Marquee Ticker — placed right after WHAT I DO */}
      <section className="w-full py-6 overflow-hidden border-t border-b border-white/5 mt-[155vh] relative z-10">
        <div className="marquee-track select-none">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-4 px-8 text-4xl sm:text-5xl md:text-6xl font-display font-black uppercase tracking-widest whitespace-nowrap ${
                activeMode === 'light' ? 'text-[#2c5c85]' : 'text-[#4B4A4E]'
              }`}
            >
              {item}
              <span className={`text-2xl ${activeMode === 'light' ? 'text-[#2c5c85]/50' : 'text-[#FFFFFF]/20'}`}>✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* 4. Final Text Reveal Section */}
      <section className="services-copy-section w-full min-h-[60vh] flex justify-center items-center p-8 pb-[10vh] text-center relative z-10">
        <h1 className="animate-scroll-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-center max-w-[950px] leading-snug">
          Every component is handcrafted, ready to drop in, and designed to make your next project feel premium from day one.
        </h1>
      </section>
    </div>
  );
};

export default ScrollShowcase;
