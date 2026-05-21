import * as cheerio from 'cheerio';
import { getPuppeteerPage } from './helpers/puppeteer.js';
import { arrayFromlength } from './helpers/common.js';
import { saveToDB } from './helpers/savetodb.js';
import { extractCategoryFromUrl } from './helpers/categoryExtract.js';


const getSearchUrl = (query, page = 1) => {
  return `https://alfa.kz/q/${encodeURIComponent(query)}#products`;
};


const normalizeText = (str) => {
  if (!str) return [];
  return str
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, ' ') 
    .replace(/-/g, ' ')                 
    .trim()
    .split(/\s+/)
    .filter(Boolean);                   
};


const matchesQueryWords = (title, query, threshold = 0.6) => {
  if (!title || !query) return false;

  const titleWords = new Set(normalizeText(title)); 
  const queryWords = normalizeText(query);

  if (queryWords.length === 0) return false;

  const matchedCount = queryWords.filter(word => titleWords.has(word)).length;
  return matchedCount / queryWords.length >= threshold;
};


export async function parseAlfa(query, pages = 1) {
  const allResults = [];

  for (const pageNum of arrayFromlength(pages)) {
    const url = getSearchUrl(query, pageNum);
    
    const pageContent = await getPuppeteerPage(url);
    const $ = cheerio.load(pageContent.html);
    const queryItems = [];

    $('.body').each((i, header) => {
      const store = 'Alfa';
      const link = $(header).find('a').attr('href');
      const title = $(header).find('[itemprop="name"]').text().trim();
      const price = $(header).find('.price').text().trim().replace(/[₸\s]/g, "");

      const fullurl = link ? (link.startsWith('http') ? link : `https://alfa.kz${link}`) : null;
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
      console.error('❌ Ошибка сохранения в БД:', dbError.message);
    }

    allResults.push(...queryItems);
  }

  return allResults;
}


export default { parseAlfa };