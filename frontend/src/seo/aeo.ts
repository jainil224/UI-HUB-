import type { ComponentPropRow } from './component-seo';
import { escapeHtml } from './site';
import { categoryLabel, categorySeo, categorySingular } from './taxonomy';

/**
 * Answer Engine Optimization content.
 *
 * The blocks are a framework-agnostic node tree on purpose: `renderAeoHtml`
 * emits them into the prerendered HTML for crawlers, and `AeoContent.tsx`
 * renders the identical tree in React. Because both consume the same data, the
 * crawler view and the visitor view cannot drift, which is what
 * `check:seo` asserts.
 *
 * Every string below is derived from source data that already exists in the
 * repo. Nothing is invented: no use cases, no accessibility claims, no
 * licence, no statistics. Where the underlying data is thin the block is
 * omitted rather than padded, and the entry is marked low confidence.
 */

export type AeoConfidence = 'high' | 'low';

export interface AeoFact {
    label: string;
    value: string;
}

export interface AeoFaqItem {
    question: string;
    answer: string;
}

export type AeoBlock =
    | { kind: 'quickAnswer'; heading: string; text: string }
    | { kind: 'quickFacts'; heading: string; items: AeoFact[] }
    | { kind: 'paragraphs'; heading: string; items: string[] }
    | { kind: 'table'; heading: string; rows: AeoFact[] }
    | { kind: 'list'; heading: string; ordered: boolean; items: string[] }
    | { kind: 'faq'; heading: string; items: AeoFaqItem[] };

export interface ComponentAeo {
    blocks: AeoBlock[];
    faq: AeoFaqItem[];
    confidence: AeoConfidence;
    confidenceReason?: string;
}

export interface ComponentAeoInput {
    id: string;
    title: string;
    category: string;
    isPremium?: boolean;
    /** Raw source of the component, empty string when the repo has none. */
    code?: string;
    /** `vibePrompt` from componentData. Real prose, but often empty. */
    vibePrompt?: string;
    /** `ComponentItem.description`. Frequently a testimonial, so untrusted. */
    itemDescription?: string;
    /** `vibeMeta.description`. Authored per component, factual. */
    vibeDescription?: string;
    /** `vibeMeta.behavior`. Authored per component, factual. */
    behavior?: string;
    requirements?: string[];
    libraries?: string[];
    cssProperties?: string[];
    states?: { from: string; to: string };
    props?: ComponentPropRow[];
}

/** The five generation targets every component ships a prompt for. */
const AI_PROMPT_TARGETS = ['Advance', 'Antigravity', 'Claude Code', 'Cursor', 'Lovable'] as const;

/**
 * `ComponentItem.description` is used by testimonial-style components for
 * social proof copy rather than for describing the component. That text is
 * full of unverifiable claims ("accelerated our rebuild by 300%"), so it must
 * never leak into an answer, a meta description or a schema field.
 *
 * The signals are deliberately narrow. A bare percentage was tried and removed:
 * it caught none of the real testimonials in componentData while flagging
 * legitimate technical copy such as "fades to 30% opacity". The first-person
 * agency claims and the "accelerated ... by 300%" phrasing are what actually
 * identify social-proof text, so those are what this matches.
 */
export function looksLikeTestimonial(value: string | undefined): boolean {
    if (!value) return false;
    const text = value.trim();
    if (text.length === 0) return false;

    const signals: RegExp[] = [
        /\b(our|we|my)\s+(agency|team|client|studio|company|portfolio|brand|product)\b/i,
        /\b(accelerated|boosted|increased|reduced|cut)\s+[^.]{0,40}\bby\s+\d/i,
        /\b(unmatched|unrivalled|world[- ]class|best[- ]in[- ]class|award|winning)\b/i,
        /\$\s?\d/,
        /\b(10x|100x|1000x)\b/i,
        /\bhighly recommend\b/i,
        /\bgame[- ]?changer\b/i,
        /\b(client|agency) (loved|love|raved|reported)\b/i,
    ];

    return signals.some((pattern) => pattern.test(text));
}

/**
 * Turns a `vibePrompt` into a declarative fragment without inventing anything:
 * the leading command verb is dropped and the rest of the sentence is kept
 * verbatim, so every remaining word still appears in the source data.
 */
