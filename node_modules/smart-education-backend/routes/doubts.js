const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitDoubt,
  getDoubtById,
  getMyDoubts,
  searchMaterials,
  getSubjects,
  getTopics,
  getStats
} = require('../controllers/doubtController');

// Protected routes - all require authentication
router.use(protect);

// Student routes
router.post('/', authorize('student'), submitDoubt);
router.get('/my', getMyDoubts);
router.get('/stats', getStats);
router.post('/search-materials', searchMaterials);
router.get('/subjects', getSubjects);
router.get('/topics/:subject', getTopics);
router.get('/:id', getDoubtById);

module.exports = router;
