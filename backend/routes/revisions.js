const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyRevisions,
  getRevisionById,
  createRevision,
  completeRevision,
  skipRevision,
  deleteRevision,
  getRevisionStats,
  getStudentRevisions
} = require('../controllers/revisionController');

// All routes require authentication
router.use(protect);

// Student routes
router.get('/', authorize('student'), getMyRevisions);
router.get('/stats', authorize('student'), getRevisionStats);
router.get('/:id', getRevisionById);
router.put('/:id/complete', authorize('student'), completeRevision);
router.put('/:id/skip', authorize('student'), skipRevision);

// Teacher/Admin routes
router.post('/', authorize('teacher', 'admin'), createRevision);
router.delete('/:id', authorize('teacher', 'admin'), deleteRevision);
router.get('/student/:studentId', authorize('teacher', 'admin'), getStudentRevisions);

module.exports = router;
