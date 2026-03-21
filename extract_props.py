import os
import re

directory = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\components\ui'
files = [
    'AuroraCursor.tsx',
    'BlackHoleCursor.tsx',
    'HeartCursor.tsx',
    'LizardCursor.tsx',
    'MagneticCursor.tsx',
    'TargetCursor.tsx',
    'ThreeDTubesCursor.tsx',
    'VenomCursor.tsx'
]

for file in files:
    with open(os.path.join(directory, file), 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"--- {file} ---")
    
    # Extract interface
    interface_match = re.search(r'interface \w+Props \{([^}]+)\}', content)
    if interface_match:
        print("INTERFACE:")
        print(interface_match.group(1).strip())
    
    # Extract component signature to find defaults
    # Look for: const ComponentName: React.FC<Props> = ({ prop1, prop2 = 'default' ... }) => {
    signature_match = re.search(r'\({\s*([^}]+)\s*}\)', content)
    if signature_match:
        print("\nDEFAULTS:")
        print(signature_match.group(1).strip())
    print("\n-----------------------\n")
