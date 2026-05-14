# ПРОМПТ: Блок 2 - Графики и аналитика по товару

## 🎯 Задача для разработчика

Создать интерактивный блок с визуализацией данных о ценах товаров. Блок должен отображать динамику цен, сравнение между магазинами и аналитические инсайты.

---

## 📋 Технические требования

### **Frontend (React + Chart Library)**

#### 1. Библиотеки для графиков
**Рекомендуемые:**
- **Recharts** (простая интеграция с React, responsive)
- **Chart.js + react-chartjs-2** (гибкие настройки, популярная)
- **Victory** (декларативный подход)
- **Nivo** (красивые готовые темы)

**Выбор:** Recharts для MVP (простота + функциональность)

#### 2. Структура блока
```
┌─────────────────────────────────────────────┐
│  📊 Аналитика по товару: iPhone 15 Pro     │
├─────────────────────────────────────────────┤
│                                             │
│  [График 1: Динамика цен (Line Chart)]     │
│  Временной период за последние 30 дней     │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  [График 2: Сравнение магазинов (Bar)]     │
│  Текущие цены по всем источникам           │
│                                             │
├─────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐             │
│  │ График 3  │  │ График 4  │             │
│  │ Категории │  │ Тренд     │             │
│  │ (Pie)     │  │ (Area)    │             │
│  └───────────┘  └───────────┘             │
├─────────────────────────────────────────────┤
│  💡 Аналитические инсайты:                 │
│  • Средняя цена: 92 500 ₽                  │
│  • Лучшее предложение: Wildberries (89 999)│
│  • Тренд за неделю: ↓ -2.5%                │
│  • Рекомендация: Хорошее время для покупки │
└─────────────────────────────────────────────┘
```

---

## 📊 Типы графиков

### **График 1: Динамика цен (Line Chart)**
**Назначение:** Показать изменение цены товара во времени

**Данные:**
- Ось X: Дата (последние 7, 14, 30, 90 дней)
- Ось Y: Цена (₽)
- Линии: Каждый магазин отдельной линией

**Функции:**
- Переключатель временного периода (7д / 30д / 90д)
- Tooltip при наведении на точку
- Маркер текущей цены
- Зона "хорошей цены" (зеленый фон)

**Пример:**
```jsx
<LineChart width={800} height={400} data={priceHistory}>
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line 
    type="monotone" 
    dataKey="wildberries" 
    stroke="#10B981" 
    strokeWidth={2}
  />
  <Line 
    type="monotone" 
    dataKey="ozon" 
    stroke="#3B82F6" 
    strokeWidth={2}
  />
</LineChart>
```

---

### **График 2: Сравнение цен по магазинам (Bar Chart)**
**Назначение:** Визуальное сравнение текущих цен

**Данные:**
- Ось X: Название магазина
- Ось Y: Цена (₽)
- Цвет: Зеленый для минимальной, серый для остальных

**Функции:**
- Сортировка по цене (возрастание/убывание)
- Индикатор наличия товара (в наличии / под заказ)
- Клик по столбцу → переход на сайт магазина

**Пример данных:**
```javascript
[
  { store: "Wildberries", price: 89999, inStock: true },
  { store: "Ozon", price: 92500, inStock: true },
  { store: "M.Video", price: 94990, inStock: false },
  { store: "DNS", price: 93499, inStock: true }
]
```

---

### **График 3: Распределение по категориям (Pie/Donut Chart)**
**Назначение:** Показать долю товаров в разных ценовых сегментах

**Данные:**
- Бюджетные (< 50k): 35%
- Средний класс (50-100k): 45%
- Премиум (> 100k): 20%

**Цвета:**
- Бюджетные: #10B981 (зеленый)
- Средний: #6B7280 (серый)
- Премиум: #111827 (черный)

---

### **График 4: Тренд изменения цен (Area Chart)**
**Назначение:** Визуализация волатильности цены

**Данные:**
- Ось X: Время
- Ось Y: Процент изменения от базовой цены
- Заливка: Зеленая (рост), Красная (падение)

---

