import mongoose from 'mongoose';
import Item from '../../models/items.js';

mongoose.connect('mongodb://localhost:27017/PriceParserDB');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const STORE_COLORS = {
  'alser': '#10B981',
  'sulpak': '#f59e0b',
  'alfa': '#6720ff',
  'kaspi': '#f54545'
};

const FALLBACK_COLORS = ['#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];

export async function getItemsByTitle(query, options = {}) {
  const { stores = [] } = options;
  
  try {
    const words = query.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return [];

    // Фильтр по названию
    const searchConditions = words.map(word => ({
      title: { $regex: escapeRegExp(word), $options: 'i' } 
    }));
    
    const baseFilter = { $and: searchConditions };
    let finalFilter = baseFilter;

    // Отладка: сколько товаров вообще находится по запросу?
    const titleMatchCount = await Item.countDocuments(baseFilter);
    console.log(`📊 Товаров по названию "${query}": ${titleMatchCount}`);

    // Применяем фильтр по магазинам, если он передан
    if (stores.length > 0) {
      console.log('🏪 Применяю фильтр по магазинам:', stores);
      
      const storeRegexes = stores.map(s => new RegExp(escapeRegExp(s.trim()), 'i'));
      finalFilter = { $and: [baseFilter, { store: { $in: storeRegexes } }] };
    }

    const items = await Item.find(finalFilter).lean();
    console.log(`✅ После фильтрации магазинов: ${items.length} товаров`);

    //Если 0, покажем какие магазины реально есть в БД для этого запроса
    if (items.length === 0 && stores.length > 0) {
      const actualStores = await Item.distinct('store', baseFilter);
      console.warn('⚠️ Фильтр вернул 0. Реальные store в БД:', actualStores);
    }

    return processItemsToChartData(items);

  } catch (err) {
    console.error('❌ Ошибка в getItemsByTitle:', err);
    throw err;
  }
}

function processItemsToChartData(items) {
  const grouped = items.reduce((acc, item) => {
    const price = parseFloat(item.price);
    if (isNaN(price)) return acc;
      
    if (!acc[item.store]) acc[item.store] = { sum: 0, count: 0 };
    acc[item.store].sum += price;
    acc[item.store].count += 1;
    return acc;
  }, {});

  const chartData = Object.keys(grouped).map((store, index) => {
    const avg = grouped[store].sum / grouped[store].count;
    const color = STORE_COLORS[store.toLowerCase()] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    return { store, price: parseFloat(avg.toFixed(2)), color };
  });

  chartData.sort((a, b) => a.price - b.price);
  return chartData;
}