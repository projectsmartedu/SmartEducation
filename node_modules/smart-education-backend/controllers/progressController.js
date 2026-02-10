/**
 * Student Progress Controller
 * Manages per-topic progress tracking for students.
 * Provides endpoints for the knowledge map, progress overview, and mastery updates.
 *
 * Future AI/ML integration:
 * - GNN model consumes progress graph to infer latent mastery
 * - Forgetting predictor updates forgetRisk field periodically
 * - Pace estimator reads timeSpentMinutes for difficulty calibration
 */
const StudentProgress = require('../models/StudentProgress');
const Topic = require('../models/Topic');
const Course = require('../models/Course');
const Gamification = require('../models/Gamification');

// @desc    Get student's progress across all enrolled courses
// @route   GET /api/progress
// @access  Private (Student)
exports.getMyProgress = async (req, res) => {
  try {
    const progress = await StudentProgress.find({ student: req.user._id })
      .populate('topic', 'title description order contentType estimatedMinutes pointsReward difficultyWeight')
      .populate('course', 'title subject')
      .sort({ 'course': 1, 'topic.order': 1 });

    // Group by course
    const grouped = {};
    progress.forEach(p => {
      const courseId = p.course?._id?.toString();
      if (!courseId) return;
      if (!grouped[courseId]) {
        grouped[courseId] = {
          course: p.course,
          topics: [],
          averageMastery: 0,
          completedCount: 0,
          totalCount: 0
        };
      }
      grouped[courseId].topics.push(p);
      grouped[courseId].totalCount++;
      grouped[courseId].averageMastery += p.masteryLevel;
      if (p.status === 'completed' || p.status === 'mastered') {
        grouped[courseId].completedCount++;
      }
    });

    // Calculate averages
    Object.values(grouped).forEach(g => {
      g.averageMastery = g.totalCount > 0 ? Math.round((g.averageMastery / g.totalCount) * 100) : 0;
      g.completionRate = g.totalCount > 0 ? Math.round((g.completedCount / g.totalCount) * 100) : 0;
    });

    res.json({ progress: Object.values(grouped) });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Error fetching progress' });
  }
};

// @desc    Get progress for a specific course
// @route   GET /api/progress/course/:courseId
// @access  Private (Student)
exports.getCourseProgress = async (req, res) => {
  try {
    const progress = await StudentProgress.find({
      student: req.user._id,
      course: req.params.courseId
    })
      .populate('topic', 'title description order contentType estimatedMinutes pointsReward difficultyWeight prerequisites')
      .sort({ 'topic.order': 1 });

    const course = await Course.findById(req.params.courseId).select('title subject');

    const totalTopics = progress.length;
    const completedTopics = progress.filter(p => p.status === 'completed' || p.status === 'mastered').length;
    const avgMastery = totalTopics > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.masteryLevel, 0) / totalTopics * 100)
      : 0;

    res.json({
      course,
      progress,
      summary: {
        totalTopics,
        completedTopics,
        averageMastery: avgMastery,
        completionRate: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ message: 'Error fetching course progress' });
  }
};

// @desc    Update progress for a topic (study, complete, score update)
// @route   PUT /api/progress/:topicId
// @access  Private (Student)
exports.updateProgress = async (req, res) => {
  try {
    const { masteryLevel, status, timeSpentMinutes, lastScore, notes } = req.body;

    let progress = await StudentProgress.findOne({
      student: req.user._id,
      topic: req.params.topicId
    });

    if (!progress) {
      // Auto-create progress if the student is enrolled
      const topic = await Topic.findById(req.params.topicId).populate('course');
      if (!topic) return res.status(404).json({ message: 'Topic not found' });

      const course = await Course.findById(topic.course._id || topic.course);
      if (!course || !course.enrolledStudents.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not enrolled in this course' });
      }

      progress = new StudentProgress({
        student: req.user._id,
        topic: req.params.topicId,
        course: course._id
      });
    }

    // Update fields
    if (masteryLevel !== undefined) progress.masteryLevel = Math.min(1, Math.max(0, masteryLevel));
    if (timeSpentMinutes !== undefined) progress.timeSpentMinutes += timeSpentMinutes;
    if (lastScore !== undefined) {
      progress.lastScore = lastScore;
      progress.attempts += 1;
    }
    if (notes !== undefined) progress.notes = notes;

    // Handle status transitions
    if (status) {
      progress.status = status;
      if (status === 'completed' || status === 'mastered') {
        progress.completedAt = new Date();
        // Award points via gamification
        const topic = await Topic.findById(req.params.topicId);
        if (topic) {
          await awardPoints(req.user._id, topic.pointsReward, 'lesson', `Completed topic: ${topic.title}`, topic._id);
        }
      }
    }

    // Update lastStudied
    progress.lastStudied = new Date();

    // Compute forgetRisk based on mastery and time since last study
    // TODO: Replace with ML forgetting prediction model
    progress.forgetRisk = computeForgetRisk(progress.masteryLevel, progress.lastStudied);

    await progress.save();

    // Record daily activity for streak tracking
    await recordActivity(req.user._id);

    res.json({ message: 'Progress updated', progress });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Error updating progress' });
  }
};

// @desc    Get knowledge map data (all topics with mastery for knowledge visualization)
// @route   GET /api/progress/knowledge-map
// @access  Private (Student)
exports.getKnowledgeMap = async (req, res) => {
  try {
    // Accept optional courseId query param to filter by course
    const query = { student: req.user._id };
    if (req.query.courseId) {
      query.course = req.query.courseId;
    }

    const progress = await StudentProgress.find(query)
      .populate({
        path: 'topic',
        select: 'title description order contentType prerequisites difficultyWeight course',
        populate: { path: 'prerequisites', select: 'title' }
      })
      .populate('course', 'title subject');

    // Build knowledge graph nodes
    // TODO: Replace with GNN model inference for latent mastery prediction
    const nodes = progress
      .filter(p => p.topic) // Filter out any with deleted topics
      .map(p => ({
        topicId: p.topic._id,
        id: p.topic._id,
        title: p.topic.title,
        label: p.topic.title,
        description: p.topic.description,
        mastery: p.masteryLevel,
        status: p.status,
        forgetRisk: p.forgetRisk,
        lastStudied: p.lastStudied,
        prerequisites: p.topic.prerequisites?.map(pr => pr._id) || [],
        prerequisiteNames: p.topic.prerequisites?.map(pr => pr.title) || [],
        contentType: p.topic.contentType,
        courseName: p.course?.title,
        courseSubject: p.course?.subject,
        courseId: p.course?._id,
        difficultyWeight: p.topic.difficultyWeight
      }));

    // Summary stats
    const totalNodes = nodes.length;
    const masteredNodes = nodes.filter(n => n.mastery >= 0.8).length;
    const weakNodes = nodes.filter(n => n.mastery < 0.4).length;
    const avgMastery = totalNodes > 0
      ? Math.round(nodes.reduce((sum, n) => sum + n.mastery, 0) / totalNodes * 100)
      : 0;

    res.json({
      nodes,
      summary: {
        totalNodes,
        masteredNodes,
        weakNodes,
        averageMastery: avgMastery
      }
    });
  } catch (error) {
    console.error('Get knowledge map error:', error);
    res.status(500).json({ message: 'Error fetching knowledge map' });
  }
};

// @desc    Get progress overview stats for dashboard
// @route   GET /api/progress/stats
// @access  Private (Student)
exports.getProgressStats = async (req, res) => {
  try {
    const allProgress = await StudentProgress.find({ student: req.user._id })
      .populate('course', 'title subject');

    const totalTopics = allProgress.length;
    const completed = allProgress.filter(p => p.status === 'completed').length;
    const mastered = allProgress.filter(p => p.status === 'mastered').length;
    const inProgress = allProgress.filter(p => p.status === 'in-progress').length;
    const avgMastery = totalTopics > 0
      ? allProgress.reduce((sum, p) => sum + p.masteryLevel, 0) / totalTopics
      : 0;
    const totalTime = allProgress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);

    // Weak topics (mastery < 40%)
    const weakTopics = allProgress.filter(p => p.masteryLevel < 0.4).length;
    // High risk topics
    const highRiskTopics = allProgress.filter(p => p.forgetRisk === 'high' || p.forgetRisk === 'critical').length;

    // Course breakdown
    const courseMap = {};
    allProgress.forEach(p => {
      const cid = p.course?._id?.toString();
      if (!cid) return;
      if (!courseMap[cid]) {
        courseMap[cid] = { course: cid, courseName: p.course?.title || 'Unknown', total: 0, completed: 0, mastered: 0, masterySum: 0 };
      }
      courseMap[cid].total++;
      courseMap[cid].masterySum += p.masteryLevel;
      if (p.status === 'completed') courseMap[cid].completed++;
      if (p.status === 'mastered') courseMap[cid].mastered++;
    });
    const courseBreakdown = Object.values(courseMap).map(cb => ({
      ...cb,
      averageMastery: cb.total > 0 ? cb.masterySum / cb.total : 0
    }));

    res.json({
      totalTopics,
      completed,
      mastered,
      inProgress,
      averageMastery: avgMastery,
      totalTimeSpentMinutes: totalTime,
      weakTopics,
      highRiskTopics,
      completionRate: totalTopics > 0 ? Math.round(((completed + mastered) / totalTopics) * 100) : 0,
      courseBreakdown
    });
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// @desc    Teacher: Get progress for a specific student
// @route   GET /api/progress/student/:studentId
// @access  Private (Teacher/Admin)
exports.getStudentProgress = async (req, res) => {
  try {
    const progress = await StudentProgress.find({ student: req.params.studentId })
      .populate('topic', 'title description order contentType')
      .populate('course', 'title subject');

    const grouped = {};
    progress.forEach(p => {
      const courseId = p.course?._id?.toString();
      if (!courseId) return;
      if (!grouped[courseId]) {
        grouped[courseId] = { course: p.course, topics: [], avgMastery: 0, count: 0 };
      }
      grouped[courseId].topics.push(p);
      grouped[courseId].count++;
      grouped[courseId].avgMastery += p.masteryLevel;
    });

    Object.values(grouped).forEach(g => {
      g.avgMastery = g.count > 0 ? Math.round((g.avgMastery / g.count) * 100) : 0;
    });

    res.json({ progress: Object.values(grouped) });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ message: 'Error fetching student progress' });
  }
};

