// liquid-glass-orb — UI HUB
// A raw-WebGL liquid glass orb on a near-black (#01020a) stage: one fragment
// shader paints the full field (dome + halo) and five stacked warp layers bend
// the pixel field into a churning liquid surface, shaded with a gradient-lit
// dome, a fresnel blue rim, an iridescent thin-film sheen and a top-lit blue
// halo. The pointer (mouse or touch) drags a soft gaussian bump through the
// surface that also ripples into the refraction and steers the specular light;
// when the pointer leaves, everything eases back to rest.
//
// Shader is taken in full (incl. the pointer -> uniform math and the seamless
// 5.76s clock) from the reference 500x500 interactive template. The canvas is
// always sized to *contain* the 500x500 buffer inside its stage (ResizeObserver
// picks the largest axis-aligned square that fits), so the whole orb is always
// visible in any preview box — detail page, library tile, hover popover — with
// no cropping and no stretching. No third-party runtime: browser WebGL1 + React.

import * as React from "react";
import { useEffect, useRef } from "react";

export interface LiquidGlassOrbProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
    /** Whether to show the bottom interaction hint (default true). */
    showHint?: boolean;
    /** Text for the interaction hint. */
    hintText?: string;
    /** Whether the pointer warps and lights the orb (default true). */
    interactive?: boolean;
}

/* Source GIF is 500x500; 144 frames @ 40 ms = 5.76 s, all motion periodic. */
const W = 500, H = 500;
const FPS = 25, DUR = 5.76;
const BACKGROUND_COLOR = "#01020a";

/* One layer: the glass-liquid dome. The shader paints the full 500x500 field
   (dome + halo). Kept byte-for-byte from the reference implementation. */
const ORB_FS = `
precision highp float;
uniform float uA;
uniform vec2 uM;
uniform float uH;
uniform float uW;
const vec2 C = vec2(250.0, 232.0);
const float R = 157.0;

vec2 warp(vec2 p){
  for(int i=0;i<5;i++){
    float fi = float(i) + 1.0;
    float k1 = float(i - (i/2)*2) + 1.0;       /* 1,2,1,2,1 */
    float k2 = float((i+1) - ((i+1)/2)*2) + 1.0;
    p += vec2(sin(p.y*0.95*fi + uA*k1 + fi),
              cos(p.x*0.85*fi - uA*k2 + fi*1.7)) * 0.62 / fi;
  }
  return p;
}
float field(vec2 p){
  vec2 q = warp(p);
  float a = sin(q.x*3.4 + q.y*2.2 + 1.1*sin(q.y*2.6 - q.x*0.7));
  float b = sin(q.x*7.1 - q.y*5.3 + 2.0*sin(q.x*3.1));
  return 0.5 + 0.5*(0.78*a + 0.22*b);
}

void main(){
  vec2 px = vec2(gl_FragCoord.x, 500.0 - gl_FragCoord.y);
  vec2 uv = (px - C) / R;
  uv.y = -uv.y;                      /* y up */
  float r2 = dot(uv, uv), r = sqrt(r2);

  vec3 glowCol = vec3(0.20, 0.45, 1.0);
  float topW = smoothstep(-0.45, 0.85, uv.y / max(r, 0.001));
  float halo = exp(-max(r - 1.0, 0.0) * 9.0) * 0.55 * topW * (1.0 + uH * 0.45);
  float halo2 = exp(-max(r - 1.0, 0.0) * 3.2) * 0.16 * topW;
  vec3 outc = glowCol * (halo + halo2) + vec3(0.7,0.85,1.0) * exp(-max(r-1.0,0.0)*30.0) * 0.35 * topW;

  if (r >= 1.0) {
    outc *= smoothstep(-0.4, 0.3, uv.y);
    gl_FragColor = vec4(outc, 1.0);
    return;
  }

  vec3 n = vec3(uv, sqrt(1.0 - r2));
  vec2 dv = uv - uM;
  float dd = dot(dv, dv);
  float bump = exp(-dd * 5.0) * uH;
  vec2 p = n.xy * 2.7 + vec2(0.0, 0.3) + dv * bump * 1.1
         + normalize(dv + vec2(1e-4)) * sin(sqrt(dd) * 26.0 - uW * 5.0) * exp(-dd * 4.0) * uH * 0.07;
  float f0 = field(p);
  float e = 0.02;
  float fx = field(p + vec2(e, 0.0)), fy = field(p + vec2(0.0, e));
  vec2 g = vec2(fx - f0, fy - f0) / e;
  vec3 nn = normalize(n + vec3(g * 0.11, 0.0));

  vec3 L = normalize(mix(vec3(-0.15, 0.85, 0.55), vec3(uM.x * 0.9, uM.y * 0.9 + 0.3, 0.55), uH * 0.6));
  vec3 V = vec3(0.0, 0.0, 1.0);
  float diff = clamp(dot(nn, L), 0.0, 1.0);
  float spec = pow(max(dot(reflect(-L, nn), V), 0.0), 22.0);
  float fres = pow(1.0 - n.z, 2.0);

  vec3 base = mix(vec3(0.005, 0.03, 0.30), vec3(0.22, 0.50, 1.0), pow(diff, 1.25));
  float gl = length(g);
  float irid = smoothstep(0.8, 3.0, gl);
  vec3 thin = 0.5 + 0.5*cos(6.2832*(f0*0.7 + dot(nn, L)*0.9 + vec3(0.0, 0.33, 0.67)));
  vec3 col = mix(base, thin * 1.15, irid * 0.5);
  col += vec3(0.85, 0.93, 1.0) * spec * 0.9;
  col += vec3(0.55, 0.80, 1.0) * pow(diff, 3.0) * 0.22 * (1.0 - irid*0.5);
  col += glowCol * fres * 0.9 * smoothstep(-0.1, 0.8, n.y);

  /* top-lit: fade to black towards the lower cut of the dome */
  float m = smoothstep(-0.22, 0.52, n.y);
  col *= m;
  col += vec3(0.30, 0.55, 1.0) * exp(-dd * 8.0) * uH * 0.35 * (0.4 + 0.6 * m);
  col = mix(col, vec3(dot(col, vec3(0.33))), 0.0);

  float aa = smoothstep(1.0, 0.985, r);
  col = outc * (1.0 - aa) + col * aa + outc * aa * 0.25;
  col = pow(clamp(col, 0.0, 1.0), vec3(0.95));
  gl_FragColor = vec4(col, 1.0);
}`;

