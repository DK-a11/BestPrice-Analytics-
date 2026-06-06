import express from 'express';
import { getPriceHistoryByStore, getAvailableStores } from '../dataBaseHExtract.js';

const router = express.Router();

router.get('/analytics/history', async (req, res, next) => {
  try {
    const {
      query,
      category,
      startDate,
      endDate,
      stores
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "query" is required'
      });
    }


    let storesArray = [];
    if (stores) {
      storesArray = Array.isArray(stores)
        ? stores.map(s => String(s).trim().toLowerCase())
        : stores.split(',').map(s => s.trim().toLowerCase());
      storesArray = storesArray.filter(Boolean);
    }

    console.log('📥 History route received:', {
      query,
      category,
      startDate,
      endDate,
      storesRaw: stores,
      parsedStores: storesArray,
      isFilterActive: storesArray.length > 0
    });

    const data = await getPriceHistoryByStore({
      query: query.toLowerCase(),
      category,
      startDate,
      endDate,
      stores: storesArray
    });

    const resultData = Array.isArray(data) ? data : [];

    console.log(`📊 History result for "${query}": ${resultData.length} entries${storesArray.length > 0 ? ` (stores: ${storesArray.join(',')})` : ''}`);
    
    res.json({
      success: true,
      count: resultData.length,
      data: resultData,
      meta: { storesFiltered: storesArray.length > 0 ? storesArray : 'all' }
    });

  } catch (error) {
    console.error('❌ Analytics history route error:', error);
    next(error);
  }
});

export default router;