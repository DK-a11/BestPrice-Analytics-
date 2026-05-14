import express from 'express';
import { getPriceHistoryByStore, getAvailableStores } from '../dataBaseHExtract.js';

const router = express.Router();

router.get('/analytics/history', async (req, res, next) => {
  try {
    // ✅ GET-запрос → параметры из req.query
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

    const data = await getPriceHistoryByStore({
      query: query.toLowerCase(),
      category,
      startDate,
      endDate,
      stores: stores && typeof stores === 'string' 
        ? stores.split(',').map(s => s.trim()) 
        : []
    });

    // ✅ Гарантия, что data — массив
    const resultData = Array.isArray(data) ? data : [];

    console.log(`📊 Analytics result for "${query}":`, resultData);
    res.json({
      success: true,
      count: resultData.length,
      data: resultData
    });

  } catch (error) {
    console.error('❌ Analytics route error:', error);
    next(error);
  }
});


export default router;