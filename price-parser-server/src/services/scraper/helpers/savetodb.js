import mongoose from 'mongoose';
import Item from '../../../models/items.js';

// Подключение к БД (лучше вынести в отдельный файл db.js)
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/PriceParserDB';

export async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  }
}


export async function saveToDB(items) {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      console.log('⚠️ Нет данных для сохранения');
      return { insertedCount: 0, updatedCount: 0, errors: [] };
    }

    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    // Обрабатываем каждый товар индивидуально для гибкости
    for (const item of items) {
      try {
        const parsedAt = item.parsedAt 
          ? new Date(item.parsedAt) 
          : new Date(); // текущая дата, если не указана
        
        const existing = await Item.findOne({ 
          url: item.url, 
          parsedAt: {
            $gte: new Date(parsedAt.setHours(0,0,0,0)),
            $lt: new Date(parsedAt.setHours(23,59,59,999))
          }
        });

        if (existing) {
          // 📝 Обновляем существующую запись (если цена изменилась)
          if (existing.price !== item.price || existing.availability !== item.availability) {
            await Item.findByIdAndUpdate(existing._id, {
              ...item,
              parsedAt,
              $setOnInsert: { createdAt: new Date() }
            }, { new: true, runValidators: true });
            results.updated++;
            console.log(`🔄 Обновлено: ${item.name} | ${item.price} ${item.currency}`);
          } else {
            results.skipped++; // Данные не изменились
          }
        } else {
          // ➕ Создаём новую запись истории
          await Item.create({
            ...item,
            parsedAt
          });
          results.inserted++;
          console.log(`✅ Добавлено: ${item.name} | ${item.price} ${item.currency} | ${parsedAt.toISOString().split('T')[0]}`);
        }
      } catch (itemError) {
        results.errors.push({
          url: item.url,
          error: itemError.message
        });
        console.error(`❌ Ошибка для ${item.url}:`, itemError.message);
      }
    }

    console.log('\n📊 Итоги сохранения:');
    console.log(`   ➕ Новые: ${results.inserted}`);
    console.log(`   🔄 Обновлённые: ${results.updated}`);
    console.log(`   ⏭️ Пропущено: ${results.skipped}`);
    console.log(`   ❌ Ошибки: ${results.errors.length}`);

    return results;
    
  } catch (error) {
    console.error('💥 Критическая ошибка БД:', error.message);
    throw error;
  }
}