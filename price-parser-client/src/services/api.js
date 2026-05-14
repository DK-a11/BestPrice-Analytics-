import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ============= ПОИСК =============

/**
 * Получить автодополнение для поискового запроса
 * @param {string} query - Поисковый запрос
 * @param {string} category - Категория (optional)
 * @param {number} limit - Максимальное количество результатов
 * @returns {Promise}
 */
export const searchSuggestions = (query, category = null, limit = 8) => {
  return apiClient.get('/search/suggestions', {
    params: { q: query, category, limit }
  });
};

/**
 * Выполнить поиск товаров
 * @param {string} query - Поисковый запрос
 * @param {object} options - Опции поиска (category, priceRange, stores)
 * @returns {Promise}
 */
export const searchProducts = (query, options = {}) => {
  return apiClient.post('/search/query', { query, ...options });
};

// ============= АНАЛИТИКА =============

/**
 * Получить историю изменения цен товара
 * @param {string} productId - ID товара
 * @param {string} period - Период (7d, 30d, 90d)
 * @returns {Promise}
 */
export const getPriceHistory = (productId, period = '30d') => {
  return apiClient.get(`/analytics/price-history/${productId}`, {
    params: { period }
  });
};

/**
 * Получить сравнение цен по магазинам
 * @param {string} productId - ID товара
 * @returns {Promise}
 */
export const getStoreComparison = (productId) => {
  return apiClient.get(`/analytics/store-comparison/${productId}`);
};

/**
 * Получить аналитические инсайты по товару
 * @param {string} productId - ID товара
 * @returns {Promise}
 */
export const getProductInsights = (productId) => {
  return apiClient.get(`/analytics/insights/${productId}`);
};

// ============= ПОПУЛЯРНЫЕ ТОВАРЫ =============

/**
 * Получить популярные товары
 * @param {string} category - Категория (all, electronics, clothing, etc.)
 * @param {number} limit - Максимальное количество товаров
 * @returns {Promise}
 */
export const getPopularProducts = (category = 'all', limit = 12) => {
  return apiClient.get('/products/popular', {
    params: { category, limit }
  });
};

/**
 * Получить популярные магазины
 * @returns {Promise}
 */
export const getPopularStores = () => {
  return apiClient.get('/stores/popular');
};

/**
 * Получить категории товаров
 * @returns {Promise}
 */
export const getCategories = () => {
  return apiClient.get('/categories');
};

// ============= ТОВАРЫ =============

/**
 * Получить детальную информацию о товаре
 * @param {string} productId - ID товара
 * @returns {Promise}
 */
export const getProductDetails = (productId) => {
  return apiClient.get(`/products/${productId}`);
};



export const parseProducts = async (query, options = {}) => {
  const { pages = 1, stores = [] } = options;
  
  // Формируем тело запроса
  const requestBody = {
    query,
    pages: parseInt(pages) || 1,
  };
  
  // 🔥 Добавляем stores только если массив не пустой
  // Бэкенд при undefined сам подставит все магазины
  if (Array.isArray(stores) && stores.length > 0) {
    requestBody.stores = stores;
  }

  const response = await axios.post(`${API_BASE_URL}/parse`, requestBody);
  
  return response.data;
};

export const extractCProducts = async (query) => {
  // 🔹 Склеиваем: база + конечный путь
  const response = await axios.get(`${API_BASE_URL}/analytics/comparison`, {
    params: { query}
  });

  return response.data;
};

export const extractHProducts = async (query) => {
  // 🔹 Склеиваем: база + конечный путь
  const response = await axios.get(`${API_BASE_URL}/analytics/history`, {
    params: { query }
  });

  return response.data;
};

export const extractIProducts = async (query) => {
  // 🔹 Склеиваем: база + конечный путь
  const response = await axios.get(`${API_BASE_URL}/analytics/insights`, {
    params: { query }
    
  });

  return response.data;
};


export const extractProducts = async (query) => {
  // 🔹 Склеиваем: база + конечный путь
  const response = await axios.get(`${API_BASE_URL}/analytics/products`, {
    params: { query }
  });

  return response.data;
};

export const exportProducts = async (query) => {
  // 🔹 Склеиваем: база + конечный путь
  const response = await axios.get(`${API_BASE_URL}/products/export`, {
    params: { query },
    responseType: 'blob',
    headers: {
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  });
  return response.data;
};


export default apiClient;