## 🎨 Цветовая схема графиков

```css
/* Основные цвета */
--chart-green: #10B981       /* Позитивные тренды, лучшие цены */
--chart-red: #EF4444         /* Негативные тренды, высокие цены */
--chart-gray: #6B7280        /* Нейтральные данные */
--chart-blue: #3B82F6        /* Альтернативные линии */
--chart-yellow: #F59E0B      /* Предупреждения */

/* Фоны */
--chart-bg: #F9FAFB          /* Фон графика */
--grid-color: #E5E7EB        /* Сетка */
--tooltip-bg: #FFFFFF        /* Тултип */

/* Текст */
--label-color: #111827       /* Подписи */
--secondary-text: #6B7280    /* Вторичный текст */
```

---

## 📦 Структура компонентов

```
client/src/components/Analytics/
├── AnalyticsBlock.jsx           # Контейнер блока
├── AnalyticsBlock.module.css
│
├── Charts/
│   ├── PriceHistoryChart.jsx    # График динамики
│   ├── StoreComparisonChart.jsx # Сравнение магазинов
│   ├── CategoryPieChart.jsx     # Круговая диаграмма
│   ├── TrendAreaChart.jsx       # Area график
│   └── ChartContainer.jsx       # Обертка с загрузкой
│
├── Controls/
│   ├── TimePeriodSelector.jsx   # Переключатель периодов
│   ├── ChartTypeToggle.jsx      # Переключатель типа графика
│   └── ExportButton.jsx         # Экспорт данных (CSV/PNG)
│
├── Insights/
│   ├── InsightCard.jsx          # Карточка инсайта
│   ├── PriceRecommendation.jsx  # Рекомендация по цене
│   └── TrendIndicator.jsx       # Индикатор тренда
│
└── hooks/
    ├── useChartData.js          # Загрузка данных
    ├── useChartResize.js        # Адаптивность
    └── useAnalytics.js          # Аналитические расчеты
```

---

## 🔧 Backend (Node.js + Express)

### API Endpoints

#### 1. **GET /api/analytics/price-history/:productId**
```javascript
// История цен товара
Query Params:
  - period: string (7d, 14d, 30d, 90d, 1y)
  - stores: array (optional, фильтр магазинов)

Response:
{
  "productId": "uuid",
  "productName": "iPhone 15 Pro 256GB",
  "period": "30d",
  "data": [
    {
      "date": "2026-01-01",
      "wildberries": 91999,
      "ozon": 93500,
      "mvideo": 95990,
      "dns": 94499
    },
    {
      "date": "2026-01-02",
      "wildberries": 91599,
      "ozon": 93000,
      // ...
    }
  ],
  "statistics": {
    "avgPrice": 92500,
    "minPrice": 89999,
    "maxPrice": 95990,
    "volatility": 2.3, // процент разброса
    "trend": "decreasing" // increasing, stable, decreasing
  }
}
```

#### 2. **GET /api/analytics/store-comparison/:productId**
```javascript
// Текущие цены по магазинам
Response:
{
  "productId": "uuid",
  "timestamp": "2026-01-16T12:00:00Z",
  "stores": [
    {
      "name": "Wildberries",
      "price": 89999,
      "priceChange": -2.5, // процент от прошлой недели
      "inStock": true,
      "rating": 4.8,
      "reviews": 1234,
      "url": "https://...",
      "deliveryTime": "1-3 дня",
      "deliveryCost": 0
    }
  ],
  "recommendation": {
    "bestPrice": "Wildberries",
    "bestValue": "Ozon", // цена + доставка + рейтинг
    "fastestDelivery": "M.Video"
  }
}
```

#### 3. **GET /api/analytics/insights/:productId**
```javascript
// Аналитические инсайты
Response:
{
  "productId": "uuid",
  "insights": [
    {
      "type": "price_drop",
      "severity": "high", // high, medium, low
      "message": "Цена снизилась на 5% за последние 7 дней",
      "icon": "📉",
      "action": "Хорошее время для покупки"
    },
    {
      "type": "price_forecast",
      "message": "Прогноз: цена может вырасти на 3-5% через 2 недели",
      "confidence": 0.75,
      "icon": "🔮"
    },
    {
      "type": "best_deal",
      "message": "Самая низкая цена за последние 90 дней",
      "icon": "⭐"
    }
  ],
  "priceScore": 85, // 0-100, насколько хорошая цена
  "recommendation": "buy" // buy, wait, monitor
}
```

