const StudentProgress = require('../models/StudentProgress');
const { getAdaptivePlan, scoreTopic } = require('../services/adaptiveLearningService');

// @desc    Predict mastery for a student's topics
// @route   POST /api/ai/predict-mastery
// @access  Private (Student)
exports.predictMastery = async (req, res) => {
  try {
    const { topicIds = [] } = req.body;

    const progress = await StudentProgress.find({
      student: req.user._id,
      ...(topicIds.length ? { topic: { $in: topicIds } } : {})
    }).select('topic masteryLevel lastScore attempts lastStudied');

    const predictions = progress.map((row) => {
      const model = scoreTopic(row);
      return {
        topicId: row.topic,
        predictedMastery: model.predictedMastery,
        confidence: Number((0.65 + Math.min(0.3, (row.attempts || 0) * 0.04)).toFixed(2)),
        trend: model.predictedMastery >= row.masteryLevel ? 'improving' : 'declining',
        modelVersion: 'adaptive-lite-v2.1.0'
      };
    });

    res.json({
      predictions,
      modelInfo: {
        type: 'Feature-weighted mastery model',
        version: '2.1.0'
      }
    });
  } catch (error) {
    console.error('Predict mastery error:', error);
    res.status(500).json({ message: 'Error running prediction' });
  }
};

// @desc    Predict forgetting risk for topics
// @route   POST /api/ai/predict-forgetting
// @access  Private (Student)
exports.predictForgetting = async (req, res) => {
  try {
    const { topicIds = [] } = req.body;

    const progress = await StudentProgress.find({
      student: req.user._id,
      ...(topicIds.length ? { topic: { $in: topicIds } } : {})
    }).select('topic masteryLevel lastScore attempts lastStudied');

    const predictions = progress.map((row) => {
      const model = scoreTopic(row);
      return {
        topicId: row.topic,
        forgetRisk: model.forgetRisk,
        riskScore: model.riskScore,
        recommendedRevisionDate: new Date(Date.now() + Math.max(1, Math.round((1 - model.riskScore) * 7)) * 24 * 60 * 60 * 1000),
        modelVersion: 'adaptive-lite-v2.1.0'
      };
    });

    res.json({
      predictions,
      modelInfo: {
        type: 'Feature-weighted forgetting model',
        version: '2.1.0'
      }
    });
  } catch (error) {
    console.error('Predict forgetting error:', error);
    res.status(500).json({ message: 'Error running prediction' });
  }
};

// @desc    Estimate learning pace for a student
// @route   GET /api/ai/learning-pace
// @access  Private (Student)
exports.estimateLearningPace = async (req, res) => {
  try {
    const rows = await StudentProgress.find({ student: req.user._id }).select('timeSpentMinutes attempts lastScore');
    const totalMinutes = rows.reduce((sum, r) => sum + (r.timeSpentMinutes || 0), 0);
    const totalAttempts = rows.reduce((sum, r) => sum + (r.attempts || 0), 0);
    const avgScore = rows.length ? rows.reduce((sum, r) => sum + (r.lastScore || 0), 0) / rows.length : 0;

    const wordsPerMinute = Math.max(120, Math.round(140 + avgScore * 0.8));
    const recommendedSessionLength = Math.min(55, Math.max(20, Math.round((totalMinutes / Math.max(rows.length, 1)) * 0.7 + 20)));

    res.json({
      pace: {
        wordsPerMinute,
        averageSessionMinutes: Math.round(totalMinutes / Math.max(totalAttempts, 1)) || 20,
        optimalDifficulty: avgScore >= 75 ? 'advanced' : avgScore >= 55 ? 'intermediate' : 'foundational',
        recommendedSessionLength,
        focusScore: Number(Math.min(0.98, 0.45 + avgScore / 200).toFixed(2))
      },
      modelInfo: {
        type: 'Adaptive pace estimator',
        version: '2.1.0'
      }
    });
  } catch (error) {
    console.error('Learning pace error:', error);
    res.status(500).json({ message: 'Error estimating pace' });
  }
};

// @desc    Get adaptive recommendations and mind map data for student
// @route   GET /api/ai/recommendations
// @access  Private (Student)
exports.getRecommendations = async (req, res) => {
  try {
    const adaptivePlan = await getAdaptivePlan(req.user._id, req.query.courseId);

    const recommendations = adaptivePlan.revisionQueue.slice(0, 3).map((item) => ({
      type: item.suggestedRevisionType,
      title: `Revise ${item.concept}`,
      description: `Predicted mastery ${Math.round(item.predictedMastery * 100)}%, risk ${item.priority}`,
      priority: item.priority
    }));

    res.json({
      recommendations,
      adaptivePlan,
      modelInfo: adaptivePlan.modelInfo
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
};
