const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { generateTopicQuiz, getQuizPoolStats } = require('../controllers/quizController');

router.use(protect);

router.post('/topic/:topicId', authorize('student'), generateTopicQuiz);
router.get('/stats', authorize('teacher', 'admin'), getQuizPoolStats);

module.exports = router;
