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


export const formatPercentage = (change) => {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};


export const getPriceChangeColor = (change) => {
  if (change > 0) return 'text-red-500'; // Рост цены - плохо
  if (change < 0) return 'text-accent-green'; // Падение цены - хорошо
  return 'text-contrast-gray'; // Без изменений
};


export const getPriceChangeIcon = (change) => {
  if (change > 0) return '↑';
  if (change < 0) return '↓';
  return '—';
};


export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};


export const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


export const formatDate = (date) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('kz-KZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
};


export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
