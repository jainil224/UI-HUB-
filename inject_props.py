import json
import re

file_path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\antigravityPrompts.ts'

# Read file
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

props_mapping = {
    # Buttons
    "corner-border-button": "interface CornerBorderButtonProps {\n    children?: React.ReactNode;\n    className?: string;\n    baseColor?: string;\n    hoverColor?: string;\n    borderColor?: string;\n    style?: React.CSSProperties;\n}",
    "shatter-button": "interface ShatterButtonProps {\n    children?: React.ReactNode;\n    className?: string;\n    shardCount?: number;\n    shatterColor?: string;\n    onClick?: () => void;\n}",
    "border-beam": "interface BorderBeamProps {\n    size?: number;\n    duration?: number;\n    delay?: number;\n    colorFrom?: string;\n    colorTo?: string;\n    transition?: any;\n    style?: React.CSSProperties;\n    reverse?: boolean;\n    initialOffset?: number;\n    borderThickness?: number;\n    opacity?: number;\n    glowIntensity?: number;\n    beamBorderRadius?: number;\n    pauseOnHover?: boolean;\n    speedMultiplier?: number;\n}",
    "glow-button": "interface GlowButtonProps {\n    label?: string;\n    className?: string;\n    onClick?: () => void;\n    color?: string;\n}",
    "marquee-hover-button": "interface MarqueeHoverButtonProps {\n    label?: string;\n    className?: string;\n    disabled?: boolean;\n}",
    "payment-transaction-button": "interface PaymentTransactionButtonProps {\n    label?: string;\n    accentColor?: string;\n    posColor?: string;\n    cardColor?: string;\n    currencySymbol?: string;\n    className?: string;\n    onClick?: () => void;\n}",
    "magic-card-effect": "interface MagicCardEffectProps {\n    children?: React.ReactNode;\n    className?: string;\n    gradientSize?: number;\n    gradientColor?: string;\n    gradientOpacity?: number;\n    gradientFrom?: string;\n    gradientTo?: string;\n}",
    "rainbow-button": "interface RainbowButtonProps {\n    asChild?: boolean;\n    size?: 'default' | 'sm' | 'lg' | 'icon';\n    className?: string;\n}",
    "social-tooltip-buttons": "interface SocialTooltipButtonsProps {\n    className?: string;\n    icons?: Array<{name: string, color: string, icon: React.ReactNode}>;\n}",
    "orbit-button": "interface OrbitButtonProps {\n    label?: string;\n    className?: string;\n    onClick?: () => void;\n    color?: string;\n}",
    "galaxy-button": "interface GalaxyButtonProps {\n    label?: string;\n    accentColor?: string;\n    starDensity?: number;\n    className?: string;\n    onClick?: () => void;\n}",
    "liquid-fill-button": "interface LiquidFillButtonProps {\n    label?: string;\n    fillColor?: string;\n    liquidSpeed?: number;\n    className?: string;\n    onClick?: () => void;\n}",
    "neon-flicker-button": "interface NeonFlickerButtonProps {\n    label?: string;\n    className?: string;\n    onClick?: () => void;\n    color?: string;\n}",
    
    # Cursors
    "target-cursor": "interface TargetCursorProps {\n    targetSelector?: string;\n    spinDuration?: number;\n    hoverDuration?: number;\n    hideDefaultCursor?: boolean;\n    parallaxOn?: boolean;\n    containerRef?: React.RefObject<HTMLElement>;\n    className?: string;\n}",
    "black-hole-cursor": "interface BlackHoleCursorProps {\n    gravityRadius?: number;\n    className?: string;\n    containerRef?: React.RefObject<HTMLElement>;\n    children?: React.ReactNode;\n}",
    "magnetic-cursor": "interface MagneticCursorProps {\n    magnetRadius?: number;\n    cursorSize?: number;\n    className?: string;\n    containerRef?: React.RefObject<HTMLElement>;\n}",
    "aurora-cursor": "interface AuroraCursorProps {\n    size?: number;\n    stiffness?: number;\n    damping?: number;\n    className?: string;\n}",
    "heart-cursor": "interface HeartCursorProps {\n    size?: number;\n    glowIntensity?: number;\n    trailSpeed?: number;\n    hoverScale?: number;\n    containerRef?: React.RefObject<HTMLElement>;\n    className?: string;\n}",
    "lizard-cursor": "interface LizardCursorProps {\n    color?: string;\n    size?: number;\n    containerRef?: React.RefObject<HTMLElement>;\n    backgroundColor?: string;\n    interactive?: boolean;\n    className?: string;\n}",
    "venom-cursor": "interface VenomCursorProps {\n    color?: string;\n    interactive?: boolean;\n    containerRef?: React.RefObject<HTMLElement>;\n    className?: string;\n}",
    "three-d-tubes-cursor": "interface ThreeDTubesCursorProps {\n    colors?: string[];\n    lightColors?: string[];\n    lightIntensity?: number;\n    containerRef?: React.RefObject<HTMLElement>;\n    className?: string;\n}",
    "word-pull-up": "interface WordPullUpProps {\n    children?: React.ReactNode;\n    className?: string;\n}"
}

def inject_props(match):
    key = match.group(1)
    prompt_content = match.group(2)
    
    # Check if PROPS API already exists
    if "## PROPS API" in prompt_content:
        # It's already there, just return the exact match
        return f'"{key}": `{prompt_content}`'
        
    if key in props_mapping:
        props_str = f"## PROPS API\n\n{props_mapping[key]}\n\n---\n\n"
        # Find the --- before ## FINAL OUTPUT
        new_prompt = re.sub(r'---\s+## FINAL OUTPUT', props_str + r'## FINAL OUTPUT', prompt_content)
        return f'"{key}": `{new_prompt}`'
    
    # If not in mapping, don't change
    return match.group(0)

# The regex matches any string key followed by `:` and a backtick string
# We use non-greedy matching .*? for the template literal content
pattern = re.compile(r'"([^"]+)": `(.*?)`', re.DOTALL)
new_content = pattern.sub(inject_props, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Props injected successfully!")
