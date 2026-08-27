// User Cursor — UI HUB
// UI HUB — props baked into the default export.

"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    animate,
    type SpringOptions,
} from "framer-motion";

/**
 * UserCursor — a custom cursor follower that replaces the OS cursor inside
 * its surface. An arrow glyph tracks the pointer with spring physics; a
 * colored label pill trails behind on a laggier spring, rocking with motion
 * and scaling while pressed.
 *
 * The host is a relative container with `overflow: hidden`; the cursor shows
 * while the pointer is inside it and the native cursor is hidden there. The
 * cursor layer is `pointer-events: none` so clicks pass through. Skipped on
 * coarse-pointer (touch) devices.
 */
function UIHUBBase_UserCursor(props: Props) {
    props = { ...COMPONENT_DEFAULTS, ...props }
    const {
        name,
        arrow,
        label,
        color,
        textColor,
        size,
        labelTiltStrength,
        showLabel,
        // Flat offsets (Framer-friendly).
        offsetX,
        offsetY,
        labelOffsetX,
        labelOffsetY,
        labelOffsetUseDefault,
        pressScale,
        classNames,
        // Non-serializable advanced overrides (programmatic only).
        offset: offsetOverride,
        labelOffset: labelOffsetOverride,
        previewMode,
        style,
    } = props

    // Fixed behavior (previously configurable; locked to sensible defaults).
    const fullScreen = false
    const hideNativeCursor = true
    const hideOnTouch = true
    const zIndex = 50

    const isStatic = false

    // --- touch detection -----------------------------------------------------
    const [isTouchDevice, setIsTouchDevice] = useState(false)
    useEffect(() => {
        // In preview mode the cursor is forced to render (even on touch
        // devices) so an auto-animating demo can drive it via pointer events.
        if (!hideOnTouch || previewMode) {
            setIsTouchDevice(false)
            return
        }
        if (typeof window === "undefined" || !window.matchMedia) return
        const mql = window.matchMedia("(pointer: coarse)")
        const sync = () => setIsTouchDevice(!!mql.matches)
        sync()
        // Modern + legacy listener APIs.
        if (mql.addEventListener) {
            mql.addEventListener("change", sync)
            return () => mql.removeEventListener("change", sync)
        }
        const legacy = mql as MediaQueryList & {
            addListener?: (l: (e: MediaQueryListEvent) => void) => void
            removeListener?: (l: (e: MediaQueryListEvent) => void) => void
        }
        legacy.addListener?.(sync)
        return () => legacy.removeListener?.(sync)
    }, [hideOnTouch, previewMode])

    // --- container refs ------------------------------------------------------
    const containerRef = useRef<HTMLDivElement | null>(null)

    // --- visible state (gated by trigger + presence) ------------------------
    const [hovering, setHovering] = useState(false)
    const [pressed, setPressed] = useState(false)

    // Fixed spring configs (good defaults). Arrow is snappier; label trails.
    const arrowSpring = useMemo<SpringOptions>(
        () => ({ stiffness: 380, damping: 32, mass: 0.6 }),
        []
    )
    const labelSpringCfg = useMemo<SpringOptions>(
        () => ({ stiffness: 220, damping: 26, mass: 0.7 }),
        []
    )

    const resolvedOffset = useMemo(
        () => ({
            x: offsetOverride?.x ?? offsetX,
            y: offsetOverride?.y ?? offsetY,
        }),
        [offsetOverride?.x, offsetOverride?.y, offsetX, offsetY]
    )

    const resolvedLabelOffset = useMemo(() => {
        if (labelOffsetOverride) {
            return {
                x: labelOffsetOverride.x ?? size * 0.9,
                y: labelOffsetOverride.y ?? size * 0.2 + 6,
            }
        }
        if (labelOffsetUseDefault) {
            return { x: size * 0.9, y: size * 0.2 + 6 }
        }
        return { x: labelOffsetX, y: labelOffsetY }
    }, [
        labelOffsetOverride?.x,
        labelOffsetOverride?.y,
        labelOffsetUseDefault,
        labelOffsetX,
        labelOffsetY,
        size,
    ])

    // --- motion values --------------------------------------------------------
    const mouseX = useMotionValue(-9999)
    const mouseY = useMotionValue(-9999)

    const arrowX = useSpring(mouseX, arrowSpring)
    const arrowY = useSpring(mouseY, arrowSpring)
    const labelX = useSpring(mouseX, labelSpringCfg)
    const labelY = useSpring(mouseY, labelSpringCfg)

    const scaleMV = useMotionValue(1)
    useEffect(() => {
        const controls = animate(scaleMV, pressed ? pressScale : 1, {
            type: "spring",
            stiffness: 500,
            damping: 28,
            mass: 0.5,
        })
        return () => controls.stop()
    }, [pressed, pressScale, scaleMV])

    const labelTiltTarget = useMotionValue(0)
    const labelRotation = useSpring(labelTiltTarget, {
        stiffness: 200,
        damping: 24,
        mass: 0.6,
    })

    // --- pointer listeners ---------------------------------------------------
    const lastSampleRef = useRef<{ x: number; y: number; t: number } | null>(
        null
    )

    useEffect(() => {
        if (isStatic || isTouchDevice) return
        if (typeof window === "undefined") return

        const container = containerRef.current
        if (!fullScreen && !container) return

        const getLocal = (clientX: number, clientY: number) => {
            if (fullScreen) return { x: clientX, y: clientY }
            const rect = container!.getBoundingClientRect()
            return { x: clientX - rect.left, y: clientY - rect.top }
        }

        const isInside = (clientX: number, clientY: number) => {
            if (fullScreen) return true
            const rect = container!.getBoundingClientRect()
            return (
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom
            )
        }

        const onMove = (e: MouseEvent) => {
            // Tracked on the window: the host lives inside pointer-events:none
            // wrappers in previews, so the rect does the hit test instead of
            // relying on enter/leave events reaching the element itself.
            const inside = isInside(e.clientX, e.clientY)
            setHovering(inside)

            const { x, y } = getLocal(e.clientX, e.clientY)

            const now =
                typeof performance !== "undefined"
                    ? performance.now()
                    : Date.now()
            const last = lastSampleRef.current
            let vx = 0
            let vy = 0
            if (last) {
                const dt = Math.max(1, now - last.t)
                vx = ((x - last.x) / dt) * 1000
                vy = ((y - last.y) / dt) * 1000
            }
            lastSampleRef.current = { x, y, t: now }

            mouseX.set(x + resolvedOffset.x)
            mouseY.set(y + resolvedOffset.y)

            const speed = Math.hypot(vx, vy)
            const norm = Math.min(1, speed / 1500)
            const sign = vx === 0 ? 0 : vx > 0 ? 1 : -1
            labelTiltTarget.set(sign * norm * labelTiltStrength)
        }

        const onDown = (e: MouseEvent) => {
            if (isInside(e.clientX, e.clientY)) setPressed(true)
        }
        const onUp = (e: MouseEvent) => {
            if (isInside(e.clientX, e.clientY)) setPressed(false)
        }
        const onWindowLeave = () => {
            setHovering(false)
            setPressed(false)
            lastSampleRef.current = null
            labelTiltTarget.set(0)
        }

        window.addEventListener("pointermove", onMove as EventListener, {
            passive: true,
        })
        window.addEventListener("pointerdown", onDown as EventListener, {
            passive: true,
        })
        window.addEventListener("pointerup", onUp as EventListener, {
            passive: true,
        })
        document.documentElement.addEventListener(
            "pointerleave",
            onWindowLeave
        )

        return () => {
            window.removeEventListener("pointermove", onMove as EventListener)
            window.removeEventListener("pointerdown", onDown as EventListener)
            window.removeEventListener("pointerup", onUp as EventListener)
            document.documentElement.removeEventListener(
                "pointerleave",
                onWindowLeave
            )
            setPressed(false)
        }
    }, [
        isStatic,
        isTouchDevice,
        fullScreen,
        labelTiltStrength,
        resolvedOffset.x,
        resolvedOffset.y,
        mouseX,
        mouseY,
        labelTiltTarget,
    ])

    const visible = useMemo(() => {
        if (isStatic) return true
        if (isTouchDevice) return false
        return hovering
    }, [isStatic, isTouchDevice, hovering])

    const labelTranslateX = useTransform(
        labelX,
        (v) => v + resolvedLabelOffset.x
    )
    const labelTranslateY = useTransform(
        labelY,
        (v) => v + resolvedLabelOffset.y
    )

    const arrowContent: React.ReactNode = useMemo(() => {
        if (typeof arrow === "function") {
            try {
                return (arrow as (c: string) => React.ReactNode)(color)
            } catch {
                return null
            }
        }
        if (arrow !== undefined && arrow !== null)
            return arrow as React.ReactNode
        // Default macOS-ish cursor pointing up-left, anchored at tip (0,0).
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block", overflow: "visible" }}
            >
                <path
                    d="M5 3 L23 14 L14 16 L11 24 Z"
                    fill={color}
                    stroke="rgba(0,0,0,0.18)"
                    strokeWidth={0.6}
                    strokeLinejoin="round"
                />
            </svg>
        )
    }, [arrow, color, size])

    const labelContent: React.ReactNode = useMemo(() => {
        if (label !== undefined && label !== null) return label
        return (
            <div
                className={classNames?.labelText}
                style={{
                    color: textColor,
                    fontSize: Math.max(7, size * 0.43),
                    lineHeight: 1.1,
                    fontWeight: 600,
                    fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    whiteSpace: "nowrap",
                    letterSpacing: 0.1,
                }}
            >
                {name}
            </div>
        )
    }, [label, name, textColor, size, classNames?.labelText])

    if (isTouchDevice) return null

    const hostStyle: React.CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        cursor: hideNativeCursor ? "none" : undefined,
        ...style,
    }

    const layerStyle: React.CSSProperties = {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex,
    }

    return (
        <div
            ref={containerRef}
            className={classNames?.root}
            style={hostStyle}
        >
            <CursorLayer
                layerStyle={layerStyle}
                visible={visible}
                arrowX={arrowX}
                arrowY={arrowY}
                labelX={labelTranslateX}
                labelY={labelTranslateY}
                labelRotation={labelRotation}
                scale={scaleMV}
                showLabel={showLabel}
                color={color}
                size={size}
                arrowContent={arrowContent}
                labelContent={labelContent}
                classNames={classNames}
            />
        </div>
    )
}

