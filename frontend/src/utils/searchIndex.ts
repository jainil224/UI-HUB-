import type { ComponentItem } from '../data/componentData';
import type { TemplateItem } from '../data/templatesData';

/** Brand-safe accent colors for every component category (used for the suggestion dot). */
export const COMPONENT_CATEGORY_COLORS: Record<string, string> = {
    button: '#1F4BFF',
    text: '#FFC700',
    effect: '#A78BFA',
    background: '#00E599',
    cursor: '#E52520',
    '3d': '#38BDF8',
    custom: '#F472B6',
    scroll: '#FBBF24',
    'image-interaction': '#FB7185',
    'interactive-background': '#2DD4BF',
    loader: '#A3E635',
    navbar: '#60A5FA',
    footer: '#F59E0B',
};

interface SearchData {
    comps: ComponentItem[];
    templates: TemplateItem[];
}

let cache: SearchData | null = null;

// componentData.tsx is a large module (113 previews) — import it lazily and keep it cached
// so the Navbar/Hero bundles don't pay the cost on first paint.
async function getData(): Promise<SearchData> {
    if (cache) return cache;
    const [ci, td] = await Promise.all([
        import('../data/componentData'),
        import('../data/templatesData'),
    ]);
    cache = { comps: ci.componentList, templates: td.websiteTemplates };
    return cache;
}

function norm(s: string): string {
    return s.toLowerCase().trim();
}

/** Higher score = more relevant match (ties broken by insertion order). */
function scoreMatch(q: string, title: string, category: string, extras: (string | undefined)[]): number {
    const ql = norm(q);
    if (!ql) return 0;
    const t = norm(title);
    const c = norm(category);
    if (t.startsWith(ql)) return 120;
    if (t.includes(ql)) return 90;
    if (c.startsWith(ql)) return 70;
    if (c.includes(ql)) return 60;
    for (const ex of extras) {
        if (ex && norm(ex).includes(ql)) return 50;
    }
    return 0;
}

export interface SearchEverythingResult {
    components: ComponentItem[];
    templates: TemplateItem[];
    total: number;
}

export async function searchEverything(
    query: string,
    opts?: { componentLimit?: number; templateLimit?: number }
): Promise<SearchEverythingResult> {
    const q = query.trim();
    if (!q) {
        return { components: [], templates: [], total: 0 };
    }

    const data = await getData();
    const componentLimit = opts?.componentLimit ?? 6;
    const templateLimit = opts?.templateLimit ?? 4;

    const components = data.comps
        .map((c) => ({ c, s: scoreMatch(q, c.title, c.category, [c.description]) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, componentLimit)
        .map((x) => x.c);

    const templates = data.templates
        .map((t) => ({ t, s: scoreMatch(q, t.title, t.category, [t.description]) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, templateLimit)
        .map((x) => x.t);

    return {
        components,
        templates,
        total: components.length + templates.length,
    };
}