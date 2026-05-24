import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const parseProducts = async (query, options = {}) => {
  const { pages = 1, stores = [] } = options;
  
  const requestBody = {
    query,
    pages: parseInt(pages) || 1,
  };
  

  if (Array.isArray(stores) && stores.length > 0) {
    requestBody.stores = stores;
  }

  const response = await axios.post(`${API_BASE_URL}/parse`, requestBody);
  
  return response.data;
};

export const extractCProducts = async (query, options = {}) => {
  const { stores = [] } = options;
  const params = { query };
  
  if (Array.isArray(stores) && stores.length > 0) {
    params.stores = stores.join(','); // 🔥 Сериализуем в строку: "alser,kaspi"
  }

  const response = await axios.get(`${API_BASE_URL}/analytics/comparison`, { params });
  return response.data;
};

export const extractHProducts = async (query, options = {}) => {
  const { stores = [] } = options;
  const params = { query };
  
  if (Array.isArray(stores) && stores.length > 0) {
    params.stores = stores.join(',');
  }

  const response = await axios.get(`${API_BASE_URL}/analytics/history`, { params });
  return response.data;
};

export const extractIProducts = async (query, options = {}) => {
  const { stores = [] } = options;
  const params = { query };
  
  if (Array.isArray(stores) && stores.length > 0) {
    params.stores = stores.join(',');
  }

  const response = await axios.get(`${API_BASE_URL}/analytics/insights`, { params });
  return response.data;
};


export const extractProducts = async (query, options = {}) => {
  const { stores = [] } = options;
  const params = { query };
  
  if (Array.isArray(stores) && stores.length > 0) {
    params.stores = stores.join(',');
  }

  const response = await axios.get(`${API_BASE_URL}/analytics/products`, { params });
  return response.data;
};

export const exportProducts = async (query) => {
  const response = await axios.get(`${API_BASE_URL}/products/export`, {
    params: { query },
    responseType: 'blob',
    headers: {
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  });
  return response.data;
};

export const SaveUsers = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/register`, {
    userData
  });

  return response.data;
};

export const LoginUsers = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/login`, 
    userData
  );

  return response.data;
};

export const querySave = async ({ userId, query }) => {
  console.log(' querySave вызвана с:', { userId, query });
  
  if (!query || !query.trim()) {
    console.warn('⚠️ Пустой query');
    return null;
  }

  const payload = {
    query: query.trim(),
  };

  if (userId && userId.trim()) {
    payload.Id = userId;
  }

  console.log('📦 Финальный payload:', JSON.stringify(payload, null, 2));
  console.log('📍 API URL:', `${API_BASE_URL}/query`);

  try {
    const response = await axios.post(`${API_BASE_URL}/query`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ Ответ сервера:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка запроса:', error);
    console.error('📄 Response data:', error.response?.data);
    console.error('📄 Response status:', error.response?.status);
    console.error('📄 Response headers:', error.response?.headers);
    throw error;
  }
};


// 🔹 Получение истории поиска пользователя
export const getUserHistory = async (userId, limit = 20) => {
  console.log('📥 getUserHistory вызвана с:', { userId, limit });
  
  if (!userId || !userId.trim()) {
    console.warn('⚠️ userId не передан в getUserHistory');
    return [];
  }

  const payload = {
    Id: userId.trim(),
    limit,
  };

  console.log('📦 Payload для истории:', JSON.stringify(payload, null, 2));
  console.log('📍 API URL:', `${API_BASE_URL}/query/history`);

  try {
    const response = await axios.get(`${API_BASE_URL}/query/history`, {
      params: payload, // ?Id=xxx&limit=20
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ История получена:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка загрузки истории:', error);
    console.error('📄 Response data:', error.response?.data);
    console.error('📄 Response status:', error.response?.status);
    console.error('📄 Response headers:', error.response?.headers);
    throw error;
  }
};

// 🔹 Очистка истории поиска пользователя
export const clearUserHistory = async (userId) => {
  console.log('🗑️ clearUserHistory вызвана с:', { userId });
  
  if (!userId || !userId.trim()) {
    console.warn('⚠️ userId не передан в clearUserHistory');
    return { success: false, message: 'userId required' };
  }

  const payload = {
    Id: userId.trim(),
  };

  console.log('📦 Payload для очистки:', JSON.stringify(payload, null, 2));
  console.log('📍 API URL:', `${API_BASE_URL}/query/history`);

  try {
    const response = await axios.delete(`${API_BASE_URL}/query/history`, {
      data: payload, // отправляем в body для consistency с querySave
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ История очищена:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Ошибка очистки истории:', error);
    console.error('📄 Response data:', error.response?.data);
    console.error('📄 Response status:', error.response?.status);
    console.error('📄 Response headers:', error.response?.headers);
    throw error;
  }
};

export default apiClient;
