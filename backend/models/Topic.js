/**
 * Topic Model
 * Represents a discrete learning topic within a course (e.g., "Vectors" inside "Grade 11 Physics")
 * Provides granular learning units with ordering, prerequisites, and metadata for knowledge mapping
 * 
 * Schema responsibilities:
 * - Store topic learning content and descriptive information
 * - Define topic sequencing within courses through ordering
 * - Track prerequisite relationships for guided learning paths
 * - Manage learning metrics (time estimates, point rewards)
 * - Support content type classification and difficulty levels
 * 
 * Future AI/ML integration:
 * - GNN-based prerequisite graph learning for optimal sequencing
 * - Auto-generated topic difficulty from learner performance data
 * - Concept similarity embeddings for intelligent recommendations
 * - Adaptive pacing suggestions based on cohort performance
 */
const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  // Topic name and display title
  title: {
    type: String,
    required: [true, 'Topic title is required'],
    trim: true,
    maxlength: 200
  },
  // Detailed topic description and learning objectives
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  // Reference to the parent course containing this topic
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  // Sequence position within the course (lower = earlier in curriculum)
  order: {
    type: Number,
    default: 0
  },
  // Array of prerequisite topics that should be completed first
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  // Estimated time in minutes for a student to complete this topic
  estimatedMinutes: {
    type: Number,
    default: 30
  },
  // Gamification points awarded upon topic completion
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
