const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  predictMastery,
  predictForgetting,
  estimateLearningPace,
  getRecommendations,
  retrainModel,
  exportModel,
  getTrainingData
} = require('../controllers/aiMockController');

// All routes require authentication
router.use(protect);

// AI/ML endpoints
router.post('/predict-mastery', authorize('student'), predictMastery);
router.post('/predict-forgetting', authorize('student'), predictForgetting);
router.get('/learning-pace', authorize('student'), estimateLearningPace);
router.get('/recommendations', authorize('student'), getRecommendations);
router.post('/retrain', authorize('teacher', 'admin'), retrainModel);
router.get('/model/export', authorize('teacher', 'admin'), exportModel);
router.get('/model/training-data', authorize('teacher', 'admin'), getTrainingData);

module.exports = router;
