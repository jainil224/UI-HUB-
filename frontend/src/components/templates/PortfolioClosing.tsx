import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// ============================================================================
// 1. SIGNATURE COMPONENT (Handwritten cursive vector signature of "Jainil")
// ============================================================================
export function Signature() {
  return (
    <div className="relative flex items-center justify-start select-none" id="signature-container">
      <svg
        viewBox="0 0 320 150"
        className="w-[200px] sm:w-[240px] md:w-[270px] h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Handwritten signature of Jainil"
      >
        <defs>
          <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Main signature strokes */}
        <g stroke="#F8F8F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" filter="url(#subtleGlow)">
          {/* Capital 'J' top loop and downward flourish */}
          <motion.path
            d="M 44 46 C 36 34 50 18 68 18 C 84 18 88 28 84 40 C 78 58 68 96 64 118"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Capital 'J' bottom descender loop sweeping into baseline */}
          <motion.path
            d="M 64 118 C 60 138 46 146 36 140 C 24 132 26 116 40 102 C 54 88 84 78 112 74"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.65, ease: 'easeInOut' }}
          />

          {/* 'a' cursive oval and down-stem */}
          <motion.path
            d="M 126 73 C 120 74 114 80 115 86 C 117 92 125 94 133 91 C 139 88 142 82 142 74 L 142 88 C 142 93 147 93 152 89"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
          />

          {/* First 'i' stroke */}
          <motion.path
            d="M 152 89 C 156 82 161 68 163 65 L 164 88 C 165 92 169 92 174 88"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1, ease: 'easeOut' }}
          />

          {/* First 'i' dot */}
          <motion.circle
            cx="162"
            cy="52"
            r="1.5"
            fill="#F8F8F5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay: 1.25 }}
          />

          {/* 'n' double arches */}
          <motion.path
            d="M 174 88 C 177 78 182 68 187 68 C 192 68 193 76 193 86 C 196 76 201 68 206 68 C 211 68 213 77 214 88"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.25, ease: 'easeOut' }}
          />

          {/* Second 'i' stroke */}
          <motion.path
            d="M 214 88 C 218 82 223 68 225 65 L 226 88 C 227 92 231 92 235 86"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.45, ease: 'easeOut' }}
          />

          {/* Second 'i' dot */}
          <motion.circle
            cx="224"
            cy="52"
            r="1.5"
            fill="#F8F8F5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay: 1.6 }}
          />

          {/* 'l' tall graceful loop */}
          <motion.path
            d="M 235 86 C 240 74 248 38 254 22 C 257 14 262 16 262 26 C 261 42 255 76 254 92"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Sweeping underline flourish looping back under "Jainil" */}
          <motion.path
            d="M 254 92 C 255 106 248 116 234 121 C 198 132 122 133 48 130 C 34 129 25 123 32 115 C 40 105 74 98 122 90 C 176 82 238 80 284 82"
            strokeWidth="2.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Terminal flourish mark */}
          <motion.circle
            cx="292"
            cy="82"
            r="1.6"
            fill="#F8F8F5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 2.1 }}
          />
        </g>
      </svg>
    </div>
  );
}

