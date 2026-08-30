export const ANTIGRAVITY_PROMPTS = {
    "3d-landing-page": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Build a high-performance 3D Landing Page component.

---

## COMPONENT INFO

Name: ThreeDLandingPage
Type: UI / 3D / Landing Page

---

## GOAL

Create a "ThreeDLandingPage" React component utilizing Tailwind CSS, 'lucide-react', '@splinetool/react-spline', and 'motion/react'. Build a responsive container (h-[600px] rounded-3xl) that tracks mouse movement to apply a smooth 3D tilt effect (rotateX, rotateY) to the content. Use 'Gruppo' and 'Sen' fonts imported via CSS. Ensure an exact, high-fidelity reproduction with fully functional, mouse-reactive React code.

---

## TECH STACK

* React
* TypeScript (TSX)
* Tailwind CSS
* Lucide React
* @splinetool/react-spline
* motion/react (framer-motion)

---

## FEATURES (STRICT – DO NOT SKIP)

* **3D Integration**: Use Spline for complex 3D scenes.
* **3D Mouse Tilt**: MouseMove logic on the container that calculates x/y offsets to drive rotateX and rotateY via useSpring.
* **Glassmorphism**: Advanced CSS back-drop filter effects.
* **Responsive Rendering**: Conditional rendering between 3D scene and GIF based on screen size.
* **Interactive UI**: Fully functional navigation and mobile menu.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Precision**: The glassmorphic cards must have perfect semi-transparent borders.
2. **Typography**: Fonts must be imported correctly using CSS inside the component.
3. **Performance**: Spline scene must load and render smoothly; GIF fallback is required for mobile.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "3d-hero": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Build a single full-viewport hero section in React + TypeScript + Vite + Tailwind CSS, using \`lucide-react\` for icons. The component is a character-figurine carousel called "TOONHUB".

**Fonts (load in \`index.html\` head):**
\`\`\`html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
\`\`\`
Body font: \`'Inter', sans-serif\`. Display font (huge ghost text + bottom-right link): \`'Anton', sans-serif\`.

**Image data (4 items, exact URLs and colors):**
\`\`\`ts
const IMAGES = [
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png', bg: '#F4845F', panel: '#F79B7F' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png', bg: '#6BBF7A', panel: '#85CC92' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png', bg: '#E882B4', panel: '#ED9DC4' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png', bg: '#6EB5FF', panel: '#8DC4FF' },
];
\`\`\`
Preload all 4 images on mount via \`new Image()\`.

**State & logic:**
- \`activeIndex\` (0–3), \`isAnimating\` boolean lock, \`isMobile\` (\`window.innerWidth < 640\`, updated on resize).
- \`navigate('next' | 'prev')\`: ignore if animating; set \`isAnimating=true\`; bump \`activeIndex\` \`(prev+1)%4\` or \`(prev+3)%4\`; release lock after \`650ms\`.
- Roles derived from activeIndex: \`center=activeIndex\`, \`left=(activeIndex+3)%4\`, \`right=(activeIndex+1)%4\`, \`back=(activeIndex+2)%4\`.

**Layout structure:**
Outer \`<div>\` has \`backgroundColor: IMAGES[activeIndex].bg\`, transition \`background-color 650ms cubic-bezier(0.4,0,0.2,1)\`, \`fontFamily: 'Inter, sans-serif'\`, \`relative w-full overflow-hidden\`. Inside, a \`relative w-full\` div with \`height: 100vh; overflow: hidden\`.

1. **Grain overlay** (\`absolute inset-0 pointer-events-none\`, zIndex 50): SVG fractalNoise data URI, \`baseFrequency=0.9\`, \`numOctaves=4\`, opacity 0.08 inside SVG, container \`opacity: 0.4\`, \`backgroundSize: 200px 200px\`, repeat.

2. **Giant ghost text "3D SHAPE"** (\`absolute inset-x-0 flex items-center justify-center pointer-events-none select-none\`, zIndex 2, \`top: 18%\`): font Anton, \`fontSize: clamp(90px, 28vw, 380px)\`, weight 900, color white, opacity 1, lineHeight 1, uppercase, letterSpacing \`-0.02em\`, whiteSpace nowrap.

3. **Top-left brand label "TOONHUB"** (\`absolute top-6 left-4 sm:left-8\`, zIndex 60): \`text-xs font-semibold uppercase\`, white, opacity 0.9, letterSpacing \`0.18em\`.

4. **Carousel** (\`absolute inset-0\`, zIndex 3): map all 4 IMAGES; each item is \`position:absolute\`, \`aspectRatio: '0.6 / 1'\`, with role-based styles below. Inside, an \`<img>\` \`width:100%; height:100%; objectFit:contain; objectPosition:bottom center; draggable=false\`.

   Per-role style:
   - **center**: \`transform: translateX(-50%) scale(\${isMobile?1.25:1.68})\`, no blur, opacity 1, zIndex 20, \`left:50%\`, \`height: isMobile?'60%':'92%'\`, \`bottom: isMobile?'22%':0\`.
   - **left**: \`translateX(-50%) scale(1)\`, blur 2px, opacity 0.85, zIndex 10, \`left: isMobile?'20%':'30%'\`, \`height: isMobile?'16%':'28%'\`, \`bottom: isMobile?'32%':'12%'\`.
   - **right**: same as left but \`left: isMobile?'80%':'70%'\`.
   - **back**: \`translateX(-50%) scale(1)\`, blur 4px, opacity 1, zIndex 5, \`left:50%\`, \`height: isMobile?'13%':'22%'\`, \`bottom: isMobile?'32%':'12%'\`.

   Transition on each item: \`transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms ..., opacity 650ms ..., left 650ms ...\`. \`willChange: transform, filter, opacity\`.

5. **Bottom-left text + nav buttons** (\`absolute bottom-6 left-4 sm:bottom-20 sm:left-24\`, zIndex 60, \`maxWidth:320px\`):
   - \`<p>\` "TOONHUB FIGURINES" — bold uppercase, tracking-widest, \`mb-2 sm:mb-3 text-base sm:text-[22px]\`, white, opacity 0.95, letterSpacing \`0.02em\`.
   - \`<p>\` (hidden on mobile, \`hidden sm:block\`): "The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now." — \`text-xs sm:text-sm\`, white, opacity 0.85, lineHeight 1.6, \`mb-4 sm:mb-5\`.
   - Two circular buttons (\`w-12 h-12 sm:w-16 sm:h-16\`, transparent bg, 2px white border, white icon): \`ArrowLeft\` and \`ArrowRight\` from lucide-react, size 26, strokeWidth 2.25. On hover: scale 1.08 + bg \`rgba(255,255,255,0.12)\`. Transition \`transform 150ms, background-color 150ms\`. Click triggers \`navigate('prev')\` / \`navigate('next')\`.

6. **Bottom-right link "DISCOVER IT"** (\`absolute bottom-6 right-4 sm:bottom-20 sm:right-10\`, zIndex 60): \`<a>\` flex items-center, font Anton, \`fontSize: clamp(20px, 4vw, 56px)\`, weight 400, white, opacity 0.95→1 on hover (200ms), letterSpacing \`-0.02em\`, lineHeight 1, uppercase, no underline. Followed by \`ArrowRight\` (\`w-5 h-5 sm:w-8 sm:h-8\`, strokeWidth 2.25).

**Behavior summary:** clicking arrows rotates roles; background color, image positions, scales, blurs, and opacities all crossfade simultaneously over 650ms with \`cubic-bezier(0.4,0,0.2,1)\`. The character images sit at the bottom of the screen overlapping the giant "3D SHAPE" text behind them.
`,
    "corner-border-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: CornerBorderButton
Type: UI / Interaction

---

## GOAL

Create a component that features sharp, high-contrast "Corner-First" border animations. Borders must grow dynamically from corners upon hover, creating a clinical, military-grade interface aesthetic.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion (optional, but CSS preferred for this specific logic)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Independent Border Growth**: Four independent <span> elements animating width/height from 0 to 100% on hover.
* **Staggered Delay**: 100ms staggered delay between border segments for a sophisticated "drawing" effect.
* **Corner Squares**: Fixed 1.5x1.5px squares at top-left and bottom-right for visual weight.
* **Color Shift**: Instant background color transition with duration-400.
* **Custom Colors**: Support for baseColor, hoverColor, and borderColor props.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Performance**: Must maintain 60fps; use pure CSS for animations where possible.
2. **Precision**: Use absolute precision in positioning corner markers and border spans.
3. **Contrast**: High-contrast tech aesthetic is mandatory.

---

## PROPS (with defaults):
- children: React.ReactNode = 'Button' — text or elements inside the button.
- className: string = '' — optional styling.
- baseColor: string = '#27272a' — neutral state background hex.
- hoverColor: string = '#3f3f46' — background on mouse over.
- borderColor: string = '#3b82f6' — animated neon corner stroke color.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.

`,
    "corner-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: CornerButton
Type: UI / Interaction

---

## GOAL

Create a sharp button whose corner brackets slide around the edges with a laser-glow burst on hover. A brand logo sits left of the label and an action icon sits right, all wrapped in a useId-scoped <style> block so effects never leak.

---

## TECH STACK

* React (Next.js, \"use client\")
* TypeScript (TSX)
* Tailwind CSS
* lucide-react for iconography
* Scoped CSS via useId + inline <style> (no external stylesheet)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Corner Brackets**: Four absolutely-positioned corner spans (~14px rest) that extend to ~100% of their edge on hover/focus, coordinated with transition delays.
* **Radial Glow**: A radial-gradient glow layer behind the button that fades in on hover in the accent color.
* **Icon Pairing**: Logo image left of label (slides left on hover) + lucide icon right (slides right on hover).
* **Single Accent Source**: accentColor prop drives bracket and glow color everywhere.
* **Scoped Styles**: useId generates a unique style id so instances never fight.
* **Mobile**: Responsive downscaling under 480px.

---

## PROPS (with defaults):
- children: React.ReactNode = 'Start designing' — button label.
- icon: LucideIcon = Pencil — trailing action icon.
- accentColor: string = '#FF3B4D' — bracket + glow color.
- showTitleImage: boolean = true — show the brand mark.
- titleImage: string | null = default mark — brand logo (URL or data URI).
- titleImageAlt: string — brand mark alt text.
- titleImageClassName: string — brand mark sizing classes.
- className: string = '' — optional styling.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.

`,
    "creepy-button": `# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: CreepyButton
Type: UI / Interaction

---

## GOAL

Create a playful-horror button with two glowing white eyes whose pupils track the cursor, pupils that watch the pointer in real time, and a cover face that tilts sideways on hover.

---

## TECH STACK

* React (Next.js, "use client")
* TypeScript (TSX)
* Tailwind CSS
* framer-motion (spring covers + looping blink keyframes)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Cursor-Tracking Eyes**: Two white eyes with black pupils that follow the mouse via atan2 angle math, clamped by visionRangeX (180) and visionRangeY (75).
* **Blink Loop**: Eyes blink every 3s via framer-motion keyframes [0.75em, 0.75em, 0em, 0.75em] at times [0, 0.92, 0.96, 1].
* **Tilt Cover**: A cover layer above the eyes rotates -12° on hover with a spring (stiffness 300, damping 20, mass 0.8), origin [1.25em 50%] so it pivots off-center.
* **Touch Support**: OnTouchMove updates pupils; onMouseLeave/onBlur resets them.
* **Accessibility**: Focus-visible ring, select-none, keyboard focus resets pupils.

---

## PROPS (with defaults):
- children: React.ReactNode — the button label.
- className: string = '' — container classes.
- coverClassName: string = '' — classes for the tilting cover.
- onClick + all native button attributes forwarded.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,

    "radial-glow-button": `# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: RadialGlowButton
Type: UI / Interaction

---

## GOAL

Create a modern gradient button whose radial-gradient surface continually shifts color and position, framed by an animated gradient border and swept by a rotating light 'spark' — all driven by CSS @property-registered custom properties for smooth, GPU-friendly interpolation.

---

## TECH STACK

* React (Next.js, "use client")
* TypeScript (TSX)
* Tailwind CSS (cn utility only for class merge)
* Pure CSS: @property-registered custom properties (no JS animation loop)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Drifting Radial Surface**: background set via radial-gradient(var(--rg-spread-x) var(--rg-spread-y) at var(--rg-pos-x) var(--rg-pos-y), five color stops).
* **Registered Custom Properties**: Every animatable value must be declared with @property (correct syntax + initial-value) so the browser interpolates it: --rg-pos-x/y, --rg-spread-x/y, --rg-color-1..5, --rg-stop-1..5, --rg-border-angle, --rg-border-color-1/2.
* **Gradient Border Frame**: a ::before layer (inset 0, padding 1px, mask-composite: exclude) paints a 1px linear-gradient border that shifts its angle and colors.
* **Light Sweep (rg-shine)**: container-type: size; an aspect-ratio square slides across the full width (translate calc(100cqw - 100%)) while a conic-gradient spark rotates (rg-spin keyframes), blended with soft-light.
* **Inner Cutout (rg-bg)**: an inset 1px layer re-paints the same gradient for a crisp cut edge.
* **Hover State**: repaints color stack to a light/dark contrast palette, tightens spread, rewrites stops, rotates border angle, reveals the shine layer.
* **Transitions**: .75s on every registered property + .25s/0.3s on opacity, so hover morphs are butter-smooth.

---

## PROPS (with defaults):
- children: React.ReactNode = 'Get Extension' — the label.
- className: string = '' — extra classes merged onto the button.
- All native button attributes forwarded.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,

    "spider-web": `# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: SpiderWeb
Type: Interactive Canvas Background

---

## GOAL

Create an orb web strung across the frame whose silk gives way under the pointer and springs back once it has passed. Every intersection is a mass on a spring anchored to where it ought to be, so the whole sheet rings for a moment before it settles. The loop must park itself when nothing is moving or hovering, so an idle web costs nothing.

---

## TECH STACK

* React (Next.js, "use client")
* TypeScript (TSX)
* HTML5 Canvas 2D — no WebGL, no external animation libraries
* ResizeObserver for responsive sizing

---

## FEATURES (STRICT – DO NOT SKIP)

* **Spring Physics**: Each node is a damped spring (STIFFNESS 460, DAMPING = 2 * sqrt(STIFFNESS) * 0.05) pulling back to its rest position, integrated explicitly with frame-capped dt (max 0.033s so backgrounded tabs never explode).
* **Pointer Influence**: Squared-falloff outward force within REACH 370px, strength PUSH 90 scaled by hoverIntensity/10, so silk stretches away from the cursor.
* **Orb Layout**: Nodes stored as a [ring][spoke] grid; rings crowd toward the centre (radius = outer * t^1.35); the outer ring is placed past the corners (Math.hypot * 0.56) and pinned so the silk runs off the frame edge.
* **Curved Silk**: Spiral strands drawn as quadratic curves bowed toward the centre by \`sag\` (a share of the strand's own span); radials drawn from centre out through every ring.
* **Deterministic Wobble**: A hash() function adds slight angle/radius irregularity so the web keeps the same crooked strands frame to frame.
* **Self-Parking Loop**: cancels requestAnimationFrame when nothing is moving and no pointer influence is active; wakes on pointermove.
* **Config Mapping**: Panel-friendly whole numbers clamped and mapped to simulation values (thickness 0.3 + 0.22*val, sag 0.011*val, irregularity 0.02*val, nodeSize 0.4 + 0.18*val).
* **Cleanup**: dispose() removes canvas and listeners on unmount.

---

## PROPS (with defaults):
- color: string = '#DCE6FF' — silk color.
- opacity: number = 100 — global web opacity (0–100).
- segments: number = 28 — radial spokes (5–28).
- rings: number = 14 — concentric rings (3–14).
- thickness: number = 3 — silk weight (1–10).
- sag: number = 20 — strand bow toward centre (0–20).
- irregularity: number = 0 — wobble of angle/radius (0–20).
- hoverIntensity: number = 20 — pointer push strength (0–20).
- nodes: boolean = false — draw intersection dots.
- nodeColor: string = '#FFFFFF' — dot color.
- nodeSize: number = 4 — dot size (1–10).
- style: React.CSSProperties — extra container styles.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.`,

        "infinity-image": `# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and animation expert.
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

Build a high-performance Infinity Image figure-8 loop gallery React component.

---

## COMPONENT INFO

Name: InfinityImage
Type: Image Interaction (CSS Motion Path Figure-8 Gallery)

---

## GOAL

Create a continuous infinity ring gallery where thumbnail cards flow seamlessly along a figure-eight path using CSS offset-path, rotating tangentially and evenly spaced around the dual-lobe loop. Each card renders a real image thumbnail with glossy overlays, auto-scales responsively for all viewport widths, and pauses on hover.

---

## TECH STACK

* React ("use client")
* TypeScript (TSX)
* CSS Motion Path (offset-path, offset-rotate, offset-anchor)
* Tailwind CSS`,

"spiral-images": `# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and Canvas animation expert.
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

Name: SpiralImages
Type: Image Interaction (Canvas 2D Vortex)

---

## GOAL

Create an infinite vortex of images flowing along an Archimedean spiral from the outer edge into the center (a "whirl"), each card rotating to follow the spiral's tangent and fading out as it reaches the edges of the path. Self-contained Canvas 2D — no workers, no WebGL, no external animation libraries, single file.

---

## TECH STACK

* React (Next.js, "use client")
* TypeScript (TSX)
* HTML5 Canvas 2D — no WebGL, no workers, no animation libraries
* ResizeObserver for responsive sizing

---

## FEATURES (STRICT – DO NOT SKIP)

* **Archimedean Spiral**: spiral(n, R) → angle = n * turns * TWO_PI, radius = R * (1 - n); n in [0,1] maps outer edge (0) to center (1).
* **Arc-Length Reparameterization**: build a cumulative arc-length table over the spiral at R=1 (2000 samples) plus a 1024-entry inverse lookup; arcToN(s) interpolates between table entries so EQUAL ARC fraction → equal visual card spacing (a uniform parameter step would bunch cards near the center).
* **Continuous Stream**: advance a 0–100 progress at \`speed\` units per second (frame-capped dt, max 0.1s); slots tiled over the whole path at stepFrac = max(0.005, spacing*0.5/100) with a cap of 400 cards; cards cycle through the provided image list (img = i % nImgs) so one image still fills the spiral.
* **Per-Card Transform**: tangent angle via finite difference at n+0.001; size attenuation Math.pow(Math.min(dist/R,1), sizeAttenuation*0.5); aspect ratio from naturalWidth/naturalHeight (swap axis for portrait); fade in over \`fadeIn\` and out over \`fadeOut\` of the 0–100 path with cards below 0.01 opacity skipped.
* **Rounded-Card Clipping**: roundRect path clipped per card — cornerRadius scaled by (cornerRadius/20) * (min(cw,ch)/2); fill hsl(imgIdx*360/nImgs, 65%, 55%) placeholder until the image is loaded, then drawImage.
* **Z-Ordering**: cards sorted by spiral parameter ascending (outer → center) so center cards draw on top.
* **DPR & Resize**: canvas sized to the container (clientWidth/clientHeight, 600 fallback) with DPR capped at 2, via ResizeObserver; cleanup cancels rAF and disconnects the observer.
* **Default Export**: single default export function; set displayName = "Spiral Images"; merged defaults via COMPONENT_DEFAULTS so every prop has a working default.

---

## PROPS (with defaults):
- images: Array<{ src: string }> = DEFAULT_IMAGES — source images (14 seeded).
- turns: number = 3.5 — total spiral turns.
- speed: number = 2 — progress per second.
- spacing: number = 5 — card density along the arc (smaller = more cards).
- spread: number = 6 — uniform radius scale (arms overflow + clip).
- sizeAttenuation: number = 2 — center shrink strength.
- imageSize: number = 200 — base card size.
- fadeIn: number = 20 — fade ramp entering (0–100).
- fadeOut: number = 0 — fade ramp hitting the center (0–100).
- cornerRadius: number = 5 — card rounded corners.
- style: React.CSSProperties — wrapper styles.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.`,

    "border-beam": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Build a high-performance React component featuring an "Infinite Energy Loop" border effect.

---

## COMPONENT INFO

Name: BorderBeam
Type: UI / Animation

---

## GOAL

Create a component where a glowing beam of light travels along the border of any container, highlighting the edges with a high-tech "scanning" aesthetic.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Framer Motion
* Tailwind CSS

---

## FEATURES (STRICT – DO NOT SKIP)

* **CSS Masking**: Use mask-image with linear-gradient for edge transparency.
* **Offset Path**: Utilize offset-path: rect() for efficient path-following movement.
* **Volumetric Glow**: Apply box-shadow to the moving beam for a halo effect.
* **Dynamic Control**: Props for size, duration, colorFrom, colorTo, and glowIntensity.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Efficiency**: Use offset-path for geometric path following to avoid JS-based coordinate calculations.
2. **Versatility**: The beam must adapt to the container's border-radius.
3. **No Pop-in**: Animation must loop seamlessly with no visual jumps.

---

## PROPS (with defaults):
- size: number = 200 — width of the animated highlight beam.
- duration: number = 15 — animation cycle time in seconds.
- delay: number = 0 — offset before animation starts.
- colorFrom: string = '#ffaa40' — origin color of the gradient.
- colorTo: string = '#9c40ff' — terminal color of the gradient.
- borderThickness: number = 1.5 — width of the glowing laser outline.
- glowIntensity: number = 1 — box-shadow strength.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.

`,
    "glow-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Build a high-performance React component with "Interactive Atmospheric" lighting.

---

## COMPONENT INFO

Name: GlowButton
Type: UI / Interaction

---

## GOAL

Create a button with multiple layers of neon glow that react in real-time to cursor position, creating depth and volumetric lighting.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* CSS Custom Properties

---

## FEATURES (STRICT – DO NOT SKIP)

* **Real-time Tracking**: Map mouse coordinates to radial-gradient centers.
* **Multilayer Glow**: Use blur-sm to blur-2xl for soft light diffusion.
* **Neon Core**: High-contrast text with matched drop shadows.
* **Ambient Pulse**: Independent background elements with subtle breathing animations.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Performance**: Optimize coordinate updates with state or CSS variables to ensure 60fps.
2. **Diffusion**: Glow must feel volumetric, not flat.
3. **Clean Teardown**: Ensure event listeners for mouse tracking are removed on unmount.

---

## PROPS (with defaults):
- label: string = 'Hover Me' — displayed text.
- className: string = '' — layout tweaks.
- color: string = '#0ea5e9' — neon highlight.
- onClick: () => void — execution handler.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.

`,
    "marquee-hover-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Build a high-performance React component with an "Infinite Communication" marquee interaction.

---

## COMPONENT INFO

Name: MarqueeHoverButton
Type: UI / Interaction

---

## GOAL

Create a button that displays a static label by default, but transforms into an infinite scrolling marquee of text upon hover.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Framer Motion
* Tailwind CSS

---

## FEATURES (STRICT – DO NOT SKIP)

* **Seamless Loop**: Text must scroll from edge to edge with invisible wrap points.
* **Cross-Fade**: Static label fades out as marquee fades in (and vice versa).
* **Velocity Control**: Transition timing must be smooth and linear (duration: 3s default).
* **Layout Persistence**: Button width must remain consistent during state transitions.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Edge Handling**: Ensure text clipping at the boundaries is perfectly sharp.
2. **Wrap Logic**: Marquee must not show "blank space" during the transition cycle.
3. **Styling**: Must maintain the high-end Antigravity aesthetic.

---

## PROPS (with defaults):
- label: string = 'Click' — central text payload.
- className: string = '' — DOM styling.
- disabled: boolean = false — interaction toggle.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.

`,
    "payment-transaction-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Build a high-performance React component with a "Physical Transaction" micro-interaction.

---

## COMPONENT INFO

Name: PaymentTransactionButton
Type: UI / Interaction

---

## GOAL

Create a button where a credit card slides upward and inserts itself into a POS terminal slot upon hover, with a currency symbol glow effect.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Custom CSS Keyframes / Cubic-Bezier

---

## FEATURES (STRICT – DO NOT SKIP)

* **Mechanical Card Slide**: High-precision translation from center to slot with a 90deg rotation.
* **Terminal Interaction**: Dynamic terminal component that slides up from bottom: -60px to 0px.
* **Currency Glow**: Interactive '$' symbol that scales (0.5 to 1) and glows after card insertion.
* **Branded Chips**: Detail-rich card geometry using pseudo-elements (::before, ::after) for chips.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Easing**: Use complex cubic-bezier easing for a heavy, mechanical feel.
2. **Synchronization**: Staggered sub-animations (card → terminal → currency) must be perfectly timed.
3. **Responsive**: Ensure the illustration scales proportionally inside the button.

---

## PROPS (with defaults):
- label: string = 'Pay Now' — idle state text.
- className: string = '' — override styling.
- accentColor: string = '#10b981' — success coloring.
- posColor: string = '#111827' — card terminal hex.
- cardColor: string = '#f3f4f6' — inserted card rendering color.
- currencySymbol: string = '$' — character preceding paid amount animation.
- onClick: () => void — execution handler.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.

`,
    "magic-card-effect": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Build a high-performance React component with "Revealing Light" mouse tracking.

---

## COMPONENT INFO

Name: MagicCardEffect
Type: UI / Interaction

---

## GOAL

Create a card where a localized spotlight follows the cursor, dynamic illuminating borders and background layers with high-end polish.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Framer Motion (useMotionValue, useMotionTemplate)
* Tailwind CSS

---

## FEATURES (STRICT – DO NOT SKIP)

* **Spotlight Tracking**: Cursor driven radial-gradient that follows mouseX and mouseY.
* **Border Unmasking**: Gradient border that only reveals itself under the spotlight.
* **Seamless Reset**: Smooth transition of spotlight back to resting position on mouse leave.
* **Optimized Rendering**: Use Motion values to avoid full React re-renders on mouse movement.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Performance**: Must achieve 60fps; minimize main-thread calculations.
2. **Contrast**: Background must be deep charcoal/black to maximize the glow effect.
3. **Smoothness**: Use high-damping springs for the cursor follow.

---

## PROPS (with defaults):
- children: React.ReactNode — wrapper payload.
- className: string = '' — positioning logic.
- gradientSize: number = 200 — radius of the radial spot.
- gradientColor: string = '#262626' — hover glow tone.
- gradientOpacity: number = 0.8 — visibility constraint.
- gradientFrom: string = '#9E7AFF' — edge outline mask origin color.
- gradientTo: string = '#FE8BBB' — edge outline mask destination color.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.

`,
    "rainbow-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Build a high-performance React component with a "Ultra-Premium Spectrum" border.

---

## COMPONENT INFO

Name: RainbowButton
Type: UI / Styling

---

## GOAL

Create a button with a high-velocity, infinitely cycling rainbow border and a diffused glowing aura.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS (Custom Animation)
* HSL Color System

---

## FEATURES (STRICT – DO NOT SKIP)

* **Spectrum Animation**: Continuous shift of background-position across a 5-color HSL gradient.
* **Diffused Aura**: Blur-lg pseudo-element that creates a soft rainbow shadow beneath the button.
* **Clipping Precision**: Use background-clip: padding-box and border-box for the neon edge effect.
* **Zero JS Runtime**: Animation must be purely CSS-driven for maximum performance.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Color Harmony**: Use vibrant HSL values; avoid muddying the spectrum.
2. **Performance**: Ensure no layout shifts during animation.
3. **Styling Variants**: Support for size (sm, default, lg) and full TypeScript typing.

---

## PROPS (with defaults):
- asChild: boolean = false — polymorphic slotting allowing custom element renders.
- size: 'default'|'sm'|'lg'|'icon' = 'default' — tailwind sizing preset scale.
- className: string = '' — outer layout properties.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.

`,
    "social-tooltip-buttons": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Build a high-performance React component with "Playful Depth" social link interactions.

---

## COMPONENT INFO

Name: SocialTooltipButtons
Type: UI / Interaction

---

## GOAL

Create a set of social icons that physically expand, reveal 3D springing tooltips, and shift to brand-specific colors on hover.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Cubic-Bezier Easing

---

## FEATURES (STRICT – DO NOT SKIP)

* **Exaggerated Bounce**: Use cubic-bezier(0.68, -0.55, 0.265, 1.55) for the "pop-out" tooltip effect.
* **3D Geometry**: Tooltips must have a triangular pointer and volumetric shadow.
* **Dynamic Brand Colors**: Color shifting from white to platform-specific HEX (Twitter, GitHub, etc.).
* **Spring Sequence**: Staggered icon pop and tooltip reveal.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Vibe**: Interaction must feel elastic and premium.
2. **Clips**: Ensure tooltips are not clipped by parent containers.
3. **Accessibility**: Include screen-reader and keyboard focus states.

---

## PROPS (with defaults):
- icons: Array<{name, icon, color}> = [] — list of network interfaces.
- className: string = '' — layout gap configurations.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.

`,
    "orbit-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Build a high-performance React component with a "Satellite System" orbital interaction.

---

## COMPONENT INFO

Name: OrbitButton
Type: UI / Interaction

---

## GOAL

Create a central neon button with multiple particles orbiting it at varying speeds and radii, accelerating upon hover.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Framer Motion
* Tailwind CSS

---

## FEATURES (STRICT – DO NOT SKIP)

* **Orbital Planes**: 5+ independent particles rotating 360 degrees using nested motion divs.
* **Energy Surge**: Halve rotation duration on hover to simulate an increased energy state.
* **Glassmorphism Base**: Primary button with backdrop-filter and intense neon box-shadows.
* **Scale Dynamics**: Active particles must scale up (1 to 1.5) and increase brightness on hover.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Performance**: Use GPU-accelerated rotations; avoid high-frequency re-renders.
2. **Atmosphere**: Glow must feel deep and volumetric.
3. **Control**: Props for label, color (blue, purple, cyan), and custom onClick handlers.

---

## PROPS (with defaults):
- label: string = 'Initialize' — central text payload.
- className: string = '' — specific z-index overrides.
- color: string = '#3b82f6' — primary tone for orbiting satellites.
- onClick: () => void — execution handler.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.

`,
    "galaxy-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Build a high-performance React component with "Deep Space" cosmic luxury.

---

## COMPONENT INFO

Name: GalaxyButton
Type: UI / Interaction

---

## GOAL

Create a multi-layered cosmic button featuring parallax rotating star fields, drifting nebulas, and an animated conic-gradient border.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Framer Motion
* Tailwind CSS (Conic Gradients)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Aura Rotation**: 360-degree rotating conic-gradient on the border rim.
* **Nebula Drift**: Slow-shifting background gradients (15s-20s duration) to simulate cosmic gases.
* **Star Layers**: 3 distinct layers of stars with randomized twinkle delays and parallax offsets.
* **Light Sweep**: Subtle diagonal shimmer refraction that triggers on hover every 1.5s.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Luminosity**: The "Galaxy Bloom" effect on hover must be intense but clean.
2. **Depth**: Parallax layers must feel physically separated.
3. **Precision**: High-fidelity conic-gradient masks for the border.

---

## PROPS (with defaults):
- label: string = 'Explore' — action button label.
- accentColor: string = '#a855f7' — spiral galaxy tint base.
- starDensity: number = 50 — amount of background glowing particles orbiting the core.
- className: string = '' — spacing layouts.
- onClick: () => void — execution handler.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.

`,
    "liquid-fill-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Build a high-performance React component with "Hydraulic Wave" fill interaction.

---

## COMPONENT INFO

Name: LiquidFillButton
Type: UI / Interaction

---

## GOAL

Create a vessel-like button that fills with glowing liquid using organic SVG wave animations when hovered.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Framer Motion (Spring Physics)
* SVG Path Math

---

## FEATURES (STRICT – DO NOT SKIP)

* **Dual-Wave Physics**: Two overlapping SVG wave paths translating at different speeds for organic depth.
* **Dynamic Fill Level**: Liquid rises from bottom: 100% to 0% with adjustable spring damping.
* **Submerged Typography**: Text color must transition (e.g., Neon to White) as it is "submerged" by the fill layer.
* **Color Interpolation**: Smooth fill color transitions using props.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Wave Continuity**: Horizontal wave translation must be seamless and infinite.
2. **Interaction**: Fill response must be snappy but dampened (stiffness/damping logic).
3. **Clipping**: Content must be perfectly clipped within the button's border radius.

---

## PROPS (with defaults):
- label: string = 'Submit' — primary text.
- fillColor: string = '#0ea5e9' — SVG wave path fill.
- liquidSpeed: number = 1 — translation multiplier.
- className: string = '' — dimensional box control.
- onClick: () => void — execution handler.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.

`,
    "grid-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Precision Grid" background.

---

## COMPONENT INFO

Name: GridBackground
Type: UI / Animation / Background

---

## GOAL

Create a mathematical, perfectly aligned grid background with a dynamic radial mask for depth and focus.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS

---

## FEATURES (STRICT – DO NOT SKIP)

* **Dual-Axis Gradients**: Use linear-gradient to create sharp 1px grid lines (horizontal and vertical).
* **Radial Masking**: Implement a mask-image using radial-gradient (centered by default) to fade the grid towards the edges.
* **Customizable Density**: Prop-driven gridSize to control the frequency of grid lines.
* **Stylized Label**: A subtle, semi-transparent uppercase label (e.g., "GRID ALIVE") in a tracking-widest display font.

---

## PROPS (with defaults):
- gridSize: number = 24 — width/height dimension of each grid cell.
- gridColor: string = '#80808012' — the color of the grid lines.
- className: string = '' — optional styling wrapper.
- label: string = '' — centered text.
- maskRadius: string | number = '50% 50% at 50% 50%' — CSS radial gradient mask setting.
- opacity: number = 1 — container opacity.

---

## IMPLEMENTATION REQUIREMENTS

1. **Efficiency**: Use CSS background-size and background-image for the grid instead of mapping SVG elements.
2. **Mask Flexibility**: Support both numeric percentage and string-based mask positions (e.g., "50% 50%").
3. **Container**: Full-height/width absolute positioning (inset-0) to serve as a proper background layer.

---

## PERFORMANCE RULES

* Zero JS-based animation; rely entirely on CSS and layout for optimal battery life.
* Use pointer-events-none on the background layer.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "hacker-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Matrix Rain" hacker aesthetic.

---

## COMPONENT INFO

Name: HackerBackground
Type: Animation / WebGL / Background

---

## GOAL

Create a high-performance Canvas-based Matrix rain effect with cascading digital characters.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Canvas 2D API

---

## FEATURES (STRICT – DO NOT SKIP)

* **Digital Cascade**: Vertical streams of characters (Katakana/Alphanumeric mix) falling at varying speeds.
* **Fading Trail**: Use a semi-transparent black overlay (ctx.fillStyle = 'rgba(0, 0, 0, 0.05)') on each frame to create the "tail" effect.
* **Responsive Grid**: Recalculate column count dynamically on window resize.
* **Chromatic Control**: Customizable font color (default emerald) and font size.

---

## PROPS (with defaults):
- color: string = '#0F0' — Matrix code rain color.
- fontSize: number = 15 — size of falling matrix characters.
- className: string = '' — container styling.
- speed: number = 1 — multiplier governing descent rate.

---

## IMPLEMENTATION REQUIREMENTS

1. **Canvas Lifecycle**: Use useEffect for initialization and cleanup; manage the animation loop via requestAnimationFrame.
2. **Optimization**: Minimize DOM lookups; handle window resize events with appropriate cleanup.
3. **Randomization**: Randomize character selection and individual column reset triggers.

---

## PERFORMANCE RULES

* Maintain 60fps on desktop; ensure efficient canvas clearing.
* No memory leaks (cancel RAF on unmount).



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "novatrix-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Nebula Flow" atmospheric glow.

---

## COMPONENT INFO

Name: NovatrixBackground
Type: UI / Animation / Background

---

## GOAL

Create an atmospheric, breathing background with slow-rotating nebulous glows and pulsating gradients.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* CSS Animations

---

## FEATURES (STRICT – DO NOT SKIP)

* **Breathing Gradient**: A primary background gradient that pulsates in opacity over a long period.
* **Slow Rotation**: A secondary radial-gradient layer rotating at an ultra-slow speed (e.g., 20s-30s) to simulate celestial movement.
* **Ethereal Label**: A central, high-contrast display title with animate-in effects.
* **Dynamic Palette**: Support for two-color linear gradient interpolation via props.

---

## PROPS (with defaults):
- colorFrom: string = '#1e1b4b' — start color of ambient clouds.
- colorTo: string = '#581c87' — end color for ambient mixing.
- opacity: number = 1 — effect transparency.
- className: string = '' — styling override.
- title: string = '' — animated text displayed over the fluid motion.

---

## IMPLEMENTATION REQUIREMENTS

1. **Transitions**: Use transition-colors duration-1000 for smooth color shifts.
2. **Animation**: Implement the slow rotation via a custom @keyframes spin-slow in a scoped <style jsx> block.
3. **Layout**: Center align the typography using Flexbox while keeping background layers absolute.

---

## PERFORMANCE RULES

* Use CSS-only animations for background layers to ensure no main-thread blockage.
* Ensure z-index layering prevents background bleed into content.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "beam-grid-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Kinetic Grid Beams".

---

## COMPONENT INFO

Name: BeamGridBackground
Type: Animation / UI / Background

---

## GOAL

Create a sophisticated interactive grid background where light beams travel along grid lines and cells react to mouse movement with volumetric glows.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Canvas 2D API
* dpr (Device Pixel Ratio) Scaling

---

## FEATURES (STRICT – DO NOT SKIP)

* **Static Grid Caching**: Pre-render the static grid to an off-screen buffer (bgCanvas) to avoid redundant drawing.
* **Kinetic Beams**: 10+ randomized "lightning" beams traveling at different speeds and offsets along X/Y axes.
* **Interactive Pulse**: Hovering over grid cells must trigger a 3-layered volumetric highlight (primary, secondary, tertiary glow radii).
* **High-DPI Support**: Scale the canvas context by window.devicePixelRatio for hyper-sharp rendering.
* **Idle State**: Beams should automatically speed up slightly when no mouse movement is detected for 2+ seconds.

---

## PROPS (with defaults):
- gridSize: number = 40 — width/height dimension.
- gridColor: string = 'rgba(255, 255, 255, 0.05)' — default grid line color.
- darkGridColor: string = 'rgba(255, 255, 255, 0.05)' — grid line color in dark mode.
- beamColor: string = 'rgba(0, 255, 255, 1)' — actual stroke color for active beams.
- darkBeamColor: string = 'rgba(0, 255, 255, 1)' — active beam stroke color in dark mode.
- beamSpeed: number = 5 — translation velocity.
- beamThickness: number = 1 — line thickness constraint.
- beamGlow: boolean = true — enables bloom shader filters.
- glowIntensity: number = 10 — blur/bloom value logic.
- beamCount: number = 15 — total amount of roaming neon beams.
- idleSpeed: number = 2 — ambient background movement rate.
- interactive: boolean = true — responds to mouse tracking.
- fadeIntensity: number = 0.5 — strength of the gradient focal mask.

---

## IMPLEMENTATION REQUIREMENTS

1. **Buffer Logic**: Implement bgCanvasRef for static grid pre-rendering.
2. **Shadow Optimization**: Use ctx.shadowBlur and ctx.shadowColor selectively during beam/cell renders.
3. **Resize Resilience**: Re-initialize particles and re-render the static buffer upon window resize.
4. **Dark Mode Sync**: Support isDarkMode state via prop/auto-detection for grid line and beam colors.

---

## PERFORMANCE RULES

* 60fps locked; use requestAnimationFrame for all motion.
* Cleanup all event listeners (mousemove, resize) on unmount.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "fall-beam-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Cascading Light Beams".

---

## COMPONENT INFO

Name: FallBeamBackground
Type: UI / Animation / Background

---

## GOAL

Create a vertical rain of glowing light beams that fall at varying speeds and intensities, creating a high-tech atmosphere.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* CSS Animations & Variables

---

## FEATURES (STRICT – DO NOT SKIP)

* **Dynamic Beam Generation**: Render 20+ vertical lines with randomized horizontal placement (using percentage-based jitter).
* **Kinetic Glow**: Each beam must have a trailing glow effect created via a linear-gradient (transparent to color to white) and box-shadow.
* **Asynchronous Fall**: Implement randomized animation durations (8s-18s) and negative delays to ensure a non-repeating, natural flow.
* **Text Overlay System**: Optional displayText prop that renders centered h1 typography with a bottom-fade gradient mask.
* **Color Mapping**: Support for named color classes (e.g., green-400, cyan-400) or HEX/RGBA overrides.

---

## PROPS (with defaults):
- lineCount: number = 20 — density of falling lines.
- beamColorClass: string = 'from-cyan-400' — tailwind utility configuration.
- beamColor: string = 'rgba(34, 211, 238, 1)' — explicitly mapped canvas color.
- opacity: number = 1 — overall opacity.
- displayText: string = '' — optional centered text to overlay.
- className: string = '' — CSS wrapper properties.

---

## IMPLEMENTATION REQUIREMENTS

1. **DOM Management**: Use useEffect to dynamically inject beam elements into a container ref.
2. **Animation Architecture**: Define the @keyframes fall logic within a global <style> tag or scoped block.
3. **CSS Variables**: Use --ani-duration, --ani-delay, and --beam-glow-color to control individual line behavior.
4. **Cleanup**: Ensure all dynamically created DOM elements are removed on component unmount.

---

## PERFORMANCE RULES

* Use will-change: top to optimize the falling animation.
* Ensure the container has overflow-hidden to prevent layout shifts.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "hell-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Fluid Hellscape" shader.

---

## COMPONENT INFO

Name: HellBackground
Type: WebGL / Animation / Background

---

## GOAL

Create a high-intensity, visually complex fluid simulation using custom GLSL shaders that resemble a swirling vortex of heat and energy.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* WebGL (GLSL Shaders)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Custom Fragment Shader**: Implement a multi-color swirling effect using procedural noise and trigonometric distortion (SIN/COS loops).
* **Backdrop Blur Integration**: A customizable overlay layer using Tailwind's backdrop-blur classes (none to 3xl) to soften the shader output.
* **Volumetric Color**: Support for a primary hex color that is translated into RGB uniforms for the shader.
* **Responsive Viewport**: Automatically update iResolution and gl.viewport on resize for crisp rendering.

---

## PROPS (with defaults):
- backdropBlurAmount: 'none'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl' = 'none' — Tailwind blur class mapping.
- color: string = '#ff3300' — primary red/orange core temperature tint.
- speed: number = 1 — multiplier applied to the shader time uniform.
- intensity: number = 1 — shader displacement magnitude ratio.
- className: string = '' — layout definitions.

---

## IMPLEMENTATION REQUIREMENTS

1. **Shader Lifecycle**: Handle WebGL context initialization, shader compilation, and program linking within a useEffect hook.
2. **Uniform Management**: Pass iResolution, iTime, and uColor efficiently to the fragment shader.
3. **Buffer Setup**: Use a simple rectangular buffer (triangles covering -1 to 1) for full-screen rendering.
4. **Resilience**: Log errors for WebGL unsupported environments but fail gracefully.

---

## PERFORMANCE RULES

* Maintain 60fps; use high-precision floats only where necessary to save GPU cycles.
* Cancel the requestAnimationFrame loop on unmount.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "interactive-grid-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Interactive Cell Glow".

---

## COMPONENT INFO

Name: InteractiveGridBackground
Type: Animation / Interaction / Background

---

## GOAL

Create a grid background where cells light up and leave a glowing trail as the mouse moves across them, with an automated "ghost" movement during inactivity.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Canvas 2D API

---

## FEATURES (STRICT – DO NOT SKIP)

* **Trailing Glow**: Implement a trailRef that stores the history of "snapped" grid cells, rendering them with decaying opacity.
* **Idle Randomization**: When no mouse movement is detected for 2s, spawn 5+ automated "ghost" targets that traverse the grid randomly.
* **Volumetric Shadow**: Use ctx.shadowBlur and ctx.shadowColor to create a deep neon glow for active and trailing cells.
* **Snap-to-Grid Logic**: Calculate cell coordinates via Math.floor(mousePos / gridSize) for precise interaction.
* **Radial Fade Overlay**: Apply a CSS-based radial-gradient mask over the canvas to focus the interaction towards the center.

---

## PROPS (with defaults):
- gridSize: number = 40 — base dimensions.
- gridColor: string = 'rgba(255, 255, 255, 0.05)' — base lines.
- darkGridColor: string = 'rgba(255, 255, 255, 0.05)' — dark background lines.
- effectColor: string = 'rgba(0, 255, 255, 0.5)' — trail/neon color.
- darkEffectColor: string = 'rgba(0, 255, 255, 0.5)' — dark effect color.
- trailLength: number = 5 — count of highlighted squares tracing the mouse.
- idleSpeed: number = 0.2 — automatic roaming when disconnected from mouse.
- glow: boolean = true — enables box-shadow blooming on active squares.
- glowRadius: number = 35 — spread of the bloom lighting.
- showFade: boolean = true — restricts visibility via radial-gradient mask.
- fadeIntensity: number = 1 — depth ratio for CSS gradient edge fading.
- idleRandomCount: number = 5 — total automated 'ghost' pointers present when idle.

---

## IMPLEMENTATION REQUIREMENTS

1. **Precision Rendering**: Implement canvas.width and canvas.height updates inside the draw loop to match parent container dimensions.
2. **Color Parsing**: Support RGBA, RGB, and HEX formats for the glowColor, with internal logic to apply alpha-decay to the trails.
3. **Physics**: Implement a simple lerp for idle ghost movement to ensure smooth transitions between cells.

---

## PERFORMANCE RULES

* Optimize clearRect and path drawing to avoid CPU spikes on high-density grids.
* Debounce or throttle heavy resize calculations if possible.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "wave-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Sine-Wave Distortion" shaders.

---

## COMPONENT INFO

Name: WaveBackground
Type: WebGL / Animation / Background

---

## GOAL

Create a hypnotic background of morphing, flowing waves using custom GLSL fragment shaders, optimized for battery life and smooth performance.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* WebGL (GLSL Shaders)
* framer-motion (useInView)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Multi-Octave Sine Waves**: Implement a shader loop (8+ iterations) that horizontally distorts UV coordinates using time-based sine functions.
* **Visibility Optimization**: Use framer-motion's useInView and a visibility ref to pause the fragment shader's requestAnimationFrame when the component is off-screen.
* **Backdrop Blur Overlay**: Include a customizable blur layer (classes none to 3xl) to diffuse the shader's raw output for a more subtle background feel.
* **Color Interpolation**: Procedurally generate RGB colors based on the uv.y coordinate within the shader for organic vertical gradients.

---

## PROPS (with defaults):
- backdropBlurAmount: 'none'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl' = 'none' — underlying canvas blur.
- speed: number = 1 — glsl time flow manipulation.
- intensity: number = 1 — amplitude scaling.
- className: string = '' — z-index overrides.

---

## IMPLEMENTATION REQUIREMENTS

1. **Precision Shaders**: Pass iResolution, iTime, uSpeed, and uIntensity as uniforms to the fragment shader.
2. **Context Stability**: Ensure the WebGL program is properly attached and linked within a single useEffect that reacts to speed/intensity changes.
3. **Responsive Canvas**: Use clientWidth/clientHeight of the parent container to scale the drawing buffer precisely.
4. **Resilience**: Implement cleanup for shaders, programs, and buffers to prevent memory leaks in a Next.js environment.

---

## PERFORMANCE RULES

* 60fps consistent rendering; avoid heavy CPU logic inside the RAF loop.
* Memory management: gl.deleteProgram and gl.deleteShader on unmount.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "lines-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Kinetic Vector Paths".

---

## COMPONENT INFO

Name: BackgroundPaths
Type: UI / Animation / Background

---

## GOAL

Create a sophisticated background of multiple floating, animated SVG paths that shift and change length, paired with a central title featuring spring-based letter animations.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* framer-motion

---

## FEATURES (STRICT – DO NOT SKIP)

* **Multi-Path Field**: Render 36+ independent SVG paths with randomized Bezier curves (M...C...) that scale and offset based on index.
* **Infinite Path Motion**: Use framer-motion to animate pathLength, opacity, and pathOffset with repeat: Infinity and linear easing.
* **Spring Letter Pull-Up**: A central h1 title where each letter animates from y: 100 with staggered delays and professional spring physics (stiffness: 150, damping: 25).
* **Gradient Typography**: Apply a bg-clip-text gradient to the title for a premium look.

---

## PROPS (with defaults):
- title: string = '' — prominent text string.
- pathColor: string = '#ffffff' — unified stroke interpolation tint.
- opacity: number = 1 — overall frame opacity setting.
- className: string = '' — layout properties.

---

## IMPLEMENTATION REQUIREMENTS

1. **SVG Precision**: Define a fixed viewBox="0 0 696 316" for the paths to ensure consistent geometry across resolutions.
2. **Iterative Styling**: Calculate path width and stroke opacity dynamically: 0.1 + i * 0.03.
3. **Dual Orientation**: Render the path field twice (positions 1 and -1) to create asymmetric depth.

---

## PERFORMANCE RULES

* Use linear easing for long-duration background paths (20s-30s) to minimize CPU load.
* Optimize SVG rendering by using strokeOpacity instead of global component opacity where possible.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "sparkles-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Celestial Sparkles".

---

## COMPONENT INFO

Name: SparklesBackground
Type: UI / Animation / Background

---

## GOAL

Create a dense, sparkling star field with concentrated center focus and an interactive title featuring high-intensity glow effects.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* framer-motion
* SparklesCore (Internal Component Mapping)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Sparkle Core Integration**: Use a high-density particle engine (SparklesCore) with customizable density (default 100) and particle size ranges.
* **Radial Vignette Mask**: Implement a CSS-based [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black_100%)] overlay to fade the background into the edges.
* **Hyper-Glow Title**: Centered h1 with a drop-shadow that intensifies the white-to-transparent text gradient.
* **Letter Entrance**: Staggered letter pull-up animation (spring-based) similar to premium "Hero" layouts.

