export interface CategorySeo {
    slug: string;
    label: string;
    singular: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    intro: string;
    minItemsForIndex: number;
}

export const CATEGORY_SEO: CategorySeo[] = [
    {
        slug: 'interactive-background',
        label: 'Interactive Backgrounds',
        singular: 'Interactive Background',
        primaryKeyword: 'interactive background for website',
        secondaryKeywords: [
            'interactive website background',
            'interactive background code',
            'mouse interactive background react',
            'particle background for website',
            'interactive web background',
        ],
        intro:
            'Interactive backgrounds react to cursor movement, scroll and pointer position, so the page feels alive instead of static. Every background here is built as a real React component with configurable props, so you can tune colours, density and speed rather than shipping a black box. Preview one in the browser, read the props, then copy the code straight into your project.',
        minItemsForIndex: 3,
    },
    {
        slug: '3d',
        label: '3D Effects',
        singular: '3D Effect',
        primaryKeyword: '3d background for website',
        secondaryKeywords: [
            '3d website background',
            'webgl background react',
            'three.js background website',
            '3d animation effects',
            'animated 3d backgrounds for your website',
        ],
        intro:
            'WebGL and Three.js effects that render real 3D in the browser: particle fields, shader backdrops, physics scenes and 3D transitions. These are the heaviest components in the library, so each one lists its rendering approach and requirements before you copy it. Use them as hero backdrops, section backgrounds or cursor-reactive 3D accents.',
        minItemsForIndex: 3,
    },
    {
        slug: 'cursor',
        label: 'Cursor Effects',
        singular: 'Cursor Effect',
        primaryKeyword: 'custom cursor react',
        secondaryKeywords: [
            'cursor effect for website',
            'custom cursor css',
            'magnetic cursor react',
            'cursor trail effect',
            'interactive cursor component',
        ],
        intro:
            'Custom cursor components that replace the system pointer with something branded: magnetic attraction, trail effects, target reticles, blend modes and blob followers. Each one is pointer-aware and responsive, and exposes props for colour, smoothing and activation zones. Best used on portfolio and agency sites where the cursor becomes part of the identity.',
        minItemsForIndex: 3,
    },
    {
        slug: 'background',
        label: 'Website Backgrounds',
        singular: 'Website Background',
        primaryKeyword: 'website background design',
        secondaryKeywords: [
            'animated background for website',
            'css background effects',
            'web background animation',
            'background for landing page',
            'canvas background effects',
        ],
        intro:
            'Full-bleed background treatments for landing pages and sections: gradient meshes, canvas particle systems, grid and beam patterns, noise and scanline textures. Unlike static images, these scale to any viewport and stay sharp on retina displays. Each background is a self-contained component with documented props for palette, density and animation speed.',
        minItemsForIndex: 3,
    },
    {
        slug: 'text',
        label: 'Animated Text',
        singular: 'Animated Text Effect',
        primaryKeyword: 'animated text react',
        secondaryKeywords: [
            'text animation effects css',
            'text reveal animation',
            'kinetic typography react',
            'text scramble effect',
            'gradient text animation',
        ],
        intro:
            'Typography effects that animate letterforms rather than fading a whole block: scramble reveals, rolling letters, random swaps, gradient fills, vaporising text and scroll-linked highlights. Every effect is scoped to a single text element, so you can apply it to a headline without restructuring the surrounding markup. Built for hero headings and section titles.',
        minItemsForIndex: 3,
    },
    {
        slug: 'effect',
        label: 'UI Effects',
        singular: 'UI Effect',
        primaryKeyword: 'ui animation effects',
        secondaryKeywords: [
            'hover effects react',
            'ui component animation',
            'framer motion effects',
            'scroll reveal animation',
            'micro interaction react',
        ],
        intro:
            'Micro-interactions and hover effects that make an interface feel considered rather than static: beam and spotlight reveals, card cascades, marquees, option wheels and kinetic grids. Most are powered by Framer Motion and accept children plus timing props, so the same effect can wrap any layout. Ideal for feature grids, pricing tables and link lists.',
        minItemsForIndex: 3,
    },
    {
        slug: 'button',
        label: 'Buttons',
        singular: 'Button',
        primaryKeyword: 'animated button react',
        secondaryKeywords: [
            'magnetic button css',
            'button hover effect',
            'glowing button react',
            'button animation tailwind',
            'call to action button component',
        ],
        intro:
            'Call-to-action buttons with real interaction design: magnetic pull on hover, glow and shimmer sweeps, press states and SVG-based shape morphs. Each button accepts its own label, href and colour props, so it drops into an existing layout without forcing a wrapper. Accessible focus states are preserved in every variant.',
        minItemsForIndex: 3,
    },
    {
        slug: 'navbar',
        label: 'Navigation Bars',
        singular: 'Navbar',
        primaryKeyword: 'animated navbar react',
        secondaryKeywords: [
            'navbar component tailwind',
            'glass navbar react',
            'navigation bar ui',
            'sticky header component',
            'responsive navbar design',
        ],
        intro:
            'Navigation bars built as drop-in React components: glass and blur treatments, scroll-aware shrink behaviour, magnetic links and mobile drawer patterns. Each one ships with a documented link array and breakpoint behaviour, so the responsive behaviour is explicit instead of incidental. Copy it in, then restyle with Tailwind classes.',
        minItemsForIndex: 3,
    },
    {
        slug: 'footer',
        label: 'Footers',
        singular: 'Footer',
        primaryKeyword: 'footer design free code',
        secondaryKeywords: [
            'footer design for website',
            'website footer ideas',
            'footer component react',
            'responsive footer tailwind',
            'animated footer design',
        ],
        intro:
            'Website footers with real layout and motion: oversized wordmarks, magnetic social rows, animated status indicators and multi-column link structures. Each footer is built from a documented column model, which makes it straightforward to add or remove sections. Useful as the closing block on a landing page or as a full-page footer study.',
        minItemsForIndex: 3,
    },
    {
        slug: 'scroll',
        label: 'Scroll Animations',
        singular: 'Scroll Animation',
        primaryKeyword: 'scroll animation react',
        secondaryKeywords: [
            'scroll driven animation',
            'parallax effect website',
            'scroll reveal component',
            'framer motion scroll',
            'sticky scroll effect',
        ],
        intro:
            'Scroll-linked animation components: parallax layers, pinned and sticky sections, scroll-triggered reveals, expanding scroll panels and 3D scroll transitions. Each one documents whether it uses native scroll timelines or a motion library, which matters for performance on long pages. Load them per section rather than across a whole route.',
        minItemsForIndex: 3,
    },
    {
        slug: 'image-interaction',
        label: 'Image Interactions',
        singular: 'Image Interaction',
        primaryKeyword: 'image hover effect react',
        secondaryKeywords: [
            'image trail effect',
            '3d card tilt effect',
            'image distortion effect',
            'interactive image component',
            'cursor image effect',
        ],
        intro:
            'Image components that respond to the pointer: 3D tilt cards, cursor-following image trails, distortion and ripple transitions, draggable collages and hover-reveal stacks. These are built to sit inside real content grids, so they accept standard image props and keep alt text intact. Each one lists its transform maths in the props table.',
        minItemsForIndex: 3,
    },
    {
        slug: 'loader',
        label: 'Loaders',
        singular: 'Loader',
        primaryKeyword: 'loading animation react',
        secondaryKeywords: [
            'page loader component',
            'loading screen css',
            'preloader animation',
            'spinner ui component',
            'route loading animation',
        ],
        intro:
            'Loading and preloader animations for route transitions and first paint: progress reveals, logo and wordmark loaders, geometric spinners and percentage counters. Each loader exposes timing and label props so it can represent real progress rather than decorative motion. Remember to respect reduced-motion preferences when wiring these in.',
        minItemsForIndex: 3,
    },
    {
        slug: 'form',
        label: 'Forms',
        singular: 'Form',
        primaryKeyword: 'react form ui',
        secondaryKeywords: [
            'animated input field',
            'form component tailwind',
            'signup form design',
            'input focus effects',
            'form validation ui',
        ],
        intro:
            'Form interface components with considered interaction design: animated focus states, floating labels, input borders that respond to focus and validation, and submit button transitions. These are presentation components, so wire them to your own state and validation logic rather than expecting form behaviour out of the box.',
        minItemsForIndex: 3,
    },
    {
        slug: 'custom',
        label: 'Community Components',
        singular: 'Community Component',
        primaryKeyword: 'community ui components',
        secondaryKeywords: [
            'user submitted react components',
            'free ui components',
            'community component library',
            'open source react ui',
        ],
        intro:
            'Components submitted by the community through the UI Hub contribution flow. Titles, descriptions and technology details come from what the contributor supplied, so treat the metadata as community-provided rather than curated. If a component is broken or mislabelled, open it in the library and use the report control.',
        minItemsForIndex: 3,
    },
    {
        slug: 'particles-background',
        label: 'Particle Backgrounds',
        singular: 'Particle Background',
        primaryKeyword: 'particle background for website',
        secondaryKeywords: [
            'particle background react',
            'particle sphere background',
            'three.js particle background',
            'animated particle webgl',
            'particle effects for website',
        ],
        intro:
            'Particle backgrounds render tens of thousands of points on the GPU: spheres, halos, fields and constellations that drift, glow and react to the pointer. They are the heaviest components in the library, so each one lists its rendering approach and requirements before you copy it. Use them as hero backdrops, section backgrounds or full-page intros where a static gradient would fall flat.',
        minItemsForIndex: 3,
    },
];

export const CATEGORY_BY_SLUG: Record<string, CategorySeo> = Object.fromEntries(
    CATEGORY_SEO.map((category) => [category.slug, category]),
);

export function categorySeo(slug: string): CategorySeo | undefined {
    return CATEGORY_BY_SLUG[slug];
}

export function categoryLabel(slug: string): string {
    return CATEGORY_BY_SLUG[slug]?.label ?? slug;
}

export function categorySingular(slug: string): string {
    return CATEGORY_BY_SLUG[slug]?.singular ?? slug;
}