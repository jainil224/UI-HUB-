import { describe, it, expect } from 'vitest';
import { COMPONENT_VARIANTS, getComponentVariants, getDefaultVariant, getComponentVariant } from './componentVariants';
import { getFallbackVibePrompt } from '../utils/promptUtils';

describe('loader split regression', () => {
    it('cube-loader exposes exactly two variants', () => {
        expect(getComponentVariants('cube-loader').map((v) => v.id)).toEqual(['caustic', 'monolith']);
        expect(getDefaultVariant('cube-loader')).toBe('caustic');
    });

    it('prism-pyramid declares no variants, so no switcher renders', () => {
        expect(COMPONENT_VARIANTS['prism-pyramid']).toBeUndefined();
        expect(getComponentVariants('prism-pyramid')).toEqual([]);
        expect(getDefaultVariant('prism-pyramid')).toBeUndefined();
        expect(getComponentVariant('prism-pyramid', 'prism')).toBeUndefined();
    });

    it.each(['antigravity', 'lovable', 'cursor', 'claude', 'advance'] as const)(
        '%s prompt differs between caustic and monolith',
        (system) => {
            const a = getFallbackVibePrompt('cube-loader', system, undefined, 'caustic');
            const b = getFallbackVibePrompt('cube-loader', system, undefined, 'monolith');
            expect(a).not.toBe(b);
            expect(a).toContain('Caustic Cube');
            expect(b).toContain('Monolith Cube');
            // The shared code block legitimately contains both variants' CSS,
            // so divergence is asserted on the variant-specific spec, not the source.
            expect(a).toContain('water-caustic');
            expect(b).toContain('scanline glitch');
        }
    );

    it('prism-pyramid prompt is distinct from both cube variants', () => {
        const prism = getFallbackVibePrompt('prism-pyramid', 'claude');
        const caustic = getFallbackVibePrompt('cube-loader', 'claude', undefined, 'caustic');
        const monolith = getFallbackVibePrompt('cube-loader', 'claude', undefined, 'monolith');
        expect(prism).not.toBe(caustic);
        expect(prism).not.toBe(monolith);
        expect(prism).toContain('clip-path');
    });

    it('embeds the matching source file for each component', () => {
        const prism = getFallbackVibePrompt('prism-pyramid', 'claude');
        expect(prism).toContain('prism-pyramid__side');
        expect(prism).not.toContain('caustic-cube__span');
        const cube = getFallbackVibePrompt('cube-loader', 'claude', undefined, 'caustic');
        expect(cube).toContain('caustic-cube__span');
        expect(cube).not.toContain('prism-pyramid__side');
    });

    it('falls back safely for an unknown variant id', () => {
        const bogus = getFallbackVibePrompt('cube-loader', 'claude', undefined, 'does-not-exist');
        expect(bogus).toBe(getFallbackVibePrompt('cube-loader', 'claude', undefined, 'caustic'));
    });
});