import express from 'express';
//import { fakeParse } from '../fakeparse.js'; 


const router = express.Router();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

router.post('/parse', async (req, res, next) => {
  try {
    const { query, pages } = req.body;

    // 1. Базовая валидация
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Поле "query" обязательно и должно быть строкой' });
    }
    //if (!pages || typeof pages !== 'number' || pages < 1 || !Number.isInteger(pages)) {
    //  return res.status(400).json({ error: 'Поле "pages" обязательно, должно быть целым числом >= 1' });
    //}

    // 2. Вызов бизнес-логики
    const result = await fakeParse(query, pages);

    // 3. Успешный ответ
    res.status(200).json({ 
      success: result.length > 0,
      count: result.length,
      data: result 
    });

  } catch (error) {
    next(error); // Передаём ошибку в глобальный обработчик Express
  }
});

export default router;