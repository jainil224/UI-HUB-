import re

file_path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\componentData.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

previews = {
    "space-background": "() => <SpaceBackgroundPreview />",
    "black-hole-background": "() => <BlackHolePreview />",
    "mouse-gravity-background": "() => <MouseGravityPreview />",
    "interactive-webgl-scene": "() => <InteractiveWebGLScenePreview />",
    "3d-scroll-animation": "() => <Scroll3DAnimationPreview />",
    "lizard-cursor": "() => <LizardCursorPreview />",
    "3d-tubes-cursor": "() => <ThreeDTubesCursorPreview />"
}

for pid, preview in previews.items():
    # Insert preview field after isPremium: true if it's missing
    pattern = rf'(id:\s*"{pid}".*?isPremium:\s*true,)(\s*code:)'
    if re.search(pattern, content, re.DOTALL) and f'preview: {preview}' not in content:
        content = re.sub(pattern, rf'\1\n        preview: {preview},\2', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Previews restored.")
