import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadSeoManifest, FRONTEND_ROOT } from './lib/seo-manifest.mjs';

const DIST = join(FRONTEND_ROOT, 'dist');

const failures = [];
const warnings = [];

function fail(message) {
    failures.push(message);
}

function warn(message) {
    warnings.push(message);
}

function checkDuplicate(label, values, routePathByValue) {
    const seen = new Map();
    for (const value of values) {
        const key = value.trim().toLowerCase();
        if (seen.has(key)) {
            fail(
                `duplicate ${label} on ${routePathByValue.get(value)} and ${seen.get(key)}: "${value}"`,
            );
        } else {
            seen.set(key, routePathByValue.get(value));
        }
    }
}

function fileForRoute(routePath) {
    if (routePath === '/') return join(DIST, 'index.html');
    return join(DIST, routePath.replace(/^\//, ''), 'index.html');
}

function extractTag(html, pattern, label, routePath) {
    const match = pattern.exec(html);
    if (!match) {
        fail(`${routePath}: missing ${label}`);
        return null;
    }
    return match[1];
}

async function main() {
    const { routes, stats, seo, componentConfig } = await loadSeoManifest();

    if (!existsSync(join(DIST, 'sitemap.xml'))) {
        fail('dist/sitemap.xml is missing - run the SEO build before check:seo');
    }
    if (!existsSync(join(DIST, 'robots.txt'))) {
        fail('dist/robots.txt is missing - run the SEO build before check:seo');
    }
    if (!existsSync(join(DIST, '404.html'))) {
        fail('dist/404.html is missing - run the SEO build before check:seo');
    } else {
        const notFound = readFileSync(join(DIST, '404.html'), 'utf8');
        if (!/<meta name="robots" content="noindex/.test(notFound)) {
            fail('dist/404.html is indexable - it must be noindex');
        }
        if (!/<h1[^>]*>/.test(notFound)) {
            fail('dist/404.html has no <h1>');
        }
        if (!/<script\b[^>]*src="\/assets\/index-[^"]+\.js"/.test(notFound)) {
            fail('dist/404.html does not load the app entry script');
        }
    }

    // The prerendered pages reuse the built shell <head>. Application-owned
    // tags such as Google Search Console verification and AdSense site
    // verification must survive that rebuild, otherwise verification breaks.
    // Rendered on every prerendered page, so the home page is the canary.
    const homeHtml = readFileSync(join(DIST, 'index.html'), 'utf8');
    for (const [marker, label] of [
        ['name="google-site-verification"', 'Google Search Console site verification meta'],
        ['name="google-adsense-account"', 'Google AdSense site verification meta'],
        ['name="application-name"', 'application-name meta'],
        ['name="apple-mobile-web-app-title"', 'apple-mobile-web-app-title (Add to Home Screen) meta'],
        ['name="viewport"', 'viewport meta'],
    ]) {
        if (!homeHtml.includes(marker)) {
            fail(`dist/index.html is missing the ${label} (${marker})`);
        }
    }

    const routePathByTitle = new Map(routes.map((route) => [route.title, route.path]));
    const routePathByDescription = new Map(routes.map((route) => [route.description, route.path]));

    checkDuplicate('title', routes.map((route) => route.title), routePathByTitle);
    checkDuplicate('description', routes.map((route) => route.description), routePathByDescription);

    const noindex = routes.filter((route) => !route.indexable);
    if (noindex.length > routes.length * 0.2) {
        warn(`${noindex.length}/${routes.length} routes are noindex - confirm that is intentional`);
    }

    for (const route of routes) {
        const file = fileForRoute(route.path);
        if (!existsSync(file)) {
            fail(`${route.path}: prerendered HTML missing at ${file}`);
            continue;
        }

        const html = readFileSync(file, 'utf8');

        const title = extractTag(html, /<title>([\s\S]*?)<\/title>/, '<title>', route.path);
        const description = extractTag(
            html,
            /<meta name="description" content="([^"]*)"/,
            'meta description',
            route.path,
        );
        const canonical = extractTag(
            html,
            /<link rel="canonical" href="([^"]*)"/,
            'canonical link',
            route.path,
        );
        const robots = extractTag(html, /<meta name="robots" content="([^"]*)"/, 'meta robots', route.path);

        if (title && title !== seo.escapeHtml(route.title)) {
            fail(`${route.path}: <title> does not match the manifest title`);
        }
        if (route.title.length > 60) {
            fail(`${route.path}: manifest title is ${route.title.length} chars (max 60): "${route.title}"`);
        }
        if (route.description.length > 160) {
            fail(
                `${route.path}: manifest description is ${route.description.length} chars (max 160): "${route.description}"`,
            );
        }
        const danglingLastWord = route.description
            .replace(/…$/, '')
            .trim()
            .split(' ')
            .pop()
            ?.toLowerCase();
        if (danglingLastWord && seo.DANGLING_WORDS.has(danglingLastWord)) {
            fail(`${route.path}: description ends on a dangling word "${danglingLastWord}": "${route.description}"`);
        }
        if (description && description !== seo.escapeHtml(route.description)) {
            fail(`${route.path}: meta description does not match the manifest description`);
        }
        if (canonical && canonical !== route.canonical) {
            fail(`${route.path}: canonical is ${canonical}, expected ${route.canonical}`);
        }
        if (robots && route.indexable && robots.includes('noindex')) {
            fail(`${route.path}: marked indexable in the manifest but the page says noindex`);
        }
        if (!robots && !route.indexable) {
            fail(`${route.path}: noindex route is missing a robots meta tag`);
        }

        if (!/<h1[^>]*>/.test(html)) {
            fail(`${route.path}: no <h1> in the prerendered HTML`);
        }
        if (route.intro.trim().length > 0) {
            if (/\*\*|`/.test(html.replace(/<\/?(strong|code)>/g, ''))) {
                fail(`${route.path}: unconverted markdown markers (** or backticks) leaked into the HTML`);
            }
            if (html.includes('<p></p>')) {
                fail(`${route.path}: contains an empty paragraph`);
            }
        }

        const countOf = (html, pattern) => [...html.matchAll(pattern)].length;

        for (const [label, pattern] of [
            ['<title>', /<title>/g],
            ['meta description', /<meta name="description"/g],
            ['canonical', /<link rel="canonical"/g],
            ['robots meta', /<meta name="robots"/g],
            ['#root', /<div id="root"/g],
        ]) {
            const count = countOf(html, pattern);
            if (count !== 1) {
                fail(`${route.path}: expected exactly 1 ${label}, found ${count}`);
            }
        }

        if (!/<script\b[^>]*src="\/assets\/index-[^"]+\.js"/.test(html)) {
            fail(`${route.path}: prerendered page does not load the app entry script`);
        }

        for (const match of html.matchAll(
            /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
        )) {
            try {
                const parsed = JSON.parse(match[1]);
                if (!parsed['@type']) {
                    fail(`${route.path}: JSON-LD block without @type`);
                }
            } catch (error) {
                fail(`${route.path}: invalid JSON-LD (${error.message})`);
            }
        }
    }

    if (existsSync(join(DIST, 'sitemap.xml'))) {
        const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
        const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
        const indexableRoutes = routes.filter((route) => route.indexable);

        if (locs.length !== indexableRoutes.length) {
            fail(`sitemap has ${locs.length} urls but the manifest has ${indexableRoutes.length} indexable routes`);
        }
        for (const route of indexableRoutes) {
            if (!locs.includes(route.canonical)) {
                fail(`sitemap is missing ${route.canonical}`);
            }
        }
        for (const loc of locs) {
            if (!loc.startsWith(seo.SITE_URL)) {
                fail(`sitemap contains a non-canonical host: ${loc}`);
            }
        }
        for (const blocked of seo.NOINDEX_PATHS) {
            if (locs.some((loc) => loc === `${seo.SITE_URL}${blocked.path}`)) {
                fail(`sitemap contains noindex route ${blocked.path}`);
            }
        }
    }

    if (existsSync(join(DIST, 'robots.txt'))) {
        const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
        if (!robots.includes(`Sitemap: ${seo.SITE_URL}/sitemap.xml`)) {
            fail('robots.txt does not advertise the sitemap');
        }
        for (const blocked of seo.NOINDEX_PATHS) {
            if (!robots.includes(`Disallow: ${blocked.path}`)) {
                fail(`robots.txt is missing Disallow for ${blocked.path}`);
            }
        }
        for (const blocked of seo.NOINDEX_PREFIXES) {
            if (!robots.includes(`Disallow: ${blocked.prefix}`)) {
                fail(`robots.txt is missing Disallow for ${blocked.prefix}`);
            }
        }
    }

    // The React routes recompute metadata at runtime from the same helpers.
    // If these ever disagree, the head a visitor sees after a client-side
    // navigation would contradict the URL they are on.
    let parityChecked = 0;
    for (const route of routes.filter((entry) => entry.type === 'component' && entry.indexable)) {
        const html = readFileSync(fileForRoute(route.path), 'utf8');
        const slug = route.path.split('/').pop();
        const component = stats.componentById.get(slug);
        if (!component) {
            fail(`no component data for component route ${route.path}`);
            continue;
        }
        const runtimeInput = seo.toComponentSeoInput(component, componentConfig[slug]);
        // The route lazily loads COMPONENT_CONFIG, exactly as ComponentPage does.
        const expectedTitle = seo.componentTitle(runtimeInput);
        const expectedDescription = seo.escapeHtml(seo.componentDescription(runtimeInput));
        if (!html.includes(`<title>${seo.escapeHtml(expectedTitle)}</title>`)) {
            fail(`runtime title does not match prerendered title for ${route.path}`);
        }
        if (!html.includes(`content="${expectedDescription}"`)) {
            fail(`runtime description does not match prerendered description for ${route.path}`);
        }
        parityChecked += 1;
    }

    for (const route of routes.filter((entry) => entry.type === 'category' && entry.indexable)) {
        const html = readFileSync(fileForRoute(route.path), 'utf8');
        const slug = route.path.split('/').pop();
        const expectedTitle = seo.categoryTitle(slug, stats.categoryCounts.get(slug) ?? 0);
        if (!html.includes(`<title>${seo.escapeHtml(expectedTitle)}</title>`)) {
            fail(`runtime category title does not match prerendered title for ${route.path}`);
        }
    }
    console.log(`[check:seo] runtime/prerender metadata parity verified on ${parityChecked} component routes`);

    // AEO gate. Every indexable component route must carry answer-first content,
    // the answers must be in the prerendered HTML, must not be hidden, must not
    // reuse testimonial copy, and must not duplicate another component's answer.
    let aeoParityChecked = 0;
    const aeoQuickAnswerIndex = new Map();
    for (const route of routes.filter((entry) => entry.type === 'component')) {

    if (!route.indexable) continue;

        const aeo = route.aeo;
        if (!aeo) {
            fail(`${route.path}: component route has no AEO content`);
            continue;
        }

        const html = readFileSync(fileForRoute(route.path), 'utf8');

        const quickAnswer = aeo.blocks.find((block) => block.kind === 'quickAnswer');
        if (!quickAnswer) {
            fail(`${route.path}: AEO has no quick answer`);
        } else {
            if (quickAnswer.text.trim().length < 40) {
                fail(`${route.path}: quick answer is only ${quickAnswer.text.trim().length} chars`);
            }
            if (!html.includes(`<h2 id="aeo-quickAnswer-0">`)) {
                fail(`${route.path}: quick answer heading missing from the prerendered HTML`);
            }
            // The whole point of AEO: the answer must be readable without
            // executing anything and without any interaction.
            if (!html.includes(quickAnswer.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))) {
                fail(`${route.path}: quick answer text is not present in the prerendered HTML`);
            }
        }

        const requiredKinds = ['quickFacts', 'table', 'faq'];
        for (const kind of requiredKinds) {
            if (!aeo.blocks.some((block) => block.kind === kind)) {
                fail(`${route.path}: AEO is missing a ${kind} block`);
            }
        }

        if (aeo.faq.length < 3) {
            fail(`${route.path}: AEO FAQ has only ${aeo.faq.length} questions (minimum 3)`);
        }

        const questions = aeo.faq.map((item) => item.question);
        const answers = aeo.faq.map((item) => item.answer);
        for (const [label, values] of [
            ['FAQ question', questions],
            ['FAQ answer', answers],
        ]) {
            const seen = new Set();
            for (const value of values) {
                const key = value.trim().toLowerCase();
                if (seen.has(key)) {
                    fail(`${route.path}: duplicate ${label} "${value}"`);
                }
                seen.add(key);
            }
        }

        for (const item of aeo.faq) {
            if (item.answer.trim().length < 30) {
                fail(`${route.path}: FAQ answer for "${item.question}" is too short to be useful`);
            }
            if (!html.includes(`<summary>${seo.escapeHtml(item.question)}</summary>`)) {
                fail(`${route.path}: FAQ question "${item.question}" is not in the prerendered HTML`);
            }
        }

        // No invented copy. `ComponentItem.description` doubles as testimonial copy
        // for social-proof components, and that text carries unverifiable claims
        // ("accelerated our rebuild by 300%"). Assert the forbidden source text is
        // absent rather than trying to classify generated technical prose, which
        // legitimately contains percentages and currency values.
        const rawDescription = stats.componentById.get(route.path.split('/').pop())?.description;
        if (rawDescription && seo.looksLikeTestimonial(rawDescription)) {
            const probe = rawDescription.trim().slice(0, 60);
            if (html.includes(seo.escapeHtml(probe))) {
                fail(`${route.path}: testimonial copy from componentData leaked into the page`);
            }
            for (const item of aeo.faq) {
                if (item.answer.includes(rawDescription.trim())) {
                    fail(`${route.path}: FAQ answer reuses the testimonial description verbatim`);
                }
            }
        }

        // Never hide answers. AEO rules forbid text that is present but not
        // readable, so reject the usual hiding techniques outright.
        const hiddenTextPatterns = [
            [/style="[^"]*display:\s*none/i, 'display:none'],
            [/style="[^"]*visibility:\s*hidden/i, 'visibility:hidden'],
            [/style="[^"]*font-size:\s*0/i, 'font-size:0'],
            [/style="[^"]*opacity:\s*0(\.0+)?\b/i, 'opacity:0'],
            [/style="[^"]*text-indent:\s*-\d/i, 'negative text-indent'],
            [/style="[^"]*left:\s*-\d{3,}/i, 'off-screen positioning'],
            [/<(div|span|p)[^>]*aria-hidden="true"[^>]*>[^<]{80,}/i, 'aria-hidden text block'],
        ];
        for (const [pattern, label] of hiddenTextPatterns) {
            if (pattern.test(html)) {
                fail(`${route.path}: prerendered HTML uses ${label}, which AEO rules forbid`);
            }
        }

        // A quick answer must be unique across the catalog, otherwise it is
        // generic filler rather than a real answer.
        const quickAnswerKey = quickAnswer?.text.trim().toLowerCase() ?? '';
        if (quickAnswerKey) {
            const seen = aeoQuickAnswerIndex.get(quickAnswerKey);
            if (seen) {
                fail(`${route.path}: quick answer is identical to ${seen}`);
            } else {
                aeoQuickAnswerIndex.set(quickAnswerKey, route.path);
            }
        }

        aeoParityChecked += 1;
    }

    if (aeoParityChecked === 0) {
        fail('no component routes were checked for AEO content');
    }

    console.log(
        `[check:seo] AEO parity verified on ${aeoParityChecked} component routes (${stats.aeoLowConfidence.length} low confidence)`,
    );

    const indexable = routes.filter((route) => route.indexable).length;
    console.log(`[check:seo] ${routes.length} routes, ${indexable} indexable`);
    console.log(
        `[check:seo] data: ${stats.components} components (${stats.componentsWithMetadata} with rich metadata), ${stats.templates} templates, ${stats.buildSections} build sections`,
    );
    if (stats.aeoLowConfidence.length > 0) {
        warn(
            `${stats.aeoLowConfidence.length} components have low-confidence AEO content (no authored description or behaviour): ${stats.aeoLowConfidence.slice(0, 12).join(', ')}${stats.aeoLowConfidence.length > 12 ? ', …' : ''}`,
        );
    }

    for (const warning of warnings) {
        console.warn(`[check:seo] WARN ${warning}`);
    }

    if (failures.length > 0) {
        console.error(`[check:seo] ${failures.length} problem(s):`);
        for (const failure of failures.slice(0, 40)) {
            console.error(`  - ${failure}`);
        }
        if (failures.length > 40) {
            console.error(`  ... and ${failures.length - 40} more`);
        }
        process.exitCode = 1;
        return;
    }

    console.log('[check:seo] OK');
}

main().catch((error) => {
    console.error('[check:seo] crashed:', error);
    process.exitCode = 1;
});