export const ANTIGRAVITY_PROMPTS: Record<string, string> = {
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
    "3d-hero": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
    'mouse-gravity-background': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
    '3d-rubiks-cube': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.` ,
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
`,
    "section-scroll": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
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
`,

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
    "infinity-image": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
  "isometric-portal": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

  "morphing-glow": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

  "gear-system": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
  "hourglass": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
  "generating-orb": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
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
  "super-mario": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`};

