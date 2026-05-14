import mongoose from 'mongoose';
import Item from '../../models/items.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/PriceParserDB';

export const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ MongoDB connected for Insights');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
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
  return { 
    $and: words.map(word => ({
      title: { $regex: escapeRegex(word), $options: 'i' }
    }))
  };
};

const parsePrice = (price) => {
  if (!price) return null;
  const numeric = String(price).replace(/\s/g, '').replace(/[^0-9]/g, '');
  const parsed = parseInt(numeric, 10);
  return isNaN(parsed) ? null : parsed;
};

const capitalizeStore = (store) => {
  if (!store) return store;
  return store.charAt(0).toUpperCase() + store.slice(1).toLowerCase();
};

export const getPriceInsights = async ({
  query,
  category = 'all',
  stores = [],
  startDate,
  endDate
} = {}) => {
  try {
    if (!query) throw new Error('Parameter "query" is required');

    const titleFilter = createWordBasedTitleFilter(query);
    if (Object.keys(titleFilter).length === 0) return null;

    const filter = { ...titleFilter };
    if (category && category !== 'all') filter.category = category;
    
    if (startDate || endDate) {
      filter.parsedAt = {};
      if (startDate) filter.parsedAt.$gte = new Date(startDate);
      if (endDate) filter.parsedAt.$lte = new Date(endDate);
    }
    
    if (Array.isArray(stores) && stores.length > 0) {
      filter.store = { $in: stores.map(s => s.toLowerCase()) };
    }

    const uniqueProducts = await Item.aggregate([
      { $match: filter },
      { $sort: { parsedAt: -1 } },
      {
        $group: {
          _id: '$link',
          latestDoc: { $first: '$$ROOT' },
          store: { $first: '$store' },
          price: { $first: '$price' },
          title: { $first: '$title' },
          link: { $first: '$link' }
        }
      },
      { $replaceRoot: { newRoot: '$latestDoc' } }
    ]);

    if (!uniqueProducts || uniqueProducts.length === 0) return null;

    const storeStats = {};
    
    for (const product of uniqueProducts) {
      const price = parsePrice(product.price);
      if (price === null) continue;

      const storeKey = product.store.toLowerCase();
      const storeName = capitalizeStore(product.store);
      
      if (!storeStats[storeKey]) {
        storeStats[storeKey] = {
          name: storeName,
          prices: [],
          cheapestItem: null
        };
      }
      
      storeStats[storeKey].prices.push(price);
      
      if (!storeStats[storeKey].cheapestItem || price < storeStats[storeKey].cheapestItem.price) {
        storeStats[storeKey].cheapestItem = {
          store: storeName,
          price: price,
          link: product.link,
          title: product.title
        };
      }
    }

    if (Object.keys(storeStats).length === 0) return null;

    let bestStoreKey = null;
    let globalMinPrice = Infinity;
    
    for (const [key, data] of Object.entries(storeStats)) {
      if (data.cheapestItem.price < globalMinPrice) {
        globalMinPrice = data.cheapestItem.price;
        bestStoreKey = key;
      }
    }

    if (!bestStoreKey) return null;

    const bestStoreData = storeStats[bestStoreKey];
    const bestOffer = bestStoreData.cheapestItem;

    const avgInBestStore = Math.round(
      bestStoreData.prices.reduce((a, b) => a + b, 0) / bestStoreData.prices.length
    );

    const otherStoresPrices = Object.entries(storeStats)
      .filter(([key]) => key !== bestStoreKey)
      .flatMap(([, data]) => data.prices);
    
    const avgInOtherStores = otherStoresPrices.length > 0
      ? Math.round(otherStoresPrices.reduce((a, b) => a + b, 0) / otherStoresPrices.length)
      : avgInBestStore;

    const priceChange = avgInOtherStores > 0
      ? parseFloat((((avgInBestStore - avgInOtherStores) / avgInOtherStores) * 100).toFixed(1))
      : 0;

    const recommendation = avgInOtherStores > 0 && priceChange < 0
      ? `лучшее предложение сейчас в магазине ${bestOffer.store}, рекомендуем к покупке`
      : `лучшее предложение сейчас в магазине ${bestOffer.store}`;

    return {
      averagePrice: avgInBestStore,
      bestPrice: {
        store: bestOffer.store,
        price: bestOffer.price,
      },
      priceChange,
      recommendation,
    };

  } catch (error) {
    console.error('❌ Error in getPriceInsights:', error);
    return null;
  }
};

export const getStoreComparison = async ({ query, category = 'all' } = {}) => {
  try {
    if (!query) return [];

    const titleFilter = createWordBasedTitleFilter(query);
    if (Object.keys(titleFilter).length === 0) return [];

    const filter = { ...titleFilter };
    if (category && category !== 'all') filter.category = category;

    const latestRecords = await Item.aggregate([
      { $match: filter },
      { $sort: { parsedAt: -1 } },
      {
        $group: {
          _id: '$link',
          latestDoc: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestDoc' } },
      { $sort: { price: 1 } }
    ]);

    return latestRecords
      .map(record => ({
        store: capitalizeStore(record.store),
        price: parsePrice(record.price),
        link: record.link,
        parsedAt: record.parsedAt
      }))
      .filter(item => item.price !== null)
      .sort((a, b) => a.price - b.price);

  } catch (error) {
    console.error('❌ Error in getStoreComparison:', error);
    return [];
  }
};

export default {
  getPriceInsights,
  getStoreComparison,
  connectDB
};