import React, { useEffect, useRef } from 'react'
import { PREVIEW_INTERACTION_EVENT } from '../../context/PreviewInteractionContext'
import { EMBEDDED_SOURCE_CODE } from '../../data/embeddedSourceCode'

interface PreviewInteractionDetail {
  active: boolean
}

export interface RingImageProps {
  className?: string
  style?: React.CSSProperties
}

export const RingImage: React.FC<RingImageProps> = ({ className = '', style }) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const pointerInsideRef = useRef(false)
  const takeoverTimerRef = useRef<number | null>(null)

  const dispatchTakeover = (inside: boolean): boolean => {
    const frame = frameRef.current
    const win = frame?.contentWindow
    const doc = frame?.contentDocument
    if (!win || !doc) return true

    const stage = doc.querySelector<HTMLElement>('.stage')
    if (!stage) return false
    if (inside && stage.classList.contains('entering')) return false

    const init: PointerEventInit = {
      bubbles: true,
      cancelable: true,
      clientX: 1,
      clientY: 1,
      button: 0,
      buttons: inside ? 1 : 0,
      pointerType: 'mouse',
      isPrimary: true,
    }

    const PointerEventCtor = (win as unknown as { PointerEvent?: typeof PointerEvent }).PointerEvent ?? PointerEvent
    if (inside) {
      stage.dispatchEvent(new PointerEventCtor('pointerdown', init))
    } else {
      win.dispatchEvent(new PointerEventCtor('pointerup', init))
      stage.dispatchEvent(new PointerEventCtor('pointerleave', { ...init, bubbles: false }))
    }
    return true
  }

  const setPointerState = (inside: boolean) => {
    pointerInsideRef.current = inside
    if (takeoverTimerRef.current !== null) {
      window.clearInterval(takeoverTimerRef.current)
      takeoverTimerRef.current = null
    }

    if (dispatchTakeover(inside)) return
    if (!inside) return

    takeoverTimerRef.current = window.setInterval(() => {
      if (dispatchTakeover(true) || !pointerInsideRef.current) {
        if (takeoverTimerRef.current !== null) window.clearInterval(takeoverTimerRef.current)
        takeoverTimerRef.current = null
      }
    }, 180)
  }

  useEffect(() => {
    const root = rootRef.current
    const frame = frameRef.current
    if (!root || !frame) return

    const interactionRoot = root.closest<HTMLElement>('[data-preview-root]') ?? root

    // The supplied Reelwall source is itself responsive: it reads its own
    // viewport and recomputes ring fit on resize. Letting the iframe fill the
    // preview avoids letterbox gutters while preserving the exact source.
    const notifyResize = () => {
      frame.contentWindow?.dispatchEvent(new Event('resize'))
    }

    const onInteraction = (event: Event) => {
      const detail = (event as CustomEvent<PreviewInteractionDetail>).detail
      setPointerState(Boolean(detail?.active))
    }

    notifyResize()
    const observer = new ResizeObserver(notifyResize)
    observer.observe(root)
    window.addEventListener('resize', notifyResize)
    interactionRoot.addEventListener(PREVIEW_INTERACTION_EVENT, onInteraction)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', notifyResize)
      interactionRoot.removeEventListener(PREVIEW_INTERACTION_EVENT, onInteraction)
      if (takeoverTimerRef.current !== null) window.clearInterval(takeoverTimerRef.current)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className={`relative h-full w-full overflow-hidden bg-[#f4f2ec] ${className}`.trim()}
      style={style}
    >
      <iframe
        ref={frameRef}
        srcDoc={EMBEDDED_SOURCE_CODE['ring-image']}
        title="Ring image"
        aria-label="Ring image component preview"
        className="absolute inset-0 block h-full w-full border-0"
        onLoad={() => {
          frameRef.current?.contentWindow?.dispatchEvent(new Event('resize'))
          if (pointerInsideRef.current) setPointerState(true)
        }}
        onPointerEnter={() => setPointerState(true)}
        onPointerLeave={() => setPointerState(false)}
      />
    </div>
  )
}

export default RingImage
