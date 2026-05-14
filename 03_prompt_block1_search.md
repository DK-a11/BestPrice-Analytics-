# ПРОМПТ: Блок 1 - Строка поиска (Google-style)

## 🎯 Задача для разработчика

Создать блок поиска в стиле Google для парсинга цен с интернет-магазинов. Блок должен быть интуитивным, быстрым и адаптивным.

---

## 📋 Технические требования

### **Frontend (React)**

#### 1. Компонент SearchBar
- Создать компонент `SearchBar.jsx` с центрированной строкой поиска
- Размер инпута: минимальная ширина 600px (desktop), 90% экрана (mobile)
- Высота: 48px с padding
- Border-radius: 24px (скругленные края)
- Тень при фокусе: box-shadow с зеленым акцентом

#### 2. Функциональность
- **Автодополнение (Autocomplete)**:
  - Debounce на вводе (300ms)
  - API запрос для получения предложений после 2+ символов
  - Dropdown список с максимум 8 подсказками
  - Клавиатурная навигация (стрелки вверх/вниз, Enter)
  
- **История поиска**:
  - Хранение последних 10 запросов в localStorage
  - Отображение истории при фокусе (если инпут пустой)
  - Иконка часов рядом с историческими запросами
  - Кнопка очистки истории

- **Категории товаров**:
  - Dropdown с популярными категориями (Электроника, Одежда, Дом, Спорт и т.д.)
  - Иконка категории рядом с текстом
  - Фильтрация результатов по выбранной категории

#### 3. Визуальные элементы
- **Иконки**:
  - Иконка поиска (лупа) слева внутри инпута
  - Иконка очистки (крестик) справа при вводе текста
  - Иконка микрофона для голосового ввода (optional)
  
- **Анимации**:
  - Плавное появление dropdown (fade-in 200ms)
  - Пульсация border при фокусе
  - Hover эффект на элементах dropdown

