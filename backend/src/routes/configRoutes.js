import express from 'express';
import { getFirebaseConfig, getRazorpayKey } from '../services/configService.js';
import { configLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

router.get('/firebase', configLimiter, (req, res) => {
    try {
        const config = getFirebaseConfig();
        res.json(config);
    } catch (error) {
        console.error('Error in config route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/razorpay-key', configLimiter, (req, res) => {
    try {
        const config = getRazorpayKey();
        res.json(config);
    } catch (error) {
        console.error('Error in config route (razorpay):', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
