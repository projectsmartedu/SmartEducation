const mongoose = require('mongoose');

const mlModelSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  algorithm: {
    type: String,
    required: true
  },
  featureNames: {
    type: [String],
    default: []
  },
  payload: {
    type: Object,
    required: true
  },
  metrics: {
    type: Object,
    default: {}
  },
  sampleCount: {
    type: Number,
    default: 0
  },
  trainedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('MLModel', mlModelSchema);
