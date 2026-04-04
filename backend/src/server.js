import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import componentRoutes from './routes/componentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import configRoutes from './routes/configRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();
console.log('Environment variables loaded from .env');

const app = express();
const PORT = process.env.PORT || 5000;

// Update CORS to allow both localhost and production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ui-hub-design.vercel.app',
  'https://ui-hub-design-git-main-jainil224s-projects.vercel.app',
  'https://ui-hub-design-jainil224s-projects.vercel.app'
];

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
      return callback(null, true); // Fallback to allow (temporary for debugging if needed) or use strict
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
const router = express.Router();
router.use('/v1/components', componentRoutes);
router.use('/v1/users', userRoutes);
router.use('/v1/config', configRoutes);
router.use('/v1/payment', paymentRoutes);

// Health check endpoint (at the very top levels)
const healthCheck = (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'UI-Hub Backend is Live',
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
  res.send('<h1>UI-Hub Backend is Live</h1><p>The API is running successfully. <a href="/api/health">Check Health</a></p>');
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Export the app for Vercel
export default app;

// Only listen if running directly (not via Vercel serverless)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local:   http://localhost:${PORT}`);
    console.log(`Network: http://0.0.0.0:${PORT}`);
  });
}

