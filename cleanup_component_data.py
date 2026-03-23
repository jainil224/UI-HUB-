import re
import os

file_path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\componentData.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Highly aggressive fix for the corruption area
# We match from 'transform: "translate(-50%, -50%)",' until the end of that corrupted block
corruption_regex = re.compile(
    r"transform: 'translate\(-50%, -50%\)',\s+o\s+code: \"\",\s+vibePrompt: \"\" 2s linear infinite;.*?export default BlackHoleCursor;\s+`,",
    re.DOTALL
)

restoration = r"""transform: 'translate(-50%, -50%)',
                    opacity: isLocked ? 0 : 1,
                    transition: 'opacity 0.2s ease',
                }} />
            </div>
        </div>
    );
};

export default TargetCursor;`,
        vibePrompt: ""
    },
    {
        id: "black-hole-cursor",
        title: "Black Hole Cursor",
        category: "cursor",
        isPremium: true,
        preview: () => <BlackHoleCursorPreview />,
        code: "",
        vibePrompt: ""
    ,"""

new_content = corruption_regex.sub(restoration, content)

# Broadly replace all vibePrompts using the local imports
new_content = re.sub(r'vibePrompt:\s+(ANTIGRAVITY|LOVABLE)_PROMPTS\[\".*?\"\]', 'vibePrompt: ""', new_content)

# Ensure premium components listed in the request are stripped
premium_ids = [
    "spotlight-cards", "robot-3d-background", "interactive-webgl-scene", 
    "3d-scroll-animation", "3d-slider", "hell-background", 
    "interactive-grid-background", "isometric-grid-background", 
    "space-background", "black-hole-background", "mouse-gravity-background", 
    "lizard-cursor", "3d-tubes-cursor", "black-hole-cursor", "magnetic-cursor"
]

for pid in premium_ids:
    # Match the entire component object and strip code/vibePrompt
    # This is a bit risky but we can try to target just the code and vibePrompt fields within that object
    pattern = rf'(id:\s*"{pid}".*?code:\s*`)(.*?)(`,\s*vibePrompt:\s*)(.*?)(\s*}})'
    new_content = re.sub(pattern, r'\1\3""\5', new_content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Aggressive replacement complete.")
