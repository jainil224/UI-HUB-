import { Request } from 'express';

export type PlanTier = 'FREE' | 'PRO' | 'ELITE' | 'ADMIN';

export interface McpUser {
  userId: string;
  email: string;
  name?: string;
  tier: PlanTier;
  keyId: string;
  keyPrefix: string;
  keyStatus: 'active' | 'revoked' | 'expired';
}

export interface ApiKeyRecord {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  created_at: Date | number;
  last_used_at?: Date | number | null;
  expires_at?: Date | number | null;
  revoked_at?: Date | number | null;
  status: 'active' | 'revoked' | 'expired';
}

export interface ComponentSummary {
  id: string;
  name: string;
  description?: string;
  category: string;
  framework: string;
  styling: string;
  tags: string[];
  previewUrl?: string;
  isPremium: boolean;
}

export interface ComponentDetail extends ComponentSummary {
  code?: string;
  dependencies: string[];
  installation?: string;
  usageExample?: string;
}

export interface TemplateSummary {
  id: string;
  name: string;
  description?: string;
  category: string;
  framework: string;
  isPremium: boolean;
  tags: string[];
}

export interface TemplateDetail extends TemplateSummary {
  code?: string;
  dependencies: string[];
  structure?: string[];
}

export interface AnimationSummary {
  id: string;
  name: string;
  description?: string;
  category: string;
  framework: string;
  isPremium: boolean;
  tags: string[];
}

export interface AnimationDetail extends AnimationSummary {
  code?: string;
  dependencies: string[];
  usageExample?: string;
}

export interface McpRequestContext {
  user?: McpUser;
  ip?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: McpUser;
  apiKeyId?: string;
}

export interface MCPError {
  error: string;
  message: string;
  details?: unknown;
}

export type McpToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

export interface McpTool {
  name: string;
  description: string;
  inputSchema: object;
  handler: (args: Record<string, unknown>, context: McpRequestContext) => Promise<unknown>;
}
