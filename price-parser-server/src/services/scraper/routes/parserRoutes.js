import express from 'express';
import { parseSulpak } from '../sulpakN.js'; 
import { parseAlser } from '../alserN.js'; 
import { parseAlfa } from '../alfaN.js'; 
import { parseKaspi } from '../kaspiN.js'; 

const router = express.Router();
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

router.post('/parse', async (req, res, next) => {
  try {
    const { query, pages, stores } = req.body;

    // Валидация
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Поле "query" обязательно и должно быть строкой' });
    }

    // Нормализация pages (оставляем как в старом коде - без parseInt, если парсеры ждут undefined)
    const pagesNum = pages; 

    // 🔥 Определяем, какие магазины парсить
    const requestedStores = Array.isArray(stores) && stores.length > 0 
      ? stores.map(s => String(s).toLowerCase()) 
      : null; // null = парсить все

    const allResults = [];
    const errors = [];

    // 🔥 Вспомогательная функция для безопасного запуска одного парсера
    const runParser = async (storeName, parserFn) => {
      // Если запрошены конкретные магазины и текущего нет в списке — пропускаем
      if (requestedStores && !requestedStores.includes(storeName.toLowerCase())) {
        return;
      }

      try {
        console.log(`🔄 Запуск ${storeName}...`);
        // 🔥 ПРЯМОЙ вызов функции — как в старом рабочем коде!
        const result = await parserFn(query, pagesNum);
        
        // Защита от не-массива
        if (Array.isArray(result)) {
          const enriched = result.map(item => ({ ...item, source: storeName.toLowerCase() }));
          allResults.push(...enriched);
          console.log(`✅ ${storeName}: +${result.length} товаров`);
        } else {
          console.warn(`⚠️ ${storeName} вернул не массив:`, typeof result);
        }
      } catch (err) {
        console.error(`❌ Ошибка ${storeName}:`, err.message);
        errors.push({ shop: storeName.toLowerCase(), error: err.message });
      }
    };

    // 🔥 Последовательный запуск — ТОЧНО как в старом коде
    await runParser('Alser', parseAlser);
    await delay(4500);
    
    await runParser('Kaspi', parseKaspi);
    await delay(4500);
    
    await runParser('Sulpak', parseSulpak);
    await delay(4500);
    
    await runParser('Alfa', parseAlfa);
    // Задержка после последнего не нужна

    // Лог итогов
    console.log(`📦 Итого: ${allResults.length} товаров из ${requestedStores || 'всех'} магазинов`);

    res.status(200).json({ 
      success: allResults.length > 0,
      count: allResults.length,
      queriedStores: requestedStores || 'all',
      errors: errors.length > 0 ? errors : undefined,
      data: allResults 
    });

  } catch (error) {
    console.error('💥 Глобальная ошибка:', error);
    next(error);
  }
});

export default router;