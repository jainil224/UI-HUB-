import type { ComponentSummary } from '../types/index.js';

/**
 * Deterministic, offline relevance search for the MCP catalog.
 *
 * The previous implementation required the ENTIRE query to appear as a
 * substring of a single field, so "add Particle Sun as my hero section" matched
 * nothing. This engine tokenizes the query, expands a small synonym map, scores
 * every component field, and ranks by coverage then score.
 */

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'at', 'with',
  'my', 'me', 'i', 'we', 'you', 'your', 'please', 'add', 'insert', 'include',
  'use', 'using', 'make', 'create', 'build', 'give', 'get', 'want', 'need',
  'as', 'into', 'onto', 'section', 'component', 'components', 'page', 'website',
  'site', 'hero', // NOTE: 'hero' is intentionally kept? see below
]);

// 'hero' is a real, searched term (hero sections). Remove it from stopwords.
STOPWORDS.delete('hero');

/** term -> related single-word terms (bidirectional at expansion time). */
const SYNONYMS: Record<string, string[]> = {
  hero: ['navbar', 'landing', 'section', 'banner'],
  landing: ['hero', 'navbar', 'banner'],
  banner: ['hero', 'landing'],
  background: ['backgrounds', 'particles', 'animated'],
  backgrounds: ['background'],
  sun: ['solar', 'star', 'orbit', 'sphere'],
  solar: ['sun', 'planets', 'space'],
  star: ['sun', 'galaxy', 'space'],
  space: ['galaxy', 'cosmos', 'solar', 'orbit'],
  galaxy: ['space', 'cosmos', 'orbit'],
  cosmos: ['space', 'galaxy'],
  orbit: ['solar', 'space', 'rings'],
  particle: ['particles', 'dots', 'points', 'sphere'],
  particles: ['particle', 'dots'],
  sphere: ['globe', 'orb', 'ball', 'particle'],
  globe: ['sphere', 'orbit', 'earth'],
  cursor: ['pointer', 'mouse'],
  pointer: ['cursor', 'mouse'],
  mouse: ['cursor', 'pointer'],
  loader: ['loading', 'spinner', 'preloader', 'progress'],
  loading: ['loader', 'spinner'],
  spinner: ['loader', 'loading'],
  button: ['cta', 'btn'],
  cta: ['button', 'btn'],
  grid: ['tiles', 'lines', 'mesh'],
  tiles: ['grid'],
  card: ['cards', 'tile'],
  cards: ['card', 'deck'],
  scroll: ['scrolling', 'parallax', 'reveal', 'snap'],
  reveal: ['scroll', 'parallax'],
  parallax: ['scroll', 'reveal'],
  form: ['input', 'field', 'signup', 'login'],
  footer: ['bottom', 'links'],
  navbar: ['nav', 'header', 'menu'],
  nav: ['navbar', 'header', 'menu'],
  header: ['navbar', 'nav'],
  menu: ['navbar', 'nav'],
  rubik: ['cube', 'puzzle'],
  cube: ['rubik', 'puzzle'],
  fire: ['hell', 'lava', 'flame'],
  lava: ['hell', 'fire'],
  hell: ['fire', 'lava', 'dark'],
  rain: ['lightfall', 'falling', 'particles'],
  falling: ['rain', 'lightfall', 'drift'],
  network: ['web', 'nodes', 'spider'],
  web: ['spider', 'network'],
  spider: ['web', 'network'],
  vortex: ['tornado', 'spiral', 'gravity'],
  tornado: ['vortex', 'spiral', 'wind'],
  gravity: ['gravitational', 'vortex'],
  gravitational: ['gravity'],
  spiral: ['vortex', 'tornado', 'helix'],
  helix: ['spiral', 'dna'],
  dna: ['helix', 'points'],
  morph: ['morphing', 'blob', 'shape'],
  morphing: ['morph', 'blob'],
  glow: ['glowing', 'neon', 'light', 'aura'],
  neon: ['glow', 'light'],
  aura: ['glow', 'halo'],
  text: ['typography', 'type', 'heading'],
  typography: ['text', 'font'],
  game: ['mario', 'retro', 'pixel'],
  retro: ['pixel', 'game'],
  pixel: ['retro', 'dots'],
  clock: ['time', 'timer', 'hourglass'],
  timer: ['countdown', 'clock', 'hourglass'],
  hourglass: ['sand', 'time', 'timer'],
};

