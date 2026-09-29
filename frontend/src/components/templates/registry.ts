import type React from 'react';
import type { TemplateItem } from '../../data/templatesData';

/**
 * UI Hub - Website Template Registry
 *
 * Single source of truth for the lazy preview chunks and the per-template
 * metadata that used to live inline in TemplateDetailPage. Kept separate so
 * that non-page components (notably the "Similar Templates" rail) can map a
 * template id to its chunk without importing the page itself.
 *
 * Every entry is a dynamic import, which is what keeps three.js and framer-motion
 * out of the initial /templates bundle. Adding a template here is the only step
 * needed to make it previewable and prefetchable.
 */

export const TEMPLATE_PREVIEWS: Record<string, () => Promise<{ default: React.ComponentType }>> = {
    '2586-labs': () => import('./Labs2586'),
    'mood-hero': () => import('./MoodHero'),
    'portfolio-closing': () => import('./PortfolioClosing'),
    'tars-protocol': () => import('./TarsHeroArena'),
    'split-fuzzy-orb': () => import('./SplitFuzzyOrbHero'),
    'segmint-2026': () => import('./SegmintFooter'),
    'haos-tech-solutions': () => import('./HaosShowcase'),
    'mentality': () => import('./MentalityHero'),
    'interior-design': () => import('./InteriorDesignShowcase'),
    'lumos': () => import('./LumosHero'),
    'loveapp-hero': () => import('./LoveAppHero'),
    'heyo-agency-cta': () => import('./HeyoAgencyCta'),
    'me-019-au-cabaret': () => import('./AuCabaretPoster'),
    'dont-be-greedy': () => import('./DontBeGreedyFooter'),
    'paipai-kuaishou': () => import('./PaipaiKuaishou'),
    'logo-here': () => import('./LogoHere'),
    'sui-overflow': () => import('./SuiOverflow'),
    'graphic-designer-portfolio': () => import('./GraphicDesignerPortfolio'),
    'originkit-hero-24': () => import('./OriginkitHero24'),
  'visionary-orb-hero': () => import('./VisionaryOrbHero'),
};

/**
 * Where the main (right-hand) preview gets its content.
 *
 * Note what is NOT in this union: there is no `video` variant, and no field
 * points at `previewVideo`. That omission is the guard - thumbnail media cannot
 * become the main preview even by accident, because there is no value it could
 * be assigned to. A `thumbnailUrl?.endsWith('.webm')` check would be the weaker
 * option: it has to be remembered at every call site and it silently passes
 * any media the app did not think to test for.
 */
export type TemplatePreviewSource =
    /** A live component chunk exists, so the actual template can be rendered. */
    | { kind: 'component' }
    /** No chunk, but the template exposes an external demo to embed. */
    | { kind: 'iframe'; url: string }
    /** Nothing renderable: show the template's own brand gradient. */
    | { kind: 'gradient' };

/**
 * Single source of truth for the main preview, shared by every detail page.
 *
 * `previewVideo` / `previewImage` are thumbnail media. They belong to the cards
 * (the Similar Templates rail, the home grid) and are deliberately not consulted
 * here, which is what keeps a .webm from ever being loaded as the full-size
 * preview: those files are 65 KB - 1.5 MB each and they are recordings, not the
 * template. A template with no live representation degrades to its gradient
 * rather than substituting a recording for the real thing.
 */
export function resolvePreviewSource(template: TemplateItem): TemplatePreviewSource {
    if (TEMPLATE_PREVIEWS[template.id]) return { kind: 'component' };
    if (template.liveDemoUrl) return { kind: 'iframe', url: template.liveDemoUrl };
    return { kind: 'gradient' };
}

export const TEMPLATE_SOURCE_FILES: Record<string, string> = {
    '2586-labs': 'Labs2586.tsx',
    'mood-hero': 'MoodHero.tsx',
    'portfolio-closing': 'PortfolioClosing.tsx',
    'tars-protocol': 'TarsHeroArena.tsx',
    'split-fuzzy-orb': 'SplitFuzzyOrbHero.tsx',
    'segmint-2026': 'SegmintFooter.tsx',
    'haos-tech-solutions': 'HaosShowcase.tsx',
    'mentality': 'MentalityHero.tsx',
    'interior-design': 'InteriorDesignShowcase.tsx',
    'lumos': 'LumosHero.tsx',
    'loveapp-hero': 'LoveAppHero.tsx',
    'heyo-agency-cta': 'HeyoAgencyCta.tsx',
    'me-019-au-cabaret': 'AuCabaretPoster.tsx',
    'dont-be-greedy': 'DontBeGreedyFooter.tsx',
    'paipai-kuaishou': 'PaipaiKuaishou.tsx',
    'logo-here': 'LogoHere.tsx',
    'sui-overflow': 'SuiOverflow.tsx',
    'graphic-designer-portfolio': 'GraphicDesignerPortfolio.tsx',
    'originkit-hero-24': 'UI-HUB.tsx',
  // The orb, hand, nav, headline and card all live in one self-contained file,
  // which is what the single-file Code tab requires.
  'visionary-orb-hero': 'VisionaryOrbHero.tsx',
};

