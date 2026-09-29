/**
 * Public URLs for the "Build with UI HUB" section.
 *
 * Kept in its own module, deliberately dependent on nothing, because the navbar
 * search box needs to answer "does this template have a section URL?" on first
 * paint. Importing it from templatesData.ts instead would pull the entire
 * ~800 kB template catalog into the initial bundle and defeat the lazy
 * `import('../data/templatesData')` in searchIndex.ts that keeps it out.
 */

/** A "Build with UI HUB" section: a layout published under its own short URL. */
export interface BuildWithUIHubSection {
  /** URL segment under /build-with-ui-hub/, e.g. 'UIHUB-hero-1'. */
  slug: string;
  /**
   * Id of the master template record this section renders.
   *
   * The slug is the public URL and can be renamed freely; the id is referenced
   * from a dozen places - the preview registry, the library catalog, the
   * embedded source map, the MCP mirror, the demo route - so it stays stable.
   */
  templateId: string;
  /**
   * Catalog ids of the UI HUB components this section is built from, in the
   * order they should be listed under the preview on the detail page.
   *
   * Plain string ids only: this module is imported on first paint by the navbar
   * search box, so it must stay dependency-free. The detail page resolves them
   * against `componentList` at render time, behind a lazy import, so the ~760 kB
   * catalog never lands in the initial bundle.
   *
   * Only claim a component here if a user opening that component would find the
   * same thing they saw in the section preview. Sections that are a single
   * self-contained component list just that one id.
   */
  componentIds: string[];
}

/**
 * Every Build with UI HUB section, in display order.
 *
 * Single source of truth for the split: TemplatesSection excludes every
 * templateId listed here, BuildWithUIHubSection renders exactly these, and the
 * detail page and left rail both read it. Adding an entry is the only step
 * needed to publish a new section URL.
 */
export const BUILD_WITH_UI_HUB_SECTIONS: BuildWithUIHubSection[] = [
  { slug: 'UIHUB-hero-1', templateId: 'originkit-hero-24', componentIds: [] },
  {
    slug: 'UIHUB-hero-2',
    templateId: 'visionary-orb-hero',
    // The Visionary section is a single self-contained component, so the panel
    // lists exactly that one. Add ids here as sections start composing parts.
    componentIds: ['visionary-orb-hero'],
  },
];

/** Templates rendered by Build with UI HUB; excluded from the Templates grid. */
export const BUILD_WITH_UI_HUB_IDS: string[] = BUILD_WITH_UI_HUB_SECTIONS.map(
  (section) => section.templateId,
);

/** Master template id -> public slug. Used by search and by the canonical redirects. */
export const buildWithUIHubSlugByTemplateId: Record<string, string> =
    Object.fromEntries(
        BUILD_WITH_UI_HUB_SECTIONS.map((section) => [section.templateId, section.slug]),
    );

/** Public slug -> the full section record, including its componentIds. */
export const buildWithUIHubSectionBySlug: Record<string, BuildWithUIHubSection> =
    Object.fromEntries(
        BUILD_WITH_UI_HUB_SECTIONS.map((section) => [section.slug, section]),
    );
