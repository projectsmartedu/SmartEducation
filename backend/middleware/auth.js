const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware - Protect Routes
 * Verifies JWT token from Authorization header (Bearer token format)
 * Attaches authenticated user object to request
 * 
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * @throws {401} If token is invalid, expired, or missing
 */
const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header (format: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user from database and attach to request
      req.user = await User.findById(decoded.id).select('-password');
      
      // Handle case where user was deleted after token was issued
      if (!req.user) {
        return res.status(401).json({ 
          message: 'User associated with token not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      next();
    } catch (error) {
      const message = error.name === 'TokenExpiredError' 
        ? 'Token has expired'
        : 'Invalid or malformed token';
      console.error('JWT verification error:', error.message);
      return res.status(401).json({ 
        message,
        code: 'INVALID_TOKEN',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // No token provided
  if (!token) {
    return res.status(401).json({ 
      message: 'Authorization required - Bearer token not provided',
      code: 'NO_TOKEN'
    });
  }
};

/**
 * Role-Based Authorization Middleware
 * Restricts route access to users with specific roles
 * 
 * @param {...string} roles - Allowed user roles (admin, teacher, student)
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Restrict route to admin users only
 * router.delete('/users/:id', protect, authorize('admin'), deleteUser);
 * 
 * @example
 * // Allow admin or teacher roles
 * router.get('/reports', protect, authorize('admin', 'teacher'), getReports);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role(s): ${roles.join(', ')}. Current role: '${req.user.role}'`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
