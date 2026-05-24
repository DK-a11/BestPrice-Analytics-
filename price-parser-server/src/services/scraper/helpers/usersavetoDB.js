import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; 
import User from '../../../models/users.js';

export const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/PriceParserDB';

let _isDbConnected = false;

export const connectDatabase = async () => {
  if (_isDbConnected && mongoose.connection.readyState === 1) {
    console.log('[DB] Уже подключены');
    return true;
  }

  try {
    console.log('[DB] Подключение к:', DB_URI);
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    _isDbConnected = true;
    console.log('MongoDB подключена:', mongoose.connection.host);
    return true;
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error.message);
    throw error;
  }
};

const validateUserData = (userData) => {
  console.log('[Validation] Проверяем данные:', {
    ...userData,
    password: '***hidden***'
  });
  
  const requiredFields = ['name', 'email', 'phone', 'userType', 'password'];
  
  if (userData.userType === 'company') {
    requiredFields.push('companyName');
  }

  const missingFields = requiredFields.filter((field) => {
    const value = userData[field];
    return value === null || value === undefined || 
           (typeof value === 'string' && !value.trim());
  });

  if (missingFields.length > 0) {
    console.error('[Validation] Не хватает полей:', missingFields);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }


  if (userData.password && userData.password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  console.log('[Validation] Все поля на месте');
};


const hashPassword = async (plainPassword) => {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
};

export const createUser = async (userData) => {
  console.log('[UserService] === НАЧАЛО СОЗДАНИЯ ПОЛЬЗОВАТЕЛЯ ===');
  console.log('[UserService] Входные данные:', {
    ...userData,
    password: '***hidden***'
  });

  try {
    console.log('[UserService] Шаг 1: Подключение к БД...');
    await connectDatabase();
    console.log('[UserService] БД подключена');

    console.log('[UserService] Шаг 2: Валидация...');
    validateUserData(userData);
    console.log('[UserService] Валидация пройдена');

    console.log('[UserService] Шаг 3: Проверка email на дубликат...');
    const existingUser = await User.findOne({ 
      email: userData.email.toLowerCase().trim() 
    }).exec();
    
    if (existingUser) {
      console.error('[UserService] Email уже существует:', userData.email);
      const error = new Error('Email already exists');
      error.code = 'EMAIL_EXISTS';
      error.statusCode = 409;
      throw error;
    }
    console.log('[UserService] Email свободен');

    console.log('[UserService] Шаг 4: Подготовка данных и хеширование пароля...');
    
    const hashedPassword = await hashPassword(userData.password); 
    
    const userToCreate = {
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone.trim(),
      userType: userData.userType,
      password: hashedPassword, 
      companyName: userData.userType === 'company' 
        ? userData.companyName?.trim() 
        : undefined,
    };
    console.log('[UserService] Данные для сохранения (без пароля):', {
      ...userToCreate,
      password: '***hashed***'
    });

    console.log('[UserService] Шаг 5: Создание документа User...');
    const newUser = new User(userToCreate);
    console.log('[UserService] Документ создан:', {
      ...newUser.toObject(),
      password: '***hashed***'
    });

    console.log('[UserService] Шаг 6: Сохранение в БД...');
    await newUser.save();
    console.log('[UserService] Пользователь сохранён:', newUser._id);

    console.log('[UserService] Шаг 7: Формирование ответа...');
    const publicProfile = newUser.getPublicProfile 
      ? newUser.getPublicProfile() 
      : {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          userType: newUser.userType,
          companyName: newUser.companyName,
          createdAt: newUser.createdAt,
        };

    console.log('[UserService] === УСПЕШНОЕ ЗАВЕРШЕНИЕ ===');
    return publicProfile;

  } catch (error) {
    console.error('[UserService] === ОШИБКА ===');
    console.error('[UserService] Тип ошибки:', error.name);
    console.error('[UserService] Сообщение:', error.message);
    console.error('[UserService] Код:', error.code);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.error(`[UserService] Дубликат поля: ${field}`);
      const duplicateError = new Error(`${field} already exists`);
      duplicateError.code = 'DUPLICATE_FIELD';
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('[UserService] Ошибки валидации Mongoose:', messages);
      const validationError = new Error(messages.join('; '));
      validationError.code = 'VALIDATION_ERROR';
      validationError.statusCode = 400;
      throw validationError;
    }
    
    // Пробрасываем наши кастомные ошибки
    if (['EMAIL_EXISTS', 'VALIDATION_ERROR', 'DUPLICATE_FIELD'].includes(error.code)) {
      throw error;
    }
    
    console.error('[UserService] Неизвестная ошибка, пробрасываем дальше');
    throw error;
  }
};