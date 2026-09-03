import React, { useState } from 'react';

export default function MentalityHero() {
  const [query, setQuery] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'pl'>('en');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmittedMessage(query.trim());
    setTimeout(() => setSubmittedMessage(null), 3500);
  };

  return (
    <main className="min-h-screen w-full bg-[#F0F0F0] flex flex-col justify-between items-center overflow-x-hidden font-sans select-none">
      <div className="w-full max-w-[1100px] flex flex-col justify-between min-h-screen flex-1 relative">
        
        {/* NAVIGATION BAR */}
        <header className="w-full px-6 sm:px-10 pt-5 pb-3">
          <div className="flex items-center justify-between gap-6">
            {/* Brand Logo */}
            <div className="inline-flex items-center gap-2 text-[#111111]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="9" y="3" width="6" height="18" rx="2" />
                <rect x="3" y="9" width="18" height="6" rx="2" />
              </svg>
              <span className="text-[18px] font-bold tracking-tight leading-none text-[#111111] select-none">
                mēntality
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-start gap-8 lg:gap-12 text-[12.5px] lg:text-[13.5px] text-[#222222] font-normal leading-tight select-none">
              <div className="flex flex-col gap-1">
                <a href="#service" className="hover:text-black transition-colors">service</a>
                <a href="#patient-resources" className="hover:text-black transition-colors text-[#444444]">patient resources</a>
              </div>
              <a href="#about" className="hover:text-black transition-colors">about us</a>
              <a href="#education" className="hover:text-black transition-colors">education center</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-5 sm:gap-6">
              <a href="#find-help" className="text-[12.5px] lg:text-[13.5px] text-[#222222] hover:text-black transition-colors font-normal select-none">
                find help
              </a>
              <button
                type="button"
                className="bg-[#050505] hover:bg-[#222222] text-[#FFFFFF] text-[12px] sm:text-[13px] font-medium px-4 py-1.5 sm:px-5 sm:py-2 rounded-[5px] inline-flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-none active:scale-[0.98]"
              >
                <span>get started</span>
                <span className="text-[13px] leading-none">→</span>
              </button>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <div className="w-full flex flex-col items-center text-center pt-6 sm:pt-10 md:pt-12 pb-3 z-10 relative">
          <h1 className="max-w-[840px] mx-auto text-[26px] sm:text-[36px] md:text-[44px] lg:text-[48px] leading-[1.18] tracking-[-0.03em] text-center select-none">
            <span className="font-bold text-[#111111]">Expert mental programs,</span>{' '}
            <span className="font-light text-[#666666]">information</span>
            <br />
            <span className="font-light text-[#666666]">and resources to help you manage</span>
            <br />
            <span className="font-light text-[#666666]">
              your{' '}
              <span className="inline-flex items-center mx-1 sm:mx-1.5 align-middle translate-y-[-1px] sm:translate-y-[-2px]">
                <svg width="32" height="18" viewBox="0 0 24 14" fill="none" className="inline-block text-[#333333]">
                  <path d="M1 7C3.8 2.2 8 0.8 12 0.8C16 0.8 20.2 2.2 23 7C20.2 11.8 16 13.2 12 13.2C8 13.2 3.8 11.8 1 7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="3" fill="currentColor" />
                </svg>
              </span>{' '}
              mental wellbeing.
            </span>
          </h1>

          {/* AI Prompt Input Bar */}
          <div className="mt-6 sm:mt-8 flex flex-col items-center">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me anything..."
                className="w-[200px] sm:w-[260px] md:w-[280px] h-[36px] sm:h-[40px] px-4 text-[12.5px] sm:text-[13px] bg-[#FFFFFF] border border-[#D5D5D5] rounded-[6px] text-[#222222] placeholder-[#A0A0A0] focus:outline-none focus:border-[#444444] transition-all shadow-none"
              />
              <button
                type="submit"
                aria-label="Send prompt"
                className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] bg-[#050505] hover:bg-[#222222] active:scale-95 text-[#FFFFFF] rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0"
              >
                <svg width="15" height="15" viewBox="0 0 12 12" fill="none">
                  <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>

            {submittedMessage && (
              <div className="text-[11px] text-[#444444] mt-2 bg-[#FFFFFF] border border-[#E0E0E0] px-3 py-1 rounded-[4px] shadow-sm transition-all">
                Finding resources for &ldquo;{submittedMessage}&rdquo;...
              </div>
            )}
          </div>
        </div>

        {/* CENTRAL TECHNICAL ARTWORK & ARTWORK CONTAINER */}
        <div className="w-full relative flex items-center justify-center overflow-hidden select-none mt-1 sm:mt-2">
          <svg viewBox="0 0 960 490" className="w-full h-auto max-h-[460px] object-contain" xmlns="http://www.w3.org/2000/svg">
            {/* TECHNICAL GRID & GEOMETRIC LINES */}
            <g id="technical-grid-lines">
              <line x1="0" y1="290" x2="960" y2="290" stroke="#B7B7B7" strokeWidth="0.8" strokeDasharray="2 3" />
              <line x1="50" y1="340" x2="440" y2="135" stroke="#BFBFBF" strokeWidth="0.8" />
              <line x1="910" y1="340" x2="520" y2="135" stroke="#BFBFBF" strokeWidth="0.8" />
              <line x1="0" y1="430" x2="380" y2="200" stroke="#CECECE" strokeWidth="0.6" strokeDasharray="3 3" />
              <line x1="960" y1="430" x2="580" y2="200" stroke="#CECECE" strokeWidth="0.6" strokeDasharray="3 3" />

              {/* Left Circle & Diamond */}
              <circle cx="50" cy="340" r="92" fill="none" stroke="#BFBFBF" strokeWidth="0.9" />
              <polygon points="50,335 55,340 50,345 45,340" fill="#111111" />

              {/* Right Circle & Diamond */}
              <circle cx="910" cy="340" r="92" fill="none" stroke="#BFBFBF" strokeWidth="0.9" />
              <polygon points="910,335 915,340 910,345 905,340" fill="#111111" />

              {/* Sweeping Arcs */}
              <path d="M 110 490 A 420 420 0 0 1 850 490" fill="none" stroke="#C5C5C5" strokeWidth="0.8" />
              <path d="M 170 490 A 360 360 0 0 1 790 490" fill="none" stroke="#B5B5B5" strokeWidth="0.9" />
              <path d="M 230 490 A 300 300 0 0 1 730 490" fill="none" stroke="#C8C8C8" strokeWidth="0.7" strokeDasharray="3 4" />
            </g>

            {/* CHARACTER ARTWORK (CLEAN, NO GLOW) */}
            <g id="character-artwork-group">
              <image
                href="https://res.cloudinary.com/chhwhdhk/image/upload/v1788400409/8edc532e-6a4a-463d-a224-b4da52b15c8e_rwv0s3.png"
                x="180"
                y="82"
                width="621"
                height="414"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>

            {/* LOWER-RIGHT LANGUAGE BADGE */}
            <g className="cursor-pointer" onClick={() => setActiveLang(activeLang === 'en' ? 'pl' : 'en')}>
              <rect x="882" y="428" width="38" height="18" rx="3" fill="#E5E5E5" stroke="#BDBDBD" strokeWidth="0.8" />
              <text x="901" y="440" textAnchor="middle" fill="#555555" fontSize="8" fontFamily="monospace, sans-serif" fontWeight="bold" letterSpacing="0.05em">
                {activeLang === 'en' ? 'pl - en' : 'en - pl'}
              </text>
            </g>
          </svg>
        </div>

      </div>
    </main>
  );
}
