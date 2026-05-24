import express from 'express';
import Query from '../../../models/query.js';

const router = express.Router();

router.get('/query/history', async (req, res) => {
  try {
    const { Id: userId, limit = 20 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'Id parameter required' });
    }

    const history = await Query.find({ userId })
      .sort({ querysDate: -1 })
      .limit(parseInt(limit))
      .select('query querysDate')
      .lean();
    
    // Возвращаем просто массив строк для совместимости с фронтендом
    const queries = history.map(item => item.query);
    res.json(queries);
  } catch (err) {
    console.error('❌ DB error in GET /history:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/query/history (body: { Id: "xxx" })
router.delete('/query/history', async (req, res) => {
  try {
    const { Id: userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Id in body required' });
    }

    const result = await Query.deleteMany({ userId });
    res.json({ 
      success: true, 
      message: 'History cleared', 
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error('❌ DB error in DELETE /history:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;