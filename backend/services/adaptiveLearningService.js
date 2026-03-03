const StudentProgress = require('../models/StudentProgress');
const Revision = require('../models/Revision');
const MLModel = require('../models/MLModel');

const MODEL_KEY = 'adaptive-knowledge-planner';
const MODEL_VERSION = '3.0.0';
const MODEL_TTL_MS = 24 * 60 * 60 * 1000;
const RISK_LEVELS = ['low', 'moderate', 'high', 'critical'];
const FEATURE_NAMES = ['masteryLevel', 'lastScoreNorm', 'attemptsLog', 'daysSinceNorm', 'pendingNorm', 'timeSpentNorm'];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function daysSince(date) {
  if (!date) return 21;
  const ms = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function toRisk(probability) {
  if (probability >= 0.8) return 'critical';
  if (probability >= 0.6) return 'high';
  if (probability >= 0.4) return 'moderate';
  return 'low';
}

function nextRevisionDate(riskScore, mastery) {
  const baseDays = Math.round((1 - riskScore) * 6 + (mastery >= 0.8 ? 4 : 0));
  return new Date(Date.now() + Math.max(1, baseDays) * 24 * 60 * 60 * 1000);
}

function revisionTypeFromFeatures({ lastScore = 0, masteryLevel = 0, attempts = 0 }) {
  if (masteryLevel < 0.45) return 'review';
  if (lastScore < 55) return 'summary';
  if (attempts > 6 && masteryLevel < 0.7) return 'flashcard';
  if (masteryLevel >= 0.75) return 'quiz';
  return 'practice';
}

function buildFeatureVector(progress, pendingRevisions) {
  return {
    masteryLevel: clamp(progress.masteryLevel),
    lastScoreNorm: clamp((progress.lastScore || 0) / 100),
    attemptsLog: clamp(Math.log((progress.attempts || 0) + 1) / Math.log(12)),
    daysSinceNorm: clamp(daysSince(progress.lastStudied) / 30),
    pendingNorm: clamp((pendingRevisions || 0) / 5),
    timeSpentNorm: clamp((progress.timeSpentMinutes || 0) / 180)
  };
}

function dot(weights, vector, featureNames) {
  return featureNames.reduce((sum, name, index) => sum + (weights[index] || 0) * (vector[name] || 0), 0);
}

function trainLinearRegression(samples, labels, opts = {}) {
  const lr = opts.learningRate || 0.08;
  const epochs = opts.epochs || 600;
  const l2 = opts.l2 || 0.0005;
  const dim = FEATURE_NAMES.length;
  let bias = 0;
  const weights = Array(dim).fill(0);

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    let gradB = 0;
    const gradW = Array(dim).fill(0);
    for (let i = 0; i < samples.length; i += 1) {
      const x = samples[i];
      const y = labels[i];
      const pred = clamp(bias + dot(weights, x, FEATURE_NAMES));
      const err = pred - y;
      gradB += err;
      FEATURE_NAMES.forEach((name, j) => {
        gradW[j] += err * x[name];
      });
    }

    bias -= (lr * gradB) / Math.max(samples.length, 1);
    FEATURE_NAMES.forEach((_, j) => {
      const regularized = gradW[j] / Math.max(samples.length, 1) + l2 * weights[j];
      weights[j] -= lr * regularized;
    });
  }

  const mse = samples.reduce((sum, x, i) => {
    const pred = clamp(bias + dot(weights, x, FEATURE_NAMES));
    return sum + (pred - labels[i]) ** 2;
  }, 0) / Math.max(samples.length, 1);

  return { weights, bias, mse: Number(mse.toFixed(5)) };
}

function trainLogisticRegression(samples, labels, opts = {}) {
  const lr = opts.learningRate || 0.09;
  const epochs = opts.epochs || 700;
  const l2 = opts.l2 || 0.0005;
  const dim = FEATURE_NAMES.length;
  let bias = 0;
  const weights = Array(dim).fill(0);

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    let gradB = 0;
    const gradW = Array(dim).fill(0);
    for (let i = 0; i < samples.length; i += 1) {
      const x = samples[i];
      const y = labels[i];
      const prob = sigmoid(bias + dot(weights, x, FEATURE_NAMES));
      const err = prob - y;
      gradB += err;
      FEATURE_NAMES.forEach((name, j) => {
        gradW[j] += err * x[name];
      });
    }

    bias -= (lr * gradB) / Math.max(samples.length, 1);
    FEATURE_NAMES.forEach((_, j) => {
      const regularized = gradW[j] / Math.max(samples.length, 1) + l2 * weights[j];
      weights[j] -= lr * regularized;
    });
  }

  const logLoss = samples.reduce((sum, x, i) => {
    const y = labels[i];
    const prob = clamp(sigmoid(bias + dot(weights, x, FEATURE_NAMES)), 1e-6, 1 - 1e-6);
    return sum + (-(y * Math.log(prob) + (1 - y) * Math.log(1 - prob)));
  }, 0) / Math.max(samples.length, 1);

  return { weights, bias, logLoss: Number(logLoss.toFixed(5)) };
}

