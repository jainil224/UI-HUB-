import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Hands a wheel gesture over to the page when a nested scroll container has
 * reached its boundary.
 *
 * Native scroll chaining is not reliable here: the app shell sets
 * `overflow-x: clip`, and Chrome stops chaining *downward* out of a scroll
 * container nested under a clip box. The result is a dead strip — the sidebar
 * looks frozen at its last item. We therefore do the boundary hand-off
 * explicitly.
 */
export function useScrollChainBoundary(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const delta = event.deltaY;
      if (delta === 0) return;

      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) return;
      const atEnd = delta > 0 ? el.scrollTop >= max - 1 : el.scrollTop <= 1;
      if (!atEnd) return;

      event.preventDefault();
      event.stopPropagation();
      window.scrollBy({ top: delta, left: 0, behavior: "auto" });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [ref]);
}