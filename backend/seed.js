/**
 * Comprehensive Seed Script
 * Seeds the database with realistic sample data for:
 * - Users (admin, teachers, students)
 * - Courses & Topics with prerequisite relationships
 * - Student Progress per topic
 * - Revisions with various statuses
 * - Gamification (XP, badges, streaks, points history)
 *
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Topic = require('./models/Topic');
const StudentProgress = require('./models/StudentProgress');
const Revision = require('./models/Revision');
const Gamification = require('./models/Gamification');
const Material = require('./models/Material');

// ==================== SEED DATA ====================

const usersData = [
  { name: 'Admin User', email: 'admin@education.com', password: 'admin123', role: 'admin' },
  { name: 'Dr. Meera Kulkarni', email: 'meera@education.com', password: 'teacher123', role: 'teacher' },
  { name: 'Prof. Karan Sethi', email: 'karan@education.com', password: 'teacher123', role: 'teacher' },
  { name: 'Aria Patel', email: 'aria@education.com', password: 'student123', role: 'student' },
  { name: 'Karthik Rao', email: 'karthik@education.com', password: 'student123', role: 'student' },
  { name: 'Rhea Sharma', email: 'rhea@education.com', password: 'student123', role: 'student' },
  { name: 'Zaid Khan', email: 'zaid@education.com', password: 'student123', role: 'student' },
  { name: 'Ishaan Verma', email: 'ishaan@education.com', password: 'student123', role: 'student' },
  { name: 'Tanishq Rao', email: 'tanishq@education.com', password: 'student123', role: 'student' },
  { name: 'Priya Nair', email: 'priya@education.com', password: 'student123', role: 'student' },
  { name: 'Aditya Desai', email: 'aditya@education.com', password: 'student123', role: 'student' },
  // Keep original credentials working
  { name: 'John Teacher', email: 'teacher@education.com', password: 'teacher123', role: 'teacher' },
  { name: 'Jane Student', email: 'student@education.com', password: 'student123', role: 'student' }
];

const coursesData = [
  {
    title: 'Grade 11 Physics',
    description: 'Comprehensive physics course covering mechanics, waves, optics, and modern physics with lab experiments.',
    subject: 'Physics',
    difficulty: 'intermediate',
    estimatedHours: 120,
    topics: [
      { title: 'Units & Measurements', description: 'SI units, dimensional analysis, and measurement errors.', order: 0, contentType: 'lesson', estimatedMinutes: 45, pointsReward: 100, difficultyWeight: 3 },
      { title: 'Motion in a Straight Line', description: 'Kinematics of linear motion, velocity, and acceleration.', order: 1, contentType: 'lesson', estimatedMinutes: 60, pointsReward: 120, difficultyWeight: 4, prereqIndex: [0] },
      { title: 'Vectors', description: 'Vector algebra, dot product, cross product, and unit vectors.', order: 2, contentType: 'lesson', estimatedMinutes: 50, pointsReward: 150, difficultyWeight: 6, prereqIndex: [0] },
      { title: 'Motion in a Plane', description: 'Projectile motion and circular motion.', order: 3, contentType: 'lesson', estimatedMinutes: 60, pointsReward: 150, difficultyWeight: 6, prereqIndex: [1, 2] },
      { title: 'Laws of Motion', description: 'Newton\'s three laws, friction, and force diagrams.', order: 4, contentType: 'lesson', estimatedMinutes: 70, pointsReward: 160, difficultyWeight: 5, prereqIndex: [1] },
      { title: 'Work, Energy & Power', description: 'Conservative forces, kinetic and potential energy, power.', order: 5, contentType: 'lesson', estimatedMinutes: 60, pointsReward: 140, difficultyWeight: 5, prereqIndex: [4] },
      { title: 'Rotational Motion', description: 'Moment of inertia, torque, angular momentum.', order: 6, contentType: 'lesson', estimatedMinutes: 75, pointsReward: 180, difficultyWeight: 8, prereqIndex: [4, 5] },
      { title: 'Gravitation', description: 'Universal gravitation, Kepler\'s laws, orbital mechanics.', order: 7, contentType: 'lesson', estimatedMinutes: 50, pointsReward: 140, difficultyWeight: 6, prereqIndex: [4] },
      { title: 'Mechanical Properties of Solids', description: 'Stress, strain, elastic moduli.', order: 8, contentType: 'lesson', estimatedMinutes: 40, pointsReward: 100, difficultyWeight: 4, prereqIndex: [5] },
      { title: 'Waves', description: 'Transverse and longitudinal waves, superposition, standing waves.', order: 9, contentType: 'lesson', estimatedMinutes: 65, pointsReward: 160, difficultyWeight: 7, prereqIndex: [1] },
      { title: 'Oscillations', description: 'SHM, damped and forced oscillations.', order: 10, contentType: 'lesson', estimatedMinutes: 55, pointsReward: 140, difficultyWeight: 6, prereqIndex: [5, 9] },
      { title: 'Physics Lab Skills', description: 'Practical experiments, data analysis, and lab reporting.', order: 11, contentType: 'lab', estimatedMinutes: 90, pointsReward: 200, difficultyWeight: 4 }
    ]
  },
  {
    title: 'Grade 11 Mathematics',
    description: 'Algebra, calculus fundamentals, trigonometry, and coordinate geometry.',
    subject: 'Mathematics',
    difficulty: 'intermediate',
    estimatedHours: 100,
    topics: [
      { title: 'Sets & Functions', description: 'Set theory, types of functions, domain and range.', order: 0, contentType: 'lesson', estimatedMinutes: 40, pointsReward: 100, difficultyWeight: 3 },
      { title: 'Algebra Fundamentals', description: 'Complex numbers, quadratic equations, sequences.', order: 1, contentType: 'lesson', estimatedMinutes: 60, pointsReward: 130, difficultyWeight: 5, prereqIndex: [0] },
      { title: 'Trigonometry', description: 'Trigonometric functions, identities, and equations.', order: 2, contentType: 'lesson', estimatedMinutes: 70, pointsReward: 150, difficultyWeight: 6, prereqIndex: [0] },
      { title: 'Coordinate Geometry', description: 'Straight lines, circles, conic sections.', order: 3, contentType: 'lesson', estimatedMinutes: 65, pointsReward: 140, difficultyWeight: 6, prereqIndex: [1, 2] },
      { title: 'Calculus — Limits', description: 'Limits, continuity, and the concept of derivatives.', order: 4, contentType: 'lesson', estimatedMinutes: 50, pointsReward: 130, difficultyWeight: 7, prereqIndex: [1] },
      { title: 'Calculus — Derivatives', description: 'Differentiation rules, chain rule, applications.', order: 5, contentType: 'lesson', estimatedMinutes: 75, pointsReward: 170, difficultyWeight: 8, prereqIndex: [4] },
      { title: 'Statistics & Probability', description: 'Measures of central tendency, probability theory.', order: 6, contentType: 'lesson', estimatedMinutes: 55, pointsReward: 120, difficultyWeight: 5, prereqIndex: [0] },
      { title: 'Mathematical Reasoning', description: 'Logic, proof techniques, mathematical induction.', order: 7, contentType: 'lesson', estimatedMinutes: 45, pointsReward: 110, difficultyWeight: 6, prereqIndex: [0] },
      { title: 'Series & Sequences', description: 'Arithmetic, geometric, and harmonic progressions.', order: 8, contentType: 'lesson', estimatedMinutes: 50, pointsReward: 130, difficultyWeight: 5, prereqIndex: [1] }
    ]
  },
  {
    title: 'Grade 11 Chemistry',
    description: 'Atomic structure, chemical bonding, thermodynamics, and organic chemistry basics.',
    subject: 'Chemistry',
    difficulty: 'intermediate',
    estimatedHours: 90,
    topics: [
      { title: 'Atomic Structure', description: 'Bohr model, quantum numbers, electron configuration.', order: 0, contentType: 'lesson', estimatedMinutes: 50, pointsReward: 120, difficultyWeight: 5 },
      { title: 'Chemical Bonding', description: 'Ionic, covalent, metallic bonds and molecular geometry.', order: 1, contentType: 'lesson', estimatedMinutes: 60, pointsReward: 140, difficultyWeight: 6, prereqIndex: [0] },
      { title: 'States of Matter', description: 'Gas laws, liquid properties, phase transitions.', order: 2, contentType: 'lesson', estimatedMinutes: 45, pointsReward: 100, difficultyWeight: 4, prereqIndex: [0] },
      { title: 'Thermodynamics', description: 'Enthalpy, entropy, Gibbs free energy.', order: 3, contentType: 'lesson', estimatedMinutes: 70, pointsReward: 160, difficultyWeight: 7, prereqIndex: [2] },
      { title: 'Equilibrium', description: 'Chemical and ionic equilibrium, Le Chatelier principle.', order: 4, contentType: 'lesson', estimatedMinutes: 55, pointsReward: 140, difficultyWeight: 6, prereqIndex: [3] },
      { title: 'Organic Chemistry Basics', description: 'Hydrocarbons, nomenclature, isomerism.', order: 5, contentType: 'lesson', estimatedMinutes: 65, pointsReward: 150, difficultyWeight: 6, prereqIndex: [1] },
      { title: 'Redox Reactions', description: 'Oxidation numbers, balancing redox, electrochemistry intro.', order: 6, contentType: 'lesson', estimatedMinutes: 50, pointsReward: 130, difficultyWeight: 5, prereqIndex: [0] }
    ]
  },
  {
    title: 'Computer Science Fundamentals',
    description: 'Programming basics, data structures, algorithms, and computational thinking.',
    subject: 'Computer Science',
    difficulty: 'beginner',
    estimatedHours: 80,
    topics: [
      { title: 'Introduction to Programming', description: 'Variables, data types, control flow.', order: 0, contentType: 'lesson', estimatedMinutes: 45, pointsReward: 100, difficultyWeight: 2 },
      { title: 'Functions & Modules', description: 'Functions, scope, modular programming.', order: 1, contentType: 'lesson', estimatedMinutes: 50, pointsReward: 120, difficultyWeight: 4, prereqIndex: [0] },
      { title: 'Data Structures', description: 'Arrays, linked lists, stacks, queues.', order: 2, contentType: 'lesson', estimatedMinutes: 70, pointsReward: 160, difficultyWeight: 6, prereqIndex: [1] },
      { title: 'Algorithms', description: 'Sorting, searching, complexity analysis.', order: 3, contentType: 'lesson', estimatedMinutes: 75, pointsReward: 180, difficultyWeight: 7, prereqIndex: [2] },
      { title: 'Object-Oriented Programming', description: 'Classes, inheritance, polymorphism.', order: 4, contentType: 'lesson', estimatedMinutes: 60, pointsReward: 150, difficultyWeight: 6, prereqIndex: [1] },
      { title: 'Web Development Basics', description: 'HTML, CSS, JavaScript fundamentals.', order: 5, contentType: 'project', estimatedMinutes: 90, pointsReward: 200, difficultyWeight: 5, prereqIndex: [0] }
    ]
  }
];

// ==================== CONTENT GENERATOR ====================

function generateTopicContent(courseName, topicTitle, topicDescription) {
  return `# ${topicTitle}

## Course: ${courseName}

### Overview
${topicDescription}

### Learning Objectives
By the end of this topic, you will be able to:
- Understand the fundamental concepts of ${topicTitle.toLowerCase()}
- Apply key principles to solve problems related to ${topicTitle.toLowerCase()}
- Analyze and interpret results in the context of ${courseName.toLowerCase()}
- Connect this topic to related concepts in the curriculum

### Introduction
${topicTitle} is an essential topic in ${courseName}. ${topicDescription} This chapter provides a comprehensive foundation that builds upon prerequisite knowledge and prepares you for more advanced topics ahead.

### Key Concepts

#### Concept 1: Foundations of ${topicTitle}
Every subject has its building blocks, and for ${topicTitle}, understanding the basics is crucial. We begin by examining the core definitions and terminology that form the language of this topic. Students should pay close attention to the precise meanings of technical terms, as these will recur throughout subsequent lessons.

The fundamental principle states that all observations and calculations must be grounded in well-defined concepts. This means we need to establish a clear framework before proceeding to applications.

#### Concept 2: Core Principles
The main principles governing ${topicTitle.toLowerCase()} can be summarized as follows:
1. Every concept builds upon previously established knowledge
2. Theoretical understanding must be supported by practical examples
3. Problem-solving skills develop through consistent practice
4. Real-world applications reinforce conceptual understanding

Understanding these principles helps us navigate complex problems systematically.

#### Concept 3: Applications
The practical applications of ${topicTitle.toLowerCase()} extend far beyond the classroom. In real-world scenarios, these concepts are used in:
- Scientific research and experimentation
- Engineering design and analysis
- Technology development and innovation
- Everyday problem-solving and decision-making

### Worked Examples

**Example 1:** Consider a basic problem in ${topicTitle.toLowerCase()}.
Given the fundamental definitions and principles discussed above, we can approach this step-by-step:
Step 1: Identify the given information and what needs to be found
Step 2: Select the appropriate formula or method
Step 3: Substitute values and solve systematically
Step 4: Verify the answer makes physical/logical sense

**Example 2:** A more complex scenario involving multiple concepts from ${topicTitle.toLowerCase()}.
This example demonstrates how different aspects of the topic interconnect. By breaking the problem into parts, we can apply each concept sequentially to arrive at the solution.

### Summary
In this topic, we covered the essential aspects of ${topicTitle}:
- The foundational concepts and their definitions
- Key principles that govern ${topicTitle.toLowerCase()}
- Practical applications in real-world contexts
- Problem-solving strategies through worked examples

### Practice Questions
1. Define the key terms introduced in this chapter and explain their significance.
2. Describe how the principles of ${topicTitle.toLowerCase()} apply to a real-world situation of your choice.
3. Solve a problem using the methods demonstrated in the worked examples section.
4. Compare and contrast two related concepts from this topic.
5. Explain how this topic connects to the next topic in the course sequence.

### Further Reading
- Refer to the course textbook, Chapter on ${topicTitle}
- Review related online resources and educational videos
- Practice additional problems from the supplementary problem set

---
*Study Material for ${courseName} — ${topicTitle}*
*Read carefully, take notes, and attempt all practice questions before marking as complete.*
`;
}

// ==================== SEED LOGIC ====================

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear all collections
    console.log('\nClearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Topic.deleteMany({}),
      StudentProgress.deleteMany({}),
      Revision.deleteMany({}),
      Gamification.deleteMany({}),
      Material.deleteMany({})
    ]);
    console.log('All collections cleared.');

    // 1. Create Users
    console.log('\n--- Creating Users ---');
    const users = {};
    for (const userData of usersData) {
      const user = await User.create({ ...userData, plainPassword: userData.password });
      users[user.email] = user;
      console.log(`  Created ${user.role}: ${user.name} (${user.email})`);
    }

    const teachers = Object.values(users).filter(u => u.role === 'teacher');
    const students = Object.values(users).filter(u => u.role === 'student');

    // 2. Create Courses & Topics
    console.log('\n--- Creating Courses & Topics ---');
    const allTopics = [];
    const allCourses = [];

    for (let ci = 0; ci < coursesData.length; ci++) {
      const cd = coursesData[ci];
      const teacher = teachers[ci % teachers.length];

      const course = await Course.create({
        title: cd.title,
        description: cd.description,
        subject: cd.subject,
        difficulty: cd.difficulty,
        estimatedHours: cd.estimatedHours,
        createdBy: teacher._id,
        enrolledStudents: students.map(s => s._id),
        isPublished: true
      });
      allCourses.push(course);
      console.log(`  Course: ${course.title} (by ${teacher.name})`);

      const courseTopics = [];
      for (const td of cd.topics) {
        // Create a Material document with placeholder content for this topic
        const materialContent = generateTopicContent(cd.title, td.title, td.description);
        const material = await Material.create({
          title: `${td.title} — Study Material`,
          subject: cd.subject,
          topic: td.title,
          description: td.description,
          type: 'text',
          content: materialContent,
          originalFilename: `${td.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          fileSize: materialContent.length * 2,
          uploadedBy: teacher._id,
          isProcessed: true
        });

        const topic = await Topic.create({
          title: td.title,
          description: td.description,
          course: course._id,
          order: td.order,
          estimatedMinutes: td.estimatedMinutes,
          pointsReward: td.pointsReward,
          contentType: td.contentType,
          difficultyWeight: td.difficultyWeight,
          isPublished: true,
          material: material._id
        });
        courseTopics.push(topic);
        allTopics.push({ topic, courseIndex: ci, topicData: td });
      }

      for (let ti = 0; ti < cd.topics.length; ti++) {
        const td = cd.topics[ti];
        if (td.prereqIndex && td.prereqIndex.length > 0) {
          const prereqIds = td.prereqIndex.map(pi => courseTopics[pi]._id);
          courseTopics[ti].prerequisites = prereqIds;
          await courseTopics[ti].save();
        }
      }

      console.log(`    ${courseTopics.length} topics created with prerequisites`);
    }

    // 3. Create Student Progress
    console.log('\n--- Creating Student Progress ---');
    const now = new Date();
    let progressCount = 0;

    for (const student of students) {
      for (const { topic, courseIndex } of allTopics) {
        const course = allCourses[courseIndex];
        const rand = Math.random();
        let mastery, status, forgetRisk, lastStudied, timeSpent, attempts, score;

        if (rand < 0.15) {
          mastery = 0; status = 'not-started'; forgetRisk = 'low';
          lastStudied = null; timeSpent = 0; attempts = 0; score = 0;
        } else if (rand < 0.35) {
          mastery = 0.2 + Math.random() * 0.3; status = 'in-progress';
          forgetRisk = Math.random() > 0.5 ? 'moderate' : 'high';
          lastStudied = new Date(now - Math.floor(Math.random() * 5) * 86400000);
          timeSpent = 10 + Math.floor(Math.random() * 30);
          attempts = 1 + Math.floor(Math.random() * 3);
          score = 30 + Math.floor(Math.random() * 40);
        } else if (rand < 0.7) {
          mastery = 0.6 + Math.random() * 0.25; status = 'completed';
          forgetRisk = Math.random() > 0.6 ? 'low' : 'moderate';
          lastStudied = new Date(now - Math.floor(Math.random() * 10) * 86400000);
          timeSpent = 20 + Math.floor(Math.random() * 40);
          attempts = 2 + Math.floor(Math.random() * 4);
          score = 60 + Math.floor(Math.random() * 30);
        } else {
          mastery = 0.85 + Math.random() * 0.15; status = 'mastered';
          forgetRisk = 'low';
          lastStudied = new Date(now - Math.floor(Math.random() * 3) * 86400000);
          timeSpent = 30 + Math.floor(Math.random() * 50);
          attempts = 3 + Math.floor(Math.random() * 5);
          score = 85 + Math.floor(Math.random() * 16);
        }

        await StudentProgress.create({
          student: student._id, topic: topic._id, course: course._id,
          masteryLevel: Math.round(mastery * 100) / 100, status, forgetRisk,
          lastStudied, timeSpentMinutes: timeSpent, attempts,
          lastScore: score,
          completedAt: (status === 'completed' || status === 'mastered') ? lastStudied : null
        });
        progressCount++;
      }
    }
    console.log(`  ${progressCount} progress records created`);

    // 4. Create Revisions
    console.log('\n--- Creating Revisions ---');
    let revisionCount = 0;
    const revisionTypes = ['quiz', 'review', 'practice', 'flashcard', 'summary'];
    const priorities = ['low', 'medium', 'high', 'critical'];

    for (const student of students) {
      const numRevisions = 5 + Math.floor(Math.random() * 6);
      const studentTopics = [...allTopics].sort(() => Math.random() - 0.5).slice(0, numRevisions);

      for (const { topic, courseIndex } of studentTopics) {
        const course = allCourses[courseIndex];
        const dayOffset = -3 + Math.floor(Math.random() * 10);
        const scheduledFor = new Date(now.getTime() + dayOffset * 86400000);

        let status, completedAt, score, pointsEarned, timeSpent;

        if (dayOffset < -1) {
          if (Math.random() > 0.2) {
            status = 'completed'; completedAt = scheduledFor;
            score = 50 + Math.floor(Math.random() * 51);
            pointsEarned = 50 + Math.floor(score / 2); timeSpent = 10 + Math.floor(Math.random() * 25);
          } else {
            status = 'skipped'; completedAt = null; score = null; pointsEarned = 0; timeSpent = 0;
          }
        } else if (dayOffset <= 0) {
          status = Math.random() > 0.5 ? 'pending' : 'in-progress';
          completedAt = null; score = null; pointsEarned = 0; timeSpent = 0;
        } else {
          status = 'pending'; completedAt = null; score = null; pointsEarned = 0; timeSpent = 0;
        }

        await Revision.create({
          student: student._id, topic: topic._id, course: course._id,
          scheduledFor, priority: priorities[Math.floor(Math.random() * priorities.length)],
          type: revisionTypes[Math.floor(Math.random() * revisionTypes.length)],
          status, score, pointsEarned, completedAt, timeSpentMinutes: timeSpent,
          notes: status === 'pending' ? 'Review key concepts and attempt practice problems.'
            : status === 'completed' ? 'Good revision session.' : ''
        });
        revisionCount++;
      }
    }
    console.log(`  ${revisionCount} revision tasks created`);

    // 5. Create Gamification profiles
    console.log('\n--- Creating Gamification Profiles ---');
    const badgePool = [
      { badgeId: 'first_revision', name: 'First Revision', description: 'Completed your first revision', icon: '⚔️', category: 'milestone' },
      { badgeId: 'revision_10', name: 'Revision Pro', description: 'Completed 10 revisions', icon: '🏅', category: 'milestone' },
      { badgeId: 'streak_7', name: 'Week Warrior', description: '7-day activity streak', icon: '🔥', category: 'streak' },
      { badgeId: 'level_5', name: 'Rising Star', description: 'Reached level 5', icon: '⭐', category: 'milestone' },
      { badgeId: 'points_5000', name: 'Point Collector', description: 'Earned 5,000 XP', icon: '💎', category: 'milestone' },
      { badgeId: 'lessons_5', name: 'Getting Started', description: 'Completed 5 lessons', icon: '🚀', category: 'mastery' },
      { badgeId: 'lessons_10', name: 'Lesson Learner', description: 'Completed 10 lessons', icon: '📚', category: 'mastery' },
      { badgeId: 'lessons_25', name: 'Knowledge Builder', description: 'Completed 25 lessons', icon: '🎓', category: 'mastery' },
      { badgeId: 'fast_learner', name: 'Fast Learner', description: 'Complete 5 lessons in one day', icon: '⚡', category: 'speed' }
    ];

    const studentProfiles = [
      { totalPoints: 8420, streak: 14, lessons: 22, revisions: 18, quizzes: 8, avgQuiz: 82, badgeCount: 5 },
      { totalPoints: 6350, streak: 7, lessons: 16, revisions: 12, quizzes: 6, avgQuiz: 74, badgeCount: 4 },
      { totalPoints: 4200, streak: 3, lessons: 11, revisions: 8, quizzes: 4, avgQuiz: 68, badgeCount: 3 },
      { totalPoints: 9600, streak: 21, lessons: 28, revisions: 24, quizzes: 12, avgQuiz: 91, badgeCount: 6 },
      { totalPoints: 3100, streak: 1, lessons: 8, revisions: 5, quizzes: 3, avgQuiz: 62, badgeCount: 2 },
      { totalPoints: 5500, streak: 10, lessons: 15, revisions: 11, quizzes: 5, avgQuiz: 76, badgeCount: 4 },
      { totalPoints: 7200, streak: 12, lessons: 20, revisions: 16, quizzes: 7, avgQuiz: 85, badgeCount: 5 },
      { totalPoints: 2800, streak: 2, lessons: 7, revisions: 4, quizzes: 2, avgQuiz: 58, badgeCount: 1 },
      { totalPoints: 4800, streak: 5, lessons: 13, revisions: 9, quizzes: 4, avgQuiz: 72, badgeCount: 3 },
      { totalPoints: 6100, streak: 8, lessons: 17, revisions: 13, quizzes: 6, avgQuiz: 79, badgeCount: 4 }
    ];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const profile = studentProfiles[i % studentProfiles.length];
      const selectedBadges = [...badgePool].sort(() => Math.random() - 0.5).slice(0, profile.badgeCount)
        .map(b => ({ ...b, earnedAt: new Date(now - Math.floor(Math.random() * 30) * 86400000) }));

      const history = [];
      const sources = ['lesson', 'revision', 'quiz', 'streak', 'login', 'badge'];
      const reasons = [
        'Completed topic: Vectors', 'Completed revision: Calculus', 'Quiz score 85%',
        '7-day streak bonus!', 'Daily login bonus', 'Badge earned: Week Warrior',
        'Completed topic: Mechanics', 'Completed revision: Waves', 'Quiz score 92%',
        'Completed topic: Algebra', 'Completed revision: Thermodynamics'
      ];
      for (let h = 0; h < 20; h++) {
        history.push({
          amount: [10, 50, 100, 120, 150, 200, 500][Math.floor(Math.random() * 7)],
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          source: sources[Math.floor(Math.random() * sources.length)],
          earnedAt: new Date(now - Math.floor(Math.random() * 30) * 86400000)
        });
      }

      await Gamification.create({
        student: student._id,
        totalPoints: profile.totalPoints,
        level: Math.floor(profile.totalPoints / 1000) + 1,
        currentStreak: profile.streak,
        longestStreak: Math.max(profile.streak, profile.streak + Math.floor(Math.random() * 5)),
        lastActiveDate: new Date(now - Math.floor(Math.random() * 2) * 86400000),
        weeklyPoints: Math.floor(profile.totalPoints * 0.15),
        weeklyResetDate: new Date(now - 3 * 86400000),
        monthlyPoints: Math.floor(profile.totalPoints * 0.4),
        monthlyResetDate: new Date(now - 15 * 86400000),
        badges: selectedBadges, pointsHistory: history,
        lessonsCompleted: profile.lessons, revisionsCompleted: profile.revisions,
        quizzesCompleted: profile.quizzes, averageQuizScore: profile.avgQuiz
      });
      console.log(`  ${student.name}: ${profile.totalPoints} XP, Level ${Math.floor(profile.totalPoints / 1000) + 1}, ${profile.streak}-day streak`);
    }

    console.log('\n========================================');
    console.log('  SEED COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`\n  Users: ${usersData.length} | Courses: ${allCourses.length} | Topics: ${allTopics.length}`);
    console.log(`  Progress: ${progressCount} | Revisions: ${revisionCount} | Gamification: ${students.length}`);
    console.log('\n--- Login Credentials ---');
    console.log('  Admin:    admin@education.com / admin123');
    console.log('  Teacher:  meera@education.com / teacher123');
    console.log('  Teacher:  teacher@education.com / teacher123');
    console.log('  Student:  aria@education.com / student123');
    console.log('  Student:  student@education.com / student123');
    console.log('  (All students: student123 | All teachers: teacher123)');
    console.log('-----------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
