export const LOVABLE_PROMPTS = {
    "3d-landing-page": `
# UI HUB • LOVABLE PROMPT

You are an expert AI developer. Create a "ThreeDLandingPage" React component utilizing Tailwind CSS, 'lucide-react', '@splinetool/react-spline', and 'motion/react'. 

Build a responsive container (h-[600px] rounded-3xl) that tracks mouse movement to apply a smooth 3D tilt effect (rotateX, rotateY) to the content. The desktop view renders <Spline scene='https://prod.spline.design/WNmhHpS4PLU16Rji/scene.splinecode' /> inside a motion.div with spring-loaded rotations for a premium feel. Use a fallback <img src='/assets/3d-landing-animation.gif' /> on mobile. 

Overlay a glassmorphic Navbar (branding 'UI HUB') and a mobile hamburger menu. At the bottom, implement a hero overlay with glassmorphic cards. The main title is 'We Build Next-Gen UI Experiences'. The second description is 'Designing Next-Gen UI Systems That Make Brands Unforgettable' and the buttons are 'Explore Work' and 'Get Started'. 

Use 'Gruppo' and 'Sen' fonts imported via CSS. Ensure an exact, high-fidelity reproduction with fully functional, mouse-reactive React code.
`,
    "3d-hero": `
# UI HUB • LOVABLE PROMPT

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
    // 1. Buttons & Hover Effects
    "corner-border-button": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A sharp, high-contrast button featuring "Corner-First" border animations. It represents a clinical, military-grade interface where borders grow dynamically from the corners upon activation.

## Tech
- React + Tailwind CSS
- CSS Transitions (Width/Height)
- Absolute positioning for corner markers

## Animation Details
- **Border Growth**: Four independent <span> elements animate width or height from 0 to 100% on hover, with a staggered delay (100ms) for a sophisticated "drawing" effect.
- **Corner Squares**: Fixed 1.5x1.5px squares at top-left and bottom-right maintain visual weight.
- **Color Shift**: Instant background color transition with duration-400.

## Performance
- Pure CSS animations; zero frame drops.
- Minimal DOM nodes (button + 6 spans).

## Props
- baseColor: string (default: "#0b1a2a")
- hoverColor: string (default: "#ff3b4d")
- borderColor: string (default: "#60daff")

## Output
Production-ready React component`,


    "border-beam": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A continuous, infinite energy loop. A glowing beam of light travels along the border of any container, highlighting the edges with a high-tech "scanning" aesthetic.

## Tech
- React + Framer Motion
- CSS mask-image with linear-gradient for edge transparency
- offset-path: rect() for path-following movement

## Animation Details
- **Infinite Loop**: The beam uses offsetDistance from 0% to 100% with repeat: Infinity and ease: "linear".
- **Glow Intensity**: Box shadow applied to the moving beam to create a volumetric halo.
- **Directional Control**: Support for reverse animation and initialOffset starting points.

## Performance
- Uses offset-path (modern CSS) for efficient geometric path following.
- No JS-based coordinate calculations.

## Props
- size: number (default: 50)
- duration: number (default: 6)
- colorFrom/colorTo: string
- borderThickness: number

## Output
Production-ready React component`,

    "glow-button": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
An "Interactive Atmosphere" button. It features multiple layers of neon glow that react in real-time to the cursor position, creating a sense of depth and volumetric lighting.

## Tech
- React + Inline Styles
- Multiple Radial Gradients
- Tailwind blur-sm to blur-2xl for soft light diffusion

## Animation Details
- **Dynamic Tracking**: Mouse coordinates are mapped to % values and applied to radial-gradient centers.
- **Neon Edge**: A thin 1px gradient border that increases in opacity on hover.
- **Floating Orbs**: Independent background elements with animate-pulse for ambient lighting.

## Performance
- State-based coordinate updates optimized for React performance.
- Gradients rendered via standard CSS.

## Props
- label: string
- accentColor: string (default: emerald-500)

## Output
Production-ready React component`,

    "marquee-hover-button": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
An "Infinite Communication" button. In its resting state, it shows a static label; on hover, it transforms into a continuous marquee that slides the text infinitely across the surface.

## Tech
- React + Framer Motion
- Horizontal translation logic (x: [0, -100])
- Duplicate string concatenation for seamless loops

## Animation Details
- **Cross-Fade**: Static label fades out while the marquee div fades in (opacity transition).
- **Smooth Rolling**: Linear repeat: Infinity transition with a set duration (default 3s).
- **Layout Persistence**: Invisible spacer ensures the button does not change width during transitions.

## Performance
- CSS-based horizontal translation is highly efficient.

## Props
- label: string (default: "Button")
- duration: number

## Output
Production-ready React component`,

    "payment-transaction-button": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A "Physical Transaction" micro-interaction. A literal credit card slides upward and inserts itself into a POS terminal slot upon hover, confirming the action with a currency symbol glow.

## Tech
- React + CSS-in-JS (Style literals)
- CSS Pseudo-elements (::before, ::after) for card chips
- Cubic-bezier easing for mechanical feel

## Animation Details
- **Card Slide**: Translates from center to translate(-50%, -120%) with a 90deg rotation.
- **Slot Interaction**: Terminal slides up from bottom: -60px to bottom: 0px.
- **Signal**: Currency symbol ($) scales up (0.5 to 1) inside the terminal display after a 500ms delay.

## Performance
- High-performance CSS transitions.

## Props
- label: string
- accentColor: string
- currencySymbol: string

## Output
Production-ready React component`,

    "magic-card-effect": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A "Revealing Light" card/button interaction. A localized spotlight follows the cursor, illuminating hidden details and adding high-end polish to the border and background layers.

## Tech
- React + Framer Motion (useMotionValue, useMotionTemplate)
- Radial gradients with padding-box and border-box clipping

## Animation Details
- **Spotlight**: mouseX and mouseY variables drive a radial-gradient center.
- **Edge Illumination**: The border itself is a gradient that is "unmasked" by the spotlight position.
- **Reset**: Upon mouse leave, the spotlight animates smoothly back to its hidden position outside the container.

## Performance
- Uses Motion values to avoid React re-renders on every mouse move.
- Hardware-accelerated gradient positioning.

## Props
- gradientSize: number (default: 200)
- gradientFrom/gradientTo: string

## Output
Production-ready React component`,

    "rainbow-button": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
The "Ultra-Premium Spectrum" button. Features a high-velocity, infinitely cycling rainbow border with a diffused glowing shadow that follows the same color cycle.

## Tech
- Tailwind CSS custom keyframes (animate-rainbow)
- background-clip: padding-box and border-box
- HSL Multi-variable color system

## Animation Details
- **Spectrum Cycle**: The background-position shifts across a 5-color HSL gradient (linear-gradient 90deg).
- **Aura Glow**: A before pseudo-element with blur-lg echoes the rainbow animation underneath the button.

## Performance
- Purely CSS-driven; zero JavaScript overhead during runtime.

## Props
- variant: "default"
- size: "sm" | "default" | "lg"

## Output
Production-ready React component`,

    "social-tooltip-buttons": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
"Playful Depth" social links. Buttons that physically expand and reveal a floating, arrowed tooltip with an exaggerated "ease-back" bounce effect upon hover.

## Tech
- React + CSS Transitions
- cubic-bezier(0.68, -0.55, 0.265, 1.55) for "pop-out" bounce
- Brand-specific color mapping

## Animation Details
- **Tooltip Rise**: Tooltip moves from top: 0 to a negative -55px offset while scaling up.
- **Hover Scale**: The button itself scales to 1.1 while transitioning background from white to the brand-specific color.
- **Layering**: Text/Icon shifts color and maintains z-index over the rising background layer.

## Performance
- CSS-only transitions for smooth 60fps interaction.

## Props
- socialIcons: Array of objects (name, color, icon)

## Output
Production-ready React component`,

    "orbit-button": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A "Satellite System" interaction. Multiple particles orbit the center of the button at varying speeds and radii, creating a sense of planetary momentum that accelerates when hovered.

## Tech
- React + Framer Motion
- Nested motion divs for orbital rotation
- Multi-layer shadow/glow system

## Animation Details
- **Orbital Planes**: 5 independent particles rotating 360 degrees.
- **Hover Acceleration**: Rotation duration is halved on hover for an "energy surge" effect.
- **Interactivity**: Main button scales to 1.05 and active particles scale to 1.5 with increased brightness.

## Performance
- CSS-driven rotations for high-performance looping.

## Props
- color: "blue" | "purple" | "cyan"
- label: string

## Output
Production-ready React component`,

    "galaxy-button": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
"Deep Space" luxury button. Features a rotating conic gradient border (Aura), multiple floating star layers with parallax, and shifting nebulas for a high-end cosmic aesthetic.

## Tech
- React + Framer Motion
- Conic gradients
- Multi-layered star system

## Animation Details
- **Aura Rotation**: A conic gradient rotates 360 degrees on the border rim.
- **Nebula Drift**: Background gradients shift and rotate slowly (15s-20s) to simulate clouds.
- **Star Twinkle**: 3 layers of stars with randomized delay and scale pulsing.
- **Light Sweep**: A diagonal shimmer zips across the surface every 1.5s on hover.

## Performance
- Hardware-accelerated transforms and opacity.

## Props
- label: string
- className: string

## Output
Production-ready React component`,

    "liquid-fill-button": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
"Hydraulic Interaction" button. The button container acts as a vessel that fills with glowing liquid from the bottom up when hovered, complete with a realistic dual-wave surface.

## Tech
- React + Framer Motion
- SVG paths with linear fill
- Duel-wave physics simulation

## Animation Details
- **Liquid Rise**: A container background translates from y: 100% to y: 0% with spring damping.
- **Surface Waves**: Two overlapping SVG wave paths translate horizontally at different speeds (2s and 3s) and in opposite directions to create organic depth.
- **Label Color**: Text color swaps from neon to white as it is "submerged" in the liquid.

## Performance
- Optimized SVG path animations.

## Props
- liquidColor: string
- label: string

## Output
Production-ready React component`,


    // 2. 3D & WebGL Experiences

    "3d-scroll-animation": `
# UI HUB • LOVABLE PROMPT

Create a visually stunning "3D Scroll Animation" component.

## Concept
An elite, scroll-linked 3D experience featuring a frame-by-frame scrubbing animation of a high-fidelity 3D character or object. The character seems to physically move through space as the user scrolls, with secondary typography layers revealing insights in a cinematic, blur-driven entrance pattern.

## Tech
React, GSAP (ScrollTrigger), HTML5 Canvas (2D Context), Framer Motion, Tailwind CSS.

## Animation Details
- **Scroll Scrubbing**: 300-frame image sequence preloaded into memory and scrubbed via GSAP's \`ScrollTrigger\` mapped to a Canvas 2D engine.
- **Cinematic Reveals**: Text layers (\`Page 0\`, \`Page 1\`, etc.) utilize \`blur-in/blur-out\` transitions combined with \`y-axis\` translation, staggered across the scroll range.
- **Interactive Marquee**: An infinite horizontal text marquee (\`animate-marquee\`) that fades out as the user enters the scrubbing phase.
- **Progress Tracking**: A sleek, minimal loader with a percentage counter and a growing progress bar that tracks 3D asset initialization.

## Performance
- **Image Preloading**: Parallel preloading of 300 PNG frames with progress tracking to ensure 60fps scrubbing with no stutter.
- **Canvas Rendering**: High-performance frame drawing using \`requestAnimationFrame\`-compatible logic and \`drawImage\` scaling optimization (cover-fit math).
- **Memory Management**: Automatic cleanup of GSAP timelines and ScrollTrigger instances on unmount.

## Props
- className: string
- showDemoButton: boolean (Toggles "View Full Demo" external link overlay)

## Output
Production-ready React component`,
    "3d-slider": `
# UI HUB • LOVABLE PROMPT

Create a visually stunning "3D Slider" component.

## Concept
A premium perspective-driven gallery where the current active slide occupies the full background, while upcoming slides appear as smaller, depth-defying 3D cards that seem to follow a cylindrical or layered path. The transition is extremely smooth, moving from card-view to full-screen background seamlessly.

## Tech
React, CSS 3D Transforms (Perspective, TranslateZ), Tailwind CSS, Inter/Google Fonts.

## Animation Details
- **Perspective Track**: Upcoming cards utilize \`translateY(-50%)\` and graduated \`left\` offsets to create a physical depth effect.
- **Active Transition**: The 2nd child in the slide array expands to \`100% width/height\` with \`0 radius\` to become the immersive background.
- **Staggered Text**: Titles and descriptions use \`slideUpFade\` animations with \`filter: blur(10px)\` and gradual \`y\` translation (0.2s, 0.4s, 0.6s delays).
- **Glow Accents**: Dynamic CSS variables (\`--accent\`) applied to text shadows and button backgrounds for slide-specific branding.
- **Interaction**: Automatic interval-driven cycling plus high-sensitivity touch/swipe support for mobile devices.

## Performance
- **Hardware Acceleration**: Heavy use of \`translate3d\` and \`will-change\` to offload transitions to the GPU.
- **DOM Efficiency**: Array rotation logic (\`shift\`/\`push\`) for circular navigation without over-mounting.
- **Responsive Adaptive**: Cards automatically hide or scale down on mobile to preserve layout integrity.

## Props
- slides: Array<{id, title, description, image, accentColor}>
- autoPlay: boolean
- interval: number (ms)
- className: string

## Output
Production-ready React component`,

    // 3. Backgrounds (17 High-Fidelity Prompts)
    "grid-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A clean, modern geometric grid that feels structured yet atmospheric. It represents a digital canvas, providing a professional technical backdrop for sophisticated UI elements.

## Tech
- React + Tailwind CSS
- CSS linear-gradient for grid lines
- CSS mask-image with radial-gradient for soft edge vignetting

## Animation Details
- Static grid pattern
- Optional: Smooth transitions on grid size or color changes using CSS transition

## Performance
- Ultra-lightweight; uses standard CSS background properties
- No JS overhead for rendering

## Props
- gridSize: number (default: 24)
- gridColor: string (default: "#80808012")
- maskRadius: string/number (default: "50% 50% at 50% 50%")
- opacity: number (default: 1)
- label: string (optional)

## Output
Production-ready React component`,

    "hacker-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
The classic "Matrix Rain" aesthetic, reimagined for modern web apps. It evokes a sense of deep-tech, terminal-style hacking, and digital flow, with characters cascading down a pitch-black void.

## Tech
- React + HTML5 Canvas (2D Context)
- requestAnimationFrame for high-performance fluid motion
- Custom character set (Alphanumeric + Special Characters)

## Animation Details
- Independent columns of characters falling at different speeds
- Fading trail effect achieved by periodic semi-transparent clearing (ctx.fillStyle = 'rgba(0, 0, 0, 0.05)')
- Randomized respawning of character "drops"

## Performance
- Canvas-based; handles hundreds of characters with minimal CPU impact
- Component is responsive to its parent container size

## Props
- color: string (default: "#0F0")
- fontSize: number (default: 15)
- speed: number (default: 1)

## Output
Production-ready React component`,

    "novatrix-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A deep, immersive cosmic nebula effect. Soft gradients and pulsing light create a sense of vast space and premium elegance, perfect for hero sections.

## Tech
- React + Tailwind CSS
- Advanced CSS gradients (bg-gradient-to-br)
- Custom CSS keyframe animations for rotation and pulsing

## Animation Details
- pulse: Slow breathing effect on the background gradient
- spin-slow: A subtle, large radial-gradient glow that rotates slowly (20s duration) to create shifting light patterns
- fade-in: Smooth entrance animation for the container

## Performance
- Pure CSS animations; extremely efficient and battery-friendly

## Props
- colorFrom: string (default: "#1e1b4b")
- colorTo: string (default: "#581c87")
- title: string (optional overlay)

## Output
Production-ready React component`,

    "beam-grid-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A high-tech grid where energy beams travel along the axes. It feels alive and interactive, reacting to user presence with localized cell illumination.

## Tech
- React + HTML5 Canvas (2D Context)
- Off-screen buffer canvas for pre-rendered static grid (optimization)
- High-DPI (Retina) support using devicePixelRatio
- Dark mode detection

## Animation Details
- Energy Beams: Randomized beams with glow effects traveling along grid lines
- Interactive Highlight: Cursor-aware square cell illumination that snaps to the grid
- Idle Mode: Beams continue moving with an optional speed multiplier when inactive

## Performance
- Optimized using a buffer canvas for the static grid to reduce draw calls per frame
- Radial mask fade applied via CSS to soften the edges of the canvas

## Props
- gridSize: number (default: 40)
- beamColor: string
- beamSpeed: number
- interactive: boolean (true/false)
- glowIntensity: number

## Output
Production-ready React component`,

    "fall-beam-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A futuristic "digital rain" of light beams. Vertical streaks of light with glowing heads fall through the screen with randomized timing, creating a vertical parallax effect.

## Tech
- React + Dynamic DOM nodes
- CSS Variables for per-line randomization
- CSS Keyframes for the falling motion

## Animation Details
- fall: Vertical movement from top to bottom with a tail-glow gradient
- Randomized animation-duration (8s-18s) and animation-delay for a natural, non-synchronized look

## Performance
- Uses CSS animations instead of Canvas for better integration with standard DOM content/layouts

## Props
- lineCount: number (default: 20)
- beamColor: string
- displayText: string (optional centered hero text)
- opacity: number

## Output
Production-ready React component`,

    "hell-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
An organic, liquid-fire flow effect. It feels primal and intense, using complex shader math to simulate swirling heat or molten energy.

## Tech
- React + WebGL
- Custom GLSL Shaders (Vertex & Fragment)
- Uniform-based control for colors and time

## Animation Details
- Time-based flow: Complex coordinate transformations in the fragment shader create a self-looping organic pattern
- Shifting colors based on custom RGB inputs

## Performance
- GPU-accelerated through WebGL; ensures 60FPS even with complex math across the entire viewport
- Automatic canvas resizing to match container

## Props
- color: string (hex format)
- backdropBlurAmount: string (Tailwind blur sizes)

## Output
Production-ready React component`,

    "interactive-grid-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A highly responsive grid that follows the user's cursor with a glowing light box. It feels like the UI is physically reacting to the mouse, leaving a subtle trail of light.

## Tech
- React + HTML5 Canvas (2D)
- Snapping logic to align highlights with the grid
- Dark mode detection

## Animation Details
- Cursor Trail: A sequence of glowing grid cells that fade out over time
- Idle Movement: Random grid cells illuminate and move to new targets when the mouse is stationary

## Performance
- Efficient Canvas clearing and redrawing with optimized alpha calculations for the trail

## Props
- gridSize: number (default: 50)
- effectColor: string (rgba/hex)
- trailLength: number
- glowRadius: number

## Output
Production-ready React component`,


    "wave-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A mesmerizing, fluid wave simulation that creates a relaxing yet high-tech atmosphere. It mimics light reflecting off surfaces or ethereal liquid flow.

## Tech
- React + WebGL + GLSL
- Framer Motion useInView for smart lifecycle management
- Uniform-based shader controls

## Animation Details
- Sinusoidal wave blending in the fragment shader using nested sin functions
- Time-based offsets to simulate continuous liquid movement

## Performance
- Smart Pause: Animation automatically loops the render call only when the component is visible in the viewport using framer-motion's observer.

## Props
- speed: number
- intensity: number
- backdropBlurAmount: string

## Output
Production-ready React component`,

    "lines-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
Elegant, floating organic lines (paths) that weave through the background. It creates a sophisticated, almost architectural feel, combined with premium typography.

## Tech
- React + Framer Motion (SVG animation)
- SVG Bezier Curves
- Staggered spring animations for text

## Animation Details
- Path Animation: Lines animate their pathLength from 0.3 to 1 and shift their pathOffset for a continuous flowing look
- Text Entrance: Characters appear with a spring-loaded "y" translation and fade-in, staggered across words

## Performance
- Uses SVG motion.path which is hardware-accelerated for smooth 60FPS path drawing

## Props
- title: string (Hero text to animate)
- pathColor: string
- opacity: number

## Output
Production-ready React component`,

    "sparkles-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A premium, star-dusted background that feels magical and clean. It uses tiny glowing specks of light to add texture and depth to the dark UI.

## Tech
- React + Framer Motion
- External Particle Core (SparklesCore)
- CSS mask-image with radial gradient for center-focusing

## Animation Details
- Fine-grained twinkling particles
- Title entrance uses spring physics for individual characters with a custom text-glow effect

## Performance
- Efficient handling of high particle density with a soft radial mask to focus rendering complexity in the center

## Props
- particleColor: string
- density: number
- minSize/maxSize: number   

## Output
Production-ready React component`,

    "isometric-grid-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A 3D isometric perspective grid of interactive cubes. It gives the feeling of a tactile, digital surface that rewards exploration with pops of color.

## Tech
- React + Framer Motion
- CSS 3D Transforms (skew, rotate, scale)
- SVG markers for grid intersections

## Animation Details
- Isometric View: Established via global skew and rotation on the grid container
- Box Hover: Immediate color change on hover with a slow fade-out back to the base state

## Performance
- Uses React.memo to prevent unnecessary re-renders of the large grid of boxes

## Props
- rowsCount/colsCount: number
- customColors: string array (palette for hover effect)

## Output
Production-ready React component`,

    "space-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A vast, immersive deep space simulation. It features layered starfields, shifting nebulas, and rare cosmic events like shooting stars and star shattering.

## Tech
- React + HTML5 Canvas (2D)
- Multi-layer parallax logic
- Custom fragment/particle physics

## Animation Details
- Layered Parallax: Mouse movements shift stars at different intensities based on their "layer"
- Star Twinkling: Individual stars oscillate opacity at randomized speeds
- Shatter Event: Rare "unstable" stars that explode into sharp geometric fragments with physics-based dispersion

## Performance
- Uses optimized Canvas draw calls; handles 400+ stars and nebulas with ease
- Particle cleanup logic for fragments to prevent memory bloat

## Props
- starCount: number
- nebulaCount: number
- interactive: boolean

## Output
Production-ready React component`,


    "black-hole-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
An astronomical simulation of a gravitational singularity. Light and matter (particles) are pulled into a central dark core, accelerating as they cross the event horizon.

## Tech
- React + HTML5 Canvas (2D)
- Radial gradient "Core" effects
- Spiral/Gravity physics

## Animation Details
- Spiral Physics: Particles move along a decreasing radius with angular velocity
- Core Shift: Mouse movement subtly tilts the orientation of the whole black hole
- Gravitational Acceleration: Particles speed up as they get closer to the center before being recycled to the outer bounds

## Performance
- Efficient recycling of particles (respawn at edge) to maintain constant density

## Props
- particleCount: number
- coreColor: string
- accentColor: string

## Output
Production-ready React component`,


    "mouse-gravity-background": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A playful physics playground where particles are magnetically attracted to the user's cursor. It creates an aura of energy that follows you throughout the page.

## Tech
- React + HTML5 Canvas (2D)
- Velocity-based attraction physics (F = G * m1*m2 / r^2 logic)
- Damping/Friction simulation

## Animation Details
- Attraction: Particles within a radius accelerate towards the mouse
- Dynamic Spawning: Short-lived trail particles are continuously spawned at the mouse position while active
- Drift: Particles maintain random ambient movement when not influenced by gravity

## Performance
- Dynamic particle pool management; automatically filters out-of-life particles

## Props
- particleCount: number
- attractionRadius: number
- attractionForce: number
- enableTrail: boolean

## Output
Production-ready React component`,

    // 4. Cursors & Interaction
    "target-cursor": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning tactical cursor.

## Concept
A high-tech tracking system. Reactive corners that "lock on" to interactive elements by physical snapping, combined with an idle scanning rotation and subtle parallax movement.

## Tech
- React + requestAnimationFrame
- CSS 3D Transforms (translate, rotate)
- mix-blend-mode: difference for high visibility

## Animation Details
- **Idle State**: Center dot pulses; corners rotate slowly (360° over 2s).
- **Lock-on**: Corners snap to target element dimensions with cubic-bezier easing.
- **Micro-Parallax**: Cursor positions itself at center + 15% mouse offset when locked, creating a 3D depth effect.
- **Smoothing**: Position interpolation using \`current += (target - current) * 0.2\`.

## Performance
- Zero-dependency DOM-based animation; hardware accelerated transforms.

## Props
- targetSelector: string
- spinDuration: number
- hoverDuration: number
- hideDefaultCursor: boolean
- parallaxOn: boolean

## Output
Production-ready React component`,

    "black-hole-cursor": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning cosmic cursor.

## Concept
An immersive astronomical singularity. It features a dense gravitational core that pulls star particles into a swirling accretion disk, set against deep space nebulas.

## Tech
- React + HTML5 Canvas (2D)
- Multi-layered CSS animations
- CSS filters (blur, brightness)

## Animation Details
- **Gravitational Pull**: Particles accelerate towards the cursor using radial distance math (F = (R-d)/R).
- **Singularity Core**: Event horizon (singularity) with a multi-layered accretion disk (Golden Plasma, Cyan Inner Disk, Violet Flare).
- **Accretion Disk**: 3 concurrent keyframe animations: \`bh-accretion-plasma\` (12s skew/rotate), \`bh-accretion-inner\` (5s rotate), \`bh-photon-ring\` (3s scale pulse).
- **Spiral Physics**: Force-based tangential velocity creates a localized vortex.

## Performance
- Optimized canvas clearing; particle recycling system (respawn at edges).

## Props
- gravityRadius: number
- containerRef: React.RefObject

## Output
Production-ready React component`,

    "magnetic-cursor": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning interactive cursor.

## Concept
A dual-layer "energy field" cursor. It consists of a precise focal dot and a lagging protective halo that exerts a physical magnetic pull on specialized UI elements.

## Tech
- React + Velocity-based Spring Physics
- Dynamic MutationObserver for element registration
- CSS custom properties for hover states

## Animation Details
- **Async Lag**: Focal dot (high stiffness) and Halo (low stiffness) follow the mouse at different rates.
- **Magnetic Influence**: Nearby elements marked with \`[data-magnetic]\` physically shift towards the cursor (38% attraction strength) with localized shadow expansion.
- **Smoothing**: Velocity damping (0.72 for dot, 0.80 for halo) for liquid-smooth motion.

## Performance
- No React state used for physics loop (Refs only); 60FPS consistent.

## Props
- magnetRadius: number
- cursorSize: number

## Output
Production-ready React component`,

    "aurora-cursor": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning ambient cursor.

## Concept
A soft, morphing blob of light inspired by the Borealis. It continuously shifts shape, color, and intensity, flowing across the screen like ethereal plasma.

## Tech
- React + Spring Physics
- Multiple overlapping radial-gradients
- mix-blend-mode: screen

## Animation Details
- **Morphing Physics**: \`aurora-morph\` keyframes shift border-radius between 8 complex states (0% to 100%).
- **Color Drift**: \`aurora-shift\` oscillates background-position across a 5-color cyan/purple/indigo/pink/indigo palette.
- **Pulse**: Intensity oscillates (55% to 75% opacity) to simulate atmospheric flickering.
- **Interactive Scale**: Scales to 1.35x when hovering interactive elements.

## Performance
- Pure CSS keyframe animations for visuals combined with JS-spring for tracking.

## Props
- size: number
- stiffness: number
- damping: number

## Output
Production-ready React component`,

    "heart-cursor": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning playful cursor.

## Concept
A romantic, neon-infused cursor. A glowing purple heart that leaves a trail of expanding, soft-blur ripples in its wake.

## Tech
- React + HTML5 Canvas 2D (Ripples)
- SVG Filters (Drop Shadow)
- CSS Animations

## Animation Details
- **Pulse Animation**: \`heart-pulse\` keyframes oscillate scale and drop-shadow intensity (8px to 15px blur).
- **Canvas Ripples**: Periodic spawning (100ms) of radial gradient circles that expand and fade simultaneously.
- **Motion Easing**: 0.15 easing on position for a soft, "floaty" tracking feel.

## Performance
- Efficient ripple cleanup logic; canvas-driven trail ensures no DOM bloat.

## Props
- size: number
- glowIntensity: number
- trailSpeed: number

## Output
Production-ready React component`,

    "lizard-cursor": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning procedural cursor.

## Concept
A high-performance biological simulation. A skeletal lizard entity that navigates the screen using organic Inverse Kinematics (IK), reacting to surface impacts.

## Tech
- React + HTML5 Canvas 2D
- Procedural Inverse Kinematics (IK)
- Segmented physics classes

## Animation Details
- **Biological Motion**: Multi-segmented spinal column with hierarchical child segments (Legs, Feet, Tail).
- **Leg System**: Independent step logic for 4 limbs; legs lift and plant based on body reach and forwardness.
- **Reaction**: Global "Strike" effect on mouse down; head lunges forward with high lerp factor (0.6).
- **Impact Logic**: Animated ripple pulse at the click coordinate.

## Performance
- Class-based procedural logic optimized for high segment counts.

## Props
- color: string
- size: number
- interactive: boolean

## Output
Production-ready React component`,

    "venom-cursor": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning visceral cursor.

## Concept
A dark, symbiotic lifeform. A swarm of procedurally animated entities that "wriggle" through the interface using organic noise-based motion.

## Tech
- React + HTML5 Canvas 2D
- Sine-wave Noise Generation
- Procedural Walking Algorithms

## Animation Details
- **Symbiotic Movement**: Multiple spawned entities following a "walk radius" with randomized velocity seeds.
- **Wriggle Logic**: Sine-wave based noise (\`sin(0.3 * x + 1.4 * t + ...)\`) applied to line segments for organic flickering.
- **Interaction**: Swarm clusters tightly around mouse but maintains internal chaos.

## Performance
- Math-heavy but lightweight drawing (simple lines and ellipses); 60FPS.

## Props
- color: string
- interactive: boolean

## Output
Production-ready React component`,

    "3d-tubes-cursor": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning 3D cursor.

## Concept
A high-energy neon trail. Multiple 3D tubes of light that "paint" the screen in three-dimensional space, responding to the camera's perspective.

## Tech
- React + Three.js
- Custom Geometry (TubeBufferGeometry)
- Dynamic Lighting System

## Animation Details
- **3D Trailing**: Tubes connect historical mouse coordinates in 3D space with smooth bezier curves.
- **Neon Glow**: Dynamic point lights with high intensity (200) follow the tube leading edges.
- **Depth Interaction**: Trailing segments fade out in both opacity and thickness over time.

## Performance
- WebGL accelerated; dynamic geometry disposal to prevent memory leaks.

## Props
- colors: string[]
- lightColors: string[]
- lightIntensity: number

## Output
Production-ready React component`,

    // 5. Text Animations (11 High-Fidelity Prompts)
    "blur-text": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A professional, cinematic text entrance. Content emerges from a deep blur into sharp focus, mimicking a camera lens adjusting to its subject.

## Tech
- React + Framer Motion
- CSS Filter (blur)
- Intersection Observer (whileInView)

## Animation Details
- **Focus Shift**: Initial state is \`filter: blur(10px)\` and \`opacity: 0\`.
- **Entrance**: Animates to \`blur(0px)\` and \`opacity: 1\` over 800ms with a smooth \`easeOut\`.
- **Trigger**: Activates when the element enters the viewport.

## Performance
- GPU-accelerated filter transitions.
- Efficient scroll-triggering via Framer Motion's built-in observer.

## Props
- text: string
- className: string

## Output
Production-ready React component`,

    "fade-text": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A clean, minimalist entrance. Text appears via a smooth opacity transition, ideal for subtle headers or ambient messaging.

## Tech
- React + Framer Motion
- Opacity transitions

## Animation Details
- **Entrance**: Linear or ease-in-out opacity transition from 0 to 1.
- **Duration**: Adjustable timing (default 1.5s) for varying emphasis.

## Performance
- Simple opacity animation; extremely lightweight.

## Props
- text: string
- duration: number
- className: string

## Output
Production-ready React component`,

    "dock-text": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A standard "Pop-In" header effect. Text scales up from a slightly smaller size while fading in, giving it a sense of physical arrival.

## Tech
- React + Framer Motion
- Scale + Opacity transforms

## Animation Details
- **Arrival**: Scales from 0.8 to 1.0 simultaneously with opacity 0 to 1.
- **Physics**: Uses standard ease for a predictable, clean arrival.

## Performance
- Lightweight scale/opacity transforms.

## Props
- text: string
- className: string

## Output
Production-ready React component`,

    "font-weight": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A "Living Typography" effect. The text physically breathes, with its font-weight continuously oscillating between light and heavy weights, creating a rhythmic, organic feel.

## Tech
- React + Framer Motion
- Variable Font support
- State-driven weight interpolation

## Animation Details
- **Breathing Lifecycle**: Oscillates between weight 400 and 900 every 1 second.
- **Smoothness**: Uses \`easeInOut\` transition to ensure the weight shift feels fluid, not stepped.

## Performance
- Efficient CSS variable font interpolation.

## Props
- text: string
- className: string

## Output
Production-ready React component`,

    "gradual-spacing": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
"Expanding Intelligence." Text characters begin condensed and expand outward into their natural letter-spacing, suggesting a blossoming of information.

## Tech
- React + Framer Motion
- Character-level splitting
- Letter-spacing interpolation

## Animation Details
- **Staggered Expansion**: Each character starts at \`letter-spacing: 1em\` and \`opacity: 0\`.
- **Timing**: animates to \`0.1em\` and \`opacity: 1\` with a 50ms stagger between letters.
- **Duration**: 1.5s total duration per character for a deliberative feel.

## Performance
- Individual character motion.span elements; use for short/medium titles only.

## Props
- text: string
- className: string

## Output
Production-ready React component`,

    "letter-pull-up": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A "Stage Entrance" for typography. Each character slides up from beneath a hidden baseline, appearing like a row of mechanical tiles being flipped into place.

## Tech
- React + Framer Motion
- Overflow-hidden clipping
- Y-axis translation

## Animation Details
- **Slide Up**: Translates from \`y: 100%\` to \`y: 0\`.
- **Staggering**: Sequential 50ms delay between each character.
- **Clipping**: High-precision \`overflow-hidden\` container ensures characters appear from thin air at the baseline.

## Performance
- Efficient Y-axis transforms.

## Props
- text: string
- className: string

## Output
Production-ready React component`,

    "multi-direction-slide": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
"Chaotic Convergence." Characters fly in from seemingly random directions (Top-Left/Bottom-Left) along the horizontal plane, snapping perfectly into place to form the final word.

## Tech
- React + Framer Motion
- Zig-zag coordinate seeding (modulo logic)

## Animation Details
- **Entropic Inbound**: Even indices start at \`y: -20, x: -50\`. Odd indices start at \`y: 20, x: -50\`.
- **Target**: Converge on \`0, 0\` with opacity 1 over 800ms.
- **Stagger**: 50ms per character for an organic ripple.

## Performance
- Moderate Complexity due to individual X/Y axis calculations.

## Props
- text: string
- className: string

## Output
Production-ready React component`,

    "scale-letter": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
"Elastic Growth" text. Characters pop into existence with a bouncy, spring-based scale animation, making the headline feel playful and energetic.

## Tech
- React + Framer Motion
- Custom Cubic Bezier for "Snap-Back" (0.34, 1.56, 0.64, 1)

## Animation Details
- **Spring Scale**: Scales from 0 to 1 with an overshoot (1.56 value in bezier) for a bouncy feel.
- **Opacity Fade**: Fades in simultaneously over 500ms.

## Performance
- Standard scale/opacity transforms.

## Props
- text: string
- className: string

## Output
Production-ready React component`,

    "separate-away": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
"Sliding Assembly." Characters march in from the left side of their final position, creating a "shunting" visual where the word builds itself from left-to-right.

## Tech
- React + Framer Motion
- Negative X-axis offsets

## Animation Details
- **Linear Slide**: Character starts at \`x: -20\` with \`opacity: 0\`.
- **Stagger**: Slow 80ms delay between letters for a deliberate "marching" cadence.
- **Transition**: 800ms duration for a smooth, non-aggressive arrival.

## Performance
- Lightweight X-axis transforms.

## Props
- text: string
- className: string

## Output
Production-ready React component`,

    "wavy-text": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
"Liquid Typography." A continuous, sine-wave oscillation that ripples through the text indefinitely, giving it a playful, underwater, or ethereal vibe.

## Tech
- React + Framer Motion
- Keyframe-based loop animation

## Animation Details
- **Oscillation**: Keyframes move character \`y\` position from \`[0, -20, 0]\`.
- **Infinite Loop**: \`repeat: Infinity\` with \`easeInOut\` for seamless periodicity.
- **Stagger**: 100ms phase shift between characters creates the wave crest.

## Performance
- Continuous animation; monitor CPU usage if used on long blocks of text.

## Props
- text: string
- className: string

## Output
Production-ready React component`,

    "word-pull-up": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A "Major Announcement" header. Instead of individual letters, full words slide up from the baseline in a rhythmic 1-2-3 sequence, perfect for bold slogans.

## Tech
- React + Framer Motion
- Word-level splitting (split by " ")
- Flexbox alignment with gap

## Animation Details
- **Block Motion**: Each word translates from \`y: 100%\` to \`y: 0\`.
- **Heavy Stagger**: 200ms delay between words to emphasize each part of the message.
- **Duration**: 800ms for a solid, meaningful entrance.

## Performance
- More efficient than character-level splitting for long sentences.

## Props
- text: string
- className: string

## Output
Production-ready React component`,

    "3d-rubiks-cube": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning "3D Rubiks Cube" component.

## Concept
A fully interactive, high-fidelity 3D Rubiks Cube simulation. It features smooth inertia-based rotation, a sophisticated scramble algorithm, and an automated solver that retraces the user's moves. The aesthetic is "Elite Lab" with a dark aura, glassmorphism UI controls, and high-quality cubie textures.

## Tech
- React + CSS 3D Transforms (matrix3d)
- Tailwind CSS
- DOMMatrix API for precise 3D math

## Animation Details
- **3D Inertia**: The cube follows mouse/touch drag with velocity-based momentum and a "snap-to-grid" rotation logic.
- **Layer Rotation**: Smooth transition-based layer turns using a pivot proxy for complex 3D assembly.
- **Solve Logic**: A recursive history-reversal solver with staggered move timings.
- **Visual Polish**: Glossy overlays on cubie faces, a rotating background aura, and a cyberpunk terminal status display.

## Performance
- Uses Ref-based DOM manipulation for the cube scene to ensure 60fps interaction.
- Leverages DOMMatrix for mathematically accurate 3D transformations without heavy external libraries.

## Props
- className: string

## Output
Production-ready React component`,

  "hoodiebot": `# UI HUB • LOVABLE PROMPT

Create a premium "HoodieBot" 3D character component using React, TypeScript, and Tailwind CSS. Ensure it has interactive animations, sound effects, and floating UI elements exactly as shown in the reference code.`,

  "smilo": `# UI HUB • LOVABLE PROMPT

Create a premium "Smilo" 3D character component using React, TypeScript, and Tailwind CSS. Ensure it has interactive animations, sound effects, and floating UI elements exactly as shown in the reference code.`,

  "tripy": `# UI HUB • LOVABLE PROMPT

Create a premium "Tripy" 3D character component using React, TypeScript, and Tailwind CSS. Ensure it has interactive animations, sound effects, and floating UI elements exactly as shown in the reference code.`,

  "aiva": `# UI HUB • LOVABLE PROMPT

Create a premium "Aiva" 3D character component using React, TypeScript, and Tailwind CSS. Ensure it has interactive animations, sound effects, and floating UI elements exactly as shown in the reference code.`,

  "laptopbot": `# UI HUB • LOVABLE PROMPT

Create a premium "LaptopBot" 3D character component using React, TypeScript, and Tailwind CSS. Ensure it has interactive animations, sound effects, and floating UI elements exactly as shown in the reference code.`,

  "interactive-hover-button": `# UI HUB • LOVABLE PROMPT
Create a visually stunning "Interactive Hover Button" component.

## Concept
A beautiful, highly interactive button featuring custom hover and click micro-interactions. On hover, a circular background expands dynamically to cover the button, while the text translates and reveals an animated arrow. On click, the arrow transitions into a checkmark. It supports default, neon, and dark aesthetic variants.

## Tech
- React + Framer Motion (scale, translation, AnimatePresence)
- Lucide React (ArrowRight, Check)
- Tailwind CSS
- clsx / tailwind-merge

## Animation Details
- **Background Expansion**: A small circle centered at the right side scales up (scale: 300) on hover to cover the whole background seamlessly.
- **Icon Swap**: AnimatePresence handles the transition from ArrowRight to Check icon upon click, with a staggered fade-in/out.
- **Text Slide**: The label text moves to the left/right slightly on hover to balance the layout as the icon slides in from the right.

## Performance
- Uses hardware-accelerated transforms for scale and translate.
- Zero layout shifts.

## Props
- children: React.ReactNode
- className: string
- variant: 'default' | 'neon' | 'dark'
- text: string

## Output
Production-ready React component
`,
    "corner-button": `
# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A premium action button framed by corner brackets that ignite with a laser-glow burst on hover. It reads like studio-branded UI: a logo mark on the left, an uppercase label in the middle, and an action icon on the right.

## Tech
- React + Tailwind CSS
- Scoped CSS via a <style> tag stamped with a useId-generated id, so styles never leak to the rest of the page.
- lucide-react for the trailing action icon.

## Animation Details
- **Corner Brackets (Rest -> Hover)**: Four corner pieces (~14px) that extend to ~100% along their edges on hover/focus, completing a rounded-tech frame around the button.
- **Glow Ignition**: A radial-gradient halo behind the button fades in on hover in the accent color, like a laser pulse.
- **Icon & Logo Motion**: The logo slides slightly left and the trailing icon slides slightly right on hover for a tactile feel.
- **Color**: Every accent (brackets + glow) is driven by one accentColor prop.

## Performance
- Pure CSS transitions (transform/opacity only) - 60fps, zero frame drops.
- ~8 lightweight DOM nodes; decorative layers are pointer-events: none.
- useId-scoped styles prevent cascade side effects.

## Props
- children: React.ReactNode (default: 'Start designing') - the button label.
- accentColor: string (default: '#FF3B4D') - bracket and glow color.
- showTitleImage: boolean (default: true) - toggle the brand mark.
- titleImage: string | null (default: built-in UI HUB mark) - brand logo URL (URL or data URI).
- titleImageAlt / titleImageClassName - alt text and sizing classes for the mark.
- icon: LucideIcon (default: Pencil) - trailing action icon.
- className: string (default: '').

## Styling Guide
- Resting corners ~14px, hover corners ~100% of the edge.
- Label styled uppercase with generous letter-spacing (tracking-widest ~0.2em).
- Keep hover state focus-visible for accessibility.
- Scale the whole button down gracefully on screens under 480px.

## Output
Production-ready React component
`,
    "creepy-button": `# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A cute-creepy button: two tiny white eyes peek out from beneath a blue cover face. The pupils track your cursor through the button, blink every three seconds, and the cover tilts playfully to the side whenever you hover.

## Tech
- React + Tailwind CSS
- framer-motion for spring cover tilt and looping blink animation
- Absolute-positioned eye layer + cover layer with an invisible placeholder to preserve layout size

## Animation Details
- **Eye Tracking**: Compute the angle from the eye center to the cursor with atan2, then move pupils within visionRangeX (180) and visionRangeY (75) so they never leave the eye socket.
- **Blink**: A 3s repeating keyframe squashes the eye height to 0 for a few milliseconds (times 0, 0.92, 0.96, 1).
- **Cover Tilt**: On hover the cover springs to -12° rotation (origin [1.25em 50%]) for a cheeky sideways reveal of the eyes.
- **Reset**: Pupils snap back and the cover straightens when the pointer leaves or the button loses focus.

## Performance
- GPU-friendly transforms only (rotate + translate) and lightweight state changes.
- Eyes are pointer-events: none so the button stays fully clickable.
- Touch events handled via onTouchMove for mobile.

## Props
- children: React.ReactNode - the button label.
- className: string (default: '') - container classes.
- coverClassName: string (default: '') - classes for the tilting cover face.
- onClick and all native button props pass through.

## Styling Guide
- Button base: black rounded container, min-w 9em.
- Eyes: white circles 0.75em with black pupils 0.375em, sitting bottom-right of the button.
- Cover: blue (bg-blue-500) with an inset black ring shadow, bold uppercase tracking-wider label.
- Keep the focus-visible ring for accessibility.

## Output
Production-ready React component
`,

    "radial-glow-button": `# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A slick, modern gradient button with a constantly drifting radial glow, a 1px animated gradient border, and a rotating light spark that sweeps across the face when hovered. Feels premium and alive without any JavaScript animation.

## Tech
- React + Tailwind CSS
- Pure CSS powered by @property-registered CSS custom properties so colors and numbers interpolate smoothly.
- cn utility only for merging the extra className.

## Animation Details
- **Gradient drift**: The radial gradient's center position, spread, color stack, and color stops are all @property variables; hover retunes them (0.75s transitions).
- **Border frame**: A mask-composite: exclude ::before layer draws a 1px gradient border whose angle rotates on hover.
- **Light sweep**: A container-sized square (aspect-ratio 1) slides across the button (100cqw) while a conic-gradient spark rotates behind it (rg-spin), shown only on hover via --button-line-opacity, blended soft-light.
- **Cut edge**: A 1px inset layer (rg-bg) repaints the gradient so the edge stays crisp.

## Performance
- Zero JS animation - everything is CSS transitions/keyframes on registered custom properties (GPU friendly).
- Lightweight: one button + three spans + a single <style> tag.

## Props
- children: React.ReactNode (default: 'Get Extension') - the label.
- className: string (default: '') - merged onto the button.
- All native button attributes pass through.

## Styling Guide
- Button base: min-width 160px, min-height 51px, padding 16px 24px, radius 11px.
- Text: white at 0.95 opacity with a subtle dark text-shadow.
- Wire every animatable value as an @property (with syntax and initial-value) or the transitions will snap.

## Output
Production-ready React component
`,

    "spider-web": `# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
A delicate orb web strung across the whole frame. The silk bows where your pointer passes over it and springs back once you move on, like the web is breathing. At rest it sits completely still — no animation cost until you touch it.

## Tech
- React + TypeScript + Vite
- HTML5 Canvas 2D rendering (no WebGL, no animation libraries)
- A WebScene class that owns the canvas, the physics loop, and pointer events
- ResizeObserver so the web rebuilds to fit whatever container it lives in

## Animation Details
- **Spring silk**: every web intersection is a particle on a damped spring (stiffness 460, damping derived from stiffness) pulling back to its home position; integrate with capped dt.
- **Pointer push**: a squared-falloff force pushes nearby nodes away from the cursor, dragging neighbours along through the strands.
- **Curved strands**: rings are drawn as quadratic curves that bow toward the centre (sag), radials go from centre to the far pinned ring; the outer ring sits past the corners so silk runs off the edge.
- **Auto-park**: the animation loop stops itself when everything is still and no pointer is near, and wakes back up on pointermove.

## Performance
- Zero JS animation when idle (loop parks itself).
- Canvas sized to devicePixelRatio (capped at 2) for crisp retina lines.
- Deterministic hash wobble keeps the web identical frame to frame.

## Props
- color: string (default: '#DCE6FF') - silk color.
- opacity: number (default: 100) - web opacity.
- segments: number (default: 28) - spokes.
- rings: number (default: 14) - concentric rings.
- thickness: number (default: 3) - silk weight.
- sag: number (default: 20) - how much strands bow inward.
- irregularity: number (default: 0) - wobble.
- hoverIntensity: number (default: 20) - pointer push.
- nodes: boolean (default: false) - draw intersection dots.
- nodeColor, nodeSize - dot styling.
- style - extra wrapper styles.

## Styling Guide
- The component fills 100% of its parent (relative, overflow hidden), so give it a bounded container with its own background.
- Silk should read as faint neon thread on a dark backdrop — pick a light color like #DCE6FF.

## Output
Production-ready React component`,

        "infinity-image": `# UI HUB • LOVABLE PROMPT

You are an expert AI developer. Create an "InfinityImage" React component in TypeScript and Tailwind CSS.
It renders an endless loop of photographic thumbnail cards traveling around a figure-eight infinity curve using CSS motion paths (offset-path: path(...)).
Each card rotates tangentially, staggered evenly via negative animation delays. Cards display real portrait and fashion photography with glossy sheen overlays, pause on hover, and auto-scale dynamically to fit any container width smoothly.`,

"spiral-images": `# UI HUB • LOVABLE PROMPT
Create a visually stunning component.

## Concept
An infinite vortex of images swirling along an Archimedean spiral from the outer edge into the center. Each card rides the spiral, rotating to follow its tangent, shrinking as it dives inward and fading at both ends — like a gallery falling into a whirl.

## Tech
- React + TypeScript + Vite
- HTML5 Canvas 2D rendering (no WebGL, no animation libraries)
- A single rAF loop owned by a useEffect; ResizeObserver keeps the canvas exactly container-sized
- Canvas sharpened with devicePixelRatio (capped at 2)

## Animation Details
- **Archimedean spiral**: radius decreases linearly, so every turn is equally spaced; the path parameterizes outer edge (0) to center (1).
- **Equal arc spacing**: reparameterize by arc length (cumulative table built once at R=1, inverse lookup interpolated) so cards keep equal VISUAL distance apart and never bunch near the center.
- **Continuous stream**: a 0–100 progress advances at \`speed\` per second and wraps; cards fill the whole path and cycle through your image list, so the flow is endless even with a single image.
- **Per-card transform**: rotate to the spiral tangent (finite difference), scale down toward center with size attenuation, keep aspect ratio, clip to rounded corners, fade in/out along the path; cards draw outer→center so inner ones sit on top.

## Performance
- One rAF loop, no per-frame allocations of note.
- Rounded-rect clip with a colored placeholder while each image loads (drawImage once ready).
- Cleanup cancels the frame and disconnects the ResizeObserver on unmount.

## Props
- images (default: 14 seeded images) - the source image list.
- turns: number = 3.5 - spiral turns.
- speed: number = 2 - progress per second.
- spacing: number = 5 - arc density (smaller = more cards).
- spread: number = 6 - radius scale (arms overflow and clip).
- sizeAttenuation: number = 2 - center shrink strength.
- imageSize: number = 200 - base card size.
- fadeIn: number = 20 - fade entering the edge.
- fadeOut: number = 0 - fade at the center.
- cornerRadius: number = 5 - card rounded corners.
- style - wrapper styles.

## Styling Guide
- The component fills 100% of its parent (relative, overflow hidden), so give it a bounded dark container (bg-neutral-950) with its own background.
- Images read best on a dark backdrop so the vortex edge of the frame stays clean.

## Output
Production-ready React component`,

    "gravitational-vortex": `
# UI HUB • LOVABLE PROMPT

Create a visually stunning "Gravitational Vortex" component.

## Concept
A WebGL gravitational vortex with a logarithmic spiral accretion disc. Thousands of motion-blurred streaks fall into a funnel throat, creating a cosmic whirlpool. The spiral structure is generated mathematically — zero winding at the rim, several full turns at the eye. Particles taper along their true velocity with Gaussian width profiles and depth attenuation for cinematic depth.

## Tech
React, TypeScript, raw WebGL (no Three.js), Tailwind CSS.

## Animation Details
- **Spiral Disc**: Logarithmic spiral with configurable twist (winding) and funnel depth.
- **Real Motion Blur**: Each streak is a two-triangle quad stretched along the true particle velocity.
- **Hover Speed Boost**: Pointer hover accelerates particles with dt-correct ~0.45s easing ramp.
- **Eye-Shift Correction**: Lens shift pins the vortex centre to the frame regardless of tilt/orbit/funnel.
- **Additive Blending**: Premultiplied alpha with ONE/ONE blend for glowing streaks over CSS background.

## Performance
- ~20k particles rendered via drawArrays with no index buffer.
- Two seed buffers built once; CPU only advances two wrapped scalars per frame.
- Near-plane culling prevents behind-camera artifacts.
- DPR-capped at 2x for mobile performance.

## Props
- background: string (Default: "#000000")
- baseColor: string (Default: "#04FF3F")
- accentColor: string (Default: "#FCFF00")
- density: number (Default: 16, range 10-100)
- speed: number (Default: 16, range 0-100)
- direction: "inward" | "outward" (Default: "inward")
- tiltX: number (Default: 35)
- tiltY: number (Default: 0)
- scale: number (Default: 79)
- vortex: { twist: number; funnel: number }

## Output
Production-ready React component`,
    "black-hole-3d": `
# UI HUB • LOVABLE PROMPT

Create a visually stunning "Black Hole" component.

## Concept
A 3D black hole accretion disk with flowing particles leaving fading trail lines. Utilizes 3D Z-depth sorting to allow particles to pass behind and in front of the central event horizon with authentic physical occlusion. Features relativistic orbital speeds and a premium 3D sphere center.

## Tech
React, TypeScript, HTML5 Canvas 2D, Tailwind CSS.

## Animation Details
- **Dual Canvas**: Background canvas for behind-horizon particles + sphere, foreground canvas for in-front particles (pointerEvents: "none").
- **Z-Depth Sorting**: Particles projected via perspective (PERSPECTIVE=1300), split into background/foreground arrays, each sorted back-to-front.
- **Relativistic Speed**: Orbit speed increases near core via sqrt(voidRadius / max(pt.radius, 10)).
- **Power Distribution**: Particles distributed with Math.pow(random(), 2) for gravity cluster near event horizon.
- **Trail System**: destination-out fade with configurable trail persistence.
- **3D Sphere**: Radial gradient sphere with edge highlights and rim lighting.
- **Dual Tilt**: Main inclination + sideway roll for varied viewing angles.

## Props
- showCenter: boolean (Default: true)
- centre: { voidRadius?: number; voidX?: number; voidY?: number }
- particleCount: number (Default: 1000)
- particleSize: number (Default: 4, range 1-100)
- colors: string[] (Default: ["#ffffff"])
- outerRadius: number (Default: 70)
- tilt: number (Default: 20)
- tiltSideway: number (Default: 160)
- trail: number (Default: 50, range 0-50)
- orbitSpeed: number (Default: 4)
- pullSpeed: number (Default: 0, range 0-20)

## Output
Production-ready React component`,
    "blooming-flower": `
# UI HUB • LOVABLE PROMPT

Create a visually stunning "Blooming Flower" component.

## Concept
A WebGL point-cloud flower of 60k-100k point sprites forming a layered flower on a stem. Opens on hover, closes to a bud when the pointer leaves. Three kinds of points share one buffer: petals on a parametric surface, stamens in a dome, and a swaying tapered stem.

## Tech
React, TypeScript, WebGL, motion/react, Tailwind CSS.

## Animation Details
- **Hover Bloom Gate**: motion/react's animate() drives a 0-1 motionValue with configurable spring/tween transition.
- **Parametric Petals**: Circular-arc midrib in half-angle form s*sin(theta0+ks/2)*sinc(ks/2). Width from angular slot.
- **Shared Sway**: Head reads swayAt(0), stem reads swayAt(t) — flower cannot drift off its stalk.
- **Weather**: Stalk sways, petals flutter on individual phases, head breathes ±1.2%. Single clock scaled by Speed.
- **Staggered Whorls**: Outer whorls open first via smoothstep bloom window.

## Props
- background: string (Default: "#07060C")
- baseColor: string (Default: "#C4327E")
- stemColor: string (Default: "#2F7A4F")
- accentColor: string (Default: "#FFD98A")
- accentMix: number (Default: 100)
- density: number (Default: 100, range 1-100)
- dotSize: number (Default: 10)
- speed: number (Default: 50, range 0-100)
- distance: number (Default: 2820)
- tilt: number (Default: 66)
- closed: number (Default: 100, range 0-100)
- flower: { petals?: number; layers?: number }

## Output
Production-ready React component`,
  "chandelier": `
# Chandelier — Interactive Background

A cloth simulation with text rendered on a deformable grid.

## Component
- Name: Chandelier
- Framework: React + TypeScript
- Rendering: Canvas 2D

## Description
The cloth hangs from pin points at the top and responds to gravity, wind, and mouse interaction. Characters from a configurable phrase are drawn on each quad cell, scaling and rotating with the cloth's deformation. Users can grab and drag individual cloth nodes.

## Props
- background: string (Default: "#0B0C0E")
- baseColor: string (Default: "#00F9AC") — Text and peg color
- phrase: string — Text rendered on each quad cell
- density: number (Default: 24, range 6-40)
- speed: number (Default: 50, range 0-100)
- hover: number (Default: 100, range 0-200)
- cloth: { gravity?: number; wind?: number; grab?: number; stretch?: number }

## Technical
- Verlet integration with fixed timestep (H = 1/120)
- Constraint solver with horizontal + vertical links
- Stretch clamping to prevent over-extension
- Pin points on top row
- Grab nearest free node on pointerdown
- Text rendering with quantised rotation (5-degree steps)
- DPR capped at 2, ResizeObserver, requestAnimationFrame loop

## Output
Production-ready React component`,
  "point-dna-helix": `## Component: Point DNA Helix

Build a premium "Point DNA Helix" interactive background using React, TypeScript, and raw WebGL.

## What it does
A bioluminescent 3D point-cloud double DNA helix. Two interwoven helical backbone strands 180 degrees out of phase are connected by discrete base-pair rungs, surrounded by ambient genetic dust.

## Technical
- Single WebGL context kept for component lifetime; one rAF loop; all live state via refs (no re-renders).
- All helical parametric math, camera transform, perspective point sizing, depth fade and screen-space cursor displacement computed in the vertex shader.
- Additive premultiplied blending with exponential point falloff.
- ResizeObserver-driven responsive canvas with DPR capping.
- prefers-reduced-motion respected.

## Interaction
- Auto-spin about its own axis
- Drag-to-spin with flick momentum
- Cursor-proximity particle push (hover)
- Breathing pulse

## Props
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

## Output
Production-ready React component`,
  "isometric-portal": `
## Component: Isometric Portal

Build a "Isometric Portal" loading animation as a React + TypeScript component using Tailwind CSS and a pure inline SVG with CSS keyframes (no external animation libraries).

## What it does
A neo-brutalist isometric diamond loader centered on a dark radial gradient. A faceted 3D diamond shell in layered gunmetal grays wraps a smaller inner diamond filled with a subtle grey-to-slate linear gradient. Two thin golden diamond outlines overlap at 45 degrees and "bounce" vertically apart and back together on a 4s ease-in-out loop, the second frame trailing 0.5s behind. Four golden isometric slabs extend from the diamond sides and pulse a warm amber glow by animating the SVG gradient stop-color (4s infinite). Three tiny faceted particles (champagne, gold, white) drift upward inside the portal face on a 4s ease-in-out loop like embers rising through a vent.

## Technical
- Render exactly 200x200 SVG, centered in a full-size flexbox container (w-full h-full min-h-[380px]).
- Scoped keyframes (ip-bounce, ip-bounce2, ip-umbral, ip-particles) plus id selectors (#bounce, #bounce2, #particles, #animatedStop).
- Animate SVG with transform translate keyframes; gradient pulsing via stop-color keyframes.
- Zero JavaScript animation state; loops forever via animation: ... infinite.
- Inline the CSS in a <style> tag inside the component so it is self-contained.

## Output
Production-ready single-file React component.

`,

  "morphing-glow": `
## Component: Morphing Glow

Build a "Morphing Glow" loading animation as a React + TypeScript component using Tailwind CSS and a pure inline SVG mask with CSS keyframes (no external animation libraries).

## What it does
A morphing glass diamond loader: a 100x100px circular glass disc with an amber-to-rust linear gradient body, a glowing rim (amber top border, rust bottom border) and layered semi-transparent amber/rust outer and inset box-shadows. The disc is clipped by an inline SVG <mask> whose blurred polygon blades continuously reshape the diamond silhouette as they blur, round off and spin.

## Technical
- All animation driven by CSS @keyframes on SVG mask polygons and on the loader element itself.
- Prefix keyframes and ids: mg-rotation, mg-roundness, mg-colorize and mask id #mg-clipping.
- Animation timing via CSS custom properties: --time-animation: 2s, --size: 1 (scalable).
- Mask polygon blades: one full black rectangle (rotate 90deg), two large white triangles, four identical small white triangles. Staggered negative animation-delays and alternating spin directions.
- Contrast pulses from 15 to 3 and back over 1s (roundness); whole loader hue-rotates 0deg -> -90deg -> 0deg over 6s (colorize).
- Zero JavaScript animation state; loops forever purely via CSS.
- Render svg at width/height 100, centered in a full-size flexbox container (w-full h-full min-h-[380px]).

## Output
Production-ready single-file React component.

`,

  "gear-system": `
## Component: Gear System

Build a "Gear System" loading animation as a React + TypeScript component using Tailwind CSS and pure CSS keyframe animations (no external animation libraries).

## What it does
A mechanical gearbox loader: a 150px tall by 200px wide dark panel (#111) with a faint white border and an inset black vignette overlay. Inside sit four interlocking gears — three 60px gears (top-left, center, bottom-left) plus one 120px large gear (top-right) — each built from a metal disc with radiating tooth bars around a darker center hub.

## Technical
- All motion driven by CSS @keyframes (clockwise / counter-clockwise) on the gear-inner elements; prefix keyframes and classes: gs-clockwise, gs-counter-clockwise, .gs-gearbox, .gs-gear, .gs-gear-inner, .gs-bar.
- Gears: 60px discs (120px large) with a 36px darker hub, 1px translucent borders, layered metal box-shadows and 76px tooth bars (136px for the large gear, centered 68px).
- Spin timing: three small gears counter-clockwise/clockwise on 3s linear infinite loops; the large gear counter-clockwise on a slower 6s linear infinite loop.
- Zero JavaScript animation state; loops forever purely via CSS.

## Output
Production-ready single-file React component.

`,
  "hourglass": `
## Component: Hourglass

Build an "Hourglass" loading animation as a React + TypeScript component using Tailwind CSS and a single self-contained inline SVG with pure CSS keyframe animations (no external animation libraries).

## What it does
A sand-glass loader: a 56x56 viewBox ring of three trailing motion curves swing clockwise around the glass while the glass model itself flips a full 180deg each cycle. The glass is a rounded hourglass silhouette with amber metal frames and a glowing sand column that drains, refills and mounds over through dashed-line stroke-dashoffset animations.

## Technical
- All motion driven by CSS @keyframes on SVG elements; prefix keyframes and classes: hg-flip, hg-glare-top/bottom, hg-motion-thick/medium/thin, hg-sand-drop, hg-sand-fill, hg-sand-grain-left/right, hg-sand-line-left/right, hg-sand-mound-top/bottom.
- Amber/gold palette driven by a --hue CSS variable (--hue: 35) with hsl(35,90%,90%) sand, plus hsl(var(--hue),90%,50%/57.5%/85%) for frames and glass.
- 2s animation cycle (--dur: 2s) with cubic-bezier easing and stroke-dashoffset-driven sand flow.
- Zero JavaScript animation state; loops forever purely via CSS.

## Output
Production-ready single-file React component.

`,
  "generating-orb": `
## Component: Generating Orb

Build a "Generating Orb" loading animation as a React + TypeScript component using Tailwind CSS and pure CSS keyframe animations (no external animation libraries).

## What it does
An AI-style generating indicator: the word "GENERATING" spelled across the middle of a spinning circular orb. The orb turns continuously while three layers of inset box-shadows glow through violet, magenta and indigo, and each letter pulses in a staggered wave.

## Technical
- All motion driven by CSS @keyframes; prefix keyframes and classes: go-loader-rotate, go-loader-letter-anim, .go-loader-wrapper, .go-loader, .go-loader-letter.
- Orb: 180px full-circle (aspect-ratio 1/1) rotating 90deg -> 270deg -> 450deg on a 2s linear loop; surface colored by inset box-shadows (0 10px 20px #fff, 0 20px 30px #ad5fff, 0 60px 60px #471eec) that shift to magenta/indigo (#d60a47, #311e80) at the 50% keyframe.
- Ten letters (G-e-n-e-r-a-t-i-n-g, Inter, 1.2em, 300 weight, white) pulse on the same 2s loop with 0.1s incremental delays (0.4 opacity -> 1 at 20% with 1.15 scale pop -> 0.7).
- Zero JavaScript animation state; loops forever purely via CSS.

## Output
Production-ready single-file React component.

`,
  "trading-candles": `
## Component: Trading Candles

Build a "Trading Candles" loading animation as a React + TypeScript component using Tailwind CSS and pure CSS keyframe animations (no external animation libraries).

## What it does
A mini candlestick chart of three candles bouncing like a live market ticker: green, red, green columns side by side awaiting the next print.

## Technical
- Each candle: a 4px-wide wick above and below a 12x48px rounded-2px body (wicks and body share the same color via a --tc-candle variable).
- Three candle columns (.tc-candle-group), each bouncing (tc-bounce) on a 1s ease-in-out infinite loop: translateY(-20%) at 0%/100% with cubic-bezier(0.8, 0, 1, 1), resting pose at 50% with cubic-bezier(0, 0, 0.2, 1).
- Delays: outer green candles 0.1s, middle red candle 0.2s so the ripple starts from the center.
- Colors: green #22c55e (.tc-candle-green), red #ef4444 (.tc-candle-red).
- Prefix all keyframes/classes with tc-; center in a full-size flexbox container (w-full h-full min-h-[380px]) with a dark gradient backdrop; 4px gap between columns.

## Output
Production-ready single-file React component.

`,
  "pixel-bounce": `
## Component: Pixel Bounce

Build a "Pixel Bounce" loading animation as a React + TypeScript component using Tailwind CSS and pure CSS keyframe animations (no external animation libraries).

## What it does
A retro pixel-art red ghost that bobs up and down. Its white eyes hold blue pupils that slowly scan sideways, the pixel cells across its belly flicker between red and transparent like static, and a blurred shadow pulses underneath in sync with the bob.

## Technical
- The ghost body is a 14x14 CSS grid (140x140px, grid-template-columns/rows repeat(14,1fr)) with rows stitched by a grid-template-areas string decribing a rounded head (top0-top4 areas) and a scalloped bottom hem (st0/st5 + an1-an18 cells).
- Body bob: @keyframes pb-upNDown translates the grid 0px -> -10px on a 0.5s loop (jump at the 50% keyframe).
- Belly flicker: alternate classes pb-flicker0 (red 0-49%, transparent 50-100%) and pb-flicker1 (inverted), each an-cell assigned one for a static effect, both on 0.5s loops.
- Eyes: two absolutely-placed 40x50px boxes (.pb-eye/.pb-eye1) drawn from ::before/::after white bars; blue 20x20px pupils (.pb-pupil/.pb-pupil1, z-index 1) scan via @keyframes pb-eyesMovement on a 3s loop (translateX 0 -> 10px -> 0).
- Shadow: a blurred black circle (border-radius 50%, rotateX(80deg), blur 20px) that pulses opacity 0.5 -> 0.2 in sync with the bob (pb-shadowMovement, 0.5s).
- Prefix all keyframes/classes with pb-; draw on a full-size flexbox container (w-full h-full min-h-[380px]) with a dark gradient backdrop.

## Output
Production-ready single-file React component.

`,
  "gradient-orb": `
## Component: Gradient Orb

Build a "Gradient Orb" loading animation as a React + TypeScript component using Tailwind CSS and pure CSS keyframe animations (no external animation libraries).

## What it does
A glossy 100px liquid-gradient sphere. Three stacked layers - a specular sphere, its inset-shadow blobs, and a blurred red-to-blue gradient behind - spin on their own durations while an inline SVG uses animated path masks to ripple liquid waves across the orb's face, and the whole palette drifts through red/blue/yellow/cyan via hue-rotate.

## Technical
- Structure: .gorb-loader (position relative, border-radius 50%, overflow hidden) > .gorb-sphere + svg.
- Sphere: white radial specular at 80% 20%. Its ::before spins 2s (gorb-rotation linear) with two inset box-shadows (cyan blob top-left, yellow blob right) and a hue-rotate loop (gorb-colorize, 0 -> -30 -> -60 -> -90 -> -45 -> 0 deg on 2s ease-in-out). Its ::after sits at z-index -1, painting a blurred linear-gradient red->blue at 120deg with the same rotation but a gorb-colorblur filter adding blur(size/15).
- SVG: 100x100 viewBox spinning 3s cubic-bezier(0.7,0.6,0.3,0.4). Four masks sculpt the face - #gorb-waves (two duplicated paths animating their d attribute: gorb-wave-one bulges up, gorb-wave-two bulges down, offset by half a period, second pair reversed), #gorb-clipping (vertical ellipse band), #gorb-blurriness (7px blur), #gorb-fade (edge diffusion).
- Drive everything from CSS variables (--gorb-size 100px, --gorb-time-animation 1s, palette vars); prefix all keyframes/classes/ids with gorb-.

## Output
Production-ready single-file React component.

`};