// @desc    Teacher: Get class-wide progress aggregation
// @route   GET /api/progress/class/:courseId
// @access  Private (Teacher/Admin)
exports.getClassProgress = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const topics = await Topic.find({ course: course._id }).sort({ order: 1 });

    // Per-topic aggregation
    const topicAverages = await Promise.all(
      topics.map(async (topic) => {
        const progress = await StudentProgress.find({ topic: topic._id });
        const total = progress.length;
        const avgMastery = total > 0
          ? progress.reduce((sum, p) => sum + p.masteryLevel, 0) / total
          : 0;
        const completedCount = progress.filter(p => p.status === 'completed' || p.status === 'mastered').length;

        return {
          topic: topic._id,
          title: topic.title,
          order: topic.order,
          totalStudents: total,
          averageMastery: avgMastery,
          completedCount,
          completionRate: total > 0 ? Math.round((completedCount / total) * 100) : 0
        };
      })
    );

    // Per-student summary
    const User = require('../models/User');
    const enrolledStudents = await User.find({ _id: { $in: course.enrolledStudents } }).select('name email');

    const studentSummaries = await Promise.all(
      enrolledStudents.map(async (student) => {
        const progress = await StudentProgress.find({ student: student._id, course: course._id });
        const total = progress.length;
        const avgMastery = total > 0
          ? progress.reduce((sum, p) => sum + p.masteryLevel, 0) / total
          : 0;
        const topicsCompleted = progress.filter(p => p.status === 'completed' || p.status === 'mastered').length;
        const totalTime = progress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);

        return {
          studentId: student._id,
          studentName: student.name,
          studentEmail: student.email,
          totalTopics: total,
          topicsCompleted,
          averageMastery: avgMastery,
          totalTimeMinutes: totalTime
        };
      })
    );

    res.json({
      course: { _id: course._id, title: course.title, subject: course.subject },
      topicAverages,
      topicStats: topicAverages,  // alias for backward compatibility
      studentSummaries
    });
  } catch (error) {
    console.error('Get class progress error:', error);
    res.status(500).json({ message: 'Error fetching class progress' });
  }
};

// ==================== Helper Functions ====================

/**
 * Compute forget risk based on mastery and time since last study.
 * TODO: Replace with ML-based forgetting curve prediction.
 */
function computeForgetRisk(mastery, lastStudied) {
  if (!lastStudied) return 'critical';

  const daysSinceStudy = (Date.now() - new Date(lastStudied).getTime()) / (1000 * 60 * 60 * 24);

  if (mastery >= 0.8 && daysSinceStudy < 7) return 'low';
  if (mastery >= 0.6 && daysSinceStudy < 5) return 'low';
  if (mastery >= 0.6 && daysSinceStudy < 14) return 'moderate';
  if (mastery >= 0.4 && daysSinceStudy < 3) return 'moderate';
  if (mastery < 0.4) return daysSinceStudy > 3 ? 'critical' : 'high';
  return 'high';
}

/**
 * Award points to a student and update gamification record.
 */
