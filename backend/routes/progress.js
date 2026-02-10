const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyProgress,
  getCourseProgress,
  updateProgress,
  getKnowledgeMap,
  getProgressStats,
  getStudentProgress,
  getClassProgress
} = require('../controllers/progressController');

// All routes require authentication
router.use(protect);

// Student routes
router.get('/', authorize('student'), getMyProgress);
router.get('/stats', authorize('student'), getProgressStats);
router.get('/knowledge-map', authorize('student'), getKnowledgeMap);
router.get('/course/:courseId', authorize('student'), getCourseProgress);
router.put('/:topicId', authorize('student'), updateProgress);

// Teacher/Admin routes
router.get('/student/:studentId', authorize('teacher', 'admin'), getStudentProgress);
router.get('/class/:courseId', authorize('teacher', 'admin'), getClassProgress);

module.exports = router;
