const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

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
router.put('/:channelId/messages/:messageId', channelController.editMessage);
router.delete('/:channelId/messages/:messageId', channelController.deleteMessage);
router.post('/:channelId/messages/:messageId/reactions', channelController.addReaction);
router.post('/:channelId/messages/:messageId/pin', channelController.pinMessage);

module.exports = router;