async function awardPoints(studentId, amount, source, reason, referenceId = null) {
  try {
    let gamification = await Gamification.findOne({ student: studentId });
    if (!gamification) {
      gamification = new Gamification({ student: studentId });
    }

    gamification.totalPoints += amount;
    gamification.weeklyPoints += amount;
    gamification.monthlyPoints += amount;
    gamification.level = Math.floor(gamification.totalPoints / 1000) + 1;

    if (source === 'lesson') gamification.lessonsCompleted += 1;
    if (source === 'revision') gamification.revisionsCompleted += 1;
    if (source === 'quiz') gamification.quizzesCompleted += 1;

    // Add to history (keep last 100)
    gamification.pointsHistory.push({ amount, reason, source, referenceId });
    if (gamification.pointsHistory.length > 100) {
      gamification.pointsHistory = gamification.pointsHistory.slice(-100);
    }

    // Check and award badges on every point award (lessons, quizzes, etc.)
    checkAndAwardBadges(gamification);

    await gamification.save();
  } catch (error) {
    console.error('Award points error:', error);
  }
}

/**
 * Check badge eligibility and award any newly-earned badges.
 * Called from both progressController (lesson completion) and revisionController.
 */
function checkAndAwardBadges(gamification) {
  const badgeDefs = [
    { id: 'first_revision', name: 'First Revision', desc: 'Completed your first revision', icon: '⚔️', category: 'revision', condition: () => gamification.revisionsCompleted >= 1 },
    { id: 'revision_10', name: 'Revision Pro', desc: 'Completed 10 revisions', icon: '🏆', category: 'revision', condition: () => gamification.revisionsCompleted >= 10 },
    { id: 'revision_50', name: 'Revision Master', desc: 'Completed 50 revisions', icon: '🏆', category: 'revision', condition: () => gamification.revisionsCompleted >= 50 },
    { id: 'streak_7', name: 'Week Warrior', desc: '7-day activity streak', icon: '🔥', category: 'streak', condition: () => gamification.currentStreak >= 7 },
    { id: 'streak_30', name: 'Monthly Champion', desc: '30-day activity streak', icon: '🔥', category: 'streak', condition: () => gamification.currentStreak >= 30 },
    { id: 'level_5', name: 'Rising Star', desc: 'Reached level 5', icon: '✨', category: 'special', condition: () => gamification.level >= 5 },
    { id: 'level_10', name: 'Knowledge Seeker', desc: 'Reached level 10', icon: '✨', category: 'special', condition: () => gamification.level >= 10 },
    { id: 'points_5000', name: 'Point Collector', desc: 'Earned 5,000 XP', icon: '🏆', category: 'special', condition: () => gamification.totalPoints >= 5000 },
    { id: 'points_10000', name: 'XP Legend', desc: 'Earned 10,000 XP', icon: '🏆', category: 'special', condition: () => gamification.totalPoints >= 10000 },
    { id: 'lessons_5', name: 'Getting Started', desc: 'Completed 5 lessons', icon: '🚀', category: 'mastery', condition: () => gamification.lessonsCompleted >= 5 },
    { id: 'lessons_10', name: 'Lesson Learner', desc: 'Completed 10 lessons', icon: '🧠', category: 'mastery', condition: () => gamification.lessonsCompleted >= 10 },
    { id: 'lessons_25', name: 'Knowledge Builder', desc: 'Completed 25 lessons', icon: '🧠', category: 'mastery', condition: () => gamification.lessonsCompleted >= 25 }
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

/**
 * Record daily activity for streak tracking.
 */
async function recordActivity(studentId) {
  try {
    let gamification = await Gamification.findOne({ student: studentId });
    if (!gamification) {
      gamification = new Gamification({ student: studentId });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = gamification.lastActiveDate ? new Date(gamification.lastActiveDate) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
    }

    if (!lastActive || lastActive.getTime() !== today.getTime()) {
      if (lastActive) {
        const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          // Consecutive day
          gamification.currentStreak += 1;
          if (gamification.currentStreak > gamification.longestStreak) {
            gamification.longestStreak = gamification.currentStreak;
          }
          // Award streak bonus
          if (gamification.currentStreak % 7 === 0) {
            gamification.totalPoints += 500;
            gamification.weeklyPoints += 500;
            gamification.pointsHistory.push({
              amount: 500,
              reason: `${gamification.currentStreak}-day streak bonus!`,
              source: 'streak'
            });
          }
        } else if (diffDays > 1) {
          // Streak broken
          gamification.currentStreak = 1;
        }
      } else {
        gamification.currentStreak = 1;
      }

      gamification.lastActiveDate = new Date();
      // Award login points
      gamification.totalPoints += 10;
      gamification.weeklyPoints += 10;
      gamification.pointsHistory.push({
        amount: 10,
        reason: 'Daily login bonus',
        source: 'login'
      });
    }

    await gamification.save();
  } catch (error) {
    console.error('Record activity error:', error);
  }
}
