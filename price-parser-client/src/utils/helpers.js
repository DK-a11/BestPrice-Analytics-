/**
 * Форматирование цены в тенге
 * @param {number} price - Цена
 * @returns {string} - Отформатированная цена
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('kz-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Форматирование процента изменения
 * @param {number} change - Процент изменения
 * @returns {string} - Отформатированный процент
 */
export const formatPercentage = (change) => {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

/**
 * Получить класс цвета для изменения цены
 * @param {number} change - Изменение цены
 * @returns {string} - CSS класс
 */
export const getPriceChangeColor = (change) => {
  if (change > 0) return 'text-red-500'; // Рост цены - плохо
  if (change < 0) return 'text-accent-green'; // Падение цены - хорошо
  return 'text-contrast-gray'; // Без изменений
};

/**
 * Получить иконку для изменения цены
 * @param {number} change - Изменение цены
 * @returns {string} - Символ стрелки
 */
export const getPriceChangeIcon = (change) => {
  if (change > 0) return '↑';
  if (change < 0) return '↓';
  return '—';
};

/**
 * Обрезать текст до определенной длины
 * @param {string} text - Текст
 * @param {number} maxLength - Максимальная длина
 * @returns {string} - Обрезанный текст
 */
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Получить случайное число в диапазоне
 * @param {number} min - Минимум
 * @param {number} max - Максимум
 * @returns {number} - Случайное число
 */
export const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Форматирование даты
 * @param {string|Date} date - Дата
 * @returns {string} - Отформатированная дата
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('kz-KZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

/**
 * Задержка (для демо и тестирования)
 * @param {number} ms - Миллисекунды
 * @returns {Promise}
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
