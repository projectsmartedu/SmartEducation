/**
 * Course Controller
 * Full CRUD for courses and course-topic mappings.
 * Teachers create/manage courses; students browse & enroll.
 *
 * Future AI/ML integration points marked with TODO comments.
 */
const Course = require('../models/Course');
const Topic = require('../models/Topic');
const StudentProgress = require('../models/StudentProgress');
const Material = require('../models/Material');
const textExtractionService = require('../services/textExtractionService');
const notifications = require('../notifications');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Teacher/Admin)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, subject, difficulty, estimatedHours, coverImage } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }

    const course = await Course.create({
      title,
      description,
      subject,
      difficulty: difficulty || 'intermediate',
      estimatedHours: estimatedHours || 0,
      coverImage: coverImage || '',
      createdBy: req.user._id
    });

    // emit real-time notification about new course
    try {
      notifications.emitNewCourse(course);
    } catch (e) {
      // ignore if sockets not initialized
    }

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create course error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(500).json({ message: 'Error creating course' });
  }
};

// @desc    Get all courses (with optional filters)
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    const { subject, createdBy, page = 1, limit = 20 } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (createdBy) query.createdBy = createdBy;

    // Students only see published courses
    if (req.user.role === 'student') {
      query.isPublished = true;
    }

    const courses = await Course.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    // For each course, get topic count
    const coursesWithMeta = await Promise.all(
      courses.map(async (course) => {
        const topicCount = await Topic.countDocuments({ course: course._id });
        const enrolledCount = course.enrolledStudents?.length || 0;
        return {
          ...course.toObject(),
          topicCount,
          enrolledCount
        };
      })
    );

    res.json({
      courses: coursesWithMeta,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

// @desc    Get course by ID with its topics
// @route   GET /api/courses/:id
// @access  Private
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('enrolledStudents', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const topics = await Topic.find({ course: course._id })
      .populate('prerequisites', 'title')
      .populate('material', 'title type originalFilename fileSize')
      .sort({ order: 1 });

    res.json({ course, topics });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({ message: 'Error fetching course' });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Teacher/Admin - owner)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only owner or admin can update
    if (course.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, subject, difficulty, estimatedHours, coverImage, isPublished } = req.body;
    if (title) course.title = title;
    if (description !== undefined) course.description = description;
    if (subject) course.subject = subject;
    if (difficulty) course.difficulty = difficulty;
    if (estimatedHours !== undefined) course.estimatedHours = estimatedHours;
    if (coverImage !== undefined) course.coverImage = coverImage;
    if (isPublished !== undefined) course.isPublished = isPublished;

    await course.save();
    res.json({ message: 'Course updated', course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Error updating course' });
  }
};

// @desc    Delete a course and all related topics/progress
// @route   DELETE /api/courses/:id
// @access  Private (Teacher/Admin - owner)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Cascade delete topics and progress
    const topics = await Topic.find({ course: course._id });
    const topicIds = topics.map(t => t._id);
    await StudentProgress.deleteMany({ topic: { $in: topicIds } });
    await Topic.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course and related data deleted' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Error deleting course' });
  }
};

// @desc    Enroll a student in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
exports.enrollStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    course.enrolledStudents.push(req.user._id);
    await course.save();

    // Create progress entries for all topics in the course
    const topics = await Topic.find({ course: course._id });
    const progressEntries = topics.map(topic => ({
      student: req.user._id,
      topic: topic._id,
      course: course._id,
      masteryLevel: 0,
      status: 'not-started'
    }));

    // Use insertMany with ordered:false to skip duplicates
    try {
      await StudentProgress.insertMany(progressEntries, { ordered: false });
    } catch (e) {
      // Ignore duplicate key errors (student already has progress for some topics)
      if (e.code !== 11000) throw e;
    }

    res.json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({ message: 'Error enrolling in course' });
  }
};

// @desc    Unenroll a student from a course
// @route   POST /api/courses/:id/unenroll
// @access  Private (Student)
exports.unenrollStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== req.user._id.toString()
    );
    await course.save();

    res.json({ message: 'Unenrolled successfully' });
  } catch (error) {
    console.error('Unenroll student error:', error);
    res.status(500).json({ message: 'Error unenrolling' });
  }
};