#### 4. **GET /api/analytics/category-distribution**
```javascript
// Распределение товаров по ценовым сегментам
Query Params:
  - category: string (опционально)

Response:
{
  "distribution": [
    { "segment": "Бюджетные", "range": "0-50k", "count": 3500, "percentage": 35 },
    { "segment": "Средний класс", "range": "50-100k", "count": 4500, "percentage": 45 },
    { "segment": "Премиум", "range": "100k+", "count": 2000, "percentage": 20 }
  ]
}
```

---

## 💻 Пример React компонента

```jsx
// AnalyticsBlock.jsx (псевдокод)
import React, { useState, useEffect } from 'react';
import { LineChart, BarChart } from 'recharts';
import { useChartData } from './hooks/useChartData';

const AnalyticsBlock = ({ productId }) => {
  const [period, setPeriod] = useState('30d');
  const { priceHistory, storeComparison, insights, loading } = useChartData(
    productId, 
    period
  );

  if (loading) return <ChartSkeleton />;

  return (
    <section className="analytics-block">
      <header>
        <h2>📊 Аналитика по товару</h2>
        <TimePeriodSelector 
          value={period} 
          onChange={setPeriod}
          options={['7d', '30d', '90d', '1y']}
        />
      </header>

      {/* График 1: Динамика цен */}
      <ChartContainer title="Динамика цен">
        <PriceHistoryChart 
          data={priceHistory.data}
          period={period}
        />
      </ChartContainer>

      {/* График 2: Сравнение магазинов */}
      <ChartContainer title="Сравнение цен по магазинам">
        <StoreComparisonChart 
          data={storeComparison.stores}
        />
      </ChartContainer>

      {/* Мини-графики */}
      <div className="mini-charts-grid">
        <CategoryPieChart data={categoryData} />
        <TrendAreaChart data={priceHistory.data} />
      </div>

      {/* Инсайты */}
      <InsightsSection insights={insights.insights} />
    </section>
  );
};
```

---

## 🧮 Аналитические алгоритмы (Backend)

### 1. Расчет среднего скользящего (Moving Average)
```javascript
// Сглаживание шумов в ценах
function calculateMovingAverage(prices, window = 7) {
  return prices.map((_, idx, arr) => {
    if (idx < window - 1) return null;
    const slice = arr.slice(idx - window + 1, idx + 1);
    return slice.reduce((a, b) => a + b.price, 0) / window;
  });
}
```

### 2. Определение тренда
```javascript
function detectTrend(prices) {
  const firstHalf = prices.slice(0, prices.length / 2);
  const secondHalf = prices.slice(prices.length / 2);
  
  const avgFirst = average(firstHalf);
  const avgSecond = average(secondHalf);
  
  const change = ((avgSecond - avgFirst) / avgFirst) * 100;
  
  if (change > 2) return { trend: 'increasing', change };
  if (change < -2) return { trend: 'decreasing', change };
  return { trend: 'stable', change };
}
```

### 3. Прогнозирование цены (Simple Linear Regression)
```javascript
function forecastPrice(historicalPrices, daysAhead = 7) {
  // Простая линейная регрессия
  const n = historicalPrices.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historicalPrices.map(p => p.price);
  
  const sumX = x.reduce((a, b) => a + b);
  const sumY = y.reduce((a, b) => a + b);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const forecast = slope * (n + daysAhead - 1) + intercept;
  return Math.round(forecast);
}
```

### 4. Оценка "хорошести" цены (Price Score)
```javascript
function calculatePriceScore(currentPrice, historicalPrices) {
  const min = Math.min(...historicalPrices);
  const max = Math.max(...historicalPrices);
  const range = max - min;
  
  // 100 = минимальная цена, 0 = максимальная
  const score = 100 - ((currentPrice - min) / range) * 100;
  
  return Math.round(score);
}
```

