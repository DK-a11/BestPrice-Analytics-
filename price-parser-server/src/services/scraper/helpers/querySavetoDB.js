import mongoose from 'mongoose';
import User from '../../../models/users.js';
import Query from '../../../models/query.js';

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/PriceParserDB';

let _isDbConnected = false;
let _dbConnectionPromise = null;

export const connectDatabase = async () => {
  if (_isDbConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  if (_dbConnectionPromise) {
    return _dbConnectionPromise;
  }

  _dbConnectionPromise = (async () => {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      _isDbConnected = true;
      console.log(`✅ [QueryDB] MongoDB connected: ${mongoose.connection.host}`);

      mongoose.connection.on('error', (err) => {
        console.error('❌ [QueryDB] Connection error:', err.message);
        _isDbConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ [QueryDB] Disconnected');
        _isDbConnected = false;
      });

      return true;
    } catch (error) {
      console.error('❌ [QueryDB] Connection failed:', error.message);
      _dbConnectionPromise = null;
      throw error;
    }
  })();

  return _dbConnectionPromise;
};

export const isDatabaseConnected = () => {
  return _isDbConnected && mongoose.connection.readyState === 1;
};



export const saveUserQuery = async ({ userId, query }) => {
  try {
    // 🔹 0. Гарантируем подключение к БД
    await connectDatabase();

    // 🔹 1. Валидация входных данных
    if (!userId || !query) {
      const error = new Error('User ID and query text are required');
      error.code = 'MISSING_PARAMS';
      error.statusCode = 400;
      throw error;
    }

    // 🔹 2. Валидация формата userId (MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error('Invalid user ID format');
      error.code = 'INVALID_USER_ID';
      error.statusCode = 400;
      throw error;
    }

    // 🔹 3. Очистка и валидация текста запроса
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0 || trimmedQuery.length > 500) {
      const error = new Error('Query must be between 1 and 500 characters');
      error.code = 'INVALID_QUERY_LENGTH';
      error.statusCode = 400;
      throw error;
    }

    console.log('[QueryService] Сохранение запроса:', { userId, query: trimmedQuery });

    // 🔹 4. Поиск пользователя в базе
    const user = await User.findById(userId).exec();

    if (!user) {
      console.warn('[QueryService] Пользователь не найден:', userId);
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }


    const queryData = {
      userId: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      companyName: user.companyName || '', 
      query: trimmedQuery,
    };

    console.log('[QueryService] Данные для сохранения:', queryData);

    const newQuery = new Query(queryData);
    await newQuery.save();

    console.log('[QueryService] ✅ Запрос сохранён:', newQuery._id);

    return newQuery.getPublicData 
      ? newQuery.getPublicData() 
      : {
          _id: newQuery._id,
          userId: newQuery.userId,
          name: newQuery.name,
          email: newQuery.email,
          userType: newQuery.userType,
          companyName: newQuery.companyName,
          query: newQuery.query,
          querysDate: newQuery.querysDate,
          createdAt: newQuery.createdAt,
        };

  } catch (error) {
    if (['MISSING_PARAMS', 'INVALID_USER_ID', 'INVALID_QUERY_LENGTH', 'USER_NOT_FOUND'].includes(error.code)) {
      throw error;
    }

    if (error.code === 11000) {
      const duplicateError = new Error('Duplicate query entry');
      duplicateError.code = 'DUPLICATE_QUERY';
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      const validationError = new Error(messages.join('; '));
      validationError.code = 'VALIDATION_ERROR';
      validationError.statusCode = 400;
      throw validationError;
    }

    if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
      console.error('[QueryService] Database error:', error.message);
      const dbError = new Error('Query service temporarily unavailable');
      dbError.code = 'DATABASE_ERROR';
      dbError.statusCode = 503;
      throw dbError;
    }

    console.error('[QueryService] Unexpected error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    const unknownError = new Error('Failed to save query. Please try again later.');
    unknownError.code = 'INTERNAL_ERROR';
    unknownError.statusCode = 500;
    throw unknownError;
  }
};


export const getUserQueryHistory = async (userId, { limit = 50, skip = 0 } = {}) => {
  try {
    await connectDatabase();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error('Invalid user ID format');
      error.code = 'INVALID_USER_ID';
      error.statusCode = 400;
      throw error;
    }

    const queries = await Query.find({ userId })
      .sort({ querysDate: -1 }) // Сначала новые
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .exec();

    return queries.map(q => q.getPublicData?.() || q.toObject());

  } catch (error) {
    if (['INVALID_USER_ID'].includes(error.code)) {
      throw error;
    }
    console.error('[QueryService] History fetch error:', error.message);
    throw new Error('Failed to fetch query history');
  }
};


export const searchUserQueries = async (userId, searchTerm) => {
  try {
    await connectDatabase();

    const queries = await Query.find({
      userId,
      $text: { $search: searchTerm }
    })
    .sort({ querysDate: -1 })
    .limit(20)
    .exec();

    return queries.map(q => q.getPublicData?.() || q.toObject());

  } catch (error) {
    console.error('[QueryService] Search error:', error.message);
    throw new Error('Search failed');
  }
};