---

## PROPS (with defaults):
- title: string = '' — text overlay configuration.
- particleColor: string = '#ffffff' — base string matching variable theme.
- density: number = 100 — limit to total visual entities generated.
- minSize: number = 0.5 — scale variation floor.
- maxSize: number = 2 — scale variation ceiling.
- className: string = '' — layout boundaries.

---

## IMPLEMENTATION REQUIREMENTS

1. **Layout**: Absolute positioning for the particle layer (inset-0) and relative centered container for the typography.
2. **Typography Logic**: Split the title into words and then letters to allow for precise staggers: wordIndex * 0.1 + letterIndex * 0.03.
3. **Contrast Management**: Ensure the background is a solid bg-neutral-950 to make the white sparkles pop.

---

## PERFORMANCE RULES

* Delegate particle rendering to the specialized SparklesCore to ensure frame-rate stability.
* Use pointer-events-none on all decorative layers.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "isometric-grid-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Isometric Interactive Boxes".

---

## COMPONENT INFO

Name: IsometricGridBackground
Type: UI / Animation / Background

---

## GOAL

Create a 3D isometric grid of interactive boxes that change color on hover, masked by a large radial gradient for a sophisticated UI depth effect.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Boxes Component (Internal)

---

## FEATURES (STRICT – DO NOT SKIP)

