const USE_COLOR = process.stdout.isTTY === true;

function wrap(code: number, s: string): string {
  return USE_COLOR ? `\u001b[${code}m${s}\u001b[0m` : s;
}

export const bold = (s: string) => wrap(1, s);
export const dim = (s: string) => wrap(2, s);
export const green = (s: string) => wrap(32, s);
export const yellow = (s: string) => wrap(33, s);
export const red = (s: string) => wrap(31, s);
export const cyan = (s: string) => wrap(36, s);

export function out(s = ''): void {
  console.log(s);
}

export function printJson(data: unknown): void {
  out(JSON.stringify(data, null, 2));
}

function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[\d+m/g, '');
}

export function printTable(rows: Array<Array<string | null | undefined>>, headers?: string[]): void {
  const data: Array<Array<{ raw: string; text: string }>> = [];
  if (headers) data.push(headers.map((h) => ({ raw: bold(h), text: h })));
  for (const row of rows) {
    data.push(
      row.map((cell) => {
        const raw = cell ?? '';
        return { raw, text: stripAnsi(raw) };
      }),
    );
  }
  if (rows.length === 0 || data.length === 0) return;

  const cols = Math.max(...data.map((r) => r.length));
  const widths: number[] = new Array(cols).fill(0);
  for (const row of data) {
    row.forEach((cell, i) => {
      if (cell.text.length > (widths[i] ?? 0)) widths[i] = cell.text.length;
    });
  }
  for (const row of data) {
    const line = row
      .map((cell, i) => {
        const pad = ' '.repeat((widths[i] ?? 0) - cell.text.length);
        return i === row.length - 1 ? cell.raw : cell.raw + pad + '  ';
      })
      .join('');
    out(line);
  }
}

export function accessLabel(access: string | undefined, isPremium: boolean | undefined): string {
  if (access === 'free') return green('free');
  if (access === 'premium-available') return cyan('premium');
  if (access === 'premium-required') return yellow('premium (locked)');
  return isPremium ? yellow('premium') : green('free');
}

export function printComponents(components: any[]): void {
  if (!components || components.length === 0) {
    out(dim('No components found.'));
    return;
  }
  printTable(
    components.map((c) => [
      String(c.name ?? c.title ?? c.id ?? ''),
      String(c.id ?? ''),
      String(c.category ?? ''),
      accessLabel(c.access, c.isPremium),
    ]),
    ['NAME', 'ID', 'CATEGORY', 'ACCESS'],
  );
}

export function printSummaries(items: any[], kind: string): void {
  if (!items || items.length === 0) {
    out(dim(`No ${kind} found.`));
    return;
  }
  printTable(
    items.map((t) => [
      String(t.name ?? t.title ?? t.id ?? ''),
      String(t.id ?? ''),
      String(t.category ?? ''),
      accessLabel(undefined, t.isPremium ?? t.isPro),
    ]),
    ['NAME', 'ID', 'CATEGORY', 'ACCESS'],
  );
}

export function renderKV(key: string, value: string | undefined): void {
  if (value === undefined || value === '') return;
  out(`${dim(key.length > 12 ? key.slice(0, 12) : key.padEnd(12))}${value}`);
}