// -----------------------------------------------------------------------------
// CursorLayer — the moving arrow + label.
// -----------------------------------------------------------------------------

function CursorLayer(props: {
    layerStyle: React.CSSProperties
    visible: boolean
    arrowX: any
    arrowY: any
    labelX: any
    labelY: any
    labelRotation: any
    scale: any
    showLabel: boolean
    color: string
    size: number
    arrowContent: React.ReactNode
    labelContent: React.ReactNode
    classNames?: ClassNames
}) {
    const {
        layerStyle,
        visible,
        arrowX,
        arrowY,
        labelX,
        labelY,
        labelRotation,
        scale,
        showLabel,
        color,
        size,
        arrowContent,
        labelContent,
        classNames,
    } = props

    return (
        <div style={layerStyle}>
            {/* Label trails — render BEHIND the arrow so the arrow tip is
                always visually on top. */}
            {showLabel && (
                <motion.div
                    className={classNames?.label}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        x: labelX,
                        y: labelY,
                        rotate: labelRotation,
                        scale,
                        background: color,
                        borderRadius: 999,
                        padding: `${size * 0.18}px ${size * 0.36}px`,
                        boxShadow:
                            "0 4px 12px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
                        opacity: visible ? 1 : 0,
                        transformOrigin: "0% 50%",
                        transition: "opacity 140ms ease",
                        willChange: "transform, opacity",
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                >
                    {labelContent}
                </motion.div>
            )}

            <motion.div
                className={classNames?.cursor}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    x: arrowX,
                    y: arrowY,
                    scale,
                    width: size,
                    height: size,
                    opacity: visible ? 1 : 0,
                    transformOrigin: "0% 0%",
                    transition: "opacity 140ms ease",
                    willChange: "transform, opacity",
                    pointerEvents: "none",
                }}
            >
                <div
                    className={classNames?.arrow}
                    style={{ width: size, height: size }}
                >
                    {arrowContent}
                </div>
            </motion.div>
        </div>
    )
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type ClassNames = {
    root?: string
    cursor?: string
    arrow?: string
    label?: string
    labelText?: string
}

