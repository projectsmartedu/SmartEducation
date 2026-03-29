/**
 * Doubt Resolution Service
 * Handles AI-powered doubt resolution using RAG with Groq (FREE API)
 * Modular component for answer generation
 */

const https = require('https');
const Doubt = require('../models/Doubt');
const embeddingService = require('./embeddingService');
const semanticSearchService = require('./semanticSearchService');

class DoubtResolutionService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
  }

  /**
   * Call Groq API for answer generation
   */
  async callGroqAPI(messages) {
    const models = ['llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma-2-9b-it'];
    let lastError = null;

    for (const model of models) {
      try {
        return await new Promise((resolve, reject) => {
          const url = 'https://api.groq.com/openai/v1/chat/completions';
          const postData = JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1024
          });

          const urlObj = new URL(url);
          const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
              'Authorization': `Bearer ${this.apiKey}`
            }
          };

          const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
              try {
                const parsed = JSON.parse(responseData);
                if (res.statusCode >= 200 && res.statusCode < 300) {
                  const reply = parsed.choices?.[0]?.message?.content;
                  if (reply) {
                    console.log(`Groq model ${model} success`);
                    resolve(reply);
                  } else {
                    reject(new Error('No response'));
                  }
                } else {
                  reject(new Error(`${res.statusCode}: ${parsed.error?.message}`));
                }
              } catch (e) {
                reject(new Error(`Parse: ${responseData}`));
              }
            });
          });

          req.on('error', reject);
          req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Timeout'));
          });
          req.write(postData);
          req.end();
        });
      } catch (err) {
        console.log(`${model} failed: ${err.message}`);
        lastError = err;
      }
    }
    
    throw lastError || new Error('All models failed');
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
   * Generate answer using Groq API with context
   * @param {string} question - Student's question
   * @param {string} context - Retrieved course material context
   * @returns {Promise<string>} - Generated answer
   */
  async generateAnswer(question, context) {
    try {
      if (!this.apiKey) {
        throw new Error('Groq API key not configured');
      }

      const systemPrompt = `You are an expert educational assistant for students. Your role is to answer academic questions clearly and helpfully.

INSTRUCTIONS:
1. Use the provided course material context to answer the question accurately
2. If the context is relevant, base your answer primarily on it
3. If the context is not sufficient, use your general knowledge but indicate this
4. Explain concepts in a clear, student-friendly manner
5. Use examples when helpful
6. Structure your answer with proper formatting
7. Be concise but thorough
8. If you're unsure, say so honestly

CONTEXT FROM COURSE MATERIALS:
${context}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ];

      console.log('Trying Groq API for doubt resolution...');
      const response = await this.callGroqAPI(messages);
      console.log('Doubt resolution success with Groq');
      return response;
    } catch (error) {
      console.error('Groq API failed:', error.message);
      
      // Fallback to mock response
      const mockAnswers = {
        'photosynthesis': 'Photosynthesis is the process by which plants convert light energy from the sun into chemical energy stored in glucose. This occurs in the chloroplasts using chlorophyll, water, and carbon dioxide, producing oxygen as a byproduct.',
        'mitochondria': 'Mitochondria are membrane-bound organelles that serve as the powerhouse of the cell. They generate ATP through cellular respiration. They contain their own DNA and ribosomes.',
        'gravity': 'Gravity is a fundamental force that attracts objects with mass. Newton\'s law: F = G × m₁ × m₂ / r²',
        'dna': 'DNA carries genetic instructions for life. It consists of two complementary strands in a double helix, made up of nucleotides with nitrogenous bases.'
      };
      
      const lowerQuestion = question.toLowerCase();
      for (const [key, answer] of Object.entries(mockAnswers)) {
        if (lowerQuestion.includes(key)) {
          return `**Fallback Answer:** ${answer}`;
        }
      }
      
      // Generic fallback
      return `Based on your course materials:\n\n${context ? context.substring(0, 500) : 'This is an interesting academic question.'}\n\nKey points:\n• Review the core concepts related to your question\n• Connect this to real-world applications\n• Ask your instructor for deeper explanation`;
    }
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
