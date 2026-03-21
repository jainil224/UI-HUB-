import re

file_path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\antigravityPrompts.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

props_mapping = {
    # BUTTONS
    "corner-border-button": "- children: React.ReactNode = 'Button' — text or elements inside the button.\n- className: string = '' — optional styling.\n- baseColor: string = '#27272a' — neutral state background hex.\n- hoverColor: string = '#3f3f46' — background on mouse over.\n- borderColor: string = '#3b82f6' — animated neon corner stroke color.",
    "shatter-button": "- children: React.ReactNode = 'Click Me' — content inside the glass button.\n- className: string = '' — wrapper classes.\n- shardCount: number = 30 — quantity of generated polygonal shards.\n- shatterColor: string = '#ffffff' — base color tint applied to shattered fragments.\n- onClick: () => void — execution handler.",
    "border-beam": "- size: number = 200 — width of the animated highlight beam.\n- duration: number = 15 — animation cycle time in seconds.\n- delay: number = 0 — offset before animation starts.\n- colorFrom: string = '#ffaa40' — origin color of the gradient.\n- colorTo: string = '#9c40ff' — terminal color of the gradient.\n- borderThickness: number = 1.5 — width of the glowing laser outline.\n- glowIntensity: number = 1 — box-shadow strength.",
    "glow-button": "- label: string = 'Hover Me' — displayed text.\n- className: string = '' — layout tweaks.\n- color: string = '#0ea5e9' — neon highlight.\n- onClick: () => void — execution handler.",
    "marquee-hover-button": "- label: string = 'Click' — central text payload.\n- className: string = '' — DOM styling.\n- disabled: boolean = false — interaction toggle.",
    "payment-transaction-button": "- label: string = 'Pay Now' — idle state text.\n- className: string = '' — override styling.\n- accentColor: string = '#10b981' — success coloring.\n- posColor: string = '#111827' — card terminal hex.\n- cardColor: string = '#f3f4f6' — inserted card rendering color.\n- currencySymbol: string = '$' — character preceding paid amount animation.\n- onClick: () => void — execution handler.",
    "magic-card-effect": "- children: React.ReactNode — wrapper payload.\n- className: string = '' — positioning logic.\n- gradientSize: number = 200 — radius of the radial spot.\n- gradientColor: string = '#262626' — hover glow tone.\n- gradientOpacity: number = 0.8 — visibility constraint.\n- gradientFrom: string = '#9E7AFF' — edge outline mask origin color.\n- gradientTo: string = '#FE8BBB' — edge outline mask destination color.",
    "rainbow-button": "- asChild: boolean = false — polymorphic slotting allowing custom element renders.\n- size: 'default'|'sm'|'lg'|'icon' = 'default' — tailwind sizing preset scale.\n- className: string = '' — outer layout properties.",
    "social-tooltip-buttons": "- icons: Array<{name, icon, color}> = [] — list of network interfaces.\n- className: string = '' — layout gap configurations.",
    "orbit-button": "- label: string = 'Initialize' — central text payload.\n- className: string = '' — specific z-index overrides.\n- color: string = '#3b82f6' — primary tone for orbiting satellites.\n- onClick: () => void — execution handler.",
    "galaxy-button": "- label: string = 'Explore' — action button label.\n- accentColor: string = '#a855f7' — spiral galaxy tint base.\n- starDensity: number = 50 — amount of background glowing particles orbiting the core.\n- className: string = '' — spacing layouts.\n- onClick: () => void — execution handler.",
    "liquid-fill-button": "- label: string = 'Submit' — primary text.\n- fillColor: string = '#0ea5e9' — SVG wave path fill.\n- liquidSpeed: number = 1 — translation multiplier.\n- className: string = '' — dimensional box control.\n- onClick: () => void — execution handler.",
    "neon-flicker-button": "- label: string = 'Warning' — flashing text payload.\n- className: string = '' — styling attributes.\n- color: string = '#ef4444' — harsh neon tube tint scale.\n- onClick: () => void — execution handler.",
    
    # CURSORS (To ensure consistency)
    "target-cursor": "- targetSelector: string = '[data-target=\"true\"]' — CSS selector for elements the cursor should 'snap' to.\n- spinDuration: number = 10 — seconds for the idle rotation animation.\n- hoverDuration: number = 0.3 — seconds for the snapping transition ease.\n- hideDefaultCursor: boolean = false — hides the browser's default pointer.\n- parallaxOn: boolean = true — enables sub-pixel parallax floating effect.\n- containerRef: React.RefObject<HTMLElement> — limits tracking to a specific section.\n- className: string = '' — optional styles.",
    "black-hole-cursor": "- gravityRadius: number = 150 — pixel radius representing the distortion's event horizon.\n- className: string = '' — allows overriding container styling or position classes.\n- containerRef: React.RefObject<HTMLElement> — bounds calculation.\n- children: React.ReactNode — content elements rendered 'under' the effect layer.",
    "magnetic-cursor": "- magnetRadius: number = 50 — distance threshold in pixels to trigger attraction.\n- cursorSize: number = 24 — default dimensions of the resting cursor shape.\n- className: string = '' — styling overrides for the trailing circle.\n- containerRef: React.RefObject<HTMLElement> = undefined — bounds.",
    "aurora-cursor": "- size: number = 80 — default width/spread of the trailing aurora emission.\n- stiffness: number = 100 — spring tension determining reaction latency.\n- damping: number = 30 — resistance smoothing the tail movement.\n- className: string = '' — wrapper classes.",
    "heart-cursor": "- size: number = 32 — dimensions of the central 💜.\n- glowIntensity: number = 15 — blur spread of the neon box-shadow.\n- trailSpeed: number = 0.5 — fade multiplier for generated background particles.\n- hoverScale: number = 1.2 — multiplier when clicking or hovering a target.\n- containerRef: React.RefObject<HTMLElement> — constraint space.\n- className: string = '' — CSS.",
    "lizard-cursor": "- color: string = '#00FF9D' — primary fill color of the lizard's body/nodes.\n- size: number = 40 — scale multiplier for the segments.\n- containerRef: React.RefObject<HTMLElement> — bounds clamping.\n- backgroundColor: string = 'transparent'.\n- interactive: boolean = true — react to clicks.\n- className: string = '' — generic tailwind overrides.",
    "venom-cursor": "- color: string = '#2A2A2A' — the hex color to match the symbiote web strands.\n- interactive: boolean = true — allows the venom to latch onto surrounding divs.\n- containerRef: React.RefObject<HTMLElement> — area.\n- className: string = '' — container layout overrides.",
    "three-d-tubes-cursor": "- colors: string[] = ['#ff00ff', '#00ffff'] — palette for the material.\n- lightColors: string[] = ['#ffffff'] — spec/reflection lighting tones.\n- lightIntensity: number = 1.5 — multiplier for the 3D spotlights.\n- containerRef: React.RefObject<HTMLElement> — boundary limits.\n- className: string = '' — DOM z-index overlays."
}