#### 4. Состояния
- **Default**: Серый border, placeholder "Поиск товаров..."
- **Focus**: Зеленый border (#10B981), тень
- **Loading**: Spinner вместо иконки поиска
- **Error**: Красный border, сообщение под инпутом
- **Success**: Быстрый переход к результатам

---

## 🎨 Цветовая схема

```css
/* Инпут */
background: #FFFFFF
border: 2px solid #E5E7EB (default)
border-focus: 2px solid #10B981 (акцентный зеленый)
color: #111827 (черный текст)

/* Dropdown */
background: #F9FAFB (бледно-серый)
hover: #E5E7EB (светло-серый)
text: #111827
secondary-text: #6B7280 (контрастный серый)

/* Кнопка поиска (опционально) */
background: #10B981
hover: #059669
text: #FFFFFF
```

---

## 🔧 Backend (Node.js + Express)

### API Endpoints

#### 1. **GET /api/search/suggestions**
```javascript
// Запрос автодополнения
Query Params: 
  - q: string (поисковый запрос)
  - category: string (optional, фильтр категории)
  - limit: number (default: 8)

Response:
{
  "suggestions": [
    {
      "id": "uuid",
      "text": "iPhone 15 Pro",
      "category": "Электроника",
      "popularity": 95,
      "icon": "smartphone"
    }
  ],
  "timestamp": "2026-01-16T12:00:00Z"
}
```

#### 2. **POST /api/search/query**
```javascript
// Основной поиск товаров
Body:
{
  "query": "iPhone 15",
  "category": "Электроника", // optional
  "sortBy": "price_asc", // price_asc, price_desc, popularity
  "limit": 50
}

Response:
{
  "query": "iPhone 15",
  "results": [
    {
      "id": "uuid",
      "name": "iPhone 15 Pro 256GB",
      "stores": [
        {
          "name": "Wildberries",
          "price": 89999,
          "currency": "RUB",
          "url": "https://...",
          "inStock": true
        }
      ],
      "avgPrice": 92500,
      "minPrice": 89999,
      "maxPrice": 95999,
      "priceChange": -2.5, // процент изменения за неделю
      "image": "https://cdn.example.com/iphone15.jpg"
    }
  ],
  "totalResults": 127,
  "processingTime": 450 // ms
}
```

#### 3. **GET /api/categories**
```javascript
// Получение списка категорий
Response:
{
  "categories": [
    {
      "id": "electronics",
      "name": "Электроника",
      "icon": "💻",
      "count": 15432 // количество товаров
    },
    {
      "id": "clothing",
      "name": "Одежда",
      "icon": "👕",
      "count": 28765
    }
  ]
}
```

---

## 📦 Структура компонентов

```
client/src/components/Search/
├── SearchBar/
│   ├── SearchBar.jsx          # Основной компонент
│   ├── SearchBar.module.css   # Стили
│   ├── SearchInput.jsx        # Инпут с иконками
│   ├── SearchDropdown.jsx     # Dropdown с результатами
│   ├── SearchSuggestion.jsx   # Элемент подсказки
│   └── SearchHistory.jsx      # История поиска
│
├── CategoryFilter/
│   ├── CategoryFilter.jsx
│   └── CategoryFilter.module.css
│
└── hooks/
    ├── useDebounce.js         # Debounce hook
    ├── useSearchHistory.js    # localStorage hook
    └── useAutocomplete.js     # Логика автодополнения
```

---

## 💻 Пример структуры React компонента

```javascript
// Псевдокод структуры SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from './hooks/useDebounce';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery]);

  const fetchSuggestions = async (searchQuery) => {
    // API запрос к /api/search/suggestions
  };

  const handleSearch = async () => {
    // API запрос к /api/search/query
    // Переход к результатам (скролл к блоку 2)
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <SearchIcon />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск товаров..."
          onFocus={() => setIsDropdownOpen(true)}
        />
        {query && <ClearIcon onClick={() => setQuery('')} />}
        {isLoading && <Spinner />}
      </div>
      
      {isDropdownOpen && (
        <SearchDropdown 
          suggestions={suggestions}
          history={searchHistory}
          onSelect={handleSuggestionClick}
        />
      )}
    </div>
  );
};
```

---

## 🔍 Алгоритм поиска (Backend)

### 1. Обработка запроса
```
1. Получить query от пользователя
2. Нормализация (lowercase, trim, удаление спецсимволов)
3. Проверка кэша (Redis) по ключу: "search:{query}"
4. Если кэш существует и свежий → возврат из кэша
5. Если нет → запрос к базе данных
```

### 2. База данных (MongoDB пример)
```javascript
// Индексы для быстрого поиска
db.products.createIndex({ name: "text", description: "text" });
db.products.createIndex({ category: 1, popularity: -1 });

// Запрос с text search
db.products.find({
  $text: { $search: query },
  category: selectedCategory // optional
}).sort({ popularity: -1 }).limit(50);
```

### 3. Агрегация результатов
```
1. Получить товары из БД
2. Для каждого товара собрать цены из всех магазинов
3. Вычислить avgPrice, minPrice, maxPrice
4. Добавить priceChange (сравнение с прошлой неделей)
5. Сортировка по критерию (цена/популярность)
6. Сохранить в кэш с TTL 1 час
7. Возврат клиенту
```

---

## ✅ Чек-лист реализации

### Frontend
- [ ] Создать компонент SearchBar
- [ ] Реализовать debounce на вводе
- [ ] Подключить API автодополнения
- [ ] Добавить историю поиска (localStorage)
- [ ] Реализовать клавиатурную навигацию
- [ ] Добавить анимации и transitions
- [ ] Адаптивный дизайн (mobile/tablet/desktop)
- [ ] Обработка ошибок и loading состояний
- [ ] Accessibility (ARIA labels, keyboard support)

### Backend
- [ ] Создать endpoint `/api/search/suggestions`
- [ ] Создать endpoint `/api/search/query`
- [ ] Создать endpoint `/api/categories`
- [ ] Настроить индексы в БД
- [ ] Добавить rate limiting (express-rate-limit)
- [ ] Валидация входных данных (Joi/Yup)
- [ ] Логирование запросов

### Интеграция
- [ ] Подключить Frontend к Backend API
- [ ] Настроить CORS
- [ ] Обработка ошибок сети
- [ ] Loading состояния

---

## 🎯 Критерии успеха

- ✅ Время ответа автодополнения < 200ms
- ✅ Время полного поиска < 1 секунды
- ✅ Точность предложений > 80%
- ✅ Mobile-friendly (100% в Lighthouse)
- ✅ Accessibility score > 95 (Lighthouse)
- ✅ Нет UI блокировок при вводе

---


