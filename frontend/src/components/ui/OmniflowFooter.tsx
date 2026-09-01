import React from 'react';
import { Instagram, Facebook, Youtube } from 'lucide-react';

export default function OmniflowFooter() {
  return (
    <div className="min-h-screen w-full bg-[#FCFBFF] text-[#34334F] font-sans antialiased selection:bg-[#6855E8]/20 selection:text-[#34345F] flex flex-col justify-between">
      {/* ========================================================================= */}
      {/* 1. TOP CTA CARD SECTION                                                   */}
      {/* ========================================================================= */}
      <section className="w-full flex justify-center px-4 pt-[78px] pb-[88px]">
        <div
          className="relative w-full max-w-[835px] h-[290px] rounded-[18px] overflow-hidden border border-[#E7E6EF] shadow-[0_20px_50px_-20px_rgba(104,85,232,0.12),0_0_0_1px_rgba(231,230,239,0.8)] bg-[#F8F7FD] flex items-center"
        >
          {/* Ribbed / Fluted Vertical Stripes Texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(255,255,255,0.95) 0px, rgba(255,255,255,0.9) 10px, rgba(224,218,248,0.4) 11px, rgba(202,192,245,0.35) 18px, rgba(235,230,252,0.6) 22px)',
              backgroundSize: '22px 100%',
            }}
          />

          {/* Atmospheric Glow Overlays */}
          {/* Bottom-right glow */}
          <div className="absolute -right-16 -bottom-16 w-[450px] h-[350px] rounded-full bg-gradient-to-tl from-[#D4C8FA]/70 via-[#E4DCFC]/40 to-transparent blur-2xl pointer-events-none" />
          {/* Top-right subtle glow */}
          <div className="absolute right-12 top-0 w-[300px] h-[200px] rounded-full bg-gradient-to-b from-[#EDE7FD]/50 to-transparent blur-xl pointer-events-none" />
          {/* Left text contrast mask */}
          <div className="absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-[#FBFBFE]/90 via-[#F8F7FD]/60 to-transparent pointer-events-none" />

          {/* CTA Content Container */}
          <div className="relative z-10 pl-8 md:pl-[55px] pr-6 max-w-[500px]">
            {/* Heading */}
            <h2 className="text-[22px] md:text-[27px] font-bold text-[#34345F] leading-[1.25] tracking-[-0.025em]">
              It's time for you to upgrade
              <br />
              to Omniflow
            </h2>

            {/* Description */}
            <p className="mt-3 text-[11px] text-[#77758A] leading-[16px] tracking-[-0.01em]">
              It only takes minutes to set up your first project. Lets go!
            </p>

            {/* CTA Button */}
            <div className="mt-5">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center justify-center w-[103px] h-[33px] rounded-full bg-gradient-to-b from-[#7360F2] to-[#604CE2] text-white text-[11px] font-semibold tracking-normal shadow-[0_4px_12px_rgba(104,85,232,0.35),0_1px_2px_rgba(0,0,0,0.1)] hover:brightness-105 active:scale-[0.98] transition-all duration-150"
              >
                Try for Free &gt;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. HORIZONTAL SECTION DIVIDER                                             */}
      {/* ========================================================================= */}
      <div className="w-full h-[1px] bg-[#E7E6EF]" />

      {/* ========================================================================= */}
      {/* 3. FOOTER SECTION                                                         */}
      {/* ========================================================================= */}
      <footer className="relative w-full overflow-hidden bg-gradient-to-b from-[#FCFCFE] via-[#F3EDFD] to-[#E5DBFA] pt-[55px]">
        {/* Navigation & Brand Links Row */}
        <div className="w-full max-w-[835px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-4">
            {/* Left: App Icon / Logo */}
            <div className="flex items-center">
              <div className="w-[45px] h-[45px] rounded-[11px] bg-gradient-to-b from-[#6855E8] to-[#5944E4] shadow-[0_4px_12px_rgba(104,85,232,0.25)] flex items-center justify-center">
                {/* Omniflow swirl ring icon */}
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 3.5C7.306 3.5 3.5 7.306 3.5 12S7.306 20.5 12 20.5 20.5 16.694 20.5 12 16.694 3.5 12 3.5zm0 13c-2.485 0-4.5-2.015-4.5-4.5 0-1.78.99-3.268 2.41-4.018-.11.472-.16.975-.16 1.518 0 2.21 1.79 4 4 4 .543 0 1.046-.05 1.518-.16-.75 1.42-2.238 2.41-4.018 2.41z" />
                </svg>
              </div>
            </div>

            {/* Center: 3 Navigation Columns */}
            <div className="flex flex-wrap gap-12 sm:gap-16 md:gap-20">
              {/* Column 1 */}
              <div>
                <ul className="space-y-0">
                  {['Services', 'Blog', 'Portfolio'].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-[11.5px] text-[#34334F] leading-[28px] hover:text-[#6855E8] transition-colors duration-150"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2 */}
              <div>
                <ul className="space-y-0">
                  {['Jobs', 'Help centre'].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-[11.5px] text-[#34334F] leading-[28px] hover:text-[#6855E8] transition-colors duration-150"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3 */}
              <div>
                <ul className="space-y-0">
                  {['About us', 'Contact'].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-[11.5px] text-[#34334F] leading-[28px] hover:text-[#6855E8] transition-colors duration-150"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: 3 Circular Social Action Buttons */}
            <div className="flex items-center gap-2.5">
              {[
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Youtube, label: 'YouTube' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label={label}
                  className="w-[30px] h-[30px] rounded-full bg-white border border-[#E7E6EF] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-center text-[#55536D] hover:text-[#6855E8] hover:border-[#D1CEE5] transition-all duration-150"
                >
                  <Icon size={13} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. GIANT OVERSIZED CROPPED "Omniflow" BACKGROUND TYPOGRAPHY                */}
        {/* ========================================================================= */}
        <div className="relative w-full h-[145px] sm:h-[185px] md:h-[225px] mt-6 flex justify-center items-end overflow-hidden pointer-events-none select-none">
          {/* Atmospheric Glow behind the Giant Text */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#DDD0F8]/90 via-[#EAE1FB]/60 to-transparent pointer-events-none" />
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[900px] h-[280px] rounded-full bg-gradient-to-t from-[#D5C6F7] via-[#E2D6FA]/80 to-transparent blur-3xl pointer-events-none" />

          {/* Cropped Giant Omniflow Typography */}
          <h1 className="relative font-extrabold text-white text-[115px] sm:text-[165px] md:text-[215px] tracking-[-0.04em] leading-none whitespace-nowrap -bottom-4 sm:-bottom-6 md:-bottom-8 drop-shadow-[0_2px_18px_rgba(255,255,255,0.7)]">
            Omniflow
          </h1>
        </div>
      </footer>
    </div>
  );
}
