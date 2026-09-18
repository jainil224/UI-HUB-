/**
 * UI-HUB — Announcement manifest generator.
 *
 * Derives the "We added N new components" announcement data straight from the
 * real catalog (frontend/src/data/componentData.tsx), validates every curated
 * id against mcp-server/src/data/components.ts, and writes a snapshot JSON to
 * backend/src/data/announcementManifest.json that the email builder, CLI and
 * broadcast route consume.
 *
 * Usage:
 *   node scripts/announcement/generate-manifest.mjs            # asOf = today
 *   node scripts/announcement/generate-manifest.mjs --as-of 2026-09-18
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
// The classic TypeScript compiler API lives in mcp-server's dependency tree
// (the repo-root install has the TypeScript 7 native preview with no API).
const require = createRequire(path.join(repoRoot, 'mcp-server', 'package.json'));
const ts = require('typescript');
const componentDataPath = path.join(repoRoot, 'frontend', 'src', 'data', 'componentData.tsx');
const componentsTsPath = path.join(repoRoot, 'mcp-server', 'src', 'data', 'components.ts');
const outPath = path.join(repoRoot, 'backend', 'src', 'data', 'announcementManifest.json');

const asOfIndex = process.argv.indexOf('--as-of');
const asOf = asOfIndex !== -1 && process.argv[asOfIndex + 1]
    ? process.argv[asOfIndex + 1]
    : new Date().toISOString().slice(0, 10);

// The 10 interactive-background components shown in the animated email banner.
const CURATED_BANNER_IDS = [
    'gravitational-vortex',
    'black-hole-3d',
    'blooming-flower',
    'chandelier',
    'spider-web',
    'twin-galaxy-rings',
    'tornado',
    'globe-mesh',
    'ascii-water',
    'ocean-swell',
];

// The newest components showcased as "What's New" feature cards.
const FOCUS_IDS = ['reflect-shader', 'infinite-tendrils', 'ocean-swell', 'star-burst'];

const FEATURED_DESCS = {
    'reflect-shader': 'Realtime WebGL reflection shader that turns any surface into a living mirror.',
    'infinite-tendrils': 'Organic ribbons of light that twist and flow endlessly in the background.',
    'ocean-swell': 'A THREE.js ocean surface rendered with calm, cinematic swell.',
    'star-burst': 'An animated radial burst of light — pure eye candy for hero sections.',
};

const SLUG_CATEGORY_DESC = {
    'interactive-background': 'Interactive canvas & WebGL backgrounds',
    'background': 'Animated background components',
    '3d': '3D and WebGL components',
    'effect': 'Visual effects and transitions',
    'cursor': 'Custom cursor and pointer effects',
    'text': 'Text and typography animations',
    'button': 'Interactive button components',
    'scroll': 'Scroll-triggered animations',
    'image-interaction': 'Image interactions and galleries',
    'loader': 'Loading and preloader animations',
    'navbar': 'Navigation bar layouts',
    'footer': 'Website footer layouts',
    'form': 'Form and input components',
    'custom': 'Custom components',
};

const titleCase = (slug) =>
    slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

/** Parse componentData.tsx via the TypeScript AST (same as MCP sync script). */
function parseCatalog() {
    const source = fs.readFileSync(componentDataPath, 'utf8');
    const sf = ts.createSourceFile(componentDataPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    let listNode = null;
    const visit = (node) => {
        if (listNode) return;
        if (ts.isVariableDeclaration(node) && node.name.getText(sf) === 'componentList' && node.initializer) {
            listNode = node.initializer;
            return;
        }
        ts.forEachChild(node, visit);
    };
    ts.forEachChild(sf, visit);
    if (!listNode || !ts.isArrayLiteralExpression(listNode)) throw new Error('componentList array not found');

    const entries = [];
    for (const el of listNode.elements) {
        if (!ts.isObjectLiteralExpression(el)) continue;
        const rec = { id: '', title: '', category: 'custom', addedAt: null, description: '', isPremium: false };
        for (const prop of el.properties) {
            if (!ts.isPropertyAssignment(prop)) continue;
            const name = prop.name.getText(sf);
            const val = prop.initializer;
            if (ts.isStringLiteral(val) || ts.isNoSubstitutionTemplateLiteral(val)) {
                rec[name] = val.text;
            } else if (name === 'isPremium') {
                rec.isPremium = /true/i.test(val.getText(sf));
            }
        }
        if (rec.id) entries.push(rec);
    }
    return entries;
}

function extractCategoryMap() {
    const text = fs.readFileSync(componentsTsPath, 'utf8');
    const mapMatch = text.match(/const CATEGORY_MAP: Record<string, string> = \{([\s\S]*?)\n\};/);
    if (!mapMatch) return new Map();
    const map = new Map();
    const re = /"([^"]+)":\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(mapMatch[1])) !== null) {
        map.set(m[1], m[2]);
    }
    return map;
}

