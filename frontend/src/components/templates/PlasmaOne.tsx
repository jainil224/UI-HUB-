/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PlasmaOne - The One app for your money
 * Exact recreation of the supplied AI Studio project. All supplied source files
 * are consolidated into one self-contained TSX module for the UI HUB preview and
 * Code tab. Original CSS is inlined and scoped to #top so the host page is unaffected.
 */
import React, { useEffect, useRef, useState } from 'react';

const PLASMAONE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..600;1,9..40,300..600&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

#top {
  --bg-canvas: #eaeae7;
  --text-primary: #111111;
  --text-secondary: #686c70;
  --text-muted-one: #767e85;
  --cta-black: #080808;
  --card-bg: #101010;
  --card-highlight: #242424;
  --accent-mint: #7cc9b0;
  --u: 1px;
  margin: 0;
  padding: 0;
  background-color: var(--bg-canvas);
  color: var(--text-primary);
  font-family: "DM Sans", "Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* Proportional desktop/tablet layout matching 735x462 reference */
@media (min-width: 640px) {
  #top {
    --u: clamp(0.86px, min(calc(100vw / 735), calc(100vh / 462)), 2.2px);
  }

  #top .p1-header {
    height: calc(35 * var(--u));
    padding-left: calc(40 * var(--u));
    padding-right: calc(38 * var(--u));
  }

  #top .p1-logo-link {
    gap: calc(5 * var(--u));
  }

  #top .p1-logo-icon {
    width: calc(16 * var(--u));
    height: calc(16 * var(--u));
  }

  #top .p1-logo-text {
    font-size: calc(17 * var(--u));
  }

  #top .p1-header-cta {
    width: calc(68 * var(--u));
    height: calc(21 * var(--u));
    font-size: calc(7 * var(--u));
    border-radius: calc(2 * var(--u));
    padding: 0;
  }

  #top .p1-main {
    padding-bottom: calc(62 * var(--u));
  }

  #top .p1-hero {
    margin-top: calc(31 * var(--u));
    padding-left: 0;
    padding-right: 0;
  }

  #top .p1-heading {
    font-size: calc(40 * var(--u));
    max-width: calc(340 * var(--u));
    line-height: 1.05;
  }

  #top .p1-form {
    margin-top: calc(21 * var(--u));
    width: calc(205 * var(--u));
    max-width: none;
    height: calc(26 * var(--u));
  }

  #top .p1-input {
    padding-left: calc(10 * var(--u));
    padding-right: calc(24 * var(--u));
    font-size: calc(7.5 * var(--u));
  }

  #top .p1-input-badge {
    right: calc(5.5 * var(--u));
    width: calc(13.5 * var(--u));
    height: calc(13.5 * var(--u));
  }

  #top .p1-submit {
    width: calc(66 * var(--u));
    padding-left: 0;
    padding-right: 0;
    font-size: calc(7 * var(--u));
  }

  #top .p1-supporting-wrap {
    margin-top: calc(11 * var(--u));
    min-height: calc(10 * var(--u));
  }

  #top .p1-supporting-text {
    font-size: calc(7 * var(--u));
  }

  #top .p1-benefits {
    margin-top: calc(15 * var(--u));
    width: calc(246 * var(--u));
    max-width: none;
    font-size: calc(8 * var(--u));
    gap: 0;
    justify-content: space-between;
    flex-wrap: nowrap;
  }

  #top .p1-benefit-divider {
    height: calc(10 * var(--u));
  }

  #top .p1-card-wrap {
    margin-top: calc(15 * var(--u));
  }

  #top .p1-card-box {
    width: calc(219 * var(--u));
    height: calc(138 * var(--u));
  }

  #top .p1-card {
    border-radius: calc(8 * var(--u));
  }

  #top .p1-card-shadow {
    bottom: calc(-7 * var(--u));
    height: calc(14 * var(--u));
    filter: blur(calc(8 * var(--u)));
  }

  #top .p1-landscape {
    height: max(calc(142 * var(--u)), 22vh);
  }
}

@keyframes plasmaCardFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  50% {
    transform: translate3d(0, -3px, 0) rotateX(1deg) rotateY(-0.7deg) rotateZ(0.55deg);
  }
}

@keyframes plasmaShadowPulse {
  0%,
  100% {
    transform: scale(1) translate3d(0, 0, 0);
    opacity: 0.34;
  }
  50% {
    transform: scale(0.96) translate3d(0, 2px, 0);
    opacity: 0.24;
  }
}

@keyframes plasmaAtmosphereBreath {
  0%,
  100% {
    opacity: 0.22;
  }
  50% {
    opacity: 0.38;
  }
}

@keyframes plasmaWaterShimmer {
  0%,
  100% {
    opacity: 0.12;
    transform: translate3d(-4px, 0, 0);
  }
  50% {
    opacity: 0.24;
    transform: translate3d(4px, 0, 0);
  }
}

