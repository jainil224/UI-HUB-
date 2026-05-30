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
    if (!containerRef.current) return;

    // Detect the nearest scroll container (for library preview vs standalone viewport)
    const scroller = containerRef.current.closest('.overflow-y-auto, .overflow-auto') || window;
    const panels = containerRef.current.querySelectorAll('.panel');

    if (showDemoButton) {
      // ── Preview Mode: Scroll-linked animation driven by main page scroll ──
      gsap.set(panels, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      });

      panels.forEach((panel, index) => {
        if (index > 0) {
          const innerContainer = panel.querySelector('.panel-container');
          gsap.set(panel, { yPercent: 100, zIndex: index });
          gsap.set(innerContainer, { rotate: 25, transformOrigin: "bottom left" });
        } else {
          gsap.set(panel, { zIndex: 0 });
        }
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          scroller: scroller,
          start: "top 85%",
          end: "bottom 15%",
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });

      panels.forEach((panel, index) => {
        if (index > 0) {
          const innerContainer = panel.querySelector('.panel-container');
          tl.to(panel, {
            yPercent: 0,
            ease: "none",
          }, `stage-${index}`)
          .to(innerContainer, {
            rotate: 0,
            ease: "none",
          }, `stage-${index}`);
          
          tl.to({}, { duration: 0.2 }); // hold slightly
        }
      });

      return () => {
        tl.kill();
        ScrollTrigger.getAll().forEach(st => st.kill());
      };
    } else {
      // ── Full Scroll Mode: Original GSAP ScrollTrigger ──
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
    }
  }, { scope: containerRef });

  return (
    <div
      className={`relative w-full h-full min-h-[500px] bg-[#111] font-sans ${
        showDemoButton ? "overflow-hidden" : ""
      } ${className}`}
    >
      {/* Premium UI HUB Brand Badge */}
      <div className="absolute top-6 right-6 z-40 pointer-events-none flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 select-none">
        <img 
          src="/logo.png" 
          alt="UI HUB" 
          className="w-3.5 h-3.5 object-contain" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
        />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white leading-none">UI HUB</span>
        <div className="w-1 h-1 rounded-full bg-brand-green animate-pulse" />
      </div>

      <div
        ref={containerRef}
        className={`w-full h-full ${
          showDemoButton 
            ? "absolute inset-0 overflow-hidden" 
            : "relative overflow-x-hidden"
        }`}
      >
        {/* Full Scroll Mode: Show all interactive panels */}
        <main className={`w-full ${showDemoButton ? 'h-full absolute inset-0' : 'relative'}`}>
          {/* Panel One */}
          <section className={`panel overflow-hidden relative w-full ${showDemoButton ? 'h-full' : 'min-h-screen'}`}>
            <div className={`panel-container p-8 md:p-16 flex flex-col md:flex-row bg-[#d8d3c4] text-black transition-all will-change-transform ${showDemoButton ? 'h-full' : 'min-h-screen'}`}>
              <div className="flex-1 flex items-center">
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tight">
                  Entry Point
                </h1>
              </div>
              <div className="flex-1 flex items-center md:pl-12">
                <div className="space-y-6">
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-black/30">01 // UI HUB ARCHITECTURE</span>
                  <p className="text-lg md:text-2xl leading-relaxed max-w-xl font-medium opacity-80">
                    This space introduces an initial idea without defining its outcome.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Panel Two */}
          <section className={`panel overflow-hidden relative w-full ${showDemoButton ? 'h-full' : 'min-h-screen'}`}>
            <div className={`panel-container p-8 md:p-16 flex flex-col md:flex-row bg-[#1d1d1d] text-white transition-all will-change-transform ${showDemoButton ? 'h-full' : 'min-h-screen'}`}>
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
                <span className="text-xs font-black uppercase tracking-[0.25em] text-white/30">02 // UI HUB EXPRESSION</span>
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
          <section className={`panel overflow-hidden relative w-full ${showDemoButton ? 'h-full' : 'min-h-screen'}`}>
            <div className={`panel-container p-8 md:p-16 flex flex-col md:flex-row bg-[#8f7cff] text-black transition-all will-change-transform ${showDemoButton ? 'h-full' : 'min-h-screen'}`}>
              <div className="flex-1 flex flex-col justify-between py-12 md:pr-16 order-2 md:order-1">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-black/40">03 // UI HUB VARIATION</span>
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
          <section className={`panel overflow-hidden relative w-full ${showDemoButton ? 'h-full' : 'min-h-screen'}`}>
            <div className={`panel-container p-8 md:p-16 flex flex-col items-center justify-center bg-[#f0c808] text-black text-center transition-all will-change-transform ${showDemoButton ? 'h-full' : 'min-h-screen'}`}>
              <div className="w-full md:w-[45%] aspect-[4/5] overflow-hidden rounded-2xl border border-black/10 shadow-2xl mb-8">
                <img
                  src="/assets/section-scroll/img3.jpg"
                  alt="The Stance"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="space-y-4 max-w-2xl">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-black/40 block mb-2">04 // UI HUB OUTCOME</span>
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
      </div>
    </div>
  );
};
