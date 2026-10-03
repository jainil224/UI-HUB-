/**
 * Variant registry for components that expose more than one visual mode.
 *
 * A component that appears here gets a variant switcher on its detail page
 * (preview, code and vibe tabs). `ComponentDetail` owns the active variant so
 * the rendered preview, the displayed source and the generated AI prompt can
 * never disagree about which mode is being shown.
 *
 * Adding a variant here requires no changes to the detail page itself.
 */
export type ComponentVariantDef = {
    /** Stable id, also used to locate this variant's block in the source file. */
    id: string;
    /** Button label shown in the variant switcher. */
    label: string;
    /** One-line factual summary used for the card copy and the prompt spec. */
    description: string;
    /** Detailed behavioural spec used as the variant's AI prompt blueprint. */
    behaviour: string;
};

export const COMPONENT_VARIANTS: Record<string, ComponentVariantDef[]> = {
    'cube-loader': [
        {
            id: 'caustic',
            label: 'Caustic Cube',
            description: 'A cube loader with an aqua depth gradient on its four walls and a rippling water-caustic top face, displaced by an SVG fractal-noise filter as the form rotates.',
            behaviour: "A pure-CSS and SVG 3D cube loader. The four walls are four absolutely positioned spans inside a preserve-3d wrapper, each given its own CSS custom property through the inline --i value (0, 1, 2, 3). That index drives transform: rotateY(calc(90deg * var(--i))) translateZ(37.5px), where 37.5px is exactly half the 75px edge length, so the four walls splay out at 90 degree intervals and close into a solid cube. Each wall is filled with a vertical aqua gradient running from pale cyan at the top through saturated teal to warm yellow at the base. The top face is a 75px square rotated flat with rotateX(90deg) translateZ(37.5px) and overlaid with an inline SVG rect whose fill is displaced by an SVG filter: feTurbulence of type fractalNoise at baseFrequency 0.09 with a single octave generates the noise field, and feDisplacementMap shifts the rect through that field on the R and G channels at scale 600 to produce the rippling water-caustic surface. The entire form is pitched with rotateX(-30deg) and spins one full rotateY(360deg) every 4 seconds.",
        },
        {
            id: 'monolith',
            label: 'Monolith Cube',
            description: 'A black cube loader banded with hard white scanline glitch marks across its four walls, lit by a soft glowing plate beneath it.',
            behaviour: "A monochrome 3D cube loader built from the same four-wall construction as a CSS cube: four absolutely positioned spans sit inside a preserve-3d wrapper and are spaced by the CSS custom property --i (0, 1, 2, 3) through transform: rotateY(calc(90deg * var(--i))) translateZ(37.5px), half the 75px edge, so the walls meet at right angles. Each wall is filled with a black vertical gradient interrupted by hard white stops at 5.5%, 27.9%, 45.6% and 71.7% that read as torn scanline glitch bands rather than a smooth blend. The top face is a 75px square in a desaturated plum tone, rotated flat with rotateX(90deg) translateZ(37.5px). Beneath it a pseudo-element plate is pushed back with translateZ(-90px) and blurred 10px, then ringed by four stacked box-shadows alternating #323232 and white to cast a soft halo around the base. The form is pitched with rotateX(-30deg) and turns one full rotateY(360deg) every 4 seconds.",
        },
    ],
};

/** Variant ids declared for a component, or an empty array when it has none. */
export const getComponentVariants = (componentId: string): ComponentVariantDef[] =>
    COMPONENT_VARIANTS[componentId] ?? [];

/** The variant a component opens on. Falls back to the first declared variant. */
export const getDefaultVariant = (componentId: string): string | undefined =>
    COMPONENT_VARIANTS[componentId]?.[0]?.id;

/** Resolves one variant definition, guarding against an unknown id. */
export const getComponentVariant = (componentId: string, variantId?: string): ComponentVariantDef | undefined => {
    const variants = COMPONENT_VARIANTS[componentId];
    if (!variants?.length) return undefined;
    return variants.find((v) => v.id === variantId) ?? variants[0];
};