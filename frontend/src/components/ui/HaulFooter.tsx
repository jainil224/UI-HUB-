import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Facebook, Twitter, Instagram, Linkedin, ChevronDown } from "lucide-react";

const linkGroups = {
  Company: ["Founding", "Platform", "Testify"],
  Mobile: ["Get Apple App", "Get Google App"],
  Contracts: ["Private Data", "User Consent"],
};

const socials = [
  { Icon: Facebook, label: "Facebook" },
  { Icon: Twitter, label: "Twitter" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Linkedin, label: "LinkedIn" },
];

export default function HaulFooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const truckY = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] font-sans text-neutral-900 select-text overflow-x-hidden flex flex-col">
      {/* Top spacer section with "View Below" prompt */}
      <div className="flex flex-col h-[35vh] sm:h-[42vh] md:h-[48vh] items-center justify-center bg-[#FDFDFD] px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <p className="text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.45em] sm:tracking-[0.55em] text-neutral-400">
            View Below
          </p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="text-neutral-300"
          >
            <ChevronDown size={20} strokeWidth={2.5} />
          </motion.div>
        </motion.div>
      </div>

      {/* Main full-viewport parallax container */}
      <section
        ref={containerRef}
        className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260430_115327_3f256636-9e63-4885-8d0b-09317dc2b0a5.png&w=1280&q=85)",
        }}
      >
        {/* Subtle top shadow gradient over the highway */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/25 via-black/10 to-transparent pointer-events-none z-10" />

        {/* Top-aligned footer card */}
        <div className="relative z-30 w-full pt-8 sm:pt-12 md:pt-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="overflow-hidden rounded-2xl md:rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border border-white/80"
            >
              {/* Footer content - top half */}
              <div className="flex flex-col gap-8 p-6 sm:p-8 md:p-10 md:flex-row md:items-start md:justify-between">
                {/* Logo area */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl bg-orange-500 p-2.5 shadow-inner shrink-0">
                    <svg
                      viewBox="0 0 256 256"
                      fill="white"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-full w-full"
                    >
                      <path d="M 228 0 C 172.772 0 128 44.772 128 100 L 128 0 L 0 0 L 0 28 C 0 83.228 44.772 128 100 128 L 0 128 L 0 256 L 28 256 C 83.228 256 128 211.228 128 156 L 128 256 L 256 256 L 256 228 C 256 172.772 211.228 128 156 128 L 256 128 L 256 0 Z" />
                    </svg>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 font-heading">
                    HAUL!
                  </span>
                </div>

                {/* Links area */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10 md:gap-14 lg:gap-20">
                  {Object.entries(linkGroups).map(([group, items]) => (
                    <div key={group} className="space-y-3">
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-900">
                        {group}
                      </h3>
                      <ul className="space-y-2.5">
                        {items.map((item) => (
                          <li key={item}>
                            <a
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              className="text-xs sm:text-sm font-medium text-gray-500 transition-colors hover:text-orange-600"
                            >
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer content - bottom bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 bg-white px-6 py-4 sm:px-8 gap-3">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  © 2026 HAUL! All Rights Reserved
                </p>
                <div className="flex items-center gap-2">
                  {socials.map(({ Icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      aria-label={label}
                      className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all duration-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                    >
                      <Icon className="h-4 w-4 md:h-4.5 md:w-4.5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Truck foreground layer - positioned at the bottom without obscuring the top card */}
        <motion.div
          style={{ y: truckY }}
          className="pointer-events-none relative z-20 w-full flex justify-center items-end mt-auto h-[40vh] sm:h-[48vh] md:h-[54vh] max-h-[520px]"
        >
          <img
            src="https://roof-wish-40038865.figma.site/_components/v2/f31fd17907ce60745d45e83a61d44fd3810d5f25/truck_1.8c4bff83.png"
            alt="HAUL! truck"
            className="h-full w-auto max-w-full origin-bottom object-contain object-bottom drop-shadow-2xl"
          />
        </motion.div>
      </section>
    </div>
  );
}
