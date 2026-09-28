import { TemplateItem, websiteTemplates } from '../data/templatesData';

/**
 * UI Hub - Website Template Relevance
 *
 * Ranks how closely each catalogue template matches the one currently open on
 * the template detail page, powering the left "Similar Templates" rail.
 *
 * Why this exists: the rail used to sort with a single binary comparison
 * (`Number(b.category === a.category) - Number(a.category === a.category)`),
 * which floated same-category templates to the top and then fell back to raw
 * declaration order. A template in a category with no siblings therefore
 * received an arbitrary ordering, and the rail had no way to explain itself.
 *
 * Which fields actually carry signal (measured across the current 18 entries):
 *
 *   styling        "Tailwind CSS" x18      -> no variance, contributes 0
 *   badge          "NEW" x18               -> no variance, contributes 0
 *   isPro          false x18               -> no variance, contributes 0
 *   stats.rating   5.0 x17                 -> no variance, contributes 0
 *   stats.pages    1 x17                   -> no variance, contributes 0
 *   framework      same x17, 1 outlier     -> near-zero, kept as a small bonus
 *   category       4 real buckets          -> primary signal
 *   animation      17 distinct values      -> strong technical signal
 *   title + description                    -> supporting signal
 *   stats.downloads 2.7k-4.8k, all unique  -> popularity tiebreak
 *
 * The zero-variance fields are intentionally excluded rather than scored, so
 * nobody re-adds them later expecting them to affect the ordering.
 */

export const RELEVANCE_WEIGHTS = {
    category: 40,
    animation: 25,
    text: 20,
    framework: 5,
    popularity: 10,
} as const;

export const MAX_RELEVANCE_SCORE =
    RELEVANCE_WEIGHTS.category +
    RELEVANCE_WEIGHTS.animation +
    RELEVANCE_WEIGHTS.text +
    RELEVANCE_WEIGHTS.framework +
    RELEVANCE_WEIGHTS.popularity;

const MIN_TOKEN_LENGTH = 3;

/**
 * Upper bound on "why it matched" chips per card. Category + two technical
 * highlights + the download tiebreak is the most that stays readable in a
 * 280px rail; anything past that is truncated by {@link buildReasons}.
 */
export const MAX_REASONS = 3;

/** Grammar and separators that carry no meaning for template matching. */
const STOP_WORDS = new Set([
    'and', 'the', 'with', 'of', 'for', 'to', 'in', 'on', 'at', 'by', 'is', 'it',
    'its', 'or', 'as', 'via', 'from', 'be', 'are', 'was', 'were', 'that', 'this',
    'plus', 'js',
]);

/**
 * Copy every landing page in the catalogue uses to describe itself. Kept out of
 * the text score so that "hero section with a 3D globe" does not score highly
 * just because it is also a "modern interactive hero section".
 */
const GENERIC_COPY = new Set([
    'hero', 'section', 'page', 'pages', 'landing', 'website', 'site', 'web',
    'template', 'component', 'element', 'elements', 'modern', 'sleek', 'premium',
    'design', 'designs', 'layout', 'responsive', 'immersive', 'stunning',
    'beautiful', 'animated', 'animation', 'interactive', 'interactions',
    'visual', 'visually', 'rich', 'quality', 'perfect', 'style', 'styles',
    'styling', 'experience', 'front', 'end', 'ui', 'ux', 'featuring', 'using',
    'powered', 'built', 'showcase', 'display', 'background', 'high', 'low',
]);

/**
 * Normalises compound technical terms so the same concept tokenises to the same
 * string on both sides ("Three.js"/"three js"/"three-js" all -> "threejs",
 * "Micro-interactions"/"Micro Interactions" -> "microinteraction").
 */
const PHRASE_ALIASES: ReadonlyArray<readonly [RegExp, string]> = [
    [/micro[\s-]?interactions?/gi, 'microinteraction'],
    [/three\.?js/gi, 'threejs'],
    [/framer[\s-]?motion/gi, 'framermotion'],
    [/web[\s-]?audio/gi, 'webaudio'],
    [/web[\s-]?gl/gi, 'webgl'],
    [/\bscroll[\s-]?triggered\b/gi, 'scrolltriggered'],
    [/\blenis\b/gi, 'lenis'],
    [/\bgsap\b/gi, 'gsap'],
];

/** Display casing for tokens that are acronyms or proper nouns. */
const TOKEN_LABELS: Record<string, string> = {
    threejs: 'Three.js',
    framermotion: 'Framer Motion',
    webaudio: 'Web Audio',
    webgl: 'WebGL',
    microinteraction: 'Micro-interactions',
    microinteractions: 'Micro-interactions',
    scrolltriggered: 'Scroll-triggered',
    lenis: 'Lenis',
    gsap: 'GSAP',
    css: 'CSS',
    svg: 'SVG',
    ui: 'UI',
    ux: 'UX',
    '3d': '3D',
    '2d': '2D',
    '5d': '5D',
    '4d': '4D',
    'hud': 'HUD',
    ai: 'AI',
    api: 'API',
    cta: 'CTA',
    saas: 'SaaS',
    nft: 'NFT',
    dao: 'DAO',
    p2p: 'P2P',
    b2b: 'B2B',
    id: 'ID',
    seo: 'SEO',
    iou: 'IOU',
    lp: 'LP',
    mvp: 'MVP',
    faq: 'FAQ',
    crm: 'CRM',
    cms: 'CMS',
    ecom: 'E-com',
    vfx: 'VFX',
    x: 'X',
    o: 'O',
};

