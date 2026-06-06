import express from 'express';
import { getProductsByQuery } from '../dataBaseExtract.js';

const router = express.Router();


router.get('/analytics/products', async (req, res) => {
  try {
    const { query, stores } = req.query;
    
    // Валидация обязательного параметра
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: query',
        example: '/api/analytics/products?query=iphone'
      });
    }

    let storesArray = [];
    if (stores) {
      storesArray = Array.isArray(stores)
        ? stores.map(s => String(s).trim().toLowerCase())
        : stores.split(',').map(s => s.trim().toLowerCase());
      storesArray = storesArray.filter(Boolean);
    }

    console.log('📥 [products] received:', { 
      query, 
      storesRaw: stores, 
      parsedStores: storesArray,
      isFilterActive: storesArray.length > 0 
    });

    // Передаём stores в сервисную функцию
    const data = await getProductsByQuery(query.trim(), { stores: storesArray });
    console.log("[products] fetched data:", data);
    
    return res.status(200).json({
      success: true,
      query,
      storesFiltered: storesArray.length > 0 ? storesArray : 'all',
      count: data.length,
      data
    });
    
  } catch (error) {
    console.error('[analyticsRoutes] GET /products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching product data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;