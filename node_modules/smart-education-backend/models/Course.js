/**
 * Course Model
 * Represents a course (e.g., "Grade 11 Physics") with metadata.
 * Topics are linked via the Topic model (one-to-many).
 * 
 * Future AI/ML integration:
 * - Course difficulty scoring via learner performance aggregation
 * - Recommended course sequencing based on prerequisite graphs
 */
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  // Teacher who created/owns this course
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Students enrolled in this course
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Difficulty level for display & future ML difficulty calibration
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  // Whether the course is published and visible to students
  isPublished: {
    type: Boolean,
    default: true
  },
  // Total estimated hours for the course
  estimatedHours: {
    type: Number,
    default: 0
  },
  // Cover image URL (optional)
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
