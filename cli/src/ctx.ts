import type { McpClient } from './mcp.js';

export interface Ctx {
  client: McpClient;
  json: boolean;
  endpoint: string;
  apiKey?: string;
}