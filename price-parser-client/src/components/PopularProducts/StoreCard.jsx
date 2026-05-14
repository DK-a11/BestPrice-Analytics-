import React from 'react';
import { FiStar, FiPackage } from 'react-icons/fi';
import './StoreCard.css';

const StoreCard = ({ store }) => {
  const { name, logo, productCount, rating, color } = store;

  return (
    <div className="store-card" style={{ borderColor: color }}>
      <div className="store-header">
        <div className="store-logo" style={{ backgroundColor: color + '20' }}>
          <span style={{ fontSize: '32px' }}>{logo}</span>
        </div>
        <div className="store-info">
          <h4 className="store-name">{name}</h4>
          <div className="store-rating">
            <FiStar className="star-icon" fill="#F59E0B" stroke="#F59E0B" />
            <span>{rating}</span>
          </div>
        </div>
      </div>

      <div className="store-stats">
        <FiPackage className="stats-icon" />
        <span className="stats-text">
          товаровы на любой вкус
        </span>
      </div>

      <button className="store-btn" style={{ backgroundColor: color }} onClick={() => window.open(store.storelink, '_blank')}>
        Перейти в магазин
      </button>
    </div>
  );
};

export default StoreCard;