@keyframes cardWaveSweep {
  0% {
    transform: translate3d(-120%, -15%, 0) rotate(-18deg);
  }
  100% {
    transform: translate3d(140%, 15%, 0) rotate(-18deg);
  }
}

@keyframes cardBorderOrbit {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

#top .animate-card-float {
  animation: plasmaCardFloat 7.5s ease-in-out infinite;
  transform-style: preserve-3d;
  will-change: transform;
}

#top .animate-shadow-pulse {
  animation: plasmaShadowPulse 7.5s ease-in-out infinite;
  will-change: transform, opacity;
}

#top .animate-atmosphere {
  animation: plasmaAtmosphereBreath 15s ease-in-out infinite;
  will-change: opacity;
}

#top .animate-water-shimmer {
  animation: plasmaWaterShimmer 6.5s ease-in-out infinite;
  will-change: transform, opacity;
}

#top .card-border-mask {
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

#top .card-wave-active {
  animation: cardWaveSweep 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  will-change: transform;
}

#top .card-border-orbit {
  animation: cardBorderOrbit 4.5s linear infinite;
  will-change: transform;
}

#top .landscape-mask {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.55) 14%, #000000 30%);
  mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.55) 14%, #000000 30%);
}

@media (prefers-reduced-motion: reduce) {
  #top .animate-card-float,
  #top .animate-shadow-pulse,
  #top .animate-atmosphere,
  #top .animate-water-shimmer,
  #top .card-wave-active,
  #top .card-border-orbit {
    animation: none !important;
    transform: none !important;
  }
}
`;
/* /src/components/Header.tsx */
interface HeaderProps {
  onJoinClick: () => void;
}

function PlasmaOneLogo() {
  const rays = Array.from({ length: 18 }, (_, i) => {
    const angle = (i * 20 * Math.PI) / 180;
    const hubX = 14;
    const hubY = 16;
    const r1 = 5.4;
    const r2 = 13.8;
    const x1 = hubX + Math.cos(angle) * r1;
    const y1 = hubY + Math.sin(angle) * r1;
    const x2 = 16 + Math.cos(angle + 0.25) * r2;
    const y2 = 16 + Math.sin(angle + 0.25) * r2;
    const alpha = 0.22 + 0.58 * ((Math.cos(angle - 0.35) + 1) / 2);

    return (
      <line
        key={i}
        x1={x1.toFixed(2)}
        y1={y1.toFixed(2)}
        x2={x2.toFixed(2)}
        y2={y2.toFixed(2)}
        stroke={`rgba(42, 45, 48, ${alpha.toFixed(2)})`}
        strokeWidth="0.95"
        strokeLinecap="round"
      />
    );
  });

  return (
    <a
      href="#top"
      aria-label="PlasmaOne home"
      className="p1-logo-link inline-flex items-center gap-1.5 text-[#111111] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111] rounded-sm"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="p1-logo-icon w-[18px] h-[18px] shrink-0"
      >
        <defs>
          <radialGradient id="plasmaHeaderDisc" cx="62%" cy="48%" r="60%">
            <stop offset="0%" stopColor="#F1F1EE" />
            <stop offset="55%" stopColor="#C8CBCE" />
            <stop offset="88%" stopColor="#808488" />
            <stop offset="100%" stopColor="#4A4D50" />
          </radialGradient>
        </defs>
        <circle cx="16" cy="16" r="14.5" fill="url(#plasmaHeaderDisc)" />
        <path
          d="M14.5 3.2C8.8 4.2 4.8 9.5 4.8 16c0 6.5 4 11.8 9.7 12.8-3.1-1.9-5-6.9-5-12.8 0-5.9 1.9-10.9 5-12.8Z"
          fill="#2B2E31"
          opacity="0.72"
        />
        {rays}
        <circle cx="13.5" cy="16" r="5" fill="#D8D9D6" opacity="0.7" />
        <circle cx="16" cy="16" r="14.2" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="0.7" />
      </svg>
      <span className="p1-logo-text text-[18px] tracking-[-0.025em] leading-none">
        <span className="font-normal text-[#141414]">Plasma</span>
        <span className="font-light text-[#383B3E]">One</span>
      </span>
    </a>
  );
}

export const Header: React.FC<HeaderProps> = ({ onJoinClick }) => {
  return (
    <header className="p1-header relative z-30 w-full border-b border-black/[0.08] h-[52px] flex items-center justify-between px-5">
      <PlasmaOneLogo />
      <button
        type="button"
        onClick={onJoinClick}
        className="p1-header-cta inline-flex items-center justify-center bg-[#080808] hover:bg-[#1d1d1d] active:bg-[#000000] text-white border border-white/[0.08] whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#080808] px-3.5 h-8 text-[11px] rounded-[2px] font-medium tracking-[-0.01em]"
      >
        Join the waitlist
      </button>
    </header>
  );
};
/* /src/components/HeroSection.tsx */
interface HeroSectionProps {
  emailInputRef: React.RefObject<HTMLInputElement | null>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ emailInputRef }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed || !emailPattern.test(trimmed)) {
      setStatus('error');
      setStatusMessage('Please enter a valid email address.');
      emailInputRef.current?.focus();
      return;
    }

    setStatus('success');
    setStatusMessage(`Early access reserved for ${trimmed}.`);
    setEmail('');
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="p1-hero relative z-20 flex flex-col items-center text-center px-5 mt-10"
    >
      <h1
        id="hero-heading"
        className="p1-heading text-[36px] font-normal leading-[1.05] tracking-[-0.03em] text-[#111111] max-w-[310px] [text-wrap:balance]"
      >
        The <span className="text-[#767E85]">One</span> app for
        <br />
        your money
      </h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="p1-form mt-6 w-full max-w-[310px] h-[42px] flex items-stretch"
      >
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <div
          className={`relative flex-1 min-w-0 bg-white border border-r-0 rounded-l-[2px] flex items-center transition-colors duration-150 ${
            status === 'error'
              ? 'border-[#b94a48]/60'
              : 'border-black/[0.07] focus-within:border-black/25'
          }`}
        >
          <input
            ref={emailInputRef}
            id="waitlist-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== 'idle') {
                setStatus('idle');
                setStatusMessage('');
              }
            }}
            placeholder="Enter your email"
            aria-invalid={status === 'error'}
            className="p1-input w-full h-full bg-transparent pl-3 pr-8 text-[12px] text-[#111111] placeholder:text-[#6E7276] focus:outline-none"
          />

          <span
            title="Verified waitlist access"
            aria-hidden="true"
            className="p1-input-badge absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-150 hover:scale-110"
          >
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <circle cx="10" cy="10" r="9.4" fill="#E6F6F0" stroke="#9EDCC7" strokeWidth="0.8" />
              <path
                d="M12.8 7.5a3.5 3.5 0 1 0 0 5"
                fill="none"
                stroke="#3DA885"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              <circle cx="10.2" cy="10" r="1.4" fill="#7CC9B0" />
            </svg>
          </span>
        </div>

        <button
          type="submit"
          className="p1-submit bg-[#080808] hover:bg-[#1d1d1d] active:bg-[#000000] text-white font-medium whitespace-nowrap shrink-0 rounded-r-[2px] border border-[#080808] cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#080808] px-4 text-[11px] tracking-[-0.01em]"
        >
          Join the waitlist
        </button>
      </form>

      <div className="p1-supporting-wrap mt-3 min-h-[16px]">
        {status === 'idle' ? (
          <p className="p1-supporting-text text-[11px] font-normal text-[#5E6266] leading-tight">
            Secure early access and unlock unique rewards.
          </p>
        ) : (
          <p
            role="status"
            aria-live="polite"
            className={`p1-supporting-text text-[11px] font-medium leading-tight ${
              status === 'error' ? 'text-[#9e3330]' : 'text-[#206b53]'
            }`}
          >
            {statusMessage}
          </p>
        )}
      </div>

      <div
        aria-label="Key financial benefits"
        className="p1-benefits mt-5 w-full max-w-[340px] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-[11px] leading-none tracking-[-0.01em]"
      >
        <div className="whitespace-nowrap">
          <span className="font-semibold text-[#111111] tabular-nums">4%</span>{' '}
          <span className="font-normal text-[#262626]">Cash back</span>
        </div>

        <span
          aria-hidden="true"
          className="p1-benefit-divider w-px h-3 bg-black/[0.16] shrink-0"
        />

        <div className="whitespace-nowrap">
          <span className="font-semibold text-[#111111] tabular-nums">150+</span>{' '}
          <span className="font-normal text-[#262626]">Countries covered</span>
        </div>

        <span
          aria-hidden="true"
          className="p1-benefit-divider w-px h-3 bg-black/[0.16] shrink-0"
        />

        <div className="whitespace-nowrap">
          <span className="font-semibold text-[#111111] tabular-nums">10%+</span>{' '}
          <span className="font-normal text-[#262626]">Yield</span>
        </div>
      </div>
    </section>
  );
};
/* /src/components/PaymentCard.tsx */
function CardChip({ active }: { active: boolean }) {
  return (
    <div className="absolute left-[10.05%] top-[31.88%] w-[13.7%] h-[15.94%] rounded-[3px] overflow-hidden">
      <svg viewBox="0 0 30 22" aria-hidden="true" className="w-full h-full">
        <defs>
          <linearGradient id="emvSilver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D9DBDE" />
            <stop offset="45%" stopColor="#BCBFC3" />
            <stop offset="75%" stopColor="#CECFD2" />
            <stop offset="100%" stopColor="#A6A9AD" />
          </linearGradient>
        </defs>
        <rect
          x="0.5"
          y="0.5"
          width="29"
          height="21"
          rx="3"
          fill="url(#emvSilver)"
          stroke="#7B7E82"
          strokeWidth="0.6"
        />
        <g
          stroke="#222325"
          strokeWidth="0.85"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.6 0.6 V21.4" />
          <path d="M20.4 0.6 V21.4" />
          <path d="M0.6 7.5 H9.6" />
          <path d="M0.6 14.5 H9.6" />
          <path d="M20.4 7.5 H29.4" />
          <path d="M20.4 14.5 H29.4" />
          <rect x="11.8" y="6.8" width="6.4" height="8.4" rx="1.6" />
          <path d="M15 0.6 V6.8" />
          <path d="M15 15.2 V21.4" />
        </g>
      </svg>

      {/* Crisp metallic reflection sweep strictly inside chip */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`w-[60%] h-[160%] -top-[30%] absolute bg-gradient-to-r from-transparent via-white/55 to-transparent ${
            active ? 'card-wave-active' : ''
          }`}
        />
      </div>
    </div>
  );
}

function RadialCardEmblem({ active }: { active: boolean }) {
  const rayCount = 30;
  const cx = 20;
  const cy = 20;
  const hubX = 16.5;
  const hubY = 20;

  const rays = Array.from({ length: rayCount }, (_, i) => {
    const angleDeg = (i * 360) / rayCount;
    const rad = (angleDeg * Math.PI) / 180;
    const innerR = 7.4;
    const outerR = 17.5;

    const x1 = hubX + Math.cos(rad) * innerR;
    const y1 = hubY + Math.sin(rad) * innerR;
    const ctrlRad = rad + 0.14;
    const ctrlR = (innerR + outerR) * 0.52;
    const qx = cx + Math.cos(ctrlRad) * ctrlR;
    const qy = cy + Math.sin(ctrlRad) * ctrlR;
    const x2 = cx + Math.cos(rad + 0.22) * outerR;
    const y2 = cy + Math.sin(rad + 0.22) * outerR;

    const brightness = 0.24 + 0.72 * ((Math.cos(rad - 0.35) + 1) / 2);

    return (
      <path
        key={i}
        d={`M ${x1.toFixed(2)} ${y1.toFixed(2)} Q ${qx.toFixed(2)} ${qy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`}
        stroke={`rgba(232, 234, 236, ${brightness.toFixed(2)})`}
        strokeWidth="0.95"
        strokeLinecap="round"
        fill="none"
      />
    );
  });

  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={`absolute right-[5.9%] top-[9.4%] w-[11.4%] h-[18.1%] transition-transform duration-700 ease-out ${
        active ? 'rotate-[24deg] scale-[1.04]' : 'rotate-0 scale-100'
      }`}
    >
      <circle cx={hubX} cy={hubY} r="6.8" fill="#0B0B0C" />
      {rays}
    </svg>
  );
}

export const PaymentCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pointer, setPointer] = useState({ x: 50, y: 50, rx: 0, ry: 0 });

  const active = isHovered || isLocked;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 0), 100);
    const py = Math.min(Math.max(((e.clientY - rect.top) / rect.height) * 100, 0), 100);

    const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rx = motionReduced ? 0 : Number((((50 - py) / 50) * 4.5).toFixed(2));
    const ry = motionReduced ? 0 : Number((((px - 50) / 50) * 5.5).toFixed(2));

    setPointer({ x: px, y: py, rx, ry });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setPointer({ x: 50, y: 50, rx: 0, ry: 0 });
  };

  return (
    <div
      className="p1-card-wrap relative z-20 flex justify-center mt-6"
      style={{ perspective: '900px' }}
    >
      <div className="p1-card-box relative w-[260px] h-[164px]">
        {/* Resting ground shadow (never leaks glow outside) */}
        <div
          aria-hidden="true"
          className="p1-card-shadow animate-shadow-pulse pointer-events-none absolute left-[4%] right-[4%] -bottom-2.5 h-5 rounded-full bg-black/45 blur-md"
        />

        {/* Subtle idle float wrapper */}
        <div className="animate-card-float w-full h-full">
          {/* Interactive 3D tilt card clipped strictly inside border */}
          <div
            ref={cardRef}
            role="button"
            tabIndex={0}
            aria-pressed={isLocked}
            aria-label="Interactive matte black PlasmaOne payment card. Hover or activate to preview internal shimmer and metallic border reflection."
            onPointerEnter={() => setIsHovered(true)}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onClick={() => setIsLocked((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsLocked((prev) => !prev);
              }
            }}
            className="p1-card relative w-full h-full rounded-[10px] overflow-hidden select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]"
            style={{
              background:
                'linear-gradient(138deg, #212122 0%, #131314 38%, #0c0c0d 72%, #151516 100%)',
              boxShadow:
                'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.7), 0 10px 24px -8px rgba(0, 0, 0, 0.35)',
              transform: `rotateX(${pointer.rx}deg) rotateY(${pointer.ry}deg)`,
              transition: isHovered
                ? 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)'
                : 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Resting subtle top-right charcoal lighting */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(110% 85% at 72% 18%, rgba(255, 255, 255, 0.045) 0%, transparent 58%)',
              }}
            />

            {/* Inside-card pointer-reactive warm/mint metallic specular sheen */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
                active ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background: `radial-gradient(circle 140px at ${pointer.x}% ${pointer.y}%, rgba(255, 255, 255, 0.13) 0%, rgba(124, 201, 176, 0.07) 32%, rgba(255, 255, 255, 0.02) 56%, transparent 76%)`,
              }}
            />

            {/* Inside-card sweeping kinetic light wave / warp shimmer */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-300 ${
                active ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className={`absolute -top-[40%] left-0 w-[48%] h-[180%] ${
                  active ? 'card-wave-active' : ''
                }`}
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 30%, rgba(220, 232, 227, 0.09) 50%, rgba(255, 255, 255, 0.03) 70%, transparent 100%)',
                }}
              />
            </div>

            {/* Subtle concentric wave arcs inside the card emanating around the emblem on hover */}
            <svg
              viewBox="0 0 219 138"
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 w-full h-full transition-opacity duration-500 ${
                active ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <circle
                cx="193.5"
                cy="25.5"
                r="42"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.6"
              />
              <circle
                cx="193.5"
                cy="25.5"
                r="68"
                fill="none"
                stroke="rgba(124,201,176,0.06)"
                strokeWidth="0.6"
              />
              <circle
                cx="193.5"
                cy="25.5"
                r="98"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.6"
              />
            </svg>

            {/* Fine anodized matte micro-grain */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.035] mix-blend-overlay"
            >
              <filter id="cardMatteNoise">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.85"
                  numOctaves="2"
                  stitchTiles="stitch"
                />
              </filter>
              <rect width="100%" height="100%" filter="url(#cardMatteNoise)" />
            </svg>

            <CardChip active={active} />
            <RadialCardEmblem active={active} />

            {/* Precision 1px border highlight strictly on the card perimeter */}
            <div
              aria-hidden="true"
              className={`card-border-mask pointer-events-none absolute inset-0 rounded-[inherit] p-[1px] transition-opacity duration-300 ${
                active ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="w-full h-full rounded-[inherit]"
                style={{
                  background: `radial-gradient(circle 120px at ${pointer.x}% ${pointer.y}%, rgba(255, 255, 255, 0.72) 0%, rgba(124, 201, 176, 0.42) 32%, rgba(255, 255, 255, 0.12) 65%, rgba(255, 255, 255, 0.04) 100%)`,
                }}
              />
            </div>

            {/* Subtle orbiting rim gleam clipped strictly to the 1px card border */}
            <div
              aria-hidden="true"
              className={`card-border-mask pointer-events-none absolute inset-0 rounded-[inherit] p-[1px] overflow-hidden transition-opacity duration-500 ${
                active ? 'opacity-70' : 'opacity-0'
              }`}
            >
              <div
                className={`absolute -inset-[60%] ${active ? 'card-border-orbit' : ''}`}
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.42) 28deg, rgba(124,201,176,0.32) 48deg, transparent 78deg, transparent 360deg)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
/* /src/components/RockyLandscape.tsx */
const ROCKY_LANDSCAPE_URL =
  'https://res.cloudinary.com/dgqd54pbl/image/upload/v1795585901/be227430-cfc2-44eb-89c5-dc2ffaf0a1ae_hbgoyn.jpg';

