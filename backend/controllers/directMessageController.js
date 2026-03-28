const DMConversation = require('../models/DMConversation');
const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');
const notifications = require('../notifications');

// Get or create DM conversation with a user
exports.getOrCreateConversation = async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        const currentUserId = req.user._id;

        if (!userId || !courseId) {
            return res.status(400).json({ error: 'User ID and Course ID required' });
        }

        // Check if conversation already exists
        let conversation = await DMConversation.findOne({
            course: courseId,
            participants: { $all: [currentUserId, userId] }
        }).populate('participants', 'name email avatar');

        if (!conversation) {
            // Create new conversation
            conversation = new DMConversation({
                course: courseId,
                participants: [currentUserId, userId]
            });
            await conversation.save();
            await conversation.populate('participants', 'name email avatar');
        }

        res.json(conversation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all DM conversations for a course
exports.getConversations = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const conversations = await DMConversation.find({
            course: courseId,
            participants: userId
        })
            .populate('participants', 'name email avatar')
            .populate('lastMessage')
            .sort({ lastMessageTime: -1, createdAt: -1 });

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get messages in a conversation
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const conversation = await DMConversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const messages = await DirectMessage.find({
            conversation: conversationId,
            deleted: false
        })
            .populate('sender', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await DirectMessage.countDocuments({
            conversation: conversationId,
            deleted: false
        });

        res.json({
            conversation,
            messages: messages.reverse(),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Send a DM
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!content?.trim()) {
            return res.status(400).json({ error: 'Message content required' });
        }

        const conversation = await DMConversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Verify user is part of conversation
        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ error: 'Not part of this conversation' });
        }

        const message = new DirectMessage({
            conversation: conversationId,
            sender: userId,
            content
        });

        await message.save();
        await message.populate('sender', 'name email avatar');

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.lastMessageTime = new Date();
        conversation.messageCount = (conversation.messageCount || 0) + 1;
        await conversation.save();

        // Emit socket event
        notifications.emitDirectMessage(conversationId, message);

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Edit DM
exports.editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!content?.trim()) {
            return res.status(400).json({ error: 'Message content required' });
        }

        const message = await DirectMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Can only edit your own messages' });
        }

        message.content = content;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        // Emit socket event
        notifications.emitDirectMessageEdited(message.conversation, messageId, content);

        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete DM
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await DirectMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Can only delete your own messages' });
        }

        message.deleted = true;
        await message.save();

        // Emit socket event
        notifications.emitDirectMessageDeleted(message.conversation, messageId);

        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add reaction to DM
exports.addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        if (!emoji) {
            return res.status(400).json({ error: 'Emoji required' });
        }

        const message = await DirectMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        let reaction = message.reactions?.find(r => r.emoji === emoji);
        if (!reaction) {
            reaction = { emoji, users: [] };
            message.reactions.push(reaction);
        }

        if (!reaction.users.includes(userId)) {
            reaction.users.push(userId);
            await message.save();
        }

        // Emit socket event
        notifications.emitDirectMessageReaction(message.conversation, messageId, emoji, userId);

        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
