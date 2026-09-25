"use client";

import * as React from "react";

export interface ImageSource {
  src: string;
  alt?: string;
}

export interface ImageLensProps {
  image?: ImageSource;
  zoom?: number;
  lensSize?: number;
  cornerRadius?: number;
  borderColor?: string;
  followSmoothing?: number;
  alwaysOn?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const IMAGE_LENS_DEFAULTS = {
  image: {
    src: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhgdlK_t9PuM-cL0d0u03TPsuCFsodxo0gcRXGkimXwMrpTG2yKJmthJeVqGQLCSypPCsFOd01AoiJ7tLYHUd9YNB83WaEFtrp__JkADrye-K_vrbwqyrw9_AEjWiTjD4vey5y20CVLC9YhYcW8_YU9FeEu3Z0Lr3w5twYsX03O61vdjg6NEUHfSr0ywbI/s1272/blue-lava-pours.jpg",
    alt: "Blue lava pours",
  },
  zoom: 3,
  lensSize: 160,
  cornerRadius: 999,
  borderColor: "rgba(255,255,255,0.35)",
  followSmoothing: 80,
  alwaysOn: false,
  disabled: false,
} as const;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export function ImageLens({
  image = IMAGE_LENS_DEFAULTS.image,
  zoom = 3,
  lensSize = 160,
  cornerRadius = 999,
  borderColor = "rgba(255,255,255,0.35)",
  followSmoothing = 80,
  alwaysOn = false,
  disabled = false,
  className = "",
  style,
}: ImageLensProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const lensRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const z = clamp(zoom, 1.5, 6);
  const size = Math.max(48, lensSize);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const lens = lensRef.current;
    const inner = innerRef.current;
    if (!wrap || !lens || !inner) return;

    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const transition =
      disabled || reduced || followSmoothing <= 0
        ? "none"
        : `transform ${followSmoothing}ms linear`;

    lens.style.width = `${size}px`;
    lens.style.height = `${size}px`;
    lens.style.borderRadius = `${cornerRadius}px`;
    lens.style.boxShadow = `0 0 0 2px ${borderColor}, 0 0 0 1px rgba(0,0,0,0.18), 0 12px 32px rgba(0,0,0,0.35)`;
    lens.style.transition = transition;
    lens.style.opacity = "0";
    inner.style.transition = transition;
    inner.style.transformOrigin = "0 0";
    inner.style.willChange = "transform";

    const syncSize = (): void => {
      const rect = wrap.getBoundingClientRect();
      inner.style.width = `${rect.width}px`;
      inner.style.height = `${rect.height}px`;
    };
    syncSize();

    const observer = new ResizeObserver(syncSize);
    observer.observe(wrap);

    return () => {
      observer.disconnect();
    };
  }, [disabled, size, cornerRadius, borderColor, followSmoothing]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    const wrap = wrapRef.current;
    const lens = lensRef.current;
    const inner = innerRef.current;
    if (disabled || !wrap || !lens || !inner) return;
    if (!alwaysOn) lens.style.opacity = "1";

    const rect = wrap.getBoundingClientRect();
    const lx = clamp(
      event.clientX - rect.left - size / 2,
      0,
      Math.max(0, rect.width - size)
    );
    const ly = clamp(
      event.clientY - rect.top - size / 2,
      0,
      Math.max(0, rect.height - size)
    );
    lens.style.transform = `translate(${lx}px, ${ly}px)`;

    const k = (size / 2) * (1 - z);
    inner.style.transform =
      `translate(${k - lx * z}px, ${k - ly * z}px) scale(${z})`;
  };

  const handlePointerLeave = (): void => {
    const lens = lensRef.current;
    if (lens && !alwaysOn) lens.style.opacity = "0";
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      draggable={false}
      className={`relative overflow-hidden select-none touch-none ${className}`}
      style={{ aspectRatio: "16 / 10", ...style }}
    >
      <img
        src={image.src}
        alt={image.alt ?? IMAGE_LENS_DEFAULTS.image.alt}
        draggable={false}
        className="h-full w-full object-cover"
      />
      <div
        ref={lensRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 overflow-hidden will-change-transform"
      >
        <div
          ref={innerRef}
          aria-hidden="true"
          style={{
            backgroundImage: `url(${image.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="absolute left-0 top-0"
        />
      </div>
    </div>
  );
}

export default ImageLens;