type Props = {
    name: string
    arrow?: React.ReactNode | ((color: string) => React.ReactNode)
    label?: React.ReactNode
    color: string
    textColor: string
    size: number
    labelTiltStrength: number
    showLabel: boolean
    offsetX: number
    offsetY: number
    labelOffsetUseDefault: boolean
    labelOffsetX: number
    labelOffsetY: number
    pressScale: number
    offset?: { x?: number; y?: number }
    labelOffset?: { x?: number; y?: number }
    classNames?: ClassNames
    style?: React.CSSProperties
    /** Force-render even on coarse-pointer (touch) devices — used by scoped
     * previews that drive the cursor with auto-animation. */
    previewMode?: boolean
}

const COMPONENT_DEFAULTS = {
    color: "#FFFFFF",
    size: 31,
    pressScale: 0.92,
    offsetX: 0,
    offsetY: 0,
    showLabel: true,
    name: "Robert",
    textColor: "#000000",
    labelTiltStrength: 25,
    labelOffsetUseDefault: true,
    labelOffsetX: 25,
    labelOffsetY: 12,
}

export function UserCursor(props: Partial<Props>) {
  return <UIHUBBase_UserCursor {...(COMPONENT_DEFAULTS as Props)} {...props} />;
}

export default UserCursor;
