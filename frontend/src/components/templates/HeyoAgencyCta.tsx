import React, { useState } from 'react';

const MASCOT_IMAGE_URL =
  'https://res.cloudinary.com/chhwhdhk/image/upload/v1788463693/972ea88b-93ad-4bdc-93ae-2095741274ee_swtdmz.png';

const NAV_ITEMS = [
  { id: 'nav-work', label: 'Work', href: '#work' },
  { id: 'nav-about', label: 'About', href: '#about' },
  { id: 'nav-careers', label: 'Careers', href: '#careers' },
  { id: 'nav-contact', label: 'Contact', href: '#contact' },
];

const SOCIAL_LINKS = [
  { id: 'social-dribbble', name: 'Dribbble', href: '#dribbble', icon: 'dribbble' },
  { id: 'social-twitter', name: 'Twitter', href: '#twitter', icon: 'twitter' },
  { id: 'social-instagram', name: 'Instagram', href: '#instagram', icon: 'instagram' },
  { id: 'social-linkedin', name: 'LinkedIn', href: '#linkedin', icon: 'linkedin' },
  { id: 'social-facebook', name: 'Facebook', href: '#facebook', icon: 'facebook' },
];

export const HeyoAgencyCta: React.FC = () => {
  const [chatFeedback, setChatFeedback] = useState(false);

  const handleChatClick = () => {
    setChatFeedback(true);
    setTimeout(() => setChatFeedback(false), 2200);
  };

  return (
    <div
      id="main-viewport"
      className="w-full h-full min-h-[600px] bg-[#F5F5F2] flex flex-col justify-end items-center overflow-x-hidden pt-6 sm:pt-10 md:pt-16 pb-0 select-none relative font-sans"
    >
      {/* Toast Feedback */}
      <div
        id="toast-notification"
        className={`fixed top-6 right-6 z-50 transition-all duration-300 transform ${
          chatFeedback
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-[#171719] text-white px-5 py-3 rounded-full text-xs sm:text-sm font-medium shadow-2xl border border-white/15 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFE83B] animate-ping" />
          <span>Opening chat window...</span>
        </div>
      </div>

      {/* Main Composition Container */}
      <div
        id="hero-cta-footer-composition"
        className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 pb-0 mt-auto"
      >
        {/* DESKTOP VIEW (>=1024px) */}
        <div
          id="desktop-composition-stage"
          className="hidden lg:block relative w-full h-[620px]"
        >
          {/* 1. Dark Footer Box */}
          <div
            id="desktop-dark-footer"
            className="absolute left-0 right-0 top-[88px] bottom-0 bg-[#171719] rounded-t-[32px] z-10 overflow-hidden"
          />

          {/* 2. Yellow CTA Card */}
          <div
            id="desktop-cta-card-wrapper"
            className="absolute left-[40px] xl:left-[82px] top-[34px] z-20"
          >
            <div
              id="cta-card-yellow"
              className="relative w-[540px] xl:w-[620px] min-h-[292px] bg-[#FFE83B] rounded-[28px] p-10 xl:p-[54px] flex flex-col justify-between shadow-none select-none transition-transform duration-300"
            >
              <div className="flex flex-col">
                <h2
                  id="cta-heading"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  className="text-[40px] xl:text-[49px] font-normal leading-[1.08] text-[#111111] tracking-tight whitespace-nowrap"
                >
                  Let’s get started.
                </h2>
                <p
                  id="cta-description"
                  className="mt-5 xl:mt-[24px] text-[15px] xl:text-[16px] leading-[1.4] text-[#4A4B3A] font-normal max-w-[480px]"
                >
                  We want to hear from you to get an awesome project started!
                </p>
              </div>

              <div className="pt-6">
                <button
                  id="cta-button-chat"
                  type="button"
                  onClick={handleChatClick}
                  className="inline-flex items-center justify-center w-[155px] h-[54px] rounded-full bg-[#171719] text-white text-[15px] font-medium tracking-normal transition-all duration-200 hover:scale-[1.03] hover:bg-[#222225] active:scale-[0.98] cursor-pointer"
                >
                  <span>Let's Chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Mascot Image Breaking Through */}
          <div
            id="desktop-mascot-wrapper"
            className="absolute right-[20px] xl:right-[45px] top-[24px] w-[500px] xl:w-[550px] z-30 pointer-events-none select-none"
          >
            <img
              id="mascot-image"
              src={MASCOT_IMAGE_URL}
              alt="Heyo Mascot Character"
              className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-xl"
              loading="eager"
              decoding="async"
            />
          </div>

          {/* 4. Footer Content Layer */}
          <div
            id="desktop-footer-content-overlay"
            className="absolute inset-x-0 top-[88px] bottom-0 z-25 pointer-events-auto flex flex-col justify-between px-[40px] xl:px-[82px] pt-[260px] pb-[34px]"
          >
            <div className="flex flex-col gap-[22px]">
              {/* Heyo abstract waving hand logo */}
              <div id="desktop-footer-logo" className="inline-flex items-center select-none" aria-label="Heyo Logo">
                <svg
                  className="w-9 h-9 text-white transform -rotate-12 transition-transform duration-300 hover:rotate-0"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 24C10 27.5 12.8 30.5 16.5 30.5C20.2 30.5 24 28 27 24" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
                  <path d="M11 22C11 17 14 11 15.5 8.5C16.2 7.3 17.8 7.3 18.5 8.5C19.8 11 21 16 21 21" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
                  <path d="M21 14C21.8 11.5 23.2 8 24.5 7C25.5 6.2 27 7 27.5 8.5C28.2 11 29 16 28.5 20" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
                  <path d="M29 15C30.2 13 32 11 33.2 11.5C34.2 12 34.5 13.5 34 16C33.2 20 31.5 24 30 26" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
                  <path d="M10 22C8.5 20 7.5 17 7.2 15C7 13.8 8.2 13 9.2 13.8C10.8 15 12.2 18 13 20" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Navigation Links */}
              <nav id="desktop-footer-nav" aria-label="Footer navigation">
                <ul className="flex items-center gap-[28px] list-none p-0 m-0">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        onClick={(e) => e.preventDefault()}
                        className="text-[#E0E0E0] hover:text-white transition-colors duration-150 text-[15px] font-normal tracking-normal cursor-pointer"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Social Icons */}
              <div id="desktop-footer-socials" className="flex items-center gap-[7px]" aria-label="Social media links">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => e.preventDefault()}
                    aria-label={item.name}
                    className="w-[28px] h-[28px] rounded-[5px] bg-white flex items-center justify-center text-[#171719] hover:bg-[#FFE83B] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    {item.icon === 'dribbble' && (
                      <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
                        <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
                        <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
                      </svg>
                    )}
                    {item.icon === 'twitter' && (
                      <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                      </svg>
                    )}
                    {item.icon === 'instagram' && (
                      <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    )}
                    {item.icon === 'linkedin' && (
                      <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.46a1.64 1.64 0 0 0-1.66 1.64 1.64 1.64 0 0 0 1.66 1.64 1.64 1.64 0 0 0 1.65-1.64 1.64 1.64 0 0 0-1.65-1.64z" />
                      </svg>
                    )}
                    {item.icon === 'facebook' && (
                      <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Bottom Row */}
            <div
              id="desktop-footer-bottom-row"
              className="flex items-center justify-between text-[13px] text-[#7E7E84]"
            >
              <div id="copyright-text">
                © Copyright 2024 Heyo
              </div>
              <div id="privacy-link" className="pr-[8px]">
                <a
                  href="#privacy"
                  onClick={(e) => e.preventDefault()}
                  className="hover:text-white transition-colors duration-150 cursor-pointer"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE & TABLET VIEW (<1024px) */}
        <div
          id="mobile-composition-stage"
          className="block lg:hidden relative w-full"
        >
          <div className="relative z-20 flex flex-col items-center">
            <div className="w-full max-w-[580px] -mb-16 sm:-mb-24 px-2">
              <div
                className="relative w-full min-h-[260px] bg-[#FFE83B] rounded-[24px] sm:rounded-[26px] px-6 sm:px-8 py-8 sm:py-10 flex flex-col justify-between select-none"
              >
                <div className="flex flex-col">
                  <h2
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                    className="text-[32px] sm:text-[38px] font-normal leading-[1.08] text-[#111111] tracking-tight"
                  >
                    Let’s get started.
                  </h2>
                  <p className="mt-4 text-[14px] sm:text-[15px] leading-[1.4] text-[#4A4B3A] font-normal max-w-[480px]">
                    We want to hear from you to get an awesome project started!
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={handleChatClick}
                    className="inline-flex items-center justify-center w-[140px] sm:w-[155px] h-[48px] sm:h-[54px] rounded-full bg-[#171719] text-white text-[14px] sm:text-[15px] font-medium tracking-normal transition-all duration-200 hover:scale-[1.03] hover:bg-[#222225] active:scale-[0.98] cursor-pointer"
                  >
                    <span>Let's Chat</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[420px] sm:max-w-[460px] relative z-30 pointer-events-none -mb-12 sm:-mb-16">
              <img
                src={MASCOT_IMAGE_URL}
                alt="Heyo Mascot Character"
                className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-xl"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>

          <div
            id="mobile-dark-footer"
            className="w-full bg-[#171719] rounded-t-[28px] pt-16 sm:pt-24 pb-8 sm:pb-10 px-6 sm:px-10 z-10 relative flex flex-col gap-6 sm:gap-8"
          >
            <div>
              {/* Logo */}
              <svg
                className="w-9 h-9 text-white transform -rotate-12"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 24C10 27.5 12.8 30.5 16.5 30.5C20.2 30.5 24 28 27 24" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M11 22C11 17 14 11 15.5 8.5C16.2 7.3 17.8 7.3 18.5 8.5C19.8 11 21 16 21 21" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M21 14C21.8 11.5 23.2 8 24.5 7C25.5 6.2 27 7 27.5 8.5C28.2 11 29 16 28.5 20" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M29 15C30.2 13 32 11 33.2 11.5C34.2 12 34.5 13.5 34 16C33.2 20 31.5 24 30 26" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M10 22C8.5 20 7.5 17 7.2 15C7 13.8 8.2 13 9.2 13.8C10.8 15 12.2 18 13 20" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
              </svg>
            </div>

            <nav aria-label="Footer navigation mobile">
              <ul className="flex flex-wrap items-center gap-5 sm:gap-[28px] list-none p-0 m-0">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      onClick={(e) => e.preventDefault()}
                      className="text-[#E0E0E0] hover:text-white transition-colors text-[14px] sm:text-[15px] font-normal"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-[7px]" aria-label="Social media links mobile">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => e.preventDefault()}
                  aria-label={item.name}
                  className="w-[28px] h-[28px] rounded-[5px] bg-white flex items-center justify-center text-[#171719] hover:bg-[#FFE83B] transition-all"
                >
                  {item.icon === 'dribbble' && (
                    <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
                      <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
                      <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
                    </svg>
                  )}
                  {item.icon === 'twitter' && (
                    <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                    </svg>
                  )}
                  {item.icon === 'instagram' && (
                    <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  )}
                  {item.icon === 'linkedin' && (
                    <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.46a1.64 1.64 0 0 0-1.66 1.64 1.64 1.64 0 0 0 1.66 1.64 1.64 1.64 0 0 0 1.65-1.64 1.64 1.64 0 0 0-1.65-1.64z" />
                    </svg>
                  )}
                  {item.icon === 'facebook' && (
                    <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>

            <div className="w-full h-px bg-white/10 my-1" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[13px] text-[#7E7E84]">
              <div>© Copyright 2024 Heyo</div>
              <div>
                <a
                  href="#privacy"
                  onClick={(e) => e.preventDefault()}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeyoAgencyCta;
