import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { checkProStatus } from '../services/userService.js';

const router = express.Router();

/**
 * @route GET /api/v1/users/status
 * @desc Get current user's Pro status
 * @access Private
 */
router.get('/status', verifyToken, async (req, res) => {
    try {
        const email = req.user.email;
        const isPro = await checkProStatus(email);
        
        res.json({
            isPro,
            email: req.user.email,
            uid: req.user.uid
        });
    } catch (error) {
        console.error('Error in user status route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
