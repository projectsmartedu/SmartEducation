/**
 * Doubt Resolution Service
 * Handles AI-powered doubt resolution using RAG
 * Modular component for answer generation
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Doubt = require('../models/Doubt');
const embeddingService = require('./embeddingService');
const semanticSearchService = require('./semanticSearchService');

class DoubtResolutionService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // gemini-2.0-flash is the model available with this API key
    this.models = ['gemini-2.0-flash'];
  }

  /**
   * Resolve a student's doubt using RAG
   * @param {string} doubtId - Doubt document ID
   * @returns {Promise<Object>} - Updated doubt with answer
   */
  async resolveDoubt(doubtId) {
    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      throw new Error('Doubt not found');
    }

    try {
      // Update status to processing
      doubt.status = 'processing';
      await doubt.save();

      // Try to generate embedding for the question (optional)
      try {
        const questionEmbedding = await embeddingService.generateEmbedding(doubt.question);
        doubt.questionEmbedding = questionEmbedding;
        await doubt.save();
      } catch (e) {
        console.warn('Question embedding unavailable; proceeding without it:', e.message);
        // Proceed without storing an embedding; semantic search has its own fallback
      }

      // Search for relevant materials (use subject/topic hints)
      const relevantChunks = await semanticSearchService.search(doubt.question, {
        subject: doubt.subject,
        topic: doubt.topic,
        topK: 5,
        minSimilarity: 0.25
      });

      // Store relevant materials reference
      doubt.relevantMaterials = relevantChunks.map(chunk => ({
        materialId: chunk.materialId,
        chunkIndex: chunk.chunkIndex,
        similarity: chunk.similarity,
        content: chunk.content.substring(0, 500) // Store preview
      }));

      // Generate answer using LLM with context
      let context = semanticSearchService.formatContext(relevantChunks);
      // If the doubt included topicContent (topic's material), include it to improve relevance
      if (doubt.topicContent) {
        context = `${context}\n\nTOPIC MATERIAL:\n${doubt.topicContent.substring(0, 5000)}`;
      }
      const answer = await this.generateAnswer(doubt.question, context);

      doubt.answer = answer;
      doubt.status = 'answered';
      await doubt.save();

      return doubt;
    } catch (error) {
      console.error('Error resolving doubt:', error);
      doubt.status = 'failed';
      doubt.error = error.message;
      await doubt.save();
      throw error;
    }
  }

  /**
   * Generate answer using LLM with context (with model fallback)
   * @param {string} question - Student's question
   * @param {string} context - Retrieved course material context
   * @returns {Promise<string>} - Generated answer
   */
  async generateAnswer(question, context) {
    // Mock mode for testing when API quota is exhausted
    if (process.env.MOCK_AI_RESPONSES === 'true') {
      console.log('MOCK MODE: Returning simulated answer');
      const mockAnswers = {
        'photosynthesis': 'Photosynthesis is the process by which plants convert light energy from the sun into chemical energy stored in glucose. This occurs in the chloroplasts using chlorophyll, water, and carbon dioxide, producing oxygen as a byproduct. The process has two main stages: the light-dependent reactions (which occur in the thylakoids) and the light-independent reactions or Calvin cycle (which occur in the stroma).',
        'mitochondria': 'Mitochondria are membrane-bound organelles found in eukaryotic cells that serve as the powerhouse of the cell. They generate ATP (adenosine triphosphate) through cellular respiration, primarily through the electron transport chain. The mitochondria has an outer membrane, inner membrane, and matrix. They contain their own DNA and ribosomes, suggesting they originated from ancient bacteria through endosymbiotism.',
        'gravity': 'Gravity is a fundamental force of nature that attracts objects with mass toward each other. Newton\'s law of universal gravitation states that the gravitational force between two objects is proportional to the product of their masses and inversely proportional to the square of the distance between them (F = G × m₁ × m₂ / r²). Einstein\'s general relativity describes gravity as the curvature of spacetime caused by mass and energy.',
        'dna': 'DNA (deoxyribonucleic acid) is the molecule that carries genetic instructions for life. It consists of two complementary strands twisted in a double helix, made up of nucleotides containing deoxyribose sugar, a phosphate group, and a nitrogenous base (adenine, thymine, guanine, or cytosine). DNA replicates during cell division and is transcribed into RNA to produce proteins.',
      };
      
      // Try to find a matching mock answer based on keywords
      const lowerQuestion = question.toLowerCase();
      for (const [key, answer] of Object.entries(mockAnswers)) {
        if (lowerQuestion.includes(key)) {
          return answer;
        }
      }
      
      // Default mock answer
      return `Based on your course materials:\n\n${context ? context.substring(0, 500) : 'Your question is interesting and important for understanding this topic.'} \n\nKey points to consider:\n• Review the core concepts related to your question\n• Connect this to real-world applications\n• Practice problems to reinforce understanding\n\nFor a detailed answer, please ask your instructor or review the textbook section on this topic.`;
    }

    const systemPrompt = `You are an expert educational assistant for students. Your role is to answer academic questions clearly and helpfully.

INSTRUCTIONS:
1. Use the provided course material context to answer the question accurately
2. If the context is relevant, base your answer primarily on it
3. If the context is not sufficient, use your general knowledge but indicate this
4. Explain concepts in a clear, student-friendly manner
5. Use examples when helpful
6. Structure your answer with proper formatting (use bullet points, numbered lists when appropriate)
7. Be concise but thorough
8. If you're unsure about something, say so honestly

CONTEXT FROM COURSE MATERIALS:
${context}

STUDENT'S QUESTION:
${question}

Please provide a helpful, accurate, and educational answer:`;

    // Try multiple models with fallback
    let quotaExceeded = false;
    for (const modelName of this.models) {
      try {
        console.log(`Trying model: ${modelName} for doubt resolution...`);
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(systemPrompt);
        console.log(`Doubt resolution success with ${modelName}`);
        return result.response.text();
      } catch (error) {
        // Inspect common error cases to provide clearer diagnostics
        console.warn(`Model ${modelName} failed:`, error && (error.message || error));
        const msg = (error && (error.message || '')).toString().toLowerCase();
        
        if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('429')) {
          // Mark that quota was exceeded but don't throw - provide fallback instead
          quotaExceeded = true;
          console.warn('API quota exceeded - using fallback response');
          continue;
        }
        
        if (msg.includes('unauthorized') || (msg.includes('invalid') && msg.includes('key')) || msg.includes('401') || msg.includes('leaked')) {
          const err = new Error('AI service authentication failed: invalid or misconfigured API key');
          err.status = 401;
          throw err;
        }
        // Non-fatal: try next model
        continue;
      }
    }
    
    // All models failed — provide a graceful fallback answer
    const fallback = [
      quotaExceeded 
        ? 'AI service is temporarily rate-limited. Here\'s context from your course materials:'
        : 'AI service is temporarily unavailable. Here\'s relevant context from your course materials:',
      '',
      '• Context from materials:',
      context ? context.split('\n').slice(0, 10).join('\n') : 'No relevant context available.',
      '',
      '• Guidance:',
      '- Review the highlighted sections above for direct explanations.',
      '- If the context seems unrelated, try refining the subject/topic.',
      '- Ask a more specific follow-up (e.g., define the term, show a formula, or step-by-step derivation).',
      '',
      'Once the AI service is restored, you\'ll receive a full explanation.'
    ].join('\n');
    return fallback;
  }

  /**
   * Create and resolve a doubt in one operation
   * @param {Object} doubtData - Doubt data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Resolved doubt
   */
  async createAndResolve(doubtData, userId) {
    const doubt = new Doubt({
      question: doubtData.question,
      subject: doubtData.subject,
      topic: doubtData.topic,
      // store a preview of the provided topic material if present
      topicContent: doubtData.topicContent ? (typeof doubtData.topicContent === 'string' ? doubtData.topicContent.substring(0, 5000) : '') : undefined,
      askedBy: userId,
      status: 'pending'
    });

    await doubt.save();
    return this.resolveDoubt(doubt._id);
  }

  /**
   * Get doubt history for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object[]>} - List of doubts
   */
  async getUserDoubts(userId, options = {}) {
    const { page = 1, limit = 10, subject = null, topic = null } = options;

    const query = { askedBy: userId };
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;

    const doubts = await Doubt.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('relevantMaterials.materialId', 'title subject topic')
      .lean();

    const total = await Doubt.countDocuments(query);

    return {
      doubts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new DoubtResolutionService();
