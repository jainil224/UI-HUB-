/**
 * Lazy, VS Code-accurate syntax highlighting for the template Code tab.
 *
 * Built on shiki with deliberately fine-grained imports so the grammars we
 * need are downloaded on demand rather than shipping the full bundle:
 *   - `shiki/core`                    engine-agnostic highlighter core
 *   - `shiki/engine/javascript`       pure-JS regex engine, so no .wasm fetch
 *   - `shiki/themes/dark-plus.mjs`    VS Code's own default dark theme
 *   - `shiki/langs/<lang>.mjs`        one grammar, pulled only when a file needs it
 *
 * `dark-plus` is the real VS Code theme, so the emitted colours are the
 * genuine ones rather than an approximation of them.
 */

export interface HighlightedToken {
    content: string;
    color?: string;
    fontStyle?: string;
}

/** One entry per source line, ready to be virtualised by the viewer. */
export type HighlightedLine = HighlightedToken[];

/** Languages this viewer can colour. Kept small on purpose - each is a chunk. */
export type CodeLanguage = 'tsx' | 'ts' | 'jsx' | 'js' | 'css' | 'json' | 'html' | 'xml' | 'markdown';

const THEME = 'dark-plus';

type HighlighterCoreOptions = NonNullable<
    Parameters<typeof import('shiki/core').createHighlighterCore>[0]
>;
type LanguageInput = HighlighterCoreOptions['langs'] extends (infer T)[] ? T : never;

/**
 * Grammars are not uniform: some (`tsx`, `typescript`) export a single
 * registration, others (`css`, `html`, `markdown`) export an array of them.
 * `loadLanguage` accepts both, so the loaders are typed loosely and the value
 * is handed over untouched.
 */
const LANGUAGE_LOADERS: Record<CodeLanguage, () => Promise<{ default: unknown }>> = {
    tsx: () => import('shiki/langs/tsx.mjs'),
    ts: () => import('shiki/langs/ts.mjs'),
    jsx: () => import('shiki/langs/jsx.mjs'),
    js: () => import('shiki/langs/js.mjs'),
    css: () => import('shiki/langs/css.mjs'),
    json: () => import('shiki/langs/json.mjs'),
    html: () => import('shiki/langs/html.mjs'),
    xml: () => import('shiki/langs/xml.mjs'),
    markdown: () => import('shiki/langs/markdown.mjs'),
};

type Highlighter = Awaited<ReturnType<typeof import('shiki/core').createHighlighterCore>>;

let highlighterPromise: Promise<Highlighter> | null = null;
const loadedLanguages = new Set<CodeLanguage>();

/** Creates the highlighter once per page load, shared by every file opened. */
function getHighlighter(): Promise<Highlighter> {
    if (!highlighterPromise) {
        highlighterPromise = (async () => {
            const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, theme] = await Promise.all([
                import('shiki/core'),
                import('shiki/engine/javascript'),
                import('shiki/themes/dark-plus.mjs'),
            ]);
            return createHighlighterCore({
                themes: [theme.default as never],
                langs: [],
                engine: createJavaScriptRegexEngine(),
            });
        })().catch((error) => {
            // Allow a later attempt to retry instead of caching a rejected promise.
            highlighterPromise = null;
            throw error;
        });
    }
    return highlighterPromise;
}

/**
 * Highlights `code` into per-line token arrays.
 *
 * Resolves to plain unhighlighted lines if anything goes wrong, because a
 * missing colour is far better than a blank or crashed code panel.
 */
export async function highlightToTokenLines(
    code: string,
    language: CodeLanguage,
): Promise<HighlightedLine[]> {
    const plain: HighlightedLine[] = code.split('\n').map((line) => [{ content: line }]);

    try {
        const highlighter = await getHighlighter();

        if (!loadedLanguages.has(language)) {
            const grammar = await LANGUAGE_LOADERS[language]();
            await highlighter.loadLanguage(grammar.default as LanguageInput);
            loadedLanguages.add(language);
        }

        return highlighter
            .codeToTokensBase(code, { lang: language, theme: THEME })
            .map((line) =>
                line.map((token) => ({
                    content: token.content,
                    color: token.color,
                    // shiki exposes FontStyle as a string enum; widen it for the DOM.
                    fontStyle: token.fontStyle == null ? undefined : String(token.fontStyle),
                })),
            );
    } catch {
        return plain;
    }
}

