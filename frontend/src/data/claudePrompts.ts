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
    "3d-hero": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
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




    'corner-button': `# UI HUB • CLAUDE PROMPT

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

Name: CornerButton
Type: Interactive Button with Corner Brackets & Glow

---

## Tech Stack

* React ("use client")
* TypeScript
* clsx
* tailwind-merge (cn utility)
* lucide-react (for the trailing action icon)
* Scoped CSS: a <style> tag bound to a useId-generated id so styles never leak

---

## Requirements

* Resting state: four corner brackets (~14px) visible; centered label flanked by a brand logo on the left and an action icon on the right.
* Hover/focus: brackets extend to ~100% along their edges and a radial laser-glow fades in behind the button.
* All accent colors (brackets + glow) derive from a single accentColor prop.
* Logo nudges left and icon nudges right slightly on hover.
* Use only transform/opacity transitions (60fps, hardware-accelerated).
* Decorative corner/glow layers must be pointer-events: none.
* Fully responsive: scale down gracefully below 480px.
* Preserve visible :focus-visible treatment for accessibility.

---

## Props

* children: React.ReactNode = "Start designing" — the button label.
* icon: LucideIcon = Pencil — trailing action icon.
* accentColor: string = "#FF3B4D" — bracket + glow color.
* showTitleImage: boolean = true — toggle the brand mark.
* titleImage: string | null = built-in mark — brand logo URL (URL or data URI).
* titleImageAlt: string — alt text for the brand mark.
* titleImageClassName: string — sizing classes for the brand mark.
* className: string = "" — extra button classes.

---

## Performance

* Pure CSS transitions (transform/opacity only).
* Pointer-events: none on decorative layers.
* useId-scoped <style> prevents cascading side effects.`,

    'creepy-button': `# UI HUB • CLAUDE PROMPT

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

Name: CreepyButton
Type: Interactive Button with Cursor-Tracking Eyes

---

## Tech Stack

* React ("use client")
* TypeScript
* framer-motion
* clsx
* tailwind-merge (cn utility)

---

## Requirements

* Two white eyes with black pupils that track the cursor using atan2 angle math, clamped by visionRangeX (180) and visionRangeY (75) so pupils stay inside the socket.
* Pupils snap back to center when the pointer leaves (onMouseLeave) or the button loses keyboard focus (onBlur).
* A 3-second looping blink: eye height keyframes [0.75em, 0.75em, 0em, 0.75em] with times [0, 0.92, 0.96, 1].
* A cover layer that tilts to -12° on hover via a spring (stiffness 300, damping 20, mass 0.8) with transform-origin [1.25em 50%].
* Maintain layout with an invisible placeholder span since the cover is absolute.
* Touch support via onTouchMove.
* Focus-visible ring and select-none for accessibility.

---

## Props

* children: React.ReactNode — the button label.
* className: string = "" — container classes.
* coverClassName: string = "" — classes for the tilting cover face.
* onClick and all native button attributes forwarded.

---

## Performance

* Transform-only animations for 60fps (rotate keyframes need no layout).
* Eyes layer pointer-events: none.
* Minimal state: a Coords tuple for pupils and a hovered boolean.
`,

    'radial-glow-button': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

    'spider-web': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

    'spiral-images': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

    'infinity-image': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

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

    'spotlight-cards': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

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

    'black-hole-cursor': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

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

    'lizard-cursor': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

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

    'interactive-grid-background': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,


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

    'isometric-grid-background': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

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


    'black-hole-background': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,


    'mouse-gravity-background': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
    'hell-background': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,



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


    '3d-rubiks-cube': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

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

    "pixel-drift": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

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
    'gravitational-vortex': `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
    "black-hole-3d": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
    "blooming-flower": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
  "chandelier": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
  "isometric-portal": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

  "morphing-glow": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

  "gear-system": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
  "hourglass": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
  "generating-orb": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
  "trading-candles": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert frontend engineer specializing in pure CSS motion design.

## Task
Create a "Trading Candles" loader React component with TypeScript and Tailwind CSS. No animation libraries; all motion must be CSS @keyframes.

COMPONENT NAME: Trading Candles

VISUAL DESCRIPTION:
A market-ticker loader on a dark radial backdrop: three candlestick columns (green, red, green) in a row, 4px apart, bouncing in a staggered ripple as if waiting for live prints. Each candle is three stacked divs: a 4px-wide wick (h-6) above, a 12x48px rounded-2px body, and a 4px-wide wick (h-6) below.

THE CANDLES:
.columns .tc-candle-group (display flex, column, align-items center). Color is supplied by a --tc-candle CSS variable: .tc-candle-green sets #22c55e, .tc-candle-red sets #ef4444. Wicks (.tc-wick, width 4px, no fixed height) and the body (.tc-body, 12x48px, radius 2px) both fill --tc-candle.

THE BOUNCE:
Each whole column animates tc-bounce on a 1s ease-in-out infinite loop. At 0%/100% translateY(-20%) with timing cubic-bezier(0.8, 0, 1, 1) (slow up swing), at 50% translateY(0) with cubic-bezier(0, 0, 0.2, 1) (fast settle) - the classic two-ease bounce. Stagger with animation-delay: both green columns 0.1s, the middle red column 0.2s, so the ripple starts at the center red candle.

ANIMATIONS (all CSS, prefixed tc-):
- tc-bounce (column translateY bounce, 1s ease-in-out infinite, staggered delays).

TECHNICAL:
- Self-contained <style> tag. Keyframe: tc-bounce. All classes prefixed tc-.
- Wrapper inside a w-full h-full min-h-[380px] flex items-center justify-center gap-1 overflow-hidden select-none container with a dark radial background.
- Zero runtime JS animation.

Acceptance:
Produces the identical green/red/green candle triplet where the middle red candle leads a 1s bounce and the green flanking candles follow 0.1s behind in a continuous loop.

`,
  "pixel-bounce": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert frontend engineer specializing in pure CSS motion design.

