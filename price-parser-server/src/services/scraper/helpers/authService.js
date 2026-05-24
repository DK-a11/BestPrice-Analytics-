import mongoose from 'mongoose';
import User from '../../../models/users.js';
import bcrypt from 'bcryptjs'; 

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/PriceParserDB';


let _isDbConnected = false;
let _dbConnectionPromise = null;


export const connectDatabase = async () => {
  // Если уже подключены и соединение активно — возвращаем сразу
  if (_isDbConnected && mongoose.connection.readyState === 1) {
    console.log('[AuthDB] Уже подключены к MongoDB');
    return true;
  }

  // Если подключение уже в процессе — ждём его завершения
  if (_dbConnectionPromise) {
    console.log('[AuthDB] Ожидаем существующее подключение...');
    return _dbConnectionPromise;
  }

  // Создаём новое подключение
  _dbConnectionPromise = (async () => {
    try {
      console.log('[AuthDB] Подключение к MongoDB:', MONGODB_URI.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));
      
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,  // Таймаут выбора сервера
        socketTimeoutMS: 45000,          // Таймаут сокета
      });

      _isDbConnected = true;
      console.log(`[AuthDB] MongoDB подключена: ${mongoose.connection.host}`);
      
      mongoose.connection.on('error', (err) => {
        console.error('[AuthDB] MongoDB connection error:', err.message);
        _isDbConnected = false;
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('[AuthDB] MongoDB disconnected');
        _isDbConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('[AuthDB] MongoDB reconnected');
        _isDbConnected = true;
      });

      return true;
    } catch (error) {
      console.error('[AuthDB] Failed to connect to MongoDB:', error.message);
      _dbConnectionPromise = null; // Сбрасываем промис для повторной попытки
      throw error;
    }
  })();

  return _dbConnectionPromise;
};


export const isDatabaseConnected = () => {
  return _isDbConnected && mongoose.connection.readyState === 1;
};


export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    _isDbConnected = false;
    _dbConnectionPromise = null;
    console.log('[AuthDB] MongoDB disconnected');
  }
};


export const authenticateUser = async ({ email, password }) => {
  try {
    console.log('[AuthService] Инициализация авторизации...');
    await connectDatabase();
    console.log('[AuthService] БД подключена');

    if (!email || !password) {
      console.warn('[AuthService] Отсутствуют обязательные поля');
      const error = new Error('Email and password are required');
      error.code = 'MISSING_CREDENTIALS';
      error.statusCode = 400;
      throw error;
    }

    console.log('[AuthService] Поиск пользователя:', email);
    
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    })
    .select('+password') 
    .exec();

    if (!user) {
      console.warn('[AuthService] Пользователь не найден:', email);
      const error = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      console.warn('[AuthService] Неверный пароль для:', email);
      const error = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    console.log('[AuthService] Успешная авторизация:', user._id);
    
    return user.getPublicProfile 
      ? user.getPublicProfile() 
      : {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          companyName: user.companyName,
          createdAt: user.createdAt,
        };

  } catch (error) {
    if (['INVALID_CREDENTIALS', 'MISSING_CREDENTIALS'].includes(error.code)) {
      throw error;
    }

    if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
      console.error('[AuthService] Database error:', error.message);
      const dbError = new Error('Authentication service temporarily unavailable');
      dbError.code = 'DATABASE_ERROR';
      dbError.statusCode = 503;
      throw dbError;
    }

    console.error('[AuthService] Unexpected error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    const unknownError = new Error('Internal server error during authentication');
    unknownError.code = 'INTERNAL_ERROR';
    unknownError.statusCode = 500;
    throw unknownError;
  }
};


const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('[AuthService] Ошибка при сравнении паролей:', error.message);
    return false;
  }
};


export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
  
};