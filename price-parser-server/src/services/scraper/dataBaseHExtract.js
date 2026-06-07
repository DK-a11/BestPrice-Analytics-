import mongoose from 'mongoose';
import Item from '../../models/items.js';

mongoose.connect('mongodb+srv://kramarevdenis17_db_user:wypdCawRJnJPCPDC@bestpricedb.exwoxk2.mongodb.net');

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

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
};

const capitalizeStore = (store) => {
  if (!store) return store;
  return store.charAt(0).toUpperCase() + store.slice(1).toLowerCase();
};

export const getPriceHistoryByStore = async ({
  query,
  category = 'all',
  startDate,
  endDate,
  stores = []
} = {}) => {
  try {
    const filter = {};
    
    // Фильтр по названию товара
    if (query) {
      const titleFilter = createWordBasedTitleFilter(query);
      if (Object.keys(titleFilter).length > 0) {
        Object.assign(filter, titleFilter);
      }
    }
    
    // Фильтр по категории
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Фильтр по дате
    if (startDate || endDate) {
      filter.parsedAt = {};
      if (startDate) filter.parsedAt.$gte = new Date(startDate);
      if (endDate) filter.parsedAt.$lte = new Date(endDate);
    }
    
    if (Array.isArray(stores) && stores.length > 0) {
      console.log('🏪 Применяю фильтр по магазинам (история):', stores);
      
      const countWithoutStoreFilter = await Item.countDocuments(filter);
      console.log(`📊 Записей по запросу "${query}" без фильтра магазинов: ${countWithoutStoreFilter}`);
      
      const storeRegexes = stores.map(s => new RegExp(escapeRegex(s.trim()), 'i'));
      filter.store = { $in: storeRegexes };
      
      const countWithStoreFilter = await Item.countDocuments(filter);
      console.log(`📊 Записей после фильтра магазинов: ${countWithStoreFilter}`);
      
      if (countWithStoreFilter === 0) {
        // Временно уберём фильтр store для distinct
        const { store: _, ...filterWithoutStore } = filter;
        const actualStores = await Item.distinct('store', filterWithoutStore);
        
        console.warn('⚠️ Фильтр по магазинам вернул 0 записей!');
        console.warn('📦 Реальные значения поля store в БД для этого запроса:', actualStores);
        console.warn('🔍 Запрошенные магазины:', stores);
      }
    }

    const records = await Item.find(filter)
      .select('store price parsedAt title')
      .sort({ parsedAt: 1 })
      .lean();

    if (!records || !records.length) {
      console.log(`📭 Не найдено записей по запросу "${query}" с применёнными фильтрами`);
      return [];
    }

    console.log(`✅ Найдено ${records.length} записей для истории цен`);

    // Группировка по дате и магазину
    const pricesByDateAndStore = {};
    
    records.forEach(record => {
      const dateKey = formatDate(record.parsedAt);
      const storeName = capitalizeStore(record.store);
      
      const price = record.price 
        ? parseInt(String(record.price).replace(/\s/g, ''), 10) 
        : null;

      if (price === null || isNaN(price)) return;

      if (!pricesByDateAndStore[dateKey]) {
        pricesByDateAndStore[dateKey] = {};
      }
      if (!pricesByDateAndStore[dateKey][storeName]) {
        pricesByDateAndStore[dateKey][storeName] = [];
      }
      
      pricesByDateAndStore[dateKey][storeName].push(price);
    });

    // Формирование результата
    const result = Object.entries(pricesByDateAndStore).map(([date, storesData]) => {
      const entry = { date };
      
      Object.entries(storesData).forEach(([store, prices]) => {
        const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
        entry[store] = avgPrice;
      });
      
      return entry;
    });

    // Сортировка по дате
    result.sort((a, b) => {
      const [dayA, monthA] = a.date.split('.').map(Number);
      const [dayB, monthB] = b.date.split('.').map(Number);
      return (monthA - monthB) || (dayA - dayB);
    });

    console.log(`📈 Сформировано ${result.length} точек данных для графика истории`);
    return result;

  } catch (error) {
    console.error('❌ Error in getPriceHistoryByStore:', error);
    return [];
  }
};

export const getAvailableStores = async (query) => {
  try {
    const filter = query ? createWordBasedTitleFilter(query) : {};
    const stores = await Item.distinct('store', filter);
    return stores.map(capitalizeStore).filter(Boolean);
  } catch (error) {
    console.error('❌ Error fetching stores:', error);
    return [];
  }
};

export default {
  getPriceHistoryByStore,
  getAvailableStores
};