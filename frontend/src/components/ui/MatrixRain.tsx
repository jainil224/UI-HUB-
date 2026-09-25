"use client";
import * as React from "react";

export interface MatrixRainProps {
    background?: string;
    glyphs?: string;
    fontSize?: number;
    speed?: number;
    density?: number;
    wind?: number;
    color?: string;
    highlightColor?: string;
    fade?: number;
    interactive?: boolean;
    seed?: number;
    style?: React.CSSProperties;
}

interface MatrixCell {
    char: string;
}

interface MatrixColumn {
    x: number;
    head: number;
    cells: MatrixCell[];
    speed: number;
    drift: number;
}

type Rng = () => number;

const DEFAULT_GLYPHS = "アァカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const RAIN_DEFAULTS = {
    background: "#0A0A0A",
    glyphs: DEFAULT_GLYPHS,
    fontSize: 18,
    speed: 55,
    density: 65,
    wind: 0,
    color: "#3D5CFF",
    highlightColor: "#FFFFFF",
    fade: 0.08,
    interactive: true,
    seed: 1,
};

const MAX_DPR = 2;
const MAX_COLUMNS = 160;

function clamp(v: number, lo: number, hi: number) {
    return v < lo ? lo : v > hi ? hi : v;
}

function makeRng(seed: number): Rng {
    let s = seed >>> 0 || 1;
    return function () {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

function withColor(input: string, alpha: number): string {
    const a = clamp(alpha, 0, 1);
    const s = input.trim();
    const hex = /^#([0-9a-f]{6})$/i.exec(s) || /^#([0-9a-f]{3})$/i.exec(s);
    if (hex) {
        let h = hex[1];
        if (h.length === 3) h = h.split("").map((c) => c + c).join("");
        const n = parseInt(h, 16);
        return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
    }
    const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/.exec(s);
    if (rgb) return "rgba(" + rgb[1] + "," + rgb[2] + "," + rgb[3] + "," + a + ")";
    return "rgba(10,10,10," + a + ")";
}

export default function MatrixRain(props: MatrixRainProps) {
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const rafRef = React.useRef<number>(0);
    const stateRef = React.useRef<{ columns: MatrixColumn[]; glyphs: string[]; w: number; h: number }>({
        columns: [],
        glyphs: [],
        w: 0,
        h: 0,
    });
    const propsRef = React.useRef(props);
    propsRef.current = props;

    React.useEffect(() => {
        const wrapper = wrapperRef.current;
        const canvas = canvasRef.current;
        if (!wrapper || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const state = stateRef.current;
        const rng = makeRng(props.seed ?? RAIN_DEFAULTS.seed);
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        let running = !reduced.matches;
        let last = performance.now();

        const build = (w: number, h: number, size: number) => {
            const p = propsRef.current;
            const density = clamp(p.density ?? RAIN_DEFAULTS.density, 0, 100);
            const count = Math.min(MAX_COLUMNS, Math.max(1, Math.round((w / size) * (density / 100))));
            const trail = Math.max(1, Math.round(density / 6));
            const glyphs = (p.glyphs ?? RAIN_DEFAULTS.glyphs).split("");
            const columns: MatrixColumn[] = [];
            for (let i = 0; i < count; i++) {
                const cells: MatrixCell[] = [];
                for (let j = 0; j < trail; j++) cells.push({ char: glyphs[(rng() * glyphs.length) | 0] || "0" });
                columns.push({
                    x: (i + 0.5) * (w / count),
                    head: -rng() * h,
                    cells,
                    speed: 60 + rng() * 240,
                    drift: 0,
                });
            }
            state.columns = columns;
            state.glyphs = glyphs;
            state.w = w;
            state.h = h;
        };

        const drawStatic = () => {
            ctx.clearRect(0, 0, state.w, state.h);
            const p = propsRef.current;
            const size = clamp(p.fontSize ?? RAIN_DEFAULTS.fontSize, 10, 64);
            ctx.font = "bold " + size + "px ui-monospace, SFMono-Regular, Menlo, monospace";
            ctx.textAlign = "center";
            for (const col of state.columns) {
                for (let j = 0; j < col.cells.length; j++) {
                    const y = col.head - j * size;
                    if (y < -size || y > state.h + size) continue;
                    ctx.fillStyle = j === 0 ? withColor(p.highlightColor ?? RAIN_DEFAULTS.highlightColor, 1) : withColor(p.color ?? RAIN_DEFAULTS.color, 0.85);
                    ctx.fillText(col.cells[j].char, col.x + col.drift, y);
                }
            }
        };

        const resize = () => {
            const p = propsRef.current;
            const size = clamp(p.fontSize ?? RAIN_DEFAULTS.fontSize, 10, 64);
            const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
            const rect = wrapper.getBoundingClientRect();
            const w = Math.max(1, Math.round(rect.width));
            const h = Math.max(1, Math.round(rect.height));
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            build(w, h, size);
            drawStatic();
        };

        const loop = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const p = propsRef.current;
            const size = clamp(p.fontSize ?? RAIN_DEFAULTS.fontSize, 10, 64);
            const fade = clamp(p.fade ?? RAIN_DEFAULTS.fade, 0, 0.25);
            ctx.font = "bold " + size + "px ui-monospace, SFMono-Regular, Menlo, monospace";
            ctx.textAlign = "center";
            ctx.fillStyle = withColor(p.background ?? RAIN_DEFAULTS.background, fade);
            ctx.fillRect(0, 0, state.w, state.h);
            for (const col of state.columns) {
                col.head += col.speed * 0.5 * (p.speed ?? RAIN_DEFAULTS.speed) / 100 * dt * 10;
                col.drift += (p.wind ?? RAIN_DEFAULTS.wind) * size * dt * 60;
                for (let j = 0; j < col.cells.length; j++) {
                    const y = col.head - j * size;
                    if (y < -size) continue;
                    if (y > state.h + size) break;
                    ctx.fillStyle = j === 0 ? withColor(p.highlightColor ?? RAIN_DEFAULTS.highlightColor, 1) : withColor(p.color ?? RAIN_DEFAULTS.color, 0.85);
                    ctx.fillText(col.cells[j].char, col.x + col.drift, y);
                }
                if (col.head - (col.cells.length - 1) * size > state.h) {
                    col.head = -rng() * state.h;
                    col.speed = 60 + rng() * 240;
                    col.drift = 0;
                    for (let j = 0; j < col.cells.length; j++) {
                        if (rng() < 0.6) col.cells[j].char = state.glyphs[(rng() * state.glyphs.length) | 0] || "0";
                    }
                }
            }
            if (running) rafRef.current = requestAnimationFrame(loop);
        };

        const onPointer = (e: PointerEvent) => {
            const p = propsRef.current;
            if (p.interactive === false) return;
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            let best = 0;
            let bestD = Infinity;
            for (let i = 0; i < state.columns.length; i++) {
                const d = Math.abs(state.columns[i].x - x);
                if (d < bestD) { bestD = d; best = i; }
            }
            const col = state.columns[best];
            if (col) {
                const flash: MatrixCell = { char: state.glyphs[(rng() * state.glyphs.length) | 0] || "0" };
                col.cells.unshift(flash);
                if (col.cells.length > 1) col.cells.pop();
                col.head = Math.max(0.5 * state.h, e.clientY - rect.top);
                col.speed = 240;
            }
        };

        const onReduceChange = (e: MediaQueryListEvent) => {
            if (e.matches) {
                running = false;
                cancelAnimationFrame(rafRef.current);
                drawStatic();
            } else {
                running = true;
                last = performance.now();
                rafRef.current = requestAnimationFrame(loop);
            }
        };

        const onVisibility = () => {
            if (document.hidden) {
                running = false;
                cancelAnimationFrame(rafRef.current);
            } else if (!reduced.matches) {
                running = true;
                last = performance.now();
                rafRef.current = requestAnimationFrame(loop);
            }
        };

        const ro = new ResizeObserver(resize);
        ro.observe(wrapper);
        resize();
        reduced.addEventListener("change", onReduceChange);
        document.addEventListener("visibilitychange", onVisibility);
        wrapper.addEventListener("pointermove", onPointer);
        wrapper.addEventListener("pointerdown", onPointer);
        if (running) rafRef.current = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(rafRef.current);
            ro.disconnect();
            reduced.removeEventListener("change", onReduceChange);
            document.removeEventListener("visibilitychange", onVisibility);
            wrapper.removeEventListener("pointermove", onPointer);
            wrapper.removeEventListener("pointerdown", onPointer);
        };
    }, [props.seed]);

    return (
        <div
            ref={wrapperRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                backgroundColor: props.background ?? RAIN_DEFAULTS.background,
                touchAction: "none",
                ...props.style,
            }}
        >
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                style={{ position: "absolute", inset: 0, display: "block", pointerEvents: "none" }}
            />
        </div>
    );
}