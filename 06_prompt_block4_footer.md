# ПРОМПТ: Блок 4 - Футер сайта

## 🎯 Задача для разработчика

Создать информативный и стильный футер для лендинга. Футер должен содержать контактную информацию, ссылки на социальные сети, дополнительную навигацию и соответствовать общему дизайну сайта.

---

## 📋 Технические требования

### **Frontend (React)**

#### 1. Структура футера
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ О проекте    │  │ Навигация    │  │ Контакты   ││
│  │              │  │              │  │            ││
│  │ PriceParser  │  │ Главная      │  │ 📧 Email   ││
│  │ Сервис для   │  │ Категории    │  │ 💬 Telegram││
│  │ мониторинга  │  │ О нас        │  │ 🐙 GitHub  ││
│  │ цен          │  │ API          │  │            ││
│  └──────────────┘  └──────────────┘  └────────────┘│
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  © 2026 PriceParser | Все права защищены            │
│  Политика конфиденциальности | Условия использования│
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🎨 Визуальный дизайн

### Цветовая схема:
```css
.footer {
  background: linear-gradient(180deg, #F9FAFB 0%, #E5E7EB 100%);
  color: #111827; /* черный текст */
  border-top: 2px solid #10B981; /* зеленый акцент */
}

.footer-link {
  color: #6B7280; /* серый */
  transition: color 0.2s;
}

.footer-link:hover {
  color: #10B981; /* зеленый при hover */
}

.footer-icon {
  color: #10B981;
  font-size: 24px;
}

.footer-bottom {
  background: #E5E7EB;
  color: #6B7280;
  font-size: 14px;
}
```

---

## 📦 Структура компонентов

```
client/src/components/Footer/
├── Footer.jsx                # Основной компонент футера
├── Footer.module.css
│
├── FooterColumn/
│   ├── FooterColumn.jsx      # Колонка футера
│   └── FooterColumn.module.css
│
├── SocialLinks/
│   ├── SocialLinks.jsx       # Социальные иконки
│   ├── SocialIcon.jsx        # Отдельная иконка
│   └── SocialLinks.module.css
│
├── ContactInfo/
│   ├── ContactInfo.jsx       # Контактная информация
│   └── ContactInfo.module.css
│
└── FooterBottom/
    ├── FooterBottom.jsx      # Копирайт и legal links
    └── FooterBottom.module.css
```

---

## 💻 Пример React компонента

```jsx
// Footer.jsx (псевдокод)
import React from 'react';
import styles from './Footer.module.css';
import { FaGithub, FaEnvelope, FaTelegram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Секция 1: О проекте */}
        <div className={styles.footerColumn}>
          <h3 className={styles.footerTitle}>
            <span className={styles.logo}>💰</span> PriceParser
          </h3>
          <p className={styles.footerDescription}>
            Сервис для мониторинга и анализа цен на товары 
            из популярных интернет-магазинов.
          </p>
          <p className={styles.footerTagline}>
            Найди лучшую цену. Экономь время и деньги.
          </p>
        </div>

        {/* Секция 2: Навигация */}
        <div className={styles.footerColumn}>
          <h4 className={styles.columnTitle}>Навигация</h4>
          <ul className={styles.footerLinks}>
            <li><a href="/">Главная</a></li>
            <li><a href="/categories">Категории</a></li>
            <li><a href="/about">О проекте</a></li>
            <li><a href="/api-docs">API документация</a></li>
            <li><a href="/faq">Часто задаваемые вопросы</a></li>
          </ul>
        </div>

        {/* Секция 3: Контакты */}
        <div className={styles.footerColumn}>
          <h4 className={styles.columnTitle}>Контакты</h4>
          <div className={styles.contactInfo}>
            <a href="mailto:contact@priceparser.com" className={styles.contactItem}>
              <FaEnvelope className={styles.icon} />
              <span>contact@priceparser.com</span>
            </a>
            <a href="https://t.me/priceparser" className={styles.contactItem}>
              <FaTelegram className={styles.icon} />
              <span>@priceparser</span>
            </a>
            <a href="https://github.com/username/priceparser" className={styles.contactItem}>
              <FaGithub className={styles.icon} />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

        {/* Секция 4: Социальные сети (опционально) */}
        <div className={styles.footerColumn}>
          <h4 className={styles.columnTitle}>Следите за нами</h4>
          <div className={styles.socialLinks}>
            <a href="https://github.com/username" target="_blank" rel="noopener noreferrer">
              <FaGithub className={styles.socialIcon} />
            </a>
            <a href="https://t.me/channel" target="_blank" rel="noopener noreferrer">
              <FaTelegram className={styles.socialIcon} />
            </a>
            <a href="https://linkedin.com/in/username" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className={styles.socialIcon} />
            </a>
          </div>
        </div>
      </div>

      {/* Нижняя часть футера */}
      <div className={styles.footerBottom}>
        <div className={styles.footerBottomContainer}>
          <p className={styles.copyright}>
            © {currentYear} PriceParser. Все права защищены.
          </p>
          <div className={styles.legalLinks}>
            <a href="/privacy">Политика конфиденциальности</a>
            <span className={styles.separator}>•</span>
            <a href="/terms">Условия использования</a>
            <span className={styles.separator}>•</span>
            <a href="/disclaimer">Дисклеймер</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

---

## 🎨 Стили CSS (модульные)

```css
/* Footer.module.css */

