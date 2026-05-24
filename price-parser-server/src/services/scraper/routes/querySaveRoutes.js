import express from 'express';
import { saveUserQuery, getUserQueryHistory, searchUserQueries } from '../helpers/querySavetoDB.js';

const router = express.Router();


router.post('/query', express.json(), async (req, res) => {
  try {
    console.log('[QueryRoute] POST /api/querys:', {
      ip: req.ip,
      body: { ...req.body, query: req.body.query?.substring(0, 50) + '...' },
    });

    const userId = req.body.Id || req.body.userId;
    const { query } = req.body;

    if (!userId || !query) {
      return res.status(400).json({
        success: false,
        message: 'User ID and query text are required',
      });
    }

    const savedQuery = await saveUserQuery({ userId, query });

    return res.status(201).json({
      success: true,
      message: 'Query saved successfully',
      query: savedQuery,
    });

  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: error.message || 'User not found',
      });
    }

    if (['MISSING_PARAMS', 'INVALID_USER_ID', 'INVALID_QUERY_LENGTH', 'VALIDATION_ERROR'].includes(error.code)) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid request data',
      });
    }

    if (error.code === 'DATABASE_ERROR') {
      return res.status(503).json({
        success: false,
        message: error.message || 'Service temporarily unavailable',
      });
    }

    console.error('[QueryRoute] Unhandled error:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message || 'Failed to save query',
    });
  }
});


router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const history = await getUserQueryHistory(userId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
    });

    return res.status(200).json({
      success: true,
      count: history.length,
      queries: history,
    });

  } catch (error) {
    if (error.code === 'INVALID_USER_ID') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    console.error('[QueryRoute] History error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch query history',
    });
  }
});


router.get('/search/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { q: searchTerm } = req.query;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters',
      });
    }

    const results = await searchUserQueries(userId, searchTerm.trim());

    return res.status(200).json({
      success: true,
      count: results.length,
      queries: results,
    });

  } catch (error) {
    console.error('[QueryRoute] Search error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Search failed',
    });
  }
});

export default router;