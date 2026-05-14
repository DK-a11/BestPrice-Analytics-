# 🚀 Быстрый старт: Frontend разработка

## 📋 Этап Frontend разработки (5-7 дней)

Из общего плана выделен этап 3: Frontend разработка с использованием **React 18+**

---

## 🛠️ Шаг 1: Инициализация проекта

### Создание React приложения

```powershell
# Вариант 1: Create React App (классический)
npx create-react-app price-parser-client
cd price-parser-client

# Вариант 2: Vite (рекомендуемый, быстрее)
npm create vite@latest price-parser-client -- --template react
cd price-parser-client
npm install
```

---

## 📦 Шаг 2: Установка зависимостей

### Основные библиотеки:

```powershell
# UI и стилизация
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Графики и визуализация
npm install recharts

# HTTP клиент
npm install axios

# Иконки
npm install react-icons

# Роутинг (если потребуется)
npm install react-router-dom

# Утилиты
npm install classnames
npm install lodash
```

### Опциональные библиотеки:

```powershell
# Анимации
npm install framer-motion

# Форматирование дат
npm install date-fns

# State management (если потребуется)
npm install zustand
```

---

## 🎨 Шаг 3: Настройка TailwindCSS

### Обновить `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-green': '#10B981',
        'primary-white': '#F9FAFB',
        'contrast-gray': '#6B7280',
        'text-black': '#111827',
        'light-gray': '#E5E7EB',
        'hover-green': '#059669',
      },
    },
  },
  plugins: [],
}
```

### Добавить в `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --accent-green: #10B981;
  --primary-white: #F9FAFB;
  --contrast-gray: #6B7280;
  --text-black: #111827;
  --light-gray: #E5E7EB;
  --hover-green: #059669;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--primary-white);
  color: var(--text-black);
}
```

---

## 📁 Шаг 4: Структура проекта

### Создать структуру папок:

```powershell
# Создание структуры директорий
cd src
New-Item -ItemType Directory -Path components/Search, components/Analytics, components/PopularProducts, components/Footer
New-Item -ItemType Directory -Path services, hooks, utils, styles, assets
```

### Финальная структура:

```
src/
├── components/
│   ├── Search/
│   │   ├── SearchBar.jsx
│   │   ├── SearchBar.module.css
│   │   ├── SearchInput.jsx
│   │   ├── SearchDropdown.jsx
│   │   └── SearchSuggestion.jsx
│   │
│   ├── Analytics/
│   │   ├── AnalyticsBlock.jsx
│   │   ├── PriceHistoryChart.jsx
│   │   ├── StoreComparisonChart.jsx
│   │   └── InsightCard.jsx
│   │
│   ├── PopularProducts/
│   │   ├── PopularProductsBlock.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   └── StoreCard.jsx
│   │
│   └── Footer/
│       ├── Footer.jsx
│       ├── Footer.module.css
│       └── SocialLinks.jsx
│
├── services/
│   └── api.js              # API клиент
│
├── hooks/
│   ├── useDebounce.js
│   ├── useSearchHistory.js
│   └── usePopularProducts.js
│
├── utils/
│   └── helpers.js
│
├── styles/
│   └── global.css
│
├── App.jsx
└── main.jsx
```

---

## 🔧 Шаг 5: Создание API клиента

### Создать `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Поиск
export const searchSuggestions = (query, category = null) => 
  apiClient.get('/search/suggestions', { params: { q: query, category } });

export const searchProducts = (query, options = {}) => 
  apiClient.post('/search/query', { query, ...options });

// Аналитика
export const getPriceHistory = (productId, period = '30d') => 
  apiClient.get(`/analytics/price-history/${productId}`, { params: { period } });

export const getStoreComparison = (productId) => 
  apiClient.get(`/analytics/store-comparison/${productId}`);

// Популярные товары
export const getPopularProducts = (category = 'all', limit = 12) => 
  apiClient.get('/products/popular', { params: { category, limit } });

export const getPopularStores = () => 
  apiClient.get('/stores/popular');

export default apiClient;
```

---

## 🎯 Шаг 6: Создание главного компонента App

### Обновить `src/App.jsx`:

```jsx
import React from 'react';
import SearchBar from './components/Search/SearchBar';
import AnalyticsBlock from './components/Analytics/AnalyticsBlock';
import PopularProductsBlock from './components/PopularProducts/PopularProductsBlock';
import Footer from './components/Footer/Footer';
import './styles/global.css';

