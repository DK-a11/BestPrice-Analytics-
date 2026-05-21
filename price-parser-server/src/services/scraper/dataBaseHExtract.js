import mongoose from 'mongoose';
import Item from '../../models/items.js';

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
    
    if (query) {
      const titleFilter = createWordBasedTitleFilter(query);
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

    const records = await Item.find(filter)
      .select('store price parsedAt title')
      .sort({ parsedAt: 1 })
      .lean();

    if (!records || !records.length) {
      console.log(`📭 Не найдено записей по запросу "${query}" с применёнными фильтрами`);
      return [];
    }

    const pricesByDateAndStore = {};
    
    records.forEach(record => {
      const dateKey = formatDate(record.parsedAt);
      const storeName = capitalizeStore(record.store);
      
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

    const result = Object.entries(pricesByDateAndStore).map(([date, storesData]) => {
      const entry = { date };
      
      Object.entries(storesData).forEach(([store, prices]) => {
        const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
        entry[store] = avgPrice;
      });
      
      return entry;
    });

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
  getAvailableStores,
  connectDB
};