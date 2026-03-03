const mongoose = require('mongoose');

const topicQuizQuestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  answerIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    default: ''
  }
}, { _id: false });

const topicQuizSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    default: 'moderate',
    trim: true,
    lowercase: true
  },
  questionCount: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  questions: {
    type: [topicQuizQuestionSchema],
    required: true
  },
  modelUsed: {
    type: String,
    default: ''
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

topicQuizSchema.index({ topic: 1, difficulty: 1, questionCount: 1, createdAt: -1 });

module.exports = mongoose.model('TopicQuiz', topicQuizSchema);
