// ── FILE: frontend/src/components/ui/UranusAnimation.tsx ──
// uranus-animation — UI HUB
// "Uranus": a fully procedural, endlessly rotating ice giant rendered by a
// single raw-WebGL1 fragment shader — no textures, no libraries. The shader
// raytraces a sphere over an fbm/domain-warped methane atmosphere: broad soft
// belts with fine latitude streaks, a slightly greener equator and bluer mid
// latitudes, a bright polar haze cap (stronger on the sunlit pole), evolving
// methane cloud streaks, a thin high-altitude haze drifting a little faster
// than the belts, and the planet's faint 13-ring system (a dusty inner band,
// six narrow bright rings, the hair-thin epsilon ring and a field of tiny
// twinkling ring particles) whose bands also cast soft shadows back onto the
// cloud tops. A 2D overlay canvas draws an inspect legend and a live probe:
// press i (while hovering) to reveal the spin axis, the pole marker and a
// readout of the hovered latitude/longitude or ring name. Drag in any
// direction to turn the planet through any angle, flick for momentum, and
// double-click / r to reset.
//
// Original source: standalone HTML (two fixed full-viewport canvases + one
// inline script, with a `#frag` fragment-shader script block). Ported to React
// with no third-party runtime and no external assets: the GLSL, the value-noise
// /fbm helpers, the ring layer profile, the raytraced sphere + ring maths and
// the orientation trackball are kept verbatim from the reference. Only the
// scaffolding changed: the html/body + `#gl`/`#ov`/`#tip`/`#fail`/`#legend`
// nodes became scoped refs on a container, the `#frag` script's textContent
// became a module constant, every `innerWidth`/`innerHeight` became the
// container's box (so the planet centres in whatever area it is placed in), the
// window `resize` listener became a ResizeObserver on that container, pointer
// coordinates became container-relative, the `position:fixed` overlays became
// absolutely positioned inside the root, and the window keyboard listener is
// guarded by an over-the-canvas pointer check (repo convention) so it never
// hijacks page keys. Rendering is gated by an IntersectionObserver + the Page
// Visibility API so an off-screen tile never burns the GPU. Teardown cancels the
// RAF, drops the observers, unbinds every listener and deletes the GPU
// program/shaders/buffer — but it does NOT call loseContext(), because a canvas
// hands back the same context for its lifetime and React StrictMode's
// mount -> cleanup -> mount would then reuse a force-lost one (making the
// shaders null and wrongly showing the WebGL fallback).

import * as React from "react";
import { useEffect, useRef } from "react";
import "./UranusAnimation.css";

const VIEW = 1.95, SPIN = 0.13, RW = 0.5;
const LOOP_T = Math.PI * 2 / (SPIN / 2);

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uT;
uniform vec3 uU;
uniform vec3 uV;
uniform vec3 uA;

const float VIEW = 1.95;
const float PI2 = 6.2831853;
const float SPIN = 0.13;
const float RW = 0.5;
const float CELLS = 62.0;

