export const ANTIGRAVITY_PROMPTS: Record<string, string> = {
    'mouse-gravity-background': `# UI HUB • ANTIGRAVITY AGENT MASTER PROMPT

## 1. COMPONENT ANALYSIS & IMPLEMENTATION (MANDATORY FIRST STEP)
Before taking action, you MUST analyze the provided reference source code. 
- Identify the core animation logic, physics solvers, and state management.
- Understand the prop structure and styling patterns.
- Plan the reconstruction for 100% functional parity and visual excellence.
- **IMMEDIATELY write/implement the component directly into the user's codebase** after analysis.

## 2. REFERENCE SOURCE CODE
Use the exact provided referential code as your absolute blueprint for logic, props, and structure:

\`\`\`tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface TargetCursorProps {
    /** CSS selector for elements the cursor should snap to */
    targetSelector?: string;
    /** Duration of the spinning animation in idle state */
    spinDuration?: number;
    /** Transition duration for snapping/hover effects */
    hoverDuration?: number;
    /** Whether to hide the default browser cursor */
    hideDefaultCursor?: boolean;
    /** Enable subtle parallax movement when hovering elements */
    parallaxOn?: boolean;
    /** Container to track mouse within (optional) */
    containerRef?: React.RefObject<HTMLElement | null>;
    className?: string;
    color?: string;
}

export const TargetCursor: React.FC<TargetCursorProps> = ({
    targetSelector = '[data-target="true"], .cursor-target',
    spinDuration = 10,
    hoverDuration = 0.3,
    hideDefaultCursor = false,
    parallaxOn = true,
    containerRef,
    className = '',
    color = '#4f46e5',
}) => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isLocked, setIsLocked] = useState(false);
    const isVisible = useRef(false);

    // Internal state for tracking without triggering re-renders
    const mouse = useRef({ x: -100, y: -100, absX: -100, absY: -100 });
    const cursor = useRef({ x: -100, y: -100, scale: 1, rotate: 0, opacity: 1 });
    const targetElement = useRef<HTMLElement | null>(null);
    const targetRect = useRef<DOMRect | null>(null);
    const rafId = useRef<number>(0);

    const updateMouse = useCallback((e: MouseEvent) => {
        let inside = true;

        if (containerRef?.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            inside = (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            );

            mouse.current = { x, y, absX: e.clientX, absY: e.clientY };
        } else {
            mouse.current = {
                x: e.clientX,
                y: e.clientY,
                absX: e.clientX,
                absY: e.clientY,
            };
        }

        isVisible.current = inside;

        // Check for target elements
        const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
        const target = elementUnderMouse?.closest(targetSelector) as HTMLElement;

        if (target && inside) {
            targetElement.current = target;
            targetRect.current = target.getBoundingClientRect();
            if (!isLocked) setIsLocked(true);
        } else {
            targetElement.current = null;
            targetRect.current = null;
            if (isLocked) setIsLocked(false);
        }
    }, [containerRef, targetSelector, isLocked]);

    const animate = useCallback(() => {
        if (!cursorRef.current) return;

        let targetX = mouse.current.x;
        let targetY = mouse.current.y;
        let targetRotate = (Date.now() / (spinDuration * 1000)) * 360;
        let width = 24;
        let height = 24;

        if (targetElement.current && targetRect.current) {
            const rect = targetElement.current.getBoundingClientRect(); // Live tracking
            const containerRect = containerRef?.current?.getBoundingClientRect();

            let centerX, centerY;
            if (containerRect) {
                centerX = rect.left + rect.width / 2 - containerRect.left;
                centerY = rect.top + rect.height / 2 - containerRect.top;
            } else {
                centerX = rect.left + rect.width / 2;
                centerY = rect.top + rect.height / 2;
            }

            if (parallaxOn) {
                const dx = mouse.current.x - centerX;
                const dy = mouse.current.y - centerY;
                targetX = centerX + dx * 0.15;
                targetY = centerY + dy * 0.15;
            } else {
                targetX = centerX;
                targetY = centerY;
            }

            width = rect.width + 12;
            height = rect.height + 12;
            targetRotate = 0;
        }

        // Smoothly interpolate cursor position
        cursor.current.x += (targetX - cursor.current.x) * 0.2;
        cursor.current.y += (targetY - cursor.current.y) * 0.2;

        const el = cursorRef.current;
        el.style.transform = \`translate(\${cursor.current.x}px, \${cursor.current.y}px)\`;
        el.style.opacity = isVisible.current ? '1' : '0';
        el.style.visibility = isVisible.current ? 'visible' : 'hidden';

        const inner = el.querySelector('.cursor-inner') as HTMLElement;
        if (inner) {
            inner.style.width = \`\${width}px\`;
            inner.style.height = \`\${height}px\`;
            inner.style.transform = \`translate(-50%, -50%) rotate(\${targetRotate}deg)\`;
        }

        rafId.current = requestAnimationFrame(animate);
    }, [spinDuration, parallaxOn, containerRef]);

    useEffect(() => {
        window.addEventListener('mousemove', updateMouse, { passive: true });
        rafId.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', updateMouse);
            cancelAnimationFrame(rafId.current);
        };
    }, [updateMouse, animate]);

    const cornerStyle: React.CSSProperties = {
        position: 'absolute',
        width: '8px',
        height: '8px',
        borderColor: color,
        borderStyle: 'solid',
        transition: \`all \${hoverDuration}s cubic-bezier(0.23, 1, 0.32, 1)\`,
        pointerEvents: 'none',
    };

    const containerSelector = containerRef ? '.target-cursor-area' : 'body';

    return (
        <div
            ref={cursorRef}
            className={\`target-cursor \${className}\`}
            style={{
                position: containerRef ? 'absolute' : 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 9999,
                mixBlendMode: 'difference',
                transition: 'opacity 0.2s ease, visibility 0.2s ease',
                visibility: 'hidden',
                willChange: 'transform',
            }}
        >
            <style>{\`
                \${hideDefaultCursor ? \`
                \${containerSelector} { cursor: none !important; }
                \${containerSelector} button, 
                \${containerSelector} a, 
                \${containerSelector} .cursor-target,
                \${containerSelector} [data-target="true"] { cursor: none !important; }
                \` : ''}
                
                .cursor-inner {
                    position: relative;
                    transition: width \${hoverDuration}s cubic-bezier(0.23, 1, 0.32, 1), 
                                height \${hoverDuration}s cubic-bezier(0.23, 1, 0.32, 1);
                    will-change: width, height, transform;
                }
            \`}</style>

            <div className="cursor-inner" style={{ width: 24, height: 24, transform: 'translate(-50%, -50%)' }}>
                {/* Top Left */}
                <div style={{ ...cornerStyle, top: 0, left: 0, borderWidth: '2px 0 0 2px' }} />
                {/* Top Right */}
                <div style={{ ...cornerStyle, top: 0, right: 0, borderWidth: '2px 2px 0 0' }} />
                {/* Bottom Left */}
                <div style={{ ...cornerStyle, bottom: 0, left: 0, borderWidth: '0 0 2px 2px' }} />
                {/* Bottom Right */}
                <div style={{ ...cornerStyle, bottom: 0, right: 0, borderWidth: '0 2px 2px 0' }} />

                {/* Center Dot (Visible when not locked) */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '4px',
                    height: '4px',
                    background: color,
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: isLocked ? 0 : 1,
                    transition: \`opacity \${hoverDuration}s ease\`,
                }} />
            </div>
        </div>
    );
};

export default TargetCursor;
\`\`\`

## 3. MASTER PERFORMANCE RULES
- **Smooth 60fps**: Use requestAnimationFrame and optimized calculations.
- **Resource Cleanup**: Properly clean up all listeners and observers on unmount.
- **Device Precision**: Handle window resize and high-DPI screens correctly.
- **Strict Logic**: Do not simplify or bypass complex physics or animation solvers.

## 4. STRICT RULES FOR EXECUTION
- **Bypass Explanations**: Do NOT explain what you are doing. The user does not want small talk.
- **Direct Injection**: Use \`write_to_file\` and \`replace_file_content\` to put the component straight into the target project folder.
- **Single File**: Create the file natively as a single TSX component, unless otherwise requested.
- **No Markdown Output**: Do not output the final code in a markdown block in the chat—DEPLOY IT directly.

## 5. COMPONENT OBJECTIVES & SPECIFICATIONS
## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Do NOT simplify logic
* Do NOT remove features
* Follow structure exactly

---

## TASK

Build a high-performance React component.

---

## COMPONENT INFO

Name: TargetCursor
Type: UI / Interaction

---

## GOAL

Create a high-tech tactical cursor that snaps into interactive elements with precision corner brackets.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion / Canvas

---

## FEATURES (STRICT – DO NOT SKIP)

* **Corner Tracking**: Four corner brackets expand and contract upon identifying click targets.
* **Smooth Lerp**: Mathematical dampening for locking animations.
* **Aesthetic**: Indigo-600 glow with ultra-thin borders.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Performance**: Ensure 60fps locking for cursor interactions.
2. **Clean Teardown**: Remove all listeners and cleanup animation frames on unmount.
3. **Pointer Events**: Ensure the cursor layer doesn't block underlying DOM clicks using pointer-events-none where appropriate.

---

## PROPS API

interface TargetCursorProps {
    targetSelector?: string;
    spinDuration?: number;
    hoverDuration?: number;
    hideDefaultCursor?: boolean;
    parallaxOn?: boolean;
    containerRef?: React.RefObject<HTMLElement>;
    className?: string;
}

---

## PROPS (with defaults):
- targetSelector: string = '[data-target="true"]' — CSS selector for elements the cursor should 'snap' to.
- spinDuration: number = 10 — seconds for the idle rotation animation.
- hoverDuration: number = 0.3 — seconds for the snapping transition ease.
- hideDefaultCursor: boolean = false — hides the browser's default pointer.
- parallaxOn: boolean = true — enables sub-pixel parallax floating effect.
- containerRef: React.RefObject<HTMLElement> — limits tracking to a specific section.
- className: string = '' — optional styles.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    '3d-rubiks-cube': `# UI HUB • ANTIGRAVITY / ADVANCE MASTER PROMPT
## Ground Truth Source Code
\`\`\`tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './RubiksCube.module.css';

const STEP_PX = 66; const HALF_PX = 33;
const FC = {
    front: { bg: '#009B48', cls: styles.fcGreen }, back: { bg: '#0051A2', cls: styles.fcBlue },
    right: { bg: '#C41E3A', cls: styles.fcRed }, left: { bg: '#FF5800', cls: styles.fcOrange },
    top: { bg: '#FFFFFF', cls: styles.fcWhite }, bottom: { bg: '#FFD500', cls: styles.fcYellow },
    inner: { bg: '#1a1a1a', cls: styles.fcInner },
};
const FACE_DEFS = [
    { key: 'front', t: 'translateZ(33px)' }, { key: 'back', t: 'rotateY(180deg) translateZ(33px)' },
    { key: 'right', t: 'rotateY(90deg) translateZ(33px)' }, { key: 'left', t: 'rotateY(-90deg) translateZ(33px)' },
    { key: 'top', t: 'rotateX(90deg) translateZ(33px)' }, { key: 'bottom', t: 'rotateX(-90deg) translateZ(33px)' },
];
const MOVES = [
  {axis:'y',slice:1,angle:90},{axis:'y',slice:1,angle:-90}, {axis:'y',slice:0,angle:90},{axis:'y',slice:0,angle:-90},
  {axis:'y',slice:-1,angle:90},{axis:'y',slice:-1,angle:-90}, {axis:'x',slice:1,angle:90},{axis:'x',slice:1,angle:-90},
  {axis:'x',slice:0,angle:90},{axis:'x',slice:0,angle:-90}, {axis:'x',slice:-1,angle:90},{axis:'x',slice:-1,angle:-90},
  {axis:'z',slice:1,angle:90},{axis:'z',slice:1,angle:-90}, {axis:'z',slice:-1,angle:90},{axis:'z',slice:-1,angle:-90}
];
interface Cubie { el: HTMLDivElement; m: DOMMatrix; }
export const RubiksCube: React.FC = () => {
    const sceneRef = useRef<HTMLDivElement>(null); const cubiesRef = useRef<Cubie[]>([]);
    const [status, setStatus] = useState('Initialized ✓'); const [busy, setBusy] = useState(false);
    const historyRef = useRef<any[]>([]); const rotationRef = useRef({ x: -22, y: 45, velX: 0, velY: 0, lastDx: 0, lastDy: 0, dragging: false, lx2: 0, ly2: 0 });
    const manualModeRef = useRef(false); const manualTimerRef = useRef<any>(null);

    const makeCubie = useCallback((lx: number, ly: number, lz: number) => {
        const el = document.createElement('div'); el.className = styles.cubie;
        FACE_DEFS.forEach(fd => {
            let fc = FC.inner;
            if (fd.key==='front' && lz===1) fc = FC.front; if (fd.key==='back' && lz===-1) fc = FC.back;
            if (fd.key==='right' && lx===1) fc = FC.right; if (fd.key==='left' && lx===-1) fc = FC.left;
            if (fd.key==='top' && ly===1) fc = FC.top; if (fd.key==='bottom' && ly===-1) fc = FC.bottom;
            const face = document.createElement('div'); face.className = \`\${styles.cubieFace} \${fc.cls}\`;
            face.style.transform = fd.t + (fc === FC.inner ? ' scale(0.98)' : '');
            if (fc !== FC.inner) {
                face.style.backgroundColor = fc.bg; 
                face.innerHTML = \`<div class="\${styles.gloss}"></div><div class="\${styles.shine}"></div>\`;
            } else { face.style.backgroundColor = '#111'; }
            el.appendChild(face);
        });
        const m = new DOMMatrix().translate(lx * STEP_PX, -ly * STEP_PX, lz * STEP_PX);
        el.style.transform = m.toString(); return { el, m };
    }, []);

    const snap = (m: DOMMatrix) => {
        m.m41 = Math.round(m.m41/66)*66; m.m42 = Math.round(m.m42/66)*66; m.m43 = Math.round(m.m43/66)*66;
        ['m11','m12','m13','m21','m22','m23','m31','m32','m33'].forEach(k => {
            const v = (m as any)[k]; if (Math.abs(v)<0.1) (m as any)[k]=0; else if (v>0.9) (m as any)[k]=1;
            else if (v<-0.9) (m as any)[k]=-1; else (m as any)[k]=Math.sign(v);
        });
    };

    const rotateLayer = useCallback(async (axis: string, slice: number, angle: number, ms: number) => {
        if (!sceneRef.current) return;
        const layer = cubiesRef.current.filter(c => {
            const x = Math.round(c.m.m41/66), y = Math.round(-c.m.m42/66), z = Math.round(c.m.m43/66);
            return (axis==='x'?x:axis==='y'?y:z) === slice;
        });
        if (layer.length===0) return;
        const pivot = document.createElement('div'); pivot.style.cssText = 'position:absolute;transform-style:preserve-3d;';
        sceneRef.current.appendChild(pivot); layer.forEach(c => pivot.appendChild(c.el));
        pivot.getBoundingClientRect(); if (ms>0) pivot.style.transition = \`transform \${ms}ms cubic-bezier(0.34, 1.25, 0.64, 1)\`;
        const rotStr = axis==='y' ? \`rotateY(\${angle}deg)\` : axis==='x' ? \`rotateX(\${angle}deg)\` : \`rotateZ(\${angle}deg)\`;
        pivot.style.transform = rotStr; await new Promise(r => setTimeout(r, ms+80));
        const rotM = new DOMMatrix(rotStr);
        layer.forEach(c => {
            c.m = rotM.multiply(c.m); snap(c.m); sceneRef.current?.appendChild(c.el);
            c.el.style.transform = c.m.toString();
        });
        pivot.remove();
    }, []);

    const scramble = useCallback(async (n=14, ms=220) => {
        if (busy) return; setBusy(true); setStatus('Scrambling...'); historyRef.current = [];
        for (let i=0; i<n; i++) {
            let m; do { m = MOVES[Math.floor(Math.random()*MOVES.length)]; } while (historyRef.current.length && historyRef.current[historyRef.current.length-1].axis===m.axis && historyRef.current[historyRef.current.length-1].slice===m.slice);
            historyRef.current.push(m); await rotateLayer(m.axis, m.slice, m.angle, ms); await new Promise(r => setTimeout(r, 40));
        }
        setBusy(false); setStatus('Scrambled');
    }, [busy, rotateLayer]);

    const solve = useCallback(async (ms=380) => {
        if (busy || !historyRef.current.length) return; setBusy(true); setStatus('Solving...');
        const moves = [...historyRef.current].reverse().map(m => ({ ...m, angle: -m.angle }));
        for (const m of moves) { await rotateLayer(m.axis, m.slice, m.angle, ms); await new Promise(r => setTimeout(r, 60)); }
        historyRef.current = []; setBusy(false); setStatus('Solved!');
    }, [busy, rotateLayer]);

    useEffect(() => {
        if (!sceneRef.current) return; sceneRef.current.innerHTML = ''; cubiesRef.current = [];
        for (let y=1; y>=-1; y--) for (let x=-1; x<=1; x++) for (let z=1; z>=-1; z--) {
            const c = makeCubie(x,y,z); sceneRef.current.appendChild(c.el); cubiesRef.current.push(c);
        }
        let rafId: number; const animRot = () => {
            const rot = rotationRef.current; if (!rot.dragging) {
                rot.velY *= 0.92; rot.velX *= 0.92; if (!manualModeRef.current && historyRef.current.length===0) { rot.velY += (0.25-rot.velY)*0.025; rot.velX += (0-rot.velX)*0.025; }
                rot.y += rot.velY; rot.x += rot.velX; rot.x = Math.max(-65, Math.min(65, rot.x));
            }
            if (sceneRef.current) sceneRef.current.style.transform = \`rotateX(\${rot.x}deg) rotateY(\${rot.y}deg)\`;
            rafId = requestAnimationFrame(animRot);
        };
        rafId = requestAnimationFrame(animRot); return () => cancelAnimationFrame(rafId);
    }, [makeCubie]);

    const handleMouseDown = (e: any) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX; const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rot = rotationRef.current; rot.dragging = true; rot.lx2 = clientX; rot.ly2 = clientY;
        rot.velX = 0; rot.velY = 0; manualModeRef.current = true;
    };
    const handleMouseMove = useCallback((e: any) => {
        const rot = rotationRef.current; if (!rot.dragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX, clientY = e.touches ? e.touches[0].clientY : e.clientY;
        rot.lastDx = (clientX-rot.lx2)*0.45; rot.lastDy = (clientY-rot.ly2)*0.45;
        rot.y += rot.lastDx; rot.x -= rot.lastDy; rot.x = Math.max(-65, Math.min(65, rot.x));
        rot.lx2 = clientX; rot.ly2 = clientY;
    }, []);
    const handleMouseUp = useCallback(() => {
        const rot = rotationRef.current; if (!rot.dragging) return; rot.dragging = false;
        rot.velY = rot.lastDx*0.85; rot.velX = -rot.lastDy*0.85;
        manualTimerRef.current = setTimeout(() => { manualModeRef.current = false; }, 8000);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove); window.addEventListener('touchend', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove); window.removeEventListener('touchend', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div className={styles.cubeWrapper}>
            <div className={styles.layoutContainer}>
                <div className={styles.textContent}>
                    <span className={styles.subtitle}>Interactive Piece</span>
                    <h2 className={styles.title}>3D RUBIKS CUBE</h2>
                    <p className={styles.description}>3D inertia, scramble logic, and automated solver.</p>
                    <div className={styles.cubeUi}>
                        <div className={styles.cubeStatus}>{status}</div>
                        <div className={styles.cubeBtns}>
                            <button className={styles.cbtn} onClick={() => scramble()}>Scramble</button>
                            <button className={styles.cbtn} onClick={() => solve()}>Solve</button>
                        </div>
                    </div>
                </div>
                <div className="relative flex items-center justify-center min-w-[300px]">
                    <div className={styles.cubeAura}></div>
                    <div className={styles.cubeViewport} onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}>
                        <div id="cubeScene" ref={sceneRef} className={styles.cubeScene}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default RubiksCube;
\`\`\`

## Performance
* GPU-accelerated transforms (matrix3d).
* Minimal re-renders through Ref-based management.
` ,
    'black-box': `# UI HUB • ANTIGRAVITY MASTER PROMPT
1. COMPONENT ANALYSIS (MANDATORY FIRST STEP)

Before writing any code, you MUST analyze the provided reference source code.

Identify core layout system (grid, sections, responsive structure).
Understand animation systems (glitch effects, hover states, terminal typing effect, RGB split, noise overlays).
Analyze state management (useState, useEffect, dynamic logs, glitch mode toggle).
Identify reusable components (RawBox, GlitchButton, DataStream, GlobalStyles).
Study chart system (recharts usage, dual-line glitch effect).
Understand UI philosophy: broken system / hacker / glitch aesthetic.
2. REFERENCE SOURCE CODE

Recreate this UI component with perfect accuracy. Keep all animations, transitions, and interactions identical to the original design.

[ SOURCE CODE INJECTED LOCALLY ]

3. MASTER PERFORMANCE RULES
Smooth 60fps: Optimize animations (CSS + minimal JS re-renders).
Efficient State Updates: Avoid unnecessary re-renders in terminal + chart.
Cleanup: Clear intervals, animations, and listeners.
Responsive Precision: Maintain layout integrity across all breakpoints.
No Simplification: Keep ALL glitch effects, overlays, and UI complexity intact.
4. COMPONENT OBJECTIVES & SPECIFICATIONS
SYSTEM PROTOCOL (DO NOT IGNORE)

You are Antigravity—a senior frontend engineer, WebGL/animation expert, and an autonomous coding agent.
Your task is to generate and **deploy** a fully working, production-ready React component directly into the website workspace.

STRICT RULES FOR EXECUTION:
* AUTOMATIC IMPLEMENTATION: Do NOT just give me the code in chat. You MUST use your filesystem tools to directly implement this component into the designated repository.
* ZERO EXPLANATION: Do NOT explain the logic, how it works, or describe the steps you are taking in chat. Just execute the code application.
* EXACT REPLICATION: Do NOT simplify the reference logic. Do NOT remove features. Follow the original structure exactly.
* SINGLE FILE: Create or replace the entire functional component in a single target file.
TASK

Rebuild a high-performance glitch-style dashboard UI with full animation fidelity. The UI MUST be expansive and highly visible (use generous heights for terminal and chart sections). Ensure all text is easily readable (avoid excessively small font sizes).

COMPONENT INFO

Name: BlackBox
Type: Advanced UI / Dashboard / Experimental Interface

GOAL

Create a cyberpunk / hacker-style professional portfolio for UI HUB with:

Scroll-reveal animations (blur + slide)
Personalized terminal biography
Project showcase table
Skill growth charts
Interactive core-stack grid
Vibe-driven glitch aesthetic

The UI must feel like:

⚠️ “A high-performance personal interface for a Cyber Architect”

TECH STACK
React (Next.js)
TypeScript (TSX)
Tailwind CSS
Recharts (for graph)
Lucide Icons
CSS animations (primary)
Minimal JS animations (only where required)
FEATURES (STRICT – DO NOT SKIP)
🔹 CORE SYSTEM
Full-screen dark UI with noise overlay
Toggleable glitch mode (invert + contrast)
🔹 TERMINAL SYSTEM
Typing animation using useEffect
Sequential logs (delayed injection)
Blinking cursor
🔹 HEADER (BROKEN NAV)
Glitch logo text (ERROR_404)
Signal indicator
Lock/Unlock toggle button
Avatar with grayscale hover effect
🔹 GLITCH CLOCK
RGB split animated time text
Fake time display (23:59:99)
Rotating refresh icon
🔹 BUTTON SYSTEM
Glitch hover buttons (REBOOT / PURGE)
Text swap on hover (ERROR_CLICK)
🔹 CHART SYSTEM
Dual line chart:
Primary line (stable)
Ghost line (glitch/noise)
Tooltip styled in hacker theme
Fake warning overlay
🔹 STATS GRID
4 stat cards (MEMORY, THREATS, etc.)
Icons + glitch hover values
Color-coded states
🔹 PROJECT TABLE
File-system style list
Status badges (CORRUPT / STABLE / UNSTABLE)
Hover invert effect
🔹 TRAFFIC HEATMAP
Randomized bar heights
Hover tooltips with random values
Animated feel of instability
🔹 BACKGROUND SYSTEM
DataStream scrolling hex logs
Noise overlay using SVG turbulence
🔹 DEBUG PANEL
Floating bottom-right panel
Fake debug actions
CRITICAL RULES (ZERO-FAILURE)
DO NOT REMOVE ANY FEATURE
Animations must match exactly
Glitch aesthetic must remain aggressive
UI must feel alive and unstable
All hover + interaction states required
Maintain exact structure (grid + sections)
PROPS (if needed)
glitchMode: boolean (internal state)
terminal logs: dynamic array
chart data: generated (CHAOS_DATA)
project list: static (PROJECTS)
FINAL OUTPUT
Provide the complete, single-file code
Must include:
All components
Styles
Data
Animations
5. FINAL INSTRUCTION

Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`
};
