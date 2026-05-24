import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import SearchBar from './components/Search/SearchBar';
import AnalyticsBlock from './components/Analytics/AnalyticsBlock';
import PopularProductsBlock from './components/PopularProducts/PopularProductsBlock';
import Footer from './components/Footer/Footer';
import TelegramAnalytics from './pages/TelegramAnalytics';
import RegistrationModal from './components/RegistrationForm/RegistrationModal';
import LoginModal from './components/RegistrationForm/LoginModal';
import AccountProfile from './components/RegistrationForm/AccountProfile';
import './index.css';

const STORES_CONFIG = [
  { id: 'alser', name: 'Alser', color: '#10b981', icon: '💚' },
  { id: 'kaspi', name: 'Kaspi', color: '#f54545', icon: '🛒' },
  { id: 'sulpak', name: 'Sulpak', color: '#f59e0b', icon: '🔌' },
  { id: 'alfa', name: 'Alfa', color: '#3b82f6', icon: '🏪' },
];

function MainApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedStores, setSelectedStores] = useState(
    STORES_CONFIG.map(s => s.id)
  );

  const [activeModal, setActiveModal] = useState(null); 

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); 

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('❌ Ошибка проверки авторизации:', error);
        // При ошибке парсинга очищаем невалидные данные
        handleLogout();
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    const user = userData.user || userData;
    const token = userData.token || 'mock-token';
    
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    // Сохранение в localStorage для сохранения сессии
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('✅ Пользователь авторизован:', user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    console.log('👋 Пользователь вышел из аккаунта');
    
  };

  const openRegistrationModal = () => setActiveModal('registration');
  const openLoginModal = () => setActiveModal('login');
  const closeModals = () => setActiveModal(null);
  
  const switchToLogin = () => setActiveModal('login');
  const switchToRegister = () => setActiveModal('registration');

  const toggleStore = (storeId) => {
    setSelectedStores(prev =>
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  const selectAllStores = () => setSelectedStores(STORES_CONFIG.map(s => s.id));
  const deselectAllStores = () => setSelectedStores([]);

  const handleSearch = async (query, options = {}) => {
    setSearchQuery(query);
    
    if (options.stores && Array.isArray(options.stores)) {
      setSelectedStores(options.stores);
    }

    setSelectedProductId('demo-product-1');
  };

  const shouldShowModals = !isAuthenticated && activeModal !== null;

  //console.log('👤 currentUser:', currentUser);
  //console.log('🔑 currentUser._id:', currentUser?._id);
  //console.log('🔑 currentUser.id:', currentUser?.id);

  return (
    <div className="app min-h-screen bg-primary-white">
      {/* Хедер */}
      <header className="app-header bg-white border-b-2 border-accent-green sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="header-logo">
              <h1 className="text-3xl font-bold text-text-black flex items-center gap-3">
                <span className="logo-icon">💰</span>
                <span>BestPrice Analytics</span>
              </h1>
              <p className="text-contrast-gray text-sm mt-1">
                Мониторинг цен из популярных интернет-магазинов
              </p>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#search" className="nav-link">Поиск</a>
              <a href="#analytics" className="nav-link">Аналитика</a>
              <a href="#popular" className="nav-link">Список товаров</a>
              <a href="#about" className="nav-link">О проекте</a>
            </nav>

            {/* 🆕 Условный рендеринг: кнопка входа ИЛИ профиль пользователя */}
            <div className="auth-section">
              {authLoading ? (
                // 🔄 Заглушка во время проверки авторизации
                <div className="auth-loading w-24 h-10 bg-gray-100 rounded-lg animate-pulse" />
              ) : !isAuthenticated ? (
                // 👤 Не авторизован: показываем кнопку "Войти"
                <button 
                  onClick={openLoginModal}
                  className="btn-login px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Войти
                </button>
              ) : (
                // ✅ Авторизован: показываем профиль пользователя
                <AccountProfile 
                  user={currentUser} 
                  onLogout={handleLogout} 
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main>
        {/* Блок 1: Поиск */}
        <section id="search" className="hero-section py-20 bg-gradient-to-b from-white to-primary-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-text-black mb-4">
                Найдите лучшие цены
              </h2>
              <p className="text-xl text-contrast-gray max-w-2xl mx-auto">
                для лучшего поиска пишите более детальное название к примеру "смартфон samsung galaxy"
              </p>
            </div>
            
            <SearchBar
              onSearch={handleSearch}
              selectedStores={selectedStores}
              onToggleStore={toggleStore}
              onSelectAll={selectAllStores}
              onDeselectAll={deselectAllStores}
              storesConfig={STORES_CONFIG}
              userId={currentUser?._id || currentUser?.id || null}
            />

            {searchQuery && (
              <div className="mt-6 text-center">
                <p className="text-contrast-gray">
                  Результаты поиска для: <span className="font-semibold text-accent-green">"{searchQuery}"</span>
                </p>
                {selectedStores.length > 0 && selectedStores.length < STORES_CONFIG.length && (
                  <p className="text-sm text-contrast-gray mt-2">
                    Магазины: {selectedStores.map(id => 
                      STORES_CONFIG.find(s => s.id === id)?.name
                    ).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Блок 2: Аналитика */}
        <section id="analytics" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <AnalyticsBlock productId={selectedProductId} query={searchQuery} selectedStores={selectedStores}/>
          </div>
        </section>

        {/* Блок 3: Популярные товары */}
        <section id="popular" className="py-16 bg-primary-white">
          <div className="container mx-auto px-4">
            <PopularProductsBlock query={searchQuery} selectedStores={selectedStores}/>
          </div>
        </section>

        {/* Блок с преимуществами */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-text-black mb-12">
              Почему выбирают PriceParser?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3 className="feature-title">Умная аналитика</h3>
                <p className="feature-description">
                  Отслеживаем динамику цен и даем рекомендации по покупке
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Быстрый поиск</h3>
                <p className="feature-description">
                  Мгновенное сравнение цен по всем популярным магазинам
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3 className="feature-title">Экономия денег</h3>
                <p className="feature-description">
                  Находите лучшие предложения и экономьте на покупках
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Футер */}
      <Footer />

      {/* Модальные окна — рендерим только если пользователь НЕ авторизован */}
      {shouldShowModals && activeModal === 'registration' && (
        <RegistrationModal 
          isOpen={activeModal === 'registration'}
          onClose={closeModals}
          onSwitchToLogin={switchToLogin}
        />
      )}
      
      {shouldShowModals && activeModal === 'login' && (
        <LoginModal 
          isOpen={activeModal === 'login'}
          onClose={closeModals}
          onSwitchToRegister={switchToRegister}
          onLoginSuccess={handleLoginSuccess} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/tg-app" element={<TelegramAnalytics />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
