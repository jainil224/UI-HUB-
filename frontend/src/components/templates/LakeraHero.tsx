import React, { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   1. Navbar Component
   ───────────────────────────────────────────────────────────── */
export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="relative w-full z-30 border-b border-neutral-100/80 bg-white">
      <div className="w-full max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-10 md:px-14 lg:px-20 h-[68px] sm:h-[76px] flex items-center justify-between">
        
        {/* LOGO */}
        <a href="#home" className="flex items-center gap-2 sm:gap-2.5 group select-none">
          <div className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] bg-black text-white rounded-[6px] flex items-center justify-center font-bold text-[13px] tracking-tighter">
            L
          </div>
          <span className="text-[19px] sm:text-[21px] font-black tracking-[-0.04em] text-black">
            lakera
          </span>
        </a>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-[14px] text-neutral-600 font-medium select-none">
          <button type="button" className="flex items-center gap-1.5 hover:text-black transition-colors py-1 group cursor-pointer">
            <span>Platform</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-transform group-hover:translate-y-[1px]" />
          </button>
          <button type="button" className="flex items-center gap-1.5 hover:text-black transition-colors py-1 group cursor-pointer">
            <span>Solutions</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-transform group-hover:translate-y-[1px]" />
          </button>
          <a href="#pricing" className="hover:text-black transition-colors py-1">
            Pricing
          </a>
          <button type="button" className="flex items-center gap-1.5 hover:text-black transition-colors py-1 group cursor-pointer">
            <span>Company</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-transform group-hover:translate-y-[1px]" />
          </button>
          <button type="button" className="flex items-center gap-1.5 hover:text-black transition-colors py-1 group cursor-pointer">
            <span>Resources</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black transition-transform group-hover:translate-y-[1px]" />
          </button>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="#login"
            className="text-[13.5px] font-medium text-neutral-700 hover:text-black px-2 py-1 transition-colors select-none"
          >
            Log in
          </a>
          <a
            href="#demo"
            className="hidden sm:inline-flex items-center justify-center h-[36px] px-4 rounded-full border border-neutral-300 text-[13px] font-medium text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 transition-all select-none active:scale-[0.98]"
          >
            Book a demo
          </a>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-700 hover:text-black focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-6 py-4 space-y-3">
          <a href="#platform" className="block py-2 text-[14px] text-neutral-800 font-medium">Platform</a>
          <a href="#solutions" className="block py-2 text-[14px] text-neutral-800 font-medium">Solutions</a>
          <a href="#pricing" className="block py-2 text-[14px] text-neutral-800 font-medium">Pricing</a>
          <a href="#company" className="block py-2 text-[14px] text-neutral-800 font-medium">Company</a>
          <a href="#resources" className="block py-2 text-[14px] text-neutral-800 font-medium">Resources</a>
          <div className="pt-2">
            <a href="#demo" className="w-full inline-flex items-center justify-center h-[40px] rounded-full border border-neutral-300 text-[13px] font-medium text-neutral-800">
              Book a demo
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

/* ─────────────────────────────────────────────────────────────
   2. TrustLogos Component
   ───────────────────────────────────────────────────────────── */
