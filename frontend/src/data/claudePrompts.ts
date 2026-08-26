export const CLAUDE_PROMPTS: Record<string, string> = {
    "3d-landing-page": `
# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: ThreeDLandingPage
Type: Interactive 3D Responsive Landing Page

---

## Tech Stack

* React
* TypeScript
* Tailwind CSS
* Lucide React
* @splinetool/react-spline
* motion/react (framer-motion)

---

## Requirements

* Responsive container with h-[600px] and rounded-3xl.
* Conditional rendering: Desktop shows <Spline /> scene, Mobile (< 768px) shows fallback GIF.
* Multi-layer glassmorphic UI overlay with backdrop-filter: blur(7px).
* Interactive sticky/absolute Navbar (Branding: "UI HUB") and Hero section with cards (Title: "We Build Next-Gen UI Experiences", Description: "Designing Next-Gen UI Systems That Make Brands Unforgettable", Buttons: "Explore Work", "Get Started").
* Mouse-driven 3D tilt interaction (rotateX, rotateY) implemented with useMotionValue and useSpring for smooth parity with reference logic.
* Precise font imports (Gruppo, Sen) via CSS within the component.

---

## Performance

* High-fidelity 3D loading via @splinetool/react-spline.
* Optimally handled mobile fallbacks.
* Smooth CSS transitions for hovering elements and mobile navigation.
`,
    "3d-hero": `
# UI HUB • CLAUDE PROMPT

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
    'corner-border-button': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: CornerBorderButton
Type: Interactive Button with Animated Borders

---

## Tech Stack

* React
* TypeScript
* Tailwind CSS
* clsx
* tailwind-merge (cn utility)

---

## Requirements

* Progressive border drawing from corners (top-left, top-right, bottom-left, bottom-right).
* Hover state background color shift and smooth corner extension along the edges.
* Corner brackets must be visible in resting state (~10px) and form a complete border on hover (100%).
* Border glow effect using CSS box-shadow and absolute positioning.
* Button must have 'group' and 'group-hover' Tailwind classes for coordinated states.
* Text must be uppercase with wide letter-spacing tracking-widest.

---

## Props

* children: React.ReactNode — button label text.
* baseColor: string = "#0b1a2a" — resting state background color.
* hoverColor: string = "#ff3b4d" — background color when hovered.
* borderColor: string = "#60daff" — color of animated borders and corners.

---

## Performance

* Pure CSS/Tailwind transitions (400ms duration, ease-in-out).
* Avoid external animation libraries; use hardware-accelerated transforms.
* Pointer-events: none on border elements for flawless click interaction.`,




    'border-beam': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: BorderBeam
Type: Glowing Linear Animation

---

## Tech Stack

* React
* TypeScript
* Framer Motion (for offset-path animation)
* Tailwind CSS
* clsx
* tailwind-merge (cn utility)

---

## Requirements

* Infinite racing beam effect orbiting the border of the parent container.
* Dynamic calculation of path using 'offset-path' and 'rect()'.
* Advanced masking: [mask-clip:padding-box,border-box] [mask-composite:intersect].
* Support for reverse direction and speed multipliers.
* Customizable beam size, duration, and glow intensity.
* Optional pause-on-hover functionality.

---

## Props

* size: number = 50 — the width/height of the square beam gradient.
* duration: number = 6 — base orbit duration.
* colorFrom: string = "#7400ff" — start color of gradient.
* colorTo: string = "#9b41ff" — end color of gradient.
* borderThickness: number = 1 — width of the beam line.
* glowIntensity: number = 0 — blur radius for a trailing glow effect.
* reverse: boolean = false — flip movement direction.

---

## Performance

* Linear CSS-mask-based interpolation.
* Hardware-accelerated 'offset-distance' movement.
* Zero layout shifts since it uses absolute positioning relative to parent.`,


    'glow-button': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: GlowButton
Type: Interactive Mouse-tracked Neon Button

---

## Tech Stack

* React
* TypeScript
* Tailwind CSS
* clsx
* tailwind-merge (cn utility)

---

## Requirements

* Mouse-tracked radial spotlight on the button surface that follows the cursor.
* Multi-layered neon glow system: edge-glow, volumetric outer glow, and ambient particle orbs.
* Fluid transition of text color from neon accent to bright white on hover.
* Background context should include ambient pulse orbs behind the button for atmospheric depth.
* Shadow stack for deep button depth: '0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(16,185,129,0.05)'.

---

## Props

* label: string = "Glow Button" — text label for button.
* className: string — additional styling overrides.

---

## Performance

* Local state tracking for mouse coordinates (x, y).
* Pure CSS radial gradients for performance (background-position calculation).
* Use pointer-events: none on all overlay layers to preserve clickability.`,


    'marquee-hover-button': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: MarqueeHoverButton
Type: Dynamic Text Sliding Button

---

## Tech Stack

* React
* TypeScript
* Framer Motion (for infinite translation)
* Tailwind CSS
* clsx
* tailwind-merge (cn utility)

---

## Requirements

* Dual-layer text system: static label fades out on hover, marquee layer fades in.
* Seamless infinite marquee scroll using duplicated label segments (total 5).
* Continuous sliding animation using Framer Motion 'animate={{ x: [0, -100] }}'.
* Responsive layout handling with an invisible spacer to maintain button width.
* High-contrast styling with rounded-full geometry and font-black typography.
* Spring-based tap interaction for tactile feedback.

---

## Props

* label: string = "Button" — the text content for both static and marquee states.
* className: string — additional CSS overrides.
* disabled: boolean — standard button disability state.

---

## Performance

* Hardware-accelerated X-axis movement.
* Minimal DOM footprint (CSS-based opacity transitions).
* Linear easing for a consistent rolling feel without jitters.`,


    'payment-transaction-button': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: PaymentTransactionButton
Type: Animated Illustration Interface

---

## Tech Stack

* React
* TypeScript
* CSS-in-JS (via style tags for complex drawing)
* clsx
* tailwind-merge (cn utility)

---

## Requirements

* Hover-triggered "Insertion" animation: a payment card slides into an illustrated POS terminal.
* POS terminal features: illuminated screen with dynamic currency symbol, keypad details, and card slot.
* Detailed CSS-drawn illustration (no SVGs or external assets).
* Card illustration includes magnetic strip and golden chip details.
* Smooth 800ms cubic-bezier transition for the "Slide effect".
* Right-side label section with a sliding arrow icon on hover.

---

## Props

* label: string = "New Transaction" — primary action text.
* accentColor: string = "#5de2a3" — the primary "Acceptance" green/accent color.
* posColor: string = "#1f1f1f" — background color of the POS device.
* cardColor: string = "#2b2b2b" — background color of the payment card.
* currencySymbol: string = "$" — symbol displayed on the POS screen.

---

## Performance

* Pure CSS-driven animations for 60fps performance without JS overhead.
* Responsive scaling through media queries and relative units.
* No external assets (vector/DIV based illustration avoids extra requests).`,


    'magic-card-effect': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: MagicCard
Type: Mouse-reactive Spotlight Card

---

## Tech Stack

* React
* TypeScript
* Framer Motion (motion/react)
* Tailwind CSS
* clsx
* tailwind-merge (cn utility)

---

## Requirements

* Dual radial-gradient interaction: one for surface spotlight, one for border-box glow.
* Advanced mouse tracking using MotionValues (mouseX, mouseY) for zero-render physics.
* "Edge-Reset" logic: smoothly animate spotlight to the nearest edge on pointer leave.
* Layered "Mask-clipping" for precise border definition: [mask-clip:padding-box,border-box].
* Context-awareness: auto-reset gradient on window blur or document visibility change.

---

## Props

* children: React.ReactNode — content layer content.
* gradientSize: number = 200 — radius of the spotlight in pixels.
* gradientFrom: string = "#9E7AFF" — start color of border gradient.
* gradientTo: string = "#FE8BBB" — end color of border gradient.
* gradientOpacity: number = 0.8 — visibility of the surface glow.

---

## Performance

* useMotionTemplate for string-based interpolation to avoid React re-renders.
* Hardware-accelerated radial gradients.
* Pure CSS transitions for opacity (300ms fade-in).
* Event listener cleanup in useEffect (pointerout, blur).`,


    'rainbow-button': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: RainbowButton
Type: Prismatic Animated Button

---

## Tech Stack

* React
* TypeScript
* Radial-UI / Radix-Slot (asChild support)
* CVA (class-variance-authority)
* Tailwind CSS
* clsx

---

## Requirements

* Full-spectrum "Rainbow" animation using a multi-stop linear gradient.
* Triple-layered background system: base padding-box, translucent fade, and border-box gradient.
* Periodic glow aura beneath the button (before: pseudo-element) with blur(0.75rem).
* Continuous scrolling gradient effect using background-length: 200%.
* Support for variant sizes (sm, default, lg) and icon-only modes.
* CSS @keyframes 'rainbow' for linear 90deg gradient shifting.

---

## Props

* asChild: boolean — Radix-consistent composition.
* size: "sm" | "default" | "lg" | "icon" — scale of the button.
* children: React.ReactNode — button content.

---

## Performance

* CSS Keyframes driven animation for zero Main-thread cost.
* Optimized SVG sizing utilities for icon consistency.
* Efficient variant generation via CVA.`,


    'social-tooltip-buttons': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: SocialTooltipButtons
Type: Micro-interaction Icon List

---

## Tech Stack

* React
* TypeScript
* Tailwind CSS
* clsx
* tailwind-merge (cn utility)

---

## Requirements

* Dynamic brand color system using CSS variables (--brand-color).
* Hover-triggered tooltip with dramatic cubic-bezier entrance: scale(0.6) to scale(1.1) and translate-y transformation.
* Tooltip arrow drawn using a rotated 45deg div at bottom.
* Smooth button scaling (1.1x) and background-color propagation on hover.
* SVG social icons centered with consistent 20x20 sizing.
* Clean "Poppins" font integration for tooltips.

---

## Props

* className: string — container styling override.

---

## Performance

* Pure CSS 'group-hover' logic for tooltip reveal to avoid JS state overhead.
* Transition-opacity and transition-all for fluid interaction.
* Performance-optimized SVG paths for Facebook, Twitter, Instagram.`,


    'orbit-button': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: OrbitButton
Type: Interactive Orbital Particle Interface

---

## Tech Stack

* React
* TypeScript
* Framer Motion (for orbital physics)
* Tailwind CSS
* clsx
* tailwind-merge (cn utility)

---

## Requirements

* 6+ SVG-based glowing particles orbiting the button in a circular path.
* Dynamic orbit radius and speed: particles expand and accelerate on hover.
* Faint concentric ring background (dashed) to define the orbital plane.
* Multi-stop box-shadow stack for high-intensity particle glow.
* Spring-based expansion transition with damping (stiffness: 300).
* Centered button content with wide tracking-widest typography.

---

## Props

* children: React.ReactNode — button label text.
* color: string = "#22d3ee" — primary aesthetic color for particles/rings.
* particleCount: number = 6 — density of the orbital field.
* orbitRadius: number = 60 — base resting distance for particles.

---

## Performance

* CSS variables for coordinated color distribution.
* Hardware-accelerated 'rotate' transforms for 60fps orbit.
* Efficient mapping of indices to initial rotation angles.
* Minimal re-renders through local hover state management.`,


    'galaxy-button': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: GalaxyButton
Type: Deep Space Atmospheric Button

---

## Tech Stack

* React
* TypeScript
* Tailwind CSS
* clsx
* tailwind-merge (cn utility)

---

## Requirements

* Triple-layered cosmic animation system: star field rotation, nebula drift, and conic-gradient border.
* Continuous rotation of the star field (background-position animation).
* Slow-drifting nebula opacity oscillation (pulse animation).
* Conic-gradient border (360deg) creating a racing light effect.
* Backdrop-blur (12px) on the button surface for glass-morphism depth.
* High-intensity "Glow-aura" using drop-shadow and blurred absolute containers.

---

## Props

* label: string = "Galaxy Button" — text content.
* accentColor: string = "#9b41ff" — primary nebula/border color.
* starDensity: "low" | "medium" | "high" — visual complexity of star field.

---

## Performance

* Pure CSS @keyframes for all space animations (stars, nebula, border).
* Isolation: isolate to prevent mix-blend-mode conflicts.
* GPU-optimized conic-gradient rotation via CSS variables.`,


    'liquid-fill-button': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: LiquidFillButton
Type: Physics-inspired Filling Button

---

## Tech Stack

* React
* TypeScript
* Framer Motion (for height and wave oscillation)
* Tailwind CSS
* clsx
* tailwind-merge (cn utility)

---

## Requirements

* Fill-up animation on hover: liquid rises from 0% to 100% height.
* Sinuous wave effect at the liquid surface using a duplicated SVG path.
* Double-wave layering with staggered animation times for organic fluid motion.
* Text color inverse: label changes from primary to white as the liquid passes over it.
* Spring-based return: liquid "falls back" and settles when the mouse departs.
* Gradient color scheme from base to accent.

---

## Props

* label: string = "Fill Button" — label text.
* fillColor: string = "#3b82f6" — color of the rising liquid.
* liquidSpeed: number = 0.6 — transition duration for filling.

---

## Performance

* SVG path optimization for smooth sin/cos wave calculation.
* Framer Motion layout-level height transitions.
* Will-change: transform on the wave layer to prevent repaints.`,




    // --- TEXT ANIMATIONS ---
    'letter-pull-up': `Create a "Letter Pull Up" animation using React, TypeScript, and Framer Motion.

COMPONENT NAME: LetterPullUpText

PROPS (with defaults):
- text: string — the text to animate
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. Each character pulls up from below (translateY: 30px to 0).
2. Characters appear with staggered timing.
3. Initial: opacity 0, y: 30. Final: opacity 1, y: 0.

TECHNICAL IMPLEMENTATION:
1. Use Framer Motion variants with staggerChildren: 0.05.
2. Each character: motion.span, display: inline-block.
3. Transition: type: 'spring', stiffness: 100.

CRITICAL RULES:
- Preserve spaces between words.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'scale-letter': `Create a "Scale Letter" animation using React, TypeScript, and Framer Motion.

COMPONENT NAME: ScaleLetterText

PROPS (with defaults):
- text: string — the text to animate
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. Each letter scales from 0 to 1 with staggered timing.
2. The scaling should have a spring bounce effect.

TECHNICAL IMPLEMENTATION:
1. Split text into characters.
2. Each: motion.span, display: inline-block.
3. Initial: { scale: 0, opacity: 0 }. Animate: { scale: 1, opacity: 1 }.
4. StaggerChildren: 0.04. Transition: type 'spring', stiffness 200, damping 15.

CRITICAL RULES:
- Preserve whitespace characters.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'separate-away': `Create a "Separate Away" text animation using React, TypeScript, and Framer Motion.

COMPONENT NAME: SeparateAwayText

PROPS (with defaults):
- text: string — the text to animate
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. Text starts normally assembled.
2. On mount or trigger: Each character drifts away from center in a random direction (x: -50 to 50, y: -50 to 50) and fades out.
3. Then reverses: characters pull back together to form the word.

TECHNICAL IMPLEMENTATION:
1. Split text into characters.
2. Generate random offsets for each character.
3. Use Framer Motion variants to animate from scattered to assembled.
4. Transition: spring physics, repeat: Infinity, repeatType: 'reverse'.

CRITICAL RULES:
- Random offsets should be generated once on mount (useRef).
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'wavy-text': `Create a "Wavy Text" animation using React, TypeScript, and Framer Motion.

COMPONENT NAME: WavyText

PROPS (with defaults):
- text: string — the text to animate
- className: string = '' — additional CSS classes
- amplitude: number = 10 — max vertical displacement in px
- speed: number = 2 — wave speed

VISUAL REQUIREMENTS:
1. Each character oscillates up and down continuously in a sine wave pattern.
2. Adjacent characters are offset in phase, creating a flowing wave.

TECHNICAL IMPLEMENTATION:
1. Split text into characters.
2. Each character: motion.span with animate={{ y: [-amplitude, amplitude] }}.
3. Use delay: index * 0.1 to offset each character's phase.
4. Transition: { duration: speed, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }.

CRITICAL RULES:
- The wave must be continuous and smooth.
- Use repeatType: 'reverse' for seamless oscillation.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'word-pull-up': `Create a "Word Pull Up" animation using React, TypeScript, and Framer Motion.

COMPONENT NAME: WordPullUpText

PROPS (with defaults):
- text: string — the sentence to animate
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. Each WORD (not letter) pulls up from below with a stagger.
2. Words animate from { y: 40, opacity: 0 } to { y: 0, opacity: 1 }.

TECHNICAL IMPLEMENTATION:
1. Split text by spaces into words.
2. Each word: motion.span, display: inline-block, with variants.
3. Container: staggerChildren: 0.15.
4. Word transition: type 'spring', stiffness: 100.

CRITICAL RULES:
- Split by WORDS not characters.
- Add margin-right between words for spacing.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    // --- VISUAL EFFECTS ---
    'noise': `Create a "Noise Background" overlay component using React, TypeScript, and Canvas.

COMPONENT NAME: NoiseBackground

PROPS (with defaults):
- opacity: number = 0.04 — opacity of the noise texture
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. A full-screen overlay with a subtle film-grain/noise texture.
2. The noise should jitter slightly every few frames for an analog feel.
3. Opacity must be very low (0.03-0.05) to avoid distraction.

TECHNICAL IMPLEMENTATION:
1. Use Canvas to generate random pixel noise.
2. Create ImageData with random grayscale values for each pixel.
3. Update the noise pattern every ~100ms (10fps) for the jitter effect.
4. Apply the canvas as a fixed overlay with pointer-events: none.

CRITICAL RULES:
- Canvas must be fullscreen, fixed position, pointer-events: none.
- Performance: Update at 10fps max, not 60fps.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'liquid-glass': `Create a "Liquid Glass" (Glassmorphism) card component using React, TypeScript, and Tailwind CSS.

COMPONENT NAME: LiquidGlass

PROPS (with defaults):
- children: React.ReactNode — card content
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. A frosted-glass card with backdrop-filter: blur(20px).
2. Behind the card: 2-3 animated colorful blobs (gradients) that drift slowly.
3. The card has a semi-transparent white border (border: 1px solid rgba(255,255,255,0.2)).
4. On hover: Card tilts slightly (3D perspective transform).

TECHNICAL IMPLEMENTATION:
1. Blobs: absolute-positioned divs with radial-gradient backgrounds and CSS animation (translate + rotate, ~20s cycle).
2. Card: relative div with backdrop-filter: blur(20px) and bg-white/10.
3. Hover tilt: onMouseMove calculate rotateX and rotateY from mouse position, apply via style.transform.
4. Use perspective(1000px) on the parent container.

CRITICAL RULES:
- backdrop-filter must be applied for the frosted effect.
- Blobs must be behind the card (lower z-index).
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'blur-vignette': `Create a "Blur Vignette" wrapper component using React, TypeScript, and CSS.

COMPONENT NAME: BlurVignette

PROPS (with defaults):
- children: React.ReactNode — the content to wrap
- className: string = '' — additional CSS classes
- radius: string = '24px' — border-radius of the container
- inset: string = '0px' — inset distance for the shadow
- transitionLength: string = '40px' — width of the blur transition zone
- blur: string = '10px' — amount of blur

VISUAL REQUIREMENTS:
1. Content is displayed normally in the center.
2. The edges of the container have a progressively increasing blur and darkening (vignette effect).
3. The transition from sharp to blurred should be smooth and configurable.

TECHNICAL IMPLEMENTATION:
1. Use CSS mask-image with radial-gradient: center is transparent (sharp), edges are black (blurred).
2. Apply an overlay div with:
   - boxShadow: inset 0 0 blur inset rgba(0,0,0,0.5)
   - backdropFilter: blur(blur)
   - maskImage: radial-gradient(circle, transparent calc(100% - transitionLength), black 100%)
3. The overlay is absolute-positioned, pointer-events: none.

CRITICAL RULES:
- Use both maskImage and WebkitMaskImage for cross-browser compat.
- Children content must NOT be affected by the blur.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'liquid-gradient': `Create a "Liquid Gradient" background using React, TypeScript, and CSS animations.

COMPONENT NAME: LiquidGradient

PROPS (with defaults):
- colors: string[] = ['#4f46e5', '#7c3aed', '#2563eb', '#db2777'] — gradient colors
- speed: number = 15 — animation duration in seconds
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. A full-container background with a smoothly morphing, flowing gradient.
2. Multiple radial gradients that drift, scale, and blend together.
3. The overall effect should look like liquid colors flowing into each other.

TECHNICAL IMPLEMENTATION:
1. Create 3-4 absolute divs, each with a large radial-gradient using one of the colors.
2. Each div has a CSS @keyframes animation with different:
   - translate paths (circular or figure-8)
   - scale variations (0.8 to 1.2)
   - Duration offsets (15s, 20s, 25s) for asynchronous movement
3. Apply mix-blend-mode: screen or overlay for blending.
4. Add a slight blur filter on the container for smoothness.

CRITICAL RULES:
- Use pure CSS animations for performance.
- Each blob must have a different animation timing to avoid synchronized movement.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'spotlight-cards': `Create a "Spotlight Cards" component using React, TypeScript, Tailwind CSS, and mouse tracking.

COMPONENT NAME: SpotlightCards

PROPS (with defaults):
- children: React.ReactNode — card content
- className: string = '' — additional CSS classes
- spotlightColor: string = 'rgba(255,255,255,0.1)' — color of the spotlight

VISUAL REQUIREMENTS:
1. A dark card where a radial gradient "spotlight" follows the mouse cursor.
2. The spotlight reveals a subtle texture or brightens the area near the mouse.
3. When the mouse leaves, the spotlight fades smoothly.

TECHNICAL IMPLEMENTATION:
1. Track mouse position with onMouseMove on the card.
2. Apply a radial-gradient background at the mouse coordinates: radial-gradient(circle at X Y, spotlightColor, transparent 80%).
3. Use onMouseLeave to fade the spotlight opacity to 0.
4. The gradient update should use state + inline style.

CRITICAL RULES:
- The spotlight must follow the mouse in real-time.
- Use pointer-events properly so child elements remain interactive.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'image-reveal': `Create an "Image Reveal" hover effect using React, TypeScript, and CSS.

COMPONENT NAME: ImageReveal

PROPS (with defaults):
- imageSrc: string — URL of the image
- className: string = '' — additional CSS classes
- revealSize: number = 200 — radius of the reveal circle in px

VISUAL REQUIREMENTS:
1. Default: Image is displayed in grayscale.
2. On hover: A circular area around the mouse reveals the full-color image.
3. The circle follows the mouse cursor within the image container.
4. On mouse leave, the reveal circle fades out.

TECHNICAL IMPLEMENTATION:
1. Two layers of the same image stacked: bottom (grayscale), top (color).
2. The color layer has clip-path: circle(revealSize at mouseX mouseY).
3. Track mouse position with onMouseMove.
4. Use CSS filter: grayscale(100%) on the bottom layer.
5. On mouseLeave, animate the circle size to 0.

CRITICAL RULES:
- Use clip-path (not mask-image) for the circular reveal.
- Both images must be identical and perfectly aligned.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'blocks': `Create a "Blocks" animated grid component using React, TypeScript, and Tailwind CSS.

COMPONENT NAME: BackgroundBoxes

PROPS (with defaults):
- className: string = '' — additional CSS classes
- rowsCount: number = 30 — number of grid rows
- colsCount: number = 30 — number of grid columns
- customColors: string[] — array of possible highlight colors

VISUAL REQUIREMENTS:
1. A grid of small square cells covering the entire container.
2. Each cell has a subtle border creating a grid pattern.
3. On hover over a cell, it lights up with a random color from customColors.
4. A radial gradient mask fades the edges to transparent.

TECHNICAL IMPLEMENTATION:
1. Render a CSS Grid or flex-wrap of colsCount * rowsCount div cells.
2. Each cell: ~30px square, border: 1px solid rgba(255,255,255,0.05).
3. On mouseEnter on a cell: Set its background to a random color from customColors.
4. On mouseLeave: Fade the background back to transparent over 500ms.
5. Container mask: radial-gradient(transparent, white) to fade edges.

CRITICAL RULES:
- Optimize rendering: Use React.memo or event delegation for grid cells.
- The grid must be overlaid as a background layer (pointer-events: none on the mask, but cells need pointer-events for hover).
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'animated-beam': `Create an "Animated Beam" component using React, TypeScript, Tailwind CSS, and Framer Motion.

COMPONENT NAME: AnimatedBeam

PROPS (with defaults):
- fromRef: React.RefObject — ref to the starting element
- toRef: React.RefObject — ref to the ending element
- containerRef: React.RefObject — ref to the container for coordinate calculation
- color: string = '#3b82f6' — beam color
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. A glowing line/beam connecting two DOM elements.
2. The beam should be a curved SVG path (quadratic or cubic bezier).
3. A gradient pulse should travel along the beam continuously (dash-offset animation).
4. The beam should have an outer glow effect.

TECHNICAL IMPLEMENTATION:
1. Calculate start and end coordinates using getBoundingClientRect() of fromRef and toRef relative to containerRef.
2. Draw an SVG path: M startX,startY Q controlX,controlY endX,endY.
3. The control point should be at the midpoint X, offset Y for a nice curve.
4. Animate stroke-dashoffset from 0 to pathLength using Framer Motion.
5. Apply filter: drop-shadow for the glow effect.
6. Use ResizeObserver to recalculate on layout changes.

CRITICAL RULES:
- The beam MUST be SVG-based for smooth curves.
- Use requestAnimationFrame or Framer Motion for the pulse animation.
- Recalculate positions on window resize.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'target-cursor': `Create a premium "Target Cursor" component using React, TypeScript, and CSS.

COMPONENT NAME: TargetCursor

PROPS (with defaults):
- color: string = '#22d3ee' — primary color of the cursor frame
- size: number = 32 — size of the cursor frame in px
- sensitivity: number = 0.15 — how quickly the cursor follows the mouse (0-1)
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. Replace the default cursor with a custom square frame design.
2. The frame has 4 corner brackets (L-shaped borders at each corner).
3. Idle: The corners rotate slowly (spinning animation, 8s per revolution).
4. On hover over interactive elements (button, a, [data-target]): The cursor snaps to surround the element, expanding to match its dimensions with a slight parallax lag.
5. On click: The cursor scales up briefly (1.2x) then snaps back.
6. A small centered dot (2px) in the middle of the frame.

TECHNICAL IMPLEMENTATION:
1. Use requestAnimationFrame for 60fps cursor position smoothing.
2. Track mouse position with window.addEventListener('mousemove').
3. Smooth cursor position: current += (target - current) * sensitivity.
4. Snap detection: On mouseenter on interactive elements, read getBoundingClientRect() and animate cursor to match the element's position and size.
5. The cursor div is fixed position, z-index: 99999, pointer-events: none.
6. Hide default cursor: document.body.style.cursor = 'none'.
7. Corner brackets are absolute-positioned divs with 2-sided borders.

JSX STRUCTURE:
- Portal or root-level div: fixed, pointer-events-none, z-99999
  - Outer frame div: transform translate to mouse position
    - 4x corner bracket divs: absolute positioned at corners
    - Center dot div: absolute, centered

CRITICAL RULES:
- Use requestAnimationFrame, NOT mousemove for position updates.
- Restore default cursor on unmount (document.body.style.cursor = '').
- Remove all event listeners on unmount.
- The cursor must work above all other content (z-index: 99999).
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'black-hole-cursor': `Create a premium "Black Hole Cursor" component using React, TypeScript, and HTML5 Canvas.

COMPONENT NAME: BlackHoleCursor

PROPS (with defaults):
- particleCount: number = 120 — number of orbiting particles
- coreSize: number = 12 — radius of the black hole core in px
- pullStrength: number = 0.5 — gravitational pull intensity
- coreColor: string = '#000' — color of the singularity core
- glowColor: string = '#6366f1' — color of the accretion disk glow
- particleColor: string = '#a78bfa' — color of the orbiting particles
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. A dark core (singularity) that follows the mouse.
2. Multiple layered glow rings around the core simulating an accretion disk.
3. 120+ particles orbit the core, spiraling inward with gravitational acceleration.
4. Particles should leave short trailing paths (motion blur).
5. On click: Particles implode rapidly into the core, then explode outward.
6. The effect should feel dark, ominous, and gravitational.

TECHNICAL IMPLEMENTATION:
1. Use a fullscreen Canvas with pointer-events: none.
2. Track mouse position, smooth with lerp.
3. Particle physics:
   - Each particle: { x, y, angle, distance, speed, size, opacity }.
   - Each frame: particle.angle += particle.speed; particle.distance *= 0.998 (slow spiral in).
   - When distance < coreSize: respawn at a random distance (200-400px).
   - Position: x = mouse.x + cos(angle) * distance, y = mouse.y + sin(angle) * distance.
4. Core rendering: Multiple concentric radial gradients (dark center, colored glow rings).
5. Trail effect: Don't clearRect fully — use fillRect with rgba(0,0,0,0.1) for fade trail.
6. Click effect: Set all particle distances to 0 (implode), then randomize (explode).
7. Device pixel ratio scaling for sharp rendering.

CRITICAL RULES:
- Use Canvas API directly, no external libraries.
- Use requestAnimationFrame for the animation loop.
- Clean up canvas, animation frame, and event listeners on unmount.
- Canvas must be fullscreen and resize with window.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'magnetic-cursor': `Create a premium "Magnetic Cursor" component using React, TypeScript, and requestAnimationFrame.

COMPONENT NAME: MagneticCursor

PROPS (with defaults):
- dotSize: number = 6 — size of the inner cursor dot in px
- haloSize: number = 40 — size of the outer halo circle in px
- dotColor: string = '#fff' — color of the inner dot
- haloColor: string = 'rgba(255,255,255,0.2)' — color of the halo ring
- magneticRange: number = 100 — range in px for magnetic pull effect
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. Two-layer cursor: a small solid dot (6px) and a larger hollow circle (40px, 1px border).
2. The dot follows the mouse tightly (high stiffness spring).
3. The halo follows with visible lag (low stiffness, high damping spring).
4. Elements with data-magnetic attribute: When cursor is within magneticRange, the element and halo are pulled toward each other. The element shifts slightly toward the cursor.
5. On hover over interactive elements: Halo scales up 1.5x and adds backdrop-blur.

TECHNICAL IMPLEMENTATION:
1. Two DOM elements (dot div, halo div), both fixed position, pointer-events: none.
2. Spring physics for movement:
   - Dot: stiffness 0.2, damping 0.8
   - Halo: stiffness 0.08, damping 0.85
3. requestAnimationFrame loop updating both positions with spring formula:
   velocity += (target - current) * stiffness; velocity *= damping; current += velocity;
4. Magnetic pull: querySelectorAll('[data-magnetic]'), on each frame check distance from mouse to each element center. If within range, apply transform translate to the element.
5. Register/unregister magnetic elements via MutationObserver or a global function.
6. Hide default cursor.

CRITICAL RULES:
- Use requestAnimationFrame for all position updates.
- Spring physics must feel smooth and natural.
- Clean up ALL transforms on magnetic elements on unmount.
- Restore default cursor on unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'aurora-cursor': `Create a premium "Aurora Cursor" component using React, TypeScript, and CSS.

COMPONENT NAME: AuroraCursor

PROPS (with defaults):
- size: number = 150 — size of the aurora blob in px
- colors: string[] = ['#06b6d4', '#8b5cf6', '#ec4899'] — aurora gradient colors
- blur: number = 40 — blur amount in px
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. A large (150px), soft, morphing blob of light that follows the mouse.
2. The blob has a shifting gradient background cycling through the aurora colors.
3. CSS animations for: background color shift (8s), border-radius morphing (20s), and opacity pulsing (4s).
4. Heavy blur filter (40px) creating a diffused glow effect.
5. On hover over interactive elements: Blob scales down to 50px and changes to a solid warm color (orange).
6. An inner blob (smaller, brighter) appears on hover.

TECHNICAL IMPLEMENTATION:
1. Single div element, fixed position, pointer-events: none.
2. Position: smooth follow with spring physics (stiffness: 0.1, damping: 0.9).
3. CSS animations (infinite, running simultaneously):
   - @keyframes auroraShift: background-position shifts through gradient stops.
   - @keyframes auroraMorph: border-radius alternates between organic blob shapes (e.g., 60% 40% 70% 30% / 50% 50% 60% 40%).
   - @keyframes auroraPulse: opacity: 0.6 to 0.9 oscillation.
4. Transition: transform scale and background-color on hover state change.
5. Use mix-blend-mode: screen for integration with page content.

CRITICAL RULES:
- Use CSS animations for the morphing effects (NOT JavaScript).
- Use JavaScript only for position tracking.
- The blur filter must be on the blob element, not backdrop-filter.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'heart-cursor': `Create a premium "Heart Cursor" component using React, TypeScript, SVG, and Canvas.

COMPONENT NAME: HeartCursor

PROPS (with defaults):
- color: string = '#ff4d6a' — heart color
- size: number = 24 — heart size in px
- rippleColor: string = 'rgba(255,77,106,0.3)' — color of expanding ripples
- trailInterval: number = 100 — ms between ripple spawns
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. The cursor is an SVG heart shape that follows the mouse with a subtle pulse animation.
2. As the cursor moves, it leaves expanding circular ripples on a transparent canvas that fade out over 1 second.
3. On click: Burst of 5 mini hearts that fly outward in random directions and fade.
4. On hover over interactive elements: Heart scales up 1.5x.

TECHNICAL IMPLEMENTATION:
1. Heart cursor: Fixed-position SVG element following mouse with spring physics.
2. Ripple canvas: Fullscreen transparent canvas behind the heart.
3. Ripple system:
   - Every trailInterval ms, push a new ripple: { x, y, radius: 0, opacity: 1 }.
   - Each frame: ripple.radius += 2; ripple.opacity -= 0.02.
   - Draw: ctx.arc(x, y, radius, 0, PI*2), strokeStyle = rippleColor with current opacity.
   - Remove ripple when opacity <= 0.
4. Click burst: Generate 5 mini hearts with random velocity vectors, animate outward with gravity and fade.
5. Pulse animation: CSS animation scale(1) to scale(1.2) on the SVG, 1s infinite.
6. SVG heart path: M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z

CRITICAL RULES:
- SVG for the heart shape, Canvas for the ripples — hybrid approach.
- requestAnimationFrame for ripple animation loop.
- Clean up all listeners and animation frames on unmount.
- Hide default cursor.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'lizard-cursor': `Create a premium "Lizard Cursor" (IK Creature) component using React, TypeScript, and Canvas.

COMPONENT NAME: LizardCursor

PROPS (with defaults):
- segmentCount: number = 25 — number of body segments
- color: string = '#22c55e' — primary color of the creature
- legCount: number = 4 — number of leg pairs
- size: number = 4 — base segment size multiplier
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. A segmented creature (lizard/centipede) that follows the mouse cursor using Inverse Kinematics.
2. The "head" tracks the mouse, and each following segment trails behind maintaining a fixed distance.
3. The body tapers from head (larger) to tail (smaller).
4. Legs extend from specific segments and "step" periodically as the creature moves.
5. On click/mousedown: The creature performs a "strike" — a quick lunge toward the mouse position.
6. Eyes on the head segment that look toward the mouse.

TECHNICAL IMPLEMENTATION:
1. Segment class: { x, y, angle, size }. Each segment follows the previous one using IK:
   - angle = atan2(parent.y - this.y, parent.x - this.x)
   - position = parent.position - (segmentLength * cos/sin(angle))
2. LegSystem class: Pairs of legs at segment indices [3, 7, 11, 15].
   - Each leg has a "foot" that plants on the ground and lifts to step when the body moves too far.
   - Use cubic-bezier interpolation for foot movement arcs.
3. Head follows mouse with easing: head.x += (mouse.x - head.x) * 0.3.
4. Drawing: Fill circles for body segments, lines for legs with stroke.
5. Strike: On mousedown, temporarily increase head easing to 0.8 (fast lunge).
6. Eyes: Two small white circles on the head with smaller dark pupils offset toward mouse direction.

CRITICAL RULES:
- Use Canvas API for all rendering.
- Implement proper Inverse Kinematics chain (each segment constrains to the previous).
- requestAnimationFrame for animation loop.
- Clean up everything on unmount.
- The creature movement must feel organic and alive.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'venom-cursor': `Create a premium "Venom Cursor" (Tentacles) component using React, TypeScript, and Canvas.

COMPONENT NAME: VenomCursor

PROPS (with defaults):
- tentacleCount: number = 8 — number of tentacles
- color: string = '#1a1a2e' — primary tentacle color
- length: number = 200 — max tentacle length in px
- speed: number = 0.1 — movement speed factor
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. Multiple dark, writhing tentacles that follow the mouse cursor.
2. Each tentacle is a smooth bezier curve with organic wriggling motion.
3. Tentacles should have tapered tips (thick at base, thin at tip).
4. Use Perlin Noise or layered Sine waves for organic wriggling.
5. The tentacles originate from or trail behind the cursor position.
6. Dark, menacing aesthetic — solid black or deep purple tones.

TECHNICAL IMPLEMENTATION:
1. Implement a simple 1D Perlin Noise function (or use layered sin/cos with different frequencies).
2. Each tentacle: Array of 15-20 joint points.
3. Joint physics: Each joint follows the previous using IK with added noise offset:
   - offset = noise(jointIndex * 0.3 + time * speed) * amplitude
   - Apply offset perpendicular to the joint direction.
4. The first joint of each tentacle attaches to the cursor position at different angles: (i / tentacleCount) * 2π.
5. Drawing: Use ctx.beginPath(), ctx.moveTo(), then ctx.quadraticCurveTo() for each joint pair.
6. Line width: Taper from 4px (base) to 0.5px (tip).
7. Color: Gradient from solid color at base to transparent at tip.

CRITICAL RULES:
- Implement noise function inline (do NOT import a noise library).
- Use Canvas API for all rendering.
- requestAnimationFrame for animation loop.
- Canvas must be fullscreen, pointer-events: none.
- Clean up on unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    '3d-tubes-cursor': `Create a premium "3D Tubes Cursor" component using React, TypeScript, and Three.js.

COMPONENT NAME: ThreeDTubesCursor

PROPS (with defaults):
- tubeColor1: string = '#00ffff' — first tube color (cyan)
- tubeColor2: string = '#ff00ff' — second tube color (magenta)
- lightColor: string = '#ffffff' — point light color
- lightIntensity: number = 1.5 — point light intensity
- className: string = '' — additional CSS classes

VISUAL REQUIREMENTS:
1. A 3D scene where neon-glowing tubes form a trailing path behind the mouse cursor.
2. The tubes should exist in 3D space with depth perspective.
3. Colors should be vibrant neon (cyan + magenta).
4. A point light follows the cursor, illuminating the tubes dynamically.
5. The cubes/tubes should morph and flow towards the cursor position.
6. Smooth spring-based follow physics for the cursor interaction.
7. Glow essence: Emissive materials with bloom-like quality.
8. Dark background (#050508) that makes the neon pop.

TECHNICAL IMPLEMENTATION:
1. Same dynamic script loading for Three.js as other 3D components.
2. BufferGeometry: Create paths using CatmullRomCurve3.
3. TubeGeometry: Generate tube mesh around the dynamic paths.
4. ShaderMaterial or MeshStandardMaterial with high emittance (emissiveIntensity: 2).
5. Mouse tracking: Convert screen coordinates to normalized device coordinates (NDC).
6. Math: Use simplex noise to animate the curves' anchor points over time.
7. PointLight: Position at the latest mouse position, follows cursor.
8. Animation loop: Update curve points, regenerate tube geometry each frame.
9. Render as a background layer with pointer-events: none.

CRITICAL RULES:
- Load Three.js dynamically from CDN, do NOT require npm installation.
- Handle the case where the script fails to load.
- Canvas must resize with the window.
- Clean up Three.js scene, renderer, and event listeners on unmount.
- The visual must be behind page content (z-index: -1 or pointer-events: none).
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'grid-background': `Create a premium "Grid Background" (CSS Pattern) component using React, TypeScript, and Tailwind CSS.

COMPONENT NAME: GridBackground

PROPS (with defaults):
- opacity: number = 0.6 — grid visibility.
- gridColor: string = 'rgba(255, 255, 255, 0.05)' — line color.
- maskRadius: number = 30 — size of the radial clear zone.

VISUAL REQUIREMENTS:
1. Infinite grid created using CSS linear-gradient background images.
2. A smooth radial mask that fades the grid into the background at the edges.
3. Subtle animation or parallax effect (optional).
4. Deep dark theme (#000) with thin, high-contrast lines.

TECHNICAL IMPLEMENTATION:
1. Use background-image: linear-gradient for the grid lines.
2. Apply a radial-gradient mask using -webkit-mask-image or mask-image.
3. Handle responsive sizing to ensure the pattern covers the full container.

CRITICAL RULES:
- Use Tailwind CSS for styling where possible.
- Ensure the mask is smooth and covers the edges.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'hacker-background': `Create a premium "Hacker Background" (Matrix Rain) component using React, TypeScript, and Canvas.

COMPONENT NAME: HackerBackground

PROPS (with defaults):
- color: string = '#0F0' — the character glow color.
- fontSize: number = 15 — size of the font in px.
- speed: number = 1 — falling speed multiplier.
- className: string = '' — additional classes for the container.

VISUAL REQUIREMENTS:
1. Classic "Matrix Rain" effect with vertical falling characters.
2. Responsive Canvas: Automatically resizes to fill the container/parent width and height.
3. Customizable Characters: Use a broad set of alphanumeric and symbolic characters.
4. Vertical Drops: Maintain an array of drop positions, one per column.
5. Trailing Effect: Implement a trailing trail effect by filling the canvas with a low-opacity black rectangle on each frame (rgba(0, 0, 0, 0.05)).

TECHNICAL IMPLEMENTATION:
1. Use HTML5 Canvas API for all rendering.
2. Maintain an array of 'drops' representing the current Y-position for each character column.
3. Use requestAnimationFrame for a smooth 60fps experience.
4. Efficient cleanup: Cancel the animation frame on unmount.
5. Minimal re-renders: Use useRef for the canvas and animation state.
6. Optimized Drawing: Single ctx.fill() call for the background and batch ctx.fillText for characters.

CRITICAL RULES:
- Use Canvas API directly.
- Ensure the animation is responsive and fills the parent container.
- Clean up all resources on component unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'novatrix-background': `Create a premium "Novatrix Background" (Atmospheric Gradient) component using React, TypeScript, and Framer Motion.

COMPONENT NAME: NovatrixBackground

PROPS (with defaults):
- title: string = 'NOVATRIX' — center text.
- colorFrom: string = '#1e1b4b' — start color.
- colorTo: string = '#581c87' — end color.
- opacity: number = 1 — overall transparency.

VISUAL REQUIREMENTS:
1. Layered radial gradients that pulse and rotate slowly to simulate a nebula effect.
2. Centered glowing title text with premium typography (Inter/Roboto).
3. Smooth transition between multiple atmospheric colors.
4. Organic rotation effect for the gradient layers.

TECHNICAL IMPLEMENTATION:
1. Use Framer Motion for slow, organic rotation and scale pulsing.
2. Multiple overlapping <div> elements with radial-gradient backgrounds.
3. Apply a heavy blur filter to the gradient containers.
4. Center the title text with a subtle glow (text-shadow).

CRITICAL RULES:
- Use Framer Motion for animations.
- Ensure colors are vibrant but atmospheric.
- Clean up all animations on unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'beam-grid-background': `Create a premium "Beam Grid Background" (Interactive Canvas) component using React, TypeScript, and Canvas.

COMPONENT NAME: BeamGridBackground

PROPS (with defaults):
- gridSize: number = 40 — size of grid cells.
- gridColor: string = '#27272a' — base grid line color.
- beamColor: string = 'rgba(0, 180, 255, 0.8)' — color of the moving beams.
- beamSpeed: number = 0.1 — base speed of beams.
- beamThickness: number = 3 — width of the beams.
- beamCount: number = 8 — number of active beams.
- interactive: boolean = true — enable mouse interaction.
- asBackground: boolean = true — absolute positioning to fill parent.

VISUAL REQUIREMENTS:
1. Render a grid of lines with customizable size and color.
2. "Beams" of light that travel along the grid lines in X and Y directions.
3. Reactive grid cells that "glow" or light up when the mouse hovers over them.
4. Handled devicePixelRatio for crisp rendering on Retina screens.
5. Radial Fade: An optional radial gradient mask to fade the edges of the grid into the background.

TECHNICAL IMPLEMENTATION:
1. Pre-render the static grid to an off-screen canvas to avoid redrawing it every frame.
2. Maintain a list of active 'beams' with positions and velocities.
3. Use requestAnimationFrame for the animation loop.
4. Detect mouse position to trigger cell highlights.
5. In idle mode (no mouse move for 2s), accelerate the beam speed.

CRITICAL RULES:
- Use Canvas API directly.
- Implement high-DPI support (devicePixelRatio).
- Dispose all resources and stop loops on unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'fall-beam-background': `Create a premium "Fall Beam Background" (CSS/DOM Animation) component using React, TypeScript, and Tailwind CSS.

COMPONENT NAME: FallBeamBackground

PROPS (with defaults):
- lineCount: number = 20 — density of falling lines.
- beamColor: string = 'cyan-400' — Tailwind-aware or hex color for the beams.
- opacity: number = 1 — overall opacity of the effect.
- displayText: string = '' — optional text to overlay.

VISUAL REQUIREMENTS:
1. Vertical lines that "fall" from the top to the bottom of the screen.
2. Soft, ethereal glow using CSS linear gradients and box-shadows.
3. Randomized animation durations and delays for a natural, asynchronous look.
4. Support for centered display text with a bottom-fading gradient.

TECHNICAL IMPLEMENTATION:
1. Dynamically inject beam <div> elements into the DOM.
2. Use CSS keyframe animations (@keyframes fall) for the movement.
3. Apply linear-gradient(to bottom, transparent, currentColor) for the beam visual.
4. Use absolute positioning within a relative/fixed container.

CRITICAL RULES:
- Use CSS transitions/animations for performance.
- Clean up all dynamically created DOM elements on unmount.
- Ensure the text overlay is legible against the background.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'interactive-grid-background': `Create a premium "Interactive Grid Background" (Interactive Canvas) component using React, TypeScript, and Canvas.

COMPONENT NAME: InteractiveGridBackground

PROPS (with defaults):
- gridSize: number = 50 — size of grid cells.
- gridColor: string = 'rgba(255, 255, 255, 0.05)' — base grid color.
- effectColor: string = 'rgba(0, 255, 0, 0.5)' — color of the interaction trail.
- trailLength: number = 3 — number of cells in the trail.
- glowRadius: number = 35 — intensity of the cell glow.
- idleSpeed: number = 0.2 — speed of random cell shifts in idle mode.

VISUAL REQUIREMENTS:
1. Highlight grid cells where the mouse cursor resides.
2. A trail of fading illuminated cells follows the mouse path.
3. Idle Random Motion: Random cells should pulsate or move when the mouse is inactive.
4. Smooth mask to fade the grid edges into a radial gradient.

TECHNICAL IMPLEMENTATION:
1. Use HTML5 Canvas for drawing both the grid and the interaction layer.
2. Track recent mouse positions in an array to manage the trail effect.
3. Implement an 'idle' state that triggers random pulses in the grid.
4. Handle window resize by adjusting the canvas width and height.

CRITICAL RULES:
- Use requestAnimationFrame for rendering.
- Ensure cell tracking is efficient and doesn't leak memory.
- Properly dispose of the animation frame and listeners on unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,


    'wave-background': `Create a premium "Wave Background" (WebGL Shader) component using React, TypeScript, and raw WebGL.

COMPONENT NAME: WaveBackground

PROPS (with defaults):
- speed: number = 0.5 — frequency of wave shifts.
- intensity: number = 1.0 — amplitude of the distortion.
- backdropBlurAmount: string = 'sm' — Tailwind blur intensity.

VISUAL REQUIREMENTS:
1. Fluid "Liquid" Motion: Organic fluid motion created using sinusoidal wave summation in a fragment shader.
2. Integrated backdrop-blur overlay to soften the shader output.
3. Cool spectrum color palette shifting between blues and indigos.
4. Responsive full-screen rendering.

TECHNICAL IMPLEMENTATION:
1. Implement a pure WebGL shader program without external libraries (like Three.js).
2. Use a fragment shader with precision highp float for quality.
3. Logic: Accumulate time uniforms to drive the wave equations.
4. Intersection Observer: Pause the animation when the component is not visible.
5. Resource Management: Clear gl context, buffers, and shaders on unmount.

CRITICAL RULES:
- Use raw WebGL for maximum performance.
- Ensure smooth 60fps animation.
- Clean up all WebGL resources on unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'lines-background': `Create a premium "Lines Background" (Animated SVG Paths) component using React, TypeScript, and Framer Motion.

COMPONENT NAME: BackgroundPaths

PROPS (with defaults):
- title: string = 'UI HUB' — center text content.
- pathColor: string = 'currentColor' — stroke color for the paths.
- opacity: number = 1 — overall opacity of the effect.

VISUAL REQUIREMENTS:
1. Animated SVG Paths: Multiple overlapping bezier curves that shift and morph over time.
2. Path length and offset animations (drawing effect).
3. Layered Depth: Two distinct layers of paths with slight offsets (foreground and background).
4. Center Title: Center-aligned title with letter-by-letter spring animations.

TECHNICAL IMPLEMENTATION:
1. Use SVGs with predefined bezier paths.
2. Animate the paths using Framer Motion's variants and the 'animate' prop.
3. Implement the title animation using staggered children in Framer Motion.
4. Apply linear-gradients to the paths for a more premium look.

CRITICAL RULES:
- Use Framer Motion for high-performance SVG animations.
- Ensure paths are responsive and scale correctly.
- Clean up animations on unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'sparkles-background': `Create a premium "Sparkles Background" component using React, TypeScript, and @tsparticles.

COMPONENT NAME: SparklesCore

PROPS (with defaults):
- minSize: number = 1 — minimum sparkle size.
- maxSize: number = 3 — maximum sparkle size.
- speed: number = 4 — twinkling speed.
- particleColor: string = '#ffffff' — particle color.
- particleDensity: number = 120 — amount of sparkles.

VISUAL REQUIREMENTS:
1. A system of twinkling and drifting particles resembling a night sky.
2. Interactivity: Click to "push" new particles into the scene.
3. Smooth Fade-In effect when the component mounts.
4. Customizable density and sizes.

TECHNICAL IMPLEMENTATION:
1. Use @tsparticles/react and @tsparticles/slim for the core engine.
2. Configure the particle emitter with twinkles, movement, and interaction rules.
3. Use Framer Motion to handle the container's entry/exit animations.

CRITICAL RULES:
- Use @tsparticles/slim for limited bundle impact.
- Ensure the animation remains background-focused (zIndex -1).
- Properly dispose of the particle container on unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'isometric-grid-background': `Create a premium "Isometric Grid Background" (3D Box Grid) component using React, TypeScript, and Framer Motion.

COMPONENT NAME: IsometricGridBackground

PROPS (with defaults):
- title: string = '' — optional center title.
- boxProps: object — configuration for rows, cols, and colors.

VISUAL REQUIREMENTS:
1. A grid of 3D-looking isometric boxes that shift and react to mouse movement.
2. Radial Masking: Central transparency gradient that fades the grid edges.
3. Interactive Highlighting: Boxes change color or scale slightly on hover.
4. Clean, brutalist-tech aesthetic with deep slate/black colors.

TECHNICAL IMPLEMENTATION:
1. Create a grid of SVG/Div "boxes" with isometric transforms (skew and rotate).
2. Use Framer Motion for the boxes' interactive states and hover effects.
3. Implement a CSS mask or overlay for the radial fade effect.

CRITICAL RULES:
- Use Framer Motion for interactivity.
- Ensure the isometric perspective is consistent across all boxes.
- Clean up all transforms and hover listeners on unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'space-background': `Create a premium "Space Background" (Parallax Starfield) component using React, TypeScript, and Canvas.

COMPONENT NAME: SpaceBackground

PROPS (with defaults):
- starCount: number = 400 — density of stars.
- nebulaCount: number = 6 — amount of gas clouds.
- interactive: boolean = true — enable parallax and shattering interaction.

VISUAL REQUIREMENTS:
1. Multi-layered starfield with parallax depth (faster stars in front, slower in back).
2. Large, colorful radial gradients representing drifting nebulas.
3. Rare "Shooting Star" events that streak across the screen and fade.
4. Rare "Unstable Stars" that can shatter into fragments upon interaction.

TECHNICAL IMPLEMENTATION:
1. Use HTML5 Canvas for all rendering.
2. Layer 1: Fixed nebula gradients.
3. Layer 2-4: Star arrays with different velocity coefficients.
4. Use requestAnimationFrame with time-based scaling for smooth motion.
5. Track mouse position to apply a "camera tilt" effect.

CRITICAL RULES:
- Use Canvas API directly.
- Ensure resource cleanup (RAF, listeners).
- Maintain 60fps even with high star counts.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,


    'black-hole-background': `Create a premium "Black Hole Background" (Spiral Particle) component using React, TypeScript, and Canvas.

COMPONENT NAME: BlackHoleBackground

PROPS (with defaults):
- particleCount: number = 600 — number of orbiting particles.
- coreColor: string = 'rgba(79, 70, 229, 0.4)' — primary glow color.
- accentColor: string = '#22d3ee' — particle color highlights.

VISUAL REQUIREMENTS:
1. Particles spiraling into a central singularity point.
2. Event Horizon Glow: Multi-layered radial gradients in the center.
3. Gravity Logic: Particle speed increases as they get closer to the center.
4. Smooth mouse follow: The black hole follows the cursor with easing.

TECHNICAL IMPLEMENTATION:
1. Use HTML5 Canvas API.
2. Maintain particles with { angle, radius, speed }.
3. Each frame: radius *= 0.99; angle += speed; if radius < 1, reset to outer boundary.
4. Draw gradients using ctx.createRadialGradient.

CRITICAL RULES:
- Use Canvas API directly.
- Ensure the spiral motion feels gravitational and organic.
- Cleanup animation frames on unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,


    'mouse-gravity-background': `Create a premium "Mouse Gravity Background" component using React, TypeScript, and Canvas.

COMPONENT NAME: MouseGravityBackground

PROPS (with defaults):
- particleCount: number = 150 — base persistent particles.
- attractionRadius: number = 300 — distance for mouse influence.
- attractionForce: number = 0.05 — strength of the gravity.
- enableTrail: boolean = true — spawn additional particles on move.

VISUAL REQUIREMENTS:
1. Particles drift randomly until entering the mouse's attraction radius.
2. Smooth acceleration and momentum (Newtonian physics).
3. Temporary glowing "trail" particles spawned at the cursor during movement.
4. Screen wraparound (particles re-enter from opposite sides).

TECHNICAL IMPLEMENTATION:
1. Use HTML5 Canvas API.
2. Calculate distance between each particle and mouse; if < radius, apply force vector.
3. Implement friction/damping to keep movement controlled.
4. Draw soft blurred circles for a premium glow.

CRITICAL RULES:
- Use Canvas API directly.
- Performance: Only calculate gravity for particles within range.
- Clean up all listeners and frames on unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,
    'hell-background': `Create a premium "Hell Background" (WebGL Shader) component using React, TypeScript, and Three.js.

COMPONENT NAME: HellBackground

PROPS (with defaults):
- speed: number = 0.3 — flow velocity.
- intensity: number = 0.5 — flame height multiplier.
- colors: string[] = ["#1a0505", "#ff2d00", "#ffae00"] — the flame spectrum.

VISUAL REQUIREMENTS:
1. Volumetric "Inferno" shader animation representing heat haze and magma flow.
2. Full-screen WebGL rendering with high-density noise (Simplex/Fractal Brownian Motion).
3. Dynamic mouse interaction: cursor position influences internal heat vectors and smoke density.
4. Integrated color palette shifting between deep obsidians and vibrant incandescent oranges.
5. Smooth resizing handling for window fluctuations.

TECHNICAL IMPLEMENTATION:
1. Use Three.js (PlaneGeometry + ShaderMaterial) for the WebGL context.
2. Performance-optimized fragment shader with high precision: float precision highp float.
3. Automatically pause on tab blur to save GPU resources.
4. Support for OffscreenCanvas (if available) for thread-safe rendering.

CRITICAL RULES:
- Use Three.js for rendering.
- Ensure the "Inferno" effect feels high-density and premium.
- Clean up the scene, renderer, and shaders on unmount.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,



    'scroll-3d-animation': `Create a premium "3D Scroll Animation" component using React, TypeScript, GSAP, and Canvas.

COMPONENT NAME: Scroll3DAnimation

PROPS (with defaults):
- frameCount: number = 300 — total number of images in the sequence.
- showDemoButton: boolean = false — overlay a "View Full Demo" CTA.

VISUAL REQUIREMENTS:
1. Hyper-smooth 3D character rotation/movement scrubbed directly by page scroll.
2. High-performance Canvas rendering of 300+ image frames for lag-free cinematography.
3. Multi-page text overlay system: titles and descriptions fade/slide/blur based on scroll position.
4. Dynamic progress loader: animated bar and percentage counter shown during image preloading.
5. Animated "View Full Demo" button with backdrop-blur-2xl, brand-green accents, and external-link icon.

TECHNICAL IMPLEMENTATION:
1. Use GSAP (ScrollTrigger) to control the 'frame' index of an image sequence ref.
2. Implement an efficient 2D Canvas rendering loop (drawImage) with center-shifting logic.
3. Preload all 300 images into memory with progress tracking to prevent flickering.
4. Utilize useGSAP hook for timeline management and proper ScrollTrigger cleanup.
5. Responsive Canvas sizing: dynamically update width/height on window resize.

VIDEO DEMO:
- https://antigravity-ui.s3.amazonaws.com/videos/3d_scroll_experience_demo.mp4

CRITICAL RULES:
- Use ScrollTrigger.pin: true to lock the component during the 600% scroll duration.
- Ensure all text layers are absolute and transition based on the master GSAP timeline.
- Clean up all ScrollTrigger instances and preloaded images on unmount.

Provide the complete, single-file, production-ready React TypeScript component.`,

    'three-d-slider': `Create a premium "3D Slider" component using React, TypeScript, and Vanilla CSS.

COMPONENT NAME: ThreeDSlider

PROPS (with defaults):
- autoPlay: boolean = false — automatically rotate slides.
- interval: number = 5000 — time between auto-slides in ms.
- slides: Array<Slide> — custom data (optional).

VISUAL REQUIREMENTS:
1. Perspective-based 3D card transition where the active slide is full-screen.
2. Upcoming slides appear as a stack of smaller, vertically-centered cards on the right.
3. Dynamic "Slide-Up + Fade-In" text animations for titles, descriptions, and action buttons.
4. Premium aesthetic: multi-layered gradients, accent-colored glows, and glassmorphism controls.
5. Fully responsive: adaptive card positioning for mobile/tablet and touch-swipe support.

TECHNICAL IMPLEMENTATION:
1. State-managed slide array (shift/pop logic) for seamless infinite rotation.
2. Pure CSS-driven 3D layout using nth-child selectors and absolute positioning.
3. High-performance transform animations (cubic-bezier) for the perspective shift.
4. Interactive navigation buttons with backdrop-blur and hover-scale effects.
5. Intersection/Touch handlers: support touchStartX/touchEnd for swipe gestures on mobile.

VIDEO DEMO:
- https://antigravity-ui.s3.amazonaws.com/videos/3d_perspective_slider_vibe.mp4

CRITICAL RULES:
- The 2nd child of the list must be treated as the "Active" slide (full screen).
- Use CSS variables (--accent) for slide-specific glowing highlights.
- Ensure the layout handles overflow: hidden to prevent card leakage.

Provide the complete, single-file, production-ready React TypeScript component.`,


    '3d-rubiks-cube': `# UI HUB • CLAUDE PROMPT

## Role
You are an expert frontend engineer.

## Task
Generate a production-ready React component based on the specifications below.

## Rules
* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info
Name: RubiksCube
Type: Interactive 3D Puzzle Component

---

## Tech Stack
* React
* TypeScript
* CSS Modules (or Vanilla CSS)
* DOMMatrix (for 3D transformations)

---
## Ground Truth Source Code (100% Functional)
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

---

## Requirements
* 3x3x3 Rubik's Cube implementation with 27 individual cubies.
* Core Engine: Use a DOMMatrix-based system for each cubie to handle rotations and positions accurately in 3D space.
* Physics & Interaction:
    * Click-and-drag logic to rotate the entire cube with inertia and friction.
    * Layer Rotation: Rotate specific 1x3x3 slices around X, Y, or Z axes.
    * Snapping: Implement a 'snap' function to round cubie matrices to the nearest 90 degrees and grid positions to prevent matrix drift.
* Animation:
    * Use a temporary pivot element to group cubies during rotation for smooth CSS transitions.
    * Re-parent cubies back to the main scene after the rotation finishes.
* Features:
    * Scramble: Generate a random sequence of moves and execute them sequentially.
    * Solve: Record move history and reverse it with inverted angles to return to the solved state.
* Logic Stability:
    * Ensure the cube doesn't reset when the 'busy' state changes (avoid rebuilding in useEffect).
    * Use requestAnimationFrame for a smooth drift/auto-rotation when idle.
* Aesthetic:
    * High-fidelity cubies with rounded corners, gloss, and shine layers.
    * Traditional Rubik's colors: Green (Front), Blue (Back), Red (Right), Orange (Left), White (Top), Yellow (Bottom).
    * Atmospheric radial-gradient background (Aura) behind the cube.
* Layout: Premium side-by-side presentation.
    * Left Side: Large typography ("3D RUBIKS CUBE"), description, status indicator, and Scramble/Solve controls.
    * Right Side: The interactive 3D viewport.

---

## Props
* className: string - Optional container override.

---

## Performance
* GPU-accelerated transforms (matrix3d).
* Minimal re-renders through Ref-based matrix management.
* Optimized event listeners with cleanup on unmount.`,

    'interactive-hover-button': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer.

## Task

Generate a production-ready React component based on the specifications below.

## Rules

* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info

Name: InteractiveHoverButton
Type: Interactive UI Button

---

## Tech Stack

* React
* TypeScript
* Framer Motion
* Tailwind CSS
* Lucide React
* clsx
* tailwind-merge (cn utility)

---

## Requirements

* An interactive button with a circular expansion animation that fills the button on hover.
* Supports standard, neon, and dark style variants.
* Text or children translates to the right on hover, revealing an arrow icon (or check icon if clicked) that slides in.
* Customize hover scale expansion factor dynamically to prevent visual clipping.
* Uses Framer Motion's AnimatePresence for smooth icon swapping states.

---

## Props

* children: React.ReactNode — button content text
* className: string — additional CSS overrides
* variant: "default" | "neon" | "dark" = "default" — styling variants
* text: string — optional label text (fallback for children)

---

## Performance

* High-performance GPU-accelerated circle scale animations using Framer Motion.
* Optimized state transitions for hover and click micro-interactions.
`,

    "mesh-text-hover": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert WebGL2 and React animation engineer.

## Task
Generate a production-ready interactive WebGL2 "Mesh Text Hover" distortion animation component with spring-mass physics and chromatic fringe splitting.

## Tech Stack
* React 18+ (TypeScript)
* WebGL2 Context & GLSL Shaders (Vertex + Fragment shaders)
* 2D Offscreen Canvas Texture Generation
* ResizeObserver for responsive high-DPI scaling

## Component Specifications & Requirements
1. **WebGL2 Grid & Geometry Mesh**:
   - Construct a 96x40 vertex triangle mesh with static vertex positions (aPos) and texture coordinates (aUv).
   - Maintain dynamic displacement (aDisp) and velocity (vel) Float32Arrays.
2. **Spring-Mass Cursor Dynamics**:
   - Track pointer coordinates and compute frame-to-frame cursor velocities.
   - Vertices near the cursor get pulled by mouse velocity with a proximity falloff curve.
   - Apply Hooke's spring restoration (SPRING_K = 0.08) and damping (DAMPING = 0.9) every frame.
3. **Multi-Spectrum Chromatic Aberration Shader**:
   - Fragment shader extracts horizontal texture offsets scaled by vertex displacement magnitude (vMag).
   - Implements chromatic fringe color splitting using smooth time-cycled palette pairs (uColorA, uColorB).
4. **Asynchronous Font Loading & Dynamic Text Rendering**:
   - Render font onto an offscreen 2D canvas texture with document.fonts.load/ready support.
5. **Configurable Props**:
   - text: string = "MESH"
   - color: string = "#ffffff"
   - font: { fontFamily?: string, variant?: string, fontSize?: number | string, fontWeight?: number | string }
   - colorSplit: boolean = true
   - customColors: string[] = ["#ff40c0", "#40ff80"]
   - force: number = 18

Provide the complete, single-file, production-ready React TypeScript component.
`,

    "pixel-drift": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert HTML5 Canvas and React animation engineer.

## Task
Generate a production-ready interactive Canvas particle text animation component called "Pixel Drift" (ParticleText) where text is sampled into a dense particle field that assembles with cubic-bezier easing and gets dynamically repulsed by the cursor like a black hole carving a void out of a star field.

## Tech Stack
* React 18+ (TypeScript)
* HTML5 Canvas 2D (Float32Array buffers for GPU-like particle physics)
* Custom Cubic-Bezier Transition Parser & Easing Engine
* ResizeObserver & IntersectionObserver for responsive high-DPI viewport triggers

## Component Specifications & Requirements
1. **Text Alpha Pixel Sampling**:
   - Measure and rasterize text to an offscreen canvas at devicePixelRatio.
   - Scan alpha channels (>128) with dynamic stride downsampling based on particleCount.
   - Store origins (ox, oy), outer spawn ring positions (sx, sy), current coordinates (px, py), and repulsion vectors (repX, repY) in typed Float32Arrays.
2. **Cubic-Bezier Formation Transition**:
   - Parse transition configs (e.g. cubicBezier, circIn/circOut/easeInOut or standard spring/tween).
   - Advance formation progress rate (formValRef) from spawn ring to target origin with smooth interruptibility.
3. **Black-Hole Cursor Repulsion Physics**:
   - Track cursor speed and smooth LERP position.
   - Particles within mouseRadius experience velocity-scaled displacement push: (falloff * hitSpeed * mouseForce * 0.05).
   - Apply elastic return decay (repX *= 0.97, repY *= 0.97) as the cursor exits the zone.
4. **Viewport Triggers**:
   - Support 'onEnter' (with IntersectionObserver and sentinel element) and 'onHover' modes.
   - Support 'replay' mode to disperse and re-form upon scrolling back into view.
5. **Configurable Props**:
   - text: string = "PIXEL DRIFT"
   - colors: string[] = ["#FFFFFF", "#F9731A", "#3D5CFF"]
   - mode: "onEnter" | "onHover" = "onEnter"
   - replay: boolean = true
   - position: "above" | "middle" | "below" = "above"
   - particleSize: number = 10
   - particleCount: number = 45
   - mouseEnabled: boolean = true
   - mouseRadius: number = 65
   - mouseForce: number = 25
   - fontSize: number = 80
   - autoFit: boolean = true
   - transition: { type?: "tween" | "spring", duration?: number, ease?: string | number[] }

Provide the complete, single-file, production-ready React TypeScript component.
`,

    "random-letter-swap": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert typography and React animation engineer.

## Task
Generate a production-ready interactive typography micro-interaction named "Random Letter Swap" (RandomLetterSwap) where text characters swap vertically on hover in a randomized stagger sequence using React, TypeScript, and Framer Motion.

## Tech Stack
* React 18+ (TypeScript)
* Framer Motion (\`useAnimate\`, \`motion.span\`, \`AnimationOptions\`)
* Semantic Screen Reader accessibility (\`sr-only\` hidden element + \`aria-hidden\` letter slots)

## Component Specifications & Requirements
1. **Vertical Dual-Layer Letter Slot Construction**:
   - Wrap the full string into a container with \`overflow: hidden\` and \`display: inline-flex\`.
   - Render an accessible \`span\` marked as \`sr-only\` containing the full label for screen readers.
   - For visual characters, create individual \`span\` wrappers marked \`aria-hidden\`.
   - Inside each slot, place a primary letter (\`.letter-N\`) and an absolutely positioned secondary letter (\`.letter-secondary-N\`) resting at \`+100%\` (or \`-100%\` when \`reverse: true\`).
2. **Whitespace-Aware Stagger Delay Calculation**:
   - Collect indices of non-space characters (\`letterIdxs\`). Spaces are omitted from the shuffled array so they don't consume stagger delay time.
   - Shuffle indices at runtime using randomized sort.
3. **Dual Interactive Modes**:
   - **"forward"**: Slides primary letters off-screen in shuffled sequence, snaps each back to 0 with zero duration, while sliding secondary letters into view and resetting offscreen. Uses a \`blocked\` boolean latch to ignore overlapping hovers until the last letter finishes.
   - **"pingpong"**: Plays forward transition on hover-enter and reverse transition on hover-leave, generating a fresh randomized shuffle order on each direction.
4. **Leading + Trailing Debounce Engine (100ms)**:
   - Debounce hover enter and exit handlers so quick hover thrashing settles gracefully to the final intended state.
5. **Configurable Props**:
   - label: string = "LETTER SWAP"
   - mode: "forward" | "pingpong" = "pingpong"
   - reverse: boolean = false
   - staggerDuration: number = 0.08
   - ease: AnimationOptions = { type: "spring", stiffness: 400, damping: 28, duration: 0.8 }
   - font: Record<string, any> = { fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 8vw, 6rem)" }
   - color: string = "#FFFFFF"
   - onClick?: () => void
   - className?: string
   - style?: React.CSSProperties

Provide the complete, single-file, production-ready React TypeScript component.
`,

    "rolling-letters": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert typography and animation engineer specializing in GSAP and React.

## Task
Generate a production-ready kinetic typography component named "Rolling Letters" (RollingLetters / SlotMachine) where character spans cascade smoothly into view with directional stagger and customizable easing using React, TypeScript, and GSAP.

## Tech Stack
* React 18+ (TypeScript)
* GSAP (\`gsap\`)
* Native DOM Character Splitting (\`span.char\`)

## Component Specifications & Requirements
1. **Kinetic Vertical Entrance**:
   - Split input text string into individual character spans with class \`.char\` and \`display: inline-block\`.
   - Preserve whitespaces accurately using non-breaking spaces (\`\\u00A0\`).
   - Animate from vertical offscreen offset (\`yPercent: -500\` for \`"top"\`, \`+500\` for \`"bottom"\`).
   - Prior to triggering new tweens, execute \`gsap.killTweensOf(chars)\` and \`gsap.set(chars, { clearProps: "transform" })\` to guarantee zero visual glitching.
2. **GSAP Stagger & Easing Translation**:
   - Support \`staggerFrom\` origins: \`"start"\`, \`"center"\`, \`"end"\`, \`"random"\`.
   - Translate standard easing names (\`easeIn\`, \`easeOut\`, \`easeInOut\`, \`backIn\`, \`backOut\`, \`circIn\`, \`circOut\`, \`anticipate\`) to GSAP equivalents (\`power2.in\`, \`power4.out\`, \`power2.inOut\`, \`back.in\`, \`back.out(1.7)\`, \`circ.in\`, \`circ.out\`).
3. **Polymorphic Tag Support**:
   - Render the requested HTML tag dynamically: \`"h1" | "h2" | "h3" | "h4" | "h5" | "p" | "span" | "div" | "section"\`.
4. **Interactive Hover & Click Replay**:
   - Automatically replay on mount and text updates.
   - Optional \`triggerOnHover\` and click handlers to re-roll the kinetic animation on interaction.
5. **Configurable Props**:
   - text: string = "UI HUB"
   - font?: React.CSSProperties
   - color?: string = "#ffffff"
   - startFrom?: "top" | "bottom" = "bottom"
   - staggerFrom?: "start" | "center" | "end" | "random" = "center"
   - tag?: TextTag = "h1"
   - transition?: { type?: string, duration?: number, delay?: number, ease?: string | number[], staggerChildren?: number }
   - className?: string
   - style?: React.CSSProperties
   - triggerOnHover?: boolean

Provide the complete, single-file, production-ready React TypeScript component.
`,

    "scramble-text": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert kinetic typography and creative developer specializing in high-performance React interactions.

## Task
Generate a production-ready interactive kinetic typography glitch reveal and cursor-diffusion component named "Scramble Text" (GlitchCharReveal / ScrambleText) with dual entrance and hover physics using React and TypeScript.

## Tech Stack
* React 18+ (TypeScript)
* Custom Cubic-Bezier & Easing Solver
* IntersectionObserver & ResizeObserver for Line Detection
* Zero External UI Dependencies (Pure React / DOM / requestAnimationFrame)

## Component Specifications & Requirements
1. **Multi-Stage Kinetic Enter Reveal**:
   - Modes: \`"none" | "oneLine" | "multiLine" | "random"\`.
   - Dynamic line and whitespace detection to prevent layout shift during scramble transformations.
   - High-speed glitch frame randomization prior to locking target characters into place.
   - Configurable scramble intensity, custom cubic-bezier ease curves, and duration.
   - Micro-flicker physics with customizable flicker color, intensity, and speed.
2. **Interactive Hover Diffusion & Wave Sweeps**:
   - Hover modes: \`"diffusion" | "wave" | "none"\` across \`"oneLine"\` or \`"multiLine"\`.
   - Diffusion mode scatters characters in a radial falloff with optional collapsing decay timer.
   - Wave mode runs high-performance independent requestAnimationFrame scanner loops per line with wave cursor blocks (\`░▒▓█\`).
3. **Typography & Layout Fidelity**:
   - Preserves multi-line paragraphs and spacing with ghost measurement elements.
   - Configurable font styling, tag polymorphism (\`h1\`..\`h5\`, \`p\`, \`div\`, \`span\`), and text alignment.
4. **Configurable Props**:
   - words: string = "UI HUB SCRAMBLE"
   - enterAnimation: { mode, restState, replay, position, scrambleIntensity, ease, flickerEnabled, flickerColor, flickerIntensity, flickerSpeed }
   - hoverAnimation: { type, lines, radius, collapse, collapseTime, glitchChars, glitchShuffle, flickerEnabled, flickerColor, flickerIntensity, flickerSpeed, waveEase, waveShuffleLimitEnabled, waveShuffleLimitValue }
   - color: string = "#ffffff"
   - font: React.CSSProperties
   - tag: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "div" | "span"

Provide the complete, single-file, production-ready React TypeScript component.
`,

    "scroll-text-highlight": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert typography and creative interaction engineer specializing in GSAP and React.

## Task
Generate a production-ready typography scroll interaction component named "Scroll Text Highlight" (ScrollHighlight / ScrollTextHighlight) where words or characters progressively transition from a dimmed state to a vibrant highlight state based on scroll progress using React, TypeScript, GSAP, and ScrollTrigger.

## Tech Stack
* React 18+ (TypeScript)
* GSAP (\`gsap\`)
* GSAP ScrollTrigger (\`gsap/ScrollTrigger\`)
* Native DOM Splitting (\`.word\` / \`.char\`)

## Component Specifications & Requirements
1. **Scroll-Linked Text Highlighting**:
   - Register \`ScrollTrigger\` plugin with GSAP.
   - Split input text dynamically into either individual words (\`.word\`) or characters (\`.char\`) with whitespace and non-breaking space preservation.
   - Initialize typography targets at \`dimColor\` (default: \`rgba(255, 255, 255, 0.15)\`).
   - Tween target color to \`highlightColor\` (default: \`#FFFFFF\`) using GSAP stagger (0.1 for words, 0.03 for characters).
2. **Fluid Scrubbing & Scroller Integration**:
   - Bind animation to \`ScrollTrigger\` with \`scrub: true | number\`.
   - Support customizable \`scrollStart\` and \`scrollEnd\` anchors (e.g. \`"top center"\`, \`"bottom center"\`, \`"top 80%"\`).
   - Support optional \`scroller\` property (container element or selector) allowing scoped scroll execution inside preview modals/cards.
   - Clean up animations with \`gsap.context\` on unmount.
3. **Configurable Props**:
   - text?: string
   - font?: React.CSSProperties
   - dimColor?: string
   - highlightColor?: string
   - splitBy?: "characters" | "words"
   - scrollStart?: ScrollPosition
   - scrollEnd?: ScrollPosition
   - scrub?: boolean | number
   - scroller?: HTMLElement | string | null
   - paddingTop?: string
   - paddingBottom?: string
   - className?: string
   - style?: React.CSSProperties
   - containerStyle?: React.CSSProperties

Provide the complete, single-file, production-ready React TypeScript component.
`,

    "smoky-text": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert typography and creative interaction engineer specializing in CSS physics and React animations.

## Task
Generate a production-ready typography condensation and smoke particle dissipation animation component named "Smoky Text" (SmokyText) in React and TypeScript where characters dynamically diffuse as gaseous clouds and condense into crisp text.

## Tech Stack
* React 18+ (TypeScript)
* Native CSS Keyframes & Dynamic \`<style>\` Injection
* ResizeObserver & Multi-line Detection
* IntersectionObserver / Scroll Trigger Physics

## Component Specifications & Requirements
1. **Dynamic Smoke Keyframe Physics**:
   - Calculate blur radii and multi-layered stacked text shadows proportional to intensity (range 1–20).
   - Generate alternating trajectories for even/odd character indices with rotational skews, 3D translation vectors, and scale contractions.
   - Inject scoped \`@keyframes\` stylesheets using \`useId()\` to eliminate name collisions across multiple component instances.
2. **Multiple Animation Modes**:
   - \`"singleLine"\`: Sequential left-to-right character stagger across the entire string.
   - \`"multiLine"\`: Automatically detect line wraps using \`ResizeObserver\` and \`offsetTop\` grouping; triggers staggered line-by-line smoke reveals.
   - \`"inPlace"\`: Compresses diffuse gaseous clouds inward into crisp letter glyphs simultaneously without translational offset.
3. **Multi-Trigger System**:
   - \`"default"\`: Plays immediately on mount.
   - \`"hover"\`: Triggers animation once when user pointer enters the container boundary.
   - \`"scroll"\`: Viewport boundary detection with customizable trigger distance (%) and top/bottom anchor positioning.
4. **Configurable Props**:
   - text?: string = "SMOKY\\nTEXT"
   - font?: React.CSSProperties
   - color?: string = "whitesmoke"
   - appearTrigger?: "default" | "hover" | "scroll"
   - scrollConfig?: { position?: "top" | "bottom"; distance?: number }
   - appearTransition?: { type?: "tween" | "spring"; ease?: string | number[]; duration?: number; delay?: number }
   - intensity?: number = 10
   - position?: "bottomLeft" | "topLeft"
   - animationMode?: "singleLine" | "multiLine" | "inPlace"
   - className?: string
   - style?: React.CSSProperties

Provide the complete, single-file, production-ready React TypeScript component.
`,

    "text-carousel": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert typography and creative interaction engineer specializing in GSAP animations and React components.

## Task
Generate a production-ready rotating typography badge carousel animation component named "RotatingText" / "TextCarousel" in React and TypeScript where animated words/characters transition seamlessly inside a dynamic auto-sizing badge container pill.

## Tech Stack
* React 18+ (TypeScript)
* GSAP (\`gsap\`)
* Intl.Segmenter / Grapheme Splitting
* Responsive Layout & Accessibility (ARIA)

## Component Specifications & Requirements
1. **Dynamic Auto-Sizing Badge Pill**:
   - Measure active text width dynamically using \`useLayoutEffect\` / \`ResizeObserver\` and smoothly resize the badge container width with GSAP tweens.
   - Screen-reader accessible hidden text overlay with \`aria-hidden\` on animated visual segments.
2. **GSAP Staggered Letter/Word Animations**:
   - Supports splitting by \`"characters"\`, \`"words"\`, and \`"lines"\`.
   - Exit animation: translates letters to \`yPercent: -120\` with \`opacity: 0\`.
   - Entrance animation: animates incoming letters from \`yPercent: 100\` to \`yPercent: 0\` with \`opacity: 1\`.
   - Stagger directions: \`"first"\` (start), \`"last"\` (end), \`"center"\`, \`"random"\`.
3. **Auto-Rotation & Timers**:
   - Configurable \`auto\` boolean and \`rotationInterval\` (default 2000ms).
   - Clean interval and tween garbage collection on unmount.
4. **Configurable Props**:
   - prefix?: string = "Text"
   - texts?: string[] = ["components!", "interfaces!", "experiences!"]
   - font?: React.CSSProperties
   - color?: string = "#ffffff"
   - prefixColor?: string = "#E8E8E8"
   - badgeBackground?: string = "#1EE7B3"
   - badgePaddingX?: number = 16
   - badgePaddingY?: number = 6
   - badgeRadius?: number = 14
   - gap?: number = 12
   - splitBy?: "characters" | "words" | "lines" = "characters"
   - staggerFrom?: "first" | "last" | "center" | "random" = "first"
   - auto?: boolean = true
   - rotationInterval?: number = 2000
   - transition?: { type?: string; duration?: number; delay?: number; ease?: string | number[]; staggerChildren?: number }
   - className?: string
   - style?: React.CSSProperties

Provide the complete, single-file, production-ready React TypeScript component.
`,

    "text-path": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert creative developer and SVG interaction specialist in React and TypeScript.

## Task
Generate a production-ready infinite wave marquee text animation component named "TextPath" in React and TypeScript where text continuously and smoothly scrolls along a procedural SVG sine wave with no visible path endpoints and zero-hop loop wrapping.

## Tech Stack
* React 18+ (TypeScript)
* SVG \`<textPath>\` & Cubic Bézier Sine Waves
* High Performance \`requestAnimationFrame\` Loop
* ResizeObserver for Responsive Geometry

## Component Specifications & Requirements
1. **Procedural Sine Wave Math**:
   - Calculate wave geometry dynamically extending past both container edges with overflow margins so endpoints are never visible.
   - Symmetrically scale cubic control points (ctrlAmp = amplitude * 4/3) to hit exact requested peak amplitudes.
   - Clamp amplitude to \`h/2 - fontSizePx\` to keep typography fully within container bounds without clipping.
2. **Dual-Measurement Difference Technique**:
   - Measure 2 and 4 repeat units in hidden SVG \`<text>\` tags and calculate per-unit period as \`(length4 - length2) / 2\`.
   - Eliminates whitespace-trimming edge artifacts from \`getComputedTextLength()\`.
3. **Seamless rAF Animation**:
   - Drive SVG \`startOffset\` imperatively via a single long-lived \`requestAnimationFrame\` loop with dt-clamped delta time.
   - Wrap position within \`[0, unitWidth)\` for visual continuity across infinite cycles.
4. **Configurable Props**:
   - text?: string = "TEXT PATH"
   - speed?: number = 30
   - reversed?: boolean = true
   - textFont?: { fontFamily?: string; fontWeight?: number | string; fontStyle?: string; fontSize?: number | string; letterSpacing?: number | string; lineHeight?: number | string }
   - textColor?: string = "#FFFFFF"
   - waveFrequency?: number = 3
   - waveHeight?: number = 100
   - separator?: string = "   •   "
   - gap?: number = 0
   - width?: string | number = "100%"
   - height?: string | number = 200
   - className?: string
   - style?: React.CSSProperties

Provide the complete, single-file, production-ready React TypeScript component.
`,

    "text-vaporize": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert creative technologist and canvas animation engineer in React and TypeScript.

## Task
Generate a production-ready canvas-based particle text vaporization and reconstitution animation component named "VaporizeTextCycle" / "TextVaporize" in React and TypeScript where words vaporize into diffuse particle swarms and reconstitute cleanly in infinite cycles.

## Tech Stack
* React 18+ (TypeScript)
* HTML5 Canvas & Direct \`ImageData\` Buffer Manipulation
* Single Long-Lived \`requestAnimationFrame\` Loop
* Custom Cubic-Bézier Timing & Easing Curves

## Component Specifications & Requirements
1. **Direct Pixel Buffer Rasterization**:
   - Render text to canvas and extract particle coordinates via \`getImageData()\`.
   - Update and render particles by writing direct RGBA channels into a single reusable \`ImageData\` buffer via \`putImageData()\`, avoiding DOM node overhead and maintaining 60fps performance.
2. **3-Phase Animation State Machine**:
   - \`"in"\` (appear) -> \`"hold"\` (settled reading time) -> \`"out"\` (disappear/vaporize) -> loop with next word.
   - Modes: \`"particle"\` (radial dispersion with sinusoidal wobble) or \`"opacity"\` (alpha transition).
   - Directional sweep order: \`"together"\`, \`"left-to-right"\`, \`"right-to-left"\`.
3. **Accessibility & DPR Handling**:
   - Hidden semantic text tag (\`h1\`..\`p\`) for search engines and screen readers alongside an \`aria-hidden\` canvas.
   - Scales with \`devicePixelRatio\` (capped at 2) and calculates bleed margins to prevent particle clipping.
4. **Configurable Props**:
   - texts?: string[] = ["TEXT", "VAPORIZE"]
   - font?: { fontFamily?: string; fontWeight?: number | string; fontSize?: number | string; letterSpacing?: number }
   - color?: string = "#FFFFFF"
   - spread?: number = 20
   - density?: number = 10
   - appear?: { mode?: "particle" | "opacity"; order?: "together" | "left-to-right" | "right-to-left"; transition?: { duration?: number; ease?: string | number[]; delay?: number } }
   - disappear?: { mode?: "particle" | "opacity"; order?: "together" | "left-to-right" | "right-to-left"; transition?: { duration?: number; ease?: string | number[]; delay?: number } }
   - alignment?: "left" | "center" | "right" = "center"
   - tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span" = "h1"
   - className?: string
   - style?: React.CSSProperties

Provide the complete, single-file, production-ready React TypeScript component.
`,
    'gravitational-vortex': `# UI HUB • CLAUDE PROMPT

## Role

You are an expert frontend engineer and WebGL shader developer.

## Task

Create a premium "Gravitational Vortex" interactive background component using React, TypeScript, and raw WebGL.

COMPONENT NAME: GravitationalVortex

PROPS (with defaults):
- background: string = "#000000" — CSS background color behind the canvas.
- baseColor: string = "#04FF3F" — Primary particle/streak color.
- accentColor: string = "#FCFF00" — Accent color for highlight streaks.
- accentMix: number = 50 — Percentage of particles using accent color.
- density: number = 16 — Particle density 10-100 (maps to 2000-40000 particles).
- dotSize: number = 400 — Particle radius as percent of base size.
- speed: number = 16 — Rotation and inward slide speed 0-100.
- direction: "inward" | "outward" = "inward" — Particle flow direction.
- hoverSpeed: number = 100 — Speed while pointer hovers.
- scale: number = 79 — Camera zoom as percent (reciprocal of pullback).
- tiltX: number = 35 — Camera elevation above disc plane in degrees.
- tiltY: number = 0 — Camera yaw about Y axis in degrees.
- vortex: { twist: number; funnel: number } = { twist: 28, funnel: 54 } — Spiral twist and funnel depth.

VISUAL REQUIREMENTS:
1. A logarithmic spiral accretion disc with ~20k motion-blurred streaks falling into a funnel throat.
2. Each streak is a two-triangle quad stretched along the true velocity direction.
3. Particles taper along their tangent with Gaussian width profiles and depth attenuation.
4. Additive blending over a transparent canvas with premultiplied alpha.
5. Interactive hover speed boost with dt-correct easing.
6. Eye-shift lens correction to pin the vortex centre to the frame.

CRITICAL RULES:
- The canvas clears transparent; background is CSS, never a GL clear.
- Direction owns the sign — Speed is unsigned 0-100.
- Hover Speed is on the SAME dial as Speed.
- Export as both named and default export.

Provide the complete, single-file, production-ready React TypeScript component.`,
    "black-hole-3d": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert frontend engineer and Canvas animation specialist.

## Task
Create a premium "Black Hole" interactive 3D background component using React, TypeScript, and HTML5 Canvas 2D.

COMPONENT NAME: BlackHole

VISUAL DESCRIPTION:
A visually stunning 3D black hole accretion disk component. Renders an active gravitationally bound accretion disk with flowing particles leaving fading trail lines. Utilizes 3D Z-depth sorting to allow particles to pass behind and in front of the central event horizon with authentic physical occlusion.

CORE FEATURES:
1. Dual Canvas Architecture: Background canvas for behind-horizon particles + sphere, foreground canvas for in-front particles.
2. 3D Z-Depth Sorting: Particles projected via perspective projection (PERSPECTIVE=1300), sorted back-to-front.
3. Relativistic Orbital Speed: Speed factor = sqrt(voidRadius / max(pt.radius, 10)).
4. Power Distribution: Particles distributed with Math.pow(random(), 2) for higher density near the event horizon.
5. 3D Center Sphere: Premium radial gradient sphere with rim lighting.
6. Trail System: Canvas destination-out fade with configurable persistence.
7. Core Consumption: Particles entering the void respawn at outer edge.
8. Dual Tilt: Main inclination + sideway roll tilt.

PROPS:
- showCenter: boolean (default: true)
- centre: { voidRadius, voidX, voidY } (default: { voidRadius: 40, voidX: 50, voidY: 50 })
- particleCount: number (default: 1000)
- particleSize: number (default: 4, range 1-100)
- colors: string[] (default: ["#ffffff"])
- outerRadius: number (default: 70, percentage of half-width)
- tilt: number (default: 20, degrees)
- tiltSideway: number (default: 160, degrees)
- trail: number (default: 50, range 0-50)
- orbitSpeed: number (default: 4)
- pullSpeed: number (default: 0, range 0-20)
- style: React.CSSProperties

TECHNICAL: Dual canvas, ResizeObserver, DPR capped at 1.5, normalize dt to 60fps, 3D perspective projection with two rotation matrices, back-to-front sorting, hexToRgb helper, destination-out trail fade.

Provide the complete, single-file, production-ready React TypeScript component.`,
    "blooming-flower": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert frontend engineer and WebGL shader developer.

## Task
Create a premium "Blooming Flower" interactive background component using React, TypeScript, WebGL, and motion/react.

COMPONENT NAME: BloomingFlower

VISUAL DESCRIPTION:
A WebGL point-cloud flower of 60k-100k point sprites forming a layered flower on a stem. Three kinds of points share one buffer and one drawArrays(POINTS) call: petals on a parametric petal surface, stamens in a dense dome at the centre, and a swaying tapered stem running from the flower down past the bottom of the frame.

CORE FEATURES:
1. **Hover Bloom Gate**: Flower opens on pointerenter, closes on pointerleave. Uses motion/react's animate() on a motionValue for spring/tween physics.
2. **Parametric Petal Surface**: Each petal stores (u, v) plus azimuth and whorl index. Midrib is a circular arc in half-angle form: s*sin(theta0 + ks/2)*sinc(ks/2) — no guarded divide.
3. **Petal Width from Angular Slot**: Width derived from the petal's angular slot at its own radius, so neighbouring petals keep a real gap at every petal count.
4. **Shared Sway Joint**: Head and stem share one swayAt(t) expression — flower cannot drift off its own stalk.
5. **Weather Animation**: Stalk sways, petals flutter on individual phases, head breathes ±1.2%. Single clock scaled by Speed.
6. **Energy Conservation**: Bloom brightness scales with area (pow(S, 1.05)) to prevent bud saturation.
7. **Staggered Whorls**: Outer whorls open first via whorlBloom(ln) with smoothstep.

PROPS (with defaults):
- background: string = "#07060C" — CSS background.
- baseColor: string = "#C4327E" — Primary petal color.
- stemColor: string = "#2F7A4F" — Stem color.
- accentColor: string = "#FFD98A" — Accent for stamen and petal tips.
- accentMix: number = 100 — Accent influence percentage.
- density: number = 100 — Point cloud density 1-100.
- dotSize: number = 10 — Point radius as percent.
- speed: number = 50 — Wind rate 0-100.
- distance: number = 2820 — Camera pullback.
- tilt: number = 66 — Camera pitch degrees.
- closed: number = 100 — Idle closure 0-100.
- flower: { petals?: number; layers?: number } — Structure.
- transition: Motion — Bloom gate animation.

TECHNICAL:
- WebGL vertex/fragment shaders, no Three.js.
- One Float32Array buffer, 8 floats per point (aA vec4 + aB vec4), stride 32.
- Vertex shader handles all three point kinds via aB.z selector.
- Additive blending (ONE, ONE) on premultiplied alpha.
- Transparent canvas (clearColor 0,0,0,0), background is CSS.
- DPR capped at 1.5, ResizeObserver, raw rAF loop.
- mulberry32 seeded RNG for deterministic geometry.
- Gauss spread via rejection sampling (sampleU).
- Near-plane culling (rz < 30 → degenerate point).

Provide the complete, single-file, production-ready React TypeScript component.`,
};


