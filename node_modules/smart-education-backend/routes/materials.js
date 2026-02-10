const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  uploadMaterial,
  uploadPDF,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  getSubjects,
  getTopics,
  getMyMaterials,
  getProcessingStatus
} = require('../controllers/materialController');

// Protected routes - all require authentication
router.use(protect);

// Get subjects and topics (available to all authenticated users)
router.get('/subjects', getSubjects);
router.get('/topics/:subject', getTopics);

// Teacher/Admin only routes - place specific routes before parameterized routes
router.post('/', authorize('teacher', 'admin'), uploadMaterial);
router.post('/pdf', authorize('teacher', 'admin'), uploadPDF);
router.get('/user/my', authorize('teacher', 'admin'), getMyMaterials);

// Get all materials (students can browse)
router.get('/', getMaterials);

// Parameterized routes must come after specific routes
router.get('/:id', getMaterialById);
router.get('/:id/status', getProcessingStatus);
router.put('/:id', authorize('teacher', 'admin'), updateMaterial);
router.delete('/:id', authorize('teacher', 'admin'), deleteMaterial);

module.exports = router;
