import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadSeoManifest } from './lib/seo-manifest.mjs';

const FRONTEND_ROOT = join(import.meta.dirname, '..');
const DIST = join(FRONTEND_ROOT, 'dist');
const GENERATED_MARKER = join(DIST, '.seo-generated.json');

// Empties the prerendered #root before the first paint. React mounts with
// createRoot and replaces #root's children anyway, but only once the app
// bundle has loaded; until then the raw SEO article would be visible. This
// inline script runs during HTML parsing, so visitors never see that seed.
// It only runs when JS is enabled: non-JS crawlers still read the article
// straight from the source, so the answer-first content stays readable
// without executing anything (no CSS hiding involved).
const SEED_WIPE = '<script>try{var e=document.getElementById("root");if(e)e.textContent="";}catch(e){}</script>';

let seo = null;

function log(message) {
    console.log(`[seo] ${message}`);
}

function markdownToHtml(markdown) {
    const blocks = markdown
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean);

    return blocks
        .map((block) => {
            const escaped = seo.escapeHtml(block);
            const html = escaped
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/`([^`]+)`/g, '<code>$1</code>');
            return `<p>${html}</p>`;
        })
        .join('\n');
}

/**
 * Reuses the real built shell (assets, icons, analytics) so a prerendered URL
 * still boots the actual app. React mounts into #root with createRoot and
 * replaces the prerendered body, so crawlers see the content and visitors get
 * the interactive page.
 */
function readAppShellTags() {
    const shellPath = join(DIST, 'index.html');
    if (!existsSync(shellPath)) {
        throw new Error(`dist/index.html is missing - run "vite build" before the SEO build (${shellPath})`);
    }

    const shell = readFileSync(shellPath, 'utf8');
    const headStart = shell.indexOf('<head>');
    const headEnd = shell.indexOf('</head>');
    if (headStart === -1 || headEnd === -1) {
        throw new Error('dist/index.html has no <head> section to reuse');
    }

    const head = shell.slice(headStart + '<head>'.length, headEnd);
    const withoutJsonLd = head.replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, '');

    const scripts = [...withoutJsonLd.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map((match) => match[0]);
    const links = [...withoutJsonLd.matchAll(/<link\b[^>]*>/g)].map((match) => match[0]);

    const seoOwnedLink = /rel="canonical"|property="og:|name="twitter:/;

    // Application-owned head <meta> tags that the SEO renderer does not produce
    // itself but must keep: Google Search Console verification, AdSense site
    // verification, application identity, viewport and any SDK/verification
    // tags. Only SEO-owned and duplicated-by-the-renderer tags are dropped.
    const seoOwnedMeta = /charset|name="(description|robots)"|property="og:|name="twitter:/i;
    const metas = [...withoutJsonLd.matchAll(/<meta\b[^>]*>/g)]
        .map((match) => match[0])
        .filter((tag) => !seoOwnedMeta.test(tag));

    return [...links.filter((tag) => !seoOwnedLink.test(tag)), ...metas, ...scripts];
}

function renderHtml({ route, body, appTags }) {
    const jsonLd = route.jsonLd
        .map((schema) => `    <script type="application/ld+json">${JSON.stringify(schema)}</script>`)
        .join('\n');

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${seo.escapeHtml(route.title)}</title>
    <meta name="description" content="${seo.escapeHtml(route.description)}" />
    <link rel="canonical" href="${seo.escapeHtml(route.canonical)}" />
    <meta name="robots" content="${seo.escapeHtml(route.robots)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${seo.escapeHtml(seo.SITE_NAME)}" />
    <meta property="og:title" content="${seo.escapeHtml(route.title)}" />
    <meta property="og:description" content="${seo.escapeHtml(route.description)}" />
    <meta property="og:url" content="${seo.escapeHtml(route.canonical)}" />
    <meta property="og:image" content="${seo.escapeHtml(route.ogImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seo.escapeHtml(route.title)}" />
    <meta name="twitter:description" content="${seo.escapeHtml(route.description)}" />
    <meta name="twitter:image" content="${seo.escapeHtml(route.ogImage)}" />
${appTags.map((tag) => `    ${tag}`).join('\n')}
${jsonLd}
  </head>
  <body>
    <div id="root">
${body}
    </div>
    ${SEED_WIPE}
  </body>
</html>
`;
}

function renderBody(route) {
    const aeo = route.aeo ? `\n${seo.renderAeoHtml(route.aeo, '    ')}` : '';
    const related =
        route.related.length > 0
            ? `\n    <nav aria-label="Related">\n      <h2>Related</h2>\n      <ul>${route.related
                  .map((item) => `<li><a href="${seo.escapeHtml(item.path)}">${seo.escapeHtml(item.title)}</a></li>`)
                  .join('')}</ul>\n    </nav>`
            : '';

    return `    <main>
      <h1>${seo.escapeHtml(route.h1)}</h1>
${markdownToHtml(route.intro)}${aeo}
    </main>${related}`;
}

