/**
 * Gamification Controller
 * Manages XP, levels, streaks, badges, and leaderboards.
 *
 * Future AI/ML integration:
 * - Adaptive reward tuning based on engagement patterns
 * - Streak prediction for pre-emptive retention nudges
 * - Badge recommendation from learning trajectory clustering
 */
const Gamification = require('../models/Gamification');
const User = require('../models/User');

// @desc    Get my gamification profile
// @route   GET /api/gamification/profile
// @access  Private (Student)
exports.getMyProfile = async (req, res) => {
  try {
    let profile = await Gamification.findOne({ student: req.user._id })
      .populate('student', 'name email');

    if (!profile) {
      profile = await Gamification.create({ student: req.user._id });
      profile = await Gamification.findOne({ student: req.user._id })
        .populate('student', 'name email');
    }

    // Reset weekly/monthly if needed
    await resetPeriodicPoints(profile);

    // Calculate XP to next level
    const xpForCurrentLevel = (profile.level - 1) * 1000;
    const xpForNextLevel = profile.level * 1000;
    const xpProgress = profile.totalPoints - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;

    res.json({
      profile: {
        ...profile.toObject(),
        xpProgress,
        xpNeeded,
        xpProgressPercent: Math.round((xpProgress / xpNeeded) * 100)
      }
    });
  } catch (error) {
    console.error('Get gamification profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// @desc    Get leaderboard (top students by points)
// @route   GET /api/gamification/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'total', limit = 20 } = req.query;

    let sortField;
    switch (type) {
      case 'weekly': sortField = 'weeklyPoints'; break;
      case 'monthly': sortField = 'monthlyPoints'; break;
      case 'streak': sortField = 'currentStreak'; break;
      default: sortField = 'totalPoints';
    }

    const leaderboard = await Gamification.find()
      .populate('student', 'name email')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));

    const entries = leaderboard.map((entry, index) => ({
      rank: index + 1,
      studentName: entry.student?.name || 'Unknown',
      studentId: entry.student?._id,
      totalPoints: entry.totalPoints,
      weeklyPoints: entry.weeklyPoints,
      monthlyPoints: entry.monthlyPoints,
      level: entry.level,
      currentStreak: entry.currentStreak,
      longestStreak: entry.longestStreak,
      badgeCount: entry.badges.length,
      lessonsCompleted: entry.lessonsCompleted,
      revisionsCompleted: entry.revisionsCompleted
    }));

    // Find current user's rank
    let myRank = null;
    if (req.user.role === 'student') {
      const allSorted = await Gamification.find().sort({ [sortField]: -1 }).select('student');
      const idx = allSorted.findIndex(g => g.student.toString() === req.user._id.toString());
      myRank = idx >= 0 ? idx + 1 : null;
    }

    res.json({ leaderboard: entries, myRank, type });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

// @desc    Get my badges
// @route   GET /api/gamification/badges
// @access  Private (Student)
exports.getMyBadges = async (req, res) => {
  try {
    const profile = await Gamification.findOne({ student: req.user._id });

    if (!profile) {
      return res.json({ earned: [], available: getAllBadgeDefinitions() });
    }

    const earnedIds = profile.badges.map(b => b.badgeId);
    const allBadges = getAllBadgeDefinitions();
    const available = allBadges.filter(b => !earnedIds.includes(b.id));

    res.json({
      earned: profile.badges,
      available
    });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Error fetching badges' });
  }
};

// @desc    Get my points history
// @route   GET /api/gamification/history
// @access  Private (Student)
exports.getPointsHistory = async (req, res) => {
  try {
    const profile = await Gamification.findOne({ student: req.user._id });

    if (!profile) {
      return res.json({ history: [] });
    }

    // Return most recent first
    const history = [...profile.pointsHistory].reverse().slice(0, 50);

    res.json({ history });
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({ message: 'Error fetching history' });
  }
};

// @desc    Get gamification stats for dashboard
// @route   GET /api/gamification/stats
// @access  Private (Student)
exports.getStats = async (req, res) => {
  try {
    let profile = await Gamification.findOne({ student: req.user._id });

    if (!profile) {
      profile = await Gamification.create({ student: req.user._id });
    }

    res.json({
      totalPoints: profile.totalPoints,
      level: profile.level,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      weeklyPoints: profile.weeklyPoints,
      monthlyPoints: profile.monthlyPoints,
      badgeCount: profile.badges.length,
      lessonsCompleted: profile.lessonsCompleted,
      revisionsCompleted: profile.revisionsCompleted,
      quizzesCompleted: profile.quizzesCompleted,
      averageQuizScore: profile.averageQuizScore
    });
  } catch (error) {
    console.error('Get gamification stats error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// @desc    Teacher: Get gamification overview for all students
// @route   GET /api/gamification/overview
// @access  Private (Teacher/Admin)
exports.getClassOverview = async (req, res) => {
  try {
    const profiles = await Gamification.find()
      .populate('student', 'name email')
      .sort({ totalPoints: -1 });

    const overview = profiles.map(p => ({
      student: p.student,
      totalPoints: p.totalPoints,
      level: p.level,
      currentStreak: p.currentStreak,
      badgeCount: p.badges.length,
      lessonsCompleted: p.lessonsCompleted,
      revisionsCompleted: p.revisionsCompleted
    }));

    // Aggregate stats
    const totalStudents = profiles.length;
    const avgPoints = totalStudents > 0
      ? Math.round(profiles.reduce((sum, p) => sum + p.totalPoints, 0) / totalStudents)
      : 0;
    const avgStreak = totalStudents > 0
      ? Math.round(profiles.reduce((sum, p) => sum + p.currentStreak, 0) / totalStudents)
      : 0;

    res.json({
      students: overview,
      aggregate: {
        totalStudents,
        averagePoints: avgPoints,
        averageStreak: avgStreak,
        topLevel: profiles.length > 0 ? profiles[0].level : 0
      }
    });
  } catch (error) {
    console.error('Get class overview error:', error);
    res.status(500).json({ message: 'Error fetching overview' });
  }
};

// ==================== Helper Functions ====================

/**
 * Reset weekly and monthly points if the period has elapsed.
 */
async function resetPeriodicPoints(profile) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let needsSave = false;

  if (profile.weeklyResetDate && new Date(profile.weeklyResetDate) < weekAgo) {
    profile.weeklyPoints = 0;
    profile.weeklyResetDate = now;
    needsSave = true;
  }

  if (profile.monthlyResetDate && new Date(profile.monthlyResetDate) < monthAgo) {
    profile.monthlyPoints = 0;
    profile.monthlyResetDate = now;
    needsSave = true;
  }

  if (needsSave) await profile.save();
}

/**
 * Get all badge definitions (for showing available/locked badges).
 */
function getAllBadgeDefinitions() {
  return [
    { id: 'first_revision', name: 'First Revision', description: 'Completed your first revision', icon: '⚔️', category: 'milestone' },
    { id: 'revision_10', name: 'Revision Pro', description: 'Completed 10 revisions', icon: '🏅', category: 'milestone' },
    { id: 'revision_50', name: 'Revision Master', description: 'Completed 50 revisions', icon: '👑', category: 'milestone' },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day activity streak', icon: '🔥', category: 'streak' },
    { id: 'streak_30', name: 'Monthly Champion', description: '30-day activity streak', icon: '💪', category: 'streak' },
    { id: 'level_5', name: 'Rising Star', description: 'Reached level 5', icon: '⭐', category: 'milestone' },
    { id: 'level_10', name: 'Knowledge Seeker', description: 'Reached level 10', icon: '✨', category: 'milestone' },
    { id: 'points_5000', name: 'Point Collector', description: 'Earned 5,000 XP', icon: '💎', category: 'milestone' },
    { id: 'points_10000', name: 'XP Legend', description: 'Earned 10,000 XP', icon: '🏆', category: 'milestone' },
    { id: 'lessons_5', name: 'Getting Started', description: 'Completed 5 lessons', icon: '🚀', category: 'mastery' },
    { id: 'lessons_10', name: 'Lesson Learner', description: 'Completed 10 lessons', icon: '📚', category: 'mastery' },
    { id: 'lessons_25', name: 'Knowledge Builder', description: 'Completed 25 lessons', icon: '🎓', category: 'mastery' },
    { id: 'fast_learner', name: 'Fast Learner', description: 'Complete 5 lessons in one day', icon: '⚡', category: 'speed' }
  ];
}