// @desc    Get my courses (teacher: created, student: enrolled)
// @route   GET /api/courses/my
// @access  Private
exports.getMyCourses = async (req, res) => {
  try {
    let courses;
    if (req.user.role === 'student') {
      courses = await Course.find({ enrolledStudents: req.user._id })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      courses = await Course.find({ createdBy: req.user._id })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    }

    const coursesWithMeta = await Promise.all(
      courses.map(async (course) => {
        const topicCount = await Topic.countDocuments({ course: course._id });
        return { ...course.toObject(), topicCount, enrolledCount: course.enrolledStudents?.length || 0 };
      })
    );

    res.json({ courses: coursesWithMeta });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

// ==================== TOPIC CRUD ====================

// @desc    Create a topic within a course
// @route   POST /api/courses/:id/topics
// @access  Private (Teacher/Admin)
exports.createTopic = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, order, prerequisites, estimatedMinutes, pointsReward, contentType, difficultyWeight, pdfBase64, filename, textContent } = req.body;

    if (!title) return res.status(400).json({ message: 'Topic title is required' });

    // Auto-set order if not provided
    const topicCount = await Topic.countDocuments({ course: course._id });

    // Create linked material if content is provided
    let materialId = null;
    if (pdfBase64) {
      // PDF upload
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      const extractedText = await textExtractionService.extractFromPDF(pdfBuffer);
      if (!extractedText || extractedText.length < 10) {
        return res.status(400).json({ message: 'Could not extract text from PDF' });
      }
      const material = await Material.create({
        title: title,
        subject: course.subject,
        topic: title,
        description: description || '',
        type: 'pdf',
        content: extractedText,
        originalFilename: filename || 'document.pdf',
        fileSize: pdfBuffer.length,
        uploadedBy: req.user._id,
        isProcessed: true
      });
      materialId = material._id;
    } else if (textContent) {
      // Text/notes content
      const material = await Material.create({
        title: title,
        subject: course.subject,
        topic: title,
        description: description || '',
        type: 'text',
        content: textContent,
        uploadedBy: req.user._id,
        isProcessed: true
      });
      materialId = material._id;
    }

    const topic = await Topic.create({
      title,
      description,
      course: course._id,
      order: order !== undefined ? order : topicCount,
      prerequisites: prerequisites || [],
      estimatedMinutes: estimatedMinutes || 30,
      pointsReward: pointsReward || 100,
      contentType: contentType || 'lesson',
      difficultyWeight: difficultyWeight || 5,
      material: materialId
    });

    // Create progress entries for enrolled students
    const progressEntries = course.enrolledStudents.map(studentId => ({
      student: studentId,
      topic: topic._id,
      course: course._id,
      masteryLevel: 0,
      status: 'not-started'
    }));

    if (progressEntries.length > 0) {
      try {
        await StudentProgress.insertMany(progressEntries, { ordered: false });
      } catch (e) {
        if (e.code !== 11000) throw e;
      }
    }

    // emit real-time notification about new topic
    try {
      notifications.emitNewTopic(topic, course._id);
    } catch (e) {
      // ignore if sockets not initialized
    }

    res.status(201).json({ message: 'Topic created', topic });
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ message: 'Error creating topic' });
  }
};

// @desc    Update a topic
// @route   PUT /api/courses/:courseId/topics/:topicId
// @access  Private (Teacher/Admin)
exports.updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const course = await Course.findById(topic.course);
    if (course.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const fields = ['title', 'description', 'order', 'prerequisites', 'estimatedMinutes', 'pointsReward', 'contentType', 'difficultyWeight', 'isPublished'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) topic[field] = req.body[field];
    });

    // Handle material update (new PDF or text content)
    const { pdfBase64, filename, textContent } = req.body;
    if (pdfBase64) {
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      const extractedText = await textExtractionService.extractFromPDF(pdfBuffer);
      if (topic.material) {
        await Material.findByIdAndUpdate(topic.material, {
          content: extractedText,
          originalFilename: filename || 'document.pdf',
          fileSize: pdfBuffer.length,
          type: 'pdf',
          isProcessed: true
        });
      } else {
        const material = await Material.create({
          title: topic.title,
          subject: course.subject,
          topic: topic.title,
          type: 'pdf',
          content: extractedText,
          originalFilename: filename || 'document.pdf',
          fileSize: pdfBuffer.length,
          uploadedBy: req.user._id,
          isProcessed: true
        });
        topic.material = material._id;
      }
    } else if (textContent) {
      if (topic.material) {
        await Material.findByIdAndUpdate(topic.material, {
          content: textContent,
          type: 'text',
          isProcessed: true
        });
      } else {
        const material = await Material.create({
          title: topic.title,
          subject: course.subject,
          topic: topic.title,
          type: 'text',
          content: textContent,
          uploadedBy: req.user._id,
          isProcessed: true
        });
        topic.material = material._id;
      }
    }

    await topic.save();
    res.json({ message: 'Topic updated', topic });
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ message: 'Error updating topic' });
  }
};

// @desc    Delete a topic
// @route   DELETE /api/courses/:courseId/topics/:topicId
// @access  Private (Teacher/Admin)
exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const course = await Course.findById(topic.course);
    if (course.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await StudentProgress.deleteMany({ topic: topic._id });
    await Topic.findByIdAndDelete(req.params.topicId);

    res.json({ message: 'Topic deleted' });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({ message: 'Error deleting topic' });
  }
};

// @desc    Get topics for a course
// @route   GET /api/courses/:id/topics
// @access  Private
exports.getTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ course: req.params.id })
      .populate('prerequisites', 'title')
      .populate('material', 'title type originalFilename fileSize')
      .sort({ order: 1 });

    res.json({ topics });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ message: 'Error fetching topics' });
  }
};

// @desc    Get topic content (the linked material text)
// @route   GET /api/courses/:courseId/topics/:topicId/content
// @access  Private (enrolled student or teacher/admin)
exports.getTopicContent = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId)
      .populate('material', 'title type content originalFilename fileSize description');

    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    // Verify access: student must be enrolled, or teacher/admin
    if (req.user.role === 'student') {
      const course = await Course.findById(topic.course);
      if (!course || !course.enrolledStudents.map(id => id.toString()).includes(req.user._id.toString())) {
        return res.status(403).json({ message: 'Not enrolled in this course' });
      }
    }

    if (!topic.material) {
      return res.json({
        topic: { _id: topic._id, title: topic.title, description: topic.description },
        content: null,
        message: 'No material uploaded for this topic yet'
      });
    }

    const wordCount = topic.material.content ? topic.material.content.split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    res.json({
      topic: { _id: topic._id, title: topic.title, description: topic.description, pointsReward: topic.pointsReward },
      material: {
        _id: topic.material._id,
        title: topic.material.title,
        type: topic.material.type,
        content: topic.material.content,
        originalFilename: topic.material.originalFilename,
        fileSize: topic.material.fileSize,
        description: topic.material.description
      },
      wordCount,
      readingTime
    });
  } catch (error) {
    console.error('Get topic content error:', error);
    res.status(500).json({ message: 'Error fetching topic content' });
  }
};
