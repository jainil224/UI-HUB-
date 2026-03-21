import re

file_path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\antigravityPrompts.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

buttons = [
    "corner-border-button", "shatter-button", "border-beam", "glow-button", 
    "marquee-hover-button", "payment-transaction-button", "magic-card-effect", 
    "rainbow-button", "social-tooltip-buttons", "orbit-button", 
    "galaxy-button", "liquid-fill-button", "neon-flicker-button"
]

exact_header = """# UI HUB • ANTIGRAVITY MASTER PROMPT

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

## TASK"""

def enforce_strict_header(match):
    key = match.group(1)
    prompt_source = match.group(2)
    if key in buttons:
        # We replace the top header back, this time including the Prompt Version line.
        new_prompt = re.sub(r'^[\s\S]*?## TASK', exact_header, prompt_source)
        return f'"{key}": `\n{new_prompt}`'
    return match.group(0)

pattern = re.compile(r'"([^"]+)": `\n([\s\S]*?)`', re.DOTALL)
new_content = pattern.sub(enforce_strict_header, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Restored Prompt Version logic and applied zero-deviation formatting to headers.")
