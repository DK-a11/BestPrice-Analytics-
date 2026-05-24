import express from 'express';
import { getPriceInsights, getStoreComparison } from '../dataBaseIExtract.js';

const router = express.Router();

/**
 * @route   GET /api/analytics/insights?query=iphone&stores=alser,kaspi
 * @desc    Получение инсайтов по товару с фильтрацией по магазинам
 * @access  Public
 */
router.get('/analytics/insights', async (req, res, next) => {
  try {
    const {
      query,
      category,
      stores,
      startDate,
      endDate
    } = req.query;

    // 🔐 Валидация обязательного параметра
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "query" is required',
        example: '/api/analytics/insights?query=iphone'
      });
    }

    // 🔥 Надёжный парсинг параметра stores (как в comparison)
    let storesArray = [];
    if (stores) {
      storesArray = Array.isArray(stores)
        ? stores.map(s => String(s).trim().toLowerCase())
        : stores.split(',').map(s => s.trim().toLowerCase());
      storesArray = storesArray.filter(Boolean);
    }

    console.log('📥 Insights route received:', { 
      query, 
      storesRaw: stores, 
      parsedStores: storesArray,
      isFilterActive: storesArray.length > 0 
    });

    const insights = await getPriceInsights({
      query: query.toLowerCase(),
      category,
      stores: storesArray,
      startDate,
      endDate
    });

    // 📭 Если данных нет
    if (!insights) {
      return res.status(404).json({
        success: false,
        message: 'No data found for the specified parameters',
        data: null
      });
    }

    console.log('✅ Insights retrieved:', insights);
    
    res.json({
      success: true,
      data: insights,
      meta: { storesFiltered: storesArray.length > 0 ? storesArray : 'all' }
    });

  } catch (error) {
    console.error('❌ Insights route error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/analytics/insights/comparison?query=iphone&stores=alser,kaspi
 * @desc    Сравнение цен по всем магазинам с фильтрацией
 * @access  Public
 */
router.get('/insights/comparison', async (req, res, next) => {
  try {
    const { query, category, stores } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "query" is required'
      });
    }

    // 🔥 Парсинг stores для этого эндпоинта тоже
    let storesArray = [];
    if (stores) {
      storesArray = Array.isArray(stores)
        ? stores.map(s => String(s).trim().toLowerCase())
        : stores.split(',').map(s => s.trim().toLowerCase());
      storesArray = storesArray.filter(Boolean);
    }

    const comparison = await getStoreComparison({
      query: query.toLowerCase(),
      category,
      stores: storesArray  // 🔥 Передаём фильтр в сервис
    });

    res.json({
      success: true,
      count: comparison.length,
      data: comparison,
      meta: { storesFiltered: storesArray.length > 0 ? storesArray : 'all' }
    });

  } catch (error) {
    console.error('❌ Comparison route error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/analytics/insights/quick?query=iphone
 * @desc    Быстрый ответ только с лучшей ценой (для превью/виджетов)
 * @access  Public
 */
router.get('/insights/quick', async (req, res, next) => {
  try {
    const { query, stores } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "query" is required'
      });
    }

    // Парсинг stores для quick-эндпоинта
    let storesArray = [];
    if (stores) {
      storesArray = Array.isArray(stores)
        ? stores.map(s => String(s).trim().toLowerCase())
        : stores.split(',').map(s => s.trim().toLowerCase());
      storesArray = storesArray.filter(Boolean);
    }

    const insights = await getPriceInsights({ 
      query: query.toLowerCase(),
      stores: storesArray 
    });

    if (!insights) {
      return res.status(404).json({
        success: false,
        message: 'No data found',
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        averagePrice: insights.averagePrice,
        bestPrice: insights.bestPrice,
        priceChange: insights.priceChange
      },
      meta: { storesFiltered: storesArray.length > 0 ? storesArray : 'all' }
    });

  } catch (error) {
    console.error('❌ Quick insights error:', error);
    next(error);
  }
});

// 🛡️ Global error handler
router.use((err, req, res, next) => {
  console.error('❌ Analytics Insight Route Error:', err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack
    } : undefined
  });
});

export default router;