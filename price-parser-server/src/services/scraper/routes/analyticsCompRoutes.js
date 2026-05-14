import express from 'express';
import { getItemsByTitle } from '../dataBaseСExtract.js';

const router = express.Router();

router.get('/analytics/comparison', async (req, res) => {
    try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Parameter "query" is required' });
    }

    //const allResults = [];

   
    const resultExtract = await getItemsByTitle(query);


    res.status(200).json({ success: true, data: resultExtract });
    
  } catch (error) {
    console.error('❌ Error in store-comparison:', error);
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
});

export default router;