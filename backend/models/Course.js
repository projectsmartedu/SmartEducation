/**
 * Course Model
 * Represents a structured educational course (e.g., "Grade 11 Physics")
 * Serves as the container for learning topics and student enrollment
 * Topics are linked via the Topic model (one-to-many relationship)
 * 
 * Schema responsibilities:
 * - Store course metadata (title, subject, description)
 * - Track course ownership and creator information
 * - Maintain student enrollment lists
 * - Define difficulty level for curriculum design
 * - Support timestamps for audit trails
 * 
 * Future AI/ML integration:
 * - Course difficulty scoring via learner performance aggregation
 * - Recommended course sequencing based on prerequisite graphs
 * - Adaptive pacing recommendations based on cohort progress
 */
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // Course display name and title
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: 200
  },
  // Extended course description and curriculum overview
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  // Subject area (e.g., Mathematics, Physics, History)
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  // Reference to the User who created and owns this course
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Array of student references currently enrolled in this course
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Difficulty level classification for display and ML calibration
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  // Publication status: controls visibility and enrollment eligibility
  isPublished: {
    type: Boolean,
    default: true
  },
  // Estimated total study time in hours for course completion
  estimatedHours: {
    type: Number,
    default: 0
  },
  // Cover image URL for course display and catalog preview
  coverImage: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

courseSchema.index({ createdBy: 1 });
courseSchema.index({ subject: 1 });
courseSchema.index({ enrolledStudents: 1 });

module.exports = mongoose.model('Course', courseSchema);
