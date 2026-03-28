const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Channel management
router.post('/', channelController.createChannel);
router.get('/class/:classId', channelController.getChannels);
router.get('/:channelId', channelController.getChannel);
router.patch('/:channelId', channelController.updateChannel);
router.delete('/:channelId', channelController.deleteChannel);

// Member management
router.post('/:channelId/members', channelController.addMembers);
router.delete('/:channelId/members/:memberId', channelController.removeMember);

// Message operations
router.post('/:channelId/messages', channelController.addMessage);
router.patch('/messages/:messageId', channelController.editMessage);
router.delete('/messages/:messageId', channelController.deleteMessage);
router.post('/messages/:messageId/reactions', channelController.addReaction);
router.post('/messages/:messageId/pin', channelController.pinMessage);

module.exports = router;
