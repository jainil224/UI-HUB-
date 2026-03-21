import re
import json

path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\antigravityPrompts.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

keys = re.findall(r'"([^"]+)": `', content)
print(json.dumps(keys, indent=2))
