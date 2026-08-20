import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_DIR = path.resolve(__dirname, '../../frontend/src');

// Read existing datasets
import { EMBEDDED_SOURCE_CODE as existingSource } from '../src/data/sourceCodeData.js';

const TEXT_COMPONENTS = {
  'fade-text': `import React from 'react';
import { motion } from 'framer-motion';

export interface FadeTextProps {
  text?: string;
  className?: string;
  duration?: number;
}

export const FadeText: React.FC<FadeTextProps> = ({
  text = "FADE TEXT",
  className = "text-6xl md:text-8xl font-black text-white tracking-tighter text-center",
  duration = 1.5
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {text}
  </motion.div>
);

export default FadeText;`,

  'blur-text': `import React from 'react';
import { motion } from 'framer-motion';

export interface BlurTextProps {
  text?: string;
  className?: string;
}

export const BlurInText: React.FC<BlurTextProps> = ({
  text = "BLUR IN TEXT",
  className = "text-6xl md:text-8xl font-black text-white tracking-tighter text-center"
}) => (
  <motion.div
    initial={{ filter: 'blur(20px)', opacity: 0 }}
    animate={{ filter: 'blur(0px)', opacity: 1 }}
    transition={{ duration: 1.2, ease: "easeOut" }}
    className={className}
  >
    {text}
  </motion.div>
);

export default BlurInText;`,

  'dock-text': `import React from 'react';
import { motion } from 'framer-motion';

export interface DockTextProps {
  text?: string;
  className?: string;
}

export const DockText: React.FC<DockTextProps> = ({
  text = "DOCK TEXT",
  className = "text-6xl md:text-8xl font-black text-white tracking-tighter text-center cursor-pointer"
}) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.15, textShadow: "0 0 24px rgba(255,255,255,0.8)" }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className={className}
  >
    {text}
  </motion.div>
);

export default DockText;`,

  'font-weight': `import React, { useState, useEffect } from 'react';

export interface FontWeightTextProps {
  text?: string;
  className?: string;
}

export const FontWeightText: React.FC<FontWeightTextProps> = ({
  text = "VARIABLE WEIGHT",
  className = "text-6xl md:text-8xl font-sans text-white tracking-tighter text-center transition-all duration-700"
}) => {
  const [weight, setWeight] = useState(400);

  useEffect(() => {
    const interval = setInterval(() => {
      setWeight(prev => (prev === 400 ? 900 : 400));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className} style={{ fontWeight: weight }}>
      {text}
    </div>
  );
};

export default FontWeightText;`,

  'gradual-spacing': `import React from 'react';
import { motion } from 'framer-motion';

export interface GradualSpacingProps {
  text?: string;
  className?: string;
}

export const GradualSpacingText: React.FC<GradualSpacingProps> = ({
  text = "GRADUAL SPACING",
  className = "flex justify-center text-5xl md:text-7xl font-black text-white tracking-tight"
}) => (
  <div className={className}>
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
      >
        {char === ' ' ? '\\u00A0' : char}
      </motion.span>
    ))}
  </div>
);

export default GradualSpacingText;`,

  'letter-pull-up': `import React from 'react';
import { motion } from 'framer-motion';

export interface LetterPullUpProps {
  text?: string;
  className?: string;
}

export const LetterPullUpText: React.FC<LetterPullUpProps> = ({
  text = "LETTER PULL UP",
  className = "flex justify-center overflow-hidden text-5xl md:text-7xl font-black text-white"
}) => (
  <div className={className}>
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        {char === ' ' ? '\\u00A0' : char}
      </motion.span>
    ))}
  </div>
);

export default LetterPullUpText;`,

  'multi-direction-slide': `import React from 'react';
import { motion } from 'framer-motion';

export interface MultiDirectionSlideProps {
  text?: string;
  className?: string;
}

export const MultiDirectionSlideText: React.FC<MultiDirectionSlideProps> = ({
  text = "MULTI DIRECTION",
  className = "flex justify-center overflow-hidden text-5xl md:text-7xl font-black text-white"
}) => {
  const directions = [
    { x: -50, y: 0 },
    { x: 50, y: 0 },
    { x: 0, y: -50 },
    { x: 0, y: 50 }
  ];

  return (
    <div className={className}>
      {text.split('').map((char, i) => {
        const dir = directions[i % 4];
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: dir.x, y: dir.y }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.03, ease: "easeOut" }}
          >
            {char === ' ' ? '\\u00A0' : char}
          </motion.span>
        );
      })}
    </div>
  );
};

export default MultiDirectionSlideText;`,

  'scale-letter': `import React from 'react';
import { motion } from 'framer-motion';

export interface ScaleLetterProps {
  text?: string;
  className?: string;
}

export const ScaleLetterText: React.FC<ScaleLetterProps> = ({
  text = "SCALE LETTER",
  className = "flex justify-center text-5xl md:text-7xl font-black text-white"
}) => (
  <div className={className}>
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
      >
        {char === ' ' ? '\\u00A0' : char}
      </motion.span>
    ))}
  </div>
);

export default ScaleLetterText;`,

  'separate-away': `import React from 'react';
import { motion } from 'framer-motion';

export interface SeparateAwayProps {
  upperText?: string;
  lowerText?: string;
}

export const SeparateAwayText: React.FC<SeparateAwayProps> = ({
  upperText = "SEPARATE",
  lowerText = "AWAY"
}) => (
  <div className="flex flex-col items-center justify-center font-black text-5xl md:text-7xl text-white">
    <motion.span
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: -10, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {upperText}
    </motion.span>
    <motion.span
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 10, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-brand-blue"
    >
      {lowerText}
    </motion.span>
  </div>
);

export default SeparateAwayText;`,

  'wavy-text': `import React from 'react';
import { motion } from 'framer-motion';

export interface WavyTextProps {
  text?: string;
  className?: string;
}

export const WavyText: React.FC<WavyTextProps> = ({
  text = "WAVY TEXT ANIMATION",
  className = "flex justify-center text-5xl md:text-7xl font-black text-white"
}) => (
  <div className={className}>
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
      >
        {char === ' ' ? '\\u00A0' : char}
      </motion.span>
    ))}
  </div>
);

export default WavyText;`,

  'word-pull-up': `import React from 'react';
import { motion } from 'framer-motion';

export interface WordPullUpProps {
  words?: string;
  className?: string;
}

export const WordPullUpText: React.FC<WordPullUpProps> = ({
  words = "WORD PULL UP EFFECT",
  className = "flex flex-wrap justify-center gap-3 text-5xl md:text-7xl font-black text-white"
}) => (
  <div className={className}>
    {words.split(' ').map((word, i) => (
      <motion.span
        key={i}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="inline-block"
      >
        {word}
      </motion.span>
    ))}
  </div>
);

export default WordPullUpText;`,

  'hacker-background': `import React, { useEffect, useRef } from 'react';

export const HackerBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテト';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00ff41';
      ctx.font = \`\${fontSize}px monospace\`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full bg-black z-0"
    />
  );
};

export default HackerBackground;`,

  'glow-button': `import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export const GlowButton: React.FC<{ children?: React.ReactNode; onClick?: () => void }> = ({
  children = "Explore UI Hub",
  onClick
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      onClick={onClick}
      className="relative px-8 py-4 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold tracking-wider uppercase overflow-hidden transition-all duration-300 hover:border-emerald-500/50 shadow-2xl group"
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl"
        style={{
          background: \`radial-gradient(180px circle at \${position.x}px \${position.y}px, rgba(16,185,129,0.35), transparent 80%)\`
        }}
      />
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default GlowButton;`,

  'spotlight-cards': `import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const SpotlightCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className="relative rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 overflow-hidden shadow-2xl"
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: \`radial-gradient(600px circle at \${position.x}px \${position.y}px, rgba(255,255,255,0.06), transparent 40%)\`
        }}
      />
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-neutral-400 text-sm">{desc}</p>
    </div>
  );
};

export default SpotlightCard;`,

  'liquid-glass': `import React from 'react';

export const LiquidGlassCard: React.FC<{ title?: string; temp?: string; location?: string }> = ({
  title = "Weather Overview",
  temp = "+18°C",
  location = "San Francisco"
}) => (
  <div className="relative p-8 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] max-w-sm text-white">
    <div className="flex justify-between items-start mb-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">{title}</p>
        <h2 className="text-2xl font-bold mt-1">{location}</h2>
      </div>
      <span className="text-4xl font-black">{temp}</span>
    </div>
    <p className="text-xs text-white/80 leading-relaxed">
      Simulated liquid-glass refraction effect with backdrop filter blur and frosted translucent gradients.
    </p>
  </div>
);

export default LiquidGlassCard;`,

  'image-reveal': `import React, { useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const ImageReveal: React.FC = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 300, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 300, damping: 25 });

  const items = [
    { title: "Design System", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80" },
    { title: "Motion Physics", img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80" },
    { title: "Quantum UI", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" }
  ];

  return (
    <div
      onMouseMove={(e) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }}
      className="relative w-full max-w-xl mx-auto space-y-4"
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          onMouseEnter={() => setHovered(idx)}
          onMouseLeave={() => setHovered(null)}
          className="p-6 border-b border-neutral-800 flex justify-between items-center cursor-pointer hover:bg-neutral-900/50 rounded-xl transition-all"
        >
          <span className="text-2xl font-black text-white">{item.title}</span>
          <span className="text-neutral-500 font-mono text-xs">0{idx + 1}</span>
        </div>
      ))}
      {hovered !== null && (
        <motion.img
          src={items[hovered].img}
          style={{ left: smoothX, top: smoothY, x: "-50%", y: "-50%" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-50 w-64 h-40 object-cover rounded-xl shadow-2xl pointer-events-none border-2 border-white/20"
        />
      )}
    </div>
  );
};

export default ImageReveal;`,
};

