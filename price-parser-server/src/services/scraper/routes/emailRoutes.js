import express from 'express';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import User from '../../../models/users.js';
import Item from '../../../models/items.js';

// ===== Подключение к MongoDB =====
mongoose.connect('mongodb://localhost:27017/PriceParserDB')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const router = express.Router();

// ===== SMTP transporter =====
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'schuzz.05@gmail.com',
        pass: 'pbza mrck yrgv jxvw' // 16-значный пароль приложения
    }
});

// ===== Rate limiting =====
const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false
});

// ===== Вспомогательные функции =====

// Экранирование спецсимволов regex
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Экранирование HTML
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Парсер цены из строки в число.
 * Обрабатывает форматы: "1 234 ₽", "1234.56", "1,234.56", "1234,50", "1234руб"
 */
function parsePrice(priceStr) {
    if (!priceStr) return null;
    const cleaned = String(priceStr).replace(/[^\d.,]/g, '').replace(',', '.');
    const parts = cleaned.split('.');
    let normalized;
    if (parts.length > 2) {
        const last = parts.pop();
        normalized = parts.join('') + '.' + last;
    } else {
        normalized = cleaned;
    }
    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
}

/**
 * Находит две последние даты парсинга для заданного query + stores.
 * Группирует по календарному дню (UTC).
 */
async function getLastTwoDates(query, stores) {
    const safeQuery = escapeRegex(query);
    const items = await Item.find({
        query: { $regex: safeQuery, $options: 'i' },
        store: { $in: stores }
    })
        .select('parsedAt')
        .lean();

    // Группируем по дню
    const dateMap = new Map();
    items.forEach(item => {
        if (!item.parsedAt) return;
        const key = new Date(item.parsedAt).toISOString().split('T')[0];
        if (!dateMap.has(key)) {
            dateMap.set(key, new Date(item.parsedAt));
        }
    });

    // Сортируем по убыванию и берём top 2
    return Array.from(dateMap.values())
        .sort((a, b) => b - a)
        .slice(0, 2);
}

/**
 * Считает среднюю цену по каждому магазину для конкретной даты.
 */
