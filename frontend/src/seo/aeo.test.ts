import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { componentAeo, looksLikeTestimonial, renderAeoHtml } from './aeo';
import type { ComponentAeoInput } from './aeo';
import AeoContent from '../components/AeoContent';

/** Strips markup so the two renderers can be compared on visible text alone. */
function visibleText(html: string): string {
    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

const richInput: ComponentAeoInput = {
    id: 'black-hole-3d',
    title: 'Black Hole',
    category: 'interactive-background',
    isPremium: false,
    code: "import { BlackHole } from './BlackHole';\n<BlackHole particleCount={1000} />",
    vibePrompt: '',
    vibeDescription: 'A 3D black hole accretion disk with Z-depth sorted particles.',
    behavior: 'Particles orbit a disk plane, sorted by Z-depth for authentic occlusion.',
    requirements: ['HTML5 Canvas 2D', 'requestAnimationFrame'],
    libraries: ['react', 'framer-motion'],
    cssProperties: ['canvas', 'z-depth-sorting', 'perspective-projection'],
    states: { from: 'static accretion disk', to: 'orbiting particles with trail' },
    props: [
        { name: 'particleCount', type: 'number', default: '"1000"', description: 'Number of particles in the accretion disk.' },
        { name: 'colors', type: 'string[]', default: '["#ffffff"]', description: 'Array of particle colors.' },
    ],
};

const thinInput: ComponentAeoInput = {
    id: 'mesh-text-hover',
    title: 'Mesh Text Hover',
    category: 'text',
    isPremium: false,
    code: '',
    vibePrompt: '',
};

describe('componentAeo', () => {
    it('answers the component question directly from authored metadata', () => {
        const aeo = componentAeo(richInput);
        const quickAnswer = aeo.blocks.find((block) => block.kind === 'quickAnswer');
        expect(quickAnswer?.kind).toBe('quickAnswer');
        if (quickAnswer?.kind !== 'quickAnswer') throw new Error('unreachable');
        expect(quickAnswer.heading).toBe('What is Black Hole?');
        expect(quickAnswer.text).toContain('accretion disk');
    });

    it('marks authored description plus behaviour as high confidence', () => {
        expect(componentAeo(richInput).confidence).toBe('high');
    });

    it('marks a component with no authored metadata as low confidence', () => {
        const aeo = componentAeo(thinInput);
        expect(aeo.confidence).toBe('low');
        expect(aeo.confidenceReason).toBeTruthy();
    });

    it('never omits a quick answer, even with no metadata at all', () => {
        const aeo = componentAeo({ ...thinInput, vibeDescription: '', behavior: '' });
        const quickAnswer = aeo.blocks.find((block) => block.kind === 'quickAnswer');
        if (quickAnswer?.kind !== 'quickAnswer') throw new Error('expected a quick answer');
        expect(quickAnswer.text.length).toBeGreaterThan(40);
    });

    it('emits at least three questions for a component with no metadata', () => {
        expect(componentAeo(thinInput).faq.length).toBeGreaterThanOrEqual(3);
    });

    it('only offers a how-to when a usage example exists', () => {
        const withCode = componentAeo(richInput).blocks.some(
            (block) => block.kind === 'list' && /^How to use/.test(block.heading),
        );
        const withoutCode = componentAeo(thinInput).blocks.some(
            (block) => block.kind === 'list' && /^How to use/.test(block.heading),
        );
        expect(withCode).toBe(true);
        expect(withoutCode).toBe(false);
    });

    it('never repeats a question or an answer inside one component', () => {
        const { faq } = componentAeo(richInput);
        expect(new Set(faq.map((item) => item.question)).size).toBe(faq.length);
        expect(new Set(faq.map((item) => item.answer)).size).toBe(faq.length);
    });

    it('uses the correct article for the category', () => {
        const aeo = componentAeo({ ...thinInput, vibeDescription: '', behavior: '' });
        const quickAnswer = aeo.blocks.find((block) => block.kind === 'quickAnswer');
        if (quickAnswer?.kind !== 'quickAnswer') throw new Error('expected a quick answer');
        expect(quickAnswer.text).toContain('is an animated text effect');
    });

    it('reports TypeScript only when the prop types prove it', () => {
        const technical = componentAeo(richInput).blocks.find((block) => block.kind === 'table');
        if (technical?.kind !== 'table') throw new Error('expected a technical table');
        expect(technical.rows.find((row) => row.label === 'Language')?.value).toBe('TypeScript');

        const unproven = componentAeo({
            ...thinInput,
            vibeDescription: 'A plain background.',
            behavior: 'It animates.',
            props: [{ name: 'color', type: 'string', default: '"#fff"', description: 'Colour.' }],
        }).blocks.find((block) => block.kind === 'table');
        if (unproven?.kind !== 'table') throw new Error('expected a technical table');
        expect(unproven.rows.find((row) => row.label === 'Language')).toBeUndefined();
    });

    it('rejects testimonial copy as a description', () => {
        expect(looksLikeTestimonial('accelerated our landing page rebuild by 300%')).toBe(true);
        expect(looksLikeTestimonial("gave our agency's portfolio awards recognition")).toBe(true);
        expect(looksLikeTestimonial('A 3D testimonial slider with cross-faded quotes')).toBe(false);
        expect(looksLikeTestimonial('Dots fade to 30% opacity as they orbit.')).toBe(false);
        expect(looksLikeTestimonial('A particle loader rendered on an HTML canvas.')).toBe(false);
    });

    it('leaves no markdown or backticks in the rendered answers', () => {
        const aeo = componentAeo({
            ...thinInput,
            vibeDescription: 'A **bold** footer with `sticky` positioning.',
            behavior: 'Renders **sharp and crisp** against the dark background.',
        });
        const html = renderAeoHtml(aeo);
        expect(html).not.toContain('**');
        expect(html).not.toContain('`');
    });

    it('escapes markup that appears in source copy', () => {
        const aeo = componentAeo({
            ...thinInput,
            vibeDescription: 'Renders <script>alert(1)</script> in the label.',
            behavior: 'Uses & and <b> tags in text.',
        });
        const html = renderAeoHtml(aeo);
        expect(html).not.toContain('<script>');
        expect(html).toContain('&lt;script&gt;');
    });
});

describe('AEO renderer parity', () => {
    // The crawler reads the prerendered HTML while the visitor reads the React
    // tree. If these disagree, the page an answer engine quotes is not the page
    // a human sees, so every word of visible text must be identical.
    for (const [name, input] of [
        ['rich', richInput],
        ['thin', thinInput],
    ] as const) {
        it(`renders identical visible text for the ${name} component`, () => {
            const aeo = componentAeo(input);
            const fromHtml = visibleText(renderAeoHtml(aeo));
            const fromReact = visibleText(renderToStaticMarkup(createElement(AeoContent, { aeo })));
            expect(fromReact).toBe(fromHtml);
            expect(fromReact.length).toBeGreaterThan(200);
        });

        it(`keeps every question and answer in the rendered markup for the ${name} component`, () => {
            const aeo = componentAeo(input);
            const html = renderToStaticMarkup(createElement(AeoContent, { aeo }));
            for (const item of aeo.faq) {
                expect(html).toContain(item.question.replace(/&/g, '&amp;'));
            }
            // Answers must be present without any interaction, so no hiding.
            expect(html).not.toMatch(/display:\s*none/i);
            expect(html).not.toMatch(/visibility:\s*hidden/i);
            expect(html).not.toMatch(/font-size:\s*0/i);
        });
    }

    it('renders only the lead blocks when asked for the lead', () => {
        const aeo = componentAeo(richInput);
        const lead = visibleText(renderToStaticMarkup(createElement(AeoContent, { aeo, part: 'lead' })));
        const detail = visibleText(
            renderToStaticMarkup(createElement(AeoContent, { aeo, part: 'detail' })),
        );
        expect(lead).toContain('What is Black Hole?');
        expect(lead).toContain('Black Hole at a glance');
        expect(lead).not.toContain('Technical information');
        expect(detail).toContain('Technical information');
        expect(detail).toContain('Black Hole questions');
        expect(detail).not.toContain('at a glance');
    });

    it('splits into lead and detail without losing any content', () => {
        const aeo = componentAeo(richInput);
        const whole = visibleText(renderToStaticMarkup(createElement(AeoContent, { aeo })));
        const lead = visibleText(renderToStaticMarkup(createElement(AeoContent, { aeo, part: 'lead' })));
        const detail = visibleText(
            renderToStaticMarkup(createElement(AeoContent, { aeo, part: 'detail' })),
        );
        expect(`${lead} ${detail}`.replace(/\s+/g, ' ').trim()).toBe(whole);
    });
});