import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function InteriorDesignShowcase() {
  const featureCards = [
    {
      id: 'card-handcrafted-quality',
      title: 'Handcrafted Quality',
      description: 'Each piece is made by skilled artisans using premium rgiht crafts, using sustainable materials.',
    },
    {
      id: 'card-timeless-design',
      title: 'Timeless Design',
      description: 'Clean lines and classic forms that complement any space, any style.',
    },
    {
      id: 'card-built-to-last',
      title: 'Built to Last',
      description: 'Durable construction and thoughtful details ensure years of everyday use.',
    },
    {
      id: 'card-seamless-delivery',
      title: 'Seamless Delivery',
      description: 'White-glove delivery and easy setup, right to your door—no stress, no hassle.',
    },
  ];

  return (
    <main
      id="main-showcase"
      className="min-h-screen lg:h-screen lg:max-h-screen w-full bg-[#FFFFFF] text-[#252525] flex flex-col justify-between selection:bg-[#B2C951]/30 overflow-x-hidden"
    >
      {/* Centered Max-Width Container */}
      <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 py-5 sm:py-6 lg:py-6 xl:py-8 flex-1 flex flex-col justify-between">
        
        {/* Main Two-Column Hero with balanced, full-width responsive proportions */}
        <section
          id="hero-section"
          className="w-full max-w-[1160px] xl:max-w-[1260px] 2xl:max-w-[1360px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8 my-auto pt-1"
        >
          {/* LEFT CONTENT COLUMN */}
          <div className="w-full max-w-[460px] xl:max-w-[490px] flex flex-col items-start text-left z-10">
            {/* Top refined serif label */}
            <p
              id="hero-label"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
              className="text-[#222222] text-[16px] sm:text-[17px] xl:text-[18px] font-normal tracking-wide mb-2.5 select-none"
            >
              Elevate Your Home, Effortlessly
            </p>

            {/* Main Headline (Exactly three lines with mixed serif/sans) */}
            <h1
              id="hero-heading"
              style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
              className="text-[#222222] text-[48px] sm:text-[54px] lg:text-[56px] xl:text-[62px] 2xl:text-[64px] leading-[0.95] tracking-[-0.035em] font-extrabold flex flex-col items-start select-none"
            >
              <span className="block">Design That</span>
              <span className="block mt-0.5">
                <span 
                  style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
                  className="italic font-normal tracking-tight text-[52px] sm:text-[58px] lg:text-[62px] xl:text-[68px] 2xl:text-[70px] mr-2"
                >
                  Lives
                </span>
                <span>With</span>
              </span>
              <span className="block mt-0.5">You</span>
            </h1>

            {/* Description Text */}
            <p
              id="hero-description"
              style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
              className="mt-6 text-[#555555] text-[12.5px] sm:text-[13px] xl:text-[13.5px] leading-[19px] xl:leading-[20px] max-w-[410px] xl:max-w-[435px] font-normal tracking-normal"
            >
              Timeless pieces, crafted with care and built to elevate your everyday spaces. Discover furniture that blends comfort, functionality, and refined aesthetics—made to last a lifetime.
            </p>

            {/* Pill Purchase Control */}
            <div
              id="purchase-control"
              className="mt-7 xl:mt-8 inline-flex items-center bg-[#EEEEEE] h-[43px] rounded-full p-[4.5px] pr-4 gap-3 select-none transition-transform active:scale-[0.99]"
            >
              {/* Black inner pill button with "Shop now" and white arrow circle */}
              <button
                id="btn-shop-now"
                type="button"
                className="h-[34px] bg-[#050505] hover:bg-[#1a1a1a] text-white rounded-full pl-3.5 pr-1 flex items-center gap-2 transition-colors cursor-pointer group"
                aria-label="Shop now for $599"
              >
                <span className="text-[12px] font-medium tracking-tight">Shop now</span>
                <span className="w-[28px] h-[28px] rounded-full bg-white text-[#050505] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </button>

              {/* Price display inside container */}
              <span
                id="product-price"
                className="text-[#151515] text-[12px] sm:text-[12.5px] font-bold tracking-tight"
              >
                $599
              </span>
            </div>
          </div>

          {/* RIGHT PRODUCT DISPLAY (Green vertical panel + overlapping modular chair) */}
          <div className="flex-shrink-0 flex justify-center items-center relative mt-6 lg:mt-0">
            {/* The Green Rounded Rectangle Container */}
            <div
              id="product-showcase-panel"
              className="relative w-[285px] sm:w-[305px] lg:w-[315px] xl:w-[340px] 2xl:w-[355px] h-[395px] sm:h-[415px] lg:h-[425px] xl:h-[455px] 2xl:h-[475px] bg-[#B2C951] rounded-[26px] sm:rounded-[28px] xl:rounded-[32px] flex items-center justify-center shadow-none select-none"
            >
              {/* Overlapping Product Image */}
              <div
                id="product-image-wrapper"
                className="absolute w-[400px] sm:w-[440px] lg:w-[465px] xl:w-[505px] 2xl:w-[530px] -left-[80px] sm:-left-[95px] lg:-left-[105px] xl:-left-[120px] 2xl:-left-[130px] top-[50%] -translate-y-[50%] pointer-events-none z-10 flex items-center justify-center"
              >
                <img
                  id="product-showcase-image"
                  src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788399032/013ede30-542d-4a45-a9f1-5a48fad37592_wvscrb.png"
                  alt="Featured furniture piece"
                  className="w-full h-auto object-contain select-none filter drop-shadow-sm"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM FEATURE CARDS */}
        <section
          id="feature-cards-section"
          className="mt-4 sm:mt-6 lg:mt-4 pt-2 flex justify-center w-full"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 xl:gap-5 max-w-[1000px] xl:max-w-[1140px] 2xl:max-w-[1240px] w-full mx-auto">
            {featureCards.map((card) => (
              <div
                key={card.id}
                id={card.id}
                className="bg-[#EEEEEE] rounded-[16px] xl:rounded-[18px] p-3.5 sm:p-4 xl:p-4.5 min-h-[80px] sm:min-h-[84px] xl:min-h-[90px] flex flex-col justify-start text-left select-none transition-colors hover:bg-[#EAEAEA]"
              >
                <h2 className="text-[#222222] text-[11.5px] sm:text-[12px] xl:text-[12.5px] font-bold tracking-tight leading-tight mb-1">
                  {card.title}
                </h2>
                <p className="text-[#555555] text-[9px] sm:text-[9.5px] xl:text-[10px] leading-[13px] xl:leading-[14px] font-normal">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
