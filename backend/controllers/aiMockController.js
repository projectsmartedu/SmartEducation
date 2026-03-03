const StudentProgress = require('../models/StudentProgress');
const {
  getAdaptivePlan,
  scoreTopic,
  getOrTrainModel,
  retrainAdaptiveModel,
  exportModelArtifact,
  getTrainingDataSnapshot
} = require('../services/adaptiveLearningService');

// @desc    Predict mastery for a student's topics
// @route   POST /api/ai/predict-mastery
// @access  Private (Student)
exports.predictMastery = async (req, res) => {
  try {
    const { topicIds = [] } = req.body;
    const modelDoc = await getOrTrainModel();

    const progress = await StudentProgress.find({
      student: req.user._id,
      ...(topicIds.length ? { topic: { $in: topicIds } } : {})
    }).select('topic masteryLevel lastScore attempts lastStudied timeSpentMinutes');

    const predictions = await Promise.all(progress.map(async (row) => {
      const model = await scoreTopic(row, 0, modelDoc);
      return {
        topicId: row.topic,
        predictedMastery: model.predictedMastery,
        confidence: Number(Math.min(0.95, 0.62 + (row.attempts || 0) * 0.035).toFixed(2)),
        trend: model.predictedMastery >= row.masteryLevel ? 'improving' : 'declining',
        modelVersion: modelDoc.version
      };
    }));

    res.json({
      predictions,
      modelInfo: {
        type: modelDoc.algorithm,
        version: modelDoc.version,
        trainedAt: modelDoc.trainedAt,
        sampleCount: modelDoc.sampleCount
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
    const modelDoc = await getOrTrainModel();

    const progress = await StudentProgress.find({
      student: req.user._id,
      ...(topicIds.length ? { topic: { $in: topicIds } } : {})
    }).select('topic masteryLevel lastScore attempts lastStudied timeSpentMinutes');

    const predictions = await Promise.all(progress.map(async (row) => {
      const model = await scoreTopic(row, 0, modelDoc);
      return {
        topicId: row.topic,
        forgetRisk: model.forgetRisk,
        riskScore: model.riskScore,
        recommendedRevisionDate: new Date(Date.now() + Math.max(1, Math.round((1 - model.riskScore) * 7)) * 24 * 60 * 60 * 1000),
        modelVersion: modelDoc.version
      };
    }));

    res.json({
      predictions,
      modelInfo: {
        type: modelDoc.algorithm,
        version: modelDoc.version,
        trainedAt: modelDoc.trainedAt,
        sampleCount: modelDoc.sampleCount
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

    res.json({
      pace: {
        wordsPerMinute: Math.max(120, Math.round(140 + avgScore * 0.8)),
        averageSessionMinutes: Math.round(totalMinutes / Math.max(totalAttempts, 1)) || 20,
        optimalDifficulty: avgScore >= 75 ? 'advanced' : avgScore >= 55 ? 'intermediate' : 'foundational',
        recommendedSessionLength: Math.min(55, Math.max(20, Math.round((totalMinutes / Math.max(rows.length, 1)) * 0.7 + 20))),
        focusScore: Number(Math.min(0.98, 0.45 + avgScore / 200).toFixed(2))
      },
      modelInfo: {
        type: 'adaptive pace estimator',
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

// @desc    Retrain adaptive ML model from current data
// @route   POST /api/ai/retrain
// @access  Private (Teacher/Admin)
exports.retrainModel = async (req, res) => {
  try {
    const modelDoc = await retrainAdaptiveModel();
    res.json({
      message: 'Adaptive model retrained successfully',
      modelInfo: {
        version: modelDoc.version,
        trainedAt: modelDoc.trainedAt,
        sampleCount: modelDoc.sampleCount,
        algorithm: modelDoc.algorithm,
        metrics: modelDoc.metrics
      }
    });
  } catch (error) {
    console.error('Retrain model error:', error);
    res.status(500).json({ message: 'Error retraining model' });
  }
};

// @desc    Export trained model artifact
// @route   GET /api/ai/model/export
// @access  Private (Teacher/Admin)
exports.exportModel = async (req, res) => {
  try {
    const artifact = await exportModelArtifact();
    res.json(artifact);
  } catch (error) {
    console.error('Export model error:', error);
    res.status(500).json({ message: 'Error exporting model artifact' });
  }
};

// @desc    Get model training data snapshot
// @route   GET /api/ai/model/training-data
// @access  Private (Teacher/Admin)
exports.getTrainingData = async (req, res) => {
  try {
    const snapshot = await getTrainingDataSnapshot(req.query.limit);
    res.json(snapshot);
  } catch (error) {
    console.error('Get training data error:', error);
    res.status(500).json({ message: 'Error getting training data snapshot' });
  }
};
