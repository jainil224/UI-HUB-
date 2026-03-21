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

def clean_spaces(match):
    key = match.group(1)
    prompt_source = match.group(2)
    if key in buttons:
        # Standardize multiple newlines to just 1 blank line (i.e. \n\n) globally in the prompt
        cleaned = re.sub(r'\n{3,}', '\n\n', prompt_source)
        # Ensure there's exactly one newline before and after ---
        cleaned = re.sub(r'\n*\s*---\s*\n*', '\n\n---\n\n', cleaned)
        # Fix any trailing spaces
        cleaned = re.sub(r' +$', '', cleaned, flags=re.MULTILINE)
        # Fix the top and bottom to make it perfectly bound to the backticks
        cleaned = cleaned.strip()
        return f'"{key}": `\n{cleaned}\n`'
    return match.group(0)

pattern = re.compile(r'"([^"]+)": `(.*?)`', re.DOTALL)
new_content = pattern.sub(clean_spaces, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Cleaned up empty spaces in Buttons successfully.")
