import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessLabel, bold, dim, green, printComponents, printJson, printSummaries, printTable, yellow } from '../src/output.js';

function captureLog(fn: () => void): string[] {
  const lines: string[] = [];
  const orig = console.log;
  console.log = (...args: unknown[]) => lines.push(args.map(String).join(' '));
  try {
    fn();
  } finally {
    console.log = orig;
  }
  return lines;
}

test('colors are plain when stdout is not a TTY', () => {
  // Tests run non-interactively so USE_COLOR is false.
  assert.equal(green('ok'), 'ok');
  assert.equal(yellow('p'), 'p');
  assert.equal(dim('d'), 'd');
  assert.equal(bold('b'), 'b');
});

test('printTable aligns columns and writes a header', () => {
  const lines = captureLog(() => printTable([['a', 'bbb'], ['ccc', 'd']], ['H1', 'H2']));
  assert.deepEqual(lines, ['H1   H2', 'a    bbb', 'ccc  d']);
});

test('accessLabel maps access notes', () => {
  assert.equal(accessLabel('free', false), 'free');
  assert.equal(accessLabel('premium-available', true), 'premium');
  assert.match(accessLabel('premium-required', true), /premium/);
  assert.equal(accessLabel(undefined, false), 'free');
  assert.match(accessLabel(undefined, true), /premium/);
});

test('printComponents and printSummaries print records', () => {
  const comp = captureLog(() => printComponents([{ id: 'x', name: 'X', category: 'cursor', access: 'free' }]));
  assert.ok(comp.some((l) => l.includes('X')));
  const templates = captureLog(() => printSummaries([{ id: 't-1', name: 'Tpl', category: '3d', isPremium: true }], 'templates'));
  assert.ok(templates.some((l) => l.includes('Tpl')));
  const empty = captureLog(() => printSummaries([], 'templates'));
  assert.ok(empty.some((l) => l.includes('No templates')));
});

test('printJson writes pretty JSON', () => {
  const lines = captureLog(() => printJson({ count: 2 }));
  assert.equal(lines[0], JSON.stringify({ count: 2 }, null, 2));
});

test('printTable with no rows prints nothing', () => {
  const lines = captureLog(() => printTable([], ['A']));
  assert.deepEqual(lines, []);
});