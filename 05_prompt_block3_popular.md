# ПРОМПТ: Блок 3 - Популярные товары и площадки

## 🎯 Задача для разработчика

Создать динамический блок с отображением трендовых товаров и популярных интернет-магазинов. Блок должен быть привлекательным, информативным и побуждать к взаимодействию.

---

## 📋 Технические требования

### **Frontend (React)**

#### 1. Структура блока
```
┌─────────────────────────────────────────────────┐
│  🔥 Популярные товары и площадки                │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Фильтры: Все | Электроника | Одежда | Дом]  │
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Товар 1  │ │ Товар 2  │ │ Товар 3  │       │
│  │ [Изобр.] │ │ [Изобр.] │ │ [Изобр.] │       │
│  │ Название │ │ Название │ │ Название │       │
│  │ 89 999 ₽ │ │ 45 500 ₽ │ │ 12 990 ₽ │       │
│  │ ↓ -5.2%  │ │ ↑ +2.1%  │ │ — 0%     │       │
│  │ [WB|Oz]  │ │ [WB|Oz]  │ │ [WB|Oz]  │       │
│  └──────────┘ └──────────┘ └──────────┘       │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  📊 Самые популярные площадки                   │
│                                                 │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │ [Logo] WB       │  │ [Logo] Ozon     │     │
│  │ 45 678 товаров  │  │ 38 234 товара   │     │
│  │ ⭐ 4.8 рейтинг  │  │ ⭐ 4.6 рейтинг  │     │
│  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────┘
```

---

## 🎴 Карточка товара (Product Card)

### Элементы карточки:
1. **Изображение товара** (200x200px, object-fit: cover)
2. **Название товара** (максимум 2 строки, ellipsis)
3. **Текущая цена** (крупный шрифт, акцент)
4. **Индикатор изменения цены**:
   - ↓ -5.2% (зеленый, если падение)
   - ↑ +2.1% (красный, если рост)
   - — 0% (серый, если без изменений)
5. **Лого магазинов** (где доступен товар)
6. **Кнопка "Сравнить цены"** (hover эффект)
7. **Badge "Лучшая цена"** (если актуально)

### Визуальный дизайн:
```css
.product-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(16, 185, 129, 0.15);
  border-color: #10B981;
}

.price-change.positive {
  color: #10B981; /* зеленый */
  font-weight: 600;
}

.price-change.negative {
  color: #EF4444; /* красный */
  font-weight: 600;
}

.best-price-badge {
  background: linear-gradient(135deg, #10B981, #059669);
  color: #FFFFFF;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  position: absolute;
  top: 8px;
  right: 8px;
}
```

---

## 📦 Структура компонентов

```
client/src/components/PopularProducts/
├── PopularProductsBlock.jsx      # Контейнер блока
├── PopularProductsBlock.module.css
│
├── ProductCard/
│   ├── ProductCard.jsx           # Карточка товара
│   ├── ProductImage.jsx          # Изображение с lazy loading
│   ├── PriceDisplay.jsx          # Отображение цены
│   ├── PriceChangeIndicator.jsx  # Индикатор изменения
│   └── StoreLogos.jsx            # Лого магазинов
│
├── ProductGrid/
│   ├── ProductGrid.jsx           # Сетка товаров
│   ├── ProductFilters.jsx        # Фильтры по категориям
│   └── ProductSkeleton.jsx       # Loading skeleton
│
├── StoreSection/
│   ├── StoreCard.jsx             # Карточка магазина
│   ├── StoreStats.jsx            # Статистика магазина
│   └── StoreGrid.jsx             # Сетка магазинов
│
└── hooks/
    ├── usePopularProducts.js     # Загрузка данных
    ├── useProductFilters.js      # Логика фильтрации
    └── useInfiniteScroll.js      # Бесконечный скролл
```

---

## 🔧 Backend (Node.js + Express)

### API Endpoints

#### 1. **GET /api/products/popular**
```javascript
// Получить список популярных товаров
Query Params:
  - category: string (optional, фильтр категории)
  - sortBy: string (popularity, price_drop, trending)
  - limit: number (default: 12)
  - offset: number (для пагинации)

Response:
{
  "products": [
    {
      "id": "uuid",
      "name": "iPhone 15 Pro 256GB",
      "category": "Электроника",
      "image": "https://cdn.example.com/iphone15.jpg",
      "currentPrice": 89999,
      "previousPrice": 94999,
      "priceChange": -5.26, // процент изменения
      "priceChangeType": "decrease", // decrease, increase, stable
      "currency": "RUB",
      "stores": [
        {
          "name": "Wildberries",
          "logo": "https://cdn.example.com/wb-logo.png",
          "price": 89999,
          "url": "https://..."
        },
        {
          "name": "Ozon",
          "logo": "https://cdn.example.com/ozon-logo.png",
          "price": 92500,
          "url": "https://..."
        }
      ],
      "isBestPrice": true, // самая низкая цена за период
      "popularityScore": 95, // 0-100
      "trending": true,
      "views": 45678, // количество просмотров
      "updatedAt": "2026-01-16T12:00:00Z"
    }
  ],
  "totalCount": 150,
  "hasMore": true
}
```