---

## 📱 Адаптивность

### Desktop (> 1024px)
- Графики: 2 колонки (динамика + сравнение)
- Мини-графики: 2 в ряд
- Ширина графиков: 100% контейнера

### Tablet (768px - 1024px)
- Графики: 1 колонка, полная ширина
- Мини-графики: 2 в ряд

### Mobile (< 768px)
- Графики: 1 колонка
- Мини-графики: 1 в ряд (стек)
- Упрощенные тултипы
- Горизонтальный скролл для таблиц

---

## 🎯 Интерактивность

### Tooltip на графиках
```jsx
<Tooltip 
  content={({ active, payload }) => {
    if (!active) return null;
    return (
      <div className="custom-tooltip">
        <p className="date">{payload[0].payload.date}</p>
        <p className="price">{payload[0].value} ₽</p>
        <p className="change">↓ -2.5%</p>
      </div>
    );
  }}
/>
```

### Zoom и Pan (опционально)
```jsx
// Использование Recharts Brush для zoom
<Brush 
  dataKey="date" 
  height={30} 
  stroke="#10B981"
/>
```

### Анимации
```jsx
<Line 
  animationDuration={1000}
  animationEasing="ease-out"
/>
```

---

## 🔒 Оптимизация производительности

### 1. Кэширование данных
```javascript
// Redis кэш для аналитики
const cacheKey = `analytics:${productId}:${period}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Вычисление данных...
await redis.setex(cacheKey, 3600, JSON.stringify(result)); // 1 час
```

### 2. Debounce на переключении периодов
```javascript
const debouncedFetch = useDebounce(fetchAnalytics, 300);
```

### 3. Lazy Loading графиков
```jsx
const CategoryPieChart = lazy(() => import('./CategoryPieChart'));

<Suspense fallback={<ChartSkeleton />}>
  <CategoryPieChart data={data} />
</Suspense>
```

### 4. Виртуализация данных
```javascript
// Для больших датасетов (>1000 точек)
const sampledData = sampleData(fullData, 100); // Downsample
```

---

## ✅ Чек-лист реализации

### Frontend
- [ ] Установить Recharts: `npm install recharts`
- [ ] Создать компонент AnalyticsBlock
- [ ] Реализовать PriceHistoryChart (Line)
- [ ] Реализовать StoreComparisonChart (Bar)
- [ ] Реализовать CategoryPieChart
- [ ] Реализовать TrendAreaChart
- [ ] Добавить TimePeriodSelector
- [ ] Реализовать InsightsSection
- [ ] Кастомизировать Tooltips
- [ ] Адаптивный дизайн
- [ ] Добавить skeleton loaders
- [ ] Обработка ошибок
- [ ] Экспорт данных (CSV/PNG)

### Backend
- [ ] Endpoint `/api/analytics/price-history/:productId`
- [ ] Endpoint `/api/analytics/store-comparison/:productId`
- [ ] Endpoint `/api/analytics/insights/:productId`
- [ ] Endpoint `/api/analytics/category-distribution`
- [ ] Реализовать расчет Moving Average
- [ ] Реализовать определение тренда
- [ ] Реализовать прогнозирование цены
- [ ] Реализовать Price Score
- [ ] Оптимизация запросов к БД


### Интеграция
- [ ] Подключить API к компонентам
- [ ] Обработка loading состояний
- [ ] Обработка ошибок сети

---

## 🎯 Критерии успеха

- ✅ Время загрузки графиков < 1 секунды
- ✅ Плавная анимация (60 FPS)
- ✅ Корректное отображение на всех устройствах
- ✅ Точность аналитических расчетов > 95%
- ✅ Интуитивная навигация по периодам
- ✅ Информативные tooltips

---

## 🔄 Дополнительные фичи (optional)

- Экспорт графиков в PNG/SVG
- Сравнение нескольких товаров на одном графике
