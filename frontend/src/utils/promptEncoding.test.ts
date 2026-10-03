import { describe, it, expect } from 'vitest';
import { getFallbackVibePrompt } from './promptUtils';

const SYSTEMS = ['advance', 'antigravity', 'claude', 'lovable', 'cursor'] as const;

// Characters that must never appear in a generated prompt. A prompt is pasted
// straight into an AI tool, so a single mis-encoded byte is user-visible.
const MOJIBAKE = ['\u00E2', '\u00C3', '\u20AC', '\uFFFD'];

const promptFor = (system: (typeof SYSTEMS)[number]) =>
  getFallbackVibePrompt('cube-loader', system, undefined, 'caustic');

describe('prompt encoding integrity', () => {
  it.each(SYSTEMS)('%s prompt is free of mojibake', (system) => {
    const p = promptFor(system);
    for (const bad of MOJIBAKE) expect(p).not.toContain(bad);
  });

  it.each(SYSTEMS)('%s prompt contains no raw replacement characters', (system) => {
    expect(promptFor(system)).not.toMatch(/\uFFFD/);
  });

  it('advance prompt opens with the UI HUB block banner', () => {
    const p = promptFor('advance');
    // Row 1 of the ANSI Shadow "UI HUB" figlet, written as escapes so this
    // test file stays pure ASCII and cannot itself be mis-encoded.
    expect(p).toContain('\u2588\u2588\u2557   \u2588\u2588\u2557');
    // Row 6, the baseline row built from double-line box characters.
    expect(p).toContain('\u255a\u2550\u2550\u2550\u2550\u2550\u255d');
    for (const ch of ['\u2588', '\u2557', '\u2551', '\u2554', '\u255d', '\u255a', '\u2550']) {
      expect(p).toContain(ch);
    }
  });

  it('advance prompt no longer carries the UNIVERSAL BLUEPRINT banner line', () => {
    expect(promptFor('advance')).not.toContain('UNIVERSAL BLUEPRINT');
  });

  it('advance prompt keeps its intro line with a real em dash', () => {
    expect(promptFor('advance')).toContain('UI HUB universal component blueprint');
    expect(promptFor('advance')).toContain('\u2014');
  });

  it('em dashes survive in the claude and lovable prompts', () => {
    expect(promptFor('claude')).toContain('exact reference implementation \u2014');
    expect(promptFor('lovable')).toContain('exact animation timing and structure \u2014');
  });
});
