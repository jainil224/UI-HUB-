import React, { useRef } from 'react';
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
    const scroller = showDemoButton ? containerRef.current : (containerRef.current.closest('.overflow-y-auto, .overflow-auto') || window);
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

    // Refresh ScrollTrigger to calculate correct coordinates inside nested scroll
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, { scope: containerRef, dependencies: [showDemoButton] });

  // Dynamic classes for Preview Mode vs Full-Screen Viewport Mode
  const panelClass = showDemoButton ? "h-full min-h-[500px]" : "min-h-screen";
  const containerClass = showDemoButton ? "h-full min-h-[500px]" : "min-h-screen";
  const paddingClass = showDemoButton ? "p-6 md:p-10" : "p-8 md:p-16";
  
  const titleClassOne = showDemoButton 
    ? "text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-none tracking-tight" 
    : "text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tight";
    
  const titleClassTwo = showDemoButton 
    ? "text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-none tracking-tight" 
    : "text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tight";

  const titleClassThree = showDemoButton 
    ? "text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-none tracking-tight" 
    : "text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tight";

  const titleClassFour = showDemoButton 
    ? "text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-none tracking-tight" 
    : "text-4xl sm:text-6xl md:text-8xl font-black uppercase leading-none tracking-tight";

  const descClass = showDemoButton ? "text-xs md:text-sm opacity-80" : "text-lg md:text-2xl opacity-80";
  const descClassNormal = showDemoButton ? "text-xs md:text-sm opacity-75" : "text-lg md:text-xl opacity-75";
  const imgBoxClass = showDemoButton ? "w-[50%] aspect-[4/5]" : "w-full md:w-[65%] aspect-[4/5]";
  const imgBoxLargeClass = showDemoButton ? "w-[40%] aspect-[4/5]" : "w-full md:w-[45%] aspect-[4/5]";

  return (
    <div
      ref={containerRef}
      data-lenis-prevent={showDemoButton ? "true" : undefined}
      className={`relative w-full h-full overflow-x-hidden bg-[#111] font-sans ${
        showDemoButton ? "overflow-y-auto max-h-[600px] min-h-[500px]" : ""
      } ${className}`}
    >
      <main className="w-full relative">
        {/* Panel One */}
        <section className={`panel ${panelClass} overflow-hidden relative w-full`}>
          <div className={`panel-container ${containerClass} ${paddingClass} flex flex-col md:flex-row bg-[#d8d3c4] text-black transition-all will-change-transform`}>
            <div className="flex-1 flex items-center">
              <h1 className={titleClassOne}>
                Entry Point
              </h1>
            </div>
            <div className="flex-1 flex items-center md:pl-12">
              <p className={`${descClass} font-medium`}>
                This space introduces an initial idea without defining its outcome.
              </p>
            </div>
          </div>
        </section>

        {/* Panel Two */}
        <section className={`panel ${panelClass} overflow-hidden relative w-full`}>
          <div className={`panel-container ${containerClass} ${paddingClass} flex flex-col md:flex-row bg-[#1d1d1d] text-white transition-all will-change-transform`}>
            <div className="flex-1 flex items-center justify-center py-4">
              <div className={`${imgBoxClass} overflow-hidden rounded-2xl border border-white/10 shadow-2xl`}>
                <img
                  src="/assets/section-scroll/img1.jpg"
                  alt="Gesture"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between py-6 md:pl-16">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">02 // VISUAL EXPRESSION</span>
              <div className="space-y-4">
                <h1 className={titleClassTwo}>
                  Gesture
                </h1>
                <p className={descClassNormal}>
                  Form and expression intersect without explanation.
                </p>
              </div>
              <div className="h-4" />
            </div>
          </div>
        </section>

        {/* Panel Three */}
        <section className={`panel ${panelClass} overflow-hidden relative w-full`}>
          <div className={`panel-container ${containerClass} ${paddingClass} flex flex-col md:flex-row bg-[#8f7cff] text-black transition-all will-change-transform`}>
            <div className="flex-1 flex flex-col justify-between py-6 md:pr-16 order-2 md:order-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40">03 // VARIATION BLOCK</span>
              <div className="space-y-4">
                <h1 className={titleClassThree}>
                  Variation
                </h1>
                <p className={`${descClassNormal} font-medium`}>
                  Repetition is avoided in favor of subtle change.
                </p>
              </div>
              <div className="h-4" />
            </div>
            <div className="flex-1 flex items-center justify-center py-4 order-1 md:order-2">
              <div className={`${imgBoxClass} overflow-hidden rounded-2xl border border-black/10 shadow-2xl`}>
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
        <section className={`panel ${panelClass} overflow-hidden relative w-full`}>
          <div className={`panel-container ${containerClass} ${paddingClass} flex flex-col items-center justify-center bg-[#f0c808] text-black text-center transition-all will-change-transform`}>
            <div className={`${imgBoxLargeClass} overflow-hidden rounded-2xl border border-black/10 shadow-2xl mb-6`}>
              <img
                src="/assets/section-scroll/img3.jpg"
                alt="The Stance"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="space-y-2 max-w-2xl">
              <h1 className={titleClassFour}>
                The Stance
              </h1>
              <p className={`${descClass} font-medium`}>
                A clearer position begins to take shape.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
