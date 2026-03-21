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

def clean_props_api(match):
    key = match.group(1)
    prompt_source = match.group(2)
    if key in buttons:
        # Match `## PROPS API`, the interface definition, and clean up to the next `---`
        # Using `[\s\S]*?` non-greedy to stop at the *first* `---` encountered.
        # We also want to remove up to the `---` but not the `---` itself.
        new_prompt = re.sub(r'\s*## PROPS API[\s\S]*?(?=\s*---)', '\n\n', prompt_source)
        return f'"{key}": `{new_prompt}`'
    return match.group(0)

pattern = re.compile(r'"([^"]+)": `(.*?)`', re.DOTALL)
new_content = pattern.sub(clean_props_api, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Removed old PROPS API from Buttons successfully.")
