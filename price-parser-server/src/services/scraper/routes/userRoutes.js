import express from 'express';
import { createUser } from '../helpers/usersavetoDB.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    console.log('[Route] Получены данные:', req.body);
    
    const userData = req.body.userData || req.body;
    
    console.log('[Route] Данные для сервиса:', userData);
    
    const newUser = await createUser(userData);
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser,
    });

  } catch (error) {
    console.error('[Route] Ошибка регистрации:', error);
    
    if (error.code === 'EMAIL_EXISTS' || error.code === 'DUPLICATE_FIELD') {
      return res.status(409).json({
        success: false,
        message: error.message || 'Email already exists',
      });
    }

    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({
        success: false,
        message: error.message || 'Validation failed',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user',
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Валидация MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    const User = await import('../models/User.js').then(m => m.default);
    
    const user = await User.findById(id).select('-password').exec();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: user.getPublicProfile?.() || user,
    });

  } catch (error) {
    console.error('[GET /api/users/:id] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Запрещаем обновлять чувствительные поля напрямую
    const allowedUpdates = ['name', 'phone', 'companyName'];
    const sanitizedData = Object.keys(updateData)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (Object.keys(sanitizedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    const User = await import('../models/User.js').then(m => m.default);
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: sanitizedData },
      { new: true, runValidators: true, select: '-password' }
    ).exec();

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser.getPublicProfile?.() || updatedUser,
    });

  } catch (error) {
    console.error('[PUT /api/users/:id] Error:', error.message);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
});

export default router;