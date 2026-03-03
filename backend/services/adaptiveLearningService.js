const StudentProgress = require('../models/StudentProgress');
const Revision = require('../models/Revision');

const RISK_LEVELS = ['low', 'moderate', 'high', 'critical'];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function daysSince(date) {
  if (!date) return 21;
  const ms = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function toRisk(score) {
  if (score >= 0.82) return 'critical';
  if (score >= 0.62) return 'high';
  if (score >= 0.42) return 'moderate';
  return 'low';
}

function nextRevisionDate(riskScore, mastery) {
  const baseDays = Math.round((1 - riskScore) * 7 + (mastery >= 0.8 ? 4 : 0));
  const days = Math.max(1, baseDays);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function revisionTypeFromFeatures({ lastScore, masteryLevel, attempts }) {
  if (masteryLevel < 0.45) return 'review';
  if ((lastScore || 0) < 55) return 'summary';
  if (attempts > 6 && masteryLevel < 0.7) return 'flashcard';
  if (masteryLevel >= 0.75) return 'quiz';
  return 'practice';
}

function scoreTopic(progress) {
  const mastery = progress.masteryLevel || 0;
  const score = (progress.lastScore || 0) / 100;
  const spacing = clamp(daysSince(progress.lastStudied) / 14);
  const lowAttemptsPenalty = progress.attempts <= 1 ? 0.08 : 0;

  const riskScore = clamp(
    (1 - mastery) * 0.45 +
    (1 - score) * 0.25 +
    spacing * 0.25 +
    lowAttemptsPenalty
  );

  const predictedMastery = clamp(
    mastery * 0.6 +
    score * 0.3 +
    clamp(Math.log((progress.attempts || 0) + 1) / 2.4) * 0.1 -
    spacing * 0.08
  );

  return {
    predictedMastery: Number(predictedMastery.toFixed(3)),
    riskScore: Number(riskScore.toFixed(3)),
    forgetRisk: toRisk(riskScore)
  };
}

async function getAdaptivePlan(studentId, courseId) {
  const query = { student: studentId };
  if (courseId) query.course = courseId;

  const progressList = await StudentProgress.find(query)
    .populate({
      path: 'topic',
      select: 'title prerequisites description',
      populate: { path: 'prerequisites', select: 'title' }
    })
    .populate('course', 'title subject');

  const topicProgress = progressList.filter((p) => p.topic);

  const revisions = await Revision.find({
    student: studentId,
    ...(courseId ? { course: courseId } : {})
  })
    .select('topic scheduledFor status priority score')
    .sort({ scheduledFor: 1 });

  const revisionsByTopic = new Map();
  revisions.forEach((rev) => {
    const key = rev.topic.toString();
    if (!revisionsByTopic.has(key)) revisionsByTopic.set(key, []);
    revisionsByTopic.get(key).push(rev);
  });

  const nodes = topicProgress.map((progress) => {
    const model = scoreTopic(progress);
    const topicRevisions = revisionsByTopic.get(progress.topic._id.toString()) || [];
    const pendingCount = topicRevisions.filter((r) => r.status === 'pending').length;

    return {
      id: progress.topic._id,
      label: progress.topic.title,
      description: progress.topic.description,
      courseId: progress.course?._id,
      courseName: progress.course?.title,
      mastery: progress.masteryLevel,
      predictedMastery: model.predictedMastery,
      forgetRisk: model.forgetRisk,
      riskScore: model.riskScore,
      priorityWeight: Number((model.riskScore * (1 + pendingCount * 0.1)).toFixed(3)),
      prerequisites: (progress.topic.prerequisites || []).map((p) => ({ id: p._id, label: p.title })),
      suggestedRevisionType: revisionTypeFromFeatures(progress),
      suggestedRevisionDate: nextRevisionDate(model.riskScore, model.predictedMastery),
      pendingRevisions: pendingCount,
      scoreSignal: progress.lastScore || 0,
      attempts: progress.attempts || 0
    };
  });

  const nodeMap = new Set(nodes.map((n) => n.id.toString()));
  const edges = nodes.flatMap((node) =>
    (node.prerequisites || [])
      .filter((pr) => nodeMap.has(pr.id.toString()))
      .map((pr) => ({ from: pr.id, to: node.id }))
  );

  const revisionQueue = [...nodes]
    .sort((a, b) => b.priorityWeight - a.priorityWeight)
    .slice(0, 8)
    .map((n) => ({
      topicId: n.id,
      concept: n.label,
      priority: toRisk(n.priorityWeight),
      riskScore: n.riskScore,
      predictedMastery: n.predictedMastery,
      suggestedRevisionType: n.suggestedRevisionType,
      scheduledFor: n.suggestedRevisionDate,
      notes: `${n.pendingRevisions} pending revision(s), score signal ${n.scoreSignal}%`
    }));

  const avgMastery = nodes.length
    ? Math.round((nodes.reduce((sum, n) => sum + n.predictedMastery, 0) / nodes.length) * 100)
    : 0;

  const riskDistribution = RISK_LEVELS.reduce((acc, level) => ({
    ...acc,
    [level]: nodes.filter((n) => n.forgetRisk === level).length
  }), {});

  return {
    mindMap: {
      nodes,
      edges
    },
    revisionQueue,
    summary: {
      totalConcepts: nodes.length,
      averagePredictedMastery: avgMastery,
      riskDistribution
    },
    modelInfo: {
      name: 'AdaptiveLearner-Lite',
      version: '2.1.0',
      type: 'Feature-weighted mastery and forgetting predictor',
      signals: ['masteryLevel', 'lastScore', 'attempts', 'daysSinceLastStudy', 'pendingRevisions']
    }
  };
}

module.exports = {
  getAdaptivePlan,
  scoreTopic
};
