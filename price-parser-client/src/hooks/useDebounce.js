import { useState, useEffect } from 'react';

/**
 * Хук для debounce значения
 * @param {*} value - Значение для debounce
 * @param {number} delay - Задержка в миллисекундах
 * @returns {*} Debounced значение
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
