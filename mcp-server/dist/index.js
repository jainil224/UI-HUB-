import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/env.js';
import { configService } from './config/configService.js';
import { mcpRouter } from './routes/mcp.js';
import { dashboardRouter } from './routes/dashboard.js';
import { adminRouter } from './routes/admin.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { analyticsService } from './services/analyticsService.js';
const app = express();
const PORT = config.port;
// Security headers
app.use(helmet({ crossOriginEmbedderPolicy: false }));
// CORS with dynamic origin checking
app.use(cors({
    origin: function (origin, callback) {
        // Allow no-origin requests (server-to-server, curl, MCP clients)
        if (!origin)
            return callback(null, true);
        const allowed = config.allowedOrigins.some((o) => origin === o || origin.includes('localhost'));
        if (allowed)
            return callback(null, true);
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'MCP-Protocol-Version', 'MCP-Session-Id'],
}));
// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
// Request logging (without secrets)
app.use(async (req, res, next) => {
    try {
        const cfg = await configService.get();
        if (cfg.loggingEnabled) {
            const auth = req.headers.authorization;
            // Log only key prefix, never the full key
            const maskedAuth = auth ? `${auth.slice(0, 20)}...` : 'none';
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} auth=${maskedAuth}`);
        }
    }
    catch {
        // never block traffic because of logging
    }
    next();
});
// Routes
app.use('/mcp', mcpRouter);
app.use('/api/dashboard/mcp', dashboardRouter);
app.use('/api/admin/mcp', adminRouter);
// Health endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ui-hub-mcp' });
});
app.get('/', (req, res) => {
    res.json({
        service: 'ui-hub-mcp',
        status: 'ok',
        endpoints: {
            mcp: '/mcp',
            health: '/health',
            dashboard: '/api/dashboard/mcp',
        },
    });
});
// 404 + error handling
app.use(notFoundHandler);
app.use(errorHandler);
// Start server only when run directly (not when imported by tests or as a module)
// Detects whether index.ts is the entry point by comparing process.argv[1]
const isMain = process.argv[1] &&
    (process.argv[1].replace(/\\/g, '/').endsWith('dist/index.js') ||
        process.argv[1].replace(/\\/g, '/').endsWith('src/index.ts'));
let started = null;
if (isMain) {
    started = app.listen(PORT, '0.0.0.0', () => {
        console.log(`[MCP Server] Running on http://0.0.0.0:${PORT}`);
        console.log(`[MCP Server] Health: http://localhost:${PORT}/health`);
        console.log(`[MCP Server] MCP endpoint: ${config.mcpServerUrl}/mcp`);
    });
    const shutdown = (signal) => {
        console.log(`[MCP Server] ${signal} received — flushing analytics before exit...`);
        Promise.race([analyticsService.flushNow(), new Promise((r) => setTimeout(r, 3000))])
            .catch(() => { })
            .finally(() => process.exit(0));
        setTimeout(() => process.exit(0), 4000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
export { app, started };
//# sourceMappingURL=index.js.map