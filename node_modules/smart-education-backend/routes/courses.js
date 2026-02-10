const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getMyCourses,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopics,
  getTopicContent
} = require('../controllers/courseController');

// All routes require authentication
router.use(protect);

// Course routes
router.get('/my', getMyCourses);
router.get('/', getCourses);
router.post('/', authorize('teacher', 'admin'), createCourse);
router.get('/:id', getCourseById);
router.put('/:id', authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', authorize('teacher', 'admin'), deleteCourse);

// Enrollment
router.post('/:id/enroll', authorize('student'), enrollStudent);
router.post('/:id/unenroll', authorize('student'), unenrollStudent);

// Topic routes (nested under courses)
router.get('/:id/topics', getTopics);
router.post('/:id/topics', authorize('teacher', 'admin'), createTopic);
router.get('/:courseId/topics/:topicId/content', getTopicContent);
router.put('/:courseId/topics/:topicId', authorize('teacher', 'admin'), updateTopic);
router.delete('/:courseId/topics/:topicId', authorize('teacher', 'admin'), deleteTopic);

module.exports = router;
