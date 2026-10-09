import { describe, it, expect } from 'vitest';
import { tokenize, searchCatalog, type SearchDoc } from '../src/services/searchEngine.js';
import { componentService } from '../src/services/componentService.js';
import type { ComponentSummary } from '../src/types/index.js';

const doc = (item: Partial<ComponentSummary>): SearchDoc => ({
  item: {
    id: 'x',
    name: 'X',
    category: 'effect',
    framework: 'react',
    styling: 'tailwind',
    tags: [],
    isPremium: false,
    ...item,
  } as ComponentSummary,
});

describe('searchEngine.tokenize', () => {
  it('strips filler words but keeps real intent terms', () => {
    expect(tokenize('add Particle Sun as my hero section')).toEqual(['particle', 'sun', 'hero']);
  });

  it('keeps hero as a real search term', () => {
    expect(tokenize('hero')).toEqual(['hero']);
  });

  it('splits hyphens and punctuation', () => {
    expect(tokenize('scroll-reveal, parallax!')).toEqual(['scroll', 'reveal', 'parallax']);
  });
});

describe('searchEngine.searchCatalog', () => {
  it('matches on any token across fields', () => {
    const hits = searchCatalog('particle sun', [
      doc({ id: 'particle-sphere', name: 'Particle Sphere', tags: ['particle', 'sphere'] }),
      doc({ id: 'solar-system', name: 'Solar System', tags: ['sun', 'planets'] }),
      doc({ id: 'footer-basic', name: 'Footer Basic', tags: ['footer'] }),
    ]);
    const ids = hits.map((h) => h.item.id);
    expect(ids).toContain('particle-sphere');
    expect(ids).toContain('solar-system');
    expect(ids).not.toContain('footer-basic');
  });

  it('expands synonyms (sun -> solar)', () => {
    const hits = searchCatalog('sun', [doc({ id: 'solar-system', name: 'Solar System', tags: ['solar'] })]);
    expect(hits.map((h) => h.item.id)).toContain('solar-system');
  });

  it('ranks higher-coverage docs first', () => {
    const hits = searchCatalog('particle sun', [
      doc({ id: 'only-particle', name: 'Only Particle', tags: ['particle'] }),
      doc({ id: 'both', name: 'Particle Sun', tags: ['particle', 'sun'] }),
    ]);
    expect(hits[0].item.id).toBe('both');
    expect(hits[0].matchedTokens).toBe(2);
  });

  it('returns nothing for an unknown term (no fabrication)', () => {
    expect(searchCatalog('zzzznope', [doc({ id: 'a', name: 'A' })])).toHaveLength(0);
  });
});

describe('componentService relevance (end to end, real catalog)', () => {
  it('resolves "Particle Sun as my hero section" to real components', () => {
    const hits = componentService.searchComponentHits({ query: 'add Particle Sun as my hero section' });
    expect(hits.length).toBeGreaterThan(0);
    const ids = hits.map((h) => h.item.id);
    expect(ids.some((id) => id.includes('particle') || id.includes('solar'))).toBe(true);
  });

  it('finds hero components for "hero section"', () => {
    const hits = componentService.searchComponentHits({ query: 'hero section' });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => /hero|navbar|landing/.test(h.item.id) || /hero/i.test(h.item.name))).toBe(true);
  });

  it('still supports structured filters (back-compat)', () => {
    expect(componentService.searchComponents({ category: 'button' }).length).toBeGreaterThan(0);
    expect(componentService.searchComponents({ isPremium: true }).length).toBeGreaterThan(0);
    expect(componentService.searchComponents({ query: 'cursor' }).length).toBeGreaterThan(0);
  });
});