* **3D Box Grid**: A dense field of boxes that react to the cursor, creating ripples of color (internal Boxes logic).
* **Inverse Radial Mask**: Apply an absolute inset-0 div with [mask-image:radial-gradient(transparent,white)] to create an inverted spotlight effect where the center is reveal and edges are faded.
* **Display Typography**: A minimal, tracking-widest uppercase title at the center of the viewport.
* **Configuration Object**: Support for a boxProps object to pass row/column counts and custom color palettes downstream.

---

## PROPS (with defaults):
- title: string = '' — optional display string.
- boxProps: any = { rowsCount: 15, colsCount: 15 } — nested props for passing rows boundaries and colors.
- className: string = '' — bounding rect configuration.

---

## IMPLEMENTATION REQUIREMENTS

1. **Stacking Context**: Background (Boxes) -> Mask Layer -> Title.
2. **Container**: Use bg-slate-900 as the base color for the entire component.
3. **Flex Layout**: Ensure the title is perfectly centered vertically and horizontally using flex flex-col items-center justify-center.

---

## PERFORMANCE RULES

* Ensure the mask layer has pointer-events-none so it doesn't block interaction with the underlying boxes.
* Keep the title as a relative z-20 element.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "space-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Deep Space Exploration" parallax.

---

## COMPONENT INFO

