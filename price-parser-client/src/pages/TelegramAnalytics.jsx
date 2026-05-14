import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // ✅ уже подключён у вас
import WebApp from '@twa-dev/sdk';
import AnalyticsBlock from '../components/Analytics/AnalyticsBlock';
import PopularProductsBlock from '../components/PopularProducts/PopularProductsBlock';

function TelegramAnalytics() {
  const [searchParams] = useSearchParams(); // 👈 читаем URL-параметры
  const queryFromChat = searchParams.get('query') || '';
  
  useEffect(() => {
    try {
      WebApp.expand();
      WebApp.ready();
      
      if (queryFromChat) {
        console.log('Получен запрос из чата:', queryFromChat);
        // Можно отправить аналитику или показать лоадер
      }
    } catch (e) {
      console.warn('Not in Telegram');
    }
  }, [queryFromChat]);

  return (
    <div className="telegram-analytics min-h-screen bg-primary-white pb-8">
      <div className="bg-white border-b border-accent-green sticky top-0 z-10 px-4 py-3 shadow-sm">
        <h1 className="text-xl font-bold text-text-black text-center">
          📊 Аналитика PriceParser
        </h1>
      </div>

      <main className="container mx-auto px-4 py-6">
        <AnalyticsBlock 
          productId={'demo-product-1'} 
          query={queryFromChat}  // ✅ Передаём текст из чата
          isTelegram={true} 
        />
        <PopularProductsBlock 
        query={queryFromChat}
        isTelegram={true} 
        />
      </main>
    </div>
  );
}

export default TelegramAnalytics;