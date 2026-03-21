import re
import json

path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\componentData.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# I collected 32 keys in ANTIGRAVITY_PROMPTS
keys = [
  "corner-border-button",
  "shatter-button",
  "border-beam",
  "glow-button",
  "marquee-hover-button",
  "payment-transaction-button",       
  "magic-card-effect",
  "rainbow-button",
  "social-tooltip-buttons",
  "orbit-button",
  "galaxy-button",
  "liquid-fill-button",
  "neon-flicker-button",
  "word-pull-up",
  "target-cursor",
  "black-hole-cursor",
  "magnetic-cursor",
  "aurora-cursor",
  "heart-cursor",
  "lizard-cursor",
  "venom-cursor",
  "three-d-tubes-cursor",
  "grid-background",
  "hacker-background",
  "novatrix-background",
  "beam-grid-background",
  "fall-beam-background",
  "hell-background",
  "interactive-grid-background",      
  "particles-background",
  "wave-background",
  "lines-background",
  "sparkles-background",
  "isometric-grid-background",        
  "space-background",
  "neural-network-background",        
  "black-hole-background",
  "warp-speed-background",
  "mouse-gravity-background"
]

# Ensure we import ANTIGRAVITY_PROMPTS if not already present
if 'ANTIGRAVITY_PROMPTS' not in content:
    content = content.replace(
        'import { LOVABLE_PROMPTS } from "./lovablePrompts";',
        'import { LOVABLE_PROMPTS } from "./lovablePrompts";\nimport { ANTIGRAVITY_PROMPTS } from "./antigravityPrompts";'
    )

replacements = 0
for key in keys:
    old_str = f'LOVABLE_PROMPTS["{key}"]'
    new_str = f'ANTIGRAVITY_PROMPTS["{key}"]'
    if old_str in content:
        content = content.replace(old_str, new_str)
        replacements += 1

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Replaced {replacements} LOVABLE_PROMPTS references with ANTIGRAVITY_PROMPTS in componentData.tsx")