Name: SpaceBackground
Type: Animation / UI / Background

---

## GOAL

Create a vast, multi-layered cosmic background featuring twinkling star clusters, drifting nebulas, shooting stars, and rare "unstable" stars that shatter into geometric fragments.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Canvas 2D API

---

## FEATURES (STRICT – DO NOT SKIP)

* **Parallax Depth**: Implement 3 star layers (foreground, mid, background) that shift at different speeds based on mouse position.
* **Nebula Drifting**: Render 6+ soft-colored nebulas (radial-gradient with globalCompositeOperation = 'screen') that drift slowly via Math.cos/Math.sin.
* **Twinkle Cycle**: Stars oscillate between randomized targetOpacity levels with independent twinkleSpeed.
* **Shatter Physics**: Implement "Unstable Stars" that, when triggered, explode into 5-10 sharp polygon fragments with velocity and rotation.
* **Shooting Stars**: Occasional high-speed streaks that fade out using opacity * 0.98 decay.

---

## PROPS (with defaults):
- starCount: number = 600 — dense rendering cluster volume.
- nebulaCount: number = 6 — count of layered blending radial shapes.
- interactive: boolean = true — enable mouse parallax.
- className: string = '' — root overrides.

---

## IMPLEMENTATION REQUIREMENTS

1. **Canvas Lifecycle**: Manage the simulation via requestAnimationFrame with high-DPI scaling support.
2. **Clustering Logic**: Initialize 60% of stars in clusters (defined by x, y, radius) to create more natural galactic structures.
3. **Fragment Drawing**: Create a specialized drawFragment function that handles translation, rotation, and alpha-decay for shattered star pieces.
4. **Resilience**: Ensure resize events re-initialize the star field to prevent empty areas.

---

## PERFORMANCE RULES

* Maintain 60fps; limit the number of active fragments (e.g., max 50) and clean up inactive ones.
* Disable mouse interaction if interactive prop is false.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "black-hole-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Spiral Singularity" physics.

---

## COMPONENT INFO

Name: BlackHoleBackground
Type: Animation / Physics / Background

---

## GOAL

Create a visually stunning black hole simulation where thousands of particles spiral into a central singularity, accelerating as they approach the event horizon.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Canvas 2D API

---

## FEATURES (STRICT – DO NOT SKIP)

* **Event Horizon Glow**: Render a central black core surrounded by deep indigo/cyan radial gradients using globalCompositeOperation = 'screen'.
* **Acceleration Logic**: Implement spiral physics where particle speed and gravity (radial pull) increase as their distance to the center decreases.
* **Particle Re-spawning**: When distance < 20px, reset the particle to the outer boundary with a fade-in delay.
* **Mouse Influence**: The singularity center should subtly follow the cursor with a spring-like delay (0.05 lerp).
* **Volumetric Depth**: Use ctx.shadowBlur on particles to create a luminous accretion disk effect.

---

## PROPS (with defaults):
- particleCount: number = 600 — orbiting simulated points.
- coreColor: string = '#000000' — singular center black background.
- accentColor: string = '#60daff' — event horizon hue blending using composite mode.
- className: string = '' — dimensions limit.

---

## IMPLEMENTATION REQUIREMENTS

1. **Polar Coordinates**: Manage particles using angle and distance instead of X/Y for easier spiral math.
2. **Context Cleanup**: Clear the canvas every frame but maintain the core's luminous intensity.
3. **High Fidelity**: Ensure particleCount (default 600) doesn't drop frame rates; optimize the draw loop by minimizing property access.

---

## PERFORMANCE RULES

* 60fps consistent.
* Handle resize events by re-centering the singularity and recalibrating max distance.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "mouse-gravity-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Magnetic Particle Attraction".

---

## COMPONENT INFO

Name: MouseGravityBackground
Type: Animation / UI / Background

---

## GOAL

Create a lively field of particles that are magnetically attracted to the user's cursor, featuring trail spawning and fluid damping physics.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Canvas 2D API

---

## FEATURES (STRICT – DO NOT SKIP)

* **Attraction Physics**: Particles within attractionRadius (default 300px) must accelerate towards the cursor using a distance-weighted force.
* **Fluid Damping**: Apply a 0.95 friction coefficient to velocities to create a smooth, viscous movement feel.
* **Interactive Trail**: Spawn new "ephemeral" particles at the cursor position during movement (2 particles per frame) with a finite life/fade counter.
* **Wrapping Field**: Persistent particles that exit the canvas should wrap around to the opposite side to maintain density.
* **Bloom Effect**: Use ctx.shadowBlur = 10 on all particles to create a neon-light aesthetic.

---

## PROPS (with defaults):
- particleCount: number = 200 — stable generated point counts.
- attractionRadius: number = 300 — force vector range checking bound.
- attractionForce: number = 0.05 — proportional acceleration scalar.
- particleColor: string = '#888888' — passive drifting point color.
- accentColor: string = '#00ffff' — color transitioned when near the cursor gravity influence.
- enableTrail: boolean = true — spawn duplicate ephemeral trails.
- className: string = '' — element context overrides.

---

## IMPLEMENTATION REQUIREMENTS

1. **Velocity Logic**: Update p.x += p.vx and p.y += p.vy every frame, adding a tiny amount of random "floating" motion.
2. **Ephemeral Particles**: Use a filtering method (particles.current.filter(...)) to periodically clean up particles that have reached 0 life.
3. **Resilience**: Handle mouse leave events by setting mouse.active = false to stop the attraction force.

---

## PERFORMANCE RULES

* Ensure the total particle count (persistent + ephemeral) doesn't exceed 400-500.
* Use ctx.save() and ctx.restore() for global alpha management.



---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "black-hole-cursor": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: BlackHoleCursor
Type: UI / Animation / WebGL / Interaction

---

## GOAL

Create a component that:

* Matches real-world production quality
* Preserves full behavior and animation logic
* Works directly in Next.js environment
* Simulates a gravitational singularity at the cursor position, distorting surrounding elements via a localized lensing shader or lens filter effect.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* WebGL / Canvas API
* CSS backdrop-filter

---

## FEATURES (STRICT – DO NOT SKIP)

* Gravitational Lensing: Procedural shader or complex refraction matrix applied beneath the mouse.
* Continuous Tracking: Event listener mapping mouse X/Y to the singularity center.
* Falloff Radius: Distortions weaken smoothly from the cursor center out to the gravityRadius limit.

---

## PROPS (with defaults):
- gravityRadius: number = 150 — pixel radius representing the distortion's event horizon.
- className: string = '' — allows overriding container styling or position classes.
- containerRef: React.RefObject<HTMLElement> — bounds calculation.
- children: React.ReactNode — content elements rendered 'under' the effect layer.

---



## IMPLEMENTATION REQUIREMENTS

* Setup all required logic (scene, canvas, hooks, etc.)
* Use proper React hooks (useEffect, useRef)
* Maintain clean architecture
* Write modular and readable code

---

## PERFORMANCE RULES (CRITICAL)

* Maintain smooth 60fps
* Use requestAnimationFrame for animations
* Optimize heavy calculations
* Properly clean up resources on unmount
* Handle window resize and devicePixelRatio
* Avoid unnecessary re-renders

---
## DO NOT

* Do NOT simplify animation or shader logic
* Do NOT skip implementation steps
* Do NOT return partial code
* Do NOT change component name
* Do NOT remove performance optimizations

---

## OUTPUT FORMAT (STRICT)

Return ONLY this file:

components/BlackHoleCursor.tsx

* Fully typed TypeScript
* Complete working code
* No explanation
* No markdown

---

## FINAL INSTRUCTION

Generate the COMPLETE component now with full functionality and production-level quality.`,
    "magnetic-cursor": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: MagneticCursor
Type: UI / Animation / WebGL / Interaction

---

## GOAL

Create a component that:

* Matches real-world production quality
* Preserves full behavior and animation logic
* Works directly in Next.js environment
* Provides a sleek interactive pointer component that is physically 'pulled' and attached to nearby interactive elements upon proximity.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Framer Motion (useSpring, useMotionValue)
* Tailwind CSS

---

## FEATURES (STRICT – DO NOT SKIP)

* Proximity Detection: Logic to detect distance from nearby 'magnetic' DOM targets.
* Inverse-Square Pull: The cursor is pulled away from the mouse toward the target with increasing force.
* Morphing Dot: The primary cursor point scales and changes opacity upon 'snapping' to the target.

---

## PROPS (with defaults):
- magnetRadius: number = 50 — distance threshold in pixels to trigger attraction.
- cursorSize: number = 24 — default dimensions of the resting cursor shape.
- className: string = '' — styling overrides for the trailing circle.
- containerRef: React.RefObject<HTMLElement> = undefined — bounds.

---



## IMPLEMENTATION REQUIREMENTS

* Setup all required logic (scene, canvas, hooks, etc.)
* Use proper React hooks (useEffect, useRef)
* Maintain clean architecture
* Write modular and readable code

---

## PERFORMANCE RULES (CRITICAL)

* Maintain smooth 60fps
* Use requestAnimationFrame for animations
* Optimize heavy calculations
* Properly clean up resources on unmount
* Handle window resize and devicePixelRatio
* Avoid unnecessary re-renders

---
## DO NOT

* Do NOT simplify animation or shader logic
* Do NOT skip implementation steps
* Do NOT return partial code
* Do NOT change component name
* Do NOT remove performance optimizations

---

## OUTPUT FORMAT (STRICT)

Return ONLY this file:

components/MagneticCursor.tsx

* Fully typed TypeScript
* Complete working code
* No explanation
* No markdown

---

## FINAL INSTRUCTION

Generate the COMPLETE component now with full functionality and production-level quality.`,
    "aurora-cursor": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: AuroraCursor
