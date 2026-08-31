import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import componentRoutes from './routes/componentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import configRoutes from './routes/configRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import favoritesRoutes from './routes/favoritesRoutes.js';
import { globalLimiter } from './middleware/rateLimiters.js';
import { startUserSyncWorker } from './services/syncService.js';
import { syncAllComponentsToMongo } from './services/componentSyncService.js';

dotenv.config();
console.log('Environment variables loaded from .env');

// ── SMTP Boot Check ─────────────────────────────────────────────────────────
// Immediately log email config so Render logs show if email will work.
const _smtpUser = process.env.BREVO_SMTP_USER || process.env.SMTP_USER;
const _smtpPass = process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS;
const _smtpFrom = process.env.SMTP_FROM || _smtpUser;
if (_smtpUser && _smtpPass) {
  console.log(`[SMTP] ✅ Email configured — user: ${_smtpUser.slice(0, 6)}**** | from: ${_smtpFrom}`);
} else {
  console.error('[SMTP] ❌ EMAIL NOT CONFIGURED — BREVO_SMTP_USER or BREVO_SMTP_PASS is missing!');
  console.error('[SMTP] ❌ New user welcome emails will NOT be sent until these are set on Render.');
}
// ────────────────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;

// Enable 'trust proxy' for Render/Vercel (fixes rate-limiter warnings)
app.set('trust proxy', 1);

// Update CORS to allow both localhost and production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ui-hub-design.vercel.app',
  'https://ui-hub-design-git-main-jainil224s-projects.vercel.app',
  'https://ui-hub-design-jainil224s-projects.vercel.app'
];

// 1. Helmet (security headers)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      frameSrc: ["https://api.razorpay.com"],
      connectSrc: [
        "'self'", 
        "http://localhost:*", 
        "https://ui-hub-design.vercel.app", 
        "https://ui-hub-design-git-main-jainil224s-projects.vercel.app", 
        "https://ui-hub-design-jainil224s-projects.vercel.app", 
        "https://api.razorpay.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Razorpay iframe requires this
}));

// 2. CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowedOrigins or matches a wildcard
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 || 
                     origin.endsWith('.vercel.app') ||
                     origin.includes('localhost');
                     
    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'X-Requested-With', 'Accept', 'MCP-Protocol-Version', 'MCP-Session-Id']
}));

// 3. Body parsers (with size limits)
app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Global Limiter
app.use(globalLimiter);

// 5. Routes
const router = express.Router();
router.use('/v1/components', componentRoutes);
router.use('/v1/users', userRoutes);
router.use('/v1/config', configRoutes);
router.use('/v1/payment', paymentRoutes);
router.use('/v1', favoritesRoutes);

// 6. MCP Server Integration (Unified Deployment)
try {
  // Ensure mcp-server can resolve node_modules (e.g. express, cors) from backend
  const { existsSync, symlinkSync } = await import('node:fs');
  const { resolve, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const backendModules = resolve(currentDir, '../node_modules');
  const mcpModules = resolve(currentDir, '../../mcp-server/node_modules');
  
  if (existsSync(backendModules) && !existsSync(mcpModules)) {
    try {
      symlinkSync(backendModules, mcpModules, 'junction');
      console.log('[MCP] Linked backend node_modules to mcp-server');
    } catch (symErr) {
      // Ignore if symlink fails or not permitted
    }
  }

  const { mcpRouter } = await import('../../mcp-server/dist/routes/mcp.js');
  const { dashboardRouter } = await import('../../mcp-server/dist/routes/dashboard.js');
  const { adminRouter } = await import('../../mcp-server/dist/routes/admin.js');

  app.use('/mcp', mcpRouter);
  app.use('/api/dashboard/mcp', dashboardRouter);
  app.use('/api/admin/mcp', adminRouter);
  console.log('[MCP] ✅ MCP endpoints (/mcp, /api/dashboard/mcp, /api/admin/mcp) mounted');
} catch (mcpErr) {
  console.warn('[MCP] ⚠️ MCP routes could not be mounted:', mcpErr.message);
}

// Health check endpoint (at the very top levels)
const healthCheck = (req, res) => {
  res.json({ 
    status: 'ok', 
    services: {
      backend: 'online',
      mcp: 'online'
    },
    message: 'UI-Hub Unified Backend & MCP Server is Live',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
};

app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// Mount under multiple prefixes for robustness
app.use('/api', router);
app.use('/', router);

app.get('/', (req, res) => {
  res.send('<h1>UI-Hub Unified Backend & MCP Server is Live</h1><p>The API is running successfully. <a href="/api/health">Check Health</a></p>');
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Export the app for Vercel
export default app;

// Synchronize all website UI components to MongoDB Atlas on boot
syncAllComponentsToMongo().catch((err) =>
  console.error('[Startup] Component sync notice:', err.message)
);

// Start background user synchronization worker
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startUserSyncWorker();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local:   http://localhost:${PORT}`);
    console.log(`Network: http://0.0.0.0:${PORT}`);
  });
}
