import React, { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   1. BackgroundArtwork (Animated Split 3D Neon-Green Volumetric Canvas)
   ───────────────────────────────────────────────────────────── */
export const BackgroundArtwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Deep obsidian base
      ctx.fillStyle = '#020202';
      ctx.fillRect(0, 0, width, height);

      const isDesktop = width > 768;
      const cx = isDesktop ? width * 0.75 : width * 0.82;
      const cy = isDesktop ? height * 0.48 : height * 0.46;
      const baseRadius = isDesktop
        ? Math.max(Math.min(width * 0.22, height * 0.36), 230)
        : Math.max(Math.min(width * 0.36, height * 0.22), 130);

      const visualScale = isDesktop ? 1.0 : Math.max(0.65, baseRadius / 230);
      const NUM_LEFT_STRIPS = isDesktop ? 8 : 6;

      const scalePulsing = 1 + Math.sin(time * 0.6) * 0.016;
      const curRadius = baseRadius * scalePulsing;

      // Radial atmospheric glow
      const breathe = Math.sin(time * 0.8) * 0.04;
      const glowR = Math.max(width, height) * (0.62 + breathe);
      const bgGlow = ctx.createRadialGradient(cx, cy, 30, cx, cy, glowR);
      bgGlow.addColorStop(0, 'rgba(25, 75, 35, 0.44)');
      bgGlow.addColorStop(0.32, 'rgba(14, 45, 20, 0.24)');
      bgGlow.addColorStop(0.65, 'rgba(6, 20, 9, 0.09)');
      bgGlow.addColorStop(1, 'rgba(2, 2, 2, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // 1. Right Half (Pristine, Radiant & Crisp Semicircle)
      const drawRightHalf = () => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - 0.5, 0, width - cx + 10, height);
        ctx.clip();

        const drawPassRight = (blurPx: number, strokeW: number, color: string, alpha: number) => {
          ctx.save();
          ctx.filter = `blur(${blurPx * visualScale}px)`;
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = color;
          ctx.lineWidth = strokeW * visualScale;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(cx, cy, curRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        };

        drawPassRight(95, 230, '#103816', 0.72);
        drawPassRight(58, 165, '#267e28', 0.82);
        drawPassRight(32, 112, '#5cd342', 0.90);
        drawPassRight(16, 64, '#98FF68', 0.98);
        drawPassRight(7, 26, '#C6FF8E', 1.0);
        drawPassRight(1.5, 8, '#FFFFFF', 0.95);

        const spin1 = time * 0.55;
        ctx.save();
        ctx.filter = `blur(${7 * visualScale}px)`;
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = '#D9FF9E';
        ctx.lineWidth = 18 * visualScale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, curRadius, spin1, spin1 + Math.PI * 0.65);
        ctx.stroke();
        ctx.restore();

        const spin2 = -time * 0.4 + Math.PI * 0.5;
        ctx.save();
        ctx.filter = `blur(${10 * visualScale}px)`;
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = '#98FF68';
        ctx.lineWidth = 26 * visualScale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, curRadius, spin2, spin2 + Math.PI * 0.55);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.filter = `blur(${34 * visualScale}px)`;
        ctx.fillStyle = '#020202';
        ctx.beginPath();
        ctx.arc(cx, cy, curRadius * 0.54, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
      };

      // 2. Left Half (Blurred Sliced Glass Strips with Soft Feather)
      const drawLeftHalfWithBlurredStrips = () => {
        const leftExtent = curRadius * 1.35;
        const leftStartX = Math.max(0, cx - leftExtent);
        const totalStripZoneWidth = cx - leftStartX;
        const stripW = totalStripZoneWidth / NUM_LEFT_STRIPS;

        ctx.save();
        ctx.filter = 'blur(55px)';
        const leftBleedGrad = ctx.createRadialGradient(leftStartX + 40, cy, 20, leftStartX + 10, cy, curRadius * 1.15);
        leftBleedGrad.addColorStop(0, 'rgba(45, 140, 46, 0.32)');
        leftBleedGrad.addColorStop(0.45, 'rgba(16, 56, 22, 0.18)');
        leftBleedGrad.addColorStop(0.85, 'rgba(6, 20, 9, 0.06)');
        leftBleedGrad.addColorStop(1, 'rgba(2, 2, 2, 0)');
        ctx.fillStyle = leftBleedGrad;
        ctx.beginPath();
        ctx.ellipse(leftStartX + 30, cy, 150, curRadius * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        for (let i = 0; i < NUM_LEFT_STRIPS; i++) {
          const sliceX = leftStartX + i * stripW;
          const slicePhase = i * 0.45 - time * 0.35;
          const stepY = Math.sin(slicePhase) * 6 + ((i % 2 === 0) ? -3.5 : 3.5);
          const blendWeight = Math.min(1, Math.max(0, (i + 0.4) / 2.6));

          ctx.save();
          ctx.beginPath();
          ctx.rect(sliceX, 0, stripW + 0.5, height);
          ctx.clip();

          const drawPassLeftStrip = (blurPx: number, strokeW: number, color: string, alpha: number) => {
            ctx.save();
            ctx.filter = `blur(${blurPx * visualScale}px)`;
            ctx.globalAlpha = alpha * (0.4 + 0.6 * blendWeight);
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeW * visualScale;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(cx, cy + stepY, curRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          };

          drawPassLeftStrip(90, 220, '#103816', 0.60);
          drawPassLeftStrip(54, 155, '#267e28', 0.70);
          drawPassLeftStrip(34, 105, '#5cd342', 0.80);
          drawPassLeftStrip(20, 60, '#98FF68', 0.88);
          drawPassLeftStrip(10, 26, '#C6FF8E', 0.85);

          ctx.save();
          ctx.filter = 'blur(12px)';
          ctx.globalAlpha = 0.45 * blendWeight;
          ctx.fillStyle = i % 2 === 0 ? 'rgba(92, 211, 66, 0.08)' : 'rgba(152, 255, 104, 0.05)';
          ctx.fillRect(sliceX, 0, stripW, height);
          ctx.restore();

          const stripGrad = ctx.createLinearGradient(sliceX, 0, sliceX + stripW, 0);
          if (i % 2 === 0) {
            stripGrad.addColorStop(0, `rgba(255, 255, 255, ${0.045 * blendWeight})`);
            stripGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.015 * blendWeight})`);
            stripGrad.addColorStop(0.9, `rgba(0, 0, 0, ${0.22 * blendWeight})`);
            stripGrad.addColorStop(1, `rgba(255, 255, 255, ${0.055 * blendWeight})`);
          } else {
            stripGrad.addColorStop(0, `rgba(0, 0, 0, ${0.18 * blendWeight})`);
            stripGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.01 * blendWeight})`);
            stripGrad.addColorStop(0.9, `rgba(255, 255, 255, ${0.035 * blendWeight})`);
            stripGrad.addColorStop(1, `rgba(255, 255, 255, ${0.06 * blendWeight})`);
          }
          ctx.fillStyle = stripGrad;
          ctx.fillRect(sliceX, 0, stripW, height);

          if (i > 0) {
            ctx.save();
            ctx.filter = 'blur(3px)';
            ctx.strokeStyle = `rgba(152, 255, 104, ${0.16 * blendWeight})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(sliceX, 0);
            ctx.lineTo(sliceX, height);
            ctx.stroke();
            ctx.restore();

            ctx.strokeStyle = `rgba(255, 255, 255, ${0.045 * blendWeight})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sliceX, 0);
            ctx.lineTo(sliceX, height);
            ctx.stroke();
          }

          ctx.save();
          ctx.filter = 'blur(38px)';
          ctx.fillStyle = '#020202';
          ctx.beginPath();
          ctx.arc(cx, cy + stepY, curRadius * 0.52, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          ctx.restore();
        }

        ctx.save();
        const edgeFeatherGrad = ctx.createLinearGradient(leftStartX - 20, 0, leftStartX + 95, 0);
        edgeFeatherGrad.addColorStop(0, '#020202');
        edgeFeatherGrad.addColorStop(0.35, 'rgba(2, 2, 2, 0.75)');
        edgeFeatherGrad.addColorStop(0.7, 'rgba(2, 2, 2, 0.25)');
        edgeFeatherGrad.addColorStop(1, 'rgba(2, 2, 2, 0)');
        ctx.fillStyle = edgeFeatherGrad;
        ctx.fillRect(leftStartX - 25, 0, 120, height);
        ctx.restore();
      };

      drawLeftHalfWithBlurredStrips();
      drawRightHalf();

      // Center Dividing Meridian
      ctx.save();
      ctx.filter = 'blur(4px)';
      ctx.strokeStyle = 'rgba(152, 255, 104, 0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020202] from-20% via-[#020202]/85 via-42% to-transparent to-70% sm:from-15% sm:via-[#020202]/80 sm:via-36% sm:to-transparent sm:to-60% pointer-events-none" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] mix-blend-overlay pointer-events-none">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   2. TopMetadata (Technical Bar)
   ───────────────────────────────────────────────────────────── */
