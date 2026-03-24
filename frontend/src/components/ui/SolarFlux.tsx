"use client";

import React from "react";
import UnicornScene from "unicornstudio-react";

interface SolarFluxProps {
  className?: string;
  width?: string;
  height?: string;
  scale?: number;
  dpi?: number;
}

/**
 * Solar Flux - A premium 3D animation scene from Unicorn Studio
 * Featuring a dynamic, solar-inspired energy flow with fluid physics.
 */
export const SolarFlux: React.FC<SolarFluxProps> = ({
  className = "",
  width = "100%",
  height = "100%",
  scale = 1,
  dpi = 1.5,
}) => {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <UnicornScene
        projectId="Ggvd3bzTckuOoHts2anc"
        width={width}
        height={height}
        scale={scale}
        dpi={dpi}
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.5/dist/unicornStudio.umd.js"
      />
      
      {/* Premium Overlay / Branding (Matching UI-HUB style) */}
      <div className="absolute bottom-6 left-8 z-[80] pointer-events-none flex items-center gap-3 select-none opacity-60">
        <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]">
          <span className="text-orange-400 font-black text-xs">S</span>
        </div>
        <div className="flex flex-col">
          <span className="text-white font-black text-sm tracking-widest leading-none">SOLAR FLUX</span>
          <span className="text-orange-400 text-[8px] font-bold tracking-[0.3em] uppercase opacity-80">3D Design</span>
        </div>
      </div>
    </div>
  );
};

export default SolarFlux;
