import mongoose from 'mongoose'

mongoose.connect('mongodb://localhost:27017/PriceParserDBfake');

// Схема для товаров
const itemSchema = new mongoose.Schema({
  shopname: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  price: { type: String, trim: true },
  link: { type: String, trim: true },
  query: { type: String, default: '' },
  parsedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Уникальный индекс по query для предотвращения дубликатов
itemSchema.index({ title: 1, link: 1 }, { unique: true });
const fakeItem = mongoose.model('fakeItem', itemSchema);

//функция сохранения в БД
async function saveToDB(items) {
    try {
      const result = await fakeItem.insertMany(items, {
        ordered: false,
        rawResult: true
      });
      console.log('✅ Сохранено:', result.insertedCount);
      console.log('❌ Ошибки:', result.writeErrors?.length || 0);
      return result;
    } catch (error) {
      console.error('Ошибка БД:', error.message);
      throw error;
    }
}

export function fakeParse(query, pages) {
    const queryitems = []
    queryitems.push({ shopname: 'Fake Shop', title: 'Fake Item', price: '$99.99', link: 'http://fake-shop.com/item', query });
    saveToDB(queryitems);

    return queryitems;
};

export default {
    fakeParse
}