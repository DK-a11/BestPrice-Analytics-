import * as cheerio from 'cheerio';
import { getPuppeteerPage } from './helpers/puppeteer.js';
import { arrayFromlength } from './helpers/common.js';
import { saveToDB } from './helpers/savetodb.js';
import { extractCategoryFromUrl } from './helpers/categoryExtract.js';

const getSearchUrl = (query, page = 1) => {
  return `https://alser.kz/search?q=${encodeURIComponent(query)}&page=${page}`;
};

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


export async function parseAlser(query, pages = 1) {
  const allResults = [];

  for (const pageNum of arrayFromlength(pages)) {
    const url = getSearchUrl(query, pageNum);
    
    const pageContent = await getPuppeteerPage(url);
    
    console.log('Alser загрузка:', {
      url: pageContent.url,
      title: pageContent.title,
      cloudflare: pageContent.isCloudflare ? '✅' : '❌',
      htmlLength: pageContent.html.length
    });

    const $ = cheerio.load(pageContent.html);
    const queryItems = [];

    $('[class="relative fade-in"]').each((i, header) => {
      const store = 'Alser';
      const link = $(header).attr('href');
      const title = $(header).find('[class="product-card__title pointer-events-auto product-card__title--grid-card"]').text().trim();
      const price = $(header).find('[class="info-container-product-price"]').text().trim().replace(/[₸\s]/g, "");

      const category = extractCategoryFromUrl(link);

      const matchesQuery = matchesQueryWords(title, query, 0.6);

      if (matchesQuery) {
        queryItems.push({ 
          store,
          title, 
          price, 
          link: link ? (link.startsWith('http') ? link : `https://alser.kz${link}`) : null, 
          category: category,
          query,
          parsedAt: new Date().toISOString()
        });
      }
    });

    // 🔹 Сохранение в БД с изоляцией ошибок
    try {
      if (queryItems.length > 0) {
        await saveToDB(queryItems);
      }
    } catch (dbError) {
      console.error('Alser: Ошибка сохранения в БД:', dbError.message);
    }

    allResults.push(...queryItems);
  }

  return allResults;
}

export default { parseAlser };