function defaultModelPayload() {
  return {
    mastery: {
      weights: [0.55, 0.28, 0.08, -0.1, -0.08, 0.1],
      bias: 0.06
    },
    risk: {
      weights: [-1.2, -0.75, -0.35, 1.3, 1.15, -0.2],
      bias: 0.2
    }
  };
}

async function buildDataset() {
  const progressRows = await StudentProgress.find({})
    .select('student topic masteryLevel lastScore attempts lastStudied timeSpentMinutes status forgetRisk');

  const revisions = await Revision.find({}).select('student topic status scheduledFor');
  const revMap = new Map();
  revisions.forEach((rev) => {
    const key = `${rev.student.toString()}:${rev.topic.toString()}`;
    if (!revMap.has(key)) revMap.set(key, []);
    revMap.get(key).push(rev);
  });

  const samples = [];
  const masteryLabels = [];
  const riskLabels = [];

  progressRows.forEach((row) => {
    const key = `${row.student.toString()}:${row.topic.toString()}`;
    const topicRevisions = revMap.get(key) || [];
    const pending = topicRevisions.filter((r) => r.status === 'pending').length;
    const overdue = topicRevisions.some((r) => r.status === 'pending' && new Date(r.scheduledFor) < new Date());

    const x = buildFeatureVector(row, pending);
    const scoreNorm = clamp((row.lastScore || 0) / 100);
    const completionBoost = row.status === 'mastered' ? 0.15 : row.status === 'completed' ? 0.08 : 0;
    const masteryTarget = clamp(row.masteryLevel * 0.65 + scoreNorm * 0.3 + completionBoost);

    const flaggedRisk = row.forgetRisk === 'high' || row.forgetRisk === 'critical';
    const riskyState = flaggedRisk || overdue || (row.masteryLevel < 0.45 && daysSince(row.lastStudied) > 6);

    samples.push(x);
    masteryLabels.push(masteryTarget);
    riskLabels.push(riskyState ? 1 : 0);
  });

  return {
    samples,
    masteryLabels,
    riskLabels
  };
}

async function trainAndPersistModel() {
  const dataset = await buildDataset();
  const sampleCount = dataset.samples.length;

  const payload = sampleCount >= 10
    ? {
      mastery: trainLinearRegression(dataset.samples, dataset.masteryLabels),
      risk: trainLogisticRegression(dataset.samples, dataset.riskLabels)
    }
    : defaultModelPayload();

  const metrics = {
    masteryMSE: payload.mastery.mse || null,
    riskLogLoss: payload.risk.logLoss || null
  };

  const modelDoc = await MLModel.findOneAndUpdate(
    { key: MODEL_KEY },
    {
      key: MODEL_KEY,
      version: MODEL_VERSION,
      algorithm: 'linear-regression + logistic-regression (gradient descent)',
      featureNames: FEATURE_NAMES,
      payload,
      metrics,
      sampleCount,
      trainedAt: new Date()
    },
    { upsert: true, new: true }
  );

  return modelDoc;
}

async function getOrTrainModel({ forceRetrain = false } = {}) {
  let model = await MLModel.findOne({ key: MODEL_KEY });
  const stale = model && (Date.now() - new Date(model.trainedAt).getTime() > MODEL_TTL_MS);

  if (!model || stale || forceRetrain) {
    model = await trainAndPersistModel();
  }

  return model;
}

function predictFromModel(featureVector, modelDoc) {
  const modelPayload = modelDoc?.payload || defaultModelPayload();
  const featureNames = modelDoc?.featureNames?.length ? modelDoc.featureNames : FEATURE_NAMES;

  const masteryRaw = (modelPayload.mastery.bias || 0) + dot(modelPayload.mastery.weights || [], featureVector, featureNames);
  const predictedMastery = clamp(masteryRaw);

  const riskRaw = (modelPayload.risk.bias || 0) + dot(modelPayload.risk.weights || [], featureVector, featureNames);
  const riskScore = clamp(sigmoid(riskRaw));

  return {
    predictedMastery: Number(predictedMastery.toFixed(3)),
    riskScore: Number(riskScore.toFixed(3)),
    forgetRisk: toRisk(riskScore)
  };
}

async function scoreTopic(progress, pendingRevisions = 0, modelDoc = null) {
  const resolvedModel = modelDoc || await getOrTrainModel();
  const features = buildFeatureVector(progress, pendingRevisions);
  return predictFromModel(features, resolvedModel);
}