export interface RelatedTemplate {
    template: TemplateItem;
    score: number;
    /** Short, human-readable chips explaining why this template was picked. */
    reasons: string[];
    /** Same-category templates always sort above cross-category ones. */
    sameCategory: boolean;
    downloads: number;
}

function applyAliases(value: string): string {
    let out = value;
    for (const [pattern, replacement] of PHRASE_ALIASES) {
        out = out.replace(pattern, replacement);
    }
    return out;
}

/**
 * Lowercases, strips punctuation and returns a set of meaningful tokens.
 * The alias pass runs first so compound terms survive as single tokens.
 */
export function tokenize(value: string): Set<string> {
    const normalized = applyAliases(value.toLowerCase()).replace(/[^a-z0-9]+/g, ' ');
    const tokens = new Set<string>();

    for (const raw of normalized.split(' ')) {
        if (raw.length < MIN_TOKEN_LENGTH) continue;
        if (STOP_WORDS.has(raw)) continue;
        tokens.add(raw);
    }

    return tokens;
}

/** Same as {@link tokenize} but also drops the copy every template shares. */
function tokenizeContent(value: string): Set<string> {
    const tokens = tokenize(value);
    for (const word of GENERIC_COPY) {
        tokens.delete(word);
    }
    return tokens;
}

/**
 * Sørensen-Dice coefficient over two token sets. Preferred over Jaccard here
 * because descriptions vary a lot in length and Dice is far more forgiving of
 * that than a union-relative ratio.
 */
function diceCoefficient(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 || b.size === 0) return 0;

    let shared = 0;
    const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
    for (const token of smaller) {
        if (larger.has(token)) shared += 1;
    }

    return (2 * shared) / (a.size + b.size);
}

/**
 * Converts a human download count into a number: "4.8k" -> 4800, "1.2m" ->
 * 1200000, "820" -> 820. Unparseable values score 0 rather than NaN.
 */
export function parseDownloads(downloads: string): number {
    const match = /^\s*([\d.]+)\s*([km])?\s*$/i.exec(downloads ?? '');
    if (!match) return 0;

    const value = Number.parseFloat(match[1]);
    if (!Number.isFinite(value)) return 0;

    const unit = match[2]?.toLowerCase();
    if (unit === 'k') return value * 1000;
    if (unit === 'm') return value * 1000000;
    return value;
}

function labelForToken(token: string): string {
    const known = TOKEN_LABELS[token];
    if (known) return known;
    return token.charAt(0).toUpperCase() + token.slice(1);
}

/**
 * Pulls readable shared phrases out of two animation descriptions by matching
 * the source's own comma/"&"/"+" separated phrases against the candidate.
 * Reading "3D Parallax" straight off the data beats reconstructing a label
 * from a normalised token.
 */
