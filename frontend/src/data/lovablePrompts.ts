export const LOVABLE_PROMPTS: Record<string, string> = {
    "3d-landing-page": `
# UI HUB • LOVABLE PROMPT

You are an expert AI developer. Create a "ThreeDLandingPage" React component utilizing Tailwind CSS, 'lucide-react', '@splinetool/react-spline', and 'motion/react'. 

Build a responsive container (h-[600px] rounded-3xl) that tracks mouse movement to apply a smooth 3D tilt effect (rotateX, rotateY) to the content. The desktop view renders <Spline scene='https://prod.spline.design/WNmhHpS4PLU16Rji/scene.splinecode' /> inside a motion.div with spring-loaded rotations for a premium feel. Use a fallback <img src='/assets/3d-landing-animation.gif' /> on mobile. 

Overlay a glassmorphic Navbar (branding 'UI HUB') and a mobile hamburger menu. At the bottom, implement a hero overlay with glassmorphic cards. The main title is 'We Build Next-Gen UI Experiences'. The second description is 'Designing Next-Gen UI Systems That Make Brands Unforgettable' and the buttons are 'Explore Work' and 'Get Started'. 

Use 'Gruppo' and 'Sen' fonts imported via CSS. Ensure an exact, high-fidelity reproduction with fully functional, mouse-reactive React code.
`,
    "3d-hero": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

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
    "infinity-image": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
  "isometric-portal": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

  "morphing-glow": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,

  "gear-system": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
  "hourglass": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
  "generating-orb": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`,
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

`,
  "super-mario": `Premium component. Full source and prompt are gated to Pro subscribers - unlocked in Dashboard.`};
