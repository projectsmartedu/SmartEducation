const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUsersByRole, 
  createUser, 
  deleteUser, 
  getStats,
  getRecentActivity,
  getCredentials
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Admin-only routes
router.get('/', authorize('admin'), getUsers);
router.get('/credentials', authorize('admin'), getCredentials);
router.get('/activity', authorize('admin'), getRecentActivity);

// Admin and Teacher routes
router.get('/stats', authorize('admin', 'teacher'), getStats);
router.get('/role/:role', authorize('admin', 'teacher'), getUsersByRole);
router.post('/', authorize('admin', 'teacher'), createUser);
router.delete('/:id', authorize('admin', 'teacher'), deleteUser);

module.exports = router;