/**
 * Real, verified public assets a template actually loads.
 *
 * Deliberately sparse: 16 of the 18 templates are fully self-contained and
 * reference no external file, so listing anything for them would be fiction.
 * Only templates whose source genuinely fetches these files are listed, with
 * the exact on-disk path, so the Code tab's file tree is honest.
 */
export interface TemplatePublicAsset {
    /** Site-root path, e.g. '/originkit/hero-24/bg.png'. */
    src: string;
    /** Real folder inside public/, used to build the tree, e.g. 'originkit/hero-24'. */
    folder: string;
}

export const TEMPLATE_PUBLIC_ASSETS: Record<string, TemplatePublicAsset[]> = {
    'originkit-hero-24': [
        { src: '/originkit/hero-24/avatar.png', folder: 'originkit/hero-24' },
        { src: '/originkit/hero-24/bg-desktop.png', folder: 'originkit/hero-24' },
        { src: '/originkit/hero-24/bg-ipad.png', folder: 'originkit/hero-24' },
        { src: '/originkit/hero-24/bg.png', folder: 'originkit/hero-24' },
        { src: '/originkit/hero-24/desk-mask-bottom.svg', folder: 'originkit/hero-24' },
        { src: '/originkit/hero-24/desk-mask-top.svg', folder: 'originkit/hero-24' },
        { src: '/originkit/hero-24/hand-mask-bottom.svg', folder: 'originkit/hero-24' },
        { src: '/originkit/hero-24/hand-mask-top.svg', folder: 'originkit/hero-24' },
        { src: '/originkit/hero-24/hands.png', folder: 'originkit/hero-24' },
        { src: '/originkit/hero-24/ipad-mask-bottom.svg', folder: 'originkit/hero-24' },
        { src: '/originkit/hero-24/ipad-mask-top.svg', folder: 'originkit/hero-24' },
        { src: '/originkit/hero-24/menu.svg', folder: 'originkit/hero-24' },
    ],
    'dont-be-greedy': [
        { src: '/assets/char_left.png', folder: 'assets' },
        { src: '/assets/char_right.png', folder: 'assets' },
    ],
};

/** Canvas colour shown behind a preview while its chunk is still loading. */
export const TEMPLATE_PREVIEW_BGS: Record<string, string> = {
    '2586-labs': 'bg-[#F8F3E5]',
    'mood-hero': 'bg-[#EDE8DE]',
    'portfolio-closing': 'bg-[#0B1014]',
    'tars-protocol': 'bg-white',
    'split-fuzzy-orb': 'bg-[#d6c0e3]',
    'segmint-2026': 'bg-[#E8E9EE]',
    'haos-tech-solutions': 'bg-[#020202]',
    'mentality': 'bg-[#F0F0F0]',
    'interior-design': 'bg-white',
    'lumos': 'bg-[#F1F1F0]',
    'loveapp-hero': 'bg-[#D8D2F8]',
    'heyo-agency-cta': 'bg-[#F5F5F2]',
    'me-019-au-cabaret': 'bg-[#EDEDED]',
    'dont-be-greedy': 'bg-[#050505]',
    'paipai-kuaishou': 'bg-[#59D1EA]',
    'logo-here': 'bg-white',
    'sui-overflow': 'bg-[#F2EFE6]',
    'graphic-designer-portfolio': 'bg-[#F7F6F2]',
    'originkit-hero-24': 'bg-[#101216]',
  'visionary-orb-hero': 'bg-[#080305]',
};

const prefetchedChunks = new Set<string>();

/**
 * Warms a template's preview chunk before the user commits to clicking it.
 *
 * The "Similar Templates" rail calls this on hover/focus: several previews pull
 * in three.js, so without it every rail click stalls on a cold chunk load.
 * Failures are swallowed because a missed prefetch must never surface as an
 * error - the chunk simply loads on navigation as it would have anyway.
 */
export function prefetchTemplateChunk(templateId: string): void {
    if (!templateId || prefetchedChunks.has(templateId)) return;

    const loader = TEMPLATE_PREVIEWS[templateId];
    if (!loader) return;

    prefetchedChunks.add(templateId);

    loader().catch(() => {
        // Intentionally ignored: prefetching is a performance hint only.
    });
}
