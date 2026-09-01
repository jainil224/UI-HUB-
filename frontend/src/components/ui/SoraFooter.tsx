import React from 'react';

const ARTWORK_URL =
  'https://res.cloudinary.com/chhwhdhk/image/upload/v1788285977/ChatGPT_Image_Sep_1_2026_11_36_03_PM_hz7yrh.png';

export default function SoraFooter() {
  return (
    <div className="relative w-full bg-[#050608] text-white font-sans antialiased overflow-hidden min-h-screen flex flex-col justify-between selection:bg-white/20 selection:text-white">
      {/* Film Grain / Noise Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-overlay"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* SINGLE CONTINUOUS 3D RIBBON ARTWORK (Spans top CTA down into the frosted glass footer) */}
      <div
        className="pointer-events-none select-none absolute right-0 top-0 bottom-0 w-[85%] sm:w-[70%] md:w-[60%] lg:w-[54%] xl:w-[48%] max-w-[800px] z-10 mix-blend-screen flex items-center justify-end"
        aria-hidden="true"
      >
        <img
          src={ARTWORK_URL}
          alt=""
          className="w-full h-auto max-h-[92%] object-contain object-right drop-shadow-[0_20px_60px_rgba(79,70,229,0.35)]"
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP CTA SECTION ("Ready to step in?")                                   */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[396px] md:min-h-[420px] pt-16 md:pt-[76px] pb-12 flex items-center z-20">
        {/* Content Container */}
        <div className="relative z-20 w-full max-w-[1380px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <p className="text-[13px] md:text-[14px] font-normal tracking-normal text-zinc-400 mb-3.5">
              Get Early Access
            </p>

            {/* Main Heading */}
            <h2 className="text-[42px] sm:text-[48px] md:text-[54px] lg:text-[58px] font-medium sm:font-semibold leading-[1.1] tracking-tight text-white mb-8">
              Ready to step in?
            </h2>

            {/* Interactive "Start Building" Reticle / Corner-Bracket Button */}
            <div>
              <button
                type="button"
                className="group relative inline-flex items-center justify-center px-6 py-2.5 rounded-sm bg-zinc-900/60 hover:bg-zinc-800/80 backdrop-blur-md text-white border border-white/10 text-[14px] font-medium tracking-wide transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.12)]"
              >
                {/* 4 Corner-Bracket Accents */}
                <span className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-white/70 group-hover:border-white transition-colors" />
                <span className="absolute -top-[1px] -right-[1px] w-2 h-2 border-t-2 border-r-2 border-white/70 group-hover:border-white transition-colors" />
                <span className="absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b-2 border-l-2 border-white/70 group-hover:border-white transition-colors" />
                <span className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-white/70 group-hover:border-white transition-colors" />
                Start Building
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. BOTTOM GLASS FOOTER CARD                                               */}
      {/* ========================================================================= */}
      <footer className="relative w-full bg-[#0c0e12]/80 backdrop-blur-2xl border-t border-white/[0.18] pt-12 md:pt-14 pb-8 overflow-hidden z-30">
        {/* Multi-Color Radial Atmospheric Lights under frosted glass */}
        <div
          className="pointer-events-none absolute right-16 top-0 w-72 h-72 rounded-full bg-[#14b8a6]/25 filter blur-[100px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-48 bottom-0 w-80 h-80 rounded-full bg-[#f59e0b]/20 filter blur-[90px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 bottom-4 w-96 h-96 rounded-full bg-[#4f46e5]/30 filter blur-[110px]"
          aria-hidden="true"
        />

        {/* Left Vignette Backdrop for Crisp Readability */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-full sm:w-[75%] lg:w-[62%] bg-gradient-to-r from-[#0c0e12]/98 via-[#0c0e12]/90 to-transparent z-10"
          aria-hidden="true"
        />

        {/* Main Content */}
        <div className="relative z-20 w-full max-w-[1380px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8">
            {/* Left Column: Brand, Tagline & Socials */}
            <div className="w-full lg:w-[48%] flex flex-col">
              {/* Brand Logo */}
              <div className="flex items-center">
                {/* Tri-prong / Asterisk Geometric SVG Icon */}
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-[22px] h-[22px] text-white shrink-0"
                  aria-hidden="true"
                >
                  <path d="M12 1.5a1 1 0 0 1 1 1v7.6l5.37-5.37a1 1 0 1 1 1.41 1.41L14.41 11.5h7.59a1 1 0 1 1 0 2h-7.6l5.38 5.38a1 1 0 0 1-1.42 1.41L13 14.91V22.5a1 1 0 1 1-2 0v-7.59l-5.37 5.38a1 1 0 0 1-1.41-1.42L9.59 13.5H2a1 1 0 1 1 0-2h7.6L4.22 6.13a1 1 0 0 1 1.41-1.41L11 10.09V2.5a1 1 0 0 1 1-1z" />
                </svg>
                <span className="text-[20px] font-medium tracking-tight text-white ml-2.5">
                  Sōra
                </span>
              </div>

              {/* Tagline */}
              <p className="text-[14px] leading-[22px] text-zinc-400 font-normal max-w-[390px] mt-3.5">
                The infrastructure that empowers the next generation of intelligent applications to
                run faster and deliver real results.
              </p>

              {/* Social Media Buttons (GitHub, X / Twitter, Reddit) */}
              <div className="flex items-center gap-2.5 mt-7">
                {/* GitHub */}
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label="GitHub"
                  className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.10] border border-white/[0.08] hover:border-white/[0.20] flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                </a>

                {/* X / Twitter */}
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label="X (Twitter)"
                  className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.10] border border-white/[0.08] hover:border-white/[0.20] flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Reddit */}
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label="Reddit"
                  className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.10] border border-white/[0.08] hover:border-white/[0.20] flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.56 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Column: Navigation Groups */}
            <div className="w-full lg:w-[52%] flex justify-start lg:justify-between lg:pl-16 lg:pr-12 gap-20 sm:gap-28 md:gap-36 mt-2 lg:mt-0">
              {/* Product Navigation */}
              <div>
                <h3 className="text-[13px] font-normal text-zinc-400 mb-3.5 select-none">
                  Product
                </h3>
                <ul className="space-y-[7px]">
                  {['Overview', 'Features', 'Roadmap', 'Integrations'].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-[14px] leading-[24px] text-zinc-300/90 hover:text-white transition-colors duration-150"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources Navigation */}
              <div>
                <h3 className="text-[13px] font-normal text-zinc-400 mb-3.5 select-none">
                  Resources
                </h3>
                <ul className="space-y-[7px]">
                  {['Blog', 'Help Center', 'Community', 'API Docs'].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-[14px] leading-[24px] text-zinc-300/90 hover:text-white transition-colors duration-150"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Hairline Divider */}
          <div className="w-full h-[1px] bg-white/[0.12] mb-6 mt-12 md:mt-14" />

          {/* Legal Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-[13px] text-zinc-400">
            {/* Copyright */}
            <div className="w-full lg:w-[48%]">
              <p className="select-none text-[13px] text-zinc-400">
                &copy; 2025 Sōra. All rights reserved.
              </p>
            </div>

            {/* Legal Links */}
            <div className="w-full lg:w-[52%] flex flex-wrap items-center lg:pl-16 gap-10 sm:gap-14 md:gap-16 lg:gap-20">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a
                  key={item}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-[13px] text-zinc-400 hover:text-white transition-colors duration-150"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
