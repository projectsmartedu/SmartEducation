const Channel = require('../models/Channel');
const Message = require('../models/Message');
const User = require('../models/User');
const notifications = require('../notifications');

// Create a new channel
exports.createChannel = async (req, res) => {
    try {
        const { name, description, classId, channelType } = req.body;
        const userId = req.user._id;

        if (!name || !classId) {
            return res.status(400).json({ error: 'Channel name and class are required' });
        }

        const channel = new Channel({
            name,
            description,
            class: classId,
            channelType: channelType || 'discussion',
            createdBy: userId,
            members: [userId]
        });

        await channel.save();
        await channel.populate('createdBy', 'name email avatar');
        
        // Emit socket event to class members
        notifications.emitChannelCreated(classId, channel);
        
        res.status(201).json(channel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all channels for a class
exports.getChannels = async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.user._id;

        // Get all channels for this class
        const channels = await Channel.find({ 
            class: classId,
            isArchived: false
        })
            .populate('createdBy', 'name email avatar')
            .populate('members', 'name email avatar')
            .populate('lastMessage')
            .sort({ isPinned: -1, lastMessageTime: -1, createdAt: -1 });

        // Auto-add user to channels they're not yet a member of
        for (let channel of channels) {
            if (!channel.members.includes(userId)) {
                channel.members.push(userId);
                await channel.save();
            }
        }

        res.json(channels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single channel with messages
exports.getChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const channel = await Channel.findById(channelId)
            .populate('createdBy', 'name email avatar')
            .populate('members', 'name email avatar');

        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        // Get paginated messages
        const messages = await Message.find({ 
            channel: channelId,
            deleted: false 
        })
            .populate('sender', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Message.countDocuments({ 
            channel: channelId,
            deleted: false 
        });

        res.json({
            channel,
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

// Add message to channel
exports.addMessage = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { content, attachment, attachmentType } = req.body;
        const userId = req.user._id;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Message content cannot be empty' });
        }

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        // Check if user is member
        if (!channel.members.includes(userId)) {
            return res.status(403).json({ error: 'You are not a member of this channel' });
        }

        const message = new Message({
            channel: channelId,
            sender: userId,
            content,
            attachment,
            attachmentType
        });

        await message.save();
        await message.populate('sender', 'name email avatar');

        // Update channel metadata
        channel.messageCount += 1;
        channel.lastMessage = message._id;
        channel.lastMessageTime = new Date();
        await channel.save();

        // Emit socket event - real-time message delivery
        notifications.emitNewMessage(channelId, message);

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Edit message
exports.editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'You can only edit your own messages' });
        }

        message.content = content;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        await message.populate('sender', 'name email avatar');
        
        // Emit socket event - real-time edit
        notifications.emitMessageEdited(message.channel, messageId, content);
        
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete message (soft delete)
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'You can only delete your own messages' });
        }

        message.deleted = true;
        await message.save();

        // Emit socket event - real-time delete
        notifications.emitMessageDeleted(message.channel, messageId);

        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add reaction to message
exports.addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        let reaction = message.reactions.find(r => r.emoji === emoji);
        if (!reaction) {
            reaction = { emoji, users: [] };
            message.reactions.push(reaction);
        }

        if (!reaction.users.includes(userId)) {
            reaction.users.push(userId);
        }

        await message.save();
        await message.populate('sender', 'name email avatar');
        
        // Emit socket event - real-time reaction
        notifications.emitReactionAdded(message.channel, messageId, emoji, userId);
        
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add members to channel
exports.addMembers = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { memberIds } = req.body;
        const userId = req.user._id;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        // Only creator or admin can add members
        if (channel.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Only channel creator can add members' });
        }

        for (const memberId of memberIds) {
            if (!channel.members.includes(memberId)) {
                channel.members.push(memberId);
            }
        }

        await channel.save();
        await channel.populate('members', 'name email avatar');
        res.json(channel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Remove member from channel
exports.removeMember = async (req, res) => {
    try {
        const { channelId, memberId } = req.params;
        const userId = req.user._id;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        // Member can remove themselves, or creator can remove anyone
        if (memberId !== userId.toString() && channel.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        channel.members = channel.members.filter(m => m.toString() !== memberId);
        await channel.save();
        await channel.populate('members', 'name email avatar');
        res.json(channel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update channel
exports.updateChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { name, description, channelType, isPinned } = req.body;
        const userId = req.user._id;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        if (channel.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Only channel creator can update channel' });
        }

        if (name) channel.name = name;
        if (description !== undefined) channel.description = description;
        if (channelType) channel.channelType = channelType;
        if (isPinned !== undefined) channel.isPinned = isPinned;
        channel.updatedAt = new Date();

        await channel.save();
        res.json(channel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete channel (soft delete - archive)
exports.deleteChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user._id;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        if (channel.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Only channel creator can delete channel' });
        }

        channel.isArchived = true;
        await channel.save();
        res.json({ message: 'Channel archived' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Pin message in channel
exports.pinMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const channel = await Channel.findById(message.channel);
        if (channel.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Only channel creator can pin messages' });
        }

        message.isPinned = !message.isPinned;
        await message.save();
        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
