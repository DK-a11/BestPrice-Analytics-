import mongoose from 'mongoose';
import Item from '../../models/items.js';

mongoose.connect('mongodb+srv://kramarevdenis17_db_user:wypdCawRJnJPCPDC@bestpricedb.exwoxk2.mongodb.net/');

const escapeRegex = (str) => {
  if (!str) return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const createWordBasedTitleFilter = (query) => {
  if (!query || typeof query !== 'string') return {};
  
  const words = query.trim().split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) return {};
  
  const conditions = words.map(word => ({
    title: { $regex: escapeRegex(word), $options: 'i' }
  }));
  
  return { $and: conditions };
};

const normalizeTitle = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, '')           // Удаление скобок с артикулами
    .replace(/\d+\/\d+gb/gi, '')       // Удаление вариантов памяти
    .replace(/[^a-zа-яё0-9\s]/gi, ' ') // Только буквы и цифры
    .replace(/\s+/g, ' ')              // Убираем лишние пробелы
    .trim();
};

const formatItemResponse = (baseItem, group, bestPrice) => {
  return {
    id: baseItem._id.toString(),
    name: baseItem.title,
    image: 'https://via.placeholder.com/200?text=iPhone+15', 
    itemlink: baseItem.link,
    price: bestPrice,
    priceChange: 0,
    category: baseItem.category || 'uncategorized',
    stores: [...new Set(group.map(item => item.store))], 
    isBestPrice: false 
  };
};


export const getProductsByQuery = async (query, options = {}) => {
  const { stores = [] } = options;
  
  try {
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required and must be a string');
    }

    const titleFilter = createWordBasedTitleFilter(query);
    if (Object.keys(titleFilter).length === 0) {
      console.warn('⚠️ Пустой или невалидный запрос:', query);
      return [];
    }

    let finalFilter = titleFilter;
    
    if (stores.length > 0) {
      console.log('🏪 [products] Фильтр по магазинам:', stores);
      
      const storeRegexes = stores.map(s => 
        new RegExp(escapeRegex(s.trim()), 'i')
      );
      
      finalFilter = { 
        $and: [titleFilter, { store: { $in: storeRegexes } }] 
      };
    }

    const titleMatchCount = await Item.countDocuments(titleFilter);
    console.log(`📊 [products] Товаров по названию "${query}": ${titleMatchCount}`);

    const items = await Item.find(finalFilter)
      .sort({ parsedAt: -1 })
      .lean();

    console.log(`✅ [products] После фильтрации: ${items.length} товаров`);

    if (items.length === 0 && stores.length > 0) {
      const actualStores = await Item.distinct('store', titleFilter);
      console.warn('⚠️ [products] Фильтр вернул 0. Реальные store в БД:', actualStores);
    }

    if (!items.length) {
      console.log(`📭 Не найдено товаров по запросу "${query}"`);
      return [];
    }

    // Группировка по нормализованному названию
    const grouped = items.reduce((acc, item) => {
      const normalized = normalizeTitle(item.title);
      
      if (!acc[normalized]) {
        acc[normalized] = [];
      }
      acc[normalized].push(item);
      return acc;
    }, {});

    // Формирование результата с лучшей ценой в группе
    const result = Object.values(grouped).map(group => {
      const prices = group.map(item => {
        const parsed = parseInt(String(item.price).replace(/\s/g, ''), 10);
        return isNaN(parsed) ? Infinity : parsed;
      }).filter(p => p !== Infinity);
      
      if (prices.length === 0) return null;
      
      const bestPrice = Math.min(...prices);
      
      const baseItem = group.find(item => {
        const parsed = parseInt(String(item.price).replace(/\s/g, ''), 10);
        return parsed === bestPrice;
      }) || group[0];
      
      return formatItemResponse(baseItem, group, bestPrice);
    }).filter(Boolean);

    // Сортировка по цене (от дешёвых к дорогим)
    return result.sort((a, b) => a.price - b.price);

  } catch (error) {
    console.error('[dataBaseExtract] Error in getProductsByQuery:', error);
    throw new Error(`Failed to extract products for query "${query}": ${error.message}`);
  }
};

export default {
  getProductsByQuery
};