.footer {
  background: linear-gradient(180deg, #F9FAFB 0%, #E5E7EB 100%);
  border-top: 2px solid #10B981;
  padding: 60px 20px 0;
  margin-top: 80px;
}

.footerContainer {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  padding-bottom: 40px;
}

.footerColumn {
  display: flex;
  flex-direction: column;
}

.footerTitle {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-size: 28px;
}

.footerDescription {
  color: #6B7280;
  line-height: 1.6;
  margin-bottom: 12px;
}

.footerTagline {
  color: #10B981;
  font-weight: 600;
  font-size: 14px;
}

.columnTitle {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.footerLinks {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footerLinks li {
  margin-bottom: 12px;
}

.footerLinks a {
  color: #6B7280;
  text-decoration: none;
  transition: color 0.2s;
  font-size: 15px;
}

.footerLinks a:hover {
  color: #10B981;
}

.contactInfo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contactItem {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6B7280;
  text-decoration: none;
  transition: color 0.2s;
}

.contactItem:hover {
  color: #10B981;
}

.icon {
  font-size: 20px;
  color: #10B981;
}

.socialLinks {
  display: flex;
  gap: 16px;
}

.socialIcon {
  font-size: 28px;
  color: #6B7280;
  transition: all 0.3s;
}

.socialIcon:hover {
  color: #10B981;
  transform: translateY(-3px);
}

.footerBottom {
  background: #E5E7EB;
  padding: 24px 20px;
  border-top: 1px solid #D1D5DB;
}

.footerBottomContainer {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.copyright {
  color: #6B7280;
  font-size: 14px;
  margin: 0;
}

.legalLinks {
  display: flex;
  gap: 8px;
  align-items: center;
}

.legalLinks a {
  color: #6B7280;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.legalLinks a:hover {
  color: #10B981;
}

.separator {
  color: #D1D5DB;
}

/* Адаптивность */

@media (max-width: 1024px) {
  .footerContainer {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 40px 20px 0;
  }

  .footerContainer {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footerBottomContainer {
    flex-direction: column;
    text-align: center;
  }

  .legalLinks {
    flex-direction: column;
    gap: 8px;
  }

  .separator {
    display: none;
  }
}
```

---

## 📧 Контактная информация

### Элементы контактов:
1. **Email**: contact@priceparser.com
2. **GitHub**: https://github.com/username/priceparser
3. **Telegram**: @priceparser (опционально)
4. **LinkedIn**: (опционально)

### Иконки (react-icons):
```bash
npm install react-icons
```

```jsx
import { 
  FaGithub, 
  FaEnvelope, 
  FaTelegram, 
  FaLinkedin,
  FaTwitter 
} from 'react-icons/fa';
```

---

## 📄 Дополнительные страницы (Legal)

### 1. Политика конфиденциальности (`/privacy`)
**Основные пункты:**
- Какие данные собираются (аналитика, cookies)
- Как используются данные
- С кем данные не передаются
- Права пользователей (GDPR compliance)
- Контактная информация для запросов

### 2. Условия использования (`/terms`)
**Основные пункты:**
- Описание сервиса
- Ограничения использования
- Дисклеймер об актуальности цен
- Ограничение ответственности
- Изменение условий

### 3. Дисклеймер (`/disclaimer`)
**Текст:**
```
"Информация о ценах на товары получена из открытых источников 
и может не соответствовать актуальным данным на сайтах магазинов. 
Для получения точной информации о цене, наличии и условиях покупки 
рекомендуем обращаться на официальные сайты интернет-магазинов. 

PriceParser не является интернет-магазином и не осуществляет 
продажу товаров."
```

---

## 🔗 Навигационные ссылки

### Основные:
- **Главная** (`/`)
- **Категории** (`/categories`)
- **О проекте** (`/about`)
- **Часто задаваемые вопросы** (`/faq`)

### Дополнительные (для будущего развития):
- **Блог** (`/blog`)
- **API документация** (`/api-docs`)
- **Карьера** (`/careers`)
- **Партнерам** (`/partners`)

---

## 🎯 Функциональность

### 1. Smooth Scroll к началу страницы
```jsx
const ScrollToTop = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button 
      className={styles.scrollTopButton} 
      onClick={scrollToTop}
      aria-label="Прокрутить вверх"
    >
      ↑
    </button>
  );
};
```

### 2. Newsletter подписка (опционально)
```jsx
const NewsletterForm = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API запрос для подписки
    await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.newsletter}>
      <input 
        type="email" 
        placeholder="Ваш email для новостей"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Подписаться</button>
    </form>
  );
};
```

### 3. Динамический год в копирайте
```jsx
const currentYear = new Date().getFullYear();
<p>© {currentYear} PriceParser</p>
```

---

## 📱 Адаптивность

### Desktop (> 1024px)
- 4 колонки в футере
- Горизонтальное расположение legal links

### Tablet (768px - 1024px)
- 2 колонки в футере
- Горизонтальное расположение legal links

### Mobile (< 768px)
- 1 колонка (стек)
- Вертикальное расположение legal links
- Центрирование текста
- Увеличенные зоны нажатия для ссылок

---

## ♿ Accessibility (Доступность)

### Требования:
```jsx
// ARIA labels для иконок
<a href="mailto:..." aria-label="Написать на email">
  <FaEnvelope />
