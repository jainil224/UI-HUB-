import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Navbar() {
  return (
    <header
      id="main-navbar"
      className="w-full h-[38px] md:h-[42px] border-b border-slate-100 px-4 sm:px-8 md:px-11 flex items-center justify-between relative z-20 select-none"
    >
      <div className="flex items-center">
        <a
          href="#"
          id="nav-logo"
          className="text-slate-900 font-semibold text-[12px] sm:text-[13px] tracking-tight hover:opacity-80 transition-opacity"
        >
          LogoHere
        </a>
      </div>

      <nav
        id="nav-center-links"
        className="hidden md:flex items-center gap-3 sm:gap-4 md:gap-5.5"
      >
        <a href="#features" className="text-slate-600 hover:text-slate-900 text-[10px] sm:text-[10.5px] font-normal transition-colors">
          Features
        </a>
        <a href="#solutions" className="text-slate-600 hover:text-slate-900 text-[10px] sm:text-[10.5px] font-normal transition-colors">
          Solutions
        </a>
        <a href="#case-studies" className="text-slate-600 hover:text-slate-900 text-[10px] sm:text-[10.5px] font-normal transition-colors">
          Case Studies
        </a>
        <div className="group relative flex items-center gap-0.5 cursor-pointer">
          <span className="text-slate-600 group-hover:text-slate-900 text-[10px] sm:text-[10.5px] font-normal transition-colors">
            Developers
          </span>
          <ChevronDown className="w-2.5 h-2.5 text-slate-400 group-hover:text-slate-900 transition-transform duration-200 group-hover:translate-y-[1px]" />
          <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white rounded-md border border-slate-200 shadow-md py-1 w-32 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <a href="#api" className="block px-2.5 py-1 text-[10px] text-slate-600 hover:bg-slate-50 hover:text-slate-900">Documentation</a>
            <a href="#sdks" className="block px-2.5 py-1 text-[10px] text-slate-600 hover:bg-slate-50 hover:text-slate-900">API & SDKs</a>
            <a href="#changelog" className="block px-2.5 py-1 text-[10px] text-slate-600 hover:bg-slate-50 hover:text-slate-900">Changelog</a>
          </div>
        </div>
        <div className="group relative flex items-center gap-0.5 cursor-pointer">
          <span className="text-slate-600 group-hover:text-slate-900 text-[10px] sm:text-[10.5px] font-normal transition-colors">
            Company
          </span>
          <ChevronDown className="w-2.5 h-2.5 text-slate-400 group-hover:text-slate-900 transition-transform duration-200 group-hover:translate-y-[1px]" />
          <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white rounded-md border border-slate-200 shadow-md py-1 w-28 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <a href="#about" className="block px-2.5 py-1 text-[10px] text-slate-600 hover:bg-slate-50 hover:text-slate-900">About Us</a>
            <a href="#careers" className="block px-2.5 py-1 text-[10px] text-slate-600 hover:bg-slate-50 hover:text-slate-900">Careers</a>
            <a href="#contact" className="block px-2.5 py-1 text-[10px] text-slate-600 hover:bg-slate-50 hover:text-slate-900">Contact</a>
          </div>
        </div>
        <a href="#plans" className="text-slate-600 hover:text-slate-900 text-[10px] sm:text-[10.5px] font-normal transition-colors">
          Plans
        </a>
      </nav>

      <div className="flex items-center gap-3 sm:gap-4">
        <a href="#login" id="nav-start-free" className="text-slate-600 hover:text-slate-900 text-[10px] sm:text-[10.5px] font-normal transition-colors">
          Start Free
        </a>
        <button
          type="button"
          id="nav-sign-up-btn"
          className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] sm:text-[10.5px] font-medium px-3 py-1 rounded-full shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          Sign Up
        </button>
      </div>
    </header>
  );
}

