import nodeTelegramBotApi from "node-telegram-bot-api";

const token = "7757852587:AAH2XzfSiarMbB5H5ZoFR6WxukiXbHPB_dA";

const bot = new nodeTelegramBotApi(token, { polling: true });
const weburl = "https://dismay-bonanza-duo.ngrok-free.dev";

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if(text === "/start") { 
    bot.sendMessage(chatId, "Приветствую! Я бот для парсинга цен. Введите название товара, и я постараюсь найти его цену.\nДля получения справки введите /help");
  }

  if (text === "/analytics") {
    bot.sendMessage(chatId, "Введите название товара, и я постараюсь найти его цену.", 
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Перейти на сайт", web_app: { url: weburl } }
                    ]
                ]
            }
        });
  }

  if (text === "/help") {
    bot.sendMessage(chatId, " Вот что я могу: \n/start - для начала общения со мной.\n/help - для получения справки.\n/analytics - Введите название товара, и я постараюсь найти его цену. ");
  }
});