## Task
Create a "Pixel Bounce" loader React component with TypeScript and Tailwind CSS. No animation libraries; all motion must be CSS @keyframes.

COMPONENT NAME: Pixel Bounce

VISUAL DESCRIPTION:
A retro pixel-art red ghost on a dark radial backdrop. A .pb-ghost wrapper (position relative, scale 0.8) contains a .pb-red 14x14 CSS grid plus an absolutely-positioned blurred shadow. The ghost bobs on a 0.5s cycle while pink pixel cells across its belly flicker like static, blue pupils scan within white eyes, and the shadow pulses in sync.

THE GRID:
.pb-red is 140x140px, display grid, 14 columns AND 14 rows at repeat(14,1fr). Its silhouette comes from a grid-template-areas string: empty corner cells (a1..a14, b1..b14, c13, c14, d1/d14, e1/e14, f1/f14) leaving the head/dome rows (top0-top4), a solid body block (top4 repeating for rows 7-12), and a bottom hem row ("st0 st0 an4 st1 an7 st2 an10 an10 st3 an13 st4 an16 st5 st5" then "an1 an2 an3 an5 an6 an8 an9 an9 an11 an12 an14 an15 an17 an18") forming the scalloped feet.

THE BOB:
@keyframes pb-upNDown animates the grid 0->-10px translateY, jumping at the 50% keyframe on a 0.5s infinite loop.

THE FLICKER:
The an-cells carry one of two alternating phases so the belly shimmers: pb-flicker0 (background red 0-49%, transparent 50-100%) and pb-flicker1 (inverted), each infinite 0.5s. an1/an18/an6/an12/an7/an13/an8/an11 use flicker0; an2/an3/an4/an9/an10/an15/an16/an17 use flicker1.

THE EYES:
.pb-eye (40x50px, absolute, top 30px left 10px) and .pb-eye1 (right 30px). Each draws a white T-shape via ::before (20x50 white bar translateX 10px) and ::after (40x30 white bar translateY 10px). Blue 20x20 pupils .pb-pupil/.pb-pupil1 (top 50, z-index 1) scan with pb-eyesMovement on a 3s loop: translateX 0 -> 10px (50-99%) -> 0.

THE SHADOW:
.pb-shadow: black, 140x140, border-radius 50%, transform rotateX(80deg), filter blur(20px), top 80%. Pulsing opacity 0.5 -> 0.2 (pb-shadowMovement) in phase with the bob at 0.5s.

ANIMATIONS (all CSS, prefixed pb-):
- pb-upNDown (grid bob + translateY, 0.5s infinite).
- pb-flicker0 / pb-flicker1 (belly pixel shimmer, 0.5s infinite, alternating phases).
- pb-eyesMovement (pupil scan, 3s infinite).
- pb-shadowMovement (shadow opacity pulse, 0.5s infinite).

TECHNICAL:
- Self-contained <style> tag. All classes prefixed pb-; :root script has no effect on layout.
- Wrapper inside a w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none container with a dark radial background.
- Zero runtime JS animation.

