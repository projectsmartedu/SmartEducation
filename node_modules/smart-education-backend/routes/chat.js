const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, clearChatHistory } = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and student role
router.use(protect);
router.use(authorize('student'));

router.post('/message', sendMessage);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

module.exports = router;
