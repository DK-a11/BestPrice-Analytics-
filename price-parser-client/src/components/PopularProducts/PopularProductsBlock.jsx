import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import StoreCard from './StoreCard';
import './PopularProductsBlock.css';
import { extractProducts } from '../../services/api';

const CATEGORIES = [
  { id: 'all', name: 'Все', icon: '🔥' },
  { id: 'electronics', name: 'Электроника', icon: '📱' },
  { id: 'clothing', name: 'Одежда', icon: '👕' },
  { id: 'home', name: 'Дом', icon: '🏠' },
  { id: 'sport', name: 'Спорт', icon: '⚽' },
  { id: 'accessories', name: 'Аксессуары', icon: '🕶️' },
];

const PopularProductsBlock = ({ query }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setcurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(5);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  useEffect(() => {
    loadProducts();
    loadStores();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      // Моковые данные для демонстрации
      const mockProducts = [
        {
          id: '1',
          name: 'iPhone 15 Pro 256GB',
          image: 'https://via.placeholder.com/200?text=iPhone+15',
          itemlink: 'https://alser.kz/iphone-15-pro-256gb',
          price: 86999,
          priceChange: 0,
          category: 'electronics',
          stores: ['Alser', 'Sulpak'],
          isBestPrice: true,
        },
        {
          id: '2',
          name: 'Samsung Galaxy S24 Ultra',
          image: 'https://via.placeholder.com/200?text=Galaxy+S24',
          itemlink: 'https://alser.kz/iphone-15-pro-256gb',
          price: 79990,
          priceChange: 2.1,
          category: 'electronics',
          stores: ['Alser'],
          isBestPrice: false,
        },
        {
          id: '3',
          name: 'AirPods Pro 2 поколения',
          image: 'https://via.placeholder.com/200?text=AirPods',
          itemlink: 'https://alser.kz/iphone-15-pro-256gb',
          price: 18990,
          priceChange: 0,
          category: 'electronics',
          stores: ['Sulpak'],
          isBestPrice: true,
        },
        {
          id: '4',
          name: 'MacBook Air M2 13"',
          image: 'https://via.placeholder.com/200?text=MacBook',
          itemlink: 'https://alser.kz/iphone-15-pro-256gb',
          price: 99990,
          priceChange: -3.5,
          category: 'electronics',
          stores: ['Alser'],
          isBestPrice: false,
        },
        {
          id: '5',
          name: 'Sony PlayStation 5',
          image: 'https://via.placeholder.com/200?text=PS5',
          itemlink: 'https://alser.kz/iphone-15-pro-256gb',
          price: 54990,
          priceChange: 1.8,
          category: 'electronics',
          stores: ['Alser'],
          isBestPrice: false,
        },
        {
          id: '6',
          name: 'Xiaomi Mi Band 8',
          image: 'https://via.placeholder.com/200?text=Mi+Band',
          itemlink: 'https://alser.kz/iphone-15-pro-256gb',
          price: 3490,
          priceChange: -8.5,
          category: 'electronics',
          stores: ['Alser', 'Sulpak'],
          isBestPrice: true,
        },
      ];

      const productsresponse = await extractProducts(query); 

      const productsData = productsresponse.data || [];

      // Фильтрация по категории
      const filteredProducts = selectedCategory === 'all'
        ? productsData
        : productsData.filter(p => p.category === selectedCategory);

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStores = async () => {
    try {
      const mockStores = [
        {
          id: '1',
          name: 'Alser',
          logo: '🟢',
          productCount: 45678,
          rating: 4.8,
          color: '#10B981',
          storelink: 'https://alser.kz',
        },
        {
          id: '2',
          name: 'Sulpak',
          logo: '🟡',
          productCount: 38234,
          rating: 4.6,
          color: '#f59e0b',
          storelink: 'https://sulpak.kz',
        },
        {
          id: '3',
          name: 'Kaspi',
          logo: '🔴',
          productCount: 38234,
          rating: 4.6,
          color: '#f54545',
          storelink: 'https://obyavleniya.kaspi.kz/',
        },
        {
          id: '4',
          name: 'Alfa',
          logo: '🔵',
          productCount: 38234,
          rating: 4.6,
          color: '#6720ff',
          storelink: 'https://alfa.kz/',
        },
      ];

      setStores(mockStores);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const pagination = ({productsPerPage, totalProducts}) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <div>
        <ul className='pagination'> 
          {pageNumbers.map(number => (
            <li key={number} className='page-item'>
              <a onClick={() => setcurrentPage(number)} href='#products-list' className='page-link'>
                {number}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );

  };

  return (
    <div className="popular-products-block">
      <div className="block-header">
        <h2 className="block-title">🔥 Товары по вашему запросу </h2>
      </div>

      {/* Фильтры категорий */}
      <div className="category-filters">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Список товаров */}
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка товаров...</p>
        </div>
      ) : (
        <div className="products-list">
          {currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {pagination({productsPerPage, totalProducts: products.length})}
        </div>
      )}

      {products.length === 0 && !isLoading && (
        <div className="empty-state">
          <p>В данной категории пока нет товаров</p>
        </div>
      )}

      {/* Популярные площадки */}
      <div className="stores-section">
        <h3 className="stores-title">📊 перейти на площадки</h3>
        <div className="stores-grid">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularProductsBlock;