export const TopMetadata: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      id="top-metadata-header"
      className={`grid grid-cols-2 gap-y-3 gap-x-6 sm:flex sm:flex-row sm:items-start sm:justify-start sm:gap-0 w-full text-white text-[10px] sm:text-[11px] font-semibold tracking-wider font-mono ${className}`}
    >
      <div className="w-full sm:w-[29%] flex flex-col leading-[1.3] opacity-95">
        <span className="text-white/80 font-medium tracking-widest text-[9px] sm:text-[10px]">CATEGORY:</span>
        <span className="text-white font-bold tracking-widest text-[10px] sm:text-[11px]">BRANDING</span>
      </div>
      <div className="w-full sm:w-[26%] flex flex-col leading-[1.3] opacity-95">
        <span className="text-white/80 font-medium tracking-widest text-[9px] sm:text-[10px]">YEAR</span>
        <span className="text-white font-bold tracking-widest text-[10px] sm:text-[11px]">2024</span>
      </div>
      <div className="col-span-2 sm:col-span-1 w-full sm:w-[45%] flex flex-col leading-[1.3] opacity-95 pt-0.5 sm:pt-0">
        <span className="text-white/80 font-medium tracking-widest text-[9px] sm:text-[10px]">TECH SOLUTIONS</span>
        <span className="text-white font-bold tracking-widest text-[10px] sm:text-[11px]">AUTOMATION &amp; ROBOTICS</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   3. MetricProgress (Technical Timeline & Calibration Ticks)
   ───────────────────────────────────────────────────────────── */
