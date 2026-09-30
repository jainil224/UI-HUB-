import { describe, it, expect } from 'vitest';
import { coerceToolMap, unknownToolKeys } from '../src/config/configService.js';
import { TOOL_NAMES } from '../src/tools/index.js';

describe('configService tool map coercion', () => {
  it('keeps real booleans', () => {
    const first = TOOL_NAMES[0];
    const second = TOOL_NAMES[1];
    const result = coerceToolMap({ [first]: true, [second]: false });
    expect(result).toEqual({ [first]: true, [second]: false });
  });

  it('coerces the string booleans a Mongo round-trip or hand edit produces', () => {
    const first = TOOL_NAMES[0];
    const second = TOOL_NAMES[1];
    // Previously a stored "false" was not === false, so it read as enabled.
    expect(coerceToolMap({ [first]: 'true', [second]: 'false' })).toEqual({
      [first]: true,
      [second]: false,
    });
  });

  it('normalises case and surrounding whitespace on string booleans', () => {
    const name = TOOL_NAMES[0];
    expect(coerceToolMap({ [name]: ' TRUE ' })).toEqual({ [name]: true });
    expect(coerceToolMap({ [name]: 'False' })).toEqual({ [name]: false });
  });

  it('drops keys that are not registered tools', () => {
    const name = TOOL_NAMES[0];
    // list_components was stored in Mongo but does not exist in the registry.
    const result = coerceToolMap({ [name]: true, list_components: true });
    expect(result).toEqual({ [name]: true });
    expect('list_components' in result).toBe(false);
  });

  it('drops unparseable values instead of guessing', () => {
    const name = TOOL_NAMES[0];
    expect(coerceToolMap({ [name]: 'yes' })).toEqual({});
    expect(coerceToolMap({ [name]: 1 })).toEqual({});
    expect(coerceToolMap({ [name]: null })).toEqual({});
    expect(coerceToolMap({ [name]: undefined })).toEqual({});
  });

  it('returns an empty map for non-object input', () => {
    expect(coerceToolMap(null)).toEqual({});
    expect(coerceToolMap(undefined)).toEqual({});
    expect(coerceToolMap('nope')).toEqual({});
    expect(coerceToolMap([])).toEqual({});
    expect(coerceToolMap(42)).toEqual({});
  });

  it('omits absent tools so fail-open stays an explicit, auditable default', () => {
    // An absent key means enabled. The map must not invent a stored entry.
    const result = coerceToolMap({ [TOOL_NAMES[0]]: true });
    expect(Object.keys(result)).toEqual([TOOL_NAMES[0]]);
  });

  it('reports unknown keys so stale config is visible', () => {
    expect(unknownToolKeys({ list_components: true })).toEqual(['list_components']);
    expect(unknownToolKeys({ [TOOL_NAMES[0]]: true })).toEqual([]);
    expect(unknownToolKeys(null)).toEqual([]);
  });

  it('round-trips every registered tool without loss', () => {
    const all = Object.fromEntries(TOOL_NAMES.map((n) => [n, true]));
    expect(Object.keys(coerceToolMap(all)).sort()).toEqual([...TOOL_NAMES].sort());
  });
});
