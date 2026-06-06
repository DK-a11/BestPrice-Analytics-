import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import nodeTelegramBotApi from "node-telegram-bot-api";
import parserRoutes from './services/scraper/routes/parserRoutes.js'; // потом подключишь это вместо фейковых роутов
import fakeRoutes from './services/scraper/routes/fakeRoutes.js';
import analyticsCompRoutes from './services/scraper/routes/analyticsCompRoutes.js';
import analyticsHistRoutes from './services/scraper/routes/analyticsHistRoutes.js'; 
import analyticsInsightRoutes from './services/scraper/routes/analyticsInsightRoutes.js'; 
import analyticstRoutes from './services/scraper/routes/analyticsRoutes.js'; 
import productExportRoutes from './services/scraper/routes/productExport.js';
import userRoutes from './services/scraper/routes/userRoutes.js';
import authRoutes from './services/scraper/routes/authRoutes.js';
import querySaveRoutes from './services/scraper/routes/querySaveRoutes.js';
import queryhistory from './services/scraper/routes/queryhistory.js';
import emailRoutes from './services/scraper/routes/emailRoutes.js';

dotenv.config();
const app = express(); // Разрешаем CORS для нашего фронтенда
const TOKEN = process.env.TOKEN_BOT || "7757852587:AAH2XzfSiarMbB5H5ZoFR6WxukiXbHPB_dA"; // Получаем токен из переменных окружения
const bot = new nodeTelegramBotApi(TOKEN, { polling: true });
const weburl = `https://dismay-bonanza-duo.ngrok-free.dev/tg-app?query=`;
const ALLOWED_ORIGINS = [
  'https://dismay-bonanza-duo.ngrok-free.dev',
  'https://dismay-bonanza-duo.ngrok-free.dev/tg-app',     // Домен, где лежит Telegram Web App
  'http://localhost:5173', 
  'https://best-price-analytics-ear7-m5a4iacg9-dk-a11-s-projects.vercel.app',
  'https://best-price-analytics-ear7.vercel.app',
  'https://bestprice-analytics.pages.dev'
];

const STOP_WORDS = [
    "привет", "здравствуйте", "hello", "hi", "hey",
    "start", "помощь", "help", "команды",  "/analytics", 
    "как дела", "кто ты", "что ты умеешь"
];

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // Игнорируем не-текстовые сообщения (фото, стикеры, геолокация и т.д.)
  if (!text) return;

  const lowerText = text.toLowerCase();

  try {
    // 1. ПРИОРИТЕТ: Обработка команд. return предотвращает fall-through в блэклист
    if (lowerText === "/start" || lowerText === "привет" || lowerText === "здравствуйте" || lowerText === "hello") {
      return await bot.sendMessage(chatId, 
        "Приветствую! Я бот для парсинга цен. Введите название товара, и я постараюсь найти его цену.\nДля получения справки введите /help"
      );
    }

    if (lowerText === "/help") {
      return await bot.sendMessage(chatId, 
        "Вот что я умею:\n" +
        "🚀 /start — начать работу с ботом\n" +
        "Запускает бота, активирует все функции и помогает быстро приступить к работе.\n" +
        "❓ /help — справка\n" +
        "Показывает список доступных команд и краткое описание того, как ими пользоваться.\n" +
        "/FAQ — часто задаваемые вопросы\n" +
        "Предоставляет ответы на самые популярные вопросы о работе бота и его функционале."
      );
    }

    if (text === "/FAQ") {
      return await bot.sendMessage(chatId, 
        "Часто задаваемые вопросы:\n" +
        "1. Как часто система обновляет данные о ценах?\n" +
        "Ответ: Система не привязана к жесткому расписанию — роботы работают по вашему запросу.\n" +
        "2. Какие интернет-магазины и сайты можно отслеживать?\n" +
        "Система поддерживает парсинг большинства публичных сайтов включая маркетплейсы (Alser, Sulpak, Kaspi, Alfa).\n" +
        "3. Можно ли отслеживать не только цену, но и наличие товара?\n" +
        "Система добавляет только существующие в наличии данные для аналитики \n" +
        "4. Можно ли сравнивать цены по нескольким магазинам?\n" +
        "Да, система предоставляет информацию о ценах, наличии и других характеристиках товаров сразу с нескольких магазинов.\n" +
        "5.  Как выглядят аналитические отчеты и можно ли их экспортировать?\n" +
        "Аналитические отчеты предоставляются в виде Excel.\n"
      );
    }

    // 2. Блэклист проверяется ТОЛЬКО если это не команда
    if (STOP_WORDS.includes(lowerText)) {
      return await bot.sendMessage(chatId, "Пожалуйста, введите название товара для поиска цен.");
    }

    // 3. Анимация "печатает..."
    await bot.sendChatAction(chatId, "typing");
    
    // Опционально: небольшая задержка, чтобы пользователь точно заметил анимацию (800мс)
    await new Promise(resolve => setTimeout(resolve, 800));

    // 4. Безопасная передача названия в URL
    const safeQuery = encodeURIComponent(text);
    
    //return await bot.sendMessage(chatId, `📦 Товары для аналитики: ${text}`, {
    //  reply_markup: {
    //    inline_keyboard: [
    //      [{ text: "Смотреть аналитику", web_app: { url: `${weburl}${safeQuery}` } }]
    //    ]
    //  }
    //});
  } catch (error) {
    console.error(`[Bot Error] chatId: ${chatId}, text: "${text}"`, error.message);
    // Можно добавить уведомление пользователю, если ошибка критичная
    // bot.sendMessage(chatId, "⚠️ Произошла ошибка. Попробуйте позже.");
  }
});


async function startServer() {
  app.use(cors({
  origin: function (origin, callback) {
    // Разрешаем запросы без Origin (curl, мобильные приложения, некоторые тесты)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: ${origin} не разрешён`));
    }
  },
  credentials: true, // Обязательно, если используете куки/сессии/Authorization
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data']
  }));
  app.use(express.json());

  app.use('/api', parserRoutes);
  app.use('/api', analyticsCompRoutes);
  app.use('/api', analyticsHistRoutes);
  app.use('/api', analyticsInsightRoutes);
  app.use('/api', analyticstRoutes);
  app.use('/api', productExportRoutes);
  app.use('/api', userRoutes); 
  app.use('/api', authRoutes); 
  app.use('/api', querySaveRoutes);
  app.use('/api', queryhistory); // Роуты для истории запросов
  app.use('/api', emailRoutes); // Роуты для отправки email


  app.listen(4200, () => {
    console.log('Server is running on port 4200');
  });

};

startServer();