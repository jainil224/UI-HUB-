import { CliError, EXIT } from './errors.js';

interface ToolContentItem {
  type: string;
  text: string;
}

export interface ListedTool {
  name: string;
  description?: string;
}

/**
 * Minimal MCP Streamable HTTP client (JSON-RPC 2.0).
 * Speaks directly to the UI HUB MCP server, e.g. https://ui-hub-mcp.onrender.com/mcp.
 */
export class McpClient {
  private seq = 0;

  constructor(
    readonly endpoint: string,
    readonly apiKey?: string,
  ) {}

  async listTools(): Promise<{ tools: ListedTool[] }> {
    const result = await this.post('tools/list', {});
    return {
      tools: Array.isArray(result?.tools) ? (result.tools as ListedTool[]) : [],
    };
  }

  async callTool(name: string, args: Record<string, unknown> = {}): Promise<any> {
    const result = await this.post('tools/call', { name, arguments: args });
    return unwrapToolResult(result);
  }

  private async post(method: string, params: Record<string, unknown>): Promise<any> {
    const body = {
      jsonrpc: '2.0',
      id: ++this.seq,
      method,
      params,
    };
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    };
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;

    let res: Response;
    try {
      res = await fetch(this.endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
    } catch (err) {
      throw new CliError(
        'NETWORK_ERROR',
        `Could not reach the UI HUB MCP server at ${this.endpoint}. ${describeError(err)}`,
        EXIT.TOOL,
      );
    }

    if (res.status === 401 || res.status === 403) {
      throw authError(await readBodyText(res));
    }
    if (!res.ok) {
      const detail = await readBodyText(res);
      throw new CliError(
        'HTTP_ERROR',
        `Request to ${this.endpoint} failed with HTTP ${res.status}.${detail ? ` ${detail}` : ''}`,
        EXIT.TOOL,
      );
    }

    const payload = await parseBody(res);
    const json = payload;
    if (!json || typeof json !== 'object') {
      throw new CliError('BAD_RESPONSE', 'The server returned an unreadable MCP response.', EXIT.TOOL);
    }
    if (json.error) {
      const err = json.error as { code?: number; message?: string };
      if (err.code === -32001) throw authError(err.message ?? 'Unauthorized');
      throw new CliError('JSONRPC_ERROR', err.message ?? 'Unknown MCP error', EXIT.TOOL);
    }
    if (json.result === undefined) {
      throw new CliError('BAD_RESPONSE', 'The MCP response was missing a result.', EXIT.TOOL);
    }
    return json.result;
  }
}

function unwrapToolResult(result: unknown): any {
  const mcp = (result ?? {}) as { content?: ToolContentItem[]; isError?: boolean };
  const text = Array.isArray(mcp.content) ? mcp.content.map((c) => c.text || '').join('\n') : '';
  let data: any = text;
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (mcp.isError) {
    const obj = data && typeof data === 'object' ? data : {};
    const code = typeof obj.error === 'string' ? obj.error : 'TOOL_ERROR';
    const message =
      typeof obj.message === 'string'
        ? obj.message
        : typeof text === 'string' && text
          ? text
          : 'The tool failed to execute.';
    throw new CliError(code, message, EXIT.TOOL);
  }
  return data;
}

function authError(detail: string): CliError {
  const hint =
    'Check that your API key starts with uh_live_ and has not been revoked. Run "ui-hub login" to re-authenticate.';
  return new CliError(
    'AUTH_ERROR',
    `Authentication failed. ${hint}${detail ? ` Server said: ${truncate(detail)}` : ''}`,
    EXIT.AUTH,
  );
}

async function readBodyText(res: Response): Promise<string> {
  try {
    return truncate(await res.text());
  } catch {
    return '';
  }
}

async function parseBody(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function truncate(s: string, max = 300): string {
  return s.length > max ? s.slice(0, max) + '…' : s;
}

function describeError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}