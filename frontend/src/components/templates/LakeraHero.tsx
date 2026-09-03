import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   1. TrustLogos Component
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
   2. ChatButton Component
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
   3. Main LakeraHero Component
   ───────────────────────────────────────────────────────────── */
export default function LakeraHero() {
  return (
    <div className="relative w-full min-h-screen bg-white text-black overflow-hidden flex flex-col justify-between select-none">
      
      {/* ── TOP NAVIGATION BAR ── */}
      <nav className="relative z-30 w-full max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-10 md:px-14 lg:px-20 py-4 sm:py-5 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg tracking-tighter">
            L
          </div>
          <span className="font-bold text-[19px] sm:text-[21px] tracking-tight text-black">
            Lakera
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-neutral-700">
          <div className="flex items-center gap-1 cursor-pointer hover:text-black transition-colors">
            <span>Platform</span>
            <ChevronDown size={14} className="opacity-60" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-black transition-colors">
            <span>Solutions</span>
            <ChevronDown size={14} className="opacity-60" />
          </div>
          <a href="#customers" className="hover:text-black transition-colors">Customers</a>
          <a href="#resources" className="hover:text-black transition-colors">Resources</a>
          <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a 
            href="#login" 
            className="hidden sm:inline-block text-[13.5px] font-medium text-neutral-700 hover:text-black transition-colors px-2 py-1"
          >
            Log in
          </a>
          <a 
            href="#get-started" 
            className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 text-[12.5px] sm:text-[13.5px] font-medium transition-all shadow-sm active:scale-95"
          >
            <span>Start for free</span>
            <ArrowRight size={13} />
          </a>
        </div>
      </nav>

      {/* ── RIGHT-SIDE SLIT-SCAN CIRCULAR GRAPHIC ── */}
      {/* Desktop Graphic */}
      <div 
        className="absolute top-[65px] sm:top-[85px] md:top-[95px] lg:top-[105px] xl:top-[120px] right-[-12%] sm:right-[-10%] md:right-[-8%] lg:right-[-6%] xl:right-[-4%] w-[90vw] sm:w-[80vw] md:w-[74vw] lg:w-[70vw] xl:w-[66vw] max-w-[1100px] md:max-w-[1280px] lg:max-w-[1450px] xl:max-w-[1600px] min-w-[360px] hidden md:flex items-center justify-end pointer-events-none select-none z-0 overflow-visible"
        aria-hidden="true"
      >
        <img 
          src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788364280/ChatGPT_Image_Sep_2_2026_09_21_07_PM_te7wxd.png"
          alt="Lakera AI Slit Scan Core"
          className="w-full h-auto max-h-[850px] md:max-h-[980px] lg:max-h-[1100px] xl:max-h-[1200px] object-contain object-right"
        />
      </div>

      {/* Mobile Graphic */}
      <div 
        className="md:hidden pointer-events-none select-none -z-10 absolute top-[80%] -translate-y-1/2 right-[-26%] xs:right-[-20%] w-[98vw] xs:w-[88vw] max-w-[500px] min-w-[320px] flex items-center justify-end"
        aria-hidden="true"
      >
        <img 
          src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788364280/ChatGPT_Image_Sep_2_2026_09_21_07_PM_te7wxd.png"
          alt="Lakera AI Slit Scan Core"
          className="w-full h-auto max-h-[540px] object-contain object-right"
        />
      </div>

      {/* ── HERO CONTENT STAGE ── */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-10 md:px-14 lg:px-20 pt-10 sm:pt-14 md:pt-20 pb-8 flex-1 flex flex-col justify-center">
        <div className="max-w-[620px] lg:max-w-[680px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-[12px] sm:text-[13px] font-medium mb-5 sm:mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>GenAI Security Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-[36px] sm:text-[48px] md:text-[56px] lg:text-[62px] font-black tracking-[-0.03em] leading-[1.06] text-black">
            Secure GenAI at the speed of innovation.
          </h1>

          {/* Subheading */}
          <p className="mt-5 sm:mt-6 text-[15px] sm:text-[17px] md:text-[18px] text-neutral-600 leading-relaxed font-normal max-w-[540px]">
            Comprehensive real-time protection against prompt injection, jailbreaks, data leakage, and toxic content for enterprise AI agents and LLM applications.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
            <button 
              type="button"
              className="px-6 py-3.5 sm:px-7 sm:py-4 rounded-full bg-black hover:bg-neutral-800 text-white font-semibold text-[14px] sm:text-[15px] transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Start for free</span>
              <ArrowRight size={15} />
            </button>
            <button 
              type="button"
              className="px-6 py-3.5 sm:px-7 sm:py-4 rounded-full bg-neutral-100 hover:bg-neutral-200 text-black font-semibold text-[14px] sm:text-[15px] transition-all active:scale-95 cursor-pointer border border-neutral-300"
            >
              Book a demo
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER BRAND PROOF SECTION ── */}
      <footer className="relative z-20 w-full max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-10 md:px-14 lg:px-20 pb-12 sm:pb-16 md:pb-20">
        <TrustLogos />
      </footer>

      {/* ── FLOATING SUPPORT CHAT BUBBLE ── */}
      <ChatButton />
    </div>
  );
}
