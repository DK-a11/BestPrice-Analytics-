import { useState, useEffect } from 'react';

const STORAGE_KEY = 'price_parser_search_history';
const MAX_HISTORY_ITEMS = 10;

const useSearchHistory = () => {
  const [history, setHistory] = useState([]);

  // Загрузить историю из localStorage при монтировании
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  // Добавить запрос в историю
  const addToHistory = (query) => {
    if (!query || query.trim() === '') return;

    setHistory((prevHistory) => {
      // Убрать дубликаты
      const filteredHistory = prevHistory.filter(
        (item) => item.toLowerCase() !== query.toLowerCase()
      );

      // Добавить новый запрос в начало
      const newHistory = [query, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

      // Сохранить в localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Error saving search history:', error);
      }

      return newHistory;
    });
  };

  // Очистить всю историю
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  // Удалить конкретный элемент из истории
  const removeFromHistory = (query) => {
    setHistory((prevHistory) => {
      const newHistory = prevHistory.filter((item) => item !== query);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Error removing from search history:', error);
      }

      return newHistory;
    });
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
};

export default useSearchHistory;
