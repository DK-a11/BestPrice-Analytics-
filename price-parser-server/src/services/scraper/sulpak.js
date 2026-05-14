import * as cheerio from 'cheerio'
import { getPuppeteerPage } from './helpers/puppeteer.js'
import { arrayFromlength } from './helpers/common.js'
import {saveToDB} from './helpers/savetodb.js'

const query = 'iphone';
const pages = 1;
const SITE = `https://obyavleniya.kaspi.kz/k--${query}/`;
//1. export функции для использования в других модулях
(async function main() {
    try {
        for(const page of arrayFromlength(pages)) {
        const url = `${SITE}`
        const pagecontent = await getPuppeteerPage(url)
        console.log(pagecontent);
        const queryitems = []
        const $ = cheerio.load(pagecontent.html)

        $('[class="listing-item-horizontal listing-item-horizontal--desktop search__listing-advert"]').each((i, header) => {
          const store = 'Kaspi';
          const link = $(header).find('a').first().attr('href');
          const title = $(header).find('.listing-item-horizontal__title').text().trim();
          const price = $(header).find('[class="listing-item-horizontal__price"]').text().trim().replace(/[₸\s]/g, "");
            
        queryitems.push({ store, title, price, link, query })

        });

        console.log(queryitems);

        }

    }catch (error) {
        console.error(error);
    }
})()

//"start": "node ./src/services/scraper/sulpakold.js"
//"start": "node ./src/server.js"