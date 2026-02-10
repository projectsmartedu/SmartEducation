/**
 * Gamification Model
 * Tracks all gamification data per student: XP, level, streaks, badges.
 * One document per student.
 *
 * Future AI/ML integration:
 * - Adaptive reward calibration based on engagement patterns
 * - Streak prediction to send pre-emptive reminders
 * - Badge recommendation based on learning trajectory clustering
 */
const mongoose = require('mongoose');

const badgeEntrySchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'trophy' // lucide icon name
  },
  category: {
    type: String,
    enum: ['streak', 'mastery', 'speed', 'consistency', 'social', 'milestone', 'revision', 'special'],
    default: 'milestone'
  },
  earnedAt: {
    type: Date,
    default: Date.now
  }
});

const pointsHistorySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  // What triggered the points (lesson, revision, quiz, badge, streak)
  source: {
    type: String,
    enum: ['lesson', 'revision', 'quiz', 'badge', 'streak', 'login', 'other'],
    default: 'other'
  },
  // Reference to the related document (topic, revision, etc.)
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  earnedAt: {
    type: Date,
    default: Date.now
  }
});

const gamificationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Total XP points accumulated
  totalPoints: {
    type: Number,
    default: 0
  },
  // Current level (calculated: floor(totalPoints / 1000) + 1)
  level: {
    type: Number,
    default: 1
  },
  // Current streak (consecutive days of activity)
  currentStreak: {
    type: Number,
    default: 0
  },
  // Longest streak ever achieved
  longestStreak: {
    type: Number,
    default: 0
  },
  // Last date the student was active (for streak calculation)
  lastActiveDate: {
    type: Date,
    default: null
  },
  // Weekly XP for leaderboard calculations
  weeklyPoints: {
    type: Number,
    default: 0
  },
  // When weekly points were last reset
  weeklyResetDate: {
    type: Date,
    default: Date.now
  },
  // Monthly XP
  monthlyPoints: {
    type: Number,
    default: 0
  },
  monthlyResetDate: {
    type: Date,
    default: Date.now
  },
  // Badges earned
  badges: [badgeEntrySchema],
  // Points history (last 100 entries for display)
  pointsHistory: [pointsHistorySchema],
  // Lessons completed count
  lessonsCompleted: {
    type: Number,
    default: 0
  },
  // Revisions completed count
  revisionsCompleted: {
    type: Number,
    default: 0
  },
  // Quizzes completed count
  quizzesCompleted: {
    type: Number,
    default: 0
  },
  // Average quiz score
  averageQuizScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

gamificationSchema.index({ student: 1 });
gamificationSchema.index({ totalPoints: -1 }); // For global leaderboard
gamificationSchema.index({ weeklyPoints: -1 }); // For weekly leaderboard
gamificationSchema.index({ currentStreak: -1 }); // For streak leaderboard

module.exports = mongoose.model('Gamification', gamificationSchema);
