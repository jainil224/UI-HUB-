export const ANTIGRAVITY_PROMPTS: Record<string, string> = {
    // --- BACKGROUNDS ---
    "mouse-gravity-background": `
# ROLE: Senior AI Coding Expert (Antigravity)
# TASK: Create premium UI Component "Mouse Gravity Background"

## 1. COMPONENT IDENTITY
- Name: MouseGravityBackground
- Theme: Physical, Interactive, Swarm.
- Purpose: Particles that are attracted to or follow the user\'s cursor like a magnet.

## 2. TECHNICAL SPECIFICATIONS
- Framework: React (TypeScript)
- Tech Stack: HTML5 Canvas.
- Physics: Particle swarm logic with damping and mouse attraction forces.

## 3. VISUAL & MOTION REQUIREMENTS
- Primary Visual: Swarming colored dots (Cyan/Magenta).
- Motion Logic: Fluid acceleration towards cursor with orbit-like behavior once reached.
- Aesthetic Quality: Liquid-like swarm movement, high responsiveness, and soft glow effects.

## 4. IMPLEMENTATION STRATEGY
- Step 1: Calculate vector from particle to cursor position.
- Step 2: Apply force inversely proportional to distance to velocity.
- Step 3: Apply friction/damping (0.95x) each frame to prevent chaotic orbits.

## 5. JSX STRUCTURE
- Canvas: absolute inset-0 pointer-events-none.
- Container: relative bg-slate-950 overflow-hidden.

## 6. CRITICAL RULES (ZERO-FAILURE)
1. Interaction: Particles must disperse if the mouse is clicked or moved too fast.
2. Performance: Stable 60fps with 200+ particles.

## 7. FINAL OUTPUT
- Provide the complete, single-file code.
`,
    "neon-flicker-button": `
# ROLE: Senior AI Coding Expert (Antigravity)
# TASK: Create premium UI Component "Neon Flicker Button"

## 1. COMPONENT IDENTITY
- Name: NeonFlickerButton
- Theme: Cyber-Noir, Retro-Industrial.
- Purpose: A neon sign button that flickers with randomized timing.

## 2. TECHNICAL SPECIFICATIONS
- Tech Stack: CSS Keyframes (randomized opacity spikes).
- Core: Text shadow + box shadow flickering intensities.

## 3. VISUAL & MOTION REQUIREMENTS
- Primary Visual: Bright neon text (#FF0060) with heavy outer glow.
- Motion Logic: Random binary flicker (1-0-1 states) with high frequency.
- Aesthetic Quality: Evokes a "failing" neon light for an industrial vibe.

## 4. IMPLEMENTATION STRATEGY
- Step 1: Define keyframes with random steps like 0%, 12%, 13%, 15%, 45% etc.
- Step 2: At flicker points, reduce opacity and text-shadow intensity.
- Step 3: Vary flicker timings for each component instance.

## 5. JSX STRUCTURE
- Button: text-neon shadow-neon.
- Label: uppercase tracking-widest.

## 6. CRITICAL RULES (ZERO-FAILURE)
1. Vibe: Must feel like a 1980s neon sign.
2. Legibility: Text should never be fully "off" for more than 50ms.

## 7. FINAL OUTPUT
- Provide the complete, single-file code.
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
