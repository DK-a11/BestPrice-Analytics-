import React, { useState } from 'react';
import './AccountProfile.css';


const AccountProfile = ({ user, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Генерация аватара из первой буквы имени
  const getAvatarInitial = (name) => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  };


  const getAvatarColor = (name) => {
    const colors = [
      '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', 
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];
    if (!name) return colors[0];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };


  const formatPhone = (phone) => {
    if (!phone) return '';

    const cleaned = phone.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+7') && cleaned.length === 12) {
      return `+7 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10)}`;
    }
    return phone;
  };

  const handleOutsideClick = () => {
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout?.();
  };

  const avatarStyle = {
    backgroundColor: getAvatarColor(user?.name),
  };

  return (
    <div className="account-profile">
      {/* Кнопка профиля с аватаром */}
      <button
        className="profile-trigger"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label="Открыть меню аккаунта"
        aria-expanded={isDropdownOpen}
      >
        <div className="avatar" style={avatarStyle}>
          {getAvatarInitial(user?.name)}
        </div>
        <span className="profile-name">{user?.name || 'Пользователь'}</span>
        <svg 
          className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Выпадающее меню профиля */}
      {isDropdownOpen && (
        <>
          {/* Overlay для закрытия по клику вне */}
          <div 
            className="profile-overlay" 
            onClick={handleOutsideClick}
            aria-hidden="true"
          />
          
          <div className="profile-dropdown">
            {/* Шапка дропдауна */}
            <div className="dropdown-header">
              <div className="avatar avatar-large" style={avatarStyle}>
                {getAvatarInitial(user?.name)}
              </div>
              <div className="dropdown-user-info">
                <p className="dropdown-user-name">{user?.name || 'Пользователь'}</p>
                <p className="dropdown-user-email">{user?.email}</p>
              </div>
            </div>

            {/* Детали профиля */}
            <div className="dropdown-details">
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Телефон</span>
                <span className="detail-value">{formatPhone(user?.phone)}</span>
              </div>

              {/* Условный рендеринг компании */}
              {user?.companyName && user.companyName.trim() && (
                <div className="detail-row">
                  <span className="detail-label">Компания</span>
                  <span className="detail-value">{user.companyName}</span>
                </div>
              )}

              {user?.userType && (
                <div className="detail-row">
                  <span className="detail-label">Тип аккаунта</span>
                  <span className="detail-value">
                    {user.userType === 'company' ? 'Представитель компании' : 'Физическое лицо'}
                  </span>
                </div>
              )}
            </div>

            {/* Кнопка выхода */}
            <div className="dropdown-footer">
              <button 
                className="btn-logout"
                onClick={handleLogout}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Выйти
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountProfile;