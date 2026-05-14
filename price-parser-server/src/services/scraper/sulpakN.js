import * as cheerio from 'cheerio';
import { getPuppeteerPage } from './helpers/puppeteer.js';
import { arrayFromlength } from './helpers/common.js';
import { saveToDB } from './helpers/savetodb.js';
import { extractCategoryFromUrl } from './helpers/categoryExtract.js';

// 🔹 Формируем базовый URL динамически
const getSearchUrl = (query, page = 1) => {
  return `https://www.sulpak.kz/Search?query=${encodeURIComponent(query)}`;
};

// 🔹 Нормализация строки: нижний регистр, удаление пунктуации, разбивка на слова
const normalizeText = (str) => {
  if (!str) return [];
  return str
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, ' ') // заменяем всё лишнее на пробел
    .replace(/-/g, ' ')                  // дефисы тоже на пробел (VGA-HDMI → VGA HDMI)
    .trim()
    .split(/\s+/)
    .filter(Boolean);                    // убираем пустые строки
};


const matchesQueryWords = (title, query, threshold = 0.6) => {
  if (!title || !query) return false;

  const titleWords = new Set(normalizeText(title)); // Set для быстрого поиска O(1)
  const queryWords = normalizeText(query);

  if (queryWords.length === 0) return false;

  const matchedCount = queryWords.filter(word => titleWords.has(word)).length;
  return matchedCount / queryWords.length >= threshold;
};

// 🔹 Основная функция парсинга
export async function parseSulpak(query, pages = 1) {
  const allResults = [];

  for (const pageNum of arrayFromlength(pages)) {
    const url = getSearchUrl(query, pageNum);
    
    const pageContent = await getPuppeteerPage(url);
    const $ = cheerio.load(pageContent.html);
    const queryItems = [];

    $('.product__item-name').each((i, header) => {
      const store = 'Sulpak';
      const link = $(header).find('a').attr('href');
      const title = $(header).text().trim();
      const price = $(header).closest('.product__item').find('.product__item-price').text().trim().replace(/[₸\s]/g, "");

      const fullurl = link ? (link.startsWith('http') ? link : `https://www.sulpak.kz${link}`) : null;
      const category = extractCategoryFromUrl(fullurl);
      
      // 🔹 Заменяем старую проверку на новую, с порогом 0.6 (можно настроить)
      const matchesQuery = matchesQueryWords(title, query, 0.6);

      // 🔹 Фильтруем только релевантные товары
      if (matchesQuery) {
        queryItems.push({ 
          store, 
          title, 
          price, 
          link: fullurl, 
          category: category, 
          query,
          parsedAt: new Date().toISOString()
        });
      }
    });

    // 🔹 Сохраняем в БД, но не ломаем ответ, если БД упала
    try {
      if (queryItems.length > 0) {
        await saveToDB(queryItems);
      }
    } catch (dbError) {
      console.error('❌ Ошибка сохранения в БД:', dbError.message);
    }

    allResults.push(...queryItems);
  }

  return allResults;
}

// 🔹 Экспорт по умолчанию для удобства импорта
export default { parseSulpak };