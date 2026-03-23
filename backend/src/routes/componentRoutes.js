import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { generateVibePrompt, getComponentSource } from '../services/promptService.js';

const router = express.Router();

/**
 * Endpoint to get the AI prompt for a component.
 * Protected by Firebase ID Token.
 */
router.get('/:id/prompt/:system', verifyToken, async (req, res) => {
  const { id, system } = req.params;
  
  try {
    const prompt = await generateVibePrompt(id, system);
    res.json({ prompt });
  } catch (error) {
    console.error(`Error generating prompt for ${id}:`, error);
    res.status(500).json({ error: 'Failed to generate prompt' });
  }
});

/**
 * Endpoint to get the source code for a component.
 * Protected by Firebase ID Token.
 */
router.get('/:id/source', verifyToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const source = await getComponentSource(id);
    if (!source) {
      return res.status(404).json({ error: 'Source code not found' });
    }
    res.json({ source });
  } catch (error) {
    console.error(`Error getting source for ${id}:`, error);
    res.status(500).json({ error: 'Failed to get source code' });
  }
});

export default router;
