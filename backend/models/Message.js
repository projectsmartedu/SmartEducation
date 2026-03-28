const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        maxlength: 2000
    },
    attachment: {
        type: String, // URL or file path
        optional: true
    },
    attachmentType: {
        type: String,
        enum: ['image', 'pdf', 'document', 'video', 'audio'],
        optional: true
    },
    reactions: [{
        emoji: String,
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    }],
    repliesCount: {
        type: Number,
        default: 0
    },
    edited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    deleted: {
        type: Boolean,
        default: false
    },
    isPinned: {
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

// Index for efficient querying
messageSchema.index({ channel: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model('Message', messageSchema);
