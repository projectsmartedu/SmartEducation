const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const directMessageController = require('../controllers/directMessageController');

// All routes require authentication
router.use(auth);

// Get or create DM conversation
router.post('/conversations', directMessageController.getOrCreateConversation);

// Get all conversations for a course
router.get('/conversations/:courseId', directMessageController.getConversations);

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', directMessageController.getMessages);

// Send DM
router.post('/conversations/:conversationId/messages', directMessageController.sendMessage);

// Edit DM
router.put('/messages/:messageId', directMessageController.editMessage);

// Delete DM
router.delete('/messages/:messageId', directMessageController.deleteMessage);

// Add reaction to DM
router.post('/messages/:messageId/reactions', directMessageController.addReaction);

module.exports = router;
