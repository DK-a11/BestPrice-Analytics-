import React from 'react';
import { FiShoppingCart, FiExternalLink } from 'react-icons/fi';
import { formatPrice, getPriceChangeColor, getPriceChangeIcon } from '../../utils/helpers';
import './ProductCard.css';

const STORE_LOGOS = {
  Alser: '🟢',
  Sulpak: '🟡',
  Alfa: '🔵',
  Kaspi: '🔴',
};

const ProductCard = ({ product}) => {
  const {
    name,
    price,
    priceChange,
    stores,
    isBestPrice,
  } = product;


  return (
    <div className="product-list-item">
      <div className="product-item-content">
        <div className="product-item-main">
          <h4 className="product-item-name" title={name}>
            {name}
            {isBestPrice && <span className="best-price-label">Лучшая цена</span>}
          </h4>
        </div>

        <div className="product-item-details">
          <div className="product-item-price">
            <span className="price-value">{formatPrice(price)}</span>
            {priceChange !== 0 && (
              <span className={`price-change ${getPriceChangeColor(priceChange)}`}>
                {getPriceChangeIcon(priceChange)} {Math.abs(priceChange)}%
              </span>
            )}
          </div>

          <div className="product-item-stores">
            <span className="stores-label">Доступно:</span>
            <div className="stores-logos">
              {stores.map((store) => (
                <span key={store} className="store-logo" title={store}>
                  {STORE_LOGOS[store] || '🏪'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button className="compare-btn" onClick={() => window.open(product.itemlink, '_blank')}>
        <FiShoppingCart />
        <span> В магазин</span>
        <FiExternalLink className="external-icon" />
      </button>
    </div>
  );
};

export default ProductCard;
