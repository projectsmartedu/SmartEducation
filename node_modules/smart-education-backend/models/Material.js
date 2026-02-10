const mongoose = require('mongoose');

const materialChunkSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  chunkIndex: {
    type: Number,
    required: true
  }
});

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['pdf', 'text', 'notes'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String
  },
  fileSize: {
    type: Number
  },
  chunks: [materialChunkSchema],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  processingError: {
    type: String
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

// Update timestamp on save
materialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient searching
materialSchema.index({ subject: 1, topic: 1 });
materialSchema.index({ uploadedBy: 1 });
materialSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Material', materialSchema);
