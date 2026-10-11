import * as React from "react";
import { useEffect, useRef } from "react";
import "./LightBeamType.css";

export interface LightBeamTypeProps {
  /** Optional class applied to the root container. */
  className?: string;
  /** Optional inline styles for the root container. */
  style?: React.CSSProperties;
  /** When true (library preview), uses compact sizing. */
  compact?: boolean;
  /** Text shown on the floor. Defaults to "UI HUB". */
  text?: string;
  /** Hint word shown before the beam is aimed. Defaults to "Hover". */
  hint?: string;
}

export const LightBeamType: React.FC<LightBeamTypeProps> = ({
  className = "",
  style = {},
  compact = false,
  text = "UI HUB",
  hint = "Hover",
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const cv = canvasRef.current;
    if (!stage || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const chs = Array.from(stage.querySelectorAll<HTMLElement>(".lbt-ch"));
    if (!chs.length) return;

    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 1,
      H = 1,
      dpr = 1;
    const written = chs.map(() => -1);
    const ptr = { x: 0, y: 0, active: false };
    const aim = { x: 0, y: 0, vx: 0, vy: 0 };
    const aimT = { x: 0, y: 0 };
    let hasAimed = false,
      wasOn = false,
      strike = -1e9;
    let I = 0; // lamp brightness 0..1 (warms up, cools down)
    let P = 0; // how far the beam has dropped from the fixture 0..1
    let last: number | null = null;
    let rafId = 0;

    // dust floating in the beam: s = depth along the beam, u = across it
    const motes: {
      s: number;
      u: number;
      ds: number;
      du: number;
      r: number;
      ph: number;
    }[] = [];
    for (let m = 0; m < 80; m++) {
      motes.push({
        s: Math.random(),
        u: Math.random() * 2 - 1,
        ds: 0.01 + Math.random() * 0.03,
        du: (Math.random() - 0.5) * 0.12,
        r: 0.5 + Math.random() * 1.1,
        ph: Math.random() * 6.28,
      });
    }

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);

    function size() {
      const r = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener("resize", size);
    let ro: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(size);
      ro.observe(stage);
    }

    function setPtr(e: PointerEvent) {
      const r = stage.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
      ptr.active = true;
    }
    const leave = () => {
      ptr.active = false;
    };
    stage.addEventListener("pointermove", setPtr);
    stage.addEventListener("pointerdown", setPtr);
    stage.addEventListener("pointerleave", leave);
    stage.addEventListener("pointercancel", leave);

    function ray(
      ax: number,
      ay: number,
      ex: number,
      ey: number,
      rw: number,
      a0: number,
      a1: number
    ) {
      const g = ctx.createLinearGradient(ax, ay, ex, ey);
      g.addColorStop(0, "rgba(205,224,255," + a0 + ")");
      g.addColorStop(1, "rgba(205,224,255," + a1 + ")");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ex - rw, ey);
      ctx.lineTo(ex + rw, ey);
      ctx.closePath();
      ctx.fill();
    }

    function frame(now: number) {
      if (last === null) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      // where the letters are on screen
      const sr = stage.getBoundingClientRect();
      const rects = chs.map((c) => {
        const r = c.getBoundingClientRect();
        return {
          cx: r.left - sr.left + r.width / 2,
          cy: r.top - sr.top + r.height / 2,
          l: r.left - sr.left,
          r: r.right - sr.left,
        };
      });
      const uL = rects[0].l;
      const uR = rects[rects.length - 1].r;
      const uW = uR - uL;
      const uCx = (uL + uR) / 2;
      const uCy = rects.reduce((s, r) => s + r.cy, 0) / rects.length;
      const rx = clamp(uW * 0.22, 70, 240);
      const ry = rx * 0.55;

      // lamp: warms up quickly, cools down slowly, flickers when it strikes
      const want = ptr.active ? 1 : 0;
      if (want && !wasOn) strike = now;
      wasOn = !!want;
      I += (want - I) * (1 - Math.exp(-(want ? 5 : 1.6) * dt));
      if (want) P = Math.min(1, P + dt / (reduce ? 0.01 : 0.5));
      else if (I < 0.02) P = 0;
      let fl = 1;
      if (!reduce && now - strike < 450)
        fl = Math.sin(now * 0.09) * Math.sin(now * 0.23) > 0.1 ? 1 : 0.35;
      const Ie = I * fl;
      const Pe = ease(P);

      // aim point: pointer x, and pointer height nudges it across the text row
      if (ptr.active) {
        aimT.x = clamp(ptr.x, uL - rx * 0.25, uR + rx * 0.25);
        aimT.y = uCy + clamp((ptr.y - uCy) / (H * 0.5), -1, 1) * ry * 0.7;
        if (!hasAimed) {
          aim.x = aimT.x;
          aim.y = aimT.y;
          hasAimed = true;
        }
      } else if (!hasAimed) {
        aimT.x = uCx;
        aimT.y = uCy;
        aim.x = uCx;
        aim.y = uCy;
      }
      if (reduce) {
        aim.x = aimT.x;
        aim.y = aimT.y;
      } else {
        // the moving head has weight: a spring with a little overshoot
        const steps = 3;
        const h = dt / steps;
        for (let s2 = 0; s2 < steps; s2++) {
          aim.vx += (aimT.x - aim.x) * 60 * h;
          aim.vy += (aimT.y - aim.y) * 60 * h;
          const damp = Math.exp(-9 * h);
          aim.vx *= damp;
          aim.vy *= damp;
          aim.x += aim.vx * h;
          aim.y += aim.vy * h;
        }
      }

      // light on each letter, only once the beam has reached the floor
      const reach = clamp((Pe - 0.75) / 0.25, 0, 1);
      for (let i = 0; i < chs.length; i++) {
        const r = rects[i];
        const d = Math.hypot((r.cx - aim.x) / rx, (r.cy - aim.y) / ry);
        let g = clamp((1 - d) * 1.6, 0, 1);
        g = g * g * (3 - 2 * g) * Ie * reach;
        if (Math.abs(g - written[i]) > 0.004) {
          chs[i].style.setProperty("--g", g.toFixed(3));
          written[i] = g;
        }
      }

      const on = ptr.active;
      if (on !== stage.classList.contains("lbt-on"))
        stage.classList.toggle("lbt-on", on);

      // the beam: starts just above the top edge of the screen
      const ax = W * 0.38;
      const ay = -H * 0.03;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      if (Ie > 0.003) {
        const hw = rx * 0.9;
        const ex0 = ax + (aim.x - ax) * Pe;
        const ey0 = ay + (aim.y - ay) * Pe;

        // haze inside the cone, kept faint so the floor stays essentially black
        const cg = ctx.createLinearGradient(ax, ay, ex0, ey0);
        cg.addColorStop(0, "rgba(190,212,255," + 0.05 * Ie + ")");
        cg.addColorStop(1, "rgba(190,212,255," + 0.004 * Ie + ")");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + (aim.x - hw - ax) * Pe, ey0);
        ctx.lineTo(ax + (aim.x + hw - ax) * Pe, ey0);
        ctx.closePath();
        ctx.fill();

        // streaks of light through the haze
        const N = 36;
        for (let k = 0; k < N; k++) {
          const u = (k / (N - 1)) * 2 - 1;
          const jit = 0.9 + 0.1 * Math.sin(k * 12.9);
          const bx = aim.x + u * hw * jit;
          const ex = ax + (bx - ax) * Pe;
          const rw = Math.max(
            1.2,
            ((hw * 2) / N) * (0.55 + 0.35 * Math.abs(Math.sin(k * 3.7))) * Pe
          );
          const flick = 0.75 + 0.25 * Math.sin(t * 0.8 + k * 1.7);
          const edge = 1 - Math.pow(Math.abs(u), 3) * 0.7;
          const a0 = 0.15 * flick * edge * Ie;
          ray(ax, ay, ex, ey0, rw, a0, a0 * 0.08);
        }

        // dust catching the light
        for (let q = 0; q < motes.length; q++) {
          const mo = motes[q];
          if (!reduce) {
            mo.s += mo.ds * dt;
            mo.u += mo.du * dt;
            if (mo.s > 1) {
              mo.s = 0.02;
              mo.u = Math.random() * 2 - 1;
            }
            if (Math.abs(mo.u) > 1) mo.du = -mo.du;
          }
          if (mo.s > Pe) continue;
          const mx = ax + (aim.x - ax) * mo.s + mo.u * hw * mo.s;
          const my = ay + (aim.y - ay) * mo.s;
          const tw = 0.5 + 0.5 * Math.sin(t * 1.3 + mo.ph);
          const fade = 1 - mo.s * 0.6;
          ctx.fillStyle =
            "rgba(225,236,255," +
            0.5 * Ie * tw * fade * (1 - Math.abs(mo.u) * 0.5) +
            ")";
          ctx.beginPath();
          ctx.arc(mx, my, mo.r, 0, 6.2832);
          ctx.fill();
        }

        // the glowing light at the top edge
        const og = ctx.createRadialGradient(ax, ay, 0, ax, ay, 90);
        og.addColorStop(0, "rgba(240,246,255," + Math.min(1, 0.72 * Ie) + ")");
        og.addColorStop(0.25, "rgba(190,215,255," + 0.32 * Ie + ")");
        og.addColorStop(1, "rgba(120,160,255,0)");
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.arc(ax, ay, 90, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", size);
      stage.removeEventListener("pointermove", setPtr);
      stage.removeEventListener("pointerdown", setPtr);
      stage.removeEventListener("pointerleave", leave);
      stage.removeEventListener("pointercancel", leave);
      if (ro) ro.disconnect();
    };
  }, [text]);

  return (
    <div
      ref={stageRef}
      className={
        "lbt-stage" +
        (compact ? " lbt-compact" : "") +
        (className ? " " + className : "")
      }
      style={style}
    >
      <canvas ref={canvasRef} className="lbt-canvas" aria-hidden="true" />
      <div className="lbt-floor">
        <h1 className="lbt-plane" aria-label={text}>
          {text.split("").map((ch, i) =>
            ch === " " ? (
              <span key={i} className="lbt-gap" aria-hidden="true" />
            ) : (
              <span key={i} className="lbt-ch" aria-hidden="true">
                {ch}
              </span>
            )
          )}
        </h1>
      </div>
      <div className="lbt-hint">
        <span className="lbt-word">{hint}</span>
      </div>
    </div>
  );
};

export default LightBeamType;
