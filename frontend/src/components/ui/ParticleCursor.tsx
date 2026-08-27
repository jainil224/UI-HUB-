// Confetti Cursor — UI HUB
// Using component defaults.

"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    age: number;
    color: string;
};

type ParticleCursorProps = {
    label?: boolean;
    labelText?: string;
    labelColor?: string;
    labelFont?: React.CSSProperties;
    dotColor?: string;
    dotSize?: number;
    colors?: string[];
    particleCount?: number;
    particleSize?: number;
    particleSpeed?: number;
    gravity?: number;
    style?: React.CSSProperties;
};

const DEFAULT_LABEL_FONT: React.CSSProperties = {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: "48px",
    lineHeight: "1.5em",
    letterSpacing: "0em",
    textAlign: "left",
};

const DEFAULT_COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
];

// Seconds a particle lives before it has fully faded.
const LIFETIME = 2;
// px of jitter around the pointer at spawn.
const SPREAD = 0;
// Bursts are throttled to this rate, not to one per pointer event.
const SPAWN_HZ = 60;
const MAX_PARTICLES = 1200;

// Sampled cubic-bezier for the fixed fade curve (tween, easeInOut-ish [0.4,0,0.2,1]).
function makeEaseFn(x1: number, y1: number, x2: number, y2: number) {
    const bez = (a: number, b: number, t: number) => {
        const u = 1 - t;
        return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
    };
    return (t: number) => {
        const x = Math.max(0, Math.min(1, t));
        let s = x;
        for (let i = 0; i < 8; i++) {
            const cx = bez(x1, x2, s) - x;
            const u = 1 - s;
            const dx =
                3 * u * u * x1 + 6 * u * s * (x2 - x1) + 3 * s * s * (1 - x2);
            if (Math.abs(dx) < 1e-6) break;
            s -= cx / dx;
            s = Math.max(0, Math.min(1, s));
        }
        return bez(y1, y2, s);
    };
}

const fadeEase = makeEaseFn(0.4, 0, 0.2, 1);

export function ParticleCursor({
    dotColor = "#FFFFFF",
    dotSize = 4,
    colors = DEFAULT_COLORS,
    particleCount = 8,
    particleSize = 4,
    particleSpeed = 3,
    gravity = 10,
    label = true,
    labelText = "HOVER AROUND",
    labelColor = "#FFFFFF",
    labelFont,
    style,
}: ParticleCursorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const live = useRef({
        colors,
        dotColor,
        dotSize,
        particleCount,
        particleSize,
        particleSpeed,
        gravity,
    });
    live.current = {
        colors,
        dotColor,
        dotSize,
        particleCount,
        particleSize,
        particleSpeed,
        gravity,
    };

    const resolvedLabelFont = { ...DEFAULT_LABEL_FONT, ...labelFont };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = 1;
        let h = 1;
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = Math.max(1, canvas.clientWidth);
            h = Math.max(1, canvas.clientHeight);
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        let particles: Particle[] = [];
        let mouseX = -9999;
        let mouseY = -9999;
        let inside = false;
        let spawnAcc = 0;
        let pending = false;

        const styleTag = document.createElement("style");
        styleTag.textContent = `*, a, button, [role="button"] { cursor: none !important; }`;
        let cursorHidden = false;
        const hideNativeCursor = (hide: boolean) => {
            if (hide === cursorHidden) return;
            cursorHidden = hide;
            if (hide) document.head.appendChild(styleTag);
            else styleTag.remove();
        };

        const onMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            const sx = rect.width > 0 ? canvas.clientWidth / rect.width : 1;
            const sy = rect.height > 0 ? canvas.clientHeight / rect.height : 1;
            const x = (e.clientX - rect.left) * sx;
            const y = (e.clientY - rect.top) * sy;
            inside = x >= 0 && x <= w && y >= 0 && y <= h;
            mouseX = x;
            mouseY = y;
            hideNativeCursor(inside);
            if (inside) {
                pending = true;
                canvas.style.opacity = "1";
            }
        };
        const onWindowLeave = () => {
            inside = false;
            hideNativeCursor(false);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onWindowLeave);

        const spawn = () => {
            const p = live.current;
            const palette = p.colors.length ? p.colors : DEFAULT_COLORS;
            const count = Math.max(1, p.particleCount);
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = (Math.random() * p.particleSpeed + 1) * 30;
                particles.push({
                    x: mouseX + (Math.random() - 0.5) * SPREAD,
                    y: mouseY + (Math.random() - 0.5) * SPREAD,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * p.particleSize + 2,
                    age: 0,
                    color: palette[Math.floor(Math.random() * palette.length)],
                });
            }
            if (particles.length > MAX_PARTICLES) {
                particles = particles.slice(-MAX_PARTICLES);
            }
        };

        let raf = 0;
        let last = performance.now();
        let clock = 0;

        const frame = (now: number) => {
            const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
            last = now;
            clock += dt;
            const p = live.current;
            const life = LIFETIME;
            const g = p.gravity * 36;

            spawnAcc += dt;
            const step = 1 / SPAWN_HZ;
            while (spawnAcc >= step) {
                spawnAcc -= step;
                if (pending) {
                    spawn();
                    pending = false;
                }
            }

            ctx.clearRect(0, 0, w, h);

            const survivors: Particle[] = [];
            for (const q of particles) {
                q.age += dt;
                if (q.age >= life) continue;

                const drag = Math.pow(0.98, dt * 60);
                q.vx *= drag;
                q.vy = q.vy * drag + g * dt;
                q.x += q.vx * dt;
                q.y += q.vy * dt;

                const t = q.age / life;
                const alpha = 1 - fadeEase(t);
                if (alpha <= 0.01) continue;
                const grow = Math.min(1, q.age / 0.12);
                const size = q.size * grow * (1 - t * 0.2);
                if (size < 0.3) continue;

                ctx.globalAlpha = alpha;
                ctx.fillStyle = q.color;
                ctx.beginPath();
                ctx.arc(q.x, q.y, size / 2, 0, Math.PI * 2);
                ctx.fill();
                survivors.push(q);
            }
            particles = survivors;
            ctx.globalAlpha = 1;

            if (inside) {
                const pulse = 1 + Math.sin(clock * 10) * 0.25;
                ctx.fillStyle = p.dotColor;
                ctx.beginPath();
                ctx.arc(mouseX, mouseY, (p.dotSize / 2) * pulse, 0, Math.PI * 2);
                ctx.fill();
            }

            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            hideNativeCursor(false);
            ro.disconnect();
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener(
                "pointerleave",
                onWindowLeave
            );
            styleTag.remove();
        };
    }, []);

    const labelNode = label ? (
        <div
            style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                whiteSpace: "pre",
                pointerEvents: "none",
                userSelect: "none",
                ...resolvedLabelFont,
                color: labelColor,
            }}
        >
            {labelText}
        </div>
    ) : null;

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                pointerEvents: "none",
                ...style,
            }}
        >
            {labelNode}
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                    opacity: 0,
                    pointerEvents: "none",
                }}
            />
        </div>
    );
}

export default ParticleCursor;