float h21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float h31(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(h31(i), h31(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(h31(i + vec3(0.0, 1.0, 0.0)), h31(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(h31(i + vec3(0.0, 0.0, 1.0)), h31(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(h31(i + vec3(0.0, 1.0, 1.0)), h31(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return s;
}
float ln(float rr, float c, float w) {
  return 1.0 - smoothstep(w * 0.5, w * 0.5 + 0.0025, abs(rr - c));
}

/* x: dusty band profile, y: narrow rings, z: epsilon ring */
vec3 ringLayers(float rr) {
  float mask = smoothstep(1.35, 1.41, rr) * (1.0 - smoothstep(1.76, 1.80, rr));
  float thin = max(max(ln(rr, 1.640, 0.004) * 0.45, ln(rr, 1.675, 0.005) * 0.50),
                   max(ln(rr, 1.705, 0.004) * 0.40, ln(rr, 1.735, 0.006) * 0.55));
  thin = max(thin, max(ln(rr, 1.760, 0.004) * 0.50, ln(rr, 1.785, 0.005) * 0.60));
  float hair = step(0.88, h21(vec2(floor(rr * 230.0), 9.0))) * 0.22 *
               smoothstep(1.55, 1.62, rr) * (1.0 - smoothstep(1.78, 1.82, rr));
  thin = max(thin, hair);
  float eps = ln(rr, 1.825, 0.014) * 0.95;
  return vec3(mask, thin, eps);
}

vec3 planetColor(vec3 N, vec3 a, vec3 u, vec3 v, vec3 L) {
  float s = dot(N, a);
  float as = abs(s);
  float lon0 = atan(dot(N, v), dot(N, u));
  vec2 w1 = vec2(cos(lon0 - SPIN * uT), sin(lon0 - SPIN * uT));
  vec2 w2 = vec2(cos(lon0 - SPIN * 1.5 * uT), sin(lon0 - SPIN * 1.5 * uT));
  vec2 w3 = vec2(cos(lon0 - SPIN * 1.2 * uT), sin(lon0 - SPIN * 1.2 * uT));

  /* base banding: broad soft belts plus fine latitude streaks */
  float n1 = fbm(vec3(w1 * 1.3, s * 7.0 + 3.0));
  float fine = fbm(vec3(w1 * 1.1, s * 34.0));
  float tone = clamp(0.5 + 0.95 * (n1 - 0.5) + 0.24 * (fine - 0.5) + 0.10 * sin(s * 10.0), 0.0, 1.0);
  vec3 cDark = vec3(0.04, 0.40, 0.56);
  vec3 cMid = vec3(0.20, 0.74, 0.86);
  vec3 cLight = vec3(0.58, 0.95, 0.97);
  vec3 col = mix(mix(cDark, cMid, smoothstep(0.0, 0.55, tone)), cLight, smoothstep(0.5, 1.0, tone));

  /* slightly greener equator, bluer mid latitudes */
  col *= mix(vec3(0.93, 1.04, 0.98), vec3(0.98, 1.0, 1.04), smoothstep(0.0, 0.45, as));

  /* bright polar haze cap, stronger on the pole turned toward the Sun */
  float cap = smoothstep(0.58, 0.96, s) + 0.45 * smoothstep(0.7, 0.98, -s);
  col = mix(col, vec3(0.74, 0.98, 0.98), clamp(cap, 0.0, 1.0) * (0.30 + 0.12 * fine));

  /* methane cloud streaks; two slowly crossfading samples keep them evolving */
  float ph = 0.5 + 0.5 * sin(uT * 0.045);
  vec3 pc = vec3(w2 * 2.4, s * 22.0 + 11.0);
  float cl = mix(fbm(pc), fbm(pc + vec3(3.7, 1.3, 5.1)), ph);
  float streak = smoothstep(0.64, 0.80, cl);
  float zone = smoothstep(0.08, 0.28, as) * (1.0 - smoothstep(0.62, 0.85, as)) + 0.20;
  col = mix(col, vec3(0.90, 0.99, 0.99), streak * zone * 0.6);

  /* thin high-altitude haze, drifting a little faster than the belts */
  float hz = fbm(vec3(w3 * 0.8, s * 60.0 + 5.0));
  col = mix(col, vec3(0.85, 0.98, 0.99), smoothstep(0.58, 0.86, hz) * 0.12);

  /* the rings throw soft shadow bands onto the cloud tops */
  float denom = dot(L, a);
  if (abs(denom) > 0.02) {
    float tt = -dot(N, a) / denom;
    if (tt > 0.0) {
      vec3 Q = N + tt * L;
      float rq = length(Q);
      if (rq > 1.35 && rq < 1.86) {
        vec3 ly = ringLayers(rq);
        col *= 1.0 - 0.55 * max(ly.x * 0.28, max(ly.y, ly.z));
      }
    }
  }

  /* light: wrapped diffuse, limb darkening, scattered blue rim on the lit edge */
  float wrap = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
  float lightf = pow(wrap, 1.3);
  col *= 0.16 + 1.02 * lightf;
  col += vec3(0.10, 0.24, 0.24) * pow(N.z, 6.0) * lightf * 0.35;
  float limb = pow(1.0 - N.z, 2.2);
  col = mix(col, vec3(0.03, 0.20, 0.42), limb * 0.55);
  col += vec3(0.20, 0.55, 0.75) * pow(1.0 - N.z, 3.0) * lightf * 0.32;
  return col;
}

vec4 ringColor(vec3 P, float rr, vec3 a, vec3 u, vec3 v, vec3 L) {
  float ringIdx = floor(rr * CELLS);
  float rm = (ringIdx + 0.5) / CELLS;
  float n = floor(PI2 * rm * CELLS);
  float th = atan(dot(P, v), dot(P, u));
  float w = RW / (rm * sqrt(rm));
  float x = (th + w * uT) / PI2;
  x = x - floor(x);
  float cellf = x * n;
  float ci = floor(cellf);
  vec2 f = vec2(cellf - ci, fract(rr * CELLS));

  vec3 ly = ringLayers(rr);
  float hc = h21(vec2(ci, ringIdx));
  float lane = h21(vec2(floor(rr * 90.0), 3.0));
  float dustA = ly.x * (0.20 + 0.16 * lane) * (0.85 + 0.30 * hc);
  float thin = ly.y;
  float eps = ly.z;

  float A = max(max(dustA, thin), eps);
  float lineMix = clamp(max(thin, eps) / max(A, 0.001), 0.0, 1.0);
  vec3 base = mix(vec3(0.33, 0.35, 0.44), vec3(0.80, 0.86, 0.93), lineMix);

  float presence = clamp(max(dustA * 3.0, max(thin, eps)), 0.0, 1.0);
  float hp = h21(vec2(ci + 7.0, ringIdx * 1.7));
  vec2 j = vec2(h21(vec2(ci, ringIdx + 31.0)), h21(vec2(ci + 13.0, ringIdx + 5.0))) * 0.6 + 0.2;
  float dd = length(f - j);
  float tw = 0.65 + 0.35 * sin(uT * 2.5 + hp * 60.0);
  float dotv = 0.0;
  if (hp < 0.14) {
    dotv = smoothstep(0.30, 0.10, dd) * tw * (0.6 + 0.8 * h21(vec2(ci, ringIdx + 77.0)));
  }
  dotv = clamp(dotv, 0.0, 1.0) * presence;
  base = mix(base, vec3(0.93, 0.98, 1.0), dotv);
  A = max(A, dotv * 0.95);

  float b = dot(P, L);
  float c = dot(P, P) - 1.0;
  float disc = b * b - c;
  float sh = (b < 0.0) ? smoothstep(0.0, 0.05, disc) : 0.0;
  float lit = mix(1.0, 0.12, sh);
  /* seen from the side the Sun does not light, the rings go dim */
  lit *= mix(0.5, 1.0, step(0.0, dot(a, L) * a.z));
  return vec4(base * lit, A);
}

void main() {
  float m = min(uRes.x, uRes.y);
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * m) * VIEW;
  float px = 2.0 * VIEW / m;

  vec3 a = normalize(uA);
  vec3 u = normalize(uU);
  vec3 v = normalize(uV);
  vec3 L = normalize(vec3(-0.35, 0.42, 0.85));

  float d = length(uv);
  float edge = 1.0 - smoothstep(1.0 - px, 1.0 + px, d);
  float zc = sqrt(max(1.0 - d * d, 0.0));
  vec2 xy = d > 1.0 ? uv / d : uv;
  vec3 N = vec3(xy, zc);

  vec3 col = vec3(0.0);
  float g = exp(-max(d - 1.0, 0.0) * 28.0) * 0.10 * smoothstep(-0.6, 0.6, dot(normalize(uv + 1e-5), L.xy));
  col += vec3(0.10, 0.45, 0.60) * g * (1.0 - edge);
  if (edge > 0.0) {
    col = mix(col, planetColor(N, a, u, v, L), edge);
  }

  float az = abs(a.z) < 0.004 ? (a.z < 0.0 ? -0.004 : 0.004) : a.z;
  float zr = -(uv.x * a.x + uv.y * a.y) / az;
  vec3 P = vec3(uv, zr);
  float rr = length(P);
  if (rr > 1.33 && rr < 1.86) {
    vec4 rc = ringColor(P, rr, a, u, v, L);
    float vis = (d < 1.0 + px && zr < zc) ? (1.0 - edge) : 1.0;
    col = mix(col, rc.rgb, rc.a * vis);
  }

  col += (h21(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface UranusAnimationProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
}

export const UranusAnimation: React.FC<UranusAnimationProps> = ({
    className = "",
    style = {},
}) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const cvRef = useRef<HTMLCanvasElement>(null);
    const ovRef = useRef<HTMLCanvasElement>(null);
    const tipRef = useRef<HTMLDivElement>(null);
    const fallbackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        const cv = cvRef.current;
        const ov = ovRef.current;
        const tip = tipRef.current;
        const fallback = fallbackRef.current;
        if (!root || !cv || !ov || !tip || !fallback) return;

        const octx = ov.getContext("2d");
        const gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" }) as WebGLRenderingContext | null;
        if (!gl || !octx) { root.classList.add("nogl"); return; }

        let cancelled = false;
        let rafId = 0;
        let ro: ResizeObserver | null = null;
        let io: IntersectionObserver | null = null;

        /* ---------- orientation: planet frame (U, V, pole A) in view space ---------- */
        function norm(p: number[]) { const l = Math.hypot(p[0], p[1], p[2]) || 1; return [p[0] / l, p[1] / l, p[2] / l]; }
        function cross(a: number[], b: number[]) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
        const A0 = norm([-0.391, 0.838, 0.36]);
        const U0 = norm([A0[1], -A0[0], 0]);
        const V0 = cross(A0, U0);
        let Ax = A0.slice(), U = U0.slice(), V = V0.slice();
        function ortho() {
            Ax = norm(Ax);
            const d = U[0] * Ax[0] + U[1] * Ax[1] + U[2] * Ax[2];
            U = norm([U[0] - d * Ax[0], U[1] - d * Ax[1], U[2] - d * Ax[2]]);
            V = cross(Ax, U);
        }
        function applyRot(yaw: number, pitch: number) {
            const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
            function f(p: number[]) {
                const x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy, y = p[1];
                return [x, y * cx - z * sx, y * sx + z * cx];
            }
            Ax = f(Ax); U = f(U); V = f(V); ortho();
        }
        function resetView() { Ax = A0.slice(); U = U0.slice(); V = V0.slice(); vyaw = vpitch = 0; }

        const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        /* ---------- GL program ---------- */
        function shader(type: number, src: string) {
            const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
            return s;
        }
        const vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, FRAG);
        if (!vs || !fs) { root.classList.add("nogl"); return; }
        const prog = gl.createProgram();
        gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); root.classList.add("nogl"); return; }
        gl.useProgram(prog);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const uRes = gl.getUniformLocation(prog, "uRes"), uT = gl.getUniformLocation(prog, "uT"),
            uU = gl.getUniformLocation(prog, "uU"), uV = gl.getUniformLocation(prog, "uV"), uA = gl.getUniformLocation(prog, "uA");

        /* ---------- sizing ---------- */
        let CW = 1, CH = 1, DPR = 1;
        function resize() {
            CW = Math.max(1, root.clientWidth); CH = Math.max(1, root.clientHeight);
            DPR = Math.min(window.devicePixelRatio || 1, 2);
            const budget = 3.2e6;
            if (CW * CH * DPR * DPR > budget) DPR = Math.sqrt(budget / (CW * CH));
            cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR);
            ov.width = Math.round(CW * DPR); ov.height = Math.round(CH * DPR);
            gl.viewport(0, 0, cv.width, cv.height);
            gl.uniform2f(uRes, cv.width, cv.height);
            drawOverlay();
        }

        /* ---------- clock ---------- */
        let t = 0, playing = !REDUCED, last: number | null = null, inspect = false;
        let mouse: { x: number; y: number } | null = null;
        let drag: { id: number; x: number; y: number } | null = null;
        let vyaw = 0, vpitch = 0, lastMoveTs = 0, hovering = false;
        let visible = typeof IntersectionObserver === "undefined";

        function render() {
            gl.uniform1f(uT, t % 100000);
            gl.uniform3f(uU, U[0], U[1], U[2]);
            gl.uniform3f(uV, V[0], V[1], V[2]);
            gl.uniform3f(uA, Ax[0], Ax[1], Ax[2]);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            if (inspect) drawOverlay();
        }
        function frame(ts: number) {
            if (cancelled) return;
            rafId = requestAnimationFrame(frame);
            if (!visible || document.hidden) { last = null; return; }
            if (last == null) last = ts;
            const dt = Math.min(0.1, (ts - last) / 1000); last = ts;
            if (playing) t += dt;
            if (!drag && (Math.abs(vyaw) > 1e-5 || Math.abs(vpitch) > 1e-5)) {
                applyRot(vyaw * dt * 60, vpitch * dt * 60);
                const k = Math.pow(0.93, dt * 60); vyaw *= k; vpitch *= k;
            }
            render();
        }

        /* ---------- picking + inspect ---------- */
        function toScene(mx: number, my: number) {
            const s = 0.5 * Math.min(CW, CH) / VIEW;
            return { x: (mx - CW / 2) / s, y: -(my - CH / 2) / s, s: s };
        }
        function pick(mx: number, my: number) {
            const q = toScene(mx, my), x = q.x, y = q.y, d = Math.hypot(x, y);
            const az = Math.abs(Ax[2]) < 0.004 ? (Ax[2] < 0 ? -0.004 : 0.004) : Ax[2];
            const zr = -(x * Ax[0] + y * Ax[1]) / az, rr = Math.hypot(x, y, zr);
            const zp = d < 1 ? Math.sqrt(1 - d * d) : -1e9;
            if (rr >= 1.35 && rr <= 1.84 && zr > zp) return { kind: "ring", r: rr };
            if (d < 1) {
                const n = [x, y, zp], sl = n[0] * Ax[0] + n[1] * Ax[1] + n[2] * Ax[2];
                let lon = Math.atan2(n[0] * V[0] + n[1] * V[1] + n[2] * V[2], n[0] * U[0] + n[1] * U[1] + n[2] * U[2]) - SPIN * t;
                lon = ((lon * 180 / Math.PI) % 360 + 360) % 360;
                return { kind: "planet", lat: Math.asin(Math.max(-1, Math.min(1, sl))) * 180 / Math.PI, lon: lon };
            }
            return null;
        }
        function ringName(r: number) {
            if (r > 1.80) return "Epsilon (\u03b5) ring";
            if (r > 1.62) return "Narrow inner rings (6, 5, 4, \u03b1, \u03b2, \u03b7, \u03b3, \u03b4)";
            return "Dusty inner band";
        }
        function showTip(h: any, cx: number, cy: number) {
            if (!h) { tip.style.display = "none"; return; }
            if (h.kind === "planet") {
                tip.innerHTML = "<b>Atmosphere</b><br>latitude " + Math.abs(h.lat).toFixed(1) + "\u00b0 " + (h.lat >= 0 ? "N" : "S") +
                    "<br>longitude " + h.lon.toFixed(0) + "\u00b0<br>Methane absorbs red light, which gives the cyan tint.";
            } else {
                const w = RW / Math.pow(h.r, 1.5);
                tip.innerHTML = "<b>" + ringName(h.r) + "</b><br>radius " + h.r.toFixed(2) + " planet radii<br>particle lap " +
                    (Math.PI * 2 / w).toFixed(1) + " s (scene time)<br>Inner rings move faster than outer ones.";
            }
            tip.style.display = "block";
            let x = cx + 16, y = cy + 18;
            if (x + tip.offsetWidth > CW - 8) x = cx - 16 - tip.offsetWidth;
            if (y + tip.offsetHeight > CH - 8) y = cy - 14 - tip.offsetHeight;
            tip.style.left = Math.max(4, x) + "px"; tip.style.top = Math.max(4, y) + "px";
        }
        function drawOverlay() {
            octx.setTransform(DPR, 0, 0, DPR, 0, 0);
            octx.clearRect(0, 0, CW, CH);
            if (!inspect) return;
            const s = toScene(0, 0).s, cx = CW / 2, cy = CH / 2;
            octx.lineWidth = 1.2;
            octx.setLineDash([6, 5]);
            octx.strokeStyle = "rgba(255,212,121,0.85)";
            octx.beginPath(); octx.moveTo(cx, cy); octx.lineTo(cx + Ax[0] * 1.3 * s, cy - Ax[1] * 1.3 * s); octx.stroke();
            octx.strokeStyle = "rgba(255,212,121,0.30)";
            octx.beginPath(); octx.moveTo(cx, cy); octx.lineTo(cx - Ax[0] * 1.3 * s, cy + Ax[1] * 1.3 * s); octx.stroke();
            octx.setLineDash([]);
            octx.fillStyle = Ax[2] > 0 ? "#ffd479" : "rgba(255,212,121,0.35)";
            octx.beginPath(); octx.arc(cx + Ax[0] * s, cy - Ax[1] * s, 3.2, 0, 6.2832); octx.fill();
            octx.font = "11px ui-monospace, Menlo, monospace";
            octx.fillText(Ax[2] > 0 ? "N pole" : "N pole (hidden)", cx + Ax[0] * 1.3 * s + 8, cy - Ax[1] * 1.3 * s);
            const h = (mouse && !drag) ? pick(mouse.x, mouse.y) : null;
            if (h) {
                octx.setLineDash([4, 3]); octx.strokeStyle = "rgba(255,255,255,0.85)"; octx.lineWidth = 1.5;
                octx.beginPath();
                if (h.kind === "planet") { octx.arc(cx, cy, s, 0, 6.2832); }
                else {
                    for (let i = 0; i <= 120; i++) {
                        const a = i / 120 * 6.2832, c = Math.cos(a) * h.r, sn = Math.sin(a) * h.r;
                        const px = c * U[0] + sn * V[0], py = c * U[1] + sn * V[1];
                        if (i === 0) octx.moveTo(cx + px * s, cy - py * s); else octx.lineTo(cx + px * s, cy - py * s);
                    }
                }
                octx.stroke(); octx.setLineDash([]);
            }
        }
        function setInspect(on: boolean) {
            inspect = on; root.classList.toggle("inspect", on);
            if (!on) { tip.style.display = "none"; mouse = null; }
            drawOverlay();
        }

        /* ---------- drag to turn the planet through any angle ---------- */
        function localPos(e: PointerEvent | MouseEvent | WheelEvent) {
            const r = root.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        }
        function onPointerDown(e: PointerEvent) {
            const p = localPos(e);
            drag = { id: e.pointerId, x: p.x, y: p.y };
            try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
            root.classList.add("dragging");
            vyaw = vpitch = 0; lastMoveTs = performance.now();
            tip.style.display = "none";
        }
        function onPointerMove(e: PointerEvent) {
            const p = localPos(e);
            mouse = { x: p.x, y: p.y };
            if (drag && e.pointerId === drag.id) {
                const k = 2 * VIEW / Math.min(CW, CH);
                const dyaw = (p.x - drag.x) * k, dpitch = (p.y - drag.y) * k;
                drag.x = p.x; drag.y = p.y;
                applyRot(dyaw, dpitch);
                vyaw = vyaw * 0.5 + dyaw * 0.5; vpitch = vpitch * 0.5 + dpitch * 0.5;
                lastMoveTs = performance.now();
                return;
            }
            if (inspect) { showTip(pick(mouse.x, mouse.y), p.x, p.y); drawOverlay(); }
        }
        function endDrag() {
            if (!drag) return;
            drag = null; root.classList.remove("dragging");
            if (performance.now() - lastMoveTs > 90) { vyaw = vpitch = 0; }
        }
        function onMouseLeave() { mouse = null; tip.style.display = "none"; drawOverlay(); }
        function onDblClick() { resetView(); }
        function onPointerEnter() { hovering = true; }
        function onPointerLeave() { hovering = false; }
        function onKeyDown(e: KeyboardEvent) {
            if (!hovering) return;   /* only while the pointer is over the canvas, so page keys are never hijacked */
            const step = 0.14;
            if (e.key === "i" || e.key === "I") setInspect(!inspect);
            else if (e.key === " ") { e.preventDefault(); playing = !playing; last = null; }
            else if (e.key === "Escape") { mouse = null; tip.style.display = "none"; drawOverlay(); }
            else if (e.key === "ArrowRight") applyRot(step, 0);
            else if (e.key === "ArrowLeft") applyRot(-step, 0);
            else if (e.key === "ArrowDown") applyRot(0, step);
            else if (e.key === "ArrowUp") applyRot(0, -step);
            else if (e.key === "r" || e.key === "R") resetView();
            else return;
            e.preventDefault();
        }

        cv.addEventListener("pointerdown", onPointerDown);
        cv.addEventListener("pointermove", onPointerMove);
        cv.addEventListener("pointerup", endDrag);
        cv.addEventListener("pointercancel", endDrag);
        cv.addEventListener("mouseleave", onMouseLeave);
        cv.addEventListener("dblclick", onDblClick);
        cv.addEventListener("pointerenter", onPointerEnter);
        cv.addEventListener("pointerleave", onPointerLeave);
        window.addEventListener("keydown", onKeyDown);

        ro = new ResizeObserver(function () { resize(); render(); });
        ro.observe(root);

        if (typeof IntersectionObserver !== "undefined") {
            io = new IntersectionObserver(function (entries) { for (const en of entries) visible = en.isIntersecting; }, { rootMargin: "120px 0px" });
            io.observe(root);
        } else {
            visible = true;
        }

        (window as any).__duration = LOOP_T;
        (window as any).__fps = 60;
        (window as any).__count = Math.ceil(LOOP_T * 60) + 1;
        (window as any).__seek = function (s: number) { playing = false; t = Math.max(0, s); render(); };
        (window as any).__play = function () { playing = true; last = null; };
        (window as any).__pause = function () { playing = false; };
        (window as any).__rotate = function (yaw: number, pitch: number) { applyRot(yaw, pitch); render(); };
        (window as any).__reset = resetView;
        (window as any).__inspect = setInspect;
        (window as any).__ready = true;

        resize(); render();
        rafId = requestAnimationFrame(frame);

        return () => {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
            if (ro) ro.disconnect();
            if (io) io.disconnect();
            cv.removeEventListener("pointerdown", onPointerDown);
            cv.removeEventListener("pointermove", onPointerMove);
            cv.removeEventListener("pointerup", endDrag);
            cv.removeEventListener("pointercancel", endDrag);
            cv.removeEventListener("mouseleave", onMouseLeave);
            cv.removeEventListener("dblclick", onDblClick);
            cv.removeEventListener("pointerenter", onPointerEnter);
            cv.removeEventListener("pointerleave", onPointerLeave);
            window.removeEventListener("keydown", onKeyDown);
            /* Release our GL objects, but NEVER loseContext(): a canvas hands back
               the same context object for its lifetime, so React StrictMode's
               mount -> cleanup -> mount would reuse a force-lost context and the
               shaders would come back null, wrongly showing the WebGL fallback.
               Deleting the program/shaders/buffer frees the GPU objects while
               leaving the context alive for the remount. */
            gl.deleteProgram(prog);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteBuffer(buf);
            delete (window as any).__duration;
            delete (window as any).__fps;
            delete (window as any).__count;
            delete (window as any).__seek;
            delete (window as any).__play;
            delete (window as any).__pause;
            delete (window as any).__rotate;
            delete (window as any).__reset;
            delete (window as any).__inspect;
            delete (window as any).__ready;
        };
    }, []);

    return (
        <div ref={rootRef} className={`uranus-root ${className}`} style={style}>
            <canvas
                ref={cvRef}
                className="uranus-canvas uranus-gl"
                tabIndex={0}
                aria-label="Uranus. Drag to turn the planet in any direction."
            />
            <canvas ref={ovRef} className="uranus-canvas uranus-ov" aria-hidden="true" />
            <div className="uranus-header">
                <div className="uranus-legend">
                    <span className="uranus-chip"><i style={{ background: "#5fd3e0" }} />Atmosphere</span>
                    <span className="uranus-chip"><i style={{ background: "#8a90a6" }} />Ring bands</span>
                    <span className="uranus-chip"><i style={{ background: "#eaf6ff" }} />Ring particles</span>
                    <span className="uranus-chip"><i style={{ background: "#ffd479" }} />Spin axis</span>
                </div>
            </div>
            <div ref={tipRef} className="uranus-tip" role="status" />
            <div ref={fallbackRef} className="uranus-fallback">WebGL is not available in this browser, so the planet cannot be drawn.</div>
        </div>
    );
};

export default UranusAnimation;
