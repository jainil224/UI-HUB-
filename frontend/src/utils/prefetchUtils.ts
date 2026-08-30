/**
 * UI Hub - Component Chunk Prefetching System
 * Eagerly preloads code chunks when users hover or focus on switcher items.
 */

const prefetchedCache = new Set<string>();

const PREFETCH_MAP: Record<string, () => Promise<any>> = {
    // 3D & WebGL Components
    '3d-rubiks-cube': () => import('../components/ui/RubiksCube'),
    '3d-scroll-animation': () => import('../components/ui/Scroll3DAnimation'),
    '3d-slider': () => import('../components/ui/ThreeDSlider'),
    '3d-hero': () => import('../components/ui/ToonhubHero'),
    'solar-system': () => import('../components/ui/SolarSystem'),
    'fourier-flow': () => import('../components/ui/FourierFlow'),
    'cloud-scroll': () => import('../components/ui/CloudScroll/CloudScroll'),
    'cards-beam': () => import('../components/ui/CardsBeam'),
    'toonhub-hero': () => import('../components/ui/ToonhubHero'),

    // Cursors
    'aurora-cursor': () => import('../components/ui/AuroraCursor'),
    'magnetic-cursor': () => import('../components/ui/MagneticCursor'),
    'black-hole-cursor': () => import('../components/ui/BlackHoleCursor'),
    'target-cursor': () => import('../components/ui/TargetCursor'),
    'heart-cursor': () => import('../components/ui/HeartCursor'),
    'lizard-cursor': () => import('../components/ui/LizardCursor'),
    'venom-cursor': () => import('../components/ui/VenomCursor'),
    'star-cursor': () => import('../components/ui/StarCursor'),

    // Backgrounds & Canvas
    'magnetic-background': () => import('../components/ui/MagneticBackground'),
    'space-background': () => import('../components/ui/SpaceBackground'),
    'gravitational-vortex': () => import('../components/ui/GravitationalVortex'),
    'black-hole-3d': () => import('../components/ui/BlackHole'),
    'blooming-flower': () => import('../components/ui/BloomingFlower'),
    'chandelier': () => import('../components/ui/Chandelier'),
    'morphing-rings': () => import('../components/ui/MorphingRings'),
    'block-drift': () => import('../components/ui/BlockDrift'),
    'lightfall': () => import('../components/ui/Lightfall'),
    'black-hole-background': () => import('../components/ui/BlackHoleBackground'),
    'mouse-gravity-background': () => import('../components/ui/MouseGravityBackground'),
    'hacker-background': () => import('../components/ui/HackerBackground'),
    'beam-grid-background': () => import('../components/ui/BeamGridBackground'),
    'fall-beam-background': () => import('../components/ui/FallBeamBackground'),
    'hell-background': () => import('../components/ui/HellBackground'),
    'interactive-grid-background': () => import('../components/ui/InteractiveGridBackground'),
    'wave-background': () => import('../components/ui/WaveBackground'),
    'isometric-grid-background': () => import('../components/ui/isometric-grid-background'),
    'sparkles-background': () => import('../components/ui/sparkles-background'),
    'background-boxes': () => import('../components/ui/background-boxes'),
    'background-paths': () => import('../components/ui/background-paths'),

    // Buttons
    'corner-border-button': () => import('../components/ui/corner-border-button'),
    'corner-button': () => import('../components/ui/corner-button'),
    'interactive-hover-button': () => import('../components/ui/interactive-hover-button'),
    'marquee-hover-button': () => import('../components/ui/marquee-hover-button'),
    'payment-transaction-button': () => import('../components/ui/payment-transaction-button'),
    'rainbow-button': () => import('../components/ui/rainbow-button'),
    'border-beam': () => import('../components/ui/border-beam'),
    'glow-button': () => import('../components/ui/GlowButton'),
    'galaxy-button': () => import('../components/ui/GalaxyButton'),
    'orbit-button': () => import('../components/ui/OrbitButton'),
    'social-tooltip-buttons': () => import('../components/animations/SocialTooltipButtons'),
    'magic-card': () => import('../components/ui/magic-card'),

    // Image Interaction & Carousels
    'image-trail': () => import('../components/ui/image-trail'),
    'perspective-carousel': () => import('../components/ui/perspective-carousel'),
    'diagonal-carousel': () => import('../components/ui/diagonal-carousel'),
    'testimonials-card': () => import('../components/ui/testimonials-card'),
    'image-collage': () => import('../components/ui/image-collage'),
    'svg-page-transition': () => import('../components/ui/SVGPageTransition'),
    'section-scroll': () => import('../components/ui/SectionScroll'),
    'infinite-marquee': () => import('../components/ui/InfiniteMarquee'),


    // Text & Visual Effects
    'text-animations': () => import('../components/animations/TextAnimations'),
    'visual-effects': () => import('../components/animations/VisualEffects'),
};

/**
 * Trigger preloading of a component's JS bundle before user clicks
 */
export const prefetchComponentChunk = (componentId: string) => {
    if (!componentId || prefetchedCache.has(componentId)) return;

    prefetchedCache.add(componentId);

    const loader = PREFETCH_MAP[componentId];
    if (loader) {
        loader().catch(err => {
            // Silently catch prefetch network errors so they do not interrupt user interactions
            console.debug(`Prefetch for ${componentId} deferred:`, err);
        });
    } else if (componentId.startsWith('text-') || componentId.includes('text') || componentId === 'pixel-drift' || componentId === 'smoky-text' || componentId === 'text-path') {
        import('../components/animations/TextAnimations').catch(() => {});
    } else if (componentId.startsWith('effect-') || componentId.includes('effect')) {
        import('../components/animations/VisualEffects').catch(() => {});
    }
};
