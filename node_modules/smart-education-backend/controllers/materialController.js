/**
 * Material Controller
 * Handles course material CRUD and processing
 */

const Material = require('../models/Material');
const textExtractionService = require('../services/textExtractionService');
const embeddingService = require('../services/embeddingService');

// @desc    Upload new course material
// @route   POST /api/materials
// @access  Private (Teacher/Admin)
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, subject, topic, description, type, content } = req.body;

    // Validate required fields
    if (!title || !subject || !topic || !type || !content) {
      return res.status(400).json({
        message: 'Please provide all required fields: title, subject, topic, type, content'
      });
    }

    // Create material document
    const material = new Material({
      title,
      subject,
      topic,
      description,
      type,
      content,
      uploadedBy: req.user._id,
      isProcessed: false
    });

    await material.save();

    // Process material asynchronously
    processAndEmbedMaterial(material._id);

    res.status(201).json({
      message: 'Material uploaded successfully. Processing in background.',
      material: {
        _id: material._id,
        title: material.title,
        subject: material.subject,
        topic: material.topic,
        isProcessed: material.isProcessed
      }
    });
  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({ message: 'Error uploading material' });
  }
};

// @desc    Upload PDF material
// @route   POST /api/materials/pdf
// @access  Private (Teacher/Admin)
exports.uploadPDF = async (req, res) => {
  try {
    const { title, subject, topic, description, pdfBase64, filename } = req.body;

    if (!title || !subject || !topic || !pdfBase64) {
      return res.status(400).json({
        message: 'Please provide all required fields'
      });
    }

    // Decode base64 PDF
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // Extract text from PDF
    const extractedText = await textExtractionService.extractFromPDF(pdfBuffer);

    if (!extractedText || extractedText.length < 50) {
      return res.status(400).json({
        message: 'Could not extract sufficient text from PDF'
      });
    }

    // Create material document
    const material = new Material({
      title,
      subject,
      topic,
      description,
      type: 'pdf',
      content: extractedText,
      originalFilename: filename,
      fileSize: pdfBuffer.length,
      uploadedBy: req.user._id,
      isProcessed: false
    });

    await material.save();

    // Process material asynchronously
    processAndEmbedMaterial(material._id);

    res.status(201).json({
      message: 'PDF uploaded successfully. Processing in background.',
      material: {
        _id: material._id,
        title: material.title,
        subject: material.subject,
        topic: material.topic,
        isProcessed: material.isProcessed,
        wordCount: textExtractionService.getWordCount(extractedText),
        readingTime: textExtractionService.getReadingTime(extractedText)
      }
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ message: 'Error uploading PDF: ' + error.message });
  }
};

// @desc    Get all materials (with filters)
// @route   GET /api/materials
// @access  Private
exports.getMaterials = async (req, res) => {
  try {
    const { subject, topic, page = 1, limit = 10, uploadedBy } = req.query;

    const query = {};
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (uploadedBy) query.uploadedBy = uploadedBy;

    const materials = await Material.find(query)
      .select('-chunks -content')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Material.countDocuments(query);

    res.json({
      materials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ message: 'Error fetching materials' });
  }
};

// @desc    Get material by ID
// @route   GET /api/materials/:id
// @access  Private
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .select('-chunks')
      .populate('uploadedBy', 'name email');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json({
      material,
      wordCount: textExtractionService.getWordCount(material.content),
      readingTime: textExtractionService.getReadingTime(material.content)
    });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ message: 'Error fetching material' });
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private (Teacher/Admin - owner only)
exports.updateMaterial = async (req, res) => {
  try {
    const { title, subject, topic, description } = req.body;
    
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check ownership (unless admin)
    if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this material' });
    }

    material.title = title || material.title;
    material.subject = subject || material.subject;
    material.topic = topic || material.topic;
    material.description = description !== undefined ? description : material.description;

    await material.save();

    res.json({
      message: 'Material updated successfully',
      material: {
        _id: material._id,
        title: material.title,
        subject: material.subject,
        topic: material.topic,
        description: material.description
      }
    });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ message: 'Error updating material' });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private (Teacher/Admin - owner only)
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check ownership (unless admin)
    if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this material' });
    }

    await Material.findByIdAndDelete(req.params.id);

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ message: 'Error deleting material' });
  }
};

// @desc    Get unique subjects
// @route   GET /api/materials/subjects
// @access  Private
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Material.distinct('subject');
    res.json({ subjects: subjects.sort() });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Error fetching subjects' });
  }
};

// @desc    Get topics for a subject
// @route   GET /api/materials/topics/:subject
// @access  Private
exports.getTopics = async (req, res) => {
  try {
    const topics = await Material.distinct('topic', { subject: req.params.subject });
    res.json({ topics: topics.sort() });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: 'Error fetching topics' });
  }
};

// @desc    Get my uploaded materials
// @route   GET /api/materials/my
// @access  Private (Teacher/Admin)
exports.getMyMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const materials = await Material.find({ uploadedBy: req.user._id })
      .select('-chunks -content')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Material.countDocuments({ uploadedBy: req.user._id });

    res.json({
      materials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching my materials:', error);
    res.status(500).json({ message: 'Error fetching materials' });
  }
};

// @desc    Get processing status
// @route   GET /api/materials/:id/status
// @access  Private
exports.getProcessingStatus = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .select('isProcessed processingError title');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json({
      isProcessed: material.isProcessed,
      processingError: material.processingError,
      title: material.title
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ message: 'Error fetching status' });
  }
};

/**
 * Process material: chunk text and generate embeddings
 * Runs asynchronously in background
 */
async function processAndEmbedMaterial(materialId) {
  try {
    const material = await Material.findById(materialId);
    if (!material) return;

    console.log(`Processing material: ${material.title}`);

    // Chunk the content
    const chunks = textExtractionService.chunkText(material.content, 800, 150);
    
    if (chunks.length === 0) {
      material.processingError = 'No content to process';
      material.isProcessed = false;
      await material.save();
      return;
    }

    console.log(`Created ${chunks.length} chunks for material: ${material.title}`);

    // Generate embeddings for each chunk
    const materialChunks = [];
    
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await embeddingService.generateEmbedding(chunks[i]);
        
        materialChunks.push({
          content: chunks[i],
          embedding: embedding,
          chunkIndex: i
        });

        console.log(`Embedded chunk ${i + 1}/${chunks.length}`);
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error embedding chunk ${i}:`, error);
      }
    }

    material.chunks = materialChunks;
    material.isProcessed = materialChunks.length > 0;
    material.processingError = materialChunks.length === 0 ? 'Failed to generate embeddings' : null;
    
    await material.save();
    console.log(`Completed processing material: ${material.title}`);
  } catch (error) {
    console.error('Error processing material:', error);
    
    try {
      await Material.findByIdAndUpdate(materialId, {
        processingError: error.message,
        isProcessed: false
      });
    } catch (updateError) {
      console.error('Error updating material status:', updateError);
    }
  }
}
