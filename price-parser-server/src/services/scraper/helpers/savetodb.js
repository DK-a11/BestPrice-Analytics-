import mongoose from 'mongoose';
import Item from '../../../models/items.js';

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/PriceParserDB';

export async function saveToDB(items) {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      console.log('Нет данных для сохранения');
      return { insertedCount: 0, updatedCount: 0, errors: [] };
    }

    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (const item of items) {
      try {
        const parsedAt = item.parsedAt 
          ? new Date(item.parsedAt) 
          : new Date(); 
        
        const startOfDay = new Date(parsedAt);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(parsedAt);
        endOfDay.setHours(23, 59, 59, 999);
        
        const existing = await Item.findOne({ 
          link: item.link, 
          parsedAt: {
            $gte: startOfDay,
            $lt: endOfDay
          }
        });

        if (existing) {
          if (existing.price !== item.price) {
            await Item.findByIdAndUpdate(existing._id, {
              ...item,
              parsedAt
            }, { new: true, runValidators: true });
            results.updated++;
            console.log(`Обновлено: ${item.title} | ${item.price}`);
          } else {
            results.skipped++; 
          }
        } else {
          await Item.create({
            ...item,
            parsedAt
          });
          results.inserted++;
          console.log(`Добавлено: ${item.title} | ${item.price} | ${parsedAt.toISOString().split('T')[0]}`);
        }
      } catch (itemError) {
        results.errors.push({
          link: item.link,
          error: itemError.message
        });
        console.error(`Ошибка для ${item.link}:`, itemError.message);
      }
    }

    console.log('\n📊 Итоги сохранения:');
    console.log(`   ➕ Новые: ${results.inserted}`);
    console.log(`   🔄 Обновлённые: ${results.updated}`);
    console.log(`   ⏭️ Пропущено: ${results.skipped}`);
    console.log(`   ❌ Ошибки: ${results.errors.length}`);

    return results;
    
  } catch (error) {
    console.error('Критическая ошибка БД:', error.message);
    throw error;
  }
}