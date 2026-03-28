const mongoose = require('mongoose');

const dmConversationSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DirectMessage'
    },
    lastMessageTime: Date,
    messageCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for fast lookup of conversations between two users
dmConversationSchema.index({ course: 1, participants: 1 });

module.exports = mongoose.model('DMConversation', dmConversationSchema);
