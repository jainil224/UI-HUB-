import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs, strFlag, boolFlag, numFlag } from '../src/args.js';
import { usage } from '../src/errors.js';

test('parseArgs: separated flags, boolean flags, short flags, positionals', () => {
  const { pos, flags } = parseArgs([
    'search',
    'pricing',
    '--json',
    '--category',
    'cursor',
    '--tags',
    'a,b',
    '--premium',
    '-o',
    'file.jsx',
  ]);
  assert.deepEqual(pos, ['search', 'pricing']);
  assert.equal(flags.json, true);
  assert.equal(flags.category, 'cursor');
  assert.equal(flags.tags, 'a,b');
  assert.equal(flags.premium, true);
  assert.equal(flags.o, 'file.jsx');
});

test('parseArgs: --flag=value form', () => {
  const { flags } = parseArgs(['search', '--kind=templates', '--free']);
  assert.equal(flags.kind, 'templates');
  assert.equal(flags.free, true);
});

test('parseArgs: "a -- b" stops flag parsing', () => {
  const { pos, flags } = parseArgs(['use', 'x', '--', '--weird']);
  assert.equal(flags.weird, undefined);
  assert.deepEqual(pos, ['use', 'x', '--weird']);
});

test('parseArgs: -h and -v', () => {
  assert.equal(parseArgs(['-h']).flags.help, true);
  assert.equal(parseArgs(['-v']).flags.version, true);
});

test('parseArgs: missing value for a flag throws usage error', () => {
  assert.throws(() => parseArgs(['--category']), (err: any) => err.code === 'USAGE_ERROR');
});

test('flag helpers', () => {
  const { flags } = parseArgs(['--kind', 'x', '--json', '--limit', '5']);
  assert.equal(strFlag(flags, 'kind'), 'x');
  assert.equal(strFlag(flags, 'nope'), undefined);
  assert.equal(boolFlag(flags, 'json'), true);
  assert.equal(boolFlag(flags, 'premium'), false);
  assert.equal(numFlag(flags, 'limit', 10), 5);
  assert.equal(numFlag(flags, 'missing', 10), 10);
  assert.throws(() => numFlag(flags, 'kind', 10), (err: any) => err.code === 'USAGE_ERROR');
});

test('usage() throws a CliError with exit code 2', () => {
  assert.throws(() => usage('boom'), (err: any) => err.code === 'USAGE_ERROR' && err.exitCode === 2);
});