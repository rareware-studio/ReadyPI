const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../utils/db');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token from Authorization header
 * Used for dashboard/web authentication
 */
const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user from database
      const result = await db.query(
        'SELECT id, email, full_name, plan_tier, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found'
        });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Account is deactivated'
        });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token expired'
        });
      }
      throw jwtError;
    }
  } catch (error) {
    logger.error('JWT verification error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
};

/**
 * Middleware to verify API key from Authorization header
 * Used for API gateway requests (/v1/chat/completions)
 */
const verifyAPIKey = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Missing or invalid Authorization header. Expected: Bearer rpi_live_...',
          type: 'invalid_request_error',
          code: 'invalid_api_key'
        }
      });
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate API key format
    if (!apiKey.startsWith('rpi_')) {
      return res.status(401).json({
        error: {
          message: 'Invalid API key format. ReadyPi keys start with rpi_',
          type: 'invalid_request_error',
          code: 'invalid_api_key'
        }
      });
    }

    // Extract prefix for faster lookup (first 16 chars)
    const keyPrefix = apiKey.substring(0, 16);

    // Find API key by prefix
    const keyResult = await db.query(
      `SELECT ak.*, u.id as user_id, u.email, u.plan_tier, u.is_active as user_active, c.balance as credit_balance
       FROM api_keys ak
       JOIN users u ON ak.user_id = u.id
       JOIN credits c ON u.id = c.user_id
       WHERE ak.key_prefix = $1 AND ak.is_active = true`,
      [keyPrefix]
    );

    if (keyResult.rows.length === 0) {
      return res.status(401).json({
        error: {
          message: 'Invalid API key',
          type: 'invalid_request_error',
          code: 'invalid_api_key'
        }
      });
    }

    const keyData = keyResult.rows[0];

    // Verify full API key hash
    const isValid = await bcrypt.compare(apiKey, keyData.key_hash);
    
    if (!isValid) {
      return res.status(401).json({
        error: {
          message: 'Invalid API key',
          type: 'invalid_request_error',
          code: 'invalid_api_key'
        }
      });
    }

    // Check if user account is active
    if (!keyData.user_active) {
      return res.status(403).json({
        error: {
          message: 'Account is deactivated',
          type: 'invalid_request_error',
          code: 'account_deactivated'
        }
      });
    }

    // Update last_used_at timestamp (async, don't wait)
    db.query(
      'UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1',
      [keyData.id]
    ).catch(err => logger.error('Failed to update last_used_at:', err));

    // Attach API key and user data to request
    req.apiKey = {
      id: keyData.id,
      userId: keyData.user_id,
      email: keyData.email,
      planTier: keyData.plan_tier,
      rateLimit: keyData.rate_limit_per_minute,
      creditBalance: parseInt(keyData.credit_balance)
    };

    next();
  } catch (error) {
    logger.error('API key verification error:', error);
    return res.status(500).json({
      error: {
        message: 'Internal server error during authentication',
        type: 'api_error',
        code: 'internal_error'
      }
    });
  }
};

/**
 * Generate a new API key
 */
const generateAPIKey = (environment = 'live') => {
  const crypto = require('crypto');
  const randomPart = crypto.randomBytes(16).toString('hex'); // 32 chars
  return `rpi_${environment}_${randomPart}`;
};

/**
 * Hash an API key for storage
 */
const hashAPIKey = async (apiKey) => {
  const saltRounds = parseInt(process.env.API_KEY_SALT_ROUNDS) || 12;
  return await bcrypt.hash(apiKey, saltRounds);
};

module.exports = {
  verifyJWT,
  verifyAPIKey,
  generateAPIKey,
  hashAPIKey
};
