import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface GraphicDesignerPortfolioProps {
  className?: string;
}

export default function GraphicDesignerPortfolio({ className = '' }: GraphicDesignerPortfolioProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { id: 'logos', label: 'Logos', href: '#logos' },
    { id: 'branding', label: 'Branding', href: '#branding' },
    { id: 'social-media', label: 'Social Media', href: '#social-media' },
    { id: 'print-design', label: 'Print Design', href: '#print-design' },
    { id: 'illustration', label: 'Illustration', href: '#illustration' },
  ];

  return (
    <main className={`relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#F7F6F2] selection:bg-[#1673E6] selection:text-white ${className}`}>
      {/* 1. Atmospheric Background & Tactile Paper Grain */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute inset-0 bg-[#F7F6F2]" />
        
        {/* Dark Royal Blue Top-Right Gradient */}
        <div
          className="absolute -top-[12%] -right-[8%] w-[58vw] min-w-[520px] h-[58vw] min-h-[520px] max-w-[950px] max-h-[950px] rounded-full"
          style={{
            background: `radial-gradient(circle at 88% 12%, rgba(2, 20, 61, 0.96) 0%, rgba(5, 30, 88, 0.92) 20%, rgba(9, 45, 125, 0.82) 36%, rgba(16, 70, 180, 0.58) 52%, rgba(24, 98, 220, 0.28) 66%, rgba(247, 246, 242, 0) 78%)`,
            filter: 'blur(70px)',
          }}
        />
        <div
          className="absolute -top-[2%] right-[2%] w-[42vw] min-w-[390px] h-[42vw] min-h-[390px] rounded-full"
          style={{
            background: `radial-gradient(circle at 80% 18%, rgba(1, 14, 45, 0.9) 0%, rgba(4, 25, 78, 0.72) 30%, rgba(10, 52, 145, 0.4) 52%, rgba(247, 246, 242, 0) 72%)`,
            filter: 'blur(90px)',
          }}
        />

        {/* Tactile Paper Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.045'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 2. Main Centered Composition */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center pt-24 sm:pt-28 md:pt-32 pb-16 px-4">
        <div
          className={`w-full max-w-5xl mx-auto flex flex-col items-center transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {/* Master Typography Lockup */}
          <div className="relative inline-flex flex-col items-start select-none">
            {/* Top Metadata Row: [ 2025 ] and Graphic Designer */}
            <div className="relative flex items-center gap-5 sm:gap-7 mb-2 sm:mb-2.5 ml-2 sm:ml-3 md:ml-4">
              <div className="inline-flex items-center justify-center border border-[#111111] rounded-[4px] px-2 h-[22px] bg-transparent">
                <span className="font-mono text-[13px] md:text-[14px] leading-none text-[#111111] font-normal tracking-[0.15em] pl-[0.15em]">
                  2025
                </span>
              </div>
              <span className="font-sans text-[12px] md:text-[13px] leading-none text-[#111111] font-normal tracking-[0.12em]">
                Graphic Designer
              </span>
            </div>

            {/* Title Lockup */}
            <div className="relative inline-flex items-center">
              <h1 className="sr-only">Portfolio - Sony palli Graphic Designer 2025</h1>
              <div
                className="relative flex items-center font-sans font-bold text-[62px] sm:text-[76px] md:text-[88px] lg:text-[96px] leading-[0.95] tracking-[-0.035em] text-[#111111]"
                aria-hidden="true"
              >
                {/* Layer 1: Calligraphic Blue Script 'P' */}
                <div
                  className="absolute select-none pointer-events-none z-20"
                  style={{ top: '-20px', left: '-58px', transform: 'rotate(-4deg)' }}
                >
                  <svg width="130" height="145" viewBox="0 0 130 145" fill="none" className="w-[96px] h-[108px] sm:w-[114px] sm:h-[128px] md:w-[126px] md:h-[140px]">
                    <path d="M 58 22 C 54 44 47 76 38 104 C 34 116 30 126 25 128 C 21 129 18 124 20 114 C 23 100 30 82 37 62" stroke="#1673E6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 22 56 C 26 42 38 24 55 14 C 70 5 91 5 106 12 C 118 18 124 30 122 42 C 119 56 106 67 90 70 C 71 73 54 68 44 57" stroke="#1673E6" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 32 46 C 44 28 62 14 86 12 C 104 11 117 21 116 36 C 114 49 101 60 84 62 C 65 64 52 56 46 51" stroke="#1673E6" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
                    <path d="M 55 26 C 52 48 45 78 37 106 C 34 116 31 123 27 125" stroke="#126FE8" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                  </svg>
                </div>

                {/* Layer 2: Geometric Black 'ortfolio' */}
                <span className="relative z-10 pl-7 sm:pl-9 md:pl-11 tracking-[-0.035em]">
                  ortfolio
                </span>

                {/* Layer 3: Calligraphic Blue Script Name 'Sony palli' */}
                <div
                  className="absolute select-none pointer-events-none z-20"
                  style={{ bottom: '-28px', right: '-38px', transform: 'rotate(-4.5deg)' }}
                >
                  <svg width="260" height="84" viewBox="0 0 260 84" fill="none" className="w-[195px] h-[64px] sm:w-[225px] sm:h-[72px] md:w-[255px] md:h-[82px]">
                    <path d="M 12 40 C 10 32 14 19 23 15 C 29 12 36 15 35 22 C 34 32 23 38 18 45 C 13 51 17 56 24 56 C 32 56 39 49 45 38" stroke="#1673E6" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 44 40 C 47 33 55 30 60 33 C 65 36 65 44 60 48 C 55 51 48 49 46 42 C 45 38 50 34 58 34" stroke="#1673E6" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 60 35 C 64 43 68 50 70 50 C 73 50 77 38 82 34 C 86 31 90 35 91 43 C 92 48 94 50 97 48" stroke="#1673E6" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 97 36 C 99 42 101 48 105 48 C 108 48 113 40 117 34 M 117 34 L 108 61 C 105 69 98 75 90 76 C 77 77 60 74 44 70 C 28 66 18 64 8 67" stroke="#1673E6" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 132 49 L 138 27 C 139 23 141 22 143 24 C 145 27 141 38 136 57 C 134 64 132 68 130 69 M 137 38 C 142 32 149 31 153 35 C 156 39 155 46 151 50 C 146 53 140 51 138 46" stroke="#1673E6" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 163 36 C 158 35 153 40 154 46 C 155 50 160 52 165 49 C 169 46 170 41 170 35 L 170 49 C 170 51 172 52 176 50" stroke="#1673E6" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 176 50 C 180 44 185 30 190 18 C 193 10 197 10 197 14 C 196 21 191 39 188 50 C 188 52 190 52 193 49" stroke="#1673E6" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 193 49 C 197 42 202 28 207 17 C 210 10 214 9 214 14 C 213 22 207 41 205 50 C 205 52 207 52 211 48" stroke="#1673E6" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 211 48 C 214 44 218 38 221 35 L 219 49 C 219 52 223 53 229 48" stroke="#1673E6" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="223" cy="27" r="2.4" fill="#1673E6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <nav aria-label="Portfolio Categories" className="w-full max-w-[820px] mx-auto px-4 mt-16 md:mt-24 select-none">
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center md:justify-between gap-y-6 gap-x-8 sm:gap-x-10 md:gap-x-12 w-full">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={cat.href}
                  className="group inline-flex flex-col items-start cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1673E6] rounded-xs transition-opacity duration-300"
                >
                  <div className="flex items-center gap-1.5 pb-1">
                    <span className="text-[#111111] transition-transform duration-300 ease-out group-hover:translate-x-[2.5px] group-hover:-translate-y-[2.5px] will-change-transform flex items-center justify-center">
                      <ArrowUpRight size={13} strokeWidth={1.75} className="stroke-[#111111]" />
                    </span>
                    <span className="font-sans text-[13px] md:text-[13.5px] font-normal tracking-[0.03em] text-[#111111] transition-opacity duration-300 group-hover:opacity-75 whitespace-nowrap">
                      {cat.label}
                    </span>
                  </div>
                  <div className="w-full h-[1px] bg-[#111111] transition-transform duration-300 ease-out origin-left group-hover:scale-x-105" />
                </a>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </main>
  );
}