import { URL } from 'url' ;
import { DIRECT_MAP, REGEX_MAP, IGNORE_SEGMENTS } from './categoryMapping.js';

export function extractCategoryFromUrl(urlString) {
  try {
    const url = new URL(urlString);
    const segments = url.pathname.split('/').map(s => s.toLowerCase()).filter(s => s);
    
    console.log('URL:', urlString);
    console.log('Сегменты:', segments);
    
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      
      if (IGNORE_SEGMENTS.includes(segment)) {
        console.log(`Пропущен: ${segment} (в IGNORE_SEGMENTS)`);
        continue;
      }
      
      if (segment.includes('-') || segment.includes('_')) {
        console.log(`Разложение ссылки "${segment}" по дефису или нижнему подчеркиванию:`);
        const words = segment.split(/[-_]/);
        
        for (const word of words) {
          console.log(`    - Проверяю "${word}"`);
          
          if (word.length < 3 || /^\d+$/.test(word)) continue;
          
          // DIRECT_MAP
          if (DIRECT_MAP[word]) {
            console.log(`Найдено в DIRECT_MAP → ${DIRECT_MAP[word]}`);
            return DIRECT_MAP[word];
          }
          
          // REGEX_MAP
          for (const { pattern, category } of REGEX_MAP) {
            if (pattern.test(word)) {
              console.log(`Найдено в REGEX_MAP → ${category}`);
              return category;
            }
          }
        }
        continue;
      }
      
      if (/\d/.test(segment)) {
        console.log(`Пропущен: ${segment} (цифры)`);
        continue;
      }
      
      if (DIRECT_MAP[segment]) {
        console.log(`Найдено в DIRECT_MAP → ${DIRECT_MAP[segment]}`);
        return DIRECT_MAP[segment];
      }
      
      for (const { pattern, category } of REGEX_MAP) {
        if (pattern.test(segment)) {
          console.log(`Найдено в REGEX_MAP → ${category}`);
          return category;
        }
      }
    }
    
    console.log('Итог: uncategorized\n');
    return 'uncategorized';
    
  } catch (e) {
    console.error('URL Parse Error:', urlString, e);
    return 'uncategorized';
  }
}

export default { extractCategoryFromUrl };