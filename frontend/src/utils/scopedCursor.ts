// Scoped native-cursor hiding for cursor-effect components.
//
// Cursor-effect components render their visual inside a frame that uses
// `pointer-events: none` so the effect never swallows a click meant for the
// content underneath. An element with `pointer-events: none` is skipped by
// hit-testing, so setting `cursor: none` on the frame itself has no effect.
//
// Instead we walk up to the nearest ancestor that *is* hit-testable — the
// preview box, tile or section the component is rendered into — and toggle a
// scoped attribute there. Because `cursor` inherits, this hides the native
// cursor only over that box and leaves it untouched everywhere else on the
// page. When the attribute is removed the native cursor is restored.

const HIDDEN_ATTR = "data-ui-hub-cursor-hidden";
const STYLE_ID = "ui-hub-scoped-cursor-style";

let styleReady = false;

function ensureStyle(): void {
    if (styleReady || typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) {
        styleReady = true;
        return;
    }
    const tag = document.createElement("style");
    tag.id = STYLE_ID;
    tag.textContent = `[${HIDDEN_ATTR}], [${HIDDEN_ATTR}] * { cursor: none !important; }`;
    document.head.appendChild(tag);
    styleReady = true;
}

function hitTestableHost(el: HTMLElement | null): HTMLElement | null {
    if (typeof window === "undefined" || !window.getComputedStyle) return el;
    let node: HTMLElement | null = el;
    while (node) {
        if (window.getComputedStyle(node).pointerEvents !== "none") return node;
        node = node.parentElement;
    }
    return el;
}

/**
 * Hide or restore the native cursor, scoped to the nearest hit-testable
 * ancestor of `host`. Safe to call repeatedly; no-ops on the server.
 */
export function setNativeCursorHidden(
    host: HTMLElement | null | undefined,
    hidden: boolean,
): void {
    if (typeof document === "undefined" || !host) return;
    const target = hitTestableHost(host);
    if (!target) return;
    if (hidden) {
        ensureStyle();
        target.setAttribute(HIDDEN_ATTR, "");
    } else {
        target.removeAttribute(HIDDEN_ATTR);
    }
}
