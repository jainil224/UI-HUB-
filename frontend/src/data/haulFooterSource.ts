export const HAUL_FOOTER_SOURCE = `import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

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
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [-50, 150]);

  return (
    <div className="bg-[#f8f9fa] font-sans select-text">
      {/* Top spacer - 50vh on mobile/lg, 30vh on md */}
      <div className="flex h-[50vh] items-center justify-center bg-[#FDFDFD] md:h-[30vh] lg:h-[50vh]">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-[13px] font-bold uppercase tracking-[0.5em] text-gray-300"
        >
          View Below
        </motion.p>
      </div>

      {/* Main full-viewport parallax container */}
      <section
        ref={containerRef}
        className="relative h-screen overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260430_115327_3f256636-9e63-4885-8d0b-09317dc2b0a5.png&w=1280&q=85)",
        }}
      >
        {/* Top-aligned footer card */}
        <div className="absolute top-0 w-full pt-12 md:pt-24 z-30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="overflow-hidden rounded-2xl bg-white/95 shadow-xl backdrop-blur-sm md:rounded-3xl"
            >
              {/* Footer content - top half */}
              <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-start md:justify-between">
                {/* Logo area */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 p-2 shadow-inner md:h-12 md:w-12">
                    <svg viewBox="0 0 256 256" fill="white" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                      <path d="M 228 0 C 172.772 0 128 44.772 128 100 L 128 0 L 0 0 L 0 28 C 0 83.228 44.772 128 100 128 L 0 128 L 0 256 L 28 256 C 83.228 256 128 211.228 128 156 L 128 256 L 256 256 L 256 228 C 256 172.772 211.228 128 156 128 L 256 128 L 256 0 Z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold tracking-tighter text-gray-900 md:text-3xl">HAUL!</span>
                </div>

                {/* Links area */}
                <div className="flex flex-1 flex-col gap-8 md:flex-row md:justify-end md:gap-16">
                  {Object.entries(linkGroups).map(([group, items]) => (
                    <div key={group}>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">{group}</h3>
                      <ul className="mt-4 space-y-3">
                        {items.map((item) => (
                          <li key={item}>
                            <a href="#" onClick={(e) => e.preventDefault()} className="text-sm font-medium text-gray-500 transition-colors hover:text-orange-600">
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
              <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4 sm:px-8">
                <p className="text-sm font-medium text-gray-500">© 2026 HAUL! All Rights Reserved</p>
                <div className="flex gap-2">
                  {socials.map(({ Icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 text-gray-500 transition-all duration-300 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Truck foreground parallax layer */}
        <motion.div style={{ y }} className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_100%)]">
          <img
            src="https://roof-wish-40038865.figma.site/_components/v2/f31fd17907ce60745d45e83a61d44fd3810d5f25/truck_1.8c4bff83.png"
            alt="HAUL! truck"
            className="h-full w-full origin-bottom object-contain object-bottom scale-[1.5] sm:scale-110 md:scale-[2.0] lg:scale-105"
          />
        </motion.div>
      </section>
    </div>
  );
}
`;
