import React from 'react';

export const FeatureBar: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-[#EAEAEA]">
      <div className="w-full max-w-7xl mx-auto">
        <div className="w-full bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 select-none">
          {/* Column 1: GET STARTED button */}
          <div className="flex items-center justify-center p-3.5 sm:p-4 border-b sm:border-r lg:border-b-0 border-[#EAEAEA]">
            <button
              type="button"
              className="h-[32px] sm:h-[30px] w-[120px] sm:w-[112px] rounded-full bg-[#0A0A0A] text-white text-[10px] sm:text-[9.5px] font-bold tracking-[0.08em] uppercase flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.12)] hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
            >
              GET STARTED
            </button>
          </div>

          {/* Column 2: A WORLD OF POSSIBILITIES */}
          <div className="group flex items-center gap-3 p-3.5 sm:p-4 border-b sm:border-r-0 lg:border-r lg:border-b-0 border-[#EAEAEA] hover:bg-[#FAFAFA] transition-colors cursor-pointer">
            <div className="w-9 h-9 shrink-0 rounded-[8px] border border-[#E5E5E5] bg-white flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] group-hover:border-[#CCCCCC] transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#0A0A0A" strokeWidth="1.2">
                <circle cx="6" cy="12" r="1.8" fill="#0A0A0A" />
                <circle cx="18" cy="6" r="1.8" fill="#0A0A0A" />
                <circle cx="18" cy="18" r="1.8" fill="#0A0A0A" />
                <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="1.2" />
                <path d="M6 12H12M12 12V6M12 12V18M12 6H18M12 18H18" stroke="#0A0A0A" strokeWidth="1.2" />
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#E5E5E5" strokeWidth="0.75" strokeDasharray="2 2" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8.5px] sm:text-[9px] lg:text-[8.5px] font-bold tracking-[0.05em] text-[#0A0A0A] uppercase flex items-center gap-1 group-hover:text-black">
                A WORLD OF POSSIBILITIES <span className="text-[7.5px] font-normal text-[#555555] group-hover:translate-x-0.5 transition-transform">&gt;</span>
              </span>
              <p className="mt-0.5 text-[7.5px] sm:text-[8px] lg:text-[7.5px] text-[#707070] leading-[1.35] max-w-[220px]">
                Discover our advanced manufacturing materials and technologies.
              </p>
            </div>
          </div>

          {/* Column 3: QUALITY THAT YOU CAN TRUST */}
          <div className="group flex items-center gap-3 p-3.5 sm:p-4 border-b sm:border-b-0 sm:border-r lg:border-r border-[#EAEAEA] hover:bg-[#FAFAFA] transition-colors cursor-pointer">
            <div className="w-9 h-9 shrink-0 rounded-[8px] border border-[#E5E5E5] bg-white flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] group-hover:border-[#CCCCCC] transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#0A0A0A" strokeWidth="1.2">
                <rect x="5" y="5" width="14" height="14" rx="2" stroke="#E5E5E5" strokeWidth="0.75" strokeDasharray="2 2" />
                <path d="M5 19L19 5" stroke="#0A0A0A" strokeWidth="1.2" />
                <circle cx="8" cy="16" r="1.8" fill="#0A0A0A" />
                <circle cx="16" cy="8" r="1.8" fill="#0A0A0A" />
                <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="1.2" />
                <path d="M12 9V15M9 12H15" stroke="#0A0A0A" strokeWidth="0.8" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8.5px] sm:text-[9px] lg:text-[8.5px] font-bold tracking-[0.05em] text-[#0A0A0A] uppercase flex items-center gap-1 group-hover:text-black">
                QUALITY THAT YOU CAN TRUST <span className="text-[7.5px] font-normal text-[#555555] group-hover:translate-x-0.5 transition-transform">&gt;</span>
              </span>
              <p className="mt-0.5 text-[7.5px] sm:text-[8px] lg:text-[7.5px] text-[#707070] leading-[1.35] max-w-[220px]">
                Explore our industrial-grade parts and advanced specification options.
              </p>
            </div>
          </div>

          {/* Column 4: GET YOUR PARTS FASTER */}
          <div className="group flex items-center gap-3 p-3.5 sm:p-4 hover:bg-[#FAFAFA] transition-colors cursor-pointer">
            <div className="w-9 h-9 shrink-0 rounded-[8px] border border-[#E5E5E5] bg-white flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] group-hover:border-[#CCCCCC] transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#0A0A0A" strokeWidth="1.2">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="#E5E5E5" strokeWidth="0.75" strokeDasharray="2 2" />
                <path d="M6 18L12 12L18 6" stroke="#0A0A0A" strokeWidth="1.2" />
                <path d="M12 12L18 18" stroke="#0A0A0A" strokeWidth="1.2" />
                <circle cx="6" cy="18" r="1.8" fill="#0A0A0A" />
                <circle cx="18" cy="6" r="1.8" fill="#0A0A0A" />
                <circle cx="18" cy="18" r="1.8" fill="#0A0A0A" />
                <circle cx="12" cy="12" r="2" fill="#0A0A0A" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8.5px] sm:text-[9px] lg:text-[8.5px] font-bold tracking-[0.05em] text-[#0A0A0A] uppercase flex items-center gap-1 group-hover:text-black">
                GET YOUR PARTS FASTER <span className="text-[7.5px] font-normal text-[#555555] group-hover:translate-x-0.5 transition-transform">&gt;</span>
              </span>
              <p className="mt-0.5 text-[7.5px] sm:text-[8px] lg:text-[7.5px] text-[#707070] leading-[1.35] max-w-[220px]">
                Industrial-grade parts, fast delivery: 6 business days max.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function Partify() {
  return (
    <main className="min-h-screen w-full bg-[#FBFBFB] flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Industrial Hero Showcase / Context Area */}
      <div className="w-full flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-medium text-neutral-700 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          On-Demand Industrial Manufacturing Platform
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-4">
          PARTIFY PRECISION
        </h1>
        
        <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto mb-8 leading-relaxed">
          Upload 3D CAD files for instant quoting, DFM analysis, and custom production across CNC machining, 3D printing, and sheet metal fabrication.
        </p>

        {/* CAD Blueprint Mockup Frame */}
        <div className="w-full max-w-2xl bg-white border border-[#EAEAEA] rounded-xl shadow-sm p-6 flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(#EAEAEA_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
          <div className="relative z-10 flex flex-col items-center gap-3 text-neutral-400 py-8">
            <svg viewBox="0 0 24 24" className="w-12 h-12 stroke-neutral-400" fill="none" strokeWidth="1">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs uppercase tracking-widest font-mono text-neutral-500">
              Interactive 3D CAD Stage • STEP / IGES / STL
            </span>
          </div>
        </div>
      </div>

      {/* The 4-Column Feature Bar Footer */}
      <FeatureBar />
    </main>
  );
}