Acceptance:
Produces the identical bobbing red pixel ghost with flickering belly, scanning pupils and pulsing shadow, all looping forever.

`,
  "gradient-orb": `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert frontend engineer specializing in pure CSS motion design.

## Task
Create a "Gradient Orb" loader React component with TypeScript and Tailwind CSS. No animation libraries; all motion must be CSS @keyframes (including SVG path d animation).

COMPONENT NAME: Gradient Orb

VISUAL DESCRIPTION:
A glossy 100px liquid-gradient sphere floating on a dark radial backdrop. It layers a white specular pill, two spinning pseudo-element surfaces, and a blurred red-to-blue gradient shell, then an animated 100x100 SVG carves liquid wave ripples across the face via masks. The palette continuously drifts red -> blue -> yellow -> cyan through hue-rotate filters.

THE STRUCTURE (all prefixed gorb-):
- .gorb-loader: position relative, display flex centered, overflow hidden, border-radius 50%, defines CSS variables --gorb-size (100px), --gorb-time-animation (1s), --gorb-color-one (red), --gorb-color-two (blue), --gorb-color-three (yellow), --gorb-color-fore (cyan), --gorb-color-five (white).
- .gorb-sphere: 100px circle with a white radial specular gradient anchored at 80% 20%.
- .gorb-sphere::before: full-size inset box-shadows as colored blobs - inset calc(--gorb-size / -20) calc(--gorb-size / -20) calc(--gorb-size / 10) var(--gorb-color-fore) (cyan, top-left) plus inset calc(--gorb-size / 10) 0 calc(--gorb-size / 5) var(--gorb-color-three) (yellow, right). Animates gorb-rotation 2s linear + gorb-colorize 2s ease-in-out.
- .gorb-sphere::after: z-index -1, paints radial white glow over linear-gradient(120deg, red 20%, blue 80%); animates gorb-rotation 2s linear + gorb-colorblur 2s ease-in-out.

THE SVG (100x100 viewBox, width/height var(--gorb-size), animates gorb-rotation 3s cubic-bezier(0.7,0.6,0.3,0.4)):
- defs with four masks (maskUnits userSpaceOnUse), all gorb- prefixed:
  1. gorb-waves: a <g stroke=white fill=none strokeLinecap round> holding TWO distinct M5,50 C25,50 30,20 50,20 C70,20 75,50 95,50 arrows (up) and TWO M5,50 C25,50 30,80 50,80 C70,80 75,50 95,50 arrows (down), total 4 paths, stroke-width 7px.
  2. gorb-blurriness: white circle r50 + black ellipse rx25 ry25 (a doughnut hole) - BOTH have filter blur(7px) via CSS.
  3. gorb-clipping: white vertical ellipse rx25 ry50.
  4. gorb-fade: white ellipse rx45 ry50.
- #gorb-shapes group mask=url(#gorb-fade): two child groups - first mask=url(#gorb-clipping) with a r50 circle fill currentColor mask=url(#gorb-waves); second mask=url(#gorb-blurriness) with the same; CSS fills #gorb-shapes circle with var(--gorb-color-five) (white) and blurs the clip/blur children 7px.

THE ANIMATIONS (all CSS, prefixed gorb-):
- gorb-rotation: rotate 0 -> 360deg.
- gorb-wave-one: path d morphs from a flat line (M5,50 C10,50 15,50 20,50 C25,50 30,50 95,50) to the upward bulge (M5,50 C25,50 30,20 50,20 C70,20 75,50 95,50) and back - 1s cubic-bezier(0.7,0.6,0.3,0.4) infinite; nth-of-type(1) delay 0, nth-of-type(3) delay -0.5s.
- gorb-wave-two: same but downward bulge mask path - nth-of-type(2) & (4) run direction reverse, delay -0.5s.
- gorb-colorize: filter hue-rotate 0 -> -30 -> -60 -> -90 -> -45 -> 0 deg.
- gorb-colorblur: same hue-rotate plus blur(calc(var(--gorb-size) / 15)).

TECHNICAL:
- Self-contained <style> tag. will-change: d on the animated paths.
- Wrapper inside a w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none container with a dark radial background.
- Zero runtime JS animation.

Acceptance:
Produces the identical liquid-gradient orb: spinning specular sphere with cyan/yellow blobs, blurred red/blue shell behind, wave ripples crossing the surface via animated mask paths, and a slow hue-rotate drift - all looping forever.

`,
  "super-mario": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`};