export function HeroContent() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      setEmail('');
    }
  };

  return (
    <div
      id="hero-content-wrapper"
      className="w-full flex flex-col items-center justify-center text-center px-4 pt-2 sm:pt-4 md:pt-6 relative z-10 max-w-[580px] mx-auto"
    >
      <div
        id="badge-pill"
        className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-xs mb-2.5 sm:mb-3.5 transition-all duration-200"
      >
        <span className="text-[9.5px] sm:text-[10.5px] text-slate-700 font-normal tracking-tight">
          Hot: Launch websites in moments, not days
        </span>
      </div>

      <h1
        id="hero-heading"
        className="text-[26px] sm:text-[34px] md:text-[38px] lg:text-[41px] font-bold tracking-tight text-slate-950 leading-[1.12] mb-2 sm:mb-2.5 max-w-[520px]"
      >
        Design high-performance websites.
      </h1>

      <p
        id="hero-subheading"
        className="text-[10.5px] sm:text-[12px] md:text-[12.5px] text-slate-500 font-normal leading-relaxed max-w-[430px] mb-4 sm:mb-5 tracking-tight px-2"
      >
        Supercharge your business with AI-driven content and templates optimized for conversions.
      </p>

      <form
        id="email-signup-form"
        onSubmit={handleSubmit}
        className="w-full max-w-[340px] sm:max-w-[360px] h-[34px] sm:h-[36px] bg-white rounded-full border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] pl-3.5 pr-1 flex items-center justify-between transition-all duration-200 focus-within:border-slate-400 focus-within:shadow-[0_4px_20px_rgba(79,125,255,0.12)]"
      >
        <input
          type="email"
          id="email-input-field"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent text-[11px] sm:text-[11.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none pr-2 font-normal"
        />
        <button
          type="submit"
          id="hero-cta-btn"
          className="h-[26px] sm:h-[28px] px-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-[10px] sm:text-[10.5px] font-medium rounded-full shadow-xs transition-all duration-200 shrink-0 cursor-pointer"
        >
          {isSubmitted ? 'Submitted!' : 'Get Started'}
        </button>
      </form>
    </div>
  );
}

export function TrustLogos() {
  return (
    <div
      id="trust-logos-row"
      className="w-full pt-10 pb-7 px-4 sm:px-8 md:px-14 flex items-center justify-between gap-4 sm:gap-6 max-w-[880px] mx-auto opacity-80 hover:opacity-95 transition-opacity duration-200 select-none overflow-x-auto no-scrollbar"
    >
      <div className="flex items-center gap-1.5 text-slate-800 whitespace-nowrap shrink-0 cursor-default">
        <svg className="w-3.5 h-3.5 fill-current text-slate-800" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2L1 21H23L12 2ZM12 6.5L18.5 18H5.5L12 6.5Z" />
          <path d="M12 12.5L16.5 17L15 18.5L12 15.5L9 18.5L7.5 17L12 12.5Z" opacity="0.8" />
        </svg>
        <span className="font-semibold text-[11px] sm:text-[11.5px] tracking-tight">startup</span>
      </div>

      <div className="flex items-center gap-1.5 text-slate-800 whitespace-nowrap shrink-0 cursor-default">
        <svg className="w-3.5 h-3.5 fill-current text-slate-800" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="9" height="9" rx="1.8" />
          <rect x="3" y="12" width="9" height="9" rx="1.8" opacity="0.6" />
          <rect x="12" y="12" width="9" height="9" rx="1.8" />
          <rect x="12" y="3" width="9" height="9" rx="1.8" opacity="0.4" />
        </svg>
        <span className="font-semibold text-[11px] sm:text-[11.5px] tracking-tight">company</span>
      </div>

      <div className="flex items-center gap-1.5 text-slate-800 whitespace-nowrap shrink-0 cursor-default">
        <svg className="w-3.5 h-3.5 fill-current text-slate-800" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="8" cy="8" r="4" />
          <circle cx="16" cy="8" r="4" />
          <circle cx="8" cy="16" r="4" />
          <circle cx="16" cy="16" r="4" />
        </svg>
        <span className="font-semibold text-[11px] sm:text-[11.5px] tracking-tight">incubator</span>
      </div>

      <div className="flex items-center gap-1.5 text-slate-800 whitespace-nowrap shrink-0 cursor-default">
        <svg className="w-3.5 h-3.5 fill-current text-slate-800" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2L2 12L12 22L22 12L12 2Z" />
          <circle cx="12" cy="12" r="2.8" fill="#FFFFFF" />
        </svg>
        <span className="font-semibold text-[11px] sm:text-[11.5px] tracking-tight">corporation</span>
      </div>

      <div className="flex items-center gap-1.5 text-slate-800 whitespace-nowrap shrink-0 cursor-default">
        <svg className="w-3.5 h-3.5 fill-current text-slate-800" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        <span className="font-semibold text-[11px] sm:text-[11.5px] tracking-tight">institute</span>
      </div>

      <div className="flex items-center gap-1.5 text-slate-800 whitespace-nowrap shrink-0 cursor-default">
        <svg className="w-3.5 h-3.5 fill-current text-slate-800" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.3" />
          <path d="M12 3A9 9 0 0 1 21 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span className="font-semibold text-[11px] sm:text-[11.5px] tracking-tight">associate</span>
      </div>
    </div>
  );
}