#### 2. **GET /api/stores/popular**
```javascript
// Получить список популярных магазинов
Response:
{
  "stores": [
    {
      "id": "wb",
      "name": "Wildberries",
      "logo": "https://cdn.example.com/wb-logo.png",
      "website": "https://wildberries.ru",
      "productsCount": 45678,
      "rating": 4.8,
      "reviewsCount": 125634,
      "categories": ["Электроника", "Одежда", "Дом"],
      "avgDeliveryTime": "2-3 дня",
      "minOrderAmount": 0,
      "hasAPI": true,
      "popularityScore": 98
    },
    {
      "id": "ozon",
      "name": "Ozon",
      "logo": "https://cdn.example.com/ozon-logo.png",
      "website": "https://ozon.ru",
      "productsCount": 38234,
      "rating": 4.6,
      "reviewsCount": 98432,
      "categories": ["Электроника", "Книги", "Спорт"],
      "avgDeliveryTime": "1-2 дня",
      "minOrderAmount": 0,
      "hasAPI": true,
      "popularityScore": 95
    }
  ]
}
```

#### 3. **GET /api/products/trending**
```javascript
// Трендовые товары (наибольший рост просмотров)
Query Params:
  - period: string (24h, 7d, 30d)
  - limit: number (default: 10)

Response:
{
  "trending": [
    {
      "productId": "uuid",
      "name": "Samsung Galaxy S24",
      "viewsGrowth": 150, // процент роста просмотров
      "searchGrowth": 85,
      "category": "Электроника",
      "currentPrice": 74999,
      "image": "https://..."
    }
  ]
}
```

---

## 💻 Пример React компонента

```jsx
// PopularProductsBlock.jsx (псевдокод)
import React, { useState, useEffect } from 'react';
import { usePopularProducts } from './hooks/usePopularProducts';
import ProductCard from './ProductCard/ProductCard';
import StoreCard from './StoreSection/StoreCard';

const PopularProductsBlock = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { products, stores, loading } = usePopularProducts(selectedCategory);

  const categories = [
    { id: 'all', name: 'Все', icon: '🔥' },
    { id: 'electronics', name: 'Электроника', icon: '💻' },
    { id: 'clothing', name: 'Одежда', icon: '👕' },
    { id: 'home', name: 'Дом и сад', icon: '🏡' },
    { id: 'sports', name: 'Спорт', icon: '⚽' }
  ];

  return (
    <section className="popular-products-block">
      {/* Секция популярных товаров */}
      <div className="products-section">
        <header>
          <h2>🔥 Популярные товары</h2>
          <p>Товары с лучшими ценами и высоким спросом</p>
        </header>

        {/* Фильтры */}
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={selectedCategory === cat.id ? 'active' : ''}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Сетка товаров */}
        {loading ? (
          <ProductSkeleton count={12} />
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>
        )}
      </div>

      {/* Разделитель */}
      <hr className="section-divider" />

      {/* Секция популярных площадок */}
      <div className="stores-section">
        <header>
          <h2>📊 Самые популярные площадки</h2>
          <p>Проверенные магазины с большим ассортиментом</p>
        </header>

        <div className="store-grid">
          {stores.map(store => (
            <StoreCard 
              key={store.id} 
              store={store}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

## 🎨 Цветовая схема

```css
/* Карточка товара */
.product-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
}

.product-card:hover {
  border-color: #10B981; /* зеленый акцент */
}

/* Индикатор цены */
.price-decrease {
  color: #10B981; /* зеленый */
  background: #D1FAE5; /* светло-зеленый фон */
}

.price-increase {
  color: #EF4444; /* красный */
  background: #FEE2E2; /* светло-красный фон */
}

.price-stable {
  color: #6B7280; /* серый */
  background: #F3F4F6;
}

/* Кнопки фильтров */
.filter-button {
  background: #F9FAFB;
  color: #111827;
  border: 1px solid #E5E7EB;
}

.filter-button.active {
  background: #10B981;
  color: #FFFFFF;
  border-color: #10B981;
}

/* Карточка магазина */
.store-card {
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
}

.store-card:hover {
  border-color: #10B981;
  transform: scale(1.02);
}
```

---

## 🎯 Функциональность

### 1. Фильтрация товаров
```javascript
const filterProducts = (products, category) => {
  if (category === 'all') return products;
  return products.filter(p => p.category === category);
};
```

### 2. Сортировка
```javascript
const sortOptions = {
  popularity: (a, b) => b.popularityScore - a.popularityScore,
  price_drop: (a, b) => a.priceChange - b.priceChange,
  trending: (a, b) => b.views - a.views
};
```

### 3. Бесконечный скролл (Infinite Scroll)
```javascript
const useInfiniteScroll = () => {
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setPage(prev => prev + 1);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return page;
};
```

### 4. Lazy Loading изображений
```jsx
<img
  src={product.image}
  alt={product.name}
  loading="lazy"
  onError={(e) => e.target.src = '/placeholder.jpg'}
