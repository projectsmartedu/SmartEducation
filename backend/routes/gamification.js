const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyProfile,
  getLeaderboard,
  getMyBadges,
  getPointsHistory,
  getStats,
  getClassOverview
} = require('../controllers/gamificationController');

// All routes require authentication
router.use(protect);

// Student routes
router.get('/profile', authorize('student'), getMyProfile);
router.get('/badges', authorize('student'), getMyBadges);
router.get('/history', authorize('student'), getPointsHistory);
router.get('/stats', authorize('student'), getStats);

// Leaderboard (all authenticated users can view)
router.get('/leaderboard', getLeaderboard);

// Teacher/Admin routes
router.get('/overview', authorize('teacher', 'admin'), getClassOverview);

module.exports = router;