export const MetricProgress: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div id="metric-progress-section" className={`flex flex-col gap-4 sm:gap-6 ${className}`}>
      <div className="flex items-center gap-8 sm:gap-14 lg:gap-16">
        <div className="text-[9px] sm:text-[10px] lg:text-[11px] font-semibold tracking-wider text-white/95 uppercase leading-[1.25] font-mono">
          <div>HIGH-QUALITY</div>
          <div>DEVELOPMENT</div>
        </div>
        <div className="text-[32px] sm:text-[40px] lg:text-[46px] font-light text-white tracking-tight leading-none font-sans">
          +2K
        </div>
      </div>
      <div className="relative w-[190px] sm:w-[230px] lg:w-[250px] pt-3 pb-1" id="technical-timeline-bar">
        <div className="absolute top-0 left-0 w-full h-[10px] pointer-events-none">
          <div className="absolute left-[0%] top-0 w-[1px] h-[10px] bg-white/35" />
          <div className="absolute left-[33.33%] top-0 w-[1px] h-[10px] bg-white/35" />
          <div className="absolute left-[66.66%] top-0 w-[1px] h-[10px] bg-white/35" />
          <div className="absolute left-[100%] top-0 w-[1px] h-[10px] bg-white/35" />
        </div>
        <div className="relative w-full h-[2px] bg-white/15 rounded-full overflow-hidden mt-[4px]">
          <div
            className="h-full bg-[#98FF68] rounded-full transition-all duration-700 ease-out"
            style={{
              width: '66.66%',
              boxShadow: '0 0 10px rgba(152, 255, 104, 0.75), 0 0 3px rgba(255, 255, 255, 0.9)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   4. TechIcon (Glassmorphic Action Button)
   ───────────────────────────────────────────────────────────── */
export const TechIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <button
      id="bottom-tech-action-btn"
      aria-label="Interactive Action"
      className={`group relative flex items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#98FF68]/40 backdrop-blur-md transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:shadow-[0_0_24px_rgba(152,255,104,0.3)] hover:scale-[1.05] active:scale-95 cursor-pointer overflow-hidden ${className || 'w-[54px] h-[54px]'}`}
    >
      <div className="absolute inset-0 bg-radial from-[#98FF68]/15 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <svg
        className="w-4 h-4 text-white/90 group-hover:text-white group-hover:rotate-90 transition-all duration-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────
   5. HaosLogo (Geometric Vector NAOS Branding)
   ───────────────────────────────────────────────────────────── */
export const HaosLogo: React.FC<{ className?: string }> = ({ className = 'w-32 h-auto' }) => {
  return (
    <svg
      viewBox="0 0 240 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NAOS Logo"
    >
      {/* N */}
      <path
        d="M 12 42 L 12 18 C 12 12 18 8 28 8 C 38 8 44 12 44 18 L 44 42"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* A */}
      <path
        d="M 70 42 L 70 18 C 70 12 76 8 86 8 C 96 8 102 12 102 18 L 102 42"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 70 26 L 102 26"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* O */}
      <rect
        x="128"
        y="8"
        width="34"
        height="34"
        rx="10"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* S */}
      <path
        d="M 218 15 C 215 10 207 8 199 8 C 189 8 184 13 184 19 C 184 26 191 28 201 30 C 213 32 220 35 220 42 C 220 48 214 52 203 52 C 193 52 186 48 183 43"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   6. Main Template Component: HaosShowcase
   ───────────────────────────────────────────────────────────── */
export default function HaosShowcase() {
  return (
    <main
      id="haos-showcase-section"
      className="relative w-full min-h-[100dvh] h-[100dvh] bg-[#020202] text-white flex flex-col justify-between overflow-hidden select-none font-sans"
    >
      <BackgroundArtwork />

      <header className="relative z-20 w-full pt-6 sm:pt-[55px] lg:pt-[65px] px-6 sm:px-[60px] lg:px-[95px]">
        <TopMetadata />
      </header>

      <div className="relative z-20 w-full flex-1 flex flex-col lg:flex-row items-start justify-between px-6 sm:px-[60px] lg:px-[95px] py-2 sm:py-4 my-auto">
        <div className="flex flex-col max-w-[420px]" id="hero-title-block">
          <h1 className="text-[25px] sm:text-[32px] lg:text-[34px] font-bold text-white tracking-[-0.02em] leading-[1.12]">
            HAOS Tech<br />
            Solutions
          </h1>
          <h2 className="mt-5 sm:mt-7 lg:mt-9 text-[17px] sm:text-[22px] lg:text-[23px] font-bold text-white tracking-[-0.015em] leading-[1.2]">
            Brand Concept &amp;<br />
            Identity
          </h2>
        </div>

        <div
          id="center-logo-container"
          className="mt-6 sm:mt-8 lg:mt-2 lg:absolute lg:left-[48%] lg:top-[38%] transform -translate-y-1/2"
        >
          <HaosLogo className="w-[102px] sm:w-[115px] lg:w-[128px] h-auto text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" />
        </div>
      </div>

      <footer className="relative z-20 w-full pb-6 sm:pt-4 sm:pb-[55px] lg:pb-[65px] px-6 sm:px-[60px] lg:px-[95px] flex items-end justify-between">
        <MetricProgress />
        <div className="pb-1">
          <TechIcon className="w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] lg:w-[54px] lg:h-[54px]" />
        </div>
      </footer>
    </main>
  );
}
