import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiClock, FiTrendingUp } from 'react-icons/fi';
import useDebounce from '../../hooks/useDebounce';
import './SearchBar.css';
import { parseProducts, querySave, getUserHistory, clearUserHistory } from '../../services/api';

const SearchBar = ({ 
  onSearch, 
  selectedStores = [], 
  onToggleStore, 
  onSelectAll, 
  onDeselectAll,
  storesConfig = [],
  userId = null
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // 🔥 Состояние истории (загружается с бэкенда)
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef(null);

  // 🔥 Загрузка истории при изменении userId
  useEffect(() => {
    if (userId) {
      loadUserHistory(userId);
    } else {
      setHistory([]);
    }
  }, [userId]);

  // 🔥 Загрузка подсказок при вводе
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      updateLocalSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUserHistory = async (uid) => {
    setIsHistoryLoading(true);
    try {
      const data = await getUserHistory(uid);
      // Ожидаем массив строк или объектов { query: "..." }
      const queries = data.map(item => 
        typeof item === 'string' ? item : item.query
      );
      setHistory(queries);
    } catch (error) {
      console.error('❌ Error loading history:', error);
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const addToHistory = async (searchQuery) => {
    if (!searchQuery?.trim()) return;
    
    const trimmed = searchQuery.trim();
    
    // Локальное обновление: убираем дубли, добавляем в начало, лимит 50
    setHistory(prev => {
      const filtered = prev.filter(item => 
        item.toLowerCase() !== trimmed.toLowerCase()
      );
      return [trimmed, ...filtered].slice(0, 50);
    });

    // Сохранение на бэкенд
    if (userId) {
      try {
        await querySave({ userId, query: trimmed });
      } catch (err) {
        console.error('❌ Failed to save query to DB:', err);
      }
    }
  };

  const clearHistory = async () => {
    setHistory([]); // мгновенная очистка UI
    if (userId) {
      try {
        await clearUserHistory(userId);
      } catch (error) {
        console.error('❌ Error clearing history:', error);
        // Откат: перезагружаем историю при ошибке
        loadUserHistory(userId);
      }
    }
  };

  const fetchSuggestions = async (searchQuery, stores = []) => {
    setIsLoading(true);
    try {
      const response = await parseProducts(searchQuery, { stores });
      // Если нужно — обработайте response здесь
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocalSuggestions = (searchQuery) => {
    if (searchQuery.length >= 2) {
      const filteredHistory = history
        .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(text => ({ 
          id: `hist-${text}`, 
          text, 
          category: 'История', 
          popularity: 50 
        }));
      
      const staticSuggestions = [
        { id: '1', text: `iPhone 15 Pro`, category: 'Электроника', popularity: 95 },
        { id: '2', text: `Samsung Galaxy`, category: 'Электроника', popularity: 88 },
      ].filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()));
      
      setSuggestions([...filteredHistory, ...staticSuggestions]);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = (searchQuery) => {
    if (!searchQuery?.trim()) return;
    if (selectedStores.length === 0) {
      alert('Выберите хотя бы один магазин для поиска');
      return;
    }

    addToHistory(searchQuery);
    setShowDropdown(false);
    setQuery(searchQuery);

    if (onSearch) {
      onSearch(searchQuery, { stores: selectedStores });
    }
  };

  // 🔥 Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!query?.trim()) return;
    if (selectedStores.length === 0) {
      alert('Выберите хотя бы один магазин для поиска');
      return;
    }
  
    addToHistory(query); // уже сохраняет и локально, и в БД
    setShowDropdown(false);
    
    //fetchSuggestions(query, selectedStores);
  
    if (onSearch) {
      onSearch(query, { stores: selectedStores });
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => setShowDropdown(true);

  const handleClearInput = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    // Источники для навигации: подсказки или история
    const items = query.length >= 2 && suggestions.length > 0 ? suggestions : history;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && items[selectedIndex]) {
      e.preventDefault();
      const selectedItem = items[selectedIndex];
      const selectedText = typeof selectedItem === 'string' ? selectedItem : selectedItem.text;
      handleSearch(selectedText);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // 🔥 Рендер контента выпадающего списка
  const renderDropdownContent = () => {
    // Показ подсказок при вводе от 2 символов
    if (query.length >= 2 && suggestions.length > 0) {
      return (
        <div className="dropdown-section">
          <div className="dropdown-header">
            <FiTrendingUp className="section-icon" />
            <span>Подсказки</span>
          </div>
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`dropdown-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSearch(suggestion.text)}
            >
              <FiSearch className="item-icon" />
              <div className="item-content">
                <span className="item-text">{suggestion.text}</span>
                <span className="item-category">{suggestion.category}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Показ истории, когда запрос короткий или пустой
    if (query.length < 2) {
      if (isHistoryLoading) {
        return (
          <div className="dropdown-section">
            <div className="dropdown-item disabled">Загрузка истории...</div>
          </div>
        );
      }
      
      if (history.length > 0) {
        return (
          <div className="dropdown-section">
            <div className="dropdown-header">
              <FiClock className="section-icon" />
              <span>История поиска</span>
              <button 
                type="button"
                onClick={clearHistory} 
                className="clear-history-btn"
              >
                Очистить
              </button>
            </div>
            {history.map((item, index) => (
              <div
                key={`hist-${index}`}
                className={`dropdown-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSearch(item)}
              >
                <FiClock className="item-icon" />
                <span className="item-text">{item}</span>
              </div>
            ))}
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        {/* 🔥 Блок кнопок магазинов */}
        {storesConfig.length > 0 && onToggleStore && (
          <div className="store-toggles">
            <div className="store-toggles-header">
              <span className="toggles-label">Источники:</span>
              <div className="toggles-actions">
                <button type="button" onClick={onSelectAll} className="toggle-action-btn">Все</button>
                <button type="button" onClick={onDeselectAll} className="toggle-action-btn">Ничего</button>
              </div>
            </div>
            <div className="store-chips">
              {storesConfig.map(store => {
                const isActive = selectedStores.includes(store.id);
                return (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => onToggleStore(store.id)}
                    className={`store-chip ${isActive ? 'active' : 'inactive'}`}
                    style={{ 
                      borderColor: isActive ? store.color : '#ccc',
                      backgroundColor: isActive ? `${store.color}15` : '#f9f9f9'
                    }}
                    title={isActive ? `Исключить ${store.name}` : `Включить ${store.name}`}
                  >
                    <span className="chip-icon">{store.icon}</span>
                    <span className="chip-name">{store.name}</span>
                    <span className={`chip-status ${isActive ? 'on' : 'off'}`}>
                      {isActive ? '✓' : '✕'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 🔥 Поле ввода */}
        <div className="search-input-wrapper">
          <FiSearch className={`search-icon ${isLoading ? 'pulse' : ''}`} />
          
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder="Введите название товара..."
            className="search-input"
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              onClick={handleClearInput}
              className="clear-btn"
              aria-label="Очистить"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* 🔥 Выпадающий список */}
        {showDropdown && (query.length >= 2 || history.length > 0 || isHistoryLoading) && (
          <div className="search-dropdown fade-in">
            {renderDropdownContent()}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;