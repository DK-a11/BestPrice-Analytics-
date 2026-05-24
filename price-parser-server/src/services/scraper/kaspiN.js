import * as cheerio from 'cheerio';
import { getPuppeteerPage } from './helpers/puppeteer.js';
import { arrayFromlength } from './helpers/common.js';
import { saveToDB } from './helpers/savetodb.js';
import { extractCategoryFromUrl } from './helpers/categoryExtract.js';

const getSearchUrl = (query, page = 1) => {
  return `https://obyavleniya.kaspi.kz/k--${encodeURIComponent(query)}/`;
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

export async function parseKaspi(query, pages = 1) {
  const allResults = [];

  for (const pageNum of arrayFromlength(pages)) {
    const url = getSearchUrl(query, pageNum);
    
    const pageContent = await getPuppeteerPage(url);
    const $ = cheerio.load(pageContent.html);
    const queryItems = [];

    $('[class="listing-item-horizontal listing-item-horizontal--desktop search__listing-advert"]').each((i, header) => {
      const store = 'Kaspi';
      const link = $(header).find('a').first().attr('href');
      const title = $(header).find('.listing-item-horizontal__title').text().trim();
      const price = $(header).find('[class="listing-item-horizontal__price"]').text().trim().replace(/[₸\s]/g, "");

      const fullurl = link ? (link.startsWith('http') ? link : `https://obyavleniya.kaspi.kz/${link}`) : null;
      const category = extractCategoryFromUrl(fullurl);
      
      const matchesQuery = matchesQueryWords(title, query, 0.6);

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

    try {
      if (queryItems.length > 0) {
        await saveToDB(queryItems);
      }
    } catch (dbError) {
      console.error('Ошибка сохранения в БД:', dbError.message);
    }

    allResults.push(...queryItems);
  }

  return allResults;
}

export default { parseKaspi };