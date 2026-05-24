import express from 'express';
import { getItemsByTitle } from '../dataBaseСExtract.js';

const router = express.Router();

router.get('/analytics/comparison', async (req, res) => {
  try {
    const { query, stores } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Parameter "query" is required' });
    }

    // 🔥 Надёжный парсинг массива магазинов
    let storesArray = [];
    if (stores) {
      storesArray = Array.isArray(stores)
        ? stores.map(s => String(s).trim().toLowerCase())
        : stores.split(',').map(s => s.trim().toLowerCase());
      storesArray = storesArray.filter(Boolean);
    }

    console.log('📥 Route received:', { 
      query, 
      storesRaw: stores, 
      parsedStores: storesArray,
      isFilterActive: storesArray.length > 0 
    });

    const resultExtract = await getItemsByTitle(query, { stores: storesArray });

    res.status(200).json({ 
      success: true, 
      data: resultExtract,
      meta: { storesFiltered: storesArray.length > 0 ? storesArray : 'all' }
    });
    
  } catch (error) {
    console.error('❌ Error in /analytics/comparison:', error);
    res.status(500).json({ error: 'Failed to fetch comparison data', message: error.message });
  }
});

export default router;