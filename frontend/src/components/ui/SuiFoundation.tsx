import React, { useEffect, useRef } from "react";

// Height percentage of each vertical step from left to right (7 columns)
const STEPS = [
  { heightRatio: 0.33 }, // Column 1 (Leftmost)
  { heightRatio: 0.46 }, // Column 2
  { heightRatio: 0.60 }, // Column 3
  { heightRatio: 0.77 }, // Column 4 (Center Peak)
  { heightRatio: 0.54 }, // Column 5
  { heightRatio: 0.46 }, // Column 6
  { heightRatio: 0.35 }, // Column 7 (Rightmost)
];

export const SteppedGraphic: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height;

      if (width === 0 || height === 0) return;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const numSteps = STEPS.length;
      const colWidth = width / numSteps;

      // ----------------------------------------------------
      // 1. ATMOSPHERIC RADIAL BLUE BLOOM
      // ----------------------------------------------------
      const bgGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.95,
        width * 0.04,
        width * 0.5,
        height * 0.68,
        width * 0.7
      );
      bgGlow.addColorStop(0, 'rgba(25, 90, 235, 0.48)');
      bgGlow.addColorStop(0.28, 'rgba(15, 60, 180, 0.28)');
      bgGlow.addColorStop(0.65, 'rgba(4, 20, 80, 0.12)');
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // ----------------------------------------------------
      // 2. STEPPED VERTICAL COLUMNS WITH PRECISE GRADIENTS
      // ----------------------------------------------------
      STEPS.forEach((step, i) => {
        const x = i * colWidth;
        const colH = height * step.heightRatio;
        const y = height - colH;

        // Vertical gradient for each column
        const colGrad = ctx.createLinearGradient(0, y, 0, height);
        colGrad.addColorStop(0.0, 'rgba(1, 6, 20, 0.0)');      // Transparent top
        colGrad.addColorStop(0.06, 'rgba(4, 18, 55, 0.55)');   // Deep navy shadow
        colGrad.addColorStop(0.20, 'rgba(8, 38, 120, 0.86)');  // Saturated blue
        colGrad.addColorStop(0.42, 'rgba(18, 78, 210, 0.96)'); // Electric blue
        colGrad.addColorStop(0.68, 'rgba(38, 115, 248, 1.0)'); // Vivid cobalt
        colGrad.addColorStop(0.86, 'rgba(120, 180, 255, 1.0)');// Light sky blue
        colGrad.addColorStop(0.96, 'rgba(220, 238, 255, 1.0)');// Soft white-blue
        colGrad.addColorStop(1.0, 'rgba(255, 255, 255, 1.0)'); // Pure white bottom

        ctx.fillStyle = colGrad;
        ctx.fillRect(x, y, colWidth + 0.5, colH);

        // Soft top cap bleed to prevent sharp aliasing
        const topGlow = ctx.createLinearGradient(0, y - 12, 0, y + 28);
        topGlow.addColorStop(0.0, 'rgba(4, 15, 50, 0)');
        topGlow.addColorStop(0.45, 'rgba(10, 42, 130, 0.28)');
        topGlow.addColorStop(1.0, 'rgba(8, 35, 110, 0)');
        ctx.fillStyle = topGlow;
        ctx.fillRect(x, Math.max(0, y - 12), colWidth + 0.5, 40);
      });

      // ----------------------------------------------------
      // 3. ORGANIC FILM GRAIN / STIPPLING NOISE
      // ----------------------------------------------------
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const len = data.length;

      let seed = 987654321;
      const fastRandom = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      for (let p = 0; p < len; p += 4) {
        const alpha = data[p + 3];
        if (alpha > 5) {
          const noise = (fastRandom() - 0.5) * 36;
          data[p] = Math.min(255, Math.max(0, data[p] + noise * 0.8));      // Red
          data[p + 1] = Math.min(255, Math.max(0, data[p + 1] + noise * 0.9));  // Green
          data[p + 2] = Math.min(255, Math.max(0, data[p + 2] + noise * 1.15)); // Blue
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // ----------------------------------------------------
      // 4. LUMINOUS DOTTED VERTICAL GRID LINES
      // ----------------------------------------------------
      ctx.save();
      ctx.strokeStyle = 'rgba(190, 220, 255, 0.45)';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([1.5, 6]); // 1.5px dot, 6px spacing

      for (let i = 1; i < numSteps; i++) {
        const lineX = Math.round(i * colWidth);
        const stepH = Math.max(STEPS[i - 1].heightRatio, STEPS[i].heightRatio);
        const topStartY = Math.max(0, height * (1 - stepH - 0.28));

        ctx.beginPath();
        ctx.moveTo(lineX, topStartY);
        ctx.lineTo(lineX, height);
        ctx.stroke();
      }
      ctx.restore();

      // ----------------------------------------------------
      // 5. INTENSE WHITE HORIZON LINE GLOW
      // ----------------------------------------------------
      const baseGlow = ctx.createLinearGradient(0, height - 38, 0, height);
      baseGlow.addColorStop(0.0, 'rgba(180, 220, 255, 0)');
      baseGlow.addColorStop(0.5, 'rgba(220, 240, 255, 0.48)');
      baseGlow.addColorStop(1.0, 'rgba(255, 255, 255, 0.9)');

      ctx.fillStyle = baseGlow;
      ctx.fillRect(0, height - 38, width, 38);
    };

    render();

    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(render);
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[400px] bg-black overflow-hidden select-none pointer-events-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default function SuiFoundation() {
  const communityLinks = [
    "Upcoming events",
    "Event recaps",
    "SuiHub",
    "Online communities",
  ];

  const aboutLinks = [
    "About Sui Foundation",
    "Brand kit",
    "Careers",
    "Terms of service",
    "Privacy policy",
  ];

  return (
    <div className="w-full min-h-screen bg-[#000000] text-[#8C9BAE] font-mono select-text relative overflow-x-hidden flex flex-col justify-between pt-6 sm:pt-8 px-4 sm:px-6 md:px-8 pb-0">
      {/* Noise filter defs */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="sui-noise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
            <feComposite in2="SourceGraphic" in="gl" operator="in" />
          </filter>
        </defs>
      </svg>

      {/* Top section: Logo & Main Navigation */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto">
        {/* Top-left Sui flame/droplet logo */}
        <div className="mb-10 sm:mb-14">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-block hover:opacity-80 transition-opacity"
            aria-label="Sui Foundation Logo"
          >
            <svg
              width="24"
              height="30"
              viewBox="0 0 24 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            >
              <path
                d="M12 2.2C12 2.2 3.5 13.6 3.5 20.2C3.5 25.2 7.3 29.5 12 29.5C16.7 29.5 20.5 25.2 20.5 20.2C20.5 13.6 12 2.2 12 2.2ZM12 26.8C8.6 26.8 6 23.9 6 20.2C6 15.6 12 7.4 12 7.4C12 7.4 18 15.6 18 20.2C18 23.9 15.4 26.8 12 26.8Z"
                fill="#F5F5F5"
              />
            </svg>
          </a>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 xl:gap-x-14 gap-y-10 text-[13px] tracking-[1.5px] leading-[22px]">
          {/* COMMUNITY */}
          <div>
            <h3 className="text-[#FFFFFF] text-[13.5px] font-medium tracking-[2px] uppercase mb-3">
              COMMUNITY/
            </h3>
            <ul className="space-y-[3px]">
              {communityLinks.map((link) => (
                <li key={link} className="flex items-center">
                  <span className="text-[#55657E] select-none mr-2 font-mono">└─</span>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[#8C9BAE] hover:text-[#FFFFFF] transition-colors duration-150"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ABOUT */}
          <div>
            <h3 className="text-[#FFFFFF] text-[13.5px] font-medium tracking-[2px] uppercase mb-3">
              ABOUT/
            </h3>
            <ul className="space-y-[3px]">
              {aboutLinks.map((link) => (
                <li key={link} className="flex items-center">
                  <span className="text-[#55657E] select-none mr-2 font-mono">└─</span>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[#8C9BAE] hover:text-[#FFFFFF] transition-colors duration-150"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="mt-14 sm:mt-20 mb-8 sm:mb-12">
          {/* 4 Square Social Buttons */}
          <div className="flex items-center gap-[5px] mb-4">
            {/* YouTube */}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="w-[31px] h-[29px] bg-[#D7DDE1] hover:bg-[#FFFFFF] transition-colors rounded-[2px] flex items-center justify-center cursor-pointer shadow-sm"
              aria-label="YouTube"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#000000">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* Discord */}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="w-[31px] h-[29px] bg-[#D7DDE1] hover:bg-[#FFFFFF] transition-colors rounded-[2px] flex items-center justify-center cursor-pointer shadow-sm"
              aria-label="Discord"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#000000">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="w-[31px] h-[29px] bg-[#D7DDE1] hover:bg-[#FFFFFF] transition-colors rounded-[2px] flex items-center justify-center cursor-pointer shadow-sm"
              aria-label="LinkedIn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#000000">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.94 0 1.7-.76 1.7-1.7s-.76-1.7-1.7-1.7-1.7.76-1.7 1.7.76 1.7 1.7 1.7m1.4 9.74v-8.37H5.06v8.37h2.8z" />
              </svg>
            </a>

            {/* X */}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="w-[31px] h-[29px] bg-[#D7DDE1] hover:bg-[#FFFFFF] transition-colors rounded-[2px] flex items-center justify-center cursor-pointer shadow-sm"
              aria-label="X"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#000000">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>

          {/* Copyright text */}
          <p className="text-[12px] text-[#63738A] tracking-[1px]">
            ©2026 Copyright Sui Foundation. All rights reserved
          </p>
        </div>
      </div>

      {/* Bottom Stepped Graphic */}
      <SteppedGraphic className="h-[340px] sm:h-[420px] md:h-[480px] mt-auto" />
    </div>
  );
}
