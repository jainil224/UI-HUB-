import re

file_path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\antigravityPrompts.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

template = """# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: {Name}
Type: UI / Animation / WebGL / Interaction

---

## GOAL

Create a component that:

* Matches real-world production quality
* Preserves full behavior and animation logic
* Works directly in Next.js environment
* {Goal}

---

## TECH STACK

{TechStack}

---

## FEATURES (STRICT – DO NOT SKIP)

{Features}

---
## PROPS (with defaults): 
{Props_List}

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

components/{Name}.tsx

* Fully typed TypeScript
* Complete working code
* No explanation
* No markdown

---

## FINAL INSTRUCTION

Generate the COMPLETE component now with full functionality and production-level quality."""

cursors = {
    "target-cursor": {
        "Name": "TargetCursor",
        "Goal": "Acts as a high-tech tactical cursor targeting overlay, snapping precision corner brackets onto interactive elements on the page.",
        "TechStack": "* React (Next.js)\n* TypeScript (TSX)\n* Framer Motion\n* DOM getBoundingClientRect\n* Tailwind CSS",
        "Features": "* Bracket Snap: Four corner brackets dynamically expand and contract to frame targeted elements.\n* Smooth Lerp: Uses dampening and spring animations to transition the brackets to the center of the hovered target.\n* Intersection Tracking: Polling or event-based logic identifying elements with the targetSelector.\n* Custom Visibility: Optionally hides the system's default cursor globally.",
        "Props_List": "- targetSelector: string = '[data-target=\"true\"]' — CSS selector for elements the cursor should 'snap' to.\n- spinDuration: number = 10 — seconds for the idle rotation animation.\n- hoverDuration: number = 0.3 — seconds for the snapping transition ease.\n- hideDefaultCursor: boolean = false — hides the browser's default pointer.\n- parallaxOn: boolean = true — enables sub-pixel parallax floating effect.\n- containerRef: React.RefObject<HTMLElement> — limits tracking to a specific section.\n- className: string = '' — optional styles."
    },
    "black-hole-cursor": {
        "Name": "BlackHoleCursor",
        "Goal": "Simulates a gravitational singularity at the cursor position, distorting surrounding elements via a localized lensing shader or lens filter effect.",
        "TechStack": "* React (Next.js)\n* TypeScript (TSX)\n* WebGL / Canvas API\n* CSS backdrop-filter",
        "Features": "* Gravitational Lensing: Procedural shader or complex refraction matrix applied beneath the mouse.\n* Continuous Tracking: Event listener mapping mouse X/Y to the singularity center.\n* Falloff Radius: Distortions weaken smoothly from the cursor center out to the gravityRadius limit.",
        "Props_List": "- gravityRadius: number = 150 — pixel radius representing the distortion's event horizon.\n- className: string = '' — allows overriding container styling or position classes.\n- containerRef: React.RefObject<HTMLElement> — bounds calculation.\n- children: React.ReactNode — content elements rendered 'under' the effect layer."
    },
    "magnetic-cursor": {
        "Name": "MagneticCursor",
        "Goal": "Provides a sleek interactive pointer component that is physically 'pulled' and attached to nearby interactive elements upon proximity.",
        "TechStack": "* React (Next.js)\n* TypeScript (TSX)\n* Framer Motion (useSpring, useMotionValue)\n* Tailwind CSS",
        "Features": "* Proximity Detection: Logic to detect distance from nearby 'magnetic' DOM targets.\n* Inverse-Square Pull: The cursor is pulled away from the mouse toward the target with increasing force.\n* Morphing Dot: The primary cursor point scales and changes opacity upon 'snapping' to the target.",
        "Props_List": "- magnetRadius: number = 50 — distance threshold in pixels to trigger attraction.\n- cursorSize: number = 24 — default dimensions of the resting cursor shape.\n- className: string = '' — styling overrides for the trailing circle.\n- containerRef: React.RefObject<HTMLElement> = null — bounds."
    },
    "aurora-cursor": {
        "Name": "AuroraCursor",
        "Goal": "Leaves a fluid, ethereal, shifting gradient mesh trail behind the cursor exactly like the Aurora Borealis in the night sky.",
        "TechStack": "* React (Next.js)\n* TypeScript (TSX)\n* Canvas 2D API / WebGL Shaders\n* Tailwind CSS",
        "Features": "* Fluid Path Generation: The trail's vertex control points interpolate cursor movement for smooth wavy ribbons.\n* Shifting Colors: Real-time transition of HSL mesh colors creating the aurora glow.\n* Damping System: Trail lags beautifully with high physical damping rather than jumping instantly.",
        "Props_List": "- size: number = 80 — default width/spread of the trailing aurora emission.\n- stiffness: number = 100 — spring tension determining reaction latency.\n- damping: number = 30 — resistance smoothing the tail movement.\n- className: string = '' — wrapper classes."
    },
    "heart-cursor": {
        "Name": "HeartCursor",
        "Goal": "Generates an energetic cursor containing a primary 💜 that spawns smaller, fading heart particles based on cursor velocity.",
        "TechStack": "* React (Next.js)\n* TypeScript (TSX)\n* Framer Motion / SVG paths\n* Tailwind CSS",
        "Features": "* Particle Emitter: Detects mouse velocity and triggers small SVG hearts flying against the movement vector.\n* Breathing Core: The primary heart perpetually pulses in size.\n* State Reaction: Expands size slightly depending on mousedown or interaction events.",
        "Props_List": "- size: number = 32 — dimensions of the central 💜.\n- glowIntensity: number = 15 — blur spread of the neon box-shadow.\n- trailSpeed: number = 0.5 — fade multiplier for generated background particles.\n- hoverScale: number = 1.2 — multiplier when clicking or hovering a target.\n- containerRef: React.RefObject<HTMLElement> — constraint space.\n- className: string = '' — CSS."
    },
    "lizard-cursor": {
        "Name": "LizardCursor",
        "Goal": "Renders an organic, mechanical multi-segmented lizard that slithers fluidly using forward-kinematics to follow the user cursor path.",
        "TechStack": "* React (Next.js)\n* TypeScript (TSX)\n* Canvas 2D API (Kinematic Joints)\n* Tailwind CSS",
        "Features": "* Segmented Kinematics: Calculates multi-joint angle chains to keep the body snaking naturally behind the head.\n* Dynamic Direction: Head properly aligns rotation mapping exactly with the mouse trajectory vector.\n* Performance Loop: Highly optimized rendering matrix calculations on canvas.",
        "Props_List": "- color: string = '#00FF9D' — primary fill color of the lizard's body/nodes.\n- size: number = 40 — scale multiplier for the segments.\n- containerRef: React.RefObject<HTMLElement> — bounds clamping.\n- backgroundColor: string = 'transparent'.\n- interactive: boolean = true — react to clicks.\n- className: string = '' — generic tailwind overrides."
    },
    "venom-cursor": {
        "Name": "VenomCursor",
        "Goal": "Implements an aggressive symbiote/tentacle effect stretching and snapping chaotic webbing to geometry near the cursor.",
        "TechStack": "* React (Next.js)\n* TypeScript (TSX)\n* Canvas 2D API (Physics & Lines)\n* Tailwind CSS",
        "Features": "* Multi-Tendril Solver: Spawns independent 'snap' points projecting toward edges.\n* Elastic Tension: Lines bend, tighten correctly and violently snap backwards when the cursor gets too far.\n* Immediate Clearing: Flushes old vertices perfectly for raw erratic behavior without screen smudging.",
        "Props_List": "- color: string = '#2A2A2A' — the hex color to match the symbiote web strands.\n- interactive: boolean = true — allows the venom to latch onto surrounding divs.\n- containerRef: React.RefObject<HTMLElement> — area.\n- className: string = '' — container layout overrides."
    },
    "three-d-tubes-cursor": {
        "Name": "ThreeDTubesCursor",
        "Goal": "Tracks the mouse in 3D producing an intricate, intertwining volumetric metallic/glass tube extrusion that eventually ages away.",
        "TechStack": "* React (Next.js)\n* TypeScript (TSX)\n* Three.js (@react-three/fiber if used, or vanilla WebGL)\n* Tailwind CSS",
        "Features": "* Geometry Extrusion: TubeGeometry continuously paths the X/Y intersections into Z depth.\n* Material Shader: Specular reflections utilizing either environment mapping or metallic PBR calculations.\n* Smooth Dissolve: Older tube vertices transition toward 0 alpha to prevent overwhelming polycounts.",
        "Props_List": "- colors: string[] = ['#ff00ff', '#00ffff'] — palette for the material.\n- lightColors: string[] = ['#ffffff'] — spec/reflection lighting tones.\n- lightIntensity: number = 1.5 — multiplier for the 3D spotlights.\n- containerRef: React.RefObject<HTMLElement> — boundary limits.\n- className: string = '' — DOM z-index overlays."
    }
}

def replace_cursor_prompts(match):
    key = match.group(1)
    if key in cursors:
        data = cursors[key]
        formatted_prompt = template.format(
            Name=data["Name"],
            Goal=data["Goal"],
            TechStack=data["TechStack"],
            Features=data["Features"],
            Props_List=data["Props_List"]
        )
        return f'"{key}": `\n{formatted_prompt}`'
    return match.group(0)

pattern = re.compile(r'"([^"]+)": `.*?`(?=,\n\s*"|\n};)', re.DOTALL)
new_content = pattern.sub(replace_cursor_prompts, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated cursor prompts to the new custom Antigravity pattern.")