export const RockyLandscape: React.FC = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setOffset({
        x: Number((-nx * 3).toFixed(2)),
        y: Number((-ny * 1.5).toFixed(2)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      aria-hidden="false"
      className="p1-landscape pointer-events-none select-none absolute inset-x-0 bottom-0 z-10 h-[155px] overflow-hidden"
    >
      <div
        className="w-[calc(100%+12px)] h-[calc(100%+6px)] -ml-[6px] transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        }}
      >
        {!imageFailed ? (
          <img
            src={ROCKY_LANDSCAPE_URL}
            alt="Dark rugged mossy coastal rock formations along a calm silver-gray water horizon"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-[center_72%] landscape-mask"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-t from-[#181b19] via-[#535855] to-transparent landscape-mask" />
        )}

        <div
          aria-hidden="true"
          className="animate-water-shimmer pointer-events-none absolute left-[28%] right-[28%] bottom-[4%] h-[18%] rounded-full blur-[6px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(225, 229, 231, 0.35) 35%, rgba(240, 242, 240, 0.5) 50%, rgba(225, 229, 231, 0.35) 65%, transparent 100%)',
          }}
        />
      </div>
    </div>
  );
};
/* /src/components/BenefitsSection.tsx */
const CAPABILITIES = [
  {
    index: '01',
    title: '4% Cash back',
    detail: 'Earned automatically on every purchase.',
  },
  {
    index: '02',
    title: '150+ Countries',
    detail: 'Spend locally with zero foreign fees.',
  },
  {
    index: '03',
    title: '10%+ Yield',
    detail: 'Accrued daily on idle balances.',
  },
];