// ============================================================================
// 2. TOP PANEL COMPONENT (Editorial Headline & Floating Typographic Banners)
// ============================================================================
export function TopPanel() {
  return (
    <section
      className="relative w-full max-w-[1440px] mx-auto bg-[#FAFAF7] text-[#0A0D10] rounded-b-[70px] sm:rounded-b-[95px] md:rounded-b-[115px] pt-10 sm:pt-14 md:pt-16 pb-16 sm:pb-20 md:pb-24 px-6 sm:px-12 md:px-20 select-none overflow-hidden"
      id="top-white-panel"
    >
      {/* Top Metadata Navigation */}
      <header
        className="w-full flex items-center justify-between text-[15px] sm:text-[17px] md:text-[18px] text-[#181D22] font-sans font-normal tracking-tight mb-12 sm:mb-16 md:mb-20"
        id="top-metadata-header"
      >
        <span className="w-1/3 text-left pl-1 sm:pl-2" id="meta-creative">
          (Creative)
        </span>
        <span className="w-1/3 text-center" id="meta-years">
          (2023–2025)
        </span>
        <span className="w-1/3 text-right pr-1 sm:pr-2" id="meta-design">
          (Design)
        </span>
      </header>

      {/* Main Headline & Banners */}
      <div className="relative flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-2 sm:pt-4 pb-12 sm:pb-16 md:pb-20">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif-display text-[68px] sm:text-[98px] md:text-[128px] lg:text-[144px] xl:text-[152px] leading-[0.92] tracking-[-0.035em] text-[#0A0D10] font-normal mb-5 sm:mb-6"
          id="main-headline"
        >
          <span>Thank </span>
          <span className="italic font-normal font-serif-display ml-1 sm:ml-2">You</span>
        </motion.h1>

        {/* Stacked Typographic Banners */}
        <div className="relative flex flex-col items-center mt-1">
          {/* Blue Text Banner: "Looking Forward to" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: [0, 1.2, 0, -1.2, 0],
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.35 },
              scale: { duration: 0.8, delay: 0.35 },
              x: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="relative z-10 bg-[#087CCB] text-[#FFFFFF] font-serif-display px-4 sm:px-6 md:px-7 py-1.5 sm:py-2 text-[22px] sm:text-[32px] md:text-[40px] lg:text-[45px] leading-tight font-normal tracking-[-0.015em] shadow-[0_4px_16px_rgba(8,124,203,0.18)] -rotate-[0.6deg] -translate-x-2 sm:-translate-x-4"
            id="blue-text-banner"
          >
            Looking Forward to
          </motion.div>

          {/* Black Text Banner: "Connect with You!" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -1.2, 0, 1.2, 0],
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.45 },
              scale: { duration: 0.8, delay: 0.45 },
              y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="relative z-20 bg-[#06080A] text-[#FFFFFF] font-serif-display px-5 sm:px-7 md:px-8 py-1.5 sm:py-2 text-[22px] sm:text-[32px] md:text-[38px] lg:text-[43px] leading-tight font-normal tracking-[-0.015em] shadow-[0_6px_20px_rgba(0,0,0,0.35)] -mt-2 sm:-mt-2.5 translate-x-2 sm:translate-x-4"
            id="black-text-banner"
          >
            Connect with You!
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 3. REEL ASSEMBLY (Interactive Mechanical Dual Spool with Parallax Springs)
// ============================================================================
export interface ReelAssemblyProps {
  mousePos: { x: number; y: number };
  className?: string;
}

export function ReelAssembly({ mousePos, className = '' }: ReelAssemblyProps) {
  const upperTilt = {
    rotate: mousePos.x * 3.5,
    x: mousePos.x * 4,
    y: mousePos.y * 3,
  };

  const lowerTilt = {
    rotate: mousePos.x * 6,
    x: mousePos.x * 8,
    y: mousePos.y * 5,
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      id="reel-assembly"
    >
      <div className="relative w-[210px] sm:w-[260px] md:w-[305px] h-[336px] sm:h-[416px] md:h-[488px]">
        <svg
          viewBox="0 0 300 480"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="spoolGradLight" cx="42%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#1B87DE" />
              <stop offset="55%" stopColor="#0A77D1" />
              <stop offset="85%" stopColor="#0473D1" />
              <stop offset="100%" stopColor="#025CA8" />
            </radialGradient>

            <radialGradient id="spoolGradDark" cx="42%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#1280DC" />
              <stop offset="55%" stopColor="#0773CF" />
              <stop offset="88%" stopColor="#0368C0" />
              <stop offset="100%" stopColor="#024D94" />
            </radialGradient>

            <linearGradient id="metalRingGrad" x1="20%" y1="15%" x2="80%" y2="85%">
              <stop offset="0%" stopColor="#D9DFE6" />
              <stop offset="35%" stopColor="#7E8A96" />
              <stop offset="70%" stopColor="#2E3740" />
              <stop offset="100%" stopColor="#151C24" />
            </linearGradient>

            <filter id="reelDropShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.45" />
            </filter>

            <filter id="stringShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1.5" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
            </filter>

            <filter id="spoolNoise">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} result="noise" />
              <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.12 0" />
              <feComposite in2="SourceGraphic" in="gl" operator="in" />
            </filter>
          </defs>

          {/* 4 Central Hanging Strings */}
          <motion.g
            animate={{
              x: mousePos.x * 5,
              rotate: mousePos.x * 1.5,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          >
            <path
              d="M 141 155 C 139 210, 140 250, 142 305"
              stroke="#0570ca"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
              filter="url(#stringShadow)"
            />
            <path
              d="M 147 155 C 151 205, 153 255, 149 305"
              stroke="#0462b3"
              strokeWidth="3.0"
              strokeLinecap="round"
              fill="none"
              filter="url(#stringShadow)"
            />
            <path
              d="M 153 155 C 146 200, 145 260, 154 305"
              stroke="#0678d8"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
              filter="url(#stringShadow)"
            />
            <path
              d="M 159 155 C 162 215, 160 250, 158 305"
              stroke="#056fc8"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
              filter="url(#stringShadow)"
            />
          </motion.g>

          {/* UPPER BLUE REEL */}
          <motion.g
            animate={upperTilt}
            transition={{ type: 'spring', damping: 28, stiffness: 140 }}
            style={{ transformOrigin: '150px 105px' }}
          >
            <circle
              cx="150"
              cy="105"
              r="68"
              fill="url(#spoolGradLight)"
              filter="url(#reelDropShadow)"
            />
            <circle
              cx="150"
              cy="105"
              r="68"
              fill="url(#spoolNoise)"
              opacity="0.5"
            />
            <circle
              cx="150"
              cy="105"
              r="67.5"
              stroke="#023b6e"
              strokeWidth="1.2"
              fill="none"
              opacity="0.75"
            />

            {/* Central Grommet / Eyelet */}
            <circle cx="150" cy="105" r="23" fill="#09131e" opacity="0.6" />
            <circle cx="150" cy="105" r="21" fill="url(#metalRingGrad)" />

            <path
              d="M 132 98 A 20 20 0 0 1 168 98"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M 134 113 A 19 19 0 0 0 166 113"
              stroke="#070c12"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
            <circle cx="150" cy="105" r="12.5" fill="#030609" />
          </motion.g>

          {/* LOWER BLUE REEL */}
          <motion.g
            animate={lowerTilt}
            transition={{ type: 'spring', damping: 22, stiffness: 90 }}
            style={{ transformOrigin: '150px 355px' }}
          >
            <circle
              cx="150"
              cy="355"
              r="68"
              fill="url(#spoolGradDark)"
              filter="url(#reelDropShadow)"
            />
            <circle
              cx="150"
              cy="355"
              r="68"
              fill="url(#spoolNoise)"
              opacity="0.55"
            />
            <circle
              cx="150"
              cy="355"
              r="67.5"
              stroke="#02325c"
              strokeWidth="1.4"
              fill="none"
              opacity="0.8"
            />

            {/* Central Grommet */}
            <circle cx="150" cy="355" r="23" fill="#050a10" opacity="0.7" />
            <circle cx="150" cy="355" r="21" fill="url(#metalRingGrad)" />
            <path
              d="M 132 348 A 20 20 0 0 1 168 348"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M 134 363 A 19 19 0 0 0 166 363"
              stroke="#070c12"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
            <circle cx="150" cy="355" r="12.5" fill="#030609" />
          </motion.g>
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// 4. CONTACT SECTION COMPONENT (Asymmetrical Responsive Contact Grid)
// ============================================================================
export function ContactSection() {
  return (
    <footer
      className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-12 md:px-20 lg:px-28 pt-24 sm:pt-32 md:pt-40 pb-20 sm:pb-28 select-text"
      id="contact-section"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-14 items-start">
        {/* Left Column: Contact Information */}
        <div
          className="md:col-span-5 lg:col-span-5 flex flex-col space-y-7 sm:space-y-8 text-left font-sans-clean"
          id="contact-info-col"
        >
          {/* Email Block */}
          <div className="flex flex-col space-y-1.5" id="contact-email-block">
            <span className="text-[#99A2AD] text-[14px] sm:text-[15px] font-normal tracking-wide">
              Email
            </span>
            <a
              href="mailto:uihub.design@gmail.com"
              className="text-[#F8F8F5] text-[18px] sm:text-[20px] md:text-[21px] font-normal tracking-[-0.01em] hover:text-[#FFFFFF] transition-colors inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
              id="contact-email-link"
            >
              uihub.design@gmail.com
            </a>
          </div>

          {/* Phone Block */}
          <div className="flex flex-col space-y-1.5" id="contact-phone-block">
            <span className="text-[#99A2AD] text-[14px] sm:text-[15px] font-normal tracking-wide">
              Phone
            </span>
            <a
              href="tel:+6289518924877"
              className="text-[#F8F8F5] text-[18px] sm:text-[20px] md:text-[21px] font-normal tracking-[-0.01em] hover:text-[#FFFFFF] transition-colors inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
              id="contact-phone-link"
            >
              +62 895 1892 4877
            </a>
          </div>

          {/* Social Links Block */}
          <div className="flex flex-col space-y-2.5 pt-2" id="contact-socials-block">
            <a
              href="https://www.linkedin.com/in/jainil-patel2224/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center text-[#F8F8F5] text-[16px] sm:text-[17px] md:text-[18px] font-normal underline underline-offset-4 decoration-[#6c7784] hover:decoration-[#FFFFFF] hover:-translate-y-0.5 transition-all duration-200 w-fit focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
              id="contact-social-linkedin"
            >
              linkedin.com/in/jainil-patel2224/
            </a>

            <a
              href="https://github.com/jainil224"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center text-[#F8F8F5] text-[16px] sm:text-[17px] md:text-[18px] font-normal underline underline-offset-4 decoration-[#6c7784] hover:decoration-[#FFFFFF] hover:-translate-y-0.5 transition-all duration-200 w-fit focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
              id="contact-social-github"
            >
              github.com/jainil224
            </a>
          </div>
        </div>

        {/* Center Clearance Column for central reels */}
        <div className="hidden md:block md:col-span-2 lg:col-span-2 pointer-events-none" aria-hidden="true" />

        {/* Right Column: Signature / Closing */}
        <div
          className="md:col-span-5 lg:col-span-5 flex flex-col items-start md:items-end justify-start pt-2 sm:pt-4"
          id="signature-col"
        >
          <div className="flex flex-col items-start space-y-4 sm:space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-serif-display text-[26px] sm:text-[30px] md:text-[32px] text-[#F8F8F5] font-normal tracking-[-0.01em]"
              id="warm-regards-heading"
            >
              Warm Regards,
            </motion.h2>

            <div className="pt-1">
              <Signature />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// 5. MAIN PORTFOLIO CLOSING COMPONENT
// ============================================================================
export interface PortfolioClosingProps {
  className?: string;
}

export default function PortfolioClosing({ className = '' }: PortfolioClosingProps) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth - 0.5) * 2;
      const normY = (e.clientY / innerHeight - 0.5) * 2;
      setMouseOffset({ x: normX, y: normY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  return (
    <main
      className={`relative w-full min-h-screen bg-[#0B1014] text-[#F8F8F5] overflow-x-hidden flex flex-col justify-between selection:bg-[#087CCB] selection:text-white ${className}`}
      id="portfolio-closing-section"
    >
      {/* Background analog noise texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-overlay z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* TOP ZONE: Rounded white card */}
      <div className="relative w-full z-10 flex flex-col items-center">
        <TopPanel />

        {/* Central Spool Reel Assembly bridging both sections */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[62%] sm:translate-y-[60%] md:translate-y-[58%] z-30"
          id="central-reel-container"
        >
          <ReelAssembly
            mousePos={prefersReducedMotion ? { x: 0, y: 0 } : mouseOffset}
          />
        </div>
      </div>

      {/* BOTTOM ZONE: Contact information and signature */}
      <div className="relative w-full z-20 flex-1 flex flex-col justify-between pt-24 sm:pt-32 md:pt-36">
        <ContactSection />
      </div>
    </main>
  );
}