export function GlassContainer() {
  return (
    <div
      id="main-glass-frame"
      className="w-[94vw] sm:w-[90vw] md:w-[86vw] max-w-[1140px] min-h-[460px] md:min-h-[500px] lg:min-h-[525px] mx-auto rounded-[16px] bg-white border border-slate-200/80 shadow-[0_16px_48px_-12px_rgba(79,125,255,0.14),inset_0_0_0_1px_rgba(0,0,0,0.12)] relative overflow-hidden flex flex-col justify-between"
    >
      <svg
        id="card-curved-gradient-svg"
        className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
        viewBox="0 0 1000 500"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="purple-blue-grad" x1="0%" y1="0%" x2="100%" y2="85%">
            <stop offset="0%" stopColor="#b98af0" />
            <stop offset="20%" stopColor="#a48af5" />
            <stop offset="45%" stopColor="#8a93f7" />
            <stop offset="70%" stopColor="#6f8ffa" />
            <stop offset="100%" stopColor="#4f7dff" />
          </linearGradient>

          <pattern
            id="diagonal-stripes"
            width="14"
            height="14"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="14"
              stroke="rgba(255, 255, 255, 0.09)"
              strokeWidth="2"
            />
          </pattern>

          <filter id="soft-curve-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="55" />
          </filter>

          <mask id="feathered-curve-mask">
            <rect x="-100" y="-100" width="1200" height="700" fill="black" />
            <path
              d="M -60 130 C 160 170, 270 290, 410 355 C 465 380, 535 380, 590 355 C 730 290, 840 170, 1060 130 L 1060 560 L -60 560 Z"
              fill="white"
              filter="url(#soft-curve-blur)"
            />
          </mask>
        </defs>

        <g mask="url(#feathered-curve-mask)">
          <rect x="0" y="0" width="1000" height="500" fill="url(#purple-blue-grad)" />
          <rect x="0" y="0" width="1000" height="500" fill="url(#diagonal-stripes)" />
        </g>
      </svg>

      <div
        id="card-soft-white-blend"
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 72% 64% at 50% -4%, #ffffff 0%, #ffffff 42%, rgba(255, 255, 255, 0.88) 60%, rgba(255, 255, 255, 0.45) 80%, rgba(255, 255, 255, 0) 100%)',
        }}
      />

      <div className="relative z-10">
        <Navbar />
      </div>

      <div className="relative z-10 my-auto py-3 sm:py-5">
        <HeroContent />
      </div>

      <div className="relative z-10">
        <TrustLogos />
      </div>
    </div>
  );
}

export default function LogoHere() {
  return (
    <main
      id="root-container"
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-5 md:p-8 bg-white relative overflow-x-hidden font-sans"
    >
      <GlassContainer />
    </main>
  );
}
