import gsap from "gsap";
import Image from "next/image";
import { useEffect } from "react";

import { usePortalStore, useScrollStore } from "@stores";

export const ScrollHint = () => {
  const portal = usePortalStore((state) => state.activePortalId);
  const scrollProgress = useScrollStore((state) => state.scrollProgress);

  // Show 'Scroll' for Hero and work portals, 'Pan' for Projects portal.
  let hintText = '';
  let showScrollHint = false;
  if (!portal) {
    hintText = 'SCROLL';
    showScrollHint = scrollProgress === 0;
  } else if (portal === 'work') {
    hintText = 'SCROLL';
    showScrollHint = scrollProgress === 0;
  } else {
    hintText = 'PAN';
    showScrollHint = true;
  }

  useEffect(() => {
    if (showScrollHint) {
      gsap.to('.scroll-hint', {
        opacity: 1,
        duration: 1.5,
        delay: 1.5,
      });
    } else {
      gsap.killTweensOf('.scroll-hint');
      gsap.to('.scroll-hint', {
        opacity: 0,
        duration: 0.5,
      });
    }
  }, [showScrollHint]);

  const svgSrc = hintText === 'PAN' ? 'icons/chevrons-left-right.svg' : 'icons/chevrons-up-down.svg';

  return (
    <div className="fixed w-full bottom-5 scroll-hint" style={{ opacity: 0 }}>
      <div className="flex items-center justify-center animate-pulse">
        { showScrollHint }
        <Image src={svgSrc} width={18} height={18} alt="night mode" loading="lazy" />
        <span className="text-white">{hintText}</span>
      </div>
    </div>
  );
}