import * as cheerio from 'cheerio'
import { getPuppeteerPage } from './helpers/puppeteer.js'
import { arrayFromlength } from './helpers/common.js'
import {saveToDB} from './helpers/savetodb.js'

const query = 'iphone'
const SITE = `https://alser.kz/search?q=${query}`
const pages = 1;

(async function main() {
    try {
        for(const page of arrayFromlength(pages)) {
        const url = `${SITE}&page=${page}`
        const pagecontent = await getPuppeteerPage(url)
        //console.log(pagecontent);
        const queryitems = []
        const $ = cheerio.load(pagecontent.html)

        console.log('📊 Результат загрузки:');
        console.log('  URL:', pagecontent.url);
        console.log('  Title:', pagecontent.title);
        console.log('  Cloudflare:', pagecontent.isCloudflare ? '✅ активен' : '❌ нет');
        console.log('  Длина HTML:', pagecontent.html.length);

        //if (pagecontent.isCloudflare) {
        //    // Выводим первые 500 символов для понимания, что вернулось
        //    console.log('📄 Фрагмент ответа:', pagecontent.html.substring(0, 500));
        //}

        $('[class="relative fade-in"]').each((i, header) => {
            const shopname = 'alser'
            const link = $(header).attr('href')
            const title = $(header).find('[class="product-card__title pointer-events-auto product-card__title--grid-card"]').text().trim()
            const price = $(header).find('[class="info-container-product-price"]').text().trim()

            if (title.toLowerCase().includes(query.toLowerCase())) {
                queryitems.push({ shopname, title, price, link, query })
            }
        });

        console.log(queryitems);

        }

    }catch (error) {
        console.error(error);
    }
})()