export const TrustLogos: React.FC = () => {
  return (
    <div id="trusted-by-section" className="w-full select-none z-20 mt-1 sm:mt-2 -translate-y-3 sm:-translate-y-5 md:-translate-y-6 pb-4 sm:pb-6">
      <p 
        id="trusted-by-heading"
        className="text-[12.5px] sm:text-[13px] md:text-[13.5px] text-neutral-500 font-normal tracking-[-0.01em] mb-3 sm:mb-4"
      >
        Lakera is trusted by leading LLM providers, enterprises, and startups.
      </p>

      <div 
        id="company-logos-row"
        className="w-full flex items-center justify-between gap-4 xs:gap-6 sm:gap-8 md:gap-10 lg:gap-12 text-black overflow-x-auto no-scrollbar py-2"
      >
        {/* 1. Cohere */}
        <div className="flex items-center gap-2 sm:gap-2.5 opacity-100 hover:opacity-80 transition-opacity shrink-0 cursor-default">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-black" viewBox="0 0 32 32">
            <path d="M12.5 4C7.8 4 4 7.8 4 12.5c0 3.2 1.8 6 4.4 7.4-.1.7-.2 1.4-.2 2.1 0 4.4 3.6 8 8 8s8-3.6 8-8c0-1.2-.3-2.3-.8-3.3 2.8-1.5 4.6-4.4 4.6-7.7 0-4.7-3.8-8.5-8.5-8.5-2.4 0-4.6 1-6.1 2.6C14.7 4.4 13.6 4 12.5 4z" />
          </svg>
          <span className="font-bold text-[18px] sm:text-[21px] md:text-[23px] tracking-[-0.03em] text-black">
            cohere
          </span>
        </div>

        {/* 2. Nexxiot */}
        <div className="flex items-center opacity-100 hover:opacity-80 transition-opacity shrink-0 cursor-default">
          <span className="font-black text-[18px] sm:text-[21px] md:text-[23px] tracking-[-0.02em] text-black flex items-center">
            ne
            <span className="inline-flex items-center tracking-[-0.15em] mx-[0.5px] font-black text-[17px] sm:text-[20px] md:text-[22px]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 inline-block -mx-0.5 fill-black" viewBox="0 0 20 20">
                <path d="M3 4l4.5 6L3 16h3l3.5-4.8L13 16h3l-4.5-6L16 4h-3l-3.5 4.8L6 4H3z" />
              </svg>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 inline-block -mx-0.5 fill-black" viewBox="0 0 20 20">
                <path d="M3 4l4.5 6L3 16h3l3.5-4.8L13 16h3l-4.5-6L16 4h-3l-3.5 4.8L6 4H3z" />
              </svg>
            </span>
            iot
          </span>
        </div>

        {/* 3. DEKRA */}
        <div className="flex items-center gap-1.5 sm:gap-2 opacity-100 hover:opacity-80 transition-opacity shrink-0 cursor-default">
          <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-black" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2L13 8L3 14V2Z" />
          </svg>
          <span className="font-black text-[15px] sm:text-[18px] md:text-[20px] tracking-[0.06em] text-black">
            DEKRA
          </span>
        </div>

        {/* 4. ANYbotics */}
        <div className="flex items-center opacity-100 hover:opacity-80 transition-opacity shrink-0 cursor-default">
          <span className="font-black text-[18px] sm:text-[21px] md:text-[23px] tracking-[-0.06em] text-black mr-0.5">
            ANV
          </span>
          <span className="font-bold text-[17px] sm:text-[20px] md:text-[22px] tracking-[-0.02em] text-black">
            botics
          </span>
        </div>

        {/* 5. Protex AI */}
        <div className="flex items-center gap-1.5 sm:gap-2 opacity-100 hover:opacity-80 transition-opacity shrink-0 cursor-default">
          <svg className="w-4 h-4 sm:w-[19px] sm:h-[19px] fill-black shrink-0" viewBox="0 0 24 24">
            <path d="M4 3h6v18H4V3zm8 0h6l4 5-4 5h-6V3z" />
          </svg>
          <span className="font-bold text-[16px] sm:text-[19px] md:text-[21px] tracking-[-0.02em] text-black">
            Protex <span className="font-normal text-neutral-800">AI</span>
          </span>
        </div>

        {/* 6. Juro */}
        <div className="flex items-center opacity-100 hover:opacity-80 transition-opacity shrink-0 cursor-default">
          <span className="font-bold text-[20px] sm:text-[24px] md:text-[26px] tracking-[-0.03em] text-black lowercase">
            juro
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   3. ChatButton Component
   ───────────────────────────────────────────────────────────── */
export const ChatButton: React.FC = () => {
  return (
    <button
      id="floating-chat-button"
      aria-label="Open support chat"
      className="fixed bottom-4 sm:bottom-[18px] right-4 sm:right-[20px] w-[42px] h-[42px] sm:w-[44px] sm:h-[44px] rounded-full bg-[#0d1b2e] hover:bg-[#152a47] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95"
    >
      <svg className="w-[20px] h-[20px] text-white" viewBox="0 0 24 24" fill="none">
        <path 
          d="M20 11.5C20 16.1944 16.1944 20 11.5 20C10.05 20 8.68 19.64 7.48 19.01L3.5 20.25L4.76 16.36C4 14.94 3.5 13.28 3.5 11.5C3.5 6.80558 7.30558 3 12 3C16.6944 3 20 6.80558 20 11.5Z" 
          fill="white" 
        />
        <path 
          d="M8.5 11.2C8.5 12.8 10.07 14 12 14C13.93 14 15.5 12.8 15.5 11.2" 
          stroke="#0d1b2e" 
          strokeWidth="2.1" 
          strokeLinecap="round" 
        />
      </svg>
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────
   4. Main Composite Component: LakeraHero
   ───────────────────────────────────────────────────────────── */
export default function LakeraHero() {
  return (
    <div className="relative min-h-screen bg-white text-neutral-900 font-sans antialiased flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      
      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* 2. MAIN HERO SECTION */}
      <main className="relative flex-1 w-full max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-10 md:px-14 lg:px-20 pt-2 sm:pt-6 md:pt-8 pb-12 sm:pb-16 md:pb-20 flex flex-col justify-between z-10 overflow-hidden md:overflow-visible">
        
        {/* DESKTOP CIRCULAR OBJECT IMAGE */}
        <div 
          aria-hidden="true"
          className="pointer-events-none select-none z-0 absolute top-[65px] sm:top-[85px] md:top-[95px] lg:top-[105px] xl:top-[120px] right-[-12%] sm:right-[-10%] md:right-[-8%] lg:right-[-6%] xl:right-[-4%] w-[90vw] sm:w-[80vw] md:w-[74vw] lg:w-[70vw] xl:w-[66vw] max-w-[1100px] md:max-w-[1280px] lg:max-w-[1450px] xl:max-w-[1600px] min-w-[360px] hidden md:flex items-center justify-end overflow-visible"
        >
          <img
            id="hero-portal-image"
            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788364280/ChatGPT_Image_Sep_2_2026_09_21_07_PM_te7wxd.png"
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-[850px] md:max-h-[980px] lg:max-h-[1100px] xl:max-h-[1200px] object-contain object-right"
          />
        </div>

        {/* HERO CONTENT (LEFT SIDE) */}
        <div className="relative z-10 max-w-[580px] pt-1 sm:pt-2 md:pt-4 flex flex-col">

          {/* Technical Monospace Label */}
          <div className="flex items-center gap-2 mb-3.5 sm:mb-5">
            <span 
              id="hero-eyebrow-tag"
              className="font-mono text-[11px] sm:text-[11.5px] font-medium tracking-[0.18em] text-[#557b97] uppercase select-none"
            >
              INTRODUCING LAKERA GUARD
            </span>
          </div>

          {/* Main Headline */}
          <h1 
            id="hero-main-heading"
            className="text-[38px] xs:text-[44px] sm:text-[54px] md:text-[62px] lg:text-[68px] font-normal leading-[1.04] tracking-[-0.04em] text-black font-serif mb-4 sm:mb-6 select-text"
          >
            Protect your LLM applications against security threats, instantly.
          </h1>

          {/* Description Paragraph */}
          <p 
            id="hero-description"
            className="text-[14px] sm:text-[15.5px] md:text-[16px] leading-[1.58] text-neutral-600 font-normal tracking-[-0.01em] max-w-[500px] mb-6 sm:mb-8 select-text"
          >
            Lakera Guard empowers organizations to build GenAI applications without worrying about prompt injections, data loss, harmful content, and other LLM risks. Powered by the world’s most advanced AI threat intelligence.
          </p>

          {/* CTA Buttons */}
          <div id="hero-cta-buttons" className="relative flex items-center gap-[10px] sm:gap-[12px] mb-6 sm:mb-8 md:mb-10 z-20">
            <a
              id="cta-start-free"
              href="#start"
              className="inline-flex items-center justify-center min-w-[110px] sm:min-w-[105px] h-[42px] sm:h-[40px] px-5 rounded-full bg-black text-white text-[13px] font-medium hover:bg-neutral-800 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black active:scale-[0.98] z-10"
            >
              Start for free
            </a>

            <a
              id="cta-book-demo"
              href="#demo"
              className="inline-flex items-center justify-center min-w-[110px] sm:min-w-[108px] h-[42px] sm:h-[40px] px-5 rounded-full bg-white text-neutral-800 border border-neutral-300/90 text-[13px] font-medium hover:bg-neutral-50 hover:border-neutral-400 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400 active:scale-[0.98] z-10"
            >
              Book a demo
            </a>

            {/* MOBILE ONLY CIRCULAR OBJECT IMAGE */}
            <div 
              aria-hidden="true" 
              className="md:hidden pointer-events-none select-none -z-10 absolute top-[80%] -translate-y-1/2 right-[-26%] xs:right-[-20%] w-[98vw] xs:w-[88vw] max-w-[500px] min-w-[320px] flex items-center justify-end overflow-visible"
            >
              <img
                src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788364280/ChatGPT_Image_Sep_2_2026_09_21_07_PM_te7wxd.png"
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[540px] object-contain object-right"
              />
            </div>
          </div>
        </div>

        {/* 3. TRUSTED BY LOGO SECTION */}
        <TrustLogos />
      </main>

      {/* 4. FLOATING CHAT BUTTON (BOTTOM-RIGHT) */}
      <ChatButton />
    </div>
  );
}