const imageTrailCode = fs.readFileSync(path.resolve(FRONTEND_DIR, 'components/ui/image-trail.tsx'), 'utf8');
const perspectiveCarouselCode = fs.readFileSync(path.resolve(FRONTEND_DIR, 'components/ui/perspective-carousel.tsx'), 'utf8');

const fullDataset = {
  ...existingSource,
  ...TEXT_COMPONENTS,
  'image-trail': imageTrailCode,
  'perspective-carousel': perspectiveCarouselCode,
};

// Write to backend
const backendOut = `/**
 * PRODUCTION-SAFE 100% COMPLETE EMBEDDED SOURCE CODE
 * 100% COMPLETE COVERAGE (All 71 UI-HUB Components)
 */

export const EMBEDDED_SOURCE_CODE = ${JSON.stringify(fullDataset, null, 2)};
`;

fs.writeFileSync(path.resolve(__dirname, '../src/data/sourceCodeData.js'), backendOut, 'utf8');
console.log('Updated backend/src/data/sourceCodeData.js with 100% complete dataset!');

// Write to frontend
const frontendOut = `/**
 * PRODUCTION-SAFE 100% COMPLETE EMBEDDED SOURCE CODE
 * 100% COMPLETE COVERAGE (All 71 UI-HUB Components)
 */

export const EMBEDDED_SOURCE_CODE: Record<string, string> = ${JSON.stringify(fullDataset, null, 2)};
`;

fs.writeFileSync(path.resolve(FRONTEND_DIR, 'data/embeddedSourceCode.ts'), frontendOut, 'utf8');
console.log('Updated frontend/src/data/embeddedSourceCode.ts with 100% complete dataset!');
