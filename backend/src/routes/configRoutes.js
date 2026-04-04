import express from 'express';
import { getFirebaseConfig, getRazorpayKey } from '../services/configService.js';

const router = express.Router();

/**
 * @route GET /api/v1/config/firebase
 * @desc Get public Firebase configuration
 * @access Public (as these are intended for client-side use)
 */
router.get('/firebase', (req, res) => {
    try {
        const config = getFirebaseConfig();
        res.json(config);
    } catch (error) {
        console.error('Error in config route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route GET /api/v1/config/razorpay-key
 * @desc Get public Razorpay Key ID
 * @access Public
 */
router.get('/razorpay-key', (req, res) => {
    try {
        const config = getRazorpayKey();
        res.json(config);
    } catch (error) {
        console.error('Error in config route (razorpay):', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
