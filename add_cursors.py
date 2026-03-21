import re

file_path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\antigravityPrompts.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

cursors = {
    "black-hole-cursor": {
        "Name": "BlackHoleCursor",
        "Type": "UI / Interaction / WebGL",
        "Goal": "Create a black hole effect cursor that distorts the area behind it using a custom gravitational lensing shader.",
        "Features": "* **Gravitational Lensing**: A WebGL fragment shader that applies a radial distortion to the underlying composite.\\n* **Mouse Tracking**: Continuous polling of mouse coordinates with a smooth follow delay.\\n* **Optimized Rendering**: Shader calculation bypasses full DOM repaints.",
        "Props API": "interface BlackHoleCursorProps {\\n    gravityRadius?: number;\\n    className?: string;\\n    containerRef?: React.RefObject<HTMLElement>;\\n    children?: React.ReactNode;\\n}"
    },
    "magnetic-cursor": {
        "Name": "MagneticCursor",
        "Type": "UI / Interaction",
        "Goal": "Create a cursor that is magnetically pulled towards specific DOM elements when it enters their proximity radius.",
        "Features": "* **Proximity Detection**: Calculates distance to 'magnetic' elements and applies an inverse-square attraction force.\\n* **Spring Physics**: Uses spring animations for the 'snap' and 'release' interactions.\\n* **Custom Pointer**: A stylish, minimalistic dot that enlarges upon element capture.",
        "Props API": "interface MagneticCursorProps {\\n    magnetRadius?: number;\\n    cursorSize?: number;\\n    className?: string;\\n    containerRef?: React.RefObject<HTMLElement>;\\n}"
    },
    "aurora-cursor": {
        "Name": "AuroraCursor",
        "Type": "UI / Interaction",
        "Goal": "Create a cursor that sheds a soft, fluid aurora-borealis light trail that blends seamlessly with the background.",
        "Features": "* **Fluid Trail**: Generates a smooth organic path with shifting gradient meshes.\\n* **Follow Delay**: The aurora has a high damping coefficient producing a lagging, ethereal follow.\\n* **Color Shifting**: The trail continuously cycles through HSL hues.",
        "Props API": "interface AuroraCursorProps {\\n    size?: number;\\n    stiffness?: number;\\n    damping?: number;\\n    className?: string;\\n}"
    },
    "heart-cursor": {
        "Name": "HeartCursor",
        "Type": "UI / Interaction",
        "Goal": "Create a charming cursor featuring a 💜 that leaves a fading trail of smaller hearts on rapid movement.",
        "Features": "* **Particle System**: Spawns heart particles based on cursor velocity.\\n* **Scale Dynamics**: The primary heart cursor pulses naturally (beat animation) and scales up slightly on hover states.\\n* **Cleanup Logic**: Ensures all discarded particles are properly unmounted.",
        "Props API": "interface HeartCursorProps {\\n    size?: number;\\n    glowIntensity?: number;\\n    trailSpeed?: number;\\n    hoverScale?: number;\\n    containerRef?: React.RefObject<HTMLElement>;\\n    className?: string;\\n}"
    },
    "lizard-cursor": {
        "Name": "LizardCursor",
        "Type": "UI / Interaction",
        "Goal": "Create an organic, mechanical Lizard cursor following the user's path with forward-kinematics and jointed segments.",
        "Features": "* **Segmented Body**: Replaces the cursor with a multi-jointed lizard SVG/Canvas.\\n* **Kinematic Solver**: Calculates joint angles so the body follows the head fluidly.\\n* **Color Support**: Accepts an accent color that propagates through the joints.",
        "Props API": "interface LizardCursorProps {\\n    color?: string;\\n    size?: number;\\n    containerRef?: React.RefObject<HTMLElement>;\\n    backgroundColor?: string;\\n    interactive?: boolean;\\n    className?: string;\\n}"
    },
    "venom-cursor": {
        "Name": "VenomCursor",
        "Type": "UI / Interaction",
        "Goal": "Create an aggressive, symbiote-like cursor that stretches and snaps web-like tendrils to nearby geometry.",
        "Features": "* **Tendril Generation**: Randomly spawns temporary chaotic lines connecting the cursor to edges.\\n* **Elastic Physics**: Tendrils show high tension and snap violently when cursor moves too far.\\n* **Performance**: Utilizes Canvas 2D for rapid line drawing and clearing.",
        "Props API": "interface VenomCursorProps {\\n    color?: string;\\n    interactive?: boolean;\\n    containerRef?: React.RefObject<HTMLElement>;\\n    className?: string;\\n}"
    },
    "three-d-tubes-cursor": {
        "Name": "ThreeDTubesCursor",
        "Type": "UI / Interaction / WebGL",
        "Goal": "Create an intricate, intertwining 3D tubes cursor tracking the mouse, showing specular lighting and metallic shaders.",
        "Features": "* **Continuous Extrusion**: Generate 3D tube geometry along the mouse path over time.\\n* **Specular Materials**: Implement environment mapping or metallic shaders for the tubes.\\n* **Aging**: Tubes must fade or dissolve efficiently after a set lifespan.",
        "Props API": "interface ThreeDTubesCursorProps {\\n    colors?: string[];\\n    lightColors?: string[];\\n    lightIntensity?: number;\\n    containerRef?: React.RefObject<HTMLElement>;\\n    className?: string;\\n}"
    },
    "target-cursor": {
        "Name": "TargetCursor",
        "Type": "UI / Interaction",
        "Goal": "Create a high-tech tactical cursor that snaps into interactive elements with precision corner brackets.",
        "Features": "* **Corner Tracking**: Four corner brackets expand and contract upon identifying click targets.\\n* **Smooth Lerp**: Mathematical dampening for locking animations.\\n* **Aesthetic**: Indigo-600 glow with ultra-thin borders.",
        "Props API": "interface TargetCursorProps {\\n    targetSelector?: string;\\n    spinDuration?: number;\\n    hoverDuration?: number;\\n    hideDefaultCursor?: boolean;\\n    parallaxOn?: boolean;\\n    containerRef?: React.RefObject<HTMLElement>;\\n    className?: string;\\n}"
    }
}

template = """# UI HUB • ANTIGRAVITY MASTER PROMPT

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

Name: {Name}
Type: {Type}

---

## GOAL

{Goal}

---

## TECH STACK

* React (Next.js)
* TypeScript (TSX)
* Tailwind CSS
* Framer Motion / Canvas

---

## FEATURES (STRICT – DO NOT SKIP)

{Features}

---

## CRITICAL RULES (ZERO-FAILURE)

1. **Performance**: Ensure 60fps locking for cursor interactions.
2. **Clean Teardown**: Remove all listeners and cleanup animation frames on unmount.
3. **Pointer Events**: Ensure the cursor layer doesn't block underlying DOM clicks using pointer-events-none where appropriate.

---

## PROPS API

{Props_API}

---

## FINAL OUTPUT

* Provide the complete, single-file code.
"""

# Modify target-cursor if it exists or remove it
content = re.sub(r'"target-cursor": `.*?`,\n    ', '', content, flags=re.DOTALL)
# Remove the closing brackets to append
content = re.sub(r'};?\s*$', '', content)

if not content.endswith(','):
    content += ',\n'

for key, data in cursors.items():
    formatted_prompt = template.format(
        Name=data["Name"],
        Type=data["Type"],
        Goal=data["Goal"],
        Features=data["Features"],
        Props_API=data["Props API"]
    )
    content += f'    "{key}": `\n{formatted_prompt}`,\n'

content += '};\n'

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Added {len(cursors)} cursors to antigravityPrompts.ts")