function main() {
    const entries = parseCatalog();
    const categoryMap = extractCategoryMap();
    const byId = new Map(entries.map((e) => [e.id, e]));

    // Validate curated ids exist in the synchronized catalog.
    const allCurated = [...CURATED_BANNER_IDS, ...FOCUS_IDS];
    const missing = allCurated.filter((id) => !byId.has(id));
    if (missing.length > 0) {
        console.error(`❌ Curated ids missing from catalog: ${missing.join(', ')}`);
        process.exit(1);
    }

    const total = entries.length;

    const withDate = entries.filter((e) => e.addedAt);

    // Components added within the last 30 days of the "as of" date.
    const cutoffMs = new Date(asOf).getTime() - 30 * 24 * 60 * 60 * 1000;
    const recent = entries
        .filter((e) => e.addedAt && new Date(e.addedAt).getTime() >= cutoffMs)
        .sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''));

    // The latest single drop = components on the most recent addedAt date.
    const latestDropDate = withDate.reduce(
        (max, e) => (e.addedAt > max ? e.addedAt : max),
        '',
    );
    const latestDrop = recent.filter((e) => e.addedAt === latestDropDate);

    const byCategory = (list) =>
        list.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + 1;
            return acc;
        }, {});

    const recentCountsByCategory = byCategory(recent);
    const latestDropByCategory = byCategory(latestDrop);

    const featured = FOCUS_IDS.map((id) => {
        const e = byId.get(id);
        return {
            id,
            title: e.title,
            category: e.category,
            categoryLabel: titleCase(e.category),
            description: e.description || FEATURED_DESCS[id] || SLUG_CATEGORY_DESC[e.category] || 'UI HUB component',
            addedAt: e.addedAt,
            thumbUrl: `/assets/component-previews/${id}.png`,
        };
    });

    // Verify banner ids are interactive-background for a consistent visual.
    const badCategory = CURATED_BANNER_IDS.filter(
        (id) => categoryMap.get(id) !== 'interactive-background',
    );
    if (badCategory.length > 0) {
        console.error(`⚠️  Non interactive-background banner ids: ${badCategory.join(', ')}`);
    }

    const manifest = {
        generatedAt: new Date().toISOString(),
        asOf,
        totalComponents: total,
        // The headline number — the most recent batch drop.
        latestDropDate,
        latestDropCount: latestDrop.length,
        latestDropByCategory,
        // The wider "last 30 days" picture for the copy line.
        thirtyDayCount: recent.length,
        thirtyDayCountsByCategory: recentCountsByCategory,
        featured,
        bannerIds: CURATED_BANNER_IDS,
        bannerImage: '/assets/component-previews/announcement-banner.gif',
    };

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');

    console.log('========================================================');
    console.log('📦 ANNOUNCEMENT MANIFEST');
    console.log('========================================================');
    console.log(`   Catalog total        : ${total} components`);
    console.log(`   Latest drop (${latestDropDate})  : ${latestDrop.length}`);
    console.log(`   Latest by category   : ${JSON.stringify(latestDropByCategory)}`);
    console.log(`   Last 30 days total   : ${recent.length}`);
    console.log(`   As-of date           : ${asOf}`);
    console.log(`   Featured (What's New): ${featured.map((f) => f.id).join(', ')}`);
    console.log(`   Banner (GIF) images  : ${CURATED_BANNER_IDS.length}`);
    console.log(`   Wrote                : ${path.relative(repoRoot, outPath)}`);
    console.log('========================================================');
}

main();