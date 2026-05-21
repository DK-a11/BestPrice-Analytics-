import mongoose from 'mongoose'
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

export async function getItemsByTitle(query) {
  try {
    // 🔍 Разбиваем запрос на слова по пробелам, фильтруем пустые значения
    const words = query.trim().split(/\s+/).filter(word => word.length > 0);
    
    // Если запрос пустой — возвращаем пустой массив
    if (words.length === 0) {
      console.log('Пустой запрос, возврат пустого результата');
      return [];
    }

    const searchConditions = words.map(word => ({
      title: { $regex: escapeRegExp(word), $options: 'i' } 
    }));
    
    const items = await Item.find({
      $and: searchConditions
    }).lean(); 
    
    console.log(`Найдено ${items.length} товаров по запросу "${query}" (слова: ${words.join(', ')})`);

    const grouped = items.reduce((acc, item) => {
      const price = parseFloat(item.price);
      if (isNaN(price)) return acc; // Пропускаем невалидные цены
        
      if (!acc[item.store]) {
        acc[item.store] = { sum: 0, count: 0 };
      }

      acc[item.store].sum += price;
      acc[item.store].count += 1;

      return acc;
    }, {});

    // Преобразуем в формат для графика с фиксированными цветами
    const chartData = Object.keys(grouped).map((store, index) => {
      const data = grouped[store];
      
      // Получаем цвет: из палитры → из фоллбэка → случайный серый
      const color = STORE_COLORS[store.toLowerCase()] 
        || FALLBACK_COLORS[index % FALLBACK_COLORS.length];

      return {
        store: store,
        price: (data.sum / data.count).toFixed(2), // Среднее
        color: color
      };
    });

    console.log('Сформированные данные для графика:', chartData);
    return chartData;
  } catch (err) {
    console.error('Ошибка поиска:', err);
    throw err;
  }
}