function sharedAnimationPhrases(source: string, candidate: string): string[] {
    if (!source || !candidate) return [];

    const haystack = candidate.toLowerCase();
    const phrases = applyAliases(source.toLowerCase())
        .split(/&|\+|,|\//)
        .map((phrase) => phrase.replace(/[^a-z0-9]+/g, ' ').trim())
        .filter((phrase) => phrase.includes(' ') && phrase.length > 3);

    const seen = new Set<string>();
    const matched: string[] = [];

    for (const phrase of phrases) {
        if (haystack.includes(phrase) && !seen.has(phrase)) {
            seen.add(phrase);
            matched.push(phrase.replace(/\b[a-z]/g, (char) => char.toUpperCase()));
        }
    }

    return matched.slice(0, 2);
}

/** Falls back to individual shared tokens when no whole phrase matches. */
function sharedAnimationTokens(a: Set<string>, b: Set<string>): string[] {
    const shared: string[] = [];
    for (const token of a) {
        if (b.has(token)) shared.push(labelForToken(token));
    }
    return shared.slice(0, 2);
}

function sharedContentWords(
    source: Set<string>,
    candidate: Set<string>,
    originalText: string,
): string[] {
    if (source.size === 0) return [];

    // Walk the original text so chips read in the order a human would say them.
    const ordered = applyAliases(originalText.toLowerCase())
        .replace(/[^a-z0-9]+/g, ' ')
        .split(' ')
        .filter((word) => word.length >= MIN_TOKEN_LENGTH && !STOP_WORDS.has(word));

    const picked: string[] = [];
    for (const word of ordered) {
        if (picked.length >= 2) break;
        if (picked.some((existing) => existing.toLowerCase() === word)) continue;
        if (source.has(word) && candidate.has(word)) {
            picked.push(labelForToken(word));
        }
    }

    return picked;
}

function formatDownloadCount(downloads: number): string {
    if (downloads >= 1000000) return `${Math.round(downloads / 100000) / 10}m downloads`;
    if (downloads >= 1000) return `${Math.round(downloads / 100) / 10}k downloads`;
    return `${Math.round(downloads)} downloads`;
}

/** Assembles the "why it matched" chips in descending order of usefulness. */
function buildReasons(parts: ReadonlyArray<ReadonlyArray<string>>): string[] {
    const reasons: string[] = [];

    for (const group of parts) {
        for (const reason of group) {
            if (reasons.length >= MAX_REASONS) return reasons;
            if (!reason) continue;
            if (reasons.some((existing) => existing.toLowerCase() === reason.toLowerCase())) continue;
            reasons.push(reason);
        }
    }

    return reasons;
}

/**
 * Scores a single candidate against the template being viewed.
 *
 * `maxDownloads` is the highest download count in the catalogue and is used to
 * normalise popularity into a stable 0-1 range regardless of catalogue size.
 */
export function scoreTemplatePair(
    source: TemplateItem,
    candidate: TemplateItem,
    maxDownloads: number,
): { score: number; reasons: string[]; sameCategory: boolean; downloads: number } {
    const sameCategory = candidate.category === source.category;
    const downloads = parseDownloads(candidate.stats.downloads);
    let score = 0;

    if (sameCategory) {
        score += RELEVANCE_WEIGHTS.category;
    }

    const sourceAnimation = tokenize(source.animation);
    const candidateAnimation = tokenize(candidate.animation);
    const animationScore = diceCoefficient(sourceAnimation, candidateAnimation);
    let animationHighlights: string[] = [];

    if (animationScore > 0) {
        score += animationScore * RELEVANCE_WEIGHTS.animation;

        const phrases = sharedAnimationPhrases(source.animation, candidate.animation);
        animationHighlights = phrases.length > 0
            ? phrases
            : sharedAnimationTokens(sourceAnimation, candidateAnimation);
    }

    const sourceText = tokenizeContent(`${source.title} ${source.description}`);
    const candidateText = tokenizeContent(`${candidate.title} ${candidate.description}`);
    const textScore = diceCoefficient(sourceText, candidateText);
    let textHighlights: string[] = [];

    if (textScore > 0) {
        score += textScore * RELEVANCE_WEIGHTS.text;
        textHighlights = sharedContentWords(sourceText, candidateText, source.description);
    }

    if (candidate.framework === source.framework) {
        // Scored but never shown as a chip: 17 of 18 templates declare the same
        // framework, so it barely affects the order and would be noise on every
        // card if displayed.
        score += RELEVANCE_WEIGHTS.framework;
    }

    let popularityReason: string[] = [];
    if (maxDownloads > 0 && downloads > 0) {
        score += (downloads / maxDownloads) * RELEVANCE_WEIGHTS.popularity;
        popularityReason = [formatDownloadCount(downloads)];
    }

    const reasons = buildReasons([
        sameCategory ? [source.category] : [],
        animationHighlights,
        textHighlights,
        popularityReason,
    ]);

    return { score, reasons, sameCategory, downloads };
}

/**
 * Ranks every other template against `source`, best first.
 *
 * Ties break on download count and then on id so the rail never reorders
 * itself between renders. Pass `limit` to get the top N; the total available is
 * always `all.length - 1`.
 */
export function getRelatedTemplates(
    source: TemplateItem,
    all: TemplateItem[] = websiteTemplates,
    limit?: number,
): RelatedTemplate[] {
    const candidates = all.filter((item) => item.id !== source.id);

    const maxDownloads = candidates.reduce(
        (max, item) => Math.max(max, parseDownloads(item.stats.downloads)),
        0,
    );

    const ranked = candidates
        .map((template) => {
            const { score, reasons, sameCategory, downloads } = scoreTemplatePair(
                source,
                template,
                maxDownloads,
            );
            return { template, score, reasons, sameCategory, downloads };
        })
        .sort((a, b) => {
            // Same category first so the rail reads as a curated shelf, then the
            // real score decides everything after that.
            if (a.sameCategory !== b.sameCategory) return a.sameCategory ? -1 : 1;
            if (b.score !== a.score) return b.score - a.score;
            if (b.downloads !== a.downloads) return b.downloads - a.downloads;
            return a.template.id.localeCompare(b.template.id);
        });

    return typeof limit === 'number' ? ranked.slice(0, Math.max(0, limit)) : ranked;
}

/**
 * 0-100 confidence that a related template is a good match, for optional UI
 * affordances such as a match percentage.
 */
export function toMatchPercent(score: number): number {
    if (MAX_RELEVANCE_SCORE <= 0) return 0;
    return Math.round((Math.max(0, score) / MAX_RELEVANCE_SCORE) * 100);
}
