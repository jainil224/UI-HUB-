import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { McpClient } from '../mcp.js';

/** Best-effort secondary fetch: returns undefined if the tool errors (e.g. missing metadata). */
export async function safeFetch<T = any>(
  client: McpClient,
  name: string,
  args: Record<string, unknown> = {},
): Promise<T | undefined> {
  return client.callTool(name, args).catch(() => undefined);
}

export function writeCodeFile(filePath: string, code: string): void {
  const abs = resolve(filePath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, code.endsWith('\n') ? code : code + '\n');
}

export function sanitizeName(name: string): string {
  const cleaned = name
    .replace(/[^A-Za-z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'Component';
}

export function componentFileName(id: string, name: string | undefined): string {
  return `${sanitizeName(name || id)}.tsx`;
}

export function joinDir(dir: string, fileName: string): string {
  return `${dir.replace(/[\\/]+$/, '')}/${fileName}`;
}

export function resolveOutputPath(flagValue: string, id: string, name: string | undefined): string {
  if (flagValue.endsWith('/') || flagValue.endsWith('\\')) {
    return joinDir(flagValue, componentFileName(id, name));
  }
  return flagValue;
}

export function printDepsNote(deps: unknown): void {
  const list = Array.isArray(deps) ? deps : [];
  if (list.length === 0) return;
  console.error(`dependencies: ${list.join(' ')}`);
}