</a>

// Навигация
<nav aria-label="Footer navigation">
  <ul>...</ul>
</nav>

// Контрастность текста (минимум 4.5:1)
color: #111827; // на фоне #F9FAFB ✅

// Keyboard navigation
a:focus {
  outline: 2px solid #10B981;
  outline-offset: 2px;
}
```

---

## 🔒 SEO оптимизация

### Schema.org разметка
```jsx
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PriceParser",
  "url": "https://priceparser.com",
  "logo": "https://priceparser.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "contact@priceparser.com",
    "contactType": "Customer Service"
  },
  "sameAs": [
    "https://github.com/username/priceparser",
    "https://t.me/priceparser"
  ]
}
</script>
```

---

## 🎭 Анимации

### Hover эффекты
```css
.footerLinks a {
  position: relative;
  transition: color 0.2s;
}

.footerLinks a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #10B981;
  transition: width 0.3s;
}

.footerLinks a:hover::after {
  width: 100%;
}
```

### Социальные иконки
```css
.socialIcon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.socialIcon:hover {
  transform: translateY(-3px) scale(1.1);
  color: #10B981;
}
```

---

## 🔧 Backend (опционально)

### Newsletter API
```javascript
// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  
  // Валидация email
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  // Сохранение в БД
  await Newsletter.create({ 
    email, 
    subscribedAt: new Date() 
  });
  
  res.json({ message: 'Subscribed successfully' });
});
```

---

## ✅ Чек-лист реализации

### Frontend
- [ ] Создать компонент Footer.jsx
- [ ] Реализовать структуру с 4 колонками
- [ ] Добавить навигационные ссылки
- [ ] Реализовать блок контактов
- [ ] Добавить социальные иконки (react-icons)
- [ ] Создать FooterBottom с копирайтом
- [ ] Добавить legal links (Privacy, Terms)
- [ ] Реализовать адаптивный дизайн
- [ ] Добавить hover эффекты
- [ ] Настроить accessibility (ARIA, focus states)
- [ ] Добавить кнопку "Наверх" (scroll to top)
- [ ] Newsletter форма (опционально)

### Backend (опционально)
- [ ] Endpoint `/api/newsletter/subscribe`
- [ ] Email валидация
- [ ] Сохранение подписок в БД
- [ ] Rate limiting для подписки

### Дополнительные страницы
- [ ] Создать страницу Privacy Policy
- [ ] Создать страницу Terms of Service
- [ ] Создать страницу Disclaimer
- [ ] Создать страницу FAQ (опционально)
- [ ] Создать страницу About (опционально)

---

## 🎯 Критерии успеха

- ✅ Все ссылки рабочие и валидные
- ✅ Email ссылка открывает почтовый клиент
- ✅ Социальные ссылки открываются в новой вкладке
- ✅ Корректное отображение на всех устройствах
- ✅ Accessibility score > 95 (Lighthouse)
- ✅ Все hover эффекты работают плавно

---

## 🔄 Дополнительные фичи (optional)

- Темная тема (dark mode toggle)
- Языковой переключатель (i18n)
