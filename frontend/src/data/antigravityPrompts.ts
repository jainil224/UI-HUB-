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
    "target-cursor": `
# ROLE: Senior AI Coding Expert (Antigravity)
# TASK: Create premium UI Component "Target Cursor"

## 1. COMPONENT IDENTITY
- Name: TargetCursor
- Theme: High-Tech, Precision, Tactical.
- Purpose: A cursor that snaps into interactive elements with animated corner brackets.

## 2. TECHNICAL SPECIFICATIONS
- Tech Stack: React + Framer Motion.
- Logic: Element intersection and snapping using getBoundingClientRect.

## 3. VISUAL & MOTION REQUIREMENTS
- Primary Visual: Four corner brackets that expand and contract.
- Motion Logic: Smooth lerp towards the center of target elements with a subtle "locking" animation.
- Aesthetic Quality: Indigo-600 glow, ultra-thin borders.

## 7. FINAL OUTPUT
- Provide the complete, single-file TypeScript code.
`,
};
