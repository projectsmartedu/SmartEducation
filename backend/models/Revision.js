/**
 * Revision Model
 * Represents a scheduled revision/review task for a student on a specific topic.
 * Revision scheduling is driven by spaced repetition logic and forgetting risk.
 *
 * Future AI/ML integration:
 * - Forgetting curve predictor sets optimal scheduledFor dates
 * - Difficulty of revision adapts based on prior attempt scores
 * - ML model selects revision type (quiz vs re-read vs practice)
 */
const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema({
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
  // When the revision is scheduled
  scheduledFor: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  // Priority determined by forgetRisk + mastery level
  // TODO: Replace with ML-driven priority scoring
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  // Type of revision activity
  type: {
    type: String,
    enum: ['quiz', 'review', 'practice', 'flashcard', 'summary'],
    default: 'review'
  },
  // Status of the revision task
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'skipped', 'overdue'],
    default: 'pending'
  },
  // Score achieved if revision involved a quiz/test (0-100)
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  // Points earned for completing this revision
  pointsEarned: {
    type: Number,
    default: 0
  },
  // Teacher notes or AI-generated instructions
  notes: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  completedAt: {
    type: Date,
    default: null
  },
  // Time spent on revision (in minutes)
  timeSpentMinutes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

revisionSchema.index({ student: 1, scheduledFor: 1 });
revisionSchema.index({ student: 1, status: 1 });
revisionSchema.index({ student: 1, course: 1 });
revisionSchema.index({ topic: 1 });

module.exports = mongoose.model('Revision', revisionSchema);
