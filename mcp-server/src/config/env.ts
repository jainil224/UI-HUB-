import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  mcpServerUrl: string;
  apiKeyPrefix: string;
  rateLimitFree: number;
  rateLimitPro: number;
  firebase: {
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
  };
  redisUrl?: string;
  allowedOrigins: string[];
  adminEmails: string[];
}

function parseList(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const config: AppConfig = {
  port: parseInt(process.env.PORT || process.env.MCP_PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mcpServerUrl: process.env.MCP_SERVER_URL || 'https://api.ui-hub-design.com',
  apiKeyPrefix: process.env.MCP_API_KEY_PREFIX || 'uh_live_',
  rateLimitFree: parseInt(process.env.MCP_RATE_LIMIT_FREE || '100', 10),
  rateLimitPro: parseInt(process.env.MCP_RATE_LIMIT_PRO || '10000', 10),
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  redisUrl: process.env.REDIS_URL,
  allowedOrigins: parseList(process.env.MCP_ALLOWED_ORIGINS),
  adminEmails: parseList(process.env.MCP_ADMIN_EMAILS),
};

export default config;
