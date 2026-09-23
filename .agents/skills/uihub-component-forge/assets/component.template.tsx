// ─────────────────────────────────────────────
// ComponentName  —  TODO: one-line purpose
// Props:  TODO: name: type (default) — purpose
//         (one line per prop; copy the §7 props contract)
// Aliases: TODO: legacyProp→newProp (kept for back-compat) or "none"
// ─────────────────────────────────────────────
//
// Blueprint: references/04-component-anatomy.md. TODO markers below mark the
// required lifecycle pieces. Replace every TODO; delete unused blocks.

import React, { useEffect, useRef } from 'react';

// TODO: keep props shallow + flat; never `any`; no unbounded nested objects.
const DEFAULT_PROPS = {
  // TODO: real typed defaults, e.g. speed: 0.5,
};

type Props = Partial<typeof DEFAULT_PROPS> & {
  // TODO: reserved wrapper escape hatch — do not also invent `className` unless
  // following the `extends HTMLAttributes` pattern.
  style?: React.CSSProperties;
};

export default function ComponentName(props: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();
  const sizeVersionRef = useRef(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // TODO: init simulation/GL state + caches.

    const ro = new ResizeObserver(() => {
      // TODO: read wrapper size, cap DPR at <= 2 (1.5 above 1920px),
      // size the backing store, and bump sizeVersionRef (re-init by revision,
      // not by rebuilding every frame).
      sizeVersionRef.current++;
    });
    ro.observe(wrapper);

    const frame = (time: number) => {
      // TODO: draw. Zero setState here; update DOM/CSS via refs only.
      animRef.current = requestAnimationFrame(frame);
    };

    if (reduceMotion) {
      // TODO: render one static frame and do not start the loop.
    } else {
      animRef.current = requestAnimationFrame(frame);
    }

    return () => {
      // TODO: cancelAnimationFrame(animRef.current);
      // remove every addEventListener added above;
      ro.disconnect();
      // TODO: delete GPU resources (gl.deleteBuffer/program) if WebGL.
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{ width: '100%', height: '100%', ...(props.style ?? {}) }}
    >
      {/* TODO: canvas tier -> <canvas ref={canvasRef} /> ; DOM/motion tier -> markup */}
      <canvas ref={canvasRef} />
    </div>
  );
}
