const doubtResolutionService = require('../services/doubtResolutionService');

// Development-only endpoint to test LLM/doubt resolution without auth or DB writes.
exports.testDoubt = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_TEST_ROUTE !== 'true') {
      return res.status(403).json({ message: 'Debug route disabled in production' });
    }

    const { question, topicContent = '' } = req.body;
    if (!question || question.trim().length < 5) {
      return res.status(400).json({ message: 'Provide a test question (min 5 chars).' });
    }

    // Use semantic search to build context if available
    let context = topicContent || '';

    // Call generateAnswer directly to avoid DB side-effects
    const answer = await doubtResolutionService.generateAnswer(question, context);
    res.json({ question, answer });
  } catch (err) {
    console.error('Debug test error:', err && (err.message || err));
    if (err && err.status === 429) return res.status(429).json({ message: 'Quota/Rate limit from LLM' });
    if (err && err.status === 401) return res.status(401).json({ message: 'LLM auth failed' });
    res.status(500).json({ message: 'Error running debug LLM test', error: err.message || String(err) });
  }
};
