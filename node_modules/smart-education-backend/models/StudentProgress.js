/**
 * StudentProgress Model
 * Tracks a student's mastery and completion status per topic.
 * This is the core data structure for the personalized knowledge map.
 *
 * Future AI/ML integration:
 * - GNN will consume this graph to predict mastery propagation
 * - Time-series forgetting model uses lastStudied + masteryLevel to predict decay
 * - Pace estimator reads timeSpentMinutes to calibrate difficulty
 */
const mongoose = require('mongoose');

const studentProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  // Mastery level 0.0 - 1.0 (0% to 100%)
  // TODO: Replace static mastery with GNN-inferred mastery scores
  masteryLevel: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  // Completion status
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'mastered'],
    default: 'not-started'
  },
  // Time spent studying this topic (in minutes)
  timeSpentMinutes: {
    type: Number,
    default: 0
  },
  // Number of attempts (quizzes, exercises)
  attempts: {
    type: Number,
    default: 0
  },
  // Last quiz/assessment score (0-100)
  lastScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // When the student last studied this topic
  lastStudied: {
    type: Date,
    default: null
  },
  // Forgetting risk level — placeholder for ML forgetting predictor
  // TODO: Replace with output from time-based forgetting prediction model
  forgetRisk: {
    type: String,
    enum: ['low', 'moderate', 'high', 'critical'],
    default: 'low'
  },
  // Notes/bookmarks by the student
  notes: {
    type: String,
    maxlength: 5000,
    default: ''
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index: one progress record per student per topic
studentProgressSchema.index({ student: 1, topic: 1 }, { unique: true });
studentProgressSchema.index({ student: 1, course: 1 });
studentProgressSchema.index({ student: 1, forgetRisk: 1 });

module.exports = mongoose.model('StudentProgress', studentProgressSchema);
