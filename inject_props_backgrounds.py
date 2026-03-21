import re

file_path = r'c:\Users\Admin\Documents\GitHub\UI-HUB-\frontend\src\data\antigravityPrompts.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

props_mapping = {
    "grid-background": "- gridSize: number = 24 — width/height dimension of each grid cell.\n- gridColor: string = '#80808012' — the color of the grid lines.\n- className: string = '' — optional styling wrapper.\n- label: string = '' — centered text.\n- maskRadius: string | number = '50% 50% at 50% 50%' — CSS radial gradient mask setting.\n- opacity: number = 1 — container opacity.",
    
    "hacker-background": "- color: string = '#0F0' — Matrix code rain color.\n- fontSize: number = 15 — size of falling matrix characters.\n- className: string = '' — container styling.\n- speed: number = 1 — multiplier governing descent rate.",
    
    "novatrix-background": "- colorFrom: string = '#1e1b4b' — start color of ambient clouds.\n- colorTo: string = '#581c87' — end color for ambient mixing.\n- opacity: number = 1 — effect transparency.\n- className: string = '' — styling override.\n- title: string = '' — animated text displayed over the fluid motion.",
    
    "beam-grid-background": "- gridSize: number = 40 — width/height dimension.\n- gridColor: string = 'rgba(255, 255, 255, 0.05)' — default grid line color.\n- darkGridColor: string = 'rgba(255, 255, 255, 0.05)' — grid line color in dark mode.\n- beamColor: string = 'rgba(0, 255, 255, 1)' — actual stroke color for active beams.\n- darkBeamColor: string = 'rgba(0, 255, 255, 1)' — active beam stroke color in dark mode.\n- beamSpeed: number = 5 — translation velocity.\n- beamThickness: number = 1 — line thickness constraint.\n- beamGlow: boolean = true — enables bloom shader filters.\n- glowIntensity: number = 10 — blur/bloom value logic.\n- beamCount: number = 15 — total amount of roaming neon beams.\n- idleSpeed: number = 2 — ambient background movement rate.\n- interactive: boolean = true — responds to mouse tracking.\n- fadeIntensity: number = 0.5 — strength of the gradient focal mask.",
    
    "fall-beam-background": "- lineCount: number = 20 — density of falling lines.\n- beamColorClass: string = 'from-cyan-400' — tailwind utility configuration.\n- beamColor: string = 'rgba(34, 211, 238, 1)' — explicitly mapped canvas color.\n- opacity: number = 1 — overall opacity.\n- displayText: string = '' — optional centered text to overlay.\n- className: string = '' — CSS wrapper properties.",
    
    "hell-background": "- backdropBlurAmount: 'none'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl' = 'none' — Tailwind blur class mapping.\n- color: string = '#ff3300' — primary red/orange core temperature tint.\n- speed: number = 1 — multiplier applied to the shader time uniform.\n- intensity: number = 1 — shader displacement magnitude ratio.\n- className: string = '' — layout definitions.",
    
    "interactive-grid-background": "- gridSize: number = 40 — base dimensions.\n- gridColor: string = 'rgba(255, 255, 255, 0.05)' — base lines.\n- darkGridColor: string = 'rgba(255, 255, 255, 0.05)' — dark background lines.\n- effectColor: string = 'rgba(0, 255, 255, 0.5)' — trail/neon color.\n- darkEffectColor: string = 'rgba(0, 255, 255, 0.5)' — dark effect color.\n- trailLength: number = 5 — count of highlighted squares tracing the mouse.\n- idleSpeed: number = 0.2 — automatic roaming when disconnected from mouse.\n- glow: boolean = true — enables box-shadow blooming on active squares.\n- glowRadius: number = 35 — spread of the bloom lighting.\n- showFade: boolean = true — restricts visibility via radial-gradient mask.\n- fadeIntensity: number = 1 — depth ratio for CSS gradient edge fading.\n- idleRandomCount: number = 5 — total automated 'ghost' pointers present when idle.",
    
    "particles-background": "- colors: string[] = ['#ffffff'] — random palette mapping array.\n- size: number = 2 — point/sphere scale rendering diameter.\n- countDesktop: number = 100 — baseline volume.\n- countTablet: number = 60 — scaled down density.\n- countMobile: number = 40 — performance limit volume.\n- speed: number = 1 — particle drift velocity.\n- interactive: boolean = true — enable repel physics.",
    
    "wave-background": "- backdropBlurAmount: 'none'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl' = 'none' — underlying canvas blur.\n- speed: number = 1 — glsl time flow manipulation.\n- intensity: number = 1 — amplitude scaling.\n- className: string = '' — z-index overrides.",
    
    "lines-background": "- title: string = '' — prominent text string.\n- pathColor: string = '#ffffff' — unified stroke interpolation tint.\n- opacity: number = 1 — overall frame opacity setting.\n- className: string = '' — layout properties.",
    
    "sparkles-background": "- title: string = '' — text overlay configuration.\n- particleColor: string = '#ffffff' — base string matching variable theme.\n- density: number = 100 — limit to total visual entities generated.\n- minSize: number = 0.5 — scale variation floor.\n- maxSize: number = 2 — scale variation ceiling.\n- className: string = '' — layout boundaries.",
    
    "isometric-grid-background": "- title: string = '' — optional display string.\n- boxProps: any = { rowsCount: 15, colsCount: 15 } — nested props for passing rows boundaries and colors.\n- className: string = '' — bounding rect configuration.",
    
    "space-background": "- starCount: number = 600 — dense rendering cluster volume.\n- nebulaCount: number = 6 — count of layered blending radial shapes.\n- interactive: boolean = true — enable mouse parallax.\n- className: string = '' — root overrides.",
    
    "neural-network-background": "- nodeCount: number = 120 — network dots rendering budget.\n- connectionDistance: number = 150 — threshold to draw connective strands.\n- interactive: boolean = true — responds to mouse.\n- nodeColor: string = '#888888' — static dots mapping.\n- lineColor: string = '#888888' — generated web tint.\n- className: string = '' — layout context.",
    
    "black-hole-background": "- particleCount: number = 600 — orbiting simulated points.\n- coreColor: string = '#000000' — singular center black background.\n- accentColor: string = '#60daff' — event horizon hue blending using composite mode.\n- className: string = '' — dimensions limit.",
    
    "warp-speed-background": "- starCount: number = 400 — dense 3D projection count limit.\n- speed: number = 20 — velocity multiplier along inverted Z plane.\n- starColor: string = '#ffffff' — motion blur line stroke colors.\n- className: string = '' — block overrides.",
    
    "mouse-gravity-background": "- particleCount: number = 200 — stable generated point counts.\n- attractionRadius: number = 300 — force vector range checking bound.\n- attractionForce: number = 0.05 — proportional acceleration scalar.\n- particleColor: string = '#888888' — passive drifting point color.\n- accentColor: string = '#00ffff' — color transitioned when near the cursor gravity influence.\n- enableTrail: boolean = true — spawn duplicate ephemeral trails.\n- className: string = '' — element context overrides."
}

def inject_props_section(match):
    key = match.group(1)
    prompt_source = match.group(2)
    if key in props_mapping:
        # Check to ensure PROPS (with defaults) isn't already there
        if "## PROPS (with defaults):" in prompt_source:
            return match.group(0)
        
        props_injection = f"## PROPS (with defaults):\n{props_mapping[key]}\n\n"
        
        # Insert before ## IMPLEMENTATION REQUIREMENTS if it exists
        if "## IMPLEMENTATION REQUIREMENTS" in prompt_source:
            new_prompt = re.sub(r'(---[\r\n]+## IMPLEMENTATION REQUIREMENTS)', f'---\n\n{props_injection}\\1', prompt_source)
        else:
            # If not, inject before FINAL OUTPUT
            new_prompt = re.sub(r'(---[\r\n]+## FINAL OUTPUT)', f'---\n\n{props_injection}\\1', prompt_source)
            
        return f'"{key}": `{new_prompt}`'
    return match.group(0)

pattern = re.compile(r'"([^"]+)": `(.*?)`', re.DOTALL)
new_content = pattern.sub(inject_props_section, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Injected exact PROPS (with defaults) section for Backgrounds successfully.")