Type: UI / Animation / WebGL / Interaction

---

## GOAL

Create a component that:

* Matches real-world production quality
* Preserves full behavior and animation logic
* Works directly in Next.js environment
* Leaves a fluid, ethereal, shifting gradient mesh trail behind the cursor exactly like the Aurora Borealis in the night sky.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Canvas 2D API / WebGL Shaders
* Tailwind CSS

---

## FEATURES (STRICT – DO NOT SKIP)

* Fluid Path Generation: The trail's vertex control points interpolate cursor movement for smooth wavy ribbons.
* Shifting Colors: Real-time transition of HSL mesh colors creating the aurora glow.
* Damping System: Trail lags beautifully with high physical damping rather than jumping instantly.

---

## PROPS (with defaults):
- size: number = 80 — default width/spread of the trailing aurora emission.
- stiffness: number = 100 — spring tension determining reaction latency.
- damping: number = 30 — resistance smoothing the tail movement.
- className: string = '' — wrapper classes.

---



## IMPLEMENTATION REQUIREMENTS

* Setup all required logic (scene, canvas, hooks, etc.)
* Use proper React hooks (useEffect, useRef)
* Maintain clean architecture
* Write modular and readable code

---

## PERFORMANCE RULES (CRITICAL)

* Maintain smooth 60fps
* Use requestAnimationFrame for animations
* Optimize heavy calculations
* Properly clean up resources on unmount
* Handle window resize and devicePixelRatio
* Avoid unnecessary re-renders

---
## DO NOT

* Do NOT simplify animation or shader logic
* Do NOT skip implementation steps
* Do NOT return partial code
* Do NOT change component name
* Do NOT remove performance optimizations

---

## OUTPUT FORMAT (STRICT)

Return ONLY this file:

components/AuroraCursor.tsx

* Fully typed TypeScript
* Complete working code
* No explanation
* No markdown

---

## FINAL INSTRUCTION

Generate the COMPLETE component now with full functionality and production-level quality.`,
    "heart-cursor": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: HeartCursor
Type: UI / Animation / WebGL / Interaction

---

## GOAL

Create a component that:

* Matches real-world production quality
* Preserves full behavior and animation logic
* Works directly in Next.js environment
* Generates an energetic cursor containing a primary 💜 that spawns smaller, fading heart particles based on cursor velocity.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Framer Motion / SVG paths
* Tailwind CSS

---

## FEATURES (STRICT – DO NOT SKIP)

* Particle Emitter: Detects mouse velocity and triggers small SVG hearts flying against the movement vector.
* Breathing Core: The primary heart perpetually pulses in size.
* State Reaction: Expands size slightly depending on mousedown or interaction events.

---

## PROPS (with defaults):
- size: number = 32 — dimensions of the central 💜.
- glowIntensity: number = 15 — blur spread of the neon box-shadow.
- trailSpeed: number = 0.5 — fade multiplier for generated background particles.
- hoverScale: number = 1.2 — multiplier when clicking or hovering a target.
- containerRef: React.RefObject<HTMLElement> — constraint space.
- className: string = '' — CSS.

---



## IMPLEMENTATION REQUIREMENTS

* Setup all required logic (scene, canvas, hooks, etc.)
* Use proper React hooks (useEffect, useRef)
* Maintain clean architecture
* Write modular and readable code

---

## PERFORMANCE RULES (CRITICAL)

* Maintain smooth 60fps
* Use requestAnimationFrame for animations
* Optimize heavy calculations
* Properly clean up resources on unmount
* Handle window resize and devicePixelRatio
* Avoid unnecessary re-renders

---
## DO NOT

* Do NOT simplify animation or shader logic
* Do NOT skip implementation steps
* Do NOT return partial code
* Do NOT change component name
* Do NOT remove performance optimizations

---

## OUTPUT FORMAT (STRICT)

Return ONLY this file:

components/HeartCursor.tsx

* Fully typed TypeScript
* Complete working code
* No explanation
* No markdown

---

## FINAL INSTRUCTION

Generate the COMPLETE component now with full functionality and production-level quality.`,
    "lizard-cursor": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: LizardCursor
Type: UI / Animation / WebGL / Interaction

---

## GOAL

Create a component that:

* Matches real-world production quality
* Preserves full behavior and animation logic
* Works directly in Next.js environment
* Renders an organic, mechanical multi-segmented lizard that slithers fluidly using forward-kinematics to follow the user cursor path.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Canvas 2D API (Kinematic Joints)
* Tailwind CSS

---

## FEATURES (STRICT – DO NOT SKIP)

* Segmented Kinematics: Calculates multi-joint angle chains to keep the body snaking naturally behind the head.
* Dynamic Direction: Head properly aligns rotation mapping exactly with the mouse trajectory vector.
* Performance Loop: Highly optimized rendering matrix calculations on canvas.

---

## PROPS (with defaults):
- color: string = '#00FF9D' — primary fill color of the lizard's body/nodes.
- size: number = 40 — scale multiplier for the segments.
- containerRef: React.RefObject<HTMLElement> — bounds clamping.
- backgroundColor: string = 'transparent'.
- interactive: boolean = true — react to clicks.
- className: string = '' — generic tailwind overrides.

---



## IMPLEMENTATION REQUIREMENTS

* Setup all required logic (scene, canvas, hooks, etc.)
* Use proper React hooks (useEffect, useRef)
* Maintain clean architecture
* Write modular and readable code

---

## PERFORMANCE RULES (CRITICAL)

* Maintain smooth 60fps
* Use requestAnimationFrame for animations
* Optimize heavy calculations
* Properly clean up resources on unmount
* Handle window resize and devicePixelRatio
* Avoid unnecessary re-renders

---
## DO NOT

* Do NOT simplify animation or shader logic
* Do NOT skip implementation steps
* Do NOT return partial code
* Do NOT change component name
* Do NOT remove performance optimizations

---

## OUTPUT FORMAT (STRICT)

Return ONLY this file:

components/LizardCursor.tsx

* Fully typed TypeScript
* Complete working code
* No explanation
* No markdown

---

## FINAL INSTRUCTION

Generate the COMPLETE component now with full functionality and production-level quality.`,
    "venom-cursor": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: VenomCursor
Type: UI / Animation / WebGL / Interaction

---

## GOAL

Create a component that:

* Matches real-world production quality
* Preserves full behavior and animation logic
* Works directly in Next.js environment
* Implements an aggressive symbiote/tentacle effect stretching and snapping chaotic webbing to geometry near the cursor.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Canvas 2D API (Physics & Lines)
* Tailwind CSS

---

## FEATURES (STRICT – DO NOT SKIP)

* Multi-Tendril Solver: Spawns independent 'snap' points projecting toward edges.
* Elastic Tension: Lines bend, tighten correctly and violently snap backwards when the cursor gets too far.
* Immediate Clearing: Flushes old vertices perfectly for raw erratic behavior without screen smudging.

---

## PROPS (with defaults):
- color: string = '#2A2A2A' — the hex color to match the symbiote web strands.
- interactive: boolean = true — allows the venom to latch onto surrounding divs.
- containerRef: React.RefObject<HTMLElement> — area.
- className: string = '' — container layout overrides.

---



## IMPLEMENTATION REQUIREMENTS

* Setup all required logic (scene, canvas, hooks, etc.)
* Use proper React hooks (useEffect, useRef)
* Maintain clean architecture
* Write modular and readable code

---

## PERFORMANCE RULES (CRITICAL)

* Maintain smooth 60fps
* Use requestAnimationFrame for animations
* Optimize heavy calculations
* Properly clean up resources on unmount
* Handle window resize and devicePixelRatio
* Avoid unnecessary re-renders

---
## DO NOT

* Do NOT simplify animation or shader logic
* Do NOT skip implementation steps
* Do NOT return partial code
* Do NOT change component name
* Do NOT remove performance optimizations

---

## OUTPUT FORMAT (STRICT)

Return ONLY this file:

components/VenomCursor.tsx

* Fully typed TypeScript
* Complete working code
* No explanation
* No markdown

---

## FINAL INSTRUCTION

Generate the COMPLETE component now with full functionality and production-level quality.`,
    "three-d-tubes-cursor": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: ThreeDTubesCursor
Type: UI / Animation / WebGL / Interaction

---

## GOAL

Create a component that:

* Matches real-world production quality
* Preserves full behavior and animation logic
* Works directly in Next.js environment
* Tracks the mouse in 3D producing an intricate, intertwining volumetric metallic/glass tube extrusion that eventually ages away.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Three.js (@react-three/fiber if used, or vanilla WebGL)
* Tailwind CSS

---

## FEATURES (STRICT – DO NOT SKIP)

* Geometry Extrusion: TubeGeometry continuously paths the X/Y intersections into Z depth.
* Material Shader: Specular reflections utilizing either environment mapping or metallic PBR calculations.
* Smooth Dissolve: Older tube vertices transition toward 0 alpha to prevent overwhelming polycounts.

---

## PROPS (with defaults):
- colors: string[] = ['#ff00ff', '#00ffff'] — palette for the material.
- lightColors: string[] = ['#ffffff'] — spec/reflection lighting tones.
- lightIntensity: number = 1.5 — multiplier for the 3D spotlights.
- containerRef: React.RefObject<HTMLElement> — boundary limits.
- className: string = '' — DOM z-index overlays.

---



## IMPLEMENTATION REQUIREMENTS

* Setup all required logic (scene, canvas, hooks, etc.)
* Use proper React hooks (useEffect, useRef)
* Maintain clean architecture
* Write modular and readable code

---

## PERFORMANCE RULES (CRITICAL)

* Maintain smooth 60fps
* Use requestAnimationFrame for animations
* Optimize heavy calculations
* Properly clean up resources on unmount
* Handle window resize and devicePixelRatio
* Avoid unnecessary re-renders

---
## DO NOT

* Do NOT simplify animation or shader logic
* Do NOT skip implementation steps
* Do NOT return partial code
* Do NOT change component name
* Do NOT remove performance optimizations

---

## OUTPUT FORMAT (STRICT)

Return ONLY this file:

components/ThreeDTubesCursor.tsx

* Fully typed TypeScript
* Complete working code
* No explanation
* No markdown

---

## FINAL INSTRUCTION

