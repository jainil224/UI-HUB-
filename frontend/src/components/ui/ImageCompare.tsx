"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

export interface ImageSource {
  src: string;
  alt?: string;
}

export interface ImageCompareProps {
  before?: ImageSource;
  after?: ImageSource;
  initialPosition?: number;
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
  labelBefore?: string;
  labelAfter?: string;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  onPositionChange?: (pos: number) => void;
}

export const IMAGE_COMPARE_DEFAULTS = {
  before: {
    src: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=80",
    alt: "Abstract before edit",
  },
  after: {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80",
    alt: "Abstract after edit",
  },
  initialPosition: 50,
  orientation: "horizontal",
  showLabels: true,
  labelBefore: "Before",
  labelAfter: "After",
  ariaLabel: "Before and after image comparison",
} as const;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export function ImageCompare({
  before = IMAGE_COMPARE_DEFAULTS.before,
  after = IMAGE_COMPARE_DEFAULTS.after,
  initialPosition = 50,
  orientation = "horizontal",
  showLabels = true,
  labelBefore = "Before",
  labelAfter = "After",
  ariaLabel = IMAGE_COMPARE_DEFAULTS.ariaLabel,
  className = "",
  style,
  onPositionChange,
}: ImageCompareProps) {
  const reduce = useReducedMotion();
  const isHorizontal = orientation === "horizontal";
  const initial = clamp(initialPosition, 0, 100);

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const posRef = React.useRef<number>(initial);
  const pos = useSpring(initial, { stiffness: 900, damping: 55 });

  const setPos = (next: number): void => {
    posRef.current = next;
    if (reduce) pos.jump(next);
    else pos.set(next);
  };

  React.useEffect(() => {
    setPos(clamp(initialPosition, 0, 100));
  }, [initialPosition]);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const unsub = pos.on("change", (value: number) => {
      const rounded = Math.round(value);
      if (wrap) wrap.setAttribute("aria-valuenow", String(rounded));
      if (onPositionChange) onPositionChange(rounded);
    });
    return () => unsub();
  }, [pos, onPositionChange]);

  const apply = (clientX: number, clientY: number): void => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const ratio =
      rect.width > 0 && rect.height > 0
        ? isHorizontal
          ? (clientX - rect.left) / rect.width
          : (clientY - rect.top) / rect.height
        : 0.5;
    setPos(clamp(ratio * 100, 0, 100));
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    apply(event.clientX, event.clientY);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const step = event.shiftKey ? 10 : 5;
    let next: number | null = null;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = clamp(posRef.current - step, 0, 100);
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = clamp(posRef.current + step, 0, 100);
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = 100;
    }
    if (next === null) return;
    event.preventDefault();
    setPos(next);
  };

  const revealClip = useTransform(pos, (value: number) =>
    isHorizontal
      ? `inset(0 ${100 - value}% 0 0)`
      : `inset(0 0 ${100 - value}% 0)`
  );
  const dividerOffset = useTransform(pos, (value: number) => `${value}%`);

  return (
    <div
      ref={wrapRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(initial)}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
      draggable={false}
      className={`relative overflow-hidden select-none touch-none ${
        isHorizontal ? "cursor-ew-resize" : "cursor-ns-resize"
      } ${className}`}
      style={{ aspectRatio: "16 / 10", ...style }}
    >
      <img
        src={after.src}
        alt={after.alt ?? labelAfter}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <motion.div style={{ clipPath: revealClip }} className="absolute inset-0">
        <img
          src={before.src}
          alt={before.alt ?? labelBefore}
          draggable={false}
          className="h-full w-full object-cover"
        />
        {showLabels && (
          <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
            {labelBefore}
          </span>
        )}
      </motion.div>
      <motion.div
        aria-hidden="true"
        style={
          isHorizontal
            ? { left: dividerOffset, x: "-50%" }
            : { top: dividerOffset, y: "-50%" }
        }
        className={`absolute ${
          isHorizontal ? "inset-y-0 w-[2px]" : "inset-x-0 h-[2px]"
        } bg-white/90 shadow-[0_0_10px_0_rgba(61,92,255,0.6)]`}
      >
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-neutral-900 shadow-lg">
          {isHorizontal ? "↔" : "↕"}
        </span>
      </motion.div>
      {showLabels && (
        <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
          {labelAfter}
        </span>
      )}
    </div>
  );
}

export default ImageCompare;
