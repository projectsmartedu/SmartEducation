/**
 * Topic Model
 * Represents a topic within a course (e.g., "Vectors" inside "Grade 11 Physics").
 * Each topic has ordering, prerequisites, and metadata for the knowledge map.
 *
 * Future AI/ML integration:
 * - GNN-based prerequisite graph learning
 * - Auto-generated topic difficulty from learner performance
 * - Concept similarity embeddings for recommendation
 */
const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Topic title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  // Parent course
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  // Ordering within the course
  order: {
    type: Number,
    default: 0
  },
  // Prerequisites (other topics that should be completed first)
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  // Estimated time to complete this topic (in minutes)
  estimatedMinutes: {
    type: Number,
    default: 30
  },
  // Points awarded for completing this topic
  pointsReward: {
    type: Number,
    default: 100
  },
  // Content type hint for future animated/interactive content
  contentType: {
    type: String,
    enum: ['lesson', 'quiz', 'lab', 'project', 'review'],
    default: 'lesson'
  },
  // Difficulty weight (1-10) for adaptive difficulty calibration
  // TODO: Replace with ML-predicted difficulty based on learner cohort performance
  difficultyWeight: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  // Linked material (PDF/text content) for this topic
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    default: null
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

topicSchema.index({ course: 1, order: 1 });
topicSchema.index({ prerequisites: 1 });

module.exports = mongoose.model('Topic', topicSchema);