Generate the COMPLETE component now with full functionality and production-level quality.`,
    "target-cursor": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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
    "blur-text": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Blur In" text reveal effect.

---

## COMPONENT INFO

Name: BlurText
Type: UI / Animation / Text

---

## GOAL

Create a text animation where the entire text block blurs and fades in smoothly as it enters the viewport.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion (motion/react)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Blur Transition**: Animate filter: blur from 10px to 0px.
* **Opacity Reveal**: Animate opacity from 0 to 1 simultaneously.
* **Viewport Trigger**: The animation should trigger when the component enters the visible viewport (whileInView).
* **Smoothing**: Use easeOut easing with an 800ms duration.

---

## PROPS (with defaults):
- text: string = "BLUR IN TEXT" — content to animate.
- className: string = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center" — styling override.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Library**: Use motion from motion/react.
2. **Animation Parameters**: Set initial={{ filter: "blur(10px)", opacity: 0 }} and whileInView={{ filter: "blur(0px)", opacity: 1 }}.
3. **Viewport Config**: Ensure viewport={{ once: true }} is considered if needed, though standard whileInView is the baseline.

---

## PERFORMANCE RULES

* Use hardware-accelerated CSS filters where possible.
* Avoid expensive layout shifts during the blur transition.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "fade-text": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a simple "Fade In" text effect.

---

## COMPONENT INFO

Name: FadeText
Type: UI / Animation / Text

---

## GOAL

Create a clean, minimalist fade-in animation for a text block.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion (motion/react)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Opacity Fade**: Smoothly transition opacity from 0 to 1.
* **Configurable Duration**: Allow the animation speed to be adjusted via props.
* **Ease**: Use standard ease-in-out transition.

---

## PROPS (with defaults):
- text: string = "FADE TEXT" — content to animate.
- className: string = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" — styling override.
- duration: number = 1.5 — animation time in seconds.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Library**: Use motion from motion/react.
2. **Timing**: Apply the duration prop to the transition configuration.

---

## PERFORMANCE RULES

* Ensure opacity animations are handled on the compositor thread.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "dock-text": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Dock" scale-in effect.

---

## COMPONENT INFO

Name: DockText
Type: UI / Animation / Text

---

## GOAL

Create a subtle "docked" animation effect where text scales up slightly from a smaller initial state while fading in.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion (motion/react)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Scale Animation**: Animate scale from 0.8 to 1.0.
* **Opacity Sync**: Fade opacity from 0 to 1 in sync with scaling.
* **Interactive Feel**: Use a snappy transition to simulate a landing/docking action.

---

## PROPS (with defaults):
- text: string = "DOCK TEXT" — content to animate.
- className: string = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" — styling override.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Library**: Use motion from motion/react.
2. **Initial State**: Set initial={{ scale: 0.8, opacity: 0 }}.
3. **Animate State**: Set animate={{ scale: 1, opacity: 1 }}.

---

## PERFORMANCE RULES

* Use transform: scale to avoid triggering layout repaints.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "font-weight": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with dynamic "Font Weight" shifting.

---

## COMPONENT INFO

Name: FontWeightText
Type: UI / Animation / Text

---

## GOAL

Create a text component that continuously cycles its font weight between light and bold states for a breathing effect.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion (motion/react)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Weight Oscillation**: Cycle fontWeight between 400 and 900.
* **Smooth Interpolation**: Use an 1000ms easy-in-out transition between weights.
* **State Management**: Use useEffect and setInterval to toggle the weight state.

---

## PROPS (with defaults):
- text: string = "VARIABLE WEIGHT" — content to display.
- className: string = "text-6xl md:text-8xl font-display text-white tracking-tighter" — styling override.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Library**: Use motion from motion/react.
2. **Dynamic Styling**: Ensure both animate={{ fontWeight: weight }} and style={{ fontWeight: weight }} are used for compatibility with some fonts.
3. **Lifecycle**: Properly clean up the interval on component unmount.

---

## PERFORMANCE RULES

* Ensure the font being used supports variable weight or multiple weights.
* Optimize transitions to avoid heavy main-thread work.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "gradual-spacing": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Gradual Spacing" reveal.

---

## COMPONENT INFO

Name: GradualSpacing
Type: UI / Animation / Text

---

## GOAL

Create a text reveal where characters start with wide letter-spacing and gradually condense into their final position as they fade in.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion (motion/react)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Letter Spacing Transition**: Animate letterSpacing from 1em to 0.1em.
* **Opacity Fade**: Animate opacity from 0 to 1 for each character.
* **Staggered Launch**: Use individual motion spans with a 50ms incremental delay.
* **Layout Integrity**: Ensure spaces are handled using non-breaking space ("\u00A0") to prevent collapses.

---

## PROPS (with defaults):
- text: string = "GRADUAL SPACING" — content to animate.
- className: string = "text-6xl md:text-8xl font-display text-white tracking-tighter" — styling override.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Library**: Use motion from motion/react.
2. **Animation Parameters**: Set initial={{ letterSpacing: "1em", opacity: 0 }} and animate={{ letterSpacing: "0.1em", opacity: 1 }}.
3. **Container**: Use flex justify-center flex-wrap to keep text centered and responsive.

---

## PERFORMANCE RULES

* Use hardware-accelerated transforms (filter/opacity) where possible.
* Avoid layout thrashing by maintaining stable container dimensions.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "letter-pull-up": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Letter Pull Up" effect.

---

## COMPONENT INFO

Name: LetterPullUp
Type: UI / Animation / Text

---

## GOAL

Create an energetic entrance where each individual letter pulls up from an invisible baseline into its final resting position.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion (motion/react)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Masked Reveal**: Parent container must use overflow-hidden to mask letters as they rise.
* **Vertical Slide**: Animate y coordinate from 100% to 0.
* **Opacity Sync**: Fade opacity from 0 to 1 during the pull-up.
* **Staggered Rhythm**: Apply a 50ms delay multiplier to the character index.

---

## PROPS (with defaults):
- text: string = "LETTER PULL UP" — content to animate.
- className: string = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" — styling override.
- delayMultiplier: number = 0.05 — time in seconds between each letter.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Library**: Use motion from motion/react.
2. **Component Structure**: Split text into an array of characters and map each to a motion.span.
3. **Clipping**: Ensure the letters start completely "under" the container mask.

---

## PERFORMANCE RULES

* Use GPU-accelerated translateY for the vertical motion.
* Avoid expensive box-shadows on individual letters during the slide.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "multi-direction-slide": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Multi-Direction" sliding letters.

---

## COMPONENT INFO

Name: MultiDirectionSlide
Type: UI / Animation / Text

---

## GOAL

Create a complex, dynamic entrance where letters slide into place from alternating directions (top and bottom) while moving horizontally.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion (motion/react)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Alternating Entry**: Even indices slide from y: -100, odd indices slide from y: 100.
* **Horizontal Slide**: All letters slide in from x: -50 to 0.
* **Staggered Launch**: Add a sequential delay to each character for a wave effect.
* **Spring Physics**: Use a slight bounce (stiffness: 100, damping: 12) for a polished feel.

---

## PROPS (with defaults):
- text: string = "MULTI DIRECTION" — content to animate.
- className: string = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" — styling override.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Library**: Use motion from motion/react.
2. **Conditional Logic**: Calculate initial y based on index % 2.
3. **Container**: Use overflow-hidden on the parent to clean up the entrance.

---

## PERFORMANCE RULES

* Ensure all animations use CSS transforms to avoid layout repaints.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "scale-letter": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Scale Bounce" text effect.

---

## COMPONENT INFO

Name: ScaleLetter
Type: UI / Animation / Text

---

## GOAL

Animate characters by scaling them from 0 to 1 with a high-energy spring bounce as they enter the viewport.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion (motion/react)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Spring Bounce**: Use a custom cubic-bezier or spring config to create an overshooting scale-up effect.
* **Staggered Entrance**: Sequential reveal of letters with a 40ms delay.
* **Opacity Fade**: Fade from 0 to 1 in sync with scaling.
* **Hover Interaction**: Ensure letters respond slightly to mouse hover if possible.

---

## PROPS (with defaults):
- text: string = "SCALE LETTER" — content to animate.
- className: string = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" — styling override.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Library**: Use motion from motion/react.
2. **Spring Config**: stiffness: 300, damping: 20, mass: 1.
3. **Lifecycle**: Use whileInView with viewport={{ once: true }}.

---

## PERFORMANCE RULES

* Use hardware-accelerated transforms (scale/opacity).

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "separate-away": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Separate Away" reveal.

---

## COMPONENT INFO

Name: SeparateAway
Type: UI / Animation / Text

---

## GOAL

Create a lateral text reveal where letters slide out from a compressed central point or a horizontal offset to their final positions.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion (motion/react)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Horizontal Projection**: Animate x from -20px to 0px.
* **Fluid Stagger**: Use a 80ms delay between consecutive characters.
* **Opacity Reveal**: Smooth transition from 0 to 1 opacity.
* **Precision Layout**: Ensure letter spacing remains consistent after completion.

---

## PROPS (with defaults):
- text: string = "SEPARATE AWAY" — content to animate.
- className: string = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" — styling override.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Library**: Use motion from motion/react.
2. **Container**: Use flex justify-center to maintain visual balance.

---

## PERFORMANCE RULES

* Use Will-Change: transform for smoother character projection.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "wavy-text": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with an "Infinite Wavy" loop.

---

## COMPONENT INFO

Name: WavyText
Type: UI / Animation / Text

---

## GOAL

Create a persistent, undulating wave effect that flows through a text block, making it feel fluid and responsive.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion (motion/react)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Oscillating Motion**: Animate y through keyframes [0, -20, 0].
* **Infinite Repeat**: Set repeat to Infinity with an easeInOut transition.
* **Phase Propagation**: Delay each character index by index * 0.1s to create the fluid wave phase.
* **Interactive Tilt**: Add a subtle hover state shift if possible.

---

## PROPS (with defaults):
- text: string = "WAVY TEXT" — content to animate.
- className: string = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" — styling override.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Library**: Use motion from motion/react.
2. **Animation Loop**: Use an array-based animate prop (animate={{ y: [0, -20, 0] }}).

---

## PERFORMANCE RULES

* Use hardware-accelerated y-transforms.
* Limit character count for complex continuous loops.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "word-pull-up": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Word Pull Up" reveal.

---

## COMPONENT INFO

Name: WordPullUp
Type: UI / Animation / Text

---

## GOAL

Create a blocky, high-impact entrance where entire words pull up from beneath an invisible threshold.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion (motion/react)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Word Tokenization**: Split text by spaces and animate word-blocks.
* **Masked Uplift**: Parent word-container must use overflow-hidden.
* **Staggered Blocks**: Delay each word by 150ms.
* **Vertical Velocity**: Animate y from 100% to 0 with a snappy ease.

---

## PROPS (with defaults):
- text: string = "WORD PULL UP" — content to animate.
- className: string = "text-6xl md:text-8xl font-display font-black text-white tracking-tighter" — styling override.
- staggerTime: number = 0.15 — delay between words.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Library**: Use motion from motion/react.
2. **Logic**: Use text.split(" ") and map over the resulting array.
3. **Layout**: Maintain gap-x-4 or similar spacing between words.

---

## PERFORMANCE RULES

* Animate using GPU-accelerated transforms.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "liquid-glass": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Liquid Glass" weather dashboard aesthetic.

---

## COMPONENT INFO

Name: LiquidGlass
Type: UI / Interaction / Glassmorphism

---

## GOAL

Create a translucent, frosted glass dashboard interface with layered depth, subtle glows, and realistic weather iconography.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Lucide React

---

## FEATURES (STRICT – DO NOT SKIP)

* **Frosted Depth**: Use backdrop-blur-xl and semi-transparent white backgrounds (bg-white/5).
* **Layered Shadows**: Apply multiple box-shadow layers for a realistic floating glass effect.
* **Weather Data**: Display a horizontal hourly forecast with icons and temperatures.
* **Layout**: A 2-column grid within the glass container for time, location, and daily forecasts.
* **Iconography**: Use Cloud, Sun, CloudRain from Lucide.

---

## PROPS (with defaults):
- backgroundImage: string = "url('https://images.unsplash.com/photo-1590867286251-8e26d9f255c0')" — dashboard background.
- location: string = "Surat" — city display.
- temp: string = "+18°C" — current temperature.

---

## IMPLEMENTATION REQUIREMENTS

1. **Glassmorphism**: Ensure border-white/10 and rounded-xl/3xl for a premium feel.
2. **Layout Structure**: Use a main container with relative z-30 positioning.
3. **Card Logic**: Wrap internal sections in custom LiquidGlassCard-style divs.

---

## PERFORMANCE RULES

* Use backdrop-filter for blur efficiency.
* Avoid heavy SVG re-renders by using Lucide components correctly.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "noise": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with an interactive "Noise Overlay".

---

## COMPONENT INFO

Name: Noise
Type: UI / Visual Effect

---

## GOAL

Create a grain-textured overlay effect that reacts to user input, providing an organic, "analog" feel to digital layouts.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* SVG Filters

---

## FEATURES (STRICT – DO NOT SKIP)

* **SVG Noise Generator**: Use feTurbulence and feColorMatrix within an SVG filter for realistic grain.
* **Interactive Opacity**: Include a slider UI to adjust the intensity of the noise grain in real-time.
* **Blend Mode**: Apply mix-blend-overlay to the noise layer for integration with underlying content.
* **Grid Backdrop**: Include a subtle background grid for visual reference.

---

## PROPS (with defaults):
- opacity: number = 0.05 — base noise visibility.
- baseFrequency: string = "0.65" — grain density parameter.
- numOctaves: string = "3" — grain complexity parameter.

---

## IMPLEMENTATION REQUIREMENTS

1. **State Management**: Use useState for real-time opacity overrides.
2. **SVG Pattern**: Embed a data URI SVG pattern into the background-image of the overlay layer.
3. **UI Elements**: Ensure the slider is clean and positioned in the top-right corner.

---

## PERFORMANCE RULES

* Use pointer-events-none on the noise layer to prevent interaction blockage.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "blur-vignette": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Blur Vignette" mask.

---

## COMPONENT INFO

Name: BlurVignette
Type: UI / Visual Effect / Image

---

## GOAL

Apply a soft, blurred vignette effect to imagery, focusing attention on the center while elegantly blurring the periphery.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* CSS Mask-Image

---

## FEATURES (STRICT – DO NOT SKIP)

* **Progressive Blur**: The blur intensity should increase towards the edges of the image.
* **Central Focus**: Keep the center of the image sharp and unaffected by the blur.
* **Animated Reveal**: Use Framer Motion for a subtle entry zoom or pan.
* **Border Radii**: Smoothly integrated rounded corners with appropriate overflow handling.

---

## PROPS (with defaults):
- image: string = "" — URL of the target image.
- blurAmount: string = "12px" — maximum blur intensity.
- transitionLength: string = "100px" — distance of the blur fade.

---

## IMPLEMENTATION REQUIREMENTS

1. **Mask Logic**: Use mask-image: radial-gradient and backdrop-filter: blur() on a layered pseudo-element.
2. **Container**: Ensure child content (images/text) is correctly clipped.

---

## PERFORMANCE RULES

* Avoid multiple overlapping backdrop-filters if possible; optimize blur radii for mobile.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "liquid-gradient": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with a "Liquid Gradient" loop.

---

## COMPONENT INFO

Name: LiquidGradient
Type: UI / Visual Effect / Background

---

## GOAL

Animate smooth, organic color shifts using looping radial-gradients that simulate fluid motion.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion

---

## FEATURES (STRICT – DO NOT SKIP)

* **Keyframe Color Cycle**: Transition background between multiple radial-gradient states.
* **Infinite Flow**: Set duration: 10+, ease: "linear", and repeat: Infinity.
* **Depth & Opacity**: Layer the gradient with a low opacity over a dark neutral background.
* **Soft Borders**: Integrate within a rounded-3xl container with a subtle 1px border.

---

## PROPS (with defaults):
- color: string = "#ff0080" — primary accent color.
- opacity: number = 0.3 — transparency level.
- duration: number = 10 — speed of the color cycle.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Factory**: Use motion.div to animate the background property.
2. **Gradient Positions**: Alternate the radial-gradient center between [0% 0%], [100% 100%], and [0% 100%].

---

## PERFORMANCE RULES

* Use hardware-accelerated CSS properties where available.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "spotlight-cards": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Spotlight Card" interactions.

---

## COMPONENT INFO

Name: SpotlightCards
Type: UI / Interaction / Card

---

## GOAL

Create a set of feature cards with a synchronized "spotlight" glow that tracks the mouse cursor across all cards simultaneously.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion
* Lucide React

---

## FEATURES (STRICT – DO NOT SKIP)

* **Synchronous Tracking**: A single mouse position must drive the spotlight radial-gradient on every card in the container.
* **Glassmorphic Surface**: Base cards should be neutral-900 with subtle borders.
* **Interactive Glow**: Hovering cards triggers a localized border illumination and internal volumetric glow.
* **Horizontal Scroll**: Support responsive x-axis scrolling with snap points.

---

## PROPS (with defaults):
- defaultCardColors: string[] = ['#10b981', '#6366f1', '#f59e0b'] — spotlight accents.
- title: string = "Platform Features" — header.

---

## IMPLEMENTATION REQUIREMENTS

1. **Masking Technqiue**: Use mask-image: radial-gradient combined with absolute positioning for the glow layer.
2. **Scroll Sync**: Ensure overlay glow layer scrolls in sync with the primary content layer.

---

## PERFORMANCE RULES

* Throttle or optimize mouseMove events to maintain 60fps.
* Use will-change: transform for the scrollable container.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "image-reveal": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Image Reveal on Hover".

---

## COMPONENT INFO

Name: ImageReveal
Type: UI / Interaction / Animation

---

## GOAL

Create a list of text labels that reveal a floating, cursor-following image when hovered, with smooth spring-physics transitions.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion

---

## FEATURES (STRICT – DO NOT SKIP)

* **Spring-Physics Tracking**: The hovering image must follow the cursor with distinct stiffness and damping for a "heavy" but responsive feel.
* **Transition Effects**: Apply rotation, scale, and opacity shifts on image entry/exit.
* **Interactive Highlight**: Change label text color and blend mode (mix-blend-difference) on hover.
* **Mobile Handling**: Ensure the image remains visible or adapts gracefully on touch devices.

---

## PROPS (with defaults):
- items: VisualItem[] — array of {key, url, label}.
- hoverText: string = "REVEAL" — button text.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Values**: Use useMotionValue and useSpring for high-perf X/Y tracking.
2. **Z-Index**: Ensure the floating image is on top of all other elements.

---

## PERFORMANCE RULES

* Use img-decoding: async for large revealed assets.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "blocks": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with "Interactive Grid Blocks".

---

## COMPONENT INFO

Name: Blocks
Type: UI / Visualization / Grid

---

## GOAL

Animate a grid of square blocks that respond to mouse interactions with staggered reveals and color shifts.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion

---

## FEATURES (STRICT – DO NOT SKIP)

* **Staggered Entrance**: Animate each block from scale 0.8 to 1 with an incremental index delay.
* **Hover Reactivity**: Individual blocks should transition their background color or opacity when hovered.
* **Geometric Precision**: Perfectly aligned 4x4 or customizable grid dimensions.
* **Minimalist Aesthetic**: Dark theme with sub-pixel white borders (border-white/5).

---

## PROPS (with defaults):
- hoverColor: string = "hover:bg-violet-500/20" — Tailwind utility for active block.
- gridSize: number = 16 — total block count.

---

## IMPLEMENTATION REQUIREMENTS

1. **Grid Layout**: Use grid-cols-4 or dynamic grid configurations.
2. **Motion Lifecycle**: Standard initial/animate/transition workflow.

---

## PERFORMANCE RULES

* Keep block count below 100 for continuous buttery animation.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "animated-beam": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:
* Return ONLY code
* Return ONE complete file
* Do NOT explain anything
* Follow structure exactly

---

## TASK

Build a high-performance React component with an "Animated Energy Beam".

---

## COMPONENT INFO

Name: AnimatedBeam
Type: UI / Visual Effect

---

## GOAL

Simulate a high-speed energy beam traveling through a defined box, adding a "high-tech" look to cards or dashboards.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion

---

## FEATURES (STRICT – DO NOT SKIP)

* **Kinetic Animation**: Animate a glowing horizontal line across the container.
* **Infinite Flow**: Infinite loop using linear easing for constant velocity.
* **Glowing Aesthetic**: Use gradient tails (transparent -> color -> transparent) to simulate the beam's trail.
* **Rotation**: Orient the beam diagonally for extra dynamic feel.

---

## PROPS (with defaults):
- color: string = "sky-400" — beam base tint.
- duration: number = 2 — traversal speed.

---

## IMPLEMENTATION REQUIREMENTS

1. **Motion Engine**: Use motion.div with animate={{ x: [-100, 300] }} or similar bounds.
2. **Tailwind Mapping**: Ensure dynamic color classes (e.g., via-sky-400) are handled safely.

---

## PERFORMANCE RULES

* Use hardware-accelerated transforms (x).

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "3d-rubiks-cube": `
# UI HUB • ANTIGRAVITY / ADVANCE MASTER PROMPT
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
            const face = document.createElement('div'); face.className = \\\`\\\${styles.cubieFace} \\\${fc.cls}\\\`;
            face.style.transform = fd.t + (fc === FC.inner ? ' scale(0.98)' : '');
            if (fc !== FC.inner) {
                face.style.backgroundColor = fc.bg; 
                face.innerHTML = \\\`<div class="\\\${styles.gloss}"></div><div class="\\\${styles.shine}"></div>\\\`;
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
        pivot.getBoundingClientRect(); if (ms>0) pivot.style.transition = \\\`transform \\\${ms}ms cubic-bezier(0.34, 1.25, 0.64, 1)\\\`;
        const rotStr = axis==='y' ? \\\`rotateY(\\\${angle}deg)\\\` : axis==='x' ? \\\`rotateX(\\\${angle}deg)\\\` : \\\`rotateZ(\\\${angle}deg)\\\`;
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
        let rafId; const animRot = () => {
            const rot = rotationRef.current; if (!rot.dragging) {
                rot.velY *= 0.92; rot.velX *= 0.92; if (!manualModeRef.current && historyRef.current.length===0) { rot.velY += (0.25-rot.velY)*0.025; rot.velX += (0-rot.velX)*0.025; }
                rot.y += rot.velY; rot.x += rot.velX; rot.x = Math.max(-65, Math.min(65, rot.x));
            }
            if (sceneRef.current) sceneRef.current.style.transform = \\\`rotateX(\\\${rot.x}deg) rotateY(\\\${rot.y}deg)\\\`;
            rafId = requestAnimationFrame(animRot);
        };
        rafId = requestAnimationFrame(animRot); return () => cancelAnimationFrame(rafId);
    }, [makeCubie]);

    const handleMouseDown = (e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX; const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rot = rotationRef.current; rot.dragging = true; rot.lx2 = clientX; rot.ly2 = clientY;
        rot.velX = 0; rot.velY = 0; manualModeRef.current = true;
    };
    const handleMouseMove = useCallback((e) => {
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
\n## Performance\n* GPU-accelerated transforms (matrix3d).\n* Minimal re-renders through Ref-based management.`,

  "hoodiebot": `# UI HUB • ANTIGRAVITY MASTER PROMPT

Create a premium "HoodieBot" 3D character component using React, TypeScript, and Tailwind CSS. Ensure it has interactive animations, sound effects, and floating UI elements exactly as shown in the reference code.`,

  "smilo": `# UI HUB • ANTIGRAVITY MASTER PROMPT

Create a premium "Smilo" 3D character component using React, TypeScript, and Tailwind CSS. Ensure it has interactive animations, sound effects, and floating UI elements exactly as shown in the reference code.`,

  "tripy": `# UI HUB • ANTIGRAVITY MASTER PROMPT

Create a premium "Tripy" 3D character component using React, TypeScript, and Tailwind CSS. Ensure it has interactive animations, sound effects, and floating UI elements exactly as shown in the reference code.`,

  "aiva": `# UI HUB • ANTIGRAVITY MASTER PROMPT

Create a premium "Aiva" 3D character component using React, TypeScript, and Tailwind CSS. Ensure it has interactive animations, sound effects, and floating UI elements exactly as shown in the reference code.`,

  "laptopbot": `# UI HUB • ANTIGRAVITY MASTER PROMPT

Create a premium "LaptopBot" 3D character component using React, TypeScript, and Tailwind CSS. Ensure it has interactive animations, sound effects, and floating UI elements exactly as shown in the reference code.`,

  "section-scroll": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Build a premium vertical panel scroll animation component in React + TypeScript + Vite + Tailwind CSS, with high-performance GSAP and ScrollTrigger logic.

