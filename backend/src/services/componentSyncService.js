import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCollection } from './mongoService.js';
import { logActivity } from './activityLogService.js';
import { EMBEDDED_SOURCE_CODE } from '../data/sourceCodeData.js';
import { COMPONENT_FULL_SOURCES } from '../data/componentFullSources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_COLLECTION = 'components';

// UI layout / helper files to exclude when scanning the ui folder
const EXCLUDED_UI_FILES = new Set([
  'Navbar.tsx',
  'Footer.tsx',
  'Toast.tsx',
  'TopLoader.tsx',
  'WelcomeNotifications.tsx',
  'Skeleton.tsx',
  'SmoothScroll.tsx',
  'ScrollToTop.tsx',
  'SectionHeader.tsx',
  'CheckoutOverlay.tsx',
  'AuthRequiredModal.tsx',
  'CodeHighlighter.tsx',
  'ViewSourceButton.tsx',
  'PlanBadge.tsx',
  'Logo.tsx',
  'button.tsx',
]);

const PREMIUM_COMPONENT_IDS = new Set([
  'super-mario',
  'rubiks-cube',
  'black-hole-cursor',
  '3d-scroll-animation',
  '3d-slider',
  'cards-beam',
  'solar-system',
  'toonhub-hero',
  'fourier-flow',
  'cloud-scroll',
  'card-cascade',
  'twin-galaxy-rings',
  'point-dna-helix',
  'tornado',
  'particle-sphere',
  'morphing-rings',
  'hourglass',
  'gear-system',
  'isometric-portal',
  'spiral-images',
  'infinity-image',
  'spider-web',
  'generating-orb',
  'morphing-glow',
  'radial-glow-button',
  'gravitational-vortex',
  'black-hole',
  'blooming-flower',
  'chandelier',
  'lightfall',
  'pixel-drift',
]);

export const inferCategory = (id) => {
  const s = id.toLowerCase();
  if (s.includes('cursor')) return 'cursor';
  if (s.includes('text') || s.includes('letter') || s.includes('scramble') || s.includes('rolling') || s.includes('vaporize')) return 'text';
  if (s.includes('background') || s.includes('starfield') || s.includes('galaxy') || s.includes('rings') || s.includes('tornado') || s.includes('lightfall') || s.includes('beam') || s.includes('fourier')) return 'background';
  if (s.includes('button')) return 'button';
  if (s.includes('card') || s.includes('hover') || s.includes('flower') || s.includes('chandelier') || s.includes('pricing') || s.includes('testimonial')) return 'card';
  if (s.includes('scroll')) return 'scroll';
  if (s.includes('3d') || s.includes('rubik') || s.includes('slider') || s.includes('cube') || s.includes('portal') || s.includes('mario')) return '3d';
  return 'component';
};

