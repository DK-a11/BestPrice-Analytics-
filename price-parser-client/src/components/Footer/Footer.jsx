import React from 'react';
import { FiMail, FiGithub, FiMessageCircle, FiHeart } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  //тут мне даже говорить не о чем
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Колонка 1: О проекте */}
          <div className="footer-column">
            <h3 className="footer-heading">💰 PriceParser</h3>
            <p className="footer-description">
              ⚠️⚠️⚠️<br></br>
              Данный проект является демонстрационным прототипом. Все функциональные возможности и данные подлежат финальному согласованию перед официальным релизом.
            </p>
          </div>

          {/* Колонка 2: Навигация */}
          <div className="footer-column">
            <h4 className="footer-heading">Навигация</h4>
            <ul className="footer-links">
              <li><a href="#home">Главная</a></li>
              <li><a href="#search">Поиск</a></li>
              <li><a href="#analytics">Аналитика</a></li>
              <li><a href="#popular">Популярное</a></li>
              <li><a href="#about">О проекте</a></li>
              <li><a href="#api">API</a></li>
            </ul>
          </div>

          {/* Колонка 3: Категории */}
          <div className="footer-column">
            <h4 className="footer-heading">Категории</h4>
            <ul className="footer-links">
              <li><a href="#electronics">Электроника</a></li>
              <li><a href="#clothing">Одежда</a></li>
              <li><a href="#home">Дом и сад</a></li>
              <li><a href="#sport">Спорт</a></li>
              <li><a href="#beauty">Красота</a></li>
              <li><a href="#all">Все категории</a></li>
            </ul>
          </div>

          {/* Колонка 4: Контакты */}
          <div className="footer-column">
            <h4 className="footer-heading">Контакты</h4>
            <div className="footer-contacts">
              <a href="mailto:info@priceparser.ru" className="contact-link">
                <FiMail className="contact-icon" />
                <span>info@priceparser.ru</span>
              </a>
              <a href="https://web.telegram.org/a/#7757852587" target="_blank" rel="noopener noreferrer" className="contact-link">
                <FiMessageCircle className="contact-icon" />
                <span>Telegram</span>
              </a>
              <a href="https://github.com/priceparser" target="_blank" rel="noopener noreferrer" className="contact-link">
                <FiGithub className="contact-icon" />
                <span>GitHub</span>
              </a>
            </div>

            <div className="social-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
                <FiGithub />
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Telegram">
                <FiMessageCircle />
              </a>
              <a href="mailto:info@priceparser.ru" className="social-icon" aria-label="Email">
                <FiMail />
              </a>
            </div>
          </div>
        </div>

        {/* Разделитель */}
        <div className="footer-divider"></div>

        {/* Нижняя часть футера */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} PriceParser. Все права защищены.
            </p>
            
            <div className="footer-legal">
              <a href="#privacy">Политика конфиденциальности</a>
              <span className="separator">•</span>
              <a href="#terms">Условия использования</a>
              <span className="separator">•</span>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
