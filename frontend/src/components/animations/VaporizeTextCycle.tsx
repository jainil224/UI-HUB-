"use client";

import React, {
    useRef,
    useEffect,
    useState,
    createElement,
    useMemo,
    useCallback,
    memo,
} from "react";

export interface VaporizeTextCycleFont {
    fontFamily?: string;
    variant?: string;
    fontWeight?: number | string;
    fontSize?: number | string;
    lineHeight?: number;
    letterSpacing?: number;
    textAlign?: string;
}

export interface VaporizeTextCycleTransition {
    type?: string;
    duration?: number;
    ease?: string | number[];
    delay?: number;
}

export interface VaporizeTextCyclePhaseConfig {
    mode?: "particle" | "opacity";
    order?: "together" | "left-to-right" | "right-to-left";
    transition?: VaporizeTextCycleTransition;
}

export interface VaporizeTextCycleProps {
    texts?: string[];
    font?: VaporizeTextCycleFont;
    color?: string;
    spread?: number;
    density?: number;
    appear?: VaporizeTextCyclePhaseConfig;
    disappear?: VaporizeTextCyclePhaseConfig;
    alignment?: "left" | "center" | "right";
    tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span";
    className?: string;
    style?: React.CSSProperties;
}

function useInView(ref: React.RefObject<HTMLElement | null>, margin = "50px") {
    const [inView, setInView] = useState(true);
    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === "undefined") return;
        const io = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { rootMargin: margin }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [ref, margin]);
    return inView;
}

const TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "span"] as const;

