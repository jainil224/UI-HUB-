"use client";

import * as React from "react";

export interface ReelmarkCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  images?: string[];
  videoSrc?: string;
  cardCount?: number;
  autoSpeed?: number;
  dragEnabled?: boolean;
}

const ART_SVGS = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CFE3B8"/><stop offset="1" stop-color="#9BC49A"/></linearGradient></defs><rect width="384" height="540" fill="url(#g)"/><ellipse cx="192" cy="440" rx="120" ry="16" fill="#000" opacity=".15"/><path d="M60 380 Q70 270 140 270 L190 300 L290 320 Q335 335 330 390 L330 410 L60 410Z" fill="#fff"/><path d="M60 395 H330 V415 Q195 430 60 415Z" fill="#08482D"/><path d="M140 270 L190 300 L150 330Z" fill="#E7F0D8"/><path d="M200 320 l50 12 M190 340 l55 12" stroke="#08482D" stroke-width="6" stroke-linecap="round"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DAE7C7"/><stop offset="1" stop-color="#8FBF9F"/></linearGradient></defs><rect width="384" height="540" fill="url(#g)"/><ellipse cx="192" cy="440" rx="120" ry="16" fill="#000" opacity=".15"/><rect x="150" y="190" width="84" height="230" rx="18" fill="#fff"/><rect x="168" y="150" width="48" height="50" rx="8" fill="#08482D"/><rect x="165" y="270" width="54" height="60" rx="6" fill="#DAE7C7"/><circle cx="90" cy="200" r="16" fill="#fff" opacity=".8"/><circle cx="310" cy="160" r="22" fill="#fff" opacity=".7"/><circle cx="280" cy="250" r="10" fill="#fff" opacity=".8"/><circle cx="110" cy="290" r="9" fill="#fff" opacity=".8"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9DCC6"/><stop offset="1" stop-color="#B9D4A6"/></linearGradient></defs><rect width="384" height="540" fill="url(#g)"/><ellipse cx="192" cy="300" rx="130" ry="130" fill="#fff"/><circle cx="192" cy="300" r="105" fill="#6B4226"/><path d="M130 300 Q160 250 192 300 Q224 350 254 300" stroke="#F3E6D0" stroke-width="22" fill="none" stroke-linecap="round"/><rect x="170" y="60" width="44" height="130" rx="20" fill="#F3E6D0" opacity=".9"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CFE3B8"/><stop offset="1" stop-color="#8FB98A"/></linearGradient></defs><rect width="384" height="540" fill="url(#g)"/><ellipse cx="192" cy="440" rx="120" ry="16" fill="#000" opacity=".15"/><path d="M90 330 V260 Q90 130 192 130 Q294 130 294 260 V330" stroke="#101410" stroke-width="22" fill="none"/><rect x="62" y="290" width="56" height="130" rx="26" fill="#08482D"/><rect x="266" y="290" width="56" height="130" rx="26" fill="#08482D"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4EFD3"/><stop offset="1" stop-color="#9CC49A"/></linearGradient></defs><rect width="384" height="540" fill="url(#g)"/><ellipse cx="192" cy="440" rx="120" ry="16" fill="#000" opacity=".15"/><path d="M120 340 H264 L248 440 H136Z" fill="#C8754A"/><rect x="112" y="320" width="160" height="28" rx="8" fill="#D98B5E"/><ellipse cx="192" cy="250" rx="30" ry="80" fill="#2E7D4F"/><ellipse cx="130" cy="270" rx="26" ry="70" fill="#3E9A62" transform="rotate(-35 130 270)"/><ellipse cx="254" cy="270" rx="26" ry="70" fill="#3E9A62" transform="rotate(35 254 270)"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2E8D8"/><stop offset="1" stop-color="#B9D4A6"/></linearGradient></defs><rect width="384" height="540" fill="url(#g)"/><path d="M192 470 V280 M150 470 L170 290 M234 470 L214 290" stroke="#2E7D4F" stroke-width="8"/><circle cx="192" cy="240" r="40" fill="#F29BB0"/><circle cx="130" cy="270" r="34" fill="#F7C873"/><circle cx="254" cy="270" r="34" fill="#fff"/><circle cx="192" cy="240" r="14" fill="#F7C873"/><path d="M110 400 L192 340 L274 400 L240 480 H144Z" fill="#fff" opacity=".85"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9DCC6"/><stop offset="1" stop-color="#9BC49A"/></linearGradient></defs><rect width="384" height="540" fill="url(#g)"/><ellipse cx="192" cy="440" rx="140" ry="22" fill="#6E6E70"/><path d="M130 430 Q90 300 150 230 Q130 190 160 150 H224 Q254 190 234 230 Q294 300 254 430Z" fill="#C8754A"/><path d="M140 330 Q192 350 244 330" stroke="#A85F3A" stroke-width="6" fill="none"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DAE7C7"/><stop offset="1" stop-color="#7FB78F"/></linearGradient></defs><rect width="384" height="540" fill="url(#g)"/><ellipse cx="192" cy="440" rx="120" ry="16" fill="#000" opacity=".15"/><rect x="140" y="230" width="104" height="190" rx="22" fill="#F2D88A"/><rect x="170" y="150" width="44" height="90" rx="10" fill="#08482D"/><ellipse cx="192" cy="120" rx="16" ry="34" fill="#08482D"/><circle cx="84" cy="180" r="14" fill="#fff" opacity=".85"/><circle cx="310" cy="230" r="20" fill="#fff" opacity=".8"/><circle cx="296" cy="120" r="9" fill="#fff" opacity=".8"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CFE3B8"/><stop offset="1" stop-color="#E9DCC6"/></linearGradient></defs><rect width="384" height="540" fill="url(#g)"/><circle cx="192" cy="270" r="150" fill="#fff"/><circle cx="192" cy="270" r="124" fill="#8A5A36"/><path d="M192 330 C120 280 140 220 192 255 C244 220 264 280 192 330Z" fill="#F3E6D0"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DAE7C7"/><stop offset="1" stop-color="#8FBF9F"/></linearGradient></defs><rect width="384" height="540" fill="url(#g)"/><ellipse cx="192" cy="440" rx="120" ry="16" fill="#000" opacity=".15"/><rect x="176" y="260" width="32" height="170" fill="#101410"/><rect x="110" y="425" width="164" height="16" rx="8" fill="#101410"/><path d="M110 250 V210 Q110 120 192 120 Q274 120 274 210 V250" stroke="#08482D" stroke-width="20" fill="none"/><rect x="88" y="220" width="44" height="90" rx="20" fill="#08482D"/><rect x="252" y="220" width="44" height="90" rx="20" fill="#08482D"/></svg>`,
];

