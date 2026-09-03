import React, { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   1. 5x5 Bitmap Glyph Matrix Dictionary
   ───────────────────────────────────────────────────────────── */
const GLYPH_MAP: Record<string, number[][]> = {
  A: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  C: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1],
  ],
  E: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  F: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  G: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  H: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  I: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  K: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ],
  M: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  N: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 0, 0, 1],
  ],
  O: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  R: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ],
  S: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  T: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  W: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1],
  ],
  '2': [
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  '0': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  '6': [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  ' ': [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
};

/* ─────────────────────────────────────────────────────────────
   2. PixelText Component
   ───────────────────────────────────────────────────────────── */
interface PixelTextProps {
  text: string;
  color?: string;
  pixelSize?: number;
  letterSpacing?: number;
  className?: string;
  id?: string;
}

export const PixelText: React.FC<PixelTextProps> = ({
  text,
  color = '#0755CE',
  pixelSize = 8,
  letterSpacing = 1.2,
  className = '',
  id,
}) => {
  const chars = text.toUpperCase().split('');
  const glyphWidth = 5 * pixelSize;
  const glyphHeight = 5 * pixelSize;
  const gap = letterSpacing * pixelSize;
  const totalWidth = chars.length * glyphWidth + (chars.length - 1) * gap;

  return (
    <svg
      id={id}
      width={totalWidth}
      height={glyphHeight}
      viewBox={`0 0 ${totalWidth} ${glyphHeight}`}
      className={`inline-block select-none ${className}`}
      style={{ shapeRendering: 'crispEdges' }}
    >
      {chars.map((char, charIdx) => {
        const matrix = GLYPH_MAP[char] || GLYPH_MAP[' '];
        const xOffset = charIdx * (glyphWidth + gap);

        return (
          <g key={charIdx} transform={`translate(${xOffset}, 0)`}>
            {matrix.map((row, rIdx) =>
              row.map((val, cIdx) => {
                if (!val) return null;
                return (
                  <rect
                    key={`${rIdx}-${cIdx}`}
                    x={cIdx * pixelSize}
                    y={rIdx * pixelSize}
                    width={pixelSize}
                    height={pixelSize}
                    fill={color}
                  />
                );
              })
            )}
          </g>
        );
      })}
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   3. PixelTransition Component (Pure Code Canvas Pixel Wave)
   ───────────────────────────────────────────────────────────── */
interface PixelTransitionProps {
  className?: string;
  height?: number; // Default: 180px
}

export const PixelTransition: React.FC<PixelTransitionProps> = ({
  className = '',
  height = 180,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;

    // Deterministic pseudo-random generator
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // Color palette matching the visual
    const COLOR_BLUE = '#0755CE';
    const COLOR_LIGHT_GRAY = '#E8E9EE';
    const WHITE_PIXEL_COLORS = ['#FFFFFF', '#F0F2F8', '#DDE2F0', '#B8CFFC'];
    const BLUE_PIXEL_COLORS = ['#0755CE', '#064EC2', '#0A5FE4', '#043A94'];

    const render = () => {
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;

      // Split base: Top half blue (#0755CE), bottom half light gray (#E8E9EE)
      const midY = height * 0.48;

      ctx.fillStyle = COLOR_BLUE;
      ctx.fillRect(0, 0, width, midY);

      ctx.fillStyle = COLOR_LIGHT_GRAY;
      ctx.fillRect(0, midY, width, height - midY);

      // Grid sizing: 6px cells for crisp voxel/pixel granularity
      const cellSize = 6;
      const cols = Math.ceil(width / cellSize);
      const rows = Math.ceil(height / cellSize);
      const midRow = Math.floor(midY / cellSize);

      // Procedural pixel wave dissolution
      for (let c = 0; c < cols; c++) {
        // Horizontal column sine/cosine noise creates the wavy crest line
        const colNoise1 = Math.sin(c * 0.15) * 2.2;
        const colNoise2 = Math.cos(c * 0.38 + 1.2) * 1.6;
        const localMidRow = midRow + Math.round(colNoise1 + colNoise2);

        for (let r = 0; r < rows; r++) {
          const px = c * cellSize;
          const py = r * cellSize;
          const seed = c * 7919 + r * 104729;
          const rand = pseudoRandom(seed);

          if (r < localMidRow) {
            // Above midpoint: solid blue background with rising white/cyan pixel particles
            const distFromMid = localMidRow - r;
            const threshold = Math.max(0, 1 - distFromMid * 0.11);

            if (rand < threshold) {
              const colorIdx = Math.floor(pseudoRandom(seed + 1) * WHITE_PIXEL_COLORS.length);
              ctx.fillStyle = WHITE_PIXEL_COLORS[colorIdx];
              ctx.fillRect(px, py, cellSize, cellSize);
            }
          } else {
            // Below midpoint: gray background with falling blue pixel clusters
            const distFromMid = r - localMidRow;
            const threshold = Math.max(0, 0.88 - distFromMid * 0.085);

            if (rand < threshold) {
              const colorIdx = Math.floor(pseudoRandom(seed + 2) * BLUE_PIXEL_COLORS.length);
              ctx.fillStyle = BLUE_PIXEL_COLORS[colorIdx];
              ctx.fillRect(px, py, cellSize, cellSize);
            }
          }
        }
      }

      // Handcrafted pixel artifacts matching the reference graphic:
      // 1. Triple blue pixel blocks on the lower-left
      const clusterBaseX = Math.floor((width * 0.05) / cellSize) * cellSize;
      const clusterBaseY = Math.floor((height * 0.72) / cellSize) * cellSize;
      ctx.fillStyle = COLOR_BLUE;
      ctx.fillRect(clusterBaseX, clusterBaseY, cellSize, cellSize);
      ctx.fillRect(clusterBaseX + cellSize * 2, clusterBaseY, cellSize, cellSize);
      ctx.fillRect(clusterBaseX + cellSize * 4, clusterBaseY, cellSize, cellSize);

      // 2. Scattered floating blue pixels on the lower-right
      const rightPixels = [
        { xRatio: 0.82, yRatio: 0.70 },
        { xRatio: 0.89, yRatio: 0.72 },
        { xRatio: 0.94, yRatio: 0.68 },
        { xRatio: 0.78, yRatio: 0.78 },
        { xRatio: 0.84, yRatio: 0.84 },
      ];
      for (const p of rightPixels) {
        const px = Math.floor((width * p.xRatio) / cellSize) * cellSize;
        const py = Math.floor((height * p.yRatio) / cellSize) * cellSize;
        ctx.fillRect(px, py, cellSize, cellSize);
      }
    };

    render();

    const handleResize = () => {
      cancelAnimationFrame(animId);
      render();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [height]);

  return (
    <div
      id="pixel-particle-transition"
      className={`relative w-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

// Export alias for backward compatibility
export const PixelParticleTransition = PixelTransition;

/* ─────────────────────────────────────────────────────────────
   4. VoxelWeb3FooterSection (The Requested Footer Section)
   ───────────────────────────────────────────────────────────── */
export const VoxelWeb3FooterSection: React.FC = () => {
  return (
    <footer
      className="w-full bg-[#E8E9EE] text-black flex flex-col items-center select-none font-mono"
      style={{ backgroundColor: '#E8E9EE' }}
    >
      {/* 1. Top Disintegrating Pixel Wave Transition */}
      <PixelTransition height={180} />

      {/* 2. Main Content Canvas */}
      <div className="w-full max-w-6xl px-6 sm:px-10 md:px-14 pt-12 pb-8 flex flex-col">
        {/* Mid-Right Marketing Statement */}
        <div className="w-full flex justify-end items-start mb-16 sm:mb-24">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <span className="w-6 h-[2px] bg-black mt-2 inline-block shrink-0" />
            <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-black leading-tight">
              MARKETING<br />
              APPROACH<br />
              WEBSITE<br />
              DEVELOPMENT<br />
              WITH OUTSTANDING<br />
              DESIGN
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-black pl-4 sm:pl-6">
              IN
            </div>
          </div>
        </div>

        {/* Lower Row: Giant Pixel Brand (Left) + Inquiry & Callout (Right) */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          {/* Bottom-Left: SEGMINT 2026 */}
          <div className="flex flex-col space-y-2">
            <div>
              <PixelText
                text="SEGMINT"
                color="#0755CE"
                pixelSize={9}
                letterSpacing={1.2}
              />
            </div>
            <div>
              <PixelText
                text="2026"
                color="#0755CE"
                pixelSize={9}
                letterSpacing={1.2}
              />
            </div>
          </div>

          {/* Bottom-Center & Bottom-Right Callouts */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between md:justify-end gap-6 w-full md:w-auto">
            <div className="text-[9px] sm:text-[10px] font-mono tracking-wider uppercase text-black">
              INTERESTED TO START A PROJECT WITH US?
            </div>
            <div className="text-[8px] sm:text-[9px] font-mono tracking-widest uppercase text-right text-black leading-tight">
              LETS FIND OUT<br />
              WHAT WE CAN DO<br />
              FOR YOU.
            </div>
          </div>
        </div>

        {/* Hairline Divider Line */}
        <div className="w-full h-[1.5px] bg-black my-3" />

        {/* Bottom Legal Credits */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono font-normal text-black uppercase tracking-wider pt-2">
          <div className="text-left w-full sm:w-auto">
            <span>&copy; BY JAINIL PATEL</span>
          </div>
          <div className="text-center w-full sm:w-auto">
            <span>[ WEB 3 ] [ NFT ]</span>
          </div>
          <div className="text-right w-full sm:w-auto">
            <span>UI HUB 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ─────────────────────────────────────────────────────────────
   5. Main Composite Component: SegmintFooter / SegmintTemplate
   ───────────────────────────────────────────────────────────── */
export default function SegmintFooter() {
  const [pixelSize, setPixelSize] = useState(12);
  const [imgSize, setImgSize] = useState(240);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setPixelSize(5);
        setImgSize(130);
      } else if (width < 640) {
        setPixelSize(7);
        setImgSize(170);
      } else if (width < 768) {
        setPixelSize(8.5);
        setImgSize(210);
      } else if (width < 1024) {
        setPixelSize(10.5);
        setImgSize(250);
      } else if (width < 1280) {
        setPixelSize(12.5);
        setImgSize(280);
      } else {
        setPixelSize(14);
        setImgSize(310);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main
      id="root-landing-container"
      className="min-h-screen w-full flex flex-col bg-[#E8E9EE] overflow-x-hidden font-sans select-none"
    >
      {/* 1. TOP BLUE HERO SECTION (Untouched as requested) */}
      <section
        id="hero-cobalt-section"
        className="relative w-full bg-[#0755CE] flex flex-col items-center overflow-hidden pt-12 sm:pt-16 md:pt-20 pb-44 sm:pb-52 md:pb-60 px-4"
        style={{ backgroundColor: '#0755CE' }}
      >
        <div
          id="hero-content-container"
          className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center select-none"
        >
          {/* Top Line: THANKS */}
          <div className="flex justify-center w-full">
            <PixelText
              id="bg-text-thanks"
              text="THANKS"
              color="#FFFFFF"
              pixelSize={pixelSize}
              letterSpacing={1.8}
              className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
            />
          </div>

          {/* Second Line: FOR WATCH */}
          <div className="flex justify-center w-full mt-3 sm:mt-4 md:mt-5">
            <PixelText
              id="bg-text-for-watch"
              text="FOR WATCH"
              color="#FFFFFF"
              pixelSize={pixelSize}
              letterSpacing={1.8}
              className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
            />
          </div>

          {/* Central Object Image */}
          <div
            id="central-object-wrapper"
            className="absolute z-20 top-[20px] sm:top-[28px] md:top-[38px] left-1/2 -translate-x-1/2 pointer-events-none select-none drop-shadow-[0_20px_35px_rgba(0,18,65,0.45)] transition-all duration-700 ease-out"
          >
            <img
              id="central-token-image"
              src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788398119/151f2cbf-daf8-4dbc-8dae-91a4097a3fe5_jk4jlm.png"
              alt="Ethereum Voxel Token"
              referrerPolicy="no-referrer"
              className="object-contain animate-float"
              style={{
                width: `${imgSize}px`,
                height: `${imgSize}px`,
              }}
            />
          </div>
        </div>
      </section>

      {/* 2. NEW FOOTER WITH DISINTEGRATING CRYPTO PIXEL WAVE (As requested) */}
      <VoxelWeb3FooterSection />
    </main>
  );
}
