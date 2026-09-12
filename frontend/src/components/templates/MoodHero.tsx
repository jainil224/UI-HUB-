import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, Volume2, VolumeX, X, Sparkles, Heart } from 'lucide-react';

// ============================================================================
// 1. WEB AUDIO SYNTHESIZER
// ============================================================================
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playBubble(freq: number = 440, duration: number = 0.08) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + duration);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  public playChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const startTime = now + idx * 0.06;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.03, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.65);
      });
    } catch {}
  }
}

export const soundManager = new SoundManager();

// ============================================================================
// 2. BACKGROUND ATMOSPHERE & ORGANIC FOLIAGE SHADOWS
// ============================================================================
export const BackgroundAtmosphere: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#EDE8DE]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#F2EEE4] via-[#ECE7DD] to-[#E6E0D4] opacity-90" />

      {/* Top Golden Sun Crest */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[-140px] sm:top-[-180px] md:top-[-220px] w-[600px] sm:w-[850px] md:w-[1100px] h-[550px] sm:h-[750px] md:h-[900px] rounded-full bg-gradient-to-b from-[#E7A635] via-[#E29A28] to-[#D98E1F] opacity-95 blur-[1px] shadow-2xl transition-transform duration-1000"
        style={{ boxShadow: '0 0 120px 40px rgba(231, 166, 53, 0.35)' }}
      />
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[400px] rounded-full bg-white/25 blur-[120px]" />
      <div className="absolute top-[30%] right-[15%] w-[450px] h-[450px] rounded-full bg-[#FFE4A0]/20 blur-[130px]" />

      {/* Top Left Leaf Shadow */}
      <div className="absolute -top-12 -left-16 w-[480px] h-[480px] opacity-[0.28] blur-[28px] animate-[pulse_14s_ease-in-out_infinite]">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-[#423C32]">
          <path d="M 60 40 Q 120 70 170 140 Q 120 180 80 150 Q 50 110 60 40 Z" />
          <path d="M 140 30 Q 230 50 260 120 Q 200 160 160 110 Q 130 70 140 30 Z" />
          <path d="M 90 150 Q 160 210 200 300 Q 140 310 110 240 Q 80 190 90 150 Z" />
          <path d="M 190 130 Q 280 190 320 270 Q 270 300 220 230 Q 180 170 190 130 Z" />
          <circle cx="110" cy="90" r="45" />
          <circle cx="200" cy="110" r="55" />
        </svg>
      </div>

      {/* Top Right Leaf Shadow */}
      <div className="absolute -top-16 -right-16 w-[560px] h-[560px] opacity-[0.25] blur-[32px] animate-[pulse_16s_ease-in-out_infinite]">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-[#423C32]">
          <path d="M 340 30 Q 280 70 230 140 Q 280 180 320 150 Q 350 110 340 30 Z" />
          <path d="M 260 20 Q 170 50 140 120 Q 200 160 240 110 Q 270 70 260 20 Z" />
          <circle cx="280" cy="80" r="50" />
          <circle cx="190" cy="100" r="60" />
        </svg>
      </div>
    </div>
  );
};

// ============================================================================
// 3. TOP FLOATING NAVBAR
// ============================================================================
interface NavbarProps {
  onActionClick?: (action: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onActionClick }) => {
  const links = ['Projects', 'Solutions', 'Pricing', 'Company', 'Support'];

  const handleLinkClick = (e: React.MouseEvent, link: string) => {
    e.preventDefault();
    soundManager.playBubble(520, 0.05);
    onActionClick?.(link);
  };

  const handleTryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    soundManager.playBubble(620, 0.08);
    onActionClick?.('Try for free');
  };

  return (
    <header className="relative w-full pt-4 sm:pt-6 flex justify-center items-center z-30 px-4">
      <nav
        aria-label="Main Navigation"
        className="inline-flex items-center gap-2 sm:gap-4 md:gap-5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-neutral-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
      >
        <button
          type="button"
          onClick={(e) => handleLinkClick(e, 'Home')}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-900 text-white cursor-pointer focus:outline-none"
          title="Mood Hero"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <circle cx="12" cy="12" r="10" fill="#1C1C1E" />
            <path d="M 12 4 A 8 8 0 0 1 20 12 L 12 12 Z" fill="#FFFFFF" />
            <circle cx="12" cy="12" r="3.5" fill="#1C1C1E" />
          </svg>
        </button>

        <div className="hidden sm:flex items-center gap-3.5 md:gap-5 text-[11px] md:text-[12px] font-medium text-neutral-600">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={(e) => handleLinkClick(e, link)}
              className="transition-colors hover:text-neutral-950 focus:outline-none"
            >
              {link}
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={handleTryClick}
          className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#111111] text-white text-[10.5px] sm:text-[11px] font-medium tracking-tight hover:bg-neutral-800 transition-all cursor-pointer"
        >
          Try for free
        </button>
      </nav>
    </header>
  );
};

// ============================================================================
// 4. SOCIAL PROOF STACK
// ============================================================================
export const SocialProof: React.FC = () => {
  const avatars = [
    { id: '1', name: 'Elena', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { id: '2', name: 'Marcus', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { id: '3', name: 'Aisha', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
    { id: '4', name: 'Kai', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="flex flex-col items-center justify-center select-none pt-7 sm:pt-9 md:pt-11 mb-3 sm:mb-4">
      <div className="mb-1 w-6 h-4 text-neutral-900 flex justify-center">
        <svg viewBox="0 0 24 16" className="w-5 h-3.5 fill-none stroke-current stroke-[2.2] stroke-linecap-round">
          <path d="M 6 13 L 2 3" />
          <path d="M 12 14 L 12 1" />
          <path d="M 18 13 L 22 3" />
        </svg>
      </div>

      <div className="inline-flex items-center gap-2">
        <div className="flex items-center -space-x-2">
          {avatars.map((avatar, idx) => (
            <div
              key={avatar.id}
              className="relative w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full overflow-hidden border-[1.5px] border-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-neutral-200"
              style={{ zIndex: avatars.length - idx }}
            >
              <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <span className="text-[11px] sm:text-[11.5px] font-normal text-neutral-500 tracking-tight">
          Over 1k happy users
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// 5. HERO DOODLES
// ============================================================================
export const SparkleDoodleLeft: React.FC = () => (
  <div
    aria-hidden="true"
    className="absolute -left-8 sm:-left-11 md:-left-14 top-1 sm:top-2 select-none pointer-events-none text-neutral-900"
  >
    <svg
      viewBox="0 0 44 48"
      className="w-7 h-8 sm:w-8 sm:h-9 md:w-9 md:h-10 fill-none stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round"
    >
      <path d="M 24 4 C 24.5 14 26 18 36 19 C 26 20 24.5 24 24 34 C 23.5 24 22 20 12 19 C 22 18 23.5 14 24 4 Z" />
      <path d="M 10 32 C 10.3 36.5 11 38 16 38.5 C 11 39 10.3 40.5 10 45 C 9.7 40.5 9 39 4 38.5 C 9 38 9.7 36.5 10 32 Z" />
    </svg>
  </div>
);

export const CurlyDoodleRight: React.FC = () => (
  <div
    aria-hidden="true"
    className="absolute -right-8 sm:-right-11 md:-right-14 top-1 sm:top-2 select-none pointer-events-none text-neutral-900"
  >
    <svg
      viewBox="0 0 36 48"
      className="w-6 h-8 sm:w-7 sm:h-9 md:w-8 md:h-10 fill-none stroke-current stroke-[2.2] stroke-linecap-round stroke-linejoin-round"
    >
      <path d="M 12 6 C 18 4, 25 7, 26 12 C 27 18, 17 21, 14 23 C 10 25, 12 31, 18 32 C 24 33, 27 29, 28 36 C 29 41, 23 44, 20 44" />
    </svg>
  </div>
);

// ============================================================================
// 6. 3D PERSPECTIVE FLOOR GRID
// ============================================================================
export const PerspectiveFloorGrid: React.FC = () => {
  const width = 1200;
  const height = 500;
  const vpX = 600;
  const vpY = 30;

  const rays: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = -16; i <= 16; i++) {
    rays.push({ x1: vpX, y1: vpY, x2: vpX + i * 58, y2: height });
  }

  const horizLines: number[] = [];
  const totalHoriz = 22;
  for (let i = 1; i <= totalHoriz; i++) {
    const progress = Math.pow(i / totalHoriz, 1.7);
    horizLines.push(vpY + (height - vpY) * progress);
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 top-[285px] sm:top-[305px] md:top-[320px] pointer-events-none select-none z-10 overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 95%)',
        WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 95%)',
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full stroke-[#E2D8C6] opacity-85"
        strokeWidth="1.15"
      >
        {rays.map((ray, i) => (
          <line key={`ray-${i}`} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} />
        ))}
        {horizLines.map((y, i) => (
          <line key={`horiz-${i}`} x1={0} y1={y} x2={width} y2={y} />
        ))}
      </svg>
    </div>
  );
};

// ============================================================================
// 7. THE THREE ILLUSTRATED VIDEO CARDS
// ============================================================================

// Left Blue Card: Golden Sun Character
export const SunCard: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => {
        soundManager.playBubble(480, 0.08);
        onClick?.();
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        soundManager.playBubble(440, 0.06);
      }}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      className="group relative cursor-pointer select-none transition-transform duration-700 ease-out focus:outline-none"
      style={{ transform: isHovered ? 'translateY(-12px) rotate(-1deg) scale(1.02)' : 'none' }}
    >
      <div
        className="relative w-[240px] sm:w-[280px] md:w-[320px] lg:w-[350px] h-[340px] sm:h-[400px] md:h-[460px] rounded-t-[34px] sm:rounded-t-[38px] md:rounded-t-[44px] overflow-hidden shadow-[0_12px_36px_rgba(36,185,231,0.22)]"
        style={{ backgroundColor: '#24B9E7' }}
      >
        <svg viewBox="0 0 350 460" className="w-full h-full pointer-events-none">
          {/* Purple Pill (Top Right) */}
          <g transform="translate(245, 110) rotate(35)">
            <rect x="-16" y="-8" width="32" height="16" rx="8" fill="#A47AE8" stroke="#111111" strokeWidth="2.8" />
          </g>
          {/* Green Cross (Top Left) */}
          <g transform="translate(68, 140) rotate(15)">
            <path
              d="M -3 -12 L 3 -12 L 3 -3 L 12 -3 L 12 3 L 3 3 L 3 12 L -3 12 L -3 3 L -12 3 L -12 -3 L -3 -3 Z"
              fill="#67C85A"
              stroke="#111111"
              strokeWidth="2.4"
            />
          </g>
          {/* Sun Body & Face */}
          <g transform="translate(195, 335)">
            {[-135, -115, -95, -75, -55, -35, -15, 5, 25, 45, 65, 85, 105, 125, 145, 165, 185, 205].map((angle, idx) => (
              <path
                key={idx}
                d="M -16 -88 L 0 -124 L 16 -88 Z"
                transform={`rotate(${angle})`}
                fill="#FFC74A"
                stroke="#111111"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
            ))}
            <circle cx="0" cy="0" r="92" fill="#FFC74A" stroke="#111111" strokeWidth="3.4" />
            {/* Happy eyes & smile */}
            <path d="M -44 -14 Q -32 -26 -20 -14" fill="none" stroke="#111111" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M 20 -14 Q 32 -26 44 -14" fill="none" stroke="#111111" strokeWidth="3.4" strokeLinecap="round" />
            <circle cx="0" cy="-2" r="7" fill="#FF8595" stroke="#111111" strokeWidth="3" />
            <path d="M -30 18 Q 0 46 30 18" fill="none" stroke="#111111" strokeWidth="3.4" strokeLinecap="round" />
          </g>
          {/* Fluffy Cloud */}
          <g transform="translate(180, 420)">
            <path
              d="M -110 30 C -125 15, -120 -10, -95 -15 C -90 -45, -50 -55, -25 -35 C -5 -65, 45 -65, 65 -35 C 95 -45, 125 -15, 120 15 C 135 30, 120 60, 95 65 L -95 65 C -115 60, -125 45, -110 30 Z"
              fill="#FFFFFF"
              stroke="#111111"
              strokeWidth="3.6"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

// Center Pink Card: Peace Hand Character
export const PeaceHandCard: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => {
        soundManager.playChime();
        onClick?.();
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        soundManager.playBubble(520, 0.06);
      }}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      className="group relative z-20 cursor-pointer select-none transition-transform duration-700 ease-out focus:outline-none"
      style={{ transform: isHovered ? 'translateY(-16px) scale(1.025)' : 'none' }}
    >
      <div
        className="relative w-[260px] sm:w-[310px] md:w-[360px] lg:w-[390px] h-[370px] sm:h-[430px] md:h-[500px] rounded-t-[36px] sm:rounded-t-[42px] md:rounded-t-[48px] overflow-hidden shadow-[0_20px_50px_rgba(245,156,199,0.35)]"
        style={{ backgroundColor: '#F59CC7' }}
      >
        <svg viewBox="0 0 380 500" className="w-full h-full pointer-events-none">
          {/* Sparkles */}
          <g transform="translate(268, 120)">
            <path
              d="M 0 -22 C 1 -8, 8 -1, 22 0 C 8 1, 1 8, 0 22 C -1 8, -8 1, -22 0 C -8 -1, -1 -8, 0 -22 Z"
              fill="#FFD242"
              stroke="#111111"
              strokeWidth="2.8"
            />
          </g>
          {/* Green Daisy Flower */}
          <g transform="translate(280, 185) scale(1.15)">
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="-16"
                rx="8"
                ry="12"
                transform={`rotate(${angle})`}
                fill="#94DC78"
                stroke="#111111"
                strokeWidth="2.6"
              />
            ))}
            <circle cx="0" cy="0" r="9" fill="#FFC74A" stroke="#111111" strokeWidth="2.6" />
          </g>
          {/* White Peace Hand Glove */}
          <g transform="translate(190, 290)">
            {/* Index Finger */}
            <path
              d="M -24 -15 L -22 -145 C -22 -162, 2 -162, 2 -145 L 2 -40"
              fill="#FFFFFF"
              stroke="#111111"
              strokeWidth="3.8"
            />
            {/* Middle Finger */}
            <path
              d="M 2 -40 L 4 -148 C 4 -165, 28 -165, 28 -148 L 28 -15"
              fill="#FFFFFF"
              stroke="#111111"
              strokeWidth="3.8"
            />
            {/* Ring & Palm */}
            <path
              d="M 27 -20 C 38 -25, 48 -15, 46 8 C 44 26, 30 35, 12 35"
              fill="#FFFFFF"
              stroke="#111111"
              strokeWidth="3.8"
            />
            <path
              d="M -42 10 C -48 35, -42 65, -30 82 L 30 82 C 42 65, 46 35, 42 10 Z"
              fill="#FFFFFF"
              stroke="#111111"
              strokeWidth="3.8"
            />
            {/* Thumb */}
            <path
              d="M -42 12 C -45 -10, -32 -25, -12 -18 C 4 -12, 10 2, 4 20 C -2 36, -20 40, -38 35 Z"
              fill="#FFFFFF"
              stroke="#111111"
              strokeWidth="3.8"
            />
            {/* Glove Cuff & Sleeve */}
            <g transform="translate(0, 84)">
              <rect x="-36" y="0" width="72" height="16" rx="8" fill="#FFFFFF" stroke="#111111" strokeWidth="3.8" />
            </g>
            <g transform="translate(0, 100)">
              <path d="M -32 0 L 32 0 L 30 35 L -30 35 Z" fill="#56B864" stroke="#111111" strokeWidth="3.8" />
            </g>
            {/* "IT'S" Banner */}
            <g transform="translate(0, 135)">
              <rect x="-42" y="0" width="84" height="45" rx="10" fill="#24B9E7" stroke="#111111" strokeWidth="3.8" />
              <text x="0" y="26" fill="#FFFFFF" fontSize="20" fontWeight="800" textAnchor="middle">
                IT'S
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};

// Right Coral Card: Sunflower Character
export const FlowerCard: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => {
        soundManager.playBubble(640, 0.08);
        onClick?.();
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        soundManager.playBubble(600, 0.06);
      }}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      className="group relative cursor-pointer select-none transition-transform duration-700 ease-out focus:outline-none"
      style={{ transform: isHovered ? 'translateY(-12px) rotate(1deg) scale(1.02)' : 'none' }}
    >
      <div
        className="relative w-[240px] sm:w-[280px] md:w-[320px] lg:w-[350px] h-[340px] sm:h-[400px] md:h-[460px] rounded-t-[34px] sm:rounded-t-[38px] md:rounded-t-[44px] overflow-hidden shadow-[0_12px_36px_rgba(248,113,98,0.22)]"
        style={{ backgroundColor: '#F87162' }}
      >
        <svg viewBox="0 0 350 460" className="w-full h-full pointer-events-none">
          {/* Cyan Star Burst (Top Right) */}
          <g transform="translate(262, 105)">
            <path
              d="M 0 -24 L 6 -8 L 22 -15 L 14 0 L 28 8 L 11 12 L 16 28 L 2 17 L -6 30 L -8 14 L -24 18 L -14 3 L -28 -6 L -12 -11 L -15 -26 L -2 -14 Z"
              fill="#15C0F6"
              stroke="#111111"
              strokeWidth="2.8"
            />
          </g>
          {/* Flower Body */}
          <g transform="translate(160, 345)">
            {[-130, -100, -70, -40, -10, 20, 50, 80, 110, 140, 170, 200].map((angle, idx) => (
              <path
                key={idx}
                d="M -18 -85 C -22 -115, -15 -138, 0 -140 C 15 -138, 22 -115, 18 -85 Z"
                transform={`rotate(${angle})`}
                fill="#FFD147"
                stroke="#111111"
                strokeWidth="3.2"
              />
            ))}
            <circle cx="0" cy="0" r="88" fill="#67C85A" stroke="#111111" strokeWidth="3.4" />
            {/* Side-Glance Eyes */}
            <g transform="translate(-32, -18)">
              <ellipse cx="0" cy="0" rx="20" ry="23" fill="#FFFFFF" stroke="#111111" strokeWidth="3.2" />
              <circle cx="-5" cy="-3" r="12" fill="#24B9E7" />
              <circle cx="-6" cy="-4" r="8" fill="#111111" />
              <circle cx="-9" cy="-7" r="3" fill="#FFFFFF" />
            </g>
            <g transform="translate(32, -18)">
              <ellipse cx="0" cy="0" rx="20" ry="23" fill="#FFFFFF" stroke="#111111" strokeWidth="3.2" />
              <circle cx="-5" cy="-3" r="12" fill="#24B9E7" />
              <circle cx="-6" cy="-4" r="8" fill="#111111" />
              <circle cx="-9" cy="-7" r="3" fill="#FFFFFF" />
            </g>
            {/* Nose & Smirk */}
            <circle cx="0" cy="10" r="7.5" fill="#FF8595" stroke="#111111" strokeWidth="3" />
            <path d="M -16 28 Q 0 42 22 26" fill="none" stroke="#111111" strokeWidth="3.4" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  );
};

