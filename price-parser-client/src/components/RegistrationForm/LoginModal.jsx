import React, { useState, useEffect } from 'react';
import './LoginModal.css';
import { LoginUsers } from '../../services/api';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, onLoginSuccess }) => {
  // Состояние формы
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Состояние для показа/скрытия пароля
  const [showPassword, setShowPassword] = useState(false);
  
  // Состояние ошибок валидации
  const [errors, setErrors] = useState({});
  
  // Состояние анимации
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Обработка открытия/закрытия с анимацией
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Небольшая задержка для запуска CSS анимации
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden'; // Блокируем скролл
    } else {
      setIsVisible(false);
      document.body.style.overflow = ''; // Возвращаем скролл
      // Ждем завершения анимации перед unmount
      setTimeout(() => setShouldRender(false), 300);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Обработка клавиши Esc
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Обработка изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Валидация формы
  const validate = () => {
    const newErrors = {};

    // Email валидация
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    // Пароль валидация
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен для заполнения';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка отправки формы
  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submissionData = {
      email: formData.email.trim(),
      password: formData.password
    };

    console.log('🔐 Отправка данных авторизации:', submissionData);

    try {
      // Функция ожидает объект { userData: {...} }, поэтому передаем именно так
      const result = await LoginUsers(submissionData);
      if (onLoginSuccess) {
        onLoginSuccess(result); // или result.user, в зависимости от структуры ответа
      }
      onClose();
      
      // 🎯 Обработка успешного ответа
      // TODO: сохранить токен авторизации
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        sessionStorage.setItem('user', JSON.stringify(result.user));
      }
      
      // TODO: обновить глобальное состояние авторизации
      dispatch(setAuthenticated(true));
      dispatch(setUser(result.user));
      
      // Сброс формы
      setFormData({
        email: '',
        password: ''
      });
      
      // Закрытие модального окна
      onClose();
      
      // TODO: показать уведомление об успехе пользователю
      showNotification('Добро пожаловать!', 'success');
      
    } catch (error) {
      console.error('❌ Ошибка авторизации:', error);
      
      if (error.response) {
        // Сервер вернул ошибку с статусом (4xx, 5xx)
        const statusCode = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error;
        
        if (statusCode === 401 || statusCode === 403) {
          // Неверные учетные данные
          setErrors(prev => ({
            ...prev,
            submit: 'Неверный email или пароль'
          }));
        } else if (statusCode === 404) {
          // Пользователь не найден
          setErrors(prev => ({
            ...prev,
            submit: 'Пользователь с таким email не найден'
          }));
        } else if (statusCode === 429) {
          // Слишком много попыток (rate limiting)
          setErrors(prev => ({
            ...prev,
            submit: 'Слишком много попыток входа. Попробуйте позже'
          }));
        } else {
          // Другие ошибки сервера
          setErrors(prev => ({
            ...prev,
            submit: serverMessage || 'Ошибка при входе в аккаунт'
          }));
        }
        
        // 📋 Логирование для отладки
        console.warn('🔍 Ответ сервера:', error.response.data);
        
      } else if (error.request) {
        // Запрос ушел, но нет ответа (сеть/таймаут)
        console.warn('🌐 Нет ответа от сервера:', error.request);
        setErrors(prev => ({
          ...prev,
          submit: 'Нет соединения с сервером. Проверьте интернет.'
        }));
      } else {
        // Ошибка при настройке запроса или валидации
        console.error('⚙️ Ошибка запроса:', error.message);
        setErrors(prev => ({
          ...prev,
          submit: 'Произошла непредвиденная ошибка'
        }));
      }
      
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const fieldElement = document.getElementById(`login-${firstErrorField}`);
        if (fieldElement) {
          fieldElement.focus();
        }
      }
      
      // TODO: показать уведомление об ошибке пользователю
      showNotification('Ошибка входа', 'error');
    }
  };

  // Закрытие по клику на overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Переключение на форму регистрации
  const handleSwitchToRegister = (e) => {
    e.preventDefault();
    onClose();
    onSwitchToRegister();
  };

  // Если модалка закрыта и анимация завершена, не рендерим
  if (!shouldRender) return null;

  return (
    <div 
      className={`login-modal-overlay ${isVisible ? 'visible' : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className={`login-modal ${isVisible ? 'slide-down' : ''}`}>
        {/* Кнопка закрытия */}
        <button 
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Закрыть окно входа"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Заголовок */}
        <div className="modal-header">
          <h2 id="login-modal-title" className="modal-title">Вход</h2>
          <p className="modal-subtitle">Войдите в аккаунт для продолжения</p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          {/* Общая ошибка формы */}
          {errors.submit && (
            <div className="form-error form-error-global">
              {errors.submit}
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="login-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Пароль */}
          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Пароль <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Введите пароль"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
            
            {/* Ссылка "Забыли пароль?" */}
            <div className="forgot-password">
              <a href="#forgot" className="forgot-password-link" onClick={(e) => e.preventDefault()}>
                Забыли пароль?
              </a>
            </div>
          </div>

          {/* Кнопки */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-full">
              Войти
            </button>
          </div>

          {/* Переключатель на регистрацию */}
          <div className="modal-switch">
            <span className="switch-text">Нет аккаунта?</span>
            <button 
              type="button" 
              className="switch-link"
              onClick={handleSwitchToRegister}
            >
              Зарегистрироваться
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;