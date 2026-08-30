export const LOVABLE_PROMPTS: Record<string, string> = {
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
    "infinity-image": `
# UI HUB • LOVABLE PROMPT

You are an expert AI developer. Create an "InfinityImage" React component in TypeScript and Tailwind CSS.
It renders an endless loop of photographic thumbnail cards traveling around a figure-eight infinity curve using CSS motion paths (offset-path: path(...)).
Each card rotates tangentially, staggered evenly via negative animation delays. Cards display real portrait and fashion photography with glossy sheen overlays, pause on hover, and auto-scale dynamically to fit any container width smoothly.
`,
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

`};
