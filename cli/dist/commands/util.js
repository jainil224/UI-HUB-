import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
/** Best-effort secondary fetch: returns undefined if the tool errors (e.g. missing metadata). */
export async function safeFetch(client, name, args = {}) {
    return client.callTool(name, args).catch(() => undefined);
}
export function writeCodeFile(filePath, code) {
    const abs = resolve(filePath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, code.endsWith('\n') ? code : code + '\n');
}
export function sanitizeName(name) {
    const cleaned = name
        .replace(/[^A-Za-z0-9.-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return cleaned || 'Component';
}
export function componentFileName(id, name) {
    return `${sanitizeName(name || id)}.tsx`;
}
export function joinDir(dir, fileName) {
    return `${dir.replace(/[\\/]+$/, '')}/${fileName}`;
}
export function resolveOutputPath(flagValue, id, name) {
    if (flagValue.endsWith('/') || flagValue.endsWith('\\')) {
        return joinDir(flagValue, componentFileName(id, name));
    }
    return flagValue;
}
export function printDepsNote(deps) {
    const list = Array.isArray(deps) ? deps : [];
    if (list.length === 0)
        return;
    console.error(`dependencies: ${list.join(' ')}`);
}
