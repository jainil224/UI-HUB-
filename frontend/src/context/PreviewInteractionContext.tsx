'use client'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { startPreviewAutoDemo } from '../utils/previewAutoDemo'

/** Self-contained signal used by auto-playing previews. No global state. */
export const PREVIEW_INTERACTION_EVENT = 'uihub:preview-interaction'

interface PreviewInteractionProviderProps {
    children: ReactNode
    className?: string
    style?: CSSProperties
    onInteractStart?: () => void
    centerContent?: boolean
    /** Keep auto-demo running after the pointer enters (button/text effects). */
    persistAutoDemo?: boolean
    /** Rapid replay instead of held state (buttons). */
    replayAutoDemo?: boolean
    /** Periodically activate carousel/nav controls in the preview. */
    autoClickAutoDemo?: boolean
}

export function PreviewInteractionProvider({ children, className = '', style, onInteractStart, centerContent = false, persistAutoDemo = false, replayAutoDemo = false, autoClickAutoDemo = false }: PreviewInteractionProviderProps) {
    const ref = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [isInteracting, setIsInteracting] = useState(false)

    const update = (active: boolean) => {
        setIsInteracting(active)
        if (active) onInteractStart?.()
        const el = ref.current
        if (!el) return
        el.dataset.previewInteracting = active ? 'true' : 'false'
        el.dispatchEvent(new CustomEvent(PREVIEW_INTERACTION_EVENT, { bubbles: true, detail: { active } }))
    }

    useEffect(() => {
        if (!persistAutoDemo) return
        return startPreviewAutoDemo(contentRef.current, true, replayAutoDemo, autoClickAutoDemo)
    }, [persistAutoDemo, replayAutoDemo, autoClickAutoDemo])

    useEffect(() => {
        if (persistAutoDemo || isInteracting) return
        return startPreviewAutoDemo(contentRef.current, false)
    }, [isInteracting, persistAutoDemo])

    return (
        <div
            ref={ref}
            data-preview-root="true"
            className={`pointer-events-auto w-full h-full ${className}`}
            style={style}
            onPointerEnter={() => update(true)}
            onPointerLeave={() => update(false)}
            onPointerCancel={() => update(false)}
            onFocusCapture={() => update(true)}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) update(false)
            }}
        >
            <div
                ref={contentRef}
                className={`w-full h-full ${centerContent ? 'flex items-center justify-center' : ''} ${isInteracting ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
                {children}
            </div>
        </div>
    )
}
