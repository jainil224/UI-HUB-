import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface SectionScrollProps {
  className?: string;
  showDemoButton?: boolean;
}

export const SectionScroll: React.FC<SectionScrollProps> = ({
  className = "",
  showDemoButton = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || showDemoButton) return;

    // Detect the nearest scroll container (for library preview vs standalone viewport)
    const scroller = containerRef.current.closest('.overflow-y-auto, .overflow-auto') || window;
    const panels = containerRef.current.querySelectorAll('.panel');

    panels.forEach((panel, index) => {
      const innerContainer = panel.querySelector('.panel-container');

      // 1. Entry Rotation Animation
      gsap.fromTo(innerContainer,
        {
          rotate: 25,
          transformOrigin: "bottom left"
        },
        {
          rotate: 0,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            scroller: scroller,
            start: "top bottom",
            end: "top center",
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );

      // 2. Section Pinning (except for the last section)
      if (index !== panels.length - 1) {
        ScrollTrigger.create({
          trigger: panel,
          scroller: scroller,
          start: "bottom bottom",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[500px] overflow-x-hidden bg-[#111] font-sans ${className}`}
    >

      {showDemoButton ? (
        // ── Preview Mode: Show only Panel One for a clean, non-overlapping design ──
        <div className="w-full h-full min-h-[500px] flex flex-col md:flex-row bg-[#d8d3c4] text-black p-8 md:p-16 relative z-10 rounded-2xl md:rounded-[3rem] overflow-hidden">
          <div className="flex-1 flex items-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase leading-none tracking-tight">
              Entry Point
            </h1>
          </div>
          <div className="flex-1 flex items-center md:pl-8">
            <p className="text-sm md:text-lg leading-relaxed max-w-md font-medium opacity-80">
              This space introduces an initial idea without defining its outcome.
            </p>
          </div>
        </div>
      ) : (
        // ── Full Scroll Mode: Show all 4 interactive panels ──
        <main className="w-full relative">
          {/* Panel One */}
          <section className="panel min-h-screen overflow-hidden relative w-full">
          <div className="panel-container min-h-screen p-8 md:p-16 flex flex-col md:flex-row bg-[#d8d3c4] text-black transition-all will-change-transform">
            <div className="flex-1 flex items-center">
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tight">
                Entry Point
              </h1>
            </div>
            <div className="flex-1 flex items-center md:pl-12">
              <p className="text-lg md:text-2xl leading-relaxed max-w-xl font-medium opacity-80">
                This space introduces an initial idea without defining its outcome.
              </p>
            </div>
          </div>
        </section>

        {/* Panel Two */}
        <section className="panel min-h-screen overflow-hidden relative w-full">
          <div className="panel-container min-h-screen p-8 md:p-16 flex flex-col md:flex-row bg-[#1d1d1d] text-white transition-all will-change-transform">
            <div className="flex-1 flex items-center justify-center py-8">
              <div className="w-full md:w-[65%] aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <img
                  src="/assets/section-scroll/img1.jpg"
                  alt="Gesture"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between py-12 md:pl-16">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-white/30">02 // VISUAL EXPRESSION</span>
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tight">
                  Gesture
                </h1>
                <p className="text-lg md:text-xl leading-relaxed max-w-xl opacity-75">
                  Form and expression intersect without explanation.
                </p>
              </div>
              <div className="h-4" />
            </div>
          </div>
        </section>

        {/* Panel Three */}
        <section className="panel min-h-screen overflow-hidden relative w-full">
          <div className="panel-container min-h-screen p-8 md:p-16 flex flex-col md:flex-row bg-[#8f7cff] text-black transition-all will-change-transform">
            <div className="flex-1 flex flex-col justify-between py-12 md:pr-16 order-2 md:order-1">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-black/40">03 // VARIATION BLOCK</span>
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tight">
                  Variation
                </h1>
                <p className="text-lg md:text-xl leading-relaxed max-w-xl opacity-80 font-medium">
                  Repetition is avoided in favor of subtle change.
                </p>
              </div>
              <div className="h-4" />
            </div>
            <div className="flex-1 flex items-center justify-center py-8 order-1 md:order-2">
              <div className="w-full md:w-[65%] aspect-[4/5] overflow-hidden rounded-2xl border border-black/10 shadow-2xl">
                <img
                  src="/assets/section-scroll/img2.jpg"
                  alt="Variation"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Panel Four */}
        <section className="panel min-h-screen overflow-hidden relative w-full">
          <div className="panel-container min-h-screen p-8 md:p-16 flex flex-col items-center justify-center bg-[#f0c808] text-black text-center transition-all will-change-transform">
            <div className="w-full md:w-[45%] aspect-[4/5] overflow-hidden rounded-2xl border border-black/10 shadow-2xl mb-8">
              <img
                src="/assets/section-scroll/img3.jpg"
                alt="The Stance"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase leading-none tracking-tight">
                The Stance
              </h1>
              <p className="text-lg md:text-2xl leading-relaxed font-medium opacity-85">
                A clearer position begins to take shape.
              </p>
            </div>
          </div>
        </section>
      </main>
      )}
    </div>
  );
};
