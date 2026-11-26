'use client'

/** Generic auto-demo layer for catalog previews. No component-specific API required. */

const HOVER_ATTR = 'data-uihub-auto-hover'
const AUTO_CLASS = 'uihub-preview-auto'
const CYCLE_MS = 900
const MAX_RULES = 4000

/**
 * Categories whose hover/text effects must keep demoing even while the pointer
 * is inside the preview. Their animations are the product itself, unlike
 * scroll-scrub previews which must hand control to the user on pointer entry.
 */
export const PERSISTENT_AUTO_DEMO_CATEGORIES = new Set(['button', 'text', 'text-scroll', 'image-interaction'])

let stylesInstalled = false

function installStyles() {
  if (stylesInstalled || typeof document === 'undefined') return
  stylesInstalled = true

  const clones: string[] = []
  const supportsCssRule = typeof CSSStyleRule !== 'undefined'
  const collect: (rules: CSSRuleList, output: CSSStyleRule[]) => void = (rules, output) => {
    for (const rule of Array.from(rules)) {
      if (supportsCssRule && rule instanceof CSSStyleRule) {
        output.push(rule)
        continue
      }
      // Tailwind v4 wraps utilities in @layer blocks; :hover rules there are
      // invisible unless nested grouping rules are traversed recursively.
      const nested = (rule as CSSGroupingRule).cssRules
      if (nested && typeof nested.length === 'number') collect(nested, output)
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    const styleRules: CSSStyleRule[] = []
    collect(rules, styleRules)
    for (const rule of styleRules) {
      const selector = rule.selectorText
      if (!selector || (!selector.includes(':hover') && !selector.includes(':focus'))) continue
      const replacement = selector
        .replace(/:focus-visible/g, `[${HOVER_ATTR}]`)
        .replace(/:focus/g, `[${HOVER_ATTR}]`)
        .replace(/:hover/g, `[${HOVER_ATTR}]`)
      const css = rule.style.cssText
      if (replacement === selector || !css) continue
      clones.push(`${replacement}{${css}}`)
      if (clones.length >= MAX_RULES) break
    }
    if (clones.length >= MAX_RULES) break
  }

  const base = document.createElement('style')
  base.setAttribute('data-uihub-auto-demo', 'base')
  base.textContent = `.${AUTO_CLASS}, .${AUTO_CLASS} * { animation-play-state: running !important; }`
  document.head.appendChild(base)

  if (clones.length) {
    const hover = document.createElement('style')
    hover.setAttribute('data-uihub-auto-demo', 'hover')
    hover.textContent = clones.join('\n')
    document.head.appendChild(hover)
  }
}

function pulse(element: HTMLElement, enter: boolean) {
  // React synthesizes onMouseEnter/onMouseLeave from native mouseover/mouseout.
  // Do NOT dispatch pointer/focus events here: the preview provider listens to
  // those and would mistake the auto-demo for a real user taking control.
  const rect = element.getBoundingClientRect()
  const clientX = rect.left + rect.width / 2
  const clientY = rect.top + rect.height / 2
  const init: MouseEventInit = { bubbles: true, clientX, clientY }
  element.dispatchEvent(new MouseEvent(enter ? 'mouseover' : 'mouseout', init))
  if (enter) element.dispatchEvent(new MouseEvent('mousemove', init))
}

/**
 * Drives genuine inner scroll tracks so scroll-scrub previews animate by
 * themselves while idle. Setting scrollTop programmatically fires the same
 * scroll event a user wheel would, so components react with no per-component API.
 *
 * ONLY `auto`/`scroll` elements are valid tracks. `overflow:hidden` wrappers are
 * letter masks and clipping boxes in text previews; scrolling those shifts the
 * visible content up and down, so they must never be driven here.
 */
function driveInnerScroll(root: HTMLElement) {
  const scrollables = Array.from(root.querySelectorAll<HTMLElement>('*')).filter((el) => {
    const overflow = getComputedStyle(el).overflowY
    return el.scrollHeight - el.clientHeight > 8 && (overflow === 'auto' || overflow === 'scroll')
  }).slice(0, 4)
  for (const el of scrollables) {
    const max = el.scrollHeight - el.clientHeight
    const phase = (Date.now() % 9000) / 9000
    el.scrollTop = phase < 0.5 ? phase * 2 * max : (1 - (phase - 0.5) * 2) * max
  }
}

/**
 * Drives a catalog preview without user input.
 *
 * Scroll-scrub previews use the default mode: hover state blinks on/off so the
 * user can see a replay, then hands full control over on pointer entry.
 *
 * Button/text previews use persistent mode: the entered state is held while
 * synthetic pointer motion keeps pointer-following effects moving. Letters stay
 * fully visible (no repeated opacity-0 stutter) and the preview reads as a live
 * demo like Venom Button / Spider Button.
 */
export function startPreviewAutoDemo(root: HTMLElement | null, persistent = false, replay = false, autoClick = false): () => void {
  if (!root || typeof window === 'undefined') return () => {}
  installStyles()
  root.classList.add(AUTO_CLASS)

  // The provider writes `previewInteracting` on the outer preview root, while
  // this engine receives the inner content div. Resolve the outer element once
  // so the idle scrub can hand control back the moment the pointer enters.
  const interactionRoot = root.closest<HTMLElement>('[data-preview-root]') ?? root

  // Auto-scroll every preview while idle, regardless of category. The instant
  // the pointer enters, `previewInteracting` flips to true and manual control
  // takes over, so the idle scrub never fights the user.
  const scrollTimer = window.setInterval(() => {
    if (interactionRoot.dataset.previewInteracting !== 'true') driveInnerScroll(root)
  }, 120)

  let index = 0
  let active: HTMLElement | null = null
  const candidates = () => {
    const interactive = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [role="button"], summary, .group, [class*="group/"], [class*="cursor-pointer"], canvas'
      )
    ).slice(0, 6)
    // Many text animations attach onMouseEnter/onMouseMove to their own root
    // instead of using a group class. Include the component wrapper so those
    // effects demo alongside CSS-driven hover states.
    const wrappers = Array.from(root.children).filter((child): child is HTMLElement => child instanceof HTMLElement).slice(0, 1)
    return [...interactive, ...wrappers.filter((w) => !interactive.includes(w))]
  }

  const release = () => {
    if (!active) return
    active.removeAttribute(HOVER_ATTR)
    pulse(active, false)
    active = null
  }

  const enter = () => {
    const items = candidates()
    if (!items.length) return
    if (active && !items.includes(active)) release()
    if (active) return
    active = items[index % items.length]
    index += 1
    active.setAttribute(HOVER_ATTR, 'true')
    pulse(active, true)
  }

  if (persistent && replay) {
    // Buttons are single-shot CSS effects with no staggered letter fades, so a
    // fast off/on replay keeps them visibly moving like Venom/Spider without
    // ever leaving their label invisible.
    const blinkOn = () => {
      enter()
      timer = window.setTimeout(blinkOff, 520)
    }
    const blinkOff = () => {
      release()
      timer = window.setTimeout(blinkOn, 180)
    }
    blinkOn()
  } else if (persistent) {
    enter()
  } else {
    const step = () => {
      if (active) {
        release()
        return
      }
      enter()
    }
    step()
    var timer = window.setInterval(step, CYCLE_MS)
  }

  let driftTimer = 0
  let clickTick = 0
  let clickIndex = 0
  if (persistent) {
    // Oscillating pointer coordinates keep pointer-following effects (glows,
    // magnetic cards, cursors, canvas text meshes) moving instead of freezing.
    // Only pointermove/mousemove are emitted: the provider listens for
    // pointerover/pointerout and must never mistake this for a real user.
    driftTimer = window.setInterval(() => {
      const items = candidates()
      if (!items.length) return
      if (!active) {
        active = items[index % items.length]
        index += 1
        active.setAttribute(HOVER_ATTR, 'true')
        pulse(active, true)
      }
      const rect = root.getBoundingClientRect()
      const seconds = Date.now() / 1000
      const clientX = rect.left + rect.width * (0.5 + 0.18 * Math.sin(seconds * 1.3))
      const clientY = rect.top + rect.height * (0.5 + 0.18 * Math.cos(seconds * 0.9))
      // Pointer-following components (image trail/lens/compare) attach their
      // handler to an inner element. Dispatch at the point under the cursor so
      // the event bubbles through the real target and its ancestors.
      const under = document.elementFromPoint(clientX, clientY)
      const moveTargets = new Set<HTMLElement>([active])
      if (under instanceof HTMLElement && root.contains(under)) moveTargets.add(under)
      if (moveTargets.size === 1 || autoClick) {
        // Idle previews use pointer-events-none, so elementFromPoint can miss
        // inner handlers. Pick the deepest element whose box contains the demo
        // point; pointermove/mousemove are safe and never trigger takeover.
        let deepest: HTMLElement | null = null
        for (const el of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
          const r = el.getBoundingClientRect()
          if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) deepest = el
        }
        if (deepest) moveTargets.add(deepest)
      }
      for (const target of moveTargets) {
        target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX, clientY }))
        target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX, clientY }))
      }

      // Carousels and layout toggles advance from button clicks. Cycle a real
      // control so their animation plays without interaction; fall back to the
      // component wrapper when the whole surface is the click target.
      if (autoClick) {
        clickTick += 1
        if (clickTick % 9 === 0) {
          const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('button:not([disabled])')).slice(0, 8)
          const target = buttons.length ? buttons[clickIndex % buttons.length] : active
          clickIndex += 1
          // The demo click must not trigger a card <a> navigation or form submit.
          // React's onClick still runs; only the browser default action is cancelled.
          const demoClick = new MouseEvent('click', { bubbles: true, cancelable: true, clientX, clientY })
          demoClick.preventDefault()
          target.dispatchEvent(demoClick)
        }
      }
    }, 120)
  }

  return () => {
    if (typeof timer !== 'undefined' && timer) window.clearInterval(timer)
    if (driftTimer) window.clearInterval(driftTimer)
    window.clearInterval(scrollTimer)
    release()
    root.classList.remove(AUTO_CLASS)
  }
}