**Component Name**: SectionScroll
**Category**: Scroll Animation

**Core Animations & Mechanics**:
1. **Dual Scroll Modes**:
   - **Full Scroll Mode (showDemoButton = false)**: Panels are stacked vertically in a standard flow. Each panel (except the last one) pins itself at the bottom of the viewport as the next panel slides up over it using ScrollTrigger pinning with no-spacing. Entry rotation is handled individually per panel as it enters the viewport.
   - **Library Preview Mode (showDemoButton = true)**: To prevent React-crashing DOM mutations in scaled/flex layout containers (which occur when using ScrollTrigger pin/spacers), panels are stacked absolutely within the relative container. An outer timeline is scrub-linked directly to the parent scroll container. Subsequent panels start off-screen at \`yPercent: 100\` and rotate at 25 degrees (\`transform-origin: bottom left\`), smoothly transitioning to \`yPercent: 0\` and \`rotate: 0\` as the container scrolls.
2. **Preventing Height Collapse**:
   - In preview mode (\`showDemoButton = true\`), the inner wrapper and the main panel container must stretch using absolute positioning (\`absolute inset-0 overflow-hidden\` and \`h-full absolute inset-0\`) to match the relative outer wrapper's height (\`min-h-[500px]\`), ensuring panels render at full scale.
3. **UI HUB Premium Branding**:
   - **Brand Badge**: A floating brand indicator is positioned in the top-right corner (\`absolute top-6 right-6 z-40\`) with backdrop blur, a neat border, the UI HUB logo icon (\`/logo.png\`), tracking-spaced uppercase brand title (\`UI HUB\`), and a pulsing green LED indicator (\`bg-brand-green animate-pulse\`).
   - **Tracked Subheadings**: Every panel features a cohesive technical subheading tracking its progressive state:
     - Panel 1: "01 // UI HUB ARCHITECTURE"
     - Panel 2: "02 // UI HUB EXPRESSION"
     - Panel 3: "03 // UI HUB VARIATION"
     - Panel 4: "04 // UI HUB OUTCOME"
4. **No Overlay Clutter**:
   - Do NOT render a duplicate or overlapping "View Full Demo" center button overlay in preview mode. The preview must remain interactive and clear of obstruction.

**Tech Stack**:
* React
* TypeScript
* GSAP + ScrollTrigger
* Framer Motion
* Tailwind CSS

**Critical Rules**:
- Ensure all ScrollTriggers are properly cleaned up on unmount using garbage collection.
- Make all image wrappers have advanced overflow-hidden and subtle grayscale/scale hover transitions.
`,

  "svg-page-transition": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Build a fluid, high-performance SVG vector page transition component in React + TypeScript + Vite + GSAP.

**Component Name**: SVGPageTransition
**Category**: Scroll / Page Transition

**Core Animations & Mechanics**:
1. **SVG Double-Stroke Wipe Animation**:
   - Stagger two wide, round-capped SVG paths across the viewport with custom timeline offsets, scaling, and stroke widths.
   - Use high-performance GSAP strokeDashoffset animations to cleanly draw paths in during "leave" phase and draw paths out during "enter" phase.
2. **Interactive Mock Navbar**:
   - Provide three interactive navbar buttons (Home, About, Contact) to simulate seamless page changes.
   - Control navigation state programmatically, ensuring all interactive elements are locked during transitions.
3. **Advanced CSS and Backdrop Filtering**:
   - Design deep visual details including radial background gradients, glassmorphism panel styles, and pulsing typography.

**Tech Stack**:
* React
* TypeScript
* GSAP
* Tailwind CSS
`
,

  "interactive-hover-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Build a high-performance React component with a "Circular Expansion" hover interaction.

---

## COMPONENT INFO

Name: InteractiveHoverButton
Type: UI / Interaction

---

## GOAL

Create a button where hovering triggers a colored circle to scale up and fully cover the background, shifting text color and sliding in a dynamic status/arrow icon.

---

## TECH STACK

* React
* TypeScript (TSX)
* Framer Motion
* Tailwind CSS
* Lucide React
* clsx
* tailwind-merge (cn utility)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Circular Expand Hover**: Colored background dot at the right side scales up on hover to fill the button background.
* **Arrow / Status Shift**: Text pushes to the left/right and slides in an arrow icon. On click, the icon animates to a checkmark icon using AnimatePresence.
* **Style Variants**: Supports "default" (indigo), "neon" (neon green shadow/border), and "dark" (slate) variants.
* **Prop Customizability**: Control className, variant, and content.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Clip Prevention**: Set the expansion circle's hover scale factor to be large enough (e.g. scale up to 300) to ensure it fully masks the button box.
2. **Animation Easing**: Use custom transition timings (duration ~0.3s) for a snappy physical response.
3. **TypeScript**: Fully type all props and states.

---

## PROPS (with defaults):
- children: React.ReactNode — button text payload.
- className: string = '' — layout custom classes.
- variant: 'default' | 'neon' | 'dark' = 'default' — styling variant selector.
- text: string = '' — optional fallback text content.

---

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "gravitational-vortex": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL/animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:

## Component: GravitationalVortex

### Concept
A premium WebGL gravitational vortex background with a logarithmic spiral accretion disc of ~20k motion-blurred streaks falling into a funnel throat.

### Technical Requirements
- Raw WebGL with vertex and fragment shaders — NO Three.js dependency.
- Vertex shader computes particle position from logarithmic spiral math.
- Six vertices per quad (two triangles), no index buffer, drawArrays.
- Two seed buffers built once; CPU advances uPhase and uSpin per frame.
- Additive blending with premultiplied alpha over transparent canvas.
- Eye-shift lens correction computed on CPU.
- Near-plane culling (no clamped w division).
- dt-correct hover speed easing.

### Props
- background, baseColor, accentColor, accentMix, density, dotSize, speed, direction, hoverSpeed, scale, tiltX, tiltY, vortex

### Visual
- Logarithmic spiral: r(u) = mix(R_IN, R_OUT, u), angle = seed*TAU + TWIST*log(...) + spin
- Motion blur via real velocity displacement (not fixed-length dash)
- Gaussian width profile, depth attenuation, edge fade at rim and throat
- Spiral arms seeded via ARMS = 5, ARM_SPREAD = 0.85

### Performance
- MAX_PARTICLES = 40000, MIN_PARTICLES = 2000
- DPR_CAP = 2
- Canvas FPS gating at 30fps with FRAME_SLACK = 4

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "black-hole-3d": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and Canvas animation expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:

## Component: BlackHole

### Concept
A premium 3D black hole accretion disk with flowing particles leaving fading trail lines. Uses dual-canvas architecture for authentic 3D occlusion behind and in front of the central event horizon.

### Technical Requirements
- HTML5 Canvas 2D (no WebGL, no Three.js).
- Dual canvas: background for behind-horizon + sphere, foreground for in-front particles.
- ResizeObserver for responsive sizing, DPR capped at 1.5.
- dt-normalized animation: Math.min((now - lastTime) / 16.667, 3).
- Destination-out trail fade on both canvases.
- 3D perspective projection (PERSPECTIVE=1300) with two rotation matrices.
- Z-depth sorting: split particles into background (z >= 0) and foreground (z < 0), sort each back-to-front.
- Relativistic speed: sqrt(voidRadius / max(pt.radius, 10)).
- Power distribution: Math.pow(random(), 2) for gravity clustering.
- Core consumption respawn at outer edge.
- hexToRgb helper for sphere gradient colors.
- Particle init uses outerRadFromSize callback resolved against live canvas dimensions.

### Props
- showCenter, centre, particleCount, particleSize, colors, outerRadius, tilt, tiltSideway, trail, orbitSpeed, pullSpeed, style

### Visual
- Background canvas: trail fade → sort back-to-front → draw particles (globalAlpha, arc fill) → draw sphere (radial gradient + rim light).
- Foreground canvas: trail fade → sort back-to-front → draw particles (globalAlpha, arc fill).
- Sphere: radial gradient from voidColor center to edgeR/G/B, plus rimGrad with white-to-transparent rim.

### Performance
- DPR capped at 1.5
- Canvas size from ResizeObserver
- Skip off-screen particles (px < -30 || px > w+30)
- Particle count configurable via particleCount prop

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
    "blooming-flower": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)

You are a senior frontend engineer and WebGL shader expert.
Your task is to generate a **fully working, production-ready React component**.

STRICT RULES:

## Component: BloomingFlower

### Concept
A WebGL point-cloud flower of 60k-100k point sprites that opens on hover and closes to a bud. Three point kinds (petals, stamens, stem) share one buffer and one drawArrays(POINTS) call.

### Technical Requirements
- WebGL vertex/fragment shaders — no Three.js.
- One Float32Array buffer, 8 floats/point (aA vec4 + aB vec4), stride 32.
- Vertex shader selects branch via aB.z: 0=petal, 1=stamen, 2=stem.
- Additive blending (ONE, ONE) on premultiplied alpha.
- Transparent canvas, background is CSS.
- motion/react animate() for bloom gate on motionValue.
- mulberry32 seeded RNG, sampleU rejection sampling.
- DPR capped at 1.5, ResizeObserver, raw rAF.

### Props
- background, baseColor, stemColor, accentColor, accentMix, density, dotSize, speed, distance, tilt, closed, flower, transition, style

### Visual
- Petal: circular-arc midrib half-angle sinc form, angular-slot width, cupping, scatter thickness.
- Stamen: cbrt-radial dome, accent-colored.
- Stem: swayAt(t) shared with head, thickens toward root, fades at ground.
- Bloom: energy-conserved brightness, staggered whorls, breath wobble.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
  "chandelier": `
## COMPONENT: Chandelier (Interactive Background)

### Overview
A Canvas 2D cloth simulation with text rendered on a deformable grid. Characters from a configurable phrase are drawn on each quad cell of the cloth, scaling and rotating with the deformation. The cloth hangs from pin points and responds to gravity, wind, and mouse interaction.

### Physics
- Verlet integration with fixed timestep H = 1/120.
- Constraint solver: 6 iterations normal, 12 when a node is held.
- Horizontal + vertical links with stretch clamping (stretch prop).
- Wind: two-frequency sinusoidal breeze scaled by wind prop.
- Gravity scaled by min(width, height).
- Damping factor 0.992.
- Pin points every 5 columns on top row.

### Interaction
- Pointermove brush: push nodes away within radius (hover prop).
- Pointerdown: grab nearest free node within reach.
- Pointerup on window (not canvas) to prevent stuck drag.
- Held node leads, cloth follows with 0.45 lerp.

### Rendering
- Each quad cell gets one character from the phrase string.
- Rotation quantised to 5-degree steps (QA = PI/36) to prevent glyph shimmer.
- Scale clamped 0.15–1.7 based on quad stretch.
- Alpha based on quad area (how face-on it is).
- Pin pegs drawn as small circles.

