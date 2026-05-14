import mongoose from 'mongoose';
import Item from '../../models/items.js';

// 🔗 Подключение к БД
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/PriceParserDB';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// 🔐 Экранирование спецсимволов для Regex
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

// 📅 Форматирование даты: '01.01'
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
};

// 🔤 Капитализация названия магазина
const capitalizeStore = (store) => {
  if (!store) return store;
  return store.charAt(0).toUpperCase() + store.slice(1).toLowerCase();
};

/**
 * 📊 Получение ценовой динамики со СРЕДНЕЙ ценой за день по товару
 * @param {Object} params - Параметры запроса
 * @param {string} params.query - Поисковый запрос по названию товара (обязательно)
 * @param {string} params.category - Категория (опционально)
 * @param {string} params.startDate - Начальная дата (опционально)
 * @param {string} params.endDate - Конечная дата (опционально)
 * @param {Array<string>} params.stores - Фильтр по магазинам (опционально)
 */
export const getPriceHistoryByStore = async ({
  query,
  category = 'all',
  startDate,
  endDate,
  stores = []
} = {}) => {
  try {
    // 🔍 Формируем фильтр с поиском по словам в поле title
    const filter = {};
    
    if (query) {
      const titleFilter = createWordBasedTitleFilter(query);
      // Объединяем фильтры: если titleFilter пустой, не добавляем его
      if (Object.keys(titleFilter).length > 0) {
        Object.assign(filter, titleFilter);
      }
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (startDate || endDate) {
      filter.parsedAt = {};
      if (startDate) filter.parsedAt.$gte = new Date(startDate);
      if (endDate) filter.parsedAt.$lte = new Date(endDate);
    }
    
    if (Array.isArray(stores) && stores.length > 0) {
      filter.store = { $in: stores.map(s => s.toLowerCase()) };
    }

    // 🗄️ Запрос к БД
    const records = await Item.find(filter)
      .select('store price parsedAt title')
      .sort({ parsedAt: 1 })
      .lean();

    if (!records || !records.length) {
      console.log(`📭 Не найдено записей по запросу "${query}" с применёнными фильтрами`);
      return [];
    }

    // 📦 Группировка: { '01.01': { Alser: [85000, 86000], Sulpak: [87000] } }
    const pricesByDateAndStore = {};
    
    records.forEach(record => {
      const dateKey = formatDate(record.parsedAt);
      const storeName = capitalizeStore(record.store);
      
      // Парсим цену: убираем пробелы, конвертируем в число
      const price = record.price 
        ? parseInt(String(record.price).replace(/\s/g, ''), 10) 
        : null;

      if (price === null || isNaN(price)) return; // пропускаем невалидные цены

      if (!pricesByDateAndStore[dateKey]) {
        pricesByDateAndStore[dateKey] = {};
      }
      if (!pricesByDateAndStore[dateKey][storeName]) {
        pricesByDateAndStore[dateKey][storeName] = [];
      }
      
      pricesByDateAndStore[dateKey][storeName].push(price);
    });

    // 🧮 Рассчитываем среднее и формируем результат
    const result = Object.entries(pricesByDateAndStore).map(([date, storesData]) => {
      const entry = { date };
      
      Object.entries(storesData).forEach(([store, prices]) => {
        // 📐 Средняя цена: округляем до целого
        const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
        entry[store] = avgPrice;
      });
      
      return entry;
    });

    // 📋 Сортировка по дате
    result.sort((a, b) => {
      const [dayA, monthA] = a.date.split('.').map(Number);
      const [dayB, monthB] = b.date.split('.').map(Number);
      return (monthA - monthB) || (dayA - dayB);
    });

    return result;

  } catch (error) {
    console.error('❌ Error in getPriceHistoryByStore:', error);
    return [];
  }
};

/**
 * 🏪 Получение списка доступных магазинов для товара
 * @param {string} query - Поисковый запрос по названию товара
 */
export const getAvailableStores = async (query) => {
  try {
    // 🔍 Фильтр с поиском по словам в title
    const filter = query ? createWordBasedTitleFilter(query) : {};
      
    const stores = await Item.distinct('store', filter);
    return stores.map(capitalizeStore).filter(Boolean);
  } catch (error) {
    console.error('❌ Error fetching stores:', error);
    return [];
  }
};

// ✅ Экспорт по умолчанию
export default {
  getPriceHistoryByStore,
  getAvailableStores,
  connectDB
};