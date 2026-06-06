import express from 'express';
import ExcelJS from 'exceljs';
import { getProductsByQuery } from '../dataBaseExtract.js';

const router = express.Router();

router.get('/products/export', async (req, res) => {
  try {
    //Получаем данные (замените на реальный запрос к БД)
    const { query, stores } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Не указан поисковый запрос' });
    }

    let storesArray = [];
    if (stores) {
      storesArray = Array.isArray(stores)
        ? stores.map(s => String(s).trim().toLowerCase())
        : stores.split(',').map(s => s.trim().toLowerCase());
      storesArray = storesArray.filter(Boolean);
    }

    const data = await getProductsByQuery(query.trim(), { stores: storesArray });
    //console.log('Данные для экспорта:', data);

    // Создаём книгу
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Товары');

    // Описываем колонки
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 25 },
      { header: 'Название', key: 'name', width: 50, style: { alignment: { wrapText: true } }},
      { header: 'Цена (₸)', key: 'price', width: 15 },
      { header: 'Магазин', key: 'stores', width: 25 },
      { header: 'Ссылка на товар', key: 'itemlink', width: 40, style: { font: { color: { argb: 'FF0000FF' } } } }
    ];

    //console.log('Данные для экспорта:', data);

    // Загружаем данные
    worksheet.addRows(data);

    // Отправляем файл
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="products.xlsx"'
    );
    res.setHeader('Cache-Control', 'no-cache');

    // Запись напрямую в поток ответа
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Ошибка экспорта:', err);
    // Если заголовки ещё не отправлены, возвращаем JSON
    if (!res.headersSent) {
      res.status(500).json({ error: 'Не удалось сформировать файл' });
    }
  }
});

export default router;