def inject_props_section(match):
    key = match.group(1)
    prompt_source = match.group(2)
    
    if key in props_mapping:
        # If the string '## PROPS (with defaults):' is already present, just update its content!
        # First, remove any existing PROPS block to keep it clean.
        cleaned_prompt = re.sub(r'[\r\n]*## PROPS \(with defaults\):[\s\S]*?(?=(?:---|\n\n## IMPLEMENTATION REQUIREMENTS|\n\n## PERFORMANCE RULES|\n\n## FINAL OUTPUT))', '\n\n', prompt_source)
        
        props_injection = f"## PROPS (with defaults):\n{props_mapping[key]}\n\n"
        
        # Now try to inject nicely before ## IMPLEMENTATION REQUIREMENTS
        if "## IMPLEMENTATION REQUIREMENTS" in cleaned_prompt:
            new_prompt = re.sub(r'(---[\r\n]+## IMPLEMENTATION REQUIREMENTS)', f'---\n\n{props_injection}\\1', cleaned_prompt)
        # Else before ## PERFORMANCE RULES
        elif "## PERFORMANCE RULES" in cleaned_prompt:
            new_prompt = re.sub(r'(---[\r\n]+## PERFORMANCE RULES)', f'---\n\n{props_injection}\\1', cleaned_prompt)
        # Else before ## FINAL OUTPUT
        else:
            new_prompt = re.sub(r'(---[\r\n]+## FINAL OUTPUT)', f'---\n\n{props_injection}\\1', cleaned_prompt)
            
        return f'"{key}": `{new_prompt}`'
    
    return match.group(0)

pattern = re.compile(r'"([^"]+)": `(.*?)`', re.DOTALL)
new_content = pattern.sub(inject_props_section, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Injected strict PROPS (with defaults) section for Buttons and Cursors successfully.")