/>
```

---

## 📊 Алгоритм определения популярности (Backend)

### Формула Popularity Score:
```javascript
function calculatePopularityScore(product) {
  const weights = {
    views: 0.3,
    searches: 0.25,
    priceDrops: 0.2,
    recency: 0.15,
    availability: 0.1
  };
  
  const viewsScore = Math.min((product.views / 10000) * 100, 100);
  const searchesScore = Math.min((product.searches / 5000) * 100, 100);
  const priceDropScore = product.priceChange < 0 ? Math.abs(product.priceChange) * 10 : 0;
  
  const daysSinceUpdate = (Date.now() - new Date(product.updatedAt)) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(100 - (daysSinceUpdate * 10), 0);
  
  const availabilityScore = product.stores.filter(s => s.inStock).length * 20;
  
  const totalScore = 
    (viewsScore * weights.views) +
    (searchesScore * weights.searches) +
    (priceDropScore * weights.priceDrops) +
    (recencyScore * weights.recency) +
    (availabilityScore * weights.availability);
  
  return Math.min(Math.round(totalScore), 100);
}
```

---

## 🔍 Алгоритм "Лучшая цена"

```javascript
function isBestPrice(currentPrice, priceHistory, period = 90) {
  const historicalPrices = priceHistory.slice(-period); // последние N дней
  const minHistoricalPrice = Math.min(...historicalPrices.map(p => p.price));
  
  // Если текущая цена на 2% ниже минимальной исторической
  return currentPrice <= minHistoricalPrice * 0.98;
}
```

---

## 📱 Адаптивность

### Desktop (> 1024px)
```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.store-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

### Tablet (768px - 1024px)
```css
.product-grid {
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.store-grid {
  grid-template-columns: repeat(2, 1fr);
}
```

### Mobile (< 768px)
```css
.product-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.store-grid {
  grid-template-columns: 1fr;
}
```

---

## 🎭 Анимации

### Появление карточек (Stagger Animation)
```jsx
import { motion } from 'framer-motion';

const ProductCard = ({ product, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="product-card"
  >
    {/* Контент карточки */}
  </motion.div>
);
```

### Hover эффекты
```css
.product-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(16, 185, 129, 0.15);
}

.product-card:hover .product-image {
  transform: scale(1.05);
}
```

---

## 🔒 Оптимизация производительности

### 1. Мемоизация компонентов
```jsx
const ProductCard = React.memo(({ product }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id;
});
```

### 2. Виртуализация списка (для большого количества товаров)
```jsx
import { FixedSizeGrid } from 'react-window';

<FixedSizeGrid
  columnCount={4}
  columnWidth={250}
  height={800}
  rowCount={Math.ceil(products.length / 4)}
  rowHeight={350}
  width={1000}
>
  {({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      <ProductCard product={products[rowIndex * 4 + columnIndex]} />
    </div>
  )}
</FixedSizeGrid>
```

### 3. Image optimization
```jsx
<img
  src={`${product.image}?w=200&h=200&fit=crop`}
  srcSet={`
    ${product.image}?w=200&h=200&fit=crop 1x,
    ${product.image}?w=400&h=400&fit=crop 2x
  `}
  alt={product.name}
  loading="lazy"
/>
```

### 4. Кэширование на Backend
```javascript
// Кэш популярных товаров на 1 час
const cacheKey = `popular:${category}:${sortBy}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// ... fetch data
await redis.setex(cacheKey, 3600, JSON.stringify(products));
```

---

## ✅ Чек-лист реализации

### Frontend
- [ ] Создать компонент PopularProductsBlock
- [ ] Реализовать ProductCard с hover эффектами
- [ ] Реализовать ProductFilters (категории)
- [ ] Добавить ProductGrid с адаптивностью
- [ ] Создать StoreCard компонент
- [ ] Реализовать StoreGrid
- [ ] Реализовать бесконечный скролл
- [ ] Добавить skeleton loaders
- [ ] Анимации появления карточек
- [ ] Обработка ошибок загрузки
- [ ] Мобильная адаптация

### Backend
- [ ] Endpoint `/api/products/popular`
- [ ] Endpoint `/api/stores/popular`
- [ ] Endpoint `/api/products/trending`
- [ ] Реализовать алгоритм Popularity Score
- [ ] Реализовать определение "Лучшая цена"
- [ ] Добавить фильтрацию по категориям
- [ ] Реализовать пагинацию
- [ ] Оптимизация запросов к БД (индексы)
- [ ] Сжатие изображений (CDN integration)

### Интеграция
- [ ] Подключить API к компонентам
- [ ] Обработка loading состояний
- [ ] Обработка ошибок сети

---

## 🎯 Критерии успеха

- ✅ Время загрузки блока < 1 секунды
- ✅ Плавная анимация (60 FPS)
- ✅ Корректное отображение на всех устройствах
- ✅ Быстрая фильтрация по категориям
- ✅ Оптимизированные изображения (WebP, lazy loading)
- ✅ Информативные карточки товаров

---

## 🔄 Дополнительные фичи (optional)

- Добавление товара в избранное (wishlist)
- Сравнение нескольких товаров side-by-side
- История просмотренных товаров
