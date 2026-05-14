import mongoose from 'mongoose';
import Item from '../../models/items.js';

// 🔗 Подключение к БД
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/PriceParserDB';

// 🔐 Экранирование спецсимволов для Regex (защита от ReDoS и инъекций)
const escapeRegex = (str) => {
  if (!str) return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 🔍 НОВАЯ ФУНКЦИЯ: Создание фильтра по словам запроса
// Разбивает запрос на слова и создаёт условие $and: каждое слово должно быть в title
const createWordBasedTitleFilter = (query) => {
  if (!query || typeof query !== 'string') return {};
  
  // Разбиваем по пробелам, убираем пустые строки
  const words = query.trim().split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) return {};
  
  // Создаём массив условий: каждое слово ищем через $regex
  const conditions = words.map(word => ({
    title: { $regex: escapeRegex(word), $options: 'i' }
  }));
  
  // Все слова должны совпасть (логическое И)
  return { $and: conditions };
};

/**
 * Нормализует название товара для группировки
 * Убирает лишние символы, приводит к нижнему регистру, удаляет артикулы
 * @param {String} title - Исходное название товара
 * @returns {String} Нормализованная строка для сравнения
 */
const normalizeTitle = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, '')           // Удаляем скобки с артикулами (MG2P4HX/A)
    .replace(/\d+\/\d+gb/gi, '')       // Удаляем варианты памяти (12/256GB)
    .replace(/[^a-zа-яё0-9\s]/gi, ' ') // Оставляем только буквы и цифры
    .replace(/\s+/g, ' ')              // Убираем лишние пробелы
    .trim();
};

/**
 * Форматирует документ базы данных в требуемый формат ответа
 * @param {Object} baseItem - Базовый товар для названия и ссылки
 * @param {Array} group - Группа похожих товаров
 * @param {Number} bestPrice - Минимальная цена в группе
 * @returns {Object} Отформатированный объект товара
 */
const formatItemResponse = (baseItem, group, bestPrice) => {
  return {
    id: baseItem._id.toString(),
    name: baseItem.title,
    image: 'https://via.placeholder.com/200?text=iPhone+15', // Заглушка по ТЗ
    itemlink: baseItem.link,
    price: bestPrice,
    priceChange: 0,
    category: baseItem.category || 'uncategorized',
    stores: [...new Set(group.map(item => item.store))], // Уникальные магазины
    isBestPrice: false // Показываем лучший найденный price
  };
};

/**
 * 🔍 Получает и агрегирует товары по поисковому запросу в поле title
 * @param {String} query - Обязательный параметр: название товара для поиска (частичное совпадение)
 * @returns {Promise<Array>} Массив отформатированных товаров
 */
export const getProductsByQuery = async (query) => {
  try {
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required and must be a string');
    }

    // 🔍 Создаём фильтр по словам запроса
    const titleFilter = createWordBasedTitleFilter(query);
    if (Object.keys(titleFilter).length === 0) {
      console.warn('⚠️ Пустой или невалидный запрос:', query);
      return [];
    }

    // 🔍 Ищем все товары по заданному запросу в поле title (по каждому слову)
    const items = await Item.find({ 
      ...titleFilter 
    })
    .sort({ parsedAt: -1 })
    .lean();

    if (!items.length) {
      console.log(`📭 Не найдено товаров по запросу "${query}" (слова: ${query.trim().split(/\s+/).filter(w => w.length > 0).join(', ')})`);
      return [];
    }

    // 📦 Группируем товары по нормализованному названию
    const grouped = items.reduce((acc, item) => {
      const normalized = normalizeTitle(item.title);
      
      if (!acc[normalized]) {
        acc[normalized] = [];
      }
      acc[normalized].push(item);
      return acc;
    }, {});

    // 🧮 Формируем итоговый массив
    const result = Object.values(grouped).map(group => {
      // Находим минимальную цену в группе
      const prices = group.map(item => {
        const parsed = parseInt(String(item.price).replace(/\s/g, ''), 10);
        return isNaN(parsed) ? Infinity : parsed;
      }).filter(p => p !== Infinity);
      
      if (prices.length === 0) return null;
      
      const bestPrice = Math.min(...prices);
      
      // Выбираем товар с лучшей ценой как базовый для отображения
      const baseItem = group.find(item => {
        const parsed = parseInt(String(item.price).replace(/\s/g, ''), 10);
        return parsed === bestPrice;
      }) || group[0];
      
      return formatItemResponse(baseItem, group, bestPrice);
    }).filter(Boolean); // Удаляем null-значения

    // 📋 Сортируем по цене (от дешёвых к дорогим)
    return result.sort((a, b) => a.price - b.price);

  } catch (error) {
    console.error('[dataBaseExtract] Error:', error);
    throw new Error(`Failed to extract products for query "${query}": ${error.message}`);
  }
};

export default {
  getProductsByQuery
};