// Video Cards Row
export const VideoCards: React.FC<{ onCardClick: (cardName: string) => void }> = ({ onCardClick }) => {
  return (
    <div className="relative w-full flex justify-center items-end select-none pointer-events-auto z-20">
      <div className="relative flex items-end justify-center -space-x-8 sm:-space-x-14 md:-space-x-18 lg:-space-x-22 translate-y-8 sm:translate-y-12 md:translate-y-16 lg:translate-y-20">
        <div className="z-10 transition-transform duration-500 hover:z-30">
          <SunCard onClick={() => onCardClick('Sunny Morning Routine')} />
        </div>
        <div className="z-20 transition-transform duration-500 hover:z-30 -translate-y-3 sm:-translate-y-5 md:-translate-y-7">
          <PeaceHandCard onClick={() => onCardClick('Peace & Calm Essentials')} />
        </div>
        <div className="z-10 transition-transform duration-500 hover:z-30">
          <FlowerCard onClick={() => onCardClick('Mood Bloom Focus')} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 8. INTERACTIVE VIDEO MODAL (EDITORIAL SESSION DRAWER)
// ============================================================================
interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSession: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, initialSession }) => {
  const [activeSession, setActiveSession] = useState(initialSession);
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [progress, setProgress] = useState(38);

  useEffect(() => {
    setActiveSession(initialSession);
    setIsPlaying(true);
  }, [initialSession, isOpen]);

  useEffect(() => {
    if (!isPlaying || !isOpen) return;
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.4));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, isOpen]);

  if (!isOpen) return null;

  const sessions = [
    { name: 'Sunny Morning Routine', time: '12 min', mood: 'Vibrant & Energized', color: '#24B9E7' },
    { name: 'Peace & Calm Essentials', time: '18 min', mood: 'Deep Serenity & Focus', color: '#F59CC7' },
    { name: 'Mood Bloom Focus', time: '15 min', mood: 'Joyful Growth & Bloom', color: '#F87162' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-[32px] bg-[#FFFDF4] border border-[#111111]/10 shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#56B864] animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Editorial Mood Session
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Video simulation screen */}
        <div className="relative mt-5 rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-[#1A1A1E] to-[#2C2D35] flex items-center justify-center text-white shadow-inner">
          {/* Calming animated breathing aura */}
          <div
            className="absolute w-48 h-48 rounded-full opacity-40 blur-2xl animate-[pulse_6s_ease-in-out_infinite]"
            style={{
              backgroundColor: sessions.find((s) => s.name === activeSession)?.color || '#F59CC7',
            }}
          />

          {/* Calming center illustration */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            <div className="w-16 h-16 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8 text-[#FFD242] animate-bounce" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
              {activeSession}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal">
              Breathing Inhale (4s) • Hold (4s) • Exhale (6s)
            </p>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20">
            <div
              className="h-full bg-[#24B9E7] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Media Controls */}
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundManager.playBubble(isPlaying ? 380 : 540, 0.05);
                setIsPlaying(!isPlaying);
              }}
              className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                soundManager.enabled = !audioEnabled;
                soundManager.playBubble(500, 0.05);
              }}
              className="w-10 h-10 rounded-full bg-white border border-neutral-200 text-neutral-800 flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
            <Heart size={14} className="text-rose-500 fill-rose-500" />
            <span>Guided Session Active</span>
          </div>
        </div>

        {/* Mood Selector Tabs */}
        <div className="mt-5 pt-4 border-t border-neutral-200">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2.5">
            Switch Guided Routine
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {sessions.map((sess) => (
              <button
                type="button"
                key={sess.name}
                onClick={() => {
                  soundManager.playChime();
                  setActiveSession(sess.name);
                }}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  activeSession === sess.name
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                <div className="text-xs font-bold truncate">{sess.name}</div>
                <div
                  className={`text-[10px] ${
                    activeSession === sess.name ? 'text-neutral-300' : 'text-neutral-400'
                  }`}
                >
                  {sess.time} • {sess.mood}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 9. MAIN MOOD HERO COMPONENT
// ============================================================================
export interface MoodHeroProps {
  className?: string;
}

export default function MoodHero({ className = '' }: MoodHeroProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState('Peace & Calm Essentials');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || typeof window === 'undefined') return;
    const deltaX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const deltaY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    setMousePos({ x: deltaX, y: deltaY });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      className={`relative min-h-screen w-full flex items-center justify-center p-3 sm:p-6 md:p-10 lg:p-12 overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif] ${className}`}
      id="mood-hero-root"
    >
      <BackgroundAtmosphere />

      {/* Main Website Container Panel */}
      <main
        className="relative w-full max-w-[1180px] min-h-[720px] sm:min-h-[780px] md:min-h-[820px] lg:min-h-[850px] rounded-[24px] sm:rounded-[30px] md:rounded-[36px] bg-[#FFFDF4] border border-[rgba(120,110,90,0.14)] shadow-[0_24px_70px_-15px_rgba(80,70,50,0.14),0_0_1px_rgba(0,0,0,0.06)] flex flex-col justify-between overflow-hidden z-10 transition-transform duration-300 ease-out"
        style={{
          transform: prefersReducedMotion ? 'none' : `translate3d(${mousePos.x * 2}px, ${mousePos.y * 2}px, 0)`,
        }}
      >
        {/* Subtle white inner sheen */}
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none border border-white/60 z-30" />

        {/* Top Navbar */}
        <Navbar
          onActionClick={(action) => {
            if (action === 'Try for free') {
              soundManager.playChime();
              setIsModalOpen(true);
            }
          }}
        />

        {/* Center Hero Content */}
        <div className="relative z-20 flex flex-col items-center text-center px-4 sm:px-6">
          <SocialProof />

          <div className="relative inline-block mt-1 sm:mt-2">
            <SparkleDoodleLeft />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-[#111111] tracking-[-0.035em] leading-[1.04] sm:leading-[1.02] max-w-[680px] mx-auto select-none">
              Regulate your mood
              <br />
              with our videos
            </h1>
            <CurlyDoodleRight />
          </div>

          <p className="mt-3.5 sm:mt-4 text-[12px] sm:text-[13px] md:text-[13.5px] text-neutral-500 font-normal leading-[1.45] max-w-sm sm:max-w-md mx-auto select-none tracking-tight">
            Our pre recorded sessions contain all the essentials
            <br className="hidden sm:inline" /> to help you fix your mood in few sessions
          </p>

          <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2.5 sm:gap-3 z-30">
            <button
              type="button"
              onClick={() => {
                soundManager.playChime();
                setIsModalOpen(true);
              }}
              className="group inline-flex items-center justify-center gap-1.5 px-4.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#111111] text-white text-[12px] sm:text-[12.5px] font-medium tracking-tight shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <span>Play Video</span>
              <Zap className="w-3.5 h-3.5 fill-white text-white group-hover:scale-110 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playBubble(460, 0.06);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center px-4.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white text-neutral-800 text-[12px] sm:text-[12.5px] font-medium tracking-tight border border-neutral-200/90 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:bg-neutral-50 transition-all cursor-pointer"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* 3D Perspective Floor Grid */}
        <PerspectiveFloorGrid />

        {/* Lower cropped illustrated character cards */}
        <div className="relative mt-auto w-full">
          <VideoCards
            onCardClick={(name) => {
              soundManager.playChime();
              setSelectedSession(name);
              setIsModalOpen(true);
            }}
          />
        </div>
      </main>

      {/* Video Modal Drawer */}
      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSession={selectedSession}
      />
    </div>
  );
}