export const formatTitle = (id) => {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const pascalOrCamelToKebab = (str) => {
  return str
    .replace(/\.tsx$/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
};

/**
 * Parses frontend/src/data/componentData.tsx to extract component metadata if accessible.
 */
function extractMetadataFromComponentDataFile() {
  const metaMap = new Map();
  try {
    const componentDataPath = path.resolve(__dirname, '../../../frontend/src/data/componentData.tsx');
    if (!fs.existsSync(componentDataPath)) return metaMap;

    const content = fs.readFileSync(componentDataPath, 'utf8');

    // Split roughly by object blocks in componentList
    const rawBlocks = content.split(/id:\s*['"]/);
    for (let i = 1; i < rawBlocks.length; i++) {
      const block = rawBlocks[i];
      const endQuoteIdx = block.search(/['"]/);
      if (endQuoteIdx === -1) continue;

      const id = block.slice(0, endQuoteIdx).trim();
      if (!id) continue;

      let title = '';
      const titleMatch = block.match(/title:\s*['"]([^'"]+)['"]/);
      if (titleMatch) title = titleMatch[1];

      let category = '';
      const catMatch = block.match(/category:\s*['"]([^'"]+)['"]/);
      if (catMatch) category = catMatch[1];

      const isPremium = block.includes('isPremium: true');

      let vibePrompt = '';
      const vibeMatch = block.match(/vibePrompt:\s*[`'"]([\s\S]*?)[`'"]/);
      if (vibeMatch) vibePrompt = vibeMatch[1];

      metaMap.set(id, { id, title, category, isPremium, vibePrompt });
    }
  } catch (err) {
    console.warn('[ComponentSync] Notice: could not read componentData.tsx:', err.message);
  }
  return metaMap;
}

/**
 * Collects all known components across the codebase.
 */
export async function collectAllWebsiteComponents() {
  const componentMap = new Map();
  const fileMetaMap = extractMetadataFromComponentDataFile();

  // 1. Ingest embedded source code dictionary (highest reliability across environments)
  const embeddedEntries = Object.entries(EMBEDDED_SOURCE_CODE || {});
  for (const [id, code] of embeddedEntries) {
    const fileMeta = fileMetaMap.get(id);
    const category = fileMeta?.category || inferCategory(id);
    const title = fileMeta?.title || formatTitle(id);
    const isPro = fileMeta?.isPremium || PREMIUM_COMPONENT_IDS.has(id);
    const vibePrompt = fileMeta?.vibePrompt || '';

    componentMap.set(id, {
      id,
      title,
      category,
      isPro,
      vibePrompt,
      code: typeof code === 'string' ? { react: code } : code,
      source: 'embedded_source',
    });
  }

  // 2. Ingest full sources dictionary
  const fullSourceEntries = Object.entries(COMPONENT_FULL_SOURCES || {});
  for (const [id, code] of fullSourceEntries) {
    const existing = componentMap.get(id) || {};
    componentMap.set(id, {
      ...existing,
      id,
      title: existing.title || formatTitle(id),
      category: existing.category || inferCategory(id),
      isPro: existing.isPro !== undefined ? existing.isPro : PREMIUM_COMPONENT_IDS.has(id),
      code: typeof code === 'string' ? { react: code } : code,
      source: 'full_source',
    });
  }

  // 3. Scan physical UI folder if available (useful when developer creates new .tsx file in frontend)
  try {
    const uiDir = path.resolve(__dirname, '../../../frontend/src/components/ui');
    if (fs.existsSync(uiDir)) {
      const files = fs.readdirSync(uiDir);
      for (const file of files) {
        if (!file.endsWith('.tsx') || EXCLUDED_UI_FILES.has(file)) continue;

        const id = pascalOrCamelToKebab(file);
        if (!componentMap.has(id)) {
          const filePath = path.join(uiDir, file);
          let fileContent = '';
          try {
            fileContent = fs.readFileSync(filePath, 'utf8');
          } catch (_) {}

          const fileMeta = fileMetaMap.get(id);
          const category = fileMeta?.category || inferCategory(id);
          const title = fileMeta?.title || formatTitle(id);
          const isPro = fileMeta?.isPremium || PREMIUM_COMPONENT_IDS.has(id);

          componentMap.set(id, {
            id,
            title,
            category,
            isPro,
            vibePrompt: fileMeta?.vibePrompt || '',
            code: { react: fileContent },
            source: 'filesystem_scan',
          });
        }
      }
    }
  } catch (dirErr) {
    // Non-fatal if filesystem is restricted
  }

  // 4. Ingest any remaining IDs from componentData.tsx
  for (const [id, meta] of fileMetaMap.entries()) {
    if (!componentMap.has(id)) {
      componentMap.set(id, {
        id,
        title: meta.title || formatTitle(id),
        category: meta.category || inferCategory(id),
        isPro: meta.isPremium || PREMIUM_COMPONENT_IDS.has(id),
        vibePrompt: meta.vibePrompt || '',
        code: { react: `// Component: ${meta.title}` },
        source: 'component_data_manifest',
      });
    }
  }

  return Array.from(componentMap.values());
}

/**
 * Synchronizes all components from the website into MongoDB Atlas.
 * Inserts any new components and updates existing ones without overwriting analytics (views, copies).
 */
export async function syncAllComponentsToMongo() {
  try {
    console.log('[ComponentSync] Scanning website components for MongoDB Atlas sync...');
    const allComponents = await collectAllWebsiteComponents();
    const col = await getCollection(COMPONENTS_COLLECTION);

    // Ensure indexes exist
    await col.createIndex({ category: 1, isPro: 1 }, { background: true });
    try {
      await col.createIndex({ title: 'text', tags: 'text' }, { background: true });
    } catch (_) {}

    const now = new Date();

    const operations = allComponents.map((comp) => {
      const id = comp.id;
      const tags = [
        comp.category,
        comp.isPro ? 'pro' : 'free',
        'react',
        'tailwind',
        ...id.split('-'),
      ];

      return {
        updateOne: {
          filter: { _id: id },
          update: {
            $set: {
              _id: id,
              title: comp.title,
              category: comp.category,
              framework: 'react',
              styling: 'tailwind',
              isPro: Boolean(comp.isPro),
              code: comp.code,
              vibePrompt: comp.vibePrompt || '',
              tags,
              updatedAt: now,
            },
            $setOnInsert: {
              viewsCount: 0,
              copyCount: 0,
              createdAt: now,
            },
          },
          upsert: true,
        },
      };
    });

    const bulkResult = await col.bulkWrite(operations, { ordered: false });
    const addedCount = bulkResult.upsertedCount || 0;
    const updatedCount = bulkResult.modifiedCount || (bulkResult.matchedCount - addedCount) || 0;

    const totalInMongo = await col.countDocuments();
    console.log(`[ComponentSync] ✅ MongoDB Atlas updated: ${allComponents.length} processed (${addedCount} new added, ${updatedCount} updated). Total in MongoDB: ${totalInMongo}`);

    await logActivity({
      type: 'components.synced',
      level: 'info',
      metadata: {
        totalProcessed: allComponents.length,
        addedCount,
        updatedCount,
        totalInMongo,
        timestamp: now.toISOString(),
      },
    });

    return {
      success: true,
      totalProcessed: allComponents.length,
      addedCount,
      updatedCount,
      totalInMongo,
    };
  } catch (error) {
    console.error('[ComponentSync] ❌ Error syncing components to MongoDB:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

export const componentSyncService = {
  collectAllWebsiteComponents,
  syncAllComponentsToMongo,
  inferCategory,
  formatTitle,
};

export default componentSyncService;
