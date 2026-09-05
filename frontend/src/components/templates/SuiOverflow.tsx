import React, { useState } from 'react';

export const HeroSection: React.FC = () => {
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <div
      id="hero-root"
      className="relative w-full min-h-screen min-h-[100dvh] bg-[#F2EFE6] text-[#07182A] overflow-x-hidden flex flex-col justify-between select-none"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
    >
      {/* 1. Subtle authentic paper grain texture overlay */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.035] mix-blend-multiply z-50"
        aria-hidden="true"
      >
        <filter id="paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.05   0 0 0 0 0.05   0 0 0 0 0.05   0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" />
      </svg>

      {/* 2. Technical Blue Grid (Right column on md+ screens) */}
      <div
        id="technical-blue-grid"
        className="hidden md:block absolute top-0 bottom-0 right-0 w-[48%] lg:w-[46%] xl:w-[45%] border-l border-[#66AFFF] pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #66AFFF 1px, transparent 1px),
            linear-gradient(to bottom, #66AFFF 1px, transparent 1px)
          `,
          backgroundSize: '47px 47px',
          backgroundPosition: '0 0',
        }}
      />

      {/* Main Responsive Viewport Container */}
      <div className="relative w-full flex-1 flex flex-col md:flex-row items-stretch justify-between z-10">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Editorial Event Typography & CTA Button */}
        {/* ========================================================================= */}
        <div
          id="hero-left-column"
          className="w-full md:w-[52%] lg:w-[54%] xl:w-[55%] flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 md:px-8 lg:px-14 xl:px-20 2xl:px-28 z-20"
        >
          <div className="max-w-[540px]">
            {/* Main Title: Exactly 3 lines, tight line height, deep navy */}
            <h1
              id="hero-main-title"
              className="text-[#07182A] font-extrabold tracking-[-0.042em] leading-[0.89] text-[46px] xs:text-[52px] sm:text-[64px] md:text-[50px] lg:text-[68px] xl:text-[84px] 2xl:text-[92px]"
            >
              <span className="block">Sui</span>
              <span className="block">Overflow</span>
              <span className="block">2025</span>
            </h1>

            {/* Date */}
            <p
              id="hero-event-date"
              className="text-[#07182A] text-[15px] sm:text-[17px] lg:text-[18px] font-medium tracking-tight mt-5 sm:mt-7 select-none"
            >
              February-August, 2025
            </p>

            {/* Split Register Button */}
            <div className="mt-6 sm:mt-8">
              <button
                id="hero-register-btn"
                onClick={() => setIsRegistered(!isRegistered)}
                className="group inline-flex items-stretch rounded-[1px] overflow-hidden transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#4798FF] focus:ring-offset-2 focus:ring-offset-[#F2EFE6] cursor-pointer shadow-sm hover:shadow-md"
                aria-label="Register for Sui Overflow 2025"
              >
                {/* Left navy button segment */}
                <span className="bg-[#07182A] text-white px-6 sm:px-7 py-3.5 text-[14px] sm:text-[15px] font-semibold tracking-tight transition-colors duration-200 group-hover:bg-[#0c2238] flex items-center justify-center min-h-[48px]">
                  {isRegistered ? 'Registered' : 'Register'}
                </span>

                {/* Right blue square segment with technical diagonal dotted arrow */}
                <span className="bg-[#4798FF] w-[48px] min-h-[48px] flex items-center justify-center transition-colors duration-200 group-hover:bg-[#3b82f6]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transform transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    {/* Arrowhead */}
                    <path
                      d="M7 3.5H14.5V11"
                      stroke="#07182A"
                      strokeWidth="2.4"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    />
                    {/* Diagonal dotted shaft */}
                    <rect x="10.5" y="6.5" width="2.2" height="2.2" fill="#07182A" />
                    <rect x="7" y="10" width="2.2" height="2.2" fill="#07182A" />
                    <rect x="3.5" y="13.5" width="2.2" height="2.2" fill="#07182A" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: 3D Artwork in Blueprint Area */}
        {/* ========================================================================= */}
        <div
          id="hero-artwork-right-container"
          className="relative w-full md:w-[48%] lg:w-[46%] xl:w-[45%] flex items-center justify-center p-6 sm:p-8 md:p-6 lg:p-8 xl:p-12 z-10"
        >
          {/* Mobile blueprint background grid accent */}
          <div
            className="md:hidden absolute inset-0 border-t border-[#66AFFF] opacity-15 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #66AFFF 1px, transparent 1px),
                linear-gradient(to bottom, #66AFFF 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] lg:max-w-[540px] xl:max-w-[600px] flex items-center justify-center">
            <img
              id="hero-overflow-sticker-img"
              src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788586602/0eae34c2-b678-42d8-b9c2-2a73aee6fee1_utbpjf.png"
              alt="Sui Overflow 2025 3D Stickers"
              className="w-full h-auto max-h-[48vh] sm:max-h-[54vh] md:max-h-[75vh] lg:max-h-[82vh] object-contain select-none filter drop-shadow-[0_16px_32px_rgba(7,24,42,0.15)]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;
