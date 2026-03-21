export const ANTIGRAVITY_PROMPTS: Record<string, string> = {
    "corner-border-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.

`,
    "shatter-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

Build a high-performance React component featuring a "Break-on-Click" physical simulation.

---

## COMPONENT INFO

Name: ShatterButton
Type: Interaction / Animation

---

## GOAL

Create a button that vanishes and explodes into dozens of sharp shards upon click, with randomized physics and a shockwave effect.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Framer Motion (AnimatePresence)
* Tailwind CSS

---

## FEATURES (STRICT – DO NOT SKIP)

* **Shard Explosion**: Generate 20+ geometric shards with randomized velocityX, velocityY, and rotation (-360 to 720 deg).
* **Shockwave**: Expanding circular ring (scale: 0 to 1, opacity: 1 to 0) over 600ms.
* **SVG Clip-Path**: Use SVG path generation for randomized shard shapes.
* **Auto-Reset**: Component must reset to its solid state after the explosion sequence finishes (approx 1000ms).

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Cleanup**: Automatically unmount/cleanup shard elements to prevent memory leaks.
2. **Impact**: The "shatter" event must feel high-impact and instantaneous.
3. **Typing**: Full TypeScript support for props (shardCount, shatterColor, onClick).

---

## PROPS (with defaults):
- children: React.ReactNode = 'Click Me' — content inside the glass button.
- className: string = '' — wrapper classes.
- shardCount: number = 30 — quantity of generated polygonal shards.
- shatterColor: string = '#ffffff' — base color tint applied to shattered fragments.
- onClick: () => void — execution handler.

---

## FINAL OUTPUT

* Provide the complete, single-file code.

`,
    "border-beam": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.

`,
    "glow-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.

`,
    "marquee-hover-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.

`,
    "payment-transaction-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.

`,
    "magic-card-effect": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.

`,
    "rainbow-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.

`,
    "social-tooltip-buttons": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.

`,
    "orbit-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.

`,
    "galaxy-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.

`,
    "liquid-fill-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.

`,
    "neon-flicker-button": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

Build a high-performance React component with "Distressed Cyberpunk" neon flickering.

---

## COMPONENT INFO

Name: NeonFlickerButton
Type: UI / Interaction

---

## GOAL

Create a high-intensity neon button that suffers from digital glitches, power surges, and erratic flickering, feeling like a raw piece of hardware.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Framer Motion
* Tailwind CSS (Scanline Gradients)

---

## FEATURES (STRICT – DO NOT SKIP)

* **Glitch Logic**: Randomized opacity oscillation using repeatDelay arrays to simulate faulty wiring.
* **Power Blink**: Occasional global "blackouts" (every 6s) where the light cuts out completely.
* **Interactive Surge**: On click, intensify box-shadow blur and glow by 300% for 600ms.
* **Digital Overlays**: CRT scanline and film grain textures applied to the button surface.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Aesthetic**: Must look like a 1980s neon sign; use Gaussian blur layers for realistic glow.
2. **Responsiveness**: Flicker must react to hover states by increasing frequency.
3. **TypeScript**: Strict typing for color variants (red, cyan, purple, blue, pink).

---

## PROPS (with defaults):
- label: string = 'Warning' — flashing text payload.
- className: string = '' — styling attributes.
- color: string = '#ef4444' — harsh neon tube tint scale.
- onClick: () => void — execution handler.

---

## FINAL OUTPUT

* Provide the complete, single-file code.

`,
    "word-pull-up": `
# ROLE: Senior AI Coding Expert (Antigravity)
# TASK: Create premium UI Component "Word Pull Up"

## 4. IMPLEMENTATION STRATEGY
- Step 1: Split string by space.
- Step 2: Animate entire words upward from an overflow-hidden mask.

## 7. FINAL OUTPUT
- Provide the complete, single-file code.
`,
    "grid-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "hacker-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "novatrix-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "beam-grid-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "fall-beam-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "hell-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "interactive-grid-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "particles-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

Build a high-performance React component with "Hyper-Glow Particles".

---

## COMPONENT INFO

Name: ParticlesBackground
Type: Animation / UI / Background

---

## GOAL

Create a floating field of glowing particles with interactive repulse/push physics and SVG-filtered post-processing.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* particles.js (External CDN)
* SVG Gaussian Blur Filters

---

## FEATURES (STRICT – DO NOT SKIP)

* **Interactive Physics**: Enable repulse on hover and push on click to allow users to interact with the particle field.
* **SVG Glow Filter**: Apply a custom SVG <filter id="glow"> with feGaussianBlur to the particle canvas for a volumetric light effect.
* **Responsive Scaling**: Dynamic number.value calculation based on screen width (Desktop vs. Tablet vs. Mobile).
* **Out-Mode Travel**: Particles should move randomly and wrap/out-mode to maintain a consistent density.

---

## PROPS (with defaults):
- colors: string[] = ['#ffffff'] — random palette mapping array.
- size: number = 2 — point/sphere scale rendering diameter.
- countDesktop: number = 100 — baseline volume.
- countTablet: number = 60 — scaled down density.
- countMobile: number = 40 — performance limit volume.
- speed: number = 1 — particle drift velocity.
- interactive: boolean = true — enable repel physics.

---

## IMPLEMENTATION REQUIREMENTS

1. **CDN Injection**: Inject the particles.js script via document.createElement('script') in a useLayoutEffect.
2. **Filter Application**: Use CSS selectors (#js-particles canvas) to apply the SVG filter and position the canvas correctly.
3. **State Sync**: React to prop changes (colors, size, density) by re-initializing the particle engine.

---

## PERFORMANCE RULES

* Ensure retina_detect is enabled for high-resolution displays.
* Proper cleanup of script tags and DOM nodes on unmount to prevent memory leaks.



---

## FINAL OUTPUT

* Provide the complete, single-file code.
`,
    "wave-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "lines-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "sparkles-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "isometric-grid-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "space-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "neural-network-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

Build a high-performance React component with "Neural Connectivity" physics.

---

## COMPONENT INFO

Name: NeuralNetworkBackground
Type: Animation / Interaction / Background

---

## GOAL

Create a background showing a lively network of nodes and connecting lines, featuring organic movement, pulsing effects, and magnetic mouse interaction.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Canvas 2D API

---

## FEATURES (STRICT – DO NOT SKIP)

* **Dynamic Nodes**: 120+ nodes with randomized velocities and edge-bouncing logic.
* **Proximity Connections**: Draw semi-transparent lines between any two nodes within connectionDistance (150px default), with alpha linked to distance.
* **Magnetic Influence**: On hover, nodes within a 150px radius must be pushed away from the cursor using a directional force vector.
* **Mouse Anchoring**: Create temporary high-opacity connections between the cursor and nearby nodes within connectionDistance * 1.5.
* **Pulsating Orbs**: Nodes should have a subtle sine-wave size oscillation to feel "alive".

---

## PROPS (with defaults):
- nodeCount: number = 120 — network dots rendering budget.
- connectionDistance: number = 150 — threshold to draw connective strands.
- interactive: boolean = true — responds to mouse.
- nodeColor: string = '#888888' — static dots mapping.
- lineColor: string = '#888888' — generated web tint.
- className: string = '' — layout context.

---

## IMPLEMENTATION REQUIREMENTS

1. **Physics Loop**: Use requestAnimationFrame to update node positions and handle boundary collisions.
2. **Optimized Linking**: Use a nested loop over the node array to calculate distances, but keep the complexity manageable by filtering early.
3. **Canvas dpr**: Support window.devicePixelRatio scaling for sharp lines on Retina displays.
4. **Color Customization**: Allow overrides for nodeColor and lineColor (with internal alpha replacement logic).

---

## PERFORMANCE RULES

* Keep the node count reasonable (100-200) to maintain 60fps on mobile.
* Zero external dependencies; rely on vanilla Canvas 2D.



---

## FINAL OUTPUT

* Provide the complete, single-file code.
`,
    "black-hole-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
`,
    "warp-speed-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

Build a high-performance React component with "Hyperspace Warp" 3D effects.

---

## COMPONENT INFO

Name: WarpSpeedBackground
Type: Animation / UI / Background

---

## GOAL

Create a classic sci-fi warp speed effect where stars fly towards the viewer from a central vanishing point, leaving long light trails.

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Canvas 2D API (3D Projection)

---

## FEATURES (STRICT – DO NOT SKIP)

* **3D Projection**: Project 3D coordinates (X, Y, Z) into 2D screen space using the formula k = constant / star.z.
* **Motion Trails**: Draw lines from current (sx, sy) to previous (px, py) positions to create speed streaks.
* **Vanishing Point Shift**: Allow the vanishing point to subtly tilt based on mouse position for a "cockpit movement" feel.
* **Z-Reset**: When star.z becomes negative or near zero, re-randomize its position and reset z to the far plane.
* **Dynamic Thickness**: Line width must scale inversely with z (closer stars have thicker trails).

---

## PROPS (with defaults):
- starCount: number = 400 — dense 3D projection count limit.
- speed: number = 20 — velocity multiplier along inverted Z plane.
- starColor: string = '#ffffff' — motion blur line stroke colors.
- className: string = '' — block overrides.

---

## IMPLEMENTATION REQUIREMENTS

1. **Precision Rendering**: Initialize stars with randomized Z values to prevent "pop-in" clustering during the first cycle.
2. **Fade-In Logic**: Apply alpha transparency based on proximity to the far plane to smooth out new star transitions.
3. **Responsive Vanishing Point**: Recalculate vanishingX and vanishingY centered on the viewport with mouse offsets.

---

## PERFORMANCE RULES

* Use lineCap = 'round' for smoother streaking.
* 60fps locked; use requestAnimationFrame for all movement.



---

## FINAL OUTPUT

* Provide the complete, single-file code.
`,
    "mouse-gravity-background": `
# UI HUB • ANTIGRAVITY MASTER PROMPT


Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* Provide the complete, single-file code.
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

Prompt Version: UIHUB_ANTIGRAVITY_v1.0

---

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

* **Corner Tracking**: Four corner brackets expand and contract upon identifying click targets.\n* **Smooth Lerp**: Mathematical dampening for locking animations.\n* **Aesthetic**: Indigo-600 glow with ultra-thin borders.

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Performance**: Ensure 60fps locking for cursor interactions.
2. **Clean Teardown**: Remove all listeners and cleanup animation frames on unmount.
3. **Pointer Events**: Ensure the cursor layer doesn't block underlying DOM clicks using pointer-events-none where appropriate.

---

## PROPS API

interface TargetCursorProps {\n    targetSelector?: string;\n    spinDuration?: number;\n    hoverDuration?: number;\n    hideDefaultCursor?: boolean;\n    parallaxOn?: boolean;\n    containerRef?: React.RefObject<HTMLElement>;\n    className?: string;\n}

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

* Provide the complete, single-file code.
`,
};