async function getAdaptivePlan(studentId, courseId) {
  const modelDoc = await getOrTrainModel();

  const query = { student: studentId };
  if (courseId) query.course = courseId;

  const progressList = await StudentProgress.find(query)
    .populate({
      path: 'topic',
      select: 'title prerequisites description',
      populate: { path: 'prerequisites', select: 'title' }
    })
    .populate('course', 'title subject');

  const revisions = await Revision.find({ student: studentId, ...(courseId ? { course: courseId } : {}) })
    .select('topic scheduledFor status')
    .sort({ scheduledFor: 1 });

  const revisionsByTopic = new Map();
  revisions.forEach((rev) => {
    const key = rev.topic.toString();
    if (!revisionsByTopic.has(key)) revisionsByTopic.set(key, []);
    revisionsByTopic.get(key).push(rev);
  });

  const filteredProgress = progressList.filter((p) => p.topic);
  const nodes = [];

  for (const progress of filteredProgress) {
    const topicRevisions = revisionsByTopic.get(progress.topic._id.toString()) || [];
    const pendingCount = topicRevisions.filter((r) => r.status === 'pending').length;
    const predicted = await scoreTopic(progress, pendingCount, modelDoc);

    nodes.push({
      id: progress.topic._id,
      label: progress.topic.title,
      description: progress.topic.description,
      courseId: progress.course?._id,
      courseName: progress.course?.title,
      mastery: progress.masteryLevel,
      predictedMastery: predicted.predictedMastery,
      forgetRisk: predicted.forgetRisk,
      riskScore: predicted.riskScore,
      priorityWeight: Number((predicted.riskScore * (1 + pendingCount * 0.1)).toFixed(3)),
      prerequisites: (progress.topic.prerequisites || []).map((p) => ({ id: p._id, label: p.title })),
      suggestedRevisionType: revisionTypeFromFeatures(progress),
      suggestedRevisionDate: nextRevisionDate(predicted.riskScore, predicted.predictedMastery),
      pendingRevisions: pendingCount,
      scoreSignal: progress.lastScore || 0,
      attempts: progress.attempts || 0
    });
  }

  const nodeSet = new Set(nodes.map((n) => n.id.toString()));
  const edges = nodes.flatMap((node) =>
    (node.prerequisites || [])
      .filter((p) => nodeSet.has(p.id.toString()))
      .map((p) => ({ from: p.id, to: node.id }))
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

  const averagePredictedMastery = nodes.length
    ? Math.round((nodes.reduce((sum, n) => sum + n.predictedMastery, 0) / nodes.length) * 100)
    : 0;

  const riskDistribution = RISK_LEVELS.reduce((acc, risk) => ({
    ...acc,
    [risk]: nodes.filter((n) => n.forgetRisk === risk).length
  }), {});

  return {
    mindMap: { nodes, edges },
    revisionQueue,
    summary: {
      totalConcepts: nodes.length,
      averagePredictedMastery,
      riskDistribution
    },
    modelInfo: {
      name: 'AdaptiveKnowledgePlanner',
      version: modelDoc.version,
      algorithm: modelDoc.algorithm,
      trainedAt: modelDoc.trainedAt,
      sampleCount: modelDoc.sampleCount,
      metrics: modelDoc.metrics,
      signals: modelDoc.featureNames
    }
  };
}

async function retrainAdaptiveModel() {
  return trainAndPersistModel();
}

async function exportModelArtifact() {
  const modelDoc = await getOrTrainModel();
  return {
    format: 'adaptive-knowledge-planner-json',
    exportedAt: new Date(),
    model: {
      key: MODEL_KEY,
      version: modelDoc.version,
      algorithm: modelDoc.algorithm,
      featureNames: modelDoc.featureNames,
      trainedAt: modelDoc.trainedAt,
      sampleCount: modelDoc.sampleCount,
      metrics: modelDoc.metrics,
      payload: modelDoc.payload
    }
  };
}

async function getTrainingDataSnapshot(limit = 5000) {
  const dataset = await buildDataset();
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 200, 1), 20000);
  const rows = dataset.samples.slice(0, safeLimit).map((sample, index) => ({
    ...sample,
    masteryLabel: dataset.masteryLabels[index],
    riskLabel: dataset.riskLabels[index]
  }));

  return {
    featureNames: FEATURE_NAMES,
    totalRows: dataset.samples.length,
    returnedRows: rows.length,
    rows
  };
}

module.exports = {
  getAdaptivePlan,
  scoreTopic,
  getOrTrainModel,
  retrainAdaptiveModel,
  exportModelArtifact,
  getTrainingDataSnapshot
};
