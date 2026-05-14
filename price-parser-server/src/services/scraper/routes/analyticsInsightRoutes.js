import express from 'express';
import { getPriceInsights, getStoreComparison } from '../dataBaseIExtract.js';

const router = express.Router();

/**
 * @route   GET /api/analytics/insights?query=iphone&category=electronics
 * @desc    Получение инсайтов по товару: средняя цена, лучшее предложение, рекомендация
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

    // 🔄 Парсинг параметра stores из строки в массив
    const storesArray = stores && typeof stores === 'string'
      ? stores.split(',').map(s => s.trim())
      : [];

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
    // ✅ Успешный ответ
    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('❌ Insights route error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/analytics/insights/comparison?query=iphone
 * @desc    Сравнение цен по всем магазинам (для таблицы/графика)
 * @access  Public
 */
router.get('/insights/comparison', async (req, res, next) => {
  try {
    const { query, category } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "query" is required'
      });
    }

    const comparison = await getStoreComparison({
      query: query.toLowerCase(),
      category
    });

    res.json({
      success: true,
      count: comparison.length,
      data: comparison
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
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "query" is required'
      });
    }

    const insights = await getPriceInsights({ query: query.toLowerCase() });

    if (!insights) {
      return res.status(404).json({
        success: false,
        message: 'No data found',
        data: null
      });
    }

    // 🎯 Возвращаем только ключевые поля для быстрого отображения
    res.json({
      success: true,
      data: {
        averagePrice: insights.averagePrice,
        bestPrice: insights.bestPrice,
        priceChange: insights.priceChange
      }
    });

  } catch (error) {
    console.error('❌ Quick insights error:', error);
    next(error);
  }
});

// 🛡️ Global error handler для этого роутера
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