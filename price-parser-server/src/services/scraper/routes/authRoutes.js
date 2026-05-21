import express from 'express';
import { authenticateUser } from '../helpers/authService.js';

const router = express.Router();

router.post('/login', express.json(), async (req, res) => {
  try {
    // 🔹 1. Логирование запроса (без пароля!)
    console.log('[AuthRoute] Login attempt:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body.email,
      // password не логируем! 🔐
    });

    // 🔹 2. Извлечение и базовая валидация данных
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // 🔹 3. Вызов сервиса авторизации
    const user = await authenticateUser({ email, password });

    // 🔹 4. Успешный ответ согласно спецификации
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: user,
    });

  } catch (error) {
    // 🔹 5. Обработка ошибок авторизации (401)
    if (error.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid email or password',
      });
    }

    // 🔹 6. Обработка ошибок валидации (400)
    if (error.code === 'MISSING_CREDENTIALS') {
      return res.status(400).json({
        success: false,
        message: error.message || 'Missing required fields',
      });
    }

    // 🔹 7. Обработка ошибок базы данных (503)
    if (error.code === 'DATABASE_ERROR') {
      return res.status(503).json({
        success: false,
        message: error.message || 'Service temporarily unavailable',
      });
    }

    // 🔹 8. Логирование и ответ для непредвиденных ошибок (500)
    console.error('[AuthRoute] Unhandled error:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message || 'Authentication failed',
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Завершение сессии пользователя (для stateless JWT — заглушка)
 * @access  Public
 */
router.post('/logout', (req, res) => {
  // 🔹 Для JWT: клиент должен удалить токен на своей стороне
  // 🔹 Для сессий: здесь был бы req.session.destroy()
  
  return res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Получение данных текущего пользователя (требует авторизации)
 * @access  Protected (в будущем + middleware проверки токена)
 */
router.get('/me', (req, res) => {
  // 🔹 Заглушка: в будущем здесь будет проверка JWT из заголовка
  return res.status(501).json({
    success: false,
    message: 'Not implemented. Add JWT middleware to enable this endpoint.',
  });
});

export default router;