function App() {
  return (
    <div className="app min-h-screen bg-primary-white">
      {/* Header */}
      <header className="bg-white border-b-2 border-accent-green py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-text-black">
            💰 PriceParser
          </h1>
          <p className="text-contrast-gray mt-2">
            Мониторинг цен из популярных интернет-магазинов
          </p>
        </div>
      </header>

      {/* Блок 1: Поиск */}
      <section className="py-20 bg-gradient-to-b from-white to-primary-white">
        <div className="container mx-auto px-4">
          <SearchBar />
        </div>
      </section>

      {/* Блок 2: Аналитика */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnalyticsBlock />
        </div>
      </section>

      {/* Блок 3: Популярные товары */}
      <section className="py-16 bg-primary-white">
        <div className="container mx-auto px-4">
          <PopularProductsBlock />
        </div>
      </section>

      {/* Блок 4: Футер */}
      <Footer />
    </div>
  );
}

export default App;
```

---

## 🔨 Шаг 7: Создание заглушек компонентов

### Создать базовые компоненты для начала:

**`src/components/Search/SearchBar.jsx`:**
```jsx
import React, { useState } from 'react';

const SearchBar = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск товаров..."
          className="w-full px-6 py-4 text-lg border-2 border-light-gray rounded-full
                     focus:border-accent-green focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
};

export default SearchBar;
```

**`src/components/Analytics/AnalyticsBlock.jsx`:**
```jsx
import React from 'react';

const AnalyticsBlock = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📊 Аналитика по товару</h2>
      <p className="text-contrast-gray">Графики будут здесь...</p>
    </div>
  );
};

export default AnalyticsBlock;
```

**`src/components/PopularProducts/PopularProductsBlock.jsx`:**
```jsx
import React from 'react';

const PopularProductsBlock = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🔥 Популярные товары</h2>
      <p className="text-contrast-gray">Товары будут здесь...</p>
    </div>
  );
};

export default PopularProductsBlock;
```

**`src/components/Footer/Footer.jsx`:**
```jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-primary-white to-light-gray border-t-2 border-accent-green py-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-contrast-gray">
          © 2026 PriceParser. Все права защищены.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
```

---

## 🚀 Шаг 8: Запуск проекта

```powershell
# Запустить dev сервер
npm run dev

# Открыть в браузере
# http://localhost:5173 (Vite)
# или http://localhost:3000 (CRA)
```

---

## 📝 Шаг 9: Порядок разработки блоков

### Следуйте промптам в таком порядке:

1. **Блок 1: Поиск** → `03_prompt_block1_search.md`
   - Реализуйте SearchBar с автодополнением
   - Подключите API для поиска
   - Добавьте историю поиска

2. **Блок 2: Графики** → `04_prompt_block2_charts.md`
   - Установите Recharts
   - Создайте графики динамики цен
   - Добавьте аналитические инсайты

3. **Блок 3: Популярные товары** → `05_prompt_block3_popular.md`
   - Создайте карточки товаров
   - Реализуйте фильтрацию по категориям
   - Добавьте секцию магазинов

4. **Блок 4: Футер** → `06_prompt_block4_footer.md`
   - Создайте структуру футера
   - Добавьте контакты и навигацию
   - Реализуйте адаптивность

---

## ✅ Чек-лист первого дня

- [ ] Инициализировать React проект (Vite)
- [ ] Установить все зависимости
- [ ] Настроить TailwindCSS с цветовой палитрой
- [ ] Создать структуру папок
- [ ] Создать API клиент
- [ ] Создать базовый App.jsx
- [ ] Создать заглушки всех 4 блоков
- [ ] Запустить dev сервер
- [ ] Убедиться что всё работает

---

## 🔍 Полезные команды

```powershell
# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Preview production build
npm run preview

# Линтинг
npm run lint

# Установка новой библиотеки
npm install <package-name>
```

---

## 📚 Следующие шаги

После настройки базовой структуры:

1. Откройте `03_prompt_block1_search.md`
2. Следуйте инструкциям для реализации блока поиска
3. Тестируйте каждый компонент отдельно
4. Переходите к следующему блоку

---

## 💡 Советы

- **Используйте CSS модули** для изоляции стилей (`*.module.css`)
- **Создавайте custom hooks** для переиспользуемой логики
- **Тестируйте на мобильных** с самого начала
- **Используйте React DevTools** для отладки
- **Commit часто** с понятными сообщениями

---

## 🆘 Troubleshooting

**Проблема:** Tailwind стили не работают  
**Решение:** Проверьте `tailwind.config.js` и импорт в `index.css`

**Проблема:** CORS ошибки при обращении к API  
**Решение:** Настройте прокси в `vite.config.js`:
```javascript
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
```

**Проблема:** Recharts не отображается  
**Решение:** Проверьте что компонент имеет заданные width и height

---

## 🎯 Цель

В конце Frontend разработки у вас должен быть полностью функциональный одностраничный лендинг с:
- ✅ Поиском с автодополнением
- ✅ Интерактивными графиками
- ✅ Карточками популярных товаров
- ✅ Адаптивным дизайном
- ✅ Всеми блоками из макета

Удачи в разработке! 🚀