### Props
- background: string (Default: "#0B0C0E")
- baseColor: string (Default: "#00F9AC")
- phrase: string
- density: number (Default: 24, range 6-40)
- speed: number (Default: 50, range 0-100)
- hover: number (Default: 100, range 0-200)
- cloth: { gravity, wind, grab, stretch }

### Constraints
- DPR capped at 2.
- ResizeObserver for responsive canvas.
- Fixed-step accumulator prevents variable-dt stretching.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
  "point-dna-helix": `
## COMPONENT: Point DNA Helix (Interactive Background)

### Overview
A bioluminescent 3D point-cloud double DNA helix background built with raw WebGL (single GL context, one rAF loop, all live state via refs). Two interwoven helical backbone strands 180 degrees out of phase are connected by discrete base-pair rungs, surrounded by ambient genetic dust. The helix runs horizontally past both frame edges so no end is ever visible.

### Shader / Rendering
- All helical parametric math, camera transform, perspective point sizing, depth fade and screen-space cursor displacement computed in the vertex shader.
- Additive premultiplied blending with exponential point falloff for a soft bioluminescent glow.

### Interaction
- Auto-spin about its own axis.
- Drag-to-spin with flick momentum.
- Cursor-proximity particle push (hover).
- Breathing pulse.

### Props
- background: string (Default: "#030712")
- baseColor: string (Default: "#00E5FF")
- accentColor: string (Default: "#FF007A")
- accentMix: number (Default: 42)
- glow: string
- density: number (Default: 31)
- dotSize: number (Default: 100)
- speed: number (Default: 70)
- zoom: number (Default: 30)
- hover: number (Default: 80)
- tilt: { x, y }
- helix: { turns, thickness, pulse }

### Constraints
- Single GL context kept for the component lifetime; all state in refs to avoid re-renders.
- ResizeObserver-driven responsive canvas with DPR capping.
- prefers-reduced-motion respected.

## FINAL OUTPUT
Your first and only output should be the direct tool execution to build and inject the component into the codebase, followed by a concise confirmation message that the file has been successfully implemented. Avoid markdown conversation; stick strictly to agentic deployment.
`,
  "isometric-portal": `
## COMPONENT: Isometric Portal (Loader)

### Overview
A neo-brutalist isometric diamond loading animation built purely with an inline SVG and CSS keyframes in a self-contained React/TypeScript component. Dark faceted diamond shell in layered gunmetal grays over an inner diamond with a grey-to-slate gradient; two thin golden diamond outlines bounce apart and together on a 4s ease-in-out loop (second frame delayed 0.5s).

### Animation Technique
- CSS @keyframes using transform translate on SVG <polygon> elements (ip-bounce, ip-bounce2).
- Gradient pulsing via @keyframes stop-color on the SVG linear-gradient stops (ip-umbral).
- Rising ember particles with a 4s ease-in-out translate loop (ip-particles).
- Id-selector driven animation rules (#bounce, #bounce2, #particles, #animatedStop).
- No JavaScript animation state; infinite purely via CSS animation.

### Interaction
- Mount and continue loop indefinitely.

### Props
None (static loader).

### Requirements
- Single-file component, self-contained <style> tag.
- Centered in a full-size flexbox container (w-full h-full min-h-[380px]).
- SVG renders at exactly 200x200.

### Do not
Add JS animation state, external animation libraries, or change timing/easing values.

### Do
Keep the CSS in a scoped <style> tag, preserve the 4s timing, 0.5s offset, and golden-on-gunmetal palette.

`,

  "morphing-glow": `
## COMPONENT: Morphing Glow (Loader)

### Overview
A morphing glass diamond loader built purely with a clipped inline SVG and CSS keyframes in a self-contained React/TypeScript component. A circular glass disc (amber-to-rust gradient, glowing rims, layered halo shadows) is clipped by an animated SVG mask whose blurred polygon blades reshape the silhouette continuously.

### Animation Technique
- CSS @keyframes on SVG mask polygons: 360deg rotation (mg-rotation) with per-blade transform-origins, staggered negative delays and alternating directions.
- Mask contrast pulse 15 -> 3 -> 15 over 1s (mg-roundness) to round and sharpen the sliced diamond.
- Whole-loader hue-rotate drift 0/-30/-60/-90/-45/0 degrees over 6s ease-in-out (mg-colorize).
- Blur(7px) filter on all mask blades; Mask referenced as url(#mg-clipping); CSS custom props --time-animation and --size keep timing/scaling tunable.
- No JavaScript animation state; infinite purely via CSS animation.

### Interaction
- Mount and continue loop indefinitely.

### Props
None (static loader).

### Requirements
- Single-file component with a self-contained <style> tag.
- Centered in a full-size flexbox container (w-full h-full min-h-[380px]).
- svg width/height exactly 100, mask id mg-clipping.

### Do not
Add JS animation state, external animation libraries, or change timing/easing values.

### Do
Keep the CSS in a scoped <style> tag, preserve mask polygon order, 2s base timing, 6s color cycle and amber/rust palette.

`,

  "gear-system": `
## COMPONENT: Gear System (Loader)

### Overview
A mechanical gearbox loader built purely with CSS keyframes in a self-contained React/TypeScript component. Four interlocking gears — three small 60px discs and one large 120px disc — spin inside a dark 200x150px panel with an inset vignette overlay, radiating tooth bars around each metal hub.

### Animation Technique
- CSS @keyframes on .gs-gear-inner: counter-clockwise and clockwise 360deg rotation (gs-counter-clockwise / gs-clockwise).
- Three small gears spin on 3s linear infinite loops, alternating directions (counter, clockwise, counter); the large gear spins counter-clockwise on a slower 6s linear infinite loop.
- Tooth bars are absolutely positioned around the axle; nth-child transforms rotate them in steps (60/120deg for small gears; 30/60/90/120/150deg for the large one).
- No JavaScript animation state; loops forever purely via CSS animation.

### Interaction
- Mount and continue loop indefinitely.

### Props
None (static loader).

### Requirements
- Single-file component with a self-contained <style> tag.
- Centered in a full-size flexbox container (w-full h-full min-h-[380px]).
- Gearbox exactly 200px wide by 150px tall; keyframes and classes prefixed gs-.

### Do not
Add JS animation state, external animation libraries, or change timing/easing values.

### Do
Keep the CSS in a scoped <style> tag, preserve the four gear positions, 3s/6s spin timing and the #111/#555 metal palette.

`,
  "hourglass": `
## COMPONENT: Hourglass (Loader)

### Overview
A sand-glass loader built purely with SVG and CSS keyframes in a self-contained React/TypeScript component. A ring of three trailing motion curves swings clockwise around the glass while the glass model flips a full 180deg each cycle and its sand column drains, refills and mounds over.

### Animation Technique
- CSS @keyframes on SVG elements: hg-flip (model 180deg flip), hg-motion-thick/medium/thin (three rotating curves with dashoffset strokes), hg-glare-top/bottom (fading glare bands), and hg-sand-* (dash-drop, fill, grains, lines and two clipped sand mounds).
- 2s cycle (--dur: 2s) with cubic-bezier timing and stroke-dashoffset driven sand currents.
- Amber/gold palette from --hue: 35 (hsl(35,90%,90%) sand; hsl(var(--hue),90%,50%/57.5%/85%) frames and glass).
- No JavaScript animation state; loops forever purely via CSS.

### Interaction
- Mount and continue loop indefinitely.

### Props
None (static loader).

### Requirements
- Single-file component with a self-contained <style> tag.
- Centered in a full-size flexbox container (w-full h-full min-h-[380px]).
- svg viewBox 0 0 56 56, width 14em; both clipPath ids (hg-sand-mound-top/bottom) unique and prefixed.

### Do not
Add JS animation state, external animation libraries, or change the 2s cycle/timing values.

### Do
Keep the CSS in a scoped <style> tag, preserve all hg- prefixed keyframes, the three motion curves, the amber palette and the clip-path mound sand shapes.

`,
  "generating-orb": `
## COMPONENT: Generating Orb (Loader)

### Overview
An AI-style generating loader: the word "GENERATING" spelled across the middle of a spinning circular orb. One rotating ring element and ten pulsing letters make up the mark.

### Animation Technique
- CSS @keyframes: go-loader-rotate spins the full-circle orb 90deg -> 270deg -> 450deg on a 2s linear loop while its inset box-shadow glow shifts hues (white/violet/indigo at 0% and 100%, magenta/indigo at 50%).
- go-loader-letter-anim pulses each letter (opacity 0.4 -> 1 at 20% with scale 1.15 -> 0.7) with incremental 0.1s animation-delays via nth-child (0s to 0.9s).
- No JavaScript animation state; loops forever purely via CSS.

### Interaction
- Mount and continue loop indefinitely.

### Props
None (static loader).

### Requirements
- Single-file component with a self-contained <style> tag.
- Centered in a full-size flexbox container (w-full h-full min-h-[380px]).
- Wrapper 180x180px; letter spans above the orb (z-index 1); everything prefixed go-.

### Do not
Add JS animation state, external animation libraries, or change the 2s cycle/delay timings.

### Do
Keep the CSS in a scoped <style> tag, preserve the ten G-E-N-E-R-A-T-I-N-G letters, the three inset shadow layers and the violet/magenta/indigo hue cycle.

`,
  "trading-candles": `
## COMPONENT: Trading Candles (Loader)

### Overview
A trading-terminal loader made of three animated candlesticks: green, red, green columns that bounce in a staggered ripple like a live market ticker.

### Animation Technique
- CSS @keyframes tc-bounce: each whole candle column swings from translateY(-20%) (0%/100%, cubic-bezier(0.8, 0, 1, 1)) to a resting pose (50%, cubic-bezier(0, 0, 0.2, 1)) on a 1s ease-in-out infinite loop.
- Animation-delay 0.1s for the outer green candles and 0.2s for the middle red candle.
- No JavaScript animation state; loops forever purely via CSS.

### Interaction
- Mount and continue loop indefinitely.

### Props
None (static loader).

### Requirements
- Single-file component with a self-contained <style> tag.
- Three .tc-candle-group columns; each contains a 4px top wick, a 12x48px rounded-2px body and a 4px bottom wick.
- Candle color driven by --tc-candle set on .tc-candle-green (#22c55e) / .tc-candle-red (#ef4444).
- Centered in a full-size flexbox container (w-full h-full min-h-[380px]); 4px gap between columns; everything prefixed tc-.

### Do not
Add JS animation state, external animation libraries, or change the 1s loop / 0.1s-0.2s delays.

### Do
Keep the CSS in a scoped <style> tag, preserve the green/red/green order and the two-stage bounce easing curves.

`,
  "pixel-bounce": `
## COMPONENT: Pixel Bounce (Loader)

### Overview
A retro pixel-art red ghost rendered with a 14x14 CSS grid, bobbing on a 0.5s loop with flickering belly pixels, scanning pupils and a synchronous soft shadow pulse.

### Animation Technique
- pb-upNDown: whole grid translates 0 -> -10px at the 50% keyframe on a 0.5s loop.
- pb-flicker0 / pb-flicker1: alternate red/transparent backgrounds on 0.5s loops; every an-cell gets one of the two phases to look like static.
- pb-eyesMovement: blue pupils translateX 0 -> 10px -> 0 on a slow 3s loop.
- pb-shadowMovement: blurred ellipse shadow pulses opacity 0.5 -> 0.2 on the same 0.5s cycle.
- No JavaScript animation state; loops forever purely via CSS.

### Interaction
- Mount and continue loop indefinitely.

### Props
None (static loader).

### Requirements
- Single-file component with a self-contained <style> tag.
- Structure: .pb-ghost (scale 0.8) > .pb-red (140x140 grid) + .pb-shadow (absolute).
- Grid: repeat(14,1fr) columns AND rows; grid-template-areas covering head, body and the bottom hem row.
- Eyes/pupils absolutely positioned with z-index 1; eye shape from ::before/::after.
- Centered in a full-size flexbox container (w-full h-full min-h-[380px]); everything prefixed pb-.

### Do not
Add JS animation state, external animation libraries, or change the 0.5s/3s cycle timings.

### Do
Keep the CSS in a scoped <style> tag, preserve the red/white/blue palette, the 14x14 grid and the two alternating flicker phases.

`,
  "gradient-orb": `
## COMPONENT: Gradient Orb (Loader)

### Overview
A glossy liquid-gradient sphere: two spinning DOM surfaces plus an animated-SVG wave mask layer, hue-cycling through red/blue/yellow/cyan on a dark backdrop.

### Animation Technique
- gorb-rotation: 360deg spin, applied at different durations - 2s linear on the sphere pseudos, 3s cubic-bezier(0.7,0.6,0.3,0.4) on the SVG.
- gorb-wave-one / gorb-wave-two: animate the d attribute of the two duplicated mask paths (up bulge vs down bulge), each offset by half a period, the second pair running reverse, on a 1s cubic-bezier(0.7,0.6,0.3,0.4) loop.
- gorb-colorize / gorb-colorblur: hue-rotate sweep 0 -> -30 -> -60 -> -90 -> -45 -> 0 deg on a 2s ease-in-out; colorblur adds blur(size/15).
- No JavaScript animation state; loops forever purely via CSS.

### Interaction
- Mount and continue loop indefinitely.

### Props
None (static loader).

### Requirements
- Single-file component with a self-contained <style> tag.
- .gorb-loader > (.gorb-sphere with ::before/::after) + inline svg.
- SVG masks: gorb-waves (d-animated paths), gorb-clipping, gorb-blurriness, gorb-fade; #gorb-shapes circles fill white.
- CSS variables: --gorb-size, --gorb-time-animation, --gorb-color-one..five.
- Centered in a full-size flexbox container (w-full h-full min-h-[380px]); everything prefixed gorb-.

### Do not
Add JS animation state, external animation libraries, or change the 1s/2s/3s cycle timings.

### Do
Keep the CSS in a scoped <style> tag, preserve the four masks, the d-path animation pair and the hue-rotate palette sweep.

`,
  "super-mario": `
## COMPONENT: Super Mario (Hover Tooltip)

### Overview
A NES-style pixel scene: two brick tiles frame a "?" block, and hovering the block's invisible hit area launches a 1-up mushroom out of the box that settles floating above it.

### Animation Technique
- CSS @keyframes sm-mush: on .sm-box:hover the sibling .sm-mush becomes opacity 1 and runs 0.5s linear forwards - scale(0.8) at 0%, scale(1.1) translateY(-80px) at 50%, scale(1.1) translateY(-35px) at 100% - frozen by fill-mode forwards.
- All pixel art via box-shadow pixel stacks on 2x2px divs; no images, no SVG.

### Interaction
- Hover the invisible hit-zone over the "?" block to trigger; the mushroom retracts on mouse-leave.

### Props
None (static interaction).

### Requirements
- Single-file component with a self-contained <style> tag.
- Structure: .sm-brick.one, .sm-container (.sm-box + .sm-mush), .sm-brick.two.
- Box-shadow pixel art: brick tile (#cc3300/#ff9999/#000), "?" block (#ce3100/#ff9c31/#000), mushroom (#fc9838/#d82800/#fff).
- Centered in a full-size flexbox container (w-full h-full min-h-[380px]); everything prefixed sm-.

### Do not
Add JS event handlers, images/SVG art, or change the 0.5s animation / pixel coordinates.

### Do
Keep the CSS in a scoped <style> tag, preserve the three pixel sprites and the :hover + sibling trigger.

`};

