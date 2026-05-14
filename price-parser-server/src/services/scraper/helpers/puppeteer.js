import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export const LAUNCH_PUPPETEER_OPTS = {
    headless: false, 
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--disable-blink-features=AutomationControlled',
        // 🔹 Дополнительные аргументы для "человечности"
        '--disable-features=IsolateOrigins,site-per-process',
    ],
    //отключил стандартный User-Agent Puppeteer
    defaultViewport: null,
};

export const PAGE_PUPPETEER_OPTS = {
    waitUntil: 'networkidle2',
    timeout: 60000, 
};

// 🔹 Реалистичные заголовки и User-Agent
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

        // 1. Устанавливаем реалистичный User-Agent
        await page.setUserAgent(REALISTIC_USER_AGENT);

        // 2. Устанавливаем заголовки как у обычного браузера
        await page.setExtraHTTPHeaders(REALISTIC_HEADERS);

        // 3. Устанавливаем реалистичный viewport (если не задан в launch)
        if (!LAUNCH_PUPPETEER_OPTS.defaultViewport) {
            await page.setViewport({ width: 1920, height: 1080 });
        }

        // 4. Случайная задержка перед запросом (имитация человека)
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

        // 5. Переход на страницу
        await page.goto(url, PAGE_PUPPETEER_OPTS);

        // 6. Ждём либо контент, либо исчезновение проверки Cloudflare
        await Promise.race([
            // Ждём появления типичных элементов каталога (адаптируйте под сайт)
            page.waitForSelector('[class*="product"], [class*="item"], .catalog, .shop-name', { timeout: 25000 }).catch(() => {}),
            // ИЛИ ждём исчезновения экрана загрузки Cloudflare
            page.waitForFunction(() => {
                const challenge = document.querySelector('#challenge-stage, .lds-ring, [class*="challenge"]');
                return !challenge;
            }, { timeout: 25000, polling: 500 }).catch(() => {}),
        ]);

        // 7. Небольшая пауза после загрузки для полного рендеринга
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

        // 8. Проверяем, не остались ли мы на странице защиты
        const currentUrl = page.url();
        if (currentUrl.includes('/cdn-cgi/challenge-platform/')) {
            console.warn('⚠️ Cloudflare всё ещё активен. Текущий URL:', currentUrl);
        }

        const content = await page.content();
        
        // 9. Возвращаем не только HTML, но и метаданные для отладки
        return {
            html: content,
            url: currentUrl,
            title: await page.title(),
            isCloudflare: content.includes('challenge-platform') || content.includes('turnstile')
        };

    } catch (error) {
        console.error('❌ Ошибка в getPuppeteerPage:', error.message);
        throw error;
    } finally {
        // 10. Гарантированно закрываем браузер даже при ошибке
        if (browser) {
            await browser.close();
        }
    }
}