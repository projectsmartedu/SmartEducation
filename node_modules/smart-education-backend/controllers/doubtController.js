/**
 * Doubt Controller
 * Handles doubt submission and retrieval
 */

const Doubt = require('../models/Doubt');
const doubtResolutionService = require('../services/doubtResolutionService');
const semanticSearchService = require('../services/semanticSearchService');

// @desc    Submit a new doubt
// @route   POST /api/doubts
// @access  Private (Student)
exports.submitDoubt = async (req, res) => {
  try {
    const { question, subject, topic } = req.body;

    if (!question || question.trim().length < 10) {
      return res.status(400).json({
        message: 'Please provide a valid question (at least 10 characters)'
      });
    }

    // Create and resolve doubt
    const doubt = await doubtResolutionService.createAndResolve(
      { question, subject, topic },
      req.user._id
    );

    res.status(201).json({
      message: 'Doubt resolved successfully',
      doubt: {
        _id: doubt._id,
        question: doubt.question,
        answer: doubt.answer,
        status: doubt.status,
        relevantMaterials: doubt.relevantMaterials?.map(m => ({
          materialId: m.materialId,
          similarity: m.similarity
        })),
        createdAt: doubt.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting doubt:', error);
    
    // Check for quota exceeded error
    if (error.message?.includes('quota') || error.status === 429) {
      return res.status(429).json({ 
        message: 'AI service is temporarily unavailable due to high usage. Please try again in a minute.' 
      });
    }
    
    res.status(500).json({ message: 'Error processing your doubt. Please try again.' });
  }
};

// @desc    Get doubt by ID
// @route   GET /api/doubts/:id
// @access  Private
exports.getDoubtById = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('askedBy', 'name email')
      .populate('relevantMaterials.materialId', 'title subject topic');

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check if user owns this doubt or is admin/teacher
    if (
      doubt.askedBy._id.toString() !== req.user._id.toString() &&
      req.user.role === 'student'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this doubt' });
    }

    res.json({ doubt });
  } catch (error) {
    console.error('Error fetching doubt:', error);
    res.status(500).json({ message: 'Error fetching doubt' });
  }
};

// @desc    Get my doubts
// @route   GET /api/doubts/my
// @access  Private
exports.getMyDoubts = async (req, res) => {
  try {
    const { page = 1, limit = 10, subject } = req.query;

    const result = await doubtResolutionService.getUserDoubts(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      subject
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching doubts:', error);
    res.status(500).json({ message: 'Error fetching doubts' });
  }
};

// @desc    Search materials (preview before asking)
// @route   POST /api/doubts/search-materials
// @access  Private (Student)
exports.searchMaterials = async (req, res) => {
  try {
    const { query, subject, topic } = req.body;

    if (!query || query.trim().length < 5) {
      return res.status(400).json({
        message: 'Please provide a valid search query'
      });
    }

    const results = await semanticSearchService.search(query, {
      subject,
      topic,
      topK: 5,
      minSimilarity: 0.3
    });

    res.json({
      results: results.map(r => ({
        materialTitle: r.materialTitle,
        subject: r.subject,
        topic: r.topic,
        preview: r.content.substring(0, 200) + '...',
        similarity: Math.round(r.similarity * 100)
      }))
    });
  } catch (error) {
    console.error('Error searching materials:', error);
    res.status(500).json({ message: 'Error searching materials' });
  }
};

// @desc    Get available subjects for filtering
// @route   GET /api/doubts/subjects
// @access  Private
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await semanticSearchService.getSubjects();
    res.json({ subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Error fetching subjects' });
  }
};

// @desc    Get topics for a subject
// @route   GET /api/doubts/topics/:subject
// @access  Private
exports.getTopics = async (req, res) => {
  try {
    const topics = await semanticSearchService.getTopics(req.params.subject);
    res.json({ topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: 'Error fetching topics' });
  }
};

// @desc    Get doubt statistics
// @route   GET /api/doubts/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const total = await Doubt.countDocuments({ askedBy: userId });
    const answered = await Doubt.countDocuments({ askedBy: userId, status: 'answered' });
    const pending = await Doubt.countDocuments({ askedBy: userId, status: { $in: ['pending', 'processing'] } });

    res.json({
      total,
      answered,
      pending,
      successRate: total > 0 ? Math.round((answered / total) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};
