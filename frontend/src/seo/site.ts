export const SITE_URL = 'https://ui-hub-design.vercel.app';

export const SITE_NAME = 'UI Hub';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/ui-hub-banner.png`;

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

export function absoluteUrl(path: string): string {
    if (!path) return `${SITE_URL}/`;
    if (/^https?:\/\//i.test(path)) return path;
    return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

const TITLE_SEPARATORS = [' | ', ' – ', ' · ', ' - ', ': '];

export const DANGLING_WORDS = new Set([
    'a', 'an', 'and', 'as', 'at', 'before', 'between', 'but', 'by', 'can', 'during',
    'each', 'for', 'from', 'in', 'into', 'is', 'it', 'its', 'not', 'of', 'on', 'or',
    'out', 'over', 'per', 'so', 'than', 'that', 'the', 'then', 'this', 'through',
    'to', 'under', 'up', 'via', 'was', 'when', 'while', 'which', 'will', 'with',
    'without', 'your',
]);

const CLAUSE_SEPARATORS = [', ', '; ', ' and ', ' with '];

function cutAtNaturalBreak(value: string, max: number): string {
    const hard = value.slice(0, max - 1);

    for (const separator of TITLE_SEPARATORS) {
        const index = hard.lastIndexOf(separator);
        if (index > max * 0.5) return hard.slice(0, index).trimEnd();
    }

    const lastSpace = hard.lastIndexOf(' ');
    const base = lastSpace > max * 0.5 ? hard.slice(0, lastSpace) : hard;
    return base.trimEnd().replace(/[,;:–-]+$/, '');
}

export function clampTitle(title: string): string {
    const value = title.trim().replace(/\s+/g, ' ');
    return value.length <= TITLE_MAX ? value : `${cutAtNaturalBreak(value, TITLE_MAX)}…`;
}

export function clampDescription(description: string): string {
    const value = description.trim().replace(/\s+/g, ' ');
    if (value.length <= DESCRIPTION_MAX) return value;

    const hard = value.slice(0, DESCRIPTION_MAX - 1);

    const sentenceEnd = Math.max(
        hard.lastIndexOf('. '),
        hard.lastIndexOf('! '),
        hard.lastIndexOf('? '),
    );
    if (sentenceEnd > DESCRIPTION_MAX * 0.55) return hard.slice(0, sentenceEnd + 1);

    let cut = cutAtNaturalBreak(value, DESCRIPTION_MAX);

    for (const separator of CLAUSE_SEPARATORS) {
        const index = cut.lastIndexOf(separator);
        if (index > DESCRIPTION_MAX * 0.6) {
            cut = cut.slice(0, index);
            break;
        }
    }

    const words = cut.split(' ').filter(Boolean);
    while (words.length > 4 && DANGLING_WORDS.has((words[words.length - 1] ?? '').toLowerCase())) {
        words.pop();
    }
    cut = words.join(' ').trimEnd().replace(/[,;:–-]+$/, '');

    if (/['"’”]$/.test(cut)) {
        cut = cut.slice(0, -1).trimEnd();
    }

    return `${cut}…`;
}

/**
 * "an interactive background" but "a UI effect" and "a 3D effect".
 */
export function indefiniteArticle(word: string): 'a' | 'an' {
    const trimmed = word.trim();
    if (/^ui\b/i.test(trimmed)) return 'a';
    const first = /^[a-z]/i.exec(trimmed)?.[0]?.toLowerCase();
    if (!first) return 'a';
    return 'aeiou'.includes(first) ? 'an' : 'a';
}

/**
 * Lowercases a phrase for use mid-sentence while preserving acronyms, so
 * "3D Effects" becomes "3d effects" -> "3D effects" and "Animated Text"
 * becomes "animated text".
 */
export function lowerPhrase(value: string): string {
    return value
        .split(' ')
        .map((word) => {
            const bare = word.replace(/[^A-Za-z0-9]/g, '');
            const isAcronym =
                bare.length >= 2 && bare.length <= 4 && bare === bare.toUpperCase() && /[A-Z]/.test(bare);
            return isAcronym ? word : word.toLowerCase();
        })
        .join(' ');
}

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function escapeXml(value: string): string {
    return escapeHtml(value);
}