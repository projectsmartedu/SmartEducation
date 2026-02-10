const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  questionEmbedding: {
    type: [Number]
  },
  answer: {
    type: String
  },
  relevantMaterials: [{
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    chunkIndex: Number,
    similarity: Number,
    content: String
  }],
  subject: {
    type: String,
    trim: true
  },
  topic: {
    type: String,
    trim: true
  },
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'answered', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
doubtSchema.index({ askedBy: 1, createdAt: -1 });
doubtSchema.index({ subject: 1, topic: 1 });

module.exports = mongoose.model('Doubt', doubtSchema);