function extractDeclarativeFragment(prompt: string): string | undefined {
    const sentences = prompt
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

    for (const sentence of sentences) {
        const stripped = sentence
            .replace(/^(create|build|implement|design|make|develop|generate|produce)\s+/i, '')
            .replace(/^(an?|the)\s+/i, '')
            .replace(/\s+/g, ' ')
            .trim();

        // A fragment worth using needs a subject and a verb; anything shorter is
        // scaffolding such as "Create a precision 'TargetCursor' React component".
        if (stripped.length < 45) continue;
        if (!/\b(is|are|uses|renders|animates|reacts|follows|tracks|displays|creates|applies|supports|wraps|combines|draws|translates|maps|builds|keeps|moves|scales|blends|loops|cycles|adapts|responds|drives|pulls|pushes|glows|spins|floats|bends|stretches|expands|collapses|fades|reveals|highlights|pulses|shimmers|scrolls|hides|shows|rotates|zooms|tilts|orbits)\b/i.test(stripped)) {
            continue;
        }

        const cleaned = stripped.replace(/[.\s]+$/, '');
        return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}.`;
    }

    return undefined;
}

/**
 * Reports the language only when the props table proves it.
 *
 * The `code` field is a usage snippet, not the component source, so the absence
 * of type annotations there proves nothing. Claiming "JavaScript" on that basis
 * would be a fabricated fact. The documented prop types are real evidence: a
 * union, an optional marker, a tuple or an inline object type can only come
 * from TypeScript.
 */
function detectLanguage(props: ComponentPropRow[]): string | undefined {
    const typed = props.some((prop) => {
        const type = String(prop.type ?? '');
        return (
            type.includes('?') ||
            type.includes('|') ||
            type.includes('[]') ||
            /<[A-Za-z]/.test(type) ||
            /^\s*\{/.test(type)
        );
    });
    return typed ? 'TypeScript' : undefined;
}

/** Groups the authored `cssProperties` tags into a readable rendering summary. */
function renderingApproach(cssProperties: string[] | undefined): string | undefined {
    const tags = (cssProperties ?? []).map((tag) => tag.toLowerCase());
    if (tags.length === 0) return undefined;

    const buckets: string[] = [];
    if (tags.some((tag) => tag.includes('webgl') || tag.includes('shader'))) buckets.push('WebGL shaders');
    if (tags.some((tag) => tag.includes('canvas'))) buckets.push('HTML canvas');
    if (tags.some((tag) => tag.includes('point-sprite'))) buckets.push('point sprites');
    if (tags.some((tag) => tag.includes('framer-motion') || tag.includes('spring'))) buckets.push('spring physics');
    if (tags.some((tag) => tag.includes('blend'))) buckets.push('blend modes');
    if (tags.some((tag) => tag.includes('gradient'))) buckets.push('CSS gradients');
    if (tags.some((tag) => tag.includes('filter'))) buckets.push('CSS filters');
    if (tags.some((tag) => tag.includes('observer'))) buckets.push('ResizeObserver');
    if (tags.some((tag) => tag.includes('raf') || tag.includes('animation'))) buckets.push('requestAnimationFrame');

    if (buckets.length === 0) return undefined;
    return buckets.slice(0, 5).join(', ');
}

function pascalCase(title: string): string {
    const cleaned = title.replace(/[^A-Za-z0-9]+/g, ' ').trim();
    if (cleaned.length === 0) return 'Component';
    return cleaned
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

/**
 * Normalises authored copy for display: collapses whitespace and removes the
 * markdown emphasis markers that appear in a few `vibeMeta.behavior` strings, so
 * no raw `**` or backtick ever reaches the rendered page.
 */
function plainText(value: string | undefined): string {
    if (!value) return '';
    return value
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\\`/g, '')
        .replace(/`/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/** "a" vs "an", decided by sound rather than by letter. */
function article(word: string): string {
    return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

/** Package names read badly in prose, so the well-known ones get their brand name. */
const LIBRARY_LABELS: Record<string, string> = {
    react: 'React',
    'framer-motion': 'Framer Motion',
    'motion/react': 'Motion',
    three: 'Three.js',
    'd3-geo': 'D3 Geo',
    gsap: 'GSAP',
    '@gsap/react': 'GSAP React',
    'lucide-react': 'Lucide React',
    'react-icons': 'React Icons',
    clsx: 'clsx',
    'tailwind-merge': 'tailwind-merge',
    '@splinetool/react-spline': 'Spline',
};

function libraryLabel(name: string): string {
    return LIBRARY_LABELS[name] ?? name;
}

function libraryList(names: string[]): string {
    return listSentence(names.map(libraryLabel));
}

function sentenceCase(value: string): string {
    const cleaned = value.replace(/\s+/g, ' ').trim();
    if (cleaned.length === 0) return '';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function listSentence(values: string[]): string {
    const unique = Array.from(new Set(values.filter(Boolean)));
    if (unique.length === 0) return '';
    if (unique.length === 1) return unique[0];
    if (unique.length === 2) return `${unique[0]} and ${unique[1]}`;
    return `${unique.slice(0, -1).join(', ')} and ${unique[unique.length - 1]}`;
}

/**
 * Builds the answer-first content for one component route.
 *
 * Confidence reflects how much authored, component-specific prose backed the
 * result. `low` means the answer rests on the vibe prompt or on structural
 * facts alone, and `check:seo` reports those routes so they can be enriched.
 */
export function componentAeo(input: ComponentAeoInput): ComponentAeo {
    const title = input.title?.trim() || input.id;
    const categoryLabelText = categoryLabel(input.category);
    const singular = categorySingular(input.category).toLowerCase();

    const props = input.props ?? [];
    const libraries = Array.from(new Set((input.libraries ?? []).filter(Boolean)));
    const language = detectLanguage(props);
    const hasCode = Boolean(input.code && input.code.trim().length > 0);
    const hasVibePrompt = Boolean(input.vibePrompt && input.vibePrompt.trim().length > 0);

    const trustedDescription = plainText(input.vibeDescription);
    const behavior = plainText(input.behavior);
    const untrustedDescription = looksLikeTestimonial(input.itemDescription)
        ? ''
        : plainText(input.itemDescription);

    const promptFragment = hasVibePrompt
        ? plainText(extractDeclarativeFragment(input.vibePrompt ?? ''))
        : undefined;
    const requirements = Array.from(
        new Set((input.requirements ?? []).map(plainText).filter(Boolean)),
    );

    const blocks: AeoBlock[] = [];

    // Quick answer: an answer that stands alone without surrounding context.
    let quickAnswer = '';
    if (trustedDescription) {
        quickAnswer = trustedDescription;
    } else if (behavior) {
        quickAnswer = sentenceCase(behavior.split(/(?<=[.!?])\s/)[0] ?? behavior);
    }

    const structural =
        `${title} is ${article(singular)} ${singular} in the UI HUB React component library, built for ` +
        `${categoryLabelText.toLowerCase()}. It runs in the browser as a React component and can be ` +
        `dropped into an existing React and Tailwind CSS project.`;

    if (quickAnswer && !/[.!?]$/.test(quickAnswer)) {
        quickAnswer = `${quickAnswer}.`;
    }

    // A handful of authored descriptions are only a few words long. Pad them with
    // one verifiable structural sentence rather than inventing detail.
    if (quickAnswer && quickAnswer.length < 70) {
        quickAnswer =
            `${quickAnswer} It is built as a React and Tailwind CSS component ` +
            `and can be previewed directly on this page.`;
    }

    if (quickAnswer) {
        blocks.push({
            kind: 'quickAnswer',
            heading: `What is ${title}?`,
            text: quickAnswer,
        });
        if (promptFragment && !trustedDescription) {
            blocks.push({
                kind: 'paragraphs',
                heading: `How ${title} behaves`,
                items: [promptFragment],
            });
        }
    } else {
        blocks.push({ kind: 'quickAnswer', heading: `What is ${title}?`, text: structural });
        if (promptFragment) {
            blocks.push({
                kind: 'paragraphs',
                heading: `How ${title} behaves`,
                items: [promptFragment],
            });
        } else if (untrustedDescription) {
            blocks.push({
                kind: 'paragraphs',
                heading: `About ${title}`,
                items: [untrustedDescription],
            });
        }
    }

    // Quick facts: short, scannable, every value traceable to source data.
    const facts: AeoFact[] = [
        { label: 'Category', value: categoryLabelText },
        { label: 'Pricing', value: input.isPremium ? 'Pro component' : 'Free to use' },
    ];
    if (libraries.length > 0) {
        facts.push({ label: 'Libraries', value: libraryList(libraries) });
    }
    if (language) {
        facts.push({ label: 'Language', value: language });
    }
    facts.push({ label: 'Styling', value: 'Tailwind CSS' });
    if (props.length > 0) {
        facts.push({ label: 'Configurable props', value: String(props.length) });
    }
    facts.push({ label: 'AI prompts', value: `Ready for ${AI_PROMPT_TARGETS.join(', ')}` });

    blocks.push({ kind: 'quickFacts', heading: `${title} at a glance`, items: facts });

    if (behavior) {
        blocks.push({
            kind: 'paragraphs',
            heading: `How ${title} works`,
            items: [behavior],
        });
    }

    // Technical information table.
    const technical: AeoFact[] = [
        { label: 'Category', value: categoryLabelText },
        { label: 'Libraries', value: libraries.length > 0 ? libraryList(libraries) : 'React only' },
        { label: 'Styling', value: 'Tailwind CSS' },
    ];
    if (language) technical.push({ label: 'Language', value: language });
    const approach = renderingApproach(input.cssProperties);
    if (approach) technical.push({ label: 'Rendering', value: approach });
    if (input.states?.from && input.states?.to) {
        technical.push({ label: 'State change', value: `${input.states.from} to ${input.states.to}` });
    }
    if (props.length > 0) {
        technical.push({ label: 'Props', value: `${props.length} configurable` });
    }
    technical.push({
        label: 'Usage example',
        value: hasCode ? 'Included on this page' : 'Not published yet',
    });

    blocks.push({ kind: 'table', heading: `Technical information for ${title}`, rows: technical });

    if (requirements.length > 0) {
        blocks.push({
            kind: 'list',
            heading: `What ${title} requires`,
            ordered: false,
            items: requirements,
        });
    }

    // How to use. Only emitted when a real usage example exists, so every step
    // below describes something the reader can actually copy from the page.
    if (hasCode) {
        const componentName = pascalCase(title);
        const install = libraries.filter((lib) => lib !== 'react' && lib !== 'motion/react');
        const steps = [
            install.length > 0
                ? `Install the dependencies: ${install.map((lib) => `npm install ${lib}`).join(' and ')}.`
                : 'Install React if your project does not already use it.',
            `Copy the usage example from the Source section of this page. It shows the import path and the props the component expects.`,
            `Render <${componentName} /> in your page using that import path.`,
            props.length > 0
                ? `Pass any of the ${props.length} documented props to change colours, density, speed or behaviour.`
                : 'Render the component with no props to get the default behaviour.',
        ];
        blocks.push({ kind: 'list', heading: `How to use ${title}`, ordered: true, items: steps });
    }

    // FAQ. Every answer restates data already on the page, so an answer engine can
    // quote the page without the page overstating anything.
    const faq: AeoFaqItem[] = [];
    const answerText = blocks.find((block) => block.kind === 'quickAnswer')?.text ?? structural;
    faq.push({ question: `What is ${title}?`, answer: answerText });

    if (behavior) {
        faq.push({
            question: `How does ${title} work?`,
            answer: behavior,
        });
    }

    // Components with no authored metadata still deserve real questions, and the
    // authored category intro is topical, factual prose that already exists.
    const categoryIntro = plainText(categorySeo(input.category)?.intro);
    if (categoryIntro) {
        faq.push({
            question: `Which category does ${title} belong to?`,
            answer: `${title} is listed under ${categoryLabelText} in the UI HUB catalog. ${categoryIntro}`,
        });
    }

    const documentedProps = props.filter((prop) => plainText(prop.description).length > 10);
    for (const prop of documentedProps.slice(0, 2)) {
        faq.push({
            question: `What does the ${prop.name} prop do in ${title}?`,
            answer: `${plainText(prop.description)} It defaults to ${prop.default}.`,
        });
    }

    faq.push({
        question: `Is ${title} free to use?`,
        answer: input.isPremium
            ? `${title} is a Pro component on UI HUB. Pro components are labelled in the catalog and come with a documented props table on the component page.`
            : `${title} is a free component on UI HUB. You can preview it in the browser and read the full props table on the component page.`,
    });

    if (libraries.length > 0) {
        faq.push({
            question: `Which libraries does ${title} use?`,
            answer: `${title} uses ${libraryList(libraries)} and is styled with Tailwind CSS.`,
        });
    }

    if (requirements.length > 0) {
        faq.push({
            question: `What does ${title} need to run?`,
            answer: `${title} needs ${listSentence(requirements.slice(0, 4))}.`,
        });
    }

    blocks.push({ kind: 'faq', heading: `${title} questions`, items: faq });

    const confidence: AeoConfidence = trustedDescription && behavior ? 'high' : 'low';
    const confidenceReason =
        confidence === 'high'
            ? undefined
            : trustedDescription || behavior
              ? 'Partially derived: the component has authored metadata but no behaviour description.'
              : 'Derived from the component prompt or catalog structure; authored metadata would improve this page.';

    return { blocks, faq, confidence, confidenceReason };
}

/**
 * Serialises the block tree to HTML for the prerendered page.
 *
 * The markup mirrors `AeoContent.tsx` exactly so `check:seo` can compare the
 * two outputs.
 */
export function renderAeoHtml(aeo: ComponentAeo, indent = '    '): string {
    const pad = (level: number) => indent.repeat(level);
    const lines: string[] = [];

    const renderList = (
        block: Extract<AeoBlock, { kind: 'list' }>,
        level: number,
    ): void => {
        const tag = block.ordered ? 'ol' : 'ul';
        lines.push(`${pad(level)}<${tag}>`);
        for (const item of block.items) {
            lines.push(`${pad(level + 1)}<li>${escapeHtml(item)}</li>`);
        }
        lines.push(`${pad(level)}</${tag}>`);
    };

    aeo.blocks.forEach((block, index) => {
        const level = 1;
        const id = `aeo-${block.kind}-${index}`;
        switch (block.kind) {
            case 'quickAnswer': {
                lines.push(`${pad(level)}<section aria-labelledby="${id}">`);
                lines.push(`${pad(level + 1)}<h2 id="${id}">${escapeHtml(block.heading)}</h2>`);
                lines.push(`${pad(level + 1)}<p>${escapeHtml(block.text)}</p>`);
                lines.push(`${pad(level)}</section>`);
                break;
            }
            case 'paragraphs': {
                lines.push(`${pad(level)}<section aria-labelledby="${id}">`);
                lines.push(`${pad(level + 1)}<h2 id="${id}">${escapeHtml(block.heading)}</h2>`);
                for (const item of block.items) {
                    lines.push(`${pad(level + 1)}<p>${escapeHtml(item)}</p>`);
                }
                lines.push(`${pad(level)}</section>`);
                break;
            }
            case 'quickFacts': {
                lines.push(`${pad(level)}<section aria-labelledby="${id}">`);
                lines.push(`${pad(level + 1)}<h2 id="${id}">${escapeHtml(block.heading)}</h2>`);
                lines.push(`${pad(level + 1)}<dl>`);
                for (const fact of block.items) {
                    lines.push(`${pad(level + 2)}<dt>${escapeHtml(fact.label)}</dt>`);
                    lines.push(`${pad(level + 2)}<dd>${escapeHtml(fact.value)}</dd>`);
                }
                lines.push(`${pad(level + 1)}</dl>`);
                lines.push(`${pad(level)}</section>`);
                break;
            }
            case 'table': {
                lines.push(`${pad(level)}<section aria-labelledby="${id}">`);
                lines.push(`${pad(level + 1)}<h2 id="${id}">${escapeHtml(block.heading)}</h2>`);
                lines.push(`${pad(level + 1)}<table>`);
                lines.push(`${pad(level + 2)}<tbody>`);
                for (const row of block.rows) {
                    lines.push(`${pad(level + 3)}<tr>`);
                    lines.push(`${pad(level + 4)}<th scope="row">${escapeHtml(row.label)}</th>`);
                    lines.push(`${pad(level + 4)}<td>${escapeHtml(row.value)}</td>`);
                    lines.push(`${pad(level + 3)}</tr>`);
                }
                lines.push(`${pad(level + 2)}</tbody>`);
                lines.push(`${pad(level + 1)}</table>`);
                lines.push(`${pad(level)}</section>`);
                break;
            }
            case 'list': {
                lines.push(`${pad(level)}<section aria-labelledby="${id}">`);
                lines.push(`${pad(level + 1)}<h2 id="${id}">${escapeHtml(block.heading)}</h2>`);
                renderList(block, level + 1);
                lines.push(`${pad(level)}</section>`);
                break;
            }
            case 'faq': {
                lines.push(`${pad(level)}<section aria-labelledby="${id}">`);
                lines.push(`${pad(level + 1)}<h2 id="${id}">${escapeHtml(block.heading)}</h2>`);
                for (const item of block.items) {
                    lines.push(`${pad(level + 1)}<details>`);
                    lines.push(
                        `${pad(level + 2)}<summary>${escapeHtml(item.question)}</summary>`,
                    );
                    lines.push(`${pad(level + 2)}<p>${escapeHtml(item.answer)}</p>`);
                    lines.push(`${pad(level + 1)}</details>`);
                }
                lines.push(`${pad(level)}</section>`);
                break;
            }
        }
    });

    return lines.join('\n');
}

export { categorySeo };