async function getAveragePricesByStore(query, stores, date) {
    const safeQuery = escapeRegex(query);
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const items = await Item.find({
        query: { $regex: safeQuery, $options: 'i' },
        store: { $in: stores },
        parsedAt: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    // Группируем цены по магазинам
    const byStore = {};
    items.forEach(item => {
        if (!byStore[item.store]) byStore[item.store] = [];
        const price = parsePrice(item.price);
        if (price !== null) byStore[item.store].push(price);
    });

    // Считаем среднее
    const result = {};
    for (const store in byStore) {
        const prices = byStore[store];
        if (prices.length === 0) continue;
        const sum = prices.reduce((a, b) => a + b, 0);
        result[store] = {
            avg: sum / prices.length,
            count: prices.length
        };
    }
    return result;
}

// Форматирование числа как цены в рублях
function formatPrice(num) {
    if (num === null || num === undefined) return '—';
    return new Intl.NumberFormat('kz-KZ', {
        style: 'currency',
        currency: 'KZT',
        maximumFractionDigits: 2
    }).format(num);
}

// ===== HTML-шаблон письма =====
function buildEmailHtml({ query, currentDate, previousDate, currentData, previousData }) {
    const stores = Object.keys(currentData);

    const rows = stores.map(store => {
        const curr = currentData[store]?.avg;
        const prev = previousData[store]?.avg;

        let changeAbs = '<td style="padding:12px;border-bottom:1px solid #eee;">—</td>';
        let changePct = '<td style="padding:12px;border-bottom:1px solid #eee;">—</td>';
        let rowStyle = '';

        if (curr !== undefined && prev !== undefined && prev !== 0) {
            const diff = curr - prev;
            const percent = (diff / prev) * 100;
            const isUp = diff > 0;
            const color = isUp ? '#e74c3c' : '#27ae60';
            const arrow = isUp ? '↑' : '↓';
            const bg = isUp ? '#fff5f5' : '#f5fff5';

            rowStyle = `style="background-color:${bg}"`;
            changeAbs = `
                <td style="padding:12px;border-bottom:1px solid #eee;color:${color};font-weight:bold;">
                    ${arrow} ${formatPrice(Math.abs(diff))}
                </td>`;
            changePct = `
                <td style="padding:12px;border-bottom:1px solid #eee;color:${color};font-weight:bold;">
                    ${arrow} ${Math.abs(percent).toFixed(2)}%
                </td>`;
        }

        return `
            <tr ${rowStyle}>
                <td style="padding:12px;border-bottom:1px solid #eee;">${escapeHtml(store)}</td>
                <td style="padding:12px;border-bottom:1px solid #eee;">${formatPrice(curr)}</td>
                <td style="padding:12px;border-bottom:1px solid #eee;">${formatPrice(prev)}</td>
                ${changeAbs}
                ${changePct}
            </tr>
        `;
    }).join('');

    const prevDateStr = previousDate ? previousDate.toISOString().split('T')[0] : 'нет данных';
    const currDateStr = currentDate.toISOString().split('T')[0];

    return `
        <div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;color:#2c3e50;">
            <h2 style="color:#2c3e50;border-bottom:2px solid #10B981db;padding-bottom:10px;">
                📊 Уведомление об изменениях
            </h2>
            <p><strong>Запрос:</strong> ${escapeHtml(query)}</p>
            <p><strong>Период сравнения:</strong> ${prevDateStr} → ${currDateStr}</p>

            <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                <thead>
                    <tr style="background-color:#10B981db;color:white;">
                        <th style="padding:12px;text-align:left;">Магазин</th>
                        <th style="padding:12px;text-align:left;">Сейчас</th>
                        <th style="padding:12px;text-align:left;">Ранее</th>
                        <th style="padding:12px;text-align:left;">Изменение</th>
                        <th style="padding:12px;text-align:left;">%</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || '<tr><td colspan="5" style="padding:20px;text-align:center;">Нет данных</td></tr>'}
                </tbody>
            </table>

            <p style="margin-top:30px;color:#7f8c8d;font-size:12px;">
                Это автоматическое письмо, пожалуйста, не отвечайте на него.
            </p>
        </div>
    `;
}

// ===== Основной endpoint =====
router.post('/sendemail', emailLimiter, async (req, res) => {
    const { userId, query, stores } = req.body;

    // 1. Валидация входных данных
    if (!userId || !query || !Array.isArray(stores) || stores.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: userId, query, stores[]'
        });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid userId format'
        });
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0 || trimmedQuery.length > 200) {
        return res.status(400).json({
            success: false,
            message: 'Query must be between 1 and 200 characters'
        });
    }

    if (stores.length > 20 || stores.some(s => typeof s !== 'string' || s.length > 100)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid stores list'
        });
    }

    try {
        // 2. Получаем пользователя и его email
        const user = await User.findById(userId).select('email name').lean();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 3. Находим две последние даты парсинга
        const [currentDate, previousDate] = await getLastTwoDates(trimmedQuery, stores);

        if (!currentDate) {
            return res.status(404).json({
                success: false,
                message: 'No data found for this query and stores'
            });
        }

        // 4. Считаем средние цены для текущей даты
        const currentData = await getAveragePricesByStore(trimmedQuery, stores, currentDate);

        // 5. Считаем средние цены для предыдущей даты (если есть)
        const previousData = previousDate
            ? await getAveragePricesByStore(trimmedQuery, stores, previousDate)
            : {};

        // 6. Формируем HTML-письмо
        const html = buildEmailHtml({
            query: trimmedQuery,
            currentDate,
            previousDate,
            currentData,
            previousData
        });

        // 7. Отправляем письмо
        const info = await transporter.sendMail({
            from: `"BestPrise Report" <schuzz.05@gmail.com>`,
            to: user.email,
            subject: `📊 Уведомление об изменениях: ${trimmedQuery}`,
            html
        });

        console.log(`[EMAIL] price report sent to=${user.email} query="${trimmedQuery}" id=${info.messageId}`);

        res.status(200).json({
            success: true,
            messageId: info.messageId,
            comparedDates: {
                current: currentDate.toISOString().split('T')[0],
                previous: previousDate?.toISOString().split('T')[0] || null
            }
        });
    } catch (error) {
        console.error('[EMAIL] send failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to send email'
        });
    }
});

export default router;