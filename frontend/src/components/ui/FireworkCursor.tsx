// Firework Cursor — UI HUB
// UI HUB — props baked into the default export.

"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

/**
 * Firework Cursor — a GPGPU particle field that trails the pointer, drifting on
 * curl noise and blooming. The simulation itself comes from the `threejs-components`
 * package's particles1 cursor module; this component wraps it for plain React.
 *
 * The wrapper's job: never start the simulation during SSR, survive the library
 * failing to load, push prop changes as uniform writes rather than teardowns, and
 * keep the particle count inside what a GPU can actually allocate.
 *
 * The field is confined to the frame the component is placed in. The library
 * tracks the pointer against the whole window, so the pointer it is handed each
 * frame is overwritten with one measured against this frame instead.
 */

type FireworkCursorProps = {
    label?: boolean;
    labelText?: string;
    labelColor?: string;
    labelFont?: React.CSSProperties;
    density?: number;
    color?: string;
    colors?: string[];
    size?: number;
    lifetime?: number;
    bloomStrength?: number;
    style?: React.CSSProperties;
};

const DEFAULT_LABEL_FONT: React.CSSProperties = {
    fontSize: "48px",
    fontWeight: 600,
};

const DEFAULTS = {
    label: true,
    labelText: "HOVER AROUND",
    labelColor: "#FFFFFF",
    // × 1000 → particles, so 50 = 50k. Past ~100k the field never clears
    // between strokes and the cursor reads as a standing fog rather than a
    // trail with a shape.
    density: 100,
    color: "#FF0000",
    size: 1,
    // ÷ 15 → the library's 0…1 lifetime. Long lifetimes are the other half of
    // the fog: particles from several strokes ago are still lit.
    lifetime: 2,
    // ÷ 100, so 10 = 0.1
    bloomStrength: 50,
};

// gpgpuSize is the edge of a square simulation texture, so the real cost of a
// particle count is its square root — the library allocates one texel per
// particle per attribute.
const particlesFor = (density: number) =>
    Math.max(10, Math.min(100, density)) * 1000;

const DEFAULT_COLORS = ["#00FF00", "#0000FF"];

// Fixed now that their controls are gone — the numbers the sliders produced at
// their defaults. The noise trio and the two extra bloom dials interacted in
// ways that were hard to predict from the panel, and every combination that
// read well sat near these values anyway.
const NOISE_COORD_SCALE = 0.5;
// The library divides its own noiseIntensity config by 100 before it reaches
// the shader, so the value it actually wants here is 0.1 / 100. Passing 0.1
// straight through drove the curl noise 100× too hard, which is why the field
// scattered instead of drifting.
const NOISE_INTENSITY = 0.001;
const NOISE_TIME_COEF = 0.1;
const BLOOM_RADIUS = 0;
const BLOOM_THRESHOLD = 0;

// The library's own idle behaviour: with `pointer.hover` false it abandons the
// cursor and drives the field around a Lissajous orbit centred on the screen —
// that is both the "starts in the middle" and the "keeps moving once the
// pointer is gone". Neither is configurable, so `hover` is pinned true and the
// field is parked wherever the pointer was last seen instead.
const KEEP_AWAKE = true;

/** The library's decay is inverse to how long a particle lives. */
function toDecay(lifetime: number) {
    const t = Math.max(0, Math.min(1, lifetime / 15));
    return 0.01 - t * (0.01 - 5e-4);
}