/** Splits a file name into its extension, ignoring query strings and dots. */
export function getFileExtension(fileName: string): string {
    const match = /\.([a-z0-9]+)$/i.exec(fileName.split('?')[0]);
    return match ? match[1].toLowerCase() : '';
}

/** Maps a file name to a grammar shiki can colour, if we have one. */
export function languageForFile(fileName: string): CodeLanguage | null {
    switch (getFileExtension(fileName)) {
        case 'tsx':
            return 'tsx';
        case 'ts':
        case 'mts':
        case 'cts':
            return 'ts';
        case 'jsx':
            return 'jsx';
        case 'js':
        case 'mjs':
        case 'cjs':
            return 'js';
        case 'css':
            return 'css';
        case 'json':
            return 'json';
        case 'html':
        case 'htm':
            return 'html';
        case 'svg':
        case 'xml':
            return 'xml';
        case 'md':
        case 'mdx':
            return 'markdown';
        default:
            return null;
    }
}

/** How each format is labelled and coloured in the tree and tab bar. */
export interface FileFormat {
    /** Short badge text, e.g. 'TSX'. */
    label: string;
    /** Tailwind text colour class for the badge. */
    badgeClass: string;
    /** Tailwind colour class for the file icon. */
    iconClass: string;
}

const FORMAT_BY_EXTENSION: Record<string, FileFormat> = {
    tsx: { label: 'TSX', badgeClass: 'text-sky-300 bg-sky-400/10', iconClass: 'text-sky-400' },
    ts: { label: 'TS', badgeClass: 'text-sky-300 bg-sky-400/10', iconClass: 'text-sky-400' },
    mts: { label: 'TS', badgeClass: 'text-sky-300 bg-sky-400/10', iconClass: 'text-sky-400' },
    jsx: { label: 'JSX', badgeClass: 'text-sky-300 bg-sky-400/10', iconClass: 'text-sky-400' },
    js: { label: 'JS', badgeClass: 'text-yellow-300 bg-yellow-400/10', iconClass: 'text-yellow-400' },
    mjs: { label: 'JS', badgeClass: 'text-yellow-300 bg-yellow-400/10', iconClass: 'text-yellow-400' },
    css: { label: 'CSS', badgeClass: 'text-amber-300 bg-amber-400/10', iconClass: 'text-amber-400' },
    json: { label: 'JSON', badgeClass: 'text-yellow-300 bg-yellow-400/10', iconClass: 'text-yellow-400' },
    html: { label: 'HTML', badgeClass: 'text-orange-300 bg-orange-400/10', iconClass: 'text-orange-400' },
    svg: { label: 'SVG', badgeClass: 'text-orange-300 bg-orange-400/10', iconClass: 'text-orange-400' },
    xml: { label: 'XML', badgeClass: 'text-orange-300 bg-orange-400/10', iconClass: 'text-orange-400' },
    md: { label: 'MD', badgeClass: 'text-slate-300 bg-slate-400/10', iconClass: 'text-slate-400' },
    png: { label: 'PNG', badgeClass: 'text-emerald-300 bg-emerald-400/10', iconClass: 'text-emerald-400' },
    jpg: { label: 'JPG', badgeClass: 'text-emerald-300 bg-emerald-400/10', iconClass: 'text-emerald-400' },
    jpeg: { label: 'JPG', badgeClass: 'text-emerald-300 bg-emerald-400/10', iconClass: 'text-emerald-400' },
    webp: { label: 'WEBP', badgeClass: 'text-emerald-300 bg-emerald-400/10', iconClass: 'text-emerald-400' },
    mp4: { label: 'MP4', badgeClass: 'text-emerald-300 bg-emerald-400/10', iconClass: 'text-emerald-400' },
    webm: { label: 'WEBM', badgeClass: 'text-emerald-300 bg-emerald-400/10', iconClass: 'text-emerald-400' },
};

const UNKNOWN_FORMAT: FileFormat = {
    label: 'FILE',
    badgeClass: 'text-neutral-300 bg-white/[0.06]',
    iconClass: 'text-neutral-400',
};

/** Badge + icon styling for a file name, e.g. `MenuIcon.svg` -> SVG / orange. */
export function getFileFormat(fileName: string): FileFormat {
    return FORMAT_BY_EXTENSION[getFileExtension(fileName)] ?? UNKNOWN_FORMAT;
}

/** True for formats that render as an image rather than as text. */
export function isImageFile(fileName: string): boolean {
    return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'mp4', 'webm'].includes(
        getFileExtension(fileName),
    );
}
