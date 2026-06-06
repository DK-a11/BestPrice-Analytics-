import React, { useState, useEffect } from 'react';
import './RegistrationModal.css';
import { SaveUsers } from '../../services/api';

const RegistrationModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  // Состояние формы
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    userType: 'individual', // 'individual' | 'company'
    companyName: '',
    password: '',
    confirmPassword: ''
  });

  // Состояние для показа/скрытия пароля
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Состояние ошибок валидации
  const [errors, setErrors] = useState({});
  
  // Состояние анимации
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Индикатор сложности пароля
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return { text: 'Слабый', color: '#ef4444' };
      case 2:
      case 3:
        return { text: 'Средний', color: '#f59e0b' };
      case 4:
      case 5:
        return { text: 'Надежный', color: '#10b981' };
      default:
        return { text: '', color: '#e5e7eb' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthInfo = getPasswordStrengthText(passwordStrength);

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

    // При изменении пароля проверяем подтверждение
    if (name === 'password' && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Пароли не совпадают'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }

    // При изменении подтверждения пароля
    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Пароли не совпадают'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
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

    // Имя валидация
    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно для заполнения';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    // Телефон валидация
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен для заполнения';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Введите корректный номер телефона';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Номер телефона должен содержать минимум 10 цифр';
    }

    // Пароль валидация
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен для заполнения';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать заглавные и строчные буквы, а также цифры';
    }

    // Подтверждение пароля
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    // Название компании (только для представителей компании)
    if (formData.userType === 'company' && !formData.companyName.trim()) {
      newErrors.companyName = 'Название компании обязательно для заполнения';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Подготовка данных для отправки
    const submissionData = {
      email: formData.email.trim(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      userType: formData.userType || 'individual',
      companyName: formData.userType === 'company' 
      ? (formData.companyName?.trim() || '') 
      : '',
      password: formData.password,
      createdAt: new Date().toISOString()
    };

    console.log('📤 Отправка данных регистрации:', submissionData);

    try {
      const result = await SaveUsers(submissionData);
      
      console.log('✅ Регистрация успешна:', result);
      
      // Сброс формы
      setFormData({
        email: '',
        name: '',
        phone: '',
        userType: 'individual',
        companyName: '',
        password: '',
        confirmPassword: ''
      });
      
      // Закрытие модального окна
      onClose();
      
      // TODO: показать уведомление об успехе пользователю
      // Например: showNotification('Регистрация успешна!', 'success');
      
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      
      // Обработка ошибок API
      if (error.response) {
        // Сервер вернул ошибку (4xx, 5xx)
        const serverError = error.response.data?.message || 'Ошибка при регистрации';
        
        // Обновляем ошибки формы на основе ответа сервера
        if (error.response.data?.errors) {
          setErrors(prev => ({
            ...prev,
            ...error.response.data.errors
          }));
        } else {
          // Показываем общую ошибку (можно вывести в UI)
          setErrors(prev => ({
            ...prev,
            submit: serverError
          }));
        }
      } else if (error.request) {
        // Запрос ушел, но нет ответа (сеть/таймаут)
        setErrors(prev => ({
          ...prev,
          submit: 'Нет соединения с сервером. Проверьте интернет.'
        }));
      } else {
        // Ошибка при настройке запроса
        setErrors(prev => ({
          ...prev,
          submit: 'Произошла непредвиденная ошибка'
        }));
      }
      
      // TODO: показать уведомление об ошибке пользователю
      // Например: showNotification('Ошибка регистрации', 'error');
    }
  };

  // Закрытие по клику на overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Если модалка закрыта и анимация завершена, не рендерим
  if (!shouldRender) return null;

  return (
    <div 
      className={`registration-modal-overlay ${isVisible ? 'visible' : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`registration-modal ${isVisible ? 'slide-down' : ''}`}>
        {/* Кнопка закрытия */}
        <button 
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Закрыть окно регистрации"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Заголовок */}
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">Регистрация</h2>
          <p className="modal-subtitle">Создайте аккаунт для доступа</p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* Имя */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Имя <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Ваше имя"
              autoComplete="name"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Телефон */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Телефон <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="+7 (___) ___-__-__"
              autoComplete="tel"
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          {/* Тип пользователя */}
          <div className="form-group">
            <label htmlFor="userType" className="form-label">
              Тип пользователя <span className="required">*</span>
            </label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className={`form-select ${errors.userType ? 'error' : ''}`}
            >
              <option value="individual">Физическое лицо</option>
              <option value="company">Представитель компании</option>
            </select>
          </div>

          {/* Название компании (условное поле) */}
          {formData.userType === 'company' && (
            <div className="form-group company-field">
              <label htmlFor="companyName" className="form-label">
                Название компании <span className="required">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={`form-input ${errors.companyName ? 'error' : ''}`}
                placeholder="ООО «Компания»"
                autoComplete="organization"
              />
              {errors.companyName && <span className="form-error">{errors.companyName}</span>}
            </div>
          )}

          {/* Пароль */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Пароль <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Минимум 8 символов"
                autoComplete="new-password"
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
            
            {/* Индикатор сложности пароля */}
            {formData.password && (
              <div className="password-strength">
                <div className="password-strength-bar">
                  <div 
                    className="password-strength-fill"
                    style={{ 
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: strengthInfo.color
                    }}
                  />
                </div>
                <span className="password-strength-text" style={{ color: strengthInfo.color }}>
                  {strengthInfo.text}
                </span>
              </div>
            )}
            
            <p className="password-hint">
              Пароль должен содержать минимум 8 символов, заглавные и строчные буквы, цифры
            </p>
          </div>

          {/* Подтверждение пароля */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Подтвердите пароль <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Повторите пароль"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>


          {/* Кнопки */}
          <div className="form-actions">
            {/* 🔄 Кнопка "Войти" вместо "Отмена" */}
            {/*<button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onSwitchToLogin}
            >
              Войти
            </button>*/}
            <button type="submit" className="btn btn-primary">
              Зарегистрироваться
            </button>
          </div>

          {/* Переключатель на вход */}
          <div className="modal-switch">
            <span className="switch-text">Уже есть аккаунт?</span>
            <button 
              type="button" 
              className="switch-link"
              onClick={onSwitchToLogin}
            >
              Войти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;