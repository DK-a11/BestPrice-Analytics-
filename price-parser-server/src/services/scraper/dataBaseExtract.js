import mongoose from 'mongoose';
import Item from '../../models/items.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/PriceParserDB';

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
    .replace(/\(.*?\)/g, '')           // Удаление скобки с артикулами (MG2P4HX/A)
    .replace(/\d+\/\d+gb/gi, '')       // Удаление варианты памяти (12/256GB)
    .replace(/[^a-zа-яё0-9\s]/gi, ' ') // только буквы и цифры
    .replace(/\s+/g, ' ')              // Убираются лишние пробелы
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

    const items = await Item.find({ 
      ...titleFilter 
    })
    .sort({ parsedAt: -1 })
    .lean();

    if (!items.length) {
      console.log(`📭 Не найдено товаров по запросу "${query}" (слова: ${query.trim().split(/\s+/).filter(w => w.length > 0).join(', ')})`);
      return [];
    }

    const grouped = items.reduce((acc, item) => {
      const normalized = normalizeTitle(item.title);
      
      if (!acc[normalized]) {
        acc[normalized] = [];
      }
      acc[normalized].push(item);
      return acc;
    }, {});

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

    return result.sort((a, b) => a.price - b.price);

  } catch (error) {
    console.error('[dataBaseExtract] Error:', error);
    throw new Error(`Failed to extract products for query "${query}": ${error.message}`);
  }
};

export default {
  getProductsByQuery
};