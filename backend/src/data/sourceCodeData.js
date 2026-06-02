/**
 * PRODUCTION-SAFE EMBEDDED SOURCE CODE
 *
 * These are verbatim copies of frontend component source files.
 * They are embedded here because in production the backend server
 * does not have access to the frontend filesystem.
 *
 * When adding new components, copy their source code here too.
 */

export const EMBEDDED_SOURCE_CODE = {

  'section-scroll': `import React, { useRef } from 'react';
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
          }, \`stage-\${index}\`)
          .to(innerContainer, {
            rotate: 0,
            ease: "none",
          }, \`stage-\${index}\`);
          
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
      className={\`relative w-full h-full min-h-[500px] bg-[#111] font-sans \${
        showDemoButton ? "overflow-hidden" : ""
      } \${className}\`}
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
        className={\`w-full h-full \${
          showDemoButton 
            ? "absolute inset-0 overflow-hidden" 
            : "relative overflow-x-hidden"
        }\`}
      >
        {/* Full Scroll Mode: Show all interactive panels */}
        <main className={\`w-full \${showDemoButton ? 'h-full absolute inset-0' : 'relative'}\`}>
          {/* Panel One */}
          <section className={\`panel overflow-hidden relative w-full \${showDemoButton ? 'h-full' : 'min-h-screen'}\`}>
            <div className={\`panel-container p-8 md:p-16 flex flex-col md:flex-row bg-[#d8d3c4] text-black transition-all will-change-transform \${showDemoButton ? 'h-full' : 'min-h-screen'}\`}>
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
          <section className={\`panel overflow-hidden relative w-full \${showDemoButton ? 'h-full' : 'min-h-screen'}\`}>
            <div className={\`panel-container p-8 md:p-16 flex flex-col md:flex-row bg-[#1d1d1d] text-white transition-all will-change-transform \${showDemoButton ? 'h-full' : 'min-h-screen'}\`}>
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
          <section className={\`panel overflow-hidden relative w-full \${showDemoButton ? 'h-full' : 'min-h-screen'}\`}>
            <div className={\`panel-container p-8 md:p-16 flex flex-col md:flex-row bg-[#8f7cff] text-black transition-all will-change-transform \${showDemoButton ? 'h-full' : 'min-h-screen'}\`}>
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
          <section className={\`panel overflow-hidden relative w-full \${showDemoButton ? 'h-full' : 'min-h-screen'}\`}>
            <div className={\`panel-container p-8 md:p-16 flex flex-col items-center justify-center bg-[#f0c808] text-black text-center transition-all will-change-transform \${showDemoButton ? 'h-full' : 'min-h-screen'}\`}>
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
`,

  'portfolio-scroll': `// ── PortfolioScroll.tsx ──
import React, { useEffect, useRef, useCallback, useState } from "react";
import "./PortfolioScroll.css";

// ── StarBorder component defined locally for portablity ──
interface StarBorderProps<T extends React.ElementType> {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: string;
}

export const StarBorder = <T extends React.ElementType = "button">({
  as,
  className = "",
  color = "#ffffff, #333333, #ffffff",
  speed = "6s",
  children,
  ...rest
}: StarBorderProps<T> & React.ComponentPropsWithoutRef<T>) => {
  const Component = as || "button";

  return (
    <Component className={\`star-border-container \${className}\`} {...(rest as any)}>
      <div
        className="border-gradient-full"
        style={{
          background: \`conic-gradient(from 0deg, transparent, \${color}, transparent)\`,
          animationDuration: speed,
        }}
      ></div>
      <div className="inner-content">{children}</div>
    </Component>
  );
};

const projects = [
  {
    id: "001",
    title: "Enterprise Resource Architecture",
    stack: "React / Node.js / Firebase / Firestore",
    description: "A full-stack ERP engine automating multi-currency invoicing, inventory logic, and international tax compliance for distributed teams.",
    links: { live: "https://erpbeta.netlify.app", code: "#" },
    image: "/p1.png",
    cta: "Live Project"
  },
  {
    id: "002",
    title: "Geospatial Workforce Analytics",
    stack: "React / Redux / Google Maps API/ Firebase",
    description: "Real-time tracking system implementing location-based validation protocols and live route visualization for workforce monitoring.",
    links: { live: "#", code: "#" },
    image: "/p2.png",
    cta: "Live Project"
  },
  {
    id: "003",
    title: "OrderEase: Real-time online table food ordering system",
    stack: "React / Firebase / Node.js",
    description: "A real-time restaurant table ordering system that allows customers to place food orders directly from their table while enabling admins to manage menus, waiters, and assign waiters to customers for seamless service coordination.",
    links: { live: "https://github.com/MAHESHPPAI/OrderEase", code: "#" },
    image: "/p3.png",
    cta: "View on Github"
  },
  {
    id: "004",
    title: "BusBuddy: Transit Management Logic",
    stack: "React / Firebase / Springboot / ngrok",
    description: "A real-time campus transportation platform that enables students to book seats and track buses live, drivers to stream GPS data during journeys, and transport officers to manage fleet availability, monitoring, and notifications seamlessly.",
    links: { live: "https://github.com/MAHESHPPAI/Busbuddy-latest", code: "#" },
    image: "/p4.png",
    cta: "View on Github"
  },
];

interface ScrollStackCardProps {
  project: typeof projects[0];
  index: number;
}

const ScrollStackCard = ({ project, index }: ScrollStackCardProps) => {
  return (
    <StarBorder
      as="div"
      className="scroll-stack-card"
      color="#00f2fe, #4facfe, #7000ff"
      speed="8s"
    >
      <div className="card-top-row">
        <div className="id-brand-group">
          <span className="huge-number">{project.id}</span>
          <div className="client-info">
            <span className="label">{project.title}</span>
            <span className="client-name">{project.stack}</span>
          </div>
        </div>

        <StarBorder
          as="a"
          href={project.links.live}
          target="_blank"
          rel="noopener noreferrer"
          className="live-btn-star"
          color="#f6d365, #fda085"
          speed="3s"
        >
          {project.cta}
        </StarBorder>
      </div>

      <div className="content-grid">
        <img
          src={project.image}
          className="main-image w-full h-auto object-contain"
          alt={project.title}
          onLoad={() => window.dispatchEvent(new Event("resize"))}
        />
        <div className="project-description">
          <p>{project.description}</p>
        </div>
      </div>
    </StarBorder>
  );
};

const BASE_CONFIG = {
  itemDistance: 100,
  itemScale: 0.015,
  itemStackDistance: 18,
  stackPosition: 0.08,
  scaleEndPosition: 0.05,
  baseScale: 0.92,
};

export const PortfolioScroll: React.FC = () => {
  const cardsRef = useRef<HTMLElement[]>([]);
  const cardOffsetsRef = useRef<number[]>([]);
  const endOffsetRef = useRef<number>(0);
  const stackInnerRef = useRef<HTMLDivElement>(null);
  const stackInnerTopRef = useRef<number>(0);
  const voidContainerRef = useRef<HTMLDivElement>(null);
  const kineticWheelRef = useRef<HTMLDivElement>(null);
  const threadPathRef = useRef<SVGPathElement>(null);
  const figureGroupRef = useRef<SVGGElement>(null);
  const threadLenRef = useRef(0);

  // Refs for Typography animation
  const textAnalyzeRef = useRef<SVGTextElement>(null);
  const textDesignRef = useRef<SVGTextElement>(null);
  const textBuildRef = useRef<SVGTextElement>(null);
  const textDeliverRef = useRef<SVGTextElement>(null);

  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const cachePositions = useCallback(() => {
    setReady(false);
    const cards = Array.from(document.querySelectorAll(".scroll-stack-card")) as HTMLElement[];
    cardsRef.current = cards;
    cards.forEach((card) => (card.style.transform = ""));
    if (voidContainerRef.current) {
      voidContainerRef.current.style.transform = "";
      voidContainerRef.current.style.transformOrigin = "";
    }
    if (kineticWheelRef.current) kineticWheelRef.current.style.transform = "";

    if (threadPathRef.current && isMobile) {
      try {
        const len = threadPathRef.current.getTotalLength();
        if (len > 0) {
          threadLenRef.current = len;
          threadPathRef.current.style.strokeDasharray = \`\${len}\`;
          threadPathRef.current.style.strokeDashoffset = \`\${len}\`;
        }
      } catch (e) {}
    }

    const scroller = stackInnerRef.current?.closest(".overflow-y-auto, .overflow-auto") || window;
    const scrollY = scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;

    let scrollerOffset = 0;
    if (scroller !== window) {
      const scrollerRect = (scroller as HTMLElement).getBoundingClientRect();
      scrollerOffset = scrollerRect.top;
    }

    cardOffsetsRef.current = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return rect.top + scrollY - scrollerOffset;
    });

    const endElement = document.querySelector(".scroll-stack-end") as HTMLElement;
    if (endElement) {
      const rect = endElement.getBoundingClientRect();
      endOffsetRef.current = rect.top + scrollY - scrollerOffset;
    }

    if (stackInnerRef.current) {
      const rect = stackInnerRef.current.getBoundingClientRect();
      stackInnerTopRef.current = rect.top + scrollY - scrollerOffset;
    }

    setReady(true);
  }, [isMobile]);

  const calculateAndRender = useCallback(() => {
    cachePositions();
  }, [cachePositions]);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll(".scroll-stack-card")) as HTMLElement[];
    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = \`\${BASE_CONFIG.itemDistance}px\`;
      card.style.willChange = "transform";
      card.style.transformOrigin = "top center";
    });

    const resizeObserver = new ResizeObserver(() => calculateAndRender());
    cards.forEach((card) => resizeObserver.observe(card));
    calculateAndRender();

    const initTimer = setTimeout(calculateAndRender, 100);
    window.addEventListener("resize", calculateAndRender, { passive: true });

    return () => {
      clearTimeout(initTimer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateAndRender);
    };
  }, [calculateAndRender]);

  useEffect(() => {
    if (!ready) return;

    const scroller = stackInnerRef.current?.closest(".overflow-y-auto, .overflow-auto") || window;

    const handleScroll = () => {
      const scroll = scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;

      const cards = cardsRef.current;
      const cardOffsets = cardOffsetsRef.current;
      const endElementTop = endOffsetRef.current;
      const stackInnerTop = stackInnerTopRef.current;

      if (!cards.length || !cardOffsets.length) return;

      const containerHeight = window.innerHeight;
      const firstCardHeight = cards[0].offsetHeight;

      const stackPositionPx = (containerHeight - firstCardHeight) / 2;
      const scaleEndPositionPx = stackPositionPx - (BASE_CONFIG.stackPosition - BASE_CONFIG.scaleEndPosition) * containerHeight;

      const lastCardTop = cardOffsets[cards.length - 1];
      const triggerEndLast = lastCardTop - scaleEndPositionPx;

      const voidStart = triggerEndLast;
      const voidDistance = containerHeight * 1.2;
      let voidProgress = 0;

      if (scroll > voidStart) {
        voidProgress = (scroll - voidStart) / voidDistance;
        voidProgress = Math.min(Math.max(voidProgress, 0), 1);
      }

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (!card) continue;
        const cardTop = cardOffsets[i];
        const triggerStart = cardTop - stackPositionPx - BASE_CONFIG.itemStackDistance * i;
        const triggerEnd = cardTop - scaleEndPositionPx;
        const pinStart = triggerStart;
        const pinEnd = Math.max(endElementTop - containerHeight * 0.5, voidStart + voidDistance);

        let scaleProgress = 0;
        if (scroll >= triggerEnd) {
          scaleProgress = 1;
        } else if (scroll > triggerStart) {
          scaleProgress = (scroll - triggerStart) / (triggerEnd - triggerStart);
        }

        scaleProgress = Math.min(Math.max(scaleProgress, 0), 1);

        const targetScale = BASE_CONFIG.baseScale + i * BASE_CONFIG.itemScale;
        const scale = Number((1 - scaleProgress * (1 - targetScale)).toFixed(4));

        let translateY = 0;
        if (scroll >= pinStart && scroll <= pinEnd) {
          translateY = scroll - cardTop + stackPositionPx + BASE_CONFIG.itemStackDistance * i;
        } else if (scroll > pinEnd) {
          translateY = pinEnd - cardTop + stackPositionPx + BASE_CONFIG.itemStackDistance * i;
        }

        card.style.transform = \`translate3d(0, \${Math.round(translateY * 10) / 10}px, 0) scale(\${scale})\`;
      }

      const voidContainer = voidContainerRef.current;
      const stackInner = stackInnerRef.current;

      if (voidContainer && stackInner) {
        const originY = scroll + containerHeight / 2 - stackInnerTop;
        stackInner.style.perspectiveOrigin = \`50% \${originY}px\`;
        stackInner.style.perspective = "1500px";

        if (voidProgress > 0) {
          if (isMobile) {
            const fadeOutProgress = Math.min(voidProgress / 0.25, 1);
            const currentOpacity = 1 - fadeOutProgress;

            voidContainer.style.transformOrigin = \`50% \${originY}px\`;
            voidContainer.style.transform = \`translate3d(0, 0, 0) scale(1)\`;
            voidContainer.style.opacity = Math.max(0, currentOpacity).toFixed(3);
            voidContainer.style.visibility = currentOpacity <= 0 ? "hidden" : "visible";
          } else {
            const easeScale = Math.pow(voidProgress, 1.5);
            const currentZ = -easeScale * 3000;
            const currentScale = 1 - easeScale;
            const currentOpacity = 1 - Math.pow(voidProgress, 2.5);

            voidContainer.style.transformOrigin = \`50% \${originY}px\`;
            voidContainer.style.transform = \`translate3d(0, 0, \${currentZ}px) scale(\${Math.max(0, currentScale).toFixed(4)})\`;
            voidContainer.style.opacity = Math.max(0, currentOpacity).toFixed(3);
            voidContainer.style.visibility = currentOpacity <= 0 ? "hidden" : "visible";
          }
        } else {
          voidContainer.style.transformOrigin = "";
          voidContainer.style.transform = "";
          voidContainer.style.opacity = "1";
          voidContainer.style.visibility = "visible";
        }
      }

      const thread = threadPathRef.current;
      const threadLen = threadLenRef.current;

      if (thread && threadLen > 0 && isMobile) {
        let drawP = 0;
        if (voidProgress > 0.2) {
          drawP = (voidProgress - 0.2) / 0.8;
        }
        drawP = Math.min(Math.max(drawP, 0), 1);
        thread.style.strokeDasharray = \`\${threadLen}\`;
        thread.style.strokeDashoffset = \`\${(threadLen * (1 - drawP)).toFixed(2)}\`;

        // Flashlight Typography Animation
        const animateText = (ref: React.RefObject<SVGTextElement>, targetP: number) => {
          if (!ref.current) return;
          const threshold = 0.15; // Width of the "flashlight" beam
          const dist = Math.abs(drawP - targetP);
          let intensity = 0;

          if (dist < threshold) {
            intensity = 1 - dist / threshold; // Scales from 0 to 1 based on proximity
          }

          const opacity = 0.3 + 0.7 * intensity; // Base 30% opacity, flares to 100%
          const scale = 1 + 0.05 * intensity; // Slight pop in size

          ref.current.style.opacity = opacity.toFixed(2);
          ref.current.style.transform = \`scale(\${scale})\`;
          ref.current.style.transformOrigin = "center";
          ref.current.style.transformBox = "fill-box";
        };

        animateText(textAnalyzeRef, 0.04);
        animateText(textDesignRef, 0.2);
        animateText(textBuildRef, 0.4);
        animateText(textDeliverRef, 0.6);
      }

      const kineticWheel = kineticWheelRef.current;
      if (kineticWheel) {
        if (scroll > endElementTop + containerHeight * 1.2 + containerHeight * 0.2) {
          kineticWheel.style.display = "none";
          kineticWheel.style.visibility = "hidden";
        } else if (voidProgress > 0) {
          kineticWheel.style.display = "block";
          kineticWheel.style.visibility = "visible";

          if (isMobile) {
            let figOpacity = 0;
            if (voidProgress <= 0.25) {
              figOpacity = 0.5 * (voidProgress / 0.25);
            } else if (voidProgress <= 0.5) {
              figOpacity = 0.5 + 0.5 * ((voidProgress - 0.25) / 0.25);
            } else {
              figOpacity = 1;
            }

            kineticWheel.style.opacity = figOpacity.toFixed(3);
            kineticWheel.style.transform = \`translate3d(0, 0, 0)\`;

            if (figureGroupRef.current) {
              if (voidProgress >= 0.8) {
                const textFade = 1 - (voidProgress - 0.8) / 0.2;
                figureGroupRef.current.style.opacity = Math.max(0, textFade).toFixed(3);
              } else {
                figureGroupRef.current.style.opacity = "1";
              }
            }
          } else {
            kineticWheel.style.opacity = Math.min(voidProgress * 4, 1).toFixed(3);
            const targetRotation = 180 * (1 - voidProgress);
            kineticWheel.style.transformOrigin = "50% 100%";
            kineticWheel.style.transform = \`rotate(\${targetRotation}deg)\`;
          }
        } else {
          kineticWheel.style.display = "block";
          kineticWheel.style.opacity = "0";
          kineticWheel.style.visibility = "hidden";
          if (isMobile) {
            kineticWheel.style.transform = \`translate3d(0, 0, 0)\`;
            if (figureGroupRef.current) figureGroupRef.current.style.opacity = "1";
          } else {
            kineticWheel.style.transform = "rotate(180deg)";
          }
        }
      }
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [ready, isMobile]);

  return (
    <section 
      data-lenis-prevent
      className="portfolio-scroll-container w-full h-full overflow-y-auto scroll-smooth bg-black text-white font-sans relative"
    >
      <div className="w-full h-[25vh] md:h-[25vh] lg:h-[70vh] border-b border-white/20 overflow-hidden flex items-center relative z-10 bg-black">
        <div className="marquee-selected-works">
          <div className="marquee-selected-works__track">
            {[0, 1, 2, 3].map((blockIndex) => (
              <div
                key={blockIndex}
                className="marquee-selected-works__segment"
                aria-hidden={blockIndex > 0 ? "true" : undefined}
              >
                <span className="marquee-selected-works__text">Selected Works</span>
                <span className="marquee-selected-works__dash">—</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={stackInnerRef}
        className="scroll-stack-inner px-6 md:px-12 lg:px-16"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          ref={voidContainerRef}
          className="void-container relative w-full flex flex-col items-center justify-center"
          style={{ willChange: "transform, opacity", transformStyle: "preserve-3d" }}
        >
          {projects.map((project, index) => (
            <ScrollStackCard key={project.id} project={project} index={index} />
          ))}
        </div>
        <div className="scroll-stack-end pointer-events-none h-[120vh]" />
      </div>

      <div
        ref={kineticWheelRef}
        className="kinetic-wheel pointer-events-none"
        style={{
          position: "fixed",
          top: isMobile ? "50%" : "auto",
          bottom: isMobile ? "auto" : "-18vh",
          left: "0",
          width: "100vw",
          height: isMobile ? "100vw" : "auto",
          marginTop: isMobile ? "calc(-50vw)" : "0",
          zIndex: 0,
          visibility: "hidden",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      >
        {isMobile ? (
          <svg viewBox="0 0 1500 2000" className="w-full h-full" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="15%" stopColor="rgba(255,255,255,0.7)" />
                <stop offset="85%" stopColor="rgba(255,255,255,0.7)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              ref={threadPathRef}
              d="M 750,0 L 750,250 C 750,550 250,500 250,800 C 250,1100 1250,1050 1250,1350 C 1250,1650 750,1600 750,1900 L 750,3000"
              fill="none"
              stroke="url(#line-gradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <g ref={figureGroupRef}>
              <text
                ref={textAnalyzeRef}
                x="750"
                y="150"
                fill="#ffffff"
                style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: "100px", opacity: 0.3 }}
                textAnchor="middle"
                dy=".3em"
              >
                ANALYZE
              </text>
              <circle cx="750" cy="250" r="15" fill="#ffffff" filter="url(#glow)" />

              <text
                ref={textDesignRef}
                x="250"
                y="700"
                fill="#ffffff"
                style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: "100px", opacity: 0.3 }}
                textAnchor="middle"
                dy=".3em"
              >
                DESIGN
              </text>
              <circle cx="250" cy="800" r="15" fill="#ffffff" filter="url(#glow)" />

              <text
                ref={textBuildRef}
                x="1250"
                y="1250"
                fill="#ffffff"
                style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: "100px", opacity: 0.3 }}
                textAnchor="middle"
                dy=".3em"
              >
                BUILD
              </text>
              <circle cx="1250" cy="1350" r="15" fill="#ffffff" filter="url(#glow)" />

              <text
                ref={textDeliverRef}
                x="750"
                y="1800"
                fill="#ffffff"
                style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: "100px", opacity: 0.3 }}
                textAnchor="middle"
                dy=".3em"
              >
                DELIVER
              </text>
              <circle cx="750" cy="1900" r="20" fill="#ffffff" filter="url(#glow)" />
            </g>
          </svg>
        ) : (
          <svg viewBox="0 0 3000 1500" className="w-full h-auto" style={{ overflow: "visible" }}>
            <path id="arc-path" d="M 400,1500 A 1100,1100 0 0,1 2600,1500" fill="none" stroke="none" />
            {[
              { text: "ANALYZE", offset: "15%" },
              { text: "●", offset: "27%" },
              { text: "DESIGN", offset: "38%" },
              { text: "●", offset: "50%" },
              { text: "BUILD", offset: "62%" },
              { text: "●", offset: "73%" },
              { text: "DELIVER", offset: "85%" },
            ].map((item, i) => (
              <text
                key={i}
                fill="#ffffff"
                style={{
                  fontFamily: "sans-serif",
                  fontWeight: 800,
                  fontSize: item.text === "●" ? "50px" : "100px",
                  textTransform: "uppercase",
                }}
                dy={item.text === "●" ? "-18" : "0"}
              >
                <textPath href="#arc-path" startOffset={item.offset} textAnchor="middle">
                  {item.text}
                </textPath>
              </text>
            ))}
          </svg>
        )}
      </div>
    </section>
  );
};

export default PortfolioScroll;


/* ── PortfolioScroll.css ── */
/* ========== MARQUEE - Pure CSS GPU Animation ========== */
@keyframes marquee-scroll {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}

.marquee-selected-works {
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.marquee-selected-works__track {
  display: flex;
  white-space: nowrap;
  align-items: center;
  animation: marquee-scroll 25s linear infinite;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.marquee-selected-works__segment {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.marquee-selected-works__text {
  font-size: clamp(2rem, 8vw, 6.5rem);
  font-weight: 500;
  line-height: 0.8;
  letter-spacing: -0.05em;
  color: #fff;
}

.marquee-selected-works__dash {
  font-size: clamp(2rem, 8vw, 6.5rem);
  font-weight: 300;
  margin: 0 3vw;
  transform: translateY(-2px);
  color: #fff;
}

@media (max-width: 1023px) {
  .marquee-selected-works__track {
    animation-duration: 10s;
  }
}

/* ========== END MARQUEE ========== */

/* ========== STAR BORDER STYLING ========== */
.star-border-container {
  display: inline-block;
  position: relative;
  border-radius: 60px;
  overflow: hidden;
  padding: 2.5px;
}

.border-gradient-full {
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  z-index: 0;
  animation: star-rotate linear infinite;
  filter: blur(8px);
}

.inner-content {
  position: relative;
  background: #000;
  border-radius: 58px;
  width: 100%;
  height: 100%;
  z-index: 1;
}

@keyframes star-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
/* ========== END STAR BORDER ========== */

.portfolio-scroll-container {
  background-color: #000;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.portfolio-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.portfolio-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.portfolio-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 99px;
}

.scroll-stack-inner {
  padding: clamp(2rem, 6vh, 4rem) 0 clamp(10rem, 30vh, 20rem);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scroll-stack-card {
  width: 92%;
  max-width: 1200px;
  height: auto;
  max-height: 78vh;
  margin-bottom: 2rem;
  background: transparent !important;
  border: none !important;
  border-radius: 60px;
  display: block;
  position: relative;
}

.scroll-stack-card > .inner-content {
  background-color: #000 !important;
  border-radius: 60px !important;
  padding: 2.5rem !important;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
}

.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.id-brand-group {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.huge-number {
  font-family: 'Inter', sans-serif;
  font-size: 5rem;
  font-weight: 900;
  line-height: 0.8;
  color: #fff;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 1.2rem;
  text-transform: uppercase;
  color: #fff;
  font-weight: 900;
  letter-spacing: 0.02em;
  display: block;
}

.client-name {
  font-size: 0.85rem;
  color: #ffffff;
  font-weight: 500;
  opacity: 0.95;
}

.live-btn-star {
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.live-btn-star:hover {
  transform: scale(1.05);
}

.live-btn-star > .inner-content {
  background: #000 !important;
  border-radius: 100px !important;
  padding: 0.8rem 2rem !important;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  text-align: center;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
  height: min(350px, 40vh);
  flex: 1;
  align-items: stretch;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 40px;
}

.project-description {
  display: flex;
  align-items: center;
  padding: 1.5rem;
}

.project-description p {
  font-size: 1.3rem;
  line-height: 1.7;
  color: #f8f8f8;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .project-description p {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .card-top-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .id-brand-group {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .huge-number {
    font-size: 3rem;
  }

  .label {
    font-size: 1rem;
  }

  .live-btn-star {
    align-self: flex-start;
  }

  .content-grid {
    grid-template-columns: 1fr;
    height: auto;
    gap: 1rem;
  }

  .main-image {
    height: 200px;
    border-radius: 24px;
  }

  .project-description {
    padding: 0.5rem 0;
  }

  .project-description p {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .scroll-stack-card {
    border-radius: 30px;
  }

  .scroll-stack-card > .inner-content {
    border-radius: 30px !important;
    padding: 1.5rem !important;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .huge-number {
    font-size: 2.5rem;
  }

  .label {
    font-size: 0.9rem;
  }

  .client-name {
    font-size: 0.75rem;
  }

  .live-btn-star > .inner-content {
    padding: 0.6rem 1.5rem !important;
    font-size: 0.7rem;
  }

  .main-image {
    height: 180px;
  }

  .project-description p {
    font-size: 0.85rem;
  }

  .scroll-stack-card > .inner-content {
    padding: 1rem !important;
  }
}
`,

  'svg-page-transition': `import React, { useRef, useState, useEffect } from 'react';
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
      p1.style.strokeDasharray = \`\${len1}\`;
      p1.style.strokeDashoffset = \`\${len1}\`;

      p2.style.strokeDasharray = \`\${len2}\`;
      p2.style.strokeDashoffset = \`\${len2}\`;
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
                className={\`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 \${
                  currentPage === page
                    ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                }\`}
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
`,

  'liquid-glass': `import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { SocialTooltipButtons } from './SocialTooltipButtons';
export { SocialTooltipButtons };
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import {
    Cloud,
    CloudSun,
    CloudRain,
    Sun,
    MapPin,
    CloudSunRain,
    Zap,
    Sparkles,
    Crown,
    ChevronLeft,
    ChevronRight,
    MoveUpRight as ArrowIcon
} from 'lucide-react';
import { PaymentTransactionButton as PaymentTransactionButtonUI } from '../ui/payment-transaction-button';
import { MagicCard as MagicCardUI } from '../ui/magic-card';
import { RainbowButton as RainbowButtonUI } from '../ui/rainbow-button';
import { OrbitButton as OrbitButtonUI } from '../ui/OrbitButton';
import { GalaxyButton as GalaxyButtonUI } from '../ui/GalaxyButton';
import { LiquidFillButton as LiquidFillButtonUI } from '../ui/LiquidFillButton';
import { NeonFlickerButton as NeonFlickerButtonUI } from '../ui/NeonFlickerButton';
import { Robot3DBackground as Robot3DBackgroundUI } from '../ui/Robot3DBackground';

export { OrbitButtonUI as OrbitButton };
export { GalaxyButtonUI as GalaxyButton };
export { LiquidFillButtonUI as LiquidFillButton };
export { NeonFlickerButtonUI as NeonFlickerButton };
export { Robot3DBackgroundUI as Robot3DBackground };

// 1. Liquid-Glass (Weather Dashboard Example)
export interface LiquidGlassProps {
    backgroundImage?: string;
    location?: string;
    temp?: string;
    className?: string;
}

export const LiquidGlass = ({
    backgroundImage = "url('https://images.unsplash.com/photo-1590867286251-8e26d9f255c0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    location = "Surat",
    temp = "+18°C",
    className = ""
}: LiquidGlassProps) => {
    return (
        <div
            className={cn('p-4 relative z-30 w-full max-w-2xl gap-8 py-8 rounded-xl overflow-hidden', className)}
            style={{
                background: \`\${backgroundImage} center / cover no-repeat\`,
            }}
        >
            <div className='grid w-full grid-cols-2 gap-4 mx-auto'>
                {/* Hourly Forecast Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='col-span-2 p-6 text-white bg-white/5'
                >
                    <div className='flex justify-between relative z-30 text-sm font-medium'>
                        <div className='flex flex-col items-center gap-2'>
                            <span>16:00</span>
                            <Cloud className='h-6 w-6 fill-white' />
                            <span>+18°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>17:00</span>
                            <Cloud className='h-6 w-6 fill-white' />
                            <span>+18°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>18:00</span>
                            <CloudRain className='h-6 w-6' />
                            <span>+16°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>19:00</span>
                            <CloudRain className='h-6 w-6' />
                            <span>+14°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>20:00</span>
                            <CloudSun className='h-6 w-6 fill-white' />
                            <span>+15°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>21:00</span>
                            <CloudSunRain className='h-6 w-6' />
                            <span>+14°</span>
                        </div>
                    </div>
                </LiquidGlassCard>

                {/* Current Weather Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='rounded-3xl p-6 text-white bg-white/5 '
                >
                    <div className='relative z-30 flex flex-col items-start justify-center h-full w-full'>
                        <div className='text-4xl font-semibold'>{temp}</div>
                        <div className='text-sm opacity-70'>Cloudy {temp}/+5°</div>
                    </div>
                </LiquidGlassCard>

                {/* Time and Location Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='rounded-3xl p-6 text-white bg-white/5'
                >
                    <div className='relative z-30 flex flex-col items-start justify-center h-full w-full'>
                        <div className='text-4xl font-semibold'>17:32</div>
                        <div className='text-sm opacity-70'>Sun, Nov 19</div>
                        <button className='mt-2 inline-flex items-center gap-1 rounded-full bg-black/20 backdrop-blur-xl px-2 py-0.5 text-xs font-medium'>
                            <MapPin className='h-3 w-3' />
                            {location}
                        </button>
                    </div>
                </LiquidGlassCard>

                {/* Daily Forecast Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='col-span-2 rounded-3xl bg-white/5 p-6 text-white'
                >
                    <div className='relative z-30 flex flex-col gap-3 h-full w-full'>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <Sun className='h-5 w-5 fill-white' />
                                <span>Tue, 7 Sep</span>
                            </div>
                            <span className='font-medium'>+18°/+4°</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <Cloud className='h-5 w-5 fill-white' />
                                <span>Wed, 8 Sep</span>
                            </div>
                            <span className='font-medium'>+20°/+6°</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <CloudRain className='h-5 w-5' />
                                <span>Thu, 9 Sep</span>
                            </div>
                            <span className='font-medium'>+17°/+3°</span>
                        </div>
                    </div>
                </LiquidGlassCard>
            </div>
        </div>
    );
};







// 5. Spotlight Cards
export interface SpotlightCardsProps {
    className?: string;
    defaultCardColors?: string[];
    title?: string;
    description?: string;
}

export const SpotlightCards = ({
    className = "",
    defaultCardColors = ['#10b981', '#6366f1', '#f59e0b'],
    title = "Platform Features",
    description = "Discover the power of our high-performance component library."
}: SpotlightCardsProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Playground State
    const [cardColors, setCardColors] = useState(defaultCardColors);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Account for CSS scaling (essential for library previews)
        const scaleX = containerRef.current.offsetWidth / rect.width;
        const scaleY = containerRef.current.offsetHeight / rect.height;
        
        setMousePos({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        });
    };

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -350, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 350, behavior: 'smooth' });
    };

    const cards = [
        {
            title: "Performance",
            text: "Lightning-fast components built for modern web applications.",
            icon: Zap,
            hex: cardColors[0] + "66",
            accent: cardColors[0],
            bg: cardColors[0] + "1a",
            bullets: ["Optimized rendering", "Minimal bundle size"]
        },
        {
            title: "Design",
            text: "Beautiful, accessible components with smooth animations.",
            icon: Sparkles,
            hex: cardColors[1] + "66",
            accent: cardColors[1],
            bg: cardColors[1] + "1a",
            bullets: ["Elegant animations", "Accessibility first"]
        },
        {
            title: "Premium",
            text: "Enterprise-grade components with advanced features.",
            icon: Crown,
            hex: cardColors[2] + "66",
            accent: cardColors[2],
            bg: cardColors[2] + "1a",
            bullets: ["Enterprise support", "Advanced features"]
        },
    ];

    return (
        <div className="flex flex-col items-center w-full relative z-30">
            {/* Live Playground Controls */}
            <div className="w-full max-w-5xl mb-8 p-8 rounded-[2rem] bg-neutral-900 border border-white/5 backdrop-blur-sm shadow-xl">
                <div className="flex flex-col gap-6">
                    <h3 className="text-2xl font-display font-bold text-white tracking-tight">Live Playground</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((num, i) => (
                            <div key={num} className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/50">Card {num} Glow Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={cardColors[i]}
                                        onChange={e => {
                                            const newColors = [...cardColors];
                                            newColors[i] = e.target.value;
                                            setCardColors(newColors);
                                        }}
                                        className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={cardColors[i]}
                                        onChange={e => {
                                            const newColors = [...cardColors];
                                            newColors[i] = e.target.value;
                                            setCardColors(newColors);
                                        }}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white w-full font-mono focus:outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full max-w-5xl relative group"
            >
                {/* Arrows */}
                <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={24} />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-6 p-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden scroll-smooth"
                >
                    {cards.map((card, i) => (
                        <CardItem 
                            key={i} 
                            card={card} 
                            globalMousePos={mousePos} 
                            isParentHovered={isHovered}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Internal Helper Card Component for 100% Alignment Consistency
const CardItem: React.FC<{ 
    card: any; 
    globalMousePos: { x: number; y: number }; 
    isParentHovered: boolean;
}> = ({ card, globalMousePos, isParentHovered }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [localMousePos, setLocalMousePos] = useState({ x: -1000, y: -1000 });

    useEffect(() => {
        if (!cardRef.current) return;
        const updateLocalPos = () => {
            if (!cardRef.current) return;
            const cardRect = cardRef.current.getBoundingClientRect();
            const containerRect = cardRef.current.closest('.group')?.getBoundingClientRect();
            if (containerRect) {
                setLocalMousePos({
                    x: globalMousePos.x - (cardRect.left - containerRect.left),
                    y: globalMousePos.y - (cardRect.top - containerRect.top)
                });
            }
        };
        updateLocalPos();
    }, [globalMousePos]);

    const CardInner = ({ highlighted = false }: { highlighted?: boolean }) => (
        <div className={cn("relative z-20 flex flex-col h-full", highlighted ? "pointer-events-none" : "")}>
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5" style={{ backgroundColor: card.bg }}>
                    <card.icon size={24} style={{ color: card.accent }} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">UILAYOUT</span>
            </div>

            <h3 className={cn("text-3xl font-display font-black mb-3 tracking-tight transition-colors", 
                highlighted ? "text-white" : "text-white/30 group-hover/card:text-white/40")}>
                {card.title}
            </h3>
            <p className={cn("text-sm leading-relaxed mb-6 font-medium transition-colors", 
                highlighted ? "text-white/90" : "text-white/20 group-hover/card:text-white/30")}>
                {card.text}
            </p>

            <ul className="mt-auto space-y-3">
                {card.bullets.map((bullet: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-xs font-medium">
                        <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center">
                            <div className={cn("w-1.5 h-1.5 rounded-full", highlighted ? "bg-white/80" : "bg-white/10")} />
                        </div>
                        <span className={highlighted ? "text-white/80" : "text-white/20"}>{bullet}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div ref={cardRef} className="relative flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[350px] snap-center p-8 rounded-[2.5rem] bg-neutral-900 border border-white/5 overflow-hidden group/card shadow-xl transition-all duration-400 ease-out">
            <CardInner />
            <div 
                className="absolute inset-0 transition-opacity duration-500 z-10"
                style={{
                    opacity: isParentHovered ? 1 : 0,
                    WebkitMaskImage: \`radial-gradient(circle 35rem at \${localMousePos.x}px \${localMousePos.y}px, black 0%, transparent 70%)\`,
                    maskImage: \`radial-gradient(circle 35rem at \${localMousePos.x}px \${localMousePos.y}px, black 0%, transparent 70%)\`,
                    backgroundColor: \`\${card.accent}10\`,
                    padding: '2rem',
                    border: \`1px solid \${card.accent}\`,
                    borderRadius: '2.5rem',
                }}
            >
                <CardInner highlighted />
            </div>
            {/* Ambient Base Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 opacity-30 group-hover/card:opacity-80 transition-opacity pointer-events-none" style={{ background: \`radial-gradient(ellipse at bottom, \${card.hex} 0%, transparent 60%)\` }} />
        </div>
    );
};

// 6. Image Reveal
// 6. Image Reveal
interface VisualItem {
    key: number;
    url: string;
    label: string;
}
const visualData: VisualItem[] = [
    {
        key: 1,
        url: "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
        label: "Pinky Island",
    },
    {
        key: 2,
        url: "https://images.pexels.com/photos/31622979/pexels-photo-31622979.jpeg",
        label: "Greedy Model",
    },
    {
        key: 3,
        url: "https://images.pexels.com/photos/12187128/pexels-photo-12187128.jpeg",
        label: "Sigma Connect",
    },
    {
        key: 4,
        url: "https://images.pexels.com/photos/28168248/pexels-photo-28168248.jpeg",
        label: "Futuristic Gamma",
    },
];

export interface ImageRevealProps {
    items?: VisualItem[];
    className?: string;
}

export const ImageReveal = ({
    items = visualData,
    hoverText = "REVEAL",
    className = ""
}: ImageRevealProps & { hoverText?: string }) => {
    const [focusedItem, setFocusedItem] = useState<VisualItem | null>(null);
    const [isLargeScreen, setIsLargeScreen] = useState(true);

    const cursorX = useMotionValue(0);
    const cursorY = useSpring(cursorX, { stiffness: 300, damping: 40 });
    const smoothX = useSpring(cursorX, { stiffness: 300, damping: 40 });
    const smoothY = useSpring(cursorY, { stiffness: 300, damping: 40 });

    useEffect(() => {
        const updateScreen = () => {
            setIsLargeScreen(window.innerWidth >= 768);
        };
        updateScreen();
        window.addEventListener("resize", updateScreen);
        return () => window.removeEventListener("resize", updateScreen);
    }, []);

    const onMouseTrack = (e: React.MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
    };

    const onHoverActivate = (item: VisualItem) => {
        setFocusedItem(item);
    };

    const onHoverDeactivate = () => {
        setFocusedItem(null);
    };

    return (
        <div
            className={cn("relative mx-auto w-full max-w-2xl min-h-fit bg-neutral-950 rounded-xl border border-white/10 overflow-hidden", className)}
            onMouseMove={onMouseTrack}
            onMouseLeave={onHoverDeactivate}
        >
            {items.map((item) => (
                <div
                    key={item.key}
                    className="p-6 cursor-pointer relative sm:flex items-center justify-between border-b border-white/5 last:border-0"
                    onMouseEnter={() => onHoverActivate(item)}
                >
                    {!isLargeScreen && (
                        <img
                            src={item.url}
                            className="sm:w-32 sm:h-20 w-full h-52 object-cover rounded-md mb-4"
                            alt={item.label}
                        />
                    )}
                    <h2
                        className={\`font-display uppercase md:text-5xl sm:text-2xl text-xl font-bold sm:py-6 py-2 leading-[100%] relative transition-colors duration-300 \${focusedItem?.key === item.key
                            ? "mix-blend-difference z-20 text-white"
                            : "text-white/60"
                            }\`}
                    >
                        {item.label}
                    </h2>
                    <button
                        className={\`sm:block hidden p-4 rounded-full transition-all duration-300 ease-out border border-transparent \${focusedItem?.key === item.key
                            ? "mix-blend-difference z-20 bg-white text-black border-white"
                            : "text-white/20 border-white/10"
                            }\`}
                    >
                        <ArrowIcon className="w-8 h-8" />
                    </button>
                    <div
                        className={\`h-[2px] bg-white absolute bottom-0 left-0 transition-all duration-300 ease-linear \${focusedItem?.key === item.key ? "w-full" : "w-0"
                            }\`}
                    />
                </div>
            ))}

            {isLargeScreen && focusedItem && (
                <motion.img
                    src={focusedItem.url}
                    alt={focusedItem.label}
                    className="fixed z-30 object-cover w-[300px] h-[400px] rounded-2xl pointer-events-none shadow-2xl bg-neutral-900 border border-white/10"
                    style={{
                        left: smoothX,
                        top: smoothY,
                        x: "-50%",
                        y: "-50%",
                    }}
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </div>
    );
};





// 10. Hacker Background (Matrix Rain)
export interface HackerBackgroundProps {
    color?: string;
    fontSize?: number;
    className?: string;
    speed?: number;
}

export const HackerBackground = ({
    color = '#0F0',
    fontSize = 15,
    className = "",
    speed = 1
}: HackerBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.parentElement?.clientWidth || 400;
        let height = canvas.height = canvas.parentElement?.clientHeight || 400;

        const columns = Math.floor(width / 20);
        const drops: number[] = new Array(columns).fill(1);
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\$+-*/=%\\"'#&_(),.;:?!\\\\|{ }<>[]^~";

        let animationFrameId: number;

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = color;
            ctx.font = \`\${fontSize}px monospace\`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);

                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += speed;
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = canvas.width = canvas.parentElement?.clientWidth || 400;
            height = canvas.height = canvas.parentElement?.clientHeight || 400;
        };

        window.addEventListener('resize', handleResize);
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={cn("w-full h-full bg-black relative overflow-hidden", className)}>
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
};



export { default as BeamGridBackground } from '../ui/BeamGridBackground';

export { default as FallBeamBackground } from '../ui/FallBeamBackground';
export { default as HellBackground } from '../ui/HellBackground';
export { default as InteractiveGridBackground } from '../ui/InteractiveGridBackground';
export { default as ParticlesBackground } from '../ui/ParticlesBackground';
export { default as WaveBackground } from '../ui/WaveBackground';
export { default as LinesBackground } from '../ui/background-paths';
export { default as SparklesBackground } from '../ui/sparkles-background';
export { IsometricGridBackground } from '../ui/isometric-grid-background';

// Button Previews
import { BorderBeam as BorderBeamUI } from '../ui/border-beam';

export const GlowButton = () => {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div className="flex items-center justify-center p-8 bg-neutral-950 rounded-[3rem] border border-white/5 w-full h-80 relative overflow-hidden group/container">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
            
            <button
                ref={buttonRef}
                onMouseMove={handleMouseMove}
                className="relative px-10 py-4 rounded-2xl bg-neutral-900 border border-emerald-500/30 text-emerald-400 font-display font-black uppercase tracking-[0.2em] text-sm transition-all duration-500 hover:scale-105 hover:border-emerald-400 isolation-auto group"
                style={{
                    boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(16,185,129,0.05)',
                }}
            >
                {/* Interactive Surface Light */}
                <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{
                        background: \`radial-gradient(circle at \${mousePos.x}% \${mousePos.y}%, rgba(16,185,129,0.2) 0%, transparent 60%)\`,
                    }}
                />

                {/* Primary Neon Glow (Edge) */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-sm pointer-events-none" />

                {/* Volumetric Outer Glow */}
                <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none blur-2xl"
                    style={{
                        background: \`radial-gradient(circle at \${mousePos.x}% \${mousePos.y}%, rgba(16,185,129,0.4) 0%, transparent 70%)\`,
                    }}
                />

                <span className="relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:text-white transition-colors duration-300">
                    Glow Button
                </span>

                {/* Subtle Inner Highlight */}
                <div className="absolute inset-0 rounded-2xl border border-white/10 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>

            {/* Floating Particle Orbs for additional atmosphere */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/10 blur-[80px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-teal-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
        </div>
    );
};

export const BorderBeam = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <button className="relative px-8 py-3 rounded-xl bg-black text-white font-bold tracking-widest uppercase overflow-hidden transition-all hover:bg-neutral-900">
            Border Beam
            <BorderBeamUI size={100} duration={8} delay={0} colorFrom="#ffaa40" colorTo="#9c40ff" beamBorderRadius={12} borderThickness={2} />
        </button>
    </div>
);

import { ShatterButton as ShatterButtonUI } from '../ui/shatter-button';

export const ShatterButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <ShatterButtonUI shatterColor="#00ffff" shardCount={30}>
            Click Now
        </ShatterButtonUI>
    </div>
);

import { CornerBorderButton as CornerBorderButtonUI } from '../ui/corner-border-button';

export const CornerBorderButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <CornerBorderButtonUI baseColor="#0b1a2a" hoverColor="#ff3b4d" borderColor="#60daff">
            BUTTON
        </CornerBorderButtonUI>
    </div>
);

import { MarqueeHoverButton as MarqueeHoverButtonUI } from '../ui/marquee-hover-button';

export const MarqueeHoverButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <MarqueeHoverButtonUI label="Hover Me" />
    </div>
);

export const PaymentTransactionButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-full min-h-[300px]">
        <PaymentTransactionButtonUI label="Send Payment" accentColor="#38bdf8" currencySymbol="€" />
    </div>
);

export const MagicCardEffect = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-full min-h-[400px]">
        <MagicCardUI
            className="flex flex-col items-center justify-center cursor-pointer shadow-2xl bg-neutral-900/80 border-white/10"
            gradientColor="rgba(255, 255, 255, 0.15)"
            gradientFrom="#38bdf8"
            gradientTo="#818cf8"
            gradientSize={300}
        >
            <div className="p-16 flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                    <Sparkles className="text-white w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-4xl font-display font-bold text-white tracking-tight mb-2">Magic Card</h3>
                    <p className="text-white/60 text-base font-medium">Move your mouse to reveal the glow</p>
                </div>
            </div>
        </MagicCardUI>
    </div>
);

export const RainbowButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <RainbowButtonUI>Rainbow Button</RainbowButtonUI>
    </div>
);

`,

  'spotlight-cards': `import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { SocialTooltipButtons } from './SocialTooltipButtons';
export { SocialTooltipButtons };
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import {
    Cloud,
    CloudSun,
    CloudRain,
    Sun,
    MapPin,
    CloudSunRain,
    Zap,
    Sparkles,
    Crown,
    ChevronLeft,
    ChevronRight,
    MoveUpRight as ArrowIcon
} from 'lucide-react';
import { PaymentTransactionButton as PaymentTransactionButtonUI } from '../ui/payment-transaction-button';
import { MagicCard as MagicCardUI } from '../ui/magic-card';
import { RainbowButton as RainbowButtonUI } from '../ui/rainbow-button';
import { OrbitButton as OrbitButtonUI } from '../ui/OrbitButton';
import { GalaxyButton as GalaxyButtonUI } from '../ui/GalaxyButton';
import { LiquidFillButton as LiquidFillButtonUI } from '../ui/LiquidFillButton';
import { NeonFlickerButton as NeonFlickerButtonUI } from '../ui/NeonFlickerButton';
import { Robot3DBackground as Robot3DBackgroundUI } from '../ui/Robot3DBackground';

export { OrbitButtonUI as OrbitButton };
export { GalaxyButtonUI as GalaxyButton };
export { LiquidFillButtonUI as LiquidFillButton };
export { NeonFlickerButtonUI as NeonFlickerButton };
export { Robot3DBackgroundUI as Robot3DBackground };

// 1. Liquid-Glass (Weather Dashboard Example)
export interface LiquidGlassProps {
    backgroundImage?: string;
    location?: string;
    temp?: string;
    className?: string;
}

export const LiquidGlass = ({
    backgroundImage = "url('https://images.unsplash.com/photo-1590867286251-8e26d9f255c0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    location = "Surat",
    temp = "+18°C",
    className = ""
}: LiquidGlassProps) => {
    return (
        <div
            className={cn('p-4 relative z-30 w-full max-w-2xl gap-8 py-8 rounded-xl overflow-hidden', className)}
            style={{
                background: \`\${backgroundImage} center / cover no-repeat\`,
            }}
        >
            <div className='grid w-full grid-cols-2 gap-4 mx-auto'>
                {/* Hourly Forecast Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='col-span-2 p-6 text-white bg-white/5'
                >
                    <div className='flex justify-between relative z-30 text-sm font-medium'>
                        <div className='flex flex-col items-center gap-2'>
                            <span>16:00</span>
                            <Cloud className='h-6 w-6 fill-white' />
                            <span>+18°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>17:00</span>
                            <Cloud className='h-6 w-6 fill-white' />
                            <span>+18°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>18:00</span>
                            <CloudRain className='h-6 w-6' />
                            <span>+16°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>19:00</span>
                            <CloudRain className='h-6 w-6' />
                            <span>+14°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>20:00</span>
                            <CloudSun className='h-6 w-6 fill-white' />
                            <span>+15°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>21:00</span>
                            <CloudSunRain className='h-6 w-6' />
                            <span>+14°</span>
                        </div>
                    </div>
                </LiquidGlassCard>

                {/* Current Weather Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='rounded-3xl p-6 text-white bg-white/5 '
                >
                    <div className='relative z-30 flex flex-col items-start justify-center h-full w-full'>
                        <div className='text-4xl font-semibold'>{temp}</div>
                        <div className='text-sm opacity-70'>Cloudy {temp}/+5°</div>
                    </div>
                </LiquidGlassCard>

                {/* Time and Location Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='rounded-3xl p-6 text-white bg-white/5'
                >
                    <div className='relative z-30 flex flex-col items-start justify-center h-full w-full'>
                        <div className='text-4xl font-semibold'>17:32</div>
                        <div className='text-sm opacity-70'>Sun, Nov 19</div>
                        <button className='mt-2 inline-flex items-center gap-1 rounded-full bg-black/20 backdrop-blur-xl px-2 py-0.5 text-xs font-medium'>
                            <MapPin className='h-3 w-3' />
                            {location}
                        </button>
                    </div>
                </LiquidGlassCard>

                {/* Daily Forecast Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='col-span-2 rounded-3xl bg-white/5 p-6 text-white'
                >
                    <div className='relative z-30 flex flex-col gap-3 h-full w-full'>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <Sun className='h-5 w-5 fill-white' />
                                <span>Tue, 7 Sep</span>
                            </div>
                            <span className='font-medium'>+18°/+4°</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <Cloud className='h-5 w-5 fill-white' />
                                <span>Wed, 8 Sep</span>
                            </div>
                            <span className='font-medium'>+20°/+6°</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <CloudRain className='h-5 w-5' />
                                <span>Thu, 9 Sep</span>
                            </div>
                            <span className='font-medium'>+17°/+3°</span>
                        </div>
                    </div>
                </LiquidGlassCard>
            </div>
        </div>
    );
};







// 5. Spotlight Cards
export interface SpotlightCardsProps {
    className?: string;
    defaultCardColors?: string[];
    title?: string;
    description?: string;
}

export const SpotlightCards = ({
    className = "",
    defaultCardColors = ['#10b981', '#6366f1', '#f59e0b'],
    title = "Platform Features",
    description = "Discover the power of our high-performance component library."
}: SpotlightCardsProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Playground State
    const [cardColors, setCardColors] = useState(defaultCardColors);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Account for CSS scaling (essential for library previews)
        const scaleX = containerRef.current.offsetWidth / rect.width;
        const scaleY = containerRef.current.offsetHeight / rect.height;
        
        setMousePos({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        });
    };

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -350, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 350, behavior: 'smooth' });
    };

    const cards = [
        {
            title: "Performance",
            text: "Lightning-fast components built for modern web applications.",
            icon: Zap,
            hex: cardColors[0] + "66",
            accent: cardColors[0],
            bg: cardColors[0] + "1a",
            bullets: ["Optimized rendering", "Minimal bundle size"]
        },
        {
            title: "Design",
            text: "Beautiful, accessible components with smooth animations.",
            icon: Sparkles,
            hex: cardColors[1] + "66",
            accent: cardColors[1],
            bg: cardColors[1] + "1a",
            bullets: ["Elegant animations", "Accessibility first"]
        },
        {
            title: "Premium",
            text: "Enterprise-grade components with advanced features.",
            icon: Crown,
            hex: cardColors[2] + "66",
            accent: cardColors[2],
            bg: cardColors[2] + "1a",
            bullets: ["Enterprise support", "Advanced features"]
        },
    ];

    return (
        <div className="flex flex-col items-center w-full relative z-30">
            {/* Live Playground Controls */}
            <div className="w-full max-w-5xl mb-8 p-8 rounded-[2rem] bg-neutral-900 border border-white/5 backdrop-blur-sm shadow-xl">
                <div className="flex flex-col gap-6">
                    <h3 className="text-2xl font-display font-bold text-white tracking-tight">Live Playground</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((num, i) => (
                            <div key={num} className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/50">Card {num} Glow Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={cardColors[i]}
                                        onChange={e => {
                                            const newColors = [...cardColors];
                                            newColors[i] = e.target.value;
                                            setCardColors(newColors);
                                        }}
                                        className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={cardColors[i]}
                                        onChange={e => {
                                            const newColors = [...cardColors];
                                            newColors[i] = e.target.value;
                                            setCardColors(newColors);
                                        }}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white w-full font-mono focus:outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full max-w-5xl relative group"
            >
                {/* Arrows */}
                <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={24} />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-6 p-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden scroll-smooth"
                >
                    {cards.map((card, i) => (
                        <CardItem 
                            key={i} 
                            card={card} 
                            globalMousePos={mousePos} 
                            isParentHovered={isHovered}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Internal Helper Card Component for 100% Alignment Consistency
const CardItem: React.FC<{ 
    card: any; 
    globalMousePos: { x: number; y: number }; 
    isParentHovered: boolean;
}> = ({ card, globalMousePos, isParentHovered }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [localMousePos, setLocalMousePos] = useState({ x: -1000, y: -1000 });

    useEffect(() => {
        if (!cardRef.current) return;
        const updateLocalPos = () => {
            if (!cardRef.current) return;
            const cardRect = cardRef.current.getBoundingClientRect();
            const containerRect = cardRef.current.closest('.group')?.getBoundingClientRect();
            if (containerRect) {
                setLocalMousePos({
                    x: globalMousePos.x - (cardRect.left - containerRect.left),
                    y: globalMousePos.y - (cardRect.top - containerRect.top)
                });
            }
        };
        updateLocalPos();
    }, [globalMousePos]);

    const CardInner = ({ highlighted = false }: { highlighted?: boolean }) => (
        <div className={cn("relative z-20 flex flex-col h-full", highlighted ? "pointer-events-none" : "")}>
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5" style={{ backgroundColor: card.bg }}>
                    <card.icon size={24} style={{ color: card.accent }} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">UILAYOUT</span>
            </div>

            <h3 className={cn("text-3xl font-display font-black mb-3 tracking-tight transition-colors", 
                highlighted ? "text-white" : "text-white/30 group-hover/card:text-white/40")}>
                {card.title}
            </h3>
            <p className={cn("text-sm leading-relaxed mb-6 font-medium transition-colors", 
                highlighted ? "text-white/90" : "text-white/20 group-hover/card:text-white/30")}>
                {card.text}
            </p>

            <ul className="mt-auto space-y-3">
                {card.bullets.map((bullet: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-xs font-medium">
                        <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center">
                            <div className={cn("w-1.5 h-1.5 rounded-full", highlighted ? "bg-white/80" : "bg-white/10")} />
                        </div>
                        <span className={highlighted ? "text-white/80" : "text-white/20"}>{bullet}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div ref={cardRef} className="relative flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[350px] snap-center p-8 rounded-[2.5rem] bg-neutral-900 border border-white/5 overflow-hidden group/card shadow-xl transition-all duration-400 ease-out">
            <CardInner />
            <div 
                className="absolute inset-0 transition-opacity duration-500 z-10"
                style={{
                    opacity: isParentHovered ? 1 : 0,
                    WebkitMaskImage: \`radial-gradient(circle 35rem at \${localMousePos.x}px \${localMousePos.y}px, black 0%, transparent 70%)\`,
                    maskImage: \`radial-gradient(circle 35rem at \${localMousePos.x}px \${localMousePos.y}px, black 0%, transparent 70%)\`,
                    backgroundColor: \`\${card.accent}10\`,
                    padding: '2rem',
                    border: \`1px solid \${card.accent}\`,
                    borderRadius: '2.5rem',
                }}
            >
                <CardInner highlighted />
            </div>
            {/* Ambient Base Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 opacity-30 group-hover/card:opacity-80 transition-opacity pointer-events-none" style={{ background: \`radial-gradient(ellipse at bottom, \${card.hex} 0%, transparent 60%)\` }} />
        </div>
    );
};

// 6. Image Reveal
// 6. Image Reveal
interface VisualItem {
    key: number;
    url: string;
    label: string;
}
const visualData: VisualItem[] = [
    {
        key: 1,
        url: "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
        label: "Pinky Island",
    },
    {
        key: 2,
        url: "https://images.pexels.com/photos/31622979/pexels-photo-31622979.jpeg",
        label: "Greedy Model",
    },
    {
        key: 3,
        url: "https://images.pexels.com/photos/12187128/pexels-photo-12187128.jpeg",
        label: "Sigma Connect",
    },
    {
        key: 4,
        url: "https://images.pexels.com/photos/28168248/pexels-photo-28168248.jpeg",
        label: "Futuristic Gamma",
    },
];

export interface ImageRevealProps {
    items?: VisualItem[];
    className?: string;
}

export const ImageReveal = ({
    items = visualData,
    hoverText = "REVEAL",
    className = ""
}: ImageRevealProps & { hoverText?: string }) => {
    const [focusedItem, setFocusedItem] = useState<VisualItem | null>(null);
    const [isLargeScreen, setIsLargeScreen] = useState(true);

    const cursorX = useMotionValue(0);
    const cursorY = useSpring(cursorX, { stiffness: 300, damping: 40 });
    const smoothX = useSpring(cursorX, { stiffness: 300, damping: 40 });
    const smoothY = useSpring(cursorY, { stiffness: 300, damping: 40 });

    useEffect(() => {
        const updateScreen = () => {
            setIsLargeScreen(window.innerWidth >= 768);
        };
        updateScreen();
        window.addEventListener("resize", updateScreen);
        return () => window.removeEventListener("resize", updateScreen);
    }, []);

    const onMouseTrack = (e: React.MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
    };

    const onHoverActivate = (item: VisualItem) => {
        setFocusedItem(item);
    };

    const onHoverDeactivate = () => {
        setFocusedItem(null);
    };

    return (
        <div
            className={cn("relative mx-auto w-full max-w-2xl min-h-fit bg-neutral-950 rounded-xl border border-white/10 overflow-hidden", className)}
            onMouseMove={onMouseTrack}
            onMouseLeave={onHoverDeactivate}
        >
            {items.map((item) => (
                <div
                    key={item.key}
                    className="p-6 cursor-pointer relative sm:flex items-center justify-between border-b border-white/5 last:border-0"
                    onMouseEnter={() => onHoverActivate(item)}
                >
                    {!isLargeScreen && (
                        <img
                            src={item.url}
                            className="sm:w-32 sm:h-20 w-full h-52 object-cover rounded-md mb-4"
                            alt={item.label}
                        />
                    )}
                    <h2
                        className={\`font-display uppercase md:text-5xl sm:text-2xl text-xl font-bold sm:py-6 py-2 leading-[100%] relative transition-colors duration-300 \${focusedItem?.key === item.key
                            ? "mix-blend-difference z-20 text-white"
                            : "text-white/60"
                            }\`}
                    >
                        {item.label}
                    </h2>
                    <button
                        className={\`sm:block hidden p-4 rounded-full transition-all duration-300 ease-out border border-transparent \${focusedItem?.key === item.key
                            ? "mix-blend-difference z-20 bg-white text-black border-white"
                            : "text-white/20 border-white/10"
                            }\`}
                    >
                        <ArrowIcon className="w-8 h-8" />
                    </button>
                    <div
                        className={\`h-[2px] bg-white absolute bottom-0 left-0 transition-all duration-300 ease-linear \${focusedItem?.key === item.key ? "w-full" : "w-0"
                            }\`}
                    />
                </div>
            ))}

            {isLargeScreen && focusedItem && (
                <motion.img
                    src={focusedItem.url}
                    alt={focusedItem.label}
                    className="fixed z-30 object-cover w-[300px] h-[400px] rounded-2xl pointer-events-none shadow-2xl bg-neutral-900 border border-white/10"
                    style={{
                        left: smoothX,
                        top: smoothY,
                        x: "-50%",
                        y: "-50%",
                    }}
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </div>
    );
};





// 10. Hacker Background (Matrix Rain)
export interface HackerBackgroundProps {
    color?: string;
    fontSize?: number;
    className?: string;
    speed?: number;
}

export const HackerBackground = ({
    color = '#0F0',
    fontSize = 15,
    className = "",
    speed = 1
}: HackerBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.parentElement?.clientWidth || 400;
        let height = canvas.height = canvas.parentElement?.clientHeight || 400;

        const columns = Math.floor(width / 20);
        const drops: number[] = new Array(columns).fill(1);
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\$+-*/=%\\"'#&_(),.;:?!\\\\|{ }<>[]^~";

        let animationFrameId: number;

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = color;
            ctx.font = \`\${fontSize}px monospace\`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);

                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += speed;
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = canvas.width = canvas.parentElement?.clientWidth || 400;
            height = canvas.height = canvas.parentElement?.clientHeight || 400;
        };

        window.addEventListener('resize', handleResize);
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={cn("w-full h-full bg-black relative overflow-hidden", className)}>
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
};



export { default as BeamGridBackground } from '../ui/BeamGridBackground';

export { default as FallBeamBackground } from '../ui/FallBeamBackground';
export { default as HellBackground } from '../ui/HellBackground';
export { default as InteractiveGridBackground } from '../ui/InteractiveGridBackground';
export { default as ParticlesBackground } from '../ui/ParticlesBackground';
export { default as WaveBackground } from '../ui/WaveBackground';
export { default as LinesBackground } from '../ui/background-paths';
export { default as SparklesBackground } from '../ui/sparkles-background';
export { IsometricGridBackground } from '../ui/isometric-grid-background';

// Button Previews
import { BorderBeam as BorderBeamUI } from '../ui/border-beam';

export const GlowButton = () => {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div className="flex items-center justify-center p-8 bg-neutral-950 rounded-[3rem] border border-white/5 w-full h-80 relative overflow-hidden group/container">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
            
            <button
                ref={buttonRef}
                onMouseMove={handleMouseMove}
                className="relative px-10 py-4 rounded-2xl bg-neutral-900 border border-emerald-500/30 text-emerald-400 font-display font-black uppercase tracking-[0.2em] text-sm transition-all duration-500 hover:scale-105 hover:border-emerald-400 isolation-auto group"
                style={{
                    boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(16,185,129,0.05)',
                }}
            >
                {/* Interactive Surface Light */}
                <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{
                        background: \`radial-gradient(circle at \${mousePos.x}% \${mousePos.y}%, rgba(16,185,129,0.2) 0%, transparent 60%)\`,
                    }}
                />

                {/* Primary Neon Glow (Edge) */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-sm pointer-events-none" />

                {/* Volumetric Outer Glow */}
                <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none blur-2xl"
                    style={{
                        background: \`radial-gradient(circle at \${mousePos.x}% \${mousePos.y}%, rgba(16,185,129,0.4) 0%, transparent 70%)\`,
                    }}
                />

                <span className="relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:text-white transition-colors duration-300">
                    Glow Button
                </span>

                {/* Subtle Inner Highlight */}
                <div className="absolute inset-0 rounded-2xl border border-white/10 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>

            {/* Floating Particle Orbs for additional atmosphere */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/10 blur-[80px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-teal-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
        </div>
    );
};

export const BorderBeam = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <button className="relative px-8 py-3 rounded-xl bg-black text-white font-bold tracking-widest uppercase overflow-hidden transition-all hover:bg-neutral-900">
            Border Beam
            <BorderBeamUI size={100} duration={8} delay={0} colorFrom="#ffaa40" colorTo="#9c40ff" beamBorderRadius={12} borderThickness={2} />
        </button>
    </div>
);

import { ShatterButton as ShatterButtonUI } from '../ui/shatter-button';

export const ShatterButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <ShatterButtonUI shatterColor="#00ffff" shardCount={30}>
            Click Now
        </ShatterButtonUI>
    </div>
);

import { CornerBorderButton as CornerBorderButtonUI } from '../ui/corner-border-button';

export const CornerBorderButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <CornerBorderButtonUI baseColor="#0b1a2a" hoverColor="#ff3b4d" borderColor="#60daff">
            BUTTON
        </CornerBorderButtonUI>
    </div>
);

import { MarqueeHoverButton as MarqueeHoverButtonUI } from '../ui/marquee-hover-button';

export const MarqueeHoverButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <MarqueeHoverButtonUI label="Hover Me" />
    </div>
);

export const PaymentTransactionButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-full min-h-[300px]">
        <PaymentTransactionButtonUI label="Send Payment" accentColor="#38bdf8" currencySymbol="€" />
    </div>
);

export const MagicCardEffect = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-full min-h-[400px]">
        <MagicCardUI
            className="flex flex-col items-center justify-center cursor-pointer shadow-2xl bg-neutral-900/80 border-white/10"
            gradientColor="rgba(255, 255, 255, 0.15)"
            gradientFrom="#38bdf8"
            gradientTo="#818cf8"
            gradientSize={300}
        >
            <div className="p-16 flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                    <Sparkles className="text-white w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-4xl font-display font-bold text-white tracking-tight mb-2">Magic Card</h3>
                    <p className="text-white/60 text-base font-medium">Move your mouse to reveal the glow</p>
                </div>
            </div>
        </MagicCardUI>
    </div>
);

export const RainbowButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <RainbowButtonUI>Rainbow Button</RainbowButtonUI>
    </div>
);

`,

  'image-reveal': `import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { SocialTooltipButtons } from './SocialTooltipButtons';
export { SocialTooltipButtons };
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import {
    Cloud,
    CloudSun,
    CloudRain,
    Sun,
    MapPin,
    CloudSunRain,
    Zap,
    Sparkles,
    Crown,
    ChevronLeft,
    ChevronRight,
    MoveUpRight as ArrowIcon
} from 'lucide-react';
import { PaymentTransactionButton as PaymentTransactionButtonUI } from '../ui/payment-transaction-button';
import { MagicCard as MagicCardUI } from '../ui/magic-card';
import { RainbowButton as RainbowButtonUI } from '../ui/rainbow-button';
import { OrbitButton as OrbitButtonUI } from '../ui/OrbitButton';
import { GalaxyButton as GalaxyButtonUI } from '../ui/GalaxyButton';
import { LiquidFillButton as LiquidFillButtonUI } from '../ui/LiquidFillButton';
import { NeonFlickerButton as NeonFlickerButtonUI } from '../ui/NeonFlickerButton';
import { Robot3DBackground as Robot3DBackgroundUI } from '../ui/Robot3DBackground';

export { OrbitButtonUI as OrbitButton };
export { GalaxyButtonUI as GalaxyButton };
export { LiquidFillButtonUI as LiquidFillButton };
export { NeonFlickerButtonUI as NeonFlickerButton };
export { Robot3DBackgroundUI as Robot3DBackground };

// 1. Liquid-Glass (Weather Dashboard Example)
export interface LiquidGlassProps {
    backgroundImage?: string;
    location?: string;
    temp?: string;
    className?: string;
}

export const LiquidGlass = ({
    backgroundImage = "url('https://images.unsplash.com/photo-1590867286251-8e26d9f255c0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    location = "Surat",
    temp = "+18°C",
    className = ""
}: LiquidGlassProps) => {
    return (
        <div
            className={cn('p-4 relative z-30 w-full max-w-2xl gap-8 py-8 rounded-xl overflow-hidden', className)}
            style={{
                background: \`\${backgroundImage} center / cover no-repeat\`,
            }}
        >
            <div className='grid w-full grid-cols-2 gap-4 mx-auto'>
                {/* Hourly Forecast Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='col-span-2 p-6 text-white bg-white/5'
                >
                    <div className='flex justify-between relative z-30 text-sm font-medium'>
                        <div className='flex flex-col items-center gap-2'>
                            <span>16:00</span>
                            <Cloud className='h-6 w-6 fill-white' />
                            <span>+18°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>17:00</span>
                            <Cloud className='h-6 w-6 fill-white' />
                            <span>+18°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>18:00</span>
                            <CloudRain className='h-6 w-6' />
                            <span>+16°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>19:00</span>
                            <CloudRain className='h-6 w-6' />
                            <span>+14°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>20:00</span>
                            <CloudSun className='h-6 w-6 fill-white' />
                            <span>+15°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>21:00</span>
                            <CloudSunRain className='h-6 w-6' />
                            <span>+14°</span>
                        </div>
                    </div>
                </LiquidGlassCard>

                {/* Current Weather Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='rounded-3xl p-6 text-white bg-white/5 '
                >
                    <div className='relative z-30 flex flex-col items-start justify-center h-full w-full'>
                        <div className='text-4xl font-semibold'>{temp}</div>
                        <div className='text-sm opacity-70'>Cloudy {temp}/+5°</div>
                    </div>
                </LiquidGlassCard>

                {/* Time and Location Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='rounded-3xl p-6 text-white bg-white/5'
                >
                    <div className='relative z-30 flex flex-col items-start justify-center h-full w-full'>
                        <div className='text-4xl font-semibold'>17:32</div>
                        <div className='text-sm opacity-70'>Sun, Nov 19</div>
                        <button className='mt-2 inline-flex items-center gap-1 rounded-full bg-black/20 backdrop-blur-xl px-2 py-0.5 text-xs font-medium'>
                            <MapPin className='h-3 w-3' />
                            {location}
                        </button>
                    </div>
                </LiquidGlassCard>

                {/* Daily Forecast Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='col-span-2 rounded-3xl bg-white/5 p-6 text-white'
                >
                    <div className='relative z-30 flex flex-col gap-3 h-full w-full'>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <Sun className='h-5 w-5 fill-white' />
                                <span>Tue, 7 Sep</span>
                            </div>
                            <span className='font-medium'>+18°/+4°</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <Cloud className='h-5 w-5 fill-white' />
                                <span>Wed, 8 Sep</span>
                            </div>
                            <span className='font-medium'>+20°/+6°</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <CloudRain className='h-5 w-5' />
                                <span>Thu, 9 Sep</span>
                            </div>
                            <span className='font-medium'>+17°/+3°</span>
                        </div>
                    </div>
                </LiquidGlassCard>
            </div>
        </div>
    );
};







// 5. Spotlight Cards
export interface SpotlightCardsProps {
    className?: string;
    defaultCardColors?: string[];
    title?: string;
    description?: string;
}

export const SpotlightCards = ({
    className = "",
    defaultCardColors = ['#10b981', '#6366f1', '#f59e0b'],
    title = "Platform Features",
    description = "Discover the power of our high-performance component library."
}: SpotlightCardsProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Playground State
    const [cardColors, setCardColors] = useState(defaultCardColors);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Account for CSS scaling (essential for library previews)
        const scaleX = containerRef.current.offsetWidth / rect.width;
        const scaleY = containerRef.current.offsetHeight / rect.height;
        
        setMousePos({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        });
    };

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -350, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 350, behavior: 'smooth' });
    };

    const cards = [
        {
            title: "Performance",
            text: "Lightning-fast components built for modern web applications.",
            icon: Zap,
            hex: cardColors[0] + "66",
            accent: cardColors[0],
            bg: cardColors[0] + "1a",
            bullets: ["Optimized rendering", "Minimal bundle size"]
        },
        {
            title: "Design",
            text: "Beautiful, accessible components with smooth animations.",
            icon: Sparkles,
            hex: cardColors[1] + "66",
            accent: cardColors[1],
            bg: cardColors[1] + "1a",
            bullets: ["Elegant animations", "Accessibility first"]
        },
        {
            title: "Premium",
            text: "Enterprise-grade components with advanced features.",
            icon: Crown,
            hex: cardColors[2] + "66",
            accent: cardColors[2],
            bg: cardColors[2] + "1a",
            bullets: ["Enterprise support", "Advanced features"]
        },
    ];

    return (
        <div className="flex flex-col items-center w-full relative z-30">
            {/* Live Playground Controls */}
            <div className="w-full max-w-5xl mb-8 p-8 rounded-[2rem] bg-neutral-900 border border-white/5 backdrop-blur-sm shadow-xl">
                <div className="flex flex-col gap-6">
                    <h3 className="text-2xl font-display font-bold text-white tracking-tight">Live Playground</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((num, i) => (
                            <div key={num} className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/50">Card {num} Glow Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={cardColors[i]}
                                        onChange={e => {
                                            const newColors = [...cardColors];
                                            newColors[i] = e.target.value;
                                            setCardColors(newColors);
                                        }}
                                        className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={cardColors[i]}
                                        onChange={e => {
                                            const newColors = [...cardColors];
                                            newColors[i] = e.target.value;
                                            setCardColors(newColors);
                                        }}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white w-full font-mono focus:outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full max-w-5xl relative group"
            >
                {/* Arrows */}
                <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={24} />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-6 p-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden scroll-smooth"
                >
                    {cards.map((card, i) => (
                        <CardItem 
                            key={i} 
                            card={card} 
                            globalMousePos={mousePos} 
                            isParentHovered={isHovered}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Internal Helper Card Component for 100% Alignment Consistency
const CardItem: React.FC<{ 
    card: any; 
    globalMousePos: { x: number; y: number }; 
    isParentHovered: boolean;
}> = ({ card, globalMousePos, isParentHovered }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [localMousePos, setLocalMousePos] = useState({ x: -1000, y: -1000 });

    useEffect(() => {
        if (!cardRef.current) return;
        const updateLocalPos = () => {
            if (!cardRef.current) return;
            const cardRect = cardRef.current.getBoundingClientRect();
            const containerRect = cardRef.current.closest('.group')?.getBoundingClientRect();
            if (containerRect) {
                setLocalMousePos({
                    x: globalMousePos.x - (cardRect.left - containerRect.left),
                    y: globalMousePos.y - (cardRect.top - containerRect.top)
                });
            }
        };
        updateLocalPos();
    }, [globalMousePos]);

    const CardInner = ({ highlighted = false }: { highlighted?: boolean }) => (
        <div className={cn("relative z-20 flex flex-col h-full", highlighted ? "pointer-events-none" : "")}>
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5" style={{ backgroundColor: card.bg }}>
                    <card.icon size={24} style={{ color: card.accent }} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">UILAYOUT</span>
            </div>

            <h3 className={cn("text-3xl font-display font-black mb-3 tracking-tight transition-colors", 
                highlighted ? "text-white" : "text-white/30 group-hover/card:text-white/40")}>
                {card.title}
            </h3>
            <p className={cn("text-sm leading-relaxed mb-6 font-medium transition-colors", 
                highlighted ? "text-white/90" : "text-white/20 group-hover/card:text-white/30")}>
                {card.text}
            </p>

            <ul className="mt-auto space-y-3">
                {card.bullets.map((bullet: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-xs font-medium">
                        <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center">
                            <div className={cn("w-1.5 h-1.5 rounded-full", highlighted ? "bg-white/80" : "bg-white/10")} />
                        </div>
                        <span className={highlighted ? "text-white/80" : "text-white/20"}>{bullet}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div ref={cardRef} className="relative flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[350px] snap-center p-8 rounded-[2.5rem] bg-neutral-900 border border-white/5 overflow-hidden group/card shadow-xl transition-all duration-400 ease-out">
            <CardInner />
            <div 
                className="absolute inset-0 transition-opacity duration-500 z-10"
                style={{
                    opacity: isParentHovered ? 1 : 0,
                    WebkitMaskImage: \`radial-gradient(circle 35rem at \${localMousePos.x}px \${localMousePos.y}px, black 0%, transparent 70%)\`,
                    maskImage: \`radial-gradient(circle 35rem at \${localMousePos.x}px \${localMousePos.y}px, black 0%, transparent 70%)\`,
                    backgroundColor: \`\${card.accent}10\`,
                    padding: '2rem',
                    border: \`1px solid \${card.accent}\`,
                    borderRadius: '2.5rem',
                }}
            >
                <CardInner highlighted />
            </div>
            {/* Ambient Base Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 opacity-30 group-hover/card:opacity-80 transition-opacity pointer-events-none" style={{ background: \`radial-gradient(ellipse at bottom, \${card.hex} 0%, transparent 60%)\` }} />
        </div>
    );
};

// 6. Image Reveal
// 6. Image Reveal
interface VisualItem {
    key: number;
    url: string;
    label: string;
}
const visualData: VisualItem[] = [
    {
        key: 1,
        url: "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
        label: "Pinky Island",
    },
    {
        key: 2,
        url: "https://images.pexels.com/photos/31622979/pexels-photo-31622979.jpeg",
        label: "Greedy Model",
    },
    {
        key: 3,
        url: "https://images.pexels.com/photos/12187128/pexels-photo-12187128.jpeg",
        label: "Sigma Connect",
    },
    {
        key: 4,
        url: "https://images.pexels.com/photos/28168248/pexels-photo-28168248.jpeg",
        label: "Futuristic Gamma",
    },
];

export interface ImageRevealProps {
    items?: VisualItem[];
    className?: string;
}

export const ImageReveal = ({
    items = visualData,
    hoverText = "REVEAL",
    className = ""
}: ImageRevealProps & { hoverText?: string }) => {
    const [focusedItem, setFocusedItem] = useState<VisualItem | null>(null);
    const [isLargeScreen, setIsLargeScreen] = useState(true);

    const cursorX = useMotionValue(0);
    const cursorY = useSpring(cursorX, { stiffness: 300, damping: 40 });
    const smoothX = useSpring(cursorX, { stiffness: 300, damping: 40 });
    const smoothY = useSpring(cursorY, { stiffness: 300, damping: 40 });

    useEffect(() => {
        const updateScreen = () => {
            setIsLargeScreen(window.innerWidth >= 768);
        };
        updateScreen();
        window.addEventListener("resize", updateScreen);
        return () => window.removeEventListener("resize", updateScreen);
    }, []);

    const onMouseTrack = (e: React.MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
    };

    const onHoverActivate = (item: VisualItem) => {
        setFocusedItem(item);
    };

    const onHoverDeactivate = () => {
        setFocusedItem(null);
    };

    return (
        <div
            className={cn("relative mx-auto w-full max-w-2xl min-h-fit bg-neutral-950 rounded-xl border border-white/10 overflow-hidden", className)}
            onMouseMove={onMouseTrack}
            onMouseLeave={onHoverDeactivate}
        >
            {items.map((item) => (
                <div
                    key={item.key}
                    className="p-6 cursor-pointer relative sm:flex items-center justify-between border-b border-white/5 last:border-0"
                    onMouseEnter={() => onHoverActivate(item)}
                >
                    {!isLargeScreen && (
                        <img
                            src={item.url}
                            className="sm:w-32 sm:h-20 w-full h-52 object-cover rounded-md mb-4"
                            alt={item.label}
                        />
                    )}
                    <h2
                        className={\`font-display uppercase md:text-5xl sm:text-2xl text-xl font-bold sm:py-6 py-2 leading-[100%] relative transition-colors duration-300 \${focusedItem?.key === item.key
                            ? "mix-blend-difference z-20 text-white"
                            : "text-white/60"
                            }\`}
                    >
                        {item.label}
                    </h2>
                    <button
                        className={\`sm:block hidden p-4 rounded-full transition-all duration-300 ease-out border border-transparent \${focusedItem?.key === item.key
                            ? "mix-blend-difference z-20 bg-white text-black border-white"
                            : "text-white/20 border-white/10"
                            }\`}
                    >
                        <ArrowIcon className="w-8 h-8" />
                    </button>
                    <div
                        className={\`h-[2px] bg-white absolute bottom-0 left-0 transition-all duration-300 ease-linear \${focusedItem?.key === item.key ? "w-full" : "w-0"
                            }\`}
                    />
                </div>
            ))}

            {isLargeScreen && focusedItem && (
                <motion.img
                    src={focusedItem.url}
                    alt={focusedItem.label}
                    className="fixed z-30 object-cover w-[300px] h-[400px] rounded-2xl pointer-events-none shadow-2xl bg-neutral-900 border border-white/10"
                    style={{
                        left: smoothX,
                        top: smoothY,
                        x: "-50%",
                        y: "-50%",
                    }}
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </div>
    );
};





// 10. Hacker Background (Matrix Rain)
export interface HackerBackgroundProps {
    color?: string;
    fontSize?: number;
    className?: string;
    speed?: number;
}

export const HackerBackground = ({
    color = '#0F0',
    fontSize = 15,
    className = "",
    speed = 1
}: HackerBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.parentElement?.clientWidth || 400;
        let height = canvas.height = canvas.parentElement?.clientHeight || 400;

        const columns = Math.floor(width / 20);
        const drops: number[] = new Array(columns).fill(1);
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\$+-*/=%\\"'#&_(),.;:?!\\\\|{ }<>[]^~";

        let animationFrameId: number;

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = color;
            ctx.font = \`\${fontSize}px monospace\`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);

                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += speed;
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = canvas.width = canvas.parentElement?.clientWidth || 400;
            height = canvas.height = canvas.parentElement?.clientHeight || 400;
        };

        window.addEventListener('resize', handleResize);
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={cn("w-full h-full bg-black relative overflow-hidden", className)}>
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
};



export { default as BeamGridBackground } from '../ui/BeamGridBackground';

export { default as FallBeamBackground } from '../ui/FallBeamBackground';
export { default as HellBackground } from '../ui/HellBackground';
export { default as InteractiveGridBackground } from '../ui/InteractiveGridBackground';
export { default as ParticlesBackground } from '../ui/ParticlesBackground';
export { default as WaveBackground } from '../ui/WaveBackground';
export { default as LinesBackground } from '../ui/background-paths';
export { default as SparklesBackground } from '../ui/sparkles-background';
export { IsometricGridBackground } from '../ui/isometric-grid-background';

// Button Previews
import { BorderBeam as BorderBeamUI } from '../ui/border-beam';

export const GlowButton = () => {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div className="flex items-center justify-center p-8 bg-neutral-950 rounded-[3rem] border border-white/5 w-full h-80 relative overflow-hidden group/container">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
            
            <button
                ref={buttonRef}
                onMouseMove={handleMouseMove}
                className="relative px-10 py-4 rounded-2xl bg-neutral-900 border border-emerald-500/30 text-emerald-400 font-display font-black uppercase tracking-[0.2em] text-sm transition-all duration-500 hover:scale-105 hover:border-emerald-400 isolation-auto group"
                style={{
                    boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(16,185,129,0.05)',
                }}
            >
                {/* Interactive Surface Light */}
                <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{
                        background: \`radial-gradient(circle at \${mousePos.x}% \${mousePos.y}%, rgba(16,185,129,0.2) 0%, transparent 60%)\`,
                    }}
                />

                {/* Primary Neon Glow (Edge) */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-sm pointer-events-none" />

                {/* Volumetric Outer Glow */}
                <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none blur-2xl"
                    style={{
                        background: \`radial-gradient(circle at \${mousePos.x}% \${mousePos.y}%, rgba(16,185,129,0.4) 0%, transparent 70%)\`,
                    }}
                />

                <span className="relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:text-white transition-colors duration-300">
                    Glow Button
                </span>

                {/* Subtle Inner Highlight */}
                <div className="absolute inset-0 rounded-2xl border border-white/10 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>

            {/* Floating Particle Orbs for additional atmosphere */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/10 blur-[80px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-teal-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
        </div>
    );
};

export const BorderBeam = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <button className="relative px-8 py-3 rounded-xl bg-black text-white font-bold tracking-widest uppercase overflow-hidden transition-all hover:bg-neutral-900">
            Border Beam
            <BorderBeamUI size={100} duration={8} delay={0} colorFrom="#ffaa40" colorTo="#9c40ff" beamBorderRadius={12} borderThickness={2} />
        </button>
    </div>
);

import { ShatterButton as ShatterButtonUI } from '../ui/shatter-button';

export const ShatterButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <ShatterButtonUI shatterColor="#00ffff" shardCount={30}>
            Click Now
        </ShatterButtonUI>
    </div>
);

import { CornerBorderButton as CornerBorderButtonUI } from '../ui/corner-border-button';

export const CornerBorderButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <CornerBorderButtonUI baseColor="#0b1a2a" hoverColor="#ff3b4d" borderColor="#60daff">
            BUTTON
        </CornerBorderButtonUI>
    </div>
);

import { MarqueeHoverButton as MarqueeHoverButtonUI } from '../ui/marquee-hover-button';

export const MarqueeHoverButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <MarqueeHoverButtonUI label="Hover Me" />
    </div>
);

export const PaymentTransactionButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-full min-h-[300px]">
        <PaymentTransactionButtonUI label="Send Payment" accentColor="#38bdf8" currencySymbol="€" />
    </div>
);

export const MagicCardEffect = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-full min-h-[400px]">
        <MagicCardUI
            className="flex flex-col items-center justify-center cursor-pointer shadow-2xl bg-neutral-900/80 border-white/10"
            gradientColor="rgba(255, 255, 255, 0.15)"
            gradientFrom="#38bdf8"
            gradientTo="#818cf8"
            gradientSize={300}
        >
            <div className="p-16 flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                    <Sparkles className="text-white w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-4xl font-display font-bold text-white tracking-tight mb-2">Magic Card</h3>
                    <p className="text-white/60 text-base font-medium">Move your mouse to reveal the glow</p>
                </div>
            </div>
        </MagicCardUI>
    </div>
);

export const RainbowButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <RainbowButtonUI>Rainbow Button</RainbowButtonUI>
    </div>
);

`,

  'fourier-flow': `import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCw, Settings, Sliders, Eye, EyeOff, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface FourierFlowProps {
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  mode?: 'loader' | 'interactive';
  defaultTheme?: 'emerald' | 'vaporwave' | 'solar' | 'cosmic';
  className?: string;
}

interface ThemeConfig {
  stroke: string;
  particles: string;
  glow: string;
  background: string;
  grid: string;
}

export const FourierFlow: React.FC<FourierFlowProps> = ({
  size = 'md',
  mode = 'interactive',
  defaultTheme = 'emerald',
  className = '',
}) => {
  const { theme: activeMode } = useTheme();
  const [theme, setTheme] = useState<keyof typeof THEMES>(defaultTheme);

  const THEMES: Record<string, ThemeConfig> = {
    emerald: {
      stroke: activeMode === 'light' ? '#00AEEF' : '#00FF00', // website brand-blue / brand-green
      particles: activeMode === 'light' ? '#5FA3D6' : '#39FF14', // light shade blue / neon lime green
      glow: activeMode === 'light' ? 'rgba(95, 163, 214, 0.4)' : 'rgba(0, 255, 0, 0.4)',
      background: activeMode === 'light' ? '#FFFFFF' : '#000000',
      grid: activeMode === 'light' ? 'rgba(95, 163, 214, 0.05)' : 'rgba(0, 255, 0, 0.04)',
    },
    vaporwave: {
      stroke: activeMode === 'light' ? '#ec4899' : '#06b6d4',
      particles: activeMode === 'light' ? '#06b6d4' : '#ec4899',
      glow: activeMode === 'light' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(236, 72, 153, 0.4)',
      background: activeMode === 'light' ? '#FAF5FF' : '#05020a',
      grid: activeMode === 'light' ? 'rgba(236, 72, 153, 0.05)' : 'rgba(6, 182, 212, 0.04)',
    },
    solar: {
      stroke: '#f59e0b',
      particles: '#ef4444',
      glow: 'rgba(245, 158, 11, 0.4)',
      background: activeMode === 'light' ? '#FFFBEB' : '#070402',
      grid: 'rgba(245, 158, 11, 0.04)',
    },
    cosmic: {
      stroke: activeMode === 'light' ? '#a855f7' : '#6366f1',
      particles: activeMode === 'light' ? '#6366f1' : '#a855f7',
      glow: activeMode === 'light' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(168, 85, 247, 0.4)',
      background: activeMode === 'light' ? '#F5F3FF' : '#020208',
      grid: activeMode === 'light' ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.04)',
    },
  };

  const currentTheme = THEMES[theme];


  // Visual options
  const [showFormula, setShowFormula] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [rotate, setRotate] = useState(false);

  // Fourier Math Configurable Constants
  const [fourierX1, setFourierX1] = useState(17.0);
  const [fourierX3, setFourierX3] = useState(7.5);
  const [fourierX5, setFourierX5] = useState(3.2);
  const [fourierY1, setFourierY1] = useState(15.0);
  const [fourierY2, setFourierY2] = useState(8.2);
  const [fourierY4, setFourierY4] = useState(4.2);
  const [fourierMixBase, setFourierMixBase] = useState(1.0);
  const [fourierMixPulse, setFourierMixPulse] = useState(0.16);

  // Simulation parameters
  const [particleCount, setParticleCount] = useState(32);
  const [trailSpan, setTrailSpan] = useState(0.46);
  const [durationMs, setDurationMs] = useState(8400);
  const [strokeWidth, setStrokeWidth] = useState(4.2);

  // Constants
  const rotationDurationMs = 44000;
  const pulseDurationMs = 6800;

  // Refs for requestAnimationFrame logic
  const groupRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const particlesRef = useRef<SVGCircleElement[]>([]);
  const requestRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Dynamic formula array generator
  const getFormulaText = () => {
    return [
      \`x(t) = 50 + \${fourierX1.toFixed(1)} cos t + \${fourierX3.toFixed(1)} cos(3t + 0.6m) + \${fourierX5.toFixed(1)} sin(5t - 0.4)\`,
      \`y(t) = 50 + \${fourierY1.toFixed(1)} sin t + \${fourierY2.toFixed(1)} sin(2t + 0.25) - \${fourierY4.toFixed(1)} cos(4t - 0.5m)\`,
      \`m = \${fourierMixBase.toFixed(2)} + \${fourierMixPulse.toFixed(2)}s\`,
    ].join('\\n');
  };

  // Safe point calculator
  const getPoint = useCallback(
    (progress: number, detailScale: number) => {
      const t = progress * Math.PI * 2;
      const mix = fourierMixBase + detailScale * fourierMixPulse;
      const x =
        fourierX1 * Math.cos(t) +
        fourierX3 * Math.cos(3 * t + 0.6 * mix) +
        fourierX5 * Math.sin(5 * t - 0.4);
      const y =
        fourierY1 * Math.sin(t) +
        fourierY2 * Math.sin(2 * t + 0.25) -
        fourierY4 * Math.cos(4 * t - 0.5 * mix);
      return {
        x: 50 + x,
        y: 50 + y,
      };
    },
    [
      fourierX1,
      fourierX3,
      fourierX5,
      fourierY1,
      fourierY2,
      fourierY4,
      fourierMixBase,
      fourierMixPulse,
    ]
  );

  const getDetailScale = useCallback((time: number) => {
    const pulseProgress = (time % pulseDurationMs) / pulseDurationMs;
    const pulseAngle = pulseProgress * Math.PI * 2;
    return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48;
  }, []);

  const getRotation = useCallback(
    (time: number) => {
      if (!rotate) return 0;
      return -((time % rotationDurationMs) / rotationDurationMs) * 360;
    },
    [rotate]
  );

  const buildPath = useCallback(
    (detailScale: number, steps = 360) => {
      const points = [];
      for (let i = 0; i <= steps; i++) {
        const point = getPoint(i / steps, detailScale);
        points.push(\`\${i === 0 ? 'M' : 'L'} \${point.x.toFixed(2)} \${point.y.toFixed(2)}\`);
      }
      return points.join(' ');
    },
    [getPoint]
  );

  const normalizeProgress = (progress: number) => {
    return ((progress % 1) + 1) % 1;
  };

  const updateFrame = useCallback(
    (now: number) => {
      if (!startedAtRef.current) {
        startedAtRef.current = now;
      }

      // Handle pause offset
      let time = now - startedAtRef.current - pausedTimeRef.current;
      if (!isPlaying) {
        pausedTimeRef.current += now - lastTimeRef.current;
        time = lastTimeRef.current - startedAtRef.current - pausedTimeRef.current;
      }
      lastTimeRef.current = now;

      const progress = (time % durationMs) / durationMs;
      const detailScale = getDetailScale(time);

      // Rotate group
      if (groupRef.current) {
        groupRef.current.setAttribute(
          'transform',
          \`rotate(\${getRotation(time).toFixed(2)} 50 50)\`
        );
      }

      // Update morphing main curve path
      if (pathRef.current) {
        pathRef.current.setAttribute('d', buildPath(detailScale));
      }

      // Update particle trails
      particlesRef.current.forEach((node, index) => {
        if (!node) return;
        const tailOffset = index / (particleCount - 1 || 1);
        const point = getPoint(
          normalizeProgress(progress - tailOffset * trailSpan),
          detailScale
        );
        const fade = Math.pow(1 - tailOffset, 0.56);
        const radius = 0.8 + fade * 2.5;
        const opacity = 0.05 + fade * 0.95;

        node.setAttribute('cx', point.x.toFixed(2));
        node.setAttribute('cy', point.y.toFixed(2));
        node.setAttribute('r', radius.toFixed(2));
        node.setAttribute('opacity', opacity.toFixed(3));
      });

      requestRef.current = requestAnimationFrame(updateFrame);
    },
    [
      isPlaying,
      durationMs,
      getDetailScale,
      getRotation,
      buildPath,
      particleCount,
      trailSpan,
      getPoint,
    ]
  );

  // Trigger loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateFrame);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [updateFrame]);

  // Reset modifiers
  const resetToDefault = () => {
    setFourierX1(17.0);
    setFourierX3(7.5);
    setFourierX5(3.2);
    setFourierY1(15.0);
    setFourierY2(8.2);
    setFourierY4(4.2);
    setFourierMixBase(1.0);
    setFourierMixPulse(0.16);
    setParticleCount(32);
    setTrailSpan(0.46);
    setDurationMs(8400);
    setStrokeWidth(4.2);
  };

  // Presets mapping
  const applyPreset = (type: 'spirograph' | 'butterfly' | 'chaotic' | 'heart') => {
    if (type === 'spirograph') {
      setFourierX1(20.0);
      setFourierX3(4.0);
      setFourierX5(1.5);
      setFourierY1(20.0);
      setFourierY2(4.0);
      setFourierY4(1.5);
      setFourierMixBase(0.5);
      setFourierMixPulse(0.3);
    } else if (type === 'butterfly') {
      setFourierX1(16.0);
      setFourierX3(12.0);
      setFourierX5(2.0);
      setFourierY1(8.0);
      setFourierY2(16.0);
      setFourierY4(5.0);
      setFourierMixBase(1.2);
      setFourierMixPulse(0.08);
    } else if (type === 'chaotic') {
      setFourierX1(12.0);
      setFourierX3(14.0);
      setFourierX5(8.0);
      setFourierY1(18.0);
      setFourierY2(5.0);
      setFourierY4(9.0);
      setFourierMixBase(2.0);
      setFourierMixPulse(0.5);
    } else if (type === 'heart') {
      setFourierX1(16.0);
      setFourierX3(0.0);
      setFourierX5(0.0);
      setFourierY1(13.0);
      setFourierY2(5.0);
      setFourierY4(2.0);
      setFourierMixBase(1.0);
      setFourierMixPulse(0.0);
    }
  };

  // Render variables based on size option
  const isLoader = mode === 'loader';
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-[280px] h-[280px]',
    lg: 'w-[400px] h-[400px]',
    fullscreen: 'w-full h-full max-w-[600px] aspect-ratio-1',
  };

  const containerBg = isLoader ? 'bg-transparent' : 'bg-[#050508] border border-white/5 shadow-2xl';

  return (
    <div
      className={\`flex flex-col items-center justify-center p-6 rounded-3xl \${containerBg} transition-all duration-300 \${className}\`}
      style={{ background: isLoader ? 'transparent' : currentTheme.background }}
    >
      {/* Visual Canvas Panel */}
      <div className="relative w-full flex items-center justify-center">
        {/* Math Grid background */}
        {showGrid && !isLoader && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none transition-colors duration-300"
            style={{
              backgroundImage: \`radial-gradient(\${currentTheme.grid} 1.5px, transparent 1.5px)\`,
              backgroundSize: '24px 24px',
            }}
          />
        )}

        <div className={\`\${sizeClasses[size]} relative flex items-center justify-center\`}>
          <svg
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
            className="w-full h-full overflow-visible"
          >
            {/* Filter glow for absolute high-end visuals */}
            <defs>
              <filter id="fourier-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g ref={groupRef}>
              {/* Outer morphing path */}
              <path
                ref={pathRef}
                stroke={currentTheme.stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isLoader ? 0.35 : 0.22}
                filter="url(#fourier-glow)"
                className="transition-colors duration-500"
              />

              {/* Trail Particles */}
              {Array.from({ length: particleCount }).map((_, i) => (
                <circle
                  key={i}
                  ref={(el) => {
                    if (el) particlesRef.current[i] = el;
                  }}
                  fill={currentTheme.particles}
                  filter="url(#fourier-glow)"
                  className="transition-colors duration-500"
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Floating loader tags */}
        {isLoader && size !== 'sm' && (
          <div className="absolute bottom-[-16px] text-center">
            <span
              className="text-[10px] font-black tracking-[0.3em] uppercase transition-colors duration-500"
              style={{ color: currentTheme.stroke }}
            >
              UI HUB — LOADING VIBES
            </span>
          </div>
        )}
      </div>

      {/* Control Knobs (Hidden if strictly in loader mode) */}
      {!isLoader && (
        <div className="w-full mt-6 flex flex-col gap-6 text-white z-10">
          {/* Header metadata */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <div className="text-xs font-black tracking-widest text-white/40 uppercase">
                Harmonic Function Loader
              </div>
              <div className="text-lg font-black tracking-tight mt-0.5">Fourier Flow</div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
              <button
                onClick={resetToDefault}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors group"
                title="Reset Constants"
              >
                <RotateCw className="w-3.5 h-3.5 text-white/50 group-hover:text-white" />
              </button>
              <div className="h-4 w-[1px] bg-white/10 mx-1" />
              {(['spirograph', 'butterfly', 'chaotic'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left sliders - Coefficients */}
            <div className="flex flex-col gap-3.5 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Sliders className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs font-bold tracking-wider text-white/70 uppercase">
                  Fourier Coefficients
                </span>
              </div>

              {/* Slider X1 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>X Coeff 1 (Primary)</span>
                  <span className="font-bold text-white">{fourierX1.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={fourierX1}
                  onChange={(e) => setFourierX1(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>

              {/* Slider X3 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>X Coeff 2 (3rd Harm)</span>
                  <span className="font-bold text-white">{fourierX3.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.1"
                  value={fourierX3}
                  onChange={(e) => setFourierX3(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>

              {/* Slider Y1 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>Y Coeff 1 (Primary)</span>
                  <span className="font-bold text-white">{fourierY1.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={fourierY1}
                  onChange={(e) => setFourierY1(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>

              {/* Slider Y2 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>Y Coeff 2 (2nd Harm)</span>
                  <span className="font-bold text-white">{fourierY2.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.1"
                  value={fourierY2}
                  onChange={(e) => setFourierY2(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>
            </div>

            {/* Right sliders - Physics / Simulation */}
            <div className="flex flex-col gap-3.5 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs font-bold tracking-wider text-white/70 uppercase">
                  Physics & Trail
                </span>
              </div>

              {/* Particles */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>Particle Count</span>
                  <span className="font-bold text-white">{particleCount}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="96"
                  step="1"
                  value={particleCount}
                  onChange={(e) => setParticleCount(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>

              {/* Duration (Speed) */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>Cycle Duration</span>
                  <span className="font-bold text-white">{(durationMs / 1000).toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="16000"
                  step="200"
                  value={durationMs}
                  onChange={(e) => setDurationMs(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>

              {/* Stroke width */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>Path Stroke Width</span>
                  <span className="font-bold text-white">{strokeWidth.toFixed(1)}px</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.1"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>

              {/* Trail Span */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-mono text-white/55">
                  <span>Trail Offset Span</span>
                  <span className="font-bold text-white">{trailSpan.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.02"
                  value={trailSpan}
                  onChange={(e) => setTrailSpan(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: currentTheme.stroke }}
                />
              </div>
            </div>
          </div>

          {/* Themes, Formula Toggles & Interactive Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
            {/* Color presets selection */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Theme</span>
              <div className="flex gap-1.5">
                {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((th) => (
                  <button
                    key={th}
                    onClick={() => setTheme(th)}
                    className={\`w-5 h-5 rounded-full border transition-all duration-300 \${
                      theme === th ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                    }\`}
                    style={{ backgroundColor: THEMES[th].stroke }}
                  >
                    {theme === th && <Check className="w-3 h-3 text-black mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Config controls */}
            <div className="flex gap-2">
              {/* Play/Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              {/* Rotation */}
              <button
                onClick={() => setRotate(!rotate)}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-300 \${
                  rotate
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/5 text-white/55 hover:bg-white/10 hover:text-white'
                }\`}
              >
                <RotateCw className={\`w-3.5 h-3.5 \${rotate ? 'animate-spin' : ''}\`} style={{ animationDuration: '4s' }} />
                <span>Orbit</span>
              </button>

              {/* Grid Toggle */}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-300 \${
                  showGrid
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/5 text-white/55 hover:bg-white/10 hover:text-white'
                }\`}
              >
                {showGrid ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Grid</span>
              </button>

              {/* Formula Card */}
              <button
                onClick={() => setShowFormula(!showFormula)}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all duration-300 \${
                  showFormula
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/5 text-white/55 hover:bg-white/10 hover:text-white'
                }\`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Formula</span>
              </button>
            </div>
          </div>

          {/* Math Equations Viewer Card */}
          {showFormula && (
            <div className="relative overflow-hidden rounded-xl bg-black/40 border border-white/5 p-4 mt-2">
              {/* Decorative accent glow */}
              <div
                className="absolute top-0 right-0 w-24 h-24 blur-[40px] pointer-events-none rounded-full"
                style={{ backgroundColor: currentTheme.glow }}
              />

              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                Dynamic Fourier Equations
              </div>
              <pre className="font-mono text-xs leading-relaxed text-white/80 select-all whitespace-pre-wrap">
                {getFormulaText()}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FourierFlow;
`,

  'glow-button': `import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { SocialTooltipButtons } from './SocialTooltipButtons';
export { SocialTooltipButtons };
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import {
    Cloud,
    CloudSun,
    CloudRain,
    Sun,
    MapPin,
    CloudSunRain,
    Zap,
    Sparkles,
    Crown,
    ChevronLeft,
    ChevronRight,
    MoveUpRight as ArrowIcon
} from 'lucide-react';
import { PaymentTransactionButton as PaymentTransactionButtonUI } from '../ui/payment-transaction-button';
import { MagicCard as MagicCardUI } from '../ui/magic-card';
import { RainbowButton as RainbowButtonUI } from '../ui/rainbow-button';
import { OrbitButton as OrbitButtonUI } from '../ui/OrbitButton';
import { GalaxyButton as GalaxyButtonUI } from '../ui/GalaxyButton';
import { LiquidFillButton as LiquidFillButtonUI } from '../ui/LiquidFillButton';
import { NeonFlickerButton as NeonFlickerButtonUI } from '../ui/NeonFlickerButton';
import { Robot3DBackground as Robot3DBackgroundUI } from '../ui/Robot3DBackground';

export { OrbitButtonUI as OrbitButton };
export { GalaxyButtonUI as GalaxyButton };
export { LiquidFillButtonUI as LiquidFillButton };
export { NeonFlickerButtonUI as NeonFlickerButton };
export { Robot3DBackgroundUI as Robot3DBackground };

// 1. Liquid-Glass (Weather Dashboard Example)
export interface LiquidGlassProps {
    backgroundImage?: string;
    location?: string;
    temp?: string;
    className?: string;
}

export const LiquidGlass = ({
    backgroundImage = "url('https://images.unsplash.com/photo-1590867286251-8e26d9f255c0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    location = "Surat",
    temp = "+18°C",
    className = ""
}: LiquidGlassProps) => {
    return (
        <div
            className={cn('p-4 relative z-30 w-full max-w-2xl gap-8 py-8 rounded-xl overflow-hidden', className)}
            style={{
                background: \`\${backgroundImage} center / cover no-repeat\`,
            }}
        >
            <div className='grid w-full grid-cols-2 gap-4 mx-auto'>
                {/* Hourly Forecast Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='col-span-2 p-6 text-white bg-white/5'
                >
                    <div className='flex justify-between relative z-30 text-sm font-medium'>
                        <div className='flex flex-col items-center gap-2'>
                            <span>16:00</span>
                            <Cloud className='h-6 w-6 fill-white' />
                            <span>+18°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>17:00</span>
                            <Cloud className='h-6 w-6 fill-white' />
                            <span>+18°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>18:00</span>
                            <CloudRain className='h-6 w-6' />
                            <span>+16°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>19:00</span>
                            <CloudRain className='h-6 w-6' />
                            <span>+14°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>20:00</span>
                            <CloudSun className='h-6 w-6 fill-white' />
                            <span>+15°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>21:00</span>
                            <CloudSunRain className='h-6 w-6' />
                            <span>+14°</span>
                        </div>
                    </div>
                </LiquidGlassCard>

                {/* Current Weather Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='rounded-3xl p-6 text-white bg-white/5 '
                >
                    <div className='relative z-30 flex flex-col items-start justify-center h-full w-full'>
                        <div className='text-4xl font-semibold'>{temp}</div>
                        <div className='text-sm opacity-70'>Cloudy {temp}/+5°</div>
                    </div>
                </LiquidGlassCard>

                {/* Time and Location Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='rounded-3xl p-6 text-white bg-white/5'
                >
                    <div className='relative z-30 flex flex-col items-start justify-center h-full w-full'>
                        <div className='text-4xl font-semibold'>17:32</div>
                        <div className='text-sm opacity-70'>Sun, Nov 19</div>
                        <button className='mt-2 inline-flex items-center gap-1 rounded-full bg-black/20 backdrop-blur-xl px-2 py-0.5 text-xs font-medium'>
                            <MapPin className='h-3 w-3' />
                            {location}
                        </button>
                    </div>
                </LiquidGlassCard>

                {/* Daily Forecast Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='col-span-2 rounded-3xl bg-white/5 p-6 text-white'
                >
                    <div className='relative z-30 flex flex-col gap-3 h-full w-full'>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <Sun className='h-5 w-5 fill-white' />
                                <span>Tue, 7 Sep</span>
                            </div>
                            <span className='font-medium'>+18°/+4°</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <Cloud className='h-5 w-5 fill-white' />
                                <span>Wed, 8 Sep</span>
                            </div>
                            <span className='font-medium'>+20°/+6°</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <CloudRain className='h-5 w-5' />
                                <span>Thu, 9 Sep</span>
                            </div>
                            <span className='font-medium'>+17°/+3°</span>
                        </div>
                    </div>
                </LiquidGlassCard>
            </div>
        </div>
    );
};







// 5. Spotlight Cards
export interface SpotlightCardsProps {
    className?: string;
    defaultCardColors?: string[];
    title?: string;
    description?: string;
}

export const SpotlightCards = ({
    className = "",
    defaultCardColors = ['#10b981', '#6366f1', '#f59e0b'],
    title = "Platform Features",
    description = "Discover the power of our high-performance component library."
}: SpotlightCardsProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Playground State
    const [cardColors, setCardColors] = useState(defaultCardColors);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Account for CSS scaling (essential for library previews)
        const scaleX = containerRef.current.offsetWidth / rect.width;
        const scaleY = containerRef.current.offsetHeight / rect.height;
        
        setMousePos({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        });
    };

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -350, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 350, behavior: 'smooth' });
    };

    const cards = [
        {
            title: "Performance",
            text: "Lightning-fast components built for modern web applications.",
            icon: Zap,
            hex: cardColors[0] + "66",
            accent: cardColors[0],
            bg: cardColors[0] + "1a",
            bullets: ["Optimized rendering", "Minimal bundle size"]
        },
        {
            title: "Design",
            text: "Beautiful, accessible components with smooth animations.",
            icon: Sparkles,
            hex: cardColors[1] + "66",
            accent: cardColors[1],
            bg: cardColors[1] + "1a",
            bullets: ["Elegant animations", "Accessibility first"]
        },
        {
            title: "Premium",
            text: "Enterprise-grade components with advanced features.",
            icon: Crown,
            hex: cardColors[2] + "66",
            accent: cardColors[2],
            bg: cardColors[2] + "1a",
            bullets: ["Enterprise support", "Advanced features"]
        },
    ];

    return (
        <div className="flex flex-col items-center w-full relative z-30">
            {/* Live Playground Controls */}
            <div className="w-full max-w-5xl mb-8 p-8 rounded-[2rem] bg-neutral-900 border border-white/5 backdrop-blur-sm shadow-xl">
                <div className="flex flex-col gap-6">
                    <h3 className="text-2xl font-display font-bold text-white tracking-tight">Live Playground</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((num, i) => (
                            <div key={num} className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/50">Card {num} Glow Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={cardColors[i]}
                                        onChange={e => {
                                            const newColors = [...cardColors];
                                            newColors[i] = e.target.value;
                                            setCardColors(newColors);
                                        }}
                                        className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={cardColors[i]}
                                        onChange={e => {
                                            const newColors = [...cardColors];
                                            newColors[i] = e.target.value;
                                            setCardColors(newColors);
                                        }}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white w-full font-mono focus:outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full max-w-5xl relative group"
            >
                {/* Arrows */}
                <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={24} />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-6 p-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden scroll-smooth"
                >
                    {cards.map((card, i) => (
                        <CardItem 
                            key={i} 
                            card={card} 
                            globalMousePos={mousePos} 
                            isParentHovered={isHovered}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Internal Helper Card Component for 100% Alignment Consistency
const CardItem: React.FC<{ 
    card: any; 
    globalMousePos: { x: number; y: number }; 
    isParentHovered: boolean;
}> = ({ card, globalMousePos, isParentHovered }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [localMousePos, setLocalMousePos] = useState({ x: -1000, y: -1000 });

    useEffect(() => {
        if (!cardRef.current) return;
        const updateLocalPos = () => {
            if (!cardRef.current) return;
            const cardRect = cardRef.current.getBoundingClientRect();
            const containerRect = cardRef.current.closest('.group')?.getBoundingClientRect();
            if (containerRect) {
                setLocalMousePos({
                    x: globalMousePos.x - (cardRect.left - containerRect.left),
                    y: globalMousePos.y - (cardRect.top - containerRect.top)
                });
            }
        };
        updateLocalPos();
    }, [globalMousePos]);

    const CardInner = ({ highlighted = false }: { highlighted?: boolean }) => (
        <div className={cn("relative z-20 flex flex-col h-full", highlighted ? "pointer-events-none" : "")}>
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5" style={{ backgroundColor: card.bg }}>
                    <card.icon size={24} style={{ color: card.accent }} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">UILAYOUT</span>
            </div>

            <h3 className={cn("text-3xl font-display font-black mb-3 tracking-tight transition-colors", 
                highlighted ? "text-white" : "text-white/30 group-hover/card:text-white/40")}>
                {card.title}
            </h3>
            <p className={cn("text-sm leading-relaxed mb-6 font-medium transition-colors", 
                highlighted ? "text-white/90" : "text-white/20 group-hover/card:text-white/30")}>
                {card.text}
            </p>

            <ul className="mt-auto space-y-3">
                {card.bullets.map((bullet: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-xs font-medium">
                        <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center">
                            <div className={cn("w-1.5 h-1.5 rounded-full", highlighted ? "bg-white/80" : "bg-white/10")} />
                        </div>
                        <span className={highlighted ? "text-white/80" : "text-white/20"}>{bullet}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div ref={cardRef} className="relative flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[350px] snap-center p-8 rounded-[2.5rem] bg-neutral-900 border border-white/5 overflow-hidden group/card shadow-xl transition-all duration-400 ease-out">
            <CardInner />
            <div 
                className="absolute inset-0 transition-opacity duration-500 z-10"
                style={{
                    opacity: isParentHovered ? 1 : 0,
                    WebkitMaskImage: \`radial-gradient(circle 35rem at \${localMousePos.x}px \${localMousePos.y}px, black 0%, transparent 70%)\`,
                    maskImage: \`radial-gradient(circle 35rem at \${localMousePos.x}px \${localMousePos.y}px, black 0%, transparent 70%)\`,
                    backgroundColor: \`\${card.accent}10\`,
                    padding: '2rem',
                    border: \`1px solid \${card.accent}\`,
                    borderRadius: '2.5rem',
                }}
            >
                <CardInner highlighted />
            </div>
            {/* Ambient Base Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 opacity-30 group-hover/card:opacity-80 transition-opacity pointer-events-none" style={{ background: \`radial-gradient(ellipse at bottom, \${card.hex} 0%, transparent 60%)\` }} />
        </div>
    );
};

// 6. Image Reveal
// 6. Image Reveal
interface VisualItem {
    key: number;
    url: string;
    label: string;
}
const visualData: VisualItem[] = [
    {
        key: 1,
        url: "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
        label: "Pinky Island",
    },
    {
        key: 2,
        url: "https://images.pexels.com/photos/31622979/pexels-photo-31622979.jpeg",
        label: "Greedy Model",
    },
    {
        key: 3,
        url: "https://images.pexels.com/photos/12187128/pexels-photo-12187128.jpeg",
        label: "Sigma Connect",
    },
    {
        key: 4,
        url: "https://images.pexels.com/photos/28168248/pexels-photo-28168248.jpeg",
        label: "Futuristic Gamma",
    },
];

export interface ImageRevealProps {
    items?: VisualItem[];
    className?: string;
}

export const ImageReveal = ({
    items = visualData,
    hoverText = "REVEAL",
    className = ""
}: ImageRevealProps & { hoverText?: string }) => {
    const [focusedItem, setFocusedItem] = useState<VisualItem | null>(null);
    const [isLargeScreen, setIsLargeScreen] = useState(true);

    const cursorX = useMotionValue(0);
    const cursorY = useSpring(cursorX, { stiffness: 300, damping: 40 });
    const smoothX = useSpring(cursorX, { stiffness: 300, damping: 40 });
    const smoothY = useSpring(cursorY, { stiffness: 300, damping: 40 });

    useEffect(() => {
        const updateScreen = () => {
            setIsLargeScreen(window.innerWidth >= 768);
        };
        updateScreen();
        window.addEventListener("resize", updateScreen);
        return () => window.removeEventListener("resize", updateScreen);
    }, []);

    const onMouseTrack = (e: React.MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
    };

    const onHoverActivate = (item: VisualItem) => {
        setFocusedItem(item);
    };

    const onHoverDeactivate = () => {
        setFocusedItem(null);
    };

    return (
        <div
            className={cn("relative mx-auto w-full max-w-2xl min-h-fit bg-neutral-950 rounded-xl border border-white/10 overflow-hidden", className)}
            onMouseMove={onMouseTrack}
            onMouseLeave={onHoverDeactivate}
        >
            {items.map((item) => (
                <div
                    key={item.key}
                    className="p-6 cursor-pointer relative sm:flex items-center justify-between border-b border-white/5 last:border-0"
                    onMouseEnter={() => onHoverActivate(item)}
                >
                    {!isLargeScreen && (
                        <img
                            src={item.url}
                            className="sm:w-32 sm:h-20 w-full h-52 object-cover rounded-md mb-4"
                            alt={item.label}
                        />
                    )}
                    <h2
                        className={\`font-display uppercase md:text-5xl sm:text-2xl text-xl font-bold sm:py-6 py-2 leading-[100%] relative transition-colors duration-300 \${focusedItem?.key === item.key
                            ? "mix-blend-difference z-20 text-white"
                            : "text-white/60"
                            }\`}
                    >
                        {item.label}
                    </h2>
                    <button
                        className={\`sm:block hidden p-4 rounded-full transition-all duration-300 ease-out border border-transparent \${focusedItem?.key === item.key
                            ? "mix-blend-difference z-20 bg-white text-black border-white"
                            : "text-white/20 border-white/10"
                            }\`}
                    >
                        <ArrowIcon className="w-8 h-8" />
                    </button>
                    <div
                        className={\`h-[2px] bg-white absolute bottom-0 left-0 transition-all duration-300 ease-linear \${focusedItem?.key === item.key ? "w-full" : "w-0"
                            }\`}
                    />
                </div>
            ))}

            {isLargeScreen && focusedItem && (
                <motion.img
                    src={focusedItem.url}
                    alt={focusedItem.label}
                    className="fixed z-30 object-cover w-[300px] h-[400px] rounded-2xl pointer-events-none shadow-2xl bg-neutral-900 border border-white/10"
                    style={{
                        left: smoothX,
                        top: smoothY,
                        x: "-50%",
                        y: "-50%",
                    }}
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </div>
    );
};





// 10. Hacker Background (Matrix Rain)
export interface HackerBackgroundProps {
    color?: string;
    fontSize?: number;
    className?: string;
    speed?: number;
}

export const HackerBackground = ({
    color = '#0F0',
    fontSize = 15,
    className = "",
    speed = 1
}: HackerBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.parentElement?.clientWidth || 400;
        let height = canvas.height = canvas.parentElement?.clientHeight || 400;

        const columns = Math.floor(width / 20);
        const drops: number[] = new Array(columns).fill(1);
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\$+-*/=%\\"'#&_(),.;:?!\\\\|{ }<>[]^~";

        let animationFrameId: number;

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = color;
            ctx.font = \`\${fontSize}px monospace\`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);

                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += speed;
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = canvas.width = canvas.parentElement?.clientWidth || 400;
            height = canvas.height = canvas.parentElement?.clientHeight || 400;
        };

        window.addEventListener('resize', handleResize);
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={cn("w-full h-full bg-black relative overflow-hidden", className)}>
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
};



export { default as BeamGridBackground } from '../ui/BeamGridBackground';

export { default as FallBeamBackground } from '../ui/FallBeamBackground';
export { default as HellBackground } from '../ui/HellBackground';
export { default as InteractiveGridBackground } from '../ui/InteractiveGridBackground';
export { default as ParticlesBackground } from '../ui/ParticlesBackground';
export { default as WaveBackground } from '../ui/WaveBackground';
export { default as LinesBackground } from '../ui/background-paths';
export { default as SparklesBackground } from '../ui/sparkles-background';
export { IsometricGridBackground } from '../ui/isometric-grid-background';

// Button Previews
import { BorderBeam as BorderBeamUI } from '../ui/border-beam';

export const GlowButton = () => {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div className="flex items-center justify-center p-8 bg-neutral-950 rounded-[3rem] border border-white/5 w-full h-80 relative overflow-hidden group/container">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
            
            <button
                ref={buttonRef}
                onMouseMove={handleMouseMove}
                className="relative px-10 py-4 rounded-2xl bg-neutral-900 border border-emerald-500/30 text-emerald-400 font-display font-black uppercase tracking-[0.2em] text-sm transition-all duration-500 hover:scale-105 hover:border-emerald-400 isolation-auto group"
                style={{
                    boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(16,185,129,0.05)',
                }}
            >
                {/* Interactive Surface Light */}
                <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{
                        background: \`radial-gradient(circle at \${mousePos.x}% \${mousePos.y}%, rgba(16,185,129,0.2) 0%, transparent 60%)\`,
                    }}
                />

                {/* Primary Neon Glow (Edge) */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-sm pointer-events-none" />

                {/* Volumetric Outer Glow */}
                <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none blur-2xl"
                    style={{
                        background: \`radial-gradient(circle at \${mousePos.x}% \${mousePos.y}%, rgba(16,185,129,0.4) 0%, transparent 70%)\`,
                    }}
                />

                <span className="relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:text-white transition-colors duration-300">
                    Glow Button
                </span>

                {/* Subtle Inner Highlight */}
                <div className="absolute inset-0 rounded-2xl border border-white/10 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>

            {/* Floating Particle Orbs for additional atmosphere */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/10 blur-[80px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-teal-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
        </div>
    );
};

export const BorderBeam = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <button className="relative px-8 py-3 rounded-xl bg-black text-white font-bold tracking-widest uppercase overflow-hidden transition-all hover:bg-neutral-900">
            Border Beam
            <BorderBeamUI size={100} duration={8} delay={0} colorFrom="#ffaa40" colorTo="#9c40ff" beamBorderRadius={12} borderThickness={2} />
        </button>
    </div>
);

import { ShatterButton as ShatterButtonUI } from '../ui/shatter-button';

export const ShatterButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <ShatterButtonUI shatterColor="#00ffff" shardCount={30}>
            Click Now
        </ShatterButtonUI>
    </div>
);

import { CornerBorderButton as CornerBorderButtonUI } from '../ui/corner-border-button';

export const CornerBorderButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <CornerBorderButtonUI baseColor="#0b1a2a" hoverColor="#ff3b4d" borderColor="#60daff">
            BUTTON
        </CornerBorderButtonUI>
    </div>
);

import { MarqueeHoverButton as MarqueeHoverButtonUI } from '../ui/marquee-hover-button';

export const MarqueeHoverButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <MarqueeHoverButtonUI label="Hover Me" />
    </div>
);

export const PaymentTransactionButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-full min-h-[300px]">
        <PaymentTransactionButtonUI label="Send Payment" accentColor="#38bdf8" currencySymbol="€" />
    </div>
);

export const MagicCardEffect = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-full min-h-[400px]">
        <MagicCardUI
            className="flex flex-col items-center justify-center cursor-pointer shadow-2xl bg-neutral-900/80 border-white/10"
            gradientColor="rgba(255, 255, 255, 0.15)"
            gradientFrom="#38bdf8"
            gradientTo="#818cf8"
            gradientSize={300}
        >
            <div className="p-16 flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                    <Sparkles className="text-white w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-4xl font-display font-bold text-white tracking-tight mb-2">Magic Card</h3>
                    <p className="text-white/60 text-base font-medium">Move your mouse to reveal the glow</p>
                </div>
            </div>
        </MagicCardUI>
    </div>
);

export const RainbowButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <RainbowButtonUI>Rainbow Button</RainbowButtonUI>
    </div>
);

`,

  'liquid-fill-button': `"use client";

import React from "react";
import { motion, useAnimation } from "motion/react";
import { cn } from "../../lib/utils";

interface LiquidFillButtonProps {
    label?: string;
    className?: string;
    onClick?: () => void;
    baseColor?: string;
    liquidColor?: string;
}

export const LiquidFillButton = ({
    label = "Liquid Fill",
    className,
    onClick,
    baseColor = "#000000",
    liquidColor = "#06b6d4", // cyan-500
}: LiquidFillButtonProps) => {
    return (
        <div className="relative flex items-center justify-center p-20">
            <motion.button
                onClick={onClick}
                whileHover="hover"
                initial="initial"
                className={cn(
                    "relative px-10 py-4 rounded-2xl overflow-hidden border-2",
                    "bg-transparent font-bold tracking-wider uppercase transition-all duration-500",
                    "flex items-center justify-center min-w-[200px] group",
                    className
                )}
                style={{ borderColor: liquidColor, color: liquidColor }}
            >
                {/* Liquid Background Container */}
                <motion.div
                    className="absolute inset-0 pointer-events-none z-0"
                    variants={{
                        initial: { y: "100%" },
                        hover: { y: "0%" },
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 40,
                        damping: 15,
                    }}
                >
                    {/* Liquid Body */}
                    <div
                        className="absolute inset-x-0 bottom-0 top-2"
                        style={{ backgroundColor: liquidColor }}
                    />

                    {/* SVG Wave */}
                    <div className="absolute top-0 left-0 w-full h-12 -translate-y-full overflow-hidden">
                        <motion.svg
                            viewBox="0 0 1200 120"
                            className="absolute bottom-0 left-0 w-[200%] h-full"
                            style={{ fill: liquidColor }}
                            animate={{
                                x: ["0%", "-50%"],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        >
                            <path d="M0,0 C150,0 200,100 300,100 C400,100 450,0 600,0 C750,0 800,100 900,100 C1000,100 1050,0 1200,0 V120 H0 Z" />
                        </motion.svg>

                        {/* Secondary Wave for better depth */}
                        <motion.svg
                            viewBox="0 0 1200 120"
                            className="absolute bottom-0 left-0 w-[200%] h-full opacity-50"
                            style={{ fill: liquidColor }}
                            animate={{
                                x: ["-50%", "0%"],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        >
                            <path d="M0,50 C150,50 200,120 300,120 C400,120 450,50 600,50 C750,50 800,120 900,120 C1000,120 1050,50 1200,50 V120 H0 Z" />
                        </motion.svg>
                    </div>
                </motion.div>

                {/* Label */}
                <motion.span
                    className="relative z-10 transition-colors duration-500"
                    variants={{
                        initial: { color: liquidColor },
                        hover: { color: "#ffffff" },
                    }}
                >
                    {label}
                </motion.span>

                {/* Subtle outer glow */}
                <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0"
                    style={{
                        boxShadow: \`0 0 20px \${liquidColor}80\`,
                    }}
                    variants={{
                        hover: { opacity: 1 }
                    }}
                />
            </motion.button>
        </div>
    );
};
`,

  'blur-text': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

  'blur-in-text': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

  'fade-text': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

  'dock-text': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

  'font-weight': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

  'font-weight-text': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

  'gradual-spacing': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

  'letter-pull-up': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

  'multi-direction-slide': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

  'scale-letter': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

  'separate-away': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

  'wavy-text': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

  'word-pull-up': `import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className={className}
                >
                    {char === " " ? "\\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
`,

'3d-hero': `import React, { useState, useEffect, useCallback } from 'react';
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
    IMAGES.forEach((img) => {
      const image = new Image();
      image.src = img.src;
    });
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
        handleResize();
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
    setTimeout(() => { setIsAnimating(false); }, 650);
  }, [isAnimating]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate('prev');
      else if (e.key === 'ArrowRight') navigate('next');
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
        return { transform: \`translateX(-50%) scale(\${isMobile ? 1.25 : 1.68})\`, filter: 'blur(0px)', opacity: 1, zIndex: 20, left: '50%', height: isMobile ? '60%' : '92%', bottom: isMobile ? '22%' : '0%', transition: baseTransition, willChange };
      case 'left':
        return { transform: 'translateX(-50%) scale(1)', filter: 'blur(2px)', opacity: 0.85, zIndex: 10, left: isMobile ? '20%' : '30%', height: isMobile ? '16%' : '28%', bottom: isMobile ? '32%' : '12%', transition: baseTransition, willChange };
      case 'right':
        return { transform: 'translateX(-50%) scale(1)', filter: 'blur(2px)', opacity: 0.85, zIndex: 10, left: isMobile ? '80%' : '70%', height: isMobile ? '16%' : '28%', bottom: isMobile ? '32%' : '12%', transition: baseTransition, willChange };
      case 'back':
        return { transform: 'translateX(-50%) scale(1)', filter: 'blur(4px)', opacity: 1, zIndex: 5, left: '50%', height: isMobile ? '13%' : '22%', bottom: isMobile ? '32%' : '12%', transition: baseTransition, willChange };
      default:
        return {};
    }
  };

  const grainUri = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E";

  return (
    <div className="relative w-full overflow-hidden" style={{ backgroundColor: IMAGES[activeIndex].bg, transition: 'background-color 650ms cubic-bezier(0.4,0,0.2,1)', fontFamily: "'Inter', sans-serif" }}>
      <div className="relative w-full overflow-hidden" style={{ height: '100vh' }}>
        <div className="absolute inset-0 pointer-events-none z-50" style={{ opacity: 0.4, backgroundImage: \`url("\${grainUri}")\`, backgroundSize: '200px 200px', backgroundRepeat: 'repeat' }} />
        <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none z-[2]" style={{ top: '18%', fontFamily: "'Anton', sans-serif", fontSize: 'clamp(90px, 28vw, 380px)', fontWeight: 900, color: 'white', opacity: 1, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
          3D SHAPE
        </div>
        <div className="absolute top-6 left-4 sm:left-8 z-[60] text-xs font-semibold uppercase text-white opacity-90" style={{ letterSpacing: '0.18em' }}>TOONHUB</div>
        <div className="absolute inset-0 z-[3]">
          {IMAGES.map((img, idx) => {
            const role = getRole(idx);
            const roleStyle = getStyleForRole(role);
            return (
              <div key={idx} className="absolute" style={{ ...roleStyle, aspectRatio: '0.6 / 1' }}>
                <img src={img.src} alt={\`Character \${idx}\`} className="w-full h-full object-contain object-bottom" draggable={false} />
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24 z-[60] max-w-[320px]">
          <p className="font-bold uppercase tracking-widest mb-2 sm:mb-3 text-base sm:text-[22px] text-white opacity-95" style={{ letterSpacing: '0.02em' }}>TOONHUB FIGURINES</p>
          <p className="hidden sm:block text-xs sm:text-sm text-white opacity-85 leading-[1.6] mb-4 sm:mb-5">The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.</p>
          <div className="flex gap-4">
            <button onClick={() => navigate('prev')} className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-transparent border-2 border-white transition-all duration-150 hover:scale-[1.08]"><ArrowLeft size={26} strokeWidth={2.25} className="text-white" /></button>
            <button onClick={() => navigate('next')} className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-transparent border-2 border-white transition-all duration-150 hover:scale-[1.08]"><ArrowRight size={26} strokeWidth={2.25} className="text-white" /></button>
          </div>
        </div>
        <div className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10 z-[60]">
          <a href="#" className="flex items-center gap-2 sm:gap-4 text-white opacity-95 hover:opacity-100 transition-opacity duration-200" style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(20px, 4vw, 56px)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1, textTransform: 'uppercase', textDecoration: 'none' }}>
            DISCOVER IT <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8" strokeWidth={2.25} />
          </a>
        </div>
      </div>
    </div>
  );
}`,

  'hacker-background': `import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export interface HackerBackgroundProps {
    color?: string;
    fontSize?: number;
    className?: string;
    speed?: number;
}

export const HackerBackground = ({
    color = '#0F0',
    fontSize = 15,
    className = "",
    speed = 1
}: HackerBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.parentElement?.clientWidth || 400;
        let height = canvas.height = canvas.parentElement?.clientHeight || 400;

        const columns = Math.floor(width / 20);
        const drops: number[] = new Array(columns).fill(1);
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\$+-*/=%\\"'#&_(),.;:?!\\\\|{ }<>[]^~";

        let animationFrameId: number;

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = color;
            ctx.font = \`\${fontSize}px monospace\`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);

                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += speed;
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = canvas.width = canvas.parentElement?.clientWidth || 400;
            height = canvas.height = canvas.parentElement?.clientHeight || 400;
        };

        window.addEventListener('resize', handleResize);
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={cn("w-full h-full bg-black relative overflow-hidden", className)}>
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
};
`,

  'lines-background': `"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

function FloatingPaths({ position, pathColor = "currentColor", opacity = 0.1 }: { position: number, pathColor?: string, opacity?: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: \`M-\${380 - i * 5 * position} -\${189 + i * 6}C-\${380 - i * 5 * position
            } -\${189 + i * 6} -\${312 - i * 5 * position} \${216 - i * 6} \${152 - i * 5 * position
            } \${343 - i * 6}C\${616 - i * 5 * position} \${470 - i * 6} \${684 - i * 5 * position
            } \${875 - i * 6} \${684 - i * 5 * position} \${875 - i * 6}\`,
        color: \`rgba(15,23,42,\${0.1 + i * 0.03})\`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-white"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke={pathColor}
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export interface BackgroundPathsProps {
    title?: string;
    className?: string;
    pathColor?: string;
    opacity?: number;
}

export function BackgroundPaths({
    title = "UI HUB",
    className = "",
    pathColor = "currentColor",
    opacity = 1
}: BackgroundPathsProps) {
    const words = title.split(" ");

    return (
        <div className={cn("relative min-h-[400px] h-full w-full flex items-center justify-center overflow-hidden bg-black", className)}>
            <div className="absolute inset-0" style={{ opacity }}>
                <FloatingPaths position={1} pathColor={pathColor} />
                <FloatingPaths position={-1} pathColor={pathColor} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-4 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={\`\${wordIndex}-\${letterIndex}\`}
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay:
                                                wordIndex * 0.1 +
                                                letterIndex * 0.03,
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                        }}
                                        className="inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-neutral-100 to-neutral-400"
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>


                </motion.div>
            </div>
        </div>
    );
}

export default BackgroundPaths;
`,

  'hoodiebot': `import React, { useState, useEffect, useRef, useCallback } from 'react';
import Logo from './Logo';


/* ─── Web Audio API – Robotic sound synthesizer ─── */
const playRobotSound = (type: 'click' | 'wave' | 'think') => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const now = ctx.currentTime;

        if (type === 'click') {
            // Sci-fi boop-beep click sound
            const notes = [523, 659, 784, 1046];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = i % 2 === 0 ? 'square' : 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.07);
                gain.gain.setValueAtTime(0.12, now + i * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.12);
                osc.start(now + i * 0.07);
                osc.stop(now + i * 0.07 + 0.15);
            });
            // Extra bass punch
            const bass = ctx.createOscillator();
            const bassGain = ctx.createGain();
            bass.connect(bassGain); bassGain.connect(ctx.destination);
            bass.type = 'sawtooth'; bass.frequency.setValueAtTime(80, now);
            bassGain.gain.setValueAtTime(0.09, now); bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            bass.start(now); bass.stop(now + 0.2);
        } else if (type === 'wave') {
            // Happy ascending arpeggio
            [523, 659, 784, 1046, 1318].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.08);
                gain.gain.setValueAtTime(0.1, now + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
                osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.2);
            });
        } else {
            // Soft thinking hum
            const osc = ctx.createOscillator();
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            const gain = ctx.createGain();
            lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'sine'; osc.frequency.setValueAtTime(220, now);
            lfo.type = 'sine'; lfo.frequency.setValueAtTime(4, now);
            lfoGain.gain.setValueAtTime(30, now);
            gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            lfo.start(now); osc.start(now);
            lfo.stop(now + 0.6); osc.stop(now + 0.6);
        }
    } catch (_) { /* AudioContext unavailable */ }
};

/* ─── Messages pool ─── */
const BOT_MESSAGES = [
    "Beep boop! Hello! 👋",
    "I'm HoodieBot 🤖",
    "Need UI help?",
    "Let's build something! ✨",
    "Click me again! 😄",
    "Processing... done! ⚡",
    "UI HUB powers me 💚",
    "Happy to assist! 🚀",
];

/* ─── Thinking phrases ─── */
const THINK_PHRASES = ["Thinking...", "Processing...", "Analyzing...", "Computing...", "Loading AI..."];

/* ─── Features ─── */
const FEATURES = [
    { icon: '⚡', title: 'Instant Preview', desc: 'Live rendering with zero setup required', color: '#60a5fa' },
    { icon: '🎨', title: 'Design System', desc: 'Premium UI tokens — colors, fonts, animations', color: '#a78bfa' },
    { icon: '🤖', title: 'AI-Powered', desc: 'HoodieBot assists your UI workflow', color: '#34d399' },
];

/* ══════════════════════════════════════════ */
/*             SOUND WAVE VISUAL             */
/* ══════════════════════════════════════════ */
const SoundWave: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 24, padding: '0 4px' }}>
            {[3, 5, 8, 5, 3, 6, 9, 6, 3, 5, 8, 5, 3].map((h, i) => (
                <div key={i} style={{
                    width: 2.5,
                    height: h * 2,
                    borderRadius: 2,
                    background: 'linear-gradient(180deg, #ff4444, #ff8800)',
                    boxShadow: '0 0 4px rgba(255,68,68,0.6)',
                    animation: \`hb-wave-bar 0.5s ease-in-out infinite\`,
                    animationDelay: \`\${i * 0.05}s\`,
                }} />
            ))}
        </div>
    );
};

/* ══════════════════════════════════════════ */
/*           THINKING INDICATOR              */
/* ══════════════════════════════════════════ */
const ThinkingBubble: React.FC<{ phrase: string }> = ({ phrase }) => (
    <div style={{
        padding: '8px 14px',
        borderRadius: '12px 12px 4px 12px',
        background: 'rgba(15,15,30,0.9)',
        border: '1px solid rgba(255,68,68,0.2)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        animation: 'hb-think-bubble 0.3s ease-out both',
    }}>
        {/* Spinning gear */}
        <div style={{ fontSize: 13, animation: 'hb-spin 1.5s linear infinite', display: 'inline-block' }}>⚙️</div>
        <span style={{ fontSize: 11, color: 'rgba(255,200,200,0.8)', fontWeight: 600, letterSpacing: '0.05em' }}>
            {phrase}
        </span>
        {/* Dot animation */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
                <div key={i} style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#ff4444',
                    boxShadow: '0 0 6px #ff4444',
                    animation: \`hb-dot-jump 1s ease-in-out infinite\`,
                    animationDelay: \`\${i * 0.18}s\`,
                }} />
            ))}
        </div>
    </div>
);

/* ══════════════════════════════════════════ */
/*              ROBOT FIGURE                 */
/* ══════════════════════════════════════════ */
const RobotFigure: React.FC<{
    isWaving: boolean;
    eyeBlink: boolean;
    mood: 'idle' | 'happy' | 'excited' | 'thinking';
    isClicked: boolean;
    isThinking: boolean;
    size?: number;
}> = ({ isWaving, eyeBlink, mood, isClicked, isThinking, size = 1 }) => {
    const s = (v: number) => v * size;

    const eyeColor = mood === 'excited' ? '#ffcc00'
        : mood === 'thinking' ? '#60a5fa'
        : '#ff4444';
    const eyeGlow = mood === 'excited' ? '0 0 8px #ffcc00, 0 0 18px #ff8800'
        : mood === 'thinking' ? '0 0 8px #60a5fa, 0 0 18px #3b82f6'
        : '0 0 6px #ff4444, 0 0 14px #ff2222';

    return (
        <div style={{
            position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            transform: isClicked ? 'scale(1.18) rotate(-3deg)' : 'scale(1)',
            transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
            {/* Thinking brain particles */}
            {isThinking && (
                <div style={{ position: 'absolute', top: s(-20), left: '50%', pointerEvents: 'none' }}>
                    {['💭', '⚡', '✨'].map((em, i) => (
                        <div key={i} style={{
                            position: 'absolute', fontSize: s(10),
                            animation: \`hb-think-particle 2s ease-in-out infinite\`,
                            animationDelay: \`\${i * 0.65}s\`,
                            left: \`\${(i - 1) * s(24)}px\`,
                        }}>{em}</div>
                    ))}
                </div>
            )}

            <div style={{ animation: 'hb-float 3.2s ease-in-out infinite' }}>
                <div style={{ animation: isThinking ? 'hb-think-tilt 1.5s ease-in-out infinite' : 'hb-body-tilt 4s ease-in-out infinite' }}>

                    {/* HEAD + HOOD */}
                    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
                        <div style={{
                            position: 'absolute', top: s(-3), width: s(72), height: s(78),
                            borderRadius: '50% 50% 40% 40%',
                            background: 'linear-gradient(180deg,#555 0%,#3a3a3a 100%)',
                            boxShadow: \`0 \${s(6)}px \${s(20)}px rgba(0,0,0,0.6),inset \${s(-6)}px \${s(-3)}px \${s(14)}px rgba(0,0,0,0.4)\`,
                        }} />
                        <div style={{
                            position: 'relative', width: s(66), height: s(72),
                            borderRadius: '50% 50% 38% 38%',
                            background: 'linear-gradient(155deg,#888 0%,#666 30%,#555 65%,#444 100%)',
                            boxShadow: \`0 \${s(5)}px \${s(18)}px rgba(0,0,0,0.5),inset \${s(-5)}px \${s(-3)}px \${s(12)}px rgba(0,0,0,0.35),inset \${s(3)}px \${s(3)}px \${s(10)}px rgba(255,255,255,0.07)\`,
                            zIndex: 2,
                        }}>
                            <div style={{ position: 'absolute', top: s(6), left: s(9), width: s(20), height: s(13), borderRadius: '50%', background: 'rgba(255,255,255,0.09)', transform: 'rotate(-18deg)' }} />
                            {/* Face visor */}
                            <div style={{
                                position: 'absolute', bottom: s(4), left: '50%', transform: 'translateX(-50%)',
                                width: s(44), height: s(38),
                                borderRadius: '40% 40% 35% 35%',
                                background: 'linear-gradient(160deg,#0a0a0a 0%,#111 50%,#080808 100%)',
                                boxShadow: \`inset 0 \${s(2)}px \${s(8)}px rgba(0,0,0,0.8),0 \${s(2)}px \${s(6)}px rgba(0,0,0,0.6)\`,
                                zIndex: 4, overflow: 'hidden',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: s(7),
                            }}>
                                {/* Scan line */}
                                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
                                    <div style={{ position: 'absolute', left: 0, right: 0, height: s(1.5), background: \`linear-gradient(90deg,transparent,\${eyeColor}80,transparent)\`, animation: 'hb-scan 2.5s ease-in-out infinite', animationDelay: '1s', transition: 'background 0.3s' }} />
                                </div>
                                {/* Eyes */}
                                {[0, 1].map(i => (
                                    <div key={i} style={{
                                        width: eyeBlink ? s(10) : s(11),
                                        height: eyeBlink ? s(1.5) : s(8),
                                        borderRadius: eyeBlink ? '50%' : s(2.5),
                                        background: \`linear-gradient(135deg,\${eyeColor}99,\${eyeColor})\`,
                                        boxShadow: eyeGlow,
                                        animation: \`hb-eye-glow \${1.5 + i * 0.3}s ease-in-out infinite\`,
                                        transition: 'all 0.15s ease, background 0.3s, box-shadow 0.3s',
                                    }} />
                                ))}
                                {/* Added cute smile */}
                                <div style={{ position: 'absolute', bottom: s(6), left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: s(3) }}>
                                    <div style={{ width: s(2.5), height: s(2.5), borderRadius: '50%', background: eyeColor, boxShadow: eyeGlow, opacity: 0.8 }} />
                                    <div style={{ width: s(2.5), height: s(2.5), borderRadius: '50%', background: eyeColor, boxShadow: eyeGlow, opacity: 0.8, marginTop: s(1.5) }} />
                                    <div style={{ width: s(2.5), height: s(2.5), borderRadius: '50%', background: eyeColor, boxShadow: eyeGlow, opacity: 0.8 }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BODY */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: s(-6), position: 'relative', zIndex: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            {/* Left arm */}
                            <div style={{ width: s(15), height: s(44), borderRadius: \`\${s(8)}px \${s(8)}px \${s(10)}px \${s(10)}px\`, background: 'linear-gradient(180deg,#666 0%,#555 40%,#444 100%)', boxShadow: \`\${s(2)}px \${s(2)}px \${s(8)}px rgba(0,0,0,0.5)\`, marginTop: s(8), animation: isThinking ? 'hb-think-arm 1.5s ease-in-out infinite' : 'hb-idle-l 3s ease-in-out infinite', transformOrigin: 'top center', position: 'relative' }}>
                                <div style={{ position: 'absolute', bottom: s(-7), left: '50%', transform: 'translateX(-50%)', width: s(14), height: s(11), borderRadius: \`\${s(4)}px \${s(4)}px \${s(6)}px \${s(6)}px\`, background: 'linear-gradient(180deg,#1a1a1a,#0d0d0d)' }} />
                            </div>
                            {/* Torso */}
                            <div style={{ width: s(58), height: s(56), borderRadius: \`\${s(10)}px \${s(10)}px \${s(13)}px \${s(13)}px\`, background: 'linear-gradient(155deg,#777 0%,#666 25%,#555 60%,#444 100%)', boxShadow: \`0 \${s(6)}px \${s(20)}px rgba(0,0,0,0.6),inset \${s(-6)}px \${s(-3)}px \${s(16)}px rgba(0,0,0,0.3),inset \${s(3)}px \${s(3)}px \${s(10)}px rgba(255,255,255,0.07)\`, position: 'relative' }}>
                                <div style={{ position: 'absolute', bottom: s(10), left: '50%', transform: 'translateX(-50%)', width: s(32), height: s(17), borderRadius: \`\${s(7)}px \${s(7)}px \${s(11)}px \${s(11)}px\`, background: 'linear-gradient(180deg,#4a4a4a 0%,#3a3a3a 100%)', boxShadow: \`inset 0 \${s(2)}px \${s(6)}px rgba(0,0,0,0.4)\` }} />
                                <div style={{ position: 'absolute', top: s(4), left: '33%', width: s(1.5), height: s(22), background: 'rgba(0,0,0,0.28)', borderRadius: s(2), transform: 'rotate(5deg)' }} />
                                <div style={{ position: 'absolute', top: s(4), right: '33%', width: s(1.5), height: s(22), background: 'rgba(0,0,0,0.28)', borderRadius: s(2), transform: 'rotate(-5deg)' }} />
                                {/* Chest LED - pulses when thinking */}
                                <div style={{ position: 'absolute', top: s(13), left: '50%', transform: 'translateX(-50%)', width: s(6), height: s(6), borderRadius: '50%', background: eyeColor, boxShadow: eyeGlow, transition: 'all 0.3s ease', animation: isThinking ? 'hb-chest-think 0.8s ease-in-out infinite' : undefined }} />
                                <div style={{ position: 'absolute', top: 0, right: 0, width: s(14), height: '100%', borderRadius: \`0 \${s(10)}px \${s(13)}px 0\`, background: 'linear-gradient(90deg,transparent,rgba(0,0,0,0.22))' }} />
                            </div>
                            {/* Right arm */}
                            <div style={{ width: s(15), height: s(44), borderRadius: \`\${s(8)}px \${s(8)}px \${s(10)}px \${s(10)}px\`, background: 'linear-gradient(180deg,#666 0%,#555 40%,#444 100%)', boxShadow: \`\${s(-2)}px \${s(2)}px \${s(8)}px rgba(0,0,0,0.5)\`, marginTop: s(8), animation: isWaving ? 'hb-wave-arm 1.8s ease-in-out' : isThinking ? 'hb-think-arm-r 1.5s ease-in-out infinite' : 'hb-idle-r 3s ease-in-out infinite', transformOrigin: 'top center', position: 'relative' }}>
                                <div style={{ position: 'absolute', bottom: s(-7), left: '50%', transform: 'translateX(-50%)', width: s(14), height: s(11), borderRadius: \`\${s(4)}px \${s(4)}px \${s(6)}px \${s(6)}px\`, background: 'linear-gradient(180deg,#1a1a1a,#0d0d0d)' }} />
                            </div>
                        </div>
                    </div>

                    {/* LEGS */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: s(5), marginTop: s(3), position: 'relative', zIndex: 4 }}>
                        {[0, 1].map(i => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'hb-leg 1.5s ease-in-out infinite', animationDelay: \`\${i * 0.75}s\` }}>
                                <div style={{ width: s(20), height: s(28), borderRadius: \`\${s(5)}px \${s(5)}px \${s(3)}px \${s(3)}px\`, background: 'linear-gradient(180deg,#1a1a1a 0%,#111 100%)', boxShadow: \`0 \${s(4)}px \${s(10)}px rgba(0,0,0,0.7)\` }} />
                                <div style={{ width: s(27), height: s(11), borderRadius: s(4), background: 'linear-gradient(135deg,#f0e8e0 0%,#d8cfc8 50%,#b8b0a8 100%)', boxShadow: \`0 \${s(3)}px \${s(10)}px rgba(0,0,0,0.6)\`, marginLeft: i === 0 ? s(-3) : s(3), overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ position: 'absolute', bottom: s(2), left: s(3), right: s(3), height: s(2.5), borderRadius: s(2), background: 'rgba(255,100,100,0.5)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Ground shadow */}
            <div style={{ width: s(56), height: s(10), borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,0,0,0.55) 0%,transparent 70%)', animation: 'hb-pulse-shadow 3.2s ease-in-out infinite', marginTop: s(4) }} />
        </div>
    );
};

/* ══════════════════════════════════════════ */
/*               MAIN COMPONENT              */
/* ══════════════════════════════════════════ */
const HoodieBot: React.FC = () => {
    const [isWaving, setIsWaving] = useState(false);
    const [eyeBlink, setEyeBlink] = useState(false);
    const [mood, setMood] = useState<'idle' | 'happy' | 'excited' | 'thinking'>('thinking');
    const [isClicked, setIsClicked] = useState(false);
    const [msgIndex, setMsgIndex] = useState(0);
    const [showMsg, setShowMsg] = useState(false);
    const [isThinking, setIsThinking] = useState(true); // ON by default
    const [thinkPhrase, setThinkPhrase] = useState(0);
    const [soundActive, setSoundActive] = useState(false);
    const [particles, setParticles] = useState<{ id: number; angle: number; color: string; dist: number }[]>([]);
    const [clickCount, setClickCount] = useState(0);
    const [isMobile, setIsMobile]     = useState(false);
    const thinkRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    // Eye blink
    useEffect(() => {
        const blink = setInterval(() => {
            setEyeBlink(true);
            setTimeout(() => setEyeBlink(false), 140);
        }, 3000);
        return () => clearInterval(blink);
    }, []);

    // Cycle thinking phrases
    useEffect(() => {
        const t = setInterval(() => {
            setThinkPhrase(p => (p + 1) % THINK_PHRASES.length);
        }, 1800);
        return () => clearInterval(t);
    }, []);


    // Particle burst on click
    const spawnParticles = useCallback(() => {
        const colors = ['#ff4444', '#ff8800', '#ffcc00', '#60a5fa', '#a78bfa', '#34d399', '#f472b6'];
        const newP = Array.from({ length: 12 }, (_, i) => ({
            id: Date.now() + i,
            angle: (360 / 12) * i + Math.random() * 20,
            color: colors[i % colors.length],
            dist: 40 + Math.random() * 40,
        }));
        setParticles(newP);
        setTimeout(() => setParticles([]), 900);
    }, []);

    const handleBotClick = () => {
        const count = clickCount + 1;
        setClickCount(count);

        // Play sound
        playRobotSound('click');
        setSoundActive(true);
        setTimeout(() => setSoundActive(false), 800);

        // Visual effects
        setIsClicked(true);
        setIsWaving(true);
        setMood('excited');
        setIsThinking(false);
        setMsgIndex(prev => (prev + 1) % BOT_MESSAGES.length);
        setShowMsg(true);
        spawnParticles();

        setTimeout(() => setIsClicked(false), 300);
        setTimeout(() => {
            setIsWaving(false);
            setMood('thinking');
            setIsThinking(true);
        }, 2200);
        setTimeout(() => setShowMsg(false), 3800);
    };

    return (
        <div style={{
            width: '100%', height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '520px' : '100%',
            background: 'radial-gradient(ellipse at 18% 55%,#0e1525 0%,#090c18 55%,#050508 100%)',
            position: 'relative', overflowX: 'hidden', overflowY: isMobile ? 'auto' : 'hidden',
            fontFamily: "'Inter','Segoe UI',sans-serif",
            display: 'flex', flexDirection: 'column',
            scrollBehavior: 'smooth'
        }}>

            <div style={{
                position: 'absolute',
                top: isMobile ? 12 : 24,
                right: isMobile ? 12 : 24,
                zIndex: 100
            }}>
                <Logo className="w-6 h-6" showText={true} color="#ff4444" />
            </div>

            {/* ── All keyframe animations ── */}
            <style>{\`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap');

                @keyframes hb-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
                @keyframes hb-wave-arm { 0%{transform:rotate(0deg)} 20%{transform:rotate(-45deg)} 40%{transform:rotate(-5deg)} 60%{transform:rotate(-45deg)} 80%{transform:rotate(-12deg)} 100%{transform:rotate(0deg)} }
                @keyframes hb-idle-r { 0%,100%{transform:rotate(8deg)} 50%{transform:rotate(14deg)} }
                @keyframes hb-idle-l { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(-14deg)} }
                @keyframes hb-think-arm { 0%,100%{transform:rotate(-20deg)} 50%{transform:rotate(-8deg)} }
                @keyframes hb-think-arm-r { 0%,100%{transform:rotate(20deg)} 50%{transform:rotate(8deg)} }
                @keyframes hb-eye-glow { 0%,100%{opacity:1} 50%{opacity:0.7} }
                @keyframes hb-scan { 0%,100%{transform:translateY(-30px);opacity:0} 20%{opacity:0.55} 80%{opacity:0.55} 99%{transform:translateY(30px)} }
                @keyframes hb-pulse-shadow { 0%,100%{transform:scaleX(1);opacity:0.4} 50%{transform:scaleX(0.6);opacity:0.18} }
                @keyframes hb-leg { 0%,100%{transform:translateY(0)} 50%{transform:translateY(2px)} }
                @keyframes hb-body-tilt { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(1.5deg)} 75%{transform:rotate(-1.5deg)} }
                @keyframes hb-think-tilt { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
                @keyframes hb-chest-think { 0%,100%{opacity:1;transform:translateX(-50%) scale(1)} 50%{opacity:0.3;transform:translateX(-50%) scale(0.6)} }
                @keyframes hb-think-particle { 0%{transform:translate(0,0) scale(0);opacity:0} 20%{opacity:1;transform:translate(0,-8px) scale(1)} 100%{transform:translate(0,-28px) scale(0.4);opacity:0} }
                @keyframes hb-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes hb-dot-jump { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-4px);opacity:1} }
                @keyframes hb-think-bubble { from{opacity:0;transform:translateY(6px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
                @keyframes hb-msg-in { from{opacity:0;transform:translateY(8px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
                @keyframes hb-bot-in { from{opacity:0;transform:scale(0.5) translateY(40px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes hb-particle-burst { 0%{transform:translate(0,0) scale(1.2);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0} }
                @keyframes hb-ring-out { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.8);opacity:0} }
                @keyframes hb-wave-bar { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.35)} }
                @keyframes hb-orb { 0%,100%{transform:translate(0,0) scale(1);opacity:.1} 50%{transform:translate(18px,-12px) scale(1.2);opacity:.18} }
                @keyframes hb-grid-drift { 0%{background-position:0 0} 100%{background-position:44px 44px} }
                @keyframes hb-title-glow { 0%,100%{text-shadow:none} 50%{text-shadow:0 0 30px rgba(255,68,68,0.4)} }
                @keyframes hb-bracket-flash { 0%,100%{opacity:0.3} 50%{opacity:0.8;box-shadow:0 0 8px rgba(255,68,68,0.5)} }
                @keyframes hb-dot-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
                @keyframes hb-title-in { from{opacity:0;transform:translateY(-18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes hb-card-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

                .hb-feature-card { transition:transform 0.25s ease,border-color 0.25s ease,box-shadow 0.25s ease; }
                .hb-feature-card:hover { transform:translateY(-5px) !important; border-color:rgba(255,255,255,0.12) !important; box-shadow:0 12px 28px rgba(0,0,0,0.4) !important; }
                .hb-cta-btn { transition:transform 0.2s ease,box-shadow 0.2s ease; }
                .hb-cta-btn:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(255,68,68,0.45) !important; }
                .hb-bot-wrap { transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }
                .hb-bot-wrap:hover { transform:scale(1.04); }
            \`}</style>

            {/* ── Ambient BG ── */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,68,68,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,68,68,0.022) 1px,transparent 1px)', backgroundSize: '44px 44px', animation: 'hb-grid-drift 10s linear infinite' }} />
                <div style={{ position: 'absolute', top: '8%', left: '3%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(96,165,250,0.07) 0%,transparent 70%)', animation: 'hb-orb 7s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '25%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 70%)', animation: 'hb-orb 9s ease-in-out infinite reverse' }} />
                <div style={{ position: 'absolute', top: '35%', right: '3%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,68,68,0.07) 0%,transparent 70%)', animation: 'hb-orb 6s ease-in-out infinite 2s' }} />
            </div>

            {/* ── Main left content ── */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: isMobile ? '40px 20px' : 'clamp(24px, 4vw, 60px)',
                paddingBottom: isMobile ? 180 : 120,
                position: 'relative', zIndex: 1, maxWidth: 760
            }}>


                {/* Status badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.18)', width: 'fit-content', animation: 'hb-title-in 0.5s ease-out both' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4444', boxShadow: '0 0 8px #ff4444', animation: 'hb-dot-blink 1.4s ease-in-out infinite' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,120,120,0.8)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>3D CHATBOT — SERIES 01</span>
                </div>

                {/* Title */}
                <h1 style={{ fontSize: 'clamp(26px,3.8vw,52px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 14px 0', letterSpacing: '-0.03em', animation: 'hb-title-in 0.5s 0.08s ease-out both' }}>
                    Meet{' '}
                    <span style={{ background: 'linear-gradient(135deg,#ff7b7b 0%,#ff9f45 40%,#ff4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'hb-title-glow 3s ease-in-out infinite' }}>HoodieBot</span>
                    <br />
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.54em', fontWeight: 600, letterSpacing: '0' }}>Your 3D AI companion, always thinking</span>
                </h1>

                {/* Description */}
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.48)', lineHeight: 1.75, margin: '0 0 36px 0', maxWidth: 460, fontWeight: 400, animation: 'hb-title-in 0.5s 0.16s ease-out both' }}>
                    A premium CSS-animated 3D robot with thinking mode, sound effects, and click reactions. Click the bot in the corner to hear it — it waves, beeps, and reacts to every tap.
                </p>

                {/* Feature cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, animation: 'hb-card-in 0.5s 0.26s ease-out both' }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} className="hb-feature-card" style={{ padding: '16px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', cursor: 'default' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: \`\${f.color}14\`, border: \`1px solid \${f.color}28\`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, marginBottom: 10 }}>{f.icon}</div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', marginBottom: 5, letterSpacing: '-0.01em' }}>{f.title}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 28, animation: 'hb-card-in 0.5s 0.38s ease-out both' }}>
                    <button className="hb-cta-btn" onClick={handleBotClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 26px', borderRadius: 11, background: 'linear-gradient(135deg,#ff4444,#ff7800)', border: 'none', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,68,68,0.28)', letterSpacing: '0.01em' }}>
                        🤖 Chat with HoodieBot
                    </button>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em' }}>or click the bot →</span>
                </div>
            </div>

            {/* ════════════════════════════════════════ */}
            {/*   BOTTOM-RIGHT FLOATING BOT WIDGET      */}
            {/* ════════════════════════════════════════ */}
            <div style={{
                position: 'absolute',
                bottom: isMobile ? 15 : 20,
                right: isMobile ? '50%' : 24,
                transform: isMobile ? 'translateX(50%)' : 'none',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMobile ? 'center' : 'flex-end',
                gap: 8,
                animation: 'hb-bot-in 0.6s 0.6s cubic-bezier(0.34,1.56,0.64,1) both'
            }}>



                {/* Thinking bubble — visible by default */}
                {isThinking && !showMsg && (
                    <ThinkingBubble phrase={THINK_PHRASES[thinkPhrase]} />
                )}

                {/* Chat message on click */}
                {showMsg && (
                    <div style={{ padding: '10px 15px', borderRadius: '13px 13px 4px 13px', background: 'rgba(18,18,32,0.95)', border: '1px solid rgba(255,68,68,0.28)', backdropFilter: 'blur(16px)', color: '#fff', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 8px 28px rgba(0,0,0,0.45)', animation: 'hb-msg-in 0.3s ease-out both' }}>
                        {BOT_MESSAGES[msgIndex]}
                    </div>
                )}

                {/* Sound wave bars */}
                {soundActive && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 9, color: 'rgba(255,68,68,0.6)', letterSpacing: '0.1em', marginRight: 4 }}>♪</span>
                        <SoundWave active={soundActive} />
                        <span style={{ fontSize: 9, color: 'rgba(255,68,68,0.6)', letterSpacing: '0.1em', marginLeft: 4 }}>♪</span>
                    </div>
                )}

                {/* Click burst rings */}
                {isClicked && [0, 1].map(i => (
                    <div key={i} style={{ position: 'absolute', bottom: 60, right: 44, width: 70, height: 70, borderRadius: '50%', border: '2px solid rgba(255,68,68,0.6)', animation: 'hb-ring-out 0.7s ease-out forwards', animationDelay: \`\${i * 0.18}s\`, pointerEvents: 'none' }} />
                ))}

                {/* Particle burst */}
                <div style={{ position: 'absolute', bottom: 80, right: 50, pointerEvents: 'none', width: 0, height: 0 }}>
                    {particles.map(p => {
                        const rad = (p.angle * Math.PI) / 180;
                        const tx = Math.cos(rad) * p.dist;
                        const ty = -Math.sin(rad) * p.dist;
                        return (
                            <div key={p.id} style={{
                                position: 'absolute',
                                width: 7, height: 7, borderRadius: '50%',
                                background: p.color,
                                boxShadow: \`0 0 8px \${p.color}\`,
                                '--tx': \`\${tx}px\`,
                                '--ty': \`\${ty}px\`,
                                animation: 'hb-particle-burst 0.75s ease-out forwards',
                            } as React.CSSProperties} />
                        );
                    })}
                </div>

                {/* THE ROBOT */}
                <button className="hb-bot-wrap" onClick={handleBotClick} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, outline: 'none', WebkitTapHighlightColor: 'transparent' }} title="Click HoodieBot!">
                    <RobotFigure isWaving={isWaving} eyeBlink={eyeBlink} mood={mood} isClicked={isClicked} isThinking={isThinking} size={0.82} />
                    {/* HOODIEBOT label */}
                    <div style={{ textAlign: 'center', marginTop: 5, fontFamily: "'Orbitron',sans-serif", fontSize: 9.5, fontWeight: 900, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.88)', textShadow: '0 0 10px rgba(255,68,68,0.65),0 0 22px rgba(255,68,68,0.35)', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 6, padding: '4px 10px', backdropFilter: 'blur(8px)' }}>
                        HOODIEBOT
                    </div>
                </button>

                {/* Click count badge */}
                {clickCount > 0 && (
                    <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,68,68,0.5)', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                        × {clickCount} interactions
                    </div>
                )}
            </div>

            {/* Corner decorations */}
            <div style={{ position: 'absolute', top: 18, right: 18, pointerEvents: 'none', zIndex: 2, width: 22, height: 22, borderTop: '2px solid rgba(255,68,68,0.3)', borderRight: '2px solid rgba(255,68,68,0.3)' }} />
            <div style={{ position: 'absolute', bottom: 18, left: 18, pointerEvents: 'none', zIndex: 2, width: 22, height: 22, borderBottom: '2px solid rgba(96,165,250,0.3)', borderLeft: '2px solid rgba(96,165,250,0.3)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,68,68,0.3),transparent)', pointerEvents: 'none', zIndex: 2 }} />
        </div>
    );
};

export default HoodieBot;
`,

  'smilo': `import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate } from 'framer-motion';
import Logo from './Logo';
import './Smilo.css';


/* ══════════════════════════════════════════════════════ */
/*                  SOUND – Warm Bell Chimes              */
/* ══════════════════════════════════════════════════════ */
const playChime = (type: 'click' | 'think' | 'happy') => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const master = ctx.createGain();
        const delay  = ctx.createDelay(0.4);
        const dGain  = ctx.createGain();
        delay.delayTime.value = 0.22;
        dGain.gain.value      = 0.16;
        delay.connect(dGain); dGain.connect(master); master.connect(ctx.destination);
        const t = ctx.currentTime;

        const bell = (freq: number, start: number, vol: number, dur: number) => {
            const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
            o1.connect(g); o2.connect(g); g.connect(master); g.connect(delay);
            o1.type = 'sine'; o1.frequency.value = freq;
            o2.type = 'sine'; o2.frequency.value = freq * 2.756;
            const g2 = ctx.createGain(); o2.connect(g2); g2.gain.value = 0.1;
            g.gain.setValueAtTime(0, t + start);
            g.gain.linearRampToValueAtTime(vol, t + start + 0.012);
            g.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
            o1.start(t + start); o1.stop(t + start + dur);
            o2.start(t + start); o2.stop(t + start + dur);
        };

        if (type === 'click') {
            [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => bell(f, i * 0.07, 0.16, 0.85));
            master.gain.setValueAtTime(0.7, t); master.gain.exponentialRampToValueAtTime(0.001, t + 1.05);
        } else if (type === 'happy') {
            [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => bell(f, i * 0.04, 0.1, 0.9));
            master.gain.setValueAtTime(0.6, t); master.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
        } else {
            bell(293.66, 0, 0.06, 0.8); bell(369.99, 0.1, 0.05, 0.7);
            master.gain.setValueAtTime(0.5, t); master.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        }
    } catch (_) {}
};

/* ── Data ── */
const MSGS   = ["Hi! I'm Smilo 😊", "Hello! ✨", "How can I help?", "Click me again~", "Let's build UI!", "Ready to go! ⚡", "UI HUB is 💙", "Beep boop~ 🤖"];
const THINKS = ["Thinking...", "Processing...", "Analyzing...", "Computing...", "Loading AI..."];
const FEATURES = [
    { icon: '◎', title: 'Framer Motion', desc: 'Mouse-reactive head, arm swing, eye blink — all via motion.div', color: '#7dd3fc' },
    { icon: '◈', title: 'Minimal Beauty', desc: 'Precise CSS class structure identical to production Robot3D', color: '#86efac' },
    { icon: '◉', title: 'Bell Audio', desc: 'Warm harmonic bell chimes with reverb delay on every click', color: '#c4b5fd' },
];

/* ══════════════════════════════════════════════════════ */
/*            SMILO ROBOT – Framer Motion driven          */
/* ══════════════════════════════════════════════════════ */
const SmiloRobot: React.FC<{
    mouseX: number; mouseY: number;
    isWaving: boolean; isClicked: boolean;
    mood: string;
}> = ({ mouseX, mouseY, isWaving, isClicked, mood }) => {

    // Spring-smoothed mouse-driven head rotation
    const rotY = useSpring(useMotionValue(mouseX * 20), { stiffness: 60, damping: 18 });
    const rotX = useSpring(useMotionValue(-mouseY * 14), { stiffness: 60, damping: 18 });
    const rotZ = useSpring(useMotionValue(mouseX * 5),  { stiffness: 50, damping: 20 });

    // Update springs on mouse change
    useEffect(() => {
        rotY.set(mouseX * 22);
        rotX.set(-mouseY * 14);
        rotZ.set(mouseX * 5);
    }, [mouseX, mouseY]);

    // Dynamic eye glow color by mood
    const eyeColor =
        mood === 'excited' ? '#facc15' :
        mood === 'thinking' ? '#67e8f9' :
        mood === 'happy'    ? '#4ade80' : '#a3e635';

    const antOrb =
        mood === 'excited' ? '#facc15' :
        mood === 'thinking' ? '#67e8f9' : '#a3e635';

    return (
        <div className="sm-root" style={{ transform: isClicked ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}>

            {/* ── ANTENNA (floats with head) ── */}
            <div className="sm-antenna-wrap">
                <motion.div
                    className="sm-antenna-orb"
                    animate={{
                        scale: [1, 1.4, 1],
                        boxShadow: [
                            \`0 0 10px \${antOrb}, 0 0 22px \${antOrb}88\`,
                            \`0 0 16px \${antOrb}, 0 0 36px \${antOrb}bb\`,
                            \`0 0 10px \${antOrb}, 0 0 22px \${antOrb}88\`,
                        ],
                    }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ background: \`radial-gradient(circle at 35% 30%, #fff 0%, \${antOrb} 55%, \${antOrb}88 100%)\` }}
                />
                <div className="sm-antenna-stem" />
            </div>

            {/* ── HEAD (mouse-driven 3-axis rotation) ── */}
            <motion.div
                className="sm-head"
                style={{
                    rotateY: rotY,
                    rotateX: rotX,
                    rotateZ: rotZ,
                    transformStyle: 'preserve-3d',
                    transformPerspective: 320,
                }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
                {/* Ears */}
                <div className="sm-ear sm-ear--l">
                    {[0,1,2,3].map(i => <div key={i} className="sm-ear-slat" />)}
                </div>
                <div className="sm-ear sm-ear--r">
                    {[0,1,2,3].map(i => <div key={i} className="sm-ear-slat" />)}
                </div>

                <div className="sm-head-shine" />
                <div className="sm-head-shine2" />

                {/* Visor */}
                <div className="sm-visor">
                    <div className="sm-visor-shine" />
                    <div className="sm-visor-scan" />

                    <div className="sm-pixel-face">
                        {/* Eyes — blink every 4s */}
                        <motion.div
                            className="sm-eyes"
                            animate={{ scaleY: [1, 0.07, 1] }}
                            transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.04, 0.09], ease: 'easeOut' }}
                        >
                            <motion.div
                                className="sm-eye"
                                style={{ background: eyeColor, transition: 'background 0.35s ease' }}
                                animate={{
                                    boxShadow: [
                                        \`0 0 6px \${eyeColor}, 0 0 14px \${eyeColor}88\`,
                                        \`0 0 10px \${eyeColor}, 0 0 22px \${eyeColor}\`,
                                        \`0 0 6px \${eyeColor}, 0 0 14px \${eyeColor}88\`,
                                    ]
                                }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <motion.div
                                className="sm-eye"
                                style={{ background: eyeColor, transition: 'background 0.35s ease' }}
                                animate={{
                                    boxShadow: [
                                        \`0 0 6px \${eyeColor}, 0 0 14px \${eyeColor}88\`,
                                        \`0 0 10px \${eyeColor}, 0 0 22px \${eyeColor}\`,
                                        \`0 0 6px \${eyeColor}, 0 0 14px \${eyeColor}88\`,
                                    ]
                                }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                            />
                        </motion.div>

                        {/* Pixel smile — dynamic based on mood */}
                        <div className="sm-smile" style={{ transition: 'transform 0.3s' }}>
                            {mood === 'thinking' ? (
                                <div className="sm-smile-row">
                                    <span className="px" style={{ width: 4, height: 4, background: eyeColor, boxShadow: \`0 0 4px \${eyeColor}\` }} />
                                    <span className="px" style={{ width: 4, height: 4, background: eyeColor, boxShadow: \`0 0 4px \${eyeColor}\` }} />
                                    <span className="px" style={{ width: 4, height: 4, background: eyeColor, boxShadow: \`0 0 4px \${eyeColor}\` }} />
                                    <span className="px" style={{ width: 4, height: 4, background: eyeColor, boxShadow: \`0 0 4px \${eyeColor}\` }} />
                                </div>
                            ) : (
                                <>
                                    <div className="sm-smile-row">
                                        <span className="px" style={{ width: 4, height: 4, background: eyeColor, boxShadow: \`0 0 4px \${eyeColor}\` }} />
                                        <span style={{ width: 4, height: 4 }} />
                                        <span style={{ width: 4, height: 4 }} />
                                        <span className="px" style={{ width: 4, height: 4, background: eyeColor, boxShadow: \`0 0 4px \${eyeColor}\` }} />
                                    </div>
                                    <div className="sm-smile-row" style={{ marginTop: -2 }}>
                                        <span style={{ width: 4, height: 4 }} />
                                        <span className="px" style={{ width: 4, height: 4, background: eyeColor, boxShadow: \`0 0 4px \${eyeColor}\` }} />
                                        <span className="px" style={{ width: 4, height: 4, background: eyeColor, boxShadow: \`0 0 4px \${eyeColor}\` }} />
                                        <span style={{ width: 4, height: 4 }} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── NECK ── */}
            <div className="sm-neck" />

            {/* ── ACCENT RING ── */}
            <motion.div
                className="sm-accent-ring"
                animate={{
                    boxShadow: [
                        \`0 0 10px \${eyeColor}88, 0 0 24px \${eyeColor}33\`,
                        \`0 0 16px \${eyeColor}cc, 0 0 36px \${eyeColor}66\`,
                        \`0 0 10px \${eyeColor}88, 0 0 24px \${eyeColor}33\`,
                    ],
                    background: [
                        \`linear-gradient(90deg, transparent, \${eyeColor}cc, \${eyeColor}, \${eyeColor}cc, transparent)\`,
                    ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* ── TORSO + ARMS ── */}
            <motion.div
                className="sm-torso-wrap"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            >
                {/* LEFT ARM */}
                <motion.div
                    className="sm-arm sm-arm--l"
                    animate={{ rotate: [0, -9, 0, 9, 0] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: '80% 5%' }}
                >
                    <div className="sm-arm-upper" />
                    <div className="sm-arm-joint" />
                    <div className="sm-arm-lower">
                        <div className="sm-fingers">
                            <div className="sm-finger" />
                            <div className="sm-finger" />
                            <div className="sm-finger" />
                        </div>
                    </div>
                </motion.div>

                {/* TORSO */}
                <div className="sm-torso">
                    <div className="sm-torso-shine" />
                    <div className="sm-ring sm-ring--top" />
                    <div className="sm-ring sm-ring--bot" />
                    <div className="sm-chest">
                        <motion.div
                            className="sm-chest-orb"
                            animate={{
                                boxShadow: [
                                    \`0 0 6px \${eyeColor}, 0 0 14px \${eyeColor}88\`,
                                    \`0 0 16px \${eyeColor}, 0 0 32px \${eyeColor}\`,
                                    \`0 0 6px \${eyeColor}, 0 0 14px \${eyeColor}88\`,
                                ],
                                background: eyeColor,
                            }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <div className="sm-chest-bars">
                            <div style={{ width: '100%' }} />
                            <div style={{ width: '70%' }} />
                            <div style={{ width: '85%' }} />
                        </div>
                    </div>
                </div>

                {/* RIGHT ARM — waves on click */}
                <motion.div
                    className="sm-arm sm-arm--r"
                    animate={isWaving
                        ? { rotate: [0, -55, -10, -55, -15, 0] }
                        : { rotate: [0, 9, 0, -9, 0] }
                    }
                    transition={isWaving
                        ? { duration: 1.6, ease: 'easeInOut' }
                        : { duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.28 }
                    }
                    style={{ transformOrigin: '20% 5%' }}
                >
                    <div className="sm-arm-upper" />
                    <div className="sm-arm-joint" />
                    <div className="sm-arm-lower">
                        <div className="sm-fingers">
                            <div className="sm-finger" />
                            <div className="sm-finger" />
                            <div className="sm-finger" />
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Ground glow shadow */}
            <div className="sm-shadow" />
        </div>
    );
};

/* ══════════════════════════════════════════════════════ */
/*                     MAIN PAGE                          */
/* ══════════════════════════════════════════════════════ */
const Smilo: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseX, setMouseX]       = useState(0);
    const [mouseY, setMouseY]       = useState(0);
    const [isWaving, setIsWaving]   = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [mood, setMood]           = useState<'idle'|'thinking'|'happy'|'excited'>('thinking');
    const [msgIndex, setMsgIndex]   = useState(0);
    const [showMsg, setShowMsg]     = useState(false);
    const [isThinking, setIsThinking] = useState(true);
    const [thinkIdx, setThinkIdx]   = useState(0);
    const [soundActive, setSoundActive] = useState(false);
    const [particles, setParticles] = useState<{id:number;angle:number;color:string;dist:number}[]>([]);
    const [clickCount, setClickCount] = useState(0);
    const [isMobile, setIsMobile]     = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    // Normalize mouse position -1 to +1 relative to container
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const r = containerRef.current?.getBoundingClientRect();
        if (!r) return;
        setMouseX(((e.clientX - r.left) / r.width  - 0.5) * 2);
        setMouseY(((e.clientY - r.top)  / r.height - 0.5) * 2);
    }, []);

    // Reset when mouse leaves
    const handleMouseLeave = useCallback(() => {
        setMouseX(0); setMouseY(0);
    }, []);

    // Eye blink — handled inside SmiloRobot via Framer Motion

    // Rotate thinking phrases
    useEffect(() => {
        const t = setInterval(() => setThinkIdx(p => (p + 1) % THINKS.length), 2100);
        return () => clearInterval(t);
    }, []);


    const spawnParticles = useCallback(() => {
        const cols = ['#86efac','#7dd3fc','#c4b5fd','#facc15','#f9a8d4','#ffffff'];
        const ps = Array.from({length:14},(_,i)=>({
            id: Date.now()+i,
            angle: (360/14)*i + Math.random()*18,
            color: cols[i % cols.length],
            dist: 36 + Math.random()*46,
        }));
        setParticles(ps);
        setTimeout(() => setParticles([]), 900);
    }, []);

    const handleClick = () => {
        setClickCount(c => c + 1);
        playChime('click');
        setSoundActive(true); setTimeout(() => setSoundActive(false), 900);
        setIsClicked(true);
        setIsWaving(true);
        setMood('excited');
        setIsThinking(false);
        setMsgIndex(p => (p + 1) % MSGS.length);
        setShowMsg(true);
        spawnParticles();
        setTimeout(() => setIsClicked(false), 280);
        setTimeout(() => { setIsWaving(false); setMood('thinking'); setIsThinking(true); }, 2200);
        setTimeout(() => setShowMsg(false), 4000);
    };

    const handleCTA = () => {
        playChime('happy');
        setIsWaving(true); setMood('happy'); setIsThinking(false);
        setMsgIndex(0); setShowMsg(true);
        setTimeout(() => { setIsWaving(false); setMood('thinking'); setIsThinking(true); }, 2200);
        setTimeout(() => setShowMsg(false), 4200);
    };

    const acc = mood==='excited'?'#facc15': mood==='thinking'?'#67e8f9': mood==='happy'?'#4ade80':'#a3e635';

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                width:'100%', height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '520px' : '100%',
                background:'radial-gradient(ellipse at 22% 48%,#08102a 0%,#060810 55%,#030410 100%)',
                position:'relative', overflowX:'hidden', overflowY: isMobile ? 'auto' : 'hidden',
                fontFamily:"'Inter','Segoe UI',sans-serif",
                display:'flex', flexDirection:'column',
                scrollBehavior: 'smooth'
            }}

        >
            <div style={{
                position: 'absolute',
                top: isMobile ? 12 : 24,
                right: isMobile ? 12 : 24,
                zIndex: 100
            }}>
                <Logo className="w-6 h-6" showText={true} color="#86efac" />
            </div>

            <style>{\`

                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap');
                @keyframes sm-orb { 0%,100%{transform:translate(0,0);opacity:.08} 50%{transform:translate(14px,-10px);opacity:.16} }
                @keyframes sm-grid{ 0%{background-position:0 0} 100%{background-position:48px 48px} }
                @keyframes sm-in  { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes sm-card{ from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
                @keyframes sm-bot { from{opacity:0;transform:scale(0.45) translateY(45px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes sm-msg { from{opacity:0;transform:translateY(8px) scale(0.9)} to{opacity:1;transform:none} }
                @keyframes sm-think-bbl { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
                @keyframes sm-spin{ from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes sm-dot { 0%,100%{transform:translateY(0);opacity:0.28} 50%{transform:translateY(-5px);opacity:1} }
                @keyframes sm-badge-dot { 0%,100%{opacity:1} 50%{opacity:0.18} }
                @keyframes sm-ring-out { 0%{transform:scale(1);opacity:0.65} 100%{transform:scale(3.4);opacity:0} }
                @keyframes sm-particle  { 0%{transform:translate(0,0) scale(1.1);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0} }
                @keyframes sm-wbar { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.25)} }
                @keyframes sm-glow{ 0%,100%{text-shadow:none} 50%{text-shadow:0 0 28px rgba(134,239,172,0.3)} }
                @keyframes sm-bracket { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
                .sm2-card:hover { transform:translateY(-5px)!important; border-color:rgba(255,255,255,0.11)!important; }
                .sm2-btn:hover  { transform:translateY(-2px); }
            \`}</style>

            {/* Ambient grid + orbs */}
            <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0}}>
                <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(134,239,172,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(134,239,172,0.014) 1px,transparent 1px)',backgroundSize:'48px 48px',animation:'sm-grid 14s linear infinite'}} />
                {[
                    {top:'8%',   left:'2%',   w:260, col:'rgba(134,239,172,0.07)', d:'7s'},
                    {top:'38%',  right:'4%',  w:180, col:'rgba(196,181,253,0.07)', d:'6s 2s'},
                    {bottom:'10%',left:'20%', w:210, col:'rgba(103,232,249,0.07)', d:'9s reverse'},
                ].map((o,i)=>(
                    <div key={i} style={{position:'absolute',top:o.top,bottom:(o as any).bottom,left:(o as any).left,right:(o as any).right,width:o.w,height:o.w,borderRadius:'50%',background:\`radial-gradient(circle,\${o.col} 0%,transparent 70%)\`,animation:\`sm-orb \${o.d} ease-in-out infinite\`}} />
                ))}
            </div>

            {/* ── Left content ── */}
            <div style={{
                flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
                padding: isMobile ? '40px 20px' : 'clamp(24px,4vw,56px)',
                paddingBottom: isMobile ? 180 : 130,
                position:'relative', zIndex:1, maxWidth:720
            }}>


                {/* Badge */}
                <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:20,padding:'5px 14px',borderRadius:999,background:'rgba(134,239,172,0.07)',border:'1px solid rgba(134,239,172,0.2)',width:'fit-content',animation:'sm-in 0.5s ease-out both'}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#86efac',boxShadow:'0 0 8px #86efac',animation:'sm-badge-dot 1.5s ease-in-out infinite'}} />
                    <span style={{fontSize:10,fontWeight:800,color:'rgba(134,239,172,0.8)',letterSpacing:'0.18em',textTransform:'uppercase'}}>3D CHATBOT — SMILO</span>
                </div>

                {/* Title */}
                <h1 style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:900,color:'#fff',lineHeight:1.1,margin:'0 0 14px 0',letterSpacing:'-0.03em',animation:'sm-in 0.5s 0.08s ease-out both'}}>
                    Meet{' '}
                    <span style={{background:'linear-gradient(135deg,#86efac 0%,#67e8f9 45%,#c4b5fd 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'sm-glow 3s ease-in-out infinite'}}>Smilo</span>
                    <br/>
                    <span style={{color:'rgba(255,255,255,0.32)',fontSize:'0.48em',fontWeight:600,letterSpacing:0}}>Move your mouse over Smilo to see it react</span>
                </h1>

                <p style={{fontSize:15,color:'rgba(255,255,255,0.42)',lineHeight:1.78,margin:'0 0 32px 0',maxWidth:440,animation:'sm-in 0.5s 0.16s ease-out both'}}>
                    A Framer Motion 3D robot with mouse-reactive head rotation. Smilo's eyes glow, arms swing, and it plays warm bell chimes on click — always watching from the corner.
                </p>

                {/* Feature cards */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,animation:'sm-card 0.5s 0.26s ease-out both'}}>
                    {FEATURES.map((f,i)=>(
                        <div key={i} className="sm2-card" style={{padding:'16px 14px',borderRadius:14,background:'rgba(255,255,255,0.022)',border:'1px solid rgba(255,255,255,0.06)',cursor:'default',transition:'transform .24s ease,border-color .24s ease'}}>
                            <div style={{width:36,height:36,borderRadius:9,background:\`\${f.color}12\`,border:\`1px solid \${f.color}25\`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:10,color:f.color}}>{f.icon}</div>
                            <div style={{fontSize:12.5,fontWeight:700,color:'#fff',marginBottom:5,letterSpacing:'-0.01em'}}>{f.title}</div>
                            <div style={{fontSize:11,color:'rgba(255,255,255,0.34)',lineHeight:1.55}}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{display:'flex',alignItems:'center',gap:16,marginTop:28,animation:'sm-card 0.5s 0.38s ease-out both'}}>
                    <button className="sm2-btn" onClick={handleCTA} style={{display:'flex',alignItems:'center',gap:8,padding:'11px 26px',borderRadius:11,background:'linear-gradient(135deg,#86efac,#67e8f9)',border:'none',color:'#041a0a',fontSize:13.5,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 20px rgba(134,239,172,0.28)',transition:'transform .2s ease,box-shadow .2s ease'}}>
                        😊 Chat with Smilo
                    </button>
                    <span style={{fontSize:11,color:'rgba(255,255,255,0.2)',letterSpacing:'0.08em'}}>or click the bot →</span>
                </div>
            </div>

            {/* ══════════════════════════════════════════ */}
            {/*     BOTTOM-RIGHT  SMILO WIDGET            */}
            {/* ══════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, scale: 0.4, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6, ease: [0.34,1.56,0.64,1] }}
                style={{
                    position:'absolute',
                    bottom: isMobile ? 15 : 18,
                    right: isMobile ? '50%' : 24,
                    transform: isMobile ? 'translateX(50%)' : 'none',
                    zIndex:50,
                    display:'flex',
                    flexDirection:'column',
                    alignItems: isMobile ? 'center' : 'flex-end',
                    gap: 8
                }}
            >


                {/* Thinking bubble — always on by default */}
                {isThinking && !showMsg && (
                    <div style={{padding:'8px 14px',borderRadius:'12px 12px 4px 12px',background:'rgba(6,8,22,0.92)',border:\`1px solid \${acc}33\`,backdropFilter:'blur(14px)',boxShadow:'0 4px 20px rgba(0,0,0,0.45)',animation:'sm-think-bbl 0.3s ease-out both',display:'flex',alignItems:'center',gap:8}}>
                        <div style={{fontSize:13,animation:'sm-spin 1.6s linear infinite',display:'inline-block'}}>⚙️</div>
                        <span style={{fontSize:11,color:\`\${acc}cc\`,fontWeight:600,letterSpacing:'0.05em'}}>{THINKS[thinkIdx]}</span>
                        <div style={{display:'flex',gap:2.5}}>
                            {[0,1,2].map(i=><div key={i} style={{width:4,height:4,borderRadius:'50%',background:acc,boxShadow:\`0 0 5px \${acc}\`,animation:'sm-dot 1s ease-in-out infinite',animationDelay:\`\${i*0.18}s\`}} />)}
                        </div>
                    </div>
                )}

                {/* Chat message */}
                {showMsg && (
                    <div style={{padding:'10px 15px',borderRadius:'13px 13px 4px 13px',background:'rgba(6,8,22,0.96)',border:\`1px solid \${acc}44\`,backdropFilter:'blur(16px)',color:'#fff',fontSize:12.5,fontWeight:600,whiteSpace:'nowrap',boxShadow:'0 8px 28px rgba(0,0,0,0.5)',animation:'sm-msg 0.3s ease-out both'}}>
                        {MSGS[msgIndex]}
                    </div>
                )}

                {/* Soundwave bars */}
                {soundActive && (
                    <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
                        <span style={{fontSize:9,color:\`\${acc}88\`,letterSpacing:'0.1em'}}>♪</span>
                        <div style={{display:'flex',alignItems:'center',gap:2.5,height:20}}>
                            {[4,7,11,14,11,8,12,9,5,10,13,8,4].map((h,i)=>(
                                <div key={i} style={{width:2.5,height:h*1.5,borderRadius:2,background:\`linear-gradient(180deg,\${acc},\${acc}66)\`,boxShadow:\`0 0 4px \${acc}88\`,animation:'sm-wbar 0.55s ease-in-out infinite',animationDelay:\`\${i*0.04}s'\`}} />
                            ))}
                        </div>
                        <span style={{fontSize:9,color:\`\${acc}88\`,letterSpacing:'0.1em'}}>♪</span>
                    </div>
                )}

                {/* Click rings */}
                {isClicked && [0,1].map(i=>(
                    <div key={i} style={{position:'absolute',bottom:80,right:50,width:88,height:88,borderRadius:'50%',border:\`1.5px solid \${acc}88\`,animation:'sm-ring-out 0.75s ease-out forwards',animationDelay:\`\${i*0.18}s\`,pointerEvents:'none'}} />
                ))}

                {/* Particles */}
                <div style={{position:'absolute',bottom:100,right:58,pointerEvents:'none',width:0,height:0}}>
                    {particles.map(p=>{
                        const rad=(p.angle*Math.PI)/180;
                        return <div key={p.id} style={{position:'absolute',width:7,height:7,borderRadius:'50%',background:p.color,boxShadow:\`0 0 8px \${p.color}\`,'--tx':\`\${Math.cos(rad)*p.dist}px\`,'--ty':\`\${-Math.sin(rad)*p.dist}px\`,animation:'sm-particle 0.75s ease-out forwards'} as React.CSSProperties} />;
                    })}
                </div>

                {/* ── THE ROBOT ── */}
                <button onClick={handleClick} style={{background:'transparent',border:'none',cursor:'pointer',padding:0,outline:'none',WebkitTapHighlightColor:'transparent'}} title="Click Smilo!">
                    <SmiloRobot
                        mouseX={mouseX}
                        mouseY={mouseY}
                        isWaving={isWaving}
                        isClicked={isClicked}
                        mood={mood}
                    />
                    {/* Label */}
                    <div style={{textAlign:'center',marginTop:6,fontFamily:"'Orbitron',sans-serif",fontSize:9.5,fontWeight:900,letterSpacing:'0.24em',color:'rgba(255,255,255,0.88)',textShadow:\`0 0 10px \${acc}99,0 0 22px \${acc}44\`,background:'rgba(255,255,255,0.02)',border:\`1px solid \${acc}28\`,borderRadius:6,padding:'4px 12px',backdropFilter:'blur(8px)',transition:'border-color 0.3s'}}>
                        SMILO
                    </div>
                </button>

                {clickCount > 0 && (
                    <div style={{textAlign:'center',fontSize:9,color:'rgba(134,239,172,0.3)',letterSpacing:'0.1em',fontFamily:'monospace'}}>
                        × {clickCount} interactions
                    </div>
                )}
            </motion.div>

            {/* Page corners */}
            <div style={{position:'absolute',top:18,right:18,width:20,height:20,borderTop:'1.5px solid rgba(134,239,172,0.2)',borderRight:'1.5px solid rgba(134,239,172,0.2)',pointerEvents:'none',zIndex:2}} />
            <div style={{position:'absolute',bottom:18,left:18,width:20,height:20,borderBottom:'1.5px solid rgba(103,232,249,0.2)',borderLeft:'1.5px solid rgba(103,232,249,0.2)',pointerEvents:'none',zIndex:2}} />
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(134,239,172,0.2),transparent)',pointerEvents:'none',zIndex:2}} />
        </div>
    );
};

export default Smilo;
`,

  'tripy': `import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import Logo from './Logo';
import './Tripy.css';


/* ══════════════════════════════════════════════════════ */
/*          SOUND — Playful Xylophone + Boing             */
/* ══════════════════════════════════════════════════════ */
const playTripy = (type: 'click' | 'think' | 'happy') => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const master = ctx.createGain();
        // Warm reverb delay
        const delay = ctx.createDelay(0.35);
        const dg = ctx.createGain();
        delay.delayTime.value = 0.18; dg.gain.value = 0.14;
        delay.connect(dg); dg.connect(master); master.connect(ctx.destination);
        const t = ctx.currentTime;

        // Xylophone bell tone
        const xyl = (freq: number, start: number, vol: number, dur: number) => {
            const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
            const g = ctx.createGain();
            o1.connect(g); o2.connect(g); g.connect(master); g.connect(delay);
            o1.type = 'triangle'; o1.frequency.value = freq;
            o2.type = 'sine';     o2.frequency.value = freq * 3.0; // bright overtone
            const g2 = ctx.createGain(); o2.connect(g2); g2.gain.value = 0.08;
            g.gain.setValueAtTime(0, t + start);
            g.gain.linearRampToValueAtTime(vol, t + start + 0.008);
            g.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
            o1.start(t + start); o1.stop(t + start + dur);
            o2.start(t + start); o2.stop(t + start + dur);
        };

        if (type === 'click') {
            // Happy travel jingle — G major arp
            xyl(392.00, 0.00, 0.18, 0.7);  // G4
            xyl(493.88, 0.07, 0.16, 0.6);  // B4
            xyl(587.33, 0.14, 0.14, 0.6);  // D5
            xyl(783.99, 0.22, 0.13, 0.7);  // G5
            xyl(987.77, 0.30, 0.10, 0.6);  // B5
            // Boing accent
            const boing = ctx.createOscillator(), bg = ctx.createGain();
            boing.connect(bg); bg.connect(master);
            boing.type = 'sine';
            boing.frequency.setValueAtTime(80, t + 0.0);
            boing.frequency.exponentialRampToValueAtTime(320, t + 0.18);
            boing.frequency.exponentialRampToValueAtTime(180, t + 0.45);
            bg.gain.setValueAtTime(0.09, t); bg.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            boing.start(t); boing.stop(t + 0.5);
            master.gain.setValueAtTime(0.75, t); master.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
        } else if (type === 'happy') {
            xyl(523.25, 0, 0.12, 0.8); xyl(659.25, 0.05, 0.1, 0.8); xyl(783.99, 0.1, 0.09, 0.9);
            master.gain.setValueAtTime(0.6, t); master.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        } else {
            xyl(329.63, 0, 0.06, 0.7); // E4 soft hum
            master.gain.setValueAtTime(0.5, t); master.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        }
    } catch (_) {}
};

/* ── Data ── */
const MSGS  = ["Let's go! 🧳", "Adventure awaits!", "Bon voyage! ✈️", "Click me again~", "Ready to travel!", "Where to next? 🗺️", "Pack your dreams!", "Tripy's here! 🌍"];
const THINKS = ["Planning trip...", "Checking routes...", "Packing bags...", "Finding deals...", "Loading map..."];
const FEATURES = [
    { icon: '🧳', title: 'Travel Buddy',    desc: 'Your AI companion for every journey, always by your side',  color: '#fbbf24' },
    { icon: '😊', title: 'CSS Expressions', desc: 'Arch eyes and curved smile built with pure CSS border tricks', color: '#f87171' },
    { icon: '🎵', title: 'Xylophone Audio', desc: 'Playful G-major arpeggio with boing accent on every click',   color: '#86efac' },
];

/* ══════════════════════════════════════════════════════ */
/*          TRIPY FIGURE – Framer Motion Driven           */
/* ══════════════════════════════════════════════════════ */
const TripyFigure: React.FC<{
    mouseX: number; mouseY: number;
    isClicked: boolean; mood: string; isWaving: boolean;
    wheelSpin: number;
}> = ({ mouseX, mouseY, isClicked, mood, isWaving, wheelSpin }) => {

    // Spring-smoothed mouse-driven rotation
    const rotY = useSpring(useMotionValue(mouseX * 18), { stiffness: 55, damping: 16 });
    const rotX = useSpring(useMotionValue(-mouseY * 10), { stiffness: 55, damping: 16 });
    const rotZ = useSpring(useMotionValue(mouseX * 4),   { stiffness: 48, damping: 18 });

    useEffect(() => {
        rotY.set(mouseX * 18);
        rotX.set(-mouseY * 10);
        rotZ.set(mouseX * 4);
    }, [mouseX, mouseY]);

    // Handle extends when clicked
    const handleHeight = isWaving ? 40 : 22;

    const eyeCol = mood === 'excited' ? '#fde047' : mood === 'thinking' ? '#86efac' : '#facc15';
    const bodyGlow = mood === 'excited' ? 'rgba(250,204,21,0.3)' : mood === 'thinking' ? 'rgba(134,239,172,0.2)' : 'rgba(239,68,68,0.25)';

    return (
        <div
            className="tp-root"
            style={{
                transform: isClicked ? 'scale(1.13) translateY(-6px)' : 'scale(1)',
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                filter: \`drop-shadow(0 0 22px \${bodyGlow}) drop-shadow(0 28px 24px rgba(0,0,0,0.6))\`,
            }}
        >
            {/* ── TELESCOPIC HANDLE ── */}
            <motion.div
                className="tp-handle-wrap"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="tp-grip" />
                <div className="tp-handle-bars">
                    <motion.div
                        className="tp-handle-bar"
                        animate={{ height: handleHeight }}
                        transition={{ duration: 0.35, ease: [0.34,1.56,0.64,1] }}
                    />
                    <motion.div
                        className="tp-handle-bar"
                        animate={{ height: handleHeight }}
                        transition={{ duration: 0.35, ease: [0.34,1.56,0.64,1] }}
                    />
                </div>
            </motion.div>

            {/* ── TOP CARRY HANDLE ── */}
            <div className="tp-carry-wrap">
                <div className="tp-carry" />
            </div>

            {/* ── MAIN BODY (mouse-driven 3-axis tilt) ── */}
            <motion.div
                className="tp-body"
                style={{
                    rotateY: rotY,
                    rotateX: rotX,
                    rotateZ: rotZ,
                    transformStyle: 'preserve-3d',
                    transformPerspective: 380,
                }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
            >
                {/* Shines */}
                <div className="tp-body-shine" />
                <div className="tp-body-shine2" />

                {/* Ridges */}
                <div className="tp-ridges">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="tp-ridge" />
                    ))}
                </div>

                {/* Zipper border */}
                <div className="tp-zipper" />

                {/* Side clasps */}
                <div className="tp-clasp tp-clasp--l" />
                <div className="tp-clasp tp-clasp--r" />

                {/* ── FACE PANEL ── */}
                <div className="tp-face">
                    {/* Eyes — blinking */}
                    <motion.div
                        className="tp-eyes"
                        animate={{ scaleY: [1, 0.06, 1] }}
                        transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.04, 0.09], ease: 'easeOut' }}
                    >
                        <motion.div
                            className="tp-eye"
                            animate={{
                                borderColor: [eyeCol, \`\${eyeCol}cc\`, eyeCol],
                                boxShadow: [
                                    \`0 0 6px \${eyeCol}88, 0 0 14px \${eyeCol}44\`,
                                    \`0 0 10px \${eyeCol}, 0 0 22px \${eyeCol}88\`,
                                    \`0 0 6px \${eyeCol}88, 0 0 14px \${eyeCol}44\`,
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ borderTopColor: eyeCol, borderLeftColor: eyeCol, borderRightColor: eyeCol, transition: 'border-color 0.3s' }}
                        />
                        <motion.div
                            className="tp-eye"
                            animate={{
                                boxShadow: [
                                    \`0 0 6px \${eyeCol}88, 0 0 14px \${eyeCol}44\`,
                                    \`0 0 10px \${eyeCol}, 0 0 22px \${eyeCol}88\`,
                                    \`0 0 6px \${eyeCol}88, 0 0 14px \${eyeCol}44\`,
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.12 }}
                            style={{ borderTopColor: eyeCol, borderLeftColor: eyeCol, borderRightColor: eyeCol, transition: 'border-color 0.3s' }}
                        />
                    </motion.div>

                    {/* Cute, reactive smile */}
                    <motion.div
                        className="tp-smile"
                        style={{ 
                            borderColor: eyeCol, 
                            transition: 'border-color 0.3s, transform 0.3s',
                            transform: (mood === 'excited' || mood === 'happy') ? 'scale(1.2)' : 'scale(1)',
                        }}
                        animate={{
                            boxShadow: [
                                \`0 0 5px \${eyeCol}88\`,
                                \`0 1px 12px \${eyeCol}\`,
                                \`0 0 5px \${eyeCol}88\`,
                            ],
                        }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
            </motion.div>

            {/* ── WHEELS ── */}
            <div className="tp-wheels">
                {[0, 1].map(i => (
                    <motion.div
                        key={i}
                        className="tp-wheel"
                        animate={{ rotate: wheelSpin }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                ))}
                {[0, 1].map(i => (
                    <motion.div
                        key={i + 2}
                        className="tp-wheel"
                        animate={{ rotate: wheelSpin }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.06 }}
                    />
                ))}
            </div>

            {/* Ground shadow */}
            <div className="tp-shadow" />
        </div>
    );
};

/* ══════════════════════════════════════════════════════ */
/*                     MAIN PAGE                          */
/* ══════════════════════════════════════════════════════ */
const Tripy: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseX, setMouseX]         = useState(0);
    const [mouseY, setMouseY]         = useState(0);
    const [isClicked, setIsClicked]   = useState(false);
    const [isWaving, setIsWaving]     = useState(false); // handle extends
    const [mood, setMood]             = useState<'idle'|'thinking'|'happy'|'excited'>('thinking');
    const [msgIndex, setMsgIndex]     = useState(0);
    const [showMsg, setShowMsg]       = useState(false);
    const [isThinking, setIsThinking] = useState(true);
    const [thinkIdx, setThinkIdx]     = useState(0);
    const [soundActive, setSoundActive] = useState(false);
    const [particles, setParticles]   = useState<{id:number;angle:number;color:string;dist:number}[]>([]);
    const [clickCount, setClickCount] = useState(0);
    const [wheelSpin, setWheelSpin]   = useState(0);
    const [isMobile, setIsMobile]     = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const r = containerRef.current?.getBoundingClientRect();
        if (!r) return;
        setMouseX(((e.clientX - r.left) / r.width  - 0.5) * 2);
        setMouseY(((e.clientY - r.top)  / r.height - 0.5) * 2);
    }, []);

    const handleMouseLeave = useCallback(() => { setMouseX(0); setMouseY(0); }, []);

    // Rotate thinking phrases
    useEffect(() => {
        const t = setInterval(() => setThinkIdx(p => (p + 1) % THINKS.length), 2100);
        return () => clearInterval(t);
    }, []);


    const spawnParticles = useCallback(() => {
        const cols = ['#facc15','#f87171','#86efac','#fde68a','#fff','#fbbf24'];
        const ps = Array.from({length:14},(_,i)=>({
            id: Date.now()+i,
            angle: (360/14)*i + Math.random()*18,
            color: cols[i % cols.length],
            dist: 40 + Math.random()*48,
        }));
        setParticles(ps);
        setTimeout(() => setParticles([]), 900);
    }, []);

    const handleClick = () => {
        setClickCount(c => c + 1);
        playTripy('click');
        setSoundActive(true); setTimeout(() => setSoundActive(false), 950);
        setIsClicked(true);
        setIsWaving(true);   // handle extends up
        setMood('excited');
        setIsThinking(false);
        setMsgIndex(p => (p + 1) % MSGS.length);
        setShowMsg(true);
        spawnParticles();
        setWheelSpin(w => w + 360); // wheels spin
        setTimeout(() => setIsClicked(false), 300);
        setTimeout(() => { setIsWaving(false); setMood('thinking'); setIsThinking(true); }, 2200);
        setTimeout(() => setShowMsg(false), 4200);
    };

    const handleCTA = () => {
        playTripy('happy');
        setIsWaving(true); setMood('happy'); setIsThinking(false);
        setMsgIndex(0); setShowMsg(true);
        setWheelSpin(w => w + 180);
        setTimeout(() => { setIsWaving(false); setMood('thinking'); setIsThinking(true); }, 2200);
        setTimeout(() => setShowMsg(false), 4200);
    };

    const acc = mood==='excited'?'#fde047': mood==='thinking'?'#86efac': mood==='happy'?'#fbbf24':'#f87171';

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                width:'100%', height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '520px' : '100%',
                background:'radial-gradient(ellipse at 20% 45%, #1c0808 0%, #100506 40%, #07030a 100%)',
                position:'relative', overflowX:'hidden', overflowY: isMobile ? 'auto' : 'hidden',
                fontFamily:"'Inter','Segoe UI',sans-serif",
                display:'flex', flexDirection:'column',
                scrollBehavior: 'smooth'
            }}

        >
            <div style={{
                position: 'absolute',
                top: isMobile ? 12 : 24,
                right: isMobile ? 12 : 24,
                zIndex: 100
            }}>
                <Logo className="w-6 h-6" showText={true} color="#fbbf24" />
            </div>

            <style>{\`

                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap');
                @keyframes tp-orb  { 0%,100%{transform:translate(0,0);opacity:.08} 50%{transform:translate(14px,-10px);opacity:.16} }
                @keyframes tp-grid { 0%{background-position:0 0} 100%{background-position:48px 48px} }
                @keyframes tp-in   { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes tp-card { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
                @keyframes tp-bot  { from{opacity:0;transform:scale(0.4) translateY(50px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes tp-msg  { from{opacity:0;transform:translateY(8px) scale(0.9)} to{opacity:1;transform:none} }
                @keyframes tp-think{ from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
                @keyframes tp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes tp-dot  { 0%,100%{transform:translateY(0);opacity:0.3} 50%{transform:translateY(-5px);opacity:1} }
                @keyframes tp-badge-dot {0%,100%{opacity:1} 50%{opacity:0.18}}
                @keyframes tp-ring { 0%{transform:scale(1);opacity:0.65} 100%{transform:scale(3.4);opacity:0} }
                @keyframes tp-part { 0%{transform:translate(0,0) scale(1.1);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0} }
                @keyframes tp-wbar { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.22)} }
                @keyframes tp-glow { 0%,100%{text-shadow:none} 50%{text-shadow:0 0 28px rgba(251,191,36,0.35)} }
                @keyframes tp-bkt  { 0%,100%{opacity:0.3} 50%{opacity:0.82} }
                @keyframes tp-bubble-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
                @keyframes tp-dot-blink { 0%,60%,100%{opacity:0} 30%{opacity:1} }
                .tp2-card:hover { transform:translateY(-5px)!important; border-color:rgba(255,255,255,0.1)!important; }
                .tp2-btn:hover  { transform:translateY(-2px); }
            \`}</style>

            {/* Ambient background */}
            <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0}}>
                <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(239,68,68,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.015) 1px,transparent 1px)',backgroundSize:'48px 48px',animation:'tp-grid 14s linear infinite'}} />
                {[
                    {top:'6%',   left:'2%',   w:280, col:'rgba(239,68,68,0.08)',   d:'7s'},
                    {top:'42%',  right:'3%',  w:180, col:'rgba(251,191,36,0.07)',  d:'6s 2s'},
                    {bottom:'8%',left:'18%',  w:220, col:'rgba(134,239,172,0.07)', d:'9s reverse'},
                ].map((o,i)=>(
                    <div key={i} style={{position:'absolute',top:(o as any).top,bottom:(o as any).bottom,left:(o as any).left,right:(o as any).right,width:o.w,height:o.w,borderRadius:'50%',background:\`radial-gradient(circle,\${o.col} 0%,transparent 70%)\`,animation:\`tp-orb \${o.d} ease-in-out infinite\`}} />
                ))}
            </div>

            {/* ── Left content ── */}
            <div style={{
                flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
                padding: isMobile ? '40px 20px' : 'clamp(24px,4vw,56px)',
                paddingBottom: isMobile ? 180 : 140,
                position:'relative', zIndex:1, maxWidth:720
            }}>


                {/* Badge */}
                <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:20,padding:'5px 14px',borderRadius:999,background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.22)',width:'fit-content',animation:'tp-in 0.5s ease-out both'}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#fbbf24',boxShadow:'0 0 8px #fbbf24',animation:'tp-badge-dot 1.5s ease-in-out infinite'}} />
                    <span style={{fontSize:10,fontWeight:800,color:'rgba(251,191,36,0.85)',letterSpacing:'0.18em',textTransform:'uppercase'}}>3D CHATBOT — TRIPY</span>
                </div>

                {/* Title */}
                <h1 style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:900,color:'#fff',lineHeight:1.1,margin:'0 0 14px 0',letterSpacing:'-0.03em',animation:'tp-in 0.5s 0.08s ease-out both'}}>
                    Meet{' '}
                    <span style={{background:'linear-gradient(135deg,#f87171 0%,#fbbf24 50%,#fde68a 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'tp-glow 3s ease-in-out infinite'}}>Tripy</span>
                    <br/>
                    <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.48em',fontWeight:600,letterSpacing:0}}>Move your mouse to see Tripy react in real-time</span>
                </h1>

                <p style={{fontSize:15,color:'rgba(255,255,255,0.42)',lineHeight:1.78,margin:'0 0 32px 0',maxWidth:440,animation:'tp-in 0.5s 0.16s ease-out both'}}>
                    A Framer Motion 3D travel suitcase chatbot with mouse-reactive tilting, animated telescopic handle, spinning wheels, and a joyful xylophone jingle on every click.
                </p>

                {/* Feature cards */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,animation:'tp-card 0.5s 0.26s ease-out both'}}>
                    {FEATURES.map((f,i)=>(
                        <div key={i} className="tp2-card" style={{padding:'16px 14px',borderRadius:14,background:'rgba(255,255,255,0.022)',border:'1px solid rgba(255,255,255,0.06)',cursor:'default',transition:'transform .24s ease,border-color .24s ease'}}>
                            <div style={{width:36,height:36,borderRadius:9,background:\`\${f.color}12\`,border:\`1px solid \${f.color}25\`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:10}}>{f.icon}</div>
                            <div style={{fontSize:12.5,fontWeight:700,color:'#fff',marginBottom:5,letterSpacing:'-0.01em'}}>{f.title}</div>
                            <div style={{fontSize:11,color:'rgba(255,255,255,0.34)',lineHeight:1.55}}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{display:'flex',alignItems:'center',gap:16,marginTop:28,animation:'tp-card 0.5s 0.38s ease-out both'}}>
                    <button className="tp2-btn" onClick={handleCTA} style={{display:'flex',alignItems:'center',gap:8,padding:'11px 26px',borderRadius:11,background:'linear-gradient(135deg,#ef4444,#f97316)',border:'none',color:'#fff',fontSize:13.5,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 20px rgba(239,68,68,0.3)',transition:'transform .2s ease,box-shadow .2s ease'}}>
                        🧳 Chat with Tripy
                    </button>
                    <span style={{fontSize:11,color:'rgba(255,255,255,0.2)',letterSpacing:'0.08em'}}>or click the bot →</span>
                </div>
            </div>

            {/* ══════════════════════════════════════════════ */}
            {/*      BOTTOM-RIGHT  TRIPY WIDGET               */}
            {/* ══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, scale: 0.4, y: 55 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.65, ease: [0.34,1.56,0.64,1] }}
                style={{
                    position:'absolute',
                    bottom: isMobile ? 15 : 16,
                    right: isMobile ? '50%' : 22,
                    transform: isMobile ? 'translateX(50%)' : 'none',
                    zIndex:50,
                    display:'flex',
                    flexDirection:'column',
                    alignItems: isMobile ? 'center' : 'flex-end',
                    gap:10
                }}
            >

                {/* Thinking / speech bubble — default visible */}
                {isThinking && !showMsg && (
                    <div style={{padding:'9px 14px',borderRadius:'14px 14px 4px 14px',background:'linear-gradient(135deg,#fde68a 0%,#fbbf24 100%)',boxShadow:'0 6px 18px rgba(251,191,36,0.35), 0 2px 6px rgba(0,0,0,0.3)',animation:'tp-think 0.3s ease-out both',display:'flex',alignItems:'center',gap:6,position:'relative'}}>
                        {/* Typing dots */}
                        {[0,1,2].map(i => (
                            <div key={i} style={{width:7,height:7,borderRadius:'50%',background:'#92400e',boxShadow:'0 1px 2px rgba(0,0,0,0.2)',animation:'tp-dot 1.1s ease-in-out infinite',animationDelay:\`\${i*0.22}s\`}} />
                        ))}
                        {/* Tiny label */}
                        <span style={{fontSize:9,fontWeight:700,color:'#78350faa',letterSpacing:'0.08em',marginLeft:2}}>{THINKS[thinkIdx]}</span>
                        {/* Bubble tail */}
                        <div style={{position:'absolute',bottom:-8,right:12,width:0,height:0,borderLeft:'7px solid transparent',borderRight:'0px solid transparent',borderTop:'9px solid #fbbf24'}} />
                    </div>
                )}

                {/* Chat message */}
                {showMsg && (
                    <div style={{padding:'10px 15px',borderRadius:'13px 13px 4px 13px',background:'rgba(28,8,8,0.96)',border:\`1px solid \${acc}55\`,backdropFilter:'blur(16px)',color:'#fff',fontSize:12.5,fontWeight:600,whiteSpace:'nowrap',boxShadow:'0 8px 28px rgba(0,0,0,0.5)',animation:'tp-msg 0.3s ease-out both'}}>
                        {MSGS[msgIndex]}
                    </div>
                )}

                {/* Soundwave bars */}
                {soundActive && (
                    <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
                        <span style={{fontSize:9,color:\`\${acc}88\`,letterSpacing:'0.1em'}}>♪</span>
                        <div style={{display:'flex',alignItems:'center',gap:2.5,height:20}}>
                            {[4,7,12,15,12,8,13,9,5,10,14,8,4].map((h,i)=>(
                                <div key={i} style={{width:2.5,height:h*1.5,borderRadius:2,background:\`linear-gradient(180deg,\${acc},\${acc}66)\`,boxShadow:\`0 0 4px \${acc}88\`,animation:'tp-wbar 0.55s ease-in-out infinite',animationDelay:\`\${i*0.04}s\`}} />
                            ))}
                        </div>
                        <span style={{fontSize:9,color:\`\${acc}88\`,letterSpacing:'0.1em'}}>♪</span>
                    </div>
                )}

                {/* Click rings */}
                {isClicked && [0,1].map(i=>(
                    <div key={i} style={{position:'absolute',bottom:90,right:52,width:96,height:96,borderRadius:'50%',border:\`1.5px solid \${acc}88\`,animation:'tp-ring 0.8s ease-out forwards',animationDelay:\`\${i*0.2}s\`,pointerEvents:'none'}} />
                ))}

                {/* Particles */}
                <div style={{position:'absolute',bottom:110,right:60,pointerEvents:'none',width:0,height:0}}>
                    {particles.map(p=>{
                        const rad=(p.angle*Math.PI)/180;
                        return <div key={p.id} style={{position:'absolute',width:8,height:8,borderRadius:'50%',background:p.color,boxShadow:\`0 0 8px \${p.color}\`,'--tx':\`\${Math.cos(rad)*p.dist}px\`,'--ty':\`\${-Math.sin(rad)*p.dist}px\`,animation:'tp-part 0.8s ease-out forwards'} as React.CSSProperties} />;
                    })}
                </div>

                {/* ── THE TRIPY SUITCASE ── */}
                <button onClick={handleClick} style={{background:'transparent',border:'none',cursor:'pointer',padding:0,outline:'none',WebkitTapHighlightColor:'transparent'}} title="Click Tripy!">
                    <TripyFigure
                        mouseX={mouseX}
                        mouseY={mouseY}
                        isClicked={isClicked}
                        isWaving={isWaving}
                        mood={mood}
                        wheelSpin={wheelSpin}
                    />
                    {/* Label */}
                    <div style={{textAlign:'center',marginTop:6,fontFamily:"'Orbitron',sans-serif",fontSize:9.5,fontWeight:900,letterSpacing:'0.24em',color:'rgba(255,255,255,0.88)',textShadow:\`0 0 10px \${acc}99, 0 0 22px \${acc}44\`,background:'rgba(255,255,255,0.02)',border:\`1px solid \${acc}28\`,borderRadius:6,padding:'4px 12px',backdropFilter:'blur(8px)',transition:'border-color 0.3s, text-shadow 0.3s'}}>
                        TRIPY
                    </div>
                </button>

                {clickCount > 0 && (
                    <div style={{textAlign:'center',fontSize:9,color:'rgba(251,191,36,0.3)',letterSpacing:'0.1em',fontFamily:'monospace'}}>
                        × {clickCount} interactions
                    </div>
                )}
            </motion.div>

            {/* Page corner decorations */}
            <div style={{position:'absolute',top:18,right:18,width:20,height:20,borderTop:'1.5px solid rgba(239,68,68,0.2)',borderRight:'1.5px solid rgba(239,68,68,0.2)',pointerEvents:'none',zIndex:2}} />
            <div style={{position:'absolute',bottom:18,left:18,width:20,height:20,borderBottom:'1.5px solid rgba(251,191,36,0.2)',borderLeft:'1.5px solid rgba(251,191,36,0.2)',pointerEvents:'none',zIndex:2}} />
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(239,68,68,0.2),transparent)',pointerEvents:'none',zIndex:2}} />
        </div>
    );
};

export default Tripy;
`,

  'aiva': `import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import Logo from './Logo';
import './Aiva.css';


/* ══════════════════════════════════════════════════════ */
/*          SOUND — Warm AI Harmonic Chords               */
/* ══════════════════════════════════════════════════════ */
const playAiva = (type: 'click' | 'think' | 'happy') => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const master = ctx.createGain();
        // Soft reverb tail
        const delay = ctx.createDelay(0.4);
        const dg = ctx.createGain();
        delay.delayTime.value = 0.2; dg.gain.value = 0.15;
        delay.connect(dg); dg.connect(master); master.connect(ctx.destination);
        const t = ctx.currentTime;

        // Warm sine tone with slight harmonic
        const tone = (freq: number, start: number, vol: number, dur: number, type2: OscillatorType = 'sine') => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(master); g.connect(delay);
            o.type = type2; o.frequency.value = freq;
            g.gain.setValueAtTime(0, t + start);
            g.gain.linearRampToValueAtTime(vol, t + start + 0.018);
            g.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
            o.start(t + start); o.stop(t + start + dur);
        };

        if (type === 'click') {
            // C major 7th chord — warm & intelligent
            tone(523.25, 0.00, 0.14, 0.90);  // C5
            tone(659.25, 0.06, 0.12, 0.80);  // E5
            tone(783.99, 0.12, 0.11, 0.80);  // G5
            tone(987.77, 0.18, 0.09, 0.90);  // B5
            tone(1046.5, 0.28, 0.07, 0.70);  // C6
            // Gentle sub warmth
            tone(130.81, 0.00, 0.05, 0.55, 'triangle'); // C3 warm sub
            master.gain.setValueAtTime(0.72, t);
            master.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
        } else if (type === 'happy') {
            // Rising glide + bright arpeggio
            tone(523.25, 0.00, 0.11, 0.85);
            tone(659.25, 0.04, 0.10, 0.80);
            tone(783.99, 0.08, 0.09, 0.85);
            tone(1046.5, 0.14, 0.08, 0.90);
            master.gain.setValueAtTime(0.65, t);
            master.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
        } else {
            // Soft two-note hum
            tone(329.63, 0.00, 0.05, 0.75); // E4
            tone(392.00, 0.08, 0.04, 0.70); // G4
            master.gain.setValueAtTime(0.48, t);
            master.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
        }
    } catch (_) {}
};

/* ── Data ── */
const MSGS   = ["How can I help? 💙", "I'm Aiva, your AI! 🤖", "Ask me anything! ✨", "Processing... done! ⚡", "Ready to assist! 🚀", "Let's build cool UI!", "UI HUB rocks! 💫", "Click me again~ 👋"];
const THINKS = ["How can I help you?", "Ready to assist...", "Analyzing...", "Processing query...", "Loading AI model..."];
const FEATURES = [
    { icon: '🤖', title: 'Floating 3D',       desc: 'Premium humanoid assistant with shoulders, waist & articulated arms', color: '#67e8f9' },
    { icon: '💡', title: 'Holo Display',        desc: 'Animated cyan chest screen with live data stream bars',            color: '#818cf8' },
    { icon: '🎵', title: 'AI Chord Sound',      desc: 'Warm C-major 7th harmonic chords with reverb on every click',     color: '#86efac' },
];

/* ══════════════════════════════════════════════════════ */
/*          AIVA FIGURE – Framer Motion Driven            */
/* ══════════════════════════════════════════════════════ */
const AivaFigure: React.FC<{
    mouseX: number; mouseY: number;
    isClicked: boolean; mood: string; isWaving: boolean;
    screenActive: boolean;
}> = ({ mouseX, mouseY, isClicked, mood, isWaving, screenActive }) => {

    // Spring-smoothed mouse-driven head rotation
    const rotY = useSpring(useMotionValue(mouseX * 20), { stiffness: 58, damping: 16 });
    const rotX = useSpring(useMotionValue(-mouseY * 12), { stiffness: 58, damping: 16 });
    const rotZ = useSpring(useMotionValue(mouseX * 4.5), { stiffness: 50, damping: 18 });

    useEffect(() => {
        rotY.set(mouseX * 20);
        rotX.set(-mouseY * 12);
        rotZ.set(mouseX * 4.5);
    }, [mouseX, mouseY]);

    const eyeCol = mood === 'excited' ? '#a5f3fc' : mood === 'thinking' ? '#67e8f9' : '#22d3ee';
    const eyeGlow = \`0 0 8px \${eyeCol}, 0 0 18px \${eyeCol}99, 0 0 32px \${eyeCol}44\`;
    const bodyScale = isClicked ? 'scale(1.08) translateY(-5px)' : 'scale(1)';

    // Screen bar widths cycle when active
    const barWidths = screenActive
        ? ['100%', '72%', '88%', '60%']
        : ['100%', '70%', '85%', '55%'];

    return (
        <div className="av-root" style={{ transform: bodyScale, transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>

            {/* ══ HEAD (mouse-driven 3-axis rotation) ══ */}
            <motion.div
                className="av-head"
                style={{
                    rotateY: rotY,
                    rotateX: rotX,
                    rotateZ: rotZ,
                    transformStyle: 'preserve-3d',
                    transformPerspective: 340,
                }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="av-head-shine" />
                <div className="av-head-shine2" />

                {/* Top detail dots */}
                <div className="av-head-dots">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className="av-head-dot"
                            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
                        />
                    ))}
                </div>

                {/* Ear panels with LEDs */}
                <div className="av-ear av-ear--l">
                    <motion.div
                        className="av-ear-led"
                        animate={{ boxShadow: [\`0 0 5px \${eyeCol}\`, \`0 0 12px \${eyeCol}\`, \`0 0 5px \${eyeCol}\`] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
                <div className="av-ear av-ear--r">
                    <motion.div
                        className="av-ear-led"
                        animate={{ boxShadow: [\`0 0 5px \${eyeCol}\`, \`0 0 12px \${eyeCol}\`, \`0 0 5px \${eyeCol}\`] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    />
                </div>

                {/* Face visor */}
                <div className="av-visor">
                    <div className="av-visor-shine" />
                    {/* Eyes — blink every 4.5s */}
                    <motion.div
                        className="av-eyes"
                        animate={{ scaleY: [1, 0.05, 1] }}
                        transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.04, 0.09], ease: 'easeOut' }}
                    >
                        <motion.div
                            className="av-eye"
                            animate={{ boxShadow: [eyeGlow, \`0 0 14px \${eyeCol}, 0 0 28px \${eyeCol}bb\`, eyeGlow] }}
                            style={{ background: \`radial-gradient(circle at 38% 32%, #ffffff 0%, #a5f3fc 25%, \${eyeCol} 65%, #0ea5e9 100%)\` }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            className="av-eye"
                            animate={{ boxShadow: [eyeGlow, \`0 0 14px \${eyeCol}, 0 0 28px \${eyeCol}bb\`, eyeGlow] }}
                            style={{ background: \`radial-gradient(circle at 38% 32%, #ffffff 0%, #a5f3fc 25%, \${eyeCol} 65%, #0ea5e9 100%)\` }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.18 }}
                        />
                    </motion.div>

                    {/* Cute, reactive smile */}
                    <motion.div
                        className="av-smile"
                        animate={{
                            boxShadow: [
                                \`0 2px 5px \${eyeCol}55\`,
                                \`0 2px 14px \${eyeCol}\`,
                                \`0 2px 5px \${eyeCol}55\`,
                            ]
                        }}
                        style={{ 
                            borderColor: eyeCol, 
                            transition: 'border-color 0.3s, transform 0.3s',
                            transform: (mood === 'excited' || mood === 'happy') ? 'scale(1.2)' : 'scale(1)',
                        }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
            </motion.div>

            {/* ══ NECK ══ */}
            <div className="av-neck" />

            {/* ══ BODY: Shoulders + Torso + Arms + Waist + Legs (all float together) ══ */}
            <motion.div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.22 }}
            >
                {/* Torso Row: ARM-L + TORSO (w/ shoulder pads) + ARM-R */}
                <div className="av-torso-wrap">

                    {/* LEFT ARM */}
                    <motion.div
                        className="av-arm av-arm--l"
                        animate={{ rotate: [0, -9, 0, 9, 0] }}
                        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ transformOrigin: '80% 5%' }}
                    >
                        <div className="av-arm-upper" />
                        <div className="av-arm-joint" />
                        <div className="av-arm-lower" />
                        <div className="av-hand">
                            <div className="av-fingers">
                                <div className="av-finger" />
                                <div className="av-finger" />
                                <div className="av-finger" />
                            </div>
                        </div>
                    </motion.div>

                    {/* TORSO (contains shoulder pads + chest screen) */}
                    <div className="av-torso">
                        {/* Shoulder pads float on top sides */}
                        <div className="av-shoulder-pad av-shoulder-pad--l" />
                        <div className="av-shoulder-pad av-shoulder-pad--r" />

                        <div className="av-torso-shine" />

                        {/* Chest holographic screen */}
                        <div className="av-chest-screen">
                            {barWidths.map((w, i) => (
                                <motion.div
                                    key={i}
                                    className="av-screen-bar"
                                    animate={{ width: [w, \`\${parseInt(w) * 0.65}%\`, w] }}
                                    transition={{
                                        duration: 1.4 + i * 0.3,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: i * 0.2
                                    }}
                                    style={{ width: w }}
                                />
                            ))}
                            {/* Blinking cursor */}
                            <motion.div
                                className="av-screen-cursor"
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            />
                        </div>
                    </div>

                    {/* RIGHT ARM — waves on click */}
                    <motion.div
                        className="av-arm av-arm--r"
                        animate={isWaving
                            ? { rotate: [0, -60, -10, -55, -15, 0] }
                            : { rotate: [0, 9, 0, -9, 0] }
                        }
                        transition={isWaving
                            ? { duration: 1.6, ease: 'easeInOut' }
                            : { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }
                        }
                        style={{ transformOrigin: '20% 5%' }}
                    >
                        <div className="av-arm-upper" />
                        <div className="av-arm-joint" />
                        <div className="av-arm-lower" />
                        <div className="av-hand">
                            <div className="av-fingers">
                                <div className="av-finger" />
                                <div className="av-finger" />
                                <div className="av-finger" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* WAIST (Floating base) */}
                <div className="av-waist" />
            </motion.div>

            {/* Ground glow shadow */}
            <div className="av-shadow" />
        </div>
    );
};

/* ══════════════════════════════════════════════════════ */
/*                     MAIN PAGE                          */
/* ══════════════════════════════════════════════════════ */
const Aiva: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseX, setMouseX]           = useState(0);
    const [mouseY, setMouseY]           = useState(0);
    const [isClicked, setIsClicked]     = useState(false);
    const [isWaving, setIsWaving]       = useState(false);
    const [mood, setMood]               = useState<'idle' | 'thinking' | 'happy' | 'excited'>('thinking');
    const [msgIndex, setMsgIndex]       = useState(0);
    const [showMsg, setShowMsg]         = useState(false);
    const [isThinking, setIsThinking]   = useState(true);
    const [thinkIdx, setThinkIdx]       = useState(0);
    const [soundActive, setSoundActive] = useState(false);
    const [screenActive, setScreenActive] = useState(false);
    const [particles, setParticles]     = useState<{ id: number; angle: number; color: string; dist: number }[]>([]);
    const [clickCount, setClickCount]   = useState(0);
    const [isMobile, setIsMobile]       = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const r = containerRef.current?.getBoundingClientRect();
        if (!r) return;
        setMouseX(((e.clientX - r.left) / r.width  - 0.5) * 2);
        setMouseY(((e.clientY - r.top)  / r.height - 0.5) * 2);
    }, []);

    const handleMouseLeave = useCallback(() => { setMouseX(0); setMouseY(0); }, []);

    // Cycle thinking phrases
    useEffect(() => {
        const t = setInterval(() => setThinkIdx(p => (p + 1) % THINKS.length), 2200);
        return () => clearInterval(t);
    }, []);

    const spawnParticles = useCallback(() => {
        const cols = ['#22d3ee', '#67e8f9', '#818cf8', '#a5f3fc', '#86efac', '#ffffff'];
        const ps = Array.from({ length: 14 }, (_, i) => ({
            id: Date.now() + i,
            angle: (360 / 14) * i + Math.random() * 18,
            color: cols[i % cols.length],
            dist: 40 + Math.random() * 50,
        }));
        setParticles(ps);
        setTimeout(() => setParticles([]), 900);
    }, []);

    const handleClick = () => {
        setClickCount(c => c + 1);
        playAiva('click');
        setSoundActive(true); setTimeout(() => setSoundActive(false), 950);
        setIsClicked(true);
        setIsWaving(true);
        setMood('excited');
        setIsThinking(false);
        setScreenActive(true);
        setMsgIndex(p => (p + 1) % MSGS.length);
        setShowMsg(true);
        spawnParticles();
        setTimeout(() => setIsClicked(false), 300);
        setTimeout(() => setScreenActive(false), 2000);
        setTimeout(() => { setIsWaving(false); setMood('thinking'); setIsThinking(true); }, 2400);
        setTimeout(() => setShowMsg(false), 4500);
    };

    const handleCTA = () => {
        playAiva('happy');
        setIsWaving(true); setMood('happy'); setIsThinking(false);
        setScreenActive(true);
        setMsgIndex(0); setShowMsg(true);
        setTimeout(() => setScreenActive(false), 2000);
        setTimeout(() => { setIsWaving(false); setMood('thinking'); setIsThinking(true); }, 2400);
        setTimeout(() => setShowMsg(false), 4500);
    };

    const acc = mood === 'excited' ? '#a5f3fc' : mood === 'thinking' ? '#67e8f9' : mood === 'happy' ? '#86efac' : '#22d3ee';

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                width: '100%', height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '520px' : '100%',
                background: 'radial-gradient(ellipse at 18% 45%, #060d1f 0%, #040912 50%, #020408 100%)',
                position: 'relative', overflowX: 'hidden', overflowY: isMobile ? 'auto' : 'hidden',
                fontFamily: "'Inter','Segoe UI',sans-serif",
                display: 'flex', flexDirection: 'column',
                scrollBehavior: 'smooth'
            }}

        >
            <div style={{
                position: 'absolute',
                top: isMobile ? 12 : 24,
                right: isMobile ? 12 : 24,
                zIndex: 100
            }}>
                <Logo className="w-6 h-6" showText={true} color="#67e8f9" />
            </div>

            <style>{\`

                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap');
                @keyframes av-orb  { 0%,100%{transform:translate(0,0);opacity:.07} 50%{transform:translate(14px,-10px);opacity:.15} }
                @keyframes av-grid { 0%{background-position:0 0} 100%{background-position:48px 48px} }
                @keyframes av-in   { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes av-card { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes av-bot  { from{opacity:0;transform:scale(0.38) translateY(55px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes av-msg  { from{opacity:0;transform:translateY(8px) scale(0.9)} to{opacity:1;transform:none} }
                @keyframes av-think{ from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
                @keyframes av-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes av-dot  { 0%,100%{transform:translateY(0);opacity:0.3} 50%{transform:translateY(-5px);opacity:1} }
                @keyframes av-badge{ 0%,100%{opacity:1} 50%{opacity:0.2} }
                @keyframes av-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(3.6);opacity:0} }
                @keyframes av-part { 0%{transform:translate(0,0) scale(1.1);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0} }
                @keyframes av-wbar { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.22)} }
                @keyframes av-glow { 0%,100%{text-shadow:none} 50%{text-shadow:0 0 30px rgba(34,211,238,0.38)} }
                @keyframes av-bkt  { 0%,100%{opacity:0.28} 50%{opacity:0.85} }
                @keyframes av-scan { 0%,100%{transform:translateY(-30px);opacity:0} 30%{opacity:0.55} 70%{opacity:0.55} 99%{transform:translateY(26px)} }
                .av2-card:hover { transform:translateY(-5px)!important; border-color:rgba(34,211,238,0.18)!important; }
                .av2-btn:hover  { transform:translateY(-2px); }
            \`}</style>

            {/* ── Ambient BG ── */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(34,211,238,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.014) 1px,transparent 1px)', backgroundSize: '48px 48px', animation: 'av-grid 16s linear infinite' }} />
                {[
                    { top: '6%',    left: '2%',   w: 290, col: 'rgba(34,211,238,0.07)',  d: '8s' },
                    { top: '40%',   right: '3%',  w: 180, col: 'rgba(129,140,248,0.07)', d: '6s 2s' },
                    { bottom: '8%', left: '20%',  w: 220, col: 'rgba(103,232,249,0.06)', d: '10s reverse' },
                ].map((o, i) => (
                    <div key={i} style={{ position: 'absolute', top: (o as any).top, bottom: (o as any).bottom, left: (o as any).left, right: (o as any).right, width: o.w, height: o.w, borderRadius: '50%', background: \`radial-gradient(circle,\${o.col} 0%,transparent 70%)\`, animation: \`av-orb \${o.d} ease-in-out infinite\` }} />
                ))}
            </div>

            {/* ── Left content ── */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: isMobile ? '40px 20px' : 'clamp(24px,4vw,56px)',
                paddingBottom: isMobile ? 180 : 150,
                position: 'relative', zIndex: 1, maxWidth: 720
            }}>


                {/* Badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '5px 14px', borderRadius: 999, background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.2)', width: 'fit-content', animation: 'av-in 0.5s ease-out both' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 8px #22d3ee', animation: 'av-badge 1.5s ease-in-out infinite' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(103,232,249,0.85)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>3D CHATBOT — AIVA</span>
                </div>

                {/* Title */}
                <h1 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 14px 0', letterSpacing: '-0.03em', animation: 'av-in 0.5s 0.08s ease-out both' }}>
                    Meet{' '}
                    <span style={{ background: 'linear-gradient(135deg,#67e8f9 0%,#22d3ee 40%,#818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'av-glow 3s ease-in-out infinite' }}>Aiva</span>
                    <br />
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.48em', fontWeight: 600, letterSpacing: 0 }}>Move your mouse — she follows every move</span>
                </h1>

                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.42)', lineHeight: 1.78, margin: '0 0 32px 0', maxWidth: 450, animation: 'av-in 0.5s 0.16s ease-out both' }}>
                    A floating Framer Motion AI assistant with mouse-reactive head, animated holographic chest display, shoulder armor, and warm harmonic chord tones on every interaction.
                </p>

                {/* Feature cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, animation: 'av-card 0.5s 0.26s ease-out both' }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} className="av2-card" style={{ padding: '16px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'default', transition: 'transform .24s ease,border-color .24s ease' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: \`\${f.color}12\`, border: \`1px solid \${f.color}25\`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>{f.icon}</div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', marginBottom: 5, letterSpacing: '-0.01em' }}>{f.title}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.34)', lineHeight: 1.55 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 28, animation: 'av-card 0.5s 0.38s ease-out both' }}>
                    <button className="av2-btn" onClick={handleCTA} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 26px', borderRadius: 11, background: 'linear-gradient(135deg,#22d3ee,#818cf8)', border: 'none', color: '#fff', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(34,211,238,0.3)', transition: 'transform .2s ease,box-shadow .2s ease' }}>
                        💙 Chat with Aiva
                    </button>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>or click the bot →</span>
                </div>
            </div>

            {/* ══════════════════════════════════════════════ */}
            {/*        BOTTOM-RIGHT  AIVA WIDGET              */}
            {/* ══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, scale: 0.36, y: 60 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                    position: 'absolute',
                    bottom: isMobile ? 15 : 12,
                    right: isMobile ? '50%' : 22,
                    transform: isMobile ? 'translateX(50%)' : 'none',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMobile ? 'center' : 'flex-end',
                    gap: 8
                }}
            >


                {/* Thinking bubble — always on by default */}
                {isThinking && !showMsg && (
                    <div style={{ padding: '8px 14px', borderRadius: '12px 12px 4px 12px', background: 'rgba(4,7,22,0.94)', border: \`1px solid \${acc}33\`, backdropFilter: 'blur(14px)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', animation: 'av-think 0.3s ease-out both', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 12, animation: 'av-spin 1.8s linear infinite', display: 'inline-block' }}>⚙️</div>
                        <span style={{ fontSize: 11, color: \`\${acc}cc\`, fontWeight: 600, letterSpacing: '0.05em' }}>{THINKS[thinkIdx]}</span>
                        <div style={{ display: 'flex', gap: 2.5 }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: acc, boxShadow: \`0 0 5px \${acc}\`, animation: 'av-dot 1.1s ease-in-out infinite', animationDelay: \`\${i * 0.18}s\` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat message */}
                {showMsg && (
                    <div style={{ padding: '10px 15px', borderRadius: '13px 13px 4px 13px', background: 'rgba(4,7,22,0.97)', border: \`1px solid \${acc}44\`, backdropFilter: 'blur(16px)', color: '#fff', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 8px 28px rgba(0,0,0,0.55)', animation: 'av-msg 0.3s ease-out both' }}>
                        {MSGS[msgIndex]}
                    </div>
                )}

                {/* Soundwave bars */}
                {soundActive && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 9, color: \`\${acc}88\`, letterSpacing: '0.1em' }}>♪</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 20 }}>
                            {[4, 7, 11, 15, 11, 8, 13, 9, 5, 11, 14, 8, 4].map((h, i) => (
                                <div key={i} style={{ width: 2.5, height: h * 1.5, borderRadius: 2, background: \`linear-gradient(180deg,\${acc},\${acc}66)\`, boxShadow: \`0 0 4px \${acc}88\`, animation: 'av-wbar 0.55s ease-in-out infinite', animationDelay: \`\${i * 0.04}s\` }} />
                            ))}
                        </div>
                        <span style={{ fontSize: 9, color: \`\${acc}88\`, letterSpacing: '0.1em' }}>♪</span>
                    </div>
                )}

                {/* Click rings */}
                {isClicked && [0, 1].map(i => (
                    <div key={i} style={{ position: 'absolute', bottom: 110, right: 54, width: 100, height: 100, borderRadius: '50%', border: \`1.5px solid \${acc}88\`, animation: 'av-ring 0.82s ease-out forwards', animationDelay: \`\${i * 0.22}s\`, pointerEvents: 'none' }} />
                ))}

                {/* Particles */}
                <div style={{ position: 'absolute', bottom: 130, right: 62, pointerEvents: 'none', width: 0, height: 0 }}>
                    {particles.map(p => {
                        const rad = (p.angle * Math.PI) / 180;
                        return (
                            <div key={p.id} style={{ position: 'absolute', width: 7, height: 7, borderRadius: '50%', background: p.color, boxShadow: \`0 0 8px \${p.color}\`, '--tx': \`\${Math.cos(rad) * p.dist}px\`, '--ty': \`\${-Math.sin(rad) * p.dist}px\`, animation: 'av-part 0.8s ease-out forwards' } as React.CSSProperties} />
                        );
                    })}
                </div>

                {/* ── THE ROBOT ── */}
                <button
                    onClick={handleClick}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, outline: 'none', WebkitTapHighlightColor: 'transparent' }}
                    title="Click Aiva!"
                >
                    <AivaFigure
                        mouseX={mouseX}
                        mouseY={mouseY}
                        isClicked={isClicked}
                        isWaving={isWaving}
                        mood={mood}
                        screenActive={screenActive}
                    />
                    {/* Label */}
                    <div style={{ textAlign: 'center', marginTop: 6, fontFamily: "'Orbitron',sans-serif", fontSize: 9.5, fontWeight: 900, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.9)', textShadow: \`0 0 10px \${acc}99, 0 0 22px \${acc}44\`, background: 'rgba(255,255,255,0.02)', border: \`1px solid \${acc}28\`, borderRadius: 6, padding: '4px 12px', backdropFilter: 'blur(8px)', transition: 'border-color 0.3s, text-shadow 0.3s' }}>
                        AIVA
                    </div>
                </button>

                {clickCount > 0 && (
                    <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(103,232,249,0.3)', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                        × {clickCount} interactions
                    </div>
                )}
            </motion.div>

            {/* Page corner decorations */}
            <div style={{ position: 'absolute', top: 18, right: 18, width: 20, height: 20, borderTop: '1.5px solid rgba(34,211,238,0.2)', borderRight: '1.5px solid rgba(34,211,238,0.2)', pointerEvents: 'none', zIndex: 2 }} />
            <div style={{ position: 'absolute', bottom: 18, left: 18, width: 20, height: 20, borderBottom: '1.5px solid rgba(129,140,248,0.2)', borderLeft: '1.5px solid rgba(129,140,248,0.2)', pointerEvents: 'none', zIndex: 2 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(34,211,238,0.2),transparent)', pointerEvents: 'none', zIndex: 2 }} />
        </div>
    );
};

export default Aiva;
`,

  'laptopbot': `import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Logo from './Logo';
import './LaptopBot.css';

/* ══════════════════════════════════════════════════════ */
/*                  SOUND – Cute Synth Beeps              */
/* ══════════════════════════════════════════════════════ */
const playBeep = (type: 'click' | 'think' | 'happy') => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const master = ctx.createGain();
        const delay  = ctx.createDelay(0.4);
        const dGain  = ctx.createGain();
        delay.delayTime.value = 0.15;
        dGain.gain.value      = 0.15;
        delay.connect(dGain); dGain.connect(master); master.connect(ctx.destination);
        const t = ctx.currentTime;

        const beep = (freq: number, start: number, vol: number, dur: number, synthType: OscillatorType = 'sine') => {
            const o1 = ctx.createOscillator(), g = ctx.createGain();
            o1.connect(g); g.connect(master); g.connect(delay);
            o1.type = synthType; o1.frequency.value = freq;
            g.gain.setValueAtTime(0, t + start);
            g.gain.linearRampToValueAtTime(vol, t + start + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
            o1.start(t + start); o1.stop(t + start + dur);
        };

        if (type === 'click') {
            [880, 1108.73, 1318.51].forEach((f, i) => beep(f, i * 0.08, 0.12, 0.4, 'triangle'));
            master.gain.setValueAtTime(0.6, t); master.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        } else if (type === 'happy') {
            [659.25, 880, 1046.5, 1318.51].forEach((f, i) => beep(f, i * 0.05, 0.1, 0.5, 'sine'));
            master.gain.setValueAtTime(0.6, t); master.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        } else {
            beep(440, 0, 0.05, 0.3, 'square'); beep(554.37, 0.1, 0.05, 0.3, 'square');
            master.gain.setValueAtTime(0.4, t); master.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        }
    } catch (_) {}
};

/* ── Data ── */
const MSGS   = ["Hey! I'm LAPTOP 👋", "Systems online 🟢", "Let's code!", "AI Assistant ready~", "Processing...", "UI HUB is blazing fast ⚡", "Compiling styles..."];
const THINKS = ["Analyzing...", "Booting up...", "Computing...", "Running scripts...", "Loading AI models..."];
const FEATURES = [
    { icon: '💻', title: '3D Laptop Base', desc: 'Glossy soft-rounded laptop chassis with animated treads', color: '#22d3ee' },
    { icon: '👁️', title: 'Framer Motion Eyes', desc: 'Digital LCD face with cursor-tracking eyes and expressions', color: '#a78bfa' },
    { icon: '🎵', title: 'Synth Audio', desc: 'Digital synth beeps and blips triggered on interaction', color: '#4ade80' },
];

/* ══════════════════════════════════════════════════════ */
/*                 LAPTOP ROBOT CHARACTER                 */
/* ══════════════════════════════════════════════════════ */
const LaptopRobot: React.FC<{
    mouseX: number; mouseY: number;
    isGreeting: boolean; isClicked: boolean;
    mood: string;
}> = ({ mouseX, mouseY, isGreeting, isClicked, mood }) => {

    // Spring-smoothed head / screen tilt
    const rotY = useSpring(useMotionValue(mouseX * 15), { stiffness: 60, damping: 15 });
    const rotX = useSpring(useMotionValue(-mouseY * 10), { stiffness: 60, damping: 15 });
    const eyeX = useSpring(useMotionValue(mouseX * 10), { stiffness: 70, damping: 12 });
    const eyeY = useSpring(useMotionValue(mouseY * 8), { stiffness: 70, damping: 12 });

    useEffect(() => {
        if (!isGreeting) {
            rotY.set(mouseX * 25);
            rotX.set(-mouseY * 15);
            eyeX.set(mouseX * 12);
            eyeY.set(mouseY * 8);
        } else {
            rotY.set(0);
            rotX.set(-15);
            eyeX.set(0);
            eyeY.set(0);
        }
    }, [mouseX, mouseY, isGreeting, rotY, rotX, eyeX, eyeY]);

    const accColor = 
        mood === 'excited' ? '#fbbf24' : 
        mood === 'happy' ? '#34d399' : 
        mood === 'thinking' ? '#a78bfa' : '#22d3ee'; // default cyan

    return (
        <div className="lb-root" style={{ transform: isClicked ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
            
            {/* Floats up and down slightly */}
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                {/* ── SCREEN / HEAD ── */}
                <motion.div
                    className="lb-screen-wrap"
                    style={{
                        rotateY: rotY,
                        rotateX: rotX,
                        transformOrigin: 'bottom center',
                    }}
                >
                    {/* Glass screen */}
                    <div className="lb-glass">
                        <div className="lb-shine" />
                        
                        {/* Face UI */}
                        <div className="lb-face">
                            <motion.div 
                                className="lb-eyes"
                                style={{ x: eyeX, y: eyeY }}
                                animate={isGreeting ? { scaleY: [1, 0.1, 1, 1, 0.1, 1] } : { scaleY: [1, 0.1, 1] }}
                                transition={isGreeting 
                                    ? { duration: 1.5, ease: 'easeOut' }
                                    : { duration: 4.5, repeat: Infinity, times: [0, 0.03, 0.06], ease: 'easeOut', delay: 1 }
                                }
                            >
                                <motion.div className="lb-eye" style={{ background: accColor, boxShadow: \`0 0 10px \${accColor}, 0 0 20px \${accColor}aa\` }} />
                                <motion.div className="lb-eye" style={{ background: accColor, boxShadow: \`0 0 10px \${accColor}, 0 0 20px \${accColor}aa\` }} />
                            </motion.div>
                            
                            {/* Mouth */}
                            <motion.div 
                                className="lb-mouth"
                                style={{ borderColor: accColor, boxShadow: \`0 4px 6px -2px \${accColor}88\` }}
                                animate={
                                    mood === 'excited' ? { height: 16, borderRadius: '2px 2px 20px 20px', borderBottomWidth: 6, width: 24 } :
                                    mood === 'happy' ? { height: 12, borderRadius: '50%', borderBottomWidth: 4 } :
                                    mood === 'thinking' ? { height: 2, borderRadius: '2px', borderBottomWidth: 4, width: 14 } :
                                    { height: 10, borderRadius: '50%', borderBottomWidth: 3 }
                                }
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Neon accent lines */}
                        <div className="lb-neon-line lb-neon-left" style={{ background: accColor, boxShadow: \`0 0 8px \${accColor}, 0 0 15px \${accColor}aa\` }} />
                        <div className="lb-neon-line lb-neon-right" style={{ background: accColor, boxShadow: \`0 0 8px \${accColor}, 0 0 15px \${accColor}aa\` }} />
                    </div>
                </motion.div>

                {/* ── HINGE ── */}
                <div className="lb-hinge" />

                {/* ── BASE (Keyboard area) ── */}
                <div className="lb-base">
                    <div className={\`lb-keyboard \${isGreeting ? 'active' : ''}\`}>
                        {[
                            [1,1,1,1,1,1,1,1,1,1,1,1,1],
                            [1.5,1,1,1,1,1,1,1,1,1,1,1.5],
                            [1.8,1,1,1,1,1,1,1,1,1,1.8],
                            [2.2,1,1,1,1,1,1,1,1,2.2],
                            [1.2,1.2,1.2,5,1.2,1.2,1.2]
                        ].map((row, r) => (
                            <div key={r} className="lb-row">
                                {row.map((w, i) => (
                                    <div key={i} className="lb-key" style={{ flex: w }} />
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="lb-touchpad" />
                </div>

                {/* ── WHEELS ── */}
                <div className="lb-wheels-wrap">
                    <div className="lb-wheel"><div className="lb-wheel-tread"></div></div>
                    <div className="lb-wheel"><div className="lb-wheel-tread"></div></div>
                </div>
            </motion.div>

            {/* ── SHADOW ── */}
            <div className="lb-shadow" style={{ background: \`radial-gradient(ellipse, \${accColor}33 0%, transparent 70%)\` }} />
        </div>
    );
};

/* ══════════════════════════════════════════════════════ */
/*                     MAIN PAGE                          */
/* ══════════════════════════════════════════════════════ */
const LaptopBot: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseX, setMouseX]       = useState(0);
    const [mouseY, setMouseY]       = useState(0);
    const [isGreeting, setIsGreeting] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [mood, setMood]           = useState<'idle'|'thinking'|'happy'|'excited'>('idle');
    const [msgIndex, setMsgIndex]   = useState(0);
    const [showMsg, setShowMsg]     = useState(true); // startup message
    const [isThinking, setIsThinking] = useState(false);
    const [thinkIdx, setThinkIdx]   = useState(0);
    const [soundActive, setSoundActive] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [isMobile, setIsMobile]     = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // Hide startup msg after 3s
        setTimeout(() => setShowMsg(false), 3000);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Normalize mouse position -1 to +1
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const r = containerRef.current?.getBoundingClientRect();
        if (!r) return;
        setMouseX(((e.clientX - r.left) / r.width  - 0.5) * 2);
        setMouseY(((e.clientY - r.top)  / r.height - 0.5) * 2);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setMouseX(0); setMouseY(0);
    }, []);

    // Rotate thinking phrases
    useEffect(() => {
        const t = setInterval(() => setThinkIdx(p => (p + 1) % THINKS.length), 2000);
        return () => clearInterval(t);
    }, []);

    const handleClick = () => {
        setClickCount(c => c + 1);
        playBeep('click');
        setSoundActive(true); setTimeout(() => setSoundActive(false), 800);
        setIsClicked(true);
        setIsGreeting(true);
        setMood('excited');
        setIsThinking(false);
        setMsgIndex(p => (p + 1) % MSGS.length);
        setShowMsg(true);
        
        setTimeout(() => setIsClicked(false), 200);
        setTimeout(() => { setIsGreeting(false); setMood('idle'); setIsThinking(true); }, 2000);
        setTimeout(() => { setShowMsg(false); }, 3500);
        setTimeout(() => { setIsThinking(false); }, 7500); // stop thinking after a while
    };

    const handleCTA = () => {
        playBeep('happy');
        setIsGreeting(true); setMood('happy'); setIsThinking(false);
        setMsgIndex(0); setShowMsg(true);
        setTimeout(() => { setIsGreeting(false); setMood('idle'); }, 2500);
        setTimeout(() => setShowMsg(false), 4000);
    };

    const accColor = mood === 'excited' ? '#fbbf24' : mood === 'happy' ? '#34d399' : mood === 'thinking' ? '#a78bfa' : '#22d3ee';

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                width:'100%', height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '520px' : '100%',
                background:'radial-gradient(ellipse at 80% 20%, #08122a 0%, #050a14 50%, #020408 100%)',
                position:'relative', overflowX:'hidden', overflowY: isMobile ? 'auto' : 'hidden',
                fontFamily:"'Inter','Segoe UI',sans-serif",
                display:'flex', flexDirection:'column',
                scrollBehavior: 'smooth'
            }}
        >
            <div style={{ position: 'absolute', top: isMobile ? 12 : 24, right: isMobile ? 12 : 24, zIndex: 100 }}>
                <Logo className="w-6 h-6" showText={true} color="#22d3ee" />
            </div>

            <style>{\`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap');
                @keyframes lb-in { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
                @keyframes lb-type { 0%,100%{transform:scale(0.8);opacity:0.5} 50%{transform:scale(1.2);opacity:1} }
                @keyframes lb-bbl-in { from{opacity:0;transform:translateY(10px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
                .lb2-card:hover { transform:translateY(-5px)!important; border-color:rgba(34, 211, 238, 0.3)!important; }
                .lb2-btn:hover  { transform:translateY(-2px); box-shadow: 0 6px 20px rgba(34, 211, 238, 0.4)!important; }
            \`}</style>

            {/* Ambient bg elements */}
            <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0}}>
                <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(34,211,238,0.05) 1px,transparent 1px)',backgroundSize:'40px 40px'}} />
                <div style={{position:'absolute',top:'20%',right:'10%',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 60%)',filter:'blur(40px)'}} />
                <div style={{position:'absolute',bottom:'10%',left:'20%',width:250,height:250,borderRadius:'50%',background:'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 60%)',filter:'blur(40px)'}} />
            </div>

            {/* ── Left content ── */}
            <div style={{
                flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
                padding: isMobile ? '40px 20px' : 'clamp(24px,4vw,56px)',
                paddingBottom: isMobile ? 180 : 130,
                position:'relative', zIndex:1, maxWidth:720
            }}>
                <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:20,padding:'5px 14px',borderRadius:999,background:'rgba(34,211,238,0.1)',border:'1px solid rgba(34,211,238,0.2)',width:'fit-content',animation:'lb-in 0.5s ease-out both'}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#22d3ee',boxShadow:'0 0 8px #22d3ee'}} />
                    <span style={{fontSize:10,fontWeight:800,color:'#22d3ee',letterSpacing:'0.15em',textTransform:'uppercase'}}>3D CHATBOT — LAPTOP</span>
                </div>

                <h1 style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:900,color:'#fff',lineHeight:1.1,margin:'0 0 14px 0',letterSpacing:'-0.03em',animation:'lb-in 0.5s 0.1s ease-out both'}}>
                    Meet{' '}
                    <span style={{background:'linear-gradient(135deg,#22d3ee 0%,#a78bfa 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Laptop</span>
                    <br/>
                    <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.45em',fontWeight:600,letterSpacing:0}}>A cute, interactive desktop companion.</span>
                </h1>

                <p style={{fontSize:15,color:'rgba(255,255,255,0.4)',lineHeight:1.75,margin:'0 0 32px 0',maxWidth:480,animation:'lb-in 0.5s 0.2s ease-out both'}}>
                    A futuristic AI interface embedded in a glossy 3D laptop chassis. Features an animated LCD face, mouse-tracking, and synthesizer audio responses for a premium interaction experience.
                </p>

                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,animation:'lb-in 0.5s 0.3s ease-out both'}}>
                    {FEATURES.map((f,i)=>(
                        <div key={i} className="lb2-card" style={{padding:'16px',borderRadius:12,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',cursor:'default',transition:'transform .2s ease,border-color .2s ease'}}>
                            <div style={{fontSize:20,marginBottom:8}}>{f.icon}</div>
                            <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:4}}>{f.title}</div>
                            <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',lineHeight:1.5}}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                <div style={{display:'flex',alignItems:'center',gap:16,marginTop:30,animation:'lb-in 0.5s 0.4s ease-out both'}}>
                    <button className="lb2-btn" onClick={handleCTA} style={{display:'flex',alignItems:'center',gap:8,padding:'12px 24px',borderRadius:8,background:'linear-gradient(135deg,#22d3ee,#3b82f6)',border:'none',color:'#fff',fontSize:13.5,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 15px rgba(34,211,238,0.25)',transition:'all .2s ease'}}>
                        💻 Initialize Chat
                    </button>
                    <span style={{fontSize:11,color:'rgba(255,255,255,0.25)'}}>Try clicking the laptop!</span>
                </div>
            </div>

            {/* ══════════════════════════════════════════ */}
            {/*          BOTTOM-RIGHT LAPTOP BOT           */}
            {/* ══════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, type: 'spring', damping: 15 }}
                style={{
                    position:'absolute',
                    bottom: isMobile ? 15 : 24,
                    right: isMobile ? '50%' : 40,
                    transform: isMobile ? 'translateX(50%)' : 'none',
                    zIndex:50,
                    display:'flex',
                    flexDirection:'column',
                    alignItems: isMobile ? 'center' : 'flex-end',
                    gap: 12
                }}
            >
                {/* Chat Message / Thinking Bubble */}
                <div style={{ height: 45, display: 'flex', alignItems: 'flex-end', justifyContent: isMobile ? 'center' : 'flex-end', width: '100%', paddingRight: isMobile ? 0 : 20 }}>
                    {showMsg ? (
                        <div className="lb-chat-bubble" style={{ animation: 'lb-bbl-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                            {MSGS[msgIndex]}
                        </div>
                    ) : isThinking ? (
                        <div className="lb-chat-bubble" style={{ animation: 'lb-bbl-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' }}>
                            <div style={{display:'flex', gap: 4, marginRight: 4}}>
                                {[0,1,2].map(i => <div key={i} className="lb-type-dot" style={{ background: '#a78bfa', boxShadow: '0 0 5px #a78bfa', animation: \`lb-type 1.2s infinite \${i*0.2}s\` }} />)}
                            </div>
                            {THINKS[thinkIdx]}
                        </div>
                    ) : null}
                </div>

                {soundActive && (
                    <div style={{ position: 'absolute', top: -10, right: 0, display: 'flex', gap: 3 }}>
                         {[1,2,3,4].map(i => (
                             <div key={i} style={{ width: 2, height: 10 + Math.random()*10, background: accColor, borderRadius: 2, animation: \`lb-type 0.3s infinite alternate \${i*0.1}s\` }} />
                         ))}
                    </div>
                )}

                {/* THE LAPTOP */}
                <button onClick={handleClick} style={{background:'transparent',border:'none',cursor:'pointer',padding:0,outline:'none',WebkitTapHighlightColor:'transparent'}} title="Click me!">
                    <LaptopRobot
                        mouseX={mouseX}
                        mouseY={mouseY}
                        isGreeting={isGreeting}
                        isClicked={isClicked}
                        mood={mood}
                    />
                    {/* Floating label */}
                    <div style={{textAlign:'center',marginTop:12,fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:800,letterSpacing:'0.2em',color:'rgba(255,255,255,0.7)',textShadow:\`0 0 10px \${accColor}aa\`, padding:'2px 10px'}}>
                        LAPTOP_OS
                    </div>
                </button>

            </motion.div>
        </div>
    );
};

export default LaptopBot;
`,

  'interactive-hover-button': `'use client'

/**
 * @author: @emerald-ui
 * @description: Interactive Hover Button Component
 * @version: 1.0.0
 * @date: 2026-01-28
 * @license: MIT
 * @website: https://emerald-ui.com
 */
import React, { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface InteractiveHoverButtonProps {
  text?: string
  loadingText?: string
  successText?: string
  classes?: string
  variant?: 'default' | 'neon' | 'dark' | 'sparkle'
  icon?: React.ReactNode
  href?: string
  target?: string
  rel?: string
  onClick?: (e: React.MouseEvent<any>) => void
  [key: string]: any
}

export default function InteractiveHoverButton({
  text = 'Button',
  loadingText = 'Processing...',
  successText = 'Complete!',
  classes,
  variant = 'default',
  icon,
  ...props
}: InteractiveHoverButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const isIdle = status === 'idle'

  const handleClick = (e: React.MouseEvent<any>) => {
    if (status !== 'idle') return

    setStatus('loading')
    // Simulate async process (for demo purpose only)
    setTimeout(() => {
      setStatus('success')
      setTimeout(() => {
        setStatus('idle')
      }, 3000) // Reset after success
    }, 2000)

    if (props.onClick) {
      props.onClick(e)
    }
  }

  // Variant-specific styles matching the branding and design layout
  const variantStyles = {
    default: {
      button: 'bg-background border border-white/10 text-foreground',
      dot: 'bg-primary group-hover:scale-[300]',
      hoverText: 'text-primary-foreground',
      defaultIcon: <ArrowRight className="h-4 w-4" />
    },
    neon: {
      button: 'bg-brand-green border-transparent text-black shadow-[0_0_20px_rgba(0,255,0,0.15)] hover:shadow-[0_0_30px_rgba(0,255,0,0.3)]',
      dot: 'bg-black group-hover:scale-[300]',
      hoverText: 'text-brand-green',
      defaultIcon: <ArrowRight className="h-4 w-4 stroke-[3px]" />
    },
    dark: {
      button: 'bg-black border border-white/10 text-white',
      dot: 'bg-white group-hover:scale-[300]',
      hoverText: 'text-black',
      defaultIcon: <ArrowRight className="h-4 w-4" />
    },
    sparkle: {
      button: 'bg-brand-green border-transparent text-black shadow-[0_0_20px_rgba(0,255,0,0.15)] hover:shadow-[0_0_30px_rgba(0,255,0,0.3)]',
      dot: 'bg-black group-hover:scale-[300]',
      hoverText: 'text-brand-green',
      defaultIcon: <ArrowRight className="h-4 w-4" />
    }
  }

  const currentStyles = variantStyles[variant] || variantStyles.default
  const Component = (props.href ? motion.a : motion.button) as any

  return (
    <Component
      className={cn(
        'group relative flex min-w-40 items-center justify-center overflow-hidden rounded-full p-2 px-6 font-semibold transition-all duration-300',
        status === 'loading' && 'px-2', // Circle shape when loading
        currentStyles.button,
        classes
      )}
      onClick={handleClick}
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      {...props}
    >
      <AnimatePresence mode='popLayout' initial={false}>
        <motion.div
          key='idle'
          className='flex items-center gap-2'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {/* Dot that expands on hover to fill background */}
          <div
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-all duration-500',
              currentStyles.dot,
              !isIdle && 'scale-[300]'
            )}
          />
          <span
            className={cn(
              'inline-block transition-all duration-500 group-hover:translate-x-20 group-hover:opacity-0',
              !isIdle && 'translate-x-20 opacity-0'
            )}
          >
            {text}
          </span>
          <div
            className={cn(
              'absolute top-0 left-0 z-10 flex h-full w-full -translate-x-16 items-center justify-center gap-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100',
              currentStyles.hoverText,
              !isIdle && 'translate-x-0 opacity-100'
            )}
          >
            {status === 'idle' ? (
              <>
                <span>{text}</span>
                {icon || currentStyles.defaultIcon}
              </>
            ) : status === 'loading' ? (
              <>
                <div className={cn(
                  'h-4 w-4 animate-spin rounded-full border-2',
                  variant === 'default' ? 'border-neutral-800 border-t-white' : 
                  variant === 'neon' || variant === 'sparkle' ? 'border-brand-green border-t-transparent' :
                  'border-white border-t-transparent'
                )} />
                <span className={cn(
                  variant === 'neon' || variant === 'sparkle' ? 'text-brand-green' : 'text-inherit'
                )}>{loadingText}</span>
              </>
            ) : (
              // success
              <>
                <Check className='h-4 w-4' />
                <span className={cn(
                  variant === 'neon' || variant === 'sparkle' ? 'text-brand-green' : 'text-inherit'
                )}>{successText}</span>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </Component>
  )
}
`,

};
