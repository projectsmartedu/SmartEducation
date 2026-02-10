/**
 * Revision Controller
 * Full CRUD for revision/review tasks.
 * Students can view, complete, and track revisions.
 * Teachers can create revision assignments for students.
 *
 * Future AI/ML integration:
 * - ML forgetting model auto-schedules revisions based on mastery decay
 * - Adaptive difficulty selection for revision quizzes
 * - Priority scoring from multi-factor ML model
 */
const Revision = require('../models/Revision');
const Topic = require('../models/Topic');
const Course = require('../models/Course');
const StudentProgress = require('../models/StudentProgress');
const Gamification = require('../models/Gamification');

// @desc    Get my revisions (student)
// @route   GET /api/revisions
// @access  Private (Student)
exports.getMyRevisions = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const query = { student: req.user._id };
    // Support comma-separated status values (e.g., 'pending,overdue')
    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      if (statuses.length > 1) {
        query.status = { $in: statuses };
      } else {
        query.status = statuses[0];
      }
    }
    if (priority) query.priority = priority;

    const revisions = await Revision.find(query)
      .populate('topic', 'title contentType estimatedMinutes pointsReward')
      .populate('course', 'title subject')
      .sort({ scheduledFor: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Revision.countDocuments(query);

    // Mark overdue revisions
    const now = new Date();
    const enriched = revisions.map(r => {
      const rev = r.toObject();
      if (rev.status === 'pending' && new Date(rev.scheduledFor) < now) {
        rev.status = 'overdue';
      }
      return rev;
    });

    res.json({
      revisions: enriched,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get revisions error:', error);
    res.status(500).json({ message: 'Error fetching revisions' });
  }
};

// @desc    Get revision by ID
// @route   GET /api/revisions/:id
// @access  Private
exports.getRevisionById = async (req, res) => {
  try {
    const revision = await Revision.findById(req.params.id)
      .populate('topic', 'title description contentType estimatedMinutes pointsReward')
      .populate('course', 'title subject')
      .populate('student', 'name email');

    if (!revision) return res.status(404).json({ message: 'Revision not found' });

    // Students can only see their own
    if (req.user.role === 'student' && revision.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ revision });
  } catch (error) {
    console.error('Get revision by ID error:', error);
    res.status(500).json({ message: 'Error fetching revision' });
  }
};

// @desc    Create a revision task (teacher assigns or auto-generated)
// @route   POST /api/revisions
// @access  Private (Teacher/Admin)
exports.createRevision = async (req, res) => {
  try {
    const { studentId, topicId, courseId, scheduledFor, priority, type, notes } = req.body;

    if (!studentId || !topicId || !courseId || !scheduledFor) {
      return res.status(400).json({ message: 'studentId, topicId, courseId, and scheduledFor are required' });
    }

    const revision = await Revision.create({
      student: studentId,
      topic: topicId,
      course: courseId,
      scheduledFor: new Date(scheduledFor),
      priority: priority || 'medium',
      type: type || 'review',
      notes: notes || ''
    });

    res.status(201).json({ message: 'Revision created', revision });
  } catch (error) {
    console.error('Create revision error:', error);
    res.status(500).json({ message: 'Error creating revision' });
  }
};

// @desc    Complete a revision
// @route   PUT /api/revisions/:id/complete
// @access  Private (Student)
exports.completeRevision = async (req, res) => {
  try {
    const revision = await Revision.findById(req.params.id);
    if (!revision) return res.status(404).json({ message: 'Revision not found' });

    if (revision.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (revision.status === 'completed') {
      return res.status(400).json({ message: 'Revision already completed' });
    }

    const { score, timeSpentMinutes } = req.body;

    revision.status = 'completed';
    revision.completedAt = new Date();
    if (score !== undefined) revision.score = score;
    if (timeSpentMinutes !== undefined) revision.timeSpentMinutes = timeSpentMinutes;

    // Calculate points earned (base + bonus for score)
    const topic = await Topic.findById(revision.topic);
    let points = Math.round((topic?.pointsReward || 100) * 0.5); // Half points for revision
    if (score && score >= 80) points += 50; // Bonus for high score
    if (score && score >= 95) points += 100; // Extra bonus for excellence
    revision.pointsEarned = points;

    await revision.save();

    // Update student progress for this topic
    const progress = await StudentProgress.findOne({
      student: req.user._id,
      topic: revision.topic
    });

    if (progress) {
      // Boost mastery from revision (small incremental boost)
      const masteryBoost = 0.05 + (score ? score / 1000 : 0); // 0.05 to 0.15 boost
      progress.masteryLevel = Math.min(1, progress.masteryLevel + masteryBoost);
      progress.lastStudied = new Date();
      if (score !== undefined) {
        progress.lastScore = score;
        progress.attempts += 1;
      }
      if (timeSpentMinutes) progress.timeSpentMinutes += timeSpentMinutes;

      // Recompute forget risk
      // TODO: Replace with ML-based prediction
      if (progress.masteryLevel >= 0.8) progress.forgetRisk = 'low';
      else if (progress.masteryLevel >= 0.6) progress.forgetRisk = 'moderate';
      else progress.forgetRisk = 'high';

      await progress.save();
    }

    // Award gamification points
    await awardRevisionPoints(req.user._id, points, topic?.title || 'Unknown');

    res.json({ message: 'Revision completed', revision, pointsEarned: points });
  } catch (error) {
    console.error('Complete revision error:', error);
    res.status(500).json({ message: 'Error completing revision' });
  }
};

// @desc    Skip a revision
// @route   PUT /api/revisions/:id/skip
// @access  Private (Student)
exports.skipRevision = async (req, res) => {
  try {
    const revision = await Revision.findById(req.params.id);
    if (!revision) return res.status(404).json({ message: 'Revision not found' });

    if (revision.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    revision.status = 'skipped';
    await revision.save();

    res.json({ message: 'Revision skipped', revision });
  } catch (error) {
    console.error('Skip revision error:', error);
    res.status(500).json({ message: 'Error skipping revision' });
  }
};

// @desc    Delete a revision
// @route   DELETE /api/revisions/:id
// @access  Private (Teacher/Admin)
exports.deleteRevision = async (req, res) => {
  try {
    const revision = await Revision.findById(req.params.id);
    if (!revision) return res.status(404).json({ message: 'Revision not found' });

    await Revision.findByIdAndDelete(req.params.id);
    res.json({ message: 'Revision deleted' });
  } catch (error) {
    console.error('Delete revision error:', error);
    res.status(500).json({ message: 'Error deleting revision' });
  }
};

// @desc    Get revision stats for student dashboard
// @route   GET /api/revisions/stats
// @access  Private (Student)
exports.getRevisionStats = async (req, res) => {
  try {
    const studentId = req.user._id;
    const now = new Date();

    const total = await Revision.countDocuments({ student: studentId });
    const completed = await Revision.countDocuments({ student: studentId, status: 'completed' });
    const pending = await Revision.countDocuments({ student: studentId, status: 'pending' });
    const overdue = await Revision.countDocuments({
      student: studentId,
      status: 'pending',
      scheduledFor: { $lt: now }
    });

    // Upcoming revisions (next 7 days)
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcoming = await Revision.countDocuments({
      student: studentId,
      status: 'pending',
      scheduledFor: { $gte: now, $lte: weekFromNow }
    });

    // Average score on completed revisions
    const completedRevisions = await Revision.find({ student: studentId, status: 'completed', score: { $ne: null } });
    const avgScore = completedRevisions.length > 0
      ? Math.round(completedRevisions.reduce((sum, r) => sum + r.score, 0) / completedRevisions.length)
      : 0;

    res.json({
      total,
      completed,
      pending,
      overdue,
      upcoming,
      averageScore: avgScore,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  } catch (error) {
    console.error('Get revision stats error:', error);
    res.status(500).json({ message: 'Error fetching revision stats' });
  }
};

// @desc    Teacher: Get revisions for a specific student
// @route   GET /api/revisions/student/:studentId
// @access  Private (Teacher/Admin)
exports.getStudentRevisions = async (req, res) => {
  try {
    const revisions = await Revision.find({ student: req.params.studentId })
      .populate('topic', 'title contentType')
      .populate('course', 'title subject')
      .sort({ scheduledFor: -1 })
      .limit(50);

    res.json({ revisions });
  } catch (error) {
    console.error('Get student revisions error:', error);
    res.status(500).json({ message: 'Error fetching student revisions' });
  }
};

/**
 * Helper: Award revision points to gamification record.
 */
async function awardRevisionPoints(studentId, amount, topicTitle) {
  try {
    let gamification = await Gamification.findOne({ student: studentId });
    if (!gamification) {
      gamification = new Gamification({ student: studentId });
    }

    gamification.totalPoints += amount;
    gamification.weeklyPoints += amount;
    gamification.monthlyPoints += amount;
    gamification.level = Math.floor(gamification.totalPoints / 1000) + 1;
    gamification.revisionsCompleted += 1;

    gamification.pointsHistory.push({
      amount,
      reason: `Completed revision: ${topicTitle}`,
      source: 'revision'
    });

    if (gamification.pointsHistory.length > 100) {
      gamification.pointsHistory = gamification.pointsHistory.slice(-100);
    }

    // Check for badge awards
    await checkAndAwardBadges(gamification);

    await gamification.save();
  } catch (error) {
    console.error('Award revision points error:', error);
  }
}

/**
 * Check and award badges based on achievement thresholds.
 * TODO: Replace with ML-driven badge recommendation system.
 */
async function checkAndAwardBadges(gamification) {
  const badgeDefs = [
    { id: 'first_revision', name: 'First Revision', desc: 'Completed your first revision', icon: 'check-circle', category: 'milestone', condition: () => gamification.revisionsCompleted >= 1 },
    { id: 'revision_10', name: 'Revision Pro', desc: 'Completed 10 revisions', icon: 'award', category: 'milestone', condition: () => gamification.revisionsCompleted >= 10 },
    { id: 'revision_50', name: 'Revision Master', desc: 'Completed 50 revisions', icon: 'crown', category: 'milestone', condition: () => gamification.revisionsCompleted >= 50 },
    { id: 'streak_7', name: 'Week Warrior', desc: '7-day activity streak', icon: 'flame', category: 'streak', condition: () => gamification.currentStreak >= 7 },
    { id: 'streak_30', name: 'Monthly Champion', desc: '30-day activity streak', icon: 'flame', category: 'streak', condition: () => gamification.currentStreak >= 30 },
    { id: 'level_5', name: 'Rising Star', desc: 'Reached level 5', icon: 'star', category: 'milestone', condition: () => gamification.level >= 5 },
    { id: 'level_10', name: 'Knowledge Seeker', desc: 'Reached level 10', icon: 'sparkles', category: 'milestone', condition: () => gamification.level >= 10 },
    { id: 'points_5000', name: 'Point Collector', desc: 'Earned 5,000 XP', icon: 'trophy', category: 'milestone', condition: () => gamification.totalPoints >= 5000 },
    { id: 'points_10000', name: 'XP Legend', desc: 'Earned 10,000 XP', icon: 'trophy', category: 'milestone', condition: () => gamification.totalPoints >= 10000 },
    { id: 'lessons_10', name: 'Lesson Learner', desc: 'Completed 10 lessons', icon: 'book-open', category: 'mastery', condition: () => gamification.lessonsCompleted >= 10 },
    { id: 'fast_learner', name: 'Fast Learner', desc: 'Complete 5 lessons in one day', icon: 'zap', category: 'speed', condition: () => gamification.lessonsCompleted >= 5 }
  ];

  const existingIds = gamification.badges.map(b => b.badgeId);

  for (const badge of badgeDefs) {
    if (!existingIds.includes(badge.id) && badge.condition()) {
      gamification.badges.push({
        badgeId: badge.id,
        name: badge.name,
        description: badge.desc,
        icon: badge.icon,
        category: badge.category
      });

      // Award bonus points for earning a badge
      gamification.totalPoints += 200;
      gamification.weeklyPoints += 200;
      gamification.pointsHistory.push({
        amount: 200,
        reason: `Badge earned: ${badge.name}`,
        source: 'badge'
      });
    }
  }
}
