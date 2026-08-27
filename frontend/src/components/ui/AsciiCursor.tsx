// Ascii Cursor — UI HUB
// A character-based canvas cursor that scrambles ASCII glyphs as it trails the pointer.

"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]|:;<>,.?/~";

type AsciiCursorProps = {
    label?: boolean;
    labelText?: string;
    labelColor?: string;
    labelFont?: React.CSSProperties;
    cellSize?: number;
    radius?: number;
    density?: number;
    hold?: number;
    boxColor?: string;
    textColor?: string;
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

const DEFAULTS = {
    label: false,
    labelText: "HOVER ME",
    labelColor: "#FFFFFF",
    cellSize: 18,
    radius: 50,
    density: 20,
    hold: 12,
    boxColor: "#EC5228",
    textColor: "#E9E3DF",
};

type Cell = {
    char: string;
    activeAt: number;
    delay: number;
    duration: number;
    hidden: boolean;
    box: string;
    text: string;
};

function AsciiCursorBase(props: AsciiCursorProps) {
    const {
        cellSize = DEFAULTS.cellSize,
        radius = DEFAULTS.radius,
        density = DEFAULTS.density,
        hold = DEFAULTS.hold,
        boxColor = DEFAULTS.boxColor,
        textColor = DEFAULTS.textColor,
        label = DEFAULTS.label,
        labelText = DEFAULTS.labelText,
        labelColor = DEFAULTS.labelColor,
        style,
    } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Live props for the rAF loop — mutated in place so a control tweak never
    // restarts the loop or reallocates the grid.
    const live = useRef({
        radius,
        density,
        hold,
        boxColor,
        textColor,
    });
    live.current = {
        radius,
        density,
        hold,
        boxColor,
        textColor,
    };

    const labelFont = { ...DEFAULT_LABEL_FONT, ...props.labelFont };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const cell = Math.max(8, cellSize);
        let w = 1;
        let h = 1;
        let cols = 1;
        let rows = 1;
        let grid: Cell[] = [];
        // Only the lit cells are visited each frame rather than sweeping the
        // whole grid to find the few dozen alive.
        let activeCells = new Set<number>();

        const rebuild = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = Math.max(1, canvas.clientWidth);
            h = Math.max(1, canvas.clientHeight);
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            cols = Math.max(1, Math.ceil(w / cell) + 1);
            rows = Math.max(1, Math.ceil(h / cell) + 1);
            grid = new Array(cols * rows);
            for (let i = 0; i < grid.length; i++) {
                grid[i] = {
                    char: " ",
                    activeAt: 0,
                    delay: 0.05,
                    duration: 0.25,
                    hidden: false,
                    box: "",
                    text: "",
                };
            }
            activeCells = new Set();
        };
        rebuild();
        const ro = new ResizeObserver(rebuild);
        ro.observe(canvas);

        let mouseX = -1e4;
        let mouseY = -1e4;
        let trailX = -1e4;
        let trailY = -1e4;

        // The native cursor is only replaced while the pointer is over this
        // frame — hiding it document-wide would blank it over the whole page
        // for a component that only owns its own section.
        const previousCursor = document.documentElement.style.cursor;
        let cursorHidden = false;
        const hideNativeCursor = (hide: boolean) => {
            if (hide === cursorHidden) return;
            cursorHidden = hide;
            document.documentElement.style.cursor = hide
                ? "none"
                : previousCursor;
        };

        // Tracked on the document, not on the canvas: the canvas passes events
        // through, so a bounding-rect hit test is used to convert into local
        // coordinates.
        const onMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            const inside =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;
            if (inside) {
                const sx = rect.width > 0 ? canvas.clientWidth / rect.width : 1;
                const sy =
                    rect.height > 0 ? canvas.clientHeight / rect.height : 1;
                mouseX = (e.clientX - rect.left) * sx;
                mouseY = (e.clientY - rect.top) * sy;
                canvas.style.opacity = "1";
            } else {
                mouseX = -1e4;
                mouseY = -1e4;
            }
            hideNativeCursor(inside);
        };
        const onLeave = () => {
            mouseX = -1e4;
            mouseY = -1e4;
            hideNativeCursor(false);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerleave", onLeave);

        let visible = true;
        const io = new IntersectionObserver(
            (entries) => {
                visible =
                    (entries[0]?.isIntersecting ?? true) && !document.hidden;
            },
            { threshold: 0 }
        );
        io.observe(canvas);
        const onVisibility = () => {
            visible = !document.hidden;
        };
        document.addEventListener("visibilitychange", onVisibility);

        let raf = 0;
        let last = performance.now();

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame);
            if (!visible) {
                last = now;
                return;
            }
            // Clamp dt so a backgrounded tab does not expire the whole grid at
            // once.
            const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
            last = now;
            const p = live.current;
            const t = now / 1000;

            let moving = false;
            if (mouseX <= -1e4) {
                trailX = -1e4;
                trailY = -1e4;
            } else if (trailX <= -1e4) {
                trailX = mouseX;
                trailY = mouseY;
            } else {
                const dx = mouseX - trailX;
                const dy = mouseY - trailY;
                if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                    const ease = 1 - Math.exp(-dt / 0.004);
                    trailX += dx * ease;
                    trailY += dy * ease;
                    moving = true;
                } else {
                    trailX = mouseX;
                    trailY = mouseY;
                }
            }

            if (moving) {
                const box = p.boxColor;
                const text = p.textColor;

                const r = Math.max(1, p.radius);
                const rSq = r * r;
                const impact = p.density / 8;
                const holdScale = Math.max(0.1, p.hold / 10);
                const startCol = Math.max(0, Math.floor((trailX - r) / cell));
                const endCol = Math.min(
                    cols - 1,
                    Math.ceil((trailX + r) / cell)
                );
                const startRow = Math.max(0, Math.floor((trailY - r) / cell));
                const endRow = Math.min(
                    rows - 1,
                    Math.ceil((trailY + r) / cell)
                );

                for (let c = startCol; c <= endCol; c++) {
                    for (let rw = startRow; rw <= endRow; rw++) {
                        const cx = c * cell + cell / 2;
                        const cy = rw * cell + cell / 2;
                        const dx = trailX - cx;
                        const dy = trailY - cy;
                        const distSq = dx * dx + dy * dy;
                        if (distSq >= rSq) continue;

                        const falloff = Math.pow(1 - Math.sqrt(distSq) / r, 1.5);
                        if (Math.random() >= falloff * impact) continue;

                        const idx = c * rows + rw;
                        const cellData = grid[idx];
                        if (!cellData) continue;
                        if (
                            cellData.activeAt === 0 ||
                            t - cellData.activeAt > 0.2
                        ) {
                            cellData.delay =
                                (0.03 + Math.random() * 0.05) * holdScale;
                            cellData.duration =
                                (0.1 + Math.random() * 0.15) * holdScale;
                            cellData.hidden = Math.random() < 0.04;
                        }
                        cellData.activeAt = t;
                        if (cellData.char === " " || Math.random() < 0.15) {
                            cellData.char =
                                POOL[Math.floor(Math.random() * POOL.length)];
                        }
                        cellData.box = box;
                        cellData.text = text;
                        activeCells.add(idx);
                    }
                }
            }

            ctx.clearRect(0, 0, w, h);
            ctx.font = `600 ${cell - 6}px monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Re-scramble at a rate per second rather than a per-frame chance.
            const scramble = 1 - Math.exp(-7.2 * dt);

            for (const idx of activeCells) {
                const cellData = grid[idx];
                if (!cellData || cellData.activeAt === 0) {
                    activeCells.delete(idx);
                    continue;
                }
                const elapsed = t - cellData.activeAt;
                if (elapsed >= cellData.delay + cellData.duration) {
                    cellData.char = " ";
                    cellData.activeAt = 0;
                    cellData.hidden = false;
                    activeCells.delete(idx);
                    continue;
                }
                if (cellData.hidden) continue;

                const c = Math.floor(idx / rows);
                const rw = idx % rows;
                if (elapsed >= cellData.delay && Math.random() < scramble) {
                    cellData.char =
                        POOL[Math.floor(Math.random() * POOL.length)];
                }
                const x = c * cell;
                const y = rw * cell;
                ctx.fillStyle = cellData.box || p.boxColor;
                ctx.fillRect(x, y, cell, cell);
                ctx.fillStyle = cellData.text || p.textColor;
                ctx.fillText(cellData.char, x + cell / 2, y + cell / 2);
            }
        };
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            hideNativeCursor(false);
            ro.disconnect();
            io.disconnect();
            window.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerleave", onLeave);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [cellSize]);

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
                ...labelFont,
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

const asciiCursorPresetProps = {
    label: true,
};

export function AsciiCursor(props: Record<string, unknown>) {
    return <AsciiCursorBase {...(asciiCursorPresetProps as Record<string, unknown>)} {...props} />;
}

export default AsciiCursor;
