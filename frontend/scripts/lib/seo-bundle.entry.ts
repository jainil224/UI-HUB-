/**
 * Entry point esbuild bundles so the Node build scripts can reuse the exact
 * same metadata, taxonomy and manifest logic the React app imports.
 */
export {
    SITE_URL,
    SITE_NAME,
    DEFAULT_OG_IMAGE,
    absoluteUrl,
    escapeHtml,
    escapeXml,
    clampTitle,
    clampDescription,
    DANGLING_WORDS,
} from '../../src/seo/site';
export { buildSeoManifest, NOINDEX_PATHS, NOINDEX_PREFIXES } from '../../src/seo/routes';
export type { SeoRoute } from '../../src/seo/routes';
export { inferTechs } from '../../src/seo/tech';
export {
    componentTitle,
    componentDescription,
    componentIntro,
    componentPath,
    categoryTitle,
    categoryDescription,
} from '../../src/seo/metadata';
export { toComponentSeoInput, toComponentAeoInput } from '../../src/seo/component-seo';
export { componentAeo, renderAeoHtml, looksLikeTestimonial } from '../../src/seo/aeo';
export type { ComponentAeo, AeoBlock, AeoConfidence } from '../../src/seo/aeo';
export { CATEGORY_SEO } from '../../src/seo/taxonomy';