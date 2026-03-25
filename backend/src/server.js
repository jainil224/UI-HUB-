import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import componentRoutes from './routes/componentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import configRoutes from './routes/configRoutes.js';

dotenv.config();
console.log('Environment variables loaded from .env');

const app = express();
const PORT = process.env.PORT || 5000;

// Update CORS to allow both localhost and production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ui-hub-design.vercel.app',
  'https://ui-hub-design-git-main-jainil224s-projects.vercel.app' // Vercel preview branch example
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 || 
                     origin.endsWith('.vercel.app') ||
                     origin.includes('localhost');
                     
    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
const router = express.Router();
router.use('/v1/components', componentRoutes);
router.use('/v1/users', userRoutes);
router.use('/v1/config', configRoutes);

// Mount under multiple prefixes for robustness (Vercel vs Local)
app.use('/api', router);
app.use('/', router);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
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

