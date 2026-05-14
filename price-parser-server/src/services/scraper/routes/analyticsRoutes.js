import express from 'express';
import { getProductsByQuery } from '../dataBaseExtract.js';

const router = express.Router();

/**
 * @route   GET /api/analytics/products
 * @desc    Получить агрегированные данные о товарах по названию (query)
 * @access  Public
 * @query   {String} query - Обязательный параметр: название товара для поиска
 * 
 * @example GET /api/analytics/products?query=iphone
 */
router.get('/analytics/products', async (req, res) => {
  try {
    const { query } = req.query;
    
    // Валидация входного параметра
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: query',
        example: '/api/analytics/products?query=iphone'
      });
    }

    const data = await getProductsByQuery(query.trim());
    
    return res.status(200).json({
      success: true,
      query,
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