function renderNotFound(appTags) {
    const title = seo.clampTitle(`Page Not Found | ${seo.SITE_NAME}`);
    const description =
        'That page does not exist on UI Hub. Browse free React UI components, animated backgrounds, templates and full page sections instead.';

    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: seo.absoluteUrl('/404'),
    });

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${seo.escapeHtml(title)}</title>
    <meta name="description" content="${seo.escapeHtml(description)}" />
    <meta name="robots" content="noindex, follow" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${seo.escapeHtml(seo.SITE_NAME)}" />
    <meta property="og:title" content="${seo.escapeHtml(title)}" />
    <meta property="og:description" content="${seo.escapeHtml(description)}" />
    <meta property="og:url" content="${seo.escapeHtml(seo.absoluteUrl('/404'))}" />
    <meta property="og:image" content="${seo.escapeHtml(seo.DEFAULT_OG_IMAGE)}" />
    <meta name="twitter:card" content="summary_large_image" />
${appTags.map((tag) => `    ${tag}`).join('\n')}
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body>
    <div id="root">
    <main>
      <h1>Page not found</h1>
      <p>That page does not exist on UI Hub. It may have been renamed, or the link that brought you here may be out of date.</p>
      <p><a href="/">Go to the UI Hub home page</a>, browse <a href="/templates">website templates</a>, or search the <a href="/library">component library</a>.</p>
    </main>
    </div>
    ${SEED_WIPE}
  </body>
</html>
`;
}

function renderSitemap(routes) {
    const urls = routes
        .filter((route) => route.indexable)
        .map((route) => {
            const priority = route.priority.toFixed(1);
            // Only component routes carry a true lastmod (their addedAt date).
            // Static routes used to inherit today's build date, which made the
            // whole sitemap claim to change every deploy against nothing.
            const lastmod = route.lastmod ? `\n    <lastmod>${seo.escapeXml(route.lastmod)}</lastmod>` : '';
            return `  <url>
    <loc>${seo.escapeXml(route.canonical)}</loc>${lastmod}
    <changefreq>${route.changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
        })
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function renderRobots(manifest) {
    const blocked = manifest.NOINDEX_PATHS.map((entry) => `Disallow: ${entry.path}`).join('\n');
    const prefixes = manifest.NOINDEX_PREFIXES.map((entry) => `Disallow: ${entry.prefix}`).join('\n');

    return `User-agent: *
Allow: /

${blocked}
${prefixes}

Sitemap: ${seo.SITE_URL}/sitemap.xml
`;
}

function fileForRoute(routePath) {
    if (routePath === '/') return join(DIST, 'index.html');
    return join(DIST, routePath.replace(/^\//, ''), 'index.html');
}

/**
 * Prerendered pages are written to their real paths so Vercel serves them as
 * static files. Only directories this script created previously are removed,
 * never the whole dist output.
 */
function cleanPreviousOutput(routePaths) {
    if (existsSync(GENERATED_MARKER)) {
        const previous = JSON.parse(readFileSync(GENERATED_MARKER, 'utf8'));
        for (const previousPath of previous) {
            if (!routePaths.includes(previousPath)) {
                rmSync(join(DIST, previousPath.replace(/^\//, '')), { recursive: true, force: true });
            }
        }
    }

    for (const routePath of routePaths) {
        if (routePath === '/') continue;
        rmSync(join(DIST, routePath.replace(/^\//, '')), { recursive: true, force: true });
    }

    writeFileSync(GENERATED_MARKER, JSON.stringify(routePaths, null, 2), 'utf8');
}

async function main() {
    const { seo: bundle, routes, stats } = await loadSeoManifest();
    seo = bundle;

    if (stats.orphanMetadata.length > 0) {
        log(
            `note: ${stats.orphanMetadata.length} metadata entries have no componentList entry: ${stats.orphanMetadata.join(', ')}`,
        );
    }

    rmSync(join(DIST, 'seo'), { recursive: true, force: true });
    cleanPreviousOutput(routes.map((route) => route.path));

    const appTags = readAppShellTags();
    for (const route of routes) {
        const target = fileForRoute(route.path);
        mkdirSync(join(target, '..'), { recursive: true });
        writeFileSync(target, renderHtml({ route, body: renderBody(route), appTags }), 'utf8');
    }

    writeFileSync(join(DIST, '404.html'), renderNotFound(appTags), 'utf8');

    writeFileSync(join(DIST, 'sitemap.xml'), renderSitemap(routes), 'utf8');
    writeFileSync(join(DIST, 'robots.txt'), renderRobots(seo), 'utf8');

    const indexable = routes.filter((route) => route.indexable);
    log(
        `generated ${routes.length} routes (${indexable.length} indexable) from ${stats.components} components, ${stats.templates} templates, ${stats.buildSections} build sections`,
    );
    log(`wrote ${join(DIST, 'sitemap.xml')} and ${join(DIST, 'robots.txt')}`);
}

main().catch((error) => {
    console.error('[seo] build failed:', error);
    process.exitCode = 1;
});