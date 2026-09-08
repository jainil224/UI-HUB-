import { CliError, EXIT } from './errors.js';
/**
 * Minimal MCP Streamable HTTP client (JSON-RPC 2.0).
 * Speaks directly to the UI HUB MCP server, e.g. https://ui-hub-mcp.onrender.com/mcp.
 */
export class McpClient {
    endpoint;
    apiKey;
    seq = 0;
    constructor(endpoint, apiKey) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
    }
    async listTools() {
        const result = await this.post('tools/list', {});
        return {
            tools: Array.isArray(result?.tools) ? result.tools : [],
        };
    }
    async callTool(name, args = {}) {
        const result = await this.post('tools/call', { name, arguments: args });
        return unwrapToolResult(result);
    }
    async post(method, params) {
        const body = {
            jsonrpc: '2.0',
            id: ++this.seq,
            method,
            params,
        };
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
        };
        if (this.apiKey)
            headers.Authorization = `Bearer ${this.apiKey}`;
        let res;
        try {
            res = await fetch(this.endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
        }
        catch (err) {
            throw new CliError('NETWORK_ERROR', `Could not reach the UI HUB MCP server at ${this.endpoint}. ${describeError(err)}`, EXIT.TOOL);
        }
        if (res.status === 401 || res.status === 403) {
            throw authError(await readBodyText(res));
        }
        if (!res.ok) {
            const detail = await readBodyText(res);
            throw new CliError('HTTP_ERROR', `Request to ${this.endpoint} failed with HTTP ${res.status}.${detail ? ` ${detail}` : ''}`, EXIT.TOOL);
        }
        const payload = await parseBody(res);
        const json = payload;
        if (!json || typeof json !== 'object') {
            throw new CliError('BAD_RESPONSE', 'The server returned an unreadable MCP response.', EXIT.TOOL);
        }
        if (json.error) {
            const err = json.error;
            if (err.code === -32001)
                throw authError(err.message ?? 'Unauthorized');
            throw new CliError('JSONRPC_ERROR', err.message ?? 'Unknown MCP error', EXIT.TOOL);
        }
        if (json.result === undefined) {
            throw new CliError('BAD_RESPONSE', 'The MCP response was missing a result.', EXIT.TOOL);
        }
        return json.result;
    }
}
function unwrapToolResult(result) {
    const mcp = (result ?? {});
    const text = Array.isArray(mcp.content) ? mcp.content.map((c) => c.text || '').join('\n') : '';
    let data = text;
    if (text.trim()) {
        try {
            data = JSON.parse(text);
        }
        catch {
            data = text;
        }
    }
    if (mcp.isError) {
        const obj = data && typeof data === 'object' ? data : {};
        const code = typeof obj.error === 'string' ? obj.error : 'TOOL_ERROR';
        const message = typeof obj.message === 'string'
            ? obj.message
            : typeof text === 'string' && text
                ? text
                : 'The tool failed to execute.';
        throw new CliError(code, message, EXIT.TOOL);
    }
    return data;
}
function authError(detail) {
    const hint = 'Check that your API key starts with uh_live_ and has not been revoked. Run "ui-hub login" to re-authenticate.';
    return new CliError('AUTH_ERROR', `Authentication failed. ${hint}${detail ? ` Server said: ${truncate(detail)}` : ''}`, EXIT.AUTH);
}
async function readBodyText(res) {
    try {
        return truncate(await res.text());
    }
    catch {
        return '';
    }
}
async function parseBody(res) {
    const text = await res.text();
    if (!text)
        return null;
    try {
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
function truncate(s, max = 300) {
    return s.length > max ? s.slice(0, max) + '…' : s;
}
function describeError(err) {
    return err instanceof Error ? err.message : String(err);
}
