import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function FaizurPortfolio() {
  const services = [
    "Website Design",
    "Mobile App Design",
    "Sass/Dashboard",
    "Consultant",
  ];

  const explore = ["All Projects", "Newsletter", "Contact"];

  return (
    <div className="w-full bg-[#F8F8F8] py-8 sm:py-12 md:py-16 px-4 sm:px-8 lg:px-12 flex justify-center font-sans antialiased select-text">
      {/* Outer Footer Container */}
      <footer className="w-full max-w-[1240px] bg-[#E7E7E7] rounded-[40px] overflow-hidden relative pt-12 sm:pt-16 px-6 sm:px-12 md:px-16 lg:px-20 pb-0">
        {/* Top Header Row (Brand & Contact Button) */}
        <div className="flex justify-between items-start gap-4">
          <h2
            className="text-[#080808] font-medium text-[26px] sm:text-[28px] leading-[1.12] tracking-[-0.01em]"
            style={{ fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif" }}
          >
            Your product<br />design partner
          </h2>

          <a
            href="https://ai.studio/apps/3a30febb-b24a-4b58-925a-0413fcf885cb"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[170px] sm:w-[210px] md:w-[230px] h-[58px] sm:h-[68px] md:h-[76px] rounded-full border-[2px] border-[#080808] bg-transparent text-[#080808] hover:bg-[#080808] hover:text-white transition-colors duration-200 flex items-center justify-center text-[32px] sm:text-[38px] md:text-[44px] font-normal leading-none -translate-y-[1px] cursor-pointer no-underline select-none"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
          >
            Contact
          </a>
        </div>

        {/* Four-Column Navigation & Interaction Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-8 lg:gap-x-10 gap-y-8 relative z-10">
          {/* Column 1 — Services */}
          <div>
            <h3
              className="text-[17px] font-medium text-[#080808] mb-3"
              style={{ fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif" }}
            >
              Services
            </h3>
            <ul className="space-y-[4px]">
              {services.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[13px] leading-[25px] text-[#666666] hover:text-[#080808] transition-colors duration-150 block"
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 — Explore */}
          <div>
            <h3
              className="text-[17px] font-medium text-[#080808] mb-3"
              style={{ fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif" }}
            >
              Explore
            </h3>
            <ul className="space-y-[4px]">
              {explore.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[13px] leading-[25px] text-[#666666] hover:text-[#080808] transition-colors duration-150 block"
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Say Hello! (Social Pills) */}
          <div>
            <h3
              className="text-[17px] font-medium text-[#080808] mb-3"
              style={{ fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif" }}
            >
              Say hello!
            </h3>
            <div className="flex flex-col gap-1.5">
              {/* Row 1: 𝕏 & Instagram */}
              <div className="flex flex-wrap items-center gap-1.5">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="rounded-full min-h-[25px] h-[25px] px-2.5 py-0.5 bg-[#F7F7F7] hover:bg-white transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 select-none no-underline cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#080808">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-[11.5px] font-medium text-[#222222] whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    @fazurrehman
                  </span>
                </a>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="rounded-full min-h-[25px] h-[25px] px-2.5 py-0.5 bg-[#F7F7F7] hover:bg-white transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 select-none no-underline cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span className="text-[11.5px] font-medium text-[#222222] whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    @fazurrehman
                  </span>
                </a>
              </div>

              {/* Row 2: Dribbble & YouTube */}
              <div className="flex flex-wrap items-center gap-1.5">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="rounded-full min-h-[25px] h-[25px] px-2.5 py-0.5 bg-[#F7F7F7] hover:bg-white transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 select-none no-underline cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EA4C89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
                    <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
                    <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
                  </svg>
                  <span className="text-[11.5px] font-medium text-[#222222] whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    @fazurrehman
                  </span>
                </a>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="rounded-full min-h-[25px] h-[25px] px-2.5 py-0.5 bg-[#F7F7F7] hover:bg-white transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 select-none no-underline cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#FF0000">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span className="text-[11.5px] font-medium text-[#222222] whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    @faizurrehman
                  </span>
                </a>
              </div>

              {/* Row 3: Figma */}
              <div className="flex items-center gap-1.5">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="rounded-full min-h-[25px] h-[25px] px-2.5 py-0.5 bg-[#F7F7F7] hover:bg-white transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 select-none no-underline cursor-pointer"
                >
                  <svg width="10" height="14" viewBox="0 0 38 57" fill="none">
                    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE" />
                    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83" />
                    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262" />
                    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E" />
                    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF" />
                  </svg>
                  <span className="text-[11.5px] font-medium text-[#222222] whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    @faizurrehman
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 4 — Creative Tools */}
          <div className="group cursor-pointer">
            <div className="flex items-center gap-1.5 mb-3">
              <h3
                className="text-[17px] font-medium text-[#080808]"
                style={{ fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif" }}
              >
                Creative tools
              </h3>
              <span className="w-4 h-4 rounded-full bg-[#080808] text-white flex items-center justify-center transition-transform group-hover:scale-110">
                <ArrowUpRight size={10} strokeWidth={2.5} />
              </span>
            </div>

            {/* Miniature Illustrated Mockup Artifact */}
            <div className="w-[88px] h-[64px] relative mt-2 select-none pointer-events-none">
              {/* Back Card: Light folder / sticker mockup */}
              <div className="w-[56px] h-[52px] bg-[#EAEAEA] border border-[#D5D5D5] rounded-lg rotate-[6deg] absolute right-1 top-1 shadow-sm p-1.5 flex flex-col justify-between">
                <div className="w-4 h-1 bg-[#F59E0B]/60 rounded-[1px] mx-auto -mt-2" />
                <div className="grid grid-cols-2 gap-1 mt-auto mx-auto pb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
                </div>
              </div>

              {/* Front Card: Tilted dark mobile mockup */}
              <div className="w-[42px] h-[58px] bg-[#1E1E1E] border border-[#333333] rounded-md -rotate-[10deg] absolute left-1 top-0 shadow-md p-1 flex flex-col justify-between">
                <div className="w-3 h-0.5 bg-neutral-600 rounded-full mx-auto" />
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 mx-auto my-auto" />
                <div className="w-4 h-0.5 bg-neutral-600 rounded-full mx-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Giant Cropped Bottom Typography ("faizur") */}
        <div className="w-full overflow-hidden flex justify-center items-end select-none pointer-events-none mt-8 sm:mt-12 lg:mt-16">
          <span
            className="text-[clamp(110px,19vw,280px)] font-black leading-[0.74] tracking-[-0.045em] text-[#080808] transform translate-y-[14%] whitespace-nowrap block"
            style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', 'Syne', system-ui, sans-serif" }}
          >
            faizur
          </span>
        </div>
      </footer>
    </div>
  );
}