export const BenefitsSection: React.FC = () => {
  return (
    <section
      aria-labelledby="capabilities-heading"
      className="relative z-20 w-full bg-[#EAEAE7] border-t border-black/[0.08]"
    >
      <div className="max-w-[920px] mx-auto px-6 sm:px-10 py-20 sm:py-28">
        <div className="flex flex-col items-center text-center">
          <h2
            id="capabilities-heading"
            className="text-[28px] sm:text-[38px] font-normal leading-[1.08] tracking-[-0.03em] text-[#111111] [text-wrap:balance]"
          >
            Built for <span className="text-[#767E85]">borderless</span> money
          </h2>
        </div>

        <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-3 border-t border-black/[0.08]">
          {CAPABILITIES.map((item, idx) => (
            <div
              key={item.index}
              className={`py-8 sm:py-9 ${
                idx > 0 ? 'border-t md:border-t-0 md:border-l border-black/[0.08]' : ''
              } md:px-8 first:md:pl-0 last:md:pr-0 flex flex-col justify-between gap-4`}
            >
              <span className="text-[11px] font-normal text-[#767E85] tabular-nums tracking-[0.02em]">
                {item.index}
              </span>
              <div>
                <h3 className="text-[18px] sm:text-[20px] font-normal tracking-[-0.02em] text-[#111111] tabular-nums">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13px] font-normal text-[#686C70] leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
/* /src/components/AccessSection.tsx */
type CardFinish = 'metal' | 'virtual';

export const AccessSection: React.FC = () => {
  const [finish, setFinish] = useState<CardFinish>('metal');
  const [cardHovered, setCardHovered] = useState(false);
  const [cardPointer, setCardPointer] = useState({ x: 50, y: 50, rx: 0, ry: 0 });
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed || !emailPattern.test(trimmed)) {
      setStatus('error');
      setStatusMessage('Please enter a valid email address.');
      return;
    }

    setStatus('success');
    setStatusMessage(`Early access reserved for ${trimmed}.`);
    setEmail('');
  };

  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 0), 100);
    const py = Math.min(Math.max(((e.clientY - rect.top) / rect.height) * 100, 0), 100);
    const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rx = motionReduced ? 0 : Number((((50 - py) / 50) * 4).toFixed(2));
    const ry = motionReduced ? 0 : Number((((px - 50) / 50) * 5).toFixed(2));
    setCardPointer({ x: px, y: py, rx, ry });
  };

  const isMetal = finish === 'metal';

  return (
    <section
      aria-labelledby="access-heading"
      className="relative z-20 w-full bg-[#EAEAE7] border-t border-black/[0.08]"
    >
      <div className="max-w-[920px] mx-auto px-6 sm:px-10 py-20 sm:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-16">
          {/* Left: Minimal Card Edition Showcase */}
          <div className="flex flex-col items-center md:items-start" style={{ perspective: '900px' }}>
            <div
              role="img"
              aria-label={
                isMetal
                  ? 'Matte black PlasmaOne metal card preview'
                  : 'Brushed silver PlasmaOne virtual card preview'
              }
              onPointerEnter={() => setCardHovered(true)}
              onPointerMove={handleCardPointerMove}
              onPointerLeave={() => {
                setCardHovered(false);
                setCardPointer({ x: 50, y: 50, rx: 0, ry: 0 });
              }}
              className="relative w-full max-w-[300px] aspect-[219/138] rounded-[10px] overflow-hidden cursor-pointer select-none"
              style={
                isMetal
                  ? {
                      background:
                        'linear-gradient(138deg, #212122 0%, #131314 38%, #0c0c0d 72%, #151516 100%)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 16px 32px -12px rgba(0, 0, 0, 0.3)',
                      transform: `rotateX(${cardPointer.rx}deg) rotateY(${cardPointer.ry}deg)`,
                      transition: cardHovered
                        ? 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), background 300ms ease'
                        : 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1), background 300ms ease',
                    }
                  : {
                      background:
                        'linear-gradient(138deg, #F5F5F3 0%, #E1E2DF 50%, #D4D6D2 100%)',
                      boxShadow:
                        'inset 0 0 0 1px rgba(0, 0, 0, 0.08), 0 16px 32px -12px rgba(0, 0, 0, 0.14)',
                      transform: `rotateX(${cardPointer.rx}deg) rotateY(${cardPointer.ry}deg)`,
                      transition: cardHovered
                        ? 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), background 300ms ease'
                        : 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1), background 300ms ease',
                    }
              }
            >
              {/* Inside-card pointer specular sheen */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
                  cardHovered ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background: isMetal
                    ? `radial-gradient(circle 140px at ${cardPointer.x}% ${cardPointer.y}%, rgba(255, 255, 255, 0.13) 0%, rgba(124, 201, 176, 0.07) 34%, transparent 72%)`
                    : `radial-gradient(circle 140px at ${cardPointer.x}% ${cardPointer.y}%, rgba(255, 255, 255, 0.65) 0%, rgba(124, 201, 176, 0.12) 40%, transparent 75%)`,
                }}
              />

              {/* Inside-card diagonal wave sweep */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-300 ${
                  cardHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div
                  className={`absolute -top-[40%] left-0 w-[48%] h-[180%] ${
                    cardHovered ? 'card-wave-active' : ''
                  }`}
                  style={{
                    background: isMetal
                      ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)'
                      : 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.45) 50%, transparent 100%)',
                  }}
                />
              </div>

              {/* Silver EMV Chip */}
              <svg
                viewBox="0 0 30 22"
                aria-hidden="true"
                className="absolute left-[10.05%] top-[31.88%] w-[13.7%] h-[15.94%]"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="29"
                  height="21"
                  rx="3"
                  fill={isMetal ? '#C4C7CA' : '#B5B8BC'}
                  stroke={isMetal ? '#7B7E82' : '#8A8D91'}
                  strokeWidth="0.6"
                />
                <g
                  stroke="#222325"
                  strokeWidth="0.85"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.6 0.6 V21.4" />
                  <path d="M20.4 0.6 V21.4" />
                  <path d="M0.6 7.5 H9.6" />
                  <path d="M0.6 14.5 H9.6" />
                  <path d="M20.4 7.5 H29.4" />
                  <path d="M20.4 14.5 H29.4" />
                  <rect x="11.8" y="6.8" width="6.4" height="8.4" rx="1.6" />
                  <path d="M15 0.6 V6.8" />
                  <path d="M15 15.2 V21.4" />
                </g>
              </svg>

              {/* Radial Emblem */}
              <svg
                viewBox="0 0 40 40"
                aria-hidden="true"
                className={`absolute right-[5.9%] top-[9.4%] w-[11.4%] h-[18.1%] transition-transform duration-700 ease-out ${
                  cardHovered ? 'rotate-[20deg] scale-[1.04]' : 'rotate-0 scale-100'
                }`}
              >
                <circle
                  cx="16.5"
                  cy="20"
                  r="6.8"
                  fill={isMetal ? '#0B0B0C' : '#D5D7D3'}
                />
                {Array.from({ length: 24 }, (_, i) => {
                  const rad = ((i * 360) / 24 * Math.PI) / 180;
                  const x1 = 16.5 + Math.cos(rad) * 7.4;
                  const y1 = 20 + Math.sin(rad) * 7.4;
                  const x2 = 20 + Math.cos(rad + 0.22) * 17.2;
                  const y2 = 20 + Math.sin(rad + 0.22) * 17.2;
                  const alpha = 0.24 + 0.68 * ((Math.cos(rad - 0.35) + 1) / 2);
                  return (
                    <line
                      key={i}
                      x1={x1.toFixed(2)}
                      y1={y1.toFixed(2)}
                      x2={x2.toFixed(2)}
                      y2={y2.toFixed(2)}
                      stroke={
                        isMetal
                          ? `rgba(232, 234, 236, ${alpha.toFixed(2)})`
                          : `rgba(24, 24, 26, ${alpha.toFixed(2)})`
                      }
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {/* 1px border highlight strictly on the card edge */}
              <div
                aria-hidden="true"
                className={`card-border-mask pointer-events-none absolute inset-0 rounded-[inherit] p-[1px] transition-opacity duration-300 ${
                  cardHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div
                  className="w-full h-full rounded-[inherit]"
                  style={{
                    background: isMetal
                      ? `radial-gradient(circle 120px at ${cardPointer.x}% ${cardPointer.y}%, rgba(255, 255, 255, 0.72) 0%, rgba(124, 201, 176, 0.42) 32%, rgba(255, 255, 255, 0.1) 68%, transparent 100%)`
                      : `radial-gradient(circle 120px at ${cardPointer.x}% ${cardPointer.y}%, rgba(17, 17, 17, 0.45) 0%, rgba(124, 201, 176, 0.45) 36%, transparent 72%)`,
                  }}
                />
              </div>
            </div>

            {/* Minimal Square-Corner Switcher */}
            <div
              role="group"
              aria-label="Card edition"
              className="mt-5 inline-flex border border-black/[0.1] rounded-[2px] bg-white/70"
            >
              <button
                type="button"
                onClick={() => setFinish('metal')}
                className={`px-3.5 py-1.5 text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors duration-150 ${
                  isMetal
                    ? 'bg-[#080808] text-white'
                    : 'bg-transparent text-[#686C70] hover:text-[#111111]'
                }`}
              >
                Metal card
              </button>
              <button
                type="button"
                onClick={() => setFinish('virtual')}
                className={`px-3.5 py-1.5 text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors duration-150 ${
                  !isMetal
                    ? 'bg-[#080808] text-white'
                    : 'bg-transparent text-[#686C70] hover:text-[#111111]'
                }`}
              >
                Virtual card
              </button>
            </div>
          </div>

          {/* Right: Minimal Headline & Matching Waitlist Form */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2
              id="access-heading"
              className="text-[28px] sm:text-[38px] font-normal leading-[1.06] tracking-[-0.03em] text-[#111111] [text-wrap:balance]"
            >
              One <span className="text-[#767E85]">card</span>
              <br />
              everywhere
            </h2>

            <p className="mt-4 text-[13px] sm:text-[14px] font-normal text-[#686C70] max-w-[300px] leading-relaxed">
              Hold, earn, and spend globally from a single balance.
            </p>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-6 w-full max-w-[300px] h-[38px] flex items-stretch"
            >
              <label htmlFor="footer-waitlist-email" className="sr-only">
                Email address
              </label>
              <div
                className={`relative flex-1 min-w-0 bg-white border border-r-0 rounded-l-[2px] flex items-center transition-colors duration-150 ${
                  status === 'error'
                    ? 'border-[#b94a48]/60'
                    : 'border-black/[0.08] focus-within:border-black/25'
                }`}
              >
                <input
                  id="footer-waitlist-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== 'idle') {
                      setStatus('idle');
                      setStatusMessage('');
                    }
                  }}
                  placeholder="Enter your email"
                  aria-invalid={status === 'error'}
                  className="w-full h-full bg-transparent pl-3 pr-8 text-[12px] text-[#111111] placeholder:text-[#6E7276] focus:outline-none"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-4 h-4 rounded-full"
                >
                  <svg viewBox="0 0 20 20" className="w-full h-full">
                    <circle cx="10" cy="10" r="9.4" fill="#E6F6F0" stroke="#9EDCC7" strokeWidth="0.8" />
                    <path
                      d="M12.8 7.5a3.5 3.5 0 1 0 0 5"
                      fill="none"
                      stroke="#3DA885"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                    />
                    <circle cx="10.2" cy="10" r="1.4" fill="#7CC9B0" />
                  </svg>
                </span>
              </div>

              <button
                type="submit"
                className="bg-[#080808] hover:bg-[#1d1d1d] active:bg-[#000000] text-white font-medium whitespace-nowrap shrink-0 rounded-r-[2px] border border-[#080808] cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#080808] px-4 text-[11px] tracking-[-0.01em]"
              >
                Join the waitlist
              </button>
            </form>

            <div className="mt-2.5 min-h-[16px]">
              {status !== 'idle' && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`text-[11px] font-medium leading-tight ${
                    status === 'error' ? 'text-[#9e3330]' : 'text-[#206b53]'
                  }`}
                >
                  {statusMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-black/[0.08] max-w-[920px] mx-auto px-6 sm:px-10 py-6 flex items-center justify-between text-[11px] text-[#686C70]">
        <span className="text-[#111111] tracking-[-0.02em]">
          Plasma<span className="text-[#767E85]">One</span>
        </span>
        <span>© 2026 PlasmaOne</span>
      </footer>
    </section>
  );
};
/* /src/App.tsx */
export default function App() {
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  const handleJoinWaitlistClick = () => {
    const input = emailInputRef.current;
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
    }
  };

  return (
    <>
      <style>{PLASMAONE_STYLES}</style>
      <div id="top" className="w-full bg-[#EAEAE7] text-[#111111]">
        {/* First-fold Hero */}
        <div className="relative min-h-screen w-full flex flex-col overflow-hidden">
          {/* Layer 2: Subtle atmospheric background lighting */}
          <div
            aria-hidden="true"
            className="animate-atmosphere pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                'radial-gradient(75% 55% at 50% 34%, rgba(255, 255, 255, 0.32) 0%, rgba(234, 234, 231, 0) 72%)',
            }}
          />

          {/* Layer 3: Bottom panoramic rocky shoreline landscape */}
          <RockyLandscape />

          {/* Layer 6: Top Navigation */}
          <Header onJoinClick={handleJoinWaitlistClick} />

          {/* Layers 4, 5 & 6: Hero typography, waitlist form, benefits, and floating matte-black card */}
          <main className="p1-main relative z-20 flex-1 flex flex-col items-center pb-24">
            <HeroSection emailInputRef={emailInputRef} />
            <PaymentCard />
          </main>
        </div>

        {/* Section 2: Minimal Capabilities Strip */}
        <BenefitsSection />

        {/* Section 3: Card Edition & Early Access + Footer */}
        <AccessSection />
      </div>
    </>
  );
}