const NAMED_EASES: Record<string, [number, number, number, number]> = {
    linear: [0, 0, 1, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
};

function cubicBezierEase(x1: number, y1: number, x2: number, y2: number) {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
    const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
    return (p: number) => {
        let t = p;
        for (let i = 0; i < 8; i++) {
            const x = sampleX(t) - p;
            const d = dX(t);
            if (Math.abs(x) < 1e-4 || Math.abs(d) < 1e-6) break;
            t -= x / d;
        }
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return sampleY(t);
    };
}

function makeEase(ease: any) {
    if (Array.isArray(ease) && ease.length === 4)
        return cubicBezierEase(ease[0], ease[1], ease[2], ease[3]);
    const b =
        (typeof ease === "string" && NAMED_EASES[ease]) || NAMED_EASES.easeOut;
    return cubicBezierEase(b[0], b[1], b[2], b[3]);
}

const durationOf = (transition: any, fallback: number) =>
    typeof transition?.duration === "number" ? transition.duration : fallback;
const delayOf = (transition: any, fallback: number) =>
    typeof transition?.delay === "number" ? transition.delay : fallback;

const DRIFT_REACH = 45;
const SWEEP_SPAN = 0.6;

export const DEFAULT_PROPS: Required<
    Pick<
        VaporizeTextCycleProps,
        | "texts"
        | "font"
        | "color"
        | "spread"
        | "density"
        | "appear"
        | "disappear"
        | "alignment"
        | "tag"
    >
> = {
    texts: ["TEXT", "VAPORIZE"],
    font: {
        fontFamily: "Inter, system-ui, sans-serif",
        variant: "Regular",
        fontWeight: 600,
        fontSize: 72,
        lineHeight: 1,
        letterSpacing: 0,
        textAlign: "center",
    },
    color: "#FFFFFF",
    spread: 20,
    density: 10,
    appear: {
        mode: "particle",
        order: "left-to-right",
        transition: { type: "tween", duration: 1, ease: "easeOut" },
    },
    disappear: {
        mode: "particle",
        order: "together",
        transition: {
            type: "tween",
            duration: 1.6,
            ease: "easeOut",
            delay: 0.8,
        },
    },
    alignment: "center",
    tag: "h1",
};

export const VaporizeTextCycle: React.FC<VaporizeTextCycleProps> = (props = {}) => {
    const texts = props.texts ?? DEFAULT_PROPS.texts;
    const font = props.font ?? DEFAULT_PROPS.font;
    const color = props.color ?? DEFAULT_PROPS.color;
    const spread = props.spread ?? DEFAULT_PROPS.spread;
    const density = props.density ?? DEFAULT_PROPS.density;
    const appear = props.appear ?? DEFAULT_PROPS.appear;
    const disappear = props.disappear ?? DEFAULT_PROPS.disappear;
    const alignment = props.alignment ?? DEFAULT_PROPS.alignment;
    const tag = props.tag ?? DEFAULT_PROPS.tag;
    const className = props.className;
    const style = props.style;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const isInView = useInView(wrapperRef, "50px");
    const lastFontRef = useRef<any>(null);
    const particlesRef = useRef<any[]>([]);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const phaseRef = useRef<"out" | "in" | "hold">("in");
    const phaseTimeRef = useRef(0);
    const scatterArrRef = useRef<any>(null);
    const startsArrRef = useRef<any>(null);
    const startsKeyRef = useRef("");
    const holdDrawnRef = useRef(false);
    const { wrapperSize, setWrapperSize } = useWrapperSize();
    const transformedDensity = transformValue(density, [0, 10], [0.3, 1], true);

    const globalDpr = useMemo(() => {
        if (typeof window === "undefined") return 1;
        return Math.min(2, window.devicePixelRatio || 1);
    }, []);

    const wrapperStyle = useMemo<React.CSSProperties>(
        () => ({
            width: "100%",
            height: "100%",
            minHeight: "260px",
            pointerEvents: "none",
            position: "relative",
            overflow: "visible",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...style,
        }),
        [style]
    );

    const canvasStyle = useMemo<React.CSSProperties>(
        () => ({
            position: "absolute",
            pointerEvents: "none",
        }),
        []
    );

    const timing = useMemo(
        () => ({
            outMode: disappear?.mode ?? "particle",
            outOrder: disappear?.order ?? "left-to-right",
            outDuration: Math.max(0.01, durationOf(disappear?.transition, 1.6)),
            outEase: makeEase(disappear?.transition?.ease),
            inMode: appear?.mode ?? "particle",
            inOrder: appear?.order ?? "together",
            inDuration: Math.max(0.01, durationOf(appear?.transition, 1)),
            inEase: makeEase(appear?.transition?.ease),
            hold: Math.max(0, delayOf(disappear?.transition, 0.8)),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(disappear), JSON.stringify(appear)]
    );

    const fontConfig = useMemo(() => {
        const fontSize = parseInt(
            String(font?.fontSize ?? "72").replace("px", "")
        ) || 72;
        const VAPORIZE_SPREAD = calculateVaporizeSpread(fontSize);
        const MULTIPLIED_VAPORIZE_SPREAD = VAPORIZE_SPREAD * spread;
        return {
            fontSize,
            VAPORIZE_SPREAD,
            MULTIPLIED_VAPORIZE_SPREAD,
            font: `${font?.fontWeight ?? 600} ${fontSize * globalDpr}px ${font?.fontFamily || "Inter, sans-serif"}`,
        };
    }, [font?.fontSize, font?.fontWeight, font?.fontFamily, spread, globalDpr]);

    const bufferRef = useRef<ImageData | null>(null);
    const memoizedRenderParticles = useCallback(
        (ctx: any, particles: any, canvas: any) => {
            renderParticles(ctx, particles, globalDpr, bufferRef, canvas);
        },
        [globalDpr]
    );

    const liveRef = useRef<any>(null);
    liveRef.current = {
        timing,
        textCount: texts?.length ?? 1,
        spread: fontConfig.MULTIPLIED_VAPORIZE_SPREAD,
        density: transformedDensity,
        globalDpr,
    };

    useEffect(() => {
        if (!isInView) return;
        let lastTime = performance.now();
        let frameId: number;
        const animate = (currentTime: number) => {
            const dt = Math.min((currentTime - lastTime) / 1e3, 0.1);
            lastTime = currentTime;
            const canvas = canvasRef.current as any;
            const ctx = canvas?.getContext("2d");
            const particles = particlesRef.current;
            if (!canvas || !ctx || !particles.length) {
                frameId = requestAnimationFrame(animate);
                return;
            }
            const live = liveRef.current;
            const t = live.timing;
            phaseTimeRef.current += dt;

            if (phaseRef.current === "out") {
                const p = Math.min(1, phaseTimeRef.current / t.outDuration);
                const e = t.outEase(p);
                if (
                    startsArrRef.current !== particles ||
                    startsKeyRef.current !== `out|${t.outOrder}`
                ) {
                    assignStarts(particles, canvas.textBoundaries, t.outOrder);
                    startsArrRef.current = particles;
                    startsKeyRef.current = `out|${t.outOrder}`;
                }
                const done = p >= 1;
                if (t.outMode === "particle") {
                    updateParticles(particles, e, live.spread, live.density);
                } else {
                    for (let i = 0; i < particles.length; i++) {
                        const particle = particles[i];
                        particle.x = particle.originalX;
                        particle.y = particle.originalY;
                        const local = localProgress(e, particle.start);
                        particle.opacity = particle.originalAlpha * (1 - local);
                    }
                }
                memoizedRenderParticles(ctx, particles, canvas);
                if (done) {
                    setCurrentTextIndex(
                        (prev) => (prev + 1) % Math.max(1, live.textCount)
                    );
                    phaseRef.current = "in";
                    phaseTimeRef.current = 0;
                    scatterArrRef.current = null;
                    startsArrRef.current = null;
                    startsKeyRef.current = "";
                }
            } else if (phaseRef.current === "in") {
                const p = Math.min(1, phaseTimeRef.current / t.inDuration);
                const e = t.inEase(p);
                if (
                    startsArrRef.current !== particles ||
                    startsKeyRef.current !== `in|${t.inOrder}`
                ) {
                    assignStarts(particles, canvas.textBoundaries, t.inOrder);
                    startsArrRef.current = particles;
                    startsKeyRef.current = `in|${t.inOrder}`;
                }
                if (t.inMode === "particle") {
                    if (scatterArrRef.current !== particles) {
                        assignScatter(particles, live.spread);
                        scatterArrRef.current = particles;
                    }
                    for (let i = 0; i < particles.length; i++) {
                        const particle = particles[i];
                        const local = localProgress(e, particle.start);
                        particle.x =
                            particle.scatterX +
                            (particle.originalX - particle.scatterX) * local;
                        particle.y =
                            particle.scatterY +
                            (particle.originalY - particle.scatterY) * local;
                        particle.opacity = particle.originalAlpha * local;
                    }
                } else {
                    for (let i = 0; i < particles.length; i++) {
                        const particle = particles[i];
                        particle.x = particle.originalX;
                        particle.y = particle.originalY;
                        const local = localProgress(e, particle.start);
                        particle.opacity = particle.originalAlpha * local;
                    }
                }
                memoizedRenderParticles(ctx, particles, canvas);
                if (p >= 1) {
                    resetParticles(particles);
                    phaseRef.current = "hold";
                    phaseTimeRef.current = 0;
                    startsKeyRef.current = "";
                }
            } else {
                if (!holdDrawnRef.current) {
                    memoizedRenderParticles(ctx, particles, canvas);
                    holdDrawnRef.current = true;
                }
                if (phaseTimeRef.current >= t.hold) {
                    resetParticles(particles);
                    phaseRef.current = "out";
                    phaseTimeRef.current = 0;
                    startsKeyRef.current = "";
                    holdDrawnRef.current = false;
                }
            }
            frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        return () => {
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [isInView, memoizedRenderParticles]);

    const sampleKey = [
        JSON.stringify(texts),
        font?.fontFamily,
        font?.fontSize,
        font?.fontWeight,
        color,
        alignment,
        spread,
        wrapperSize.width,
        wrapperSize.height,
        globalDpr,
        currentTextIndex,
    ].join("|");

    const liveProps = { texts, font, color, spread, density, appear, disappear, alignment, tag };
    const propsRef = useRef<any>(liveProps);
    propsRef.current = liveProps;

    useEffect(() => {
        renderCanvas({
            framerProps: propsRef.current,
            canvasRef,
            wrapperSize,
            particlesRef,
            globalDpr,
            currentTextIndex,
        });
        const currentFont = propsRef.current.font?.fontFamily || "sans-serif";
        return handleFontChange({
            currentFont,
            lastFontRef,
            props: propsRef.current,
            canvasRef,
            wrapperSize,
            particlesRef,
            globalDpr,
            currentTextIndex,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sampleKey]);

    useResizeObserver({ wrapperRef, setWrapperSize });

    return (
        <div ref={wrapperRef} className={className} style={wrapperStyle}>
            <canvas ref={canvasRef} style={canvasStyle} />
            <SeoElement tag={tag} texts={texts} />
        </div>
    );
};

const SeoElement = memo(({ tag = "h1", texts }: any) => {
    const style = useMemo<React.CSSProperties>(
        () => ({
            position: "absolute",
            width: "0",
            height: "0",
            overflow: "hidden",
            userSelect: "none",
            pointerEvents: "none",
        }),
        []
    );
    const safeTag = (TAGS as readonly string[]).includes(tag) ? tag : "h1";
    return createElement(safeTag, { style }, texts?.join(" ") ?? "");
});
SeoElement.displayName = "SeoElement";

const handleFontChange = ({
    currentFont,
    lastFontRef,
    props,
    canvasRef,
    wrapperSize,
    particlesRef,
    globalDpr,
    currentTextIndex,
}: any) => {
    if (currentFont !== lastFontRef.current) {
        lastFontRef.current = currentFont;
        const timeoutId = setTimeout(() => {
            cleanup({ canvasRef, particlesRef });
            renderCanvas({
                framerProps: props,
                canvasRef,
                wrapperSize,
                particlesRef,
                globalDpr,
                currentTextIndex,
            });
        }, 1e3);
        return () => {
            clearTimeout(timeoutId);
            cleanup({ canvasRef, particlesRef });
        };
    }
    return undefined;
};

const cleanup = ({ canvasRef, particlesRef }: any) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (particlesRef.current) {
        particlesRef.current = [];
    }
};

const useResizeObserver = ({ wrapperRef, setWrapperSize }: any) => {
    useEffect(() => {
        const container = wrapperRef.current;
        if (!container || typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver((entries) => {
            const rect = entries[0]?.contentRect;
            if (!rect) return;
            const width = Math.round(rect.width);
            const height = Math.round(rect.height);
            setWrapperSize((prev: any) =>
                prev.width === width && prev.height === height
                    ? prev
                    : { width, height }
            );
        });
        ro.observe(container);
        return () => ro.disconnect();
    }, [wrapperRef, setWrapperSize]);
};

const useWrapperSize = () => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [wrapperSize, setWrapperSize] = useState<{
        width: number | null;
        height: number | null;
    }>({ width: null, height: null });
    useEffect(() => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setWrapperSize({ width: rect.width || 800, height: rect.height || 260 });
        }
    }, [wrapperRef]);
    return { wrapperSize, setWrapperSize, wrapperRef };
};

const renderCanvas = ({
    framerProps,
    canvasRef,
    wrapperSize,
    particlesRef,
    globalDpr,
    currentTextIndex,
}: any) => {
    const canvas = canvasRef.current as any;
    if (!canvas || !wrapperSize.width || !wrapperSize.height) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = wrapperSize;
    const fontSize = parseInt(
        String(framerProps.font?.fontSize ?? "72").replace("px", "")
    ) || 72;
    const font = `${framerProps.font?.fontWeight ?? 600} ${fontSize * globalDpr}px ${framerProps.font?.fontFamily || "Inter, sans-serif"}`;
    const color = parseFramerColor(framerProps.color);
    const currentText = framerProps.texts[currentTextIndex] || "UI HUB";

    ctx.font = font;
    const widest = (framerProps.texts ?? [currentText]).reduce(
        (w: number, t: string) => Math.max(w, ctx.measureText(t || "").width),
        0
    );
    const overflowX = Math.max(0, (widest / globalDpr - width) / 2);
    const driftRoom =
        calculateVaporizeSpread(fontSize) *
        (framerProps.spread ?? 20) *
        DRIFT_REACH *
        0.6;
    const bleed = Math.ceil(Math.min(400, overflowX + fontSize + driftRoom));

    const cssW = width + bleed * 2;
    const cssH = height + bleed * 2;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.style.left = `${-bleed}px`;
    canvas.style.top = `${-bleed}px`;
    canvas.width = Math.floor(cssW * globalDpr);
    canvas.height = Math.floor(cssH * globalDpr);

    const inset = bleed * globalDpr;
    const boxW = width * globalDpr;
    const textY = canvas.height / 2;
    let textX;
    if (framerProps.alignment === "center") {
        textX = inset + boxW / 2;
    } else if (framerProps.alignment === "left") {
        textX = inset;
    } else {
        textX = inset + boxW;
    }
    const { particles, textBoundaries } = createParticles(
        ctx,
        canvas,
        currentText,
        textX,
        textY,
        font,
        color,
        framerProps.alignment
    );
    particlesRef.current = particles;
    canvas.textBoundaries = textBoundaries;
};

const createParticles = (
    ctx: any,
    canvas: any,
    text: any,
    textX: any,
    textY: any,
    font: any,
    color: any,
    alignment: any
) => {
    const particles: any[] = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = alignment;
    ctx.textBaseline = "middle";
    ctx.imageSmoothingQuality = "high";
    ctx.imageSmoothingEnabled = true;
    if (ctx.fontKerning) ctx.fontKerning = "normal";
    if (ctx.textRendering) ctx.textRendering = "geometricPrecision";
    const metrics = ctx.measureText(text);
    let textLeft;
    const textWidth = metrics.width;
    if (alignment === "center") {
        textLeft = textX - textWidth / 2;
    } else if (alignment === "left") {
        textLeft = textX;
    } else {
        textLeft = textX - textWidth;
    }
    const textBoundaries = {
        left: textLeft,
        right: textLeft + textWidth,
        width: textWidth,
    };
    ctx.fillText(text, textX, textY);
    const ascent = metrics.actualBoundingBoxAscent || 60;
    const descent = metrics.actualBoundingBoxDescent || 20;
    const pad = 4;
    const x0 = Math.max(0, Math.floor(textLeft - pad));
    const y0 = Math.max(0, Math.floor(textY - ascent - pad));
    const x1 = Math.min(canvas.width, Math.ceil(textLeft + textWidth + pad));
    const y1 = Math.min(canvas.height, Math.ceil(textY + descent + pad));
    const boxW = Math.max(1, x1 - x0);
    const boxH = Math.max(1, y1 - y0);
    const data = ctx.getImageData(x0, y0, boxW, boxH).data;
    const currentDPR = canvas.width / parseInt(canvas.style.width);
    const sampleRate = Math.max(1, Math.round(currentDPR));
    canvas.particleSize = sampleRate;
    for (let y = 0; y < boxH; y += sampleRate) {
        for (let x = 0; x < boxW; x += sampleRate) {
            const index = (y * boxW + x) * 4;
            const alpha = data[index + 3];
            if (alpha > 0) {
                const originalAlpha = alpha / 255;
                particles.push({
                    x: x0 + x,
                    y: y0 + y,
                    originalX: x0 + x,
                    originalY: y0 + y,
                    r: data[index],
                    g: data[index + 1],
                    b: data[index + 2],
                    opacity: originalAlpha,
                    originalAlpha,
                    angle: 0,
                    speed: 0,
                    start: 0,
                    driftX: 0,
                    driftY: 0,
                    wobble: 0,
                    scatterX: 0,
                    scatterY: 0,
                    shouldFadeQuickly: false,
                });
            }
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return { particles, textBoundaries };
};

const updateParticles = (
    particles: any,
    progress: any,
    MULTIPLIED_VAPORIZE_SPREAD: any,
    density: any
) => {
    let allParticlesVaporized = true;
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const shouldVaporize = progress >= (particle.start ?? 0);
        if (shouldVaporize) {
            if (particle.speed === 0) {
                particle.angle = Math.random() * Math.PI * 2;
                particle.speed = 0.5 + Math.random();
                const reach =
                    particle.speed * MULTIPLIED_VAPORIZE_SPREAD * DRIFT_REACH;
                particle.driftX = Math.cos(particle.angle) * reach;
                particle.driftY = Math.sin(particle.angle) * reach * 0.6;
                particle.wobble = (Math.random() - 0.5) * 2;
                particle.shouldFadeQuickly = Math.random() > density;
            }
            const local = localProgress(progress, particle.start ?? 0);
            const fade = particle.shouldFadeQuickly
                ? Math.min(1, local * 2)
                : local;
            particle.opacity = particle.originalAlpha * (1 - fade);
            const travel = local * (2 - local);
            const wobble =
                Math.sin(local * Math.PI * 3 + particle.angle) *
                particle.wobble *
                MULTIPLIED_VAPORIZE_SPREAD *
                4 *
                local;
            particle.x = particle.originalX + particle.driftX * travel + wobble;
            particle.y = particle.originalY + particle.driftY * travel;
            if (particle.opacity > 0.01) {
                allParticlesVaporized = false;
            }
        } else {
            allParticlesVaporized = false;
        }
    }
    return allParticlesVaporized;
};

const renderParticles = (
    ctx: any,
    particles: any,
    globalDpr: any,
    bufferRef: any,
    canvas: any
) => {
    const w = canvas.width;
    const h = canvas.height;
    if (w <= 0 || h <= 0) return;
    let buf = bufferRef.current;
    if (!buf || buf.width !== w || buf.height !== h) {
        buf = ctx.createImageData(w, h);
        bufferRef.current = buf;
    }
    const data = buf.data;
    data.fill(0);
    const size = Math.max(1, canvas.particleSize || Math.round(globalDpr));
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const a = p.opacity;
        if (a <= 0.01) continue;
        const alpha = a > 1 ? 255 : (a * 255) | 0;
        const px = p.x | 0;
        const py = p.y | 0;
        for (let dy = 0; dy < size; dy++) {
            const y = py + dy;
            if (y < 0 || y >= h) continue;
            let idx = (y * w + px) * 4;
            for (let dx = 0; dx < size; dx++) {
                const x = px + dx;
                if (x >= 0 && x < w) {
                    data[idx] = p.r;
                    data[idx + 1] = p.g;
                    data[idx + 2] = p.b;
                    data[idx + 3] = alpha;
                }
                idx += 4;
            }
        }
    }
    ctx.putImageData(buf, 0, 0);
};

const assignStarts = (particles: any, boundaries: any, order: string) => {
    const width = boundaries?.width || 1;
    const left = boundaries?.left ?? 0;
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        if (order === "together") {
            particle.start = 0;
            continue;
        }
        const frac = Math.max(
            0,
            Math.min(1, (particle.originalX - left) / width)
        );
        particle.start =
            (order === "right-to-left" ? 1 - frac : frac) * SWEEP_SPAN;
    }
};

const localProgress = (e: number, start = 0) => {
    const span = 1 - start;
    if (span <= 0) return e >= start ? 1 : 0;
    return Math.max(0, Math.min(1, (e - start) / span));
};

const assignScatter = (particles: any, spread: number) => {
    const reach = Math.max(20, spread * 60);
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const angle = Math.random() * Math.PI * 2;
        const dist = (0.4 + Math.random() * 0.6) * reach;
        particle.scatterX = particle.originalX + Math.cos(angle) * dist;
        particle.scatterY = particle.originalY + Math.sin(angle) * dist * 0.5;
    }
};

const resetParticles = (particles: any) => {
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x = p.originalX;
        p.y = p.originalY;
        p.opacity = p.originalAlpha;
        p.speed = 0;
        p.driftX = 0;
        p.driftY = 0;
    }
};

const calculateVaporizeSpread = (fontSize: any) => {
    const size = typeof fontSize === "string" ? parseInt(fontSize) : fontSize;
    const points = [
        { size: 20, spread: 0.2 },
        { size: 50, spread: 0.5 },
        { size: 100, spread: 1.5 },
    ];
    if (size <= points[0].size) return points[0].spread;
    if (size >= points[points.length - 1].size)
        return points[points.length - 1].spread;
    let i = 0;
    while (i < points.length - 1 && points[i + 1].size < size) i++;
    const p1 = points[i];
    const p2 = points[i + 1];
    return (
        p1.spread +
        ((size - p1.size) * (p2.spread - p1.spread)) / (p2.size - p1.size)
    );
};

const parseFramerColor = (color: any): string => {
    if (typeof color === "string" && color.trim()) return color.trim();
    return "rgb(255, 255, 255)";
};

function transformValue(
    input: number,
    inputRange: number[],
    outputRange: number[],
    clamp = false
): number {
    const [inputMin, inputMax] = inputRange;
    const [outputMin, outputMax] = outputRange;
    const progress = (input - inputMin) / (inputMax - inputMin);
    let result = outputMin + progress * (outputMax - outputMin);
    if (clamp) {
        if (outputMax > outputMin) {
            result = Math.min(Math.max(result, outputMin), outputMax);
        } else {
            result = Math.min(Math.max(result, outputMax), outputMin);
        }
    }
    return result;
}

export const TextVaporize = VaporizeTextCycle;
export default VaporizeTextCycle;
