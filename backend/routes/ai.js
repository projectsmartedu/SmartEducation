const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  predictMastery,
  predictForgetting,
  estimateLearningPace,
  getRecommendations
} = require('../controllers/aiMockController');

// All routes require authentication
router.use(protect);

// AI/ML mock endpoints (student only)
router.post('/predict-mastery', authorize('student'), predictMastery);
router.post('/predict-forgetting', authorize('student'), predictForgetting);
router.get('/learning-pace', authorize('student'), estimateLearningPace);
router.get('/recommendations', authorize('student'), getRecommendations);

module.exports = router;
