const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DMConversation',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    edited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    deleted: {
      type: Boolean,
      default: false
    },
    reactions: [
      {
        emoji: String,
        users: [mongoose.Schema.Types.ObjectId]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('DirectMessage', directMessageSchema);