function roundedQuadPath(pts: number[][], r: number): string {
  let d = "";
  for (let i = 0; i < 4; i++) {
    const P = pts[i];
    const A = pts[(i + 3) % 4];
    const B = pts[(i + 1) % 4];
    const ax = A[0] - P[0], ay = A[1] - P[1];
    const al = Math.hypot(ax, ay) || 1;
    const bx = B[0] - P[0], by = B[1] - P[1];
    const bl = Math.hypot(bx, by) || 1;
    const s = [P[0] + (ax / al) * r, P[1] + (ay / al) * r];
    const e = [P[0] + (bx / bl) * r, P[1] + (by / bl) * r];
    d += (i ? "L" : "M") + s[0].toFixed(1) + " " + s[1].toFixed(1) + "Q" + P[0].toFixed(1) + " " + P[1].toFixed(1) + " " + e[0].toFixed(1) + " " + e[1].toFixed(1);
  }
  return d + "Z";
}

function heightAt(x: number): number {
  const q = Math.abs(x - 720) / 706;
  return 280 + 92 * Math.pow(q, 2.6);
}

export const ReelmarkCarousel = React.forwardRef<HTMLDivElement, ReelmarkCarouselProps>(
  ({ images = [], videoSrc = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/04fd3d5f-99d7-476e-98a4-46c08518ffb3.mp4", cardCount = 10, autoSpeed = 50, dragEnabled = true, className = "", style, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const frameRef = React.useRef<HTMLDivElement>(null);
    const rowRef = React.useRef<HTMLDivElement>(null);
    const cardsRef = React.useRef<any[]>([]);
    const scaleRef = React.useRef(1);
    const scrollRef = React.useRef(0);
    const extraRef = React.useRef(0);
    const draggingRef = React.useRef(false);
    const lastXRef = React.useRef(0);
    const lastTRef = React.useRef(0);
    const dvRef = React.useRef(0);
    const lastTimeRef = React.useRef<number | null>(null);
    const tick0Ref = React.useRef(0);

    const reduceMotion = React.useMemo(() => {
      if (typeof window === "undefined") return false;
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);

    React.useEffect(() => {
      const frame = frameRef.current;
      const row = rowRef.current;
      const container = containerRef.current;
      if (!frame || !row || !container) return;

      const fit = () => {
        const rect = container.getBoundingClientRect();
        const width = rect.width || window.innerWidth;
        const height = rect.height || window.innerHeight;
        const U = Math.max(width / 1440, height / 1080);
        scaleRef.current = U > 0 ? U : 1;
        frame.style.transform = `translate(-50%, -50%) scale(${scaleRef.current})`;
        frame.style.transformOrigin = "50% 50%";
        frame.style.left = "50%";
        frame.style.top = "50%";
      };
      fit();
      window.addEventListener("resize", fit);

      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          fit();
        });
        resizeObserver.observe(container);
      }

      const N = cardCount;
      const PITCH = 196;
      const SPAN = N * PITCH;
      const R = 15;

      row.innerHTML = "";
      cardsRef.current = [];
      for (let i = 0; i < N; i++) {
        const c = document.createElement("div");
        c.style.cssText = "position:absolute;left:0;top:0;overflow:hidden;will-change:clip-path,transform;background:linear-gradient(135deg,#B9D4A6,#8FB98A,#C9DDB4,#9CC49A);background-size:300% 300%;animation:reelmark-sage 4s ease-in-out infinite alternate";

        const a = document.createElement("div");
        a.style.cssText = "position:absolute;pointer-events:none;background-size:100% 100%";
        const artSvg = ART_SVGS[i % ART_SVGS.length];
        a.style.backgroundImage = `url("data:image/svg+xml;utf8,${encodeURIComponent(artSvg)}")`;
        c.appendChild(a);

        let posterEl: HTMLDivElement | null = null;
        let videoEl: HTMLVideoElement | null = null;

        if (images.length) {
          const ph = document.createElement("div");
          ph.style.cssText = "position:absolute;inset:0;pointer-events:none;background-size:contain;background-position:center center;background-repeat:no-repeat";
          ph.style.backgroundImage = `url("${images[i % images.length]}")`;
          c.appendChild(ph);
        } else {
          posterEl = document.createElement("div");
          posterEl.style.cssText = "position:absolute;display:block;pointer-events:none;background:url(https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/b7ebb74a-8c8a-4f7e-8f80-55e2d74ecd05.webp) 0 0/100% 100%";
          c.appendChild(posterEl);
        }
        row.appendChild(c);
        cardsRef.current.push({ el: c, poster: posterEl, video: videoEl, art: a, col: i % 5, row: Math.floor(i / 5) });
      }

      const playAll = () => {
        cardsRef.current.forEach((k) => {
          if (k.video) {
            const pr = k.video.play();
            if (pr && (pr as any).catch) (pr as any).catch(() => {});
          }
        });
      };
      if (!images.length && dragEnabled) {
        playAll();
        window.addEventListener("pointerdown", playAll, { once: true } as any);
      }

      const render = () => {
        for (let i = 0; i < cardsRef.current.length; i++) {
          const k = cardsRef.current[i];
          const t = ((((i * PITCH - scrollRef.current) % SPAN) + SPAN + SPAN / 2) % SPAN) - SPAN / 2;
          const x = 720 + t * (1 + 0.083 * Math.pow(t / 706, 2));
          const d = Math.abs(x - 720) / 706;
          const w = 170 + 48 * d * d;
          const xl = x - w / 2, xr = x + w / 2;
          const hl = heightAt(xl), hr = heightAt(xr), cy = 687 - 12 * d * d;
          const tl = cy - hl / 2, tr = cy - hr / 2, bl = cy + hl / 2, br = cy + hr / 2;
          const by = Math.min(tl, tr);
          const bh = Math.max(bl, br) - by;
          const s = k.el.style;
          s.width = w + "px";
          s.height = bh + "px";
          s.transform = `translate(${xl.toFixed(2)}px,${by.toFixed(2)}px)`;
          s.clipPath = `path('${roundedQuadPath([[0, tl - by],[w, tr - by],[w, br - by],[0, bl - by]], R)}')`;
          const th = Math.max(Math.max(hl, hr), w / 0.7111);
          const tw = th * 0.7111;
          const L = -(k.col * tw) + (w - tw) / 2;
          const T = -(k.row * th) + (bh - th) / 2;
          const itemsArr = [k.poster, k.video];
          for (let j = 0; j < 2; j++) {
            const e = itemsArr[j];
            if (!e) continue;
            e.style.width = 5 * tw + "px";
            e.style.height = 2 * th + "px";
            e.style.left = L + "px";
            e.style.top = T + "px";
          }
          k.art.style.width = tw + "px";
          k.art.style.height = th + "px";
          k.art.style.left = (w - tw) / 2 + "px";
          k.art.style.top = (bh - th) / 2 + "px";
        }
      };

      const clock = document.documentElement.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1e9 });
      let animId = 0;
      const loop = () => {
        const now = (clock.currentTime as number) / 1000;
        const dt = lastTimeRef.current === null ? 0 : Math.min(now - lastTimeRef.current, 0.1);
        lastTimeRef.current = now;
        if (!draggingRef.current) {
          scrollRef.current += (autoSpeed + extraRef.current) * dt;
          extraRef.current *= Math.pow(0.05, dt);
          if (Math.abs(extraRef.current) < 0.5) extraRef.current = 0;
        }
        render();
        animId = requestAnimationFrame(loop);
      };

      if (dragEnabled) {
        row.addEventListener("pointerdown", (e: PointerEvent) => {
          draggingRef.current = true;
          lastXRef.current = e.clientX;
          lastTRef.current = performance.now();
          dvRef.current = 0;
          row.style.cursor = "grabbing";
          row.setPointerCapture(e.pointerId);
        });
        row.addEventListener("pointermove", (e: PointerEvent) => {
          if (!draggingRef.current) return;
          const nt = performance.now();
          const dx = (e.clientX - lastXRef.current) / scaleRef.current;
          scrollRef.current -= dx;
          const dtt = Math.max((nt - lastTRef.current) / 1000, 0.001);
          dvRef.current = 0.6 * dvRef.current + 0.4 * (-dx / dtt);
          lastXRef.current = e.clientX;
          lastTRef.current = nt;
        });
        const endDrag = () => {
          if (!draggingRef.current) return;
          draggingRef.current = false;
          row.style.cursor = "grab";
          if (performance.now() - lastTRef.current > 100) dvRef.current = 0;
          extraRef.current = dvRef.current - autoSpeed;
        };
        row.addEventListener("pointerup", endDrag);
        row.addEventListener("pointercancel", endDrag);
      }

      if (!reduceMotion) {
        row.animate([{ opacity: 0, transform: "translateY(80px)" }, { opacity: 1, transform: "none" }], { duration: 900, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" });
      }

      animId = requestAnimationFrame(loop);

      return () => {
        window.removeEventListener("resize", fit);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        if (dragEnabled) {
          window.removeEventListener("pointerdown", playAll as any);
        }
        cancelAnimationFrame(animId);
        row.innerHTML = "";
      };
    }, [images, videoSrc, cardCount, autoSpeed, dragEnabled, reduceMotion]);

    return (
      <div ref={containerRef} className={`relative w-full h-full min-h-[400px] bg-[#F5F8EF] overflow-hidden ${className}`} style={style} {...props}>
        <style>{`
          @keyframes reelmark-sage{from{background-position:0% 0%}to{background-position:100% 100%}}
        `}</style>
        <div ref={frameRef} style={{ position: "absolute", left: "50%", top: "50%", width: "1440px", height: "1080px", transformOrigin: "50% 50%", overflow: "hidden", background: "#F5F8EF" }}>
          <div ref={rowRef} style={{ position: "absolute", inset: 0, cursor: "grab", touchAction: "pan-y", userSelect: "none" }} />
        </div>
      </div>
    );
  }
);

ReelmarkCarousel.displayName = "ReelmarkCarousel";

export default ReelmarkCarousel;
