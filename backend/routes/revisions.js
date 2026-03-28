const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyRevisions,
  getRevisionById,
  createRevision,
  completeRevision,
  skipRevision,
  deleteRevision,
  getRevisionStats,
  getStudentRevisions
} = require('../controllers/revisionController');

// All routes require authentication
router.use(protect);

// Student routes
router.get('/', authorize('student'), getMyRevisions);
router.get('/stats', authorize('student'), getRevisionStats);
router.get('/:id', getRevisionById);
router.put('/:id/complete', authorize('student'), completeRevision);
router.put('/:id/skip', authorize('student'), skipRevision);

// Teacher/Admin routes
router.post('/', authorize('teacher', 'admin'), createRevision);
router.delete('/:id', authorize('teacher', 'admin'), deleteRevision);
router.get('/student/:studentId', authorize('teacher', 'admin'), getStudentRevisions);

// ===== ML PREDICTIONS FOR MIND MAP =====

/**
 * POST /api/revisions/ml/predict
 * Get ML predictions for topics (urgency scores, recommendations)
 * Used by Modern Mind Map component
 */
router.post('/ml/predict', async (req, res) => {
  try {
    const { topicIds } = req.body;
    const studentId = req.user._id;

    if (!topicIds || !Array.isArray(topicIds)) {
      return res.status(400).json({ error: 'topicIds must be an array' });
    }

    // Format response with mock predictions for now
    const formattedPredictions = {};
    topicIds.forEach((topicId, index) => {
      // Generate varied urgency scores for demo
      const masteryFactor = (1 - (50 + index * 10) / 100) * 0.6;
      const daysSince = 3 + index * 3;
      const staleFactor = Math.min(daysSince / 30, 1) * 0.4;
      const urgencyScore = Math.min(masteryFactor + staleFactor, 1);

      formattedPredictions[topicId] = {
        urgencyScore,
        riskCategory: urgencyScore > 0.66 ? 'HIGH' : urgencyScore > 0.33 ? 'MEDIUM' : 'LOW',
        recommendation: urgencyScore > 0.66 
          ? 'Start revision immediately. This topic needs urgent focus to prevent knowledge decay.'
          : urgencyScore > 0.33 
          ? 'Schedule regular revision this week. Maintain your current understanding.'
          : 'Well-maintained topic. Continue with your current learning pace.'
      };
    });

    res.json({
      success: true,
      predictions: formattedPredictions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ML prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/revisions/progress
 * Get student's topic progress for mind map
 */
router.get('/mind-map/progress', authorize('student'), async (req, res) => {
  try {
    const studentId = req.user._id;

    // Mock data - replace with real DB query
    const topics = [
      {
        id: 'calc-deriv',
        name: 'Calculus — Derivatives',
        masteryPercentage: 75,
        daysSinceReview: 3,
        quizzesTaken: 5,
        videosWatched: 8,
        revisionCount: 2,
        lastScore: 82,
      },
      {
        id: 'calc-integ',
        name: 'Calculus — Integration',
        masteryPercentage: 45,
        daysSinceReview: 12,
        quizzesTaken: 2,
        videosWatched: 3,
        revisionCount: 0,
        lastScore: 58,
      },
      {
        id: 'atomic-struct',
        name: 'Atomic Structure',
        masteryPercentage: 62,
        daysSinceReview: 7,
        quizzesTaken: 4,
        videosWatched: 6,
        revisionCount: 1,
        lastScore: 70,
      },
      {
        id: 'motion-line',
        name: 'Motion in a Straight Line',
        masteryPercentage: 88,
        daysSinceReview: 1,
        quizzesTaken: 6,
        videosWatched: 9,
        revisionCount: 3,
        lastScore: 94,
      },
      {
        id: 'units-measure',
        name: 'Units & Measurements',
        masteryPercentage: 85,
        daysSinceReview: 2,
        quizzesTaken: 5,
        videosWatched: 7,
        revisionCount: 2,
        lastScore: 91,
      },
    ];

    res.json({
      success: true,
      topics,
      studentId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
