import re
import os

def deduplicate_prompts(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into header, prompts, and footer
    # Header: export const ... = {
    # Footer: };
    
    header_match = re.search(r'export const \w+: Record<string, string> = {', content)
    if not header_match:
        print(f"Error: Could not find header in {file_path}")
        return
        
    header = content[:header_match.end()]
    rest = content[header_match.end():]
    
    footer_match = re.search(r'};\s*$', rest)
    if not footer_match:
        print(f"Error: Could not find footer in {file_path}")
        # Try a different footer pattern
        footer_match = re.search(r'};', rest)
        if not footer_match:
             return

    prompts_content = rest[:footer_match.start()]
    footer = rest[footer_match.start():]

    # Extract all prompts: "id": `...`,
    # This regex is tricky due to nested backticks and various formatting.
    # We'll use the same logic as before but store in a dict to deduplicate.
    
    prompt_entries = []
    # Split by: "id": `
    parts = re.split(r'(\s*?\"[a-zA-Z0-9-]+\":\s+?`)', prompts_content)
    
    # parts[0] is often whitespace/comments before the first prompt.
    current_gap = parts[0]
    
    prompts_dict = {} # key -> content
    
    for i in range(1, len(parts), 2):
        key_line = parts[i]
        key = re.search(r'\"([a-zA-Z0-9-]+)\"', key_line).group(1)
        rest_of_prompt = parts[i+1]
        
        # End at `,\n or `};
        match = re.search(r'`(\s*?,?\s*?[\n\r]|};)', rest_of_prompt)
        if match:
            inner_content = rest_of_prompt[:match.start()]
            # We want to keep the LATEST occurrence if duplicates exist (those are our high-fidelity ones)
            # OR we check if one is longer (more detailed)
            if key in prompts_dict:
                 if len(inner_content) > len(prompts_dict[key]):
                      prompts_dict[key] = inner_content
            else:
                 prompts_dict[key] = inner_content
    
    # Reconstruct
    new_prompts_content = current_gap
    for key, val in prompts_dict.items():
        # Escape backticks in value
        escaped_val = val.replace('\\`', '`').replace('`', '\\`') # Unescape first then re-escape to be safe
        new_prompts_content += f'\n    "{key}": `{escaped_val}`,'
    
    # Remove last comma if needed or just leave it
    
    final_content = header + new_prompts_content + "\n" + footer
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print(f"Successfully deduplicated {file_path}")

# Run for all three
deduplicate_prompts(r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\antigravityPrompts.ts')
deduplicate_prompts(r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\claudePrompts.ts')
deduplicate_prompts(r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\lovablePrompts.ts')
