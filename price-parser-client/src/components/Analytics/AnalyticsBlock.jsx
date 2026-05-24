import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip 
} from 'recharts';
import { FiTrendingDown, FiTrendingUp, FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import { formatPrice } from '../../utils/helpers';
import { extractCProducts, extractHProducts, extractIProducts, exportProducts } from '../../services/api';
import './AnalyticsBlock.css';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const AnalyticsBlock = ({ query, selectedStores = [] }) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [storeComparison, setStoreComparison] = useState([]);
  const [insights, setInsights] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем аналитику при изменении запроса или периода
  useEffect(() => {
    if (query?.length >= 2) {
      loadAnalytics();
    }
  }, [query, period, selectedStores]);

  // Логирование для отладки
  useEffect(() => {
    if (!query || query.length === 0) {
      console.log('AnalyticsBlock: no query');
    } else {
      console.log('AnalyticsBlock: query changed to', query);
      console.log('Selected stores for analytics:', selectedStores);
    }
  }, [query, selectedStores]);

  const loadMockData = () => {
    const mockHistory = [
      { date: '01.01', Alser: 69999, Sulpak: 69999 },
      { date: '05.01', Alser: 69999, Sulpak: 69999 },
      { date: '10.01', Alser: 69999, Sulpak: 69999 },
      { date: '15.01', Alser: 69999, Sulpak: 69999 },
      { date: '20.01', Alser: 69999, Sulpak: 69999 },
      { date: '25.01', Alser: 69999, Sulpak: 69999 },
      { date: '30.01', Alser: 69999, Sulpak: 69999 },
    ];
    
    const mockComparison = [
      { store: 'Alser', price: 69999, color: '#10B981' },
      { store: 'Sulpak', price: 71500, color: '#f59e0b' },
      { store: 'Kaspi', price: 70200, color: '#f54545' },
      { store: 'Alfa', price: 72000, color: '#3b82f6' }
    ];

    const mockInsights = {
      averagePrice: 70925,
      bestPrice: { store: 'Alser', price: 69999 },
      priceChange: -2.8,
      recommendation: 'Лучшее предложение сейчас в магазине Alser, рекомендуем к покупке'
    };

    //setPriceHistory(mockHistory);
    //setStoreComparison(mockComparison);
    //setInsights(mockInsights);
  };

  const loadAnalytics = async () => {
    const apiOptions = { stores: selectedStores };
    
    setIsLoading(true);
    //await delay(90000);
    await delay(5000);

    try {
      const [historyResponse, comparisonResponse, insightsResponse] = await Promise.all([
        extractHProducts(query, apiOptions),
        extractCProducts(query, apiOptions),
        extractIProducts(query, apiOptions)
      ]);

      const historyData = historyResponse?.data || [];
      const comparisonData = comparisonResponse?.data || [];
      const insightsData = insightsResponse?.data || {};

      console.log('📊 Extracted historyData:', historyData);
      console.log('📊 Extracted comparisonData:', comparisonData);
      console.log('📊 Extracted insightsData:', insightsData);

      // Обработка данных истории цен
      const processedHistory = historyData.map(item => ({
        date: item.date,
        Alser: Number(item.Alser) || 0,
        Sulpak: Number(item.Sulpak) || 0,
        Alfa: Number(item.Alfa) || 0,
        Kaspi: Number(item.Kaspi) || 0
      }));

      // Обработка данных сравнения магазинов
      const processedComparison = comparisonData.map(item => ({
        store: item.store || 'Unknown',
        price: Number(item.price) || 0,
        color: item.color || '#8884d8'
      }));

      // Обработка инсайтов
      const processedInsights = {
        averagePrice: Number(insightsData.averagePrice) || 0,
        bestPrice: {
          store: insightsData.bestPrice?.store || '',
          price: Number(insightsData.bestPrice?.price) || 0
        },
        priceChange: Number(insightsData.priceChange) || 0,
        recommendation: insightsData.recommendation || ''
      };

      console.log('✅ Processed history:', processedHistory);
      console.log('✅ Processed comparison:', processedComparison);
      console.log('✅ Processed insights:', processedInsights);

      setPriceHistory(processedHistory);
      setStoreComparison(processedComparison);
      setInsights(processedInsights);

    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      //loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (exportQuery) => {
    try {
      const blob = await exportProducts(exportQuery, { stores: selectedStores });

      if (!(blob instanceof Blob)) {
        throw new Error('API вернул не Blob. Проверьте responseType: "blob" в axios.');
      }
      if (blob.size === 0) {
        throw new Error('Файл пустой. Проверьте ответ сервера или параметры запроса.');
      }
      if (blob.type.includes('json')) {
        throw new Error('Сервер вернул JSON вместо Excel. Проверьте логи бэкенда.');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const safeQuery = String(exportQuery || '').replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, '_').substring(0, 50) || 'all_products';
      link.download = `BestPrice_Analytics_${safeQuery}_${new Date().toISOString().split('T')[0]}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    } catch (err) {
      console.error('❌ Ошибка экспорта:', err);
      alert(`Не удалось скачать файл: ${err.message || 'Проверьте консоль браузера'}`);
    }
  };

  const preparePieData = React.useMemo(() => {
    return (data) => {
      if (!data || data.length === 0) return [];
      
      const total = data.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
      if (total === 0) return [];
      
      const minPrice = Math.min(...data.map(d => Number(d.price) || Infinity));
      
      return data.map(item => {
        const price = Number(item.price) || 0;
        return {
          name: item.store || 'Магазин',
          value: Math.round((price / total) * 100),
          price,
          color: item.color || '#8884d8',
          isBest: price === minPrice && price > 0
        };
      });
    };
  }, []);

  const PieTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            Доля: <strong>{data.value}%</strong>
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            Цена: <strong>{formatPrice(data.price)}</strong>
          </p>
          {data.isBest && (
            <p style={{ margin: '8px 0 0', color: '#10B981', fontSize: '13px', fontWeight: 600 }}>
              ✓ Лучшее предложение
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatPrice(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Плейсхолдер при отсутствии запроса
  if (!query || query.length < 2) {
    return (
      <div className="analytics-placeholder">
        <FiShoppingBag className="placeholder-icon" />
        <h3>Выполните поиск товара</h3>
        <p>Чтобы увидеть аналитику цен, начните поиск с помощью строки выше</p>
      </div>
    );
  }

  // Основной рендер
  return (
    <div className="analytics-block">
      <div className="analytics-header">
        <h2 className="analytics-title">📊 Аналитика по товару</h2>
        <div className="export-section">
          <button className="export-btn" onClick={() => handleExport(query)}>
            📩 Скачать Excel
          </button>
        </div>
      </div>

      {/* График сравнения магазинов */}
      <div className="chart-container">
        <h3 className="chart-title">Сравнение цен по магазинам</h3>
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Загрузка данных графика, это может занять несколько минут...</p>
          </div>
        ) : storeComparison && storeComparison.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={storeComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="store" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="price"
                name="Цена"
                isAnimationActive={false}
                shape={(props) => {
                  const { x, y, width, height, payload } = props;
                  return (
                    <rect 
                      x={x} 
                      y={y} 
                      width={width} 
                      height={height} 
                      fill={payload?.color || '#8884d8'} 
                      rx={4}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">
            <p>Недостаточно данных для отображения диаграммы</p>
          </div>
        )}
      </div>

      {/* График динамики цен */}
      <div className="chart-container">
        <h3 className="chart-title">Динамика цен во времени</h3>
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Загрузка данных графика...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="linear" 
                dataKey="Alser" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Alser"
                dot={{ fill: '#10B981' }}
              />
              <Line 
                type="linear" 
                dataKey="Sulpak" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Sulpak"
                dot={{ fill: '#f59e0b' }}
              />
              <Line 
                type="linear" 
                dataKey="Alfa" 
                stroke="#6720ff" 
                strokeWidth={2}
                name="Alfa"
                dot={{ fill: '#6720ff' }}
              />
              <Line 
                type="linear" 
                dataKey="Kaspi" 
                stroke="#fc0303" 
                strokeWidth={2}
                name="Kaspi"
                dot={{ fill: '#fc0303' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Секция: Распределение цен */}
      <div className="chart-container">
        <h3 className="chart-title">Процентная доля магазинов</h3>
        
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Загрузка данных диаграммы...</p>
          </div>
        ) : storeComparison && storeComparison.length > 0 ? (
          <div className="pie-layout">
            <div className="pie-chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={preparePieData(storeComparison)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    isAnimationActive={false}
                  >
                    {preparePieData(storeComparison).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pie-legend">
              <p>{`Процентная доля магазинов по товару: ${query}`}</p>
              {preparePieData(storeComparison).map((item, idx) => (
                <div 
                  key={idx} 
                  className={`legend-item ${item.isBest ? 'best-price' : ''}`}
                >
                  <span className="legend-color" style={{ backgroundColor: item.color }} />
                  <span className="legend-name">
                    {item.name}
                    {item.isBest && <span className="best-badge">✓</span>}
                  </span>
                  <span className="legend-value">{item.value}%</span>
                  <span className="legend-price">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>Недостаточно данных для отображения диаграммы</p>
          </div>
        )}
      </div>

      {/* Инсайты */}
      {insights && (
        <div className="insights-container">
          <h3 className="insights-title">💡 Аналитические инсайты</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <FiDollarSign className="insight-icon" />
              <div className="insight-content">
                <span className="insight-label">Средняя цена</span>
                <span className="insight-value">{formatPrice(insights.averagePrice)}</span>
              </div>
            </div>

            <div className="insight-card best-price">
              <FiTrendingDown className="insight-icon" />
              <div className="insight-content">
                <span className="insight-label">Лучшее предложение</span>
                <span className="insight-value">
                  {insights.bestPrice.store}: {formatPrice(insights.bestPrice.price)}
                </span>
              </div>
            </div>

            <div className="insight-card">
              <FiTrendingUp className="insight-icon" />
              <div className="insight-content">
                <span className="insight-label">Дешевле на</span>
                <span className={`insight-value ${insights.priceChange < 0 ? 'positive' : 'negative'}`}>
                  {insights.priceChange > 0 ? '+' : ''}{insights.priceChange}%
                </span>
              </div>
            </div>
          </div>

          <div className="recommendation">
            <p>{insights.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsBlock;
