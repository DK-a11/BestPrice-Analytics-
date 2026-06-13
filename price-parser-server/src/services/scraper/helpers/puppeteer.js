import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import chromium from "@sparticuz/chromium";

puppeteer.use(StealthPlugin());

// Определяем окружение
const isProduction = process.env.NODE_ENV === 'production';

export const LAUNCH_PUPPETEER_OPTS = {
    headless: isProduction ? chromium.headless : false,
    args: isProduction 
        ? chromium.args  // Используем аргументы Chromium для Render
        : [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920x1080',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
        ],
    defaultViewport: chromium.defaultViewport,
    executablePath: isProduction ? await chromium.executablePath() : undefined,
};

export const PAGE_PUPPETEER_OPTS = {
    waitUntil: 'networkidle2',
    timeout: 60000, 
};

const REALISTIC_HEADERS = {
    'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
};

const REALISTIC_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function getPuppeteerPage(url) {
    let browser = null;
    
    try {
        browser = await puppeteer.launch(LAUNCH_PUPPETEER_OPTS);
        const page = await browser.newPage();

        await page.setUserAgent(REALISTIC_USER_AGENT);
        await page.setExtraHTTPHeaders(REALISTIC_HEADERS);

        if (!LAUNCH_PUPPETEER_OPTS.defaultViewport) {
            await page.setViewport({ width: 1920, height: 1080 });
        }

        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        await page.goto(url, PAGE_PUPPETEER_OPTS);

        await Promise.race([
            page.waitForSelector('[class*="product"], [class*="item"], .catalog, .shop-name', { timeout: 25000 }).catch(() => {}),
            page.waitForFunction(() => {
                const challenge = document.querySelector('#challenge-stage, .lds-ring, [class*="challenge"]');
                return !challenge;
            }, { timeout: 25000, polling: 500 }).catch(() => {}),
        ]);

        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

        const currentUrl = page.url();
        if (currentUrl.includes('/cdn-cgi/challenge-platform/')) {
            console.warn('Cloudflare всё ещё активен. Текущий URL:', currentUrl);
        }

        const content = await page.content();
        
        return {
            html: content,
            url: currentUrl,
            title: await page.title(),
            isCloudflare: content.includes('challenge-platform') || content.includes('turnstile')
        };

    } catch (error) {
        console.error('Ошибка в getPuppeteerPage:', error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
