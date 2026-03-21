import re

file_path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\antigravityPrompts.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

keys_to_remove = [
    # Backgrounds
    "grid-background", "hacker-background", "novatrix-background", "beam-grid-background", 
    "fall-beam-background", "hell-background", "interactive-grid-background", "particles-background", 
    "wave-background", "lines-background", "sparkles-background", "isometric-grid-background", 
    "space-background", "neural-network-background", "black-hole-background", "warp-speed-background", 
    "mouse-gravity-background",
    # Buttons
    "corner-border-button", "shatter-button", "border-beam", "glow-button", 
    "marquee-hover-button", "payment-transaction-button", "magic-card-effect", 
    "rainbow-button", "social-tooltip-buttons", "orbit-button", 
    "galaxy-button", "liquid-fill-button", "neon-flicker-button"
]

def remove_props_api(match):
    key = match.group(1)
    prompt_source = match.group(2)
    if key in keys_to_remove:
        # Look for the PROPS API section and its preceding `---`
        # We will remove from the `---\n\n## PROPS API` down to right before `---\n\n## FINAL OUTPUT`
        new_prompt = re.sub(r'\s*---\s*## PROPS API[\s\S]*?(?=\s*---\s*## FINAL OUTPUT)', '\n\n', prompt_source)
        return f'"{key}": `{new_prompt}`'
    return match.group(0)

pattern = re.compile(r'"([^"]+)": `(.*?)`', re.DOTALL)
new_content = pattern.sub(remove_props_api, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Removed PROPS API from requested components in antigravityPrompts.ts.")