export const LiquidGlassOrb: React.FC<LiquidGlassOrbProps> = ({
    className = "",
    style = {},
    showHint = true,
    hintText = "move your cursor",
    interactive = true,
}) => {
    const stageRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hintRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const stage = stageRef.current;
        const cv = canvasRef.current;
        if (!stage || !cv) return;

        cv.width = W;
        cv.height = H;

        const gl = cv.getContext("webgl", {
            preserveDrawingBuffer: false,
            antialias: false,
            alpha: false,
        }) as WebGLRenderingContext | null;

        /* Graceful fallback when WebGL is unavailable: a static blue radial
           dome painted on a 2D context (same look as the reference fallback). */
        if (!gl) {
            const ctx2d = cv.getContext("2d");
            if (ctx2d) {
                const g = ctx2d.createRadialGradient(250, 232, 20, 250, 232, 165);
                g.addColorStop(0, "#9fd0ff");
                g.addColorStop(0.7, "#2a5bd8");
                g.addColorStop(1, BACKGROUND_COLOR);
                ctx2d.fillStyle = g;
                ctx2d.fillRect(0, 0, W, H);
            }
            return;
        }

        /* Contain-fit: the 500x500 buffer keeps its aspect ratio and is scaled
           (never cropped) to the largest square that fits the stage, so the orb
           is fully visible in any preview box. */
        const fit = () => {
            const r = stage.getBoundingClientRect();
            if (!r.width || !r.height) return;
            const s = Math.min(r.width / W, r.height / H);
            cv.style.width = `${Math.floor(W * s)}px`;
            cv.style.height = `${Math.floor(H * s)}px`;
        };
        const ro = new ResizeObserver(fit);
        ro.observe(stage);
        fit();

        let program: WebGLProgram | null = null;
        let uA: WebGLUniformLocation | null = null;
        let uM: WebGLUniformLocation | null = null;
        let uH: WebGLUniformLocation | null = null;
        let uW: WebGLUniformLocation | null = null;

        const mk = (type: number, src: string) => {
            const h = gl.createShader(type) as WebGLShader;
            gl.shaderSource(h, src);
            gl.compileShader(h);
            if (!gl.getShaderParameter(h, gl.COMPILE_STATUS)) {
                throw new Error(gl.getShaderInfoLog(h) || "shader compile error");
            }
            return h;
        };

        try {
            program = gl.createProgram() as WebGLProgram;
            gl.attachShader(
                program,
                mk(gl.VERTEX_SHADER, "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}")
            );
            gl.attachShader(program, mk(gl.FRAGMENT_SHADER, ORB_FS));
            gl.linkProgram(program);
            gl.useProgram(program);

            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
                gl.STATIC_DRAW
            );
            const loc = gl.getAttribLocation(program, "a");
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

            uA = gl.getUniformLocation(program, "uA");
            uM = gl.getUniformLocation(program, "uM");
            uH = gl.getUniformLocation(program, "uH");
            uW = gl.getUniformLocation(program, "uW");
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn("LiquidGlassOrb: WebGL init failed", err);
            return;
        }

        /* ---- pointer state (mouse + touch, scoped to this card) ---- */
        let pointerActive = false;
        let px = 0, py = 0;          // pointer target in 500-space
        let mx = 0, my = 0.4;        // eased orb-space bump centre
        let hov = 0;                 // eased hover amount

        const setPointer = (clientX: number, clientY: number) => {
            const r = cv.getBoundingClientRect();
            if (!r.width || !r.height) return;
            px = ((clientX - r.left) / r.width) * W;
            py = ((clientY - r.top) / r.height) * H;
            pointerActive = true;
            if (hintRef.current) hintRef.current.style.opacity = "0";
        };

        const onMove = (e: PointerEvent) => {
            if (!interactive) return;
            setPointer(e.clientX, e.clientY);
        };
        const onLeave = () => {
            pointerActive = false;
        };
        const onTouchMove = (e: TouchEvent) => {
            if (!interactive) return;
            if (e.touches.length) setPointer(e.touches[0].clientX, e.touches[0].clientY);
        };
        const onTouchEnd = () => {
            pointerActive = false;
        };

        if (interactive) {
            cv.addEventListener("pointermove", onMove);
            cv.addEventListener("pointerleave", onLeave);
            cv.addEventListener("pointercancel", onLeave);
            cv.addEventListener("touchmove", onTouchMove, { passive: true });
            cv.addEventListener("touchend", onTouchEnd, { passive: true });
            cv.addEventListener("touchcancel", onTouchEnd, { passive: true });
        }

        /* ---- seamless 5.76s clock + render loop ---- */
        const start = performance.now();
        let rafId = 0;

        const frame = (ts: number) => {
            const t = ((ts - start) / 1000) % DUR;
            gl.uniform1f(uA, (t / DUR) * Math.PI * 2);
            // pointer target in orb space: (px-250)/157, y flipped about 232
            const tx = (px - 250) / 157;
            const ty = -(py - 232) / 157;
            if (pointerActive) {
                mx += (tx - mx) * 0.2;
                my += (ty - my) * 0.2;
            }
            hov += ((pointerActive ? 1 : 0) - hov) * 0.09;
            gl.uniform2f(uM, mx, my);
            gl.uniform1f(uH, hov);
            gl.uniform1f(uW, ts / 1000);

            gl.viewport(0, 0, W, H);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            rafId = requestAnimationFrame(frame);
        };
        rafId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(rafId);
            ro.disconnect();
            if (interactive) {
                cv.removeEventListener("pointermove", onMove);
                cv.removeEventListener("pointerleave", onLeave);
                cv.removeEventListener("pointercancel", onLeave);
                cv.removeEventListener("touchmove", onTouchMove);
                cv.removeEventListener("touchend", onTouchEnd);
                cv.removeEventListener("touchcancel", onTouchEnd);
            }
            if (program) gl.deleteProgram(program);
            // NOTE: the WebGL context is intentionally NOT lost here. The app
            // mounts inside <StrictMode>, which runs effects twice (and Fast
            // Refresh replays them); calling WEBGL_lose_context here would hand
            // the second mount a dead context so every shader compile fails and
            // the orb renders blank. Cleaning up the program and listeners is
            // enough — like the other WebGL components in this library.
        };
    }, [interactive]);

    return (
        <div
            className={`relative w-full h-full min-h-[380px] overflow-hidden select-none flex items-center justify-center ${className}`}
            style={{ backgroundColor: BACKGROUND_COLOR, ...style }}
        >
            <div ref={stageRef} className="absolute inset-0 flex items-center justify-center">
                <canvas
                    ref={canvasRef}
                    className="block max-w-full max-h-full w-auto h-auto touch-none"
                    style={{ cursor: interactive ? "crosshair" : "default" }}
                />
            </div>
            {showHint && (
                <p
                    ref={hintRef}
                    className="pointer-events-none absolute bottom-5 left-0 right-0 text-center text-[11px] tracking-[0.3em] uppercase text-white/40 transition-opacity duration-700 select-none"
                    style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
                >
                    {hintText}
                </p>
            )}
        </div>
    );
};

export default LiquidGlassOrb;

/* FPS / DUR are exported for parity with the reference animation contract and
   for any host that wants to drive / document the loop timing. */
export { FPS, DUR };