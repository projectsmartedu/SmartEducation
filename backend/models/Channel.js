const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Channel name is required'],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    channelType: {
        type: String,
        enum: ['general', 'announcement', 'discussion', 'assignment'],
        default: 'discussion'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    messageCount: {
        type: Number,
        default: 0
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastMessageTime: {
        type: Date
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for fast queries
channelSchema.index({ class: 1, createdAt: -1 });
channelSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Channel', channelSchema);
