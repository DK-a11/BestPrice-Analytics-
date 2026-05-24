import express from 'express';
import { authenticateUser } from '../helpers/authService.js';

const router = express.Router();

router.post('/login', express.json(), async (req, res) => {
  try {
    console.log('[AuthRoute] Login attempt:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body.email,
    });

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await authenticateUser({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: user,
    });

  } catch (error) {
    if (error.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid email or password',
      });
    }

    if (error.code === 'MISSING_CREDENTIALS') {
      return res.status(400).json({
        success: false,
        message: error.message || 'Missing required fields',
      });
    }

    if (error.code === 'DATABASE_ERROR') {
      return res.status(503).json({
        success: false,
        message: error.message || 'Service temporarily unavailable',
      });
    }

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


router.post('/logout', (req, res) => {
  
  return res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});


router.get('/me', (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Not implemented. Add JWT middleware to enable this endpoint.',
  });
});

export default router;