import { useEffect, useState } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mql.matches);
    sync();
    if (mql.addEventListener) {
      mql.addEventListener("change", sync);
      return () => mql.removeEventListener("change", sync);
    }
    const legacy = mql as MediaQueryList & {
      addListener?: (l: () => void) => void;
      removeListener?: (l: () => void) => void;
    };
    legacy.addListener?.(sync);
    return () => legacy.removeListener?.(sync);
  }, []);

  return isMobile;
}
