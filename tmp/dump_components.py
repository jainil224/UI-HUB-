import re

file_path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\componentData.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to capture the entire object to get id, title, and category correctly
# This matches objects like { id: "...", title: "...", category: "...", ... }
# Using a slightly more flexible regex to handle potential multi-line or extra spaces
matches = re.finditer(r'\{[^}]*id:\s*"([^"]+)"[^}]*title:\s*"([^"]+)"[^}]*category:\s*"([^"]+)"', content, re.DOTALL)

print(f"{'ID':<30} | {'TITLE':<30} | {'CATEGORY':<15}")
print("-" * 80)
for m in matches:
    print(f"{m.group(1):<30} | {m.group(2):<30} | {m.group(3):<15}")