function UIHUBBase_FireworkCursor(props: FireworkCursorProps) {
    const {
        density = DEFAULTS.density,
        color = DEFAULTS.color,
        size = DEFAULTS.size,
        lifetime = DEFAULTS.lifetime,
        bloomStrength = DEFAULTS.bloomStrength,
        label = DEFAULTS.label,
        labelText = DEFAULTS.labelText,
        labelColor = DEFAULTS.labelColor,
        colors: colorsProp,
        labelFont: labelFontProp,
        style,
    } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<any>(null);

    // The pointer in the frame's own normalised space (-1…1, y up), which is
    // what the library's particle shader wants. `over` is false whenever the
    // pointer is outside this frame, and the field is parked at its last
    // position rather than following the pointer across the rest of the page.
    const pointerRef = useRef({ nx: 0, ny: 0, over: false });

    const colors =
        Array.isArray(colorsProp) && colorsProp.length
            ? colorsProp
            : DEFAULT_COLORS;
    const colorsKey = colors.join(",");

    // Only the particle count reallocates the simulation textures; everything
    // else below is a uniform write.
    const labelFont = { ...DEFAULT_LABEL_FONT, ...labelFontProp };

    // The field is snapped onto the pointer rather than eased onto it whenever
    // it appears — on first sight and on every re-entry — so it never streaks
    // in from wherever it happened to be.
    const snapRef = useRef(true);

    // Shown only while the pointer is over THIS FRAME, and never before it has
    // been seen there at all.
    useEffect(() => {
        const host = frameRef.current;
        if (!host) return;
        let seen = false;

        const setShown = (on: boolean) => {
            const el = canvasRef.current;
            if (el) el.style.opacity = on ? "1" : "0";
        };

        // The native cursor is only replaced over this frame; blanking it
        // document-wide would take it off the whole page.
        const previousCursor = document.documentElement.style.cursor;
        let cursorHidden = false;
        const hideNativeCursor = (hide: boolean) => {
            if (hide === cursorHidden) return;
            cursorHidden = hide;
            document.documentElement.style.cursor = hide
                ? "none"
                : previousCursor;
        };

        const onMove = (e: PointerEvent) => {
            // Tracked on the document: the frame passes events through, so the
            // rect does the hit test. It also carries the page's zoom, which
            // the normalised coordinates below divide straight back out.
            const rect = host.getBoundingClientRect();
            const over =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;
            const p = pointerRef.current;
            if (over) {
                p.nx =
                    rect.width > 0
                        ? ((e.clientX - rect.left) / rect.width) * 2 - 1
                        : 0;
                p.ny =
                    rect.height > 0
                        ? 1 - ((e.clientY - rect.top) / rect.height) * 2
                        : 0;
                if (!p.over) snapRef.current = true;
                seen = true;
            }
            p.over = over;
            setShown(over && seen);
            hideNativeCursor(over);
        };
        const onLeave = () => {
            pointerRef.current.over = false;
            setShown(false);
            hideNativeCursor(false);
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
            hideNativeCursor(false);
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener(
                "pointerleave",
                onLeave
            );
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let app: any = null;
        let cancelled = false;

        (async () => {
            let Particles1Cursor: any;
            try {
                // Loaded dynamically so a missing/failed dependency degrades to
                // nothing instead of breaking the whole bundle.
                const mod = await import("threejs-components");
                Particles1Cursor =
                    (mod as any)?.default?.cursors?.particles1 ??
                    (mod as any)?.cursors?.particles1;
            } catch (e) {
                console.warn("Firework Cursor failed to load:", e);
                return;
            }
            if (cancelled || typeof Particles1Cursor !== "function") return;

            try {
                app = Particles1Cursor(canvas, {
                    gpgpuSize: Math.ceil(Math.sqrt(particlesFor(density))),
                    color,
                    colors,
                    size,
                    decay: toDecay(lifetime),
                    noiseCoordScale: NOISE_COORD_SCALE,
                    noiseIntensity: NOISE_INTENSITY,
                    noiseTimeCoef: NOISE_TIME_COEF,
                });
            } catch (e) {
                // A blocked asset or a GPU without the required float-texture
                // support should degrade to nothing, not take the page down.
                console.warn("Firework Cursor failed to start:", e);
                return;
            }
            if (cancelled) {
                try {
                    app?.dispose?.();
                } catch {
                    // ignore
                }
                return;
            }
            appRef.current = app;

            // The library keeps its pointer object private, but hands it to
            // `particles.update({time, pointer})` every frame — which is
            // reachable. Wrapping that call is the only way in from out here.
            const particles = app?.particles;
            const baseUpdate = particles?.update;
            if (particles && typeof baseUpdate === "function") {
                particles.update = function patched(this: any, arg: any) {
                    const pointer = arg?.pointer;
                    if (pointer) {
                        // With hover false the library drops the cursor and
                        // orbits the middle of the screen. Pinned true, the
                        // field simply holds the last pointer position while
                        // it is away.
                        pointer.hover = KEEP_AWAKE;
                        // The library measures the pointer against the window.
                        // This component owns one frame, so its own
                        // measurement — taken against that frame — replaces
                        // it. While the pointer is outside, the last position
                        // is left in place and the field settles there instead
                        // of chasing it across the page.
                        const local = pointerRef.current;
                        if (local.over && pointer.nPosition) {
                            pointer.nPosition.x = local.nx;
                            pointer.nPosition.y = local.ny;
                        }
                        if (snapRef.current) {
                            snapRef.current = false;
                            // Same world-space mapping the library uses, so
                            // the field starts *at* the pointer rather than
                            // easing across to it from wherever it last was.
                            const worldSize = app?.three?.size;
                            const target =
                                particles.uniforms?.uPointerPosition?.value;
                            if (worldSize && target) {
                                target.set(
                                    pointer.nPosition.x *
                                        worldSize.wWidth *
                                        0.5,
                                    pointer.nPosition.y *
                                        worldSize.wHeight *
                                        0.5
                                );
                            }
                        }
                    }
                    return baseUpdate.call(this, arg);
                };
            }
        })();

        return () => {
            cancelled = true;
            appRef.current = null;
            // The old cleanup called dispose() unconditionally, so a failed
            // init turned every unmount into a TypeError.
            try {
                app?.dispose?.();
            } catch (e) {
                console.warn("Firework Cursor failed to dispose:", e);
            }
        };
    }, [density]);

    // One sync effect instead of several, guarding every dereference so an
    // init failure doesn't throw again on every prop change.
    useEffect(() => {
        const app = appRef.current;
        if (!app) return;
        const uniforms = app.particles?.uniforms;
        if (uniforms) {
            uniforms.uColor?.value?.set(color);
            if (uniforms.uPointSize) uniforms.uPointSize.value = size;
            if (uniforms.uDecay) uniforms.uDecay.value = toDecay(lifetime);
        }
        app.particles?.setColors?.(colors);
        if (app.bloomPass) {
            app.bloomPass.strength = bloomStrength / 100;
            app.bloomPass.radius = BLOOM_RADIUS;
            app.bloomPass.threshold = BLOOM_THRESHOLD;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [color, colorsKey, size, lifetime, bloomStrength]);

    // Sits in the component's own frame, centred — the cue to hover.
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
            ref={frameRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                // The effect belongs to this frame, so it is clipped to it.
                overflow: "hidden",
                // A cursor effect must never swallow a click meant for
                // whatever sits under it; the pointer is tracked on the
                // document.
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
                    // The field cannot be stopped from out here, so it is
                    // faded rather than cut — an instant hide on a
                    // still-drifting simulation reads as a glitch.
                    transition: "opacity 180ms linear",
                    pointerEvents: "none",
                }}
            />
        </div>
    );
}

const PRESET_PROPS = {
  "color": "#FF0000",
  "density": 100,
  "size": 1,
  "lifetime": 2,
  "bloomStrength": 50,
  "label": true,
  "labelText": "HOVER AROUND",
  "labelColor": "#FFFFFF"
};

export function FireworkCursor(props: Partial<FireworkCursorProps>) {
  return <UIHUBBase_FireworkCursor {...(PRESET_PROPS as FireworkCursorProps)} {...props} />;
}

export default FireworkCursor;
