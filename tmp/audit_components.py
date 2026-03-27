import re
import collections

file_path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\componentData.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Match patterns: id: "...", category: "..."
# We only care about components in the componentList
items = re.findall(r'id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*category:\s*"([^"]+)"', content)

ids = [item[0] for item in items]
titles = [item[1] for item in items]

id_counts = collections.Counter(ids)
title_counts = collections.Counter(titles)

duplicates_ids = [k for k, v in id_counts.items() if v > 1]
duplicates_titles = [k for k, v in title_counts.items() if v > 1]

print("Duplicate IDs:", duplicates_ids)
print("Duplicate Titles:", duplicates_titles)

for id_val in duplicates_ids:
    matches = re.finditer(rf'id:\s*"{id_val}"', content)
    for match in matches:
        start = match.start()
        # Find line number
        line_num = content.count('\n', 0, start) + 1
        print(f"ID {id_val} found at line {line_num}")

for title_val in duplicates_titles:
    matches = re.finditer(rf'title:\s*"{title_val}"', content)
    for match in matches:
        start = match.start()
        line_num = content.count('\n', 0, start) + 1
        print(f"Title {title_val} found at line {line_num}")