export function tokenize(input: string): string[] {
  return (input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, ' ')
    .split(/[\s-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

function expandToken(token: string): Set<string> {
  const out = new Set<string>([token]);
  const direct = SYNONYMS[token];
  if (direct) direct.forEach((t) => out.add(t));
  // Reverse synonyms: any key that lists this token.
  for (const [key, values] of Object.entries(SYNONYMS)) {
    if (values.includes(token)) out.add(key);
  }
  return out;
}

export interface SearchDoc {
  item: ComponentSummary;
  /** Extra searchable text (behavior/vibe description). */
  behaviorText?: string;
}

export interface SearchHit {
  item: ComponentSummary;
  score: number;
  /** Number of distinct query tokens matched directly. */
  matchedTokens: number;
  /** Best field the match came from. */
  matchedOn?: string;
  /** The behavior field this hit matched on, if any. */
  behaviorMatched?: boolean;
}

interface FieldSets {
  idTokens: Set<string>;
  titleTokens: Set<string>;
  tagTokens: Set<string>;
  categoryTokens: Set<string>;
  descTokens: Set<string>;
  behaviorTokens: Set<string>;
}

function buildFields(doc: SearchDoc): FieldSets {
  const { item } = doc;
  const split = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const behaviorRaw = `${doc.behaviorText || ''} ${item.description || ''}`;
  return {
    idTokens: new Set(split(item.id)),
    titleTokens: new Set(split(item.name)),
    tagTokens: new Set(item.tags.flatMap((t) => split(t))),
    categoryTokens: new Set(split(item.category)),
    descTokens: new Set(split(item.description || '')),
    behaviorTokens: new Set(split(behaviorRaw)),
  };
}

/**
 * Score one query token against a document. Falls back to synonym expansion
 * with a reduced weight. Returns the best contribution + field name.
 */
function scoreToken(token: string, fields: FieldSets): { score: number; matchedOn?: string } {
  const variants = expandToken(token);
  let best = 0;
  let matchedOn: string | undefined;

  const consider = (amount: number, field: string) => {
    if (amount > best) {
      best = amount;
      matchedOn = field;
    }
  };

  for (const v of variants) {
    const isDirect = v === token;
    const w = isDirect ? 1 : 0.55; // synonyms count less
    if (fields.idTokens.has(v)) consider(10 * w, 'id');
    if (fields.titleTokens.has(v)) consider(7 * w, 'title');
    if (fields.tagTokens.has(v)) consider(5 * w, 'tags');
    if (fields.categoryTokens.has(v)) consider(4.5 * w, 'category');
    if (fields.descTokens.has(v)) consider(2 * w, 'description');
    if (fields.behaviorTokens.has(v)) consider(2 * w, 'behavior');
    // prefix fallback (e.g. 'scroll' vs 'scrolling', 'particle' vs 'particles')
    if (!fields.titleTokens.has(v)) {
      for (const t of fields.titleTokens) {
        if (t.startsWith(v) || v.startsWith(t)) { consider(3.5 * w, 'title'); break; }
      }
    }
    if (!fields.tagTokens.has(v)) {
      for (const t of fields.tagTokens) {
        if (t.startsWith(v) || v.startsWith(t)) { consider(2.5 * w, 'tags'); break; }
      }
    }
  }

  return { score: best, matchedOn };
}

/**
 * Rank catalog documents against a query.
 *
 * @param query  raw query string
 * @param docs   candidate documents
 * @param opts.minCoverage  fraction of direct query tokens that must match (default 0 = at least one)
 * @param opts.limit        max hits (default 20)
 */
export function searchCatalog(
  query: string,
  docs: SearchDoc[],
  opts: { minCoverage?: number; limit?: number } = {}
): SearchHit[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const limit = opts.limit ?? 20;
  const minCoverage = opts.minCoverage ?? 0;

  const hits: SearchHit[] = [];
  for (const doc of docs) {
    const fields = buildFields(doc);
    let score = 0;
    let matchedTokens = 0;
    let bestField: string | undefined;
    let behaviorMatched = false;

    for (const token of tokens) {
      const { score: s, matchedOn } = scoreToken(token, fields);
      if (s > 0) {
        matchedTokens += 1;
        score += s;
        if (!bestField || s >= 4) bestField = matchedOn;
        if (matchedOn === 'behavior') behaviorMatched = true;
      }
    }

    if (matchedTokens === 0) continue;
    if (matchedTokens / tokens.length < minCoverage) continue;

    // Reward wider coverage so multi-term queries resolve precisely.
    score += matchedTokens * 2;
    // Small bonus for typing/description length parity is not needed; keep deterministic.

    hits.push({ item: doc.item, score, matchedTokens, matchedOn: bestField, behaviorMatched });
  }

  hits.sort((a, b) => {
    if (b.matchedTokens !== a.matchedTokens) return b.matchedTokens - a.matchedTokens;
    if (b.score !== a.score) return b.score - a.score;
    return a.item.id.localeCompare(b.item.id);
  });

  return hits.slice(0, limit);
}
